/* ═══════════════════════════════════════════════════════════════════════════
   OSCAR REGO PORTFOLIO 2026 — SOUNDS.JS
   Premium, self-contained UI Sound System using Web Audio API synthesis.
   Pre-renders all sounds into AudioBuffers for zero-latency instant playback.
   Volume range: 20-30% (master gain 0.25).
   Clicks and state changes only (no hovers, except project card hover entry).
 ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const AC = window.AudioContext || window.webkitAudioContext;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!AC || !OAC) return;

  const ctx = new AC();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.25; // 25% volume
  masterGain.connect(ctx.destination);

  const buffers = {};

  // Synthesize soft premium OS sounds using Web Audio API offline rendering
  function renderSound(type, sampleRate = 44100) {
    let dur = 0.1;
    if (type === 'hover-tick') dur = 0.015;
    else if (type === 'menu-open') dur = 0.22;
    else if (type === 'menu-close') dur = 0.14;
    else if (type === 'launch') dur = 0.08;
    else if (type === 'toggle') dur = 0.06;
    else if (type === 'media-click') dur = 0.04;
    else if (type === 'nav-confirm') dur = 0.12;
    else if (type === 'click') dur = 0.05;

    const length = Math.ceil(sampleRate * (dur + 0.03));
    const offlineCtx = new OAC(1, length, sampleRate);

    const filt = offlineCtx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.connect(offlineCtx.destination);

    if (type === 'hover-tick') {
      // Light glass-like tick (Apple Vision Pro/Linear style)
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      filt.frequency.setValueAtTime(3200, 0);

      osc.frequency.setValueAtTime(2200, 0);
      osc.frequency.exponentialRampToValueAtTime(900, dur);

      gain.gain.setValueAtTime(0.0001, 0);
      gain.gain.linearRampToValueAtTime(0.06, 0.001); // ultra fast attack
      gain.gain.exponentialRampToValueAtTime(0.0001, dur);

      osc.connect(gain);
      gain.connect(filt);
      osc.start(0);
      osc.stop(dur);
    } 
    else if (type === 'click') {
      // Clean woody/soft tap
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      filt.frequency.setValueAtTime(1200, 0);

      osc.frequency.setValueAtTime(700, 0);
      osc.frequency.exponentialRampToValueAtTime(180, dur);

      gain.gain.setValueAtTime(0.0001, 0);
      gain.gain.linearRampToValueAtTime(0.25, 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, dur);

      osc.connect(gain);
      gain.connect(filt);
      osc.start(0);
      osc.stop(dur);
    } 
    else if (type === 'menu-open') {
      // Premium "open" — soft punchy pop + bright shimmer tail
      // Layer 1: fast thump (low sine burst — the "pop" body)
      const osc1 = offlineCtx.createOscillator();
      const gain1 = offlineCtx.createGain();
      // Layer 2: bright crystalline shimmer (high sine)
      const osc2 = offlineCtx.createOscillator();
      const gain2 = offlineCtx.createGain();
      // Layer 3: mid harmonic fill
      const osc3 = offlineCtx.createOscillator();
      const gain3 = offlineCtx.createGain();

      filt.type = 'highshelf';
      filt.frequency.setValueAtTime(800, 0);
      filt.gain.setValueAtTime(4, 0);

      // Body pop: punchy low sine, fast decay
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(180, 0);
      osc1.frequency.exponentialRampToValueAtTime(90, 0.06);
      gain1.gain.setValueAtTime(0.0001, 0);
      gain1.gain.linearRampToValueAtTime(0.28, 0.003);
      gain1.gain.exponentialRampToValueAtTime(0.0001, 0.08);

      // Shimmer: bright high sine, delayed slightly, longer tail
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1800, 0);
      osc2.frequency.exponentialRampToValueAtTime(2600, dur);
      gain2.gain.setValueAtTime(0.0001, 0);
      gain2.gain.linearRampToValueAtTime(0.09, 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.0001, dur);

      // Mid harmonic warmth
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(720, 0);
      osc3.frequency.exponentialRampToValueAtTime(960, dur * 0.7);
      gain3.gain.setValueAtTime(0.0001, 0);
      gain3.gain.linearRampToValueAtTime(0.07, 0.008);
      gain3.gain.exponentialRampToValueAtTime(0.0001, dur * 0.8);

      osc1.connect(gain1); gain1.connect(filt);
      osc2.connect(gain2); gain2.connect(filt);
      osc3.connect(gain3); gain3.connect(filt);

      osc1.start(0); osc1.stop(dur);
      osc2.start(0); osc2.stop(dur);
      osc3.start(0); osc3.stop(dur);
    } 
    else if (type === 'menu-close') {
      // Premium "close" — crisp bright tap + fast downward chime (like iOS dismiss)
      const osc1 = offlineCtx.createOscillator();
      const gain1 = offlineCtx.createGain();
      const osc2 = offlineCtx.createOscillator();
      const gain2 = offlineCtx.createGain();

      filt.type = 'highshelf';
      filt.frequency.setValueAtTime(1000, 0);
      filt.gain.setValueAtTime(3, 0);

      // Crisp tap: mid-high strike, fast decay
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1100, 0);
      osc1.frequency.exponentialRampToValueAtTime(420, dur);
      gain1.gain.setValueAtTime(0.0001, 0);
      gain1.gain.linearRampToValueAtTime(0.22, 0.002);
      gain1.gain.exponentialRampToValueAtTime(0.0001, dur);

      // Harmonic tail: softer secondary note
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(660, 0);
      osc2.frequency.exponentialRampToValueAtTime(280, dur);
      gain2.gain.setValueAtTime(0.0001, 0);
      gain2.gain.linearRampToValueAtTime(0.12, 0.005);
      gain2.gain.exponentialRampToValueAtTime(0.0001, dur * 0.85);

      osc1.connect(gain1); gain1.connect(filt);
      osc2.connect(gain2); gain2.connect(filt);

      osc1.start(0); osc1.stop(dur);
      osc2.start(0); osc2.stop(dur);
    } 
    else if (type === 'launch') {
      // Premium warm double click tap for project launch
      const osc1 = offlineCtx.createOscillator();
      const gain1 = offlineCtx.createGain();
      const osc2 = offlineCtx.createOscillator();
      const gain2 = offlineCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      filt.frequency.setValueAtTime(1400, 0);

      osc1.frequency.setValueAtTime(360, 0);
      osc1.frequency.exponentialRampToValueAtTime(180, dur);
      osc2.frequency.setValueAtTime(540, 0);
      osc2.frequency.exponentialRampToValueAtTime(270, dur);

      gain1.gain.setValueAtTime(0.0001, 0);
      gain1.gain.linearRampToValueAtTime(0.24, 0.002);
      gain1.gain.exponentialRampToValueAtTime(0.0001, dur);

      gain2.gain.setValueAtTime(0.0001, 0);
      gain2.gain.linearRampToValueAtTime(0.18, 0.003);
      gain2.gain.exponentialRampToValueAtTime(0.0001, dur);

      osc1.connect(gain1); gain1.connect(filt);
      osc2.connect(gain2); gain2.connect(filt);

      osc1.start(0); osc1.stop(dur);
      osc2.start(0); osc2.stop(dur);
    } 
    else if (type === 'toggle') {
      // Small state-switch click (double-click pluck toggle)
      const osc1 = offlineCtx.createOscillator();
      const gain1 = offlineCtx.createGain();
      const osc2 = offlineCtx.createOscillator();
      const gain2 = offlineCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      filt.frequency.setValueAtTime(2000, 0);

      // Tick 1
      osc1.frequency.setValueAtTime(800, 0);
      osc1.frequency.exponentialRampToValueAtTime(400, 0.02);
      gain1.gain.setValueAtTime(0.0001, 0);
      gain1.gain.linearRampToValueAtTime(0.14, 0.002);
      gain1.gain.exponentialRampToValueAtTime(0.0001, 0.02);

      // Tick 2 (starts after 0.025s)
      osc2.frequency.setValueAtTime(1100, 0.025);
      osc2.frequency.exponentialRampToValueAtTime(550, 0.055);
      gain2.gain.setValueAtTime(0.0001, 0);
      gain2.gain.setValueAtTime(0.0001, 0.025);
      gain2.gain.linearRampToValueAtTime(0.16, 0.027);
      gain2.gain.exponentialRampToValueAtTime(0.0001, 0.055);

      osc1.connect(gain1); gain1.connect(filt);
      osc2.connect(gain2); gain2.connect(filt);

      osc1.start(0); osc1.stop(0.02);
      osc2.start(0.025); osc2.stop(0.055);
    } 
    else if (type === 'media-click') {
      // Clean control tap
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      filt.frequency.setValueAtTime(1600, 0);

      osc.frequency.setValueAtTime(1000, 0);
      osc.frequency.exponentialRampToValueAtTime(300, dur);

      gain.gain.setValueAtTime(0.0001, 0);
      gain.gain.linearRampToValueAtTime(0.2, 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, dur);

      osc.connect(gain);
      gain.connect(filt);
      osc.start(0);
      osc.stop(dur);
    } 
    else if (type === 'nav-confirm') {
      // Premium confirm sound (warm chime intervals)
      const osc1 = offlineCtx.createOscillator();
      const gain1 = offlineCtx.createGain();
      const osc2 = offlineCtx.createOscillator();
      const gain2 = offlineCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      filt.frequency.setValueAtTime(1800, 0);

      osc1.frequency.setValueAtTime(523, 0); // C5
      osc1.frequency.linearRampToValueAtTime(587, dur); // smooth slight pitch slide to D5
      osc2.frequency.setValueAtTime(784, 0); // G5
      osc2.frequency.exponentialRampToValueAtTime(784, dur);

      gain1.gain.setValueAtTime(0.0001, 0);
      gain1.gain.linearRampToValueAtTime(0.15, 0.008);
      gain1.gain.exponentialRampToValueAtTime(0.0001, dur);

      gain2.gain.setValueAtTime(0.0001, 0);
      gain2.gain.linearRampToValueAtTime(0.12, 0.012);
      gain2.gain.exponentialRampToValueAtTime(0.0001, dur);

      osc1.connect(gain1); gain1.connect(filt);
      osc2.connect(gain2); gain2.connect(filt);

      osc1.start(0); osc1.stop(dur);
      osc2.start(0); osc2.stop(dur);
    }

    return offlineCtx.startRendering();
  }

  // Pre-load / Pre-render all sounds immediately
  const sr = ctx.sampleRate || 44100;
  const soundTypes = ['hover-tick', 'click', 'menu-open', 'menu-close', 'launch', 'toggle', 'media-click', 'nav-confirm'];
  
  Promise.all(soundTypes.map(type => 
    renderSound(type, sr).then(buf => { buffers[type] = buf; })
  )).catch(err => {
    console.error('Failed to pre-render UI sounds:', err);
  });

  // Resume context on interaction
  function resumeContext() {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }
  ['click', 'pointerdown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, resumeContext, { once: true, capture: true, passive: true });
  });

  // Load initial state from localStorage
  const savedSoundState = localStorage.getItem('uiSoundEnabled');
  window._soundsMuted = (savedSoundState === 'false');

  // Set initial gain based on localStorage state
  masterGain.gain.setValueAtTime(window._soundsMuted ? 0 : 0.25, ctx.currentTime);

  // Global playTone function
  window.playTone = function (type = 'click') {
    if (window._soundsMuted) return;
    resumeContext();
    if (type === 'hover') return;
    let mappedType = type;
    if (type === 'menu') mappedType = 'click';
    const buf = buffers[mappedType];
    if (buf) {
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.connect(masterGain);
      source.start(0);
    }
  };

  // Helper to update button class, title and icon display
  function updateVolToggleUI() {
    const btn = document.getElementById('vol-toggle');
    if (!btn) return;
    btn.classList.toggle('is-muted', window._soundsMuted);
    btn.setAttribute('title', window._soundsMuted ? 'UI Sounds Disabled' : 'UI Sounds Enabled');
    
    const iconOn = btn.querySelector('.vol-icon--on');
    const iconOff = btn.querySelector('.vol-icon--off');
    if (iconOn && iconOff) {
      iconOn.style.display = window._soundsMuted ? 'none' : 'block';
      iconOff.style.display = window._soundsMuted ? 'block' : 'none';
    }
  }

  let bgMusic = null;
  let hasInteracted = false;
  const targetVolume = 0.15; // Soft ambient volume
  let fadeInterval = null;

  function fadeBgMusic(targetVol, durationMs = 400) {
    if (!bgMusic) return;
    clearInterval(fadeInterval);
    
    // If we want to play, make sure we call play() first
    if (targetVol > 0 && bgMusic.paused) {
      bgMusic.play().catch(err => {
        console.warn('Playback prevented:', err);
      });
    }

    const startVol = bgMusic.volume;
    const steps = 20;
    const intervalTime = durationMs / steps;
    const volStep = (targetVol - startVol) / steps;
    let stepCount = 0;

    fadeInterval = setInterval(() => {
      stepCount++;
      let nextVol = startVol + volStep * stepCount;
      bgMusic.volume = Math.max(0, Math.min(targetVolume, nextVol));
      if (stepCount >= steps) {
        clearInterval(fadeInterval);
        bgMusic.volume = targetVol;
        if (targetVol === 0) {
          bgMusic.pause();
        }
      }
    }, intervalTime);
  }

  function playBgMusic() {
    if (!bgMusic) return;
    if (document.hidden || window._soundsMuted) {
      return;
    }
    fadeBgMusic(targetVolume, 400);
  }

  function pauseBgMusic() {
    if (!bgMusic) return;
    fadeBgMusic(0, 300);
  }

  function startPlayingMusic() {
    if (window._soundsMuted) return;

    bgMusic.play()
      .then(() => {
        hasInteracted = true;
        if (!document.hidden) {
          fadeBgMusic(targetVolume, 400);
        } else {
          bgMusic.volume = 0;
          bgMusic.pause();
        }
      })
      .catch(() => {
        // Autoplay blocked, wait for user gesture
        const startMusicOnInteraction = () => {
          hasInteracted = true;
          playBgMusic();
          ['click', 'touchstart', 'keydown'].forEach(evt => {
            window.removeEventListener(evt, startMusicOnInteraction, { capture: true });
          });
        };
        ['click', 'touchstart', 'keydown'].forEach(evt => {
          window.addEventListener(evt, startMusicOnInteraction, { once: true, capture: true, passive: true });
        });
      });
  }

  function initBackgroundMusic() {
    bgMusic = new Audio('main_menu.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0; // Start at 0 and fade in

    // Retrieve saved time from localStorage (only if NOT a reload/refresh)
    const isReload = window._isReload || false;
    if (isReload) {
      localStorage.removeItem('bgMusicTime');
    }
    const savedTime = isReload ? null : localStorage.getItem('bgMusicTime');

    if (savedTime) {
      if (bgMusic.readyState >= 1) {
        bgMusic.currentTime = parseFloat(savedTime) || 0;
      } else {
        bgMusic.addEventListener('loadedmetadata', () => {
          bgMusic.currentTime = parseFloat(savedTime) || 0;
        }, { once: true });
      }
    }

    // Periodically save current time
    let lastSaveTime = 0;
    bgMusic.addEventListener('timeupdate', () => {
      const now = Date.now();
      if (now - lastSaveTime > 1000) {
        localStorage.setItem('bgMusicTime', bgMusic.currentTime.toString());
        lastSaveTime = now;
      }
    });

    // Save time on beforeunload
    window.addEventListener('beforeunload', () => {
      if (bgMusic) {
        localStorage.setItem('bgMusicTime', bgMusic.currentTime.toString());
      }
    });

    // Visibility / focus change handlers
    function handleVisibilityChange() {
      if (document.hidden || !document.hasFocus()) {
        pauseBgMusic();
      } else {
        if (hasInteracted && !window._soundsMuted) {
          playBgMusic();
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    // Play only when loading screen completes or immediately if already skipped
    if (window._loaderFinished) {
      startPlayingMusic();
    } else {
      window.addEventListener('loaderFinished', () => {
        startPlayingMusic();
      }, { once: true });
    }

    // Setup fallback interaction for marking interaction status even if muted
    const markInteraction = () => {
      hasInteracted = true;
      ['click', 'touchstart', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, markInteraction, { capture: true });
      });
    };
    ['click', 'touchstart', 'keydown'].forEach(evt => {
      window.addEventListener(evt, markInteraction, { once: true, capture: true, passive: true });
    });
  }

  // Toggle Function
  window.toggleSoundMute = function () {
    // If currently unmuted (turning mute ON), play tone BEFORE muting
    if (!window._soundsMuted) {
      window.playTone('click');
    }
    
    window._soundsMuted = !window._soundsMuted;
    
    // Save to localStorage
    localStorage.setItem('uiSoundEnabled', (!window._soundsMuted).toString());
    
    // Smooth transition of master gain value
    masterGain.gain.setTargetAtTime(
      window._soundsMuted ? 0 : 0.25,
      ctx.currentTime, 0.05
    );
    
    // Update Button UI
    updateVolToggleUI();

    // Update background music volume/mute (commented out for now)
    /*
    if (bgMusic) {
      if (window._soundsMuted) {
        fadeBgMusic(0, 150);
      } else {
        playBgMusic();
      }
    }
    */

    // If currently unmuted (turning mute OFF), play tone AFTER unmuting
    if (!window._soundsMuted) {
      window.playTone('click');
    }
  };

  function initVolToggle() {
    // 1. Inject Styles
    if (!document.getElementById('vol-toggle-styles')) {
      const style = document.createElement('style');
      style.id = 'vol-toggle-styles';
      style.textContent = `
        .vol-toggle {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 48px;
          height: 48px;
          z-index: 2100;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.25s ease;
          padding: 0;
          outline: none;
          box-shadow: none;
          opacity: 0;
          filter: blur(12px);
          
          /* Entrance animation on page load — slow & smooth from bottom to top */
          animation: volToggleEntrance 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes volToggleEntrance {
          0% {
            opacity: 0;
            filter: blur(12px);
            transform: translate3d(0, 40px, 0);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: translate3d(0, 0, 0);
          }
        }
        .vol-toggle:not(.is-muted) {
          color: rgba(255, 255, 255, 0.95);
        }
        .vol-toggle.is-muted {
          color: rgba(255, 255, 255, 0.4);
        }
        .vol-toggle .vol-icon {
          width: 18px;
          height: 18px;
          display: block;
        }
        @media (max-width: 600px) {
          .vol-toggle {
            bottom: 24px;
            right: 24px;
            width: 42px;
            height: 42px;
          }
          .vol-toggle .vol-icon {
            width: 16px;
            height: 16px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // 2. Inject Button
    let btn = document.getElementById('vol-toggle');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'vol-toggle';
      btn.className = 'vol-toggle';
      btn.setAttribute('aria-label', 'Toggle UI Sounds');
      btn.innerHTML = `
        <svg class="vol-icon vol-icon--on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <svg class="vol-icon vol-icon--off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
      document.body.appendChild(btn);
    }

    // 3. Update UI to match current muting state
    updateVolToggleUI();

    // 4. Add Click listener
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      window.toggleSoundMute();
    });
  }

  function isInternalNavigationLink(anchor) {
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

  function initAll() {
    initVolToggle();
    // initBackgroundMusic(); // Commented out for now
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }



  // Setup click triggers on document to catch interactions automatically
  document.addEventListener('click', function (e) {
    const target = e.target;
    if (!target) return;

    // Fade out background music if clicking an internal link (commented out for now)
    /*
    const anchor = target.closest('a');
    if (anchor && isInternalNavigationLink(anchor)) {
      pauseBgMusic();
      if (bgMusic) {
        localStorage.setItem('bgMusicTime', bgMusic.currentTime.toString());
      }
    }
    */

    // 1. Navigation Pill Trigger (Menu open/close toggle)
    const navTrigger = target.closest('#pill-nav-trigger');
    if (navTrigger) {
      window.playTone('hover-tick');
      return;
    }

    // 2. Menu Close Button or scrim overlay click
    const closeBtn = target.closest('#menu-close-btn');
    const scrim = target.closest('#menu-scrim');
    if (closeBtn || scrim) {
      window.playTone('menu-close');
      return;
    }

    // 3. Menu items / Navigation item clicks
    const menuLink = target.closest('.menu-link') || target.closest('.pill-nav-logo');
    if (menuLink) {
      window.playTone('nav-confirm');
      return;
    }

    // 4. Mobile/Desktop toggles
    const toggleBtn = target.closest('.sw-toggle-btn') || target.closest('#orbit-view-toggle');
    if (toggleBtn) {
      window.playTone('toggle');
      return;
    }

    // 5. Selected Work Cards / project card click
    const swCard = target.closest('.sw-card') || target.closest('.work-card');
    if (swCard) {
      window.playTone('nav-confirm');
      return;
    }

    // 6. Play/Pause video or media controls
    const carouselNav = target.closest('.carousel-nav');
    if (carouselNav) {
      window.playTone('media-click');
      return;
    }

    // 7. General links & buttons (exclude vol-toggle)
    const link = target.closest('a');
    const btn = target.closest('button');
    if ((link || btn) && !target.closest('#vol-toggle')) {
      // Social circles and external contact links
      if (target.closest('.social-circle') || target.closest('.contact-link-item')) {
        window.playTone('nav-confirm');
      } else {
        window.playTone('click');
      }
    }
  }, { capture: true });

})();
