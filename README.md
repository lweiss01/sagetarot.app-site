# Sage

A tarot reading journal for people who read with a physical deck.

You shuffle and pull the cards yourself. Sage records what you drew, writes a
detailed reading from it, keeps every reading, tells you what keeps recurring
across them, and teaches you the deck as you go.

---

## Running it

Double-click `index.html`. That is the whole install — no build step, no server,
no dependencies.

One caveat: some browsers restrict local storage on `file://` pages. If Settings
warns that readings cannot be saved, serve the folder instead:

```
cd sage
python -m http.server 8000     # then open http://localhost:8000
```

The 78 card images ship in `images/`, so the app works with no internet
connection at all. See `images/README.md` to swap in scans of your own deck.

---

## Sharing it with someone

Zip the folder, send it, they unzip and double-click `index.html`. That's it —
no install, no build step, no account.

What does **not** travel with the folder: your readings, your notes, your birth
date and your API keys all live in your browser's local storage, not in these
files. Whoever you send it to gets a clean, empty copy.

Note that `index.html` carries a Google Analytics tag pointed at the hosted site.
If you are handing out copies to run locally, either strip that block or accept
that those visits will land in the same statistics.

Four things worth telling them:

- **It works with no internet.** The card images ship in `images/`, so nothing is
  fetched from the network unless a file is missing, in which case that one image
  falls back to Wikimedia on its own.
- **Keep the folder together.** `index.html` needs the `css/`, `js/` and `images/`
  folders beside it. Moving just the HTML file out will give a blank page.
- **On Windows**, a zip downloaded from the internet can arrive blocked. If it
  misbehaves, right-click the zip → Properties → tick *Unblock* → then extract.
- **AI features need their own key.** Yours isn't in the folder.

If local storage turns out to be blocked — Settings will say so — serving the
folder fixes it:

```
cd sage
python -m http.server 8000     # then open http://localhost:8000
```

For anything more than a couple of people, hosting it is easier than emailing
zips: any static host works (GitHub Pages, Netlify drop, an S3 bucket). Then it's
just a URL, everyone gets updates when you push, and browser storage behaves
properly. The app has no server side at all, so nothing else changes.

---

## How it works

**New Reading** — pick one of seven spreads, then click each position and choose
the card you actually drew, with a toggle for reversed. When every position is
filled, Sage writes the reading and saves it.

You can also tag the question by area — work, relationship, money, health or
direction. The built-in engine can't read your question, but knowing the area is
enough to change what each suit is taken to mean: Pentacles is pay and hours in a
work question and who does the washing up in a relationship one. Tagged readings
gain a *Read Against Your Question* section and topic-specific advice.

**Reading for someone else** — a toggle on the New Reading page. Guest readings
are saved so your friend can reread, note and print them, but they're filed
separately and count towards none of your own statistics: not the journal, not
Themes, not your streak, not your draw tallies, not your card accuracy, and your
birth cards are never looked for in them. While it's on, your Journal, Themes and
Your Cards tabs are hidden so nobody wanders into your saved readings. One button
clears every guest reading without touching yours.

**Daily practice** — the home screen shows the last thirty days as a strip of
cards, a running count of consecutive days, and a one-click way to draw today's
card. One card a day teaches interpretation far faster than occasional big spreads.

**Journal** — every reading, newest first. Reopen one to reread it or add a note
about what actually happened. The reading text regenerates identically each time,
so the same draw always gives the same words.

**How it landed** — come back to a reading once you know how things went and rate
it *Solid Reading*, *Some Matches* or *Missed the Mark*, with a note on what
actually happened. This is the only part of Sage that measures anything real, and
it feeds everything below.

**Themes** — needs two or more readings. Finds cards that keep returning across
separate readings, the suit your life is currently being decided in, the suit
that has gone quiet, unusual major-arcana density, and numerological stages you
keep meeting. Once a few readings are rated it also reports your hit rate and,
more usefully, which individual cards you read well and which ones keep catching
you out — those show up on the card's own page too.

**Library** — all 78 cards with upright and reversed meanings, what to look at in
the picture, element, and astrological attribution. Each card shows how many
times you have drawn it and where. The dot tracks how well you know it:
grey unseen · rose shaky · gold getting there · green solid.

**Your Cards** — optional, and off until you enter a birth date in Settings.
Two old traditions that tie you to particular cards: your **birth card** (and its
pair, where the arithmetic produces one), your **card for the current year**,
which runs birthday to birthday, and the four cards belonging to your **sun
sign** — one Major Arcana card plus the three decans.

The sign cards aren't invented; they're the deck read backwards. Every card in
this deck carries a Golden Dawn astrological attribution, so each sign owns one
Major and three of the numbered minors. The birth-card arithmetic is a
twentieth-century numerology practice and readers genuinely disagree on the
method, so Sage names the variant it uses and shows every step of the working.

None of this makes a reading more accurate, and the app says so on the page.
Only the day, month and year are used — no time, no location, nothing leaves the
browser. If a spread happens to contain one of your cards, the reading adds a
short note.

