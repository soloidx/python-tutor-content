import { unified } from 'unified';
import remarkParse from 'remark-parse';
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
    const tree = unified().use(remarkParse).parse(markdown);
    function firstHeading(node) {
      if (node.type === 'heading' && node.depth === 1) return node;
      for (const child of node.children || []) {
        const found = firstHeading(child);
        if (found) return found;
      }
    }
    function headingText(node) {
      if (node.type === 'html') return '';
      if (node.type === 'text' || node.type === 'inlineCode') return node.value;
      if (node.type === 'image' || node.type === 'imageReference') return node.alt || '';
      if (node.type === 'break') return ' ';
      return (node.children || []).map(headingText).join('');
    }
    const title = headingText(firstHeading(tree) || {}).trim();
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
