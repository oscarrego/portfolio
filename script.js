/* ═══════════════════════════════════════════════════════════════════════════
   OSCAR REGO PORTFOLIO 2026 — SCRIPT.JS
   Custom cursor, kinetic scroll, video observers, timeline animations
═══════════════════════════════════════════════════════════════════════════ */

/* ── Global Audio System (Pre-rendered / Ccached) ───────────────────────── */
(() => {
    // Only initialize fallback if window.playTone is not already defined (e.g. sounds.js not loaded)
    if (window.playTone) return;

    const AC = window.AudioContext || window.webkitAudioContext;
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AC || !OAC) return;

    const ctx = new AC();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.288;
    masterGain.connect(ctx.destination);

    const buffers = {
        hover: null,
        menu: null
    };

    const renderToneBuffer = (type, sampleRate = 44100) => {
        const dur = type === 'menu' ? 0.18 : 0.105;
        const length = Math.ceil(sampleRate * (dur + 0.025));
        const offlineCtx = new OAC(1, length, sampleRate);

        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        const filt = offlineCtx.createBiquadFilter();

        const sf = type === 'menu' ? 280 : 520;
        const ef = type === 'menu' ? 760 : 840;

        osc.type = 'sine';
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(type === 'menu' ? 1600 : 2200, 0);

        osc.frequency.setValueAtTime(sf, 0);
        osc.frequency.exponentialRampToValueAtTime(ef, dur);

        gain.gain.setValueAtTime(0.0001, 0);
        gain.gain.exponentialRampToValueAtTime(type === 'menu' ? 0.16 : 0.09, 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, dur);

        osc.connect(filt);
        filt.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(0);
        osc.stop(dur + 0.025);

        return offlineCtx.startRendering();
    };

    const preloadSounds = () => {
        const sr = ctx.sampleRate || 44100;
        Promise.all([
            renderToneBuffer('hover', sr).then(buf => buffers.hover = buf),
            renderToneBuffer('menu', sr).then(buf => buffers.menu = buf)
        ]).catch(err => {
            console.error('Failed to pre-render UI sounds:', err);
        });
    };

    preloadSounds();

    const resumeContext = () => {
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
    };

    ['pointerdown', 'touchstart', 'click', 'wheel', 'pointermove', 'mouseenter'].forEach(evt => {
        window.addEventListener(evt, resumeContext, { once: true, capture: true, passive: true });
    });

    window.playTone = (type = 'hover') => {
        // Respect mute state if set
        const isMuted = window._soundsMuted || (localStorage.getItem('uiSoundEnabled') === 'false');
        if (isMuted) return;

        resumeContext();

        const buf = buffers[type];
        if (buf) {
            const source = ctx.createBufferSource();
            source.buffer = buf;
            source.connect(masterGain);
            source.start(0);
        } else {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filt = ctx.createBiquadFilter();
            const sf = type === 'menu' ? 280 : 520;
            const ef = type === 'menu' ? 760 : 840;
            const dur = type === 'menu' ? 0.18 : 0.105;

            osc.type = 'sine';
            filt.type = 'lowpass';
            filt.frequency.setValueAtTime(type === 'menu' ? 1600 : 2200, now);
            osc.frequency.setValueAtTime(sf, now);
            osc.frequency.exponentialRampToValueAtTime(ef, now + dur);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(type === 'menu' ? 0.16 : 0.09, now + 0.018);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

            osc.connect(filt);
            filt.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + dur + 0.025);
        }
    };
})();


/* ── Touch / pointer capability detection ───────────────────────────────── */
// Dual check: matchMedia for capability + maxTouchPoints for device flags
const isTouchDevice = (
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    (navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer: fine)').matches)
);

const mouseGlow = document.querySelector('.mouse-glow');

/* ── Performance Caching ────────────────────────────────────────────────── */
let winW = window.innerWidth;
let winH = window.innerHeight;
window.addEventListener('resize', () => {
    winW = window.innerWidth;
    winH = window.innerHeight;
}, { passive: true });

