/* ============================================================
   vortex.js — fundo animado do tema "Vórtice"
   Só é baixado quando o tema Vórtice é escolhido (main.js injeta).
   Riscos de luz girando em espiral num <canvas> fixo.

   Economia:
   - no máximo ~520 riscos, agrupados em 12 traços por quadro
     (um stroke() por grupo de cor/espessura, não um por risco);
   - 30 quadros por segundo, resolução 1x (sem devicePixelRatio);
   - pausa com a aba oculta ou com outro tema ativo;
   - prefers-reduced-motion: desenha um quadro parado e não anima.
   API: window.kfVortex = { start, stop }
   ============================================================ */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var TILT = -0.2;
    var SQUASH = 0.52;
    var FRAME_MS = 1000 / 30;
    var ALPHAS = [0.25, 0.5, 0.9];
    var WIDTHS = [0.7, 1.5];
    var SEGS = [0.3, 1]; // cauda apagada, cabeça acesa

    var cv, ctx, w = 0, h = 0, stars = [], groups = [];
    var raf = 0, last = 0, acc = 0, running = false;
    var cosT = Math.cos(TILT), sinT = Math.sin(TILT);

    function build() {
        w = window.innerWidth;
        h = window.innerHeight;
        cv.width = w;
        cv.height = h;

        var n = Math.min(520, Math.round((w * h) / 2600));
        var R = Math.hypot(w, h);
        stars = [];
        for (var i = 0; i < n; i++) {
            var r = 50 + Math.pow(Math.random(), 0.8) * R;
            stars.push({
                r: r,
                a: Math.random() * Math.PI * 2,
                w: 0.3 * Math.pow(120 / (r + 60), 0.6) * (0.85 + Math.random() * 0.3),
                len: 0.14 + Math.random() * 0.4,
                g: Math.min(2, Math.floor(Math.random() * 3.3)) * WIDTHS.length +
                    (Math.random() < 0.25 + (r / R) * 0.5 ? 1 : 0)
            });
        }
        groups = [];
        for (var k = 0; k < ALPHAS.length * WIDTHS.length * SEGS.length; k++) groups.push([]);
    }

    function center() {
        return w < 760 ? { x: w * 0.5, y: h * 0.32 } : { x: w * 0.68, y: h * 0.42 };
    }

    function render() {
        var C = center(), i, j, k;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        for (k = 0; k < groups.length; k++) groups[k].length = 0;
        for (i = 0; i < stars.length; i++) {
            var s = stars[i], half = s.len / 2;
            groups[s.g * 2].push(s.r, s.a - s.len, s.a - half);
            groups[s.g * 2 + 1].push(s.r, s.a - half, s.a);
        }

        ctx.lineCap = 'round';
        for (k = 0; k < groups.length; k++) {
            var list = groups[k];
            if (!list.length) continue;
            var seg = k % 2, wi = ((k - seg) / 2) % WIDTHS.length, ai = Math.floor(k / (2 * WIDTHS.length));
            ctx.beginPath();
            for (j = 0; j < list.length; j += 3) {
                var r = list[j], a0 = list[j + 1];
                var ex = r * Math.cos(a0), ey = r * SQUASH * Math.sin(a0);
                ctx.moveTo(C.x + ex * cosT - ey * sinT, C.y + ex * sinT + ey * cosT);
                ctx.ellipse(C.x, C.y, r, r * SQUASH, TILT, a0, list[j + 2]);
            }
            ctx.strokeStyle = 'rgba(255,255,255,' + (ALPHAS[ai] * SEGS[seg]) + ')';
            ctx.lineWidth = WIDTHS[wi];
            ctx.stroke();
        }

        // Centro escuro: um degradê só, achatado na mesma perspectiva
        var eye = Math.min(w, h) * 0.3;
        ctx.save();
        ctx.translate(C.x, C.y);
        ctx.rotate(TILT);
        ctx.scale(1, SQUASH * 1.25);
        var gr = ctx.createRadialGradient(0, 0, 0, 0, 0, eye);
        gr.addColorStop(0, 'rgba(0,0,0,1)');
        gr.addColorStop(0.4, 'rgba(0,0,0,0.8)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(-eye, -eye, eye * 2, eye * 2);
        ctx.restore();
    }

    function loop(t) {
        raf = requestAnimationFrame(loop);
        var dt = last ? t - last : FRAME_MS;
        last = t;
        acc += dt;
        if (acc < FRAME_MS) return; // limita a ~30 fps
        var step = Math.min(acc, 100) / 1000;
        acc = 0;
        for (var i = 0; i < stars.length; i++) stars[i].a += stars[i].w * step;
        render();
    }

    function sync() {
        var should = running && !reduceMotion && !document.hidden;
        if (should && !raf) { last = 0; acc = 0; raf = requestAnimationFrame(loop); }
        else if (!should && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    function ensureCanvas() {
        if (cv) return;
        cv = document.createElement('canvas');
        cv.className = 'vortex-sky';
        cv.setAttribute('aria-hidden', 'true');
        ctx = cv.getContext('2d', { alpha: false });
        document.body.insertBefore(cv, document.body.firstChild);
        build();
        if (reduceMotion) stars.forEach(function (s) { s.len *= 1.6; });

        var timer = 0;
        window.addEventListener('resize', function () {
            if (!running) return;
            clearTimeout(timer);
            timer = setTimeout(function () { build(); render(); }, 200);
        });
        document.addEventListener('visibilitychange', sync);
    }

    window.kfVortex = {
        start: function () {
            ensureCanvas();
            if (cv.width !== window.innerWidth || cv.height !== window.innerHeight) build();
            running = true;
            render();
            sync();
        },
        stop: function () {
            running = false;
            sync();
        }
    };

    // Se o tema já estiver ativo quando o script chegar, começa sozinho.
    if (root.getAttribute('data-theme') === 'vortex') {
        if (document.body) window.kfVortex.start();
        else document.addEventListener('DOMContentLoaded', window.kfVortex.start);
    }
})();
