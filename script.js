/* ================================================
   ZYAKA — script.js
================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ---- NAVBAR ---- */
const navbar = document.getElementById('navbar');
ScrollTrigger.create({
  start: 'top -60',
  onUpdate(self) {
    navbar.classList.toggle('scrolled', self.scroll() > 60);
  }
});

/* ---- ACTIVE NAV LINK (underline follows current section) ---- */
function initActiveNav() {
  const sections  = document.querySelectorAll('section[id], footer[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  const setActive = (id) => {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');          // e.g. "#home"
      link.classList.toggle('active', href === `#${id}`);
    });
  };

  // Use IntersectionObserver — rootMargin shrinks the detection zone so tall
  // sections (like #menu) trigger as soon as they occupy the middle of the screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, {
    rootMargin: '-40% 0px -55% 0px', // fires when section crosses the middle band
    threshold: 0
  });

  sections.forEach(sec => observer.observe(sec));

  // Also handle click — highlight immediately on click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ---- SMOOTH SCROLL ---- */
window.smoothScrollTo = function(target) {
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
};

/* ---- MOBILE MENU ---- */
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

/* ---- HERO FLOATS (Desktop Only) ---- */
function initHeroFloats() {
  if (window.innerWidth <= 900) return;

  const floatEls = document.querySelectorAll('.hero-float');
  if (!floatEls.length) return;

  const yAmounts  = [-20, 16, -24, 18];
  const durations = [3.8, 4.6, 4.2, 3.5];

  floatEls.forEach((el, i) => {
    gsap.to(el, { y: yAmounts[i], duration: durations[i], ease: 'sine.inOut', repeat: -1, yoyo: true });
    
    ScrollTrigger.create({
      trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1.8,
      onUpdate(self) {
        gsap.set(el, { yPercent: [-0.15, -0.08, -0.2, -0.12][i] * 100 * self.progress });
      }
    });
  });
}

/* ---- CARD SCROLL ANIMATIONS (Clean & Scroll-Safe) ---- */
function initCardAnimations() {
  document.querySelectorAll('.cards-track').forEach(track => {
    const cards = track.querySelectorAll('.food-card');

    // will-change hints browser to composite on own layer — eliminates repaint glitch
    gsap.set(cards, { opacity: 0, y: 40, willChange: 'transform, opacity' });

    ScrollTrigger.create({
      trigger: track,
      start: 'top 88%',
      once: true, // play only once — prevents re-triggering glitch on scroll back
      onEnter() {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.12,
          ease: 'power2.out',
          onComplete() {
            // Remove inline styles so CSS :hover transform works cleanly
            gsap.set(cards, { clearProps: 'transform,willChange' });
          }
        });
      }
    });
  });
}

/* ---- ADD TO CART BUTTON RIPPLE ---- */
function initCartButtons() {
  document.querySelectorAll('.card-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      gsap.fromTo(btn, { rotate: 0 }, { rotate: 360, duration: 0.5, ease: 'power2.inOut' });
    });
  });
}

/* ---- SECTION ENTRANCE ANIMATIONS ---- */
function initSectionAnimations() {
  gsap.from('.menu-header', { opacity: 0, y: 40, duration: 0.9, scrollTrigger: { trigger: '.menu-header', start: 'top 85%' }});
  gsap.from('.cat-label-wrap', { opacity: 0, x: -30, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: '#menu', start: 'top 70%' }});

  gsap.from('#aboutImages', { opacity: 0, x: -50, duration: 1, scrollTrigger: { trigger: '#about', start: 'top 75%' }});
  gsap.from('#aboutText', { opacity: 0, x: 50, duration: 1, scrollTrigger: { trigger: '#about', start: 'top 75%' }});
  
  gsap.to('.about-img-main',   { yPercent: -8, scrollTrigger: { trigger: '#about', start: 'top bottom', scrub: 1 }});
  gsap.to('.about-img-accent', { yPercent:  9, scrollTrigger: { trigger: '#about', start: 'top bottom', scrub: 1 }});

  // Contact section — staggered entrance for heading, info cards, and form
  gsap.from('.contact-head', {
    opacity: 0, y: 35, duration: 0.8,
    scrollTrigger: { trigger: '#contact', start: 'top 82%' }
  });
  gsap.from('.contact-info', {
    opacity: 0, x: -40, duration: 0.8, delay: 0.1,
    scrollTrigger: { trigger: '.contact-wrap', start: 'top 85%' }
  });
  gsap.from('.contact-form', {
    opacity: 0, x: 40, duration: 0.8, delay: 0.1,
    scrollTrigger: { trigger: '.contact-wrap', start: 'top 85%' }
  });
  gsap.from('.contact-item', {
    opacity: 0, y: 20, duration: 0.5, stagger: 0.1,
    scrollTrigger: { trigger: '.contact-items', start: 'top 88%' }
  });
  gsap.from('.form-group', {
    opacity: 0, y: 18, duration: 0.5, stagger: 0.1,
    scrollTrigger: { trigger: '.contact-form', start: 'top 88%' }
  });
}

/* ---- FORM SUBMIT ---- */
function initForm() {
  const formBtn = document.getElementById('formBtn');
  if (!formBtn) return;

  formBtn.addEventListener('click', () => {
    if (formBtn.disabled) return;
    formBtn.textContent = 'Sending…'; formBtn.style.opacity = '0.7'; formBtn.disabled = true;

    setTimeout(() => {
      formBtn.textContent = '✓ Message Sent!'; formBtn.style.opacity = '1';
      formBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
      setTimeout(() => {
        formBtn.textContent = 'Send Message →'; formBtn.style.background = ''; formBtn.disabled = false;
      }, 3000);
    }, 1600);
  });
}

/* ---- HERO ENTRANCE ---- */
function playHeroEntrance() {
  gsap.timeline({ delay: 0.1 })
    .to('.hero-badge',   { opacity: 1, y: 0, duration: 0.7 })
    .to('.hero-title',   { opacity: 1, y: 0, duration: 0.9 }, '-=0.4')
    .to('.hero-tagline', { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
    .to('.hero-cta-row', { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
    .to('.hero-float',   { opacity: 1, duration: 1, stagger: 0.1 }, '-=0.6');
}

/* ---- INIT ---- */
window.addEventListener('load', () => {
  playHeroEntrance();
  initHeroFloats();
  initSectionAnimations();
  initCardAnimations();
  initCartButtons();
  initForm();
  initActiveNav();
  ScrollTrigger.refresh();
});