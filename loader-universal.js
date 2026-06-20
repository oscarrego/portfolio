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

    // Detect if this page load is a reload/refresh
    const isReload = (function () {
        try {
            const navs = window.performance && window.performance.getEntriesByType && window.performance.getEntriesByType('navigation');
            if (navs && navs.length > 0) {
                return navs[0].type === 'reload';
            }
            return window.performance && window.performance.navigation && window.performance.navigation.type === 1;
        } catch (e) {
            return false;
        }
    })();
    window._isReload = isReload;

    // Check if the user returned from a project detail page card click
    const fromProjectCard = sessionStorage.getItem('fromProjectCard');
    let targetHash = window.location.hash;

    if (fromProjectCard === 'true' && !isReload) {
        targetHash = '#work';
        sessionStorage.removeItem('fromProjectCard');
    }

    // Force browser to always start at the top on reload/load (except when hash/redirecting link navigation is present)
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    if (isReload) {
        window.scrollTo(0, 0);
    } else if (!targetHash) {
        window.scrollTo(0, 0);
    }

    window.addEventListener('load', () => {
        if (targetHash && !isReload) {
            const el = document.querySelector(targetHash);
            if (el) {
                if (window._lenis) {
                    window._lenis.scrollTo(el, { immediate: true });
                } else {
                    el.scrollIntoView();
                }
            }
        } else {
            window.scrollTo(0, 0);
        }
    });

    const SESSION_KEY = 'portfolioLoaderShown';
    const LOADER_DURATION = 4000; // ms

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
        window._loaderFinished = true;
        return;
    }

    // ── First visit in this tab session — show the loader ─────────────────────
    sessionStorage.setItem(SESSION_KEY, '1');
    document.documentElement.classList.add('loading-active');
    loader.style.display = 'flex';

    // Setup suitcase lock wheels
    percentEl.innerHTML = `
      <div class="lock-wheel"><div class="lock-strip" id="wheel-hundreds"><span>0</span><span>1</span></div></div>
      <div class="lock-wheel"><div class="lock-strip" id="wheel-tens"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div></div>
      <div class="lock-wheel"><div class="lock-strip" id="wheel-ones"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div></div>
      <span class="lock-percent">%</span>
    `;
    const hundredsStrip = document.getElementById('wheel-hundreds');
    const tensStrip = document.getElementById('wheel-tens');
    const onesStrip = document.getElementById('wheel-ones');

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

        const hundreds = Math.floor(displayValue / 100);
        const tens = Math.floor((displayValue % 100) / 10);
        const ones = displayValue % 10;

        if (hundredsStrip) hundredsStrip.style.transform = `translateY(${-hundreds * 50}%)`;
        if (tensStrip) tensStrip.style.transform = `translateY(${-tens * 10}%)`;
        if (onesStrip) onesStrip.style.transform = `translateY(${-ones * 10}%)`;

        if (rawProgress < 1) {
            requestAnimationFrame(updateProgress);
        } else {
            if (hundredsStrip) hundredsStrip.style.transform = "translateY(-50%)";
            if (tensStrip) tensStrip.style.transform = "translateY(0%)";
            if (onesStrip) onesStrip.style.transform = "translateY(0%)";

            // Fade out
            loader.classList.add('fade-out');
            setTimeout(function () {
                loader.style.display = 'none';
                loader.classList.remove('fade-out');
                document.documentElement.classList.remove('loading-active');
                if (window._lenis) {
                    window._lenis.start();
                }
                window._loaderFinished = true;
                window.dispatchEvent(new CustomEvent('loaderFinished'));
                if (isReload) {
                    window.scrollTo(0, 0);
                }
            }, 1200);
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

    // Intercept all email clicks to show a helpful toast feedback,
    // but do NOT prevent default behavior so the mail client opens natively
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (href && href.startsWith('mailto:')) {
            showToast("Opening your default mail client...");
        }
    });


    // Observe footer background name for viewport-triggered reveal transition
    // Observe home-footer for viewport-triggered reveal transition
    const initFooterObserver = () => {
        const homeFooter = document.querySelector('.home-footer');
        if (homeFooter) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        homeFooter.classList.add('in-view');
                        const footerName = homeFooter.querySelector('.footer-name');
                        if (footerName) {
                            footerName.classList.add('in-view');
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                threshold: 0.05
            });
            observer.observe(homeFooter);
            return true; // successfully observed
        }
        return false;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!initFooterObserver()) {
                const domObserver = new MutationObserver((mutations, observerInstance) => {
                    if (initFooterObserver()) {
                        observerInstance.disconnect();
                    }
                });
                domObserver.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        });
    } else {
        if (!initFooterObserver()) {
            const domObserver = new MutationObserver((mutations, observerInstance) => {
                if (initFooterObserver()) {
                    observerInstance.disconnect();
                }
            });
            domObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
})();


