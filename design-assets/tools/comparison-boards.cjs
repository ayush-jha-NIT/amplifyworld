const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
async function main(){
 fs.mkdirSync(path.join(root,'previews/comparisons'),{recursive:true});
 const panels=[];
 for(const [i,name] of ['home','about','portfolio','blog','contact'].entries()){
  const a=await sharp(path.join(root,`source/references/${name}-approved.png`)).resize({width:480}).png().toBuffer();
  const b=await sharp(path.join(root,`previews/${name==='blog'?'blog-reader':name}-1440.png`)).resize({width:480}).png().toBuffer();
  const am=await sharp(a).metadata(),bm=await sharp(b).metadata();const h=Math.max(am.height,bm.height)+80;
  const label=Buffer.from(`<svg width="1000" height="70"><rect width="1000" height="70" fill="#10091c"/><g fill="#eadcf5" font-family="Arial" font-size="18"><text x="20" y="30">${name.toUpperCase()} — APPROVED REFERENCE</text><text x="520" y="30">RECONSTRUCTED DESIGN</text><text x="20" y="55" font-size="12">Reference demo claims removed; see PAGE_DESIGN_SPEC.md for deliberate differences.</text></g></svg>`);
  await sharp({create:{width:1000,height:h,channels:3,background:'#03040a'}}).composite([{input:label,left:0,top:0},{input:a,left:10,top:80},{input:b,left:510,top:80}]).webp({quality:90}).toFile(path.join(root,`previews/comparisons/${name}.webp`));
  const thumb=await sharp(b).resize(320).png().toBuffer();panels.push({input:thumb,left:i*332,top:64});
 }
 const header=Buffer.from('<svg width="1660" height="56"><rect width="1660" height="56" fill="#10091c"/><g font-family="Arial" font-size="16" fill="#eadcf5"><text x="12" y="35">HOME</text><text x="344" y="35">ABOUT</text><text x="676" y="35">PORTFOLIO</text><text x="1008" y="35">BLOG + INLINE READER</text><text x="1340" y="35">CONTACT</text></g></svg>');
 const heights=await Promise.all(panels.map(x=>sharp(x.input).metadata()));
 await sharp({create:{width:1660,height:Math.max(...heights.map(x=>x.height))+80,channels:3,background:'#080510'}}).composite([{input:header,left:0,top:0},...panels]).webp({quality:90}).toFile(path.join(root,'previews/all-pages-desktop.webp'));
 console.log('Five reference comparison boards and overview generated.');
}
main().catch(e=>{console.error(e);process.exit(1)});
