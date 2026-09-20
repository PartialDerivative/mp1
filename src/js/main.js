/* Your JS here. */
'use strict';

document.getElementById('year').textContent = new Date().getFullYear();

// ============ sticky + resizing navbar ============
const navbar = document.getElementById('navbar');
const SCROLL_THRESHOLD = 40;

function handleNavbarResize() {
  navbar.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
}

// ============ position indicator ============
const sections = Array.from(document.querySelectorAll('.stripe[id], header[id]'));
const navLinksBySection = new Map();
document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
  const key = link.dataset.section;
  if (!navLinksBySection.has(key)) navLinksBySection.set(key, []);
  navLinksBySection.get(key).push(link);
});

function updateActiveSection() {
  const navHeight = navbar.getBoundingClientRect().height;
  const probeY = navHeight + 1;
  let currentId = sections[0]?.id;

  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  if (atBottom) {
    currentId = sections[sections.length - 1].id;
  } else {
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > probeY) { currentId = section.id; break; }
      if (rect.top <= probeY) currentId = section.id;
    }
  }

  navLinksBySection.forEach((links, key) => {
    links.forEach((link) => link.classList.toggle('active', key === currentId));
  });
}

function onScroll() {
  handleNavbarResize();
  updateActiveSection();
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateActiveSection);
onScroll();

// ============ smooth scrolling nav links ============
const NAV_HEIGHT_SCROLLED = 56;
document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(link.dataset.section);
    if (!target) return;
    if (link.dataset.section === 'header') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT_SCROLLED + 1;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ============ carousel ============
const track = document.getElementById('carouselTrack');
const slides = Array.from(track.children);
const dotsWrap = document.getElementById('carouselDots');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
let currentSlide = 0;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.addEventListener('click', () => goToSlide(i));
  dotsWrap.appendChild(dot);
});
const dots = Array.from(dotsWrap.children);

function goToSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

let autoplay = setInterval(() => goToSlide(currentSlide + 1), 6000);
const carouselEl = document.getElementById('carousel');
carouselEl.addEventListener('mouseenter', () => clearInterval(autoplay));
carouselEl.addEventListener('mouseleave', () => {
  autoplay = setInterval(() => goToSlide(currentSlide + 1), 6000);
});

// ============ modal ============
const projects = [
  { title: '棋阵对决 — Buff & Combat System', body: 'An 8×8 tactics battler with 20+ stackable buffs and debuffs, hero units, and a full local hotseat mode, designed and built from scratch in vanilla JS.', tech: ['HTML5 Canvas/DOM', 'JavaScript (ES6+)', 'Systems Design', 'Firebase Realtime DB'] },
  { title: '智取神圣盾 — Level Design', body: 'A tower-defense stage published on H5mota, focused on tight resource pacing and escalating enemy waves.', tech: ['Level Design', 'Encounter Pacing', 'H5mota Editor'] },
  { title: '智取神圣盾2 — Difficulty Curve', body: 'The sequel stage, raising the difficulty ceiling with smarter enemy behavior and multi-path defense puzzles.', tech: ['Level Design', 'Difficulty Tuning', 'Puzzle Design'] },
  { title: 'Realtime Multiplayer Sync', body: 'Added a Firebase-backed online mode to 棋阵对决, syncing board state and turn order live between two players.', tech: ['Firebase Realtime DB', 'State Sync', 'JavaScript'] },
];

const modal = document.getElementById('projectModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalTech = document.getElementById('modalTech');

function openModal(index) {
  const p = projects[index];
  if (!p) return;
  modalTitle.textContent = p.title;
  modalBody.textContent = p.body;
  modalTech.innerHTML = p.tech.map((t) => `<li>${t}</li>`).join('');
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.js-modal-open').forEach((btn) => {
  btn.addEventListener('click', () => openModal(Number(btn.dataset.project)));
});
modalOverlay.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ============ scroll-reveal animation ============
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// ============ hero canvas: floating particles ============
const heroCanvas = document.getElementById('hero-canvas');
const heroCtx = heroCanvas.getContext('2d');
let heroParticles = [];

function sizeHeroCanvas() {
  const header = document.getElementById('header');
  heroCanvas.width = header.clientWidth;
  heroCanvas.height = header.clientHeight;
  const count = Math.floor((heroCanvas.width * heroCanvas.height) / 12000);
  heroParticles = Array.from({ length: count }, () => ({
    x: Math.random() * heroCanvas.width,
    y: Math.random() * heroCanvas.height,
    r: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
  }));
}

