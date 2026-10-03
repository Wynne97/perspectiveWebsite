/* iPerspective site behavior: nav, reveal-on-scroll, card welcome, try-it demo */
(function () {
  'use strict';
  var track = window.ipTrack || function () {};

  // Nav
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Welcome panel for ?ref= visitors
  var welcome = document.getElementById('welcome');
  if (welcome) {
    var ref = window.ipRef || '';
    var dismissed = false;
    try { dismissed = sessionStorage.getItem('ip_welcome_closed') === '1'; } catch (e) {}
    var fresh = document.documentElement.classList.contains('ref-fresh');
    // Show on the scan itself; once closed, stay closed for this visit.
    if (!fresh || dismissed) welcome.style.display = 'none';
    var title = welcome.querySelector('[data-ref-title]');
    if (title && ref && ref !== 'card') title.textContent = 'Welcome! Glad you found iPerspective.';
    var close = welcome.querySelector('.welcome-close');
    if (close) close.addEventListener('click', function () {
      welcome.style.display = 'none';
      try { sessionStorage.setItem('ip_welcome_closed', '1'); } catch (e) {}
      track('cta_click', { cta: 'welcome_dismiss' });
    });
  }

  // Try-it demo
  var demo = document.getElementById('demo');
  if (demo) {
    var panes = demo.querySelectorAll('.demo-pane');
    var bars = demo.querySelectorAll('.demo-progress span');
    var stepLabel = demo.querySelector('[data-demo-step]');
    var slider = demo.querySelector('[data-slider]');
    var pick = '';

    var go = function (n) {
      panes.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-pane') === String(n)); });
      bars.forEach(function (b, i) { b.classList.toggle('on', i < n); });
      if (stepLabel) stepLabel.textContent = n < 3 ? 'Step ' + n + ' of 3' : 'Done';
    };
    var setText = function (sel, v) { demo.querySelectorAll(sel).forEach(function (el) { el.textContent = v; }); };

    demo.querySelectorAll('.opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        demo.querySelectorAll('.opt').forEach(function (b) { b.classList.remove('picked'); });
        btn.classList.add('picked');
        pick = btn.getAttribute('data-answer');
        setText('[data-demo-pick]', pick);
        track('demo_answer', { answer: pick });
        setTimeout(function () { go(2); }, 220);
      });
    });
    if (slider) slider.addEventListener('input', function () { setText('[data-guess]', slider.value); });
    var lock = demo.querySelector('[data-lock]');
    if (lock) lock.addEventListener('click', function () {
      track('demo_guess', { answer: pick, guess: Number(slider.value) });
      go(3);
    });
  }
})();