/* ── Theme System ───────────────────────────────────────────────────────── */
(function() {
    const root = document.documentElement;
    const body = document.body;
    
    // Load persisted theme
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
        root.classList.add('theme-light');
    }

    // Attach double-click listener to all orb logos
    const orbs = document.querySelectorAll('.works-logo-orb');
    orbs.forEach(orb => {
        orb.addEventListener('dblclick', (e) => {
            e.preventDefault();
            root.classList.toggle('theme-light');
            
            if (root.classList.contains('theme-light')) {
                localStorage.setItem('portfolio-theme', 'light');
            } else {
                localStorage.setItem('portfolio-theme', 'dark');
            }
        });

        let bubbleTimeout = null;
        let emotionIndex = 0;
        const emotions = ['squint', 'neutral', 'sad'];

        orb.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Play menu/interaction sound
            if (window.playTone) window.playTone('menu');

            // Trigger jelly bounce/squish animation on the orb itself
            orb.classList.remove('orb-bounce');
            void orb.offsetWidth; // Trigger reflow
            orb.classList.add('orb-bounce');

            // Remove any previous emotion class
            emotions.forEach(em => orb.classList.remove(`emotion-${em}`));

            // Get next emotion and apply it
            const currentEmotion = emotions[emotionIndex];
            orb.classList.add(`emotion-${currentEmotion}`);
            emotionIndex = (emotionIndex + 1) % emotions.length;

            // Find or create speech bubble next to the orb
            let bubble = orb.querySelector('.logo-speech-bubble');
            if (!bubble) {
                bubble = document.createElement('div');
                bubble.className = 'logo-speech-bubble';
                bubble.innerHTML = `
                    click!!
                    <svg class="bubble-sparkle" viewBox="0 0 24 24">
                        <path d="M12,3 L12,8 M12,16 L12,21 M4,12 L9,12 M15,12 L20,12 M6.3,6.3 L9.9,9.9 M14.1,14.1 L17.7,17.7 M17.7,6.3 L14.1,9.9 M9.9,14.1 L6.3,17.7" stroke="#1ad1a5" stroke-width="2.5" stroke-linecap="round" />
                    </svg>
                `;
                orb.appendChild(bubble);
            } else {
                // If bubble exists, reset the animation state
                bubble.classList.remove('bubble-pop-anim');
                void bubble.offsetWidth; // Trigger reflow
                bubble.classList.add('bubble-pop-anim');
                bubble.classList.remove('bubble-fade-out');
            }

            // Clear any active timeout
            if (bubbleTimeout) clearTimeout(bubbleTimeout);

            // Automatically animate and remove bubble after 2 seconds
            bubbleTimeout = setTimeout(() => {
                bubble.classList.add('bubble-fade-out');
                setTimeout(() => {
                    if (bubble.parentNode === orb) {
                        bubble.remove();
                    }
                    // Revert face back to normal when bubble is fully gone
                    emotions.forEach(em => orb.classList.remove(`emotion-${em}`));
                }, 350); // Match CSS fade-out animation length
            }, 2000);
        });
    });
})();

/* ── Custom Cursor (desktop fine-pointer ONLY) ──────────────────────────── */
/* CUSTOM CURSOR SYSTEM - DISABLED
if (!isTouchDevice && mouseGlow) {
    document.addEventListener('mousemove', (e) => {
        // Direct 1:1 mapping for precision — no amplification or laggy lerping
        mouseGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        mouseGlow.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        mouseGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        mouseGlow.style.opacity = '1';
    });

    const hoverItems = document.querySelectorAll(
        "a, button:not(.orbit-view-toggle), input, textarea, select, [role='button'], .project-title"
    );

    hoverItems.forEach((item) => {
        item.addEventListener('mouseenter', () => mouseGlow.classList.add('hovering'));
        item.addEventListener('mouseleave', () => mouseGlow.classList.remove('hovering'));
    });

    document.addEventListener('mouseover', (e) => {
        const footerLink = e.target.closest('.footer-right a, .footer-bottom h1');
        if (footerLink) mouseGlow.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
        const footerLink = e.target.closest('.footer-right a, .footer-bottom h1');
        if (footerLink) mouseGlow.classList.remove('hovering');
    });

} else if (mouseGlow) {
    // Touch device: remove cursor element entirely from DOM — no trace left
    mouseGlow.remove();
}
*/

/* ── TIMELINE GLOW TRACKER (desktop) ───────────────────────────────────── */
const timelineWrapper = document.querySelector('.timeline-wrapper');
const timelineGlow    = document.querySelector('.timeline-glow');
const timelineLine    = document.querySelector('.timeline-line');

