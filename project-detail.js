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
    /* Issue Tracker */
    '.issuetracker-detail-row',
    /* Mediarift */
    '.mediarift-detail-row',
  ];

  const CONTENT_SELECTORS = [
    '.orbit-content-block',
    '.sentinel-content-block',
    '.jsms-content-block',
    '.studygpt-content-block',
    '.issuetracker-content-block',
    '.mediarift-content-block',
  ];

  const CARD_SELECTORS = [
    '.orbit-sticky-card',
    '.orbit-mobile-sticky-card',
    '.sentinel-sticky-card',
    '.jsms-sticky-card',
    '.studygpt-sticky-card',
    '.issuetracker-sticky-card',
    '.mediarift-sticky-card',
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

  /* ── Custom cursor for project images ──────────────────────────────────── */
  function initProjectImageCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'pd-image-cursor';
    cursor.textContent = 'View';
    document.body.appendChild(cursor);

    const imageSelectors = [
      '.orbit-sticky-image.active',
      '.orbit-mobile-sticky-image.active',
      '.sentinel-sticky-image.active',
      '.jsms-sticky-image.active',
      '.studygpt-sticky-image.active',
      '.issuetracker-sticky-image.active',
      '.mediarift-sticky-image.active',
      '.pd-panel-card',
    ];

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let rafId = null;

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function animate() {
      cursorX = lerp(cursorX, mouseX, 0.35);
      cursorY = lerp(cursorY, mouseY, 0.35);
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    }

    function startLoop() {
      if (!rafId) animate();
    }

    function stopLoop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function bindImage(el) {
      el.addEventListener('mouseenter', (e) => {
        if (e.target.closest('.carousel-nav')) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorX = mouseX;
        cursorY = mouseY;
        cursor.classList.add('active');
        el.classList.add('pd-cursor-active');
        startLoop();
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        el.classList.remove('pd-cursor-active');
        stopLoop();
      });

      el.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (e.target.closest('.carousel-nav')) {
          cursor.classList.remove('active');
          el.classList.remove('pd-cursor-active');
        } else {
          cursor.classList.add('active');
          el.classList.add('pd-cursor-active');
        }
      });
    }

    function observeImages() {
      imageSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          bindImage(el);
        });
      });
    }

    observeImages();

    // Re-bind when carousel slides change (active class moves)
    const carouselWrappers = document.querySelectorAll('.orbit-carousel-wrapper, .sentinel-carousel-wrapper, .jsms-carousel-wrapper, .studygpt-carousel-wrapper, .issuetracker-carousel-wrapper, .mediarift-carousel-wrapper, .orbit-mobile-carousel-wrapper');
    carouselWrappers.forEach(wrapper => {
      const observer = new MutationObserver(() => {
        imageSelectors.forEach(sel => {
          wrapper.querySelectorAll(sel).forEach(el => {
            if (!el.dataset.cursorBound) {
              bindImage(el);
              el.dataset.cursorBound = 'true';
            }
          });
        });
      });
      observer.observe(wrapper, { attributes: true, subtree: true, attributeFilter: ['class'] });
    });
  }

/* ── Lightbox for project images ────────────────────────────────────────── */
  function initProjectLightbox() {
    const overlay = document.createElement('div');
    overlay.className = 'pd-lightbox';
    overlay.innerHTML = `
      <div class="pd-lightbox-backdrop"></div>
      <div class="pd-lightbox-content">
        <button class="pd-lightbox-nav pd-lightbox-prev" aria-label="Previous"><</button>
        <img class="pd-lightbox-img" src="" alt="">
        <button class="pd-lightbox-nav pd-lightbox-next" aria-label="Next">></button>
        <button class="pd-lightbox-close" aria-label="Close">&times;</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const lightboxImg = overlay.querySelector('.pd-lightbox-img');
    const backdrop = overlay.querySelector('.pd-lightbox-backdrop');
    const closeBtn = overlay.querySelector('.pd-lightbox-close');
    const prevBtn = overlay.querySelector('.pd-lightbox-prev');
    const nextBtn = overlay.querySelector('.pd-lightbox-next');

    let currentImages = [];
    let currentIndex = 0;

    function openLightbox(src, alt, images, index) {
      currentImages = images;
      currentIndex = index;
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateNavVisibility();
    }
    window.openProjectLightbox = openLightbox;

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    function updateNavVisibility() {
      const showNav = currentImages.length > 1;
      prevBtn.style.display = showNav ? 'flex' : 'none';
      nextBtn.style.display = showNav ? 'flex' : 'none';
    }

    function navigate(direction) {
      if (currentImages.length <= 1) return;
      currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
      const img = currentImages[currentIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
    }

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate(-1);
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate(1);
    });

    backdrop.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    // Bind click on all carousel images
    const imageSelectors = [
      '.orbit-sticky-image',
      '.orbit-mobile-sticky-image',
      '.sentinel-sticky-image',
      '.jsms-sticky-image',
      '.studygpt-sticky-image',
      '.issuetracker-sticky-image',
      '.mediarift-sticky-image',
    ];

    imageSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(img => {
        img.addEventListener('click', () => {
          if (img.classList.contains('active')) {
            const wrapper = img.closest('.orbit-carousel-wrapper, .orbit-mobile-carousel-wrapper, .sentinel-carousel-wrapper, .jsms-carousel-wrapper, .studygpt-carousel-wrapper, .issuetracker-carousel-wrapper, .mediarift-carousel-wrapper');
            if (wrapper) {
              const allImages = Array.from(wrapper.querySelectorAll('img'));
              const index = allImages.indexOf(img);
              openLightbox(img.src, img.alt, allImages, index);
            } else {
              openLightbox(img.src, img.alt, [img], 0);
            }
          }
        });
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  function initAll() {
    initReveal();
    initVideoControls();
    initOrbitHeroToggle();
    initProjectImageCursor();
    initProjectLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
