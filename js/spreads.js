/* Sage — Spread definitions.
 * Each position: id, name, q (the question the position answers),
 *   lead (connective phrase the reading engine uses to open that paragraph),
 *   col/row (placement on the spread's grid), rot (degrees, for crossing cards).
 */
(function (S) {
  'use strict';

  S.SPREADS = [

  { id:'single', name:'Single Card', tag:'1 card', kind:'daily', abbr:'Single-Card',
    blurb:'One card for the day, or a single clean question. Best used often.',
    cols:1, rows:1,
    positions:[
      { id:'the-card', name:'The Card', q:'What most needs your attention right now?',
        lead:'At the centre of this, and standing alone,' }
    ]},

  { id:'three', name:'Past · Present · Future', tag:'3 cards', kind:'timeline', abbr:'Three-Card',
    blurb:'The classic three-card line. Shows how a situation arrived, where it stands, and where its momentum points.',
    cols:3, rows:1,
    positions:[
      { id:'past', name:'Past', q:'What brought this about — the roots of the situation.',
        lead:'Looking back at what shaped this,' },
      { id:'present', name:'Present', q:'Where things actually stand today.',
        lead:'In the present moment,' },
      { id:'future', name:'Future', q:'Where the current momentum is carrying you.',
        lead:'Along the line this is currently travelling,' }
    ]},

  { id:'celtic', name:'Celtic Cross', tag:'10 cards', kind:'deep', abbr:'Celtic-Cross',
    blurb:'The full diagnostic. Ten positions covering the heart of the matter, its obstacle, its history, its influences, and its likely outcome.',
    /* The crossing card gets its own (wider) column rather than sitting on top
       of the heart, so both cards stay fully visible and independently
       clickable. colw sets each column's width as a multiple of the card width. */
    cols:5, rows:4, colw:[1, 1, 1.8, 1, 1],
    positions:[
      { id:'heart', name:'The Heart of the Matter', q:'The core of the situation — what this is really about.',
        lead:'At the very centre of this,', col:2, row:2 },
      { id:'crossing', name:'The Crossing', q:'What opposes, complicates, or cuts across the heart of it.',
        lead:'Lying across it, complicating everything,', col:3, row:2, rot:90 },
      { id:'foundation', name:'The Foundation', q:'The root beneath it — the deep, often unconscious basis.',
        lead:'Underneath, at the root of the whole thing,', col:2, row:3 },
      { id:'behind', name:'Passing Behind', q:'What is receding — an influence on its way out.',
        lead:'Moving out of the frame behind you,', col:1, row:2 },
      { id:'crown', name:'The Crown', q:'What is conscious, aimed for, or hanging over it.',
        lead:'Above it, in your conscious mind and your aim,', col:2, row:1 },
      { id:'before', name:'Coming Before', q:'What is arriving next — the near future.',
        lead:'Arriving next, in the near term,', col:4, row:2 },
      { id:'self', name:'Yourself', q:'How you are showing up in this — your stance and your part.',
        lead:'As for how you are meeting this,', col:5, row:4 },
      { id:'environment', name:'The Environment', q:'The people and conditions around it — what surrounds you.',
        lead:'In the world around this situation,', col:5, row:3 },
      { id:'hopes-fears', name:'Hopes and Fears', q:'What you most want and most dread — often the same thing.',
        lead:'In what you hope for and fear,', col:5, row:2 },
      { id:'outcome', name:'The Outcome', q:'Where this resolves if the present course holds.',
        lead:'And where this arrives, if nothing turns,', col:5, row:1 }
    ]},

  { id:'horseshoe', name:'The Horseshoe', tag:'7 cards', kind:'deep', abbr:'Horseshoe',
    blurb:'A seven-card arc that traces a situation from its past through its obstacles to its outcome. Lighter than the Celtic Cross, deeper than three cards.',
    cols:7, rows:3,
    positions:[
      { id:'past', name:'The Past', q:'What has led here.',
        lead:'Beginning where this began,', col:1, row:3 },
      { id:'present', name:'The Present', q:'The situation as it stands.',
        lead:'As things stand now,', col:2, row:2 },
      { id:'hidden', name:'Hidden Influences', q:'What is at work beneath the surface, unseen.',
        lead:'Working quietly beneath the surface,', col:3, row:1 },
      { id:'obstacle', name:'The Obstacle', q:'What stands in the way.',
        lead:'Standing in the way,', col:4, row:1 },
      { id:'external', name:'External Influences', q:'People and forces acting on this from outside.',
        lead:'From outside, acting on this,', col:5, row:1 },
      { id:'guidance', name:'Guidance', q:'The course of action the reading recommends.',
        lead:'As for what to actually do,', col:6, row:2 },
      { id:'outcome', name:'Likely Outcome', q:'Where this resolves if the guidance is taken.',
        lead:'And where it lands,', col:7, row:3 }
    ]},

  { id:'relationship', name:'The Relationship', tag:'6 cards', kind:'relational', abbr:'Relationship',
    blurb:'Six cards on a connection between two people — how each stands in it, what binds it, what strains it, and where it is going.',
    cols:3, rows:4,
    positions:[
      { id:'strength', name:'What Works', q:'The genuine strength of this connection.',
        lead:'What is actually working here,', col:2, row:1 },
      { id:'you', name:'You', q:'Your position, feeling, and part in this connection.',
        lead:'On your side of it,', col:1, row:2 },
      { id:'bond', name:'The Bond', q:'The nature of what is between you — the connection itself.',
        lead:'Between you, as the thing itself,', col:2, row:2 },
      { id:'them', name:'Them', q:'Their position, feeling, and part in this connection.',
        lead:'On their side of it,', col:3, row:2 },
      { id:'strain', name:'What Strains It', q:'The friction, the unspoken thing, the real difficulty.',
        lead:'Where the strain sits,', col:2, row:3 },
      { id:'heading', name:'Where It Is Heading', q:'The trajectory if nothing is deliberately changed.',
        lead:'And where this is heading as it stands,', col:2, row:4 }
    ]},

  { id:'crossroads', name:'The Crossroads', tag:'5 cards', kind:'decision', abbr:'Crossroads',
    blurb:'A decision spread. The situation at centre, with what each of two options offers and what each will cost you.',
    cols:3, rows:3,
    positions:[
      { id:'a-gain', name:'Option A — What It Offers', q:'What the first path genuinely gives you.',
        lead:'As for what the first path offers,', col:1, row:1 },
      { id:'situation', name:'The Situation', q:'The decision as it truly is, beneath how it feels.',
        lead:'Beginning with the situation itself,', col:2, row:2 },
      { id:'b-gain', name:'Option B — What It Offers', q:'What the second path genuinely gives you.',
        lead:'As for what the second path offers,', col:3, row:1 },
      { id:'a-cost', name:'Option A — What It Costs', q:'What the first path takes from you.',
        lead:'As for what the first path will cost you,', col:1, row:3 },
      { id:'b-cost', name:'Option B — What It Costs', q:'What the second path takes from you.',
        lead:'As for what the second path will cost you,', col:3, row:3 }
    ]},

  { id:'two-paths', name:'Two Paths', tag:'7 cards', kind:'decision', abbr:'Two-Paths',
    blurb:'Where you stand, then three cards down each of two roads — the first step, what unfolds, and where it leads.',
    cols:3, rows:4,
    positions:[
      { id:'a-end', name:'Path A — Where It Leads', q:'The eventual destination of the first road.',
        lead:'Further down the first road, where it finally leads,', col:1, row:1 },
      { id:'b-end', name:'Path B — Where It Leads', q:'The eventual destination of the second road.',
        lead:'Further down the second road, where it finally leads,', col:3, row:1 },
      { id:'a-mid', name:'Path A — What Unfolds', q:'What develops along the first road.',
        lead:'As the first road continues,', col:1, row:2 },
      { id:'b-mid', name:'Path B — What Unfolds', q:'What develops along the second road.',
        lead:'As the second road continues,', col:3, row:2 },
      { id:'a-step', name:'Path A — The First Step', q:'What taking the first road immediately asks of you.',
        lead:'As for the first step down the first road,', col:1, row:3 },
      { id:'b-step', name:'Path B — The First Step', q:'What taking the second road immediately asks of you.',
        lead:'As for the first step down the second road,', col:3, row:3 },
      { id:'standing', name:'Where You Stand', q:'Your actual position at the fork, right now.',
        lead:'Standing at the fork,', col:2, row:4 }
    ]}

  ];

  S.getSpread = function (id) {
    for (var i = 0; i < S.SPREADS.length; i++) if (S.SPREADS[i].id === id) return S.SPREADS[i];
    return null;
  };

})(window.SAGE = window.SAGE || {});
