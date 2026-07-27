/* Guards the one promise this page makes: it works with no internet.
   A future agent adding a CDN link would silently break offline use — this catches it. */
import { readFileSync, existsSync } from 'fs';

const file = new URL('../index.html', import.meta.url);
if (!existsSync(file)) {
  console.error('FAIL: index.html is missing.');
  process.exit(1);
}

// xmlns="http://www.w3.org/2000/svg" is a namespace identifier, not a network fetch.
const html = readFileSync(file, 'utf8').replace(/xmlns(:\w+)?="https?:\/\/[^"]*"/g, '');

const offenders = [
  ...html.matchAll(/\b(?:src|href)\s*=\s*["']https?:\/\/[^"']+["']/gi),
  ...html.matchAll(/@import\s+(?:url\()?\s*["']?https?:\/\/[^"')]+/gi),
  ...html.matchAll(/url\(\s*["']?https?:\/\/[^"')]+/gi),
].map(m => m[0]);

if (offenders.length) {
  console.error('FAIL: the page is no longer self-contained. External references found:');
  offenders.forEach(o => console.error('  ' + o));
  process.exit(1);
}

console.log('PASS: no external references — the page still works offline.');
