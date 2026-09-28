// Portfolio views share the established palette, typography and academic profile.
export function createPortfolioViews({ data, esc, safeUrl, icon, tags, socialLinks, external }) {
  const p = data.profile;
  const projectPath = item => `projects/${item.id}.html`;
  const diagrams = {
    space: '<ellipse cx="180" cy="94" rx="126" ry="48" transform="rotate(-20 180 94)"/><circle cx="180" cy="94" r="62"/><path d="m154 70 52 0 0 48-52 0zM98 78h56m52 0h56M98 106h56m52 0h56M98 65v54m164-54v54M181 48V26"/><circle cx="283" cy="65" r="6"/>',
    biomaterials: '<path d="M98 149V40h164v109M83 149h194M98 55h164M155 55v42h50V55M164 97l16 24 16-24M180 121v12M135 143h90m-79-8h69m-58-8h48"/><path d="M242 22c-22-1-30 13-30 24 18 3 31-6 30-24Zm-27 21 19-15"/>',
    robotics: '<path d="M101 142h151M125 142l19-41 41-11 22-41 31 17M144 101l-26-31 41-32M207 49l-22-20M238 66l12-9m-12 9 1 15M91 159h178"/><circle cx="144" cy="101" r="11"/><circle cx="185" cy="90" r="9"/><circle cx="207" cy="49" r="8"/><path d="M78 86h21m-10-10v20M277 103h21m-10-10v20"/>',
    vision: '<rect x="88" y="37" width="184" height="115" rx="7"/><path d="M115 61h20m-20 0v20M245 61h-20m20 0v20M115 128h20m-20 0v-20M245 128h-20m20 0v-20"/><rect x="145" y="71" width="68" height="49" rx="2"/><circle cx="179" cy="95" r="13"/><path d="M272 95h36m-256 0h36M156 166h47"/>',
    manufacturing: '<path d="m180 27 91 44-91 45-91-45zM89 93l91 45 91-45M89 115l91 45 91-45M180 116v44"/><path d="M56 54v83m-9-83h18m-18 83h18M299 52v87m-9-87h18m-18 87h18"/>',
    phytog: '<circle cx="180" cy="94" r="69"/><ellipse cx="180" cy="94" rx="39" ry="69" transform="rotate(32 180 94)"/><path d="M180 138V85m0 21c-27 1-38-16-37-31 23-1 38 12 37 31Zm0-15c24-1 38-17 37-35-25 1-37 13-37 35ZM148 146h64M137 163h87"/>'
  };
  function cover(item, large = false) {
    if (item.image) return `<figure class="project-cover real-cover ${large ? 'large-cover' : ''}"><img src="${safeUrl(item.image)}" alt="${esc(item.imageAlt || item.title)}" ${large ? '' : 'loading="lazy"'} width="720" height="400">${large ? `<figcaption>${esc(item.imageAlt || item.title)}</figcaption>` : ''}</figure>`;
    return `<figure class="project-cover concept-cover ${large ? 'large-cover' : ''}"><span class="cover-category">${esc(item.category)}</span><svg viewBox="0 0 360 188" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${diagrams[item.cover] || diagrams.robotics}</svg><figcaption>Ilustración conceptual · ${large ? 'no es una fotografía del proyecto' : 'foto pendiente'}</figcaption></figure>`;
  }
  function projectCard(item) {
    return `<article class="project-card portfolio-card" id="project-${esc(item.id)}" data-category="${esc(item.category)}">
    <a class="cover-link" href="${projectPath(item)}" aria-label="Ver proyecto: ${esc(item.title)}">${cover(item)}</a>
    <div class="project-body"><p class="small-label">${esc(item.institution)}</p><h3><a href="${projectPath(item)}">${esc(item.title)}</a></h3><p>${esc(item.description)}</p>${tags(item.tags)}<div class="project-card-footer"><span>${esc(item.kind)}</span><a class="text-link" href="${projectPath(item)}">Ver ficha ${icon('arrow')}</a></div></div></article>`;
  }
  function videoEmbed(url) {
    if (!url) return '';
    safeUrl(url);
    const u = new URL(url);
    let id = '';
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
    if (['www.youtube.com','youtube.com','www.youtube-nocookie.com'].includes(u.hostname)) id = u.searchParams.get('v') || u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1] || '';
    if (/^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(u.hostname)) {
      const match = u.pathname.match(/^\/(?:video\/)?(\d+)$/);
      if (match) return `https://player.vimeo.com/video/${match[1]}?dnt=1`;
    }
    throw new Error(`Video no admitido para incrustar: ${url}. Usa YouTube/Vimeo o un enlace en url.`);
  }
  function evidenceGallery(items = []) {
    if (!items.length) return `<div class="evidence-empty"><span class="evidence-empty-icon">${icon('plus')}</span><div><h3>Registro visual por incorporar</h3><p>Las fotografías, videos y documentos de este trabajo aún no están publicados. La descripción recoge mi participación según el CV; la portada es una ilustración conceptual.</p></div></div>`;
    return `<div class="project-evidence-grid">${items.map(e => {
      const embed = e.embedUrl ? videoEmbed(e.embedUrl) : '';
      return `<figure class="evidence-item">${e.image ? `<a href="${safeUrl(e.image)}" ${external} aria-label="Ampliar: ${esc(e.title)}"><img src="${safeUrl(e.image)}" alt="${esc(e.alt || e.title)}" loading="lazy"></a>` : ''}${e.video ? `<video controls playsinline preload="metadata" ${e.poster ? `poster="${safeUrl(e.poster)}"` : ''} aria-label="${esc(e.title)}"><source src="${safeUrl(e.video)}" type="${e.video.endsWith('.webm') ? 'video/webm' : 'video/mp4'}">Tu navegador no reproduce este video. <a href="${safeUrl(e.video)}">Descargar video</a></video>` : ''}${embed ? `<div class="video-consent" data-video-src="${esc(embed)}" data-video-title="${esc(e.title)}"><p>Video en ${embed.includes('vimeo') ? 'Vimeo' : 'YouTube'}</p><button class="button" type="button" data-load-video>Cargar video ${icon('arrow')}</button><small>Se conecta al servicio de video al reproducirlo.</small><a class="text-link" href="${safeUrl(e.embedUrl)}" ${external}>Abrir en su plataforma</a></div>` : ''}<figcaption>${e.date ? `<span class="evidence-date">${esc(e.date)}</span>` : ''}<h3>${esc(e.title)}</h3>${e.description ? `<p>${esc(e.description)}</p>` : ''}${e.url ? `<a class="text-link" href="${safeUrl(e.url)}" ${external}>${esc(e.linkLabel || 'Ver evidencia')} ${icon('arrow')}</a>` : ''}</figcaption></figure>`;
    }).join('')}</div>`;
  }
  const nav = [['index.html#bio','Inicio'],['projects.html','Proyectos'],['index.html#publications','Publicaciones'],['index.html#research','Research'],['cv.html','Trayectoria / CV'],['index.html#contact','Contacto']];
  function shell(title, content, route = 'index.html', description = data.meta.description) {
    const prefix = route.startsWith('projects/') ? '../' : '';
    const active = route === 'cv.html' ? 'cv.html' : route !== 'index.html' ? 'projects.html' : '';
    const navLinks = nav.map(([href,label]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    const canonical = data.meta.siteUrl ? `${data.meta.siteUrl.replace(/\/$/,'')}/${route === 'index.html' ? '' : route}` : '';
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="author" content="${esc(p.name)}"><meta name="theme-color" content="#0a1727"><meta name="color-scheme" content="light dark">${canonical ? `<link rel="canonical" href="${safeUrl(canonical)}">` : ''}<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><script src="assets/theme.js"></script><link rel="stylesheet" href="assets/styles.css"><link rel="stylesheet" href="assets/identity.css"><link rel="stylesheet" href="assets/portfolio.css"><script src="assets/app.js" defer></script></head><body data-page="${route === 'index.html' ? 'home' : 'inner'}"><a class="skip-link" href="#main">Saltar al contenido</a><header class="site-header"><div class="header-inner"><a class="brand" href="index.html#bio" aria-label="Anghello Rodríguez, inicio"><span class="brand-name">Anghello Rodríguez</span></a><nav class="desktop-nav" aria-label="Navegación principal">${navLinks}</nav><div class="header-actions"><button class="theme-toggle icon-button" type="button" aria-label="Activar modo oscuro" aria-pressed="false" hidden>${icon('moon','moon-icon')}${icon('sun','sun-icon')}</button><button class="menu-toggle icon-button" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-nav" hidden>${icon('menu')}</button><a class="header-cv" href="${safeUrl(p.cv)}" download>PDF ${icon('download')}</a></div></div><nav class="mobile-nav" id="mobile-nav" aria-label="Menú móvil">${navLinks}</nav></header><main id="main">${content}</main></body></html>`
      .replace(/(href|src|poster)="((?:assets\/|projects\/|index\.html|projects\.html|cv\.html)[^"]*)"/g, (_, attr, url) => `${attr}="${prefix}${url}"`);
  }
  function hero() {
    return `<section id="bio" class="academic-hero portfolio-hero container" aria-labelledby="hero-title"><div class="academic-profile"><img class="academic-portrait" src="${safeUrl(p.portrait)}" alt="${esc(p.portraitAlt)}" width="1122" height="1402" fetchpriority="high"><h1 id="hero-title">${esc(p.shortName)}</h1><p class="academic-field">Ingeniería Mecatrónica</p><p class="academic-universities">USIL · SIU</p><p class="academic-location">${esc(p.location)}</p>${socialLinks('profile-social')}</div><div class="academic-about"><p class="eyebrow">RESEARCH & ENGINEERING PORTFOLIO</p><h2>Investigar. Diseñar. Construir.</h2><p>${esc(p.intro)}</p><p>Este portafolio reúne mis contribuciones en investigación, desarrollo de prototipos y robótica aplicada.</p><p class="academic-affiliations"><span>Actualmente en</span> ${p.current.map(c=>`<a href="cv.html#${esc(c.anchor)}">${esc(c.institution)}</a>`).join(' · ')}.</p><div class="academic-actions"><a class="button primary" href="#projects">Explorar proyectos ${icon('arrow')}</a><a class="text-link" href="cv.html">Mi trayectoria y CV ${icon('arrow')}</a></div><div class="hero-focus">${data.research.map(r=>`<a href="#research">${esc(r.title)}</a>`).join('')}</div></div></section>`;
  }
  function labSection() {
    const e = data.experience.find(e=>e.id==='esan');
    return `<section class="section muted-section" id="esan" aria-labelledby="esan-title"><div class="container"><div class="section-heading"><div><p class="eyebrow">ACTUALMENTE / I+D</p><h2 id="esan-title">Del laboratorio al prototipo.</h2></div><p class="section-description">ESAN – R&D Labs / FabLab<br>Practicante en Investigación y Desarrollo<br>${esc(e.period)}</p></div><div class="lab-grid">${e.highlights.map((h,i)=>`<article><span class="lab-number">0${i+1}</span><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></article>`).join('')}</div><div class="section-actions"><a class="button" href="projects.html#esan">Explorar trabajos en ESAN ${icon('arrow')}</a><a class="text-link" href="cv.html#exp-esan">Ver experiencia completa ${icon('arrow')}</a></div></div></section>`;
  }
  function catalog() {
    const categories = [...new Set(data.projects.map(x=>x.category))];
    const filters = [['all','Todos'],...categories.map(c=>[c,c]),['esan','ESAN / FabLab']];
    return `<section class="container page-intro"><p class="eyebrow">PORTAFOLIO</p><h1>Proyectos y trabajo aplicado</h1><p>Investigación, prototipos y actividades experimentales. Cada ficha reúne el contexto, mi contribución y el material disponible.</p><p class="media-note">Las portadas esquemáticas son ilustraciones conceptuales. Las fotografías y los videos reales se incorporarán en las galerías de cada trabajo.</p></section><section id="esan" class="container catalog-section" aria-label="Catálogo de proyectos"><div class="project-filters" role="group" aria-label="Filtrar proyectos" hidden>${filters.map(([id,label])=>`<button type="button" data-filter="${esc(id)}" aria-pressed="${id==='all'}">${esc(label)}</button>`).join('')}</div><p class="filter-status" role="status" aria-live="polite"></p><div class="projects-grid catalog-grid">${data.projects.map(projectCard).join('')}</div></section>`;
  }
  function projectPage(item) {
    const related = data.projects.filter(x=>x.id!==item.id && (x.experienceId === item.experienceId || x.category === item.category)).slice(0,3);
    const photos = item.evidence.filter(e=>e.image).length;
    const videos = item.evidence.filter(e=>e.video||e.embedUrl).length;
    return `<section class="container page-intro project-intro"><nav class="breadcrumbs" aria-label="Ubicación"><a href="index.html">Inicio</a><span>/</span><a href="projects.html">Proyectos</a><span>/</span><span>${esc(item.category)}</span></nav><p class="eyebrow">${esc(item.kind)} / ${esc(item.category)}</p><h1>${esc(item.title)}</h1><p>${esc(item.description)}</p><div class="project-meta"><span>${esc(item.institution)}</span><span>${esc(item.period)}</span></div></section><div class="container project-layout"><div class="project-main-media">${cover(item,true)}</div><aside class="project-context"><h2>Mi contribución</h2><p>${esc(item.contribution)}</p>${tags(item.tags)}${item.result ? `<h3>Resultado recogido en el CV</h3><p>${esc(item.result)}</p>` : ''}<a class="text-link" href="cv.html#exp-${esc(item.experienceId)}">Ver experiencia relacionada ${icon('arrow')}</a></aside></div><section class="section container project-evidence" id="evidence" aria-labelledby="evidence-title"><div class="section-heading"><div><p class="eyebrow">REGISTRO DEL TRABAJO</p><h2 id="evidence-title">Evidencias y avances</h2></div><p class="section-description">${photos || videos ? `${photos} fotografías · ${videos} videos` : item.evidence.length ? 'Documentación disponible' : 'Material visual pendiente'}</p></div>${evidenceGallery(item.evidence)}${item.url || item.repository ? `<div class="project-resource-links">${item.url ? `<a class="text-link" href="${safeUrl(item.url)}" ${external}>Documentación del proyecto ${icon('arrow')}</a>` : ''}${item.repository ? `<a class="text-link" href="${safeUrl(item.repository)}" ${external}>Repositorio ${icon('arrow')}</a>` : ''}</div>` : ''}<p class="source-note">Fuente de la descripción: ${esc(item.source)}</p></section>${related.length ? `<section class="section muted-section"><div class="container"><div class="section-heading"><div><p class="eyebrow">SEGUIR EXPLORANDO</p><h2>Trabajo relacionado</h2></div><a class="text-link" href="projects.html">Todos los proyectos ${icon('arrow')}</a></div><div class="projects-grid">${related.map(projectCard).join('')}</div></div></section>` : ''}`;
  }
  function compactFooter() {
    return `<footer class="container portfolio-footer"><span>© ${data.meta.updated.slice(0,4)} ${esc(p.shortName)}</span><a href="projects.html">Proyectos</a><a href="cv.html">Trayectoria / CV</a><a href="mailto:${esc(p.email)}">Contacto ${icon('arrow')}</a></footer>`;
  }
  return { projectCard, projectPage, catalog, labSection, hero, shell, compactFooter, videoEmbed };
}
