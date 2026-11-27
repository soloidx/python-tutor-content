import assert from 'node:assert/strict';
import { readFile, mkdtemp, cp, symlink, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { readWalkthrough } from './read-walkthrough.mjs';
import { validateSourceCourse, validateCourse } from './content-contract.mjs';
const course = JSON.parse(await readFile('content/courses/python-fundamentos.json','utf8'));
const topic = course.topics.find(t => t.id === 'condicionales');
const source = await readWalkthrough(process.cwd(),topic.walkthrough,topic.example);
validateSourceCourse(course,course.id);
for (const value of ['../escape.json', '/absolute.json', 'walkthroughs/%2e.json']) {
 const copy=structuredClone(course); copy.topics.find(t=>t.id==='condicionales').walkthrough=value;
 assert.throws(()=>validateSourceCourse(copy,copy.id));
}
const published=JSON.parse(await readFile(`public/${JSON.parse(await readFile('public/catalog.json','utf8')).courses.find(c=>c.id===course.id).file}`,'utf8'));
assert.deepEqual(published.topics.find(t=>t.id==='condicionales').walkthrough,source);
for (const mutation of [w=>w.type='unknown', w=>w.scenarios[0].steps[0].line=999, w=>w.scenarios[0].steps[0].highlight=['missing'], w=>w.scenarios[1].id=w.scenarios[0].id]) {
 const copy=structuredClone(published); mutation(copy.topics.find(t=>t.id==='condicionales').walkthrough);
 assert.throws(()=>validateCourse(copy,copy.id));
}
const array = await readWalkthrough(process.cwd(), 'walkthroughs/crecimiento-arreglo.json', topic.example);
assert.equal(array.code, undefined);
assert.deepEqual(array.scenarios[0].steps[3].hide, ['origen']);
const dir=await mkdtemp(join(tmpdir(),'walkthrough-'));
try {
 await cp('content',join(dir,'content'),{recursive:true}); await cp('scripts',join(dir,'scripts'),{recursive:true});
 await symlink(join(process.cwd(),'node_modules'),join(dir,'node_modules'));
 const graphic = join(dir,'content/walkthroughs/graphics/condicionales.svg');
 await rm(graphic);
 await symlink('/etc/hosts',graphic);
 assert.notEqual(spawnSync(process.execPath,['scripts/build.mjs'],{cwd:dir}).status,0,'graphic symlink escaping content must fail');
 await rm(graphic);
 await cp('content/walkthroughs/graphics/condicionales.svg',graphic);
 await rm(join(dir,'content',topic.walkthrough));
 assert.notEqual(spawnSync(process.execPath,['scripts/build.mjs'],{cwd:dir}).status,0,'missing source must fail');
 await symlink('/etc/hosts',join(dir,'content',topic.walkthrough));
 assert.notEqual(spawnSync(process.execPath,['scripts/build.mjs'],{cwd:dir}).status,0,'symlink escaping content must fail');
} finally { await rm(dir,{recursive:true,force:true}); }
console.log('Walkthrough source and publication contracts validated.');
const sequence = JSON.parse(await readFile('content/walkthroughs/bucles.json','utf8'));
const loop = course.topics.find(t=>t.id==='bucles');
const withSequence = structuredClone(published);
withSequence.topics.find(t=>t.id==='bucles').walkthrough=sequence;
validateCourse(withSequence, course.id);
assert.deepEqual(sequence.steps.map(step=>step.element),sequence.elements.map(element=>element.id));
assert.equal(sequence.steps.flatMap(step=>step.output ? [step.output] : []).join('\n'),'Paso 1\nPaso 2\nPaso 3\nListo');
for (const mutate of [w=>w.steps[0].element='missing',w=>w.elements[1].id=w.elements[0].id,w=>w.steps[0].line=999]) {
 const copy=structuredClone(withSequence); mutate(copy.topics.find(t=>t.id==='bucles').walkthrough);
 assert.throws(()=>validateCourse(copy,copy.id));
}

assert.equal(loop.walkthrough, 'walkthroughs/bucles.json');
assert.deepEqual(published.topics.find(t=>t.id==='bucles').walkthrough, sequence);
const execution = spawnSync('python3',['-c',loop.example],{encoding:'utf8'});
assert.equal(execution.status,0);
assert.equal(execution.stdout,sequence.steps.flatMap(step=>step.output ? [step.output] : []).join('\n')+'\n');
const collection = JSON.parse(await readFile('content/walkthroughs/listas-diccionarios.json','utf8'));
const withCollection = structuredClone(published);
withCollection.topics.find(t=>t.id==='listas-diccionarios').walkthrough=collection;
validateCourse(withCollection, course.id);
for (const mutate of [w=>w.groups[0].elements=[], w=>w.groups[1].id=w.groups[0].id, w=>w.groups[1].elements[0].id=w.groups[0].elements[0].id, w=>w.steps[0].element='missing', w=>w.steps[0].line=999, w=>w.groups[0].elements[0].key='']) {
 const copy=structuredClone(withCollection); mutate(copy.topics.find(t=>t.id==='listas-diccionarios').walkthrough);
 assert.throws(()=>validateCourse(copy,copy.id));
}
const collectionsTopic = course.topics.find(t=>t.id==='listas-diccionarios');
assert.equal(collectionsTopic.walkthrough, 'walkthroughs/listas-diccionarios.json');
assert.deepEqual(published.topics.find(t=>t.id==='listas-diccionarios').walkthrough, collection);
const collectionExecution = spawnSync('python3',['-c',collectionsTopic.example],{encoding:'utf8'});
assert.equal(collectionExecution.status,0);
assert.equal(collectionExecution.stdout, collection.steps.flatMap(step=>step.output ? [step.output] : []).join('\n')+'\n');
