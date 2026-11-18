// Central site settings for GitHub Pages and local builds. No dependencies.
import fs from 'node:fs';

const originalRepository = 'mikemayne/surviving-a-psyop';
const originalSiteUrl = 'https://mikemayne.github.io/surviving-a-psyop/';
const originalRepoUrl = 'https://github.com/mikemayne/surviving-a-psyop';

export { originalRepository, originalSiteUrl, originalRepoUrl };

export function escapeHTML(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function resolveSiteSettings(config, environment = process.env) {
  const keys = ['title', 'tagline', 'description', 'heroHeading', 'heroLead'];
  for (const key of keys) {
    if (typeof config[key] !== 'string' || !config[key].trim()) {
      throw new Error('site-config.json: "' + key + '" must contain text');
    }
  }
  const repo = (config.repository || environment.GITHUB_REPOSITORY || originalRepository).trim();
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo) || repo.includes('..')) {
    throw new Error('site-config.json: repository must be in owner/repository format');
  }
  const [owner, name] = repo.split('/');
  const repoUrl = 'https://github.com/' + repo;
  const inferredUrl = name.toLowerCase() === (owner + '.github.io').toLowerCase()
    ? 'https://' + owner + '.github.io/'
    : 'https://' + owner + '.github.io/' + name + '/';
  const rawUrl = (config.siteUrl || inferredUrl).trim();
  let parsed;
  try { parsed = new URL(rawUrl); } catch { throw new Error('Invalid siteUrl: ' + rawUrl); }
  if (parsed.protocol !== 'https:' || parsed.search || parsed.hash || parsed.username || parsed.password) {
    throw new Error('siteUrl must be an HTTPS URL without query, fragment or credentials');
  }
  const siteUrl = parsed.href.endsWith('/') ? parsed.href : parsed.href + '/';
  return { ...config, repository: repo, repoUrl, siteUrl };
}

export function loadSiteSettings() {
  return resolveSiteSettings(JSON.parse(fs.readFileSync('site-config.json', 'utf8')));
}
