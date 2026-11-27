import { copyFile, cp } from 'node:fs/promises';
const source = new URL('../dist/', import.meta.url);
const site = new URL('../../', import.meta.url);
// Overlay just Zencut files. Keep old hashed assets for cached HTML and all other apps.
for (const directory of ['assets','fonts','landing','camera']) {
  await cp(new URL(directory,source),new URL(`zencut/${directory}`,site),{recursive:true});
}
await copyFile(new URL('index.html',source),new URL('zencut/index.html',site));
await cp(new URL('apps/zencut/',source),new URL('apps/zencut/',site),{recursive:true});
