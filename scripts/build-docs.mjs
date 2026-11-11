import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  cpSync,
} from 'node:fs';
import assert from 'node:assert/strict';
import { coverageInputs } from './coverage-inputs.mjs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const base = args[args.indexOf('--base') + 1] ?? '/rc-table-advanced/';
const origin = 'https://mobinarastinmanesh.github.io';
const out = resolve(root, 'example/dist');
const snapshot = JSON.parse(
  readFileSync(resolve(root, 'docs/coverage-summary.json'), 'utf8'),
);
assert.equal(
  snapshot.fingerprint,
  coverageInputs(root).fingerprint,
  'Coverage snapshot is stale. Run npm run test:coverage.',
);
cpSync(resolve(root, 'coverage'), resolve(out, 'coverage'), {
  recursive: true,
  filter: (path) => !/\.(json|info|xml)$/.test(path),
});
writeFileSync(
  resolve(out, 'coverage/summary.json'),
  JSON.stringify(snapshot, null, 2) + '\n',
);
const percentage = snapshot.total.lines.pct;
writeFileSync(
  resolve(out, 'coverage/badge.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="190" height="24" role="img" aria-label="Source line coverage: ${percentage}%"><title>Source line coverage: ${percentage}%</title><rect width="190" height="24" rx="4" fill="#166534"/><text x="95" y="16" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="white">Source lines: ${percentage}%</text></svg>`,
);
const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');
const files = readdirSync(resolve(root, 'docs')).filter((file) =>
  file.endsWith('.md'),
);
const pages = files.map((file) => {
  const markdown = readFileSync(resolve(root, 'docs', file), 'utf8');
  const slug = file.slice(0, -3);
  const title = markdown.match(/^# (.+)/m)[1];
  const description =
    markdown
      .split('\n\n')
      .find((part) => !part.startsWith('#'))
      ?.replace(/[*`]/g, '')
      .slice(0, 180) ?? title;
  return { slug, title, description, markdown };
});
const nav = pages
  .map(
    (page) => `<a href="${base}docs/${page.slug}/">${escape(page.title)}</a>`,
  )
  .join('');
for (const page of pages) {
  const path = `${base}docs/${page.slug}/`;
  const markdown = page.markdown
    .replaceAll('](coverage-summary.json)', `](${base}coverage/summary.json)`)
    .replaceAll(
      '](https://mobinarastinmanesh.github.io/rc-table-advanced/coverage/)',
      `](${base}coverage/)`,
    )
    .replace(/\]\(([^):]+)\.md\)/g, (_, name) => `](${base}docs/${name}/)`);
  const body = marked.parse(markdown);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(page.title)} | rc-table-advanced</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${origin}${path}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(page.title)} | rc-table-advanced"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}${base}social-preview.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${base}favicon.svg"><link rel="stylesheet" href="${base}docs/docs.css"></head><body><a class="skip" href="#content">Skip to content</a><header><a href="${base}">rc-table-advanced</a><span>2.0.0-rc.0 · unreleased</span><a href="https://github.com/mobinarastinmanesh/rc-table-advanced">GitHub</a></header><div class="layout"><nav aria-label="Documentation">${nav}</nav><main id="content">${body}</main></div></body></html>`;
  mkdirSync(resolve(out, 'docs', page.slug), { recursive: true });
  writeFileSync(resolve(out, 'docs', page.slug, 'index.html'), html);
}
cpSync(
  resolve(root, 'docs/coverage-summary.json'),
  resolve(out, 'docs/coverage-summary.json'),
);
writeFileSync(
  resolve(out, 'docs/docs.css'),
  `:root{font-family:system-ui,sans-serif;color:#172033;background:#fff;line-height:1.65}*{box-sizing:border-box}body{margin:0}a{color:#1d4ed8}header{padding:1rem 2rem;border-bottom:1px solid #dbe2ea;display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center}header>a:first-child{font-weight:750;text-decoration:none;color:inherit}header span{font-size:.85rem;color:#475569}.layout{max-width:1400px;margin:auto;display:grid;grid-template-columns:260px minmax(0,1fr)}nav{padding:2rem 1.5rem}nav a{display:block;margin-bottom:.8rem;font-size:.9rem}main{max-width:960px;padding:2rem 2.5rem 6rem;min-width:0}h1,h2,h3{line-height:1.25;scroll-margin-top:2rem}h1{font-size:2.3rem;letter-spacing:-.035em}h2{margin-top:2.5rem}pre{overflow:auto;background:#f1f5f9;border:1px solid #dbe2ea;padding:1rem;border-radius:8px;font-size:.85rem}code{font-family:ui-monospace,monospace;font-size:.9em;overflow-wrap:anywhere}pre code{overflow-wrap:normal}table{border-collapse:collapse;display:block;overflow:auto;font-size:.9rem}th,td{padding:.6rem;border:1px solid #dbe2ea;text-align:left;vertical-align:top}blockquote{border-left:3px solid #2563eb;margin-left:0;padding-left:1rem;color:#475569}.skip{position:absolute;left:-999px}.skip:focus{left:1rem;top:1rem;background:white;padding:.5rem}@media(max-width:800px){.layout{display:block}nav{border-bottom:1px solid #dbe2ea;display:flex;flex-wrap:wrap;gap:.5rem 1rem;padding:1rem}nav a{margin:0}main{padding:1.25rem}h1{font-size:1.8rem}}`,
);
writeFileSync(
  resolve(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', ...pages.map((page) => `docs/${page.slug}/`)].map((path) => `<url><loc>${origin}${base}${path}</loc></url>`).join('')}</urlset>`,
);
console.log(
  `Generated ${pages.length} static documentation pages and sitemap.`,
);
