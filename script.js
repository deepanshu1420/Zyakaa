/* ================================================
   ZYAKA — script.js
   GSAP Scroll Animations | 3D Float & Rotate Cards
================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ================================================
   NAVBAR SCROLL EFFECT
================================================ */
const navbar = document.getElementById('navbar');
ScrollTrigger.create({
  start: 'top -60',
  onUpdate(self) {
    navbar.classList.toggle('scrolled', self.progress > 0);
  }
});

/* ================================================
   SMOOTH SCROLL HELPER
================================================ */
window.smoothScrollTo = function(target) {
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
};

/* ================================================
   HAMBURGER / MOBILE MENU
================================================ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ================================================
   HERO FLOATS — continuous idle animation
================================================ */
document.querySelectorAll('.hero-float').forEach((el, i) => {
  gsap.to(el, {
    y: i % 2 === 0 ? -22 : 18,
    rotateZ: i % 2 === 0 ? 2.5 : -2.5,
    duration: 4 + i * 0.8,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    delay: i * 0.5,
  });
});

/* ================================================
   HERO FLOATS — scroll parallax
================================================ */
const floats = document.querySelectorAll('.hero-float');
gsap.to(floats[0], { yPercent: -40, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1.5 } });
gsap.to(floats[1], { yPercent: -20, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 2.5 } });
gsap.to(floats[2], { yPercent: -50, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1.2 } });
gsap.to(floats[3], { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 2   } });

/* ================================================
   CARD SCROLL ANIMATIONS
================================================ */
function initCardAnimations() {
  const tracks = document.querySelectorAll('.cards-track');

  tracks.forEach(track => {
    const cards = track.querySelectorAll('.food-card');

    cards.forEach((card, i) => {
      const delay   = parseFloat(card.dataset.delay || 0) / 1000;
      const isLeft  = i === 0;
      const isRight = i === 2;

      const startRotY = isLeft ? -35 : isRight ? 35 : 0;
      const startRotX = 30;
      const startZ    = -120;

      gsap.set(card, {
        opacity: 0,
        y: 120,
        rotateX: startRotX,
        rotateY: startRotY,
        z: startZ,
        scale: 0.88,
        transformOrigin: '50% 100%',
      });

      gsap.to(card, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        z: 0,
        scale: 1,
        duration: 1.1,
        delay: delay,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: track,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        }
      });

      ScrollTrigger.create({
        trigger: track,
        start: 'top 82%',
        onEnter: () => startCardFloat(card, i),
        onLeaveBack: () => stopCardFloat(card),
      });
    });
  });
}

const floatTimelines = new WeakMap();

function startCardFloat(card, i) {
  if (floatTimelines.has(card)) return; 

  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  tl.to(card, {
    y: -14 - i * 3,
    rotateZ: (i % 2 === 0 ? 1.5 : -1.5),
    duration: 2.8 + i * 0.5,
    ease: 'sine.inOut',
  });
  floatTimelines.set(card, tl);
}

function stopCardFloat(card) {
  const tl = floatTimelines.get(card);
  if (tl) { tl.kill(); floatTimelines.delete(card); }
  gsap.to(card, { y: 0, rotateZ: 0, duration: .5, ease: 'power2.out' });
}

/* ================================================
   CARD MOUSE TILT — QUICKTO OPTIMIZATION
================================================ */
document.querySelectorAll('.food-card').forEach(card => {
  
  const rotXTo = gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power3.out" });
  const rotYTo = gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power3.out" });

  card.addEventListener('mouseenter', () => {
    const tl = floatTimelines.get(card);
    if (tl) tl.pause();

    gsap.to(card, {
      y: -10,
      scale: 1.02,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto"
    });
  });

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx   = (e.clientX - rect.left)  / rect.width  - 0.5;
    const cy   = (e.clientY - rect.top)   / rect.height - 0.5;

    rotXTo(-cy * 12);
    rotYTo(cx * 12);
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
      onComplete: () => {
        const tl = floatTimelines.get(card);
        if (tl) tl.play();
      }
    });
  });

  card.addEventListener('mousedown', () => {
    gsap.to(card, { scale: 0.98, duration: .15, ease: 'power2.inOut', overwrite: 'auto' });
  });
  card.addEventListener('mouseup', () => {
    gsap.to(card, { scale: 1.02, duration: .25, ease: 'power2.out', overwrite: 'auto' });
  });
});

/* ================================================
   ABOUT SECTION & OTHER TRIGGERS
================================================ */
gsap.from('.menu-header', {
  opacity: 0, y: 60, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.menu-header', start: 'top 85%' }
});

