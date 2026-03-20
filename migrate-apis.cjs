const fs = require('fs');
const path = require('path');

if (!fs.existsSync('api')) fs.mkdirSync('api');

const apiFiles = fs.readdirSync('src/pages/api');

for (const file of apiFiles) {
    if (!file.endsWith('.ts')) continue;
    let content = fs.readFileSync(path.join('src/pages/api', file), 'utf8');

    // Remove Astro imports
    content = content.replace(/import type { APIRoute } from 'astro';\n?/g, '');
    
    // Replace env var usage
    content = content.replace(/import\.meta\.env\.ADMIN_SECRET_KEY/g, 'process.env.ADMIN_SECRET_KEY');
    
    // Convert to Edge runtime format
    // export const GET: APIRoute = async ({ request }) => ...
    const regex = /export const (GET|POST|PUT|DELETE|PATCH):? (APIRoute )?= async \((.*?)\) => \{/g;
    
    let methods = [];
    let methodBodies = {};
    let match;
    
    while ((match = regex.exec(content)) !== null) {
        methods.push(match[1]);
        methodBodies[match[1]] = match[3]; // match[3] is either "" or "{ request }"
    }
    
    // Replace the function declarations
    let newContent = content.replace(regex, 'async function handle$1($3) {');
    
    // Replace supabase import path
    newContent = newContent.replace(/import \{ supabase \} from '\.\.\/\.\.\/lib\/supabase';/g, "import { createClient } from '@supabase/supabase-js';\nconst supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY);");
    
    // Add Vercel Edge handler wrapper at the bottom
    newContent += `\n\nexport const config = { runtime: 'edge' };\n`;
    newContent += `export default async function handler(request) {\n`;
    newContent += `    const method = request.method;\n`;
    
    for (const m of methods) {
        const hasReq = methodBodies[m].includes('request');
        const args = hasReq ? '{ request }' : '';
        newContent += `    if (method === '${m}') return await handle${m}(${args});\n`;
    }
    
    newContent += `    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });\n`;
    newContent += `}\n`;
    
    fs.writeFileSync(path.join('api', file), newContent);
}

// Fix Supabase client in frontend lib/supabase.ts
let sb = fs.readFileSync('src/lib/supabase.ts', 'utf8');
sb = sb.replace(/import\.meta\.env\.PUBLIC_SUPABASE_URL/g, 'import.meta.env.VITE_SUPABASE_URL');
sb = sb.replace(/import\.meta\.env\.PUBLIC_SUPABASE_ANON_KEY/g, 'import.meta.env.VITE_SUPABASE_ANON_KEY');
fs.writeFileSync('src/lib/supabase.ts', sb);
