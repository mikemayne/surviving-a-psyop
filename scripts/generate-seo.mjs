// Build crawlable chapter pages from source .txt files and shared SEO metadata.
// Run: node scripts/generate-seo.mjs
import fs from 'node:fs';
import path from 'node:path';
import { loadSiteSettings } from './site-settings.mjs';

const site = loadSiteSettings();
const base = site.siteUrl;
const chapters = JSON.parse(fs.readFileSync('chapters.json','utf8')).chapters;
const details = JSON.parse(fs.readFileSync('seo-content.json','utf8'));
const titles = Object.fromEntries(chapters.map(c=>[c.id,c.title]));
const esc = x => String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const fmt = x => esc(x)
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label, url) => {
    const external = url.startsWith('https://chatgpt.com/') ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<a href="'+url+'"'+external+'>'+label+'</a>';
  })
  .replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>')
  .replace(/(^|[^\*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
const dir='topics';
fs.mkdirSync(dir,{recursive:true});
// Unreviewed supplementary chapters must not be indexed until approved.
const draftIds = new Set(['how_to_survive_a_psyop_additional_sections','coercive_urgency','mnufactured_consensus','threats_to_loved_ones']);
for (const c of chapters) if (draftIds.has(c.id)) throw Error('Draft awaiting review: '+c.id);
// Drop generated pages which have been removed from the approved catalogue.
for (const file of fs.readdirSync(dir)) {
  if (file.endsWith('.html') && file !== 'index.html' && !titles[path.basename(file,'.html')]) fs.unlinkSync(path.join(dir,file));
}

function chapterHTML(source) {
  const out=[],para=[]; let list=null;
  const flush=()=>{if(para.length)out.push('<p>'+fmt(para.splice(0).join(' ').trim())+'</p>')};
  const close=()=>{if(list){out.push('</'+list+'>');list=null}};
  for(const line of source.replace(/\r\n/g,'\n').split('\n')) {
    if(!line.trim()){flush();continue}
    const heading=line.match(/^\s*(#{1,4})\s+(.+)$/);
    const bullet=line.match(/^\s*[-*]\s+(.+)$/);
    const numbered=line.match(/^\s*\d+[.)]\s+(.+)$/);
    if(heading){flush();close();const n=heading[1].length+1;out.push('<h'+n+'>'+fmt(heading[2])+'</h'+n+'>')}
    else if(bullet||numbered){flush();const kind=bullet?'ul':'ol';if(list!==kind){close();list=kind;out.push('<'+kind+'>')}out.push('<li>'+fmt((bullet||numbered)[1])+'</li>')}
    else if(/^\s*>/.test(line)){flush();close();out.push('<blockquote>'+fmt(line.replace(/^\s*>\s?/,''))+'</blockquote>')}
    else if(/^\s*(---+|\*\*\*+)\s*$/.test(line)){flush();close();out.push('<hr>')}
    else{close();para.push(line.trim())}
  }
  flush();close();return out.join('\n');
}
function page(title,desc,url,body,articleId) {
  const ld=articleId?'<script type="application/ld+json">'+JSON.stringify({
    '@context':'https://schema.org','@type':'Article',headline:title,description:details[articleId].intro,
    mainEntityOfPage:url,inLanguage:'en'
  }).replace(/</g,'\\u003c')+'</script>':'';
  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>'+esc(title)+' | '+esc(site.title)+'</title><meta name="description" content="'+esc(desc)+'">'+
    '<link rel="canonical" href="'+esc(url)+'"><meta property="og:type" content="'+(articleId?'article':'website')+'">'+
    '<meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(desc)+'">'+
    '<meta property="og:url" content="'+esc(url)+'">'+ld+'<link rel="stylesheet" href="./style.css"></head><body>'+
    '<a class="skip-link" href="#main-content">Skip to main content</a>'+ 
    '<header><a class="brand" href="../">'+esc(site.title)+'</a><nav aria-label="Page navigation"><a href="../#rules">Four rules</a> · <a href="./index.html">All chapters</a></nav></header>'+
    body+'</body></html>\n';
}
for(let i=0;i<chapters.length;i++){
  const c=chapters[i],m=details[c.id],prev=chapters[i-1],next=chapters[i+1];
  if(!/^[a-zA-Z0-9_-]+$/.test(c.id)||!m||!Array.isArray(m.questions)||!Array.isArray(m.related))throw Error('Invalid SEO entry: '+c.id);
  const text=fs.readFileSync(c.id+'.txt','utf8');
  const q='<section><h2>Questions this chapter explores</h2><ul>'+m.questions.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul></section>';
  const related='<section><h2>Related reading</h2><ul>'+m.related.map(id=>{if(!titles[id])throw Error('Unknown related chapter '+id);return '<li><a href="./'+id+'.html">'+esc(titles[id])+'</a></li>'}).join('')+'</ul></section>';
  const nav='<div class="chapter-nav">'+(prev?'<a href="./'+prev.id+'.html">← '+esc(prev.title)+'</a>':'<span></span>')+(next?'<a href="./'+next.id+'.html">'+esc(next.title)+' →</a>':'<span></span>')+'</div>';
  const body='<main id="main-content" tabindex="-1">'+(c.category === chapters[0].category ? '' : '<p class="eyebrow">'+esc(c.category)+'</p>')+'<h1>'+esc(c.title)+'</h1>'+
    '<p class="intro">From <a href="../">'+esc(site.title)+'</a> — start with the <a href="../#rules">four rules</a>.</p>'+
    '<p class="intro">'+esc(m.intro)+'</p><article>'+chapterHTML(text)+q+'</article>'+related+nav+
    '<footer><a href="./index.html">All chapters</a> · <a href="../#read/'+c.id+'">Interactive reader</a> · <a href="../'+c.id+'.txt">Original text</a> · CC0 1.0 Universal</footer></main>';
  fs.writeFileSync(path.join(dir,c.id+'.html'),page(c.title,m.intro.slice(0,160),base+'topics/'+c.id+'.html',body,c.id));
}
const groups=new Map();
chapters.forEach(c=>{if(!groups.has(c.category))groups.set(c.category,[]);groups.get(c.category).push(c)});
const sections=[...groups.entries()].map(([group,items])=>'<section><h2>'+esc(group)+'</h2><ul>'+items.map(c=>'<li><a href="./'+c.id+'.html">'+esc(c.title)+'</a></li>').join('')+'</ul></section>').join('\n');
const index='<main id="main-content" tabindex="-1"><h1>Browse all chapters</h1><p class="intro">'+esc(site.description)+' Browse the chapters below.</p>'+sections+'<footer><a href="../">Back to homepage</a> · CC0 1.0 Universal</footer></main>';
fs.writeFileSync(path.join(dir,'index.html'),page('All chapters',site.description,base+'topics/index.html',index));
const urls=[base,base+'questionnaire.html',base+'topics/index.html',...chapters.map(c=>base+'topics/'+c.id+'.html')];
fs.writeFileSync('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>'  <url><loc>'+esc(url)+'</loc></url>').join('\n')+'\n</urlset>\n');
console.log('Generated '+chapters.length+' searchable chapter pages.');
