import { mkdir, copyFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as sass from 'sass';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = path.resolve(root, 'dist');
// Usuwamy wyłącznie katalog wynikowy wewnątrz projektu.
if (path.relative(root, dist) !== 'dist') throw new Error('Nieprawidłowy katalog wynikowy.');
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets/fonts'), { recursive: true });
const css = sass.compile(path.join(root, 'styles/main.scss'), { style: 'compressed' }).css;
await writeFile(path.join(root, 'style.css'), css);
for (const file of ['index.html', 'style.css', 'script.js', 'form-controls.js', 'privacy.html', 'sitemap.xml', 'robots.txt']) {
  await copyFile(path.join(root, file), path.join(dist, file));
}
for (const file of ['mark.svg', 'social-preview.jpg', 'tower-900.webp', 'tower-1500.webp', 'laptop-photo.webp', 'nvme-photo.webp', 'graphics-card.webp', 'laptop-fan.webp', 'workstation-photo.webp', 'components-photo.webp']) {
  await copyFile(path.join(root, 'assets', file), path.join(dist, 'assets', file));
}
for (const file of ['Manrope-subset.ttf', 'OFL.txt']) {
  await copyFile(path.join(root, 'assets/fonts', file), path.join(dist, 'assets/fonts', file));
}
console.log('Gotowe: dist — pliki publicznej strony.');
