/* Sage — https://sagetarot.app
 * Copyright © 2026 Future Proof Works. All rights reserved.
 * Not licensed for reuse or redistribution. See LICENSE.
 */

/* Sage — plain-language card meanings.
 *
 * Keyed by card id, so the original text in cards*.js is untouched and stays
 * available as the "Traditional" voice. Settings chooses between them.
 *
 * House style for this file:
 *   short  one clause, twelve words or fewer, no jargon
 *   up/rev three to five sentences, second person, everyday words,
 *          concrete rather than metaphorical, and any tarot term explained
 *          in the same breath it is used
 */
(function (S) {
  'use strict';

  S.PLAIN = {

  /* ===================== MAJOR ARCANA ===================== */

  'fool': {
    short: 'A fresh start you have not taken yet.',
    up: 'Something in your life is genuinely new, and you have not done it before — that is the whole point of this card. The Fool is the moment just before you begin, when nothing has gone wrong because nothing has happened yet. It is asking you to start without knowing how it turns out, because doing it is the only way to find out. There is real risk here and the card does not pretend otherwise. It just thinks staying where you are is the bigger risk.',
    rev: 'You are stuck at the starting line, and it is worth working out which kind of stuck. Either you are hesitating — running through everything that could go wrong instead of beginning. Or you already jumped without thinking it through, and now you are dealing with the consequences. The fix is opposite in each case, so be honest about which one you are doing. This card can also mean a fresh start you keep planning and never begin, because planning it feels safer than risking it.'
  },

  'magician': {
    short: 'You already have what you need. Use it.',
    up: 'Everything this needs is already available to you — the skill, the contacts, the time, the tools. The Magician is not about getting more of anything. It is about taking what you already have and actually pointing it at one thing. This card usually turns up when your ability and your opportunity have quietly lined up and the only missing piece is you deciding to act.',
    rev: 'You have the ability but it is going nowhere. That looks like talent you never use, plans you describe to people but never start, or effort spread across so many projects that none of them get anywhere. There is also a warning in this card about using persuasion to manage how something looks rather than to make it real — including the version of that where you talk yourself into believing your own account.'
  },

  'high-priestess': {
    short: 'You know something you have not admitted yet.',
    up: 'There is something here you cannot work out by thinking harder about it. The High Priestess shows up when the honest answer is "not yet clear" — and when forcing an answer now would give you the wrong one. This is a card for waiting, sleeping on it, and paying attention to the sense you get rather than the argument you can make. Something is being kept back, sometimes by circumstances and sometimes by you, and that is doing useful work for now.',
    rev: 'This is the instinct you talked yourself out of. You knew something, and you found reasons not to know it, usually because knowing it was inconvenient. It can also mean a secret that is getting harder to keep, or a stretch where there is so much noise around you — advice, opinions, your phone — that you cannot hear what you think.'
  },

  'empress': {
    short: 'Things grow here if you look after them.',
    up: 'This is about things growing because the conditions are right, not because you forced them. That covers creative work, projects, relationships, your body, actual gardens. The Empress asks for patience with how long things take and generosity with what you put in, and she rewards steady care. Where she turns up, the useful move is to look after the thing rather than push it — and to let yourself enjoy what you have already made.',
    rev: 'You have run dry, or the care has turned into control. This is giving more than you can afford to give, or creative work that will not get going because you keep digging it up to check on it. It also covers neglecting basic physical needs — food, sleep, rest, being touched, having something nice to look at. Occasionally it points to a relationship where one person needs the other to keep needing them.'
  },

  'emperor': {
    short: 'Structure and clear rules would fix this.',
    up: 'What this needs is order. The Emperor is about the boring scaffolding that makes energy useful: a schedule, a boundary, a written agreement, someone clearly in charge of deciding. Where he turns up, the mess is costing you more than the rules would. The move is to define how this works — including the rules you set for yourself and then actually keep.',
    rev: 'Either the structure has become a cage, or it has fallen apart completely. This is control for its own sake, or someone in authority who has confused being obeyed with being respected. It is also the opposite: nobody holding the line, nothing followed through, a situation drifting because no one will just decide. It can point to unfinished business with a parent or a boss.'
  },

  'hierophant': {
    short: 'Someone has solved this before. Go and ask them.',
    up: 'There is an established way of doing this and it is worth taking seriously — a method, a training, a teacher, the answer a lot of people arrived at before you. The Hierophant also covers things that bind a group together: marriage, joining an organisation, shared traditions and ceremonies. Its usual advice is to learn the standard way properly before you start improvising on it.',
    rev: 'The form has outlived what it was for. This is noticing that an institution is repeating words nobody believes, or that a teacher\'s authority comes from their position rather than from knowing anything. It is a card about leaving in good conscience — quitting the programme, doing it your own way. The one caution is that rejecting a tradition you never actually learned is not the same as outgrowing it.'
  },

  'lovers': {
    short: 'A choice about what you actually value.',
    up: 'This is more than romance. The Lovers is about a choice that defines who you are, which is why it turns up so often for decisions that look like relationships but are really about identity. Work out what you genuinely value, then choose in line with it. Where the card sits well, it also promises real partnership: two things that belong together, joined without either one shrinking.',
    rev: 'Something is out of line — either between you and another person, or between what you say you value and what you actually do each day. This card often marks a decision you have put off so long that circumstances are about to make it for you. It can also mean a connection where the attraction is real but you want different things from life, which is a harder problem than it first looks.'
  },

  'chariot': {
    short: 'You can win this if you hold your nerve.',
    up: 'This is progress made by holding a course under pressure. The Chariot does not win by getting rid of the conflict — it wins by harnessing two things pulling in opposite directions and going somewhere anyway. It rewards concentration and nerve, and it generally means this can be won if you refuse to be pulled off course.',
    rev: 'You have lost the reins. That looks like effort scattering, momentum draining away into competing demands, or pushing so hard that you are creating the resistance you then have to fight. It can also mean travelling fast in a direction you never actually chose, or winning something that stopped mattering to you a while ago.'
  },

  'strength': {
    short: 'Gentleness will work here. Force will not.',
    up: 'The strength in this card is the soft kind, and it works. This is persuasion instead of pressure, patience instead of force, the steady hand that calms something down rather than the hard one that pins it. Usually the thing being handled is your own appetite, temper or fear — and the message is that these are not enemies to defeat but animals to get on good terms with. That is slower than force and much more durable.',
    rev: 'Either the animal is running the show, or you have shut it in a room and it is howling. This is patience that has run out, courage worn down into self-doubt, or trying to power through something that actually needs tenderness and time. It can also mean feeling ashamed of a completely ordinary human need.'
  },

  'hermit': {
    short: 'Go away and think about this alone.',
    up: 'Step back from the noise and look at this by yourself. Not because people are the problem, but because the answer here is quiet and you cannot hear it in company. The Hermit often marks the middle of something long, where the initial excitement has worn off and the real work is solitary. It can also mean there is someone wise available to you — or that you are becoming that person for someone else.',
    rev: 'Being alone has tipped into being lonely, which is a different thing. This is time by yourself that stopped producing any insight a while ago, or stubbornly refusing help that would save you months. Occasionally it means the reverse: you are so surrounded by people that you cannot think at all, and the time alone is overdue.'
  },

  'wheel': {
    short: 'Things are about to turn, and not by your hand.',
    up: 'This situation is about to change, and not entirely because of anything you do. The Wheel covers the part of life that is timing and luck — the things that shift while you are busy making other plans. Upright it usually favours you: an opening, a change of fortune, momentum coming back. Its deeper point is that every position on the wheel is temporary, which is reassuring at the bottom and worth remembering at the top.',
    rev: 'Either the luck is running against you, or you are trying to stop something that is going to turn anyway. This can be a genuinely bad stretch, or the exhausting work of holding a phase in place past its natural end. Some of what is happening is not your fault and not yours to fix, and working out which part is which is most of the job.'
  },

  'justice': {
    short: 'What you did is catching up with you, fairly.',
    up: 'This is about consequences being worked out honestly: what was actually done, what is actually owed, and what a fair outcome looks like once feelings are set aside. It often comes up around legal matters, contracts and formal decisions, but more broadly it means a situation is being weighed and the result will follow the evidence. Where you have behaved well, that is good news.',
    rev: 'Something here is not fair. That might be unfairness you are on the receiving end of, or responsibility being dodged — sometimes by you. It can also be a judgement made on half the information and then defended out of pride. This card asks for the uncomfortable version of the story: the one that includes your own part in how things got here.'
  },

  'hanged-man': {
    short: 'Stop struggling and look at it differently.',
    up: 'Stop pushing and look at this from another angle. The Hanged Man is a deliberate pause — you give something up in order to see something you could not see while you were busy. It often shows up during forced waits: the delay, the limbo, the stretch where nothing can be moved forward. The pause is useful if you spend it questioning your assumptions rather than grinding your teeth.',
    rev: 'The pause has stopped teaching you anything. This is delay you are causing yourself, sacrifice nobody asked you to make, or a suffering position you are holding because it is more comfortable than acting. It can also mean the opposite and better thing: you have learned what you needed to, and it is time to come down and rejoin the world.'
  },

  'death': {
    short: 'Something is over. Treat it as over.',
    up: 'Something has ended, and the whole task is treating it as ended. This card is very rarely about literal death. It is about a clean ending that makes room — a job, a relationship, a belief, a version of yourself that no longer fits. It is not gentle, but it is fair: what it takes was already finished. Whatever comes next is real, and you cannot get to it while you are keeping the old thing on life support.',
    rev: 'You are holding the door shut. This is an ending you have accepted in theory but not acted on: the job you quit in your head, the relationship you are running on fumes. The reluctance makes complete sense. The card just notes that things are now rotting in place, which is worse than a clean cut.'
  },

  'temperance': {
    short: 'Find the right mix. Adjust slowly.',
    up: 'The skill here is proportion. Temperance is about blending two things into something neither could be alone — work and rest, boldness and care, two people, two ideas. It recommends the unglamorous middle path and a longer timescale than you would like. The answer is not one or the other but the right ratio, and you find that by adjusting as you go rather than deciding upfront.',
    rev: 'Something has gone to an extreme. That could be overdoing it or over-restricting it, a schedule with no give in it, a partnership where the balance is off, or impatience that keeps interrupting a process that only works slowly. It can also mean two things that genuinely do not mix and should be kept apart rather than forced together.'
  },

  'devil': {
    short: 'You are tied to something, and part of you likes it.',
    up: 'You are attached to something that is working for you in some way. That is the habit that soothes you, the relationship that flatters you, the job that pays too well to leave, the story about yourself that excuses everything. The Devil is not moralising about this. It just points at the chain and notes that you put it on yourself. Nothing changes until you admit what you are getting out of it.',
    rev: 'The chain is loosening. This is the start of getting free: seeing the pattern clearly, naming the habit, walking out. It is genuinely good news, though the card is honest that the first stretch afterwards is uncomfortable and the pull backwards is strong. Occasionally it warns that you are suppressing something rather than dealing with it, which tends to bring it back worse.'
  },

  'tower': {
    short: 'Something built on a lie is about to collapse.',
    up: 'Something built on a false foundation comes down, fast. This is the sudden discovery that makes a whole arrangement impossible to keep up — the phone call, the thing you find out, the moment the story stops working. It is unpleasant and it is clarifying, and what it destroys was going to fall eventually anyway. Nobody enjoys this card, but it removes in an afternoon what avoiding it would have preserved for years.',
    rev: 'The collapse is being delayed, resisted, or happening in slow motion. This can be a crisis you narrowly avoided, a structure you are frantically propping up, or dread about a disaster that has not come and may never. It is also the aftermath: standing in the rubble, still shaking, starting to notice what is actually still standing.'
  },

  'star': {
    short: 'Quiet hope, and healing that is already underway.',
    up: 'This is calm, unhurried recovery. The Star is hopeful without being naive, because it arrives after the worst has already happened. It promises healing that is slow and real, energy coming back, and a sense of direction that feels less like a plan and more like a fixed point to steer by. It also carries a sense of being seen and known — the figure on the card is completely unguarded.',
    rev: 'The light is hard to find. This is discouragement, faith worn thin, losing the sense that any of this is going anywhere. It can mark a dry patch creatively or spiritually. The card is not saying the star has gone out, only that something is in the way — and the fix is usually rest and honesty rather than more effort.'
  },

  'moon': {
    short: 'You cannot see clearly. Go slowly.',
    up: 'You cannot see this clearly right now, and you should move slowly rather than not at all. The Moon covers half-light territory: anxiety, dreams, gut feeling, and the way fear bends what you think you are seeing. Things are not as they appear — though the card is careful to say they might be better as well as worse. This is material for a journal rather than for a decision.',
    rev: 'The fog is clearing. Usually this means confusion resolving, a fear finally named and therefore smaller, or something dishonest coming to light. It can also mean you are pushing down what your dreams and your gut keep telling you, successfully keeping it at arm\'s length at the cost of a constant low unease.'
  },

  'sun': {
    short: 'It is going well. You are allowed to enjoy it.',
    up: 'This is the clearest and most generous card in the deck. Things are visible, warm and going well — success that is not a secret, health coming back, happiness that does not need justifying. It has an uncomplicated quality that adult life makes rare, and where it turns up the honest reading is simply: this is good, and you are allowed to enjoy it. It also means truth coming fully into the open.',
    rev: 'The sun is still up but something is between you and it. This is happiness that is present but not landing, success that arrives without satisfaction, or cheerfulness performed over something unresolved. It rarely means disaster — more often a delay, or a reminder that the good thing needs to be actually felt rather than ticked off.'
  },

  'judgement': {
    short: 'Face the past honestly, then act on what you find.',
    up: 'This is a reckoning followed by a call to do something. Judgement is the point where a long chapter gets honestly assessed and something is asked of you as a result. It carries a strong sense of work you are supposed to be doing, or a truth you are supposed to act on, and the relief of finally dealing with a past instead of carrying it. Where it turns up, the verdict is usually kinder than the one you have been giving yourself.',
    rev: 'Either you are ignoring the call, or you are judging yourself and doing it harshly. This is a past that will not close because it has never been faced, a decision you keep reopening, or an inner critic convicting you on very old evidence. It can also mean you can hear clearly what you are meant to be doing and are turning it down for practical reasons.'
  },

  'world': {
    short: 'Something has genuinely finished. Take the credit.',
    up: 'A cycle finishes and the pieces come together. This is arrival — the project delivered, the lesson actually learned all the way through, a chapter that closed properly instead of trailing off. It carries a note of travel and of a wider world opening up, because finishing here is less an ending than a graduation into something larger. Give yourself the credit.',
    rev: 'You are nearly there. This is the last ten percent that never gets done: the qualification not claimed, the trip not booked, the relationship that has arrived without either of you saying so. It can also mean an anticlimax — reaching the goal and finding it oddly flat, which usually means the goal was inherited rather than chosen.'
  }

  };
})(window.SAGE = window.SAGE || {});
