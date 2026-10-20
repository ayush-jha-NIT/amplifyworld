const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),base='http://127.0.0.1:4173/catalogue/';
async function main(){
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const results=[];fs.mkdirSync(path.join(root,'previews/storyboard'),{recursive:true});
 for(const width of [1440,1024,768,390,375]){
  const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'});
  for(const name of ['home','about','portfolio','blog','contact']){
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+name+'.html'+(name==='home'?'?time=7.2':''),{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager')});
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
   const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,images:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)}));
   const png=await page.screenshot({fullPage:true});
   await sharp(png).webp({quality:88}).toFile(path.join(root,`previews/${name}-${width}.webp`));
   if(width===1440||width===390)await sharp(png).png().toFile(path.join(root,`previews/${name}-${width}.png`));
   results.push({page:name,...metrics,overflow:metrics.scrollWidth>width,errors});
  }
  if([1440,1024,768,390,375].includes(width)){
   await page.goto(base+'blog.html?article=search',{waitUntil:'networkidle'});
   await page.screenshot({path:path.join(root,`previews/blog-reader-${width}.png`),fullPage:true});
  }
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const beats=[0,1.55,2.55,3.65,4.75,5.7,6.9,7.2];
 for(let i=0;i<beats.length;i++){
  await page.goto(base+'home.html?time='+beats[i],{waitUntil:'networkidle'});
  const png=await page.locator('.hero').screenshot();
  await sharp(png).webp({quality:88}).toFile(path.join(root,`previews/storyboard/beat-${i+1}.webp`));
 }
 await page.goto(base+'earth-study.html',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.earthStudyReady===true);
 await page.screenshot({path:path.join(root,'previews/earth-study.png'),fullPage:true});
 await page.goto(base+'index.html',{waitUntil:'networkidle'});await page.screenshot({path:path.join(root,'previews/component-catalogue.png'),fullPage:true});
 fs.mkdirSync(path.join(root,'previews/states'),{recursive:true});
 await page.goto(base+'portfolio.html',{waitUntil:'networkidle'});
 await page.locator('#portfolio-results').screenshot({path:path.join(root,'previews/states/carousel-active.png')});
 await page.locator('[data-next]').click();
 await page.locator('#portfolio-results').screenshot({path:path.join(root,'previews/states/carousel-entering.png')});
 await page.locator('[data-project-filter="Social Media"]').click();
 await page.locator('#portfolio-results').screenshot({path:path.join(root,'previews/states/carousel-empty.png')});
 await page.goto(base+'contact.html',{waitUntil:'networkidle'});
 await page.locator('[type=submit]').click();
 await page.locator('#contact-form').screenshot({path:path.join(root,'previews/states/contact-error.png')});
 await page.locator('#name').fill('Design Reviewer');await page.locator('#email').fill('review@example.com');await page.locator('#service').selectOption({label:'Not sure yet'});await page.locator('#message').fill('This is a local design preview validation only.');await page.locator('[type=submit]').click();
 await page.locator('#contact-form').screenshot({path:path.join(root,'previews/states/contact-loading.png')});
 await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('success'));
 await page.locator('#contact-form').screenshot({path:path.join(root,'previews/states/contact-success.png')});
 await page.goto(base+'contact.html?state=failed',{waitUntil:'networkidle'});
 await page.locator('#name').fill('Design Reviewer');await page.locator('#email').fill('review@example.com');await page.locator('#service').selectOption({label:'Not sure yet'});await page.locator('#message').fill('This is a local design preview validation only.');await page.locator('[type=submit]').click();
 await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('failed'));
 await page.locator('#contact-form').screenshot({path:path.join(root,'previews/states/contact-failed.png')});
 fs.writeFileSync(path.join(root,'previews/layout-checks.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results.map(x=>({page:x.page,width:x.width,height:x.height,overflow:x.overflow,missingImages:x.images.length,errors:x.errors})),null,2));
 await browser.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
