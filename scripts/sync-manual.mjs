// Copy the PixelM Creator X user guide (markdown + screenshots) into the site.
// Usage: node scripts/sync-manual.mjs [path/to/pixelm_creator_x/docs]
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const src = resolve(process.argv[2] ?? '/mnt/c/prj/pixelm_creator_x/docs');
const dest = resolve(import.meta.dirname, '../src/content/manual');

rmSync(dest, { recursive: true, force: true });
cpSync(join(src, 'images'), join(dest, 'images'), { recursive: true });

// The prop (hardware) guide in src/content/hardware/hardware.md is rendered after this manual,
// so append it to the manual's TOC: the last top-level item of the list under "## 目錄".
const lines = readFileSync(join(src, '使用說明.md'), 'utf8').split('\n');
const tocStart = lines.findIndex((line) => line.trim() === '## 目錄');
let last = -1;
for (let i = tocStart + 1; tocStart >= 0 && i < lines.length && !/^(#|---)/.test(lines[i]); i++) {
	if (/^\d+\. /.test(lines[i])) last = i;
}
if (last < 0) throw new Error(`${src}/使用說明.md: 找不到「## 目錄」下的編號清單`);
const number = Number(lines[last].match(/^\d+/)[0]) + 1;
let end = last + 1;
while (end < lines.length && /^\s+\S/.test(lines[end])) end++;
lines.splice(end, 0, `${number}. [Pixel MR 道具操作說明](#pixel-mr-道具操作說明)`);
writeFileSync(join(dest, 'manual.md'), lines.join('\n'));

console.log(`synced ${src} -> ${dest}`);
