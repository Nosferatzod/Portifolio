/* ============================================================
   terminal.js — prompt de comandos do portfólio
   1) Barra inline no hero (se existir [data-term]).
   2) Paleta global: Ctrl/⌘ + K  ou  "/"  em qualquer página.
   Comandos navegam, trocam tema/idioma e conversam com as águas-vivas.
   ============================================================ */
(function () {
    'use strict';

    var root = document.documentElement;
    var LINKS = {
        github: 'https://github.com/Nosferatzod',
        linkedin: 'https://www.linkedin.com/in/kaua-francino-85b154183/',
        email: 'mailto:kauafrancino@gmail.com'
    };

    /* ---------- textos ---------- */
    var TXT = {
        'pt-BR': {
            ph: 'digite um comando… experimente /help',
            phPalette: 'Buscar comando…',
            hint: '↵ executar · ctrl k paleta',
            notFound: 'comando não encontrado: ',
            tryHelp: ' — digite /help',
            going: 'abrindo ',
            empty: 'nenhum comando encontrado',
            greet: ['Boa madrugada', 'Bom dia', 'Boa tarde', 'Boa noite'],
            visitor: 'visitante',
            cmds: {
                help: 'listar comandos',
                projetos: 'ver projetos',
                sobre: 'trajetória e formação',
                contato: 'falar comigo',
                stack: 'tecnologias que uso',
                tema: 'alternar claro/escuro',
                idioma: 'idioma: pt · en · es',
                aguasvivas: 'ligar/desligar águas-vivas',
                pulso: 'fazer as águas-vivas pulsarem',
                github: 'abrir GitHub',
                linkedin: 'abrir LinkedIn',
                email: 'enviar e-mail',
                whoami: 'quem sou eu',
                clear: 'limpar saída'
            },
            out: {
                help: 'comandos: ',
                theme: 'tema → ',
                fxOn: 'águas-vivas soltas ✦',
                fxOff: 'águas-vivas pausadas',
                swarm: 'as águas-vivas pulsaram ✦',
                whoami: 'kauã francino · full stack · vue, react, react native, java · brasil/remoto',
                lang: 'idioma → '
            }
        },
        en: {
            ph: 'type a command… try /help',
            phPalette: 'Search commands…',
            hint: '↵ run · ctrl k palette',
            notFound: 'command not found: ',
            tryHelp: ' — type /help',
            going: 'opening ',
            empty: 'no matching command',
            greet: ['Up late', 'Good morning', 'Good afternoon', 'Good evening'],
            visitor: 'visitor',
            cmds: {
                help: 'list commands',
                projetos: 'see projects',
                sobre: 'background & education',
                contato: 'get in touch',
                stack: 'tools I use',
                tema: 'toggle light/dark',
                idioma: 'language: pt · en · es',
                aguasvivas: 'toggle jellyfish',
                pulso: 'make the jellyfish pulse',
                github: 'open GitHub',
                linkedin: 'open LinkedIn',
                email: 'send an email',
                whoami: 'who am I',
                clear: 'clear output'
            },
            out: {
                help: 'commands: ',
                theme: 'theme → ',
                fxOn: 'jellyfish released ✦',
                fxOff: 'jellyfish paused',
                swarm: 'the jellyfish pulsed ✦',
                whoami: 'kauã francino · full stack · vue, react, react native, java · brazil/remote',
                lang: 'language → '
            }
        },
        es: {
            ph: 'escribe un comando… prueba /help',
            phPalette: 'Buscar comando…',
            hint: '↵ ejecutar · ctrl k paleta',
            notFound: 'comando no encontrado: ',
            tryHelp: ' — escribe /help',
            going: 'abriendo ',
            empty: 'ningún comando encontrado',
            greet: ['Buenas noches', 'Buenos días', 'Buenas tardes', 'Buenas noches'],
            visitor: 'visitante',
            cmds: {
                help: 'listar comandos',
                projetos: 'ver proyectos',
                sobre: 'trayectoria y formación',
                contato: 'contactarme',
                stack: 'tecnologías que uso',
                tema: 'alternar claro/oscuro',
                idioma: 'idioma: pt · en · es',
                aguasvivas: 'medusas on/off',
                pulso: 'hacer pulsar las medusas',
                github: 'abrir GitHub',
                linkedin: 'abrir LinkedIn',
                email: 'enviar e-mail',
                whoami: 'quién soy',
                clear: 'limpiar salida'
            },
            out: {
                help: 'comandos: ',
                theme: 'tema → ',
                fxOn: 'medusas sueltas ✦',
                fxOff: 'medusas en pausa',
                swarm: 'las medusas pulsaron ✦',
                whoami: 'kauã francino · full stack · vue, react, react native, java · brasil/remoto',
                lang: 'idioma → '
            }
        }
    };

    function lang() { return (window.kf && window.kf.lang && window.kf.lang()) || 'pt-BR'; }
    function T() { return TXT[lang()] || TXT['pt-BR']; }

    // Aliases em pt/en/es → id do comando.
    var ALIASES = {
        help: ['help', 'ajuda', 'ayuda', '?', 'ls'],
        projetos: ['projetos', 'projects', 'proyectos', 'work'],
        sobre: ['sobre', 'about', 'acerca'],
        contato: ['contato', 'contact', 'contacto'],
        stack: ['stack', 'tech', 'skills'],
        tema: ['tema', 'theme'],
        idioma: ['idioma', 'lang', 'language'],
        aguasvivas: ['aguasvivas', 'aguas-vivas', 'águas-vivas', 'jellyfish', 'medusas', 'fx'],
        pulso: ['pulso', 'pulse', 'pulsar'],
        github: ['github', 'gh'],
        linkedin: ['linkedin', 'in'],
        email: ['email', 'e-mail', 'mail'],
        whoami: ['whoami', 'quem', 'who'],
        clear: ['clear', 'cls', 'limpar']
    };
    var ORDER = ['projetos', 'sobre', 'stack', 'contato', 'tema', 'idioma', 'aguasvivas', 'pulso', 'github', 'linkedin', 'email', 'whoami', 'help', 'clear'];

    function resolve(word) {
        word = word.toLowerCase();
        for (var id in ALIASES) if (ALIASES[id].indexOf(word) !== -1) return id;
        return null;
    }

    function go(url, newTab) {
        if (newTab) window.open(url, '_blank', 'noopener');
        else window.location.href = url;
    }

    function setTheme(next) {
        // Reaproveita o botão do header (mantém meta theme-color e localStorage em sincronia).
        var btn = document.querySelector('[data-theme-toggle]');
        var cur = root.getAttribute('data-theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (next && next === cur) return cur;
        if (btn) btn.click();
        return root.getAttribute('data-theme');
    }

    function setLang(code) {
        var map = { pt: 'pt-BR', 'pt-br': 'pt-BR', br: 'pt-BR', en: 'en', es: 'es' };
        var c = map[(code || '').toLowerCase()];
        if (!c) {
            var cycle = ['pt-BR', 'en', 'es'];
            c = cycle[(cycle.indexOf(lang()) + 1) % cycle.length];
        }
        var opt = document.querySelector('.lang__opt[data-lang="' + c + '"]');
        if (opt) opt.click();
        else {
            var sel = document.querySelector('[data-lang-select]');
            if (sel) { sel.value = c; sel.dispatchEvent(new Event('change')); }
        }
        return c;
    }

    /* Executa e devolve a linha de saída (string) — ou '' para nada. */
    function run(input, fromEl) {
        var raw = String(input || '').trim();
        if (!raw) return '';
        var parts = raw.replace(/^\//, '').split(/\s+/);
        var id = resolve(parts[0]);
        var arg = parts[1];
        var t = T();

        switch (id) {
            case 'help':
                return t.out.help + ORDER.map(function (c) { return '/' + c; }).join('  ');
            case 'projetos': go('./projects.html'); return t.going + '/projetos…';
            case 'sobre': go('./about.html'); return t.going + '/sobre…';
            case 'contato': go('./contact.html'); return t.going + '/contato…';
            case 'stack':
                var st = document.querySelector('.stack');
                if (st) { st.scrollIntoView({ behavior: 'smooth', block: 'center' }); return 'html · css · js · vue · react · react native · java · php · python · mysql · git'; }
                go('./index.html#stack'); return t.going + '/stack…';
            case 'tema': return t.out.theme + setTheme(arg);
            case 'idioma': return T().out.lang + setLang(arg); // T() de novo: idioma já trocou
            case 'aguasvivas':
                if (!window.kfFx) return '';
                var v = arg === 'on' ? true : arg === 'off' ? false : undefined;
                return window.kfFx.toggle(v) ? t.out.fxOn : t.out.fxOff;
            case 'pulso':
                if (window.kfFx) {
                    if (!window.kfFx.isOn()) window.kfFx.toggle(true);
                    window.kfFx.pulse(2.4);
                }
                return t.out.swarm;
            case 'github': go(LINKS.github, true); return t.going + 'github…';
            case 'linkedin': go(LINKS.linkedin, true); return t.going + 'linkedin…';
            case 'email': go(LINKS.email); return t.going + 'e-mail…';
            case 'whoami': return t.out.whoami;
            case 'clear': return '';
            default:
                return t.notFound + parts[0] + t.tryHelp;
        }
    }

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

    /* ---------- barra inline (hero) ---------- */
    function initInline() {
        var form = document.querySelector('[data-term]');
        if (!form) return;
        var input = form.querySelector('.prompt__input');
        var out = form.parentNode.querySelector('.prompt__out');
        var hint = form.querySelector('.prompt__hint');
        var greet = document.querySelector('[data-greet]');
        var history = [], hIdx = -1;

        function texts() {
            input.setAttribute('placeholder', T().ph);
            if (hint) hint.textContent = T().hint;
            if (greet) {
                var h = new Date().getHours();
                var i = h < 5 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3;
                greet.textContent = T().greet[i] + ', ' + T().visitor;
            }
        }
        texts();
        document.addEventListener('langchange', texts);

        // Digitar faz as águas-vivas pulsarem mais rápido.
        input.addEventListener('input', function () {
            if (window.kfFx) window.kfFx.pulse(1.2);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowUp' && history.length) {
                e.preventDefault();
                hIdx = Math.min(history.length - 1, hIdx + 1);
                input.value = history[hIdx];
            } else if (e.key === 'ArrowDown' && history.length) {
                e.preventDefault();
                hIdx = Math.max(-1, hIdx - 1);
                input.value = hIdx < 0 ? '' : history[hIdx];
            }
        });

        function exec(value) {
            history.unshift(value); hIdx = -1;
            var line = run(value, form);
            if (out) {
                out.innerHTML = line ? '<span class="prompt__caret">›</span> ' + esc(line) : '';
                out.classList.toggle('is-error', line.indexOf(T().notFound) === 0);
            }
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var v = input.value.trim();
            if (!v) { input.focus(); return; }
            exec(v);
            input.value = '';
        });

        document.querySelectorAll('[data-cmd]').forEach(function (chip) {
            chip.addEventListener('click', function () {
                exec(chip.getAttribute('data-cmd'));
            });
        });
    }

    /* ---------- paleta global ---------- */
    function initPalette() {
        var wrap = document.createElement('div');
        wrap.className = 'palette';
        wrap.hidden = true;
        wrap.innerHTML =
            '<div class="palette__scrim" data-close></div>' +
            '<div class="palette__box" role="dialog" aria-modal="true" aria-label="Command palette">' +
            '<div class="palette__head"><span class="palette__sigil" aria-hidden="true">/</span>' +
            '<input class="palette__input" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="paletteList">' +
            '<kbd class="palette__kbd">esc</kbd></div>' +
            '<ul class="palette__list" id="paletteList" role="listbox"></ul>' +
            '<p class="palette__out" aria-live="polite"></p>' +
            '</div>';
        document.body.appendChild(wrap);

        var input = wrap.querySelector('.palette__input');
        var list = wrap.querySelector('.palette__list');
        var out = wrap.querySelector('.palette__out');
        var items = [], sel = 0, lastFocus = null;

        function draw() {
            var q = input.value.trim().replace(/^\//, '').toLowerCase();
            var head = q.split(/\s+/)[0];
            var t = T();
            items = ORDER.filter(function (id) {
                if (!head) return true;
                return ALIASES[id].some(function (a) { return a.indexOf(head) === 0; }) ||
                    t.cmds[id].toLowerCase().indexOf(q) !== -1;
            });
            sel = Math.min(sel, Math.max(0, items.length - 1));
            list.innerHTML = items.length ? items.map(function (id, i) {
                return '<li role="option" class="palette__item' + (i === sel ? ' is-sel' : '') + '" aria-selected="' + (i === sel) +
                    '" data-id="' + id + '"><span class="palette__cmd">/' + id + '</span><span class="palette__desc">' +
                    esc(t.cmds[id]) + '</span></li>';
            }).join('') : '<li class="palette__empty">' + esc(t.empty) + '</li>';
        }

        function open() {
            lastFocus = document.activeElement;
            wrap.hidden = false;
            input.value = ''; out.textContent = ''; sel = 0;
            input.setAttribute('placeholder', T().phPalette);
            draw();
            requestAnimationFrame(function () { wrap.classList.add('is-open'); input.focus(); });
            document.body.classList.add('no-scroll');
        }
        function close() {
            wrap.classList.remove('is-open');
            document.body.classList.remove('no-scroll');
            setTimeout(function () { wrap.hidden = true; }, 180);
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        function exec(id) {
            var q = input.value.trim().replace(/^\//, '').split(/\s+/);
            var arg = resolve(q[0]) === id ? (q[1] || '') : '';
            var line = run('/' + id + (arg ? ' ' + arg : ''), wrap.querySelector('.palette__box'));
            out.textContent = line;
            if (id === 'clear') out.textContent = '';
        }

        input.addEventListener('input', function () { sel = 0; draw(); });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, items.length); draw(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + items.length) % Math.max(1, items.length); draw(); }
            else if (e.key === 'Enter') {
                e.preventDefault();
                if (items[sel]) exec(items[sel]);
                else out.textContent = run(input.value, null);
            }
        });
        list.addEventListener('click', function (e) {
            var li = e.target.closest('.palette__item');
            if (li) exec(li.getAttribute('data-id'));
        });
        wrap.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) close(); });

        document.addEventListener('keydown', function (e) {
            var k = e.key.toLowerCase();
            var typing = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
            if ((e.ctrlKey || e.metaKey) && k === 'k') {
                e.preventDefault();
                if (wrap.hidden) open(); else close();
            } else if (k === '/' && !typing && wrap.hidden) {
                e.preventDefault(); open();
            } else if (k === 'escape' && !wrap.hidden) {
                close();
            }
        });
        document.addEventListener('langchange', function () { if (!wrap.hidden) draw(); });

        // Atalho visível no header de todas as páginas.
        var actions = document.querySelector('.header__actions');
        if (actions && !actions.querySelector('[data-palette-open]')) {
            var kb = document.createElement('button');
            kb.type = 'button';
            kb.className = 'kbd-btn';
            kb.setAttribute('data-palette-open', '');
            kb.setAttribute('aria-label', 'Command palette (Ctrl+K)');
            kb.innerHTML = '<span aria-hidden="true">' + (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'ctrl') + '</span><span aria-hidden="true">K</span>';
            actions.insertBefore(kb, actions.firstChild);
        }

        document.querySelectorAll('[data-palette-open]').forEach(function (b) {
            b.addEventListener('click', open);
        });
    }

    function boot() { initInline(); initPalette(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
