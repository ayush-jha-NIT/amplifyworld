/* Isolated interaction studies. No API requests, lead storage or production wiring. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const menu=$('.menu'),navigation=$('.nav-links');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',open);menu.setAttribute('aria-label',open?'Close menu':'Open menu');navigation.classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation.classList.contains('open')){navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
$$('[data-whatsapp]').forEach(b=>b.addEventListener('click',()=>$('#whatsapp-dialog').showModal()));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d&&e.offsetX<0)d.close();}));
// Hero reference: independent SVG path and layers, time-addressable for design QA.
if($('.scene')){
 const scene=$('.scene'),road=$('#road-progress'),pulse=$('#travel-light'),len=road.getTotalLength();
 let time=0,paused=false,raf=0,last=0; const query=new URLSearchParams(location.search),fixed=query.has('time');
 const set=(el,opacity,dy=0)=>{el.style.opacity=opacity;el.style.translate=`0 ${dy}px`;};
 function draw(t){
  time=t;const p=Math.min(1,Math.max(0,(t-.5)/4.3));road.style.strokeDasharray=len;road.style.strokeDashoffset=len*(1-p);
  const point=road.getPointAtLength(p*len);pulse.setAttribute('cx',point.x);pulse.setAttribute('cy',point.y);pulse.style.opacity=t>.5&&t<5.2?1:0;
  $$('.milestone').forEach((m,i)=>{const v=Math.max(0,Math.min(1,(t-[1.1,2.1,3.2,4.3][i])/.45));set(m,v,(1-v)*8)});
  set($('.scene-mark'),Math.max(0,Math.min(1,(t-4.9)/.8)));
  set($('.scene-globe'),.28+.72*Math.max(0,Math.min(1,(t-5.7)/1.2)));
  scene.dataset.time=t.toFixed(2);
 }
 function tick(now){if(!last)last=now;const delta=Math.min((now-last)/1000,.05);last=now;if(!paused&&!document.hidden){draw(Math.min(7.2,time+delta));}if(time<7.2)raf=requestAnimationFrame(tick);}
 function play(){cancelAnimationFrame(raf);time=0;last=0;paused=false;$('[data-pause]').textContent='Pause motion';$('[data-pause]').setAttribute('aria-pressed','false');draw(reduced.matches?7.2:0);if(!reduced.matches)raf=requestAnimationFrame(tick);}
 $('[data-replay]').addEventListener('click',play);
 $('[data-pause]').addEventListener('click',e=>{paused=!paused;e.target.setAttribute('aria-pressed',paused);e.target.textContent=paused?'Resume motion':'Pause motion';});
 reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);draw(7.2)}});
 if(fixed||reduced.matches)draw(fixed?Number(query.get('time')):7.2);else play();
}
const projects=[
 {id:'website',name:'Growth website concept',category:'Web Development',description:'A purposeful business website concept with a clear hierarchy, considered content and a straightforward path to inquiry.'},
 {id:'local',name:'Local discovery concept',category:'SEO & GEO',description:'An illustrative local-discovery experience designed to help a business present its services clearly and consistently.'},
 {id:'campaign',name:'Campaign concept',category:'Performance Marketing',description:'A concept for a focused campaign landing experience, connecting the message, creative direction and next step.'}
];
if($('#portfolio-results')){
 let filter='All',search='',index=0,list=projects;
 const results=$('#portfolio-results');
 function render(){
  list=projects.filter(p=>(filter==='All'||p.category===filter)&&p.name.toLowerCase().includes(search));
  index=Math.min(index,Math.max(0,list.length-1));
  if(!list.length){results.innerHTML='<div class="empty"><h3>No matching concepts</h3><p>Try another category or clear your search.</p><button class="btn" id="clear-projects">Clear filters</button></div>';$('#clear-projects').onclick=()=>{filter='All';search='';$('#project-search').value='';$$('[data-project-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.projectFilter==='All'));render();$('[data-project-filter]').focus()};return;}
  const p=list[index],ordered=list.map((_,i)=>list[(i+index)%list.length]);
  results.innerHTML=`<div class="carousel-layout"><div class="carousel-copy"><div class="eyebrow">Featured concept</div><div class="concept-label">Concept / Placeholder</div><h2>${p.name}</h2><p>${p.description}</p><span class="badge">${p.category}</span><div class="actions"><button class="btn primary" data-detail="${p.id}">View Concept ↗</button></div></div><div><div class="carousel-stage" aria-label="Featured project cards">${ordered.map((x,i)=>`<div class="slide" ${i?'aria-hidden="true"':''}><img src="../exports/templates/project-${x.id}.svg" alt="${i?'':x.name+' — design concept, not client work'}"><div class="slide-label"><span>CONCEPT / PLACEHOLDER</span><span>${index+1} / ${list.length}</span></div></div>`).join('')}</div><div class="carousel-controls"><button class="round" data-prev aria-label="Previous project" ${list.length<2?'disabled':''}>‹</button><div class="dots">${list.map((x,i)=>`<button class="dot" data-slide="${i}" aria-label="Show ${x.name}" aria-current="${i===index}"></button>`).join('')}</div><button class="round" data-next aria-label="Next project" ${list.length<2?'disabled':''}>›</button></div><p class="annotation" style="margin-top:14px" role="status">Project ${index+1} of ${list.length}. ${p.name}.</p></div></div><div class="project-rail">${list.map(x=>`<button class="project-card" data-detail="${x.id}"><img src="../exports/templates/project-${x.id}.svg" alt=""><div class="caption"><div class="concept-label">Concept / Placeholder</div><h3>${x.name}</h3><span class="badge">${x.category}</span></div></button>`).join('')}</div>`;
  const move=(direction,focus)=>{index=(index+direction+list.length)%list.length;render();$(focus)?.focus({preventScroll:true})};
  if(!reduced.matches){$('.carousel-stage .slide')?.animate([{opacity:.25,translate:'28px 0'},{opacity:1,translate:'0 0'}],{duration:620,easing:'cubic-bezier(.22,1,.36,1)'})}
  $('[data-prev]')?.addEventListener('click',()=>move(-1,'[data-prev]'));
  $('[data-next]')?.addEventListener('click',()=>move(1,'[data-next]'));
  $$('[data-slide]').forEach(b=>b.onclick=()=>{index=+b.dataset.slide;render();$(`[data-slide="${index}"]`).focus({preventScroll:true})});
  $$('[data-detail]').forEach(b=>b.onclick=()=>{const x=projects.find(p=>p.id===b.dataset.detail);$('#project-detail').innerHTML=`<div class="eyebrow">Concept / Placeholder</div><h2>${x.name}</h2><img src="../exports/templates/project-${x.id}.svg" alt="${x.name} concept"><p>${x.description}</p><h3>Design scope</h3><p>Interface hierarchy, responsive layout, content framing and a clear call to action.</p><h3>Client content pending</h3><p>This is an illustrative template. There are no client names, verified outcomes or live-project links associated with it.</p>`;$('#project-dialog').showModal()});
  let start=0;$('.carousel-stage')?.addEventListener('pointerdown',e=>{start=e.clientX});$('.carousel-stage')?.addEventListener('pointerup',e=>{const d=e.clientX-start;if(Math.abs(d)>60)move(d<0?1:-1,d<0?'[data-next]':'[data-prev]')});
 }
 $$('[data-project-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.projectFilter;index=0;$$('[data-project-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));render()});
 $('#project-search').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();index=0;render()});render();
}
const articleData={
 search:{title:'A clearer path from search to your business',category:'SEO & GEO',intro:'This sample article demonstrates the complete reading experience. It is original design-preview copy, not a published AmplifyWorld article or a claim about client performance.',sections:[
 ['Start with the question','Before choosing a channel, make the customer’s question clear. What do they need to understand? What would help them decide whether to get in touch? A useful page begins by answering those questions in plain language.'],
 ['Make the offer understandable','Describe the service, who it is for and what the next step involves. A coherent page gives each idea space. Headings help the reader scan; supporting copy helps them decide. Avoid adding statistics or credentials that cannot be substantiated.'],
 ['Connect the experience','The message a person sees before arriving should connect with the content they find on the page. Treat navigation, service descriptions and inquiry forms as parts of the same experience. Review the journey on a phone as well as a larger screen.'],
 ['Build a useful next step','A call to action should explain what happens next. Make the form understandable, ask for only useful information and keep errors close to the relevant fields. Give people a way to revisit their details if a request fails.'],
 ['A practical review','Read the page from beginning to end. Check whether the main idea is visible, whether the supporting sections answer real questions and whether the contact path is clear. These are review prompts for the design, not a promise of search rankings or revenue.'],
 ['Key takeaways','Begin with the customer’s question. Use a coherent hierarchy. Keep claims verifiable. Give the next step a clear purpose. Revisit the experience as the business and its audience develop.']
 ]},
 ai:{title:'Give every website interaction a purpose',category:'Agentic AI',intro:'Original design sample. This article demonstrates the inline reading layout and does not describe an existing client implementation.',sections:[
 ['Define the job','Start with a specific user need. A helpful interaction makes one task easier to understand or complete. Give the feature a clear boundary before considering visual effects or conversational behavior.'],
 ['Keep the user informed','Explain the purpose of the interaction and the information it needs. Clear labels and predictable steps help people understand what they are doing. Avoid collecting information simply because a field is available.'],
 ['Design the handoff','Some requests need a person. Make that transition visible and preserve the user’s context where appropriate. The interface should explain what happens next without promising a response time the business has not confirmed.'],
 ['Plan for uncertainty','A useful design includes loading, empty, error and unavailable states. Keep the previous input intact when a retry is possible. Explain errors with specific, actionable language.'],
 ['Review the experience','Try the experience with a keyboard, on a small screen and with reduced motion enabled. Check that the intended next step remains clear in each state.']
 ]},
 strategy:{title:'Start with the business. Build the growth plan.',category:'Strategy',intro:'Original sample editorial copy for design review. No results, client stories or authorship claims are implied.',sections:[
 ['Understand the starting point','A plan begins with the business: its offer, audience, resources and priorities. Make the current situation explicit so the work has a shared foundation.'],
 ['Choose the priorities','A focused plan makes tradeoffs visible. Decide which problem needs attention first and which activities can follow. A short list of considered priorities is easier to communicate and review.'],
 ['Connect the disciplines','Creative work, websites and marketing need a shared direction. Keep the message coherent across each part of the experience and identify the decisions that depend on one another.'],
 ['Make room to learn','A plan should include time to review the work. Discuss what has changed, what is understood and what still needs exploration. Use evidence that is available and avoid drawing conclusions from invented results.'],
 ['Agree on the next step','Finish with a clear action, an owner and a realistic scope. A shared direction helps everyone understand how their work contributes to the wider business goal.']
 ]},
 social:{title:'One message. A more coherent social presence.',category:'Social Media',intro:'Original sample article for this design catalogue. It is not a published case study or a performance recommendation.',sections:[
 ['Find the central idea','A coherent presence begins with a clear message. Decide what the audience should understand about the business and how that idea connects to their needs.'],
 ['Plan the content','Outline the purpose of each piece before production. A simple plan can connect shooting, editing and publishing around the same idea. Keep space for the format and context in which people will encounter it.'],
 ['Create with consistency','Consistency comes from repeated decisions about language, imagery and hierarchy. Use the brand system as a guide while allowing each piece to serve its own purpose.'],
 ['Review before publishing','Check the content, permissions, factual claims and destination links. Make sure captions and supporting text communicate the intended message without relying entirely on the visual.'],
 ['Learn from the work','Keep notes on the process and the questions that arise. Use verified information when discussing performance. This sample demonstrates editorial typography, not a claim about social-media results.']
 ]}
};
if($('#article-grid')){
 let filter='All',search='',lastCard=null,listY=0;
 const reader=$('#reader');
 function filterArticles(){let n=0;$$('[data-article]').forEach(c=>{const yes=(filter==='All'||c.dataset.category===filter)&&c.textContent.toLowerCase().includes(search);c.hidden=!yes;if(yes)n++});$('#article-empty').hidden=n>0;}
 $$('[data-blog-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.blogFilter;$$('[data-blog-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));filterArticles()});
 $('#article-search').oninput=e=>{search=e.target.value.toLowerCase();filterArticles()};
 $('[data-clear-articles]').onclick=()=>{filter='All';search='';$('#article-search').value='';$$('[data-blog-filter]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.blogFilter==='All'));filterArticles()};
 function openArticle(id,push=true,focus=true){
  const a=articleData[id];if(!a)return;
  if(push){listY=scrollY;history.replaceState({listY},'',location.href);const u=new URL(location.href);u.searchParams.set('article',id);history.pushState({article:id,listY},'',u)}
  reader.classList.remove('hidden');
  reader.innerHTML=`<div class="reader-bar"><span class="eyebrow">You’re reading on this page</span><div class="reader-progress"><span id="progress-label">Reading progress 0%</span><progress id="reading-progress" value="0" max="100" aria-label="Reading progress"></progress></div><button class="round" id="close-reader" aria-label="Close article">×</button></div><div class="reader-layout"><nav class="toc" aria-label="In this article"><h3>In This Article</h3>${a.sections.map(([t],i)=>`<a href="#article-section-${i}">${String(i+1).padStart(2,'0')} · ${t}</a>`).join('')}<button class="btn small" id="share-article" style="margin-top:20px">Copy article link</button><span id="share-status" role="status"></span></nav><article class="article-content"><span class="badge">${a.category}</span><h2 id="article-title" tabindex="-1" style="margin-top:16px">${a.title}</h2><p class="article-meta">Design sample · Editorial layout demonstration</p><p>${a.intro}</p><img class="article-cover" src="../exports/artwork/editorial-${id}-1200.webp" alt="Original abstract ${a.category} illustration">${a.sections.map(([t,b],i)=>`<section><h3 id="article-section-${i}">${i+1}. ${t}</h3><p>${b}</p></section>`).join('')}<aside>Design note: replace sample content with reviewed editorial copy, verified author information and genuine publication metadata before launch.</aside><h3>More ideas to explore</h3><div class="actions">${Object.keys(articleData).filter(k=>k!==id).slice(0,2).map(k=>`<button class="btn" data-related="${k}">${articleData[k].category} →</button>`).join('')}</div></article></div>`;
  $('#close-reader').onclick=()=>{if(history.state?.article)history.back();else{const u=new URL(location.href);u.searchParams.delete('article');history.replaceState({},'',u);closeArticle()}};
  $('#share-article').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('#share-status').textContent='Link copied.'}catch{$('#share-status').textContent='Copy the URL from your browser.'}};
  $$('[data-related]').forEach(b=>b.onclick=()=>openArticle(b.dataset.related));
  if(focus){reader.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});$('#article-title').focus({preventScroll:true})}
  updateProgress();
 }
 function closeArticle(){reader.classList.add('hidden');reader.innerHTML='';scrollTo({top:history.state?.listY??listY,behavior:'instant'});lastCard?.focus({preventScroll:true})}
 function updateProgress(){const article=$('.article-content');if(!article)return;const rect=article.getBoundingClientRect();const available=Math.max(1,rect.height-innerHeight);const p=Math.round(Math.max(0,Math.min(100,-rect.top/available*100)));$('#reading-progress').value=p;$('#progress-label').textContent=`Reading progress ${p}%`}
 $$('[data-article]').forEach(c=>c.onclick=()=>{lastCard=c;openArticle(c.dataset.article)});
 addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('article');if(id)openArticle(id,false);else closeArticle()});
 addEventListener('scroll',updateProgress,{passive:true});
 const initial=new URLSearchParams(location.search).get('article');if(initial)openArticle(initial,false,false);
}
if($('#contact-form')){
 const form=$('#contact-form'),status=$('#form-status');
 form.addEventListener('submit',e=>{
  e.preventDefault();let first=null;
  ['name','email','service','message'].forEach(n=>{const f=form.elements[n];let error='';if(!f.value.trim())error=`${({name:'Enter your name.',email:'Enter your email address.',service:'Choose a service or “Not sure yet”.',message:'Tell us a little about your project.'})[n]}`;else if(n==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value))error='Enter a valid email address.';else if(n==='message'&&f.value.trim().length<20)error='Please use at least 20 characters.';f.setAttribute('aria-invalid',!!error);$(`#${n}-error`).textContent=error;if(error&&!first)first=f;});
  if(first){first.focus();status.textContent='Please review the highlighted fields.';return;}
  const b=$('[type=submit]',form);b.disabled=true;b.setAttribute('aria-busy','true');b.textContent='Sending…';status.textContent='Simulating the submission state…';
  setTimeout(()=>{const fail=new URLSearchParams(location.search).get('state')==='failed';status.className=`form-status ${fail?'failed':'success'}`;status.textContent=fail?'Preview: we couldn’t send your inquiry. Your details are preserved. Try again.':'Preview complete. This demonstrates the success state; no message was sent.';b.disabled=false;b.removeAttribute('aria-busy');b.textContent=fail?'Try Again':'Send Message →';},900);
 });
}
