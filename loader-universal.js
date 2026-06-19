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

(function () {
    // Inject Toast Styles
    const style = document.createElement('style');
    style.textContent = `
        .custom-email-toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #111111;
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 12px;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.08);
            z-index: 10000;
            opacity: 0;
            transform: translateY(12px) scale(0.95);
            transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .custom-email-toast.show {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        .custom-email-toast.error {
            border-color: rgba(255, 75, 75, 0.3);
            background: #1a0f0f;
        }
    `;
    document.head.appendChild(style);

    let toastTimeout = null;
    let toastEl = null;

    function showToast(message, isError = false) {
        if (toastEl) {
            toastEl.remove();
            toastEl = null;
        }
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }

        toastEl = document.createElement('div');
        toastEl.className = 'custom-email-toast';
        if (isError) {
            toastEl.classList.add('error');
        }
        toastEl.textContent = message;
        document.body.appendChild(toastEl);

        // Trigger transition
        requestAnimationFrame(() => {
            if (toastEl) toastEl.classList.add('show');
        });

        toastTimeout = setTimeout(() => {
            if (toastEl) {
                toastEl.classList.remove('show');
                setTimeout(() => {
                    if (toastEl) {
                        toastEl.remove();
                        toastEl = null;
                    }
                }, 350);
            }
        }, 2500);
    }

    // Intercept all email clicks
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (href && href.startsWith('mailto:')) {
            e.preventDefault();
            
            showToast("Redirecting to your mail client...");

            setTimeout(() => {
                try {
                    // Try to trigger the mail client opening
                    window.location.href = href;
                } catch (err) {
                    showToast("Unable to open mail application.", true);
                }
            }, 300);
        }
    });
})();
