import { readdir, readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { readLessons } from './read-lessons.mjs';
import { readWalkthrough } from './read-walkthrough.mjs';
import { validateWalkthrough } from './walkthrough.js';
const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const json = async file => JSON.parse(await readFile(file,'utf8'));
const bytes = value => JSON.stringify(value,null,2)+'\n';
export async function courses(root) {
 const dir=join(root,'content/courses');
 return Promise.all((await readdir(dir)).filter(name=>name.endsWith('.json')).sort().map(async name=>({name,course:await json(join(dir,name))})));
}
async function locate(root,courseId,topicId) {
 if (!slug(courseId)||!slug(topicId)) throw Error('ID de curso o tema inválido');
 const matches=(await courses(root)).filter(x=>x.course.id===courseId);
 if(matches.length!==1) throw Error('Curso inexistente o duplicado');
 const {name,course}=matches[0], topics=course.topics.filter(x=>x.id===topicId);
 if(topics.length!==1) throw Error('Tema inexistente o duplicado');
 return {name,course,topic:topics[0]};
}
async function walkthroughPath(root,ref,existing=true) {
 if(typeof ref!=='string'||!/^walkthroughs\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(ref)) throw Error('Referencia de recorrido inválida');
 const dir=join(root,'content/walkthroughs'); await mkdir(dir,{recursive:true});
 const base=await realpath(dir), file=join(dir,ref.slice('walkthroughs/'.length));
 if(existing && !(await realpath(file)).startsWith(base+'/')) throw Error('Recorrido fuera del checkout');
 return file;
}
export async function openTopic(root,courseId,topicId) {
 const {topic}=await locate(root,courseId,topicId);
 if (topic.lessons) return { lessons: await readLessons(root, topic.lessons) };
 const walkthrough=topic.walkthrough ? await json(await walkthroughPath(root,topic.walkthrough)) : null;
 return {
  example:topic.example,
  walkthrough:walkthrough?.type==='svg' ? await readWalkthrough(root,topic.walkthrough,topic.example) : walkthrough,
 };
}
export async function saveTopic(root,courseId,topicId,value) {
 const {name,course,topic}=await locate(root,courseId,topicId);
 if(value?.type==='svg' || (topic.walkthrough && (await json(await walkthroughPath(root,topic.walkthrough))).type==='svg')) {
  throw Error('Edita el JSON y el SVG del recorrido en el repositorio de contenido.');
 }
 validateWalkthrough(value,topic.example);
 const ref=topic.walkthrough || `walkthroughs/${courseId}-${topicId}.json`;
 const file=await walkthroughPath(root,ref,!!topic.walkthrough);
 if(!topic.walkthrough) { try { await readFile(file); throw Error('Ya existe un recorrido con ese nombre'); } catch(e) {if(e.code!=='ENOENT') throw e;} }
 await writeFile(file,bytes(value),{flag:topic.walkthrough?'w':'wx'});
 if(!topic.walkthrough) {topic.walkthrough=ref; await writeFile(join(root,'content/courses',name),bytes(course));}
}
