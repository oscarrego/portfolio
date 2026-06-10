/**
 * OSCAR REGO PORTFOLIO 2026
 * GRAIN.JS — Cinematic Film Grain System
 *
 * Architecture:
 *   - Offscreen 180×180 tile canvas generates random luminance noise
 *   - Tile is stamped across a full-viewport canvas via createPattern()
 *   - Canvas is animated at 18 fps — matching cinematic film frame rate
 *   - Full-res viewport grain: grain particles are consistent size at all
 *     resolutions because the canvas is sized to the viewport
 *   - Pauses automatically when the browser tab is hidden (Page Visibility API)
 *   - One static frame shown when prefers-reduced-motion is enabled
 *   - Debounced resize handler prevents thrashing during window drag
 *
 * Z-index hierarchy (non-interactive):
 *   grain canvas  : 2      ← texture layer, sits above raw bg, BELOW all UI
 *   social-sidebar: 999    ← above grain
 *   body::before  : 1500   ← liquid glass strip, above grain
 *   .floating-nav : 2000   ← above grain (correct)
 *   #loader       : 9998   ← above grain (correct)
 *   .view-tooltip : 9999998 ← above grain (correct)
 *   .mouse-glow   : 9999999 ← above grain (correct)
 *
 * The grain MUST sit below readable UI — nav, footer, text, timeline, hero.
 *
 * Performance notes:
 *   - Only a 180×180 pixel tile is generated per frame (~130 KB/frame)
 *   - canvas { alpha: false } skips alpha compositing
 *   - requestAnimationFrame is gated by a timestamp comparison (18 fps cap)
 *   - Tab-hidden pause saves ~18 canvas operations/sec when user switches tabs
 */

(function () {
    'use strict';

    /* ── Reduced-motion preference ─────────────────────────────────────────── */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Main overlay canvas ───────────────────────────────────────────────── */
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');

    Object.assign(canvas.style, {
        position:       'fixed',
        top:            '0',
        left:           '0',
        width:          '100%',
        height:         '100%',
        pointerEvents:  'none',
        zIndex:         '2',     /* Below all UI: nav(2000), footer(5), text — ABOVE only raw bg */
        opacity:        '0.026', /* Slightly increased since it now sits lower — still very subtle */
        willChange:     'contents',
    });

    /* Insert grain AFTER the loader so it is below the loader in DOM order,
       but z-index controls stacking correctly regardless.               */
    document.body.appendChild(canvas);

    /* ── Offscreen tile ────────────────────────────────────────────────────── */
    const TILE_W = 180;
    const TILE_H = 180;

    const tile    = document.createElement('canvas');
    tile.width    = TILE_W;
    tile.height   = TILE_H;
    const tileCtx = tile.getContext('2d', { alpha: false });

    let grainPattern = null;

    /* ── Generate one noise tile ───────────────────────────────────────────── */
    function generateTile() {
        const imgData = tileCtx.createImageData(TILE_W, TILE_H);
        const d = imgData.data;

        for (let i = 0; i < d.length; i += 4) {
            /* Monochrome noise — single random value for R G B */
            const v = (Math.random() * 255) | 0;
            d[i]     = v;
            d[i + 1] = v;
            d[i + 2] = v;
            d[i + 3] = 255;
        }

        tileCtx.putImageData(imgData, 0, 0);
        grainPattern = ctx.createPattern(tile, 'repeat');
    }

    /* ── Resize handler ────────────────────────────────────────────────────── */
    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    let resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 80);
    }, { passive: true });

    resizeCanvas();

    /* ── Draw a grain frame ────────────────────────────────────────────────── */
    function drawGrain() {
        if (!grainPattern) return;
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /* ── Animation loop (capped at ~18 fps = cinematic film rate) ──────────── */
    const FPS      = 18;
    const INTERVAL = 1000 / FPS;   /* ≈ 55.6 ms */
    let lastFrame  = 0;
    let animId     = null;

    function loop(timestamp) {
        if (timestamp - lastFrame >= INTERVAL) {
            generateTile();
            drawGrain();
            lastFrame = timestamp;
        }
        animId = requestAnimationFrame(loop);
    }

    /* ── Page Visibility API — pause when tab is hidden ───────────────────── */
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelAnimationFrame(animId);
            animId = null;
        } else if (!prefersReduced) {
            lastFrame = 0;
            animId = requestAnimationFrame(loop);
        }
    });

    /* ── Kick off ──────────────────────────────────────────────────────────── */
    if (prefersReduced) {
        /* Accessibility: one static frame, no animation */
        generateTile();
        drawGrain();
    } else {
        animId = requestAnimationFrame(loop);
    }

})();
