/**
 * OSCAR REGO PORTFOLIO 2026
 * PAGE-TRANSITION.JS — Smooth Fade Transitions Between Pages
 *
 * Intercepts internal link clicks, fades out the current page,
 * then navigates. On load, page fades in naturally via CSS.
 */

(function () {
    'use strict';

    const TRANSITION_MS = 380;

    // Skip if browser supports native View Transitions
    // (future-proof, but not relied on)

    function isInternalLink(anchor) {
        if (!anchor || !anchor.href) return false;
        if (anchor.target === '_blank') return false;
        if (anchor.href.startsWith('mailto:')) return false;
        if (anchor.href.startsWith('tel:')) return false;
        if (anchor.href.startsWith('javascript:')) return false;
        if (anchor.hasAttribute('download')) return false;

        try {
            const url = new URL(anchor.href);
            return url.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    // Don't re-navigate to the same page
    function isSamePage(href) {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        const target = new URL(href).pathname.split('/').pop() || 'index.html';
        return current === target;
    }

    document.addEventListener('click', function (e) {
        // Find the closest anchor element
        const anchor = e.target.closest('a');
        if (!anchor) return;
        if (!isInternalLink(anchor)) return;
        if (isSamePage(anchor.href)) return;

        e.preventDefault();

        const targetHref = anchor.href;

        // Close menu if open
        document.body.classList.remove('menu-open');

        // Start fade-out
        document.body.classList.add('page-leaving');

        setTimeout(function () {
            window.location.href = targetHref;
        }, TRANSITION_MS);
    });
})();
