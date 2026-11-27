import assert from 'node:assert/strict';
import { readFile, mkdtemp, cp, symlink, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateSourceCourse, validateCourse } from './content-contract.mjs';
const course = JSON.parse(await readFile('content/courses/python-fundamentos.json','utf8'));
const topic = course.topics.find(t => t.id === 'condicionales');
const source = JSON.parse(await readFile(`content/${topic.walkthrough}`,'utf8'));
validateSourceCourse(course,course.id);
for (const value of ['../escape.json', '/absolute.json', 'walkthroughs/%2e.json']) {
 const copy=structuredClone(course); copy.topics.find(t=>t.id==='condicionales').walkthrough=value;
 assert.throws(()=>validateSourceCourse(copy,copy.id));
}
const published=JSON.parse(await readFile(`public/${JSON.parse(await readFile('public/catalog.json','utf8')).courses.find(c=>c.id===course.id).file}`,'utf8'));
assert.deepEqual(published.topics.find(t=>t.id==='condicionales').walkthrough,source);
for (const mutation of [w=>w.type='unknown', w=>w.scenarios[0].steps[0].line=999, w=>w.scenarios[0].steps[0].element='missing', w=>w.scenarios[1].id=w.scenarios[0].id]) {
 const copy=structuredClone(published); mutation(copy.topics.find(t=>t.id==='condicionales').walkthrough);
 assert.throws(()=>validateCourse(copy,copy.id));
}
const dir=await mkdtemp(join(tmpdir(),'walkthrough-'));
try {
 await cp('content',join(dir,'content'),{recursive:true}); await cp('scripts',join(dir,'scripts'),{recursive:true});
 await symlink(join(process.cwd(),'node_modules'),join(dir,'node_modules'));
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
for (const mutate of [w=>w.steps[0].element='missing',w=>w.steps.reverse(),w=>w.elements[1].id=w.elements[0].id,w=>w.steps[0].line=999]) {
 const copy=structuredClone(withSequence); mutate(copy.topics.find(t=>t.id==='bucles').walkthrough);
 assert.throws(()=>validateCourse(copy,copy.id));
}

assert.equal(loop.walkthrough, 'walkthroughs/bucles.json');
assert.deepEqual(published.topics.find(t=>t.id==='bucles').walkthrough, sequence);
const execution = spawnSync('python3',['-c',loop.example],{encoding:'utf8'});
assert.equal(execution.status,0);
assert.equal(execution.stdout,sequence.steps.flatMap(step=>step.output ? [step.output] : []).join('\n')+'\n');
