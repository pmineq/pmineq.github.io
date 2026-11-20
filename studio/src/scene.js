import * as THREE from 'three';

export function createScene(canvas, { reduced }) {
  const container = canvas.parentElement;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, matchMedia('(max-width: 700px)').matches ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100); camera.position.set(0, 0, 10);
  // A tiny procedural environment map: six static faces, no real-time refraction.
  const faces = Array.from({ length: 6 }, (_, i) => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d'); const g = ctx.createLinearGradient(0, 0, 128, 128);
    g.addColorStop(0, i % 2 ? '#74777c' : '#fdf8ef'); g.addColorStop(.28, '#e6e4df'); g.addColorStop(.42, '#777d84'); g.addColorStop(.55, '#ffffff'); g.addColorStop(.76, '#a5a8ac'); g.addColorStop(1, '#f4dedf');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128); return c;
  });
  const environment = new THREE.CubeTexture(faces); environment.needsUpdate = true; environment.colorSpace = THREE.SRGBColorSpace; scene.environment = environment;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777782, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(3, 5, 6); scene.add(key);
  const group = new THREE.Group(); scene.add(group); group.rotation.set(-.12, -.25, -.12);
  const folderShape = new THREE.Shape(); folderShape.moveTo(-2, -1.35); folderShape.lineTo(2, -1.35); folderShape.lineTo(2, 1.05); folderShape.lineTo(.2, 1.05); folderShape.lineTo(-.05, 1.48); folderShape.lineTo(-1.8, 1.48); folderShape.lineTo(-2, 1.05); folderShape.closePath();
  const folderGeo = new THREE.ExtrudeGeometry(folderShape, { depth: .14, bevelEnabled: true, bevelThickness: .055, bevelSize: .055, bevelSegments: 2, curveSegments: 2 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xe1e9eb, metalness: .22, roughness: .15, transparent: true, opacity: .52, envMapIntensity: 1.4, side: THREE.DoubleSide, depthWrite: false });
  const back = new THREE.Mesh(folderGeo, glass); back.rotation.y = -.12; group.add(back);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(folderGeo, 20), new THREE.LineBasicMaterial({ color: 0x8c959b, transparent: true, opacity: .65 })); back.add(edge);
  const front = new THREE.Mesh(folderGeo, glass.clone()); front.position.set(.13, -.18, .42); front.rotation.x = -.16; front.rotation.y = .13; group.add(front);
  const frontEdge = new THREE.LineSegments(new THREE.EdgesGeometry(folderGeo, 20), new THREE.LineBasicMaterial({ color: 0xfafafa, transparent: true, opacity: .9 })); front.add(frontEdge);
  const star = new THREE.Shape(); const points = 8;
  for (let i = 0; i < points * 2; i++) { const angle = Math.PI / 2 + i * Math.PI / points; const r = i % 2 === 0 ? (i % 4 === 0 ? 1.7 : 1.25) : .29; const x = Math.cos(angle)*r, y = Math.sin(angle)*r; if (!i) star.moveTo(x,y); else star.lineTo(x,y); } star.closePath();
  const starGeo = new THREE.ExtrudeGeometry(star, { depth: .15, bevelEnabled: true, bevelSegments: 3, bevelSize: .09, bevelThickness: .12 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe4e5e4, metalness: 1, roughness: .16, envMapIntensity: 2 });
  const starMesh = new THREE.Mesh(starGeo, chrome); starMesh.position.set(.65, -.25, .85); starMesh.rotation.z = -.18; group.add(starMesh);
  let width = 0, height = 0, visible = true, raf = 0, settle = 0;
  const target = { x: -.12, y: -.25 }; let dragging = false, previousX = 0, previousY = 0;
  function resize() { const rect = container.getBoundingClientRect(); if (!rect.width || !rect.height) return; width = rect.width; height = rect.height; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); request(); }
  function request() { if (!raf && visible) raf = requestAnimationFrame(draw); }
  function draw() { raf = 0; group.rotation.x += (target.x - group.rotation.x)*.08; group.rotation.y += (target.y - group.rotation.y)*.08; renderer.render(scene,camera); const delta = Math.abs(target.x-group.rotation.x)+Math.abs(target.y-group.rotation.y); if (delta > .001 && settle++ < 150) request(); else settle = 0; }
  if (!reduced) {
    canvas.addEventListener('pointerdown', e => { dragging = true; previousX=e.clientX; previousY=e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (dragging) { target.y = Math.max(-.9,Math.min(.9,target.y+(e.clientX-previousX)*.008)); target.x = Math.max(-.65,Math.min(.65,target.x+(e.clientY-previousY)*.008)); previousX=e.clientX; previousY=e.clientY; } else if (e.pointerType === 'mouse') { const r=canvas.getBoundingClientRect(); target.y=(e.clientX-r.left-r.width/2)/r.width*.7; target.x=(e.clientY-r.top-r.height/2)/r.height*.45; } else return; settle=0; request(); });
    canvas.addEventListener('pointerup', () => { dragging=false; }); canvas.addEventListener('pointercancel', () => { dragging=false; });
    canvas.addEventListener('pointerleave', () => { if (!dragging) {target.x=-.12; target.y=-.25; settle=0; request();} });
  }
  const observer = new IntersectionObserver(entries => { visible=entries[0].isIntersecting && !document.hidden; if (visible) request(); }); observer.observe(container);
  document.addEventListener('visibilitychange', () => { visible=!document.hidden; if (visible) request(); });
  window.addEventListener('resize', resize, { passive: true });
  resize(); container.classList.add('is-ready');
}
