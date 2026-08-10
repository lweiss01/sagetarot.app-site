/* Sage — persistence. localStorage, with JSON export/import as a backup path. */
(function (S) {
  'use strict';

  var K_READINGS = 'sage.readings.v1';
  var K_SETTINGS = 'sage.settings.v1';
  var K_STUDY    = 'sage.study.v1';

  var drawCache = null;   // memoised draw tally; cleared whenever readings change

  function get(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { console.warn('Sage: could not save.', e); return false; }
  }

  S.store = {
    available: (function () {
      try { localStorage.setItem('sage.test', '1'); localStorage.removeItem('sage.test'); return true; }
      catch (e) { return false; }
    })(),

    /* ---- readings ----
       Guest readings live in the same store but are excluded from everything
       that counts: the journal, themes, draw tallies, streaks and accuracy.
       readings() is therefore *yours*; allReadings() is everything. */
    allReadings: function () {
      var list = get(K_READINGS, []);
      list.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      return list;
    },
    readings: function () {
      return S.store.allReadings().filter(function (r) { return !r.guest; });
    },
    guestReadings: function () {
      return S.store.allReadings().filter(function (r) { return r.guest; });
    },
    reading: function (id) {
      var all = S.store.allReadings();
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    },
    clearGuests: function () {
      var kept = get(K_READINGS, []).filter(function (r) { return !r.guest; });
      set(K_READINGS, kept);
      drawCache = null;
    },
    saveReading: function (rec) {
      var all = get(K_READINGS, []);
      var i = all.findIndex(function (r) { return r.id === rec.id; });
      if (i >= 0) all[i] = rec; else all.push(rec);
      set(K_READINGS, all);
      drawCache = null;
      return rec;
    },
    deleteReading: function (id) {
      var all = get(K_READINGS, []).filter(function (r) { return r.id !== id; });
      set(K_READINGS, all);
      drawCache = null;
    },

    /* ---- how often each card has actually been drawn ----
       Derived from the saved readings rather than counted up as we go, so it
       cannot drift when a reading is re-saved (a note, an AI pass) and it
       corrects itself when a reading is deleted. */
    drawCounts: function () {
      if (drawCache) return drawCache;
      var counts = {};
      S.store.readings().forEach(function (r) {
        (r.draws || []).forEach(function (d) {
          counts[d.cardId] = (counts[d.cardId] || 0) + 1;
        });
      });
      drawCache = counts;
      return counts;
    },

    /* ---- how each card has fared in readings you rated ----
       For every card: how often it appeared in a reading you later marked as
       landing, versus one you marked as missing. Tells you which cards you
       read well and which you consistently misjudge. */
    cardAccuracy: function () {
      var acc = {};
      S.store.readings().forEach(function (r) {
        var o = r.outcome && r.outcome.rating;
        if (!o || o === 'partly') return;
        (r.draws || []).forEach(function (d) {
          var c = acc[d.cardId] || (acc[d.cardId] = { landed: 0, missed: 0 });
          if (o === 'landed') c.landed++; else c.missed++;
        });
      });
      return acc;
    },

    ratedReadings: function () {
      return S.store.readings().filter(function (r) { return r.outcome && r.outcome.rating; });
    },

    /* ---- daily practice ----
       One entry per calendar day, keyed YYYY-MM-DD, holding that day's first
       reading. Used for the streak and the thirty-day strip. */
    byDay: function () {
      var days = {};
      S.store.readings().forEach(function (r) {
        var k = S.dayKey(new Date(r.date));
        if (!days[k] || r.date < days[k].date) days[k] = r;
      });
      return days;
    },

    streak: function () {
      var days = S.store.byDay();
      var d = new Date();
      /* A streak survives today not being done yet — it breaks only once
         yesterday is also missed. */
      if (!days[S.dayKey(d)]) d.setDate(d.getDate() - 1);
      var n = 0;
      while (days[S.dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },

    /* ---- study stats ---- per card: { correct, wrong, lastQuizzed } */
    study: function () { return get(K_STUDY, { cards: {}, quizzes: 0 }); },
    cardStat: function (id) {
      var c = S.store.study().cards[id] || {};
      return {
        seen: S.store.drawCounts()[id] || 0,
        correct: c.correct || 0,
        wrong: c.wrong || 0,
        lastQuizzed: c.lastQuizzed || null
      };
    },
    recordQuiz: function (cardId, correct) {
      var st = S.store.study();
      var c = st.cards[cardId] || { correct: 0, wrong: 0, lastQuizzed: null };
      if (correct) c.correct = (c.correct || 0) + 1; else c.wrong = (c.wrong || 0) + 1;
      c.lastQuizzed = new Date().toISOString();
      st.cards[cardId] = c;
      st.quizzes = (st.quizzes || 0) + 1;
      set(K_STUDY, st);
    },

    /* ---- settings ---- */
    settings: function () {
      var s = get(K_SETTINGS, {});
      var dirty = false;

      /* The 78 card images now ship in images/, so local is the sensible
         default — it works offline and needs nothing from the network. It falls
         back to Wikimedia per-image if a file is missing. Anyone still carrying
         the old Wikimedia default is moved across once; choosing Wikimedia
         deliberately after that sticks. */
      if (!s.imageSource) { s.imageSource = 'local'; dirty = true; }
      if (!s.imgDefaultV2) {
        if (s.imageSource === 'commons') s.imageSource = 'local';
        s.imgDefaultV2 = true;
        dirty = true;
      }

      if (!s.voice) s.voice = 'plain';      // 'plain' | 'trad'

      /* AI keys used to be a single Anthropic key; they are per-provider now. */
      if (!s.ai) s.ai = {};
      if (s.apiKey) {
        s.ai.anthropic = s.ai.anthropic || {};
        if (!s.ai.anthropic.key) s.ai.anthropic.key = s.apiKey;
        delete s.apiKey;
        set(K_SETTINGS, s);
      }
      if (!s.ai.primary) s.ai.primary = 'anthropic';
      if (dirty) set(K_SETTINGS, s);
      return s;
    },
    saveSettings: function (s) { set(K_SETTINGS, s); },

    /* ---- first run and backup reminders ---- */

    /* True until the welcome has been dismissed. Someone who has cleared their
       site data looks exactly like a new user, which is the whole reason the
       welcome offers an import as well as a fresh start. */
    isFirstRun: function () {
      var s = S.store.settings();
      return !s.welcomed && !S.store.allReadings().length;
    },
    markWelcomed: function () {
      var s = S.store.settings();
      s.welcomed = new Date().toISOString();
      set(K_SETTINGS, s);
    },
    noteExport: function () {
      var s = S.store.settings();
      s.lastExport = new Date().toISOString();
      set(K_SETTINGS, s);
    },

    /* Quiet nudge: enough readings to be worth losing, and nothing exported
       recently. Returns null when there is nothing to say. */
    backupNudge: function () {
      var s = S.store.settings();
      if (s.nudgeOff) return null;
      var n = S.store.readings().length;
      if (n < 10) return null;
      var days = s.lastExport
        ? Math.floor((Date.now() - new Date(s.lastExport).getTime()) / 86400000)
        : null;
      if (days !== null && days < 30) return null;
      return { readings: n, daysSince: days };
    },
    dismissNudge: function () {
      var s = S.store.settings();
      s.nudgeOff = true;
      set(K_SETTINGS, s);
    },

    /* ---- backup ---- */
    exportAll: function () {
      return JSON.stringify({
        app: 'sage', version: 1, exported: new Date().toISOString(),
        readings: get(K_READINGS, []),
        study: get(K_STUDY, { cards: {}, quizzes: 0 }),
        settings: (function () {
          var s = JSON.parse(JSON.stringify(S.store.settings()));
          delete s.apiKey;
          if (s.ai) Object.keys(s.ai).forEach(function (k) {
            if (s.ai[k] && typeof s.ai[k] === 'object') s.ai[k].key = '';   // never export keys
          });
          return s;
        })()
      }, null, 2);
    },
    importAll: function (json, merge) {
      var data = JSON.parse(json);
      if (data.app !== 'sage') throw new Error('That does not look like a Sage backup file.');
      if (merge) {
        var existing = get(K_READINGS, []);
        var ids = {};
        existing.forEach(function (r) { ids[r.id] = 1; });
        (data.readings || []).forEach(function (r) { if (!ids[r.id]) existing.push(r); });
        set(K_READINGS, existing);
      } else {
        set(K_READINGS, data.readings || []);
        set(K_STUDY, data.study || { cards: {}, quizzes: 0 });
      }

      /* Restore the preferences that travel in a backup — birth date, voice,
         image source. API keys are never in the file and whatever keys are set
         on this machine are left alone. */
      if (data.settings) {
        var live = S.store.settings();
        ['birthDate', 'voice', 'imageSource'].forEach(function (k) {
          if (typeof data.settings[k] === 'string' && data.settings[k]) live[k] = data.settings[k];
        });
        if (data.settings.ai && data.settings.ai.primary) {
          live.ai = live.ai || {};
          live.ai.primary = data.settings.ai.primary;
        }
        set(K_SETTINGS, live);
      }

      drawCache = null;
      return true;
    },
    wipe: function () {
      localStorage.removeItem(K_READINGS);
      localStorage.removeItem(K_STUDY);
      drawCache = null;
    },

    /* Outcome notes and reading notes used to be two separate boxes asking much
       the same question. They are one box now, so fold any old outcome text into
       the note. Runs once at boot; a no-op after that. */
    migrate: function () {
      var all = get(K_READINGS, []);
      var changed = false;
      all.forEach(function (r) {
        if (r.outcome && typeof r.outcome.what === 'string') {
          var extra = r.outcome.what.trim();
          if (extra && (r.note || '').indexOf(extra) < 0) {
            r.note = (r.note || '').trim() ? r.note.trim() + '\n\n' + extra : extra;
          }
          delete r.outcome.what;
          changed = true;
        }
        /* AI readings used to be a single Anthropic string; they are a list of
           runs now, so several providers can each have one. */
        if (typeof r.ai === 'string') {
          if (r.ai.trim()) {
            r.aiRuns = (r.aiRuns || []).concat([{
              provider: 'anthropic', model: '', text: r.ai.trim(), at: r.date
            }]);
          }
          delete r.ai;
          changed = true;
        }
      });
      if (changed) { set(K_READINGS, all); drawCache = null; }
      return changed;
    }
  };

  S.uid = function () {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  /* Local calendar day, not UTC — a reading at 11pm belongs to that evening. */
  S.dayKey = function (d) {
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2);
  };

})(window.SAGE = window.SAGE || {});
