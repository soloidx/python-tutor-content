import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep, dirname, relative } from 'node:path';
import { lessonOccurrences } from './lesson-walkthroughs.js';
import { readWalkthrough } from './read-walkthrough.mjs';

export async function readLessons(root, lessons) {
  const content = await realpath(resolve(root, 'content'));
  return Promise.all(lessons.map(async ({ id, file }) => {
    if (typeof file !== 'string' || !file.endsWith('.md') || file.startsWith('/') || file.includes('\\') || file.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Ruta de lección inválida');
    const path = await realpath(resolve(content, file));
    if (!path.startsWith(content + sep)) throw new Error('La lección debe estar dentro del árbol de contenido');
    const markdown = await readFile(path, 'utf8');
    let fence = null, title, paragraph = [];
    for (const line of markdown.split(/\r?\n/)) {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
      if (marker) { if (!fence) fence = marker[1]; else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null; paragraph = []; continue; }
      if (fence) continue;
      const match = line.match(/^ {0,3}#\s+(.+?)\s*#*\s*$/);
      if (match) { title = match[1].trim(); break; }
      if (/^ {0,3}=+\s*$/.test(line) && paragraph.length) { title = paragraph.join(' ').trim(); break; }
      if (!line.trim() || /^ {0,3}(?:#{1,6}(?:\s|$)|>|[-*+]\s|\d+[.)]\s)/.test(line)) paragraph = [];
      else paragraph.push(line.trim());
    }
    if (!title) throw new Error(`Falta título de lección: ${file}`);
    const walkthroughs = [];
    for (const occurrence of lessonOccurrences(markdown)) {
      const { url, code } = occurrence;
      if (!url || url.startsWith('/') || url.includes('\\') || /[%?#:]/.test(url)) throw Error('Referencia de recorrido inválida');
      const target = await realpath(resolve(dirname(path), url));
      if (!target.startsWith(content + sep)) throw Error('Recorrido fuera del árbol de contenido');
      const reference = relative(content, target).split(sep).join('/');
      const walkthrough = await readWalkthrough(root, reference, code || '', { lesson: true });
      if (walkthrough.type !== 'svg') throw Error('La lección requiere un recorrido SVG');
      if (walkthrough.code && code === null) throw Error('El recorrido requiere un bloque python adyacente');
      walkthroughs.push({ code: walkthrough.code ? code : null, walkthrough });
    }
    return { id, title, markdown, ...(walkthroughs.length ? { walkthroughs } : {}) };
  }));
}