if (timelineWrapper && timelineGlow && timelineLine && !isTouchDevice) {
    let currentProgress = 0;
    let targetProgress  = 0;
    let timelineVisible = false;
    let wrapperH = timelineWrapper.offsetHeight;
    let lineH = timelineLine.offsetHeight;
    let glowH = timelineGlow.offsetHeight;

    const tObserver = new IntersectionObserver((entries) => {
        timelineVisible = entries[0].isIntersecting;
    }, { threshold: 0.01 });
    tObserver.observe(timelineWrapper);

    window.addEventListener('resize', () => {
        wrapperH = timelineWrapper.offsetHeight;
        lineH = timelineLine.offsetHeight;
        glowH = timelineGlow.offsetHeight;
    }, { passive: true });

    const updateGlow = () => {
        if (!timelineVisible) {
            requestAnimationFrame(updateGlow);
            return;
        }
        currentProgress += (targetProgress - currentProgress) * 0.08;
        const movementRange = lineH - glowH;
        const newTop = currentProgress * movementRange;
        timelineGlow.style.transform = `translate3d(-50%, ${newTop}px, 0)`;
        requestAnimationFrame(updateGlow);
    };

    const onScroll = () => {
        if (!timelineVisible) return;
        const rect         = timelineWrapper.getBoundingClientRect();
        const startOffset  = winH * 0.5;
        const currentPos   = startOffset - rect.top;
        targetProgress = Math.max(0, Math.min(1, currentPos / wrapperH));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    updateGlow();
}

/* ── TIMELINE SCROLL-REVEAL (mobile IntersectionObserver) ──────────────── */
if (isTouchDevice) {
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (timelineItems.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target); // fire once
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -30px 0px',
        });

        timelineItems.forEach((item) => revealObserver.observe(item));
    }

    // Mobile timeline glow via scroll position
    if (timelineWrapper && timelineGlow && timelineLine) {
        const onMobileScroll = () => {
            const rect         = timelineWrapper.getBoundingClientRect();
            const wrapperHeight = timelineWrapper.offsetHeight;
            const currentPos   = (window.innerHeight * 0.5) - rect.top;
            const progress     = Math.max(0, Math.min(1, currentPos / wrapperHeight));
            const range        = timelineLine.offsetHeight - timelineGlow.offsetHeight;
            timelineGlow.style.transform = `translate(-50%, ${progress * range}px)`;
        };
        window.addEventListener('scroll', onMobileScroll, { passive: true });
        onMobileScroll();
    }
}

/* ── KINETIC INERTIAL SCROLLING (desktop mouse wheel only) ─────────────── */
// Skip entirely on touch devices — native scroll is superior on mobile
if (!isTouchDevice) {
    class KineticScroll {
        constructor() {
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

            if (isReload) {
                window.scrollTo(0, 0);
            }

            this.scrollY      = isReload ? 0 : window.scrollY;
            this.targetY      = isReload ? 0 : window.scrollY;
            this.velocity     = 0;
            this.friction     = 0.94;
            this.acceleration = 0.06;
            this.spring       = 0.04;
            this.lastScroll   = -1;
            this.init();
        }

        init() {
            window.addEventListener('wheel', (e) => {
                e.preventDefault();
                this.velocity += e.deltaY * this.acceleration;
            }, { passive: false });

            window.addEventListener('scroll', () => {
                if (Math.abs(this.velocity) < 0.1) {
                    this.scrollY = window.scrollY;
                    this.targetY = window.scrollY;
                }
            }, { passive: true });

            this.update();
        }

        update() {
            this.velocity *= this.friction;
            this.targetY  += this.velocity;
            
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - winH);
            this.targetY    = Math.max(0, Math.min(this.targetY, maxScroll));
            this.scrollY   += (this.targetY - this.scrollY) * this.spring;

            if (Math.abs(this.targetY - this.scrollY) > 0.05 || Math.abs(this.velocity) > 0.05) {
                const roundedScroll = Math.round(this.scrollY);
                if (this.lastScroll !== roundedScroll) {
                    window.scrollTo(0, roundedScroll);
                    this.lastScroll = roundedScroll;
                }
            } else {
                this.scrollY = window.scrollY;
                this.targetY = window.scrollY;
            }

            requestAnimationFrame(() => this.update());
        }
    }

    new KineticScroll();
}

/* ── Video IntersectionObserver (play/pause on scroll) ──────────────────── */
const videos = document.querySelectorAll('.project-video');
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && document.visibilityState === 'visible') {
            entry.target.play().catch(() => {});
        } else {
            entry.target.pause();
        }
    });
}, { threshold: 0.1 }); // lower threshold for earlier play

document.addEventListener('visibilitychange', () => {
    document.querySelectorAll('.project-video, .work-card video').forEach(video => {
        const rect = video.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < winH;
        if (document.visibilityState === 'visible' && inView) {
            // For work-card videos, the animation loop will handle playing/pausing
            if (!video.closest('.work-card')) {
                video.play().catch(() => {});
            }
        } else {
            video.pause();
        }
    });
});

