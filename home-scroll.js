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

  /* ── Hero headline reveal ──────────────────────────────────────── */
  function initHeroReveal() {
    const spans = document.querySelectorAll('.hero-text-reveal');
    const bottom = document.querySelectorAll(
      '.hero-copyright, .hero-scroll-indicator'
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

  /* ── Hero text parallax ──────────────────────────────────────── */
  function initParallax() {
    // Target the OUTER line wrappers, NOT the inner reveal spans.
    // The inner spans have overflow:hidden on their parent; animating Y on them
    // causes the text to be clipped against that boundary on scroll-back.
    const line1 = document.querySelector('.hero-headline-line:nth-child(1)'); // SOFTWARE wrapper
    const line2 = document.querySelector('.hero-headline-line:nth-child(2)'); // ENGINEER wrapper

    if (line1 && line2) {
      // Animate SOFTWARE wrapper moving left
      gsap.to(line1, {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
        x: -120,
        ease: 'none'
      });

      // Animate ENGINEER wrapper moving right
      gsap.to(line2, {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
        x: 120,
        ease: 'none'
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
              a.classList.add('active');
            } else {
              a.classList.remove('active');
            }
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach((s) => obs.observe(s));
  }

  /* ── Menu Open/Close ────────────────────────────────────────────────────── */
  function initMenu() {
    const pillNav = document.getElementById('pill-nav');
    const scrim = document.getElementById('menu-scrim');
    const trigger = document.getElementById('pill-nav-trigger');
    const links = document.querySelectorAll('.menu-link');

    if (!pillNav || !scrim) return;

    function openMenu() {
      pillNav.classList.add('open');
      scrim.classList.add('open');
      scrim.setAttribute('aria-hidden', 'false');

      if (window._lenis) {
        window._lenis.stop();
      }
    }

    function closeMenu() {
      pillNav.classList.remove('open');
      scrim.classList.remove('open');
      scrim.setAttribute('aria-hidden', 'true');

      if (window._lenis) {
        window._lenis.start();
      }
    }

    function toggleMenu() {
      if (pillNav.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        toggleMenu();
      });
    }

    // Close menu when clicking the scrim backdrop
    scrim.addEventListener('click', (e) => {
      closeMenu();
    });

    // Close menu when pressing Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pillNav.classList.contains('open')) {
        closeMenu();
        if (window.playTone) {
          window.playTone('menu-close');
        }
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
        }, 450);
      });
    });
  }

  /* ── Narrative scroll lock & highlight ──────────────────────── */
  function initNarrative() {
    const section = document.querySelector('.narrative-section');
    if (!section) return;

    const paragraphs = section.querySelectorAll('.narrative-paragraph');
    if (!paragraphs.length) return;

    const words = section.querySelectorAll('.narrative-word');
    if (!words.length) return;

    // Premium cubic ease-in-out for organic, smooth transitions
    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    // Faded = very low opacity dark-on-cream (12%), active = fully opaque (100%)
    const FADED  = 0.12;
    const ACTIVE = 1.0;

    // Make paragraphs fully visible so we can control opacity word-by-word
    paragraphs.forEach(p => {
      p.style.opacity = '1';
    });

    let ticking = false;

    function updateNarrativeScroll() {
      const rect = section.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Total scrollable range of the spacer section
      const travelLimit = sectionHeight - viewportHeight;
      if (travelLimit <= 0) return;

      // Progress: 0.0 when section top touches viewport top,
      //           1.0 when section bottom touches viewport bottom
      const top = rect.top;
      let progress = -top / travelLimit;
      progress = Math.max(0, Math.min(1, progress));

      // Highlight each word based on progress
      const N = words.length;
      const windowSize = 0.12; // Overlapping window size

      words.forEach((word, index) => {
        const targetProgress = N > 1 ? index / (N - 1) : 0;
        const wordStart = targetProgress - windowSize;
        const wordEnd = targetProgress;

        let wordProgress = (progress - wordStart) / (wordEnd - wordStart);
        wordProgress = Math.max(0, Math.min(1, wordProgress));

        const eased = easeInOutCubic(wordProgress);
        word.style.opacity = (FADED + (ACTIVE - FADED) * eased).toFixed(3);
      });
    }

    // High performance rAF batching scroll handler
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateNarrativeScroll();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    // Kick initial render
    updateNarrativeScroll();
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
