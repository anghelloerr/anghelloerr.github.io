# Anghello Rodríguez — Research & Engineering Portfolio

Web académica estática, en español, inspirada en la organización de Hugo Academic/HugoBlox y adaptada al CV de Anghello Eduardo Rodríguez Risco. La portada minimalista muestra foto circular, nombre y redes a la izquierda; biografía, formación e intereses a la derecha. En móvil, el perfil se coloca encima de la biografía. Incluye modo claro/oscuro, navegación móvil, proyectos desplegables, publicación con DOI y BibTeX, experiencia, formación, enlaces profesionales y el PDF original descargable.

## Ver la web

Abre `index.html` en tu navegador. La web está generada y no necesita instalación, conexión a un servicio ni compilación para verse. Los enlaces externos requieren internet.

Para previsualizarla con un servidor local, instala Node.js 20 o posterior y ejecuta dentro de esta carpeta:

```sh
npm start
```

Abre `http://127.0.0.1:4173`. Detén la vista previa con `Ctrl+C`.

## Publicar gratis en GitHub Pages

La estructura está preparada para un repositorio nuevo. No se ha creado, modificado ni publicado ningún repositorio remoto. GitHub Pages admite sitios estáticos gratuitos desde repositorios públicos con GitHub Free. [Documentación oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

### Opción recomendada: publicación automática

1. Crea un repositorio **público**. Si tu usuario es `anghelloerr`, utiliza `anghelloerr.github.io` para obtener `https://anghelloerr.github.io/`. Si ese repositorio ya existe, conserva su contenido y utiliza uno nuevo, por ejemplo `research-portfolio`, cuya dirección será `https://anghelloerr.github.io/research-portfolio/`.
2. Copia **el contenido de esta carpeta**, incluyendo `.github`, `.nojekyll`, `assets`, `scripts` y `content.json`, en la raíz del repositorio. No subas el ZIP como un solo archivo. GitHub Desktop permite añadir la carpeta completa, incluidos los archivos ocultos.
3. Publica los archivos en la rama `main`.
4. En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**.
5. En **Actions**, abre **Publicar portfolio en GitHub Pages** y pulsa **Run workflow** si no se inicia automáticamente. A partir de entonces, cada cambio en `main` genera y publica la web.
6. Espera a que finalice correctamente y abre la dirección que aparece en **Settings → Pages → Visit site**.

El flujo usa Node.js para generar HTML y los servicios oficiales de GitHub Pages para publicarlo. No instala paquetes ni necesita claves, contraseñas o tokens personales. Solo el trabajo de despliegue recibe permisos de publicación. Se sirve únicamente el contenido público de `.site`; las fuentes y esta documentación permanecen en el repositorio.

### Alternativa sin generación automática

Puedes subir `index.html`, `assets/` y `.nojekyll` a la raíz de un repositorio público nuevo y elegir **Settings → Pages → Deploy from a branch → main → /(root)**. No incluyas `.github/workflows/pages.yml` si eliges esta alternativa. Cada vez que edites `content.json`, ejecuta primero `npm run build` y vuelve a subir el HTML, los documentos y los recursos actualizados.

Todas las rutas locales son relativas: funcionan tanto en un dominio `usuario.github.io` como dentro de `/nombre-del-repositorio/`. No hace falta contratar un dominio.

## Actualizar el contenido

La fuente principal es **`content.json`**. Separa los textos y datos del diseño para que puedas actualizar tu trayectoria sin tocar las plantillas. Consulta [la guía para actualizar datos, fotos y evidencias](ACTUALIZAR-CONTENIDO.md) para hacerlo desde GitHub. Esta versión no incluye un panel privado de administración.

1. Edita los textos, fechas, enlaces o listas dentro de `content.json`, conservando el formato JSON.
2. Ejecuta `npm run build` para regenerar `index.html` y `assets/documents/phyto-g.bib`.
3. Abre la web y revisa el cambio. Publica los archivos actualizados. Con GitHub Actions, también puedes editar `content.json` desde GitHub y la publicación se regenera automáticamente.

No se necesita `npm install`. Si modificas directamente `index.html`, el siguiente `build` sobrescribirá esos cambios. Para modificar la estructura, edita `scripts/build.mjs`.

### Cambios habituales

| Qué actualizar | Dónde |
| --- | --- |
| Bio, nombre y contactos | `profile` en `content.json` |
| Líneas de investigación | `research` |
| Publicación y DOI | `publication` |
| Proyectos y contribuciones | `projects` |
| Experiencia, docencia y liderazgo | `experience`, `teaching`, `leadership` |
| Educación y formación complementaria | `education`, `training` |
| Competencias | `skills`, `aerospace`, `biomedical` |
| Fotos y evidencias de un proyecto | `projects[].image` y `projects[].evidence` |
| Colores, tipografía, espacios y adaptación móvil | `assets/styles.css` y `assets/identity.css` |
| Fecha de revisión y URL definitiva | `meta.updated`, `meta.siteUrl` |
| PDF descargable | Reemplaza `assets/documents/CV-Anghello-Rodriguez.pdf` |

### Cambiar tu fotografía

Tu fotografía ya está incorporada en `assets/images/anghello-rodriguez.png`. Se conserva el archivo recibido sin retoques; el encuadre se adapta al espacio de la portada mediante CSS. Para sustituirla, reemplaza ese archivo o añade otro y cambia:

```json
"portrait": "assets/images/anghello-rodriguez.png"
```

Con `null` se muestra el monograma y el texto **Foto pendiente**. La foto se recorta para encajar en el panel; conviene usar una imagen vertical con el rostro centrado. Ajusta `portraitAlt` si hace falta.

### Completar los proyectos

Cada proyecto incluye campos `image`, `url`, `repository` y `result`. Con `null` se muestran avisos claros de contenido pendiente. Para incorporar una imagen o enlace, por ejemplo:

```json
"image": "assets/images/chasqui-2.jpg",
"imageAlt": "Descripción de la fotografía real del proyecto",
"url": "https://sitio-oficial-del-proyecto.example/documentacion",
"repository": null
```

La dirección `.example` de arriba es solo una muestra para esta guía: sustitúyela por un enlace real. Conserva `null` cuando no exista un recurso público. Usa imágenes que correspondan al proyecto y datos que puedas publicar. No se han inventado fotografías ni resultados.

El generador comprueba que las imágenes y el CV locales existan. Se admiten enlaces HTTPS y rutas bajo `assets/`. Mantén los identificadores `id` de los proyectos únicos y estables para conservar sus enlaces directos. Cada proyecto también tiene una lista `evidence` para añadir varias fotos, avances y documentos. Está vacía hasta que incorpores material real; la galería solo aparece cuando tiene contenido.

### Añadir publicaciones

Esta primera versión tiene una publicación destacada. Sus metadatos están en `publication`. Para incorporar una segunda, amplía la plantilla de `scripts/build.mjs` a una lista y crea un BibTeX por publicación. El contenido del BibTeX actual se genera desde esos metadatos; si cambias los autores, actualiza también su formato bibliográfico en el generador.

## Pendientes de contenido

- Imágenes reales y evidencias de proyectos. El retrato personal ya está incluido.
- Enlaces específicos de proyectos, repositorios, demos y resultados que se puedan compartir.
- Fechas concretas de algunos proyectos académicos: se muestran dentro de la etapa USIL, sin asignar años no indicados.
- Periodo específico de docencia en **Diseño electrónico y circuitos** en BETTA: el PDF no muestra una fecha independiente inequívoca.
- Precisar alcance y contribución individual en el proyecto de visión **OC-SORT**. No se presenta como un artículo escrito por Anghello.
- Confirmar el contraste entre el nombre **Programa Integral en Excel – 2019** y las fechas **julio–agosto de 2020**. Se conservaron ambos datos del CV.
- Agregar proyectos biomédicos o de biónica cuando estén documentados. Los conocimientos listados no se convierten en supuestos prototipos terminados.
- Actualizar condición académica y cargos marcados como actuales cuando cambien. La información corresponde al PDF recibido y a la revisión del 25 de septiembre de 2026.

Los cuartiles JCR/Scopus del PDF no se muestran como sellos sin año/categoría: la ficha destaca el artículo, la revista, la coautoría y el DOI. El PDF descargable se conserva íntegro.

## Estructura

```text
anghello-portfolio/
  index.html                     Web lista para abrir
  content.json                   Contenido editable
  README.md                      Esta guía
  ACTUALIZAR-CONTENIDO.md        Guía para datos, fotos y evidencias
  SOURCES.md                     Origen y decisiones de contenido
  .nojekyll                      Desactiva el procesamiento Jekyll
  .github/workflows/pages.yml    Publicación automática
  assets/
    styles.css                   Diseño responsive y temas
    identity.css                 Identidad azul noche, acero y cian
    theme.js                     Preferencia inicial del tema
    app.js                       Menú, tema y enlaces a bloques plegados
    favicon.svg                  Monograma AR
    images/README.md             Instrucciones para imágenes
    images/anghello-rodriguez.png Retrato proporcionado por Anghello
    documents/
      CV-Anghello-Rodriguez.pdf  PDF original
      phyto-g.bib                 Cita bibliográfica
  scripts/
    build.mjs                    Generador sin dependencias
    preview.mjs                  Servidor local
  package.json
```

## Decisiones técnicas

HTML, CSS y JavaScript nativos, con un generador opcional sin dependencias. Esta alternativa estática evita actualizaciones de temas y facilita el mantenimiento. No es una instalación de Hugo ni de HugoBlox. Los textos están en el HTML generado: siguen accesibles sin JavaScript, incluidos los detalles desplegables nativos. El tema respeta la preferencia del sistema y guarda la selección local cuando el navegador lo permite.

No se usan analítica, cookies, formularios que simulen envíos, fuentes remotas, servicios de pago ni bibliotecas externas en el navegador. Contacto abre el cliente de correo mediante `mailto:`. Los enlaces profesionales, el PDF y el BibTeX son reales.

La publicación remota debe comprobarse cuando se configure el repositorio: las pruebas locales no ejecutan el entorno de GitHub Actions.

## Verificación

La primera versión completó 30 comprobaciones en Microsoft Edge: navegación, anclas, proyectos desplegables, menú móvil y teclado, persistencia del tema, descarga del PDF y BibTeX, aperturas por enlace directo, visualización sin JavaScript y apertura local sin servidor. Se verificaron anchos de 320, 390, 768, 1024, 1440 y 1920 px, además de texto ampliado al 200 %. También se comprobó el sitio generado dentro de una subcarpeta, como ocurre con GitHub Pages para proyectos. Estas pruebas corresponden al diseño inicial; la revisión con retrato y paleta personalizada tiene comprobaciones específicas adicionales.

En la revisión del 26 de septiembre se comprobó la carga del retrato, el modo oscuro, el menú móvil, la apertura de contribuciones y los destinos de los enlaces internos. A 388 px de ancho de contenido no se observó desbordamiento horizontal. Se validó la generación de galerías con múltiples evidencias, campos opcionales, escape de texto y rechazo de enlaces no admitidos; los ejemplos de prueba no se incorporaron al portfolio. El navegador no registró errores de JavaScript en estas comprobaciones. La captura automática de pantalla presentó problemas de escala, por lo que esta revisión no incluye nuevas capturas como evidencia visual.

Tras ajustar la portada a las referencias académicas del usuario, se verificó el perfil a la izquierda en escritorio, el retrato circular, las seis líneas de investigación y los dos estudios en curso. En móvil (388 px de contenido) se comprobó la disposición vertical y la ausencia de desbordamiento horizontal. Ambos temas funcionan y no se registraron errores de JavaScript durante estas comprobaciones. Los datos de formación e intereses se generan desde las listas existentes de `content.json`, para mantenerlos sincronizados con el resto de la página.

El PDF y el retrato incluidos son idénticos a los originales. La validación es local: la publicación en GitHub Pages está preparada, pero aún no se ha ejecutado.
