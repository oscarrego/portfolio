/* ═══════════════════════════════════════════════════════════════════════════
   OSCAR REGO PORTFOLIO 2026 — SCRIPT.JS
   Custom cursor, kinetic scroll, video observers, timeline animations
═══════════════════════════════════════════════════════════════════════════ */

/* ── Touch / pointer capability detection ───────────────────────────────── */
// Use both matchMedia AND maxTouchPoints for robust detection
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

    /* HOVER EFFECT */
    const hoverItems = document.querySelectorAll("a, button:not(.orbit-view-toggle), input, textarea, select, [role='button'], .project-title");

    hoverItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
            mouseGlow.classList.add('hovering');
        });
        item.addEventListener('mouseleave', () => {
            mouseGlow.classList.remove('hovering');
        });
    });

} else if (mouseGlow) {
    // Touch device: remove cursor element entirely from DOM
    mouseGlow.remove();
}

/* ── TIMELINE GLOW TRACKER (desktop) ───────────────────────────────────── */
const timelineWrapper = document.querySelector('.timeline-wrapper');
const timelineGlow = document.querySelector('.timeline-glow');
const timelineLine = document.querySelector('.timeline-line');

if (timelineWrapper && timelineGlow && timelineLine && !isTouchDevice) {
    let currentProgress = 0;
    let targetProgress = 0;

    const updateGlow = () => {
        currentProgress += (targetProgress - currentProgress) * 0.08;
        const movementRange = timelineLine.offsetHeight - timelineGlow.offsetHeight;
        const newTop = currentProgress * movementRange;
        timelineGlow.style.transform = `translate(-50%, ${newTop}px)`;
        requestAnimationFrame(updateGlow);
    };

    const onScroll = () => {
        const rect = timelineWrapper.getBoundingClientRect();
        const wrapperHeight = timelineWrapper.offsetHeight;
        const viewportHeight = window.innerHeight;
        const startOffset = viewportHeight * 0.5;
        const totalDistance = wrapperHeight;
        const currentPos = startOffset - rect.top;
        let progress = currentPos / totalDistance;
        targetProgress = Math.max(0, Math.min(1, progress));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    updateGlow();
}

/* ── TIMELINE SCROLL-REVEAL (mobile) ───────────────────────────────────── */
// Reveals .timeline-item elements as user scrolls on touch/mobile
if (isTouchDevice) {
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (timelineItems.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Once revealed, stop observing (animation runs once)
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px', // trigger slightly before fully in view
        });

        timelineItems.forEach((item) => revealObserver.observe(item));
    }

    // Also animate timeline glow on mobile using scroll position
    if (timelineWrapper && timelineGlow && timelineLine) {
        const onMobileScroll = () => {
            const rect = timelineWrapper.getBoundingClientRect();
            const wrapperHeight = timelineWrapper.offsetHeight;
            const viewportHeight = window.innerHeight;
            const currentPos = (viewportHeight * 0.5) - rect.top;
            const progress = Math.max(0, Math.min(1, currentPos / wrapperHeight));
            const movementRange = timelineLine.offsetHeight - timelineGlow.offsetHeight;
            timelineGlow.style.transform = `translate(-50%, ${progress * movementRange}px)`;
        };
        window.addEventListener('scroll', onMobileScroll, { passive: true });
        onMobileScroll();
    }
}

/* ── TRUE KINETIC INERTIAL SCROLLING ────────────────────────────────────── */
class KineticScroll {
    constructor() {
        this.scrollY = window.scrollY;
        this.targetY = window.scrollY;
        this.velocity = 0;
        this.friction = 0.94;
        this.acceleration = 0.06;
        this.spring = 0.04;
        this.isTouch = false;
        this.init();
    }

    init() {
        window.addEventListener('wheel', (e) => {
            if (!this.isTouch) {
                e.preventDefault();
                let delta = e.deltaY;
                this.velocity += delta * this.acceleration;
            }
        }, { passive: false });

        window.addEventListener('scroll', () => {
            if (Math.abs(this.velocity) < 0.1) {
                this.scrollY = window.scrollY;
                this.targetY = window.scrollY;
            }
        }, { passive: true });

        window.addEventListener('touchstart', () => {
            this.isTouch = true;
        }, { passive: true });

        this.update();
    }

    update() {
        if (!this.isTouch) {
            this.velocity *= this.friction;
            this.targetY += this.velocity;
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            this.targetY = Math.max(0, Math.min(this.targetY, maxScroll));
            this.scrollY += (this.targetY - this.scrollY) * this.spring;

            if (Math.abs(this.targetY - this.scrollY) > 0.05 || Math.abs(this.velocity) > 0.05) {
                window.scrollTo(0, this.scrollY);
            } else {
                this.scrollY = window.scrollY;
                this.targetY = window.scrollY;
            }
        }
        requestAnimationFrame(() => this.update());
    }
}

new KineticScroll();

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

/* ── Protect project media from right-click & save ─────────────────────── */
document.querySelectorAll('.project-media-wrapper, .project-video').forEach(media => {
    media.addEventListener('contextmenu', (e) => e.preventDefault());
});

/* ── VIEW TOOLTIP LOGIC (desktop only) ─────────────────────────────────── */
if (!isTouchDevice) {
    const viewTooltip = document.createElement('div');
    viewTooltip.classList.add('view-tooltip');
    viewTooltip.innerText = 'VIEW';
    document.body.appendChild(viewTooltip);

    document.addEventListener('mousemove', (e) => {
        viewTooltip.style.left = e.clientX + 'px';
        viewTooltip.style.top = e.clientY + 'px';
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

    /* ── ORBIT VIDEO TOGGLE LOGIC ─────────────────────────────────────── */
    const orbitToggleBtn = document.getElementById('orbit-view-toggle');
    const orbitVideo = document.getElementById('orbit-video');
    const orbitVideoSrc = document.getElementById('orbit-video-src');

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
            orbitVideo.style.opacity = '0.5';

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
                orbitVideo.play().catch(e => console.log('Autoplay blocked:', e));
                orbitVideo.style.opacity = '1';
            }, 150);
        });
    }
}

/* ── Orbit toggle on touch devices (no tooltip needed) ─────────────────── */
if (isTouchDevice) {
    const orbitToggleBtn = document.getElementById('orbit-view-toggle');
    const orbitVideo = document.getElementById('orbit-video');
    const orbitVideoSrc = document.getElementById('orbit-video-src');

    if (orbitToggleBtn && orbitVideo && orbitVideoSrc) {
        let isDesktopView = false;

        orbitToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            isDesktopView = !isDesktopView;

            orbitVideo.style.transition = 'opacity 0.2s ease';
            orbitVideo.style.opacity = '0.5';

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
                orbitVideo.play().catch(e => console.log('Autoplay blocked:', e));
                orbitVideo.style.opacity = '1';
            }, 150);
        });
    }
}
