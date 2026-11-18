// Verify a fork's automatic URLs and a customised site's generated metadata.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolveSiteSettings } from './site-settings.mjs';

const configFile = 'site-config.json';
const original = fs.readFileSync(configFile, 'utf8');
const config = JSON.parse(original);

function build(repository) {
  execFileSync(process.execPath, ['scripts/build-site.mjs'], {
    env: { ...process.env, GITHUB_REPOSITORY: repository },
    stdio: 'inherit'
  });
}
function published(name) {
  return fs.readFileSync(path.join('_site', name), 'utf8');
}

try {
  build('example-user/my-handbook');
  // The compiled reader must contain every approved chapter in order.
  // Without this, a valid #read/id route can fall back to #catalogue.
  const approvedChapters = JSON.parse(published('chapters.json')).chapters;
  const compiledGroups = published('index.html').match(/var GROUPS = (\[[^\n]+\]);/);
  assert.ok(compiledGroups, 'Published reader chapter groups must be present');
  const compiledChapters = JSON.parse(compiledGroups[1]).flatMap(group =>
    group.files.map(([id, title]) => ({ id, title, category: group.name, category_description: group.note }))
  );
  assert.deepEqual(compiledChapters, approvedChapters.map(chapter => ({
    id: chapter.id, title: chapter.title,
    category: chapter.category, category_description: chapter.category_description
  })), 'Published reader and chapters.json must agree for every chapter');
  assert.ok(published('index.html').includes('href="#read/record_ignore_report"'),
    'The Record, Ignore, Report decision tile must link to its chapter');

  const base = 'https://example-user.github.io/my-handbook/';
  const repo = 'https://github.com/example-user/my-handbook';
  assert.ok(published('index.html').includes(base));
  assert.ok(published('index.html').includes(repo));
  assert.ok(published('chapters.json').includes(base + 'introduction.txt'));
  assert.ok(published('chapters.json').includes(repo + '/blob/main/introduction.txt'));
  assert.ok(published('llms.txt').includes(base + 'chapters.json'));
  assert.ok(published('robots.txt').includes('Sitemap: ' + base + 'sitemap.xml'));
  assert.ok(published('sitemap.xml').includes(base + 'topics/index.html'));
  assert.ok(published('topics/index.html').includes(base + 'topics/index.html'));
  assert.ok(!published('index.html').includes('https://mikemayne.github.io/surviving-a-psyop/'));
  assert.ok(!published('index.html').includes('https://github.com/mikemayne/surviving-a-psyop'));


  // Homepage text must be generated from introduction.txt, not copied or fetched on load.
  const source = fs.readFileSync('introduction.txt', 'utf8');
  const section = source.match(/\*\*\s*How to survive\s*\*\*([\s\S]*?)\*\*\s*How to report\s*\*\*/i);
  assert.ok(section, 'introduction.txt has a survival rules section');
  const rules = [...section[1].matchAll(/^[ \t]*([1-4])\.[ \t]+\*\*([^*\r\n]+)\*\*[ \t]+—[ \t]+([^\r\n]+)[ \t]*$/gm)];
  assert.equal(rules.length, 4, 'introduction.txt contains exactly four numbered rules');
  const homeRules = published('index.html');
  assert.ok(!homeRules.includes('syncHomepageRules'), 'No browser-side rewrite of homepage rules');
  assert.ok(!homeRules.includes('<!-- Generated from introduction.txt'), 'No unfilled rule placeholders');
  const escapeText = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  for (const [i, match] of rules.entries()) {
    const [, number, title, body] = match;
    assert.equal(Number(number), i + 1);
    const expectedBody = escapeText(body.trim()).replace(/\*\*([^*\r\n]+)\*\*/g, '<strong>$1</strong>');
    const rendered = homeRules.match(new RegExp('<article class="rule-card"><span class="rule-number">0' + number +
      '</span><h3>([^<]*)</h3><p id="rule-text-' + number + '">([\\s\\S]*?)</p></article>'));
    assert.ok(rendered, 'Homepage rule ' + number + ' is present');
    assert.equal(rendered[1], escapeText(title.trim()), 'Rule ' + number + ' title matches introduction.txt');
    assert.equal(rendered[2], expectedBody, 'Rule ' + number + ' text matches introduction.txt');
  }

  const customConfig = {
    ...config,
    title: 'My & Your Handbook',
    tagline: 'A Personal Guide',
    description: 'A customised public-domain guide.',
    heroHeading: 'My handbook',
    heroLead: 'Welcome to my guide.',
    repository: 'sample-author/my-book',
    siteUrl: 'https://guide.example.com/'
  };
  fs.writeFileSync(configFile, JSON.stringify(customConfig, null, 2) + '\n');
  build('ignored-env/ignored-repository');
  const home = published('index.html');
  assert.ok(home.includes('My &amp; Your Handbook'));
  assert.ok(home.includes('document.title = ch.title + " — " + "My & Your Handbook";'));
  assert.ok(home.includes('My handbook'));
  assert.ok(home.includes('Welcome to my guide.'));
  // The homepage uses a fixed, responsive two-choice safety card instead of a configurable book cover.
  assert.ok(home.includes('class="cover"'), 'Homepage safety card is present');
  assert.ok(home.includes('Are you in danger?'), 'Safety question is present');
  assert.ok(home.includes('Call 999'), 'Emergency response is present');
  assert.ok(home.includes('Record, Ignore'), 'Non-emergency response is present');
  assert.ok(home.includes('id="what-to-do-view"'), 'Separate What to do page is retained');
  assert.ok(home.includes('A Personal Guide'));
  assert.ok(home.includes('https://guide.example.com/'));
  assert.ok(home.includes('https://github.com/sample-author/my-book'));
  assert.ok(published('topics/index.html').includes('My &amp; Your Handbook'));
  assert.ok(published('topics/index.html').includes('https://guide.example.com/topics/index.html'));
  assert.ok(published('llms.txt').startsWith('# My & Your Handbook'));
  assert.ok(published('robots.txt').includes('https://guide.example.com/sitemap.xml'));
  assert.equal(JSON.parse(published('chapters.json')).homepage, 'https://guide.example.com/');
  assert.equal(resolveSiteSettings({ ...config, repository: '', siteUrl: '' },
    { GITHUB_REPOSITORY: 'alice/alice.github.io' }).siteUrl, 'https://alice.github.io/');
  assert.throws(() => resolveSiteSettings({ ...config, siteUrl: 'http://insecure.example.com/' }),
    /HTTPS URL/);
  console.log('Fork build checks passed.');
} finally {
  fs.writeFileSync(configFile, original);
}
