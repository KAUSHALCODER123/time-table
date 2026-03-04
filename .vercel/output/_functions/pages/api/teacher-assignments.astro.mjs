import { s as supabase } from '../../chunks/supabase_CtFmt_Aa.mjs';
export { renderers } from '../../renderers.mjs';

const ADMIN_KEY = "admin";
function isAdmin(request) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${ADMIN_KEY}`;
}
const POST = async ({ request }) => {
  if (!isAdmin(request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.from("teacher_slot_assignments").insert({ teacher_id: body.teacher_id, template_id: body.template_id }).select().single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 201 });
};
const DELETE = async ({ request }) => {
  if (!isAdmin(request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const url = new URL(request.url);
  const teacherId = url.searchParams.get("teacher_id");
  const templateId = url.searchParams.get("template_id");
  const { error } = await supabase.from("teacher_slot_assignments").delete().eq("teacher_id", teacherId).eq("template_id", templateId);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    DELETE,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
