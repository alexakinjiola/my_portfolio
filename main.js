/* =============================================================
   main.js — one script for the whole site
   -------------------------------------------------------------
   Every block is guarded: it only runs if the elements it needs
   exist on the current page. So this same file can be loaded on
   index / about / skills / projects / resume / contact and each
   page automatically wires up only what it has.

   Wire it on every page with:  <script src="main.js" defer></script>
   -------------------------------------------------------------
   >>> CONTACT FORM: set OWNER_EMAIL below to the address that
       should receive enquiries. First real submission triggers a
       one-time FormSubmit activation email — click it once.       */
   var OWNER_EMAIL = 'tayoalex7@gmail.com';   /* enquiries go here  */
/* ============================================================= */

(function () {
  'use strict';

  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* -------------------- Custom cursor (desktop pointers only) ------------ */
  function initCursor() {
    var cursor = $('#cursor'), ring = $('#cursorRing');
    if (!canHover || !cursor || !ring) { return; }
    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    });
    (function loop() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    $$('a,button,.project-card,.skill-card,.tool-item,.value-card,.outside-card,.testimonial,.currently-item,.marquee-item,.direct-link,.faq-question,.timeline-card,.edu-card,.cert-item,.award-card,.vol-item,.service-option')
      .forEach(function (el) {
        el.addEventListener('mouseenter', function () { ring.classList.add('hovered'); });
        el.addEventListener('mouseleave', function () { ring.classList.remove('hovered'); });
      });
  }

  /* -------------------- Mobile nav drawer -------------------------------- */
  function initNav() {
    var hamburger = $('#hamburger'), navLinks = $('#navLinks');
    if (!hamburger || !navLinks) { return; }
    var backdrop = null;

    function open() {
      navLinks.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        backdrop.addEventListener('click', close);
        document.body.appendChild(backdrop);
      }
      requestAnimationFrame(function () { backdrop.classList.add('open'); });
    }
    function close() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      if (backdrop) { backdrop.classList.remove('open'); }
    }
    function toggle() { navLinks.classList.contains('open') ? close() : open(); }

    window.toggleMenu = toggle;                 /* fallback for inline onclick */
    hamburger.setAttribute('aria-controls', 'navLinks');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.addEventListener('click', toggle);
    $$('a', navLinks).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) { close(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) { close(); } });
  }

  /* -------------------- Nav scrolled state (rAF-throttled) --------------- */
  function initScrollState() {
    var nav = $('#nav');
    if (!nav) { return; }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) { return; }
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
    }, { passive: true });
  }

  /* -------------------- Count-up numbers -------------------------------- */
  /* Animates any .stat-num / .impact-num / .card-stat-num / .result-num from
     0 up to the number in its text, preserving a trailing symbol (+ % k etc). */
  function countUp(el) {
    if (el.dataset.counted) { return; }
    el.dataset.counted = '1';
    var raw = el.textContent.trim();
    var m = raw.match(/([\d.]+)/);
    if (!m) { return; }
    var target = parseFloat(m[1]);
    var prefix = raw.slice(0, m.index);
    var suffix = raw.slice(m.index + m[1].length);
    var decimals = (m[1].split('.')[1] || '').length;
    if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
    var start = performance.now(), dur = 1300;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) { requestAnimationFrame(tick); }
      else { el.textContent = prefix + target.toFixed(decimals) + suffix; }
    })(performance.now());
  }

  /* -------------------- Proficiency bars & learning rings --------------- */
  function fillBars(scope) {
    $$('.prof-fill', scope || document).forEach(function (fill) {
      if (fill.dataset.width) { fill.style.width = fill.dataset.width + '%'; }
    });
  }
  function fillRing(card) {
    var pct = parseInt(card.dataset.progress, 10);
    var fill = $('.progress-fill', card);
    if (!fill || isNaN(pct)) { return; }
    var circ = 2 * Math.PI * 18;                 /* r = 18 */
    fill.style.strokeDashoffset = String(circ - (circ * pct / 100));
  }

  /* -------------------- Scroll reveal (drives the above) ---------------- */
  function initReveal() {
    var revealEls = $$('.reveal,.reveal-left,.reveal-right,.skill-card,.featured-panel,.learning-card,.timeline-item,.edu-card,.cert-item,.award-card,.vol-item,.project-card');
    function show(el) {
      el.classList.add('visible');
      if (el.classList.contains('featured-panel')) { fillBars(el); }
      if (el.classList.contains('learning-card')) { fillRing(el); }
      $$('.stat-num,.impact-num,.card-stat-num,.result-num', el).forEach(countUp);
    }
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(show);
      $$('.stat-num,.impact-num,.card-stat-num,.result-num').forEach(countUp);
      fillBars(); $$('.learning-card').forEach(fillRing);
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { obs.observe(el); });
    /* Standalone numbers not wrapped in a reveal element */
    $$('.stat-num,.impact-num').forEach(function (el) {
      var solo = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); solo.unobserve(x.target); } });
      }, { threshold: 0.6 });
      solo.observe(el);
    });
  }

  /* -------------------- Skills tabs ------------------------------------- */
  function initTabs() {
    var tabs = $$('.tab-btn');
    if (!tabs.length) { return; }
    function activate(id, btn) {
      $$('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      $$('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      if (btn) { btn.classList.add('active'); }
      var panel = $('#tab-' + id);
      if (panel) {
        panel.classList.add('active');
        /* Fire bars & rings for the now-visible panel regardless of scroll */
        fillBars(panel);
        $$('.learning-card', panel).forEach(fillRing);
        $$('.skill-card,.featured-panel', panel).forEach(function (el) { el.classList.add('visible'); });
      }
    }
    window.switchTab = activate;                 /* fallback for inline onclick */
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activate(btn.dataset.tab || (btn.getAttribute('onclick') || '').replace(/.*switchTab\(['"]([^'"]+).*/, '$1'), btn);
      });
    });
  }

  /* -------------------- Projects filter --------------------------------- */
  function initFilter() {
    var btns = $$('.filter-btn');
    var cards = $$('.projects-outer .project-card, .projects-grid .project-card');
    if (!btns.length || !cards.length) { return; }
    var countEl = $('.results-count span');
    function apply(filter) {
      var shown = 0;
      cards.forEach(function (card) {
        var cats = (card.dataset.category || card.dataset.cat || '').toLowerCase();
        var match = filter === 'all' || cats.split(/[\s,]+/).indexOf(filter) !== -1;
        card.classList.toggle('hidden', !match);
        if (match) { shown++; }
      });
      if (countEl) { countEl.textContent = shown; }
    }
    window.filterProjects = apply;
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        apply((b.dataset.filter || 'all').toLowerCase());
      });
    });
  }

  /* -------------------- Project modals ---------------------------------- */
  function initModals() {
    var openers = $$('[data-modal]');
    var overlays = $$('.modal-overlay');
    if (!openers.length && !overlays.length) { return; }
    function openModal(id) {
      var el = document.getElementById(id) || document.getElementById('modal-' + id) || $('.modal-overlay[data-modal-id="' + id + '"]');
      if (!el) { return; }
      el.classList.add('open');
      document.body.classList.add('menu-open');
    }
    function closeModal() {
      $$('.modal-overlay.open').forEach(function (o) { o.classList.remove('open'); });
      document.body.classList.remove('menu-open');
    }
    window.openModal = openModal;
    window.closeModal = closeModal;
    openers.forEach(function (o) {
      o.addEventListener('click', function () { openModal(o.dataset.modal); });
    });
    overlays.forEach(function (ov) {
      ov.addEventListener('click', function (e) { if (e.target === ov) { closeModal(); } });
      $$('.modal-close, [data-close]', ov).forEach(function (c) { c.addEventListener('click', closeModal); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); } });
  }

  /* -------------------- FAQ accordion (contact) ------------------------- */
  function initFaq() {
    var items = $$('.faq-item');
    if (!items.length) { return; }
    items.forEach(function (item) {
      var q = $('.faq-question', item);
      if (!q) { return; }
      q.setAttribute('role', 'button');
      q.setAttribute('tabindex', '0');
      function toggle() { item.classList.toggle('open'); }
      q.addEventListener('click', toggle);
      q.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
    window.toggleFaq = function (el) { var i = el.closest('.faq-item'); if (i) { i.classList.toggle('open'); } };
  }

  /* -------------------- Service selector (contact) ---------------------- */
  function initServiceSelector() {
    var opts = $$('.service-option');
    if (!opts.length) { return; }
    var hidden = $('#serviceInput') || $('input[name="service"]');
    opts.forEach(function (o) {
      o.addEventListener('click', function () {
        opts.forEach(function (x) { x.classList.remove('selected'); });
        o.classList.add('selected');
        if (hidden) { hidden.value = (o.dataset.service || o.textContent).trim(); }
      });
    });
  }

  /* -------------------- Character counter (contact) --------------------- */
  function initCharCount() {
    var ta = $('#messageInput') || $('.contact-main textarea');
    var out = $('.char-count span');
    if (!ta || !out) { return; }
    var max = parseInt(ta.getAttribute('maxlength'), 10) || 500;
    function update() { out.textContent = ta.value.length + ' / ' + max; }
    ta.addEventListener('input', update); update();
  }

  /* -------------------- Live clock + open/closed bars (contact) --------- */
  function initClock() {
    var clock = $('.tz-clock');
    if (clock) {
      (function tick() {
        var now = new Date();
        clock.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        setTimeout(tick, 15000);
      })();
    }
    var today = new Date().getDay();               /* 0 Sun .. 6 Sat */
    var order = [1, 2, 3, 4, 5, 6, 0];              /* Mon-first display */
    $$('.day-block').forEach(function (b, i) { if (order[i] === today) { b.classList.add('today'); } });
  }

  /* -------------------- Resume sidebar scrollspy + anchor offset -------- */
  function initScrollSpy() {
    var links = $$('.sidebar-link');
    var sections = $$('.exp-section');
    if (!links.length || !sections.length) { return; }
    /* Smooth in-page scroll with fixed-nav offset (replaces fragile scrollTo) */
    function setActive(id) {
      links.forEach(function (l) {
        l.classList.toggle('active', (l.dataset.target || l.getAttribute('data-section')) === id);
      });
    }
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        var id = link.dataset.target || link.getAttribute('data-section');
        var target = id ? document.getElementById(id) : null;
        if (target) {
          setActive(id);   /* immediate feedback, don't wait for scroll */
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });
    var ticking = false;
    function spy() {
      var pos = window.scrollY + 140;
      var current = sections[0];
      sections.forEach(function (s) { if (s.offsetTop <= pos) { current = s; } });
      /* If we've reached the bottom, the last section is the active one */
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = sections[sections.length - 1];
      }
      setActive(current.id);
    }
    window.addEventListener('scroll', function () {
      if (ticking) { return; }
      ticking = true;
      requestAnimationFrame(function () { spy(); ticking = false; });
    }, { passive: true });
    spy();
  }

  /* -------------------- Contact form (send to both + autoresponse) ------ */
  /* Uses FormSubmit (no backend). The form is emailed to OWNER_EMAIL, and
     FormSubmit sends the _autoresponse text back to the address in the
     form's `email` field. AJAX response drives the success / error UI. */
  function initContactForm() {
    var form = $('#contactForm');
    if (!form) { return; }
    var btn = $('.submit-btn', form);
    var successBox = $('#formSuccess');
    var errorBox = $('#formError');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errorBox) { errorBox.style.display = 'none'; }
      if (btn) { btn.classList.add('loading'); btn.disabled = true; }

      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(OWNER_EMAIL), {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (d) { return { ok: res.ok, d: d }; }); })
      .then(function (r) {
        var ok = r.ok && (r.d.success === true || r.d.success === 'true');
        if (!ok) { throw new Error(r.d.message || 'Submission failed'); }
        form.reset();
        if (successBox) { form.style.display = 'none'; successBox.style.display = 'block'; successBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      })
      .catch(function () {
        if (errorBox) {
          errorBox.textContent = 'Something went wrong sending your message. Please email me directly at ' + OWNER_EMAIL + ' or try again.';
          errorBox.style.display = 'block';
        }
      })
      .then(function () { if (btn) { btn.classList.remove('loading'); btn.disabled = false; } });
    });

    /* Reset back to the form from the success state */
    var reset = $('.success-reset');
    if (reset && successBox) {
      reset.addEventListener('click', function () {
        successBox.style.display = 'none';
        form.style.display = '';
      });
    }
  }

  /* -------------------- Boot ------------------------------------------- */
  function boot() {
    initCursor(); initNav(); initScrollState(); initReveal();
    initTabs(); initFilter(); initModals(); initFaq();
    initServiceSelector(); initCharCount(); initClock();
    initScrollSpy(); initContactForm();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();