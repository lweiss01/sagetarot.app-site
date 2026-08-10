/* Sage — application shell, views and interaction. */
(function (S) {
  'use strict';

  var app = document.getElementById('app');

  var state = {
    view: 'draw',
    draft: null,          // { spreadId, question, draws:{posId:{cardId,reversed}} }
    picker: null,         // { positionId, reversed, query, suit }
    openReadingId: null,
    openCardId: null,
    libFilter: { q: '', suit: 'all' },
    quiz: null,
    guest: false,        // reading for someone else — kept out of your own data
    guestName: '',
    aiTab: 0,
    aiBusy: false
  };

  /* ================= helpers ================= */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  var SUIT_GLYPH = { wands: '♣', cups: '♥', swords: '♠', pentacles: '♦' };
  var SUIT_LABEL = { wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles' };
  var RANK = { 1:'Ace', 11:'Page', 12:'Knight', 13:'Queen', 14:'King' };
  var ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];

  /* ---- card imagery: local override → Wikimedia Commons → drawn fallback ---- */

  function commonsUrl(file, width) {
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/' +
      encodeURIComponent(file) + '?width=' + (width || 500);
  }
  function localUrl(file) { return 'images/' + file; }

  S.imgChain = function (card, width) {
    var mode = S.store.settings().imageSource || 'local';
    /* Local first, with Wikimedia as a per-image safety net. */
    if (mode === 'local') return [localUrl(card.img), commonsUrl(card.img, width)];
    return [commonsUrl(card.img, width)];
  };

  S.cardImgHTML = function (card, width, alt) {
    var chain = S.imgChain(card, width);
    return '<img src="' + esc(chain[0]) + '" alt="' + esc(alt || card.name) + '" loading="lazy" ' +
      'data-chain="' + esc(JSON.stringify(chain)) + '" data-step="0" data-card="' + esc(card.id) + '" ' +
      'onerror="SAGE.imgFail(this)">';
  };

  S.imgFail = function (img) {
    var chain, step = parseInt(img.getAttribute('data-step') || '0', 10);
    try { chain = JSON.parse(img.getAttribute('data-chain')); } catch (e) { chain = []; }
    if (step + 1 < chain.length) {
      img.setAttribute('data-step', String(step + 1));
      img.src = chain[step + 1];
      return;
    }
    var card = S.cardById(img.getAttribute('data-card'));
    if (!img.parentNode) return;
    img.outerHTML = fallbackFace(card);   // replace only the image; captions survive
  };

  function fallbackFace(card) {
    if (!card) return '<div class="card-fallback"><div class="glyph">✦</div></div>';
    var glyph = card.arcana === 'major' ? '✦' : SUIT_GLYPH[card.suit];
    var rn = card.arcana === 'major' ? ROMAN[card.num] : (RANK[card.num] || card.num);
    return '<div class="card-fallback">' +
      '<div class="rn">' + esc(rn) + '</div>' +
      '<div class="glyph">' + glyph + '</div>' +
      '<div class="nm">' + esc(card.name) + '</div>' +
      '</div>';
  }

  function orientLabel(rev) { return rev ? 'Reversed' : 'Upright'; }

  /* ================= navigation ================= */

  function go(view, opts) {
    state.view = view;
    if (opts && opts.readingId) state.openReadingId = opts.readingId;
    if (opts && opts.cardId) state.openCardId = opts.cardId;
    window.scrollTo(0, 0);
    render();
  }

  document.getElementById('nav').addEventListener('click', function (e) {
    var b = e.target.closest('[data-nav]');
    if (!b) return;
    e.preventDefault();
    if (b.getAttribute('data-nav') === 'draw') { state.openReadingId = null; }
    go(b.getAttribute('data-nav'));
  });
  document.querySelector('.brand').addEventListener('click', function (e) {
    e.preventDefault(); state.openReadingId = null; go('draw');
  });

  /* Hidden while reading for someone else, so a friend on your laptop cannot
     wander into your saved readings. */
  var PRIVATE_TABS = ['journal', 'themes', 'yours'];

  function syncNav() {
    var map = { draw:'draw', reading: state.guest ? 'guests' : 'journal',
                journal:'journal', guests:'guests', themes:'themes',
                library:'library', card:'library', yours:'yours',
                study:'study', learn:'learn', settings:'settings' };
    var want = map[state.view] || state.view;
    document.querySelectorAll('#nav button').forEach(function (b) {
      var id = b.getAttribute('data-nav');
      b.classList.toggle('active', id === want);
      if (PRIVATE_TABS.indexOf(id) >= 0) b.classList.toggle('hidden', state.guest);
      if (id === 'guests') b.classList.toggle('hidden', !state.guest);
    });
    document.body.classList.toggle('guest-mode', state.guest);
  }

  /* ================= view: new reading ================= */

  function viewDraw() {
    if (!state.draft) return chooseSpread();
    return buildBoard();
  }

  /* ---- daily practice strip ---- */

  function dailyPanel() {
    var days = S.store.byDay();
    var streak = S.store.streak();
    var todayKey = S.dayKey(new Date());
    var today = days[todayKey];

    var h = '<div class="daily"><div class="daily-head">' +
      '<div><div class="eyebrow" style="font-size:.66rem;letter-spacing:.28em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px">Daily practice</div>' +
      '<h3>' + (today ? 'You have drawn today' : 'You have not drawn today') + '</h3></div>';

    if (streak > 0) {
      h += '<div class="streak"><span class="n">' + streak + '</span>' +
        '<span class="l">day' + (streak === 1 ? '' : 's') + ' running</span></div>';
    }
    h += '</div>';

    /* thirty-day strip, oldest to newest */
    h += '<div class="strip">';
    for (var i = 29; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      var key = S.dayKey(d);
      var rec = days[key];
      var isToday = key === todayKey;
      var label = d.toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short' });

      if (rec) {
        var card = S.cardById(rec.draws[0].cardId);
        h += '<button class="day filled' + (isToday ? ' today' : '') + '" data-action="open-reading" data-id="' +
          rec.id + '" title="' + esc(label + ' — ' + (card ? card.name : '')) + '">' +
          (card ? S.cardImgHTML(card, 100) : '') + '</button>';
      } else {
        h += '<span class="day empty' + (isToday ? ' today' : '') + '" title="' + esc(label) + '"></span>';
      }
    }
    h += '</div>';

    if (today) {
      var c0 = S.cardById(today.draws[0].cardId);
      h += '<p class="daily-note">Today you drew <b>' + esc(c0 ? c0.name : '') + '</b>' +
        (today.draws[0].reversed ? ', reversed' : '') + '. ' +
        (S.cardShort(c0) ? esc(S.cardShort(c0)) : '') + '</p>';
    } else {
      h += '<div class="actions" style="margin-top:14px">' +
        '<button class="btn" data-action="daily-draw">Draw today\'s card</button></div>' +
        '<p class="daily-note">One card a day is how interpretation actually gets learned — far more than the occasional big spread.</p>';
    }

    return h + '</div>';
  }

  function guestToggle() {
    return '<div class="guest-toggle ' + (state.guest ? 'on' : '') + '">' +
      '<div class="rev-toggle ' + (state.guest ? 'on' : '') + '" data-action="toggle-guest">' +
        '<span class="sw"></span><span class="lbl">Reading for someone else</span>' +
      '</div>' +
      (state.guest
        ? '<label class="guest-name"><span>Whose reading is it?</span>' +
          '<input type="text" id="guestName" value="' + esc(state.guestName) + '" placeholder="Optional — a name"></label>' +
          '<p class="hint">Guest readings are filed separately. They stay out of your journal, your themes, your streak, ' +
          'your draw counts and your card accuracy, and your own cards are not looked for in them. ' +
          'Your journal, themes and Your Cards tabs are hidden while this is on.</p>'
        : '<p class="hint">Turn this on before drawing for a friend, and none of it will touch your own stats.</p>') +
      '</div>';
  }

  function chooseSpread() {
    var h = '<div class="wrap view">' +
      '<div class="page-head">' +
        '<div class="eyebrow">' + (state.guest ? 'Guest Reading' : 'New Reading') + '</div>' +
        '<h1>Choose a spread</h1>' +
        '<p class="lede">Shuffle and draw from your own deck, then record each card in its place. ' +
        'The reading is written once every position is filled.</p>' +
      '</div>';

    h += guestToggle();

    if (!state.guest && S.store.readings().length) h += '<hr class="divider">' + dailyPanel();
    h += '<hr class="divider">';

    h += '<div class="spread-grid">';

    S.SPREADS.forEach(function (sp) {
      var pips = '';
      for (var i = 0; i < sp.positions.length; i++) pips += '<i></i>';
      h += '<button class="spread-card" data-action="pick-spread" data-id="' + sp.id + '">' +
        '<span class="tag">' + esc(sp.tag) + '</span>' +
        '<h3>' + esc(sp.name) + '</h3>' +
        '<p>' + esc(sp.blurb) + '</p>' +
        '<span class="mini-layout">' + pips + '</span>' +
        '</button>';
    });

    h += '</div>';

    var recent = (state.guest ? S.store.guestReadings() : S.store.readings()).slice(0, 3);
    if (recent.length) {
      h += '<hr class="divider"><h2 style="margin-bottom:18px">Pick up where you left off</h2><div class="journal-list">';
      recent.forEach(function (r) { h += journalItem(r); });
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  function slotWidth(cols) {
    if (cols <= 1) return 190;
    if (cols <= 3) return 150;
    if (cols === 4) return 132;
    if (cols === 5) return 118;
    return 104;
  }

  /* Most spreads use equal columns; a spread may declare colw to widen one
     (the Celtic Cross needs room for the sideways crossing card). */
  function boardCols(sp, w) {
    if (sp.colw) {
      return sp.colw.map(function (m) { return Math.round(w * m) + 'px'; }).join(' ');
    }
    return 'repeat(' + sp.cols + ',' + w + 'px)';
  }

  /* One slot on the board. Shared by the entry board and the saved reading. */
  function slotHTML(pos, i, placed, w, interactive) {
    var card = placed ? S.cardById(placed.cardId) : null;
    var style = pos.col ? 'grid-column:' + pos.col + ';grid-row:' + pos.row + ';' : '';

    var content = card
      ? '<div class="card-face ' + (placed.reversed ? 'rev' : '') + '">' +
          S.cardImgHTML(card, 400) +
          (placed.reversed && !interactive ? '<span class="rev-flag">Rev</span>' : '') +
          '<span class="cap">' + esc(card.name) + '</span></div>'
      : '<span class="plus">+</span><span class="slot-name">' + esc(pos.name) + '</span>';

    /* On the entry board a filled card gets its own reverse control, so you can
       flip it without reopening the picker. It doubles as the reversed marker. */
    var flip = (interactive && card)
      ? '<button class="flip' + (placed.reversed ? ' on' : '') + '" data-action="flip" data-pos="' + pos.id + '" ' +
        'title="' + (placed.reversed ? 'Reversed — click to set upright' : 'Upright — click to reverse') + '" ' +
        'aria-label="Toggle reversed">↻</button>'
      : '';

    var attrs = 'class="slot-inner"' +
      (interactive ? ' data-action="open-picker" data-pos="' + pos.id + '"' : '');

    var body;
    if (pos.rot) {
      /* A landscape box holds the card, which is rotated inside it — so the
         slot occupies the space it actually looks like it occupies. */
      body = '<div class="cross-box" style="width:' + Math.round(w * 1.714) + 'px;height:' + w + 'px">' +
        '<div ' + attrs + ' style="width:' + w + 'px">' + content + '</div>' + flip + '</div>';
    } else {
      body = '<div ' + attrs + '>' + content + flip + '</div>';
    }

    return '<div class="slot ' + (card ? 'filled ' : '') + (pos.rot ? 'crossing' : '') +
      '" style="' + style + '">' +
      '<span class="num">' + (i + 1) + '</span>' + body +
      '<div class="pos-label">' + esc(pos.name) + '</div></div>';
  }

  function buildBoard() {
    var sp = S.getSpread(state.draft.spreadId);
    var d = state.draft;
    var filled = sp.positions.filter(function (p) { return d.draws[p.id]; }).length;
    var w = slotWidth(sp.cols);

    var h = '<div class="wrap view">' +
      '<div class="page-head">' +
        '<div class="eyebrow">' + esc(sp.tag) + ' · ' + filled + ' of ' + sp.positions.length + ' placed</div>' +
        '<h1>' + esc(sp.name) + '</h1>' +
        '<p class="lede">' + esc(sp.blurb) + '</p>' +
      '</div>';

    if (state.guest) {
      h += '<div class="guest-bar"><span class="tag">Guest reading</span>' +
        '<label>For <input type="text" id="guestName" value="' + esc(state.guestName) + '" placeholder="a name"></label>' +
        '<span class="msg">Filed separately — none of this touches your own journal or stats.</span></div>';
    }

    h += '<div class="ask-row">' +
      '<label class="field" style="margin-bottom:0">' +
      '<span class="lab">Your question (optional)</span>' +
      '<input type="text" id="question" value="' + esc(d.question) + '" ' +
      'placeholder="What am I not seeing about this job offer?">' +
      '<span class="hint">A stated question sharpens the reading. Leaving it blank is fine — the cards will suggest one.</span>' +
      '</label>' +
      '<div class="field" style="margin-bottom:0"><span class="lab">What is it about?</span>' +
      '<div class="chip-row">';
    S.TOPICS.forEach(function (t) {
      h += '<button class="chip ' + ((d.topic || 'none') === t.id ? 'on' : '') + '" ' +
        'data-action="pick-topic" data-id="' + t.id + '" title="' + esc(t.blurb) + '">' + esc(t.chip) + '</button>';
    });
    h += '</div><span class="hint">Changes what each suit is pointing at. Pentacles means pay and hours in a work question, ' +
      'and who does the washing up in a relationship one.</span></div></div>';

    h += '<div class="board-shell"><div class="board" style="grid-template-columns:' + boardCols(sp, w) + '">';
    sp.positions.forEach(function (pos, i) {
      h += slotHTML(pos, i, d.draws[pos.id], w, true);
    });
    h += '</div></div>';

    h += '<div class="actions" style="margin-top:28px">' +
      '<button class="btn" data-action="read" ' + (filled < sp.positions.length ? 'disabled' : '') + '>' +
        (filled < sp.positions.length ? 'Place all ' + sp.positions.length + ' cards' : 'Read the spread') +
      '</button>' +
      '<button class="btn ghost" data-action="clear-board">Clear</button>' +
      '<button class="btn quiet" data-action="abandon">Choose a different spread</button>' +
      '</div></div>';

    return h;
  }

  /* ================= card picker ================= */

  function openPicker(posId) {
    var existing = state.draft.draws[posId];
    state.picker = {
      positionId: posId,
      reversed: existing ? !!existing.reversed : false,
      query: '', suit: 'all'
    };
    renderPicker();
  }

  function renderPicker() {
    var old = document.querySelector('.modal-backdrop');
    if (old) old.remove();
    if (!state.picker) return;

    var sp = S.getSpread(state.draft.spreadId);
    var pos = null;
    sp.positions.forEach(function (p) { if (p.id === state.picker.positionId) pos = p; });

    var used = {};
    Object.keys(state.draft.draws).forEach(function (k) {
      if (k !== state.picker.positionId) used[state.draft.draws[k].cardId] = true;
    });

    var here = state.draft.draws[state.picker.positionId];
    var chosen = here ? S.cardById(here.cardId) : null;

    var h = '<div class="modal-backdrop" data-action="close-picker-bg"><div class="modal">' +
      '<div class="modal-head">' +
        '<h3>' + esc(pos.name) + '</h3>' +
        '<button class="modal-close" data-action="close-picker">&times;</button>' +
        '<p class="posq">' + esc(pos.q) + '</p>' +
      '</div><div class="modal-body">' +
      '<div class="picker-controls">' +
        '<input type="text" id="pickerSearch" placeholder="Search by name or keyword…" value="' + esc(state.picker.query) + '" autofocus>' +
        '<div class="chip-row">' +
          chip('all', 'All 78') + chip('major', 'Major') + chip('minor', 'Minor') +
          chip('wands', 'Wands') + chip('cups', 'Cups') +
          chip('swords', 'Swords') + chip('pentacles', 'Pentacles') +
        '</div>' +
      '</div>' +
      '<div class="rev-toggle ' + (state.picker.reversed ? 'on' : '') + '" data-action="toggle-rev" style="margin-bottom:18px;width:max-content">' +
        '<span class="sw"></span><span class="lbl">' +
        (state.picker.reversed ? 'Reversed — card is upside down' : 'Upright') +
        (chosen ? ' · applies to ' + esc(chosen.name) + ' now' : '') + '</span>' +
      '</div>' +
      '<div class="card-grid">' + pickerGrid(used) + '</div></div></div></div>';

    var div = document.createElement('div');
    div.innerHTML = h;
    document.body.appendChild(div.firstChild);

    var si = document.getElementById('pickerSearch');
    si.addEventListener('input', function () {
      state.picker.query = si.value;
      document.querySelector('.card-grid').innerHTML = pickerGrid(used);
    });
    si.focus();
  }

  function pickerGrid(used) {
    var q = state.picker.query.toLowerCase();
    var s = state.picker.suit;
    var cards = S.CARDS.filter(function (c) {
      if (s === 'major' && c.arcana !== 'major') return false;
      if (s === 'minor' && c.arcana === 'major') return false;
      if (s !== 'all' && s !== 'major' && s !== 'minor' && c.suit !== s) return false;
      if (!q) return true;
      return c.name.toLowerCase().indexOf(q) >= 0 ||
             (c.kwU.join(' ') + ' ' + c.kwR.join(' ')).toLowerCase().indexOf(q) >= 0;
    });
    if (!cards.length) return '<p style="grid-column:1/-1;color:var(--muted)">No cards match that.</p>';
    var here = state.draft.draws[state.picker.positionId];
    var chosenId = here ? here.cardId : null;
    return cards.map(function (c) {
      var cls = used[c.id] ? 'used' : (c.id === chosenId ? 'chosen' : '');
      return '<button class="card-pick ' + cls + '" data-action="choose-card" data-id="' + c.id + '">' +
        '<span class="thumb">' + S.cardImgHTML(c, 200) + '</span>' +
        '<span class="nm">' + esc(c.name) + '</span></button>';
    }).join('');
  }

  function chip(id, label) {
    return '<button class="chip ' + (state.picker.suit === id ? 'on' : '') + '" data-action="picker-suit" data-suit="' + id + '">' +
      esc(label) + '</button>';
  }

  function closePicker() {
    state.picker = null;
    var m = document.querySelector('.modal-backdrop');
    if (m) m.remove();
  }

  /* ================= view: the reading ================= */

  function currentRecord() {
    if (state.openReadingId) return S.store.reading(state.openReadingId);
    return null;
  }

  function viewReading() {
    var rec = currentRecord();
    if (!rec) return '<div class="wrap view"><div class="empty"><h3>That reading could not be found.</h3></div></div>';

    var R = S.buildReading(rec.spreadId, rec.draws, rec.question, rec.id, null, rec.topic);
    var sp = S.getSpread(rec.spreadId);
    var w = slotWidth(sp.cols);

    var h = '<div class="wrap view reading">';

    h += '<div class="reading-meta"><span>' + esc(fmtDate(rec.date)) + '</span>' +
      '<span>' + esc(sp.name) + '</span>' +
      '<span>' + rec.draws.length + ' cards</span>' +
      '<span>' + R.stats.majors + ' major · ' + R.stats.reversed + ' reversed</span>' +
      (R.topicLabel ? '<span class="topic-tag">' + esc(R.topicLabel) + '</span>' : '') +
      (rec.guest ? '<span class="topic-tag guest">' +
        (rec.guestName ? 'For ' + esc(rec.guestName) : 'Guest reading') + '</span>' : '') + '</div>';

    if (rec.guest) {
      h += '<div class="guest-bar"><span class="tag">Guest reading</span>' +
        '<label>For <input type="text" id="guestNameEdit" value="' + esc(rec.guestName || '') + '" placeholder="a name"></label>' +
        '<button class="btn quiet sm" data-action="save-guest-name">Save name</button>' +
        '<span class="msg">Counts towards none of your own statistics.</span></div>';
    }

    if (rec.question) h += '<blockquote class="q">' + esc(rec.question) + '</blockquote>';
    else h += '<h1 style="margin-bottom:22px">' + esc(sp.name) + '</h1>';

    /* the board, as drawn */
    h += '<div class="board-shell"><div class="board" style="grid-template-columns:' + boardCols(sp, w) + '">';
    sp.positions.forEach(function (pos, i) {
      var placed = null;
      rec.draws.forEach(function (d) { if (d.positionId === pos.id) placed = d; });
      if (placed) h += slotHTML(pos, i, placed, w, false);
    });
    h += '</div></div>';

    /* overview */
    h += '<p class="section-label">The Shape of It</p><div class="prose">';
    R.overview.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
    h += '</div>';

    h += statBlock(R);

    h += '<div class="ornament">✦ ✦ ✦</div>';

    /* card by card */
    h += '<p class="section-label">Card by Card</p>';
    R.entries.forEach(function (e) {
      var card = S.cardById(e.cardId);
      h += '<div class="entry">' +
        '<div class="fig"><div class="shot ' + (e.reversed ? 'rev' : '') + '">' + S.cardImgHTML(card, 400) + '</div>' +
          '<div class="cname">' + esc(card.name) + '</div>' +
          '<div class="corient ' + (e.reversed ? 'rev' : '') + '">' + orientLabel(e.reversed) + ' · ' + esc(card.element) + '</div>' +
        '</div>' +
        '<div><h3 class="pos-title">' + esc(e.positionName) + '</h3>' +
          '<p class="pos-q">' + esc(e.positionQ) + '</p>' +
          (e.short ? '<p class="in-short"><b>In short</b>' + esc(e.short) + '</p>' : '') +
          '<div class="prose">';
      e.paragraphs.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
      h += '</div><div class="kw">';
      e.keywords.forEach(function (k) { h += '<span>' + esc(k) + '</span>'; });
      h += '</div>' +
        '<div class="look-closer"><b>Look closer</b>' + esc(e.symbolism) + '</div>' +
        '<div style="margin-top:14px"><button class="btn quiet sm" data-action="open-card" data-id="' + card.id + '">Full card entry →</button></div>' +
        '</div></div>';
    });

    /* read against the question's topic */
    if (R.topical.length) {
      h += '<div class="ornament">✦ ✦ ✦</div><p class="section-label">Read Against Your Question</p>' +
        '<div class="prose"><p>Because you said this was about ' + esc(R.topicLabel.toLowerCase()) +
        ', here is what each group of cards is pointing at in that particular part of life.</p></div>';
      R.topical.forEach(function (t) {
        h += '<div class="note-card topical s-' + t.suit + '"><h4>' + esc(t.title) + '</h4><p>' + esc(t.text) + '</p></div>';
      });
    }

    /* interactions */
    if (R.interactions.length) {
      h += '<div class="ornament">✦ ✦ ✦</div><p class="section-label">How the Cards Speak to Each Other</p>';
      R.interactions.forEach(function (i) {
        h += '<div class="note-card ' + i.kind + '"><p>' + esc(i.text) + '</p></div>';
      });
    }

    /* one of your own cards turned up */
    var mine = personalHits(R, rec);
    if (mine.length) {
      h += '<p class="section-label" style="margin-top:34px">One of your cards is here</p>';
      mine.forEach(function (m) {
        h += '<div class="note-card personal"><h4>' + esc(m.card.name) + ' — ' + esc(m.why) + '</h4>' +
          '<p>' + esc(m.card.name) + ' turned up at ' + esc(m.positionName.toLowerCase()) + '. ' +
          'This is a coincidence rather than a signal — but drawing a card already tied to you is the kind of thing ' +
          'worth noticing, and readers generally take it as a nudge to give that position more weight.</p></div>';
      });
    }

    /* patterns */
    if (R.patterns.length) {
      h += '<p class="section-label">Patterns Worth Noticing</p>';
      R.patterns.forEach(function (p) {
        h += '<div class="note-card"><h4>' + esc(p.title) + '</h4><p>' + esc(p.text) + '</p></div>';
      });
    }

    /* synthesis */
    h += '<div class="ornament">✦ ✦ ✦</div><p class="section-label">What It Adds Up To</p><div class="prose">';
    R.synthesis.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
    h += '</div>';

    /* advice */
    h += '<p class="section-label">If You Do One Thing</p><ul class="advice">';
    R.advice.forEach(function (a) {
      h += '<li><span class="src">' + esc(a.from) + '</span><span class="txt">' + esc(a.text) + '</span></li>';
    });
    h += '</ul>';

    /* AI deepening */
    h += '<div class="ornament">✦ ✦ ✦</div>' + aiSection(rec);

    /* how it landed — rating and notes, one section */
    var oc = rec.outcome || {};
    h += '<hr class="divider"><p class="section-label">How It Landed</p>' +
      '<div class="prose"><p>Come back to this once you know how things actually went. ' +
      'Rating your readings is the one part of Sage that measures anything real — with a few of them rated, ' +
      'it can tell you which cards you read well and which ones keep catching you out.</p></div>' +
      '<div class="rate-row">' +
        rateBtn('landed', oc.rating) +
        rateBtn('partly', oc.rating) +
        rateBtn('missed', oc.rating) +
        (oc.rating ? '<span class="rated-on">Rated ' + esc(fmtDate(oc.ratedAt || rec.date)) +
          ' · <a href="#" data-action="clear-outcome">clear</a></span>' : '') +
      '</div>' +
      '<textarea id="noteBox" class="grow" rows="5" placeholder="What actually happened? What resonated, and what did you disagree with?">' +
      esc(rec.note || '') + '</textarea>' +
      '<div class="note-print" id="notePrint">' + esc(rec.note || '') + '</div>' +
      '<div class="actions" style="margin-top:14px">' +
      '<button class="btn" data-action="save-note">Save</button>' +
      '<button class="btn quiet" data-action="print">Print / save as PDF</button>' +
      '<button class="btn danger" data-action="delete-reading" data-id="' + rec.id + '">Delete this reading</button>' +
      '</div>';

    h += '</div>';
    return h;
  }

  /* Cards in this spread that are already tied to the reader's birthday. */
  function personalHits(R, rec) {
    if (rec && rec.guest) return [];      // not your reading, not your cards
    var bd = S.store.settings().birthDate;
    if (!bd) return [];
    var labels = S.yourCardLabels(bd);
    var out = [];
    R.entries.forEach(function (e) {
      if (labels[e.cardId]) {
        out.push({ card: S.cardById(e.cardId), why: labels[e.cardId], positionName: e.positionName });
      }
    });
    return out;
  }

  /* Stored ratings stay 'landed' / 'partly' / 'missed' — only the wording changes. */
  var RATE_LABEL = { landed: 'Solid Reading', partly: 'Some Matches', missed: 'Missed the Mark' };
  var RATE_SHORT = { landed: 'Solid', partly: 'Partial', missed: 'Missed' };

  function rateBtn(id, current) {
    return '<button class="rate ' + id + (current === id ? ' on' : '') + '" data-action="rate" data-id="' + id + '">' +
      esc(RATE_LABEL[id]) + '</button>';
  }

  function statBlock(R) {
    var s = R.stats, total = s.n;
    var seg = function (cls, n) {
      return n ? '<i class="' + cls + '" style="width:' + (n / total * 100) + '%"></i>' : '';
    };
    return '<div class="panel" style="margin-top:26px">' +
      '<div class="stat-row">' +
        '<div class="stat"><div class="v">' + s.n + '</div><div class="l">Cards</div></div>' +
        '<div class="stat"><div class="v">' + s.majors + '</div><div class="l">Major</div></div>' +
        '<div class="stat"><div class="v">' + s.reversed + '</div><div class="l">Reversed</div></div>' +
        '<div class="stat"><div class="v">' + (s.dominantSuit ? SUIT_LABEL[s.dominantSuit] : '—') + '</div><div class="l">Leaning</div></div>' +
      '</div>' +
      '<div class="bar">' + seg('major', s.majors) + seg('wands', s.suits.wands) +
        seg('cups', s.suits.cups) + seg('swords', s.suits.swords) + seg('pentacles', s.suits.pentacles) + '</div>' +
      '<div class="legend">' +
        '<span><b style="background:var(--gold)"></b>Major</span>' +
        '<span><b style="background:#c9683f"></b>Wands</span>' +
        '<span><b style="background:#4f83b8"></b>Cups</span>' +
        '<span><b style="background:#9aa4bd"></b>Swords</span>' +
        '<span><b style="background:#7e9a5e"></b>Pentacles</span>' +
      '</div></div>';
  }

  /* ================= AI section of a reading ================= */

  function paras(text) {
    return String(text || '').split(/\n{2,}/).map(function (p) {
      return '<p>' + esc(p.trim()) + '</p>';
    }).join('');
  }

  function aiSection(rec) {
    var runs = rec.aiRuns || [];
    var configured = S.configuredProviders();
    var primary = S.primaryProvider();

    if (!runs.length) {
      if (!configured.length) {
        return '<div class="panel"><h3 style="margin-bottom:8px">Want a second voice on this?</h3>' +
          '<p style="color:var(--cream-dim);margin-bottom:16px">Sage can send this spread to Claude, GPT or Gemini for an ' +
          'original, freshly-written interpretation alongside the one above. Add a key in Settings — it is stored ' +
          'only in this browser and sent only to the provider it belongs to.</p>' +
          '<button class="btn ghost" data-action="goto-settings">Add a key</button></div>';
      }
      return '<div class="panel"><h3 style="margin-bottom:8px">Want a second voice on this?</h3>' +
        '<p style="color:var(--cream-dim);margin-bottom:16px">' +
        (configured.length > 1
          ? 'Deepening asks ' + esc(primary.name) + ', your primary. Convening the council asks all ' + configured.length +
            ' of your providers the same question independently, then compares where they agreed and where they did not.'
          : 'This sends the spread to ' + esc(primary.name) + ' for an original interpretation.') +
        '</p><div class="actions">' +
        '<button class="btn ghost" data-action="ai-deepen">' +
          (state.aiBusy ? 'Writing…' : 'Deepen with ' + esc(primary.name)) + '</button>' +
        (configured.length > 1
          ? '<button class="btn quiet" data-action="ai-council">' +
            (state.aiBusy ? 'Working…' : 'Convene the council (' + configured.length + ')') + '</button>'
          : '') +
        '</div></div>';
    }

    var ok = runs.filter(function (r) { return r.text; });
    var bad = runs.filter(function (r) { return r.error; });
    var h = '<p class="section-label">' + (ok.length > 1 ? 'The Council' : 'A Second Voice') + '</p>';

    if (rec.aiSummary) {
      h += '<div class="council-summary"><b>Where they agreed, and where they did not</b>' +
        '<div class="prose">' + paras(rec.aiSummary) + '</div></div>';
    }

    if (ok.length > 1) {
      var tab = Math.min(state.aiTab, ok.length - 1);
      h += '<div class="ai-tabs">';
      ok.forEach(function (r, i) {
        var p = S.getProvider(r.provider);
        h += '<button class="ai-tab' + (i === tab ? ' on' : '') + '" data-action="ai-tab" data-i="' + i + '">' +
          esc(p ? p.flavour : r.provider) + '</button>';
      });
      h += '</div>';

      /* Every reading is in the page; the tabs only decide which one is visible.
         That way printing gets all of them rather than whichever was on screen. */
      h += ok.map(function (r, i) {
        var p = S.getProvider(r.provider) || {};
        var who = esc(p.name || r.provider) + (r.model ? ' · ' + esc(r.model) : '');
        return '<div class="ai-run' + (i === tab ? ' on' : '') + '">' +
          '<p class="ai-run-head">' + who + '</p>' +
          '<div class="prose">' + paras(r.text) + '</div>' +
          '<p class="ai-meta">' + who + '</p>' +
        '</div>';
      }).join('');
    } else if (ok.length === 1) {
      h += '<div class="prose">' + paras(ok[0].text) + '</div>' +
        '<p class="ai-meta">' + esc((S.getProvider(ok[0].provider) || {}).name || ok[0].provider) +
        (ok[0].model ? ' · ' + esc(ok[0].model) : '') + '</p>';
    }

    bad.forEach(function (r) {
      h += '<div class="note-card" style="border-left-color:var(--rose)"><h4>' +
        esc((S.getProvider(r.provider) || {}).name || r.provider) + ' could not be reached</h4>' +
        '<p>' + esc(r.error) + '</p></div>';
    });

    h += '<div class="actions">' +
      '<button class="btn quiet sm" data-action="ai-deepen">' +
        (state.aiBusy ? 'Working…' : 'Ask ' + esc(primary.name) + ' again') + '</button>' +
      (configured.length > 1 ? '<button class="btn quiet sm" data-action="ai-council">' +
        (state.aiBusy ? 'Working…' : 'Convene the council') + '</button>' : '') +
      '<button class="btn quiet sm" data-action="ai-clear">Remove</button></div>';

    return h;
  }

  /* ================= view: journal ================= */

  function journalItem(r) {
    var d = new Date(r.date);
    var sp = S.getSpread(r.spreadId);
    var thumbs = '';
    r.draws.slice(0, 5).forEach(function (dr) {
      var c = S.cardById(dr.cardId);
      if (c) thumbs += '<span style="display:inline-block;width:23px;height:39px;overflow:hidden;border-radius:2px;border:1px solid var(--line)">' +
        S.cardImgHTML(c, 100) + '</span>';
    });
    if (r.draws.length > 5) thumbs += '<span class="more">+' + (r.draws.length - 5) + '</span>';

    return '<button class="journal-item" data-action="open-reading" data-id="' + r.id + '">' +
      '<span class="date"><span class="d">' + d.getDate() + '</span>' +
        '<span class="m">' + d.toLocaleDateString(undefined, { month: 'short' }) + ' ' + d.getFullYear() + '</span></span>' +
      '<span><span class="q">' + esc(r.question || (sp ? sp.name : 'Untitled reading')) + '</span>' +
        '<span class="sub">' + esc(sp ? sp.name : '') + ' · ' + r.draws.length + ' cards' +
        (r.topic && r.topic !== 'none' && S.getTopic(r.topic) ? ' · ' + esc(S.getTopic(r.topic).chip.toLowerCase()) : '') +
        (r.guest ? ' · <b class="guest-flag">guest' + (r.guestName ? ': ' + esc(r.guestName) : '') + '</b>' : '') +
        (r.note ? ' · noted' : '') +
        (r.outcome && r.outcome.rating
          ? ' · <b class="rate-dot ' + r.outcome.rating + '"></b>' + esc(RATE_LABEL[r.outcome.rating].toLowerCase())
          : '') +
        '</span></span>' +
      '<span class="thumbs">' + thumbs + '</span></button>';
  }

  function viewJournal() {
    var all = S.store.readings();
    var h = '<div class="wrap view"><div class="page-head">' +
      '<div class="eyebrow">Journal</div><h1>Your readings</h1>' +
      '<p class="lede">Every reading you have saved, newest first. Open one to reread it, add a note, or record what actually happened.</p>' +
      '</div>';

    if (!all.length) {
      h += '<div class="empty"><div class="glyph">✦</div><h3>Nothing here yet</h3>' +
        '<p>Your saved readings will collect here.</p>' +
        '<button class="btn ghost" style="margin-top:16px" data-action="goto-draw">Draw your first spread</button></div>';
    } else {
      h += '<div class="journal-list">';
      all.forEach(function (r) { h += journalItem(r); });
      h += '</div>';
    }

    var guests = S.store.guestReadings();
    if (guests.length) {
      h += '<hr class="divider"><div class="note-card"><h4>' + guests.length +
        ' guest reading' + (guests.length === 1 ? '' : 's') + '</h4>' +
        '<p>Readings you drew for other people are filed separately and count towards none of your own statistics.</p>' +
        '<div class="actions" style="margin-top:12px">' +
        '<button class="btn ghost sm" data-action="goto-guests">View them</button>' +
        '<button class="btn danger sm" data-action="clear-guests">Delete them all</button></div></div>';
    }
    return h + '</div>';
  }

  /* ================= view: guest readings ================= */

  function viewGuests() {
    var all = S.store.guestReadings();
    var h = '<div class="wrap view"><div class="page-head">' +
      '<div class="eyebrow">Guest Readings</div><h1>Readings for other people</h1>' +
      '<p class="lede">Kept completely separate from your own. None of these count towards your themes, ' +
      'your streak, your draw tallies or your card accuracy, and your birth cards are never looked for in them.</p></div>';

    if (!all.length) {
      h += '<div class="empty"><div class="glyph">✦</div><h3>No guest readings</h3>' +
        '<p>Turn on “Reading for someone else” before drawing, and it will be filed here.</p>' +
        '<button class="btn ghost" style="margin-top:16px" data-action="goto-draw">Draw one</button></div></div>';
      return h;
    }

    /* Group by whoever it was for. */
    var groups = {}, order = [];
    all.forEach(function (r) {
      var k = (r.guestName || '').trim() || '—';
      if (!groups[k]) { groups[k] = []; order.push(k); }
      groups[k].push(r);
    });

    order.forEach(function (name) {
      h += '<p class="section-label">' + esc(name === '—' ? 'No name given' : name) +
        ' <span style="float:right;letter-spacing:normal;text-transform:none;color:var(--muted)">' +
        groups[name].length + '</span></p><div class="journal-list" style="margin-bottom:26px">';
      groups[name].forEach(function (r) { h += journalItem(r); });
      h += '</div>';
    });

    h += '<hr class="divider"><div class="actions">' +
      '<button class="btn danger" data-action="clear-guests">Delete all ' + all.length + ' guest readings</button>' +
      '</div></div>';
    return h;
  }

  /* ================= view: themes ================= */

  function viewThemes() {
    var all = S.store.readings();
    var h = '<div class="wrap view"><div class="page-head">' +
      '<div class="eyebrow">Themes</div><h1>What keeps coming up</h1>' +
      '<p class="lede">Patterns across your readings rather than inside any one of them. Cards that keep returning, ' +
      'the element your life is currently being decided in, and the stages you keep meeting.</p></div>';

    if (all.length < 2) {
      h += '<div class="empty"><div class="glyph">✦</div><h3>Not enough readings yet</h3>' +
        '<p>Themes need at least two saved readings to compare. You have ' + all.length + '.</p></div></div>';
      return h;
    }

    var T = S.findThemes(all);

    h += '<div class="panel" style="margin-bottom:26px"><div class="stat-row">' +
      '<div class="stat"><div class="v">' + T.readingCount + '</div><div class="l">Readings</div></div>' +
      '<div class="stat"><div class="v">' + T.cardTotal + '</div><div class="l">Cards drawn</div></div>' +
      '<div class="stat"><div class="v">' + T.recurring.length + '</div><div class="l">Repeat cards</div></div>' +
      '</div></div>';

    if (!T.notes.length) {
      h += '<div class="empty"><p>No strong patterns yet — keep drawing. Themes sharpen after five or six readings.</p></div>';
    }
    T.notes.forEach(function (n) {
      h += '<div class="note-card"><h4>' + esc(n.title) + '</h4><p>' + esc(n.text) + '</p></div>';
    });

    /* how your readings have actually turned out */
    var rated = S.store.ratedReadings();
    if (rated.length) {
      var tally = { landed:0, partly:0, missed:0 };
      rated.forEach(function (r) { tally[r.outcome.rating]++; });
      var pct = Math.round((tally.landed + tally.partly * 0.5) / rated.length * 100);

      h += '<hr class="divider"><p class="section-label">How your readings have turned out</p>';
      h += '<div class="panel" style="margin-bottom:18px"><div class="stat-row">' +
        '<div class="stat"><div class="v">' + rated.length + '</div><div class="l">Rated</div></div>' +
        '<div class="stat"><div class="v" style="color:#7fa87f">' + tally.landed + '</div><div class="l">' + RATE_SHORT.landed + '</div></div>' +
        '<div class="stat"><div class="v">' + tally.partly + '</div><div class="l">' + RATE_SHORT.partly + '</div></div>' +
        '<div class="stat"><div class="v" style="color:var(--rose)">' + tally.missed + '</div><div class="l">' + RATE_SHORT.missed + '</div></div>' +
        '<div class="stat"><div class="v">' + pct + '%</div><div class="l">Hit rate</div></div>' +
        '</div></div>';

      if (rated.length >= 4) {
        var acc = S.store.cardAccuracy();
        var ranked = Object.keys(acc).map(function (id) {
          var a2 = acc[id], n = a2.landed + a2.missed;
          return { card: S.cardById(id), n: n, rate: a2.landed / n, landed: a2.landed, missed: a2.missed };
        }).filter(function (x) { return x.card && x.n >= 2; });

        var strong = ranked.filter(function (x) { return x.rate >= 0.7; }).sort(function (a2, b) { return b.n - a2.n; }).slice(0, 6);
        var weak = ranked.filter(function (x) { return x.rate <= 0.34; }).sort(function (a2, b) { return b.n - a2.n; }).slice(0, 6);

        if (strong.length) h += '<div class="note-card"><h4>Cards you read well</h4><p>' +
          esc(strong.map(function (x) { return x.card.name; }).join(', ')) +
          '. These turn up mostly in readings you rated a solid reading. Whatever you are doing with them, keep doing it.</p></div>';
        if (weak.length) h += '<div class="note-card"><h4>Cards that catch you out</h4><p>' +
          esc(weak.map(function (x) { return x.card.name; }).join(', ')) +
          '. These show up mostly in readings you rated as missing the mark. That usually means you are reading them too literally, ' +
          'or you have fixed on one of their meanings and stopped seeing the others. Worth a trip to the Library.</p></div>';
        if (!strong.length && !weak.length) h += '<div class="note-card"><p>No card stands out yet as one you read particularly ' +
          'well or badly. Rate a few more readings and this will sharpen up.</p></div>';
      } else {
        h += '<div class="note-card"><p>Rate ' + (4 - rated.length) + ' more reading' + (4 - rated.length === 1 ? '' : 's') +
          ' and Sage will start showing you which individual cards you read well and which ones keep catching you out.</p></div>';
      }
    } else if (all.length >= 2) {
      h += '<hr class="divider"><div class="note-card"><h4>Nothing rated yet</h4><p>Open an old reading and mark whether it landed. ' +
        'Once a few are rated, this page can show you which cards you read well and which ones you keep misjudging — ' +
        'which is the fastest way to actually get better at this.</p></div>';
    }

    if (T.recurring.length) {
      h += '<hr class="divider"><p class="section-label">Cards that have returned</p><div class="lib-grid">';
      T.recurring.slice(0, 18).forEach(function (f) {
        h += '<button class="lib-card" data-action="open-card" data-id="' + f.card.id + '">' +
          '<span class="thumb">' + S.cardImgHTML(f.card, 200) + '</span>' +
          '<span class="nm">' + esc(f.card.name) + '<br><span style="color:var(--gold-dim);font-size:.7rem">×' +
          f.readings.length + '</span></span></button>';
      });
      h += '</div>';
    }

    return h + '</div>';
  }

  /* ================= view: library ================= */

  function mastery(id) {
    var st = S.store.cardStat(id);
    var tries = st.correct + st.wrong;
    if (!tries && !st.seen) return 0;
    if (!tries) return 1;
    var r = st.correct / tries;
    if (tries >= 3 && r >= 0.8) return 3;
    if (r >= 0.5) return 2;
    return 1;
  }

  function libGrid() {
    var f = state.libFilter;
    var q = f.q.toLowerCase();
    var cards = S.CARDS.filter(function (c) {
      if (f.suit === 'major' && c.arcana !== 'major') return false;
      if (f.suit === 'minor' && c.arcana === 'major') return false;
      if (f.suit !== 'all' && f.suit !== 'major' && f.suit !== 'minor' && c.suit !== f.suit) return false;
      if (!q) return true;
      return (c.name + ' ' + c.kwU.join(' ') + ' ' + c.kwR.join(' ') + ' ' + c.element).toLowerCase().indexOf(q) >= 0;
    });
    if (!cards.length) return '<p style="grid-column:1/-1;color:var(--muted)">Nothing matches that search.</p>';
    return cards.map(function (c) {
      return '<button class="lib-card" data-action="open-card" data-id="' + c.id + '">' +
        '<span class="mastery m' + mastery(c.id) + '"></span>' +
        '<span class="thumb">' + S.cardImgHTML(c, 200) + '</span>' +
        '<span class="nm">' + esc(c.name) + '</span></button>';
    }).join('');
  }

  function viewLibrary() {
    var f = state.libFilter;
    var st = S.store.study();
    var known = 0;
    S.CARDS.forEach(function (c) { if (mastery(c.id) >= 2) known++; });

    var h = '<div class="wrap view"><div class="page-head">' +
      '<div class="eyebrow">Library</div><h1>All 78 cards</h1>' +
      '<p class="lede">The full deck with upright and reversed meanings, symbolism, element and attribution. ' +
      'The dot on each card tracks how well you know it: grey unseen, rose shaky, gold getting there, green solid.</p></div>';

    h += '<div class="panel" style="margin-bottom:24px"><div class="stat-row">' +
      '<div class="stat"><div class="v">' + known + '<span style="font-size:1rem;color:var(--muted)">/78</span></div><div class="l">Cards you know</div></div>' +
      '<div class="stat"><div class="v">' + (st.quizzes || 0) + '</div><div class="l">Quiz answers</div></div>' +
      '<div class="stat"><div class="v">' + Object.keys(S.store.drawCounts()).length +
        '</div><div class="l">Cards drawn</div></div>' +
      '</div></div>';

    h += '<div class="picker-controls" style="margin-bottom:22px">' +
      '<input type="text" id="libSearch" placeholder="Search names, keywords, elements…" value="' + esc(f.q) + '">' +
      '<div class="chip-row">' +
        libChip('all', 'All 78') + libChip('major', 'Major 22') + libChip('minor', 'Minor 56') +
        libChip('wands', 'Wands') + libChip('cups', 'Cups') +
        libChip('swords', 'Swords') + libChip('pentacles', 'Pentacles') +
      '</div></div>';

    h += '<div class="lib-grid">' + libGrid() + '</div></div>';
    return h;
  }

  function libChip(id, label) {
    return '<button class="chip ' + (state.libFilter.suit === id ? 'on' : '') + '" data-action="lib-suit" data-suit="' + id + '">' +
      esc(label) + '</button>';
  }

  function viewCard() {
    var c = S.cardById(state.openCardId);
    if (!c) return '<div class="wrap view"><div class="empty"><h3>Card not found.</h3></div></div>';

    var st = S.store.cardStat(c.id);
    var appearances = [];
    S.store.readings().forEach(function (r) {
      r.draws.forEach(function (d) {
        if (d.cardId === c.id) appearances.push({ r: r, d: d });
      });
    });

    var rank = c.arcana === 'major' ? ROMAN[c.num] : (RANK[c.num] || c.num);
    var suitTxt = c.arcana === 'major' ? 'Major Arcana' : (RANK[c.num] ? RANK[c.num] : c.num) + ' of ' + SUIT_LABEL[c.suit];

    var h = '<div class="wrap view">' +
      '<button class="btn quiet sm" style="margin-bottom:20px" data-action="goto-library">← Library</button>' +
      '<div class="detail">' +
      '<div><div class="art">' + S.cardImgHTML(c, 700) + '</div>' +
        '<table class="meta-table">' +
          row('Arcana', c.arcana === 'major' ? 'Major · ' + rank : 'Minor') +
          row('Suit', c.arcana === 'major' ? '—' : SUIT_LABEL[c.suit]) +
          row('Element', c.element) +
          row('Attribution', c.astro) +
          row('Times drawn', String(st.seen || 0)) +
          row('Quiz record', (st.correct || 0) + ' right · ' + (st.wrong || 0) + ' wrong') +
          (function () {
            var acc = S.store.cardAccuracy()[c.id];
            if (!acc || !(acc.landed + acc.missed)) return '';
            return row('In rated readings', acc.landed + ' solid · ' + acc.missed + ' missed');
          })() +
        '</table>' +
        (function () {
          var acc = S.store.cardAccuracy()[c.id];
          if (!acc || acc.landed + acc.missed < 3) return '';
          var pct = acc.landed / (acc.landed + acc.missed);
          if (pct >= 0.7) return '<p class="acc-note good">You read this one well — it shows up mostly in readings you rated a solid reading.</p>';
          if (pct <= 0.34) return '<p class="acc-note bad">This one keeps catching you out. It turns up mostly in readings you rated as missing the mark — worth restudying.</p>';
          return '';
        })() +
        '</div>' +
      '<div>' +
        '<div class="eyebrow" style="font-size:.68rem;letter-spacing:.3em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:10px">' +
          esc(suitTxt) + '</div>' +
        '<h1 style="margin-bottom:14px">' + esc(c.name) + '</h1>' +
        (S.cardShort(c) ? '<p class="in-short big"><b>In short</b>' + esc(S.cardShort(c)) + '</p>' : '') +

        '<div class="mean-block"><h4>Upright</h4><div class="kw" style="margin-bottom:12px">' +
          c.kwU.map(function (k) { return '<span>' + esc(k) + '</span>'; }).join('') + '</div>' +
          '<div class="prose"><p>' + esc(S.cardText(c, 'up')) + '</p></div></div>' +

        '<div class="mean-block rev"><h4>Reversed</h4><div class="kw" style="margin-bottom:12px">' +
          c.kwR.map(function (k) { return '<span>' + esc(k) + '</span>'; }).join('') + '</div>' +
          '<div class="prose"><p>' + esc(S.cardText(c, 'rev')) + '</p></div></div>' +

        '<div class="look-closer" style="margin-bottom:26px"><b>In the picture</b>' + esc(c.sym) + '</div>' +

        '<div class="note-card"><h4>The turn</h4><p>' + esc(c.advice) + '</p></div>';

    if (appearances.length) {
      h += '<hr class="divider"><p class="section-label">In your readings</p><div class="journal-list">';
      appearances.slice(0, 8).forEach(function (a) {
        var sp = S.getSpread(a.r.spreadId);
        var posName = '';
        sp.positions.forEach(function (p) { if (p.id === a.d.positionId) posName = p.name; });
        h += '<button class="journal-item" data-action="open-reading" data-id="' + a.r.id + '">' +
          '<span class="date"><span class="d">' + new Date(a.r.date).getDate() + '</span>' +
          '<span class="m">' + new Date(a.r.date).toLocaleDateString(undefined, { month:'short' }) + '</span></span>' +
          '<span><span class="q">' + esc(a.r.question || sp.name) + '</span>' +
          '<span class="sub">as ' + esc(posName) + ' · ' + (a.d.reversed ? 'reversed' : 'upright') + '</span></span>' +
          '<span></span></button>';
      });
      h += '</div>';
    }

    h += '</div></div></div>';
    return h;
  }

  function row(k, v) { return '<tr><td>' + esc(k) + '</td><td>' + esc(v) + '</td></tr>'; }

  /* ================= view: study ================= */

  function weightedCard() {
    var drawn = S.store.drawCounts();
    var study = S.store.study();
    var pool = [];
    S.CARDS.forEach(function (c) {
      var q = study.cards[c.id] || {};
      var s = { seen: drawn[c.id] || 0, correct: q.correct || 0, wrong: q.wrong || 0 };
      var w = 1;
      if (s.seen) w += 3;                       // cards you have actually drawn
      w += Math.min(s.wrong, 5) * 3;            // cards you keep getting wrong
      if (s.correct >= 3 && s.wrong === 0) w = 1; // known cards fade back
      for (var i = 0; i < w; i++) pool.push(c);
    });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function makeQuestion() {
    var card = weightedCard();
    var kinds = ['name', 'meaning', 'keywords', 'element'];
    var kind = kinds[Math.floor(Math.random() * kinds.length)];
    var reversed = kind === 'meaning' && Math.random() < 0.4;

    var others = shuffle(S.CARDS.filter(function (c) { return c.id !== card.id; })).slice(0, 3);

    if (kind === 'name') {
      return {
        kind: kind, card: card, reversed: false, showArt: true,
        prompt: 'Which card is this?',
        options: shuffle(others.concat([card]).map(function (c) {
          return { label: c.name, correct: c.id === card.id };
        }))
      };
    }
    if (kind === 'element') {
      var els = ['Fire', 'Water', 'Air', 'Earth'];
      return {
        kind: kind, card: card, reversed: false, showArt: true,
        prompt: 'Which element governs ' + card.name + '?',
        options: shuffle(els.map(function (e) { return { label: e, correct: e === card.element }; }))
      };
    }
    if (kind === 'keywords') {
      return {
        kind: kind, card: card, reversed: false, showArt: false,
        prompt: 'Which card carries these upright keywords? — “' + card.kwU.slice(0, 3).join(', ') + '”',
        options: shuffle(others.concat([card]).map(function (c) {
          return { label: c.name, correct: c.id === card.id };
        }))
      };
    }
    return {
      kind: 'meaning', card: card, reversed: reversed, showArt: true,
      prompt: 'What does ' + card.name + ' mean ' + (reversed ? 'reversed' : 'upright') + '?',
      options: shuffle(others.concat([card]).map(function (c) {
        return {
          label: (reversed ? c.kwR : c.kwU).slice(0, 4).join(' · '),
          correct: c.id === card.id
        };
      }))
    };
  }

  function viewStudy() {
    if (!state.quiz) {
      var st = S.store.study();
      var drawn = Object.keys(S.store.drawCounts()).length;
      return '<div class="wrap view"><div class="page-head">' +
        '<div class="eyebrow">Study</div><h1>Learn the deck</h1>' +
        '<p class="lede">Short quizzes drawn from the whole deck, weighted toward cards you have actually pulled ' +
        'in your readings and cards you have got wrong before. Ten questions at a time.</p></div>' +
        '<div class="panel" style="margin-bottom:26px"><div class="stat-row">' +
          '<div class="stat"><div class="v">' + (st.quizzes || 0) + '</div><div class="l">Answered</div></div>' +
          '<div class="stat"><div class="v">' + drawn + '</div><div class="l">Cards you have drawn</div></div>' +
        '</div></div>' +
        '<div class="actions"><button class="btn" data-action="quiz-start">Start a round</button>' +
        '<button class="btn ghost" data-action="goto-library">Browse the library instead</button></div></div>';
    }

    var Q = state.quiz;
    if (Q.index >= Q.total) {
      var pct = Math.round(Q.right / Q.total * 100);
      return '<div class="wrap view"><div class="quiz-stage">' +
        '<h1 style="margin-bottom:14px">' + Q.right + ' of ' + Q.total + '</h1>' +
        '<p style="color:var(--cream-dim);margin-bottom:28px">' +
        (pct >= 80 ? 'Strong round. The cards you missed have been flagged for next time.'
         : pct >= 50 ? 'Solid. The misses will come round again more often until they stick.'
         : 'Early days — that is what the weighting is for. These will keep returning.') + '</p>' +
        '<div class="actions" style="justify-content:center">' +
        '<button class="btn" data-action="quiz-start">Another round</button>' +
        '<button class="btn ghost" data-action="quiz-end">Done</button></div></div></div>';
    }

    var q = Q.questions[Q.index];
    var h = '<div class="wrap view"><div class="quiz-stage">' +
      '<div class="progress-track"><i style="width:' + (Q.index / Q.total * 100) + '%"></i></div>';

    if (q.showArt) {
      h += '<div class="art ' + (q.reversed ? 'rev' : '') + '">' + S.cardImgHTML(q.card, 400) + '</div>';
    }
    h += '<div class="quiz-prompt">' + esc(q.prompt) + '</div><div class="quiz-opts">';
    q.options.forEach(function (o, i) {
      var cls = '';
      if (Q.answered) {
        if (o.correct) cls = 'right';
        else if (Q.chosen === i) cls = 'wrong';
      }
      h += '<button class="quiz-opt ' + cls + '" data-action="quiz-answer" data-i="' + i + '" ' +
        (Q.answered ? 'disabled' : '') + '>' + esc(o.label) + '</button>';
    });
    h += '</div>';

    if (Q.answered) {
      h += '<div class="quiz-feedback">' +
        (S.cardShort(q.card) ? '<p class="in-short"><b>In short</b>' + esc(S.cardShort(q.card)) + '</p>' : '') +
        '<div class="note-card"><h4>' + esc(q.card.name) + '</h4>' +
        '<p>' + esc(S.cardText(q.card, q.reversed ? 'rev' : 'up')) + '</p></div>' +
        '<div class="look-closer"><b>Look closer</b>' + esc(q.card.sym) + '</div>' +
        '<div class="actions" style="margin-top:20px;justify-content:center">' +
        '<button class="btn" data-action="quiz-next">Next →</button></div></div>';
    }

    h += '</div></div>';
    return h;
  }

  /* ================= view: your cards ================= */

  function bigCard(card, caption, why) {
    return '<button class="big-card" data-action="open-card" data-id="' + card.id + '">' +
      '<span class="art">' + S.cardImgHTML(card, 400) + '</span>' +
      '<span class="meta">' +
        (caption ? '<span class="cap">' + esc(caption) + '</span>' : '') +
        '<span class="nm">' + esc(card.name) + '</span>' +
        (S.cardShort(card) ? '<span class="sh">' + esc(S.cardShort(card)) + '</span>' : '') +
        (why ? '<span class="why">' + esc(why) + '</span>' : '') +
      '</span></button>';
  }

  function working(opening, steps) {
    return '<div class="working"><b>How this was worked out</b>' +
      '<code>' + esc(opening) + '</code>' +
      steps.map(function (s) { return '<code>' + esc(s) + '</code>'; }).join('') +
      '</div>';
  }

  function viewYours() {
    var s = S.store.settings();
    var h = '<div class="wrap view reading"><div class="page-head">' +
      '<div class="eyebrow">Your Cards</div><h1>Cards tied to your birthday</h1>' +
      '<p class="lede">Two old traditions that connect you to particular cards in the deck. ' +
      'Worth being straight about what these are: conventions, not mechanisms. They do not make readings ' +
      'more accurate — they give you a personal thread through the deck, which is its own kind of useful.</p></div>';

    if (!s.birthDate) {
      h += '<div class="empty"><div class="glyph">✦</div><h3>No birth date set</h3>' +
        '<p>Add your date of birth in Settings and this page fills in. The date is stored only in this browser, ' +
        'and only the day, month and year are used — no time, no location.</p>' +
        '<button class="btn ghost" style="margin-top:16px" data-action="goto-settings">Open Settings</button></div></div>';
      return h;
    }

    var Y = S.yourCards(s.birthDate);
    if (!Y) {
      h += '<div class="empty"><h3>That birth date could not be read.</h3>' +
        '<p>Check it in Settings — it needs to be a real calendar date.</p></div></div>';
      return h;
    }

    /* ---- birth card ---- */
    h += '<p class="section-label">Your birth card</p><div class="prose">' +
      '<p>Add the month, the day and the year of your birth together, then keep adding the digits until you reach ' +
      '22 or less. The number that falls out points at a Major Arcana card, said to describe the themes you work ' +
      'with across a whole life.</p>' +
      (Y.birth.cards.length > 1
        ? '<p>Your total landed between 10 and 21, which reduces once more — so you get a pair. The first is usually ' +
          'read as the outward version of the theme and the second as what sits underneath it.</p>'
        : '') +
      (Y.birth.fool ? '<p>Your total came to 22. There is no card 22 in the Major Arcana, so by convention it reads as ' +
        'card 0, The Fool.</p>' : '') +
      '</div>';
    h += working(Y.birth.opening, Y.birth.steps);
    h += '<div class="card-row">';
    Y.birth.cards.forEach(function (c, i) {
      h += bigCard(c, Y.birth.cards.length > 1 ? (i === 0 ? 'Birth card' : 'Its pair') : 'Birth card', '');
    });
    h += '</div>';

    /* ---- year card ---- */
    var yFrom = Y.year.runsFrom, yTo = Y.year.runsTo;
    h += '<p class="section-label">Your card for this year</p><div class="prose">' +
      '<p>The same arithmetic with the current year instead of your birth year. It runs birthday to birthday rather ' +
      'than January to January, so yours covers ' + esc(fmtDate(yFrom.toISOString())) + ' to ' +
      esc(fmtDate(yTo.toISOString())) + '.</p></div>';
    h += working(Y.year.opening, Y.year.steps);
    h += '<div class="card-row">';
    Y.year.cards.forEach(function (c, i) {
      h += bigCard(c, i === 0 ? 'This year' : 'Its pair', '');
    });
    h += '</div>';

    /* ---- sun sign cards ---- */
    if (Y.sign && Y.signCards) {
      h += '<p class="section-label">The cards of your sign</p><div class="prose">' +
        '<p>This part is not arithmetic — it comes straight out of the deck. When the Golden Dawn built this system ' +
        'in the 1880s they gave every card an astrological attribution, and you can read those attributions backwards. ' +
        'Each sign owns one Major Arcana card, and the zodiac divides into 36 ten-degree segments called decans, ' +
        'each of which owns one numbered minor card. Three decans per sign, so three cards.</p>' +
        '<p>You are ' + esc(Y.sign.name) + ' (' + esc(Y.sign.element) + '), so these four are yours.</p>' +
        (Y.nearCusp ? '<p><b>One caveat:</b> your birthday sits within a day of a sign boundary, and those boundaries ' +
          'move slightly from year to year. If you have ever been told you are the neighbouring sign, you may well be — ' +
          'check an ephemeris for your birth year.</p>' : '') +
        '</div>';

      h += '<div class="card-row">';
      if (Y.signCards.major) {
        h += bigCard(Y.signCards.major, 'Major of ' + Y.sign.name, Y.signCards.major.astro);
      }
      Y.signCards.decans.forEach(function (c, i) {
        h += bigCard(c, 'Decan ' + (i + 1), c.astro);
      });
      h += '</div>';
    }

    h += '<div class="ornament">✦ ✦ ✦</div>' +
      '<div class="note-card"><h4>What these are and are not</h4>' +
      '<p>The sign cards are simply the deck read backwards — those attributions are printed on every card page ' +
      'under "Attribution", and nothing about them requires your birth data beyond the date. The birth and year ' +
      'cards are a twentieth-century numerology practice, and readers genuinely disagree about the method; ' +
      'Sage uses ' + esc(S.BIRTH_METHOD) + ', which is the most common variant. None of this changes what a card ' +
      'means when you draw it.</p></div>';

    return h + '</div>';
  }

  /* ================= view: learn ================= */

  function viewLearn() {
    var h = '<div class="wrap view reading"><div class="page-head">' +
      '<div class="eyebrow">Learn</div><h1>Starting from scratch</h1>' +
      '<p class="lede">Everything you need to make sense of a reading, in plain English. ' +
      'You do not have to read it in order — but the first three sections do most of the work.</p></div>';

    h += '<nav class="learn-toc">';
    S.LEARN.forEach(function (s) {
      h += '<a href="#learn-' + s.id + '">' + esc(s.title) + '</a>';
    });
    h += '</nav>';

    S.LEARN.forEach(function (s) {
      h += '<p class="section-label" id="learn-' + s.id + '">' + esc(s.title) + '</p><div class="prose">';
      s.body.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
      h += '</div>';

      if (s.table) {
        h += '<table class="suit-table"><thead><tr><th>Suit</th><th>Element</th><th>Covers</th></tr></thead><tbody>';
        s.table.forEach(function (row) {
          h += '<tr><td class="s-' + row[0].toLowerCase() + '">' + esc(row[0]) + '</td>' +
               '<td>' + esc(row[1]) + '</td><td>' + esc(row[2]) + '</td></tr>';
        });
        h += '</tbody></table>';
      }
      if (s.after) {
        h += '<div class="prose">';
        s.after.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
        h += '</div>';
      }
    });

    h += '<div class="ornament">✦ ✦ ✦</div>' +
      '<div class="panel"><h3 style="margin-bottom:8px">Ready to try one?</h3>' +
      '<p>A single card takes a minute and is the best way to start. Shuffle, pull one, and record it.</p>' +
      '<div class="actions" style="margin-top:14px">' +
      '<button class="btn" data-action="goto-draw">Draw a reading</button>' +
      '<button class="btn ghost" data-action="goto-library">Browse all 78 cards</button></div></div>';

    return h + '</div>';
  }

  /* ================= view: settings ================= */

  function providerFields(s) {
    var ai = s.ai || {};
    var configured = S.configuredProviders();
    var h = '';

    S.PROVIDERS.forEach(function (p) {
      var c = ai[p.id] || {};
      h += '<div class="prov"><div class="prov-head">' +
        '<b>' + esc(p.name) + '</b><span>' + esc(p.flavour) + '</span>' +
        '<a href="' + p.keysUrl + '" target="_blank" rel="noopener">get a key</a></div>' +
        '<div class="prov-fields">' +
          '<label class="field" style="margin-bottom:0"><span class="lab">API key</span>' +
          '<input type="password" id="key-' + p.id + '" value="' + esc(c.key || '') + '" placeholder="' + esc(p.keyHint) + '"></label>' +
          '<label class="field" style="margin-bottom:0"><span class="lab">Model</span>' +
          '<input type="text" id="model-' + p.id + '" value="' + esc(c.model || '') + '" placeholder="' + esc(p.defaultModel) + '"></label>' +
        '</div></div>';
    });

    if (configured.length > 1) {
      h += '<label class="field" style="max-width:340px;margin-top:20px"><span class="lab">Primary provider</span>' +
        '<select id="aiPrimary">' +
        configured.map(function (p) {
          return '<option value="' + p.id + '"' + (S.primaryProvider().id === p.id ? ' selected' : '') + '>' +
            esc(p.name) + '</option>';
        }).join('') +
        '</select><span class="hint">“Deepen with AI” asks this one. A second button convenes the council: ' +
        'all ' + configured.length + ' answer the same prompt independently, then your primary writes a short note on ' +
        'where they agreed and where they diverged.</span></label>';
    }

    return h;
  }

  function viewSettings() {
    var s = S.store.settings();
    var all = S.store.readings();
    return '<div class="wrap view"><div class="page-head">' +
      '<div class="eyebrow">Settings</div><h1>Setup and data</h1></div>' +

      '<div class="panel" style="margin-bottom:24px"><h3 style="margin-bottom:16px">Your birth date</h3>' +
        '<label class="field" style="max-width:320px"><span class="lab">Date of birth (optional)</span>' +
        '<input type="date" id="birthDate" value="' + esc(s.birthDate || '') + '">' +
        '<span class="hint">Used only for the Your Cards page — your birth card, your card for this year, ' +
        'and the four cards belonging to your sun sign. Day, month and year only: no time, no location, ' +
        'and it never leaves this browser. Leave it blank and that page simply stays empty.</span></label>' +
        '<button class="btn ghost sm" data-action="save-settings">Save</button>' +
        (s.birthDate ? '<button class="btn quiet sm" data-action="clear-birth">Remove it</button>' : '') +
      '</div>' +

      '<div class="panel" style="margin-bottom:24px"><h3 style="margin-bottom:16px">Reading voice</h3>' +
        '<label class="field" style="max-width:520px"><span class="lab">How readings are written</span>' +
        '<select id="voice">' +
          '<option value="plain"' + (s.voice === 'plain' ? ' selected' : '') + '>Plain language — everyday words, terms explained</option>' +
          '<option value="trad"' + (s.voice === 'trad' ? ' selected' : '') + '>Traditional — the older, more atmospheric register</option>' +
        '</select>' +
        '<span class="hint">Changes both the generated commentary and the card meanings themselves. ' +
        'Readings are rewritten on the fly, so this applies to everything you have already saved as well as anything new.</span></label>' +
        '<div class="voice-sample">' +
          '<div><b>Plain</b><p>Most of your cards are Cups. Cups is the suit about feelings and relationships — so however practical ' +
            'this looks on paper, it is being decided emotionally.</p></div>' +
          '<div><b>Traditional</b><p>This reading runs deep and wet. The weight of Cups says that whatever the situation looks like ' +
            'on paper, it is being decided emotionally.</p></div>' +
        '</div>' +
        '<button class="btn ghost sm" data-action="save-settings">Save</button>' +
      '</div>' +

      '<div class="two-col">' +
      '<div class="panel"><h3 style="margin-bottom:16px">Card artwork</h3>' +
        '<label class="field"><span class="lab">Image source</span>' +
        '<select id="imgSource">' +
          '<option value="local"' + (s.imageSource !== 'commons' ? ' selected' : '') + '>The images folder (works offline)</option>' +
          '<option value="commons"' + (s.imageSource === 'commons' ? ' selected' : '') + '>Wikimedia Commons (needs an internet connection)</option>' +
        '</select>' +
        '<span class="hint">The 78 Rider–Waite images ship in the <code>images</code> folder beside index.html, so the ' +
        'default needs no network at all. Any file that is missing falls back to Wikimedia on its own. ' +
        'To use scans of your own deck, replace the files in that folder — the exact filenames are listed in ' +
        '<code>images/README.md</code>, and the check below will tell you if any are wrong.</span></label>' +
        '<button class="btn ghost sm" data-action="save-settings">Save</button>' +
        '<button class="btn quiet sm" data-action="art-check">Check all 78 images</button>' +
        '<div id="artCheck" style="margin-top:18px"></div>' +
      '</div>' +

      '<div class="panel"><h3 style="margin-bottom:8px">AI readings (optional)</h3>' +
        '<p style="color:var(--cream-dim);font-size:.92rem">Add a key for any of these and readings gain a ' +
        '“Deepen with AI” button. Keys are stored only in this browser, sent only to the provider they belong to, ' +
        'and left out of exported backups. Everything else in Sage works offline without them.</p>' +
        providerFields(s) +
        '<button class="btn ghost sm" data-action="save-settings">Save</button>' +
      '</div></div>' +

      '<hr class="divider">' +
      '<div class="panel"><h3 style="margin-bottom:8px">Your data</h3>' +
      '<p style="color:var(--cream-dim);max-width:64ch">' + all.length + ' readings are stored in this browser\'s local storage. ' +
      'That means they survive closing the app but not clearing site data — export a backup now and then.</p>' +
      '<div class="actions" style="margin-top:16px">' +
        '<button class="btn ghost" data-action="export">Export backup (.json)</button>' +
        '<button class="btn ghost" data-action="import">Import backup</button>' +
        '<button class="btn danger" data-action="wipe">Erase everything</button>' +
      '</div>' +
      '<input type="file" id="importFile" accept="application/json" class="hidden">' +
      (S.store.available ? '' : '<p style="color:var(--rose);margin-top:16px">Local storage is unavailable in this browser context, ' +
        'so readings cannot be saved. Try serving the folder over http rather than opening the file directly.</p>') +
      '</div></div>';
  }

  /* ================= AI deepening ================= */

  function readingToPrompt(rec) {
    var sp = S.getSpread(rec.spreadId);
    var lines = rec.draws.map(function (d) {
      var pos = null;
      sp.positions.forEach(function (p) { if (p.id === d.positionId) pos = p; });
      var c = S.cardById(d.cardId);
      return '- ' + pos.name + ' (' + pos.q + '): ' + c.name + (d.reversed ? ' — REVERSED' : ' — upright');
    }).join('\n');

    var topic = S.getTopic(rec.topic);
    return 'You are an experienced, grounded tarot reader. Write an interpretation of this spread.\n\n' +
      'Spread: ' + sp.name + '\n' +
      (rec.question ? 'Question: ' + rec.question + '\n' : 'No question was stated.\n') +
      (topic && topic.suits ? 'Area of life: ' + topic.label + '\n' : '') +
      '\nCards drawn:\n' + lines + '\n\n' +
      'Write 4–6 paragraphs of flowing prose. Be specific to these exact cards in these exact positions and to how they ' +
      'interact with each other — do not simply list card meanings one by one. Take reversals seriously as blocked, ' +
      'internalised or delayed energy. Be warm but unsentimental, and be willing to say something the reader might not ' +
      'want to hear. Do not use headings, bullet points, or markdown. End with one concrete thing to do. ' +
      'Do not preface the reading with any introduction about yourself.' +
      (S.voice() === 'plain'
        ? ' Write in plain, everyday English for someone fairly new to tarot. Explain any tarot term the first time you use it. ' +
          'Avoid mystical or fortune-teller phrasing, and show your reasoning rather than just asserting things.'
        : '');
  }

  function aiDeepen(rec) {
    var primary = S.primaryProvider();
    if (!primary) { toast('Add an API key in Settings first.'); go('settings'); return; }
    if (state.aiBusy) return;

    state.aiBusy = true; render();
    S.askProvider(primary.id, readingToPrompt(rec))
      .then(function (run) {
        var fresh = S.store.reading(rec.id) || rec;
        fresh.aiRuns = (fresh.aiRuns || []).filter(function (r) { return r.provider !== run.provider; }).concat([run]);
        S.store.saveReading(fresh);
        state.aiBusy = false; state.aiTab = 0; render();
        toast('Reading written by ' + primary.name + '.');
      })
      .catch(function (err) {
        state.aiBusy = false; render();
        console.error(err);
        toast(err.message || ('Could not reach ' + primary.name + '.'));
      });
  }

  function aiCouncil(rec) {
    var providers = S.configuredProviders();
    if (providers.length < 2) return aiDeepen(rec);
    if (state.aiBusy) return;

    state.aiBusy = true; render();
    toast('Asking ' + providers.length + ' models…');

    S.convene(readingToPrompt(rec))
      .then(function (runs) {
        var fresh = S.store.reading(rec.id) || rec;
        fresh.aiRuns = runs;
        delete fresh.aiSummary;
        S.store.saveReading(fresh);

        var ok = runs.filter(function (r) { return r.text; });
        if (ok.length < 2) {
          state.aiBusy = false; state.aiTab = 0; render();
          toast(ok.length ? 'Only one model answered.' : 'No model could be reached.');
          return;
        }
        /* One of them writes the comparison. */
        var judge = S.primaryProvider();
        var sp = S.getSpread(rec.spreadId);
        return S.askProvider(judge.id, S.comparePrompt(ok, rec, sp.name))
          .then(function (sum) {
            fresh.aiSummary = sum.text;
            S.store.saveReading(fresh);
            state.aiBusy = false; state.aiTab = 0; render();
            toast(ok.length + ' readings, compared.');
          })
          .catch(function () {
            state.aiBusy = false; state.aiTab = 0; render();
            toast('Got ' + ok.length + ' readings, but the comparison failed.');
          });
      })
      .catch(function (err) {
        state.aiBusy = false; render();
        console.error(err);
        toast(err.message || 'The council could not be convened.');
      });
  }

  /* ================= art diagnostic ================= */

  function artCheck() {
    var host = document.getElementById('artCheck');
    if (!host) return;
    host.innerHTML = '<p style="color:var(--muted);font-size:.86rem" id="artStatus">Loading 78 images…</p><div class="diag-grid" id="artGrid"></div>';
    var grid = document.getElementById('artGrid');
    var done = 0, failed = [];

    S.CARDS.forEach(function (c) {
      var cell = document.createElement('div');
      cell.className = 'd';
      cell.title = c.name + ' — ' + c.img;
      var img = document.createElement('img');
      var chain = S.imgChain(c, 200);
      var step = 0;
      img.onload = function () { tick(); };
      img.onerror = function () {
        step++;
        if (step < chain.length) { img.src = chain[step]; return; }
        cell.classList.add('fail'); failed.push(c.name + ' (' + c.img + ')'); tick();
      };
      img.src = chain[0];
      cell.appendChild(img);
      grid.appendChild(cell);
    });

    function tick() {
      done++;
      if (done === S.CARDS.length) {
        var st = document.getElementById('artStatus');
        st.innerHTML = failed.length
          ? '<span style="color:var(--rose)">' + failed.length + ' of 78 images failed:</span> ' + esc(failed.join(', '))
          : '<span style="color:#7fa87f">All 78 images loaded.</span>';
      }
    }
  }

  /* ================= actions ================= */

  app.addEventListener('click', handleClick);
  document.body.addEventListener('click', function (e) {
    if (e.target.closest('.modal-backdrop')) handleClick(e);
  });

  function handleClick(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var a = el.getAttribute('data-action');

    switch (a) {
      case 'pick-spread':
        captureGuestName();
        state.draft = { spreadId: el.getAttribute('data-id'), question: '', topic: 'none', draws: {} };
        render(); break;

      case 'daily-draw':
        state.draft = { spreadId: 'single', question: '', topic: 'none', draws: {} };
        render(); break;

      case 'toggle-guest': {
        var gn = document.getElementById('guestName');
        if (gn) state.guestName = gn.value;
        state.guest = !state.guest;
        if (!state.guest) state.guestName = '';
        state.draft = null;
        state.openReadingId = null;
        go('draw'); break;
      }

      case 'clear-guests':
        if (!confirm('Delete every guest reading? Your own readings are not affected.')) return;
        S.store.clearGuests();
        state.openReadingId = null;
        toast('Guest readings cleared.'); render(); break;

      case 'pick-topic':
        captureQuestion();
        state.draft.topic = el.getAttribute('data-id');
        render(); break;

      case 'abandon':
        if (Object.keys(state.draft.draws).length && !confirm('Discard the cards you have placed?')) return;
        state.draft = null; render(); break;

      case 'clear-board':
        if (!confirm('Clear all placed cards?')) return;
        captureQuestion();
        state.draft.draws = {}; render(); break;

      case 'open-picker':
        captureQuestion();
        openPicker(el.getAttribute('data-pos')); break;

      case 'close-picker': closePicker(); break;
      case 'close-picker-bg':
        if (e.target.classList.contains('modal-backdrop')) closePicker();
        break;

      case 'picker-suit':
        state.picker.suit = el.getAttribute('data-suit'); renderPicker(); break;

      case 'flip': {
        captureQuestion();
        var fp = state.draft.draws[el.getAttribute('data-pos')];
        if (fp) { fp.reversed = !fp.reversed; render(); }
        break;
      }

      case 'toggle-rev': {
        state.picker.reversed = !state.picker.reversed;
        /* If this position is already filled, apply it straight away rather than
           waiting for the card to be picked again. */
        var tp = state.draft.draws[state.picker.positionId];
        if (tp) { tp.reversed = state.picker.reversed; render(); }
        renderPicker();
        break;
      }

      case 'choose-card':
        state.draft.draws[state.picker.positionId] = {
          positionId: state.picker.positionId,
          cardId: el.getAttribute('data-id'),
          reversed: state.picker.reversed
        };
        closePicker(); render(); break;

      case 'read': {
        captureQuestion();
        var sp = S.getSpread(state.draft.spreadId);
        var draws = sp.positions.map(function (p) { return state.draft.draws[p.id]; });
        var rec = {
          id: S.uid(), date: new Date().toISOString(),
          spreadId: state.draft.spreadId, question: state.draft.question,
          topic: state.draft.topic || 'none',
          draws: draws, note: ''
        };
        if (state.guest) {
          rec.guest = true;
          rec.guestName = (state.guestName || '').trim();
        }
        S.store.saveReading(rec);
        state.draft = null;
        state.openReadingId = rec.id;
        go('reading');
        break;
      }

      case 'open-reading': state.openReadingId = el.getAttribute('data-id'); go('reading'); break;
      case 'open-card': state.openCardId = el.getAttribute('data-id'); go('card'); break;
      case 'goto-library': go('library'); break;
      case 'goto-draw': state.draft = null; go('draw'); break;

      case 'save-note': {
        var rec2 = currentRecord();
        rec2.note = document.getElementById('noteBox').value;
        S.store.saveReading(rec2);
        toast(rec2.outcome && rec2.outcome.rating ? 'Saved.' : 'Saved — add a rating too when you know how it went.');
        break;
      }

      case 'rate': {
        var rr = currentRecord();
        var nb2 = document.getElementById('noteBox');
        if (nb2) rr.note = nb2.value;          /* don't lose typing on re-render */
        rr.outcome = rr.outcome || {};
        rr.outcome.rating = el.getAttribute('data-id');
        rr.outcome.ratedAt = new Date().toISOString();
        S.store.saveReading(rr);
        render(); break;
      }
      case 'clear-outcome': {
        e.preventDefault();
        var rc = currentRecord();
        var nb3 = document.getElementById('noteBox');
        if (nb3) rc.note = nb3.value;
        delete rc.outcome;
        S.store.saveReading(rc);
        render(); break;
      }

      case 'delete-reading':
        if (!confirm('Delete this reading permanently?')) return;
        S.store.deleteReading(el.getAttribute('data-id'));
        state.openReadingId = null;
        go('journal'); break;

      case 'print': printReading(); break;

      case 'ai-deepen': aiDeepen(currentRecord()); break;
      case 'ai-council': aiCouncil(currentRecord()); break;
      case 'ai-tab': state.aiTab = parseInt(el.getAttribute('data-i'), 10); render(); break;
      case 'ai-clear': {
        var r3 = currentRecord();
        delete r3.aiRuns; delete r3.aiSummary; delete r3.ai;
        S.store.saveReading(r3); state.aiTab = 0; render(); break;
      }

      case 'lib-suit': state.libFilter.suit = el.getAttribute('data-suit'); render(); break;

      case 'quiz-start': {
        var qs = [];
        for (var i = 0; i < 10; i++) qs.push(makeQuestion());
        state.quiz = { questions: qs, index: 0, right: 0, total: 10, answered: false, chosen: -1 };
        render(); break;
      }
      case 'quiz-answer': {
        var Q = state.quiz;
        if (Q.answered) return;
        var idx = parseInt(el.getAttribute('data-i'), 10);
        var q = Q.questions[Q.index];
        var correct = !!q.options[idx].correct;
        if (correct) Q.right++;
        Q.answered = true; Q.chosen = idx;
        S.store.recordQuiz(q.card.id, correct);
        render(); break;
      }
      case 'quiz-next':
        state.quiz.index++; state.quiz.answered = false; state.quiz.chosen = -1; render(); break;
      case 'quiz-end': state.quiz = null; render(); break;

      case 'save-settings': {
        var s = S.store.settings();
        var src = document.getElementById('imgSource');
        var vo = document.getElementById('voice');
        var bd = document.getElementById('birthDate');

        s.ai = s.ai || {};
        S.PROVIDERS.forEach(function (p) {
          var kEl = document.getElementById('key-' + p.id);
          var mEl = document.getElementById('model-' + p.id);
          if (!kEl && !mEl) return;
          s.ai[p.id] = s.ai[p.id] || {};
          if (kEl) s.ai[p.id].key = kEl.value.trim();
          if (mEl) s.ai[p.id].model = mEl.value.trim();
        });
        var pr = document.getElementById('aiPrimary');
        if (pr) s.ai.primary = pr.value;

        if (src) s.imageSource = src.value;
        if (vo) s.voice = vo.value;
        if (bd) {
          var val = bd.value.trim();
          if (val && !S.parseBirthDate(val)) { toast('That is not a valid date.'); return; }
          s.birthDate = val;
        }
        S.store.saveSettings(s);
        toast('Saved.'); render(); break;
      }

      case 'clear-birth': {
        var s2 = S.store.settings();
        s2.birthDate = '';
        S.store.saveSettings(s2);
        toast('Birth date removed.'); render(); break;
      }

      case 'goto-settings': go('settings'); break;
      case 'goto-guests': go('guests'); break;

      case 'save-guest-name': {
        var gr = currentRecord();
        gr.guestName = document.getElementById('guestNameEdit').value.trim();
        S.store.saveReading(gr);
        toast(gr.guestName ? 'Filed under ' + gr.guestName + '.' : 'Name cleared.');
        render(); break;
      }

      case 'art-check': artCheck(); break;

      case 'export': {
        var blob = new Blob([S.store.exportAll()], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        var now = new Date();
        link.download = 'Sage backup ' + now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' +
          pad(now.getDate()) + ' ' + pad(now.getHours()) + pad(now.getMinutes()) + '.json';
        link.click();
        URL.revokeObjectURL(url);
        break;
      }
      case 'import': document.getElementById('importFile').click(); break;

      case 'wipe':
        if (!confirm('This erases every reading, note and study record. Continue?')) return;
        if (!confirm('Really? There is no undo.')) return;
        S.store.wipe();
        state.openReadingId = null;
        toast('Erased.'); render(); break;
    }
  }

  function captureQuestion() {
    var q = document.getElementById('question');
    if (q && state.draft) state.draft.question = q.value;
    captureGuestName();
  }

  /* The name field only exists on the spread-choosing screen, so its value has
     to be pulled into state before that screen goes away. */
  function captureGuestName() {
    var g = document.getElementById('guestName');
    if (g) state.guestName = g.value;
  }

  /* A textarea clips its overflow when printed, so mirror its text into a
     plain block that print styles reveal in its place. */
  function syncNotePrint() {
    var box = document.getElementById('noteBox');
    var out = document.getElementById('notePrint');
    if (box && out) out.textContent = box.value;
  }

  /* ---- PDF filename ----
     Browsers take the suggested filename from document.title, so we swap it
     for something sortable just before printing and put it back afterwards.
     Shape: "Sage 2026-08-05 1432 Celtic-Cross - the question" */

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function readingFilename(rec) {
    var sp = S.getSpread(rec.spreadId);
    var d = new Date(rec.date);
    var stamp = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
                ' ' + pad(d.getHours()) + pad(d.getMinutes());

    var name = 'Sage ' + stamp + ' ' + (sp && sp.abbr ? sp.abbr : 'Reading');

    if (rec.guest) {
      var who = (rec.guestName || '').replace(/[\\\/:*?"<>|]/g, '').replace(/[.‘’“”()]/g, '').trim();
      name += who ? ' for ' + who : ' guest';
    }

    var q = (rec.question || '')
      .replace(/[\\\/:*?"<>|]/g, ' ')   // illegal on Windows and awkward elsewhere
      .replace(/[.‘’“”]/g, '')  // dots read as extensions; smart quotes travel badly
      .replace(/\s+/g, ' ')
      .trim();
    if (q.length > 58) q = q.slice(0, 58).replace(/\s+\S*$/, '');
    if (q) name += ' - ' + q;

    return name.trim();
  }

  var titleBeforePrint = null;

  function setPrintTitle() {
    syncNotePrint();
    var rec = state.view === 'reading' ? currentRecord() : null;
    if (!rec) return;
    if (titleBeforePrint === null) titleBeforePrint = document.title;
    document.title = readingFilename(rec);
  }
  function restoreTitle() {
    if (titleBeforePrint !== null) { document.title = titleBeforePrint; titleBeforePrint = null; }
  }

  /* Covers Ctrl+P as well as the button. */
  window.addEventListener('beforeprint', setPrintTitle);
  window.addEventListener('afterprint', restoreTitle);

  function printReading() {
    setPrintTitle();
    window.print();
    setTimeout(restoreTitle, 500);   // in case afterprint never fires
  }

  /* Textareas clip their overflow and print badly, so let them grow to fit
     rather than scroll. Runs on render and on every keystroke. */
  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight + 2, 120) + 'px';
  }
  function growAll() {
    document.querySelectorAll('.grow').forEach(autoGrow);
  }
  window.addEventListener('resize', growAll);

  /* ================= render ================= */

  function render() {
    var html;
    switch (state.view) {
      case 'draw':     html = viewDraw(); break;
      case 'reading':  html = viewReading(); break;
      case 'journal':  html = viewJournal(); break;
      case 'guests':   html = viewGuests(); break;
      case 'themes':   html = viewThemes(); break;
      case 'library':  html = viewLibrary(); break;
      case 'card':     html = viewCard(); break;
      case 'study':    html = viewStudy(); break;
      case 'yours':    html = viewYours(); break;
      case 'learn':    html = viewLearn(); break;
      case 'settings': html = viewSettings(); break;
      default:         html = viewDraw();
    }
    app.innerHTML = html;
    syncNav();
    afterRender();
  }

  function afterRender() {
    var ls = document.getElementById('libSearch');
    if (ls) {
      ls.addEventListener('input', function () {
        state.libFilter.q = ls.value;
        document.querySelector('.lib-grid').innerHTML = libGrid();
      });
    }
    var qi = document.getElementById('question');
    if (qi) qi.addEventListener('input', function () { state.draft.question = qi.value; });

    var gi = document.getElementById('guestName');
    if (gi) gi.addEventListener('input', function () { state.guestName = gi.value; });

    document.querySelectorAll('.grow').forEach(function (ta) {
      autoGrow(ta);
      ta.addEventListener('input', function () { autoGrow(ta); syncNotePrint(); });
    });

    var fi = document.getElementById('importFile');
    if (fi) {
      fi.addEventListener('change', function () {
        var f = fi.files[0];
        if (!f) return;
        var rd = new FileReader();
        rd.onload = function () {
          try {
            S.store.importAll(rd.result, confirm('Merge with your existing readings? Cancel to replace them entirely.'));
            toast('Backup imported.'); render();
          } catch (err) { toast(err.message); }
        };
        rd.readAsText(f);
      });
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.picker) closePicker();
  });

  /* ================= boot ================= */

  if (S.CARDS.length !== 78) {
    console.warn('Sage: expected 78 cards, found ' + S.CARDS.length);
  }
  S.store.migrate();

  var fy = document.getElementById('footYear');
  if (fy) fy.textContent = String(new Date().getFullYear());

  render();

})(window.SAGE = window.SAGE || {});
