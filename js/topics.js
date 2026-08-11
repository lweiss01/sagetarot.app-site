/* Sage — https://sagetarot.app
 * Copyright © 2026 Future Proof Works. All rights reserved.
 * Not licensed for reuse or redistribution. See LICENSE.
 */

/* Sage — question topics.
 *
 * The offline engine cannot read your question, but it can be told what area of
 * life the question belongs to. That is enough to change what each suit means:
 * Pentacles in a work question is pay and hours, in a relationship question it is
 * who does the washing up, in a health question it is the body itself.
 *
 * Each topic supplies:
 *   suits        what each suit is pointing at within this area of life
 *   majorHeavy   what a spread full of Major Arcana means here
 *   courtHeavy   what a spread full of court cards means here
 *   reversedHeavy what heavy reversal means here
 *   advice       a closing action framed for this area
 */
(function (S) {
  'use strict';

  S.TOPICS = [

  { id:'none', label:'No topic', chip:'General',
    blurb:'Read the spread without tilting it toward any particular area of life.' },

  { id:'work', label:'Work and career', chip:'Work',
    blurb:'A job, a role, a project, a business, a colleague.',
    frame:'You marked this as a question about work, so read every card as describing something concrete about your working life — the role, the people in it, the money, and what you actually want out of it.',
    suits:{
      wands:'Wands in a work question is ambition and appetite: whether you genuinely want this job, this project, this promotion — and whether you have any energy left for it. Wands turning up here is usually asking whether the wanting is still real or whether you are running on habit.',
      cups:'Cups in a work question is the human side of the job: your relationships with the people there, whether you feel valued, and what the work is doing to you emotionally. Cups here often means the problem is not the work itself.',
      swords:'Swords in a work question is the politics and the plain facts: what is being said, what is being decided above your head, the conversation you have been avoiding, and the story you tell yourself about your own competence.',
      pentacles:'Pentacles in a work question is the material reality of it: pay, security, hours, commute, your health, and whether the numbers actually work. Pentacles here asks you to stop discussing the job in the abstract.'
    },
    majorHeavy:'A lot of Major Arcana in a work question usually means this is not really about the job. It is about a larger direction your working life is taking, and this particular role is just where it happens to be showing up.',
    courtHeavy:'A lot of court cards in a work question means people are the deciding factor here, not merit and not process. Work out who each of these cards is before you plan anything.',
    reversedHeavy:'Heavy reversal in a work question usually means you have already decided something and have not said it out loud yet — often to yourself first.',
    advice:'Put a date on the next concrete step at work: a conversation booked, an application sent, a number named. Work questions stall on vagueness more than on anything else.' },

  { id:'relationship', label:'A relationship', chip:'Relationship',
    blurb:'A partner, a friend, a family member, someone new.',
    frame:'You marked this as a question about a relationship, so read every card as describing something about the connection itself — how each of you is behaving, what is being said and not said, and what you each actually want from it.',
    suits:{
      wands:'Wands in a relationship question is desire and drive: attraction, wanting, and whether either of you still has energy for this. Wands here can be passion, and it can equally be the effort of keeping something going.',
      cups:'Cups in a relationship question is the heart of it — how you both feel, what has gone unspoken, and how much of yourself you are willing to let be seen. When Cups dominate, the answer is emotional and not logistical.',
      swords:'Swords in a relationship question is what gets said: the arguments, the honesty, and the conclusions you have quietly drawn about them and never checked out loud.',
      pentacles:'Pentacles in a relationship question is the practical fabric of it: money, living arrangements, time, and who actually does what. Unglamorous, and the thing most relationships actually founder on.'
    },
    majorHeavy:'A lot of Major Arcana in a relationship question usually means this connection is doing something bigger in your life than its day-to-day suggests. It is tangled up with how you see yourself.',
    courtHeavy:'A lot of court cards means there are more people in this than the two of you — family, an ex, friends with opinions. Somebody else is in the picture.',
    reversedHeavy:'Heavy reversal in a relationship question usually means things are being felt and not said. All the material is there; none of it is out loud.',
    advice:'Say one true thing to the other person this week. Relationship spreads almost never resolve through more thinking on your own.' },

  { id:'money', label:'Money', chip:'Money',
    blurb:'Income, debt, a purchase, security, a financial decision.',
    frame:'You marked this as a question about money, so read the cards as describing both your actual financial situation and your relationship to it — what you have, what you are afraid of, and what you keep not looking at.',
    suits:{
      wands:'Wands in a money question is appetite and risk: how much you want, how fast, and whether you are willing to gamble for it.',
      cups:'Cups in a money question is how money makes you feel — the shame, the sense of safety, the family history you inherited around it, and the way you use spending to manage emotion.',
      swords:'Swords in a money question is the arithmetic and the honesty: the numbers you have not added up, and the story you tell about being good or bad with money, which is usually older than the numbers.',
      pentacles:'Pentacles in a money question is the money itself — the balance, the income, the debt, the plan. This is the suit that actually belongs to this question, so pay attention to what it is saying.'
    },
    majorHeavy:'A lot of Major Arcana in a money question usually means this is about security and self-worth rather than arithmetic. The numbers are the symptom, not the subject.',
    courtHeavy:'A lot of court cards means other people are financially involved here — a partner, family, an employer, someone you owe. This is not a solo calculation.',
    reversedHeavy:'Heavy reversal in a money question usually means avoidance. Something has not been opened, added up, or admitted to someone.',
    advice:'Open the account and look at the actual number this week. Money questions get worse in direct proportion to how long they stay abstract.' },

  { id:'health', label:'Health and the body', chip:'Health',
    blurb:'Energy, habits, recovery, how you are treating yourself.',
    frame:'You marked this as a question about health, so read the cards as describing how you are relating to your body — the habits, the fear, and the attention you are or are not paying. Worth saying plainly: tarot is not diagnostic, and nothing in this reading is a substitute for a doctor.',
    suits:{
      wands:'Wands in a health question is energy and vitality: how much you have, what you are spending it on, and whether you have been running on empty for longer than you have admitted.',
      cups:'Cups in a health question is emotional wellbeing and the way it shows up physically — stress, grief, comfort, and whatever you reach for to soothe yourself.',
      swords:'Swords in a health question is the mental side: worry, sleeplessness, going over things at night, and the fear that grows in the gap while you are waiting for an actual answer.',
      pentacles:'Pentacles in a health question is the body itself and the practical routine around it — food, sleep, movement, appointments, and whether you can afford the care you need.'
    },
    majorHeavy:'A lot of Major Arcana in a health question usually means this has become a chapter rather than an episode — something you are living inside rather than fixing.',
    courtHeavy:'A lot of court cards means other people are central to this: the people caring for you, the people you are caring for, or the professionals you are dealing with.',
    reversedHeavy:'Heavy reversal in a health question usually means something is being postponed. Very often that something is an appointment.',
    advice:'If there is a physical symptom anywhere in this, book the appointment. A reading is a good place to think and a bad place to diagnose.' },

  { id:'direction', label:'Direction and meaning', chip:'Direction',
    blurb:'Where your life is going, a big decision, what matters.',
    frame:'You marked this as a question about direction, so read the cards as describing the shape of the whole thing rather than any single part of it.',
    suits:{
      wands:'Wands in a question about direction is what you actually want, as distinct from what you have agreed to want. Worth being honest about the difference.',
      cups:'Cups in a question about direction is who you want around you, and what you would regret never having felt.',
      swords:'Swords in a question about direction is the honesty problem: the thing you already know and keep not acting on.',
      pentacles:'Pentacles in a question about direction is what is practically possible — money, time, obligations, and the constraints that are real rather than imagined.'
    },
    majorHeavy:'A lot of Major Arcana in a question about direction is exactly what you would expect, and it is meaningful: it says the change under way is real rather than a passing mood.',
    courtHeavy:'A lot of court cards means your direction is currently being shaped by other people — their expectations of you, or roles you agreed to a long time ago.',
    reversedHeavy:'Heavy reversal here usually means you know the answer and are not ready to act on it yet. That is allowed, but it is worth naming.',
    advice:'Pick one small thing this month that only makes sense if the new direction is true. Direction changes through accumulated evidence, not through a single decision.' }

  ];

  S.getTopic = function (id) {
    for (var i = 0; i < S.TOPICS.length; i++) if (S.TOPICS[i].id === id) return S.TOPICS[i];
    return null;
  };

})(window.SAGE = window.SAGE || {});
