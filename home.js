/**
 * Oscar Rego Portfolio 2026 — home.js
 * Editorial page scroll effects, navigation highlighting, and reveal animations.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. SMOOTH ANCHOR LINK SCROLLING
    const navLinks = document.querySelectorAll('.floating-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Smooth scroll to the section
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL hash without jumping
                    history.pushState(null, null, targetId);
                }
            }
        });
    });

    // 1.5 OVERRIDE DYNAMIC MENU PANEL LINKS FOR SINGLE PAGE SCROLLING
    const checkMenuLoaded = setInterval(() => {
        const menuLinks = document.querySelectorAll('.works-menu-links a');
        const brandLink = document.querySelector('.navbar-brand');
        if (menuLinks.length > 0) {
            clearInterval(checkMenuLoaded);
            
            // Brand link scroll-to-top handler
            if (brandLink) {
                brandLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' });
                    history.pushState(null, null, '#hero');
                });
            }

            menuLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === 'index.html') {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        document.querySelector('#featured-projects')?.scrollIntoView({ behavior: 'smooth' });
                    });
                } else if (href === 'about.html') {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' });
                    });
                } else if (href === 'about-intro.html') {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                    });
                }
            });
        }
    }, 100);


    // 2. SCROLLSPY (Navigation active state sync)
    const sections = document.querySelectorAll('section[id]');
    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        root: null,
        rootMargin: '-40% 0px -50% 0px', // Trigger when section occupies center of viewport
        threshold: 0
    });

    if (navLinks.length > 0) {
        sections.forEach(section => spyObserver.observe(section));
    }

    // 3. EDITORIAL SCROLL REVEAL ANIMATIONS
    const revealTargets = document.querySelectorAll(
        '.editorial-heading, .editorial-paragraph, .about-details, .timeline-item-editorial, .contact-container'
    );
    
    // Add CSS reveal styling dynamically
    const style = document.createElement('style');
    style.textContent = `
        .reveal-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform, opacity;
        }
        .reveal-element.element-visible {
            opacity: 1;
            transform: translateY(0);
        }
        .timeline-item-editorial.reveal-element {
            transition-delay: 0.1s;
        }
    `;
    document.head.appendChild(style);

    revealTargets.forEach(el => {
        el.classList.add('reveal-element');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('element-visible');
                revealObserver.unobserve(entry.target); // Trigger once
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    });

    revealTargets.forEach(target => revealObserver.observe(target));

    // 4. HERO ENTRANCE COMPOSITION REVEAL
    const heroTitleLines = document.querySelectorAll('.hero-title');
    const heroPortrait = document.querySelector('.hero-portrait-container');
    const heroFooterElements = document.querySelectorAll('.hero-footer-grid > *');

    // Initial state setup for hero
    if (heroTitleLines.length > 0) {
        heroTitleLines.forEach(line => {
            line.style.opacity = '0';
            line.style.transform = 'translateY(50px)';
            line.style.transition = 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    }

    if (heroPortrait) {
        heroPortrait.style.opacity = '0';
        heroPortrait.style.transform = 'translate(-50%, 30px)';
        heroPortrait.style.transition = 'opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1), transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    if (heroFooterElements.length > 0) {
        heroFooterElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(15px)';
            el.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    }

    // Trigger hero entrance after loader fades out
    const triggerHeroEntrance = () => {
        setTimeout(() => {
            heroTitleLines.forEach((line, i) => {
                setTimeout(() => {
                    line.style.opacity = '1';
                    line.style.transform = 'translateY(0)';
                }, i * 200);
            });

            setTimeout(() => {
                if (heroPortrait) {
                    heroPortrait.style.opacity = '1';
                    heroPortrait.style.transform = 'translate(-50%, 0)';
                }
            }, 600);

            setTimeout(() => {
                heroFooterElements.forEach((el, i) => {
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, i * 150);
                });
            }, 900);
        }, 300);
    };

    // Listen for loader removal
    const loader = document.getElementById('loader');
    if (loader) {
        const checkLoader = setInterval(() => {
            if (loader.classList.contains('fade-out') || getComputedStyle(loader).display === 'none') {
                clearInterval(checkLoader);
                triggerHeroEntrance();
            }
        }, 100);
    } else {
        triggerHeroEntrance();
    }
});

/* ═══════════════════════════════════════════════════════════════════════════
   NARRATIVE REVEAL — Scroll-locked word-color animation controller
   Uses CSS sticky + scroll progress to drive per-word color interpolation
═══════════════════════════════════════════════════════════════════════════ */
(() => {
    'use strict';

    // ── Config ───────────────────────────────────────────────────────────────
    // How many "viewport heights" of scroll travel to give the animation.
    // Higher = slower reveal per scroll unit.
    const SCROLL_MULTIPLIER = 2.5;

    // How far ahead (0–1 fraction of total words) the leading edge extends.
    // Creates a soft gradient rather than a hard cutoff.
    const LEAD_FRACTION = 0.06;

    // ── State ────────────────────────────────────────────────────────────────
    let words        = [];
    let section      = null;
    let stickyPanel  = null;
    let scrollHint   = null;
    let hintHidden   = false;
    let raf          = null;
    let lastProgress = -1;

    // ── Init — runs after DOM is ready ───────────────────────────────────────
    const init = () => {
        section     = document.getElementById('narrative-reveal');
        stickyPanel = section?.querySelector('.narrative-sticky-panel');
        scrollHint  = document.getElementById('narrative-scroll-hint');

        if (!section || !stickyPanel) return;

        // Collect all word spans
        words = Array.from(section.querySelectorAll('.nw'));
        if (!words.length) return;

        // Size the outer section so sticky has room to travel
        const vh  = window.innerHeight;
        const travelVH = SCROLL_MULTIPLIER;
        section.style.height = `${(1 + travelVH) * 100}vh`;

        // Start listening
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        // Kick initial paint
        scheduleUpdate();
    };

    // ── Resize handler — recalculate section height ──────────────────────────
    const onResize = () => {
        if (!section) return;
        const travelVH = SCROLL_MULTIPLIER;
        section.style.height = `${(1 + travelVH) * 100}vh`;
        scheduleUpdate();
    };

    // ── Scroll handler ───────────────────────────────────────────────────────
    const onScroll = () => {
        scheduleUpdate();

        // Hide scroll hint on first scroll into the section
        if (!hintHidden && scrollHint) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 0) {
                scrollHint.classList.add('hint-hidden');
                hintHidden = true;
            }
        }
    };

    // ── rAF batching ─────────────────────────────────────────────────────────
    const scheduleUpdate = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = null;
            updateWords();
        });
    };

    // ── Core animation: map scroll → word color ───────────────────────────────
    const updateWords = () => {
        if (!section || !words.length) return;

        const sectionTop    = section.getBoundingClientRect().top + window.scrollY;
        const scrollY       = window.scrollY;
        const vh            = window.innerHeight;

        // Travel = total scrollable distance WITHIN the section (minus 1 vh for viewport)
        const travelPx = section.offsetHeight - vh;

        // Raw progress 0 → 1 through the locked zone
        const raw = Math.max(0, Math.min(1, (scrollY - sectionTop) / travelPx));

        // Apply soft easing so the first and last words feel gentle
        const eased = easeInOutSine(raw);

        if (Math.abs(eased - lastProgress) < 0.0005) return;
        lastProgress = eased;

        const total = words.length;

        words.forEach((word, i) => {
            // Normalised word position (0 = first word, 1 = last word)
            const wordPos = i / (total - 1);

            // Distance of the "highlight front" from this word's position
            const dist = eased - wordPos;

            if (dist >= LEAD_FRACTION) {
                // Fully lit
                if (!word.classList.contains('nw-lit')) {
                    word.classList.add('nw-lit');
                    word.classList.remove('nw-active');
                }
            } else if (dist > -LEAD_FRACTION) {
                // In the transition zone
                word.classList.remove('nw-lit');
                word.classList.add('nw-active');

                // Fine-grained inline colour interpolation for silky smoothness
                const t = (dist + LEAD_FRACTION) / (LEAD_FRACTION * 2); // 0 → 1
                word.style.color = lerpHex('#D8D8D8', '#111111', Math.max(0, Math.min(1, t)));
            } else {
                // Unlit
                if (word.classList.contains('nw-lit') || word.classList.contains('nw-active')) {
                    word.classList.remove('nw-lit', 'nw-active');
                    word.style.color = '';
                }
            }
        });
    };

    // ── Easing ────────────────────────────────────────────────────────────────
    const easeInOutSine = (t) =>
        -(Math.cos(Math.PI * t) - 1) / 2;

    // ── Hex colour interpolation ──────────────────────────────────────────────
    const hexToRgb = (hex) => {
        const n = parseInt(hex.replace('#', ''), 16);
        return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
    };
    const lerpHex = (from, to, t) => {
        const [r1, g1, b1] = hexToRgb(from);
        const [r2, g2, b2] = hexToRgb(to);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return `rgb(${r},${g},${b})`;
    };

    // ── Bootstrap ─────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Small defer to let other scripts (loader etc.) settle first
        setTimeout(init, 120);
    }
})();

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURED PROJECTS — Scroll reveal with staggered delay
   IntersectionObserver triggers .fp-visible on each .fp-reveal card
