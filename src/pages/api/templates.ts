import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

const ADMIN_KEY = import.meta.env.ADMIN_SECRET_KEY || 'admin';

function isAdmin(request: Request): boolean {
    const auth = request.headers.get('authorization');
    return auth === `Bearer ${ADMIN_KEY}`;
}

export const GET: APIRoute = async () => {
    const { data, error } = await supabase
        .from('time_slot_templates')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
        .from('time_slot_templates')
        .insert({ name: body.name, slots: body.slots || [] })
        .select()
        .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 201 });
};

export const PUT: APIRoute = async ({ request }) => {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
        .from('time_slot_templates')
        .update({ name: body.name, slots: body.slots })
        .eq('id', body.id)
        .select()
        .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 200 });
};

export const DELETE: APIRoute = async ({ request }) => {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const { error } = await supabase.from('time_slot_templates').delete().eq('id', id);

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
};
