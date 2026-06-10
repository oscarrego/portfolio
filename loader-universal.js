/**
 * OSCAR REGO PORTFOLIO 2026
 * LOADER-UNIVERSAL.JS — Session-Based Loading Screen
 *
 * Works on EVERY page. Shows the loading animation exactly ONCE per browser
 * tab session (using sessionStorage). Subsequent page navigations within the
 * same tab skip the loader entirely.
 *
 * Requirements:
 *   - Every HTML page must include <div id="loader">...</div> in <body>
 *   - Every HTML page must include loader.css
 *   - This script should be the FIRST script in <body>
 */

(function () {
    'use strict';

    const SESSION_KEY = 'portfolioLoaderShown';
    const LOADER_DURATION = 2200; // ms

    // Grab elements — guard in case loader HTML is missing on a page
    const loader = document.getElementById('loader');
    const percentEl = document.getElementById('loader-percent');
    const mobileNotice = document.getElementById('mobile-notice');

    if (!loader || !percentEl) {
        // No loader elements on this page — nothing to do
        return;
    }

    // ── Already shown this session? Skip immediately ──────────────────────────
    if (sessionStorage.getItem(SESSION_KEY)) {
        loader.style.display = 'none';
        return;
    }

    // ── First visit in this tab session — show the loader ─────────────────────
    sessionStorage.setItem(SESSION_KEY, '1');
    loader.style.display = 'flex';

    // Mobile notice (only on narrow screens)
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (mobileNotice && (isTouch || window.innerWidth <= 768)) {
        setTimeout(function () {
            mobileNotice.style.opacity = '1';
        }, 300);
        setTimeout(function () {
            mobileNotice.style.opacity = '0';
        }, 3300);
    }

    // ── Animated percentage counter ───────────────────────────────────────────
    const startTime = Date.now();

    function updateProgress() {
        const elapsed = Date.now() - startTime;
        const rawProgress = elapsed / LOADER_DURATION;

        // Ease-out curve so it feels weighted: fast → slow → snap to 100
        const eased = 1 - Math.pow(1 - Math.min(rawProgress, 1), 2);
        const displayValue = Math.floor(eased * 100);

        percentEl.textContent = displayValue + '%';

        if (rawProgress < 1) {
            requestAnimationFrame(updateProgress);
        } else {
            percentEl.textContent = '100%';

            // Fade out
            loader.classList.add('fade-out');
            setTimeout(function () {
                loader.style.display = 'none';
                loader.classList.remove('fade-out');
            }, 450);
        }
    }

    requestAnimationFrame(updateProgress);

})();
