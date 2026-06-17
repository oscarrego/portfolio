/* ═══════════════════════════════════════════════════════════════════════════
   OSCAR REGO PORTFOLIO 2026 — SCRIPT.JS
   Custom cursor, kinetic scroll, video observers, timeline animations
═══════════════════════════════════════════════════════════════════════════ */

/* ── Touch / pointer capability detection ───────────────────────────────── */
// Dual check: matchMedia for capability + maxTouchPoints for device flags
const isTouchDevice = (
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    (navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer: fine)').matches)
);

const mouseGlow = document.querySelector('.mouse-glow');

/* ── Custom Cursor (desktop fine-pointer ONLY) ──────────────────────────── */
if (!isTouchDevice && mouseGlow) {

    document.addEventListener('mousemove', (e) => {
        mouseGlow.style.opacity = '1';
        mouseGlow.style.left = e.clientX + 'px';
        mouseGlow.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseleave', () => {
        mouseGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        mouseGlow.style.opacity = '1';
    });

    /* ── HOVER ENLARGEMENT — standard interactive elements ─────────────── */
    const hoverItems = document.querySelectorAll(
        "a, button:not(.orbit-view-toggle), input, textarea, select, [role='button'], .project-title"
    );

    hoverItems.forEach((item) => {
        item.addEventListener('mouseenter', () => mouseGlow.classList.add('hovering'));
        item.addEventListener('mouseleave', () => mouseGlow.classList.remove('hovering'));
    });

    /* ── HOVER ENLARGEMENT — footer links (Issue 8) ─────────────────────
     * Footer is injected via fetch() so we can't querySelector at load time.
     * Use event delegation on document to catch mouseenter/leave on
     * .footer-right a and footer-bottom h1 regardless of when they appear.
    ─────────────────────────────────────────────────────────────────── */
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

/* ── TIMELINE GLOW TRACKER (desktop) ───────────────────────────────────── */
const timelineWrapper = document.querySelector('.timeline-wrapper');
const timelineGlow    = document.querySelector('.timeline-glow');
const timelineLine    = document.querySelector('.timeline-line');

if (timelineWrapper && timelineGlow && timelineLine && !isTouchDevice) {
    let currentProgress = 0;
    let targetProgress  = 0;

    const updateGlow = () => {
        currentProgress += (targetProgress - currentProgress) * 0.08;
        const movementRange = timelineLine.offsetHeight - timelineGlow.offsetHeight;
        const newTop = currentProgress * movementRange;
        timelineGlow.style.transform = `translate(-50%, ${newTop}px)`;
        requestAnimationFrame(updateGlow);
    };

    const onScroll = () => {
        const rect         = timelineWrapper.getBoundingClientRect();
        const wrapperHeight = timelineWrapper.offsetHeight;
        const startOffset  = window.innerHeight * 0.5;
        const currentPos   = startOffset - rect.top;
        targetProgress = Math.max(0, Math.min(1, currentPos / wrapperHeight));
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
            this.scrollY      = window.scrollY;
            this.targetY      = window.scrollY;
            this.velocity     = 0;
            this.friction     = 0.94;
            this.acceleration = 0.06;
            this.spring       = 0.04;
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
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            this.targetY    = Math.max(0, Math.min(this.targetY, maxScroll));
            this.scrollY   += (this.targetY - this.scrollY) * this.spring;

            if (Math.abs(this.targetY - this.scrollY) > 0.05 || Math.abs(this.velocity) > 0.05) {
                window.scrollTo(0, this.scrollY);
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
        if (entry.isIntersecting) {
            entry.target.play();
        } else {
            entry.target.pause();
        }
    });
}, { threshold: 0.6 });

videos.forEach(video => videoObserver.observe(video));

/* ── Protect project media from right-click & long-press save ───────────── */
document.querySelectorAll('.project-media-wrapper, .project-video').forEach(media => {
    media.addEventListener('contextmenu', (e) => e.preventDefault());
});

