/* ============================================================
   ocean.js — águas-vivas em ASCII
   Cada elemento [data-ocean] vira um "aquário": as criaturas são
   pintadas num canvas de baixa resolução (campo de luz) e depois
   traduzidas para uma grade de caracteres monoespaçados.
   Presets: data-ocean="strip" | "letters" | "banner" | "" (auto)
   Um único laço de animação para todos os aquários visíveis.
   API: window.kfFx = { toggle, isOn, pulse }
   ============================================================ */
(function () {
    'use strict';

    var root = document.documentElement;
    var STORE = 'kf-fx';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var on = true;
    try { if (localStorage.getItem(STORE) === 'off') on = false; } catch (e) { }

    var FONT = '"Geist Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
    var SS = 2; // amostras por célula, por eixo
    var RAMP = [['.', '·'], [',', '.'], [':', '·'], [';', ':'], ['+', ';'], ['*', '+'], ['o', '*'], ['x', 'o'], ['%', 'x'], ['S', '%'], ['#', 'S'], ['@', '#']];
    var SNOW = ['.', '·', '.', "'", ','];
    // Rosa → malva, com um branco quente para o núcleo.
    var HUE_A = [228, 118, 158];
    var HUE_B = [158, 128, 226];
    var PALE = [248, 238, 242];

    var instances = [];
    var pointer = { x: -1e5, y: -1e5 };
    var time = 0, last = 0, acc = 0, raf = 0;
    var pulseUntil = 0;
    var styleCache = {};

    function rand(a, b) { return a + Math.random() * (b - a); }
    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function hash(x, y, t) {
        var h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(t, 1103515245);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    }
    // Pulso do sino: fecha rápido, abre devagar.
    function contraction(p) {
        return p < 0.3 ? Math.sin(p / 0.3 * Math.PI / 2) : Math.cos((p - 0.3) / 0.7 * Math.PI / 2);
    }

    /* ---------- presets ---------- */
    var PRESETS = {
        strip: function (W, H) { return { count: Math.max(2, Math.round(H / 300)), R: clamp(W * 0.3, 26, 64), cell: 8 }; },
        letters: function (W, H) { return { count: W < 700 ? 5 : 7, R: clamp(Math.min(W, H) * 0.16, 30, 100), cell: 8 }; },
        banner: function (W, H) { return { count: W < 500 ? 2 : 3, R: clamp(H * 0.2, 26, 70), cell: 8 }; },
        auto: function (W, H) { return { count: clamp(Math.round(W * H / 120000), 2, 6), R: clamp(Math.min(W, H) * 0.12, 26, 80), cell: 9 }; }
    };

    /* ---------- criaturas ---------- */
    function makeJelly(o, x, y) {
        var z = Math.random();
        var R = o.R * (0.7 + 0.45 * z) * rand(0.9, 1.1);
        var j = {
            x: x, y: y, z: z, R: R, vx: 0, vy: 0,
            ang: rand(-0.35, 0.35), phase: Math.random(), rate: rand(0.8, 1.2),
            mix: Math.random(), wander: Math.random() * 100, c: 0, tents: []
        };
        var i, nT = 7;
        for (i = 0; i < nT; i++) {
            j.tents.push({ u: -0.86 + 1.72 * i / (nT - 1), n: 14, seg: 0.26, w0: 0.07, w1: 0.02, sw: rand(0.6, 1.3), seed: rand(0, 6.28), arm: false, pts: [] });
        }
        // Braços orais: mais grossos, mais curtos, no centro.
        for (i = 0; i < 3; i++) {
            j.tents.push({ u: -0.22 + 0.22 * i, n: 9, seg: 0.24, w0: 0.16, w1: 0.05, sw: rand(1, 1.5), seed: rand(0, 6.28), arm: true, pts: [] });
        }
        resetTentacles(j);
        return j;
    }

    function dir(j) { return { x: Math.sin(j.ang), y: -Math.cos(j.ang) }; }

    function anchor(j, t, c) {
        var rx = j.R * (1 - 0.18 * c), ry = j.R * 0.78 * (1 + 0.12 * c);
        var lx = t.u * rx * (t.arm ? 1 : 0.96);
        var ly = t.arm ? ry * 0.08 : -ry * 0.02 * (1 - Math.abs(t.u));
        var cs = Math.cos(j.ang), sn = Math.sin(j.ang);
        return { x: j.x + lx * cs - ly * sn, y: j.y + lx * sn + ly * cs };
    }

    function resetTentacles(j) {
        var h = dir(j);
        j.tents.forEach(function (t) {
            var a = anchor(j, t, 0);
            t.pts = [];
            for (var k = 0; k < t.n; k++) {
                var x = a.x - h.x * k * t.seg * j.R, y = a.y - h.y * k * t.seg * j.R;
                t.pts.push({ x: x, y: y, px: x, py: y });
            }
        });
    }

    function shift(j, dx, dy) {
        j.x += dx; j.y += dy;
        j.tents.forEach(function (t) { t.pts.forEach(function (q) { q.x += dx; q.px += dx; q.y += dy; q.py += dy; }); });
    }

    function respawn(o, j) {
        shift(j, o.W * rand(0.1, 0.9) - j.x, o.H + j.R * rand(1.4, 2.4) - j.y);
        j.vx = 0; j.vy = 0; j.ang = rand(-0.3, 0.3); j.mix = Math.random();
        resetTentacles(j);
    }

    /* ---------- aquário ---------- */
    function Ocean(host) {
        this.host = host;
        this.preset = PRESETS[host.getAttribute('data-ocean')] || PRESETS.auto;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'ocean__canvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        this.ctx = this.canvas.getContext('2d');
        this.off = document.createElement('canvas');
        this.octx = this.off.getContext('2d', { willReadFrequently: true });
        host.insertBefore(this.canvas, host.firstChild);
        this.W = 0; this.H = 0; this.jellies = []; this.snow = [];
        this.visible = false; this.rect = null;
        var self = this;
        new ResizeObserver(function () { self.resize(); }).observe(host);
        new IntersectionObserver(function (es) {
            self.visible = es[0].isIntersecting;
            sync();
        }, { rootMargin: '80px' }).observe(host);
        this.resize();
    }

    Ocean.prototype.resize = function () {
        var r = this.host.getBoundingClientRect();
        var W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
        if (W === this.W && H === this.H) return;
        var first = !this.W;
        this.W = W; this.H = H;
        var p = this.preset(W, H);
        this.R = p.R;
        this.dpr = Math.min(2, window.devicePixelRatio || 1);
        this.cw = p.cell; this.ch = Math.round(p.cell * 1.5); this.fs = Math.round(this.ch * 0.74);
        this.cols = Math.ceil(W / this.cw); this.rows = Math.ceil(H / this.ch);
        this.canvas.width = Math.round(W * this.dpr); this.canvas.height = Math.round(H * this.dpr);
        this.off.width = this.cols * SS; this.off.height = this.rows * SS;

        if (first) {
            this.jellies = [];
            for (var i = 0; i < p.count; i++) {
                // Espalha na vertical para não nascerem todas juntas.
                var x = W * (0.15 + 0.7 * ((i * 0.618) % 1)), y = H * ((i + 0.5) / p.count);
                this.jellies.push(makeJelly(this, x, y));
            }
            this.jellies.sort(function (a, b) { return a.z - b.z; });
            for (var s = 0; s < 160; s++) this.step(1 / 60, s / 60);
        } else {
            while (this.jellies.length > p.count) this.jellies.pop();
            while (this.jellies.length < p.count) { var j = makeJelly(this, W / 2, H); respawn(this, j); this.jellies.push(j); }
        }
        this.seedSnow();
        this.render();
    };

    Ocean.prototype.seedSnow = function () {
        this.snow = [];
        var n = Math.round(this.cols * this.rows / 70);
        for (var i = 0; i < n; i++) {
            this.snow.push({
                x: Math.random() * this.W, y: Math.random() * this.H,
                vy: rand(2, 7), seed: rand(0, 6.28),
                g: SNOW[(Math.random() * SNOW.length) | 0],
                a: rand(0.12, 0.38)
            });
        }
    };

    Ocean.prototype.step = function (dt, t) {
        var W = this.W, H = this.H, self = this;
        var tempo = t < pulseUntil ? 1.9 : 1;
        var px = -1e5, py = -1e5;
        if (this.rect) { px = pointer.x - this.rect.left; py = pointer.y - this.rect.top; }

        this.jellies.forEach(function (j) {
            j.phase += dt * j.rate / 2.8 * tempo;
            if (j.phase >= 1) j.phase -= 1;
            var c = contraction(j.phase), dc = c - j.c;
            j.c = c;
            var h = dir(j);
            if (dc > 0) {
                var thrust = j.R * 1.05 * (0.6 + 0.4 * j.z) * Math.sqrt(tempo);
                j.vx += h.x * dc * thrust; j.vy += h.y * dc * thrust;
            }
            var drag = Math.exp(-dt * 1.2);
            j.vx *= drag; j.vy *= drag;
            j.vx += Math.sin(t * 0.08 + j.wander) * 1.4 * dt;
            j.vy += 2.2 * dt; // afunda devagar entre pulsos

            // O cursor afasta de leve (sem ondas, sem clique).
            var dx = j.x - px, dy = j.y - py, d = Math.hypot(dx, dy) || 1;
            if (d < j.R * 2.6) {
                var push = (1 - d / (j.R * 2.6)) * 40 * dt;
                j.vx += dx / d * push; j.vy += dy / d * push;
            }

            var want = Math.sin(t * 0.1 + j.wander) * 0.45;
            j.ang += (want - j.ang) * Math.min(1, dt * 0.35);
            j.x += j.vx * dt; j.y += j.vy * dt;

            if (j.y < -j.R * 4.2) respawn(self, j);
            else if (j.y > H + j.R * 7) shift(j, 0, -(H + j.R * 9));
            if (j.x < -j.R * 2.5) shift(j, W + j.R * 4, 0);
            else if (j.x > W + j.R * 2.5) shift(j, -W - j.R * 4, 0);

            // Tentáculos: correntes que seguem o sino com inércia.
            var cs = Math.cos(j.ang), sn = Math.sin(j.ang);
            var trail = 0.4 + 0.25 * (1 - c);
            var sway = t * 1.4 * tempo;
            j.tents.forEach(function (tn) {
                var p = tn.pts, a = anchor(j, tn, c), seg = tn.seg * j.R;
                p[0].x = a.x; p[0].y = a.y; p[0].px = a.x; p[0].py = a.y;
                var flare = tn.arm ? 0 : tn.u * c * 0.7;
                for (var k = 1; k < p.length; k++) {
                    var q = p[k], pr = p[k - 1], f = k / p.length;
                    var vx = (q.x - q.px) * 0.86, vy = (q.y - q.py) * 0.86;
                    q.px = q.x; q.py = q.y;
                    var s = Math.sin(sway - k * 0.45 + tn.seed) * tn.sw * (0.25 + f) * 0.55 + flare * (1 - f);
                    q.x += vx - h.x * trail + cs * s;
                    q.y += vy - h.y * trail + sn * s;
                    var ex = q.x - px, ey = q.y - py, ed = ex * ex + ey * ey;
                    if (ed < 8100) { var e = Math.sqrt(ed) || 1, pu = (1 - e / 90) * 2.2; q.x += ex / e * pu; q.y += ey / e * pu; }
                    var ddx = q.x - pr.x, ddy = q.y - pr.y, dd = Math.hypot(ddx, ddy) || 1;
                    q.x = pr.x + ddx / dd * seg; q.y = pr.y + ddy / dd * seg;
                }
            });
        });

        this.snow.forEach(function (s) {
            s.y += s.vy * dt;
            s.x += Math.sin(t * 0.3 + s.seed) * 2 * dt;
            if (s.y > H + 10) { s.y = -10; s.x = Math.random() * W; }
        });
    };

    /* ---------- campo de luz ---------- */
    // Canais: R = rosa, B = malva, G = núcleo claro. Aditivo.
    function col(m, k, w) {
        return 'rgb(' + (Math.min(255, (1 - m) * k * 255) | 0) + ',' + (Math.min(255, w * 255) | 0) + ',' + (Math.min(255, m * k * 255) | 0) + ')';
    }

    Ocean.prototype.drawField = function (t) {
        var o = this.octx;
        o.setTransform(1, 0, 0, 1, 0, 0);
        o.globalCompositeOperation = 'source-over';
        o.fillStyle = '#000';
        o.fillRect(0, 0, this.off.width, this.off.height);
        o.setTransform(SS / this.cw, 0, 0, SS / this.ch, 0, 0);
        o.globalCompositeOperation = 'lighter';
        o.lineCap = 'round';
        o.lineJoin = 'round';
        var gain = t < pulseUntil ? 1.25 : 1;

        this.jellies.forEach(function (j) {
            var k = gain * (0.55 + 0.5 * j.z), m = j.mix;

            j.tents.forEach(function (tn) {
                var p = tn.pts, n = p.length;
                for (var s = 0; s < n - 1; s += 3) {
                    var f = s / (n - 1);
                    o.lineWidth = lerp(tn.w0, tn.w1, f) * j.R;
                    o.strokeStyle = col(m, k * (tn.arm ? 0.52 : 0.46) * (1 - f * 0.8), tn.arm ? 0.12 * k : 0);
                    o.beginPath();
                    o.moveTo(p[s].x, p[s].y);
                    for (var q = s + 1; q <= Math.min(n - 1, s + 3); q++) o.lineTo(p[q].x, p[q].y);
                    o.stroke();
                }
            });

            var c = j.c, rx = j.R * (1 - 0.18 * c), ry = j.R * 0.78 * (1 + 0.12 * c);
            o.save();
            o.translate(j.x, j.y);
            o.rotate(j.ang);

            // Sino
            o.beginPath();
            o.moveTo(-rx, 0);
            o.bezierCurveTo(-rx, -ry * 0.62, -rx * 0.55, -ry, 0, -ry);
            o.bezierCurveTo(rx * 0.55, -ry, rx, -ry * 0.62, rx, 0);
            o.quadraticCurveTo(0, -ry * 0.24, -rx, 0);
            o.closePath();
            var g = o.createRadialGradient(0, -ry * 0.45, rx * 0.08, 0, -ry * 0.3, rx * 1.05);
            g.addColorStop(0, col(m, k * 0.3, 0.16 * k));
            g.addColorStop(0.65, col(m, k * 0.4, 0.03 * k));
            g.addColorStop(1, col(m, k * 0.64, 0.08 * k));
            o.fillStyle = g;
            o.fill();
            o.lineWidth = Math.max(4, j.R * 0.08);
            o.strokeStyle = col(m, k * 0.55, 0.2 * k);
            o.stroke();

            // Listras radiais (como uma água-viva-bússola)
            o.lineWidth = Math.max(2.5, j.R * 0.04);
            o.strokeStyle = col(m, k * 0.16, 0.42 * k);
            for (var i = -3; i <= 3; i++) {
                var u = i / 3.4;
                o.beginPath();
                o.moveTo(u * rx * 0.18, -ry * 0.9);
                o.quadraticCurveTo(u * rx * 0.7, -ry * 0.55, u * rx * 0.92, -ry * 0.06);
                o.stroke();
            }
            // Bordinha recortada
            o.fillStyle = col(m, k * 0.4, 0.34 * k);
            for (i = 0; i <= 8; i++) {
                var v = -0.95 + 1.9 * i / 8;
                o.beginPath();
                o.arc(v * rx, -ry * 0.03 * (1 - Math.abs(v)), Math.max(2.2, j.R * 0.034), 0, Math.PI * 2);
                o.fill();
            }
            o.restore();
        });
    };

    /* ---------- grade de caracteres ---------- */
    function style(tb, lv, wb) {
        var key = (tb * 12 + lv) * 3 + wb;
        if (styleCache[key]) return styleCache[key];
        var t = tb / 5, L = (lv + 0.5) / 12, w = [0, 0.32, 0.64][wb];
        var base = [0, 1, 2].map(function (i) { return lerp(HUE_A[i], HUE_B[i], t); });
        var hot = lv >= 10 && wb > 0;
        var tile = base.map(function (v, i) { return lerp(v * 0.55, PALE[i], hot ? 0.5 + w * 0.3 : 0) | 0; });
        var mixW = clamp(0.1 + L * 0.5 + w * 0.34, 0, 0.94);
        var glyph = hot ? [20, 16, 22] : base.map(function (v, i) { return lerp(v, PALE[i], mixW) | 0; });
        var s = {
            tile: 'rgba(' + tile.join(',') + ',' + (hot ? 0.9 : 0.08 + L * 0.5).toFixed(3) + ')',
            glyph: hot ? 'rgb(' + glyph.join(',') + ')' : 'rgba(' + glyph.join(',') + ',' + (0.4 + L * 0.6).toFixed(3) + ')'
        };
        styleCache[key] = s;
        return s;
    }

    Ocean.prototype.render = function () {
        if (!this.W) return;
        this.drawField(time);
        var d = this.octx.getImageData(0, 0, this.off.width, this.off.height).data;
        var ctx = this.ctx, cw = this.cw, ch = this.ch, ow = this.off.width, row = ow * 4;
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.clearRect(0, 0, this.W, this.H);
        ctx.font = '500 ' + this.fs + 'px ' + FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var tx = cw / 2, ty = ch / 2 + 0.5;

        this.snow.forEach(function (s) {
            ctx.fillStyle = 'rgba(190,176,196,' + s.a + ')';
            ctx.fillText(s.g, Math.floor(s.x / cw) * cw + tx, Math.floor(s.y / ch) * ch + ty);
        });

        for (var cy = 0; cy < this.rows; cy++) {
            for (var cx = 0; cx < this.cols; cx++) {
                var i = (cy * SS * ow + cx * SS) * 4;
                var a = (d[i] + d[i + 4] + d[i + row] + d[i + row + 4]) / 1020;
                var w = (d[i + 1] + d[i + 5] + d[i + row + 1] + d[i + row + 5]) / 1020;
                var b = (d[i + 2] + d[i + 6] + d[i + row + 2] + d[i + row + 6]) / 1020;
                var L = Math.min(1, a + b + w * 0.55);
                if (L < 0.055) continue;
                var tb = Math.round(b / (a + b + 1e-4) * 5);
                var lv = Math.min(11, (L * 12) | 0);
                var wb = w < 0.12 ? 0 : w < 0.32 ? 1 : 2;
                var st = style(tb, lv, wb);
                var x = cx * cw, y = cy * ch;
                if (lv >= 1) { ctx.fillStyle = st.tile; ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2); }
                var h = hash(cx, cy, Math.floor(time * 1.4 + ((cx * 7 + cy * 13) & 15) / 16));
                ctx.fillStyle = st.glyph;
                ctx.fillText(RAMP[lv][h < 0.55 ? 0 : 1], x + tx, y + ty);
            }
        }
    };

    /* ---------- laço único ---------- */
    function loop(now) {
        raf = requestAnimationFrame(loop);
        if (!last) { last = now; return; }
        var dt = (now - last) / 1000;
        last = now;
        acc += Math.min(dt, 0.1);
        if (acc < 1 / 30) return;
        var n = Math.max(1, Math.min(4, Math.round(acc * 60))), h = acc / n;
        instances.forEach(function (o) {
            if (!o.visible) return;
            o.rect = o.host.getBoundingClientRect();
        });
        for (var i = 0; i < n; i++) {
            time += h;
            for (var k = 0; k < instances.length; k++) if (instances[k].visible) instances[k].step(h, time);
        }
        acc = 0;
        instances.forEach(function (o) { if (o.visible) o.render(); });
    }

    function sync() {
        var any = instances.some(function (o) { return o.visible; });
        var should = on && !reduceMotion && !document.hidden && any;
        if (should && !raf) { last = 0; raf = requestAnimationFrame(loop); }
        else if (!should && raf) { cancelAnimationFrame(raf); raf = 0; }
        root.setAttribute('data-fx', on ? 'on' : 'off');
    }

    /* ---------- interface ---------- */
    function label(btn) {
        var lang = (window.kf && window.kf.lang && window.kf.lang()) || 'pt-BR';
        var name = lang === 'en' ? 'jellyfish' : lang === 'es' ? 'medusas' : 'águas-vivas';
        btn.querySelector('.fx-toggle__label').textContent = name + ': ' + (on ? 'on' : 'off');
        btn.setAttribute('aria-pressed', String(on));
    }

    var api = {
        isOn: function () { return on; },
        toggle: function (v) {
            on = typeof v === 'boolean' ? v : !on;
            try { localStorage.setItem(STORE, on ? 'on' : 'off'); } catch (e) { }
            sync();
            document.dispatchEvent(new CustomEvent('fxchange', { detail: { on: on } }));
            return on;
        },
        // Todas pulsam mais rápido e brilham um pouco (usado ao digitar no prompt).
        pulse: function (sec) {
            pulseUntil = Math.max(pulseUntil, time + (sec || 1.4));
            if (!raf) instances.forEach(function (o) { o.render(); });
        }
    };
    window.kfFx = api;

    function boot() {
        // Banner das páginas internas ganha um aquário sem precisar mexer no HTML.
        document.querySelectorAll('.page-head').forEach(function (ph) {
            if (ph.querySelector('[data-ocean]')) return;
            var d = document.createElement('div');
            d.className = 'ocean ocean--banner';
            d.setAttribute('data-ocean', 'banner');
            d.setAttribute('aria-hidden', 'true');
            ph.appendChild(d);
        });

        document.querySelectorAll('[data-ocean]').forEach(function (h) { instances.push(new Ocean(h)); });

        window.addEventListener('pointermove', function (e) {
            if (e.pointerType === 'touch') return;
            pointer.x = e.clientX; pointer.y = e.clientY;
        }, { passive: true });
        document.documentElement.addEventListener('pointerleave', function () { pointer.x = -1e5; pointer.y = -1e5; });
        document.addEventListener('visibilitychange', sync);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fx-toggle';
        btn.innerHTML = '<span class="fx-toggle__dot" aria-hidden="true"></span><span class="fx-toggle__label"></span>';
        btn.addEventListener('click', function () { api.toggle(); });
        document.body.appendChild(btn);
        label(btn);
        document.addEventListener('langchange', function () { label(btn); });
        document.addEventListener('fxchange', function () { label(btn); });

        sync();
        if (document.fonts && document.fonts.load) {
            document.fonts.load('500 11px "Geist Mono"').then(function () {
                instances.forEach(function (o) { o.render(); });
            }).catch(function () { });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
