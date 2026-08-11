/* Sage — https://sagetarot.app
 * Copyright © 2026 Future Proof Works. All rights reserved.
 * Not licensed for reuse or redistribution. See LICENSE.
 */

/* Sage — optional AI readings across several providers.
 *
 * Keys live in this browser and are sent only to the provider they belong to.
 * Model names are editable rather than hardcoded, because model names change
 * considerably faster than this app will.
 *
 * Two modes:
 *   deepen   one call to your primary provider
 *   council  every configured provider answers the same prompt independently,
 *            then one of them writes a short note on where they agreed and
 *            where they parted company. Independent rather than sequential on
 *            purpose: if each model saw the previous answer, the first one
 *            would anchor the rest and you would get three variations on one
 *            reading instead of three readings.
 */
(function (S) {
  'use strict';

  S.PROVIDERS = [
    { id:'anthropic', name:'Anthropic', flavour:'Claude',
      defaultModel:'claude-sonnet-5', keyHint:'sk-ant-…',
      keysUrl:'https://console.anthropic.com/settings/keys' },
    { id:'openai', name:'OpenAI', flavour:'GPT',
      defaultModel:'gpt-4o', keyHint:'sk-…',
      keysUrl:'https://platform.openai.com/api-keys' },
    { id:'google', name:'Google', flavour:'Gemini',
      defaultModel:'gemini-2.0-flash', keyHint:'AIza…',
      keysUrl:'https://aistudio.google.com/apikey' }
  ];

  S.getProvider = function (id) {
    for (var i = 0; i < S.PROVIDERS.length; i++) if (S.PROVIDERS[i].id === id) return S.PROVIDERS[i];
    return null;
  };

  /* Which providers have a key set, in the order they are listed. */
  S.configuredProviders = function () {
    var ai = S.store.settings().ai || {};
    return S.PROVIDERS.filter(function (p) {
      return ai[p.id] && (ai[p.id].key || '').trim();
    });
  };

  S.primaryProvider = function () {
    var ai = S.store.settings().ai || {};
    var configured = S.configuredProviders();
    if (!configured.length) return null;
    for (var i = 0; i < configured.length; i++) if (configured[i].id === ai.primary) return configured[i];
    return configured[0];
  };

  function conf(id) {
    var ai = S.store.settings().ai || {};
    var p = S.getProvider(id);
    var c = ai[id] || {};
    return { key: (c.key || '').trim(), model: (c.model || '').trim() || p.defaultModel };
  }

  /* ---------- the calls ---------- */

  function fail(providerName, res, body) {
    var detail = '';
    try {
      var j = JSON.parse(body);
      detail = (j.error && (j.error.message || j.error.status)) || '';
    } catch (e) { detail = (body || '').slice(0, 200); }
    return new Error(providerName + ' returned ' + res.status + (detail ? ': ' + detail : ''));
  }

  function callAnthropic(prompt) {
    var c = conf('anthropic');
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': c.key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: c.model,
        max_tokens: 1800,
        messages: [{ role: 'user', content: prompt }]
      })
    }).then(function (res) {
      return res.text().then(function (body) {
        if (!res.ok) throw fail('Anthropic', res, body);
        var data = JSON.parse(body);
        return (data.content || []).map(function (b) { return b.text || ''; }).join('\n').trim();
      });
    });
  }

  function callOpenAI(prompt) {
    var c = conf('openai');
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + c.key
      },
      /* No token cap: the parameter name for it differs between model families,
         and the default is generous enough for a reading. */
      body: JSON.stringify({
        model: c.model,
        messages: [{ role: 'user', content: prompt }]
      })
    }).then(function (res) {
      return res.text().then(function (body) {
        if (!res.ok) throw fail('OpenAI', res, body);
        var data = JSON.parse(body);
        var choice = (data.choices || [])[0] || {};
        return ((choice.message && choice.message.content) || '').trim();
      });
    });
  }

  function callGoogle(prompt) {
    var c = conf('google');
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      encodeURIComponent(c.model) + ':generateContent?key=' + encodeURIComponent(c.key);
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }).then(function (res) {
      return res.text().then(function (body) {
        if (!res.ok) throw fail('Google', res, body);
        var data = JSON.parse(body);
        var cand = (data.candidates || [])[0] || {};
        var parts = (cand.content && cand.content.parts) || [];
        return parts.map(function (p) { return p.text || ''; }).join('\n').trim();
      });
    });
  }

  var CALLS = { anthropic: callAnthropic, openai: callOpenAI, google: callGoogle };

  S.askProvider = function (providerId, prompt) {
    var call = CALLS[providerId];
    if (!call) return Promise.reject(new Error('Unknown provider: ' + providerId));
    return call(prompt).then(function (text) {
      if (!text) throw new Error(S.getProvider(providerId).name + ' returned an empty response.');
      return { provider: providerId, model: conf(providerId).model, text: text, at: new Date().toISOString() };
    });
  };

  /* ---------- council ---------- */

  S.convene = function (prompt, onProgress) {
    var providers = S.configuredProviders();
    var done = 0;
    var jobs = providers.map(function (p) {
      return S.askProvider(p.id, prompt)
        .then(function (run) { done++; if (onProgress) onProgress(done, providers.length); return run; })
        .catch(function (err) {
          done++; if (onProgress) onProgress(done, providers.length);
          return { provider: p.id, model: conf(p.id).model, error: err.message, at: new Date().toISOString() };
        });
    });
    return Promise.all(jobs);
  };

  S.comparePrompt = function (runs, rec, spreadName) {
    var good = runs.filter(function (r) { return r.text; });
    var body = good.map(function (r, i) {
      return '--- Reading ' + (i + 1) + ', by ' + S.getProvider(r.provider).name + ' ---\n' + r.text;
    }).join('\n\n');

    return 'Below are ' + good.length + ' independent tarot readings of the same spread, written by different people ' +
      'who could not see each other\'s work.\n\n' +
      (rec.question ? 'The question was: ' + rec.question + '\n' : '') +
      'The spread was: ' + spreadName + '\n\n' + body + '\n\n' +
      'Write a short note — three or four short paragraphs at most — on how these readings compare. ' +
      'Say plainly where they agreed, and be specific about where they genuinely diverged and what each one saw that ' +
      'the others missed. Divergence is the interesting part, so do not smooth it over into a consensus. ' +
      'Where they disagree, say which reading you find more persuasive and why. ' +
      'Write in plain English, address the person who drew the cards directly, and do not use headings, bullet points ' +
      'or markdown. Do not introduce yourself or explain what you are about to do.';
  };

})(window.SAGE = window.SAGE || {});
