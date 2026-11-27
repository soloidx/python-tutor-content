import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openTopic, saveTopic } from './editor-store.mjs';

test('creates, reopens and validates a decision in an editable checkout', async () => {
 const root=await mkdtemp(join(tmpdir(),'tutor-editor-'));
 try {
  await mkdir(join(root,'content/courses'),{recursive:true});
  await writeFile(join(root,'content/courses/course.json'),JSON.stringify({id:'course',topics:[{id:'topic',example:'x = 1\nif x:\n  print(x)'}]}));
  const value={type:'decision',elements:[{id:'condition',label:'x'}, {id:'if',label:'if'}, {id:'else',label:'else'}],scenarios:[{id:'one',label:'One',replacement:{line:1,code:'x = 1'},steps:[{line:2,element:'condition',explanation:'Test'}]}]};
  await saveTopic(root,'course','topic',value);
  assert.deepEqual((await openTopic(root,'course','topic')).walkthrough,value);
  assert.equal(JSON.parse(await readFile(join(root,'content/courses/course.json'))).topics[0].walkthrough,'walkthroughs/course-topic.json');
  value.scenarios[0].steps[0].explanation='Changed';
  await saveTopic(root,'course','topic',value);
  assert.equal((await openTopic(root,'course','topic')).walkthrough.scenarios[0].steps[0].explanation,'Changed');
  value.scenarios[0].steps[0].element='missing';
  await assert.rejects(saveTopic(root,'course','topic',value));
  assert.equal((await openTopic(root,'course','topic')).walkthrough.scenarios[0].steps[0].element,'condition');
 } finally { await rm(root,{recursive:true,force:true}); }
});
