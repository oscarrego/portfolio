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

  // Global playTone function
  window.playTone = function (type = 'click') {
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

  // ── Volume toggle (mute/unmute all UI sounds) ────────────────────────────
  window._soundsMuted = false;
  window.toggleSoundMute = function () {
    window._soundsMuted = !window._soundsMuted;
    masterGain.gain.setTargetAtTime(
      window._soundsMuted ? 0 : 0.25,
      ctx.currentTime, 0.05
    );
    const btn = document.getElementById('vol-toggle');
    if (!btn) return;
    btn.classList.toggle('is-muted', window._soundsMuted);
    btn.querySelector('.vol-icon--on').style.display  = window._soundsMuted ? 'none' : '';
    btn.querySelector('.vol-icon--off').style.display = window._soundsMuted ? ''     : 'none';
  };

  function initVolToggle() {
    const btn = document.getElementById('vol-toggle');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      window.toggleSoundMute();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVolToggle);
  } else {
    initVolToggle();
  }

  // ── Delegated Mouse Hover Event tracking for Project Card entry ──
  let activeHoveredCard = null;

  document.addEventListener('mouseover', function (e) {
    const card = e.target.closest('.sw-card, .work-card');
    if (card && card !== activeHoveredCard) {
      activeHoveredCard = card;
      window.playTone('hover-tick');
    }
  }, { capture: true });

  document.addEventListener('mouseout', function (e) {
    const card = e.target.closest('.sw-card, .work-card');
    if (card && activeHoveredCard === card) {
      const related = e.relatedTarget;
      if (!related || !card.contains(related)) {
        activeHoveredCard = null;
      }
    }
  }, { capture: true });

  // Setup click triggers on document to catch interactions automatically
  document.addEventListener('click', function (e) {
    const target = e.target;
    if (!target) return;

    // 1. Navigation Pill Trigger (Menu open)
    const navTrigger = target.closest('#pill-nav-trigger');
    if (navTrigger) {
      window.playTone('menu-open');
      return;
    }

    // 2. Menu Close Button or backdrop overlay click
    const closeBtn = target.closest('#menu-close-btn');
    const menuOverlay = target.closest('#menu-overlay');
    if (closeBtn || (menuOverlay && target === menuOverlay)) {
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
      window.playTone('launch');
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
