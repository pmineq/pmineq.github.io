import * as THREE from 'three';

export function createScene(canvas, { reduced }) {
  const container = canvas.parentElement;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); } catch { return; }
  const mobile = matchMedia('(max-width: 700px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.15 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100); camera.position.set(0, 0, 10.7);
  const faces = Array.from({ length: 6 }, (_, i) => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d'); const g = ctx.createLinearGradient(0, 0, 128, 128);
    g.addColorStop(0, i % 2 ? '#b6a4dc' : '#ffffff'); g.addColorStop(.24, '#f9f8ff'); g.addColorStop(.4, '#a8c7ed'); g.addColorStop(.54, '#ffffff'); g.addColorStop(.75, '#e6bbda'); g.addColorStop(1, '#c6d6ff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128); return c;
  });
  const environment = new THREE.CubeTexture(faces); environment.needsUpdate = true; environment.colorSpace = THREE.SRGBColorSpace; scene.environment = environment;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa8a3d6, 2));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xaadfff, 1.3); fill.position.set(-4, 1, 3); scene.add(fill);
  const group = new THREE.Group(); scene.add(group); group.rotation.set(-.12, -.25, -.12);
  // Round each star corner before beveling the shape to create a soft jelly silhouette.
  const points = []; const count = 10;
  for (let i=0; i<count; i++) { const a = Math.PI/2+i*Math.PI/5; const radius = i%2 ? .68 : 1.43; points.push(new THREE.Vector2(Math.cos(a)*radius,Math.sin(a)*radius)); }
  const star = new THREE.Shape();
  for (let i=0; i<count; i++) { const prev=points[(i+count-1)%count], cur=points[i], next=points[(i+1)%count]; const before=cur.clone().lerp(prev,.19), after=cur.clone().lerp(next,.19); if(i===0) star.moveTo(before.x,before.y); else star.lineTo(before.x,before.y); star.quadraticCurveTo(cur.x,cur.y,after.x,after.y); } star.closePath();
  const starGeo = new THREE.ExtrudeGeometry(star,{depth:.3,bevelEnabled:true,bevelThickness:.22,bevelSize:.18,bevelSegments:4,curveSegments:6});
  const jelly = new THREE.MeshPhysicalMaterial({color:0xc6a6ed,metalness:.12,roughness:.21,clearcoat:1,clearcoatRoughness:.09,transmission:mobile?0:.08,envMapIntensity:1.2});
  const starMesh=new THREE.Mesh(starGeo,jelly);starMesh.position.set(-.05,.05,.45);starMesh.rotation.z=-.18;group.add(starMesh);
  const ringMaterial=new THREE.MeshPhysicalMaterial({color:0xa9d8f7,metalness:.32,roughness:.17,clearcoat:1,clearcoatRoughness:.08,transparent:true,opacity:.83,envMapIntensity:1.6});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.05,.09,12,80),ringMaterial);ring.rotation.set(1.06,-.13,-.48);ring.position.set(.02,-.24,.07);group.add(ring);
  const innerRing=new THREE.Mesh(new THREE.TorusGeometry(2.05,.022,8,80),new THREE.MeshStandardMaterial({color:0xffd1ec,metalness:.55,roughness:.15}));innerRing.rotation.copy(ring.rotation);innerRing.position.copy(ring.position);innerRing.position.z+=.12;group.add(innerRing);
  const orb=new THREE.Mesh(new THREE.SphereGeometry(.35,24,16),new THREE.MeshPhysicalMaterial({color:0x86c8fb,metalness:.13,roughness:.14,clearcoat:1,clearcoatRoughness:.07,envMapIntensity:1.5}));orb.position.set(1.84,.62,.3);group.add(orb);
  const pearl=new THREE.Mesh(new THREE.SphereGeometry(.14,20,12),new THREE.MeshPhysicalMaterial({color:0xffa9d4,metalness:.12,roughness:.18,clearcoat:1}));pearl.position.set(-1.8,-.78,.35);group.add(pearl);
  let visible=true, inView=true, raf=0, last=0;
  const target={x:-.12,y:-.25};let dragging=false, previousX=0,previousY=0;
  function request(){if(!raf&&visible)raf=requestAnimationFrame(draw)}
  function draw(time){raf=0; if(!visible)return; group.rotation.x+=(target.x-group.rotation.x)*.08;group.rotation.y+=(target.y-group.rotation.y)*.08;if(!reduced){const t=time*.001;group.position.y=Math.sin(t*.8)*.09;starMesh.rotation.z=-.18+Math.sin(t*.55)*.04;orb.position.y=.62+Math.sin(t*.9)*.07;}renderer.render(scene,camera);last=time;if(!reduced)request();}
  function resize(){const r=container.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();request()}
  if(!reduced){
    canvas.addEventListener('pointerdown',e=>{dragging=true;previousX=e.clientX;previousY=e.clientY;canvas.setPointerCapture(e.pointerId)});
    canvas.addEventListener('pointermove',e=>{if(dragging){target.y=Math.max(-.9,Math.min(.9,target.y+(e.clientX-previousX)*.008));target.x=Math.max(-.65,Math.min(.65,target.x+(e.clientY-previousY)*.008));previousX=e.clientX;previousY=e.clientY}else if(e.pointerType==='mouse'){const r=canvas.getBoundingClientRect();target.y=(e.clientX-r.left-r.width/2)/r.width*.7;target.x=(e.clientY-r.top-r.height/2)/r.height*.45}else return;request()});
    canvas.addEventListener('pointerup',()=>{dragging=false});canvas.addEventListener('pointercancel',()=>{dragging=false});canvas.addEventListener('pointerleave',()=>{if(!dragging){target.x=-.12;target.y=-.25;request()}});
  }
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;visible=inView&&!document.hidden;if(visible)request()});observer.observe(container);
  document.addEventListener('visibilitychange',()=>{visible=inView&&!document.hidden;if(visible)request()});
  window.addEventListener('resize',resize,{passive:true});resize();container.classList.add('is-ready');
}
