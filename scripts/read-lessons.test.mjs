import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readLessons } from './read-lessons.mjs';
const root = await mkdtemp(join(tmpdir(), 'lessons-'));
try {
  await mkdir(join(root, 'content/lessons'), { recursive: true });
  await writeFile(join(root, 'content/lessons/a.md'), '# Primer título\n\nEjemplo.\n');
  await writeFile(join(root, 'content/lessons/b.md'), '# Segundo título\n');
  const lessons = await readLessons(root, [{id:'b',file:'lessons/b.md'}, {id:'a',file:'lessons/a.md'}]);
  assert.deepEqual(lessons.map(({id,title}) => [id,title]), [['b','Segundo título'], ['a','Primer título']]);
  assert.equal(lessons[1].markdown, '# Primer título\n\nEjemplo.\n');
  await assert.rejects(readLessons(root, [{id:'x',file:'../outside.md'}]));
  await assert.rejects(readLessons(root, [{id:'x',file:'lessons/missing.md'}]));
  await writeFile(join(root, 'content/lessons/no-title.md'), 'Sin título');
  await assert.rejects(readLessons(root, [{id:'x',file:'lessons/no-title.md'}]));
} finally { await rm(root, { recursive:true, force:true }); }

const setextRoot = await mkdtemp(join(tmpdir(), 'lessons-setext-'));
try {
  await mkdir(join(setextRoot, 'content/lessons'), { recursive: true });
  await writeFile(join(setextRoot, 'content/lessons/setext.md'), 'Un título Setext\n================\n\nTexto.\n');
  const [lesson] = await readLessons(setextRoot, [{id:'setext',file:'lessons/setext.md'}]);
  assert.equal(lesson.title, 'Un título Setext');
} finally { await rm(setextRoot, { recursive:true, force:true }); }

const linkedRoot = await mkdtemp(join(tmpdir(), 'linked-lesson-'));
try {
  await mkdir(join(linkedRoot, 'content/lessons'), { recursive: true });
  await mkdir(join(linkedRoot, 'content/walkthroughs/graphics'), { recursive: true });
  await writeFile(join(linkedRoot, 'content/lessons/a.md'), '# Ejemplo\n\n```python\nx = 25\nprint(x)\n```\n\n[Recorrido](../walkthroughs/example.json)\n');
  await writeFile(join(linkedRoot, 'content/walkthroughs/example.json'), JSON.stringify({type:'svg',code:true,graphics:{scene:'walkthroughs/graphics/a.svg'},scenarios:[{id:'a',label:'A',graphic:'scene',steps:[{line:2,explanation:'Muestra x'}]}]}));
  await writeFile(join(linkedRoot, 'content/walkthroughs/graphics/a.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" data-part="box"/></svg>');
  const [lesson] = await readLessons(linkedRoot, [{id:'a',file:'lessons/a.md'}]);
  assert.equal(lesson.walkthroughs.length, 1);
  assert.equal(lesson.walkthroughs[0].code, 'x = 25\nprint(x)');
  await writeFile(join(linkedRoot, 'content/lessons/a.md'), '# Ejemplo\n\n```python\nx = 25\nprint(x)\n```\n\n[Recorrido][demo]\n\n[demo]: ../walkthroughs/example.json');
  const [referenced] = await readLessons(linkedRoot, [{id:'a',file:'lessons/a.md'}]);
  assert.equal(referenced.walkthroughs[0].code, 'x = 25\nprint(x)');
  await writeFile(join(linkedRoot, 'outside.json'), '{}');
  await writeFile(join(linkedRoot, 'content/lessons/a.md'), '# Ejemplo\n\n[Recorrido](../../outside.json)');
  await assert.rejects(readLessons(linkedRoot, [{id:'a',file:'lessons/a.md'}]), /fuera del árbol/);
  await writeFile(join(linkedRoot, 'content/lessons/a.md'), '# Ejemplo\n\nTexto [Recorrido](../walkthroughs/example.json)');
  await assert.rejects(readLessons(linkedRoot, [{id:'a',file:'lessons/a.md'}]));
  await writeFile(join(linkedRoot, 'content/lessons/a.md'), '# Ejemplo\n\n[Recorrido](../walkthroughs/example.json)');
  await assert.rejects(readLessons(linkedRoot, [{id:'a',file:'lessons/a.md'}]));
  await writeFile(join(linkedRoot, 'content/lessons/a.md'), '# Ejemplo\n\n```python\nx = 1\n```\n\n[Recorrido](../walkthroughs/example.json)');
  await assert.rejects(readLessons(linkedRoot, [{id:'a',file:'lessons/a.md'}]));
  await cp('content/walkthroughs/condicionales-svg.json', join(linkedRoot, 'content/walkthroughs/condicionales-svg.json'));
  await cp('content/walkthroughs/graphics/condicionales.svg', join(linkedRoot, 'content/walkthroughs/graphics/condicionales.svg'));
  await writeFile(join(linkedRoot, 'content/lessons/a.md'), '# Condicionales\n\n```python\ntemperatura = 25\nif temperatura >= 24:\n    print("Hace calor")\nelse:\n    print("Hace fresco")\n```\n\n[Recorrido](../walkthroughs/condicionales-svg.json)');
  const [conditional] = await readLessons(linkedRoot, [{id:'a',file:'lessons/a.md'}]);
  const scenarios = conditional.walkthroughs[0].walkthrough.scenarios;
  assert.deepEqual(scenarios.map(s => [s.id, s.steps.map(step => step.line), s.steps.at(-1).output]), [
    ['25', [1,2,3], 'Hace calor'], ['24', [1,2,3], 'Hace calor'], ['23', [1,2,5], 'Hace fresco'],
  ]);
} finally { await rm(linkedRoot, { recursive:true, force:true }); }