videos.forEach(video => videoObserver.observe(video));

/* ── Protect project media from right-click & long-press save ───────────── */
document.querySelectorAll('.project-media-wrapper, .project-video').forEach(media => {
    media.addEventListener('contextmenu', (e) => e.preventDefault());
});

/* ── VIEW TOOLTIP (desktop only) ────────────────────────────────────────── */
if (!isTouchDevice) {
/* CUSTOM CURSOR SYSTEM - DISABLED
    const viewTooltip = document.createElement('div');
    viewTooltip.classList.add('view-tooltip');
    viewTooltip.innerText = 'VIEW';
    document.body.appendChild(viewTooltip);

    let tX = 0, tY = 0;
    document.addEventListener('mousemove', (e) => {
        tX = e.clientX;
        tY = e.clientY;
        viewTooltip.style.transform = `translate3d(${tX}px, ${tY}px, 0)`;
    }, { passive: true });

    document.querySelectorAll('.project-media-wrapper').forEach(wrapper => {
        wrapper.addEventListener('mouseenter', () => {
            if (mouseGlow) mouseGlow.classList.add('hovering');
            viewTooltip.classList.add('active');
        });
        wrapper.addEventListener('mouseleave', () => {
            if (mouseGlow) mouseGlow.classList.remove('hovering');
            viewTooltip.classList.remove('active');
        });
    });
*/
    /* ── ORBIT VIDEO TOGGLE (desktop with tooltip) ────────────────────── */
    const orbitToggleBtn = document.getElementById('orbit-view-toggle');
    const orbitVideo     = document.getElementById('orbit-video');
    const orbitVideoSrc  = document.getElementById('orbit-video-src');

    if (orbitToggleBtn && orbitVideo && orbitVideoSrc) {
        let isDesktopView = false;

/* CUSTOM CURSOR SYSTEM - DISABLED
        orbitToggleBtn.addEventListener('mouseenter', () => {
            viewTooltip.innerText = isDesktopView ? 'MOBILE MODE' : 'DESKTOP MODE';
        });
        orbitToggleBtn.addEventListener('mouseleave', () => {
            viewTooltip.innerText = 'VIEW';
        });
*/

        orbitToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isDesktopView = !isDesktopView;
            const span = orbitToggleBtn.querySelector('span');

            orbitVideo.style.transition = 'opacity 0.2s ease';
            orbitVideo.style.opacity    = '0.5';

            if (isDesktopView) {
                orbitToggleBtn.classList.add('desktop-view');
                if (span) span.innerHTML = '&lt;';
                orbitVideoSrc.src = 'videos/orbit_demo_pc.mp4';
                orbitToggleBtn.setAttribute('data-mobile-text', 'DESKTOP MODE');
                orbitVideo.classList.remove('orbit-video-mobile');
            } else {
                orbitToggleBtn.classList.remove('desktop-view');
                if (span) span.innerHTML = '&gt;';
                orbitVideoSrc.src = 'videos/orbit_demo.mp4';
                orbitToggleBtn.setAttribute('data-mobile-text', 'MOBILE MODE');
                orbitVideo.classList.add('orbit-video-mobile');
            }

            // CUSTOM CURSOR SYSTEM - DISABLED
            // viewTooltip.innerText = isDesktopView ? 'MOBILE MODE' : 'DESKTOP MODE';

            setTimeout(() => {
                orbitVideo.load();
                orbitVideo.play().catch(() => {});
                orbitVideo.style.opacity = '1';
            }, 150);
        });
    }
}

/* ── ORBIT VIDEO TOGGLE (touch, no tooltip) ─────────────────────────────── */
if (isTouchDevice) {
    const orbitToggleBtn = document.getElementById('orbit-view-toggle');
    const orbitVideo     = document.getElementById('orbit-video');
    const orbitVideoSrc  = document.getElementById('orbit-video-src');

    if (orbitToggleBtn && orbitVideo && orbitVideoSrc) {
        let isDesktopView = false;

        orbitToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isDesktopView = !isDesktopView;

            orbitVideo.style.transition = 'opacity 0.2s ease';
            orbitVideo.style.opacity    = '0.5';

            if (isDesktopView) {
                orbitToggleBtn.classList.add('desktop-view');
                orbitVideoSrc.src = 'videos/orbit_demo_pc.mp4';
                orbitToggleBtn.setAttribute('data-mobile-text', 'DESKTOP MODE');
                orbitVideo.classList.remove('orbit-video-mobile');
            } else {
                orbitToggleBtn.classList.remove('desktop-view');
                orbitVideoSrc.src = 'videos/orbit_demo.mp4';
                orbitToggleBtn.setAttribute('data-mobile-text', 'MOBILE MODE');
                orbitVideo.classList.add('orbit-video-mobile');
            }

            setTimeout(() => {
                orbitVideo.load();
                orbitVideo.play().catch(() => {});
                orbitVideo.style.opacity = '1';
            }, 150);
        });
    }
}

