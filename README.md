# Python Tutor Content

Catálogo de prueba para Python Tutor, publicado como JSON estático en GitHub Pages.

## Editar y publicar

Requiere Node.js 22. No necesita dependencias npm.

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

La aplicación espera `https://soloidx.github.io/python-tutor-content/catalog.json`. Esta fuente usa el dominio predeterminado de Pages y no incluye CNAME. El dominio del sitio principal puede conservarse. Si GitHub redirige esta URL a un dominio heredado de un sitio de usuario, comprueba la URL efectiva y CORS: el consumidor rechaza redirecciones de archivos. No cambies DNS ni el dominio del sitio principal para esta fuente sin verificarlo.
