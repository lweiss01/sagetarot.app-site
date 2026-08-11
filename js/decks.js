/* Sage — https://sagetarot.app
 * Copyright © 2026 Future Proof Works. All rights reserved.
 * Not licensed for reuse or redistribution. See LICENSE.
 */

/* Sage — deck registry.
 *
 * Every deck names its files differently, so each one supplies its own function
 * turning a card into a filename. Nothing else in the app needs to know: the
 * meanings, spreads and engine all work from card identity, never from artwork.
 *
 * Fields:
 *   id        stored in settings
 *   name      shown in the picker
 *   sub       one line: what it is and where it came from
 *   dir       folder, relative to index.html, with a trailing slash
 *   scenic    true if the numbered minors are illustrated scenes rather than
 *             bare suit symbols. Also used to decide whether the Rider–Waite
 *             symbolism notes describe what the visitor is actually looking at.
 *   file(card) returns the filename for a card
 *
 * Only decks listed here appear; the picker hides itself when there is one.
 */
(function (S) {
  'use strict';

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function slug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* Sequential position in a standard 78-card ordering: majors 0–21, then
     wands, cups, swords and pentacles in ace-to-king order. Several decks
     number their files this way. */
  var SUIT_BASE = { wands: 21, cups: 35, swords: 49, pentacles: 63 };
  function sequence(card) {
    return card.arcana === 'major' ? card.num : SUIT_BASE[card.suit] + card.num;
  }
  S.cardSequence = sequence;
  S.cardSlug = slug;
  S.pad2 = pad2;

  S.DECKS = [
    {
      id: 'rws',
      name: 'Rider–Waite–Smith',
      sub: 'The 1909 classic, illustrated by Pamela Colman Smith. Public domain.',
      dir: 'images/',
      scenic: true,
      faithful: true,
      file: function (card) { return card.img; }
    }

    /* ---- a second deck goes here, when there is one worth shipping ----
       Everything below is ready and tested: the picker appears in Settings
       automatically once this list has more than one entry, the comparison
       strip shows the decks side by side, missing cards fall back to
       Rider–Waite, and a deck can override individual "look closer" notes
       via a sym map if its artwork diverges.

       A restyled Rider–Waite keeps the compositions, so it inherits all the
       existing notes and only needs faithful:true. Using the same filenames
       as the Rider–Waite set means images drop in with no mapping at all:

       ,{
         id: 'painted',
         name: 'Painted',
         sub: 'A restyled Rider–Waite — the same scenes in a different hand.',
         dir: 'images/painted/',
         scenic: true,
         faithful: true,
         file: function (card) { return card.img; }
       }
    */

    /* Further decks slot in here. An example of the shape, for a deck whose
       files are numbered 00–77 with a name slug:

       {
         id: 'etteilla-i',
         name: 'Grand Etteilla I',
         sub: 'Livre de Thot, engraved by Pierre-François Basan, circa 1789. Public domain.',
         dir: 'images/etteilla-i/',
         scenic: false,
         file: function (card) { return pad2(sequence(card)) + '-' + slug(card.name) + '.jpg'; }
       }
    */
  ];

  S.getDeck = function (id) {
    for (var i = 0; i < S.DECKS.length; i++) if (S.DECKS[i].id === id) return S.DECKS[i];
    return S.DECKS[0];
  };

  S.deck = function () {
    return S.getDeck((S.store && S.store.settings) ? S.store.settings().deck : 'rws');
  };

  /* ---------- symbolism notes ----------
     The built-in "Look closer" notes were written about the Rider–Waite
     artwork. A deck that keeps those compositions inherits them unchanged.
     A deck that diverges on a few cards can override just those, via a sym
     map keyed by card id — so nobody has to write all 78 again, and no note
     is ever left describing something that is not on the card. */

  S.symbolismFor = function (card) {
    var d = S.deck();
    if (d.sym && d.sym[card.id]) return { text: d.sym[card.id], ownWords: true };
    return { text: card.sym, ownWords: !!d.faithful };
  };

  /* True when the note on screen describes the artwork on screen — either
     because the deck follows the Rider–Waite compositions, or because it has
     supplied its own note for this card. */
  S.symbolismMatchesDeck = function (card) {
    var d = S.deck();
    if (d.id === 'rws' || d.faithful) return true;
    return !!(card && d.sym && d.sym[card.id]);
  };

})(window.SAGE = window.SAGE || {});
