/* Sage — https://sagetarot.app
 * Copyright © 2026 Future Proof Works. All rights reserved.
 * Not licensed for reuse or redistribution. See LICENSE.
 */

/* Sage — analytics consent.
 *
 * The default is set inline in index.html, because Google Consent Mode has to
 * hear about it before the tag configures itself. This file only handles the
 * banner and the stored choice.
 *
 * The banner is shown to visitors whose timezone looks European — the EEA and
 * the UK are where consent is actually required — and the check errs towards
 * showing it. Anyone anywhere can change their mind later in Settings.
 */
(function (S) {
  'use strict';

  var KEY = 'sage.consent';
  var cfg = window.SAGE_CONSENT || { eu: false, stored: null, granted: true };

  function remember(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  /* Shared with the Settings panel. */
  S.consent = {
    required: function () { return !!cfg.eu; },
    granted: function () {
      var stored = null;
      try { stored = localStorage.getItem(KEY); } catch (e) {}
      return stored ? stored === 'granted' : !cfg.eu;
    },
    set: function (granted) {
      remember(granted ? 'granted' : 'denied');
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: granted ? 'granted' : 'denied'
        });
      }
    }
  };

  /* ---- the banner ---- */

  function dismiss(granted) {
    S.consent.set(granted);
    var bar = document.querySelector('.consent-bar');
    if (bar) bar.remove();
  }

  function show() {
    if (document.querySelector('.consent-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'consent-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Analytics consent');
    bar.innerHTML =
      '<div class="consent-inner">' +
        '<p>Sage keeps your readings on this device and never uploads them. ' +
        'Separately, it can send anonymous usage statistics — which pages get opened, which features get used — ' +
        'to Google Analytics, which sets a cookie. Nothing you have written or drawn is ever included.</p>' +
        '<div class="consent-acts">' +
          '<button class="btn sm" data-consent="yes">Allow</button>' +
          '<button class="btn ghost sm" data-consent="no">No thanks</button>' +
        '</div>' +
      '</div>';

    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (b) dismiss(b.getAttribute('data-consent') === 'yes');
    });

    document.body.appendChild(bar);
  }

  /* Only ask where it is required, and only once. */
  if (cfg.eu && !cfg.stored) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', show);
    } else {
      show();
    }
  }

})(window.SAGE = window.SAGE || {});
