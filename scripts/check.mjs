import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateCatalog,validateCourse,validateSourceCourse,validateSourceLearningPaths,publicationIcons,verifyIconSource} from './content-contract.mjs';
const sourcePaths=JSON.parse(await readFile('content/learning-paths.json','utf8'));
const sourceCourses=[];
for(const name of (await readdir('content/courses')).filter(name=>name.endsWith('.json')).sort()){
 const course=JSON.parse(await readFile(`content/courses/${name}`,'utf8'));
 validateSourceCourse(course,course.id);
 sourceCourses.push(course);
}
validateSourceLearningPaths(sourcePaths,sourceCourses.map(course=>course.id));
const catalog=validateCatalog(JSON.parse(await readFile('public/catalog.json','utf8')));
if(new Set(catalog.courses.map(record=>record.id)).size!==sourceCourses.length ||
   sourceCourses.some(course=>!catalog.courses.some(record=>record.id===course.id)))
 throw new Error('Catalog does not contain every editable course.');
const courses={};
function requirePublishedTypes(course,id){
 for(const topic of course.topics){
  for(const exercise of topic.exercises){
   if(!Object.hasOwn(exercise,'type') || !['code','choice'].includes(exercise.type))
    throw new Error(`Current course ${id} has no explicit exercise type: ${exercise.id}`);
  }
 }
}
for(const record of catalog.courses){
 const bytes=await readFile(`public/${record.file}`);
 if(createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw new Error(`Hash mismatch: ${record.id}`);
 courses[record.id]=validateCourse(JSON.parse(bytes.toString('utf8')),record.id);
 requirePublishedTypes(courses[record.id],record.id);
}
// Previously published files remain immutable and independently valid.
for(const name of await readdir('public/courses')){
 const bytes=await readFile(`public/courses/${name}`);
 const course=JSON.parse(bytes.toString('utf8')); validateCourse(course,course.id);
 const expected=`${course.id}.${createHash('sha256').update(bytes).digest('hex')}.json`;
 if(name!==expected)throw new Error(`Invalid immutable filename: ${name}`);
}
console.log('Complete publication and retained course files validated.');

for(const icon of publicationIcons(catalog,courses))await verifyIconSource(icon,await readFile(`public/${icon.file}`,'utf8'));
for(const name of await readdir('public/icons')){
 const source=await readFile(`public/icons/${name}`,'utf8');
 const sha256=createHash('sha256').update(source).digest('hex');
 await verifyIconSource({file:`icons/${name}`,sha256},source);
 if(!name.endsWith(`.${sha256}.svg`))throw new Error(`Invalid immutable icon filename: ${name}`);
}
console.log('SVG icons and their integrity validated.');
