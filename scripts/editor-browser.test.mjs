import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, rm, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

test('editor previews, saves, reopens and exports independent sequence orders', async () => {
 const root=await mkdtemp(join(process.cwd(),'.editor-test-'));
 let server, browser;
 try {
  for(const name of ['content','editor','scripts','vite.config.mjs']) await cp(name,join(root,name),{recursive:true});
  await cp('node_modules',join(root,'node_modules'),{recursive:true});
  server=spawn(process.execPath,[resolve('node_modules/vite/bin/vite.js'),'--config','vite.config.mjs','--port','5188','--strictPort'],{cwd:root,env:{...process.env,PYTHON_TUTOR_DIR:process.env.PYTHON_TUTOR_DIR||resolve('../python_tutor')},stdio:'ignore'});
  for(let i=0;i<100;i++){try {if((await fetch('http://127.0.0.1:5188/api/courses')).ok)break;}catch{} await new Promise(r=>setTimeout(r,100));if(i===99)throw Error('Editor did not start');}
  browser=await chromium.launch({headless:true,channel:'chrome'});
  for(const width of [1280,390]) {
   const page=await browser.newPage({viewport:{width,height:844},acceptDownloads:true});
   await page.goto('http://127.0.0.1:5188/');
   await page.getByLabel('Curso').selectOption('python-fundamentos');
   await page.getByLabel('Tema').selectOption('bucles');
   await page.getByRole('heading',{name:'Vista previa'}).waitFor();
   assert.deepEqual(await page.locator('.walkthrough-diagram .walkthrough-element').allTextContents(),['Iniciar el bucle','Vuelta 1','Vuelta 2','Vuelta 3','Después del bucle']);
   await page.getByRole('button',{name:'Después del bucle',exact:true}).click();
   assert.equal(await page.getByLabel('Salida del recorrido').textContent(),'Paso 1\nPaso 2\nPaso 3\nListo');
   await page.getByRole('button',{name:'Vuelta 2',exact:true}).click();
   assert.equal(await page.getByLabel('Salida del recorrido').textContent(),'Paso 1\nPaso 2');
   if(width===1280){
    await page.getByRole('button',{name:'Bajar elemento'}).first().click();
    await page.getByRole('button',{name:'Bajar paso'}).first().click();
    await page.getByRole('button',{name:'Guardar',exact:true}).click();
    await page.getByText('Guardado en el checkout.').waitFor();
    const downloadPromise=page.waitForEvent('download'); await page.getByRole('button',{name:'Exportar JSON'}).click();
    const download=await downloadPromise; const exported=JSON.parse(await readFile(await download.path(),'utf8'));
    assert.equal(exported.elements[0].id,'vuelta-1'); assert.equal(exported.steps[0].element,'vuelta-1');
    await page.getByRole('button',{name:'Subir elemento'}).nth(1).click();
    await page.getByRole('button',{name:'Guardar',exact:true}).click();
    await page.getByText('Guardado en el checkout.').waitFor();
    await page.reload(); await page.getByLabel('Curso').selectOption('python-fundamentos'); await page.getByLabel('Tema').selectOption('bucles');
    await page.getByRole('heading',{name:'Vista previa'}).waitFor();
    assert.equal(await page.locator('.walkthrough-diagram .walkthrough-element').first().textContent(),'Iniciar el bucle');
    assert.equal(await page.getByLabel('Salida del recorrido').textContent(),'Paso 1');
   }
   if(width===390){
    await page.getByLabel('Tema').selectOption('funciones');
    await page.getByLabel('Tipo de recorrido').selectOption('sequence');
    assert.equal(await page.getByRole('button',{name:'Guardar',exact:true}).isDisabled(),true);
    await page.getByLabel('Etiqueta').first().fill('Inicio');
    await page.getByLabel('Explicación').first().fill('Comienza.');
    await page.getByRole('button',{name:'Añadir elemento'}).click();
    await page.getByLabel('Etiqueta').nth(1).fill('Otro');
    await page.getByLabel('ID',{exact:true}).nth(1).fill('elemento-1');
    assert.equal(await page.getByRole('button',{name:'Exportar JSON'}).isDisabled(),true);
    await page.getByLabel('ID',{exact:true}).nth(1).fill('otro');
    await page.getByRole('button',{name:'Guardar',exact:true}).click();
    await page.getByText('Guardado en el checkout.').waitFor();
    await page.reload(); await page.getByLabel('Curso').selectOption('python-fundamentos'); await page.getByLabel('Tema').selectOption('funciones');
    await page.getByRole('heading',{name:'Vista previa'}).waitFor();
    assert.deepEqual(await page.locator('.walkthrough-diagram .walkthrough-element').allTextContents(),['Inicio','Otro']);
   }
   await page.close();
  }
 } finally {await browser?.close();server?.kill();await rm(root,{recursive:true,force:true});}
});

