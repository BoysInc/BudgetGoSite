#!/usr/bin/env node
/*
 * Builds one translated copy of each public page per language (/es/, /fr/, ...) so every
 * language has its own URL that search engines can index. The browser-side translator in
 * src/js/i18n.js runs unchanged inside jsdom, so the copies match what visitors used to
 * see after the page loaded and the dictionaries in src/data/i18n/ stay the single source.
 *
 * Usage: npm install --no-save jsdom && node scripts/build_locales.mjs
 * (set JSDOM_DIR to a folder whose node_modules holds jsdom to keep it out of the repo).
 *
 * It also writes the hreflang block into each English page and refreshes the localized
 * entries in sitemap.xml and llms.txt. Run it after editing an English page or a dictionary.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://budgetgo.ai';
const PAGES = ['index.html', 'automations.html', 'mcp.html', 'support.html'];
const MARK = { start: '<!-- locale-alternates:start -->', end: '<!-- locale-alternates:end -->' };

const requireJsdom = createRequire(import.meta.url);
const { JSDOM, VirtualConsole } = requireJsdom(requireJsdom.resolve('jsdom', {
  paths: [ROOT, process.env.JSDOM_DIR].filter(Boolean)
}));

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const i18nSource = read('src/js/i18n.js');

/** Public path of a page: English lives at the root, other languages under /<code>/. */
function pagePath(code, page) {
  const name = page === 'index.html' ? '' : page;
  return code === 'en' ? `/${name}` : `/${code}/${name}`;
}

/** Loads a page in jsdom with the site's own translator, without running the page's other scripts. */
function openPage(html, code) {
  const dom = new JSDOM(html, { url: `${SITE}/`, runScripts: 'outside-only', virtualConsole: new VirtualConsole() });
  const w = dom.window;
  // The translator appends the dictionary with document.write, which would wipe a loaded page.
  w.document.write = () => {};
  w.localStorage.setItem('budgetgo-language', code);
  w.eval(i18nSource);
  return dom;
}

/** Language codes and names, read from the translator so the list lives in one place. */
function languages() {
  const dom = openPage('<!doctype html><html><body></body></html>', 'en');
  return dom.window.BudgetGoI18n.languages.filter((lang) => lang.code !== 'en');
}

function alternatesBlock(page, locales) {
  const link = (hreflang, p) => `  <link rel="alternate" hreflang="${hreflang}" href="${SITE}${p}" />`;
  const lines = [link('en', pagePath('en', page))];
  locales.forEach((lang) => lines.push(link(lang.code, pagePath(lang.code, page))));
  lines.push(link('x-default', pagePath('en', page)));
  return `${MARK.start}\n${lines.join('\n')}\n  ${MARK.end}`;
}

/** Writes the hreflang block into the English source page; returns the updated HTML. */
function withAlternates(html, page, locales) {
  const block = alternatesBlock(page, locales);
  const existing = new RegExp(`${MARK.start}[\\s\\S]*?${MARK.end}`);
  return existing.test(html) ? html.replace(existing, block) : html.replace('</head>', `  ${block}\n</head>`);
}

/** Points a relative URL at its root-absolute form, using the translated copy for localized pages. */
function rewriteUrl(value, code) {
  if (!value || /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(value)) return value;
  const [pathAndQuery, hash] = value.split('#');
  const file = pathAndQuery.split('?')[0];
  const suffix = hash === undefined ? '' : `#${hash}`;
  if (PAGES.includes(file)) return pagePath(code, file) + suffix;
  return `/${pathAndQuery.replace(/^\.\//, '')}${suffix}`;
}

function localize(html, page, lang) {
  // Strip the hreflang block while translating: the translator would otherwise redirect this very page.
  const stripped = html.replace(new RegExp(`${MARK.start}[\\s\\S]*?${MARK.end}`), '');
  const dom = openPage(stripped, lang.code);
  const w = dom.window;
  const doc = w.document;
  w.eval(read(`src/data/i18n/${lang.code}.js`));

  // The switcher is rebuilt at runtime with working links to every language.
  doc.querySelector('.lang-switch')?.remove();
  doc.documentElement.setAttribute('data-locale', lang.code);

  doc.querySelectorAll('[href], [src], [poster]').forEach((el) => {
    ['href', 'src', 'poster'].forEach((name) => {
      if (el.hasAttribute(name)) el.setAttribute(name, rewriteUrl(el.getAttribute(name), lang.code));
    });
  });

  const url = `${SITE}${pagePath(lang.code, page)}`;
  doc.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  doc.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  const head = doc.head;
  head.insertAdjacentHTML('beforeend', `\n  ${alternatesBlock(page, locales).replace(/\n/g, '\n')}\n`);
  return dom.serialize();
}

function replaceBlock(text, name, body, anchor) {
  const block = `<!-- ${name}:start -->${body}<!-- ${name}:end -->`;
  const existing = new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`);
  return existing.test(text) ? text.replace(existing, block) : text.replace(anchor, `${block}\n${anchor}`);
}

function updateSitemap(locales) {
  const file = path.join(ROOT, 'sitemap.xml');
  const today = new Date().toISOString().slice(0, 10);
  const entries = locales.flatMap((lang) => PAGES.map((page) => `
  <url>
    <loc>${SITE}${pagePath(lang.code, page)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page === 'index.html' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page === 'index.html' ? '0.8' : '0.5'}</priority>
  </url>`)).join('');
  fs.writeFileSync(file, replaceBlock(fs.readFileSync(file, 'utf8'), 'locales', `${entries}\n  `, '</urlset>'));
}

function updateLlms(locales) {
  const file = path.join(ROOT, 'llms.txt');
  const list = locales.map((lang) => `- [${lang.name}](${SITE}${pagePath(lang.code, 'index.html')})`).join('\n');
  const body = `\n## Languages\n\nThe site is also published in other languages, each page with its own URL:\n\n${list}\n`;
  fs.writeFileSync(file, replaceBlock(fs.readFileSync(file, 'utf8'), 'locales', body, '## Legal'));
}

const locales = languages();
for (const page of PAGES) {
  const english = withAlternates(read(page), page, locales);
  fs.writeFileSync(path.join(ROOT, page), english);
  for (const lang of locales) {
    const out = path.join(ROOT, pagePath(lang.code, page).slice(1) + (page === 'index.html' ? 'index.html' : ''));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, localize(english, page, lang));
  }
}
updateSitemap(locales);
updateLlms(locales);
console.log(`Built ${locales.length} languages x ${PAGES.length} pages.`);
