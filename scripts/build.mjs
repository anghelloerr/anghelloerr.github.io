import { readFile, writeFile, mkdir, cp, access, unlink, rm, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createPortfolioViews } from './portfolio.mjs';
import { createEditorial } from './editorial.mjs';
import { finalize } from './finalize.mjs';

const root = await realpath(path.resolve(fileURLToPath(new URL('../', import.meta.url))));
const data = JSON.parse(await readFile(path.join(root, 'content.json'), 'utf8'));
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function safeUrl(value) {
  if (!value) return '';
  if (/^(https:\/\/|mailto:|#|assets\/)/.test(value) && !/[\s<>"\\]/.test(value) && !value.includes('..')) return esc(value);
  throw new Error(`URL no permitida: ${value}`);
}
const external = 'target="_blank" rel="noopener noreferrer"';
const tags = (items, cls = '') => `<ul class="tags ${cls}" role="list">${items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
const icons = {
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7m0-10v.01M11 17v-7m0 3c0-4 6-4 6 0v4"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 4v-4c0-1-.3-2-1-2 3-.4 6-1 6-5 0-1-.4-2-1-3 0-1 0-2-.3-3-2 0-3 1-4 2a12 12 0 0 0-6 0C8 5 7 4 5 4c-.3 1-.3 2-.3 3C4 8 4 9 4 10c0 4 3 4.6 6 5-.7.4-1 1-1 2v4"/>',
  orcid: '<circle cx="12" cy="12" r="9"/><path d="M8 11v5m0-8v.01M12 8h2c5 0 5 8 0 8h-2Z"/>',
  moon: '<path d="M20 14a8 8 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const socialLinks = (className = '') => `<div class="social-links ${className}">${data.profile.links.map(l => `<a href="${safeUrl(l.url)}" ${l.url.startsWith('https') ? external : ''}>${icon(l.icon)}<span>${esc(l.label)}</span></a>`).join('')}</div>`;
const heading = (n, label, title, subtitle = '') => `<div class="section-heading"><div><p class="eyebrow"><span>${n}</span> ${label}</p><h2>${title}</h2></div>${subtitle ? `<p class="section-description">${subtitle}</p>` : ''}</div>`;
function experience(e) {
  const related = (e.projectIds || []).map(id => data.projects.find(p => p.id === id));
  return `<li class="timeline-item" id="exp-${esc(e.id)}"><div class="timeline-date"><span>${esc(e.period)}</span>${e.current ? '<span class="current-label">Actividad actual</span>' : ''}</div><div class="timeline-body"><p class="small-label">${esc(e.location)}</p><h3>${esc(e.institution)}</h3><p class="role">${esc(e.role)}</p><p>${esc(e.text)}</p>${(e.highlights || []).map(h => `<div class="experience-highlight"><h4>${esc(h.title)}</h4><p>${esc(h.text)}</p></div>`).join('')}${related.length ? `<div class="experience-projects"><h4>Trabajo relacionado</h4>${related.map(p => `<a href="projects/${p.id}.html">${esc(p.title)} ${icon('arrow')}</a>`).join('')}</div>` : ''}</div></li>`;
}
const p = data.profile;
const editorial=createEditorial({data,esc,safeUrl,external,icon,tags});
const ids = new Set();
for (const project of data.projects) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || ids.has(project.id)) throw new Error(`Identificador inválido o repetido: ${project.id}`);
  ids.add(project.id);
  if (project.experienceId && !data.experience.some(e => e.id === project.experienceId)) throw new Error(`Experiencia no encontrada: ${project.experienceId}`);
  for (const evidence of project.evidence || []) {
    if (!evidence.title) throw new Error('Cada evidencia necesita un título.');
    if ([evidence.image,evidence.video,evidence.audio,evidence.embedUrl].filter(Boolean).length > 1) throw new Error(`Usa una imagen o un video por evidencia: ${evidence.title}`);
    if (evidence.video && !/^assets\/videos\/[^?#]+\.(mp4|webm)$/.test(evidence.video)) throw new Error('Los videos locales deben ser MP4 o WebM bajo assets/videos/.');
  }
}
for (const e of data.experience) for (const id of e.projectIds || []) if (!ids.has(id)) throw new Error(`Proyecto relacionado inexistente: ${id}`);
// Hidden drafts stay in the source but never generate a page or related links.
const hiddenIds = new Set(data.projects.filter(p => p.hidden === true).map(p => p.id));
data.projects = data.projects.filter(p => !hiddenIds.has(p.id));
for (const e of data.experience) if (e.projectIds) e.projectIds = e.projectIds.filter(id => !hiddenIds.has(id));
for (const asset of [p.cv, p.portrait, ...data.projects.flatMap(x => [x.image,x.url,x.repository]), ...data.projects.flatMap(x => (x.evidence || []).flatMap(e => [e.image,e.url,e.video,e.poster,e.embedUrl]))].filter(Boolean)) {
  safeUrl(asset);
  if (asset.startsWith('assets/')) await access(path.join(root, asset));
}
const { projectCard, projectPage, catalog, labSection, hero, shell, compactFooter } = createPortfolioViews({ data, esc, safeUrl, icon, tags, socialLinks, external, editorial });
const publicationSection = editorial.publicationSection();

const domainSection = `<section class="domain-section" aria-label="Áreas de especialización"><div class="container domains">
<article id="aerospace" class="domain aerospace"><p class="eyebrow">FOCUS / 01</p><h2>Aerospace</h2><h3>${esc(data.aerospace.intro)}</h3><p>${esc(data.aerospace.text)}</p>${tags(data.aerospace.skills)}<div class="domain-links">${data.projects.filter(p=>(data.aerospace.projectIds || ["chasqui","pachalab"]).includes(p.id)).map(p=>`<a href="projects/${p.id}.html">${esc(p.title)} ${icon("arrow")}</a>`).join("")}${editorial.publications.length?`<a href="#publications">Publicaciones ${icon("arrow")}</a>`:""}</div></article>
<article id="biomedical" class="domain biomedical"><p class="eyebrow">FOCUS / 02</p><h2>Biomedical<br>& Bionics</h2><h3>${esc(data.biomedical.intro)}</h3><p>${esc(data.biomedical.text)}</p>${tags(data.biomedical.skills)}<p class="domain-note">${esc(data.biomedical.note)}</p><div class="domain-links">${data.projects.filter(p=>(data.biomedical.projectIds || ["biomaterials"]).includes(p.id)).map(p=>`<a href="projects/${p.id}.html">${esc(p.title)} ${icon("arrow")}</a>`).join("")}</div></article>
</div></section>`;

const experienceSection = `<section id="experience" class="section container" aria-labelledby="experience-title">
${heading('01','EXPERIENCE','<span id="experience-title">Una trayectoria de construcción</span>','Investigación y desarrollo, docencia e integración industrial.')}
<ol class="timeline">${data.experience.slice(0,4).map(experience).join('')}</ol><details class="earlier-experience"><summary class="more-summary">Experiencia anterior <span>2022–2026 · investigación, docencia e industria</span>${icon('plus')}</summary><ol class="timeline">${data.experience.slice(4).map(experience).join('')}</ol></details>
<div class="leadership-block"><div><p class="eyebrow">IEEE / COMMUNITY</p><h3>Liderazgo y comunidad</h3><p>Representación estudiantil y colaboración en robótica, sistemas aeroespaciales e ingeniería.</p></div><div class="leadership-list">${data.leadership.map(l=>`<article><span class="small-label">${esc(l.period)}</span><h4>${esc(l.institution)}</h4><p class="role">${esc(l.role)}</p><p>${esc(l.text)}</p></article>`).join('')}</div></div>
</section>`;

const teachingSection = `<section id="teaching" class="section muted-section" aria-labelledby="teaching-title"><div class="container">
${heading('02','TEACHING','<span id="teaching-title">Compartir lo que construyo</span>','Docencia, asesoría y acompañamiento de proyectos tecnológicos.')}
<div class="teaching-grid">${data.teaching.map((t,i)=>`<article class="teaching-card"><span class="teaching-number">0${i+1}</span><p class="small-label">${esc(t.institution)}</p><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p><p class="period">${esc(t.period)}</p></article>`).join('')}</div>
</div></section>`;

const educationSection = `<section id="education" class="section container" aria-labelledby="education-title">
${heading('03','EDUCATION','<span id="education-title">Formación académica</span>','Ingeniería y gestión: una perspectiva complementaria para el desarrollo tecnológico.')}
<div class="education-grid">${data.education.map(e=>`<article class="education-card"><div class="education-top"><span class="education-monogram">${esc(e.short)}</span><span class="status-tag">${esc(e.status)}</span></div><h3>${esc(e.degree)}</h3><p class="institution">${esc(e.institution)}</p><p>${esc(e.detail)}</p><p class="period">${esc(e.period)}</p></article>`).join('')}</div>
<details class="training" open><summary>Formación complementaria ${icon('plus')}</summary><div class="training-list">${data.training.map(t=>`<article><div><p class="small-label">${esc(t.institution)}</p><h4>${esc(t.title)}</h4></div><span>${esc(t.period)}</span></article>`).join('')}</div></details><a class="text-link certificates" href="${safeUrl(p.certificatesUrl)}" ${external}>Consultar certificados ${icon('arrow')}</a>
</section>`;

const skillsSection = `<section id="skills" class="section muted-section" aria-labelledby="skills-title"><div class="container">
${heading('04','SKILLS','<span id="skills-title">Herramientas para llevar ideas a prototipos</span>')}
<div class="skills-grid">${data.skills.map(s=>`<article><h3>${esc(s.title)}</h3>${tags(s.items)}</article>`).join('')}</div>
</div></section>`;

const contactSection = `<section id="contact" class="contact-section" aria-labelledby="contact-title"><div class="container"><div class="contact-top"><div><p class="eyebrow">CONTACT</p><h2 id="contact-title">Conectemos ideas.<br><span>Construyamos posibilidades.</span></h2></div><span class="contact-location">${icon('pin')}${esc(p.location)}</span></div><a class="contact-email" href="mailto:${esc(p.email)}">${esc(p.email)} ${icon('arrow')}</a>${socialLinks('footer-social')}<p class="secondary-email">También en <a href="mailto:${esc(p.secondaryEmail)}">${esc(p.secondaryEmail)}</a></p><footer class="site-footer"><span>© ${data.meta.updated.slice(0,4)} ${esc(p.shortName)}</span><span>Research & Engineering Portfolio</span><a href="index.html#bio">Volver al inicio ↑</a></footer></div></section>`;

const researchSection = `<section id="research" class="section container" aria-labelledby="research-title">${heading('04','RESEARCH','<span id="research-title">Áreas que conectan mi trabajo</span>','Investigación, desarrollo y aprendizaje a través de proyectos.')}
<div class="research-grid">${data.research.map((r,i)=>`<a class="research-card" href="${r.anchor === 'skills' ? 'cv.html#skills' : r.anchor.startsWith('project-') ? 'projects/'+r.anchor.slice(8)+'.html' : '#'+esc(r.anchor)}"><div class="research-card-top"><span class="research-number">0${i+1}</span>${icon('arrow')}</div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p>${tags(r.tags)}</a>`).join('')}</div></section>`;
const selected = `<section id="projects" class="section container selected-projects" aria-labelledby="projects-title">${heading('01','SELECTED WORK','<span id="projects-title">Proyectos en foco</span>','Mi contribución, el contexto y las evidencias de cada trabajo, en una ficha propia.')}<div class="projects-grid">${data.projects.filter(p=>p.featured).map(projectCard).join('')}</div><div class="section-actions"><a class="button primary" href="projects.html">Explorar todo el portafolio ${icon('arrow')}</a><span class="media-note">Ilustraciones conceptuales hasta incorporar las fotografías reales.</span></div></section>`;
const cvTeaser = `<section id="cv" class="cv-section container"><div><p class="eyebrow">TRAYECTORIA</p><h2>La experiencia detrás de los proyectos.</h2><p>Experiencia, docencia, formación, habilidades y CV actualizado.</p></div><a class="button" href="cv.html">Ver trayectoria y CV ${icon('arrow')}</a></section>`;
const cvIntro = `<section class="container page-intro cv-intro" id="bio"><p class="eyebrow">TRAYECTORIA / CV</p><h1>Formación y experiencia</h1><p>${esc(p.bio)}</p><div class="section-actions"><a class="button primary" href="${safeUrl(p.cv)}" download>Descargar CV actualizado ${icon('download')}</a><a class="text-link" href="projects.html">Explorar proyectos ${icon('arrow')}</a></div><nav class="cv-index" aria-label="Secciones del CV"><a href="#experience">Experiencia</a><a href="#teaching">Docencia</a><a href="#education">Educación</a><a href="#skills">Habilidades</a></nav></section>`;
// Generated pages live only in .site; the repository stores public source.
const out = path.join(root,'.site');
if(path.dirname(out)!==root || path.basename(out)!=='.site') throw Error('Invalid output');
try { if(await realpath(out)!==out) throw Error('Output must not be a link'); } catch(e) { if(e.code!=='ENOENT') throw e; }
await rm(out,{recursive:true,force:true});
await mkdir(path.join(out,'projects'), { recursive: true });
const pages = new Map([
  ['index.html', shell(data.meta.title, hero()+(data.meta.sectionOrder || ["projects","lab","publications","research","domains","posts","cv","contact"]).map(key=>({projects:selected,lab:labSection(),publications:publicationSection,research:researchSection,domains:domainSection,posts:editorial.postsSection(),cv:cvTeaser,contact:contactSection})[key]||"").join(""))],
  ['projects.html', shell(`Proyectos | ${p.shortName}`, catalog()+compactFooter(), 'projects.html')],
  ['cv.html', shell(`Trayectoria y CV | ${p.shortName}`, cvIntro+experienceSection+teachingSection+educationSection+skillsSection+compactFooter(), 'cv.html')]
]);
for (const item of data.projects) {
  const route = `projects/${item.id}.html`;
  pages.set(route, shell(`${item.title} | ${p.shortName}`, projectPage(item)+compactFooter(), route, item.description));
}
await mkdir(path.join(out,'posts'), {recursive:true});
pages.set('posts.html',shell('Bitácora | '+p.shortName,'<section class="container page-intro"><p class="eyebrow">BITÁCORA</p><h1>Notas y avances</h1></section><div class="container projects-grid">'+(data.posts||[]).map(editorial.postCard).join('')+'</div>'+compactFooter(),'posts.html'));
for(const post of data.posts||[]) pages.set('posts/'+post.id+'.html',shell(post.title+' | '+p.shortName,editorial.postPage(post)+compactFooter(),'posts/'+post.id+'.html',post.summary));
for (const [file, content] of pages) await writeFile(path.join(out,file), content);
await cp(path.join(root,'.nojekyll'),path.join(out,'.nojekyll'));
// Copy only reviewed public resources; unrelated tracked assets stay in Git.
const publicAssets=new Set(['assets/app.js','assets/theme.js','assets/favicon.svg','assets/styles.css','assets/identity.css','assets/portfolio.css']);
const collectAssets=value=>{if(typeof value==='string'&&value.startsWith('assets/'))publicAssets.add(value);else if(Array.isArray(value))value.forEach(collectAssets);else if(value&&typeof value==='object')Object.values(value).forEach(collectAssets);};
collectAssets(data);
for(const asset of publicAssets){safeUrl(asset);const dest=path.resolve(out,asset);if(!dest.startsWith(out+path.sep))throw Error('Invalid asset path');await mkdir(path.dirname(dest),{recursive:true});await cp(path.join(root,asset),dest);}
await mkdir(path.join(out,'assets/documents'),{recursive:true});
for(const pub of editorial.publications) await writeFile(path.join(out,editorial.bibPath(pub)),editorial.bib(pub));
await finalize(out,data);
console.log('Portfolio generado: '+pages.size+' páginas.');
