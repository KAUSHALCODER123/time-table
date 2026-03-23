const fs = require('fs');
const path = require('path');

const apiDir = path.join(process.cwd(), 'api');
const targetApiDir = path.join(process.cwd(), 'app', 'api');

if (!fs.existsSync(targetApiDir)) { fs.mkdirSync(targetApiDir, { recursive: true }); }
const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
    let content = fs.readFileSync(path.join(apiDir, file), 'utf8');
    content = content.replace("export const config = { runtime: 'edge' };", "export const runtime = 'edge';");

    const additional = `
export async function GET(req) { return handler(req); }
export async function POST(req) { return handler(req); }
export async function PUT(req) { return handler(req); }
export async function DELETE(req) { return handler(req); }
  `;

    const newDir = path.join(targetApiDir, file.replace('.ts', ''));
    fs.mkdirSync(newDir, { recursive: true });
    fs.writeFileSync(path.join(newDir, 'route.ts'), content + additional);
}

const toDelete = ['index.html', 'vite.config.ts', 'src/main.tsx', 'src/App.tsx'];
for (const f of toDelete) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
}
fs.rmSync(apiDir, { recursive: true, force: true });
