import { s as supabase } from '../../chunks/supabase_quVRFhhd.mjs';
export { renderers } from '../../renderers.mjs';

const ADMIN_KEY = "admin";
function isAdmin(request) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${ADMIN_KEY}`;
}
const GET = async () => {
  const { data, error } = await supabase.from("time_slot_templates").select("*").order("created_at", { ascending: true });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
};
const POST = async ({ request }) => {
  if (!isAdmin(request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.from("time_slot_templates").insert({ name: body.name, slots: body.slots || [] }).select().single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 201 });
};
const PUT = async ({ request }) => {
  if (!isAdmin(request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.from("time_slot_templates").update({ name: body.name, slots: body.slots }).eq("id", body.id).select().single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
};
const DELETE = async ({ request }) => {
  if (!isAdmin(request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const { error } = await supabase.from("time_slot_templates").delete().eq("id", id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    DELETE,
    GET,
    POST,
    PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
