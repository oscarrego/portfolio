const mouseGlow = document.querySelector(".mouse-glow");
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (!isTouchDevice) {
    document.addEventListener("mousemove", (e) => {
        if (mouseGlow) {
            mouseGlow.style.opacity = "1";
            mouseGlow.style.left = e.clientX + "px";
            mouseGlow.style.top = e.clientY + "px";
        }
    });

    /* HOVER EFFECT */
    const hoverItems = document.querySelectorAll("a, button:not(.orbit-view-toggle), input, textarea, select, [role='button'], .project-title");

    hoverItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
            if (mouseGlow) {
                mouseGlow.classList.add("hovering");
            }
        });

        item.addEventListener("mouseleave", () => {
            if (mouseGlow) {
                mouseGlow.classList.remove("hovering");
            }
        });
    });
}

/* TIMELINE GLOW TRACKER */

const timelineWrapper = document.querySelector(".timeline-wrapper");
const timelineGlow = document.querySelector(".timeline-glow");
const timelineLine = document.querySelector(".timeline-line");

if (timelineWrapper && timelineGlow && timelineLine) {
    let currentProgress = 0;
    let targetProgress = 0;

    const updateGlow = () => {
        // Smooth interpolation
        currentProgress += (targetProgress - currentProgress) * 0.08;

        // Calculate maximum movement range so glow doesn't overflow line
        const movementRange = timelineLine.offsetHeight - timelineGlow.offsetHeight;
        const newTop = currentProgress * movementRange;

        // Apply position using transform for performance
        timelineGlow.style.transform = `translate(-50%, ${newTop}px)`;
        
        requestAnimationFrame(updateGlow);
    };

    const onScroll = () => {
        const rect = timelineWrapper.getBoundingClientRect();
        const wrapperHeight = timelineWrapper.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Start tracking when top of wrapper enters middle of viewport
        // Finish tracking when bottom of wrapper passes middle of viewport
        const startOffset = viewportHeight * 0.5;
        const totalDistance = wrapperHeight;
        
        const currentPos = startOffset - rect.top;
        let progress = currentPos / totalDistance;
        
        // Clamp progress between 0 and 1
        targetProgress = Math.max(0, Math.min(1, progress));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Initialize
    onScroll();
    updateGlow();
}

if (!isTouchDevice) {
    document.addEventListener("mouseleave", () => {
        if (mouseGlow) {
            mouseGlow.style.opacity = "0";
        }
    });

    document.addEventListener("mouseenter", () => {
        if (mouseGlow) {
            mouseGlow.style.opacity = "1";
        }
    });
}

/* TRUE KINETIC INERTIAL SCROLLING */
class KineticScroll {
    constructor() {
        this.scrollY = window.scrollY;
        this.targetY = window.scrollY;
        this.velocity = 0;
        
        // Physics Tuning for Cinematic Weight
       this.friction = 0.94;
this.acceleration = 0.06; // Increased for more responsive scroll input
this.spring = 0.04; // Soft interpolation to target
        
        this.isTouch = false;
        
        this.init();
    }
    
    init() {
        // Intercept native wheel events
        window.addEventListener('wheel', (e) => {
            if (!this.isTouch) {
                e.preventDefault(); // Take control of scroll
                // Normalize delta to ensure consistency
                let delta = e.deltaY;
                
                // Add wheel input directly to velocity (momentum simulation)
                this.velocity += delta * this.acceleration;
            }
        }, { passive: false });
        
        // Detect native scrolling (e.g. scrollbar drag, touch drag)
        window.addEventListener('scroll', () => {
            if (Math.abs(this.velocity) < 0.1) {
                this.scrollY = window.scrollY;
                this.targetY = window.scrollY;
            }
        }, { passive: true });
        
        // Disable intercepting on touch so mobile remains native
        window.addEventListener('touchstart', () => {
            this.isTouch = true;
        }, { passive: true });
        
        this.update();
    }
    
    update() {
        if (!this.isTouch) {
            // Apply kinetic friction to velocity
            this.velocity *= this.friction;
            
            // Apply velocity to target position
            this.targetY += this.velocity;
            
            // Clamp target to bounds
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            this.targetY = Math.max(0, Math.min(this.targetY, maxScroll));
            
            // Interpolate current scroll towards target
            this.scrollY += (this.targetY - this.scrollY) * this.spring;
            
            // Apply DOM scroll
            if (Math.abs(this.targetY - this.scrollY) > 0.05 || Math.abs(this.velocity) > 0.05) {
                window.scrollTo(0, this.scrollY);
            } else {
                // Settle
                this.scrollY = window.scrollY;
                this.targetY = window.scrollY;
            }
        }
        
        requestAnimationFrame(() => this.update());
    }
}

// Initialize Custom Scroll Engine
new KineticScroll();

const videos = document.querySelectorAll('.project-video');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;

        if (entry.isIntersecting) {
            video.play();
        } else {
            video.pause();
        }
    });
}, {
    threshold: 0.6
});

videos.forEach(video => {
    observer.observe(video);
});

/* PROTECT PROJECT MEDIA FROM RIGHT-CLICK & SAVE */
document.querySelectorAll('.project-media-wrapper, .project-video').forEach(media => {
    media.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});

/* VIEW TOOLTIP LOGIC */
const viewTooltip = document.createElement("div");
viewTooltip.classList.add("view-tooltip");
viewTooltip.innerText = "VIEW";
document.body.appendChild(viewTooltip);

if (!isTouchDevice) {
    document.addEventListener("mousemove", (e) => {
        if (viewTooltip) {
            viewTooltip.style.left = e.clientX + "px";
            viewTooltip.style.top = e.clientY + "px";
        }
    });

    document.querySelectorAll('.project-media-wrapper').forEach(wrapper => {
        wrapper.addEventListener('mouseenter', () => {
            if (mouseGlow) mouseGlow.classList.add('hovering');
            if (viewTooltip) viewTooltip.classList.add('active');
        });
        wrapper.addEventListener('mouseleave', () => {
            if (mouseGlow) mouseGlow.classList.remove('hovering');
            if (viewTooltip) viewTooltip.classList.remove('active');
        });
    });
}

/* ORBIT VIDEO TOGGLE LOGIC */
const orbitToggleBtn = document.getElementById('orbit-view-toggle');
const orbitVideo = document.getElementById('orbit-video');
const orbitVideoSrc = document.getElementById('orbit-video-src');

if (orbitToggleBtn && orbitVideo && orbitVideoSrc) {
    let isDesktopView = false;
    
    orbitToggleBtn.addEventListener('mouseenter', () => {
        if (viewTooltip) {
            viewTooltip.innerText = isDesktopView ? 'MOBILE MODE' : 'DESKTOP MODE';
        }
    });

    orbitToggleBtn.addEventListener('mouseleave', () => {
        if (viewTooltip) {
            viewTooltip.innerText = 'VIEW';
        }
    });
    
    orbitToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent wrapper click if any
        e.preventDefault();
        
        isDesktopView = !isDesktopView;
        const span = orbitToggleBtn.querySelector('span');
        
        // Subtle video opacity transition
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
        
        if (viewTooltip) {
            viewTooltip.innerText = isDesktopView ? 'MOBILE MODE' : 'DESKTOP MODE';
        }
        
        setTimeout(() => {
            orbitVideo.load();
            orbitVideo.play().catch(e => console.log('Autoplay blocked:', e));
            orbitVideo.style.opacity = '1';
        }, 150);
    });
}



