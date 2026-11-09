# Python Tutor Content

Catálogo de prueba para Python Tutor, publicado como JSON estático en GitHub Pages.

## Editar y publicar

Requiere Node.js 22. Ejecuta `npm ci` para instalar el validador XML del subconjunto SVG.

1. Edita los cursos en `content/courses/` y las rutas en `content/learning-paths.json`.
2. Ejecuta `npm run build` y `npm run check`.
3. Incluye `content/` y los cambios generados en `public/` en el mismo commit.
4. Un push a `main` valida y despliega `public/` mediante GitHub Actions. Los PR solo validan.

Los archivos de curso llevan su SHA-256 en el nombre y se conservan entre publicaciones. El catálogo se genera después de todos los cursos. No borres archivos publicados antiguos ni cambies su contenido.

## Generar desde un tópico

Abre este repositorio en Codex y usa `$generate-python-content`, por ejemplo: «Crea un curso inicial sobre comprensión de listas con tres temas y evaluación opcional». La skill del proyecto está en `.agents/skills/generate-python-content/SKILL.md`.

## Material inicial

Dos rutas comparten Python Fundamentos. Python Práctica replica sus ejercicios sin evaluación para probar aislamiento con IDs locales coincidentes. Estos materiales proceden de las fixtures del proyecto `soloidx/python-tutor` (implementación #38); son contenido de demostración, pendiente de revisión pedagógica para publicación educativa definitiva.

El contrato se conserva en `docs/contract.md`; el validador en `scripts/content-contract.mjs` procede del consumidor y debe actualizarse al evolucionar ese contrato.

## GitHub Pages y dominio

La URL pública es `https://www.ider.ninja/python-tutor-content/catalog.json`. Pages hereda el dominio del sitio de usuario y tiene HTTPS obligatorio. La aplicación usa esta URL canónica porque rechaza redirecciones. La URL `soloidx.github.io` redirige al dominio heredado; no requiere cambios de DNS ni CNAME en este repositorio. Se verificó `Access-Control-Allow-Origin: *` en la publicación inicial.

## Iconos por recurso

Guarda los SVG originales en `content/icons/` y añade `"icon": "icons/<slug>.svg"` a una ruta, curso o tema en `content/`. Es opcional: sin el campo, la app muestra un icono predeterminado. `npm run build` genera los archivos inmutables en `public/icons/` y sus referencias con SHA-256; `npm run check` verifica publicación, integridad y el subconjunto SVG estático. No se permiten scripts, eventos, CSS, animaciones ni referencias externas. El contrato completo está en `docs/contract.md` y la skill `$generate-python-content` incluye estas reglas. Los iconos se conservan en el respaldo local del tutor junto con el contenido.
