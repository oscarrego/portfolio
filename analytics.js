/**
 * OSCAR REGO PORTFOLIO 2026
 * ANALYTICS.JS — GA4 Event Tracking Infrastructure
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  MEASUREMENT ID — REPLACE THIS WHEN YOU HAVE YOUR GA4 PROPERTY         │
 * │                                                                         │
 * │  1. Go to: https://analytics.google.com                                 │
 * │  2. Create a new Property → Web platform                                │
 * │  3. Enter your portfolio URL (e.g. https://oscarrego.github.io)         │
 * │  4. Copy the Measurement ID (format: G-XXXXXXXXXX)                      │
 * │  5. Replace "G-XXXXXXXXXX" in index.html (and all other HTML files)     │
 * │     in the gtag('config', ...) call inside the GA4 script block         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Tracked Events:
 *   - page_view            (automatic via GA4 config)
 *   - resume_download      — Resume PDF clicks
 *   - social_click         — GitHub / LinkedIn / Email link clicks
 *   - project_card_click   — Clicking a project on the home page
 *   - project_page_view    — Landing on orbit / sentinel / jsms pages
 *   - nav_click            — Floating nav link clicks
 *   - external_link_click  — Any outbound link
 *
 * Device type (mobile vs desktop) is captured automatically by GA4.
 */

(function () {
    'use strict';

    // ─── Utility: safe gtag wrapper ───────────────────────────────────────────
    function trackEvent(eventName, params) {
        if (typeof gtag !== 'function') return;
        gtag('event', eventName, params || {});
    }

    // ─── Utility: detect page identity ───────────────────────────────────────
    function getPageName() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('orbit'))    return 'orbit';
        if (path.includes('sentinel')) return 'sentinel';
        if (path.includes('jsms'))     return 'jsms';
        if (path.includes('about'))    return 'about';
        if (path.includes('tools'))    return 'tools';
        return 'home';
    }

    // ─── 1. Project Page View (case studies) ─────────────────────────────────
    // GA4 fires page_view automatically, but we also fire a custom event so
    // you can filter case-study visits in Explore reports.
    const pageName = getPageName();
    const caseStudyPages = ['orbit', 'sentinel', 'jsms'];
    if (caseStudyPages.includes(pageName)) {
        trackEvent('project_page_view', {
            project_name: pageName,
            page_location: window.location.href,
        });
    }

    // ─── 2. Navigation Clicks ─────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {

        // Floating nav links
        const navLinks = document.querySelectorAll('.floating-nav a');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                trackEvent('nav_click', {
                    nav_destination: link.textContent.trim(),
                    nav_href: link.getAttribute('href'),
                    source_page: pageName,
                });
            });
        });

        // ─── 3. Project Card Clicks (Home page) ──────────────────────────────
        // project-media-wrapper and project-title both navigate to case studies
        const projectMappings = [
            { selector: '#orbit .project-media-wrapper, #orbit .project-title',    project: 'orbit' },
            { selector: '#autoshooter .project-media-wrapper, #autoshooter .project-title', project: 'sentinel' },
            { selector: '#jsms .project-media-wrapper, #jsms .project-title',      project: 'jsms' },
        ];

        projectMappings.forEach(function (mapping) {
            const elements = document.querySelectorAll(mapping.selector);
            elements.forEach(function (el) {
                el.addEventListener('click', function () {
                    trackEvent('project_card_click', {
                        project_name: mapping.project,
                        source_page: pageName,
                    });
                });
            });
        });

        // ─── 4. Resume Download ───────────────────────────────────────────────
        // Catches the resume link wherever it appears (footer, nav, etc.)
        document.addEventListener('click', function (e) {
            const target = e.target.closest('a');
            if (!target) return;
            const href = target.getAttribute('href') || '';

            if (href.toLowerCase().includes('resume') || href.toLowerCase().includes('.pdf')) {
                trackEvent('resume_download', {
                    file_name: href.split('/').pop(),
                    source_page: pageName,
                });
            }

            // ─── 5. Social Profile Clicks ─────────────────────────────────────
            if (href.includes('github.com')) {
                trackEvent('social_click', {
                    platform: 'github',
                    source_page: pageName,
                });
            }

            if (href.includes('linkedin.com')) {
                trackEvent('social_click', {
                    platform: 'linkedin',
                    source_page: pageName,
                });
            }

            if (href.includes('mailto:')) {
                trackEvent('social_click', {
                    platform: 'email',
                    email_address: href.replace('mailto:', ''),
                    source_page: pageName,
                });
            }

            // ─── 6. External Link Clicks (catch-all) ──────────────────────────
            const isExternal = target.hostname && target.hostname !== window.location.hostname;
            const isAlreadyTracked = href.includes('github.com') ||
                                     href.includes('linkedin.com') ||
                                     href.includes('mailto:') ||
                                     href.toLowerCase().includes('resume') ||
                                     href.toLowerCase().includes('.pdf');

            if (isExternal && !isAlreadyTracked) {
                trackEvent('external_link_click', {
                    link_url: href,
                    link_domain: target.hostname,
                    source_page: pageName,
                });
            }
        });

    }); // end DOMContentLoaded

})();
