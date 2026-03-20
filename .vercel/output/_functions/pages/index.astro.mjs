import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CbvSu98a.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_YrlEIwBB.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Timetable \u2014 View Schedule" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container page-content"> <div class="hero"> <h1>📅 School Timetable</h1> <p>
View the auto-generated weekly schedule for each class. Select
				your class below to see the timetable.
</p> </div> ${renderComponent($$result2, "TimetableView", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/components/TimetableView", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/pages/index.astro", void 0);

const $$file = "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
