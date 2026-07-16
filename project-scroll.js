/*
  OSCAR REGO PORTFOLIO 2026
  PROJECT-SCROLL.JS — Scroll-driven full-page section engine

  Works by:
  1. Building a tall scroll driver div with N * 150vh height
  2. A sticky frame sits on top, showing the current section
  3. On scroll, we calculate which section is active
  4. When section changes: curtain wipes (top->down or bottom->up)
     then new image and text content swap in
  5. All existing carousel nav + lightbox click handlers are preserved
*/

(function () {
  'use strict';

  const PAGE_CONFIGS = {
    orbit: {
      detailsClass: 'orbit-details',
      rowClass: 'orbit-detail-row',
      contentClass: 'orbit-content-block',
      cardClass: 'orbit-sticky-card',
      imgClass: 'orbit-sticky-image',
      mobileCardClass: 'orbit-mobile-sticky-card',
      mobileImgClass: 'orbit-mobile-sticky-image',
      mobileWrapperClass: 'orbit-mobile-carousel-wrapper',
      wrapperClass: 'orbit-carousel-wrapper',
    },
    sentinel: {
      detailsClass: 'sentinel-details',
      rowClass: 'sentinel-detail-row',
      contentClass: 'sentinel-content-block',
      cardClass: 'sentinel-sticky-card',
      imgClass: 'sentinel-sticky-image',
      wrapperClass: 'sentinel-carousel-wrapper',
    },
    jsms: {
      detailsClass: 'jsms-details',
      rowClass: 'jsms-detail-row',
      contentClass: 'jsms-content-block',
      cardClass: 'jsms-sticky-card',
      imgClass: 'jsms-sticky-image',
      wrapperClass: 'jsms-carousel-wrapper',
    },
    mediarift: {
      detailsClass: 'mediarift-details',
      rowClass: 'mediarift-detail-row',
      contentClass: 'mediarift-content-block',
      cardClass: 'mediarift-sticky-card',
      imgClass: 'mediarift-sticky-image',
      wrapperClass: 'mediarift-carousel-wrapper',
    },
    issuetracker: {
      detailsClass: 'issuetracker-details',
      rowClass: 'issuetracker-detail-row',
      contentClass: 'issuetracker-content-block',
      cardClass: 'issuetracker-sticky-card',
      imgClass: 'issuetracker-sticky-image',
      wrapperClass: 'issuetracker-carousel-wrapper',
    },
    studygpt: {
      detailsClass: 'studygpt-details',
      rowClass: 'studygpt-detail-row',
      contentClass: 'studygpt-content-block',
      cardClass: 'studygpt-sticky-card',
      imgClass: 'studygpt-sticky-image',
      wrapperClass: 'studygpt-carousel-wrapper',
    },
  };

  function detectProject() {
    const path = window.location.pathname.toLowerCase();
    for (const key of Object.keys(PAGE_CONFIGS)) {
      if (path.includes(key)) return { key, cfg: PAGE_CONFIGS[key] };
    }
    return null;
  }

  // Extract section data from existing rows
  function extractSections(rows, cfg) {
    return Array.from(rows).map((row) => {
      const contentBlock = row.querySelector('.' + cfg.contentClass);
      const counter = contentBlock ? contentBlock.querySelector('.section-counter') : null;
      const h2 = contentBlock ? contentBlock.querySelector('h2') : null;
      const p = contentBlock ? contentBlock.querySelector('p') : null;

      // Handle both regular card and mobile card
      const cardEl = row.querySelector('.' + cfg.cardClass) ||
        (cfg.mobileCardClass ? row.querySelector('.' + cfg.mobileCardClass) : null);
      const isMobile = !!(cfg.mobileCardClass && row.querySelector('.' + cfg.mobileCardClass));

      const wrapperClass = isMobile ? cfg.mobileWrapperClass : cfg.wrapperClass;
      const wrapper = cardEl
        ? cardEl.querySelector('.' + wrapperClass) || cardEl.querySelector('.' + cfg.wrapperClass)
        : null;
      const imgs = wrapper ? Array.from(wrapper.querySelectorAll('img')) : [];
      const hasAutoplay = !!(wrapper && wrapper.classList.contains('autoplay-carousel'));

      return {
        counterText: counter ? counter.textContent : '',
        h2Text: h2 ? h2.innerHTML : '',
        pText: p ? p.innerHTML : '',
        imgs: imgs.map(img => ({ src: img.src, alt: img.alt })),
        hasCarousel: imgs.length > 1,
        hasAutoplay,
        isMobile,
      };
    });
  }

  function buildScrollSystem(sections, detailsEl, cfg) {
    const sectionCount = sections.length;

    // ── Scroll outer wrapper ──────────────────────────────────
    const scrollOuter = document.createElement('div');
    scrollOuter.className = 'pd-scroll-outer';

    // Scroll driver (tall div to provide scroll space)
    // Each section gets 150vh so transitions feel unhurried
    const scrollDriver = document.createElement('div');
    scrollDriver.className = 'pd-scroll-driver';
    scrollDriver.style.height = (sectionCount * 150) + 'vh';
    scrollOuter.appendChild(scrollDriver);

    // Sticky frame — lives *inside* scrollDriver so it sticks within it
    const stickyFrame = document.createElement('div');
    stickyFrame.className = 'pd-sticky-frame';
    scrollDriver.appendChild(stickyFrame);

    // Panel grid
    const panel = document.createElement('div');
    panel.className = 'pd-panel';
    stickyFrame.appendChild(panel);

    // ── Left: content area ────────────────────────────────────
    const contentArea = document.createElement('div');
    contentArea.className = 'pd-panel-content';
    panel.appendChild(contentArea);

    // Build text slots for each section
    const textSlots = sections.map((sec, i) => {
      const slot = document.createElement('div');
      slot.className = 'pd-text-slot' + (i === 0 ? ' pd-active' : '');
      slot.innerHTML = [
        sec.counterText ? '<span class="section-counter">' + sec.counterText + '</span>' : '',
        sec.h2Text      ? '<h2>' + sec.h2Text + '</h2>'                                  : '',
        sec.pText       ? '<p>'  + sec.pText  + '</p>'                                   : '',
      ].join('');
      contentArea.appendChild(slot);
      return slot;
    });

    // After first paint: measure tallest slot and reserve that height
    requestAnimationFrame(() => {
      let maxH = 0;
      textSlots.forEach(slot => {
        const savedPos = slot.style.position;
        slot.style.position = 'relative';
        const h = slot.offsetHeight;
        slot.style.position = savedPos || '';
        if (h > maxH) maxH = h;
      });
      contentArea.style.minHeight = maxH + 'px';
      // All slots back to absolute; first slot kept relative while visible
      textSlots.forEach((slot, i) => {
        slot.style.position = i === 0 ? 'relative' : 'absolute';
      });
    });

    // ── Right: image card ─────────────────────────────────────
    const isMobilePage = sections.some(s => s.isMobile);
    const card = document.createElement('div');
    card.className = 'pd-panel-card' + (isMobilePage ? ' mobile-card' : '');
    panel.appendChild(card);

    // One img element per section (shows first image of that section)
    const imgEls = [];
    sections.forEach((sec, i) => {
      if (!sec.imgs.length) return;
      const img = document.createElement('img');
      img.className = 'pd-img-slot' + (i === 0 ? ' pd-img-active' : '');
      img.src = sec.imgs[0].src;
      img.alt = sec.imgs[0].alt;
      card.appendChild(img);
      imgEls.push({ el: img, section: i });
    });

    // Curtain element
    const curtain = document.createElement('div');
    curtain.className = 'pd-curtain';
    card.appendChild(curtain);

    // Per-section carousel state (which image index is showing)
    const carouselState = sections.map(s => ({ index: 0, imgs: s.imgs }));
    let currentSection = 0;
    let isTransitioning = false;

    // ── Within-section carousel nav buttons ───────────────────
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-nav prev';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.innerHTML = '<span>&lt;</span>';
    prevBtn.style.display = sections[0].hasCarousel ? '' : 'none';
    card.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-nav next';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.innerHTML = '<span>&gt;</span>';
    nextBtn.style.display = sections[0].hasCarousel ? '' : 'none';
    card.appendChild(nextBtn);

    function updateCarouselImage(sectionIdx, imgIdx) {
      const state = carouselState[sectionIdx];
      if (!state.imgs.length) return;
      const clampedIdx = ((imgIdx % state.imgs.length) + state.imgs.length) % state.imgs.length;
      state.index = clampedIdx;
      const entry = imgEls.find(x => x.section === sectionIdx);
      if (entry) {
        entry.el.src = state.imgs[clampedIdx].src;
        entry.el.alt = state.imgs[clampedIdx].alt;
      }
    }

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.playTone === 'function') window.playTone('media-click');
      updateCarouselImage(currentSection, carouselState[currentSection].index - 1);
    });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.playTone === 'function') window.playTone('media-click');
      updateCarouselImage(currentSection, carouselState[currentSection].index + 1);
    });

    // ── Progress dots ─────────────────────────────────────────
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'pd-progress-dots';
    sections.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'pd-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to section ' + (i + 1));
      dot.addEventListener('click', () => jumpToSection(i));
      dotsContainer.appendChild(dot);
    });
    document.body.appendChild(dotsContainer);

    function jumpToSection(targetIdx) {
      const driverRect = scrollDriver.getBoundingClientRect();
      const driverTop = window.scrollY + driverRect.top;
      const sectionH = scrollDriver.offsetHeight / sectionCount;
      const targetScroll = driverTop + targetIdx * sectionH + 10;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    // ── Section transition ────────────────────────────────────
    function transitionToSection(newIdx, direction) {
      if (isTransitioning || newIdx === currentSection) return;
      isTransitioning = true;

      const oldIdx = currentSection;
      const dir = direction; // 'down' | 'up'

      // Exit old text slot
      textSlots[oldIdx].classList.add(dir === 'down' ? 'pd-exiting-up' : 'pd-exiting-down');
      textSlots[oldIdx].classList.remove('pd-active');

      // Curtain phase 1: enter (cover image)
      curtain.className = 'pd-curtain dir-' + dir + ' curtain-entering';

      setTimeout(() => {
        // Swap active image
        imgEls.forEach(x => x.el.classList.remove('pd-img-active'));
        const newEntry = imgEls.find(x => x.section === newIdx);
        if (newEntry) newEntry.el.classList.add('pd-img-active');

        // Sync carousel image to saved state
        updateCarouselImage(newIdx, carouselState[newIdx].index);

        // Toggle nav buttons
        prevBtn.style.display = sections[newIdx].hasCarousel ? '' : 'none';
        nextBtn.style.display = sections[newIdx].hasCarousel ? '' : 'none';

        // Clean up old slot positioning
        textSlots[oldIdx].classList.remove('pd-exiting-up', 'pd-exiting-down');
        textSlots[oldIdx].style.position = 'absolute';

        // Enter new text slot
        textSlots[newIdx].style.position = 'absolute';
        textSlots[newIdx].classList.remove('pd-exiting-up', 'pd-exiting-down');
        requestAnimationFrame(() => {
          textSlots[newIdx].classList.add('pd-active');
        });

        // Curtain phase 2: exit (reveal new image)
        curtain.className = 'pd-curtain dir-' + dir + ' curtain-exiting';

        currentSection = newIdx;

        // Sync progress dots
        dotsContainer.querySelectorAll('.pd-dot').forEach((d, i) => {
          d.classList.toggle('active', i === newIdx);
        });

        // Autoplay for multi-image sections
        stopAutoplay();
        startAutoplay(newIdx);

        // Cleanup curtain class after animation finishes
        setTimeout(() => {
          curtain.className = 'pd-curtain';
          isTransitioning = false;
        }, 500);
      }, 450); // matches curtainEnter duration
    }

    // ── Autoplay ──────────────────────────────────────────────
    let autoPlayTimer = null;

    function startAutoplay(idx) {
      stopAutoplay();
      if (!sections[idx].hasAutoplay || sections[idx].imgs.length <= 1) return;
      autoPlayTimer = setInterval(() => {
        updateCarouselImage(idx, carouselState[idx].index + 1);
      }, 3000);
    }

    function stopAutoplay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    // ── Scroll handler ────────────────────────────────────────
    let lastScrollY = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    function update() {
      ticking = false;
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      lastScrollY = scrollY;

      const driverRect = scrollDriver.getBoundingClientRect();
      const driverTop = window.scrollY + driverRect.top;
      const driverHeight = scrollDriver.offsetHeight;
      const sectionH = driverHeight / sectionCount;

      const scrollIntoDriver = Math.max(0, scrollY - driverTop);
      const rawIdx = Math.floor(scrollIntoDriver / sectionH);
      const targetIdx = Math.max(0, Math.min(rawIdx, sectionCount - 1));

      if (targetIdx !== currentSection && !isTransitioning) {
        transitionToSection(targetIdx, direction);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Lightbox support ──────────────────────────────────────
    card.addEventListener('click', (e) => {
      if (e.target.closest('.carousel-nav')) return;
      const sec = sections[currentSection];
      if (!sec.imgs.length) return;
      const activeEntry = imgEls.find(x => x.section === currentSection);
      if (!activeEntry) return;

      // Use existing lightbox if present in the page
      const lightbox = document.querySelector('.pd-lightbox');
      if (lightbox) {
        const lbImg = lightbox.querySelector('.pd-lightbox-img');
        if (lbImg) lbImg.src = activeEntry.el.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    // ── Footer dot fade ───────────────────────────────────────
    const footer = document.querySelector('#footer, footer');
    if (footer) {
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          dotsContainer.style.opacity = entry.isIntersecting ? '0' : '1';
        });
      }, { threshold: 0.1 });
      footerObserver.observe(footer);
    }

    // Cleanup dots on navigation
    window.addEventListener('beforeunload', () => {
      if (dotsContainer.parentNode) dotsContainer.parentNode.removeChild(dotsContainer);
    });

    // Kick off autoplay for section 0 if applicable
    startAutoplay(0);

    return scrollOuter;
  }

  function init() {
    const project = detectProject();
    if (!project) return;

    const { cfg } = project;

    // Find the details wrapper
    const detailsEl = document.querySelector('.' + cfg.detailsClass);
    if (!detailsEl) return;

    // Find all section rows
    const rows = detailsEl.querySelectorAll('.' + cfg.rowClass);
    if (!rows.length) return;

    // Extract content from existing rows
    const sections = extractSections(rows, cfg);

    // Build the new scroll system
    const scrollOuter = buildScrollSystem(sections, detailsEl, cfg);

    // Insert scroll system before the details element, then hide original
    detailsEl.parentNode.insertBefore(scrollOuter, detailsEl);
    detailsEl.style.display = 'none';

    // Mark old content-blocks and cards as already-revealed so
    // project-detail.js intersection observers don't fight us
    document.querySelectorAll(
      '[class*="-content-block"], [class*="-sticky-card"], [class*="-mobile-sticky-card"]'
    ).forEach(el => el.classList.add('pd-revealed'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
