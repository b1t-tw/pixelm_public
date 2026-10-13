// Copy the PixelM Creator X user guide (markdown + screenshots) into the site.
// Usage: node scripts/sync-manual.mjs [path/to/pixelm_creator_x/docs]
import { cpSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const src = resolve(process.argv[2] ?? '/mnt/c/prj/pixelm_creator_x/docs');
const dest = resolve(import.meta.dirname, '../src/content/manual');

rmSync(dest, { recursive: true, force: true });
cpSync(join(src, 'images'), join(dest, 'images'), { recursive: true });
cpSync(join(src, '使用說明.md'), join(dest, 'manual.md'));
console.log(`synced ${src} -> ${dest}`);
