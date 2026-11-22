import { mkdir, readFile, readdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
await mkdir(out, { recursive: true });
async function copy(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const from = join(source, entry.name), to = join(destination, entry.name);
    if (entry.isDirectory()) await copy(from, to);
    else if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.d.ts')) continue;
    else if (entry.name.endsWith('.ts')) {
      const code = stripTypeScriptTypes(await readFile(from, 'utf8'), { mode: 'strip' });
      const js = code.replace(/(from\s+['"][^'"]+)\.ts(['"])/g, '$1.js$2');
      await writeFile(to.replace(/\.ts$/, '.js'), js);
    } else await copyFile(from, to);
  }
}
await copy(join(root, 'src'), join(out, 'src'));
await copy(join(root, 'public'), out);
const html = (await readFile(join(root, 'index.html'), 'utf8')).replace('/src/main.ts', '/src/main.js');
await writeFile(join(out, 'index.html'), html);
console.log(`Built ${relative(root, out)}/ — static frontend, no external dependencies.`);