/* ── GLOBAL MENU SYSTEM ─────────────────────────────────────────────────── */
(() => {
    const menuContainer = document.getElementById('global-menu-container');
    if (!menuContainer) return;

    fetch('menu.html')
        .then(res => res.text())
        .then(html => {
            menuContainer.innerHTML = html;
            
            const menuButton = menuContainer.querySelector('.works-menu-button');
            const menuPanel = menuContainer.querySelector('.works-menu-panel');
            const menuScrim = menuContainer.querySelector('.works-menu-scrim');
            const menuXBtn = menuContainer.querySelector('.works-menu-x');

            // All links are interactive — bullet only shows on hover
            const links = menuContainer.querySelectorAll('.works-menu-links a');

            const setMenuOpen = (open) => {
                document.body.classList.toggle('menu-open', open);
                menuButton?.setAttribute('aria-expanded', String(open));
                menuPanel?.setAttribute('aria-hidden', String(!open));
            };

            menuButton?.addEventListener('click', e => {
                e.stopPropagation();
                const opening = !document.body.classList.contains('menu-open');
                setMenuOpen(opening);
                if (window.playTone) window.playTone('menu');
            });

            menuXBtn?.addEventListener('click', e => {
                e.stopPropagation();
                setMenuOpen(false);
                if (window.playTone) window.playTone('menu');
            });

            menuScrim?.addEventListener('click', () => { 
                setMenuOpen(false); 
                if (window.playTone) window.playTone('menu'); 
            });
            
            document.addEventListener('keydown', e => { 
                if (e.key === 'Escape') setMenuOpen(false); 
            });
            
            document.addEventListener('click', e => {
                if (!document.body.classList.contains('menu-open')) return;
                if (!menuPanel || !menuButton) return;
                const isOutside = !menuPanel.contains(e.target) && !menuButton.contains(e.target);
                if (isOutside) {
                    setMenuOpen(false);
                    if (window.playTone) window.playTone('menu');
                }
            });

            links.forEach(a => {
                a.addEventListener('click', () => setMenuOpen(false));
            });
        });
})();

