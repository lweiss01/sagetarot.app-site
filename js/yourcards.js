/* Sage — https://sagetarot.app
 * Copyright © 2026 Future Proof Works. All rights reserved.
 * Not licensed for reuse or redistribution. See LICENSE.
 */

/* Sage — birth cards, year cards and sun-sign cards.
 *
 * These are conventions from the Golden Dawn era and after, not mechanisms.
 * Nothing here makes a reading more accurate; it gives you a personal thread
 * through the deck, which readers tend to enjoy. The app says so out loud.
 *
 * Two independent systems live in this file:
 *
 * 1. BIRTH AND YEAR CARDS — arithmetic on your date of birth, reduced to a
 *    Major Arcana number. Methods genuinely disagree with one another, so the
 *    one used here is written down and every step is exposed for inspection.
 *
 * 2. SUN-SIGN CARDS — read straight out of the deck's own attributions. Each
 *    Major Arcana card carries a sign, and each numbered minor from Two to Ten
 *    carries a decan (a 10° third of a sign). Nothing is invented here: the data
 *    was already in cards.js. This part is unambiguous.
 */
(function (S) {
  'use strict';

  /* ================= birth and year cards ================= */

  /* The method, stated plainly:
   *   1. add the month, the day and the full year together
   *   2. add the digits of that total together, repeatedly, until 22 or less
   *   3. 22 is read as 0, The Fool
   *   4. if the result is between 10 and 21 it also reduces once more, giving a
   *      second card — the pair. Ten or under gives a single card.
   * Other readers reduce the year first, or keep reducing to a single digit
   * always. This is the most widely used variant. */

  S.BIRTH_METHOD = 'month + day + year, digits summed until 22 or less';

  function digitSum(n) {
    return String(n).split('').reduce(function (t, d) { return t + parseInt(d, 10); }, 0);
  }

  function parseDate(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    var p = iso.split('-');
    var y = parseInt(p[0], 10), m = parseInt(p[1], 10), d = parseInt(p[2], 10);
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    var probe = new Date(y, m - 1, d);
    if (probe.getFullYear() !== y || probe.getMonth() !== m - 1 || probe.getDate() !== d) return null;
    return { y: y, m: m, d: d };
  }
  S.parseBirthDate = parseDate;

  var MAJOR_BY_NUM = null;
  function majorByNum(n) {
    if (!MAJOR_BY_NUM) {
      MAJOR_BY_NUM = {};
      S.CARDS.forEach(function (c) { if (c.arcana === 'major') MAJOR_BY_NUM[c.num] = c; });
    }
    return MAJOR_BY_NUM[n] || null;
  }

  /* Reduce a starting total to a Major Arcana number, recording every step so
     the page can show its working. */
  function reduceToMajor(total) {
    var steps = [];
    var n = total;
    while (n > 22) {
      var next = digitSum(n);
      steps.push(String(n) + ' → ' + String(n).split('').join(' + ') + ' = ' + next);
      n = next;
    }
    var cards = [];
    var fool = false;
    if (n === 22) { fool = true; n = 0; }
    cards.push(n);

    /* The pair: a two-digit result reduces once more to a second card. */
    if (n >= 10 && n <= 21) {
      var pair = digitSum(n);
      steps.push(String(n) + ' → ' + String(n).split('').join(' + ') + ' = ' + pair);
      cards.push(pair);
    }

    return { value: n, cards: cards, steps: steps, fool: fool };
  }

  S.birthCards = function (iso) {
    var b = parseDate(iso);
    if (!b) return null;
    var total = b.m + b.d + b.y;
    var res = reduceToMajor(total);
    return {
      total: total,
      opening: b.m + ' + ' + b.d + ' + ' + b.y + ' = ' + total,
      steps: res.steps,
      fool: res.fool,
      cards: res.cards.map(majorByNum).filter(Boolean)
    };
  };

  /* Your year card runs birthday to birthday, so before this year's birthday
     you are still in last year's card. */
  S.yearCards = function (iso, today) {
    var b = parseDate(iso);
    if (!b) return null;
    var now = today || new Date();
    var year = now.getFullYear();
    var birthdayThisYear = new Date(year, b.m - 1, b.d);
    if (now < birthdayThisYear) year -= 1;

    var total = b.m + b.d + year;
    var res = reduceToMajor(total);
    return {
      year: year,
      runsFrom: new Date(year, b.m - 1, b.d),
      runsTo: new Date(year + 1, b.m - 1, b.d),
      total: total,
      opening: b.m + ' + ' + b.d + ' + ' + year + ' = ' + total,
      steps: res.steps,
      fool: res.fool,
      cards: res.cards.map(majorByNum).filter(Boolean)
    };
  };

  /* ================= sun sign ================= */

  /* Tropical zodiac. Boundaries shift by a day or so year to year, so anyone
     born within a day of a cusp should check an ephemeris rather than trust
     this table. The page says as much. */
  S.SIGNS = [
    { name:'Capricorn',   from:[12,22], to:[1,19],  element:'Earth' },
    { name:'Aquarius',    from:[1,20],  to:[2,18],  element:'Air'   },
    { name:'Pisces',      from:[2,19],  to:[3,20],  element:'Water' },
    { name:'Aries',       from:[3,21],  to:[4,19],  element:'Fire'  },
    { name:'Taurus',      from:[4,20],  to:[5,20],  element:'Earth' },
    { name:'Gemini',      from:[5,21],  to:[6,20],  element:'Air'   },
    { name:'Cancer',      from:[6,21],  to:[7,22],  element:'Water' },
    { name:'Leo',         from:[7,23],  to:[8,22],  element:'Fire'  },
    { name:'Virgo',       from:[8,23],  to:[9,22],  element:'Earth' },
    { name:'Libra',       from:[9,23],  to:[10,22], element:'Air'   },
    { name:'Scorpio',     from:[10,23], to:[11,21], element:'Water' },
    { name:'Sagittarius', from:[11,22], to:[12,21], element:'Fire'  }
  ];

  S.sunSign = function (iso) {
    var b = parseDate(iso);
    if (!b) return null;
    for (var i = 0; i < S.SIGNS.length; i++) {
      var s = S.SIGNS[i];
      var fm = s.from[0], fd = s.from[1], tm = s.to[0], td = s.to[1];
      if (fm > tm) {
        /* Capricorn straddles the new year. */
        if ((b.m === fm && b.d >= fd) || (b.m === tm && b.d <= td) || b.m > fm || b.m < tm) return s;
      } else {
        if ((b.m === fm && b.d >= fd) || (b.m === tm && b.d <= td) || (b.m > fm && b.m < tm)) return s;
      }
    }
    return null;
  };

  /* Within a day of a boundary the sign may differ from this table. */
  S.nearCusp = function (iso) {
    var b = parseDate(iso);
    if (!b) return false;
    return S.SIGNS.some(function (s) {
      return (b.m === s.from[0] && Math.abs(b.d - s.from[1]) <= 1) ||
             (b.m === s.to[0] && Math.abs(b.d - s.to[1]) <= 1);
    });
  };

  /* ================= sign → cards =================
     Read out of the deck's own attribution strings. The Major whose attribution
     is exactly the sign; the three numbered minors whose attribution reads
     "<planet> in <sign>", in decan order. */

  S.signCards = function (signName) {
    if (!signName) return null;
    var major = null, decans = [];
    S.CARDS.forEach(function (c) {
      if (c.arcana === 'major') {
        if (c.astro === signName) major = c;
      } else if (new RegExp(' in ' + signName + '$').test(c.astro)) {
        decans.push(c);
      }
    });
    decans.sort(function (a, b) { return a.num - b.num; });
    return { major: major, decans: decans };
  };

  /* ================= everything at once ================= */

  S.yourCards = function (iso, today) {
    var b = parseDate(iso);
    if (!b) return null;
    var sign = S.sunSign(iso);
    return {
      birth: S.birthCards(iso),
      year: S.yearCards(iso, today),
      sign: sign,
      nearCusp: S.nearCusp(iso),
      signCards: sign ? S.signCards(sign.name) : null
    };
  };

  /* id → why this card is yours, for the quiet note in a reading */
  S.yourCardLabels = function (iso, today) {
    var y = S.yourCards(iso, today);
    var map = {};
    if (!y) return map;
    (y.birth ? y.birth.cards : []).forEach(function (c, i) {
      map[c.id] = i === 0 ? 'your birth card' : 'the second half of your birth card pair';
    });
    (y.year ? y.year.cards : []).forEach(function (c, i) {
      if (map[c.id]) map[c.id] += ', and also your card for this year';
      else map[c.id] = i === 0 ? 'your card for this year' : 'the second half of this year\'s pair';
    });
    if (y.signCards) {
      if (y.signCards.major && !map[y.signCards.major.id]) {
        map[y.signCards.major.id] = 'the Major Arcana card of your sign, ' + y.sign.name;
      }
      y.signCards.decans.forEach(function (c) {
        if (!map[c.id]) map[c.id] = 'one of the three cards belonging to ' + y.sign.name;
      });
    }
    return map;
  };

})(window.SAGE = window.SAGE || {});