test('collection editor previews, validates, saves and exports', async () => {
 const root=await mkdtemp(join(process.cwd(),'.editor-test-')); let server,browser;
 try {
  for(const name of ['content','editor','scripts','vite.config.mjs','node_modules']) await cp(name,join(root,name),{recursive:true});
  server=spawn(process.execPath,[resolve('node_modules/vite/bin/vite.js'),'--config','vite.config.mjs','--port','5189','--strictPort'],{cwd:root,env:{...process.env,PYTHON_TUTOR_DIR:process.env.PYTHON_TUTOR_DIR||resolve('../python_tutor')},stdio:'ignore'});
  for(let i=0;i<100;i++){try {if((await fetch('http://127.0.0.1:5189/api/courses')).ok)break;}catch{} await new Promise(r=>setTimeout(r,100));if(i===99)throw Error('Editor did not start');}
  browser=await chromium.launch({headless:true,channel:'chrome'});
  for(const width of [1280,390]) {
   const page=await browser.newPage({viewport:{width,height:844},acceptDownloads:true});
   await page.goto('http://127.0.0.1:5189/'); await page.getByLabel('Curso').selectOption('python-fundamentos'); await page.getByLabel('Tema').selectOption('listas-diccionarios');
   await page.getByRole('heading',{name:'Vista previa'}).waitFor();
   assert.equal(await page.getByRole('heading',{name:'Colección'}).count(),1);
   await page.getByRole('button',{name:'0: rojo'}).click(); assert.equal(await page.getByLabel('Salida del recorrido').textContent(),'rojo');
   await page.getByRole('button',{name:'titulo: Python'}).click(); assert.equal(await page.getByLabel('Salida del recorrido').textContent(),'rojo\nPython');
   assert.equal(await page.locator('.walkthrough-diagram div.walkthrough-entry').count()>0,true);
   assert.equal(await page.getByText('verde',{exact:false}).first().isVisible(),true);
   assert.equal(await page.getByRole('button',{name:'Guardar',exact:true}).isDisabled(),false);
   if(width===1280){
    const groups=page.locator('fieldset.collection-group');
    await groups.first().getByRole('button',{name:'Añadir elemento'}).click();
    const added=groups.first().locator('fieldset').last();
    await added.getByLabel('Clave o índice').fill('0'); await added.getByLabel('Valor').fill('amarillo');
    assert.equal(await page.getByRole('button',{name:'Guardar',exact:true}).isDisabled(),true);
    await added.getByLabel('Clave o índice').fill('3');
    await page.getByRole('button',{name:'Guardar',exact:true}).click(); await page.getByText('Guardado en el checkout.').waitFor();
    const downloadPromise=page.waitForEvent('download'); await page.getByRole('button',{name:'Exportar JSON'}).click();
    const exported=JSON.parse(await readFile(await (await downloadPromise).path(),'utf8')); assert.equal(exported.groups[0].elements.at(-1).value,'amarillo');
    await page.reload(); await page.getByLabel('Curso').selectOption('python-fundamentos'); await page.getByLabel('Tema').selectOption('listas-diccionarios');
    await page.getByRole('heading',{name:'Vista previa'}).waitFor(); assert.equal(await page.locator('.walkthrough-diagram').getByText('amarillo', {exact:true}).count(),1);
   }
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
   if(width===390){
    await page.getByLabel('Tema').selectOption('funciones'); await page.getByLabel('Tipo de recorrido').selectOption('collection');
    const groups=page.locator('fieldset.collection-group');
    await groups.nth(0).getByLabel('Valor').fill('rojo');
    await groups.nth(1).getByLabel('Clave o índice').fill('titulo'); await groups.nth(1).getByLabel('Valor').fill('Python');
    await page.getByLabel('Explicación').fill('Lee el primer elemento.');
    await page.getByRole('button',{name:'Guardar',exact:true}).click(); await page.getByText('Guardado en el checkout.').waitFor();
    await page.reload(); await page.getByLabel('Curso').selectOption('python-fundamentos'); await page.getByLabel('Tema').selectOption('funciones');
    await page.getByRole('heading',{name:'Colección'}).waitFor();
    assert.equal(await page.locator('.walkthrough-diagram').getByText('Python',{exact:true}).count(),1);
   }
   await page.close();
  }
 } finally {await browser?.close();server?.kill();await rm(root,{recursive:true,force:true});}
});