function drawHero() {
  heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
  heroCtx.fillStyle = 'rgba(15, 184, 164, 0.55)';
  heroParticles.forEach((p) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > heroCanvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > heroCanvas.height) p.vy *= -1;
    heroCtx.beginPath();
    heroCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    heroCtx.fill();
  });
  requestAnimationFrame(drawHero);
}

window.addEventListener('resize', sizeHeroCanvas);
sizeHeroCanvas();
requestAnimationFrame(drawHero);

// ============ lab canvas: mouse-reactive particles ============
const labCanvas = document.getElementById('particle-canvas');
const labCtx = labCanvas.getContext('2d');
let labParticles = [];

function sizeLabCanvas() {
  labCanvas.width = labCanvas.clientWidth;
  labCanvas.height = labCanvas.clientHeight;
}

function spawnParticle(x, y) {
  labParticles.push({
    x, y,
    r: Math.random() * 3 + 1,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: 60,
    hue: Math.random() * 60 + 250,
  });
  if (labParticles.length > 250) labParticles.shift();
}

labCanvas.addEventListener('mousemove', (e) => {
  const rect = labCanvas.getBoundingClientRect();
  spawnParticle(e.clientX - rect.left, e.clientY - rect.top);
});

function drawLab() {
  labCtx.fillStyle = 'rgba(10, 14, 20, 0.25)';
  labCtx.fillRect(0, 0, labCanvas.width, labCanvas.height);
  labParticles.forEach((p) => {
    p.x += p.vx; p.y += p.vy; p.life -= 1;
    labCtx.beginPath();
    labCtx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${Math.max(p.life / 60, 0)})`;
    labCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    labCtx.fill();
  });
  labParticles = labParticles.filter((p) => p.life > 0);
  requestAnimationFrame(drawLab);
}

window.addEventListener('resize', sizeLabCanvas);
sizeLabCanvas();
requestAnimationFrame(drawLab);

// ============ contact form ============
const form = document.getElementById('contactForm');
const status = document.getElementById('contactStatus');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  status.textContent = "Thanks for reaching out! I'll get back to you soon.";
  form.reset();
});

// ============ embedded game: 棋阵对决 (Number Chess) ============
// The game's source lives inertly in index.html as two plain <template>
// fragments — numberChessHead (its <head> contents: meta/title/style) and
// numberChessBody (its <body> contents: markup + script). We deliberately do
// NOT store it as one template containing a full nested <!DOCTYPE>/<html>/
// <head>/<body> document: some build-time HTML processors (e.g.
// html-webpack-plugin's <link>/<script> tag injection) get confused when the
// source file contains more than one of those top-level tags — even ones that
// are inert inside a <template> — and can end up injecting the compiled
// main.css/main.js bundle tags into the wrong spot, which is exactly what
// stopped the compiled SCSS from loading. Splitting into headless fragments
// keeps this document's real <head>/<body> unambiguous for any HTML parser,
// while still letting us reassemble a full, valid document string here at
// runtime, wrap it in a same-origin Blob, and point the iframe at the
// resulting blob: URL.
//
// This also sidesteps depending on the webpack dev server / build pipeline to
// serve a separate static file at a guessed path (that's what was producing
// the "Cannot GET /games/..." 404 before) — the whole game ships inside
// index.html itself and is assembled purely client-side, so it works
// identically under `npm start` and the final GitHub Pages build.
(function initNumberChessEmbed() {
  const headTemplate = document.getElementById('numberChessHead');
  const bodyTemplate = document.getElementById('numberChessBody');
  const frame = document.getElementById('numberChessFrame');
  const openBtn = document.getElementById('numberChessOpenBtn');
  const fallback = document.getElementById('numberChessFallback');
  const fallbackLink = document.getElementById('numberChessFallbackLink');
  if (!headTemplate || !bodyTemplate || !frame) return;

  try {
    const headHtml = headTemplate.innerHTML;
    const bodyHtml = bodyTemplate.innerHTML;
    const fullHtml =
      '<!DOCTYPE html><html lang="zh-CN"><head>' + headHtml + '</head>' +
      '<body>' + bodyHtml + '</body></html>';

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);

    frame.src = blobUrl;
    if (openBtn) openBtn.href = blobUrl;
    if (fallbackLink) fallbackLink.href = blobUrl;

    // Some browsers block blob: iframes under stricter sandbox/CSP settings —
    // if the frame never fires 'load', surface the fallback link instead of a
    // silent blank box.
    let loaded = false;
    frame.addEventListener('load', () => { loaded = true; });
    setTimeout(() => {
      if (!loaded && fallback) fallback.hidden = false;
    }, 2500);
  } catch (err) {
    console.error('Failed to mount the embedded game:', err);
    if (fallback) fallback.hidden = false;
  }
})();