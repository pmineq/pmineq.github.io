import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, spring } from 'motion';
gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced) {
  gsap.utils.toArray('.section-heading, .studio-layout, .feature-intro, .custom-heading, .download-grid').forEach(el => {
    gsap.from(el, { y: 38, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  gsap.utils.toArray('.app-row').forEach((el, index) => {
    gsap.from(el, { y: 18, opacity: 0, duration: .65, delay: index * .08, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  const thumb = document.querySelector('.app-icon');
  if (thumb) gsap.fromTo(thumb, { rotate: -3, y: 12 }, { rotate: 5, y: 0, ease: 'none', scrollTrigger: { trigger: thumb, start: 'top bottom', end: 'bottom center', scrub: .5 } });
  const capture = document.querySelector('.capture-main');
  if (capture) gsap.fromTo(capture, { rotate: -10, y: 45 }, { rotate: -3, y: 0, ease: 'none', scrollTrigger: { trigger: capture, start: 'top bottom', end: 'center center', scrub: .7 } });
  const row = document.querySelector('[data-preview="zencut"]');
  const preview = document.querySelector('.hover-preview');
  if (row && preview && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    row.addEventListener('pointerenter', e => { preview.style.left = `${e.clientX + 100}px`; preview.style.top = `${e.clientY}px`; preview.style.visibility = 'visible'; animate(preview, { opacity: 1, scale: 1 }, { duration: .2 }); });
    row.addEventListener('pointermove', e => { animate(preview, { left: e.clientX + 100, top: e.clientY }, { type: spring, stiffness: 220, damping: 30 }); });
    row.addEventListener('pointerleave', () => { animate(preview, { opacity: 0, scale: .94 }, { duration: .18 }).then(() => { preview.style.visibility = 'hidden'; }); });
  }
  document.querySelectorAll('.app-row[href]').forEach(item => {
    const icon = item.querySelector('.app-icon');
    const title = item.querySelector('.app-name');
    item.addEventListener('pointerenter', () => { animate(title, { x: 7 }, { type: spring, stiffness: 300, damping: 24 }); if (icon) animate(icon, { rotate: -5, scale: 1.05 }, { type: spring, stiffness: 260, damping: 18 }); });
    item.addEventListener('pointerleave', () => { animate(title, { x: 0 }, { type: spring, stiffness: 300, damping: 24 }); if (icon) animate(icon, { rotate: 0, scale: 1 }, { type: spring, stiffness: 260, damping: 18 }); });
  });
  document.querySelectorAll('.button.primary').forEach(button => {
    button.addEventListener('pointerdown', () => animate(button, { scale: .97 }, { duration: .12 }));
    ['pointerup','pointercancel','pointerleave'].forEach(event => button.addEventListener(event, () => animate(button, { scale: 1 }, { type: spring, stiffness: 500, damping: 20 })));
  });
}

const gallery = document.querySelector('[data-gallery]');
if (gallery) {
  const shots = { frames: ['Zencut 프레임 선택 공식 스크린샷', '01 / CUSTOM FRAMES'], custom: ['Zencut 커스텀 프레임 공식 스크린샷', '02 / MAKE IT YOURS'], filters: ['Zencut 필터 선택 공식 스크린샷', '03 / Y2K FILTERS'] };
  const img = document.querySelector('#gallery-image');
  const caption = document.querySelector('#gallery-caption');
  gallery.querySelectorAll('[data-shot]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.shot;
    img.src = `/assets/zencut/${id}.jpg`; img.alt = shots[id][0]; caption.textContent = shots[id][1];
    gallery.querySelectorAll('[data-shot]').forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
    if (!reduced) animate(img, { opacity: [0.5, 1], transform: ['translateY(8px)', 'translateY(0px)'] }, { duration: .3 });
  }));
}
const canvas = document.querySelector('#hero-canvas');
if (canvas) import('./scene.js').then(({ createScene }) => createScene(canvas, { reduced })).catch(() => {});