/* ── VIEW TOOLTIP (desktop only) ────────────────────────────────────────── */
if (!isTouchDevice) {
    const viewTooltip = document.createElement('div');
    viewTooltip.classList.add('view-tooltip');
    viewTooltip.innerText = 'VIEW';
    document.body.appendChild(viewTooltip);

    document.addEventListener('mousemove', (e) => {
        viewTooltip.style.left = e.clientX + 'px';
        viewTooltip.style.top  = e.clientY + 'px';
    });

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

    /* ── ORBIT VIDEO TOGGLE (desktop with tooltip) ────────────────────── */
    const orbitToggleBtn = document.getElementById('orbit-view-toggle');
    const orbitVideo     = document.getElementById('orbit-video');
    const orbitVideoSrc  = document.getElementById('orbit-video-src');

    if (orbitToggleBtn && orbitVideo && orbitVideoSrc) {
        let isDesktopView = false;

        orbitToggleBtn.addEventListener('mouseenter', () => {
            viewTooltip.innerText = isDesktopView ? 'MOBILE MODE' : 'DESKTOP MODE';
        });
        orbitToggleBtn.addEventListener('mouseleave', () => {
            viewTooltip.innerText = 'VIEW';
        });

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

            viewTooltip.innerText = isDesktopView ? 'MOBILE MODE' : 'DESKTOP MODE';

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

/* ═══ HORIZONTAL CYLINDER CAROUSEL ═══════════════════════════════════════ */
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
    const menuButton = works.querySelector('.works-menu-button');
    const menuPanel = works.querySelector('.works-menu-panel');
    const menuScrim = works.querySelector('.works-menu-scrim');
    const menuXBtn = works.querySelector('.works-menu-x');
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
    const CARD_W    = 320;
    const CARD_H    = 220;
    const RADIUS    = 450;                           // cylinder radius (px) — large drum
    const AUTO_SPIN = reduceMotion ? 0 : 0.0007;    // radians/frame — noticeable drift
    const SCROLL_K  = 0.010;                        // much higher wheel sensitivity
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
        audioReady:   false,
        audioContext: null,
        masterGain:   null
    };

    /* Per-card lerped 3D state */
    const cState = cards.map((card, i) => ({
        card,
        angleBase: (i / N) * PI2,  // fixed seat around the orbit ring
        cx: 0, cy: 0, cz: 0,       // lerped world position
        cRX: 0,                     // lerped pitch (rotateX)
        cRY: 0,                     // lerped yaw   (rotateY)
        cScale: 1
    }));

    /* ── Audio ─────────────────────────────────────────────────────────── */
    const ensureAudio = () => {
        if (spi.audioReady) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        spi.audioContext = new AC();
        spi.masterGain = spi.audioContext.createGain();
        spi.masterGain.gain.value = 0.045;
        spi.masterGain.connect(spi.audioContext.destination);
        spi.audioReady = true;
    };

    const playTone = (type = 'hover') => {
        ensureAudio();
        if (!spi.audioContext || !spi.masterGain) return;
        if (spi.audioContext.state === 'suspended') spi.audioContext.resume();
        const now  = spi.audioContext.currentTime;
        const osc  = spi.audioContext.createOscillator();
        const gain = spi.audioContext.createGain();
        const filt = spi.audioContext.createBiquadFilter();
        const sf   = type === 'menu' ? 280  : 520;
        const ef   = type === 'menu' ? 760  : 840;
        const dur  = type === 'menu' ? 0.18 : 0.105;
        osc.type = 'sine';
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(type === 'menu' ? 1600 : 2200, now);
        osc.frequency.setValueAtTime(sf, now);
        osc.frequency.exponentialRampToValueAtTime(ef, now + dur);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(type === 'menu' ? 0.16 : 0.09, now + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(filt); filt.connect(gain); gain.connect(spi.masterGain);
        osc.start(now); osc.stop(now + dur + 0.025);
    };

    document.addEventListener('pointerdown', ensureAudio, { once: true, passive: true });

    /* ── Menu ──────────────────────────────────────────────────────────── */
    const setMenuOpen = (open) => {
        works.classList.toggle('menu-open', open);
        menuButton?.setAttribute('aria-expanded', String(open));
        menuPanel?.setAttribute('aria-hidden', String(!open));
    };

    menuButton?.addEventListener('click', e => {
        e.stopPropagation();
        const opening = !works.classList.contains('menu-open');
        setMenuOpen(opening);
        playTone('menu');
    });

    menuXBtn?.addEventListener('click', e => {
        e.stopPropagation();
        setMenuOpen(false);
        playTone('menu');
    });

    menuScrim?.addEventListener('click', () => { setMenuOpen(false); playTone('menu'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenuOpen(false); });
    works.querySelectorAll('.works-menu-links a').forEach(a => {
        a.addEventListener('click', () => setMenuOpen(false));
    });

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
        link.addEventListener('focus',      () => {
            if (listPreview && listPreviewImage) {
                listPreviewImage.src = link.dataset.image || '';
                listPreview.classList.add('active');
            }
        });
        link.addEventListener('blur', () => listPreview?.classList.remove('active'));
    });

    /* Clamp wheel velocity tightly so fast scrollers don't cause wild spinning */
    window.addEventListener('wheel', e => {
        const rect = works.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
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
        const rect    = works.getBoundingClientRect();
        const width   = works.clientWidth  || window.innerWidth;
        const visible = rect.bottom > 0 && rect.top < window.innerHeight;

        document.body.classList.toggle(
            'works-in-view',
            rect.top < window.innerHeight * 0.34 && rect.bottom > window.innerHeight * 0.2
        );

        if (visible && spi.mode === 'spiral') {
            spi.rotation += spi.velocity + AUTO_SPIN;  // rotation accumulates — never resets
            spi.velocity *= FRICTION;
        }

        /* Find single frontmost card — lowest backness → gets pointer-events */
        let frontmostIdx = 0;
        let minBackness  = Infinity;
        if (spi.mode === 'spiral') {
            cState.forEach((cs, i) => {
                const angle  = cs.angleBase + spi.rotation;
                const cosA   = Math.cos(angle);
                const bness  = clamp((1 - cosA) / 2, 0, 1);
                if (bness < minBackness) { minBackness = bness; frontmostIdx = i; }
            });
        }

        cState.forEach((cs, i) => {
            const target = spi.mode === 'list' ? listCard(i, width) : orbitCard(cs);

            /* Lerp position + dual-axis rotation */
            cs.cx    = lerp(cs.cx,     target.x,       0.06);
            cs.cy    = lerp(cs.cy,     target.y,       0.06);
            cs.cz    = lerp(cs.cz,     target.z,       0.06);
            cs.cRX   = lerpAngle(cs.cRX, target.rotX, 0.06);
            cs.cRY   = lerpAngle(cs.cRY, target.rotY, 0.06);
            cs.cScale= lerp(cs.cScale,  target.scale,  0.08);

            /* Vintage hover scale: pull back slightly, no zoom */
            const hoverScale = cs.card === spi.hovered ? 0.96 : 1;
            const finalScale = cs.cScale * hoverScale;

            /* CSS custom properties drive image fade + glass back + brightness */
            cs.card.style.setProperty('--backness',   target.backness.toFixed(3));
            cs.card.style.setProperty('--brightness', target.brightness.toFixed(3));

            /* Clone visibility in list mode */
            const isClone = i >= baseCards.length;
            const opacity = (spi.mode === 'list' && isClone) ? 0 : 1;
            cs.card.style.opacity = String(opacity);

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

            /* Z-index — front cards paint on top */
            cs.card.style.zIndex = String(Math.round(500 + cs.cz / 2));

            /* 3D transform: translate → yaw (rotY) → pitch (rotX) → scale */
            cs.card.style.transform = [
                `translate3d(`,
                    `${cs.cx - CARD_W / 2}px,`,
                    `${cs.cy - CARD_H / 2}px,`,
                    `${cs.cz}px`,
                `)`,
                ` rotateY(${cs.cRY}deg)`,
                ` rotateX(${cs.cRX}deg)`,
                ` scale(${finalScale})`
            ].join('');
        });

        requestAnimationFrame(animate);
    };

    setMode('spiral');
    requestAnimationFrame(animate);
})();
