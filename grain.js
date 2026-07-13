/**
 * OSCAR REGO PORTFOLIO 2026
 * GRAIN.JS — Cinematic Film Grain System (Optimized)
 *
 * Pre-generates a pool of noise tiles and cycles through them
 * instead of regenerating on every frame.
 */

/*
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        zIndex:         '2',
        opacity:        '0.026',
        willChange:     'transform',
    });

    document.body.appendChild(canvas);

    const TILE_W = 180;
    const TILE_H = 180;
    const TILE_POOL_SIZE = 5;

    const tile = document.createElement('canvas');
    tile.width = TILE_W;
    tile.height = TILE_H;
    const tileCtx = tile.getContext('2d', { alpha: false });

    let tilePool = [];
    let tileIndex = 0;

    function generateSingleTile() {
        const imgData = tileCtx.createImageData(TILE_W, TILE_H);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = (Math.random() * 255) | 0;
            d[i] = v;
            d[i + 1] = v;
            d[i + 2] = v;
            d[i + 3] = 255;
        }
        tileCtx.putImageData(imgData, 0, 0);
        return ctx.createPattern(tile, 'repeat');
    }

    function preGenerateTiles() {
        tilePool = [];
        for (let i = 0; i < TILE_POOL_SIZE; i++) {
            tilePool.push(generateSingleTile());
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    let resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 80);
    }, { passive: true });

    resizeCanvas();

    function drawGrain() {
        const pattern = tilePool[tileIndex];
        if (!pattern) return;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        tileIndex = (tileIndex + 1) % tilePool.length;
    }

    const FPS = 18;
    const INTERVAL = 1000 / FPS;
    let lastFrame = 0;
    let animId = null;

    function loop(timestamp) {
        if (timestamp - lastFrame >= INTERVAL) {
            drawGrain();
            lastFrame = timestamp;
        }
        animId = requestAnimationFrame(loop);
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelAnimationFrame(animId);
            animId = null;
        } else if (!prefersReduced) {
            lastFrame = 0;
            animId = requestAnimationFrame(loop);
        }
    });

    if (prefersReduced) {
        preGenerateTiles();
        drawGrain();
    } else {
        preGenerateTiles();
        animId = requestAnimationFrame(loop);
    }

})();
*/
