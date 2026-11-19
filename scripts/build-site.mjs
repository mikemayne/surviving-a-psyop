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


// The four homepage rules have one source: the numbered rules in introduction.txt.
// Fail the build rather than silently using stale or manually duplicated HTML.
function generateHomepageRules(html) {
  const source = fs.readFileSync('introduction.txt', 'utf8');
  const section = source.match(/\*\*\s*How to survive\s*\*\*([\s\S]*?)\*\*\s*How to report\s*\*\*/i);
  if (!section) throw new Error('introduction.txt: missing How to survive / How to report sections');

  const rules = [...section[1].matchAll(/^[ \t]*([1-4])\.[ \t]+\*\*([^*\r\n]+)\*\*[ \t]+—[ \t]+([^\r\n]+)[ \t]*$/gm)];
  if (rules.length !== 4 || rules.some((match, index) => Number(match[1]) !== index + 1)) {
    throw new Error('introduction.txt must contain exactly four numbered homepage rules (1–4)');
  }

  const marker = '<!-- Generated from introduction.txt by the site build; edit introduction.txt instead. -->';
  for (const match of rules) {
    const [, number, heading, body] = match;
    const expected = '<h3>' + marker + '</h3><p id="rule-text-' + number + '">' + marker + '</p>';
    if (html.split(expected).length !== 2) {
      throw new Error('index.html rule ' + number + ' must contain its build-time placeholders; edit introduction.txt instead');
    }
    const inline = escapeHTML(body.trim()).replace(/\*\*([^*\r\n]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(expected, '<h3>' + escapeHTML(heading.trim()) +
      '</h3><p id="rule-text-' + number + '">' + inline + '</p>');
  }
  return html;
}


 // Generate reader navigation from the authoritative chapters.json catalogue.
 // The source HTML keeps a fallback list for direct file previews, but
 // publishing always uses the catalogue so newly registered pages cannot 404.
function generateReaderGroups(html, catalogue) {
  const grouped = new Map();
  for (const chapter of catalogue.chapters) {
    if (!grouped.has(chapter.category)) {
      grouped.set(chapter.category, {
        name: chapter.category, note: chapter.category_description, files: []
      });
    }
    grouped.get(chapter.category).files.push([chapter.id, chapter.title]);
  }
  const startMarker = '  // BEGIN CHAPTER GROUPS';
  const endMarker = '  // END CHAPTER GROUPS';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start < 0 || end < 0 || html.indexOf(startMarker, start + 1) !== -1 || html.indexOf(endMarker, end + 1) !== -1) {
    throw new Error('index.html must contain exactly one chapter group placeholder pair');
  }
  const payload = JSON.stringify([...grouped.values()]).replace(/</g, '\\u003c');
  return html.slice(0, start) + startMarker + '\n  var GROUPS = ' + payload + ';\n' +
    html.slice(end);
}

const chapters = JSON.parse(fs.readFileSync('chapters.json', 'utf8'));
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
html = html.replace(/(<h1(?:\s[^>]*)?>)How to survive a <em>psyop\.<\/em><\/h1>/,
  (_match, headingOpen) => headingOpen + (site.heroHeading === 'How to survive a psyop.'
    ? 'How to survive a <em>psyop.</em>' : escapeHTML(site.heroHeading)) + '</h1>');
html = html.replace(/(<p class="hero-lead">)[\s\S]*?(<\/p>)/,
  (_match, start, end) => start + escapeHTML(site.heroLead) + end);
html = generateHomepageRules(html);
html = generateReaderGroups(html, chapters);
write('index.html', html);

chapters.title = site.title;
chapters.description = site.description;
chapters.homepage = site.siteUrl;
chapters.repository = site.repoUrl;
for (const chapter of chapters.chapters) {
  chapter.url = site.siteUrl + chapter.id + '.txt';
  chapter.read_url = site.siteUrl + '#read/' + chapter.id;
  chapter.github_url = site.repoUrl + '/blob/main/' + chapter.id + '.txt';
}
// Keep qualitative strategy annotations in sync with the approved chapter list.
const strategyMetadata = JSON.parse(fs.readFileSync('strategy-metadata.json', 'utf8'));
const approvedChapterIds = new Set(chapters.chapters.map(chapter => chapter.id));
const strategyEntries = strategyMetadata.chapters;
if (!strategyEntries || Object.keys(strategyEntries).length !== approvedChapterIds.size) {
  throw Error('Strategy metadata must cover every approved chapter exactly once.');
}
for (const [id, entry] of Object.entries(strategyEntries)) {
  if (!approvedChapterIds.has(id)) throw Error('Unknown strategy metadata chapter: ' + id);
  if (!['guidance', 'reference', 'overview', 'technique', 'technical_context', 'experience_and_analysis'].includes(entry.kind)) {
    throw Error('Invalid strategy metadata kind: ' + id);
  }
  for (const field of ['possible_goal', 'possible_emotional_effects', 'possible_behavioural_responses']) {
    const value = entry[field];
    const valid = value === 'N/A' || (field === 'possible_goal'
      ? typeof value === 'string' && value.trim().length > 0
      : Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string' && item.trim().length > 0));
    if (!valid) throw Error('Invalid strategy metadata field ' + id + '.' + field);
  }
}

const effectTags = strategyMetadata.cumulative_effect_taxonomy;
if (strategyMetadata.schema_version !== 2 || !effectTags || typeof effectTags !== 'object') {
  throw Error('Cumulative strategy metadata schema is missing.');
}
for (const [id, entry] of Object.entries(strategyEntries)) {
  const effects = entry.possible_cumulative_effects;
  if (effects !== 'N/A' && (!Array.isArray(effects) || !effects.length ||
      effects.some(tag => typeof effectTags[tag] !== 'string'))) {
    throw Error('Invalid cumulative effect tags for chapter: ' + id);
  }
}
if (!Array.isArray(strategyMetadata.possible_causal_transitions)) {
  throw Error('Missing possible causal transitions.');
}
for (const link of strategyMetadata.possible_causal_transitions) {
  if (!effectTags[link.from] || !effectTags[link.to] || !link.relationship) {
    throw Error('Invalid causal effect transition.');
  }
}

write('strategy-metadata.json', JSON.stringify(strategyMetadata, null, 2) + '\n');

write('chapters.json', JSON.stringify(chapters, null, 2) + '\n');

// Publish the progressive, cause-independent safety decision tree for readers and AI tools.
const decisionTree = JSON.parse(fs.readFileSync('decision-tree.json', 'utf8'));
if (decisionTree.schema_version !== 1 || !Array.isArray(decisionTree.views) || decisionTree.views.length < 2) {
  throw new Error('Invalid decision-tree.json metadata');
}
write('decision-tree.json', JSON.stringify(decisionTree, null, 2) + '\n');

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
for (const required of ['index.html', 'chapters.json', 'strategy-metadata.json', 'decision-tree.json', 'llms.txt', 'robots.txt', 'sitemap.xml', 'topics/index.html']) {
  if (!fs.statSync(path.join(output, required)).size) throw new Error('Missing output: ' + required);
}
console.log('Built ' + site.title + ' at ' + site.siteUrl + ' from ' + site.repository);
