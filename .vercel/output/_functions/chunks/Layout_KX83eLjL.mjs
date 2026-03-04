import { e as createComponent, r as renderTemplate, g as addAttribute, l as renderSlot, k as renderComponent, n as renderHead, h as createAstro } from './astro/server_CbvSu98a.mjs';
import 'piccolore';
/* empty css                         */
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = storedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: toggleTheme,
      className: "theme-toggle",
      "aria-label": `Switch to ${theme === "light" ? "dark" : "light"} mode`,
      children: [
        theme === "light" ? /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }) }) : /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "5" }),
          /* @__PURE__ */ jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }),
          /* @__PURE__ */ jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }),
          /* @__PURE__ */ jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }),
          /* @__PURE__ */ jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }),
          /* @__PURE__ */ jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }),
          /* @__PURE__ */ jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }),
          /* @__PURE__ */ jsx("line", { x1: "4.22", y1: "18.36", x2: "5.64", y2: "19.78" }),
          /* @__PURE__ */ jsx("line", { x1: "18.36", y1: "4.22", x2: "19.78", y2: "5.64" })
        ] }),
        /* @__PURE__ */ jsx("style", { children: `
        .theme-toggle {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          padding: 0;
          outline: none;
        }
        .theme-toggle:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent-primary);
          transform: scale(1.05);
          box-shadow: var(--shadow);
        }
        .theme-toggle svg {
          stroke: var(--text-primary);
        }
      ` })
      ]
    }
  );
};

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
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="description" content="Auto-generate school timetables with smart scheduling. No conflicts, fair distribution."><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><title>', '</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><script>\n			const getTheme = () => {\n				if (\n					typeof localStorage !== "undefined" &&\n					localStorage.getItem("theme")\n				) {\n					return localStorage.getItem("theme");\n				}\n				if (window.matchMedia("(prefers-color-scheme: dark)").matches) {\n					return "dark";\n				}\n				return "light";\n			};\n			document.documentElement.setAttribute("data-theme", getTheme());\n		<\/script>', '</head> <body> <header class="app-header"> <div class="header-inner"> <a href="/" class="logo"> <span class="logo-icon">\u{1F4C5}</span>\nTimeTable Pro\n</a> <!-- Desktop nav --> <nav class="nav-desktop"> <ul class="nav-links"> <li> <a href="/"', '>View Timetable</a> </li> <li> <a href="/admin"', '>Admin</a> </li> </ul> </nav> <div class="header-actions"> ', ' </div> </div> </header> <main class="main-content"> ', ' </main> <!-- iOS-style bottom tab bar for mobile --> <nav class="mobile-tab-bar" aria-label="Mobile navigation"> <a href="/"', '> <span class="mobile-tab-icon">\u{1F4C5}</span> <span class="mobile-tab-label">Timetable</span> </a> <a href="/admin"', '> <span class="mobile-tab-icon">\u2699\uFE0F</span> <span class="mobile-tab-label">Admin</span> </a> </nav> </body></html>'])), title, renderHead(), addAttribute([{ active: pathname === "/" }], "class:list"), addAttribute([{ active: pathname === "/admin" }], "class:list"), renderComponent($$result, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/components/ThemeToggle", "client:component-export": "default" }), renderSlot($$result, $$slots["default"]), addAttribute(["mobile-tab", { active: pathname === "/" }], "class:list"), addAttribute(["mobile-tab", { active: pathname === "/admin" }], "class:list"));
}, "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
