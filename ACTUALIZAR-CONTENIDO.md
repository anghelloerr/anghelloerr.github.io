# Actualizar tu portafolio

Web: **https://anghelloerr.github.io/** · [Repositorio](https://github.com/anghelloerr/anghelloerr.github.io)

El portafolio tiene portada, [catálogo de proyectos](https://anghelloerr.github.io/projects.html), fichas individuales y [trayectoria/CV](https://anghelloerr.github.io/cv.html). Puedes incorporar fotografías, videos, documentos y avances a cada trabajo. Los cambios guardados en `main` se publican mediante GitHub Actions.

## Cambiar datos

1. Abre [content.json](https://github.com/anghelloerr/anghelloerr.github.io/blob/main/content.json) y pulsa el lápiz.
2. Modifica el contenido conservando comillas, comas y corchetes.
3. Guarda con **Commit changes** en `main`.
4. Comprueba que [Publicar portfolio en GitHub Pages](https://github.com/anghelloerr/anghelloerr.github.io/actions) termine correctamente y actualiza la web.

No edites los HTML generados: se sobrescriben al publicar. No hay un panel privado de administración. La edición se realiza en GitHub o en los archivos locales.

## Subir fotos y cambiar una portada

1. En `assets/images` del repositorio, elige **Add file → Upload files** y sube las fotografías reales. Usa nombres sin espacios, por ejemplo `extrusora-vista-01.jpg`.
2. En `content.json`, busca el proyecto por su `id` (por ejemplo, `biomaterials`).
3. Sustituye `"image": null` por `"image": "assets/images/extrusora-vista-01.jpg"` y añade `"imageAlt": "Descripción de lo que muestra la fotografía"`.
4. Guarda. La imagen sustituye la ilustración tanto en las tarjetas como en la ficha.

Las ilustraciones conceptuales son marcadores visuales, no evidencia. JPG, PNG, WebP y AVIF son formatos adecuados. Las portadas se encuadran automáticamente; las imágenes de la galería conservan su proporción.

## Galería de evidencias y avances

Cada proyecto tiene una lista `evidence` que se muestra en su página bajo **Evidencias y avances**. Puedes mezclar entradas de fotografías, videos y documentos. Añade fecha, título y una descripción breve de tu contribución y de lo que se ve.

Plantilla de fotografía: sustituye los datos y sube primero el archivo.

```json
{
  "title": "Título real del avance",
  "date": "Mes y año",
  "description": "Qué hiciste y qué muestra esta evidencia.",
  "image": "assets/images/extrusora-vista-01.jpg",
  "alt": "Descripción de la fotografía",
  "url": null
}
```

Coloca ese objeto dentro de `"evidence": [ ... ]`. Separa varias entradas con comas. Mantén `[]` si no tienes evidencias; aparecerá un aviso de material pendiente. No guardes las plantillas como si fueran trabajo real.

### Videos de YouTube o Vimeo

Sube el video a tu canal y añade su dirección en una entrada independiente:

```json
{
  "title": "Título real de la demostración",
  "date": "Mes y año",
  "description": "Qué demuestra el video y cuál fue tu participación.",
  "embedUrl": "https://www.youtube.com/watch?v=ID_DEL_VIDEO"
}
```

Reemplaza `ID_DEL_VIDEO` por el identificador real. También se admiten `youtu.be`, YouTube Shorts y `https://vimeo.com/NUMERO`. El visitante pulsa **Cargar video** para verlo dentro de la ficha; antes de ese clic no se conecta al proveedor. Para otros servicios usa `url` y `linkLabel` para mostrar un enlace.

### Videos MP4 o WebM

Para clips breves y comprimidos, sube el archivo a `assets/videos` y utiliza:

```json
{
  "title": "Título real de la prueba",
  "description": "Qué muestra el clip.",
  "video": "assets/videos/mi-prueba.mp4",
  "poster": "assets/images/mi-prueba-portada.jpg"
}
```

`poster` es opcional. El reproductor tiene controles y no reproduce automáticamente. Para videos largos conviene YouTube/Vimeo para mantener ligero el repositorio. Usa un medio principal por entrada: `image`, `video` o `embedUrl`. Puedes añadir un enlace `url` además del medio.

### Documentos o enlaces

Sube el PDF a `assets/documents` y usa `"url": "assets/documents/mi-informe.pdf"` con `"linkLabel": "Ver informe"`, además del título y descripción. También puedes enlazar publicaciones, presentaciones o repositorios con HTTPS. Phyto-G ya incluye la publicación real como evidencia documental.

## Crear una ficha o cambiar los destacados

Duplica un objeto de `projects` y completa sus datos reales:

- `id`: identificador único en minúsculas y sin espacios, por ejemplo `mi-prototipo`. Genera `projects/mi-prototipo.html`. Conserva los identificadores existentes para mantener enlaces compartidos.
- `featured`: `true` para mostrarlo en portada; `false` para dejarlo solo en catálogo. Conviene mantener seis destacados.
- `category`: grupo del filtro (Aeroespacial, Robótica, Biomateriales, Manufactura o IA y control).
- `kind`: Proyecto, Actividad experimental, Línea de prototipado, Práctica de I+D o Investigación publicada, según corresponda.
- `experienceId`: experiencia relacionada, por ejemplo `esan`, `usil` o `betta`.
- `cover`: ilustración conceptual mientras no haya foto: `space`, `biomaterials`, `robotics`, `vision`, `manufacturing` o `phytog`.
- `contribution`: qué hiciste tú; `result`: resultados que puedas respaldar; `source`: origen de la descripción.

El orden de `projects` define el del catálogo y los destacados. La ficha se crea automáticamente al publicar. Si eliminas o renombras una ficha, retira también su HTML antiguo del repositorio y revisa los enlaces que apuntaban a ella.

## Experiencia, habilidades y CV

`experience`, `teaching`, `education`, `training`, `leadership` y `skills` alimentan la página de trayectoria. ESAN usa además `highlights` (tres bloques de actividades) y `projectIds` (trabajos relacionados). La portada reutiliza esos bloques para evitar versiones distintas.

Reemplaza `assets/documents/CV-Anghello-Rodriguez.pdf` para cambiar el PDF descargable. Actualiza también `content.json`: el contenido del PDF no se extrae automáticamente al subirlo. La fecha de revisión está en `meta.updated`.

## Trabajar desde tu computadora

Dentro de la carpeta ejecuta `npm run build` y `npm start`. Abre `http://127.0.0.1:4173/`. No hace falta instalar paquetes. La estructura está en `scripts/build.mjs` y `scripts/portfolio.mjs`; el diseño original, en `assets/styles.css` y `assets/identity.css`; las vistas nuevas, en `assets/portfolio.css`.

Una sección independiente de noticias o artículos puede incorporarse después. La galería actual ya permite registrar avances de cada proyecto.
