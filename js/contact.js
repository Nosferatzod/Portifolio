/* ============================================================
   contact.js — validação e envio do formulário (Formspree)
   As mensagens vêm de js/i18n.js via window.kf.t()
   ============================================================ */
(function () {
    'use strict';

    var form = document.getElementById('contactForm');
    if (!form) return;

    var statusEl = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');
    var submitLabel = submitBtn && submitBtn.querySelector('[data-submit-label]');

    function t(key) {
        return (window.kf && window.kf.t) ? window.kf.t(key) : '';
    }

    var RULES = {
        name: { test: function (v) { return v.trim().length >= 3; }, key: 'contactPage.errName' },
        email: { test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, key: 'contactPage.errEmail' },
        subject: { test: function (v) { return v.trim().length >= 5; }, key: 'contactPage.errSubject' },
        message: { test: function (v) { return v.trim().length >= 10; }, key: 'contactPage.errMessage' }
    };

    function wrapper(name) { return form.querySelector('[data-field="' + name + '"]'); }
    function errorEl(name) { return form.querySelector('[data-error="' + name + '"]'); }

    // Guarda a CHAVE do erro (não o texto) para reagir à troca de idioma.
    function setError(name, key) {
        var box = wrapper(name);
        var el = errorEl(name);
        if (!box || !el) return;
        if (key) {
            box.classList.add('is-invalid');
            el.setAttribute('data-error-key', key);
            el.textContent = t(key);
            form.elements[name].setAttribute('aria-invalid', 'true');
        } else {
            box.classList.remove('is-invalid');
            el.removeAttribute('data-error-key');
            el.textContent = '';
            form.elements[name].removeAttribute('aria-invalid');
        }
    }

    function validate(name) {
        var rule = RULES[name];
        var field = form.elements[name];
        if (!rule || !field) return true;
        var ok = rule.test(field.value);
        setError(name, ok ? null : rule.key);
        return ok;
    }

    function showStatus(key, kind) {
        if (!statusEl) return;
        statusEl.setAttribute('data-status-key', key);
        statusEl.textContent = t(key);
        statusEl.className = 'form-status is-shown ' + (kind === 'ok' ? 'is-ok' : 'is-err');
    }

    function clearStatus() {
        if (!statusEl) return;
        statusEl.removeAttribute('data-status-key');
        statusEl.textContent = '';
        statusEl.className = 'form-status';
    }

    // Valida ao sair do campo; limpa o erro assim que o valor fica válido.
    Object.keys(RULES).forEach(function (name) {
        var field = form.elements[name];
        if (!field) return;
        field.addEventListener('blur', function () { validate(name); });
        field.addEventListener('input', function () {
            var box = wrapper(name);
            if (box && box.classList.contains('is-invalid') && RULES[name].test(field.value)) {
                setError(name, null);
            }
        });
    });

    // Retraduz erros e status já visíveis quando o idioma muda.
    document.addEventListener('langchange', function () {
        form.querySelectorAll('[data-error-key]').forEach(function (el) {
            el.textContent = t(el.getAttribute('data-error-key'));
        });
        if (statusEl && statusEl.getAttribute('data-status-key')) {
            statusEl.textContent = t(statusEl.getAttribute('data-status-key'));
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearStatus();

        var invalid = Object.keys(RULES).filter(function (name) { return !validate(name); });
        if (invalid.length) {
            showStatus('contactPage.statusFix', 'err');
            var first = form.elements[invalid[0]];
            if (first) first.focus();
            return;
        }

        submitBtn.disabled = true;
        if (submitLabel) submitLabel.textContent = t('contactPage.sending');

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
        })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                showStatus('contactPage.statusOk', 'ok');
                form.reset();
                Object.keys(RULES).forEach(function (name) { setError(name, null); });
            })
            .catch(function () {
                showStatus('contactPage.statusErr', 'err');
            })
            .then(function () {
                submitBtn.disabled = false;
                if (submitLabel) submitLabel.textContent = t('contactPage.send');
                if (statusEl) statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
    });
})();
