import { e as createComponent, r as renderTemplate, g as addAttribute, l as renderSlot, k as renderComponent, n as renderHead, h as createAstro } from './astro/server_CbvSu98a.mjs';
import 'piccolore';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "Timetable Generator" } = Astro2.props;
  const pathname = Astro2.url.pathname;
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="description" content="Auto-generate school timetables with smart scheduling. No conflicts, fair distribution."><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><title>', '</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><script>\n			const getTheme = () => {\n				if (\n					typeof localStorage !== "undefined" &&\n					localStorage.getItem("theme")\n				) {\n					return localStorage.getItem("theme");\n				}\n				if (window.matchMedia("(prefers-color-scheme: dark)").matches) {\n					return "dark";\n				}\n				return "light";\n			};\n			document.documentElement.setAttribute("data-theme", getTheme());\n		<\/script>', '</head> <body> <header class="app-header"> <div class="header-inner"> <a href="/" class="logo"> <span class="logo-icon">\u{1F4C5}</span>\nTimeTable Pro\n</a> <!-- Desktop nav --> <nav class="nav-desktop"> <ul class="nav-links"> <li> <a href="/"', '>View Timetable</a> </li> <li> <a href="/admin"', '>Admin</a> </li> </ul> </nav> <div class="header-actions"> ', ' </div> </div> </header> <main class="main-content"> ', ' </main> <!-- iOS-style bottom tab bar for mobile --> <nav class="mobile-tab-bar" aria-label="Mobile navigation"> <a href="/"', '> <span class="mobile-tab-icon">\u{1F4C5}</span> <span class="mobile-tab-label">Timetable</span> </a> <a href="/admin"', '> <span class="mobile-tab-icon">\u2699\uFE0F</span> <span class="mobile-tab-label">Admin</span> </a> </nav> </body></html>'])), title, renderHead(), addAttribute([{ active: pathname === "/" }], "class:list"), addAttribute([{ active: pathname === "/admin" }], "class:list"), renderComponent($$result, "ThemeToggle", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/components/ThemeToggle", "client:component-export": "default" }), renderSlot($$result, $$slots["default"]), addAttribute(["mobile-tab", { active: pathname === "/" }], "class:list"), addAttribute(["mobile-tab", { active: pathname === "/admin" }], "class:list"));
}, "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
