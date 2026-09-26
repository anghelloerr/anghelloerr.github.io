import { readFile, writeFile, mkdir, cp, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
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
function evidenceGallery(items = []) {
  if (!items.length) return '';
  return `<div class="evidence-gallery"><h4>Evidencias y avances</h4>${items.map(e => `<figure class="evidence-item">${e.image ? `<a href="${safeUrl(e.image)}" ${external} aria-label="Ver imagen: ${esc(e.title)}"><img src="${safeUrl(e.image)}" alt="${esc(e.alt || e.title)}" loading="lazy"></a>` : ''}<figcaption>${e.date ? `<span class="evidence-date">${esc(e.date)}</span>` : ''}<h5>${esc(e.title)}</h5>${e.description ? `<p>${esc(e.description)}</p>` : ''}${e.url ? `<a class="text-link" href="${safeUrl(e.url)}" ${external}>${esc(e.linkLabel || 'Ver evidencia')} ${icon('arrow')}</a>` : ''}</figcaption></figure>`).join('')}</div>`;
}
function projectCard(p) {
  return `<article class="project-card" id="project-${esc(p.id)}">
    <div class="project-media ${p.image ? 'has-image' : ''}">${p.image ? `<img src="${safeUrl(p.image)}" alt="${esc(p.imageAlt || p.title)}" loading="lazy" width="720" height="400">` : `<span class="project-code">${esc(p.code)}</span><span class="media-placeholder">${icon('plus')} Imagen del proyecto pendiente</span>`}</div>
    <div class="project-body"><p class="small-label">${esc(p.institution)}</p><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${tags(p.tags)}
    <details class="project-details"><summary>${p.evidence?.length ? 'Contribución y evidencias' : 'Ver contribución'} <span aria-hidden="true">+</span></summary><div class="details-content"><p class="small-label">${esc(p.period)}</p><h4>Mi contribución</h4><p>${esc(p.contribution)}</p>${p.result ? `<h4>Resultado documentado</h4><p>${esc(p.result)}</p>` : '<p class="pending">Resultados públicos: por completar.</p>'}${evidenceGallery(p.evidence)}<div class="project-links">${p.url ? `<a href="${safeUrl(p.url)}" ${external}>Documentación ${icon('arrow')}</a>` : '<span>Documentación: pendiente</span>'}${p.repository ? `<a href="${safeUrl(p.repository)}" ${external}>Repositorio ${icon('arrow')}</a>` : '<span>Repositorio: pendiente</span>'}</div></div></details></div>
  </article>`;
}
function experience(e) {
  return `<li class="timeline-item" id="exp-${esc(e.id)}"><div class="timeline-date"><span>${esc(e.period)}</span>${e.current ? '<span class="current-label">En el CV actual</span>' : ''}</div><div class="timeline-body"><p class="small-label">${esc(e.location)}</p><h3>${esc(e.institution)}</h3><p class="role">${esc(e.role)}</p><p>${esc(e.text)}</p></div></li>`;
}
const p = data.profile;
const pub = data.publication;
const bibtex = `@article{barreto2026phytog,\n  author = {Barreto, Ricardo and Cornejo, Jose and Vargas, Mariela and Gastello, Nicolas and Rodriguez, Anghello},\n  title = {${pub.title}},\n  journal = {${pub.journal}},\n  year = {${pub.year}},\n  volume = {${pub.volume}},\n  number = {${pub.issue}},\n  pages = {${pub.article}},\n  doi = {${pub.doi}},\n  url = {${pub.url}}\n}\n`;

for (const asset of [p.cv, p.portrait, ...data.projects.map(x => x.image), ...data.projects.flatMap(x => (x.evidence || []).flatMap(e => [e.image, e.url]))].filter(Boolean)) {
  safeUrl(asset);
  if (asset.startsWith('assets/')) await access(path.join(root, asset));
}
const nav = [['bio','Bio'],['research','Research'],['publications','Publicaciones'],['projects','Proyectos'],['experience','Experiencia'],['contact','Contacto']];
const secondaryNav = [['aerospace','Aerospace'],['biomedical','Biomedical & Bionics'],['teaching','Docencia'],['education','Educación'],['skills','Skills'],['cv','CV descargable']];

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(data.meta.title)}</title>
  <meta name="description" content="${esc(data.meta.description)}">
  <meta name="author" content="${esc(p.name)}">
  <meta name="theme-color" content="#0a1727">
  <meta name="color-scheme" content="light dark">
  ${data.meta.siteUrl ? `<link rel="canonical" href="${safeUrl(data.meta.siteUrl)}">` : ''}
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <script src="assets/theme.js"></script>
  <link rel="stylesheet" href="assets/styles.css">
  <link rel="stylesheet" href="assets/identity.css">
  <script src="assets/app.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Saltar al contenido</a>
