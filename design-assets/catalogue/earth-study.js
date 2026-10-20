import * as THREE from './vendor/three.module.min.js';
const stage=document.querySelector('#earth-stage'),canvas=document.querySelector('#earth-canvas'),fallback=document.querySelector('#earth-fallback'),status=document.querySelector('#study-status'),button=document.querySelector('#earth-pause');
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),force=new URLSearchParams(location.search).has('fallback');
let renderer,raf,paused=false,visible=true,last=0,elapsed=0;
function showFallback(message){cancelAnimationFrame(raf);canvas.hidden=true;fallback.hidden=false;status.textContent=message;button.disabled=true;}
try{
 if(force||reduce.matches)throw new Error('Still image selected for fallback or reduced motion.');
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<640?1.25:1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,4/3,.1,20);camera.position.set(0,.2,5.8);
 const globe=new THREE.Group();globe.rotation.z=THREE.MathUtils.degToRad(23.4);scene.add(globe);
 const loader=new THREE.TextureLoader();const albedo=await loader.loadAsync('../exports/scene/earth-surface-2048.webp');albedo.colorSpace=THREE.SRGBColorSpace;
 const emissive=await loader.loadAsync('../exports/scene/earth-surface-2048.webp');emissive.colorSpace=THREE.SRGBColorSpace;
 const sphere=new THREE.Mesh(new THREE.SphereGeometry(1,64,32),new THREE.MeshStandardMaterial({map:albedo,emissiveMap:emissive,emissive:'#b67bff',emissiveIntensity:.6,roughness:.84,metalness:.08}));sphere.rotation.y=-.5;globe.add(sphere);
 const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.035,48,24),new THREE.ShaderMaterial({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.FrontSide,uniforms:{tint:{value:new THREE.Color('#ad64fa')}},vertexShader:'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 tint; varying vec3 n; varying vec3 v; void main(){float rim=pow(1.-max(dot(normalize(n),normalize(v)),0.),3.2); gl_FragColor=vec4(tint,rim*.85);}'}));scene.add(atmosphere);
 scene.add(new THREE.AmbientLight('#8070ae',1.4));const key=new THREE.DirectionalLight('#d3b8ff',3.2);key.position.set(-3,3,4);scene.add(key);const edge=new THREE.DirectionalLight('#a62bff',3);edge.position.set(3,-1,-2);scene.add(edge);
 const orbits=[];
 for(let i=0;i<2;i++){const g=new THREE.Group();g.rotation.set(.8+i*.6,0,-.45+i*.8);const points=Array.from({length:129},(_,j)=>{const t=j/128*Math.PI*2;return new THREE.Vector3(Math.cos(t)*(1.38+i*.18),0,Math.sin(t)*(1.38+i*.18))});const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:i?'#8749c8':'#dc79ff',transparent:true,opacity:i?.45:.9}));g.add(line);const node=new THREE.Mesh(new THREE.SphereGeometry(.026,12,8),new THREE.MeshBasicMaterial({color:'#f2c0ff'}));g.add(node);scene.add(g);orbits.push({g,node,r:1.38+i*.18,period:i?42:28});}
 const positions=new Float32Array(96*3);let seed=41;for(let i=0;i<positions.length;i++){seed=(seed*16807)%2147483647;positions[i]=(seed/2147483647-.5)*9}const particles=new THREE.BufferGeometry();particles.setAttribute('position',new THREE.BufferAttribute(positions,3));scene.add(new THREE.Points(particles,new THREE.PointsMaterial({size:.008,color:'#c7a7ef',transparent:true,opacity:.5})));
 const resize=()=>{const {width,height}=stage.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.render(scene,camera)};new ResizeObserver(resize).observe(stage);
 const io=new IntersectionObserver(e=>{visible=e[0].isIntersecting});io.observe(stage);
 function frame(now){const d=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused&&!document.hidden&&visible){elapsed+=d;sphere.rotation.y+=d*Math.PI*2/72;orbits.forEach(o=>{const a=elapsed*Math.PI*2/o.period;o.node.position.set(Math.cos(a)*o.r,0,Math.sin(a)*o.r)});renderer.render(scene,camera)}raf=requestAnimationFrame(frame)}
 fallback.hidden=true;status.textContent='WebGL active · 64 × 32 sphere · pause available · rendering pauses offscreen';window.earthStudyReady=true;resize();raf=requestAnimationFrame(frame);
 button.onclick=()=>{paused=!paused;button.setAttribute('aria-pressed',paused);button.textContent=paused?'Resume motion':'Pause motion';status.textContent=paused?'Motion paused.':'WebGL active · continuous rotation.'};
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();showFallback('WebGL context lost. Showing the still-image fallback.')});
 reduce.addEventListener('change',e=>{if(e.matches)showFallback('Reduced motion enabled. Showing the still-image fallback.')});
 addEventListener('pagehide',()=>{cancelAnimationFrame(raf);io.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose())}});albedo.dispose();emissive.dispose();renderer.dispose()},{once:true});
}catch(e){showFallback(force?'No-WebGL fallback selected.':reduce.matches?'Reduced motion: still image.':'WebGL unavailable: still image.');window.earthStudyReady=true;}