/* Rotating drum: cards travel around the Y axis on the XZ plane             */
/* Cards wrap around the circumference — front, right, back, left, front     */
(() => {
    const works = document.getElementById('works');
    if (!works) return;

    const stage = works.querySelector('.works-stage');
    const label = works.querySelector('.works-hover-label');
    const labelImage = label?.querySelector('img');
    const labelTitle = label?.querySelector('strong');
    const labelKicker = label?.querySelector('span');
    const modeButtons = [...works.querySelectorAll('.works-mode-btn')];
    const list = works.querySelector('.works-list');
    const listLinks = [...works.querySelectorAll('.works-list a')];
    const listPreview = works.querySelector('.works-list-preview');
    const listPreviewImage = listPreview?.querySelector('img');
    const baseCards = [...works.querySelectorAll('.work-card')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lerp   = (a, b, t) => a + (b - a) * t;
    const clamp  = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
    const PI2    = Math.PI * 2;

    /* Lerp angles through shortest path to prevent multi-spin on mode switch */
    const lerpAngle = (a, b, t) => {
        let d = b - a;
        if (d >  180) d -= 360;
        if (d < -180) d += 360;
        return a + d * t;
    };

    /* ── Cylinder parameters ────────────────────────────────────────── */
    const CARD_W    = 360;
    const CARD_H    = 248;
    const RADIUS    = 500;                           // cylinder radius (px) — large drum
    const AUTO_SPIN = reduceMotion ? 0 : 0.0007;    // radians/frame — noticeable drift
    const SCROLL_K  = 0.002;                        // heavily reduced sensitivity for premium feel
    const FRICTION  = 0.88;
    /* Cards visible in front arc: cosA > FRONT_ARC means interactable */
    const FRONT_ARC = 0.50;                         // cos(60°)≈50% of cylinder arc

    /* ── Pad cards to fill the orbit ──────────────────────────────────── */
    const TOTAL = 8;   // 4 projects × 2 clones — evenly fills circle
    while (stage.children.length < TOTAL) {
        baseCards.forEach(card => {
            if (stage.children.length < TOTAL) {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                stage.appendChild(clone);
            }
        });
    }
    const cards = [...stage.querySelectorAll('.work-card')];
    const N = cards.length;

    /* Fixed card dimensions */
    cards.forEach(card => {
        card.style.setProperty('--card-w', `${CARD_W}px`);
        card.style.setProperty('--card-h', `${CARD_H}px`);
        card.style.width        = `${CARD_W}px`;
        card.style.height       = `${CARD_H}px`;
        card.style.borderRadius = '24px';
    });

    /* ── Animation state ───────────────────────────────────────────────── */
    const spi = {
        rotation: 0,      // accumulated orbit rotation — NEVER resets
        velocity: 0,      // inertia from scroll
        mode:    'spiral',
        hovered: null,
        isVisible:    false,
        width:        works.clientWidth || winW
    };

    const worksObserver = new IntersectionObserver((entries) => {
        spi.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.01 });
    worksObserver.observe(works);

    window.addEventListener('resize', () => {
        spi.width = works.clientWidth || winW;
    }, { passive: true });

    /* Per-card lerped 3D state */
    const cState = cards.map((card, i) => ({
        card,
        angleBase: (i / N) * PI2,  // fixed seat around the orbit ring
        cx: 0, cy: 0, cz: 0,       // lerped world position
        cRX: 0,                     // lerped pitch (rotateX)
        cRY: 0,                     // lerped yaw   (rotateY)
        cScale: 1,
        lastTransform: '',
        lastOpacity: -1,
        lastBackness: -1,
        lastBrightness: -1
    }));

    // Audio is handled globally at the top of the file

    /* ── Mode toggle ───────────────────────────────────────────────────── */
    const setMode = (mode) => {
        spi.mode = mode;
        works.classList.toggle('list-mode', mode === 'list');
        list?.setAttribute('aria-hidden', String(mode !== 'list'));
        modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    };
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => { setMode(btn.dataset.mode); playTone('menu'); });
    });

    /* ── Hover label ───────────────────────────────────────────────────── */
    const showLabel = card => {
        if (!label || !labelImage || !labelTitle || !labelKicker) return;
        labelImage.src          = card.dataset.image  || '';
        labelTitle.textContent  = card.dataset.title  || '';
        labelKicker.textContent = card.dataset.kicker || '';
        label.classList.add('active');
    };
    const hideLabel = () => label?.classList.remove('active');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            spi.hovered = card;
            card.classList.add('is-hovered');
            works.classList.add('card-hovered');
            showLabel(card);
            playTone('hover');
        });
        card.addEventListener('mouseleave', () => {
            spi.hovered = null;
            card.classList.remove('is-hovered');
            works.classList.remove('card-hovered');
            hideLabel();
        });
        card.addEventListener('focus',       () => showLabel(card));
        card.addEventListener('blur',        hideLabel);
        card.addEventListener('contextmenu', e => e.preventDefault());
    });

    listLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            if (!listPreview || !listPreviewImage) return;
            listPreviewImage.src = link.dataset.image || '';
            listPreview.classList.add('active');
            showLabel(link);
            playTone('hover');
        });
        link.addEventListener('mousemove', e => {
            if (!listPreview) return;
            const rect = works.getBoundingClientRect();
            const y = clamp(e.clientY - rect.top, works.clientHeight * 0.24, works.clientHeight * 0.78);
            listPreview.style.top = `${y}px`;
        });
        link.addEventListener('mouseleave', () => { listPreview?.classList.remove('active'); hideLabel(); });
        link.addEventListener('focus', () => {
            if (listPreview && listPreviewImage) {
                listPreviewImage.src = link.dataset.image || '';
                listPreview.classList.add('active');
            }
        });
        link.addEventListener('blur', () => listPreview?.classList.remove('active'));
    });
    /* Clamp wheel velocity tightly so fast scrollers don't cause wild spinning */
    window.addEventListener('wheel', e => {
        if (!spi.isVisible) return;
        spi.velocity += e.deltaY * SCROLL_K;
        spi.velocity  = clamp(spi.velocity, -0.05, 0.05);
    }, { passive: true });

    /* ── HORIZONTAL CYLINDER (ROTATING DRUM) ──────────────────────────────────
     *
     * Cards are glued to the outside of a cylinder whose cross-section is a
     * circle in the XZ plane. The cylinder rotates around the Y axis.
     *
     *   x = RADIUS * sin(θ)   → horizontal (left / right)
     *   z = RADIUS * cos(θ)   → depth (+front / −back)
     *   y = 0                 → all cards vertically centered
     *
     * As θ increases (positive rotation / scroll-down):
     *   θ=0    → CENTER FRONT  (x=0,  z=+R)  facing camera, largest
     *   θ=π/2  → RIGHT SIDE    (x=+R, z=0)   card at right edge
     *   θ=π    → CENTER BACK   (x=0,  z=−R)  glass backface
     *   θ=3π/2 → LEFT SIDE     (x=−R, z=0)   card at left edge
     *
     * Card self-rotation: rotateY(−θ) makes each card face outward from
     * the cylinder surface. Think rotating drum, NOT vertical conveyor belt.
     * With 8 cards at 45° spacing, ~3 cards are visible on the front face.
     */
    const orbitCard = (cs) => {
        const angle = cs.angleBase + spi.rotation;
        const cosA  = Math.cos(angle);
        const sinA  = Math.sin(angle);

        // Position on cylinder surface (XZ circle, y=0)
        const x =  RADIUS * sinA;   // horizontal: positive=right
        const z =  RADIUS * cosA;   // depth: +R=front, −R=back
        const y =  0;               // vertically centered

        // Card faces outward — normalise to [−180, +180] to prevent multi-spin
        const rawRotY = -angle * 180 / Math.PI;
        const rotY    = ((rawRotY % 360) + 540) % 360 - 180;

        // Depth-based visual properties (cosA: +1=front, −1=back)
        const scale      = 0.68 + 0.32 * ((cosA + 1) / 2);  // 0.68 back → 1.00 front
        const backness   = clamp((1 - cosA) / 2, 0, 1);      // 0.00 front → 1.00 back
        const brightness = 0.44 + 0.56 * ((cosA + 1) / 2);   // 0.44 back  → 1.00 front

        return { x, y, z, rotX: 0, rotY, scale, backness, brightness };
    };

    /* List-mode offscreen stash */
    const listCard = (index, width) => ({
        x:          width * 0.75 + index * 22,
        y:          0,
        z:          -900,
        rotX:       0,
        rotY:       0,
        scale:      0.72,
        backness:   0,
        brightness: 1
    });

    /* ── Main animation loop ───────────────────────────────────────────── */
    const animate = () => {
        if (!spi.isVisible) {
            // Pause all work-card videos when works section is not visible
            cards.forEach(card => {
                const v = card.querySelector('video');
                if (v && !v.paused) v.pause();
            });
            requestAnimationFrame(animate);
            return;
        }

        const rect    = works.getBoundingClientRect();
        
        document.body.classList.toggle(
            'works-in-view',
            rect.top < winH * 0.34 && rect.bottom > winH * 0.2
        );

        if (spi.mode === 'spiral') {
            spi.rotation += spi.velocity + AUTO_SPIN;  // rotation accumulates — never resets
            spi.velocity *= FRICTION;
        }

        /* ── Identify Front-Facing Card for Smart Video Playback ────────── */
        let activeCard = null;
        let maxCosA = -2;
        if (spi.mode === 'spiral') {
            cState.forEach(cs => {
                const angle = cs.angleBase + spi.rotation;
                const cosA = Math.cos(angle);
                if (cosA > maxCosA) {
                    maxCosA = cosA;
                    activeCard = cs.card;
                }
            });
        }

        cState.forEach((cs, i) => {
            const target = spi.mode === 'list' ? listCard(i, spi.width) : orbitCard(cs);

            /* Lerp position + dual-axis rotation for heavy, smooth inertia */
            cs.cx    = lerp(cs.cx,     target.x,       0.03);
            cs.cy    = lerp(cs.cy,     target.y,       0.03);
            cs.cz    = lerp(cs.cz,     target.z,       0.03);
            cs.cRX   = lerpAngle(cs.cRX, target.rotX, 0.03);
            cs.cRY   = lerpAngle(cs.cRY, target.rotY, 0.03);
            cs.cScale= lerp(cs.cScale,  target.scale,  0.04);

            /* Focused hover scale: zoom in slightly, no darkening */
            const hoverScale = cs.card === spi.hovered ? 1.08 : 1;
            const finalScale = cs.cScale * hoverScale;

            /* CSS custom properties drive image fade + glass back + brightness */
            const bness = target.backness.toFixed(3);
            if (cs.lastBackness !== bness) {
                cs.card.style.setProperty('--backness', bness);
                cs.lastBackness = bness;
            }
            
            const bright = target.brightness.toFixed(3);
            if (cs.lastBrightness !== bright) {
                cs.card.style.setProperty('--brightness', bright);
                cs.lastBrightness = bright;
            }

            /* Clone visibility in list mode */
            const isClone = i >= baseCards.length;
            const opacity = (spi.mode === 'list' && isClone) ? 0 : 1;
            if (cs.lastOpacity !== opacity) {
                cs.card.style.opacity = String(opacity);
                cs.lastOpacity = opacity;
            }

            /* Interactivity gate: front arc (cosA > FRONT_ARC) is interactive
             * This allows multiple visible front cards to be hovered/clicked. */
            const angle  = cs.angleBase + spi.rotation;
            const cosA   = Math.cos(angle);
            const isFront = (spi.mode === 'spiral') && (cosA > FRONT_ARC) && (opacity > 0);
            if (spi.mode === 'list') {
                cs.card.style.pointerEvents = isClone ? 'none' : 'auto';
                cs.card.style.cursor        = isClone ? 'default' : 'pointer';
            } else {
                cs.card.style.pointerEvents = isFront ? 'auto' : 'none';
                cs.card.style.cursor        = isFront ? 'pointer' : 'default';
            }

            /* ── Smart Video Playback ───────────────────────────────────── */
            const video = cs.card.querySelector('video');
            if (video) {
                const shouldPlay = (cs.card === activeCard) && (spi.mode === 'spiral') && (opacity > 0);
                if (shouldPlay) {
                    if (video.paused) video.play().catch(() => {});
                } else {
                    if (!video.paused) video.pause();
                }
            }

            /* Z-index — front cards paint on top */
            cs.card.style.zIndex = String(Math.round(500 + cs.cz / 2));

            /* 3D transform: translate → yaw (rotY) → pitch (rotX) → scale */
            const tx = Math.round(cs.cx - CARD_W / 2);
            const ty = Math.round(cs.cy - CARD_H / 2);
            const transform = `translate3d(${tx}px, ${ty}px, ${cs.cz}px) rotateY(${cs.cRY}deg) rotateX(${cs.cRX}deg) scale(${finalScale})`;
            if (cs.lastTransform !== transform) {
                cs.card.style.transform = transform;
                cs.lastTransform = transform;
            }
        });

        requestAnimationFrame(animate);
    };

    setMode('spiral');
    requestAnimationFrame(animate);
})();

