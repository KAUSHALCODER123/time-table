import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

const ADMIN_KEY = import.meta.env.ADMIN_SECRET_KEY || 'admin';

function isAdmin(request: Request): boolean {
    const auth = request.headers.get('authorization');
    return auth === `Bearer ${ADMIN_KEY}`;
}

export const POST: APIRoute = async ({ request }) => {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
        .from('teacher_slot_assignments')
        .insert({ teacher_id: body.teacher_id, template_id: body.template_id })
        .select()
        .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 201 });
};

export const DELETE: APIRoute = async ({ request }) => {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const url = new URL(request.url);
    const teacherId = url.searchParams.get('teacher_id');
    const templateId = url.searchParams.get('template_id');

    const { error } = await supabase
        .from('teacher_slot_assignments')
        .delete()
        .eq('teacher_id', teacherId)
        .eq('template_id', templateId);

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
};
