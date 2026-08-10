/* Sage — the Learn page. Plain-English orientation for someone new to tarot. */
(function (S) {
  'use strict';

  S.LEARN = [

  { id:'what', title:'What a reading actually is',
    body:[
      'A tarot deck is 78 cards. You shuffle, you draw some, and you lay them out in a pattern where each place means something specific. The card you drew and the place it landed get read together — so the same card means something different depending on where it falls.',
      'None of this predicts the future. What a spread does is give you a structured set of prompts about your own situation, in an order that makes you look at parts of it you would otherwise skip. The value is in what you notice, not in the cards being magic.',
      'You can treat it as a thinking tool, as a spiritual practice, or as both. Sage works the same either way.'
    ]},

  { id:'structure', title:'How the deck is put together',
    body:[
      'The 78 cards split into two groups, and knowing which group a card is from tells you a lot before you read anything else.',
      'The Major Arcana are 22 named cards — The Fool, The Tower, Death, The Star and so on. These are the big-picture cards. They deal with large forces, turning points and chapters of a life rather than day-to-day matters. When a lot of them turn up in one spread, the reading is telling you the situation is bigger than your daily choices.',
      'The Minor Arcana are the other 56, and they cover ordinary life. They are split into four suits of fourteen cards each: Ace through Ten, then four court cards — Page, Knight, Queen and King. If a spread is mostly Minor Arcana, that is good news in a sense: it means the situation is made of workable, human-scale material.'
    ]},

  { id:'suits', title:'The four suits',
    body:[
      'Each suit covers a different department of life, and each is associated with an element. When one suit dominates a spread, that is the area where the question is really being decided.'
    ],
    table:[
      ['Wands', 'Fire', 'Drive, energy, creativity, ambition — what you want and whether you will act on it.'],
      ['Cups', 'Water', 'Feelings and relationships — love, grief, intuition, what goes unsaid.'],
      ['Swords', 'Air', 'Thinking, truth, conflict and communication — including anxiety and hard conversations.'],
      ['Pentacles', 'Earth', 'Money, work, health, home — the practical and physical side of life.']
    ],
    after:[
      'The elements matter when you read two cards against each other. Fire and Air get along — energy and ideas agree, so things move. Water and Earth get along too — feeling gets turned into something real, so things last. But Fire and Water work against each other, and so do Air and Earth. When those clash in a spread, it usually means two parts of your situation are pulling in opposite directions.'
    ]},

  { id:'numbers', title:'What the numbers mean',
    body:[
      'Within each suit, the number describes a stage in a process. This is why drawing several cards of the same number is worth noticing — it says you are at the same point in more than one part of your life.',
      'Roughly: Aces are beginnings. Twos are pairs and choices. Threes are first growth. Fours are stability, and sometimes stagnation. Fives are disruption and loss. Sixes are balance restored. Sevens are holding on under pressure. Eights are power applied. Nines are the last hard stretch. Tens are completion and overflow.',
      'The court cards — Page, Knight, Queen, King — usually stand for people, or for a way of behaving. A spread full of court cards is telling you the answer runs through other human beings.'
    ]},

  { id:'reversed', title:'Reversed cards',
    body:[
      'A reversed card is simply one that came out of the deck upside down. In Sage you mark this yourself with the toggle when you record each card.',
      'The common misunderstanding is that reversed means the opposite. It usually does not. A reversed card more often means that the card\'s energy is blocked, held inside rather than expressed, delayed, or overdone.',
      'So The Sun reversed is not misery — it is more like happiness that is present but somehow not landing. The Tower reversed is not safety — it is a collapse being postponed or resisted.',
      'If most of a spread comes out reversed, read it as a situation where the right things are present but nothing is flowing outward yet. That is a real diagnosis, and it usually means the work is internal before it is external.',
      'Reading reversals is optional in tarot generally. If you would rather not, just leave the toggle alone and every card will read upright.'
    ]},

  { id:'spreads', title:'Choosing a spread',
    body:[
      'The spread is the pattern you lay the cards in. Each position asks a specific question, and Sage shows you that question when you place a card there.',
      'Start with the Single Card for daily practice, or Past · Present · Future when you want to see how something arrived and where it is heading. Both are quick enough to do often, and doing it often is what builds the skill.',
      'The Celtic Cross is the full diagnostic — ten cards covering the heart of the matter, what is blocking it, its history, the people around it, and the likely outcome. It is a lot to take in at once, so it rewards being saved and reread.',
      'The Crossroads and Two Paths are for decisions: what each option offers and what it costs. The Relationship spread reads a connection between two people from both sides.'
    ]},

  { id:'how', title:'How to actually read one',
    body:[
      'Ask a real question. "Should I take the job?" is weaker than "What am I not seeing about this job offer?" — the second gives the cards somewhere to go and does not ask them to decide for you.',
      'Look at the whole spread before reading any single card. How many are Major Arcana? Is one suit dominating? How many are reversed? That shape tells you what kind of situation this is before any individual meaning gets involved.',
      'Then read each card in its position, and pay particular attention to cards that sit in related positions — the reading will point these out. Two cards pulling against each other is usually the most useful thing in a spread.',
      'Finally: disagree with it when you disagree with it. Write that in the notes. A reading you argued with is more useful than one you nodded along to, and the notes are where the learning actually accumulates.'
    ]},

  { id:'astrology', title:'Tarot and astrology are not the same thing',
    body:[
      'These get confused constantly, so it is worth separating them. Astrology reads the positions of the sun, moon and planets at a particular moment — which is why it needs a birth date, time and place. Tarot is a deck of cards. They are different practices with different histories.',
      'Tarot is also much younger than people assume. It began in fifteenth-century Italy as an ordinary card game — people played trick-taking games with tarot decks for roughly 350 years before anyone used them for divination, and in parts of Europe they still do. Fortune-telling with tarot only starts in the late 1700s.',
      'So why does every card in Sage have an astrological attribution — Mars in Leo, Venus, Saturn in Capricorn? Because of the deck this app uses. The Rider–Waite–Smith deck came out of the Hermetic Order of the Golden Dawn, an occult society founded in 1888 that deliberately welded tarot, astrology, Kabbalah and the four classical elements into a single system. They assigned every card a planet or a slice of the zodiac, and those assignments came along with the artwork.',
      'The important thing is that it runs one way. The system says this card corresponds to that planet. Nothing about the actual sky feeds back into what a card means, and no established tarot practice uses your birth chart to change how a spread is read.',
      'There are two small traditions that use a birth date — a "birth card" found by adding up the digits of your date of birth, and the three numbered cards that share your sun sign\'s slice of the zodiac. They are genuine conventions and some readers enjoy them. They are also decorative rather than mechanical, which is why Sage does not ask for your birth details.'
    ]},

  { id:'sage', title:'Getting the most out of Sage',
    body:[
      'Tag your question by topic when you record a spread. The built-in reading cannot read your question, but telling it whether this is about work, a relationship, money, health or direction changes what each suit is taken to mean — Pentacles is pay and hours in a work question, and who does the washing up in a relationship one.',
      'Save every reading, even the ones that felt like nothing. The Themes page needs several readings before it can see anything, and it is looking for exactly the patterns you cannot see from inside a single spread — cards that keep returning, the suit your life is currently being decided in, the stage you keep meeting.',
      'Rate your readings once you know how things turned out. This is the one part of the app that measures something real: with a handful of ratings, Themes can tell you which cards you read well and which ones you consistently misjudge.',
      'Draw one card most days. It matters much more than the occasional big spread — the home screen keeps a running count and shows you the last thirty days at a glance.',
      'Use the Study page in short bursts. It weights its questions toward cards you have actually drawn and cards you have got wrong before, so it teaches your deck rather than a generic syllabus.',
      'If the writing feels too plain or not plain enough, Settings has a voice toggle. Plain language is the default; Traditional uses the older, more atmospheric register.'
    ]}

  ];

})(window.SAGE = window.SAGE || {});