<header class="site-header">
  <div class="header-inner"><a class="brand" href="#bio" aria-label="Anghello Rodríguez, inicio"><span class="brand-mark">AR<span>.</span></span><span class="brand-name">Anghello Rodríguez</span></a>
  <nav class="desktop-nav" aria-label="Navegación principal">${nav.map(([id,label])=>`<a href="#${id}">${label}</a>`).join('')}</nav>
  <div class="header-actions"><button class="theme-toggle icon-button" type="button" aria-label="Activar modo oscuro" aria-pressed="false" hidden>${icon('moon','moon-icon')}${icon('sun','sun-icon')}</button><button class="menu-toggle icon-button" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-nav" hidden>${icon('menu')}</button><a href="${safeUrl(p.cv)}" class="header-cv" download>CV ${icon('download')}</a></div></div>
  <nav id="mobile-nav" class="mobile-nav" aria-label="Menú móvil">${[...nav,...secondaryNav].map(([id,label])=>`<a href="#${id}">${label}</a>`).join('')}</nav>
</header>
<main id="main">
<section id="bio" class="academic-hero container" aria-labelledby="hero-title">
  <div class="academic-profile">
    ${p.portrait ? `<img class="academic-portrait" src="${safeUrl(p.portrait)}" alt="${esc(p.portraitAlt)}" width="1122" height="1402" fetchpriority="high">` : '<div class="academic-portrait academic-placeholder" aria-label="Fotografía profesional pendiente">AR<span>Foto pendiente</span></div>'}
    <h1 id="hero-title">${esc(p.shortName)}</h1>
    <p class="academic-field">Ingeniería Mecatrónica</p><p class="academic-universities">${data.education.map(e=>esc(e.short)).join(' · ')}</p><p class="academic-location">${esc(p.location)}</p>
    ${socialLinks('profile-social')}
  </div>
  <div class="academic-about"><h2>Sobre mí</h2><p>${esc(p.intro)}</p><p>${esc(p.bio)}</p>
    <p class="academic-affiliations"><span>Actualmente en</span> ${p.current.map(c=>`<a href="#${esc(c.anchor)}">${esc(c.institution)}</a>`).join(' · ')}.</p>
    <div class="academic-actions"><a class="button primary" href="${safeUrl(p.cv)}" download>${icon('download')} Descargar CV</a><a class="text-link" href="#projects">Ver proyectos ${icon('arrow')}</a></div>
    <div class="academic-overview">
      <div class="academic-interests"><h3>Intereses de investigación</h3><ul>${data.research.map(r=>`<li><a href="#${esc(r.anchor)}">${esc(r.title)}</a></li>`).join('')}</ul></div>
      <div class="academic-education"><h3>Formación</h3><ul>${data.education.map(e=>`<li><strong>${esc(e.degree)}</strong><span>${esc(e.institution)}</span><small>${esc(e.status)} · ${esc(e.period)}</small></li>`).join('')}</ul><a class="text-link" href="#education">Ver formación completa ${icon('arrow')}</a></div>
    </div>
  </div>
</section>
<div class="section-index"><nav class="container" aria-label="Áreas y formación">${secondaryNav.map(([id,label])=>`<a href="#${id}">${label} <span aria-hidden="true">↗</span></a>`).join('')}</nav></div>

<section id="research" class="section container" aria-labelledby="research-title">
${heading('01','RESEARCH','<span id="research-title">Líneas de investigación</span>','Control, robótica y fabricación como base para explorar sistemas espaciales y bioinspirados.')}
<div class="research-grid">${data.research.map((r,i)=>`<a class="research-card" href="#${esc(r.anchor)}"><div class="research-card-top"><span class="research-number">0${i+1}</span>${icon('arrow')}</div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p>${tags(r.tags)}</a>`).join('')}</div>
</section>

