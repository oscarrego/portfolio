/*
  OSCAR REGO PORTFOLIO 2026
  PROJECT DETAIL — SHARED SCROLL-REVEAL JS
  ─────────────────────────────────────────
  Applied to: orbit.html, sentinel.html, jsms.html

  Uses IntersectionObserver (no GSAP, no libraries).
  Adds .pd-revealed class to content blocks and image cards as
  they enter the viewport, triggering CSS transitions defined in
  project-detail.css.

  Timing:
    - Content block (left):  reveals immediately on intersection
    - Image card   (right):  reveals 80ms after content block
      (creates a subtle left → right stagger feel)

  Performance: lightweight, 60fps-safe, no scroll listeners.
  Accessibility: respects prefers-reduced-motion.
*/

(function () {
  'use strict';

  /* Bail out immediately for reduced-motion users.
     CSS already makes elements visible; nothing else needed. */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) return;

  /* ── Selectors for each project page ─────────────────────────── */
  const ROW_SELECTORS = [
    /* Orbit */
    '.orbit-detail-row',
    /* Sentinel */
    '.sentinel-detail-row',
    /* JSMS */
    '.jsms-detail-row',
    /* StudyGPT */
    '.studygpt-detail-row',
  ];

  const CONTENT_SELECTORS = [
    '.orbit-content-block',
    '.sentinel-content-block',
    '.jsms-content-block',
    '.studygpt-content-block',
  ];

  const CARD_SELECTORS = [
    '.orbit-sticky-card',
    '.orbit-mobile-sticky-card',
    '.sentinel-sticky-card',
    '.jsms-sticky-card',
    '.studygpt-sticky-card',
  ];

  /* ── IntersectionObserver ─────────────────────────────────────── */

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px', /* Trigger slightly before fully in view */
    threshold: 0.12,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const row = entry.target;

      /* Find the content block (left column) inside this row */
      const contentBlock = row.querySelector(CONTENT_SELECTORS.join(', '));
      /* Find the image card (right column) inside this row */
      const imageCard = row.querySelector(CARD_SELECTORS.join(', '));

      /* Reveal content block immediately */
      if (contentBlock) {
        contentBlock.classList.add('pd-revealed');
      }

      /* Reveal image card with a subtle stagger delay */
      if (imageCard) {
        setTimeout(() => {
          imageCard.classList.add('pd-revealed');
        }, 100);
      }

      /* Once revealed, stop observing this row — no repeat animations */
      observer.unobserve(row);
    });
  }, observerOptions);

  /* ── Observe all detail rows ──────────────────────────────────── */

  function initReveal() {
    const allRowSelectors = ROW_SELECTORS.join(', ');
    const rows = document.querySelectorAll(allRowSelectors);

    if (!rows.length) return;

    rows.forEach((row) => {
      observer.observe(row);
    });
  }
  /* ── Video Controls ───────────────────────────────────── */
  function initVideoControls() {
    const placeholder = document.querySelector(
      '.orbit-main-placeholder, .sentinel-main-placeholder, .jsms-main-placeholder, .studygpt-main-placeholder'
    );
    if (!placeholder) return;

    const video = placeholder.querySelector('video');
    const fallback = placeholder.querySelector('img');
    const controlBtn = placeholder.querySelector('.video-control-btn');

    if (!video || !fallback || !controlBtn) return;

    controlBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      const isPaused = placeholder.classList.contains('video-paused');

      if (!isPaused) {
        // Pause Behavior
        video.pause();
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';

        fallback.style.opacity = '1';
        fallback.style.pointerEvents = 'auto';

        controlBtn.classList.add('paused');
        controlBtn.setAttribute('aria-label', 'Play Video');
        placeholder.classList.add('video-paused');
      } else {
        // Play Behavior
        fallback.style.opacity = '0';
        fallback.style.pointerEvents = 'none';

        video.style.opacity = '1';
        video.style.pointerEvents = 'auto';

        video.play().catch((err) => console.log('Video play interrupted:', err));

        controlBtn.classList.remove('paused');
        controlBtn.setAttribute('aria-label', 'Pause Video');
        placeholder.classList.remove('video-paused');
      }
    });
  }

  /* ── Orbit Hero Mode Toggle (Mobile / Desktop) ────────── */
  function initOrbitHeroToggle() {
    const toggle = document.getElementById('hero-video-toggle');
    const placeholder = document.querySelector('.orbit-main-placeholder');
    const video = placeholder?.querySelector('.orbit-hero-video');
    const fallback = placeholder?.querySelector('.orbit-hero-fallback');

    if (!toggle || !placeholder || !video) return;

    const SOURCES = {
      mobile: 'videos/orbit_demo.mp4',
      desktop: 'videos/orbit_demo_pc.mp4',
    };

    const FALLBACKS = {
      mobile: 'images/orbit_main.png',
      desktop: 'images/orbit_main.png',
    };

    let currentMode = 'mobile';

    // Set initial active state and container scale on load
    placeholder.classList.add('mobile-active');

    toggle.querySelectorAll('.video-mode-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.mode;
        if (mode === currentMode) return;
        currentMode = mode;

        // Button state update
        toggle.querySelectorAll('.video-mode-btn').forEach((b) => {
          const isActive = b.dataset.mode === mode;
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        // Apply scale transition to placeholder
        if (mode === 'mobile') {
          placeholder.classList.add('mobile-active');
        } else {
          placeholder.classList.remove('mobile-active');
        }

        // Crossfade video source
        video.classList.add('fading');
        setTimeout(() => {
          video.src = SOURCES[mode];
          if (fallback) {
            fallback.src = FALLBACKS[mode];
          }
          video.load();
          
          // Only play if it's not currently paused
          const isPaused = placeholder.classList.contains('video-paused');
          if (!isPaused) {
            video.play().catch((err) => console.log('Video play interrupted:', err));
          }
          video.classList.remove('fading');
        }, 340);
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  function initAll() {
    initReveal();
    initVideoControls();
    initOrbitHeroToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