/* ── SHARED PILL NAVIGATION (FOR ALL SUBPAGES) ─────────────────────────── */
(() => {
    const initPillNav = () => {
        const pillNav = document.getElementById('pill-nav');
        const scrim = document.getElementById('menu-scrim');
        const trigger = document.getElementById('pill-nav-trigger');
        const links = document.querySelectorAll('.menu-link');
        const dotsContainer = trigger?.querySelector('.menu-dots-container');
        const closeIcon = trigger?.querySelector('.menu-close-icon');

        if (!pillNav || !scrim) return;

        // Initialize Lenis on subpages if Lenis library is loaded and not yet initialized
        if (window.Lenis && !window._lenis) {
            const lenis = new Lenis({
                duration: 1.3,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            window._lenis = lenis;
        }

        function openMenu() {
            pillNav.classList.add('open');
            scrim.classList.add('open');
            scrim.setAttribute('aria-hidden', 'false');

            if (window._lenis) {
                window._lenis.stop();
            }
        }

        function closeMenu() {
            pillNav.classList.remove('open');
            scrim.classList.remove('open');
            scrim.setAttribute('aria-hidden', 'true');

            if (window._lenis) {
                window._lenis.start();
            }
        }

        function toggleMenu() {
            if (pillNav.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        if (trigger) {
            trigger.addEventListener('click', (e) => {
                toggleMenu();
            });
        }

        scrim.addEventListener('click', (e) => {
            closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && pillNav.classList.contains('open')) {
                closeMenu();
            }
        });

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        closeMenu();

                        // Let the menu transition finish before scrolling for a smoother feel
                        setTimeout(() => {
                            if (window._lenis) {
                                window._lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
                            } else {
                                target.scrollIntoView({ behavior: 'smooth' });
                            }
                        }, 450);
                    }
                } else {
                    closeMenu();
                }
            });
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPillNav);
    } else {
        initPillNav();
    }
})();
