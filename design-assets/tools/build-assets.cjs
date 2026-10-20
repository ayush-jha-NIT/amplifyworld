/* Reproducible vector design sources and format exports. Run from design-assets. */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true}); fs.writeFileSync(path.join(root,p), s); };
const svg = (w,h,body,defs='') => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
const defs = `<linearGradient id="brand" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#6000e0"/><stop offset=".55" stop-color="#b020ff"/><stop offset="1" stop-color="#ef70ff"/></linearGradient>
<radialGradient id="night"><stop stop-color="#24113e"/><stop offset="1" stop-color="#05030b"/></radialGradient>
<radialGradient id="orb" cx=".32" cy=".25"><stop stop-color="#7959bd"/><stop offset=".45" stop-color="#21133e"/><stop offset=".82" stop-color="#0c0818"/><stop offset="1" stop-color="#6740ab"/></radialGradient>
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
<linearGradient id="glass" x2="1" y2="1"><stop stop-color="#251139"/><stop offset=".5" stop-color="#0a0a15"/><stop offset="1" stop-color="#150924"/></linearGradient>`;
const icons = {
  performance:'<path d="M5 20V14H9V20M12 20V9H16V20M19 20V4H23V20" transform="translate(-2)"/><path d="M3 10L10 5L15 7L21 2M17 2H21V6"/>',
  local:'<path d="M19 10C19 15 12 22 12 22S5 15 5 10A7 7 0 1 1 19 10Z"/><circle cx="12" cy="10" r="2.5"/>',
  website:'<rect x="2" y="3" width="20" height="15" rx="2"/><path d="M2 7H22M8 22H16M12 18V22M8 10L5 13L8 16M16 10L19 13L16 16"/>',
  search:'<circle cx="10" cy="10" r="7"/><path d="M15 15L22 22M7 10H13M10 7V13"/>',
  agent:'<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 1V5M15 1V5M9 19V23M15 19V23M1 9H5M1 15H5M19 9H23M19 15H23M8 14L11 10L14 14L17 10"/><circle cx="8" cy="9" r=".4"/>',
  social:'<circle cx="6" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="M9 10L15 6M9 14L15 18"/>',
  strategy:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12L22 2M17 2H22V7"/>',
  technology:'<path d="M8 5L2 12L8 19M16 5L22 12L16 19M14 3L10 21"/>',
  growth:'<path d="M3 21V15M9 21V11M15 21V7M21 21V3M2 10L10 4L15 6L21 1"/>',
  mission:'<path d="M5 23V2M5 3C10 0 14 6 20 3V14C14 17 10 11 5 14"/>',
  vision:'<path d="M1 12S5 5 12 5S23 12 23 12S19 19 12 19S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/>',
  results:'<path d="M7 3H17V9A5 5 0 0 1 7 9ZM7 5H2V8A5 5 0 0 0 7 13M17 5H22V8A5 5 0 0 1 17 13M12 14V20M7 22H17"/>',
  innovation:'<path d="M8 17C8 14 5 13 5 9A7 7 0 0 1 19 9C19 13 16 14 16 17ZM8 20H16M10 23H14M12 1V0M2 5L0 3M22 5L24 3"/>',
  transparency:'<path d="M12 2L21 6V12C21 18 12 23 12 23S3 18 3 12V6ZM7 12L10 15L17 8"/>',
  partnership:'<path d="M2 10L6 5L11 7L15 4L22 9L18 17L14 20L10 18L6 17ZM6 5L4 2M22 9L24 6M11 7L8 11L11 13L15 10L20 14M8 15L13 19"/>',
  discover:'<circle cx="10" cy="10" r="7"/><path d="M15 15L22 22"/>',
  execute:'<path d="M9 15C4 10 16 1 23 1C23 8 14 20 9 15ZM9 15L5 19M13 8L16 11M6 11L2 12L1 18L6 17M12 18L11 23L17 22L18 18"/><circle cx="18" cy="6" r="2"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 6L12 14L22 6"/>',
  phone:'<path d="M7 2L3 3C0 12 12 24 21 21L22 17L16 14L13 17L7 11L10 8Z"/>',
  person:'<circle cx="12" cy="7" r="4"/><path d="M3 22V20A9 9 0 0 1 21 20V22"/>',
  company:'<path d="M3 23V5L14 1V23M14 9H21V23M7 7V9M10 6V8M7 12V14M10 11V13M7 17V19M10 16V18M17 13H18M17 17H18M0 23H24"/>',
  check:'<path d="M4 12L9 17L21 5"/>',
  warning:'<path d="M12 2L23 21H1ZM12 8V14M12 17V18"/>',
  arrow:'<path d="M3 12H21M14 5L21 12L14 19"/>',
  close:'<path d="M5 5L19 19M5 19L19 5"/>',
  menu:'<path d="M3 6H21M3 12H21M3 18H21"/>',
  empty:'<path d="M3 8L7 2H17L21 8V22H3ZM3 8H8L10 12H14L16 8H21"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 5V12L16 15"/>',
  link:'<path d="M9 15L15 9M8 17L6 19A4 4 0 0 1 1 13L6 8A4 4 0 0 1 12 9M16 7L18 5A4 4 0 0 1 23 11L18 16A4 4 0 0 1 12 15"/>',
  whatsapp:'<path d="M21 11.5A9.5 9.5 0 0 1 7 20L2 22L3.5 17A9.5 9.5 0 1 1 21 11.5Z"/><path d="M8 6L6 8C6 13 11 18 16 16L18 14L14 12L12 14L10 12L8 10L10 8Z"/>'
};
function icon(name,size=32) { return svg(size,size,`<g transform="scale(${size/24})" fill="none" stroke="#e6caff" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</g>`); }
function rand(seed) { return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}; }
const rng=rand(8417);
function stars(w,h,n=90){return Array.from({length:n},()=>`<circle cx="${(rng()*w).toFixed(1)}" cy="${(rng()*h).toFixed(1)}" r="${(.4+rng()*.9).toFixed(1)}" fill="#ba9cf5" opacity="${(.12+rng()*.42).toFixed(2)}"/>`).join('');}
const roadPath='M 60 710 C 240 720 760 650 820 575 C 870 510 590 555 655 475 C 695 427 820 448 735 392 C 695 362 625 365 625 330';
const milestones=[{id:'strategy',label:'Strategy',x:333,y:677,t:1.1},{id:'marketing',label:'Marketing',x:745,y:610,t:2.1},{id:'technology',label:'Technology',x:662,y:490,t:3.2},{id:'scalable-growth',label:'Scalable Growth',x:625,y:330,t:4.3}];
async function main(){
  for(const n of Object.keys(icons)){write(`source/icons/${n}.svg`,icon(n));write(`exports/icons/${n}.svg`,icon(n));}
  write('source/scene/road.svg',svg(1000,800,`<g id="road"><path id="road-glow" d="${roadPath}" fill="none" stroke="#ae21ff" stroke-width="16" filter="url(#glow)" opacity=".8"/><path id="road-base" d="${roadPath}" fill="none" stroke="#8303f7" stroke-width="7"/><path id="road-progress" pathLength="1" d="${roadPath}" fill="none" stroke="#f6c4ff" stroke-width="2.4"/><circle id="travel-light" cx="60" cy="710" r="5" fill="#fff"/></g>`,defs));
  write('source/scene/scene-layout.json',JSON.stringify({canvas:[1000,800],roadPath,milestones,globe:{x:685,y:249,r:285},logo:{x:350,y:72,w:320,h:194},layerOrder:['starfield','globe-back-orbits','globe','mountain-distant','mountain-main','road','milestones','logo','foreground','front-orbits']},null,2));
  for(const [i,m] of milestones.entries()){
    write(`source/scene/milestone-${m.id}.svg`,svg(220,96,`<path d="M110 60V96" stroke="#a261dd" stroke-width="2"/><rect x="2" y="2" width="216" height="58" rx="9" fill="#0c0718" stroke="#b020ff"/><circle cx="24" cy="31" r="12" fill="#420a6a"/><text x="24" y="36" text-anchor="middle" fill="white" font-family="Arial" font-size="13">${i+1}</text><text x="45" y="37" fill="#fff" font-family="Arial" font-weight="700" font-size="18">${m.label}</text>`));
  }
  write('source/scene/starfield.svg',svg(1440,900,stars(1440,900,155)));
  write('source/scene/mountain-distant.svg',svg(1000,800,`<path d="M0 700L90 575L160 643L272 508L390 590L490 455L600 535L720 452L815 566L900 490L1000 620V800H0Z" fill="#170b29"/><path d="M0 760L190 600L310 695L455 565L590 664L770 530L1000 720V800H0Z" fill="#10081b"/>`));
  write('source/scene/foreground.svg',svg(1000,800,`<path d="M0 790L70 733L132 770L175 719L237 780L320 759L395 795L450 776L529 800L620 760L700 789L799 726L853 770L912 731L1000 783V800H0Z" fill="#07040d"/><path d="M799 726L818 778L853 770M175 719L191 783L237 780M912 731L929 792L1000 783" fill="#221036" stroke="#32124a"/>`));
  write('source/scene/orbits.svg',svg(800,600,`<g fill="none" stroke="url(#brand)"><ellipse cx="400" cy="300" rx="350" ry="96" transform="rotate(-24 400 300)" stroke-width="2.5"/><ellipse cx="400" cy="300" rx="330" ry="100" transform="rotate(28 400 300)" stroke-width="1" opacity=".5"/></g><g fill="#efb0ff"><circle cx="80" cy="440" r="5"/><circle cx="720" cy="160" r="4"/></g>`,defs));
  write('source/scene/node.svg',svg(48,48,`<circle cx="24" cy="24" r="10" fill="#a510ff" filter="url(#glow)"/><circle cx="24" cy="24" r="3" fill="#ffe7ff"/>`,defs));
  // Preserve the supplied mark: SVG windows embed exact original pixels, not a newly drawn approximation.
  const logo=fs.readFileSync(path.join(root,'source/brand/logo-wide-original.png')).toString('base64');
  const regions={wide:[130,120,1800,445],compact:[130,120,1800,380],emblem:[130,120,635,385],arrow:[555,120,210,265]};
  const meta=await sharp(path.join(root,'source/brand/logo-wide-original.png')).metadata();
  for(const [n,[x,y,w,h]] of Object.entries(regions)){
    // Exact pixel crop + keyed alpha from the source's known black background.
    // Exclude the neighbouring white wordmark from the emblem/arrow crop.
    const {data:crop}=await sharp(path.join(root,'source/brand/logo-wide-original.png')).extract({left:x,top:y,width:w,height:h}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=(yy*w+xx)*4;const rgb=[crop[i],crop[i+1],crop[i+2]],max=Math.max(...rgb),min=Math.min(...rgb);crop[i+3]=Math.round(Math.max(0,Math.min(1,(max-8)/32))*255);if((n==='emblem'||n==='arrow')&&x+xx>700&&y+yy>280&&max-min<70)crop[i+3]=0;}
    const png=await sharp(crop,{raw:{width:w,height:h,channels:4}}).png().toBuffer();
    write(`source/brand/logo-${n}.svg`,svg(w,h,`<image width="${w}" height="${h}" href="data:image/png;base64,${png.toString('base64')}"/>`));
    await sharp(png).resize({width:n==='emblem'?640:n==='arrow'?320:1200}).webp({lossless:true}).toFile(path.join(root,`exports/brand/logo-${n}.webp`));
    await sharp(png).png().toFile(path.join(root,`exports/brand/logo-${n}.png`));
  }
  write('source/brand/regions.json',JSON.stringify({source:'logo-wide-original.png',sourceSize:[2069,760],regions,note:'Original RGB retained with alpha keyed only from near-black background. Neighbouring white wordmark excluded from emblem/arrow windows. Raster-backed SVGs are editable containers, not vector outlines.'},null,2));
  await sharp(path.join(root,'source/brand/logo-circular-original.jpg')).resize(640).webp({quality:88}).toFile(path.join(root,'exports/brand/logo-circular.webp'));
  // Original scene with geographic Earth, not generic invented continents.
  const geo=JSON.parse(fs.readFileSync(path.join(root,'source/scene/ne_110m_land.geojson')));
  const polys=geo.features.flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates);
  let texPaths='';
  for(const poly of polys){texPaths+=`<path d="${poly.map(r=>r.map(([lo,la],i)=>`${i?'L':'M'}${((lo+180)/360*2048).toFixed(2)} ${((90-la)/180*1024).toFixed(2)}`).join(' ')+'Z').join(' ')}" fill="#65528a" stroke="#9373c0" stroke-width=".55"/>`;}
  write('source/scene/earth-albedo.svg',svg(2048,1024,`<rect width="2048" height="1024" fill="#0c081b"/>${texPaths}`));
  await sharp(Buffer.from(svg(2048,1024,`<rect width="2048" height="1024" fill="#080410"/>${texPaths.replaceAll('#65528a','#38204f').replaceAll('#9373c0','#bf50db')}`))).webp({quality:90}).toFile(path.join(root,'exports/scene/earth-emissive-2048.webp'));
  await sharp(path.join(root,'source/scene/earth-albedo.svg')).webp({quality:92}).toFile(path.join(root,'exports/scene/earth-albedo-2048.webp'));
  await sharp(path.join(root,'source/scene/earth-albedo.svg')).resize(1024).webp({quality:85}).toFile(path.join(root,'exports/scene/earth-albedo-1024.webp'));
  const project=([lo,la])=>{const l=(lo-55)*Math.PI/180,p=la*Math.PI/180,c=15*Math.PI/180;return [400+264*Math.cos(p)*Math.sin(l),300-264*(Math.cos(c)*Math.sin(p)-Math.sin(c)*Math.cos(p)*Math.cos(l)),Math.sin(c)*Math.sin(p)+Math.cos(c)*Math.cos(p)*Math.cos(l)];};
  let lands='';
  for(const poly of polys){for(const ring of poly){let d='',active=false;for(const pt of ring){const [x,y,z]=project(pt);if(z>0){d+=`${active?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)} `;active=true;}else{if(active)d+='Z ';active=false;}}if(d) lands+=`<path d="${d}Z" fill="#493060" stroke="#b18adc" stroke-width=".55" opacity=".88"/>`;}}
  const globe=svg(800,600,`<circle cx="400" cy="300" r="270" fill="#7420d0" opacity=".55" filter="url(#glow)"/><circle cx="400" cy="300" r="264" fill="url(#orb)" stroke="#b593ff" stroke-width="2"/><g clip-path="url(#disk)">${lands}<ellipse cx="400" cy="300" rx="175" ry="264" fill="none" stroke="#9f72d6" opacity=".15"/><ellipse cx="400" cy="300" rx="264" ry="95" fill="none" stroke="#9f72d6" opacity=".18"/><circle cx="470" cy="390" r="190" fill="#030109" opacity=".3"/></g><ellipse cx="400" cy="300" rx="360" ry="80" transform="rotate(-23 400 300)" fill="none" stroke="#cc65ff" stroke-width="2.5"/><circle cx="72" cy="444" r="4" fill="#fff"/>`,defs+'<clipPath id="disk"><circle cx="400" cy="300" r="263"/></clipPath>');
  write('source/scene/globe-fallback.svg',globe);
  // Original vector illustrations, reusable without raster text.
  write('source/artwork/contact-envelope.svg',svg(800,600,`<g transform="translate(210 230) rotate(-12 190 120)"><rect width="380" height="250" rx="28" fill="url(#brand)" stroke="#f3bfff" stroke-width="3"/><path d="M15 20L190 145L365 20M8 235L135 125M372 235L247 125" fill="none" stroke="#edbeff" stroke-width="4"/><path d="M15 20L190 145L365 20" fill="#b956f6" opacity=".45"/></g><path d="M560 230L666 72L652 183L621 156Z" fill="url(#brand)"/><circle cx="690" cy="330" r="6" fill="#f1a6ff"/>`,defs));
  const cover=(kind)=>{let shape='';
    if(kind==='search') shape=`<circle cx="610" cy="260" r="130" fill="#0b0714" stroke="url(#brand)" stroke-width="18"/><path d="M700 350L815 465" stroke="#d054ff" stroke-width="26" stroke-linecap="round"/><path d="M260 470V390H320V470M350 470V330H410V470M440 470V260H500V470" fill="url(#brand)"/><path d="M270 325L380 240L445 265L540 160" fill="none" stroke="#f3b8ff" stroke-width="5"/>`;
    if(kind==='strategy') shape=`<g transform="translate(300 100)"><circle cx="300" cy="220" r="175" fill="#140a22" stroke="#7b26d1" stroke-width="3"/><circle cx="300" cy="220" r="110" fill="none" stroke="#b342f6" stroke-width="3"/><circle cx="300" cy="220" r="45" fill="url(#brand)"/><path d="M300 220L495 30M420 30H495V105" fill="none" stroke="#f0b4ff" stroke-width="12" stroke-linecap="round"/></g>`;
    if(kind==='ai') shape=`<rect x="430" y="140" width="300" height="300" rx="42" fill="url(#glass)" stroke="#c34bff" stroke-width="4"/><g stroke="#8937cf" stroke-width="4">${[190,260,330,400].map(y=>`<path d="M280 ${y}H430M730 ${y}H880"/>`).join('')}</g><path d="M480 320L535 230L580 320L635 230L680 320" fill="none" stroke="url(#brand)" stroke-width="13" stroke-linecap="round"/><circle cx="290" cy="190" r="9" fill="#f284ff"/><circle cx="880" cy="400" r="9" fill="#b020ff"/>`;
    if(kind==='social') shape=`<g fill="url(#glass)" stroke="#ad38f1" stroke-width="3"><rect x="230" y="200" width="220" height="250" rx="24" transform="rotate(-12 340 325)"/><rect x="490" y="110" width="250" height="350" rx="24"/><rect x="770" y="210" width="190" height="220" rx="24" transform="rotate(12 865 320)"/></g><circle cx="615" cy="245" r="65" fill="url(#brand)"/><path d="M595 210L650 245L595 280Z" fill="#fbeeff"/><path d="M535 360H690M535 389H650" stroke="#77529b" stroke-width="8"/>`;
    return svg(1200,630,`<rect width="1200" height="630" fill="url(#night)"/>${stars(1200,630)}<ellipse cx="600" cy="470" rx="460" ry="80" fill="none" stroke="#682098" stroke-width="2"/>${shape}`,defs);
  };
  for(const kind of ['search','strategy','ai','social']) write(`source/artwork/editorial-${kind}.svg`,cover(kind));
  for(const [i,name] of ['website','local','campaign'].entries()){
    const theme=['#b46eff','#8dd7ce','#ff9c67'][i];
    write(`source/templates/project-${name}.svg`,svg(1200,800,`<rect width="1200" height="800" fill="#090710"/>${stars(1200,800,45)}<rect x="80" y="110" width="1040" height="590" rx="20" fill="#121019" stroke="#70438a" stroke-width="2"/><path d="M80 157H1120" stroke="#44344f"/><g fill="${theme}"><circle cx="108" cy="134" r="5"/><circle cx="128" cy="134" r="5"/><circle cx="148" cy="134" r="5"/></g><text x="120" y="225" fill="${theme}" font-family="Arial" font-size="16" letter-spacing="4">CONCEPT / PLACEHOLDER</text><text x="120" y="315" fill="#f7f4fa" font-family="Arial" font-size="56" font-weight="700">${['A clearer path','Be discovered.','Make the'][i]}</text><text x="120" y="380" fill="#f7f4fa" font-family="Arial" font-size="56" font-weight="700">${['to your business.','Be remembered.','message matter.'][i]}</text><rect x="120" y="420" width="220" height="46" rx="23" fill="${theme}"/><text x="147" y="449" fill="#17091e" font-family="Arial" font-size="16">Explore the concept →</text><g transform="translate(850 360)"><circle r="150" fill="none" stroke="${theme}" stroke-width="24"/><ellipse rx="170" ry="55" fill="none" stroke="${theme}" stroke-width="2" transform="rotate(-25)"/><circle r="90" fill="${theme}" opacity=".15"/></g><rect x="120" y="540" width="280" height="110" rx="12" fill="#20152a"/><rect x="420" y="540" width="280" height="110" rx="12" fill="#20152a"/><rect x="720" y="540" width="350" height="110" rx="12" fill="#20152a"/>`));
  }
  write('source/templates/device-desktop.svg',svg(1200,840,'<rect x="40" y="20" width="1120" height="710" rx="24" fill="#100b19" stroke="#9575b1" stroke-width="3"/><rect id="screen-slot" x="60" y="50" width="1080" height="650" fill="#08050d"/><path d="M510 730L490 800H710L690 730" fill="#21162e"/><path d="M440 810H760" stroke="#ba8ddf" stroke-width="12" stroke-linecap="round"/>'));
  write('source/templates/device-mobile.svg',svg(420,840,'<rect x="10" y="10" width="400" height="820" rx="52" fill="#100b19" stroke="#9575b1" stroke-width="3"/><rect id="screen-slot" x="24" y="28" width="372" height="784" rx="38" fill="#08050d"/><rect x="150" y="40" width="120" height="24" rx="12" fill="#21162e"/>'));
  // Copy vector exports, rasterize reusable artwork at 2 deliberate resolutions.
  for(const dir of ['scene','artwork','templates']){
    for(const f of fs.readdirSync(path.join(root,`source/${dir}`)).filter(f=>f.endsWith('.svg'))){
      if(f==='earth-albedo.svg')continue;
      fs.copyFileSync(path.join(root,`source/${dir}`,f),path.join(root,`exports/${dir}`,f));
      if(dir==='artwork'||f==='globe-fallback.svg'){
        for(const w of [640,1200]){
          await sharp(path.join(root,`source/${dir}`,f)).resize({width:w}).webp({quality:87}).toFile(path.join(root,`exports/${dir}/${f.slice(0,-4)}-${w}.webp`));
          await sharp(path.join(root,`source/${dir}`,f)).resize({width:w}).avif({quality:60,effort:5}).toFile(path.join(root,`exports/${dir}/${f.slice(0,-4)}-${w}.avif`));
        }
        await sharp(path.join(root,`source/${dir}`,f)).resize({width:1200}).png().toFile(path.join(root,`exports/${dir}/${f.slice(0,-4)}.png`));
      }
    }
  }
  // Exact raw source-pixel samples chosen from the owned logo's emblem.
  const {data,info}=await sharp(path.join(root,'source/brand/logo-wide-original.png')).raw().toBuffer({resolveWithObject:true});
  const samples=[[420,448],[600,330],[665,220],[550,457],[290,421]].map(([x,y])=>{const i=(y*info.width+x)*info.channels;const rgb=[...data.slice(i,i+3)];return {x,y,rgb,hex:'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('')};});
  write('source/brand/palette-samples.json',JSON.stringify({source:'logo-wide-original.png',samples},null,2));
  for(const [name,widths] of [['mountain-main',[640,1200,1536]],['earth-beauty',[640,1200]],['earth-surface',[1024,2048]]]){
    for(const width of widths){
      const src=path.join(root,`source/scene/${name}.png`);
      await sharp(src).resize({width}).webp({quality:88}).toFile(path.join(root,`exports/scene/${name}-${width}.webp`));
      await sharp(src).resize({width}).avif({quality:63,effort:5}).toFile(path.join(root,`exports/scene/${name}-${width}.avif`));
    }
  }
  console.log('Vector sources, logo derivatives, geographic textures and responsive exports generated.',samples);
}
main().catch(e=>{console.error(e);process.exit(1)});
