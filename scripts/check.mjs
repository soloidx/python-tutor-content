import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateCatalog,validateCourse,publicationIcons,verifyIconSource} from './content-contract.mjs';
const catalog=validateCatalog(JSON.parse(await readFile('public/catalog.json','utf8')));
const courses={};
for(const record of catalog.courses){
 const bytes=await readFile(`public/${record.file}`);
 if(createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw new Error(`Hash mismatch: ${record.id}`);
 courses[record.id]=validateCourse(JSON.parse(bytes.toString('utf8')),record.id);
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
