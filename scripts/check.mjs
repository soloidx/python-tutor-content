import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateCatalog,validateCourse} from './content-contract.mjs';
const catalog=validateCatalog(JSON.parse(await readFile('public/catalog.json','utf8')));
for(const record of catalog.courses){
 const bytes=await readFile(`public/${record.file}`);
 if(createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw new Error(`Hash mismatch: ${record.id}`);
 validateCourse(JSON.parse(bytes.toString('utf8')),record.id);
}
// Previously published files remain immutable and independently valid.
for(const name of await readdir('public/courses')){
 const bytes=await readFile(`public/courses/${name}`);
 const course=JSON.parse(bytes.toString('utf8')); validateCourse(course,course.id);
 const expected=`${course.id}.${createHash('sha256').update(bytes).digest('hex')}.json`;
 if(name!==expected)throw new Error(`Invalid immutable filename: ${name}`);
}
console.log('Complete publication and retained course files validated.');