gsap.utils.toArray('.cat-label-wrap').forEach(el => {
  gsap.from(el, {
    opacity: 0, x: -40, duration: .85, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' }
  });
});

gsap.from('#aboutImages', {
  opacity: 0, x: -80, rotateY: 12, duration: 1.2, ease: 'power4.out',
  scrollTrigger: { trigger: '#about', start: 'top 75%', toggleActions: 'play none none reverse' }
});

gsap.from('#aboutText', {
  opacity: 0, x: 80, duration: 1.2, ease: 'power4.out',
  scrollTrigger: { trigger: '#about', start: 'top 75%', toggleActions: 'play none none reverse' }
});

gsap.from('.about-feat', {
  opacity: 0, y: 30, scale: .94, duration: .7, stagger: .15, ease: 'power3.out',
  scrollTrigger: { trigger: '.about-features', start: 'top 85%' }
});

gsap.to('.about-img-main', {
  yPercent: -10, ease: 'none',
  scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 2 }
});
gsap.to('.about-img-accent', {
  yPercent: 10, ease: 'none',
  scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
});

gsap.from('#contactHead', {
  opacity: 0, y: 50, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '#contact', start: 'top 80%' }
});

gsap.from('#contactInfo', {
  opacity: 0, x: -60, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contact-wrap', start: 'top 82%' }
});

gsap.from('#contactForm', {
  opacity: 0, x: 60, rotateY: 8, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contact-wrap', start: 'top 82%' }
});

gsap.from('.contact-item', {
  opacity: 0, x: -30, duration: .6, stagger: .12, ease: 'power3.out',
  scrollTrigger: { trigger: '.contact-items', start: 'top 88%' }
});

document.querySelectorAll('.cards-track').forEach(track => {
  gsap.fromTo(track,
    { rotateX: 6 },
    { rotateX: -4, ease: 'none', scrollTrigger: { trigger: track, start: 'top bottom', end: 'bottom top', scrub: 1.5 } }
  );
});

gsap.from('footer', {
  opacity: 0, y: 30, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: 'footer', start: 'top 92%' }
});

/* ================================================
   FORM SUBMIT & BUTTON RIPPLE
================================================ */
const formBtn = document.getElementById('formBtn');
formBtn.addEventListener('click', () => {
  formBtn.textContent = 'Sending…';
  formBtn.style.opacity = '.7';
  formBtn.disabled = true;

  setTimeout(() => {
    formBtn.textContent = '✓ Message Sent!';
    formBtn.style.opacity = '1';
    formBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';

    setTimeout(() => {
      formBtn.textContent = 'Send Message →';
      formBtn.style.background = '';
      formBtn.disabled = false;
    }, 3000);
  }, 1600);
});

document.querySelectorAll('.card-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const ripple = document.createElement('span');
    ripple.style.cssText = `position:absolute; border-radius:50%; width:60px; height:60px; background:rgba(255,255,255,0.25); top:50%; left:50%; transform:translate(-50%,-50%) scale(0); pointer-events:none;`;
    btn.style.position = 'relative';
    btn.appendChild(ripple);

    gsap.to(ripple, { scale: 2.5, opacity: 0, duration: .5, ease: 'power2.out', onComplete: () => ripple.remove() });
    gsap.fromTo(btn, { rotate: 0 }, { rotate: 360, duration: .45, ease: 'power2.inOut' });
  });
});

/* ================================================
   LOAD EVENT — PERFECTLY TIMED EXECUTION
================================================ */
window.addEventListener('load', () => {
  // 1. Play hero entrance animations ONLY after images are downloaded
  const heroTl = gsap.timeline({ delay: 0.1 });
  heroTl
    .to('.hero-badge',     { opacity: 1, y: 0, duration: .8, ease: 'power3.out' })
    .to('.hero-title',     { opacity: 1, y: 0, duration: 1,  ease: 'power3.out' }, '-=.4')
    .to('.hero-tagline',   { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=.5')
    .to('.hero-cta-row',   { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=.4')
    .to('.scroll-indicator', { opacity: 1, duration: .8 }, '-=.3')
    .to('.hero-float',     { opacity: 1, duration: 1.2, stagger: .18, ease: 'power2.out' }, '-=.8')
    .to('.orb',            { opacity: 1, duration: 2, stagger: .25, ease: 'power1.inOut' }, 0);

  // 2. Setup the card scroll triggers with correct image heights
  initCardAnimations();

  // 3. Force GSAP to recalculate everything just to be completely safe
  ScrollTrigger.refresh();
});