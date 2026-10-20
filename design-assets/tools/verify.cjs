const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),base='http://127.0.0.1:4173/catalogue/';
const checks=[];function ok(name,value,detail=''){checks.push({name,passed:!!value,detail});assert.ok(value,name+': '+detail)}
const rgb=h=>h.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
const lum=h=>rgb(h).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const l=[lum(a),lum(b)].sort((a,b)=>b-a);return +( (l[0]+.05)/(l[1]+.05)).toFixed(2)};
async function main(){
 const m=JSON.parse(fs.readFileSync(path.join(root,'asset-manifest.json')));
 for(const e of m.entries){ok('File exists: '+e.filename,fs.existsSync(path.resolve(root,'..',e.filename)));ok('Source exists: '+e.source,fs.existsSync(path.resolve(root,'..',e.source)))}
 const layouts=JSON.parse(fs.readFileSync(path.join(root,'previews/layout-checks.json')));
 ok('25 page/width combinations captured',layouts.length===25);
 ok('No horizontal page overflow',layouts.every(x=>!x.overflow));
 ok('No missing images in page captures',layouts.every(x=>x.images.length===0));
 const contrasts=[['Body on canvas','#f8f5fc','#03040a'],['Muted on surface','#beb7ce','#0b0b16'],['Primary button start','#f8f5fc','#7900d8'],['Primary button end','#f8f5fc','#9b07db'],['Error on surface','#ffb5cb','#0b0b16'],['Focus on canvas','#edb7ff','#03040a']].map(([name,a,b])=>({name,ratio:ratio(a,b),minimum:4.5}));
 contrasts.forEach(c=>ok(c.name+' contrast',c.ratio>=c.minimum,String(c.ratio)));
 const glb=fs.readFileSync(path.join(root,'exports/scene/earth-orbits.glb'));ok('GLB header and byte length',glb.readUInt32LE(0)===0x46546c67&&glb.readUInt32LE(8)===glb.length);
 const gltf=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());ok('GLB has animatable nodes and embedded texture',gltf.nodes.some(n=>n.name==='EarthRevolve')&&gltf.images.length===1);
 const browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'portfolio.html',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Next project',exact:true}).click();ok('Carousel changes active project',(await page.locator('.carousel-copy h2').innerText()).includes('Local'));
 await page.getByRole('button',{name:'Social Media',exact:true}).click();ok('Empty filter state visible',await page.getByRole('heading',{name:'No matching concepts'}).isVisible());
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();await page.getByRole('button',{name:'View Concept',exact:false}).click();ok('Project detail dialog opens',await page.locator('#project-dialog').isVisible());await page.keyboard.press('Escape');ok('Escape closes detail dialog',!await page.locator('#project-dialog').isVisible());
 await page.goto(base+'blog.html',{waitUntil:'networkidle'});await page.locator('[data-article="search"]').click();ok('Blog uses same pathname with query',new URL(page.url()).pathname.endsWith('/blog.html')&&new URL(page.url()).searchParams.get('article')==='search');ok('Full article content available',(await page.locator('.article-content section').count())===6);await page.goBack();ok('Back closes inline reader',!await page.locator('#reader').isVisible());await page.goForward();ok('Forward restores reader',await page.locator('#reader').isVisible());
 await page.goto(base+'blog.html?article=ai',{waitUntil:'networkidle'});ok('Direct article link resolves',(await page.locator('#article-title').innerText()).includes('interaction'));
 await page.goto(base+'contact.html',{waitUntil:'networkidle'});await page.locator('[type=submit]').click();ok('Invalid form identifies first field',await page.locator('#name').getAttribute('aria-invalid')==='true');await page.locator('#name').fill('Design Reviewer');await page.locator('#email').fill('review@example.com');await page.locator('#service').selectOption({label:'Not sure yet'});await page.locator('#message').fill('This is a local design preview validation only.');await page.locator('[type=submit]').click();await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('success'));ok('Form success explicitly simulated',(await page.locator('#form-status').innerText()).includes('no message was sent'));
 await page.goto(base+'contact.html?state=failed',{waitUntil:'networkidle'});await page.locator('#name').fill('Design Reviewer');await page.locator('#email').fill('review@example.com');await page.locator('#service').selectOption({label:'Not sure yet'});await page.locator('#message').fill('This is a local design preview validation only.');await page.locator('[type=submit]').click();await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('failed'));ok('Failed form preserves input',(await page.locator('#message').inputValue()).length>20);
 await page.getByRole('button',{name:"Let's Grow",exact:true}).click();ok('WhatsApp missing-number state is truthful',await page.locator('#whatsapp-dialog').isVisible());await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'home.html',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Open menu'}).click();ok('Mobile menu opens',await page.locator('#navigation').isVisible());await page.keyboard.press('Escape');ok('Mobile Escape restores disclosure',await page.locator('.menu').getAttribute('aria-expanded')==='false');ok('Reduced motion resolves to final hero',await page.locator('.scene').getAttribute('data-time')==='7.20');
 await page.goto(base+'earth-study.html?fallback=1',{waitUntil:'networkidle'});ok('No-WebGL fallback displayed',await page.locator('#earth-fallback').isVisible());
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'earth-study.html',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.earthStudyReady===true);ok('Earth study WebGL active',(await page.locator('#study-status').innerText()).includes('WebGL active'));await page.locator('#earth-pause').click();ok('Earth motion pause works',await page.locator('#earth-pause').getAttribute('aria-pressed')==='true');
 ok('No uncaught browser errors',errors.length===0,JSON.stringify(errors));
 await browser.close();
 fs.writeFileSync(path.join(root,'previews/verification-results.json'),JSON.stringify({date:'2026-10-20',checks,contrasts,summary:{passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length},limitations:['Not a production frontend build','No real device thermal/FPS validation','No screen-reader certification','Production WhatsApp and inquiry delivery pending verified data and later modules']},null,2));
 console.log(JSON.stringify({passed:checks.length,contrasts},null,2));
}
main().catch(e=>{fs.writeFileSync(path.join(root,'previews/verification-failure.json'),JSON.stringify({checks,error:e.message},null,2));console.error(e);process.exit(1)});
