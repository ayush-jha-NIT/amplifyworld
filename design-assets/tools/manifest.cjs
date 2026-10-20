const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),repo=path.dirname(root);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function moduleFor(p){if(/brand|fonts|tokens|icons|catalogue\/(index|styles|preview)/.test(p))return [2,3,4,5,6,7,8,9,10];if(/scene|storyboard|home/.test(p))return [3,5,6];if(/about/.test(p))return [3,7];if(/contact|envelope/.test(p))return [3,10];if(/editorial|blog/.test(p))return [3,9];if(/project|portfolio|device/.test(p))return [3,8];return [2,3,4,5,6,7,8,9,10];}
function provenance(p){if(p.includes('vendor/'))return 'Three.js 0.180.0 / MIT; bundled LICENSE';if(p.includes('fonts/'))return 'Plus Jakarta Sans / SIL Open Font License 1.1; bundled OFL.txt';if(p.includes('references/')||p.includes('/brand/'))return 'User-supplied AmplifyWorld artwork; authorized by this design request; original copyright retained';if(/ne_110m_land|earth-albedo|earth-emissive|globe-fallback/.test(p))return 'Original rendering using Natural Earth public-domain geographic data';if(/mountain-main|earth-beauty|earth-surface/.test(p))return 'Original built-in imagegen output, created for this request; see GENERATION_LOG.md';return 'Original AmplifyWorld design deliverable created for this request';}
function sourceFor(p){
 if(p.startsWith('source/'))return p;
 if(p.startsWith('previews/'))return 'catalogue/'+(p.match(/^(?:previews\/)(home|about|portfolio|blog|contact)/)?.[1]||'index')+'.html';
 if(p.startsWith('exports/')){
   let s=p.replace('exports/','source/').replace(/-(640|1024|1200|1536|2048)\.(avif|webp)$/,'');
   if(/mountain-main|earth-beauty|earth-surface/.test(s))return s.replace(/\.(avif|webp)$/,'')+'.png';
   if(/logo-circular/.test(s))return 'source/brand/logo-circular-original.jpg';
   if(/logo-/.test(s))return 'source/brand/logo-wide-original.png';
   if(p.endsWith('.glb'))return 'tools/build-glb.cjs';
   if(/earth-(albedo|emissive)/.test(s))return 'source/scene/earth-albedo.svg';
   if(/\.(webp|avif|png)$/.test(s))s=s.replace(/\.(webp|avif|png)$/,'.svg');else if(!path.extname(s))s+='.svg';
   if(fs.existsSync(path.join(root,s)))return s;
 }
 return p;
}
async function main(){
 const files=walk(root).filter(p=>!/[\\/]node_modules[\\/]/.test(p)&&!p.endsWith('asset-manifest.json')).sort();
 const entries=[];
 for(const file of files){const rel=path.relative(root,file).replaceAll('\\','/'),buf=fs.readFileSync(file);let m={};if(/\.(png|jpe?g|svg|webp|avif)$/i.test(rel)){try{m=await sharp(buf).metadata()}catch{}}
 const dependencies=[];if(/\.(html|css|js|tsx|ts|svg)$/.test(rel)){const text=buf.toString('utf8');for(const match of text.matchAll(/(?:src|href)=["']([^"'#]+)|url\(["']?([^"')]+)|(?:from|import)\s*["']([^"']+)/g)){const x=match[1]||match[2]||match[3];if(x&&!/^(data:|http|#)/.test(x)&&x.includes('.'))dependencies.push(x)}}
 entries.push({id:rel.replace(/[^a-zA-Z0-9]+/g,'-'),filename:'design-assets/'+rel,placement:rel.startsWith('previews/')?'Review evidence, never use as a flattened production page':rel.includes('references/')?'Approved visual reference only':rel.split('/')[1],bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex'),intrinsicSize:m.width?[m.width,m.height]:null,aspectRatio:m.width?+(m.width/m.height).toFixed(4):null,transparency:m.hasAlpha??null,dependencies:[...new Set(dependencies)],source:'design-assets/'+sourceFor(rel),provenance:provenance(rel),modules:moduleFor(rel),optimizedExport:rel.startsWith('exports/'),format:path.extname(rel).slice(1),usage:rel.includes('references/')?'Reference-only; contains unverified demo content':/project-/.test(rel)?'Concept / Placeholder; no client or performance claim':'Design handoff'});
 }
 fs.writeFileSync(path.join(root,'asset-manifest.json'),JSON.stringify({version:1,date:'2026-10-20',baseCommit:'8aebfc5',fileCount:entries.length,totalBytes:entries.reduce((a,b)=>a+b.bytes,0),entries},null,2));
 let md='# Complete asset inventory\n\nGenerated from actual files by `design-assets/tools/manifest.cjs`. SHA-256, dimensions, alpha, dependencies, editable source, provenance and module mapping for every file are in `design-assets/asset-manifest.json`.\n\n';
 md+=`**${entries.length} files; ${(entries.reduce((a,b)=>a+b.bytes,0)/1048576).toFixed(2)} MiB before Git compression.** Sources, approved references and QA screenshots are not all downloaded by the website. Use only the exports needed by the current route.\n\n`;
 md+='| File | Bytes | Dimensions / alpha | Editable source | Modules |\n|---|---:|---|---|---|\n';
 for(const e of entries)md+=`| [${e.filename}](../../${e.filename}) | ${e.bytes} | ${e.intrinsicSize?.join('×')||'—'}${e.transparency?' / α':''} | ${e.source} | ${e.modules.join(', ')} |\n`;
 fs.writeFileSync(path.join(repo,'docs/design/ASSET_MANIFEST.md'),md);
 console.log('Manifest:',entries.length,'files');
}
main().catch(e=>{console.error(e);process.exit(1)});
