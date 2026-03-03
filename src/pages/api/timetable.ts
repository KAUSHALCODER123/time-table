import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

const ADMIN_KEY = import.meta.env.ADMIN_SECRET_KEY || 'admin';

function isAdmin(request: Request): boolean {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization');
    return auth === `Bearer ${ADMIN_KEY}`;
}

export const GET: APIRoute = async () => {
    const { data, error } = await supabase
        .from('timetables')
        .select('*, classes(name, template_id), teachers(name, subject)')
        .order('day')
        .order('slot_index');

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 200 });
};

export const PATCH: APIRoute = async ({ request }) => {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    try {
        const { id, teacher_id, day, slot_index, class_id } = await request.json();

        // If we have an ID, we update. If not, it might be a new manual assignment.
        if (id) {
            const { data, error } = await supabase
                .from('timetables')
                .update({ teacher_id, day, slot_index, class_id })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return new Response(JSON.stringify(data), { status: 200 });
        } else {
            // New manual assignment (upsert based on class_id, day, slot_index)
            // First check if an entry exists for this slot to "overwrite" it manually
            const { data: existing } = await supabase
                .from('timetables')
                .select('id')
                .eq('class_id', class_id)
                .eq('day', day)
                .eq('slot_index', slot_index)
                .maybeSingle();

            if (existing) {
                const { data, error } = await supabase
                    .from('timetables')
                    .update({ teacher_id })
                    .eq('id', existing.id)
                    .select()
                    .single();
                if (error) throw error;
                return new Response(JSON.stringify(data), { status: 200 });
            } else {
                const { data, error } = await supabase
                    .from('timetables')
                    .insert([{ class_id, day, slot_index, teacher_id }])
                    .select()
                    .single();
                if (error) throw error;
                return new Response(JSON.stringify(data), { status: 201 });
            }
        }
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ request }) => {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const class_id = url.searchParams.get('class_id');
    const day = url.searchParams.get('day');
    const slot_index = url.searchParams.get('slot_index');

    try {
        let query = supabase.from('timetables').delete();

        if (id) {
            query = query.eq('id', id);
        } else if (class_id && day && slot_index) {
            query = query.eq('class_id', class_id).eq('day', day).eq('slot_index', parseInt(slot_index));
        } else {
            return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
        }

        const { error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
