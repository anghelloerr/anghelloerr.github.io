# Actualizar tu portfolio

Sí puedes actualizar tu biografía, experiencia, formación y CV, añadir proyectos y publicar fotos o evidencias de tu trabajo. Los datos están separados del diseño. Cada proyecto admite una imagen de portada y una galería de evidencias con título, fecha, descripción y enlaces a documentos o videos.

Esta versión se edita desde los archivos del repositorio en GitHub. No tiene todavía un panel privado con inicio de sesión y botón de subir publicaciones. Se puede incorporar un editor visual más adelante, conectándolo al repositorio y configurando su acceso.

## La primera vez

Publica el sitio siguiendo la opción **publicación automática** del [README](README.md). Debe quedar seleccionado **GitHub Actions** en Settings → Pages. Una vez configurado, cada cambio guardado en la rama `main` reconstruye y publica la web.

## Cambiar textos o datos desde GitHub

1. Abre tu repositorio y el archivo `content.json`.
2. Pulsa el lápiz para editar. Localiza el texto que quieres actualizar y modifícalo conservando comillas, comas y corchetes.
3. Guarda con **Commit changes** en `main`.
4. Comprueba que **Publicar portfolio en GitHub Pages**, en la pestaña Actions, finalice correctamente. Después abre tu web y actualiza la página.

No edites `index.html` para cambiar contenido: se genera automáticamente y esos cambios se sobrescribirían. Si Actions marca un error, abre su ejecución para ver el motivo: suele ser una coma, una comilla o una ruta de imagen incorrecta. La versión publicada anteriormente permanece disponible si falla la generación.

## Subir fotos de un proyecto

1. Abre la carpeta `assets/images` en GitHub y elige **Add file → Upload files**.
2. Arrastra las imágenes y guarda los cambios. Usa nombres simples, por ejemplo `mi-proyecto-01.jpg`, sin espacios, y conserva las mayúsculas/minúsculas exactas en las rutas.
3. Edita el proyecto correspondiente dentro de `projects` en `content.json`.
4. Para su portada, reemplaza `"image": null` por `"image": "assets/images/mi-proyecto-01.jpg"`. Completa `imageAlt` con una descripción real de la foto.
5. Para varias evidencias, completa su lista `evidence` como se explica abajo y guarda los cambios.

Sube primero las imágenes y después añade sus rutas al contenido: el generador comprueba que los archivos existan. JPG, PNG, WebP o AVIF son formatos admitidos. Procura comprimir fotos grandes para que carguen rápido.

## Añadir una evidencia

Busca `"evidence": []` dentro del proyecto elegido. Sustitúyelo por una lista como esta. **Es una plantilla: reemplaza sus textos y la ruta por información y una imagen reales antes de guardarla. No se ha publicado esta muestra en el sitio.**

```json
"evidence": [
  {
    "title": "Título real de la actividad o avance",
    "date": "Mes y año de la actividad",
    "description": "Describe qué hiciste, tu contribución y qué muestra esta evidencia.",
    "image": "assets/images/mi-proyecto-01.jpg",
    "alt": "Descripción concreta de lo que se ve en la fotografía",
    "url": null,
    "linkLabel": "Ver documentación"
  }
]
```

- **Más fotos o avances:** añade otros objetos entre las mismas llaves `[` y `]`, separados por comas. Aparecen en el orden que escribas.
- **Solo texto o un enlace:** usa `"image": null`; puedes dejar `"date": null` cuando no quieras mostrar una fecha.
- **Video:** escribe su dirección pública completa `https://...` en `url` y usa `"linkLabel": "Ver video"`. Se muestra un enlace al video.
- **Documento:** sube el PDF a `assets/documents` y escribe su ruta en `url`, por ejemplo `assets/documents/mi-informe.pdf`.
- **Sin evidencias aún:** conserva `"evidence": []`. La galería no aparece vacía.

Cuando haya evidencias, el desplegable de ese proyecto se llamará **Contribución y evidencias**. La foto principal de la tarjeta sigue siendo independiente.

## Cambiar el retrato y el CV

El retrato está en `assets/images/anghello-rodriguez.png`. Puedes reemplazarlo por otro con el mismo nombre o cambiar `profile.portrait` para apuntar al nuevo archivo. La foto recibida se conserva sin retoques; el encuadre de la portada lo controla `assets/identity.css`.

Para actualizar el CV descargable, reemplaza `assets/documents/CV-Anghello-Rodriguez.pdf`. Si cambian tus cargos, fechas o formación, actualiza también `content.json`: el contenido del PDF no se extrae automáticamente al sustituirlo.

## Añadir proyectos y otras entradas

Duplica un objeto existente dentro de `projects`, cambia su `id` por uno único y rellena sus datos reales. Los seis primeros proyectos de la lista se muestran destacados; los siguientes aparecen en **Más proyectos**. Puedes cambiar su orden para priorizar los actuales. Conserva `null` en campos sin material disponible. El campo `result` sirve para describir un resultado que ya puedas respaldar.

Experiencia, educación y cursos son listas similares en `experience`, `education` y `training`. La publicación destacada actual está en `publication`; para varias publicaciones debe ampliarse la plantilla según indica el README.

La galería sirve para documentar avances dentro de proyectos. Una sección independiente de noticias o artículos con páginas propias sería una ampliación posterior.

## Si prefieres actualizar en tu computadora

Edita los archivos y ejecuta, dentro de la carpeta del portfolio:

```sh
npm run build
npm start
```

Abre `http://127.0.0.1:4173`, revisa los cambios y súbelos al repositorio. No hace falta instalar paquetes. Para los colores, edita `assets/styles.css`; para el retrato, la composición y las galerías, `assets/identity.css`.

Referencia: [guía oficial de GitHub para subir archivos](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
