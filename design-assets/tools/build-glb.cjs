const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
// Self-contained glTF 2.0 mesh/texture asset. Named parts remain separately animatable.
async function main(){
 const chunks=[],views=[],accessors=[];let length=0;
 function add(buffer,target){const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad}const i=views.length;views.push({buffer:0,byteOffset:length,byteLength:buffer.length,...target?{target}:{}});chunks.push(buffer);length+=buffer.length;return i}
 function accessor(array,type,componentType,target,min,max){const view=add(Buffer.from(array.buffer),target),i=accessors.length;accessors.push({bufferView:view,componentType,count:array.length/({SCALAR:1,VEC2:2,VEC3:3}[type]),type,...min?{min,max}:{}});return i}
 const pos=[],normal=[],uv=[],indices=[],w=64,h=32;
 for(let y=0;y<=h;y++)for(let x=0;x<=w;x++){const u=x/w,v=y/h,phi=u*Math.PI*2,theta=v*Math.PI;const p=[-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)];pos.push(...p);normal.push(...p);uv.push(u,1-v)}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=y*(w+1)+x,b=a+w+1;indices.push(a,b,a+1,b,b+1,a+1)}
 const attrs={POSITION:accessor(new Float32Array(pos),'VEC3',5126,34962,[-1,-1,-1],[1,1,1]),NORMAL:accessor(new Float32Array(normal),'VEC3',5126,34962),TEXCOORD_0:accessor(new Float32Array(uv),'VEC2',5126,34962)};
 const index=accessor(new Uint16Array(indices),'SCALAR',5123,34963);
 const texture=await sharp(path.join(root,'exports/scene/earth-surface-1024.webp')).png().toBuffer();const imageView=add(texture);
 const ring=[];for(let i=0;i<128;i++){const t=i/128*Math.PI*2;ring.push(Math.cos(t)*1.4,0,Math.sin(t)*1.4)}
 const rp=accessor(new Float32Array(ring),'VEC3',5126,34962,[-1.4,0,-1.4],[1.4,0,1.4]);
 const j={asset:{version:'2.0',generator:'AmplifyWorld original design-asset builder'},scene:0,scenes:[{nodes:[0,2,3]}],nodes:[{name:'EarthAxialTilt',rotation:[0,0,Math.sin(23.4*Math.PI/360),Math.cos(23.4*Math.PI/360)],children:[1]},{name:'EarthRevolve',mesh:0},{name:'OrbitPrimary',mesh:1,rotation:[Math.sin(.8/2),0,0,Math.cos(.8/2)]},{name:'OrbitSecondary',mesh:1,rotation:[0,0,Math.sin(.9/2),Math.cos(.9/2)],scale:[1.12,1.12,1.12]}],meshes:[{name:'EarthSphere',primitives:[{attributes:attrs,indices:index,material:0}]},{name:'OrbitCurve',primitives:[{attributes:{POSITION:rp},mode:2,material:1}]}],materials:[{name:'VioletGeographicEarth',pbrMetallicRoughness:{baseColorTexture:{index:0},metallicFactor:.08,roughnessFactor:.84}},{name:'LuminousOrbit',pbrMetallicRoughness:{baseColorFactor:[.72,.22,1,1],metallicFactor:0,roughnessFactor:1},emissiveFactor:[.5,.1,.8]}],textures:[{sampler:0,source:0}],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:33071}],images:[{bufferView:imageView,mimeType:'image/png'}],accessors,bufferViews:views,buffers:[{byteLength:length}],extras:{provenance:'Original spherical geometry; Natural Earth public-domain land data.',rotationPeriodSeconds:72,orbitPeriodsSeconds:[28,42],note:'Animate EarthRevolve. Atmosphere and particles are runtime shader/geometry enhancements in the reference study.'}};
 let json=Buffer.from(JSON.stringify(j));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);let bin=Buffer.concat(chunks);bin=Buffer.concat([bin,Buffer.alloc((4-bin.length%4)%4)]);
 const header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+json.length+8+bin.length,8);jh.writeUInt32LE(json.length,0);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bin.length,0);bh.writeUInt32LE(0x004e4942,4);
 fs.writeFileSync(path.join(root,'exports/scene/earth-orbits.glb'),Buffer.concat([header,jh,json,bh,bin]));
 fs.writeFileSync(path.join(root,'source/scene/earth-scene.json'),JSON.stringify({radius:1,segments:[64,32],camera:{fov:35,position:[0,.2,5.8],near:.1,far:20},material:{roughness:.84,metalness:.08,emissiveIntensity:.6},axialTiltDegrees:23.4,rotationSeconds:72,orbits:[{radius:1.38,period:28,rotation:[.8,0,-.45]},{radius:1.56,period:42,rotation:[1.4,0,.35]}],atmosphere:{radius:1.035,rimPower:3.2,opacity:.85,color:'#ad64fa'},particles:96,mobileParticles:24,dpr:{desktop:1.5,mobile:1.25},fallback:'globe-fallback.svg'},null,2));
 console.log('GLB written:',12+8+json.length+8+bin.length,'bytes');
}
main().catch(e=>{console.error(e);process.exit(1)});
