/* 
 * OSCAR REGO PORTFOLIO 2026
 * TRANSITION-ANIMATION.JS — Coordinate-based Circular transition wipe
 */

(function () {
    'use strict';

    const TRANSITION_DURATION = 1100; // ms (must match CSS transition speed)
    let overlay, titleEl;

    // Helper to extract project name from URL to display on transition curtain
    function getProjectName(urlStr) {
        try {
            const url = new URL(urlStr, window.location.origin);
            const path = url.pathname.toLowerCase();
            if (path.includes('orbit')) return 'Orbit';
            if (path.includes('sentinel')) return 'Sentinel';
            if (path.includes('jsms')) return 'JSMS';
            if (path.includes('studygpt')) return 'StudyGPT';
            if (path.includes('issuetracker')) return 'Issue Tracker';
            if (path.includes('mediarift')) return 'MediaRift';
            if (path.includes('about-intro')) return 'About';
            if (path.includes('tools')) return 'Tools';
            return 'Oscar';
        } catch (e) {
            return 'Oscar';
        }
    }

    // Helper to determine destination background color (Cream for case studies, Dark for main pages)
    function getTargetBgColor(urlStr) {
        try {
            const url = new URL(urlStr, window.location.origin);
            const path = url.pathname.toLowerCase();
            if (path.includes('orbit.html') || 
                path.includes('sentinel.html') || 
                path.includes('jsms.html') || 
                path.includes('studygpt.html') || 
                path.includes('issuetracker.html') || 
                path.includes('mediarift.html')) {
                return '#F5F2EC'; // Light Cream background for case studies
            }
            return '#050505'; // Dark background for home, tools, about, etc.
        } catch (e) {
            return '#050505';
        }
    }

    function getThemeClass(bgColor) {
        return bgColor === '#F5F2EC' ? 'theme-light' : 'theme-dark';
    }

    // Helper to verify if link is internal
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

    // Create the overlay DOM elements dynamically on load
    function initOverlay() {
        if (document.getElementById('transition-overlay')) return;

        overlay = document.createElement('div');
        overlay.id = 'transition-overlay';
        overlay.className = 'transition-overlay';
        
        titleEl = document.createElement('div');
        titleEl.className = 'transition-title';
        overlay.appendChild(titleEl);
        
        document.body.appendChild(overlay);

        // Run transition in immediately after creation
        transitionIn();
    }

    // Handles transitioning OUT (to a new page)
    function transitionTo(targetHref, clickX, clickY) {
        // Fallback to center of screen if coordinates are missing
        const x = clickX !== undefined ? clickX : window.innerWidth / 2;
        const y = clickY !== undefined ? clickY : window.innerHeight / 2;

        const bgColor = getTargetBgColor(targetHref);
        const theme = getThemeClass(bgColor);
        const name = getProjectName(targetHref);

        // Store stashed values for the target page transition-in
        sessionStorage.setItem('transition-click-x', x);
        sessionStorage.setItem('transition-click-y', y);
        sessionStorage.setItem('transition-bg-color', bgColor);
        sessionStorage.setItem('transition-theme', theme);
        sessionStorage.setItem('transition-name', name);
        sessionStorage.setItem('transition-active', 'true');

        // Close menu if open (on home page or case study pages)
        document.body.classList.remove('menu-open');
        const pillNav = document.getElementById('pill-nav');
        if (pillNav) pillNav.classList.remove('open');
        const menuScrim = document.getElementById('menu-scrim');
        if (menuScrim) menuScrim.classList.remove('open');

        // Apply stashed style settings to overlay
        overlay.style.backgroundColor = bgColor;
        overlay.className = `transition-overlay ${theme}`;
        titleEl.textContent = name.toUpperCase();

        overlay.style.setProperty('--click-x', `${x}px`);
        overlay.style.setProperty('--click-y', `${y}px`);
        overlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;

        // Force browser layout repaint
        overlay.offsetHeight;

        // Animate overlay expand
        overlay.classList.add('active');

        // Play navigation sound if available
        if (typeof window.playTone === 'function') {
            window.playTone('nav-confirm');
        }

        setTimeout(() => {
            window.location.href = targetHref;
        }, TRANSITION_DURATION);
    }

    // Handles transitioning IN (revealing page content on load)
    function transitionIn() {
        const isActive = sessionStorage.getItem('transition-active');
        if (!isActive) {
            overlay.style.display = 'none';
            return;
        }

        // Consume and clean up transition state
        sessionStorage.removeItem('transition-active');

        const x = sessionStorage.getItem('transition-click-x') || window.innerWidth / 2;
        const y = sessionStorage.getItem('transition-click-y') || window.innerHeight / 2;
        const bgColor = sessionStorage.getItem('transition-bg-color') || '#050505';
        const theme = sessionStorage.getItem('transition-theme') || 'theme-dark';
        const name = sessionStorage.getItem('transition-name') || 'Oscar';

        // Apply visual properties
        overlay.style.backgroundColor = bgColor;
        overlay.className = `transition-overlay ${theme} active`;
        titleEl.textContent = name.toUpperCase();
        overlay.style.setProperty('--click-x', `${x}px`);
        overlay.style.setProperty('--click-y', `${y}px`);
        overlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;

        document.body.classList.add('page-transitioning');

        // Force browser layout repaint
        overlay.offsetHeight;

        // Collapse the circular mask back to the click point, revealing target page
        setTimeout(() => {
            overlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
            overlay.classList.remove('active');

            setTimeout(() => {
                overlay.style.display = 'none';
                document.body.classList.remove('page-transitioning');
            }, TRANSITION_DURATION);
        }, 120);
    }

    // Initialize DOMContentLoaded overlay setup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOverlay);
    } else {
        initOverlay();
    }

    // Intercept standard internal links clicks
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a');
        if (!anchor) return;
        if (!isInternalLink(anchor)) return;

        // Skip links that point to hash on the same page
        try {
            const url = new URL(anchor.href);
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            const targetPath = url.pathname.split('/').pop() || 'index.html';
            if (currentPath === targetPath && url.hash) return;
            
            // Don't re-navigate to the same page
            if (currentPath === targetPath && !url.hash) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            transitionTo(anchor.href, e.clientX, e.clientY);
        } catch (err) {
            // Fallback to normal click behavior if URL parsing fails
        }
    }, { capture: true }); // Use capture phase to intercept before other scripts

    // Expose APIs globally
    window.TransitionAnimation = {
        transitionTo: transitionTo
    };
})();
