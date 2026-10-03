/**
 * iPerspective - visit source tracking
 *
 * Business card QR: https://iperspective.app/?ref=card
 *
 * What this does:
 *  1. Reads ?ref= (or ?utm_source=) and remembers it for 30 days, so a card
 *     visitor who browses to another page and downloads later still counts.
 *  2. Adds the <html> classes "has-ref" and "ref-<value>" so pages can show a
 *     tailored welcome.
 *  3. Sends events to every analytics tool that is present:
 *       - Google Tag Manager dataLayer   (event names below)
 *       - Meta Pixel (already in GTM)     fbq('trackCustom', ...)
 *       - GA4, if CONFIG.ga4Id is set     gtag('event', ...)
 *  4. Tags every App Store / Google Play link with the source, so installs
 *     show up in App Store Connect and Play Console acquisition reports.
 *
 * Events: ref_visit, card_scan, store_click, demo_answer, demo_guess, cta_click
 *
 * Setup you can do later (both optional):
 *  - ga4Id: Firebase console > project iperspective-app > Analytics >
 *    add a Web data stream > copy the "G-..." measurement ID.
 *  - appStorePt: App Store Connect > Apps > iPerspective > App Analytics >
 *    Acquisition > Campaigns > "Generate a Campaign Link". Copy the pt= value.
 *    Without it Apple ignores the ct= campaign token.
 */
(function () {
  'use strict';

  var CONFIG = {
    ga4Id: '',          // e.g. 'G-XXXXXXXXXX'
    appStorePt: '',     // e.g. '123456789'
    rememberDays: 30
  };

  var KEY = 'ip_ref';
  var params = new URLSearchParams(window.location.search);
  var fresh = clean(params.get('ref') || params.get('utm_source'));
  var stored = read();

  function clean(v) {
    if (!v) return '';
    return String(v).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  }

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - obj.ts > CONFIG.rememberDays * 864e5) return null;
      return obj;
    } catch (e) { return null; }
  }

  function write(obj) {
    try { window.localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) { /* private mode */ }
  }

  // First touch wins, but a new scan refreshes the timer.
  var source = stored;
  if (fresh) {
    source = { ref: fresh, ts: Date.now(), landing: window.location.pathname, first: stored ? stored.first : Date.now() };
    write(source);
  }
  var ref = source ? source.ref : '';

  // ---------- analytics fan-out ----------
  window.dataLayer = window.dataLayer || [];

  if (CONFIG.ga4Id) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4Id;
    document.head.appendChild(s);
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    var cfg = {};
    if (fresh) {
      // GA4 reads campaign info from page_location, so translate ?ref=card into UTM terms.
      cfg.page_location = window.location.origin + window.location.pathname +
        '?utm_source=' + encodeURIComponent(fresh) + '&utm_medium=qr&utm_campaign=' +
        (fresh === 'card' ? 'business_card' : 'referral');
    }
    window.gtag('config', CONFIG.ga4Id, cfg);
  }

  // Meta Pixel loads asynchronously through GTM, so queue until it shows up.
  var pixelQueue = [];
  function flushPixel() {
    if (typeof window.fbq !== 'function') return false;
    while (pixelQueue.length) {
      var e = pixelQueue.shift();
      try { window.fbq('trackCustom', e[0], e[1]); } catch (err) { /* ignore */ }
    }
    return true;
  }
  var tries = 0;
  var timer = setInterval(function () {
    if (flushPixel() || ++tries > 40) clearInterval(timer);
  }, 250);

  function pixelName(name) {
    return name.replace(/(^|_)([a-z])/g, function (_, __, c) { return c.toUpperCase(); });
  }

  function track(name, props) {
    var data = Object.assign({ ref: ref || 'direct', page: window.location.pathname }, props || {});
    window.dataLayer.push(Object.assign({ event: name }, data));
    if (window.gtag && CONFIG.ga4Id) window.gtag('event', name, data);
    pixelQueue.push([pixelName(name), data]);
    flushPixel();
  }
  window.ipTrack = track;
  window.ipRef = ref;

  if (fresh) {
    track('ref_visit', { first_visit: !stored });
    if (fresh === 'card') track('card_scan', { first_visit: !stored });
  }

  // ---------- page hooks ----------
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // Classes go on <html> right away so page scripts and CSS can rely on them.
  if (ref) {
    document.documentElement.classList.add('has-ref', 'ref-' + ref);
    if (fresh) document.documentElement.classList.add('ref-fresh');
  }

  onReady(function () {

    var src = ref || 'website';
    var campaign = ref === 'card' ? 'business_card' : (ref ? 'referral' : 'site');

    document.querySelectorAll('a[href*="apps.apple.com"], a[href*="play.google.com"]').forEach(function (a) {
      try {
        var url = new URL(a.href);
        var store = url.hostname.indexOf('apple') > -1 ? 'app_store' : 'google_play';
        if (store === 'app_store') {
          url.searchParams.set('ct', src);
          if (CONFIG.appStorePt) url.searchParams.set('pt', CONFIG.appStorePt);
          url.searchParams.set('mt', '8');
        } else {
          url.searchParams.set('referrer',
            'utm_source=' + src + '&utm_medium=' + (ref === 'card' ? 'qr' : 'web') + '&utm_campaign=' + campaign);
        }
        a.href = url.toString();
        a.addEventListener('click', function () {
          track('store_click', { store: store, placement: a.getAttribute('data-placement') || 'unknown' });
        });
      } catch (e) { /* leave link untouched */ }
    });

    document.querySelectorAll('[data-track]').forEach(function (el) {
      el.addEventListener('click', function () {
        track('cta_click', { cta: el.getAttribute('data-track') });
      });
    });
  });
})();