<section id="publications" class="section publication-section" aria-labelledby="publications-title"><div class="container">
${heading('02','PUBLICATIONS','<span id="publications-title">Investigación publicada</span>')}
<article class="publication-card"><div class="publication-meta"><span class="publication-type">JOURNAL ARTICLE</span><p class="journal-name">Biomimetics<span>MDPI · ${pub.year}</span></p><p class="publication-volume">Vol. ${esc(pub.volume)} · N.º ${esc(pub.issue)}<br>Artículo ${esc(pub.article)}</p><p class="publication-date">${esc(pub.date)}</p><div class="publication-mark" aria-hidden="true">Phyto<span>-G</span></div></div>
<div class="publication-content"><p class="small-label">AGRICULTURA ESPACIAL / MICROGRAVEDAD</p><h3>${esc(pub.title)}</h3><p class="authors">${pub.authors.map(a=>a==='Anghello Rodriguez'?`<strong>${esc(a)}</strong>`:esc(a)).join(' · ')}</p><p>${esc(pub.summary)}</p>${tags(pub.tags)}<details class="publication-details"><summary>Mi contribución en BETTA Tech</summary><p>${esc(pub.contribution)}</p></details><p class="doi">DOI: <a href="${safeUrl(pub.url)}" ${external}>${esc(pub.doi)}</a></p><div class="publication-actions"><a class="button primary" href="${safeUrl(pub.url)}" ${external}>Leer artículo ${icon('arrow')}</a><a class="text-link" href="assets/documents/phyto-g.bib" download>Descargar BibTeX ${icon('download')}</a></div></div></article>
</div></section>

<section id="projects" class="section container" aria-labelledby="projects-title">
${heading('03','SELECTED WORK','<span id="projects-title">Proyectos e investigación aplicada</span>','Contribuciones en equipos de investigación, entornos académicos e industria.')}
<div class="projects-grid">${data.projects.slice(0,6).map(projectCard).join('')}</div>
<details class="more-projects"><summary class="more-summary">Más proyectos <span>Visión, robótica de servicio y diseño mecánico</span>${icon('plus')}</summary><div class="projects-grid">${data.projects.slice(6).map(projectCard).join('')}</div></details>
</section>

<section class="domain-section" aria-label="Áreas de especialización"><div class="container domains">
<article id="aerospace" class="domain aerospace"><p class="eyebrow">FOCUS / 01</p><h2>Aerospace</h2><h3>${esc(data.aerospace.intro)}</h3><p>${esc(data.aerospace.text)}</p>${tags(data.aerospace.skills)}<div class="domain-links"><a href="#project-chasqui">Chasqui 2 ${icon('arrow')}</a><a href="#project-pachalab">PachaLab ${icon('arrow')}</a><a href="#publications">Phyto-G ${icon('arrow')}</a></div></article>
<article id="biomedical" class="domain biomedical"><p class="eyebrow">FOCUS / 02</p><h2>Biomedical<br>& Bionics</h2><h3>${esc(data.biomedical.intro)}</h3><p>${esc(data.biomedical.text)}</p>${tags(data.biomedical.skills)}<p class="domain-note">${esc(data.biomedical.note)}</p><div class="domain-links"><a href="#project-biomaterials">Impresión 3D con biomateriales ${icon('arrow')}</a></div></article>
</div></section>

<section id="experience" class="section container" aria-labelledby="experience-title">
${heading('04','EXPERIENCE','<span id="experience-title">Una trayectoria de construcción</span>','Investigación y desarrollo, docencia e integración industrial.')}
<ol class="timeline">${data.experience.slice(0,4).map(experience).join('')}</ol><details class="earlier-experience"><summary class="more-summary">Experiencia anterior <span>2022–2026 · investigación, docencia e industria</span>${icon('plus')}</summary><ol class="timeline">${data.experience.slice(4).map(experience).join('')}</ol></details>
<div class="leadership-block"><div><p class="eyebrow">IEEE / COMMUNITY</p><h3>Liderazgo y comunidad</h3><p>Representación estudiantil y colaboración en robótica, sistemas aeroespaciales e ingeniería.</p></div><div class="leadership-list">${data.leadership.map(l=>`<article><span class="small-label">${esc(l.period)}</span><h4>${esc(l.institution)}</h4><p class="role">${esc(l.role)}</p><p>${esc(l.text)}</p></article>`).join('')}</div></div>
</section>

