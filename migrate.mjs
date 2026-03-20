import fs from 'fs';
import path from 'path';

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

// 1. Update package.json
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = 'time-table-vite';
pkg.scripts = {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
};
pkg.dependencies = Object.assign({}, pkg.dependencies, {
  "react-router-dom": "^6.21.1",
  "lucide-react": "^0.303.0"
});
delete pkg.dependencies['astro'];
delete pkg.dependencies['@astrojs/react'];
delete pkg.dependencies['@astrojs/vercel'];

pkg.devDependencies = Object.assign({}, pkg.devDependencies || {}, {
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "@vitejs/plugin-react": "^4.2.1",
  "typescript": "^5.2.2",
  "vite": "^5.0.8"
});
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// 2. Index.html
fs.writeFileSync('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Timetable Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script>
      const getTheme = () => {
        if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
            return localStorage.getItem("theme");
        }
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
      };
      document.documentElement.setAttribute("data-theme", getTheme());
    </script>
  </body>
</html>`);

// 3. vite.config.ts
fs.writeFileSync('vite.config.ts', `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`);

// 4. TSConfig
fs.writeFileSync('tsconfig.json', `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`);
fs.writeFileSync('tsconfig.node.json', `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`);

// 5. Main and App
fs.writeFileSync('src/main.tsx', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

fs.writeFileSync('src/App.tsx', `import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import TimetableView from './components/TimetableView';
import AdminApp from './components/AdminApp';
import ThemeToggle from './components/ThemeToggle';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">📅</span>
            TimeTable Pro
          </Link>
          <nav className="nav-desktop">
            <ul className="nav-links">
              <li><Link to="/" className={pathname === '/' ? 'active' : ''}>View Timetable</Link></li>
              <li><Link to="/admin" className={pathname === '/admin' ? 'active' : ''}>Admin</Link></li>
            </ul>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <nav className="mobile-tab-bar">
        <Link to="/" className={\`mobile-tab \${pathname === '/' ? 'active' : ''}\`}>
          <span className="mobile-tab-icon">📅</span>
          <span className="mobile-tab-label">Timetable</span>
        </Link>
        <Link to="/admin" className={\`mobile-tab \${pathname === '/admin' ? 'active' : ''}\`}>
          <span className="mobile-tab-icon">⚙️</span>
          <span className="mobile-tab-label">Admin</span>
        </Link>
      </nav>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<div className="container page-content"><TimetableView /></div>} />
          <Route path="/admin" element={<AdminApp />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}`);

// 6. Fix Supabase file env vars
let sBasePath = 'src/lib/supabase.ts';
let sb = fs.readFileSync(sBasePath, 'utf8');
sb = sb.replace(/import\.meta\.env\.PUBLIC_SUPABASE_URL/g, 'import.meta.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL');
sb = sb.replace(/import\.meta\.env\.PUBLIC_SUPABASE_ANON_KEY/g, 'import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY');
fs.writeFileSync(sBasePath, sb);

// 7. Vercel JSON
fs.writeFileSync('vercel.json', `{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" },
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}`);

// 8. APIs Migration (Web Crypto/Edge handler approach format for Vercel)
if (!fs.existsSync('api')) fs.mkdirSync('api');
const apiFiles = fs.readdirSync('src/pages/api');
for (const file of apiFiles) {
  if (file.endsWith('.ts')) {
    let content = fs.readFileSync(\`src/pages/api/\${file}\`, 'utf8');
    // We rewrite the Astro APIRoute shape to Vercel Node req, res
    content = content.replace(/import type { APIRoute } from 'astro';/, '');
    
    // Auth helper update
    content = content.replace(/import\.meta\.env\.ADMIN_SECRET_KEY/g, 'process.env.ADMIN_SECRET_KEY');
    content = content.replace(/import\.meta\.env\.PUBLIC_SUPABASE_URL/g, 'process.env.PUBLIC_SUPABASE_URL');
    content = content.replace(/import\.meta\.env\.PUBLIC_SUPABASE_ANON_KEY/g, 'process.env.PUBLIC_SUPABASE_ANON_KEY');
    
    // Instead of using req/res which requires full refactoring of response creation:
    // We can use Vercel's Edge runtime exactly mimicking Astro's Web Standard Request/Response!
    // Just inject config = { runtime: 'edge' } and export default async function handler(request)
    const exportRegex = /export const (GET|POST|PUT|DELETE|PATCH): APIRoute = async \((.*?)\) => {/g;
    
    let methods = [];
    let methodBodies = {};
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      methods.push(match[1]);
      methodBodies[match[1]] = match[2]; // match[2] is either "" or "{ request }"
    }
    
    // We will extract all methods and build a single router handler
    let newContent = content.replace(exportRegex, \`async function handle$1($2) {\`);
    // Remove Supabase import from inner folder and replace with actual edge compatible logic or keep absolute relative paths
    newContent = newContent.replace(/import { supabase } from '\.\.\/\.\.\/lib\/supabase';/, 
\`import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY
);\`);

    newContent += \`
export const config = { runtime: 'edge' };
export default async function handler(request) {
  const method = request.method;
\`;
    for(const m of methods) {
      const argsText = methodBodies[m].includes('request') ? '{ request }' : '';
      newContent += \`  if (method === '\${m}') return await handle\${m}(\${argsText});\\n\`;
    }
    newContent += \`  return new Response('Not Found', { status: 404 });
}
\`;

    // Fix small edge quirks: 'authorization' headers on Edge Request is request.headers.get('authorization')
    // and new URL(request.url) which is fine.
    fs.writeFileSync(\`api/\${file}\`, newContent);
  }
}

// 9. Clean up Astro files
if (fs.existsSync('astro.config.mjs')) fs.unlinkSync('astro.config.mjs');
if (fs.existsSync('src/pages')) fs.rmSync('src/pages', { recursive: true, force: true });
if (fs.existsSync('src/layouts')) fs.rmSync('src/layouts', { recursive: true, force: true });
if (fs.existsSync('src/env.d.ts')) fs.unlinkSync('src/env.d.ts');
