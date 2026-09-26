# Imágenes del portfolio

Aquí está `anghello-rodriguez.png`, el retrato original proporcionado por Anghello. Coloca también en esta carpeta las imágenes reales de proyectos. No se han incluido imágenes genéricas que puedan confundirse con trabajo propio.

Configura `profile.portrait`, `projects[].image` y `projects[].evidence[].image` en `content.json` con rutas como `assets/images/prototipo.jpg`. Usa JPG, PNG, WebP o AVIF, añade un texto alternativo descriptivo y ejecuta `npm run build`. Con la publicación automática de GitHub Actions, basta con guardar los cambios en `main`. Consulta `ACTUALIZAR-CONTENIDO.md` en la carpeta principal.

Recomendaciones: retrato vertical; imágenes de proyectos horizontales de al menos 720 × 400 px, optimizadas para la web. Las tarjetas recortan la imagen para llenar su espacio: ajusta `object-position` en CSS si hace falta. Mientras el valor sea `null`, se muestra un placeholder explícito.