**Learn** — a plain-English orientation for anyone new to this: how the deck is
put together, what the four suits cover, what reversed actually means (not "the
opposite"), how to choose a spread, and how to read one.

**Study** — ten-question rounds mixing four formats: name the card from its art,
match a card to its keywords, recall its meaning, name its element. Weighted
toward cards you have actually pulled in readings and cards you have got wrong
before, so it teaches your deck rather than a generic curriculum.

---

## The spreads

| Spread | Cards | For |
|---|---|---|
| Single Card | 1 | Daily practice, one clean question |
| Past · Present · Future | 3 | How it arrived, where it stands, where it's going |
| Celtic Cross | 10 | Full diagnostic |
| The Horseshoe | 7 | Situation → obstacle → guidance → outcome |
| The Relationship | 6 | You, them, the bond, the strain, the trajectory |
| The Crossroads | 5 | A decision: what each option offers and costs |
| Two Paths | 7 | Two roads, three cards down each |

---

## Two voices

Settings has a voice toggle that changes both the generated commentary and the
78 card meanings themselves.

**Plain language** is the default. Everyday words, no assumed knowledge: the
first time a reading mentions the Major Arcana, court cards or a reversed card,
it explains what that means in the same sentence. Elemental pairings say which
element each card is and what it stands for, rather than asserting that "Fire and
Water cancel". Every card also carries a one-line summary — *"A fresh start you
have not taken yet"* — above the fuller meaning.

**Traditional** is the older, more atmospheric register, for when you want the
tarot-book voice.

Readings are composed on the fly from the cards you recorded, so switching the
toggle rewrites everything you have already saved as well as anything new.

---

## How the readings are written

Everything runs locally. The engine composes each reading from:

- the card's upright or reversed meaning, bent by the specific position it landed in
- **elemental dignities** between structurally linked pairs — Fire and Air feed
  each other, Water and Earth nourish each other, Fire and Water cancel, Air and
  Earth resist
- **suit and element balance**, including which element is entirely missing
- **major arcana density** — how much of this is bigger than your daily choices
- **reversal ratio** and where in the spread the reversals fall
- **repeated numbers** read numerologically, court-card density, multiple aces
- a **spine** of the two to four positions that carry that particular spread,
  woven into a synthesis and a short list of concrete actions

The same draw always produces the same reading — it is seeded from the cards
themselves, not randomised.

### Optional: a second voice

Settings takes API keys for **Anthropic, OpenAI and Google**, each with an
editable model name. Keys are stored only in this browser, sent only to the
provider they belong to, and stripped from exported backups.

With one key set, every reading gets a **Deepen with AI** button — one call to
that provider for an original interpretation alongside the built-in one.

With two or more, you nominate a primary and gain a second button: **Convene the
council**. Each provider answers the same prompt *independently* — deliberately
not in sequence, because the first answer would otherwise anchor the rest and
you'd get three variations on one reading instead of three readings. The results
appear as tabs, with a short note above them on where they agreed and where they
genuinely diverged. That divergence is the point; the summary is instructed not
to smooth it into a consensus.

Costs a few cents per call. Everything else works without any of it.

---

## Your data and privacy

Readings, notes, birth date and API keys live in this browser's local storage.
They are never uploaded, there is no account, and no server holds a copy — the
site is static files on GitHub Pages with no back end at all. They survive
closing the app but not clearing site data.

**Settings → Export backup** writes a `.json` file with everything except the API
keys, which are deliberately stripped. Import restores it, merging or replacing.
Sage nudges you if you have ten or more readings and haven't exported in thirty
days.

Two things do leave the browser, both of them narrow:

**Anonymous usage statistics** go to Google Analytics — which views get opened,
which spreads get drawn, whether the AI features get used, how quizzes are
started. No questions, notes, card names or dates are ever sent. Visitors in
Europe and the UK are asked before any cookie is set, using Google Consent Mode
so nothing is stored until they answer; everyone else can switch it off in
**Settings → Privacy**, and the choice is remembered per device.

**AI readings**, when you press "Deepen with AI" or "Convene the council". That
sends the spread and your question to whichever provider you configured, and only
at the moment you press it.

Everything else — the readings themselves, the 78 card meanings, the interpretation
engine, the themes analysis, the study rounds — runs entirely on your machine.

---

## Checking it still works

- `test.html` — self test. Verifies deck integrity and spread definitions, runs
  thousands of randomly generated readings through the engine in both voices
  looking for errors, template leaks and thin output, and checks that plain mode
  never leaks traditional phrasing and always explains Major Arcana, court cards
  and reversals on first use. Open it after any edit.
- **Settings → Check all 78 images** — loads every card image and reports exactly
  which files failed.

---

## Files

```
index.html            the app
test.html             self test
css/styles.css        all styling
js/cards.js           major arcana — traditional voice
js/cards-minor.js     wands and cups — traditional voice
js/cards-minor2.js    swords and pentacles — traditional voice
js/cards-plain.js     major arcana — plain language, plus one-line summaries
js/cards-plain2.js    wands and cups — plain language
js/cards-plain3.js    swords and pentacles — plain language
js/spreads.js         the seven spreads and their position meanings
js/topics.js          what each suit means within each area of life
js/yourcards.js       birth, year and sun-sign card arithmetic
js/learn.js           the Learn page content
js/engine.js          reading composition and cross-reading themes
js/storage.js         local storage, export and import
js/consent.js         analytics consent banner and preference
js/ai.js              provider calls and the council
js/app.js             views and interaction
images/               drop your own card scans here (optional)
```

Artwork: Rider–Waite–Smith, Pamela Colman Smith, 1909 — public domain in the
United States and the United Kingdom.
