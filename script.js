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
