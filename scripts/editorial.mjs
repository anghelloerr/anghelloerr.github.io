// Public rendering only. Private IDs are resolved by the CMS before export.
export function createEditorial({data,esc,safeUrl,external,icon,tags}) {
  const media=(src,mime,alt='',caption='')=>`<figure class="evidence-item">${mime.startsWith('image/')?`<img src="${safeUrl(src)}" alt="${esc(alt)}" loading="lazy">`:mime.startsWith('video/')?`<video controls playsinline preload="none" aria-label="${esc(alt||caption)}" src="${safeUrl(src)}"></video>`:mime.startsWith('audio/')?`<audio controls preload="none" aria-label="${esc(alt||caption)}" src="${safeUrl(src)}"></audio>`:`<a href="${safeUrl(src)}" ${external}>Abrir documento PDF</a>`}${caption?`<figcaption>${esc(caption)}</figcaption>`:''}${!mime.startsWith('image/')?`<a class="text-link" href="${safeUrl(src)}" download>Descargar archivo</a>`:''}</figure>`;
  function rich(node) {
    if(!node)return '';
    const inner=()=> (node.content||[]).map(rich).join('');
    if(node.type==='text'){
      let out=esc(node.text||'');
      for(const m of node.marks||[]) {const tag={bold:'strong',italic:'em',underline:'u',strike:'s',code:'code'}[m.type];if(tag)out=`<${tag}>${out}</${tag}>`;else if(m.type==='link')out=`<a href="${safeUrl(m.attrs.href)}" ${external}>${out}</a>`;else throw Error('Marca no admitida');}return out;
    }
    if(node.type==='doc')return inner();
    if(node.type==='hardBreak')return '<br>';
    if(node.type==='horizontalRule')return '<hr>';
    if(node.type==='mediaBlock')return media(node.attrs.src,node.attrs.mime,node.attrs.alt,node.attrs.caption);
    const tag={paragraph:'p',heading:node.attrs?.level===3?'h3':'h2',bulletList:'ul',orderedList:'ol',listItem:'li',blockquote:'blockquote'}[node.type];
    if(!tag)throw Error('Nodo no admitido');
    return `<${tag}${node.type==='orderedList'?` start="${Number(node.attrs?.start)||1}"${node.attrs?.type?` type="${esc(node.attrs.type)}"`:''}`:''}>${inner()}</${tag}>`;
  }
  const publications=data.publications || (data.publication?[{...data.publication,id:'publication'}]:[]);
  function bib(pub){
    const clean=x=>String(x??'').replace(/[{}\\]/g,'').replace(/[\r\n]/g,' ');
    return `@article{${clean(pub.id)},\n  author = {${pub.authors.map(clean).join(' and ')}},\n  title = {${clean(pub.title)}},\n  journal = {${clean(pub.journal)}},\n  year = {${pub.year}},\n  volume = {${clean(pub.volume)}},\n  number = {${clean(pub.issue)}},\n  pages = {${clean(pub.article)}},\n  doi = {${clean(pub.doi)}},\n  url = {${clean(pub.url)}}\n}\n`;
  }
  const bibPath=p=>`assets/documents/${p.id==='publication'?'phyto-g':p.id}.bib`;
  function publicationSection(){return `<section id="publications" class="section publication-section"><div class="container"><div class="section-heading"><div><p class="eyebrow">PUBLICATIONS</p><h2>Investigación publicada</h2></div></div>${publications.map(pub=>`<article class="publication-card" id="publication-${esc(pub.id)}"><div class="publication-meta"><span class="publication-type">JOURNAL ARTICLE</span><p class="journal-name">${esc(pub.journal)}<span>${esc(pub.publisher)} · ${pub.year}</span></p><p>Vol. ${esc(pub.volume)} · N.º ${esc(pub.issue)}<br>Artículo ${esc(pub.article)}</p><p>${esc(pub.date)}</p></div><div class="publication-content"><h3>${esc(pub.title)}</h3><p class="authors">${pub.authors.map(esc).join(' · ')}</p><p>${esc(pub.summary)}</p>${tags(pub.tags)}<details><summary>Mi contribución</summary><p>${esc(pub.contribution)}</p></details><p class="doi">DOI: <a href="${safeUrl(pub.url)}" ${external}>${esc(pub.doi)}</a></p><div class="publication-actions"><a class="button primary" href="${safeUrl(pub.url)}" ${external}>Leer artículo ${icon('arrow')}</a><a class="text-link" href="${bibPath(pub)}" download>Descargar BibTeX</a></div></div></article>`).join('')}${!publications.length?'<p>No hay publicaciones visibles.</p>':''}</div></section>`;}
  function postCard(post){return `<article class="project-card">${post.image?`<a href="posts/${post.id}.html" class="cover-link"><figure class="project-cover real-cover"><img src="${safeUrl(post.image)}" alt="${esc(post.alt)}" loading="lazy"></figure></a>`:''}<div class="project-body"><p class="small-label">${esc(post.date)}</p><h3><a href="posts/${post.id}.html">${esc(post.title)}</a></h3><p>${esc(post.summary)}</p>${tags(post.tags)}<a class="text-link" href="posts/${post.id}.html">Leer entrada ${icon('arrow')}</a></div></article>`;}
  function postsSection(){return !(data.posts||[]).length?'':`<section id="posts" class="section container"><div class="section-heading"><div><p class="eyebrow">BITÁCORA</p><h2>Notas desde el desarrollo</h2></div><a href="posts.html">Todas las entradas</a></div><div class="projects-grid">${data.posts.slice(0,3).map(postCard).join('')}</div></section>`;}
  function postPage(post){const project=data.projects.find(p=>p.id===post.projectId);return `<section class="container page-intro"><p class="eyebrow">BITÁCORA · ${esc(post.date)}</p><h1>${esc(post.title)}</h1><p>${esc(post.summary)}</p>${tags(post.tags)}${project?`<a href="projects/${project.id}.html">Proyecto: ${esc(project.title)}</a>`:''}</section><article class="container rich-content">${post.image?media(post.image,'image/webp',post.alt):''}${rich(post.body)}</article>`;}
  return {rich,media,publications,bib,bibPath,publicationSection,postCard,postsSection,postPage};
}
