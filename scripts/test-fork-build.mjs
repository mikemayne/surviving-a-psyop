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
  const base = 'https://example-user.github.io/my-handbook/';
  const repo = 'https://github.com/example-user/my-handbook';
  assert.ok(published('index.html').includes(base));
  assert.ok(published('index.html').includes(repo));
  assert.ok(published('chapters.json').includes(base + 'introduction.txt'));
  assert.ok(published('chapters.json').includes(repo + '/blob/main/introduction.txt'));
  assert.ok(published('llms.txt').includes(base + 'llms.txt'));
  assert.ok(published('robots.txt').includes('Sitemap: ' + base + 'sitemap.xml'));
  assert.ok(published('sitemap.xml').includes(base + 'topics/index.html'));
  assert.ok(published('topics/index.html').includes(base + 'topics/index.html'));
  assert.ok(!published('index.html').includes('https://mikemayne.github.io/surviving-a-psyop/'));
  assert.ok(!published('index.html').includes('https://github.com/mikemayne/surviving-a-psyop'));

  const customConfig = {
    ...config,
    title: 'My & Your Handbook',
    tagline: 'A Personal Guide',
    description: 'A customised public-domain guide.',
    heroHeading: 'My handbook',
    heroLead: 'Welcome to my guide.',
    coverText: 'My\\nBook',
    repository: 'sample-author/my-book',
    siteUrl: 'https://guide.example.com/'
  };
  fs.writeFileSync(configFile, JSON.stringify(customConfig, null, 2) + '\\n');
  build('ignored-env/ignored-repository');
  const home = published('index.html');
  assert.ok(home.includes('My &amp; Your Handbook'));
  assert.ok(home.includes('My handbook'));
  assert.ok(home.includes('Welcome to my guide.'));
  assert.ok(home.includes('My<br>Book'));
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
