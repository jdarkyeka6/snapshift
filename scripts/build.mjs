import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
const destination = join(process.cwd(), 'www');
await mkdir(destination, { recursive: true });
for (const file of ['index.html', 'manifest.webmanifest']) {
  await copyFile(join(process.cwd(), file), join(destination, file));
}
console.log('SnapShift web assets ready in www/');
