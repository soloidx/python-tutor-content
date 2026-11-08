import {readFile,writeFile,readdir,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateCatalog,validateCourse} from './content-contract.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
const learningPaths = JSON.parse(await readFile('content/learning-paths.json','utf8'));
const documents = [];
for (const name of (await readdir('content/courses')).filter(n=>n.endsWith('.json')).sort()) {
  const course=JSON.parse(await readFile(`content/courses/${name}`,'utf8'));
  validateCourse(course,course.id);
  const bytes=JSON.stringify(course,null,2)+'\n';
  const sha256=hash(bytes);
  documents.push({course,bytes,record:{id:course.id,file:`courses/${course.id}.${sha256}.json`,sha256}});
}
const courses=documents.map(d=>d.record);
const revision=hash(JSON.stringify({learningPaths,courses}));
const catalog={schemaVersion:1,revision,learningPaths,courses};
validateCatalog(catalog);
await mkdir('public/courses',{recursive:true});
for(const {bytes,record} of documents) {
  const file=`public/${record.file}`;
  let existing; try {existing=await readFile(file,'utf8');} catch(e) {if(e.code!=='ENOENT')throw e;}
  if(existing!==undefined && existing!==bytes) throw new Error(`Immutable file changed: ${file}`);
  await writeFile(file,bytes);
}
// Keep old hashed files: clients may still be downloading an earlier manifest.
await writeFile('public/catalog.json',JSON.stringify(catalog,null,2)+'\n');
await writeFile('public/.nojekyll','');
console.log(`Built ${revision}: ${learningPaths.length} paths, ${courses.length} courses`);
