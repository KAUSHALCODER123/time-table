import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'admin';

function isAdmin(request: Request): boolean {
    const auth = request.headers.get('authorization');
    return auth === `Bearer ${ADMIN_KEY}`;
}

async function handleGET() {
    const { data, error } = await supabase
        .from('classes')
        .select('*, time_slot_templates(name)')
        .order('created_at', { ascending: true });

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 200 });
};

async function handlePOST({ request }) {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
        .from('classes')
        .insert({ name: body.name, template_id: body.template_id })
        .select()
        .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 201 });
};

async function handlePUT({ request }) {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
        .from('classes')
        .update({ name: body.name, template_id: body.template_id })
        .eq('id', body.id)
        .select()
        .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 200 });
};

async function handleDELETE({ request }) {
    if (!isAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const { error } = await supabase.from('classes').delete().eq('id', id);

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
};


export const runtime = 'edge';
export default async function handler(request) {
    const method = request.method;
    if (method === 'GET') return await handleGET();
    if (method === 'POST') return await handlePOST({ request });
    if (method === 'PUT') return await handlePUT({ request });
    if (method === 'DELETE') return await handleDELETE({ request });
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
}

export async function GET(req) { return handler(req); }
export async function POST(req) { return handler(req); }
export async function PUT(req) { return handler(req); }
export async function DELETE(req) { return handler(req); }
  