import path from 'node:path';
import { load } from 'cheerio';

const attributes = ['alt', 'title', 'aria-label', 'placeholder', 'data-video-title'];
const skip = 'script,style,code,pre,svg,noscript,iframe,textarea,template,xmp,[translate="no"]';
export const normalize = text => text.replace(/\s+/g, ' ').trim();

// Only rendered, visible content is sent to the local translator. IDs, URLs,
// filter values, citations and executable code are never translated.
function visit($, change) {
  $('*').each((_, element) => {
    const el = $(element);
    if (el.closest(skip).length) return;
    el.contents().each((_, node) => {
      if (node.type === 'text' && /\p{L}/u.test(node.data)) {
        const key = normalize(node.data);
        const translated = change(key);
        if (translated !== key) node.data = node.data.replace(/\S[\s\S]*\S|\S/, () => translated);
      }
    });
    for (const attr of attributes) {
      const value = el.attr(attr);
      if (value && /\p{L}/u.test(value)) el.attr(attr, change(normalize(value)));
    }
  });
  $('meta[name="description"],meta[property="og:title"],meta[property="og:description"]').each((_, el) => {
    const value = $(el).attr('content');
    if (value) $(el).attr('content', change(normalize(value)));
  });
}

export function translationInputs(pages, content) {
  const texts = new Set();
  for (const html of pages.values()) visit(load(html), value => { texts.add(value); return value; });
  const preserve = new Set([content.profile.name, content.profile.shortName]);
  for (const item of [...content.experience, ...content.education, ...content.projects, ...(content.training || []), ...(content.teaching || []), ...(content.leadership || [])]) {
    for (const key of ['institution', 'university', 'short']) if (item[key]) preserve.add(item[key]);
  }
  for (const pub of content.publications || [content.publication].filter(Boolean)) {
    for (const key of ['title', 'journal', 'publisher']) if (pub[key]) preserve.add(pub[key]);
    for (const author of pub.authors || []) preserve.add(author);
    if (pub.authors?.length) preserve.add(pub.authors.join(', '));
    if (pub.authors?.length) preserve.add(pub.authors.join(' · '));
  }
  return { texts: [...texts].sort(), preserve: [...preserve].filter(Boolean).map(normalize) };
}

export function bilingualPages(pages, content) {
  const result = new Map();
  const translations = content.translations?.en;
  if (!translations) throw Error('Faltan traducciones. Genera la versión desde el CMS.');
  const site = content.meta.siteUrl.replace(/\/?$/, '/');
  for (const [route, html] of pages) {
    for (const lang of ['en', 'es']) {
      const $ = load(html), current = lang === 'en' ? route : `es/${route}`;
      if (lang === 'en') visit($, key => {
        if (!Object.hasOwn(translations, key) || typeof translations[key] !== 'string' || !translations[key].trim())
          throw Error(`Traducción pendiente: ${key.slice(0, 100)}`);
        return translations[key];
      });
      else visit($, key => ({
        'Research': 'Investigación', 'RESEARCH': 'INVESTIGACIÓN',
        'RESEARCH & ENGINEERING PORTFOLIO': 'PORTAFOLIO DE INVESTIGACIÓN E INGENIERÍA',
        'Research & Engineering Portfolio': 'Portafolio de investigación e ingeniería',
        'SELECTED WORK': 'TRABAJOS DESTACADOS', 'PUBLICATIONS': 'PUBLICACIONES',
        'JOURNAL ARTICLE': 'ARTÍCULO CIENTÍFICO', 'CONTACT': 'CONTACTO',
        'Aerospace': 'Aeroespacial', 'Biomedical': 'Biomédica', '& Bionics': 'y biónica',
        'FOCUS / 01': 'ENFOQUE / 01', 'FOCUS / 02': 'ENFOQUE / 02',
        'Research & Development': 'Investigación y desarrollo',
        'Robotics & Autonomous Systems': 'Robótica y sistemas autónomos',
        'Space Robotics & AOCS': 'Robótica espacial y AOCS',
        'Advanced Control Systems': 'Sistemas de control avanzado',
        'Biomedical Mechatronics & Bionics': 'Mecatrónica biomédica y biónica',
        'Digital Manufacturing': 'Manufactura digital',
        'Applied AI / Computer Vision': 'IA aplicada / Visión por computadora'
      })[key] || key);
      $('html').attr('lang', lang);
      // Relative page links stay within the selected language. Shared files
      // live once at the site root (works on project Pages and local previews).
      if (lang === 'es') $('[href],[src],[poster]').each((_, element) => {
        for (const attr of ['href', 'src', 'poster']) {
          const url = $(element).attr(attr);
          if (!url || /^(?:[a-z]+:|\/\/|#)/i.test(url)) continue;
          const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(route), url));
          if (resolved.startsWith('assets/'))
            $(element).attr(attr, path.posix.relative(path.posix.dirname(current), resolved));
        }
      });
      const opposite = lang === 'en' ? `es/${route}` : route;
      const button = $('<a>').addClass('language-toggle icon-button').attr({
        href: path.posix.relative(path.posix.dirname(current), opposite),
        hreflang: lang === 'en' ? 'es' : 'en', lang: lang === 'en' ? 'es' : 'en',
        'aria-label': lang === 'en' ? 'Cambiar a español' : 'Switch to English',
        title: lang === 'en' ? 'Cambiar a español' : 'Switch to English'
      }).text(lang === 'en' ? 'ES' : 'EN');
      if ($('.theme-toggle').length !== 1) throw Error('Cada página debe tener un control de tema y de idioma.');
      $('.theme-toggle').after(button);
      const publicUrl = file => new URL(file === 'index.html' ? '' : file, site).href;
      $('link[rel="canonical"]').attr('href', publicUrl(current));
      for (const [language, file] of [['en', route], ['es', `es/${route}`], ['x-default', route]])
        $('head').append($('<link>').attr({rel: 'alternate', hreflang: language, href: publicUrl(file)}));
      result.set(current, $.html());
    }
  }
  return result;
}