<section id="teaching" class="section muted-section" aria-labelledby="teaching-title"><div class="container">
${heading('05','TEACHING','<span id="teaching-title">Compartir lo que construyo</span>','Docencia, asesoría y acompañamiento de proyectos tecnológicos.')}
<div class="teaching-grid">${data.teaching.map((t,i)=>`<article class="teaching-card"><span class="teaching-number">0${i+1}</span><p class="small-label">${esc(t.institution)}</p><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p><p class="period">${esc(t.period)}</p></article>`).join('')}</div>
</div></section>

<section id="education" class="section container" aria-labelledby="education-title">
${heading('06','EDUCATION','<span id="education-title">Formación académica</span>','Ingeniería y gestión: una perspectiva complementaria para el desarrollo tecnológico.')}
<div class="education-grid">${data.education.map(e=>`<article class="education-card"><div class="education-top"><span class="education-monogram">${esc(e.short)}</span><span class="status-tag">${esc(e.status)}</span></div><h3>${esc(e.degree)}</h3><p class="institution">${esc(e.institution)}</p><p>${esc(e.detail)}</p><p class="period">${esc(e.period)}</p></article>`).join('')}</div>
<details class="training" open><summary>Formación complementaria ${icon('plus')}</summary><div class="training-list">${data.training.map(t=>`<article><div><p class="small-label">${esc(t.institution)}</p><h4>${esc(t.title)}</h4></div><span>${esc(t.period)}</span></article>`).join('')}</div></details><a class="text-link certificates" href="${safeUrl(p.certificatesUrl)}" ${external}>Consultar certificados ${icon('arrow')}</a>
</section>

<section id="skills" class="section muted-section" aria-labelledby="skills-title"><div class="container">
${heading('07','SKILLS','<span id="skills-title">Herramientas para llevar ideas a prototipos</span>')}
<div class="skills-grid">${data.skills.map(s=>`<article><h3>${esc(s.title)}</h3>${tags(s.items)}</article>`).join('')}</div>
</div></section>

<section id="cv" class="cv-section container" aria-labelledby="cv-title"><div><p class="eyebrow">CURRICULUM VITAE</p><h2 id="cv-title">La trayectoria completa.</h2><p>Experiencia, educación y competencias en un solo documento.</p></div><a class="button primary" href="${safeUrl(p.cv)}" download>Descargar CV · PDF ${icon('download')}</a></section>

<section id="contact" class="contact-section" aria-labelledby="contact-title"><div class="container"><div class="contact-top"><div><p class="eyebrow">CONTACT</p><h2 id="contact-title">Conectemos ideas.<br><span>Construyamos posibilidades.</span></h2></div><span class="contact-location">${icon('pin')}${esc(p.location)}</span></div><a class="contact-email" href="mailto:${esc(p.email)}">${esc(p.email)} ${icon('arrow')}</a>${socialLinks('footer-social')}<p class="secondary-email">También en <a href="mailto:${esc(p.secondaryEmail)}">${esc(p.secondaryEmail)}</a></p><footer class="site-footer"><span>© ${data.meta.updated.slice(0,4)} ${esc(p.shortName)}</span><span>Research & Engineering Portfolio</span><a href="#bio">Volver al inicio ↑</a></footer></div></section>
</main>
</body>
</html>`;
await writeFile(path.join(root, 'index.html'), html);
await writeFile(path.join(root, 'assets/documents/phyto-g.bib'), bibtex);

// Only the public site goes into the Pages artifact; source and documentation stay in the repository.
if (process.argv.includes('--publish')) {
  const out = path.join(root, '.site');
  await mkdir(out, { recursive: true });
  for (const file of ['index.html', '.nojekyll']) await cp(path.join(root,file), path.join(out,file));
  await cp(path.join(root,'assets'), path.join(out,'assets'), { recursive: true });
}
console.log(`Portfolio generado: ${data.projects.length} proyectos, ${data.experience.length} experiencias, 1 publicación. Sin dependencias externas.`);
