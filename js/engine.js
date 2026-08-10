/* Sage — the reading engine.
 *
 * Composes a reading from cards x positions, elemental dignities, suit balance,
 * major-arcana density, repeated numbers, court presence and pairwise interaction.
 * Deterministic: the same draw always produces the same reading.
 *
 * Two voices. 'plain' is the default: everyday words, jargon explained the first
 * time it appears, reasoning shown rather than asserted. 'trad' is the original
 * tarot-book register. Every generated string exists in both.
 */
(function (S) {
  'use strict';

  /* ---------- small utilities ---------- */

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function pick(arr, r) { return arr[Math.floor(r() * arr.length) % arr.length]; }
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function list(items) {
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function firstSentence(text) {
    var m = text.match(/^[\s\S]*?[.!?](?=\s|$)/);
    return m ? m[0] : text;
  }

  S.cardById = function (id) {
    for (var i = 0; i < S.CARDS.length; i++) if (S.CARDS[i].id === id) return S.CARDS[i];
    return null;
  };

  /* ---------- voice ---------- */

  S.voice = function () {
    var v = (S.store && S.store.settings) ? S.store.settings().voice : null;
    return v === 'trad' ? 'trad' : 'plain';
  };

  /* Card body text for the current voice, falling back to the original if a
     plain rewrite is somehow missing. */
  S.cardText = function (card, key, voice) {
    var v = voice || S.voice();
    if (v === 'plain' && S.PLAIN && S.PLAIN[card.id] && S.PLAIN[card.id][key]) {
      return S.PLAIN[card.id][key];
    }
    return card[key];
  };
  S.cardShort = function (card) {
    return (S.PLAIN && S.PLAIN[card.id] && S.PLAIN[card.id].short) || '';
  };

  /* ---------- reference tables ---------- */

  var SUIT_NAME = { wands:'Wands', cups:'Cups', swords:'Swords', pentacles:'Pentacles' };

  var SUIT_DOMAIN = {
    plain: {
      wands:      'drive, energy and what you actually want',
      cups:       'feelings and relationships',
      swords:     'thinking, truth, conflict and what gets said',
      pentacles:  'money, work, health and practical life'
    },
    trad: {
      wands:      'drive, creative energy and what you actually want',
      cups:       'feeling, relationship and the inner life',
      swords:     'thought, truth, conflict and what gets said',
      pentacles:  'the body, money, work and the material ground under you'
    }
  };

  var SUIT_HEAVY = {
    plain: {
      wands:     'Most of your cards are Wands. Wands is the suit about drive, energy and wanting things — so this reading is less about working the situation out and more about whether you actually want it and whether you will act. The real question is how much fuel you have left, not how good your plan is.',
      cups:      'Most of your cards are Cups. Cups is the suit about feelings and relationships — so however practical this looks on paper, it is being decided emotionally: by how people feel, what has not been said out loud, and what you will let yourself admit you want.',
      swords:    'Most of your cards are Swords. Swords is the suit about thinking, truth and conflict — so the hard part of this is in your head and in what gets said. Readings this heavy in Swords usually describe real pain that is mostly mental: worry, argument, or a conclusion you reached early and never went back to check.',
      pentacles: 'Most of your cards are Pentacles. Pentacles is the suit about money, work, health and physical things — so whatever story you have been telling yourself about this, the answer is practical and it will take time. Look at the actual numbers and the actual calendar.'
    },
    trad: {
      wands:     'This reading runs hot. The weight of Wands says the question is finally one of will and appetite rather than analysis — what you want, whether you will move on it, and how much fuel is left in the tank.',
      cups:      'This reading runs deep and wet. The weight of Cups says that whatever the situation looks like on paper, it is being decided emotionally — by how people feel, what has gone unsaid, and what you are willing to let yourself want.',
      swords:    'This reading runs sharp and cold. The weight of Swords says the difficulty is in the thinking: what is true, what is being said, what you have decided in advance. Air-heavy readings tend to describe suffering that is real and largely mental.',
      pentacles: 'This reading runs solid and slow. The weight of Pentacles pulls the question down to earth — money, health, work, time, the practical arrangements. Whatever the story around it, the answer here is material and it will take a while.'
    }
  };

  var SUIT_ABSENT = {
    plain: {
      wands:     'There are no Wands here at all — the suit about drive and wanting things. Nothing in this situation is being powered by desire or momentum, which may be exactly the diagnosis. Worth asking where the wanting went.',
      cups:      'There are no Cups here — the suit about feelings and relationships. Emotion is completely absent from the picture, either because it has been deliberately set aside or because nobody has asked how anyone feels about this.',
      swords:    'There are no Swords here — the suit about thinking and conflict. No argument, no analysis, nothing being contested. That can mean genuine peace, or it can mean the difficult conversation still has not happened.',
      pentacles: 'There are no Pentacles here — the suit about money, work and practical life. Nothing in this has been made concrete yet. Whatever is being decided is still living entirely in feelings, thoughts or intentions, with nothing solid underneath it.'
    },
    trad: {
      wands:     'There is no Fire in this spread at all. Nothing here is driven by desire or momentum — which may be exactly the diagnosis. Ask where the wanting went.',
      cups:      'There is no Water in this spread. Feeling is entirely absent from the picture, either because it has been set aside deliberately or because nobody has asked how anyone feels about this.',
      swords:    'There is no Air in this spread. No conflict, no analysis, nothing being argued — which can mean peace, or can mean the hard conversation has still not been had.',
      pentacles: 'There is no Earth in this spread. Nothing here has been made practical yet. Whatever is being decided is still living entirely in feeling, thought or intention, with no ground under it.'
    }
  };

  var NUMEROLOGY = {
    1:  { label:'Aces',    plain:'beginnings — something being offered rather than earned',
                           trad:'beginnings — raw, unshaped potential being offered rather than earned' },
    2:  { label:'Twos',    plain:'two things in relation to each other — pairing, balance, or a choice between them',
                           trad:'pairing and choice — two things in relation, balance held or lost' },
    3:  { label:'Threes',  plain:'early growth — something taking its first real shape, usually with other people involved',
                           trad:'first growth — something taking initial form, often with other people involved' },
    4:  { label:'Fours',   plain:'stability and pause — things settling, consolidating, and possibly getting stuck',
                           trad:'structure and pause — stability, consolidation, and the risk of stagnation' },
    5:  { label:'Fives',   plain:'disruption — loss, conflict and the kind of instability that forces change',
                           trad:'disruption — loss, conflict and the instability that forces change' },
    6:  { label:'Sixes',   plain:'balance restored — harmony, fair exchange, and help moving one way or the other',
                           trad:'restored balance — harmony, exchange, and help moving in one direction or another' },
    7:  { label:'Sevens',  plain:'holding on under pressure — waiting, defending a position, or seeing through an illusion',
                           trad:'assessment under pressure — holding a position, waiting, or seeing through an illusion' },
    8:  { label:'Eights',  plain:'power being applied — through speed, through repetition, or through restriction',
                           trad:'movement and mastery — power applied, whether through speed, repetition or restriction' },
    9:  { label:'Nines',   plain:'nearly finished — the last hard stretch, carrying the full weight of the suit',
                           trad:'near-completion — the last hard stretch, carrying the full weight of the suit' },
    10: { label:'Tens',    plain:'completion and overflow — the suit at its limit, ready to end or start again',
                           trad:'completion and overflow — the suit at its limit, ready to end or to begin again' },
    11: { label:'Pages',   plain:'the beginner — curiosity, study, and messages arriving',
                           trad:'the beginner\'s stance — curiosity, study, and messages arriving' },
    12: { label:'Knights', plain:'action in one direction — commitment, momentum, and the cost of single-mindedness',
                           trad:'action in one direction — commitment, momentum, and the cost of single-mindedness' },
    13: { label:'Queens',  plain:'holding the suit\'s energy inwardly rather than wielding it',
                           trad:'inward mastery — holding the element rather than wielding it' },
    14: { label:'Kings',   plain:'holding the suit\'s energy outwardly — authority, and making it into a rule',
                           trad:'outward mastery — authority, and the element made into law' }
  };

  /* What each element means, spelled out in plain mode. */
  var EL = { Fire:'drive and energy', Water:'feelings', Air:'thinking', Earth:'practical, material life' };

  var ELEMENT_PAIR = {
    'Fire|Fire':   { kind:'reinforce', trad:'Two Fires together amplify each other — more heat, less caution.' },
    'Water|Water': { kind:'reinforce', trad:'Two Waters deepen each other — the feeling here doubles, and so does the risk of drowning in it.' },
    'Air|Air':     { kind:'reinforce', trad:'Two Airs sharpen each other — the thinking gets faster and colder, and further from the body.' },
    'Earth|Earth': { kind:'reinforce', trad:'Two Earths settle each other — very stable, very slow, and hard to shift once set.' },
    'Fire|Air':    { kind:'friendly',  trad:'Fire and Air feed each other — idea and appetite in agreement. This pairing moves.' },
    'Water|Earth': { kind:'friendly',  trad:'Water and Earth nourish each other — feeling given practical form. This pairing lasts.' },
    'Fire|Water':  { kind:'opposing',  trad:'Fire and Water cancel each other — want against feeling, urgency against depth. One of them is being suppressed.' },
    'Air|Earth':   { kind:'opposing',  trad:'Air and Earth resist each other — the plan and the reality are not the same shape, and the ground is winning.' },
    'Fire|Earth':  { kind:'neutral',   trad:'Fire and Earth sit side by side without much reaction — energy and material, each doing its own work.' },
    'Air|Water':   { kind:'neutral',   trad:'Air and Water sit side by side without much reaction — what you think and what you feel are simply running in parallel here.' }
  };

  /* Plain-mode pairing text is built so the elements are always explained. */
  var PAIR_PLAIN = {
    reinforce: 'Both cards belong to the same element, so they amplify each other. Whatever this is doing, it is doing twice as much of it — this is the loudest signal in the spread.',
    friendly:  'These two elements get along, so these cards are working together rather than against each other. If you want leverage anywhere, it is here.',
    opposing:  'These two elements work against each other, so these cards are pulling in different directions. Progress on one is currently costing you the other.',
    neutral:   'These two elements do not react much to each other. These cards are running side by side, each doing its own thing, without much interference either way.'
  };

  function dignity(a, b) {
    return ELEMENT_PAIR[a + '|' + b] || ELEMENT_PAIR[b + '|' + a] || null;
  }

  /* Which positions the engine reads against each other, per spread. */
  var LINKS = {
    single:       [],
    three:        [['past','present'],['present','future']],
    celtic:       [['heart','crossing'],['foundation','crown'],['behind','before'],['self','environment'],['hopes-fears','outcome']],
    horseshoe:    [['present','obstacle'],['hidden','external'],['guidance','outcome']],
    relationship: [['you','them'],['strength','strain'],['bond','heading']],
    crossroads:   [['a-gain','a-cost'],['b-gain','b-cost'],['a-gain','b-gain']],
    'two-paths':  [['a-step','b-step'],['a-end','b-end'],['standing','a-step'],['standing','b-step']]
  };

  /* Which positions carry the spine of the reading, for the synthesis. */
  var SPINE = {
    single:       ['the-card'],
    three:        ['present','future'],
    celtic:       ['heart','crossing','outcome'],
    horseshoe:    ['present','obstacle','guidance','outcome'],
    relationship: ['bond','strain','heading'],
    crossroads:   ['situation','a-gain','b-gain'],
    'two-paths':  ['standing','a-end','b-end']
  };

  /* ---------- analysis ---------- */

  S.analyze = function (draws) {
    var a = {
      n: draws.length,
      suits: { wands:0, cups:0, swords:0, pentacles:0 },
      elements: { Fire:0, Water:0, Air:0, Earth:0 },
      majors: [], courts: [], aces: [],
      reversed: 0, numbers: {}, cards: []
    };
    draws.forEach(function (d) {
      var c = S.cardById(d.cardId);
      if (!c) return;
      a.cards.push(c);
      a.elements[c.element]++;
      if (c.arcana === 'major') a.majors.push(c);
      else {
        a.suits[c.suit]++;
        if (c.num >= 11) a.courts.push(c);
        if (c.num === 1) a.aces.push(c);
      }
      if (d.reversed) a.reversed++;
      var key = c.arcana === 'major' ? 'M' + c.num : c.num;
      (a.numbers[key] = a.numbers[key] || []).push(c);
    });

    a.majorRatio = a.n ? a.majors.length / a.n : 0;
    a.reversedRatio = a.n ? a.reversed / a.n : 0;

    var minorTotal = a.n - a.majors.length;
    a.dominantSuit = null; a.absentSuits = [];
    var best = 0;
    Object.keys(a.suits).forEach(function (s) {
      if (a.suits[s] > best) { best = a.suits[s]; a.dominantSuit = s; }
    });
    if (!(minorTotal >= 3 && best >= Math.max(2, Math.ceil(minorTotal * 0.45)))) a.dominantSuit = null;
    if (a.n >= 5) {
      Object.keys(a.suits).forEach(function (s) { if (a.suits[s] === 0) a.absentSuits.push(s); });
    }

    a.repeats = [];
    Object.keys(a.numbers).forEach(function (k) {
      if (a.numbers[k].length >= 2 && String(k).charAt(0) !== 'M') {
        a.repeats.push({ num: parseInt(k, 10), cards: a.numbers[k] });
      }
    });
    a.repeats.sort(function (x, y) { return y.cards.length - x.cards.length; });

    return a;
  };

  /* ---------- overview ---------- */

  function overview(spread, draws, a, question, r, v) {
    var out = [];
    var plain = v === 'plain';

    var opener;
    if (question) {
      opener = plain
        ? 'You asked: “' + question + '” — and drew ' + a.n + (a.n === 1 ? ' card' : ' cards') +
          ' into the ' + spread.name + ' layout. '
        : 'You asked: “' + question + '” — and drew ' + a.n + (a.n === 1 ? ' card' : ' cards') +
          ' into the ' + spread.name + '. ';
    } else {
      opener = plain
        ? 'A ' + spread.name + ' reading, ' + a.n + (a.n === 1 ? ' card' : ' cards') + ', with no question written down. ' +
          'That is fine — often the cards end up showing you what the question was. '
        : 'A ' + spread.name + ' reading, ' + a.n + (a.n === 1 ? ' card' : ' cards') + ', drawn without a stated question — ' +
          'which usually means the reading will tell you what the question was. ';
    }

    if (a.majorRatio >= 0.5 && a.n >= 3) {
      opener += plain
        ? 'The first thing to notice is how many Major Arcana cards you drew: ' + a.majors.length + ' of ' + a.n + '. ' +
          'The Major Arcana are the 22 named cards like The Tower or The Star — the big-picture ones, about large forces and turning points ' +
          'rather than everyday matters. Getting this many of them means the situation is bigger than your day-to-day choices. ' +
          'You are inside a current rather than steering a boat, so the useful advice is less about tactics and more about how you handle what is already happening.'
        : 'The first thing to notice is how many Major Arcana are on the table: ' + a.majors.length +
          ' of ' + a.n + '. That is a lot. Major-heavy readings describe situations that are larger than your daily choices — ' +
          'currents you are inside of rather than steering. The advice in a reading like this is less about tactics and more about how you meet what is already happening.';
    } else if (a.majors.length === 0 && a.n >= 4) {
      opener += plain
        ? 'Worth saying plainly: you drew no Major Arcana at all — none of the 22 big-picture cards about fate and turning points. ' +
          'Everything here is ordinary, workable, human-scale material, which means this really is within your power to change.'
        : 'There is not a single Major Arcana here, which is worth saying plainly: nothing in this spread is fate. ' +
          'This is a situation made entirely of ordinary, workable, human-scale material — which means it is genuinely within your power to change.';
    } else if (a.majors.length === 1 && a.n >= 4) {
      opener += plain
        ? 'One Major Arcana card sits among otherwise everyday cards. The Major Arcana are the 22 big-picture cards, so ' +
          a.majors[0].name + ' is the part of this that is larger than the rest — and the other cards are all arranging themselves around it.'
        : 'One Major Arcana stands in the middle of otherwise everyday cards, and it acts like a hinge: ' +
          a.majors[0].name + ' is the piece of this that is bigger than the rest, and the smaller cards are all arranging themselves around it.';
    } else if (a.n === 1) {
      opener += plain
        ? pick([
            'One card is a small reading by design — there is nothing here to weigh it against, so take it as something to carry with you rather than a full picture.',
            'With a single card there is no shape to read, only the card itself. That is the point of drawing one: it gives you a single thing to notice.',
            'A one-card draw is a prompt rather than a diagnosis. Read it, then watch where it turns out to apply.'
          ], r)
        : pick([
            'One card, and nothing to weigh it against — a prompt to carry rather than a picture to study.',
            'A single card gives you no shape to read, only the card. That is its use.',
            'One card is a prompt rather than a diagnosis. Read it, then watch where it lands.'
          ], r);
    } else {
      opener += plain
        ? pick([
            'The mix reads as an ordinary working situation — real, in motion, and responsive to whatever you do next.',
            'Nothing here is abstract. These cards describe conditions you are actually living in right now.',
            'The mix is ordinary in the best sense: this is a situation you can get hold of.'
          ], r)
        : pick([
            'The spread reads as a working situation — real, in motion, and responsive to what you do next.',
            'Nothing here is abstract. The cards describe conditions you are actively living in.',
            'The mix is ordinary in the best sense: this is a situation with handles on it.'
          ], r);
    }
    out.push(opener);

    if (a.dominantSuit) {
      out.push(SUIT_HEAVY[v][a.dominantSuit]);
    } else if (a.n >= 4 && a.majors.length < a.n) {
      out.push(plain
        ? 'No single suit dominates this spread. The four suits each cover a different area of life, so a spread spread across all of them ' +
          'means the question is being pulled at from several directions at once — which is usually why it has been hard to settle by thinking about it from just one.'
        : 'No single suit dominates. The question is being pulled at from several directions at once — ' +
          'which is usually why it has been hard to resolve by thinking about it from just one.');
    }

    if (a.absentSuits.length === 1) out.push(SUIT_ABSENT[v][a.absentSuits[0]]);
    else if (a.absentSuits.length >= 2) {
      out.push(plain
        ? 'Two whole suits are missing here — ' + list(a.absentSuits.map(function (s) { return SUIT_NAME[s]; })) + '. ' +
          'When a spread is this narrow it usually means the situation has collapsed onto one axis, and some of what you need to solve it ' +
          'is not in the picture yet.'
        : 'Two whole elements are missing here — ' +
          list(a.absentSuits.map(function (s) { return SUIT_NAME[s]; })) +
          '. A spread this narrow is telling you that the situation has collapsed onto one axis. ' +
          'Some of the resource you need is simply not in the frame yet.');
    }

    if (a.n >= 3) {
      if (a.reversedRatio >= 0.6) {
        out.push(plain
          ? 'Most of your cards came out reversed — ' + a.reversed + ' of ' + a.n + '. A reversed card is one that came out of the deck upside down. ' +
            'It does not mean the opposite of the upright meaning; it usually means that energy is blocked, held inside, delayed or overdone. ' +
            'So read this as a situation where the right forces are present but not flowing outward yet. Something is being held in.'
          : 'Most of this spread is reversed — ' + a.reversed + ' of ' + a.n + '. Heavy reversal does not mean bad news; ' +
            'it means blocked, internalised or delayed energy. Read this as a situation where the right forces are present but not flowing outward yet. ' +
            'Something is being held in.');
      } else if (a.reversed === 0) {
        out.push(plain
          ? 'Nothing came out reversed — no card was upside down. Every card is running in its open, outward direction, ' +
            'so whatever these cards describe, it is happening in plain sight rather than being held back or hidden.'
          : 'Nothing is reversed. Every card is running in its open, outward direction — the situation is unusually unobstructed, ' +
            'and whatever these cards describe, they describe it happening in plain sight.');
      } else if (a.reversedRatio >= 0.3) {
        out.push(plain
          ? a.reversed + ' of your ' + a.n + ' cards came out reversed, meaning upside down. Reversed usually means that card\'s energy is blocked, ' +
            'turned inward or delayed rather than reversed in meaning — so those positions are the pressure points of this spread.'
          : 'A meaningful minority is reversed — ' + a.reversed + ' of ' + a.n + '. Those are the places where the energy is turned inward or ' +
            'stuck, and they are worth reading as the pressure points of the spread.');
      }
    }

    return out;
  }

  /* ---------- per-card interpretation ---------- */

  var ORIENT = {
    plain: { up: ['is upright', 'came out upright'], rev: ['is reversed — it came out upside down', 'came out reversed, meaning upside down'] },
    trad:  { up: ['stands upright', 'sits upright', 'comes through cleanly', 'reads open and forward'],
             rev: ['arrives reversed', 'comes through reversed', 'lies reversed', 'turns up reversed'] }
  };

  var POSITION_TURN = {
    plain: [
      'For this position, that comes down to {gloss}.',
      'In the {pos} spot, that means {gloss}.',
      'Read against {pos}, the emphasis lands on {gloss}.',
      'What that means here, for {pos}, is {gloss}.'
    ],
    trad: [
      'In this position, that lands as {gloss}.',
      'Here, in the place of {pos}, it reads as {gloss}.',
      'Set in {pos}, the card is pointing at {gloss}.',
      'For {pos} specifically, the emphasis falls on {gloss}.',
      'Read against {pos}, what comes forward is {gloss}.'
    ]
  };

  function gloss(card, reversed) {
    var kws = reversed ? card.kwR : card.kwU;
    return list(kws.slice(0, 3).map(lower));
  }

  function cardEntry(spread, pos, draw, a, r, v, ctx) {
    var card = S.cardById(draw.cardId);
    if (!card) return null;
    var rev = !!draw.reversed;
    var plain = v === 'plain';
    var body = S.cardText(card, rev ? 'rev' : 'up', v);

    var paras = [];

    var orient = pick(ORIENT[v][rev ? 'rev' : 'up'], r);
    var p1 = pos.lead + ' ' + card.name + ' ' + orient + '.';

    /* Explain reversal once per reading, the first time one turns up. */
    if (plain && rev && !ctx.explainedReversal) {
      ctx.explainedReversal = true;
      p1 += ' (Reversed does not flip the meaning on its head — it usually means this card\'s energy is blocked, ' +
            'kept inside, delayed, or being overdone.)';
    }
    paras.push(p1 + ' ' + body);

    var turn = pick(POSITION_TURN[v], r)
      .replace('{gloss}', gloss(card, rev))
      .replace('{pos}', pos.name);
    paras.push(turn + ' ' + card.advice);

    return {
      positionId: pos.id,
      positionName: pos.name,
      positionQ: pos.q,
      cardId: card.id,
      cardName: card.name,
      reversed: rev,
      element: card.element,
      short: S.cardShort(card),
      paragraphs: paras,
      symbolism: card.sym,
      keywords: rev ? card.kwR : card.kwU
    };
  }

  /* ---------- interactions ---------- */

  function findPos(spread, id) {
    for (var i = 0; i < spread.positions.length; i++) if (spread.positions[i].id === id) return spread.positions[i];
    return null;
  }

  function interactions(spread, byPos, a, v, ctx) {
    var links = LINKS[spread.id] || [];
    var out = [];
    var plain = v === 'plain';

    links.forEach(function (pair) {
      var A = byPos[pair[0]], B = byPos[pair[1]];
      if (!A || !B) return;
      var ca = S.cardById(A.cardId), cb = S.cardById(B.cardId);
      if (!ca || !cb) return;
      var d = dignity(ca.element, cb.element);
      if (!d) return;

      var pA = findPos(spread, pair[0]), pB = findPos(spread, pair[1]);
      var text;

      if (plain) {
        text = pA.name + ' and ' + pB.name + ' — you drew ' + ca.name + ' and ' + cb.name + '. ';
        if (!ctx.explainedElements) {
          ctx.explainedElements = true;
          text += 'Every card belongs to one of four elements, and it is worth reading pairs of cards against each other to see whether ' +
                  'they help or hinder one another. ';
        }
        if (ca.element === cb.element) {
          text += 'Both are ' + ca.element + ' (' + EL[ca.element] + '). ';
        } else {
          text += ca.name + ' is ' + ca.element + ' (' + EL[ca.element] + ') and ' + cb.name + ' is ' +
                  cb.element + ' (' + EL[cb.element] + '). ';
        }
        text += PAIR_PLAIN[d.kind];
      } else {
        text = pA.name + ' and ' + pB.name + ' — ' + ca.name + ' against ' + cb.name + '. ' + d.trad;
        if (d.kind === 'opposing') {
          text += ' Practically: ' + lower(pA.name) + ' and ' + lower(pB.name) +
            ' are working against each other in this situation, and progress on one is currently costing you the other.';
        } else if (d.kind === 'reinforce') {
          text += ' Practically: whatever ' + lower(pA.name) + ' is doing, ' + lower(pB.name) +
            ' is doing more of it. This is the loudest signal in the spread.';
        } else if (d.kind === 'friendly') {
          text += ' Practically: these two are on the same side. If you want leverage, this is the pair to push on.';
        }
      }

      if (A.reversed && B.reversed) {
        text += plain
          ? ' Both came out reversed, so this whole exchange is happening inside your head rather than out in the world.'
          : ' Both are reversed, so this whole exchange is happening internally rather than out in the world.';
      } else if (A.reversed !== B.reversed) {
        text += plain
          ? ' One of the two came out reversed and the other did not, so the exchange is lopsided — one side of it is out in the open and the other is being held back.'
          : ' One is reversed and one is not — the exchange is lopsided, with one side expressed and the other held back.';
      }

      out.push({ kind: d.kind, text: text });
    });
    return out;
  }

  /* ---------- patterns ---------- */

  function patterns(a, entries, v) {
    var out = [];
    var plain = v === 'plain';

    a.repeats.forEach(function (rep) {
      var info = NUMEROLOGY[rep.num];
      if (!info) return;
      var names = rep.cards.map(function (c) { return c.name; }).join(', ');
      out.push({
        title: rep.cards.length + ' × ' + info.label,
        text: plain
          ? names + '. Cards of the same number turning up together is worth noticing — every suit runs from Ace to Ten and then ' +
            'four court cards, so a number describes a stage in a process. ' + info.label + ' are about ' + info.plain + '. ' +
            'Seeing them ' + (rep.cards.length > 2 ? rep.cards.length + ' times' : 'twice') + ' in one spread suggests that stage is where ' +
            'you currently are — and in more than one area of your life at the same time.'
          : names + '. Repeated numbers are the deck raising its voice. ' +
            'The ' + info.label.toLowerCase() + ' carry ' + info.trad +
            ' — and seeing them ' + (rep.cards.length > 2 ? 'this many times' : 'twice') +
            ' in one spread says that stage of the process is where the whole situation currently sits, across several areas of your life at once.'
      });
    });

    if (a.courts.length >= 3) {
      out.push({
        title: a.courts.length + ' court cards',
        text: (plain
          ? a.courts.map(function (c) { return c.name; }).join(', ') + '. The court cards are the Pages, Knights, Queens and Kings — ' +
            'the ones that usually stand for people. Getting this many means that whatever you asked, the answer runs through other human beings: ' +
            'their temperaments, what they want, and the roles you are each playing. Try naming who each of these is before you read on.'
          : a.courts.map(function (c) { return c.name; }).join(', ') + '. Court-heavy spreads are about people. ' +
            'Whatever you asked, the answer runs through other human beings — their temperaments, their agendas, and the roles ' +
            'you are each playing. Try naming who each of these is before reading further.')
      });
    } else if (a.courts.length === 0 && a.n >= 6) {
      out.push({
        title: 'No court cards',
        text: plain
          ? 'Not one Page, Knight, Queen or King — the cards that usually stand for people. Nobody else is really the subject here. ' +
            'This is about conditions and your own choices, however much it may feel like it is about someone else.'
          : 'Not a single court card. Nobody else is really the subject here — this is a situation about conditions and your own choices, ' +
            'not about other people, however much it may feel otherwise.'
      });
    }

    if (a.aces.length >= 2) {
      out.push({
        title: a.aces.length + ' Aces',
        text: plain
          ? a.aces.map(function (c) { return c.name; }).join(' and ') + '. Aces are the ones of each suit and they mark beginnings. ' +
            'More than one means several genuine fresh starts are available at the same time. That is good news and a warning: ' +
            'Aces do not keep, and trying to take two at once usually means taking neither.'
          : a.aces.map(function (c) { return c.name; }).join(' and ') + '. Multiple Aces mean multiple genuine beginnings available at once. ' +
            'That is good news and a warning: Aces are perishable, and taking two at the same time usually means taking neither.'
      });
    }

    var revRun = entries.filter(function (e) { return e.reversed; });
    if (revRun.length && revRun.length < entries.length && entries.length >= 5) {
      out.push({
        title: 'Where the blocks sit',
        text: (plain ? 'The upside-down cards landed at ' : 'The reversed cards fall at ') +
          list(revRun.map(function (e) { return e.positionName.toLowerCase(); })) +
          (plain
            ? '. Those are the friction points — the places where the energy of this situation is turned inward, delayed, or being actively resisted. ' +
              'If you want a different outcome, that is your shortlist of where to push.'
            : '. Those positions are the friction points — the places where the energy of this situation is turned inward, delayed, ' +
              'or being actively resisted. If you want to change the outcome, that is the shortlist.')
      });
    }

    var top = null, topN = 0;
    Object.keys(a.elements).forEach(function (e) { if (a.elements[e] > topN) { topN = a.elements[e]; top = e; } });
    if (a.n >= 5 && topN >= Math.ceil(a.n * 0.6)) {
      out.push({
        title: plain ? 'One element dominates: ' + top : 'Elemental weather: ' + top,
        text: plain
          ? topN + ' of your ' + a.n + ' cards are ' + top + ' — the element of ' + EL[top] + '. The whole spread is running at one temperature, ' +
            'which makes it forceful and one-sided. Deliberately bringing in what is missing — in what you actually do, not just how you think about it — ' +
            'is usually the fastest correction.'
          : topN + ' of ' + a.n + ' cards are ' + top + '. The whole spread is running at one temperature, which makes it forceful ' +
            'and one-sided. Deliberately introducing the missing element — in how you act, not just how you think — is usually the fastest correction.'
      });
    }

    return out;
  }

  /* ---------- topical reading ----------
     The engine cannot read the question, but it can be told which area of life
     it belongs to — which changes what each suit is actually pointing at. */

  function topical(a, entries, topicId) {
    var T = S.getTopic && S.getTopic(topicId);
    if (!T || !T.suits) return [];

    var out = [];
    var bySuit = { wands:[], cups:[], swords:[], pentacles:[] };
    entries.forEach(function (e) {
      var c = S.cardById(e.cardId);
      if (c && c.suit) bySuit[c.suit].push(c.name + (e.reversed ? ' reversed' : ''));
    });

    /* Busiest suits first — that is the order they matter in. */
    Object.keys(bySuit)
      .filter(function (s) { return bySuit[s].length; })
      .sort(function (x, y) { return bySuit[y].length - bySuit[x].length; })
      .forEach(function (s) {
        out.push({
          suit: s,
          title: SUIT_NAME[s] + ' — ' + bySuit[s].length + (bySuit[s].length === 1 ? ' card' : ' cards'),
          text: bySuit[s].join(', ') + '. ' + T.suits[s]
        });
      });

    if (a.majorRatio >= 0.4 && a.majors.length >= 2) {
      out.push({ suit:'major', title:'The ' + a.majors.length + ' Major Arcana here', text: T.majorHeavy });
    }
    if (a.courts.length >= 3) {
      out.push({ suit:'court', title:'The court cards here', text: T.courtHeavy });
    }
    if (a.reversedRatio >= 0.5 && a.n >= 3) {
      out.push({ suit:'reversed', title:'So many reversed', text: T.reversedHeavy });
    }

    return out;
  }

  /* ---------- synthesis ---------- */

  function synthesis(spread, byPos, a, entries, inter, r, v) {
    var out = [];
    var plain = v === 'plain';
    var spine = (SPINE[spread.id] || []).map(function (id) { return byPos[id]; }).filter(Boolean);

    /* With one card there is no spine to trace — the tone paragraph below says
       everything a summary would, without pretending the reading has a shape. */
    if (spine.length && a.n > 1) {
      var names = spine.map(function (d) {
        var c = S.cardById(d.cardId);
        return c.name + (d.reversed ? ' reversed' : '');
      });
      var spinePos = (SPINE[spread.id] || []).map(function (id) { return findPos(spread, id).name.toLowerCase(); });

      var s = plain
        ? 'Putting it together: the cards that carry this reading are ' + list(names) + ' — sitting at ' + list(spinePos) + '. '
        : 'Pulling it together: the spine of this reading runs ' + list(names) + ' — ' + list(spinePos) + '. ';

      var lead = S.cardById(spine[0].cardId);
      var leadText = firstSentence(S.cardText(lead, spine[0].reversed ? 'rev' : 'up', v)).replace(/\.$/, '');
      s += (plain ? 'It starts from this: ' : 'It starts from ') + (plain ? leadText + '. ' : lower(leadText) + '. ');

      if (spine.length > 1) {
        var last = S.cardById(spine[spine.length - 1].cardId);
        var lastText = firstSentence(S.cardText(last, spine[spine.length - 1].reversed ? 'rev' : 'up', v)).replace(/\.$/, '');
        s += (plain ? 'And it ends here: ' + lastText + '. ' : 'And it ends at ' + lower(lastText) + '. ');
      }
      out.push(s);
    }

    var tone;
    if (a.n === 1) {
      /* A one-card spread has no proportions to talk about — every ratio is
         either nothing or everything, so the language of "how much of this
         spread is..." makes no sense here. */
      var only = S.cardById(entries[0].cardId);
      if (entries[0].reversed) {
        tone = plain
          ? 'Your one card came out reversed, so read it as energy that is turned inward, held back or delayed rather than ' +
            'flowing out into the world. With a single card there is nothing to weigh it against — which makes it a prompt ' +
            'to sit with rather than a verdict.'
          : 'The single card is reversed: this energy is turned inward, blocked or delayed rather than expressed. ' +
            'With nothing to weigh it against, take it as a prompt rather than a verdict.';
      } else if (only && only.arcana === 'major') {
        tone = plain
          ? 'You drew a single Major Arcana card — one of the 22 big-picture cards. On its own, that tends to describe the ' +
            'weather you are living in rather than anything you need to do about it today.'
          : 'A single Major Arcana card describes the weather you are living in rather than a task for the day.';
      } else {
        tone = plain
          ? 'One card on its own is a prompt rather than a diagnosis. Carry it through the day and notice where it turns out to fit.'
          : 'One card is a prompt rather than a diagnosis. Carry it through the day and see where it lands.';
      }
    } else if (a.majorRatio >= 0.5) {
      tone = plain
        ? 'Because so many of these are Major Arcana — the big-picture cards — the useful stance is acceptance first, action second. ' +
          'You are not going to argue your way out of this. You are going to be changed by it, and then decide what to do from the other side.'
        : 'Because so much of this is Major Arcana, the useful posture is acceptance before action. ' +
          'You are not going to argue your way out of these cards; you are going to be changed by them and then decide what to do from the other side.';
    } else if (a.reversedRatio >= 0.6 && a.n >= 3) {
      tone = plain
        ? 'Because so many cards came out upside down, the work here is internal before it is external. Nothing in this will move until ' +
          'something in you unsticks first — and the good part is that that is the bit you control.'
        : 'Because so much is reversed, the work here is internal before it is external. Nothing in this spread will move ' +
          'until something in you unsticks first — and the good news is that is the part you control.';
    } else if (a.dominantSuit) {
      tone = plain
        ? 'Because the spread leans so heavily on ' + SUIT_NAME[a.dominantSuit] + ', the real arena for this is ' +
          SUIT_DOMAIN[v][a.dominantSuit] + '. Anything you try somewhere else will feel like effort without traction.'
        : 'Because the spread leans so heavily on ' + SUIT_NAME[a.dominantSuit] + ', the honest arena for this is ' +
          SUIT_DOMAIN[v][a.dominantSuit] + '. Solutions attempted anywhere else will feel like effort without traction.';
    } else {
      tone = plain
        ? 'The spread is balanced enough that no single force is deciding this. That means the outcome is genuinely open, and small ' +
          'deliberate choices will count for more than they usually do.'
        : 'The spread is balanced enough that no single force is deciding this. That means the outcome is genuinely open, ' +
          'and small deliberate choices will have more effect than they usually do.';
    }
    out.push(tone);

    var opposing = inter.filter(function (i) { return i.kind === 'opposing'; });
    if (opposing.length) {
      out.push(plain
        ? 'The tension to hold onto is the one flagged above, where two cards are pulling against each other. Do not try to settle it by ' +
          'picking a side today. Readings shaped like this usually resolve when one of the two gets a defined time and place of its own, ' +
          'instead of both competing for all your attention at once.'
        : 'The central tension to hold is the one flagged above between opposing elements. Do not try to resolve it by ' +
          'picking a side today — most readings with this shape resolve when one of the two is simply given a defined time and place, ' +
          'rather than being allowed to compete for all of your attention at once.');
    }

    return out;
  }

  /* ---------- advice ---------- */

  function adviceList(spread, byPos, a, v, topicId) {
    var out = [];
    var plain = v === 'plain';
    var T = S.getTopic && S.getTopic(topicId);
    var spine = (SPINE[spread.id] || []).map(function (id) { return byPos[id]; }).filter(Boolean);
    var used = {};
    spine.slice(0, 3).forEach(function (d) {
      var c = S.cardById(d.cardId);
      if (!c || used[c.id]) return;
      used[c.id] = true;
      out.push({ from: c.name, text: c.advice });
    });

    var whole = a.n === 1
      ? (plain ? 'Because it came out reversed' : 'The reversal')
      : (plain ? 'Looking at the whole spread' : 'The spread as a whole');

    if (a.n === 1) {
      /* One card: only the reversal is worth a general note, and only if it is one. */
      if (a.reversed === 1) {
        out.push({ from: whole, text: plain
          ? 'Do one small outward thing about whatever this card touches. Reversed cards describe energy that is stuck inside, and that shifts from the outside in.'
          : 'Do one small outward thing in the area this card touches. Reversals unstick from the outside in.' });
      }
    } else if (a.reversedRatio >= 0.5) {
      out.push({ from: whole, text: plain
        ? 'Pick whichever part of your life feels most stuck and do one small outward thing about it this week. Blocked situations tend to unstick from the outside in.'
        : 'Pick the single most reversed-feeling area of your life and do one small outward thing there this week. Reversals unstick from the outside in.' });
    } else if (a.dominantSuit === 'swords') {
      out.push({ from: whole, text: plain
        ? 'Get this out of your head and into a conversation or onto a page. Spreads this heavy in Swords almost always describe pain that is being kept private.'
        : 'Get this out of your head and into a conversation or a page. Swords-heavy readings almost always describe pain that is being kept private.' });
    } else if (a.dominantSuit === 'pentacles') {
      out.push({ from: whole, text: plain
        ? 'Put real numbers or a real date on this. Practical questions stop being difficult once they stop being vague.'
        : 'Put real numbers or a real date on it. Earth-heavy questions resolve when they stop being abstract.' });
    } else if (a.dominantSuit === 'cups') {
      out.push({ from: whole, text: plain
        ? 'Say the feeling out loud to the person it concerns. This is not going to be solved by rearranging the logistics.'
        : 'Say the feeling to the person it concerns. This spread is not going to move on logistics.' });
    } else if (a.dominantSuit === 'wands') {
      out.push({ from: whole, text: plain
        ? 'Do it this week, while you still want to. This kind of energy does not keep.'
        : 'Do the thing this week while the heat is on it. Fire-heavy readings expire.' });
    } else if (a.majorRatio >= 0.5) {
      out.push({ from: whole, text: plain
        ? 'Stop trying to control how this turns out and decide how you want to behave inside it. That is the only part you actually hold.'
        : 'Stop trying to control the outcome and choose how you want to behave inside it. That is the only variable you hold here.' });
    }

    if (T && T.advice) out.push({ from: 'Because you asked about ' + T.label.toLowerCase(), text: T.advice });

    return out;
  }

  /* ---------- public: build a reading ---------- */

  S.buildReading = function (spreadId, draws, question, seedExtra, voice, topicId) {
    var spread = S.getSpread(spreadId);
    if (!spread) throw new Error('Unknown spread: ' + spreadId);

    var v = voice || S.voice();
    var T = S.getTopic && S.getTopic(topicId);
    var seed = hash(spreadId + '|' + draws.map(function (d) { return d.cardId + (d.reversed ? 'R' : 'U'); }).join(',') + '|' + (seedExtra || ''));
    var r = rng(seed);

    var a = S.analyze(draws);
    var ctx = { explainedReversal: false, explainedElements: false };

    var byPos = {};
    draws.forEach(function (d) { byPos[d.positionId] = d; });

    var entries = [];
    spread.positions.forEach(function (pos) {
      var d = byPos[pos.id];
      if (!d) return;
      var e = cardEntry(spread, pos, d, a, r, v, ctx);
      if (e) entries.push(e);
    });

    var inter = interactions(spread, byPos, a, v, ctx);

    var over = overview(spread, draws, a, question, r, v);
    if (T && T.frame) over.splice(1, 0, T.frame);

    return {
      voice: v,
      topicId: (T && T.id) || 'none',
      topicLabel: (T && T.suits) ? T.label : '',
      spreadId: spreadId,
      spreadName: spread.name,
      question: question || '',
      overview: over,
      entries: entries,
      interactions: inter,
      topical: topical(a, entries, topicId),
      patterns: patterns(a, entries, v),
      synthesis: synthesis(spread, byPos, a, entries, inter, r, v),
      advice: adviceList(spread, byPos, a, v, topicId),
      stats: {
        n: a.n, majors: a.majors.length, reversed: a.reversed,
        suits: a.suits, elements: a.elements,
        dominantSuit: a.dominantSuit, absentSuits: a.absentSuits
      }
    };
  };

  /* ---------- public: themes across many readings ---------- */

  S.findThemes = function (readings, voice) {
    if (!readings || readings.length < 2) return null;
    var v = voice || S.voice();
    var plain = v === 'plain';

    var freq = {}, suitTotal = { wands:0, cups:0, swords:0, pentacles:0 };
    var majorTotal = 0, cardTotal = 0, revTotal = 0;
    var numTotal = {};

    readings.forEach(function (R) {
      var seen = {};
      (R.draws || []).forEach(function (d) {
        var c = S.cardById(d.cardId);
        if (!c) return;
        cardTotal++;
        if (d.reversed) revTotal++;
        if (c.arcana === 'major') majorTotal++;
        else suitTotal[c.suit]++;
        numTotal[c.num] = (numTotal[c.num] || 0) + 1;
        if (!freq[c.id]) freq[c.id] = { card:c, count:0, reversedCount:0, readings:[] };
        freq[c.id].count++;
        if (d.reversed) freq[c.id].reversedCount++;
        if (!seen[c.id]) { freq[c.id].readings.push({ id:R.id, date:R.date, question:R.question }); seen[c.id] = 1; }
      });
    });

    var recurring = Object.keys(freq).map(function (k) { return freq[k]; })
      .filter(function (f) { return f.readings.length >= 2; })
      .sort(function (x, y) { return y.readings.length - x.readings.length || y.count - x.count; });

    var suitRank = Object.keys(suitTotal).map(function (s) { return { suit:s, n:suitTotal[s] }; })
      .sort(function (x, y) { return y.n - x.n; });

    var minorTotal = cardTotal - majorTotal;
    var notes = [];

    if (recurring.length) {
      var top = recurring.slice(0, 3);
      notes.push({
        title: 'Cards that keep visiting you',
        text: top.map(function (f) {
          return f.card.name + ' (' + f.readings.length + ' readings' +
            (f.reversedCount ? ', ' + f.reversedCount + ' reversed' : '') + ')';
        }).join('; ') + '. ' +
          (plain
            ? 'When a card keeps turning up across separate readings, it is usually not answering the individual question — it is describing ' +
              'something ongoing in your life. '
            : 'A card that returns across separate readings is usually not commenting on the individual question — ' +
              'it is describing a standing condition in your life. ') +
          (top[0].card.arcana === 'major'
            ? (plain
                ? 'This one is a Major Arcana card — one of the 22 big-picture cards — which makes the point harder: ' + top[0].card.name +
                  ' is naming a whole chapter, not a single incident.'
                : 'That it is a Major Arcana makes the point harder: ' + top[0].card.name + ' is naming a chapter, not an incident.')
            : (plain
                ? 'Its suit tells you which part of life it lives in: ' + SUIT_DOMAIN[v][top[0].card.suit] + '.'
                : 'The suit tells you which department it lives in: ' + SUIT_DOMAIN[v][top[0].card.suit] + '.'))
      });
    }

    if (minorTotal >= 6 && suitRank[0].n >= minorTotal * 0.4) {
      notes.push({
        title: 'Your standing suit: ' + SUIT_NAME[suitRank[0].suit],
        text: suitRank[0].n + ' of your ' + minorTotal + ' numbered cards across these readings are ' + SUIT_NAME[suitRank[0].suit] + '. ' +
          (plain
            ? 'Across several readings that says less about any one question and more about where your life is currently being decided: '
            : 'Over multiple readings that is less about any one question and more about where your life is currently being decided: ') +
          SUIT_DOMAIN[v][suitRank[0].suit] + '.'
      });
      var quietest = suitRank[suitRank.length - 1];
      if (quietest.n <= Math.max(1, Math.floor(minorTotal * 0.1))) {
        notes.push({
          title: 'The quiet suit: ' + SUIT_NAME[quietest.suit],
          text: 'Only ' + quietest.n + ' ' + SUIT_NAME[quietest.suit] + ' card' + (quietest.n === 1 ? '' : 's') +
            ' in the whole run. ' + SUIT_NAME[quietest.suit] + ' covers ' + SUIT_DOMAIN[v][quietest.suit] + ', and it has been almost ' +
            'entirely absent from what you have been asking about. Sometimes that means it is settled. More often it means it is not being looked at.'
        });
      }
    }

    if (cardTotal >= 8) {
      var mr = majorTotal / cardTotal, rr = revTotal / cardTotal;
      if (mr >= 0.4) notes.push({
        title: 'A major chapter',
        text: Math.round(mr * 100) + '% of everything you have drawn is Major Arcana' +
          (plain ? ' — the 22 big-picture cards' : '') + ', well above the 22-in-78 you would expect by chance. ' +
          (plain
            ? 'Getting that many, consistently, across several readings marks a genuine turning period rather than a run of ordinary weeks.'
            : 'Sustained major density across readings marks a genuine turning period rather than a run of ordinary weeks.')
      });
      if (rr >= 0.5) notes.push({
        title: 'A lot is turned inward',
        text: Math.round(rr * 100) + '% of your cards have come up reversed' + (plain ? ', meaning upside down' : '') + '. ' +
          'Over time that points to a stretch of held, delayed or internalised energy — things you know but have not acted on.'
      });
      if (rr <= 0.15 && cardTotal >= 12) notes.push({
        title: 'Very little reversal',
        text: 'Only ' + Math.round(rr * 100) + '% reversed across ' + cardTotal + ' cards. Your readings are running unusually open and outward.'
      });
    }

    var numRank = Object.keys(numTotal).map(function (k) { return { num:parseInt(k,10), n:numTotal[k] }; })
      .filter(function (x) { return x.num >= 1 && x.num <= 14; })
      .sort(function (x, y) { return y.n - x.n; });
    if (numRank.length && numRank[0].n >= 3 && NUMEROLOGY[numRank[0].num]) {
      var info = NUMEROLOGY[numRank[0].num];
      notes.push({
        title: 'Stuck on ' + info.label,
        text: info.label + ' have come up ' + numRank[0].n + ' times. ' +
          (plain ? 'That number is about ' : 'Numerologically that stage is ') + (plain ? info.plain : info.trad) +
          ' — and the fact that it keeps recurring suggests you keep meeting the same point in different processes.'
      });
    }

    return { notes: notes, recurring: recurring, suitRank: suitRank, cardTotal: cardTotal, readingCount: readings.length };
  };

})(window.SAGE = window.SAGE || {});
