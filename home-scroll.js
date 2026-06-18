/* ═══════════════════════════════════════════════════════════════════════════
   OSCAR REGO PORTFOLIO 2026 — HOME-SCROLL.JS
   Editorial one-pager scroll animations.
   Uses GSAP + ScrollTrigger (loaded from CDN in index.html).
   Also handles: nav state, project hover preview, section reveals.
═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Wait for GSAP ──────────────────────────────────────────────────────── */
  function waitForGSAP(cb) {
    if (window.gsap && window.ScrollTrigger) {
      cb();
    } else {
      setTimeout(() => waitForGSAP(cb), 40);
    }
  }

  /* ── Smooth Scroll (Lenis) ──────────────────────────────────────────────── */
  function initLenis() {
    if (!window.Lenis) return;
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // If GSAP ticker is available, use it exclusively (avoids double-RAF)
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback: manual RAF
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    window._lenis = lenis;
  }

  /* ── Nav scroll state ───────────────────────────────────────────────────── */
  function initNav() {
    // Locked in place permanently; scroll listener disabled
  }

  /* ── Hero headline reveal ───────────────────────────────────────────────── */
  function initHeroReveal() {
    const spans = document.querySelectorAll('.hero-text-reveal');
    const bottom = document.querySelectorAll(
      '.hero-copyright, .hero-intro-name, .hero-intro-desc, .hero-scroll-cue'
    );

    if (!spans.length) return;

    gsap.set(spans, { y: '105%' });
    gsap.set(bottom, { opacity: 0, y: 18 });

    const tl = gsap.timeline({ delay: 0.3 });

    tl.to(spans, {
      y: '0%',
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.08,
    }).to(bottom, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.06,
    }, '-=0.4');
  }

  /* ── Section label stagger reveals ─────────────────────────────────────── */
  function initSectionReveals() {
    // Section labels fade up
    document.querySelectorAll('.section-label').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: 'power3.out',
      });
    });

    // ── Selected Work Showcase reveals ──────────────────────────────────────
    const swSection = document.querySelector('.sw-section');
    if (swSection) {
      // Heading lines: stagger upward
      const headingLines = swSection.querySelectorAll('.sw-heading-line');
      headingLines.forEach((line, i) => {
        gsap.from(line, {
          scrollTrigger: { trigger: swSection, start: 'top 82%', once: true },
          opacity: 0,
          y: 60,
          duration: 1.0,
          ease: 'power4.out',
          delay: i * 0.12,
        });
      });

      // Count badge
      const swCount = swSection.querySelector('.sw-count');
      if (swCount) {
        gsap.from(swCount, {
          scrollTrigger: { trigger: swSection, start: 'top 82%', once: true },
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.3,
        });
      }

      // Cards: fade + slide up with stagger
      const swCards = swSection.querySelectorAll('.sw-card');
      swCards.forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          opacity: 0,
          y: 48,
          duration: 0.9,
          ease: 'power4.out',
          delay: (i % 2) * 0.12,
        });
      });
    }

    // About text
    const bioText = document.querySelector('.about-bio-text');
    if (bioText) {
      gsap.from(bioText, {
        scrollTrigger: { trigger: bioText, start: 'top 85%', once: true },
        opacity: 0,
        y: 28,
        duration: 1,
        ease: 'power4.out',
      });
    }

    const aboutCols = document.querySelectorAll('.about-col-label, .about-col-list li');
    aboutCols.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        opacity: 0,
        y: 14,
        duration: 0.6,
        ease: 'power3.out',
        delay: i * 0.04,
      });
    });

    const aboutSub = document.querySelector('.about-bio-sub');
    if (aboutSub) {
      gsap.from(aboutSub, {
        scrollTrigger: { trigger: aboutSub, start: 'top 88%', once: true },
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power3.out',
      });
    }

    // Experience items stagger
    const expItems = document.querySelectorAll('.exp-item');
    expItems.forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 92%', once: true },
        opacity: 0,
        y: 20,
        duration: 0.65,
        ease: 'power3.out',
        delay: i * 0.06,
      });
    });

    // Exp title
    const expTitle = document.querySelector('.exp-title');
    if (expTitle) {
      gsap.from(expTitle, {
        scrollTrigger: { trigger: expTitle, start: 'top 85%', once: true },
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'power4.out',
      });
    }

    // Contact headline — stagger each word line
    const contactH = document.querySelector('.contact-headline');
    if (contactH) {
      const words = contactH.querySelectorAll('span');
      gsap.from(words, {
        scrollTrigger: { trigger: contactH, start: 'top 85%', once: true },
        opacity: 0,
        y: 40,
        duration: 1.0,
        ease: 'power4.out',
        stagger: 0.08,
      });
    }

    // Contact links
    const contactLinks = document.querySelectorAll('.contact-link-item');
    contactLinks.forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 92%', once: true },
        opacity: 0,
        x: -20,
        duration: 0.7,
        ease: 'power3.out',
        delay: i * 0.07,
      });
    });

    // Footer sig
    const footerSig = document.querySelector('.home-footer-sig');
    if (footerSig) {
      gsap.from(footerSig, {
        scrollTrigger: { trigger: footerSig, start: 'top 90%', once: true },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      });
    }
  }

  /* ── Hero portrait parallax ─────────────────────────────────────────────── */
  function initParallax() {
    const portrait = document.querySelector('.hero-portrait-wrap img');
    if (!portrait) return;

    gsap.to(portrait, {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.4,
      },
      y: -60,
      ease: 'none',
    });

    // Headline line 1 subtle parallax
    const line1 = document.querySelector('.hero-text-reveal:first-of-type');
    if (line1) {
      gsap.to(line1, {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 2,
        },
        y: -40,
        ease: 'none',
      });
    }
  }

  /* ── Orbit card toggle (Mobile ↔ Desktop) ──────────────────────────────── */
  function initOrbitToggle() {
    const toggle = document.getElementById('orbit-toggle');
    const video  = document.getElementById('orbit-video');
    if (!toggle || !video) return;

    const card = toggle.closest('.sw-card');

    const SOURCES = {
      mobile:  'videos/orbit_demo.mp4',
      desktop: 'videos/orbit_demo_pc.mp4',
    };

    let current = 'mobile';

    toggle.querySelectorAll('.sw-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.mode;
        if (mode === current) return;
        current = mode;

        // Button state
        toggle.querySelectorAll('.sw-toggle-btn').forEach((b) => {
          b.classList.toggle('active', b.dataset.mode === mode);
          b.setAttribute('aria-pressed', b.dataset.mode === mode ? 'true' : 'false');
        });

        // Apply tighter framing class for Desktop preview
        if (card) {
          card.classList.toggle('sw-card--orbit-desktop', mode === 'desktop');
        }

        // Crossfade video
        video.classList.add('fading');
        setTimeout(() => {
          video.src = SOURCES[mode];
          video.load();
          video.play().catch(() => {});
          video.classList.remove('fading');
        }, 340);
      });
    });
  }


  /* ── Clickable card navigation ──────────────────────────────────────────── */
  function initCardNav() {
    document.querySelectorAll('.sw-card[data-href]').forEach((card) => {
      card.addEventListener('click', () => {
        window.location.href = card.dataset.href;
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.href = card.dataset.href;
        }
      });
    });
  }

  /* ── Scroll-to utility for nav links ────────────────────────────────────── */
  function initNavLinks() {
    // Select all local anchors EXCEPT those inside the menu card (handled by menu logic)
    document.querySelectorAll('a[href^="#"]:not(.menu-link)').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        if (window._lenis) {
          window._lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ── Active nav highlight ───────────────────────────────────────────────── */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const menuLinks = document.querySelectorAll('.menu-link[href^="#"]');

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          menuLinks.forEach((a) => {
            const target = a.getAttribute('href').slice(1);
            if (target === entry.target.id) {
              a.style.opacity = '1';
              a.style.color = 'var(--accent)';
            } else {
              a.style.opacity = '';
              a.style.color = '';
            }
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach((s) => obs.observe(s));
  }

  /* ── Menu Open/Close ────────────────────────────────────────────────────── */
  function initMenu() {
    const trigger = document.getElementById('pill-nav-trigger');
    const closeBtn = document.getElementById('menu-close-btn');
    const overlay = document.getElementById('menu-overlay');
    const links = document.querySelectorAll('.menu-link');

    if (!overlay) return;

    function openMenu() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      if (window._lenis) {
        window._lenis.stop();
      }
      const navContainer = document.querySelector('.pill-nav-container');
      if (navContainer) {
        navContainer.style.opacity = '0';
        navContainer.style.pointerEvents = 'none';
      }
    }

    function closeMenu() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      if (window._lenis) {
        window._lenis.start();
      }
      const navContainer = document.querySelector('.pill-nav-container');
      if (navContainer) {
        navContainer.style.opacity = '1';
        navContainer.style.pointerEvents = 'auto';
      }
    }

    if (trigger) {
      trigger.addEventListener('click', openMenu);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }

    // Close menu when clicking outside the card
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeMenu();
      }
    });

    // Close menu when clicking links, and handle scrolling
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        if (!target) return;
        
        e.preventDefault();
        closeMenu();

        // Let the menu transition finish before scrolling for a smoother feel
        setTimeout(() => {
          if (window._lenis) {
            window._lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      });
    });
  }

  /* ── Narrative scroll lock & highlight ──────────────────────────────────── */
  function initNarrative() {
    const section = document.querySelector('.narrative-section');
    if (!section) return;
    
    const words = section.querySelectorAll('.narrative-word');
    if (!words.length) return;

    // Stagger color reveal of each word as user scrolls through the section
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 0.8,
      }
    })
    .to(words, {
      color: '#000000',
      stagger: 0.08,
      ease: 'none'
    });
  }

  /* ── Init ───────────────────────────────────────────────────────────────── */
  function init() {
    initLenis();
    initNav();
    initMenu();
    initNavLinks();
    initActiveNav();
    initOrbitToggle();
    initCardNav();

    waitForGSAP(() => {
      gsap.registerPlugin(ScrollTrigger);
      initHeroReveal();
      initNarrative();
      initSectionReveals();
      initParallax();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
