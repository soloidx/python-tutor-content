import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

export async function readLessons(root, lessons) {
  const content = await realpath(resolve(root, 'content'));
  return Promise.all(lessons.map(async ({ id, file }) => {
    if (typeof file !== 'string' || !file.endsWith('.md') || file.startsWith('/') || file.includes('\\') || file.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Ruta de lección inválida');
    const path = await realpath(resolve(content, file));
    if (!path.startsWith(content + sep)) throw new Error('La lección debe estar dentro del árbol de contenido');
    const markdown = await readFile(path, 'utf8');
    let fence = null, title;
    for (const line of markdown.split(/\r?\n/)) {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
      if (marker) { if (!fence) fence = marker[1]; else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null; continue; }
      if (!fence) { const match = line.match(/^ {0,3}#\s+(.+?)\s*#*\s*$/); if (match) { title = match[1].trim(); break; } }
    }
    if (!title) throw new Error(`Falta título de lección: ${file}`);
    return { id, title, markdown };
  }));
}