═══════════════════════════════════════════════════════════════════════════ */
(() => {
    'use strict';

    const initFPReveal = () => {
        const cards = document.querySelectorAll('.fp-reveal');
        if (!cards.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const card  = entry.target;
                const delay = parseInt(card.dataset.delay || '0', 10);

                setTimeout(() => {
                    card.classList.add('fp-visible');
                }, delay);

                observer.unobserve(card);
            });
        }, {
            root: null,
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.08
        });

        cards.forEach(card => observer.observe(card));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFPReveal);
    } else {
        setTimeout(initFPReveal, 50);
    }
})();

/* ═══════════════════════════════════════════════════════════════════════════
   ORBIT CARD — Mobile / Desktop preview toggle
   Cross-fades between orbit-vid-mobile and orbit-vid-desktop on button click
═══════════════════════════════════════════════════════════════════════════ */
(() => {
    'use strict';

    const initOrbitToggle = () => {
        const toggleBtns  = document.querySelectorAll('.orbit-toggle-btn');
        const vidMobile   = document.getElementById('orbit-vid-mobile');
        const vidDesktop  = document.getElementById('orbit-vid-desktop');

        if (!toggleBtns.length || !vidMobile || !vidDesktop) return;

        // Make sure both are playing from the start (muted autoplay)
        [vidMobile, vidDesktop].forEach(v => {
            v.muted = true;
            v.play().catch(() => {});
        });

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // don't trigger card link navigate

                const target = btn.dataset.target; // 'mobile' | 'desktop'

                // Update button states
                toggleBtns.forEach(b => {
                    const isActive = b.dataset.target === target;
                    b.classList.toggle('orbit-toggle-btn--active', isActive);
                    b.setAttribute('aria-pressed', String(isActive));
                });

                // Cross-fade videos
                if (target === 'mobile') {
                    vidMobile.classList.add('orbit-vid--active');
                    vidDesktop.classList.remove('orbit-vid--active');
                } else {
                    vidDesktop.classList.add('orbit-vid--active');
                    vidMobile.classList.remove('orbit-vid--active');
                }
            });
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOrbitToggle);
    } else {
        setTimeout(initOrbitToggle, 80);
    }
})();

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL NAV MENU — Toggles and smooth scrolling for floating top nav
═══════════════════════════════════════════════════════════════════════════ */
(() => {
    'use strict';

    const initGlobalMenu = () => {
        const menuBtn = document.getElementById('works-menu-btn');
        const closeBtn = document.getElementById('works-menu-close');
        const scrim = document.getElementById('works-menu-scrim');
        const menuPanel = document.getElementById('works-menu-panel');
        const menuLinks = document.querySelectorAll('.works-menu-links a');

        if (!menuBtn || !menuPanel) return;

        const openMenu = () => {
            document.body.classList.add('menu-open');
            menuBtn.setAttribute('aria-expanded', 'true');
            menuPanel.setAttribute('aria-hidden', 'false');
            if (scrim) scrim.setAttribute('aria-hidden', 'false');
        };

        const closeMenu = () => {
            document.body.classList.remove('menu-open');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuPanel.setAttribute('aria-hidden', 'true');
            if (scrim) scrim.setAttribute('aria-hidden', 'true');
        };

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (document.body.classList.contains('menu-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        }

        if (scrim) {
            scrim.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        }

        // Close menu on pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
                closeMenu();
            }
        });

        // Smooth scroll for menu panel links
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    closeMenu();

                    // Delay scroll slightly to let menu close animation start
                    setTimeout(() => {
                        const targetSection = document.querySelector(targetId);
                        if (targetSection) {
                            targetSection.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                            history.pushState(null, null, targetId);
                        }
                    }, 350); // Matches menu close transition timing
                }
            });
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalMenu);
    } else {
        setTimeout(initGlobalMenu, 100);
    }
})();

