import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
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
