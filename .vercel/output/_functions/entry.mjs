import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_B04VMqcg.mjs';
import { manifest } from './manifest_CuLQTVLS.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/classes.astro.mjs');
const _page3 = () => import('./pages/api/generate.astro.mjs');
const _page4 = () => import('./pages/api/teacher-assignments.astro.mjs');
const _page5 = () => import('./pages/api/teachers.astro.mjs');
const _page6 = () => import('./pages/api/templates.astro.mjs');
const _page7 = () => import('./pages/api/timetable.astro.mjs');
const _page8 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin.astro", _page1],
    ["src/pages/api/classes.ts", _page2],
    ["src/pages/api/generate.ts", _page3],
    ["src/pages/api/teacher-assignments.ts", _page4],
    ["src/pages/api/teachers.ts", _page5],
    ["src/pages/api/templates.ts", _page6],
    ["src/pages/api/timetable.ts", _page7],
    ["src/pages/index.astro", _page8]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "8df52cca-a692-4d81-99d5-86a380718879",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
