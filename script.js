/* ================================================
   ZYAKA — script.js
================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ================================================
   NAVBAR
================================================ */
const navbar = document.getElementById('navbar');
ScrollTrigger.create({
  start: 'top -60',
  onUpdate(self) {
    navbar.classList.toggle('scrolled', self.scroll() > 60);
  }
});

/* ================================================
   SMOOTH SCROLL
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
   HERO FLOATS — desktop only (hidden + skipped on mobile)
   FIX: Guard prevents GSAP yPercent transforms running
        on mobile where elements are display:none,
        which could still affect layout in some browsers.
================================================ */
function initHeroFloats() {
  // Skip entirely on mobile — floats are display:none there
  if (window.innerWidth <= 900) return;

  const floatEls = document.querySelectorAll('.hero-float');
  if (!floatEls.length) return;

  const yAmounts  = [-20, 16, -24, 18];
  const durations = [3.8, 4.6, 4.2, 3.5];
  const delays    = [0, 0.6, 0.3, 1.0];

  floatEls.forEach((el, i) => {
    gsap.to(el, {
      y: yAmounts[i],
      duration: durations[i],
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: delays[i],
    });
  });

  floatEls.forEach((el, i) => {
    const speeds = [-0.15, -0.08, -0.2, -0.12];
    ScrollTrigger.create({
      trigger: '#home',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.8,
      onUpdate(self) {
        const pct = self.progress;
        gsap.set(el, { yPercent: speeds[i] * 100 * pct });
      }
    });
  });
}

/* ================================================
   CARD SCROLL ANIMATIONS
   FIX: On mobile, skip 3D rotations (rotateX/rotateY)
        which escape overflow clipping and cause
        horizontal scroll. Use flat opacity+y only.
================================================ */
function initCardAnimations() {
  const isMobile = window.innerWidth <= 760;

  document.querySelectorAll('.cards-track').forEach(track => {
    const cards = track.querySelectorAll('.food-card');

    if (isMobile) {
      // Flat animation — no 3D that can overflow
      gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });

      ScrollTrigger.create({
        trigger: track,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        onEnter() {
          gsap.to(cards, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, stagger: 0.1, ease: 'power3.out',
          });
        },
        onLeaveBack() {
          gsap.to(cards, {
            opacity: 0, y: 50, scale: 0.95,
            duration: 0.45, stagger: 0.06, ease: 'power2.in',
          });
        }
      });
    } else {
      // Full 3D animation — desktop only
      gsap.set(cards, {
        opacity: 0, y: 80, rotateX: 22,
        rotateY: (i) => i === 0 ? -18 : i === 2 ? 18 : 0,
        scale: 0.9,
        transformOrigin: '50% 110%',
      });

      ScrollTrigger.create({
        trigger: track,
        start: 'top 82%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        onEnter() {
          gsap.to(cards, {
            opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1,
            duration: 0.85, stagger: 0.12, ease: 'power3.out',
            clearProps: 'rotateX,rotateY,scale',
          });
        },
        onLeaveBack() {
          gsap.to(cards, {
            opacity: 0, y: 80, rotateX: 22, scale: 0.9,
            duration: 0.55, stagger: 0.06, ease: 'power2.in',
          });
        }
      });
    }
  });
}

/* ================================================
   CARD MOUSE TILT — desktop only
================================================ */
function initCardTilt() {
  if (window.innerWidth <= 760) return; // no tilt on mobile/tablet

  document.querySelectorAll('.food-card').forEach(card => {
    const rxTo = gsap.quickTo(card, 'rotateX', { duration: 0.45, ease: 'power2.out' });
    const ryTo = gsap.quickTo(card, 'rotateY', { duration: 0.45, ease: 'power2.out' });
    const yTo  = gsap.quickTo(card, 'y',       { duration: 0.45, ease: 'power2.out' });

    card.addEventListener('mouseenter', () => { yTo(-10); });
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = (e.clientX - r.left)  / r.width  - 0.5;
      const cy = (e.clientY - r.top)   / r.height - 0.5;
      rxTo(-cy * 10);
      ryTo(cx  * 10);
    });
    card.addEventListener('mouseleave', () => { rxTo(0); ryTo(0); yTo(0); });
    card.addEventListener('mousedown',  () => gsap.to(card, { scale: 0.975, duration: 0.15, ease: 'power2.inOut' }));
    card.addEventListener('mouseup',    () => gsap.to(card, { scale: 1,     duration: 0.25, ease: 'power2.out'   }));
  });
}

