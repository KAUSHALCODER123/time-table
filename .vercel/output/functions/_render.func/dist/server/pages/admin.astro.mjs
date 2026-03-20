import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CbvSu98a.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_YrlEIwBB.mjs';
export { renderers } from '../renderers.mjs';

const $$Admin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin \u2014 Timetable Generator" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminApp", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/components/AdminApp", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/pages/admin.astro", void 0);

const $$file = "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Admin,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
