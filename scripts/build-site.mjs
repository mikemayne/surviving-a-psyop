// Assemble the public website in _site without changing committed sources.
import fs from 'node:fs';
import path from 'node:path';
import { loadSiteSettings, escapeHTML, originalSiteUrl, originalRepoUrl } from './site-settings.mjs';
import './generate-seo.mjs';

const site = loadSiteSettings();
const output = '_site';
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

function write(file, content) {
  fs.writeFileSync(path.join(output, file), content);
}

function switchSiteLinks(source) {
  return source
    .replaceAll(originalSiteUrl, site.siteUrl)
    .replaceAll(originalRepoUrl, site.repoUrl)
    .replaceAll(encodeURIComponent(originalSiteUrl), encodeURIComponent(site.siteUrl))
    .replaceAll(encodeURIComponent(originalRepoUrl), encodeURIComponent(site.repoUrl));
}

function replaceMeta(html, attribute, key, value) {
  const prefix = '<meta ' + attribute + '="' + key + '" content="';
  const start = html.indexOf(prefix);
  if (start === -1) throw new Error('Could not find metadata: ' + key);
  const end = html.indexOf('"', start + prefix.length);
  if (end < 0) throw new Error('Malformed metadata: ' + key);
  return html.slice(0, start + prefix.length) + escapeHTML(value) + html.slice(end);
}

let html = switchSiteLinks(fs.readFileSync('index.html', 'utf8'));
html = html.replaceAll('How to Survive a Psyop', escapeHTML(site.title));
html = html.replaceAll('An Open Field Guide', escapeHTML(site.tagline));
html = html.replaceAll('AN OPEN FIELD GUIDE', escapeHTML(site.tagline.toUpperCase()));
html = replaceMeta(html, 'name', 'description', site.description);
html = replaceMeta(html, 'property', 'og:title', site.title);
html = replaceMeta(html, 'property', 'og:description', site.description);
html = replaceMeta(html, 'property', 'og:url', site.siteUrl);
const safeJsString = (value) => JSON.stringify(value).replace(/</g, () => String.fromCharCode(92) + 'u003c');
html = html.replace(/document\.title = ch\.title \+ "[^"]*";/,
  'document.title = ch.title + " — " + ' + safeJsString(site.title) + ';');
html = html.replace(/document\.title = "[^"]*";/,
  'document.title = ' + safeJsString(site.title + ' — ' + site.tagline) + ';');

const structuredData = JSON.stringify({
  '@context': 'https://schema.org', '@type': 'WebSite',
  name: site.title, url: site.siteUrl, description: site.description
}).replace(/</g, () => String.fromCharCode(92) + 'u003c');
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  '<script type="application/ld+json">' + structuredData + '</script>');
html = html.replace(/<h1>How to survive a <em>psyop\.<\/em><\/h1>/,
  '<h1>' + (site.heroHeading === 'How to survive a psyop.'
    ? 'How to survive a <em>psyop.</em>' : escapeHTML(site.heroHeading)) + '</h1>');
html = html.replace(/(<p class="hero-lead">)[\s\S]*?(<\/p>)/,
  (_match, start, end) => start + escapeHTML(site.heroLead) + end);
html = html.replace(/(<div class="cover-center">)[\s\S]*?(<\/div>)/,
  (_match, start, end) => start + (site.coverText === 'Just Do Nothing.'
    ? 'Just<br>Do<br>Nothing.'
    : site.coverText.split('\n').map(escapeHTML).join('<br>')) + end);
write('index.html', html);

const chapters = JSON.parse(fs.readFileSync('chapters.json', 'utf8'));
chapters.title = site.title;
chapters.description = site.description;
chapters.homepage = site.siteUrl;
chapters.repository = site.repoUrl;
for (const chapter of chapters.chapters) {
  chapter.url = site.siteUrl + chapter.id + '.txt';
  chapter.read_url = site.siteUrl + '#read/' + chapter.id;
  chapter.github_url = site.repoUrl + '/blob/main/' + chapter.id + '.txt';
}
write('chapters.json', JSON.stringify(chapters, null, 2) + '\n');

let llms = switchSiteLinks(fs.readFileSync('llms.txt', 'utf8'));
llms = llms.replace(/^# .*$/m, '# ' + site.title);
llms = llms.replace(/^> .*$/m, '> ' + site.description);
write('llms.txt', llms);
write('robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + site.siteUrl + 'sitemap.xml\n');

for (const name of fs.readdirSync('.')) {
  if (fs.statSync(name).isFile() && ((name.endsWith('.txt') && name !== 'llms.txt' && name !== 'robots.txt') || name === 'seo-content.json' || name === 'sitemap.xml')) {
    fs.copyFileSync(name, path.join(output, name));
  }
}
fs.cpSync('topics', path.join(output, 'topics'), { recursive: true });
for (const required of ['index.html', 'chapters.json', 'llms.txt', 'robots.txt', 'sitemap.xml', 'topics/index.html']) {
  if (!fs.statSync(path.join(output, required)).size) throw new Error('Missing output: ' + required);
}
console.log('Built ' + site.title + ' at ' + site.siteUrl + ' from ' + site.repository);
