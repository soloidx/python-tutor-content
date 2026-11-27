import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { courses, openTopic, saveTopic } from './scripts/editor-store.mjs';
const root=process.cwd();
const app=resolve(process.env.PYTHON_TUTOR_DIR || '../python_tutor');
export default defineConfig({
 root:'editor', resolve:{alias:{'@tutor':resolve(app,'src'),react:resolve(root,'node_modules/react'), 'react-dom':resolve(root,'node_modules/react-dom')}},
 server:{host:'127.0.0.1',fs:{allow:[root,app]},middlewareMode:false},
 plugins:[{name:'editor-api',configureServer(server){server.middlewares.use('/api',async(req,res,next)=>{
  try {
   const url=new URL(req.url,'http://localhost');
   res.setHeader('Content-Type','application/json');
   if(req.method==='GET'&&url.pathname==='/courses') return res.end(JSON.stringify((await courses(root)).map(({course})=>({id:course.id,title:course.title,topics:course.topics.map(({id,title})=>({id,title}))}))));
   if(req.method==='GET'&&url.pathname==='/topic') return res.end(JSON.stringify(await openTopic(root,url.searchParams.get('course'),url.searchParams.get('topic'))));
   if(req.method==='POST'&&url.pathname==='/save') {
    if(req.headers.origin && req.headers.origin!==`http://${req.headers.host}`) throw Error('Origen no permitido');
    let body=''; for await(const chunk of req) {body+=chunk; if(body.length>1024*1024) throw Error('Solicitud demasiado grande');}
    const data=JSON.parse(body); await saveTopic(root,data.course,data.topic,data.walkthrough); return res.end(JSON.stringify({ok:true}));
   }
   next();
  } catch(e) {res.statusCode=400;res.end(JSON.stringify({error:e.message}));}
 });}}]
});
