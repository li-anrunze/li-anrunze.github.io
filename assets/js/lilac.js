(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* topbar state, progress bar, back-to-top */
  var topbar = $('.topbar'), bar = $('.progress span'), toTop = $('.to-top');
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    topbar.classList.toggle('is-scrolled', y > 30);
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    toTop.classList.toggle('is-shown', y > innerHeight * 0.8);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* mobile menu */
  var toggle = $('.nav-toggle');
  toggle.addEventListener('click', function () {
    var open = topbar.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { topbar.classList.remove('menu-open'); }); });

  /* active nav link */
  var links = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id]').forEach(function (s) { spy.observe(s); });

    /* reveal on scroll */
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rev.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { rev.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* typed research interest line */
  var typed = $('.typed');
  if (typed && !reduced) {
    var words = JSON.parse(typed.getAttribute('data-words')), wi = 0, ci = 0, del = false;
    (function tick() {
      var w = words[wi];
      typed.textContent = w.slice(0, ci);
      if (!del && ci < w.length) ci++;
      else if (!del) { del = true; return setTimeout(tick, 1800); }
      else if (ci > 0) ci--;
      else { del = false; wi = (wi + 1) % words.length; }
      setTimeout(tick, del ? 35 : 70);
    })();
  }

  /* magnolia petals in hero */
  var petals = $('.petals');
  if (petals && !reduced) {
    for (var i = 0; i < 12; i++) {
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.innerHTML = '<use href="#petal"/>';
      var size = 12 + Math.random() * 12;
      s.style.left = Math.random() * 100 + '%';
      s.style.width = size + 'px'; s.style.height = size * 1.3 + 'px';
      s.style.animationDuration = 11 + Math.random() * 10 + 's';
      s.style.animationDelay = -Math.random() * 20 + 's';
      s.style.setProperty('--dx', (Math.random() * 200 - 60) + 'px');
      s.style.setProperty('--rot', (Math.random() * 540 - 180) + 'deg');
      petals.appendChild(s);
    }
  }

  /* projects accordion */
  $$('.project').forEach(function (p) {
    var head = $('.project__head', p);
    head.addEventListener('click', function () {
      var open = p.classList.toggle('is-open');
      head.setAttribute('aria-expanded', open);
    });
  });

  /* publications: filter + search */
  var pubs = $$('.pub'), years = $$('.year-mark'), empty = $('.pubs-empty'), state = { f: 'all', q: '' };
  function applyPubs() {
    var shown = 0;
    pubs.forEach(function (li) {
      var tags = li.getAttribute('data-tags');
      var ok = (state.f === 'all' || tags.indexOf(state.f) > -1) &&
               (!state.q || li.textContent.toLowerCase().indexOf(state.q) > -1);
      li.classList.toggle('is-hidden', !ok);
      if (ok) shown++;
    });
    years.forEach(function (y) {
      var any = pubs.some(function (li) { return li.getAttribute('data-year') === y.getAttribute('data-year') && !li.classList.contains('is-hidden'); });
      y.classList.toggle('is-hidden', !any);
    });
    if (empty) empty.classList.toggle('is-shown', shown === 0);
  }
  $$('[data-pub-filter]').forEach(function (b) {
    var f = b.getAttribute('data-pub-filter');
    var n = f === 'all' ? pubs.length : pubs.filter(function (li) { return li.getAttribute('data-tags').indexOf(f) > -1; }).length;
    var span = $('.n', b); if (span) span.textContent = n;
    b.addEventListener('click', function () {
      $$('[data-pub-filter]').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      state.f = f; applyPubs();
    });
  });
  var search = $('#pub-search');
  if (search) search.addEventListener('input', function () { state.q = search.value.trim().toLowerCase(); applyPubs(); });

  /* activities: two-column masonry timeline + filter */
  var acts = $$('.act'), colL = $('.timeline__col--l'), colR = $('.timeline__col--r'), actFilter = 'all';
  function layoutActs() {
    if (!colL) return;
    var narrow = matchMedia('(max-width: 900px)').matches, hl = 0, hr = 110;
    acts.forEach(function (a) {
      var show = actFilter === 'all' || a.getAttribute('data-type') === actFilter;
      a.classList.toggle('is-hidden', !show);
      if (!show) return;
      var toLeft = narrow || hl <= hr;
      (toLeft ? colL : colR).appendChild(a);
      var h = a.offsetHeight + 30;
      if (toLeft) hl += h; else hr += h;
    });
  }
  layoutActs();
  var lastNarrow = matchMedia('(max-width: 900px)').matches, rt;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var n = matchMedia('(max-width: 900px)').matches;
      if (n !== lastNarrow) { lastNarrow = n; layoutActs(); }
    }, 150);
  });
  $$('[data-act-filter]').forEach(function (b) {
    var f = b.getAttribute('data-act-filter');
    var span = $('.n', b);
    if (span) span.textContent = f === 'all' ? acts.length : acts.filter(function (a) { return a.getAttribute('data-type') === f; }).length;
    b.addEventListener('click', function () {
      $$('[data-act-filter]').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      actFilter = f;
      acts.forEach(function (a) { a.classList.add('is-in'); });
      layoutActs();
    });
  });

  /* lightbox (supports multi-image galleries via data-gallery) */
  var lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('.lightbox__cap', lb), gallery = [], gi = 0;
  function show() {
    lbImg.src = gallery[gi];
    lbCap.textContent = (lb._cap || '') + (gallery.length > 1 ? '  ·  ' + (gi + 1) + ' / ' + gallery.length + '  (← →)' : '');
  }
  $$('[data-zoom]').forEach(function (el) {
    el.addEventListener('click', function () {
      var img = $('img', el) || el;
      gallery = (el.getAttribute('data-gallery') || img.getAttribute('src')).split('|');
      gi = 0; lb._cap = el.getAttribute('data-caption') || img.alt || '';
      show();
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    });
  });
  $('.lightbox__close').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb) { lb.close(); return; }
    if (e.target === lbImg && gallery.length > 1) { gi = (gi + 1) % gallery.length; show(); }
  });
  addEventListener('keydown', function (e) {
    if (!lb.open || gallery.length < 2) return;
    if (e.key === 'ArrowRight') { gi = (gi + 1) % gallery.length; show(); }
    if (e.key === 'ArrowLeft') { gi = (gi - 1 + gallery.length) % gallery.length; show(); }
  });
})();
