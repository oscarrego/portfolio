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
  ];

  const CONTENT_SELECTORS = [
    '.orbit-content-block',
    '.sentinel-content-block',
    '.jsms-content-block',
  ];

  const CARD_SELECTORS = [
    '.orbit-sticky-card',
    '.orbit-mobile-sticky-card',
    '.sentinel-sticky-card',
    '.jsms-sticky-card',
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
        }, 80);
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

  /* ── Video Controls ───────────────────────────────────────────── */
  function initVideoControls() {
    const placeholder = document.querySelector(
      '.orbit-main-placeholder, .sentinel-main-placeholder, .jsms-main-placeholder'
    );
    if (!placeholder) return;

    const video = placeholder.querySelector('video');
    const fallback = placeholder.querySelector('img');
    const controlBtn = placeholder.querySelector('.video-control-btn');

    if (!video || !fallback || !controlBtn) return;

    let isPlaying = true;

    controlBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (isPlaying) {
        // Pause Behavior
        video.pause();
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';

        fallback.style.opacity = '1';
        fallback.style.pointerEvents = 'auto';

        controlBtn.querySelector('.control-icon').textContent = '▶';
        controlBtn.setAttribute('aria-label', 'Play Video');
        isPlaying = false;
      } else {
        // Play Behavior
        fallback.style.opacity = '0';
        fallback.style.pointerEvents = 'none';

        video.style.opacity = '1';
        video.style.pointerEvents = 'auto';

        video.play().catch((err) => console.log('Video play interrupted:', err));

        controlBtn.querySelector('.control-icon').textContent = '⏸';
        controlBtn.setAttribute('aria-label', 'Pause Video');
        isPlaying = true;
      }
    });
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  function initAll() {
    initReveal();
    initVideoControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