/* ================================================
   ADD TO CART BUTTON — ripple + spin
================================================ */
function initCartButtons() {
  document.querySelectorAll('.card-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      gsap.fromTo(btn, { rotate: 0 }, { rotate: 360, duration: 0.5, ease: 'power2.inOut' });
      const ripple = document.createElement('span');
      Object.assign(ripple.style, {
        position: 'absolute', borderRadius: '50%',
        width: '60px', height: '60px',
        background: 'rgba(255,255,255,0.28)',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%) scale(0)',
        pointerEvents: 'none',
      });
      btn.appendChild(ripple);
      gsap.to(ripple, {
        scale: 2.5, opacity: 0, duration: 0.55,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
      });
    });
  });
}

/* ================================================
   SECTION ENTRANCE ANIMATIONS
================================================ */
function initSectionAnimations() {
  gsap.from('.menu-header', {
    opacity: 0, y: 55, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.menu-header', start: 'top 87%' }
  });

  gsap.utils.toArray('.cat-label-wrap').forEach(el => {
    gsap.from(el, {
      opacity: 0, x: -36, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  gsap.from('#aboutImages', {
    opacity: 0, x: -70, duration: 1.1, ease: 'power4.out',
    scrollTrigger: { trigger: '#about', start: 'top 78%', toggleActions: 'play none none reverse' }
  });
  gsap.from('#aboutText', {
    opacity: 0, x: 70, duration: 1.1, ease: 'power4.out',
    scrollTrigger: { trigger: '#about', start: 'top 78%', toggleActions: 'play none none reverse' }
  });
  gsap.from('.about-feat', {
    opacity: 0, y: 28, scale: 0.95, duration: 0.65,
    stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-features', start: 'top 87%' }
  });

  gsap.to('.about-img-main',   { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 2 } });
  gsap.to('.about-img-accent', { yPercent:  9, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 1.5 } });

  gsap.from('.contact-head', {
    opacity: 0, y: 45, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 82%' }
  });
  gsap.from('.contact-info', {
    opacity: 0, x: -55, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-wrap', start: 'top 84%' }
  });
  gsap.from('.contact-form', {
    opacity: 0, x: 55, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-wrap', start: 'top 84%' }
  });
  gsap.from('.contact-item', {
    opacity: 0, x: -28, duration: 0.55, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-items', start: 'top 88%' }
  });

  gsap.from('footer', {
    opacity: 0, y: 25, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: 'footer', start: 'top 94%' }
  });
}

/* ================================================
   FORM SUBMIT
================================================ */
function initForm() {
  const formBtn = document.getElementById('formBtn');
  if (!formBtn) return;

  formBtn.addEventListener('click', () => {
    if (formBtn.disabled) return;
    formBtn.textContent = 'Sending…';
    formBtn.style.opacity = '0.7';
    formBtn.disabled = true;

    setTimeout(() => {
      formBtn.textContent = '✓ Message Sent!';
      formBtn.style.opacity = '1';
      formBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
      setTimeout(() => {
        formBtn.textContent = 'Send Message →';
        formBtn.style.background = '';
        formBtn.style.opacity = '1';
        formBtn.disabled = false;
      }, 3000);
    }, 1600);
  });
}

/* ================================================
   HERO ENTRANCE
================================================ */
function playHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.08 });
  tl
    .to('.hero-badge',       { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
    .to('.hero-title',       { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out' }, '-=0.4')
    .to('.hero-tagline',     { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.5')
    .to('.hero-cta-row',     { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.45')
    .to('.scroll-indicator', { opacity: 1,       duration: 0.75, ease: 'power2.out' }, '-=0.3')
    .to('.hero-float',       { opacity: 1,       duration: 1.1, stagger: 0.15, ease: 'power2.out' }, '-=0.75');
}

/* ================================================
   INIT
================================================ */
window.addEventListener('load', () => {
  playHeroEntrance();
  initHeroFloats();
  initSectionAnimations();
  initCardAnimations();
  initCardTilt();
  initCartButtons();
  initForm();
  ScrollTrigger.refresh();
});