/* ============================================================
   main.js — tema, idioma, navegação, animações
   Sem dependências. Tudo passivo, rAF ou IntersectionObserver.
   ============================================================ */
(function () {
    'use strict';

    var root = document.documentElement;
    var STORE_THEME = 'kf-theme';
    var STORE_LANG = 'kf-lang';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;

    /* ---------------- Tema ---------------- */
    // O tema inicial já foi aplicado pelo script inline no <head> (evita flash).
    function currentTheme() {
        return root.getAttribute('data-theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        try { localStorage.setItem(STORE_THEME, theme); } catch (e) { }
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0b0d' : '#fbfaf9');
    }

    function initTheme() {
        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
            });
        });
    }

    /* ---------------- Idioma ---------------- */
    var DICT = window.I18N || {};
    var LANGS = window.I18N_LANGS || [];
    var lang = 'pt-BR';

    function detectLang() {
        var saved;
        try { saved = localStorage.getItem(STORE_LANG); } catch (e) { }
        if (saved && DICT[saved]) return saved;
        var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'pt-BR';
        nav = nav.toLowerCase();
        if (nav.indexOf('pt') === 0) return 'pt-BR';
        if (nav.indexOf('es') === 0) return 'es';
        if (nav.indexOf('en') === 0) return 'en';
        return 'pt-BR';
    }

    function lookup(code, path) {
        var parts = path.split('.');
        var node = DICT[code];
        for (var i = 0; i < parts.length && node != null; i++) node = node[parts[i]];
        return node;
    }

    // Cai para pt-BR se a chave não existir no idioma atual.
    function t(path) {
        var v = lookup(lang, path);
        if (v == null) v = lookup('pt-BR', path);
        return v == null ? '' : v;
    }

    function applyLang(code) {
        lang = DICT[code] ? code : 'pt-BR';
        root.setAttribute('lang', lang);
        try { localStorage.setItem(STORE_LANG, lang); } catch (e) { }

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var v = t(el.getAttribute('data-i18n'));
            if (v) el.textContent = v;
        });
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var v = t(el.getAttribute('data-i18n-html'));
            if (v) el.innerHTML = v;
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
            var v = t(el.getAttribute('data-i18n-ph'));
            if (v) el.setAttribute('placeholder', v);
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            var v = t(el.getAttribute('data-i18n-aria'));
            if (v) el.setAttribute('aria-label', v);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            var v = t(el.getAttribute('data-i18n-title'));
            if (v) {
                if (el.tagName === 'TITLE') el.textContent = v;
                else el.setAttribute('title', v);
            }
        });
        document.querySelectorAll('[data-i18n-content]').forEach(function (el) {
            var v = t(el.getAttribute('data-i18n-content'));
            if (v) el.setAttribute('content', v);
        });

        // Botão do seletor mostra o código curto do idioma ativo.
        var active = LANGS.filter(function (l) { return l.code === lang; })[0];
        document.querySelectorAll('[data-lang-current]').forEach(function (el) {
            if (active) el.textContent = active.short;
        });
        document.querySelectorAll('.lang__opt').forEach(function (opt) {
            opt.setAttribute('aria-selected', String(opt.getAttribute('data-lang') === lang));
        });

        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    }

    function initLang() {
        var wrap = document.querySelector('[data-lang]');
        var btn = document.querySelector('.lang__btn');
        var menu = document.querySelector('.lang__menu');

        if (menu) {
            // Monta as opções a partir de I18N_LANGS.
            menu.innerHTML = LANGS.map(function (l) {
                return '<button type="button" class="lang__opt" role="option" data-lang="' + l.code +
                    '" aria-selected="false"><span class="lang__code">' + l.short + '</span>' + l.label + '</button>';
            }).join('');

            menu.addEventListener('click', function (e) {
                var opt = e.target.closest('.lang__opt');
                if (!opt) return;
                applyLang(opt.getAttribute('data-lang'));
                closeMenu();
            });
        }

        function openMenu() {
            if (!menu) return;
            menu.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            document.addEventListener('click', outside, true);
            document.addEventListener('keydown', onEsc);
        }
        function closeMenu() {
            if (!menu) return;
            menu.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', outside, true);
            document.removeEventListener('keydown', onEsc);
        }
        function outside(e) {
            if (wrap && !wrap.contains(e.target)) closeMenu();
        }
        function onEsc(e) {
            if (e.key === 'Escape') { closeMenu(); btn.focus(); }
        }

        if (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (btn.getAttribute('aria-expanded') === 'true') closeMenu();
                else openMenu();
            });
        }

        // Seletor nativo no menu mobile.
        var mobileSelect = document.querySelector('[data-lang-select]');
        if (mobileSelect) {
            mobileSelect.innerHTML = LANGS.map(function (l) {
                return '<option value="' + l.code + '">' + l.label + '</option>';
            }).join('');
            mobileSelect.addEventListener('change', function () { applyLang(this.value); });
            document.addEventListener('langchange', function () { mobileSelect.value = lang; });
        }

        applyLang(detectLang());
    }

    /* ---------------- Header: estado grudado + progresso ---------------- */
    function initHeader() {
        var header = document.querySelector('.header');
        var progress = document.querySelector('.progress');
        if (!header) return;

        var supportsScrollTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
        var ticking = false;

        function update() {
            ticking = false;
            var y = window.scrollY;
            header.classList.toggle('is-stuck', y > 12);
            if (progress && !supportsScrollTimeline) {
                var max = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
            }
        }

        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });

        update();
    }

    /* ---------------- Pílula deslizante da navegação ---------------- */
    function initNavPill() {
        var nav = document.querySelector('.nav');
        if (!nav) return;
        var pill = nav.querySelector('.nav__pill');
        var links = nav.querySelectorAll('.nav__link');
        if (!pill || !links.length) return;

        function moveTo(el) {
            if (!el) return;
            pill.style.width = el.offsetWidth + 'px';
            pill.style.transform = 'translateX(' + el.offsetLeft + 'px)';
            pill.style.opacity = '1';
        }

        var active = nav.querySelector('.nav__link.is-active');
        // Espera as fontes para medir com a largura final do texto.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { moveTo(active); });
        } else {
            moveTo(active);
        }

        links.forEach(function (link) {
            link.addEventListener('mouseenter', function () { moveTo(link); });
        });
        nav.addEventListener('mouseleave', function () { moveTo(active); });
        document.addEventListener('langchange', function () {
            requestAnimationFrame(function () { moveTo(active); });
        });
        window.addEventListener('resize', function () { moveTo(active); }, { passive: true });
    }

    /* ---------------- Menu mobile ---------------- */
    function initMobileMenu() {
        var burger = document.querySelector('.burger');
        var menu = document.querySelector('.mobile-menu');
        if (!burger || !menu) return;

        function close() {
            menu.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll');
        }

        burger.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', String(open));
            document.body.classList.toggle('no-scroll', open);
        });

        menu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', close);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) { close(); burger.focus(); }
        });

        // Fecha ao voltar para o layout desktop.
        var desktop = window.matchMedia('(min-width: 901px)');
        if (desktop.addEventListener) {
            desktop.addEventListener('change', function (e) { if (e.matches) close(); });
        }
    }

    /* ---------------- Revelação no scroll ---------------- */
    function initReveal() {
        var items = document.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target); // dispara uma vez só
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        items.forEach(function (el) {
            // Atraso escalonado entre irmãos, sem JS por frame.
            var stagger = el.getAttribute('data-reveal-delay');
            if (stagger) el.style.setProperty('--reveal-delay', stagger + 'ms');
            io.observe(el);
        });
    }

    /* ---------------- Título do hero: revelação por palavra ---------------- */
    // Roda depois de applyLang (que reescreve o textContent) e a cada troca de idioma.
    function initHeroWords() {
        // data-words="auto" continua o escalonamento de uma linha para a próxima.
        var running = 0;
        document.querySelectorAll('[data-words]').forEach(function (el) {
            var raw = el.getAttribute('data-words');
            var words = el.textContent.trim().split(/\s+/);
            var offset = raw === 'auto' ? running : (parseInt(raw, 10) || 0);
            running = offset + words.length;
            el.innerHTML = words.map(function (w, i) {
                return '<span class="word" style="--i:' + (i + offset) + '"><span>' +
                    w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>';
            }).join(' ');
        });
    }

    /* ---------------- Máquina de escrever das funções ---------------- */
    function initRoles() {
        var el = document.querySelector('[data-roles]');
        if (!el) return;

        var roles = [];
        var idx = 0, char = 0, deleting = false, timer = null;

        function load() {
            var list = t('hero.roles');
            roles = Array.isArray(list) ? list : [String(list)];
            idx = 0; char = 0; deleting = false;
        }

        function tick() {
            var word = roles[idx % roles.length] || '';
            char += deleting ? -1 : 1;
            el.textContent = word.slice(0, char);

            var delay = deleting ? 35 : 65;
            if (!deleting && char === word.length) { delay = 1900; deleting = true; }
            else if (deleting && char === 0) { deleting = false; idx++; delay = 320; }

            timer = setTimeout(tick, delay);
        }

        function start() {
            clearTimeout(timer);
            load();
            if (reduceMotion) { el.textContent = roles[0] || ''; return; }
            tick();
        }

        start();
        document.addEventListener('langchange', start);

        // Não gasta CPU com a aba em segundo plano.
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) clearTimeout(timer);
            else if (!reduceMotion) { clearTimeout(timer); timer = setTimeout(tick, 300); }
        });
    }

    /* ---------------- Cartão de código: ritmo da digitação ---------------- */
    // A animação é 100% CSS (clip-path + transform). Aqui só se mede quantos
    // caracteres cada linha tem para calcular duração, atraso e a posição final
    // do cursor — em fonte monoespaçada, 1ch = 1 caractere, então --n basta.
    // Refaz a conta a cada troca de idioma, porque as linhas mudam de tamanho.
    function initCodeCards() {
        var MS_PER_CHAR = 7;
        var LINE_GAP = 55;

        function measure() {
            document.querySelectorAll('[data-codecard]').forEach(function (card) {
                var delay = 0;
                var end = 0;

                card.querySelectorAll('.cc-line').forEach(function (line) {
                    var txt = line.querySelector('.cc-txt');
                    var chars = txt ? txt.textContent.length : 0;
                    var dur = chars * MS_PER_CHAR;

                    // steps(0) invalidaria a animação inteira; a linha em branco
                    // tem duração zero de qualquer jeito.
                    line.style.setProperty('--n', String(Math.max(chars, 1)));
                    line.style.setProperty('--dur', dur + 'ms');
                    line.style.setProperty('--d', delay + 'ms');

                    end = delay + dur;
                    delay = end + LINE_GAP;
                });

                // Quando a última linha termina — é daí que o cursor passa a piscar.
                card.style.setProperty('--cc-end', end + 'ms');
            });
        }

        measure();
        document.addEventListener('langchange', measure);
    }

    /* ---------------- Halo dos cartões seguindo o cursor ---------------- */
    function initCardHalo() {
        if (!finePointer || reduceMotion) return;
        var cards = document.querySelectorAll('.project');
        if (!cards.length) return;

        var pending = false;
        cards.forEach(function (card) {
            card.addEventListener('pointermove', function (e) {
                if (pending) return;
                pending = true;
                requestAnimationFrame(function () {
                    pending = false;
                    var r = card.getBoundingClientRect();
                    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
                });
            }, { passive: true });
        });
    }

    /* ---------------- Filtros de projeto ---------------- */
    function initFilters() {
        var bar = document.querySelector('[data-filters]');
        if (!bar) return;
        var grid = document.querySelector('.projects');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.project'));
        var empty = document.querySelector('.projects-empty');

        // Contadores por categoria.
        bar.querySelectorAll('.filter').forEach(function (btn) {
            var f = btn.getAttribute('data-filter');
            var n = f === 'all' ? cards.length : cards.filter(function (c) {
                return c.getAttribute('data-category') === f;
            }).length;
            var slot = btn.querySelector('.filter__count');
            if (slot) slot.textContent = n;
        });

        bar.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter');
            if (!btn) return;

            bar.querySelectorAll('.filter').forEach(function (b) {
                b.classList.toggle('is-active', b === btn);
                b.setAttribute('aria-pressed', String(b === btn));
            });

            var filter = btn.getAttribute('data-filter');
            var shown = 0;

            cards.forEach(function (card) {
                var match = filter === 'all' || card.getAttribute('data-category') === filter;
                card.classList.toggle('is-hidden', !match);
                if (match) {
                    shown++;
                    if (!reduceMotion) {
                        // Reinicia a animação de entrada do cartão.
                        card.classList.remove('is-visible');
                        void card.offsetWidth;
                        card.style.setProperty('--reveal-delay', (shown - 1) * 40 + 'ms');
                        card.classList.add('is-visible');
                    }
                }
            });

            if (empty) empty.style.display = shown ? 'none' : 'block';
            if (grid) grid.setAttribute('aria-busy', 'false');
        });
    }

    /* ---------------- Ano atual no rodapé ---------------- */
    function initYear() {
        var y = String(new Date().getFullYear());
        document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = y; });
    }

    /* ---------------- Marquee: duplica o conteúdo para o loop ---------------- */
    // Duas cópias idênticas + translateX(-50%) = loop sem emenda.
    function initMarquee() {
        document.querySelectorAll('.marquee__track').forEach(function (track) {
            track.innerHTML += track.innerHTML;
        });
    }

    /* ---------------- Boot ---------------- */
    function boot() {
        initTheme();
        initLang();
        initHeader();
        initHeroWords();
        document.addEventListener('langchange', initHeroWords);
        initNavPill();
        initMobileMenu();
        initMarquee();
        initCodeCards();   // mede antes de initReveal, que é quem dispara a animação
        initReveal();
        initRoles();
        initCardHalo();
        initFilters();
        initYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // Exposto para js/contact.js reaproveitar as traduções.
    window.kf = { t: function (p) { return t(p); }, lang: function () { return lang; } };
})();
