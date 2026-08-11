/* Sage — https://sagetarot.app
 * Copyright © 2026 Future Proof Works. All rights reserved.
 * Not licensed for reuse or redistribution. See LICENSE.
 */

/* Sage — theme switcher.
   Load with <script src="js/theme-toggle.js"></script> in <head> (before the
   body renders, so there is no flash of the wrong theme).
   Appends a sun/moon button to <nav class="main"> once the DOM is ready. */
(function () {
  var KEY = 'sage.theme';
  var root = document.documentElement;

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function current() {
    return root.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function apply(mode, persist) {
    root.setAttribute('data-theme', mode);
    if (persist) { try { localStorage.setItem(KEY, mode); } catch (e) {} }
    var b = document.querySelector('.theme-toggle');
    if (b) {
      b.innerHTML = mode === 'dark' ? SUN : MOON;
      var label = mode === 'dark' ? 'Switch to light' : 'Switch to dark';
      b.title = label; b.setAttribute('aria-label', label);
    }
  }

  var MOON = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M62 8a42 42 0 1 0 30 72A34 34 0 0 1 62 8Z" fill="currentColor"/></svg>';
  var SUN  = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="17" fill="currentColor"/>' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) {
      var r = a * Math.PI / 180;
      return '<line x1="' + (50 + Math.cos(r) * 27) + '" y1="' + (50 + Math.sin(r) * 27) +
             '" x2="' + (50 + Math.cos(r) * 39) + '" y2="' + (50 + Math.sin(r) * 39) +
             '" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>';
    }).join('') + '</svg>';

  // set the theme before first paint
  var pref = saved();
  if (pref) root.setAttribute('data-theme', pref);

  function mount() {
    /* Prefer the right-hand header cluster; fall back to the nav itself. */
    var host = document.querySelector('.top-right') || document.querySelector('nav.main');
    if (!host || host.querySelector('.theme-toggle')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme-toggle';
    b.addEventListener('click', function () {
      apply(current() === 'dark' ? 'light' : 'dark', true);
    });
    var settings = host.querySelector('.top-settings');
    if (settings) host.insertBefore(b, settings); else host.appendChild(b);
    apply(current(), false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
