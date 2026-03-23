import { createClient } from '@supabase/supabase-js';
const supabase = createClient((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co') || (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'), (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder') || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'));

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'admin';

function isAdmin(request: Request): boolean {
    const auth = request.headers.get('authorization');
    return auth === `Bearer ${ADMIN_KEY}`;
}

async function handlePOST({ request }) {
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

async function handleDELETE({ request }) {
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


export const runtime = 'edge';
export default async function handler(request) {
    const method = request.method;
    if (method === 'POST') return await handlePOST({ request });
    if (method === 'DELETE') return await handleDELETE({ request });
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
}

export async function GET(req) { return handler(req); }
export async function POST(req) { return handler(req); }
export async function PUT(req) { return handler(req); }
export async function DELETE(req) { return handler(req); }
  