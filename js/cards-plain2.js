/* Sage — https://sagetarot.app
 * Copyright © 2026 Future Proof Works. All rights reserved.
 * Not licensed for reuse or redistribution. See LICENSE.
 */

/* Sage — plain-language meanings, Wands and Cups. Extends SAGE.PLAIN. */
(function (S) {
  'use strict';

  var P = S.PLAIN;

  /* ========================= WANDS — energy, drive, wanting things ========================= */

  P['wands-01'] = {
    short: 'A spark of an idea. Act on it now.',
    up: 'Something has just caught your interest and there is real heat behind it — an idea, an invitation, an urge to make something. This is potential rather than achievement, and it does not keep. The energy is at its highest right now and it will not stay at this level, so use it while it is burning.',
    rev: 'The spark did not catch. This is enthusiasm that fizzled out, a project you announced and never started, or a delay that took the heat out of something. It can also mean the urge is still there but you are sitting on it, waiting for a better moment that keeps not arriving.'
  };
  P['wands-02'] = {
    short: 'You have a plan. Now decide how far to take it.',
    up: 'The first spark has turned into a plan with a horizon on it. You have something real in hand and you are working out how big to go. There is a choice here between the safe territory you already handle well and something larger and riskier. The card generally favours looking outward.',
    rev: 'The world stays small. This is a plan endlessly refined instead of launched, an expansion talked about for years, or honest fear of leaving somewhere you are already good at. Occasionally it is the reverse — a leap taken with no plan behind it at all.'
  };
  P['wands-03'] = {
    short: 'It is underway and out of your hands. Wait well.',
    up: 'You have set something in motion and it is now out of your hands for a while — applications sent, work circulating, ships at sea. This is a confident wait rather than an anxious one, and the card suggests thinking bigger than you have been. What is possible here is larger than you have been planning for.',
    rev: 'What you sent out is coming back late or empty. Timelines slip, plans return with nothing, or you find you aimed too small for the effort involved. It can also mean impatience eating away at a wait that is actually going perfectly normally.'
  };
  P['wands-04'] = {
    short: 'A real good moment, shared with people.',
    up: 'Something genuinely good has happened and it is worth marking: a homecoming, a wedding, a housewarming, a milestone big enough to stand on. This card is about happiness that is stable and shared, and it insists that arrivals get celebrated rather than absorbed and immediately built on.',
    rev: 'The celebration is thin, private or postponed. This can be tension at home, a milestone reached without feeling like you arrived anywhere, or a sense of belonging that has not quite formed. It is rarely a disaster — more a good thing that has not been allowed to land.'
  };
  P['wands-05'] = {
    short: 'Everyone wants something and nobody is coordinating.',
    up: 'Lots of people want lots of things and nothing is organised. This is competition and crossed purposes rather than real hostility — a lot of noise and effort producing less than it should. It can be genuinely energising, but it is wasteful, and somebody needs to set the rules.',
    rev: 'The conflict either goes underground or ends. That might be an argument avoided at the cost of never resolving it, tension swallowed and turned into anxiety, or the welcome exhaustion when a contest finally finishes. It also covers the moment people realise they wanted different things all along.'
  };
  P['wands-06'] = {
    short: 'You win, and people notice.',
    up: 'This is recognition — the promotion, the acceptance, the moment your work is publicly acknowledged. It is different from private satisfaction: this card is about being seen, and it suggests accepting the credit gracefully rather than deflecting it. Good news is genuinely likely here.',
    rev: 'The recognition does not arrive, goes to the wrong person, or turns up and feels empty. It can also mean a success held too tightly, where pride has started to alienate the people who helped. Sometimes it simply means a private achievement that does not need an audience.'
  };
  P['wands-07'] = {
    short: 'You have something worth defending. Defend it.',
    up: 'You have something worth keeping and you are being challenged for it. This is the position after a win: holding what you gained, against more people than you would like, from a position of advantage you should not waste. It asks for conviction and stamina, and it says you can hold on if you decide to.',
    rev: 'Either the defence is failing or it was never needed. This can be genuine overwhelm — too many fronts, not enough energy. Or it can be defensiveness with no actual attack happening, which costs the same and achieves nothing. Sometimes it advises giving up the position deliberately.'
  };
  P['wands-08'] = {
    short: 'Everything happens at once. Keep up.',
    up: 'Things speed up. News arrives, travel happens, a situation that was stuck suddenly resolves. This is the fastest card in the suit and it usually means the waiting is over. The window is short, so clear space and keep up with it.',
    rev: 'Everything is grounded. Delays, crossed wires, messages that do not arrive or arrive garbled, a plan that will not pick up speed. It can also mean things are moving so fast that nothing is landing properly, and the right response is to deliberately slow down.'
  };
  P['wands-09'] = {
    short: 'Battered but still standing, and nearly there.',
    up: 'You have been through it, you are guarded now, and you have one more push in you. This is endurance well past the point where it stopped being enjoyable — and you are closer to the end than it feels. The wariness is earned. The card just cautions against letting it become permanent.',
    rev: 'The defences have outlasted the threat. This is burnout, suspicion of people who have not done anything, or giving up in the final stretch because there is nothing left in the tank. It asks honestly whether you are being attacked or simply exhausted, because those need very different responses.'
  };
  P['wands-10'] = {
    short: 'You are carrying too much. Put some down.',
    up: 'You are carrying more than one person should, and you are close enough to the end that pushing through is tempting. The card does not admire this. It notes that the load is blocking your view, and that some of what you are carrying belongs to other people.',
    rev: 'The load gets put down — either deliberately, by delegating and saying no, or involuntarily, by collapsing. It is usually a relief, and it often comes with the discovery that most of what you were carrying was never actually required of you.'
  };
  P['wands-11'] = {
    short: 'Beginner\'s enthusiasm, and it is charming.',
    up: 'This is untrained excitement: the new hobby, the discovery, the person who has just found the thing they are about to become obsessed with. It is not skilled yet and does not need to be. As a message, it brings news that opens something up.',
    rev: 'The enthusiasm does not stick. Interests picked up and dropped, promises made in a rush of excitement and quietly abandoned, or a young person in your life who is all over the place. It can also mean the passion is real but the discipline to hold onto it has not turned up yet.'
  };
  P['wands-12'] = {
    short: 'Go now, at full speed, and adjust on the way.',
    up: 'This is charging straight at something. The Knight of Wands is passionate, magnetic and completely committed to whatever he is doing right now. He gets things moving that nobody else could move. As a person he is exciting and unreliable in roughly equal measure; as advice, he says go now and sort out the details in flight.',
    rev: 'The charge becomes a crash. Impulsive decisions, a project abandoned at seventy percent for a shinier one, a short temper, or someone whose intensity does not survive contact with ordinary routine. The energy is not the problem — keeping it going is.'
  };
  P['wands-13'] = {
    short: 'Confident, warm, and completely herself.',
    up: 'This is confidence combined with real attention to other people — she draws people in because she is not performing. It covers creative leadership and social warmth. As advice: be more visibly yourself, and stop shrinking the thing that makes you interesting.',
    rev: 'The confidence is a front. This is insecurity managed with charm, jealousy of someone else\'s success, or high energy kept up past the point of exhaustion. It can also describe someone whose warmth depends on being the centre of the room.'
  };
  P['wands-14'] = {
    short: 'Decide the direction and say it out loud.',
    up: 'This is vision plus the authority to make it happen — the founder, the director, the person who can see where this could go and get others to go there. Decisive, sometimes impatient, effective. As advice: take charge of the direction, state it clearly, and then let people get on with the work.',
    rev: 'Leadership curdles into ego. Decisions made to prove who is in charge, impatience with anyone slower, big plans announced and never funded. It can also mean a leader who has lost the plot — or your own reluctance to step into a role you are ready for.'
  };

  /* ========================= CUPS — feelings, relationships, inner life ========================= */

  P['cups-01'] = {
    short: 'Your heart opens. Let it.',
    up: 'Something new is starting emotionally — love offered, a friendship beginning, kindness arriving that you did not earn, or a wave of feeling that surprises you. This is a gift rather than an achievement, and the only job is being open enough to accept it. Creative and spiritual openings live here too.',
    rev: 'The cup is turned down, or nothing is flowing. This is emotion held back, an offer you cannot bring yourself to accept, or a heart that closed for good reasons and has stayed closed out of habit. It can mark grief that has not been allowed to move.'
  };
  P['cups-02'] = {
    short: 'Two people meet as equals.',
    up: 'This is mutual — attraction, respect, or a partnership where both people are giving and both are receiving. It covers romance, but equally friendship, working together and making up after a falling-out. The defining feature is that it goes both ways: this is not a card about longing, it is a card about a connection actually made.',
    rev: 'The exchange is uneven. One person is carrying the relationship, communication has broken down, or an attraction is not being returned in the way it is being given. It can also mark the gap before a repair, or the honest recognition that something has run its course.'
  };
  P['cups-03'] = {
    short: 'Happiness that needs other people in the room.',
    up: 'This is friendship and celebration — a reunion, good news shared, a night everyone remembers. It also covers creative collaboration. Where it turns up, the medicine is company: see your people.',
    rev: 'The party has a problem. Overdoing it, gossip, a third person disrupting a pair, or social obligation that drains you instead of filling you up. It can also point to drifting away from the people who would restore you, usually slowly and without any argument.'
  };
  P['cups-04'] = {
    short: 'Something is being offered and you cannot feel it.',
    up: 'This is flatness — not from disaster, but from having enough and still wanting something else. Boredom, mild depression, the sense that nothing quite registers. It is a real state and it is also blinding you to something that is being offered right now.',
    rev: 'You look up. The flatness lifts, the offer finally gets noticed, interest comes back. This usually accompanies the small shift that ends a slump — not a revelation, just re-engagement. Occasionally it warns of accepting something out of restlessness rather than actual wanting.'
  };
  P['cups-05'] = {
    short: 'A real loss — and you are only counting what you lost.',
    up: 'Something is genuinely gone and grieving it is the correct response. This card sits with loss and regret honestly. But it is precise about the arithmetic: three things spilled, two still standing — and you cannot see what remains from where you are looking.',
    rev: 'You turn around. Acceptance arrives, what is left gets noticed, and forgiving yourself or someone else becomes possible. This is one of the more hopeful reversals in the deck: the grief has done its work and is starting to let go.'
  };
  P['cups-06'] = {
    short: 'The past visits, and it is kind.',
    up: 'This is nostalgia, childhood, and uncomplicated generosity — someone from before reappearing, a memory that comforts, a kindness given with nothing expected back. It is gentle and a bit wistful, and it often signals returning to something you loved before it got complicated.',
    rev: 'The past has too strong a grip. Memory polished up better than it was, a relationship kept alive on what it used to be, or a reluctance to grow up. Alternatively, and more happily, the past finally lets go of you and you start facing forward.'
  };
  P['cups-07'] = {
    short: 'Too many options, most of them imaginary.',
    up: 'You are looking at a fog of possibilities — daydreams, fantasies and genuine opportunities all presented in the same haze, so none of them can be properly judged. The card is not against dreaming. It is against mistaking the dream for a plan. One of these options is real.',
    rev: 'The fog clears. A choice gets made, an illusion gets seen through, or a fantasy loses its shine in a useful way. It is a relief, though sometimes a deflating one — the thing you wanted turns out to be ordinary.'
  };
  P['cups-08'] = {
    short: 'Walking away from something that is fine but not enough.',
    up: 'You leave something that was not bad, and that is exactly what makes it hard. Nothing here is broken — it is simply not enough, and going means disappointing people whose questions you cannot fully answer. The card supports the leaving. What you are looking for is not here.',
    rev: 'The departure stalls. You stay past the point of usefulness, go back to something you already left, or leave without knowing what you are looking for and then keep leaving. It can also mean a decision to stay and repair, which is fine if you actually chose it.'
  };
  P['cups-09'] = {
    short: 'You get what you wanted.',
    up: 'This is the wish card. It means emotional satisfaction — comfort, pleasure, something you hoped for actually arriving. It is a little self-satisfied and that is allowed. It also gently asks you to notice what you are wishing for, since you are likely to get it.',
    rev: 'Satisfaction is hard to reach or turns out hollow. The wish is granted and disappoints, contentment slides into complacency, or pleasure is being used to avoid something. It sometimes indicates a want you inherited from someone else, which is why getting it does not land.'
  };
  P['cups-10'] = {
    short: 'Lasting happiness, with other people in it.',
    up: 'This is the full version of what the suit has been reaching for: family, home, belonging, happiness that includes other people and holds up over time. It is idealistic and the card knows it, but where it turns up the ideal is genuinely within reach or already quietly present.',
    rev: 'The picture and the reality do not match. Family strain, a home that looks right and does not feel right, or an idea of happiness you inherited rather than chose. It asks whether you are chasing your version of this or somebody else\'s.'
  };
  P['cups-11'] = {
    short: 'A sincere message, probably a bit awkward.',
    up: 'Something soft and surprising arrives from your inner world — news that touches you, an unexpected creative idea, or the willingness to be sincere without hiding behind irony. It is a little awkward and completely genuine. As advice: share the feeling before you have polished it.',
    rev: 'Feeling gets clumsy. Moodiness, sulking, a reaction out of proportion to the event, or a creative idea abandoned because the first attempt was bad. It can point to a message you have written and not sent.'
  };
  P['cups-12'] = {
    short: 'An offer made from the heart.',
    up: 'This is the romantic: proposals, invitations, artistic pursuits, following a feeling wherever it goes. He moves slowly and deliberately, unlike the other knights. Where he turns up, an approach is being made and it is sincere.',
    rev: 'The romance is a performance or a projection. Grand gestures with nothing behind them, moods presented as depth, or an ideal of love no actual person could satisfy. It can also mark the disappointment when a beautiful offer turns out to be empty.'
  };
  P['cups-13'] = {
    short: 'Feels everything, and stays steady anyway.',
    up: 'This is the deepest emotional intelligence in the deck — the person others bring their grief to, who can hold it without drowning in it. She treats gut feeling as real information. As advice: pay careful attention to feelings, yours and other people\'s, and let them inform the decision.',
    rev: 'The line between her feelings and everyone else\'s has dissolved. This is emotional overwhelm, looking after people until it becomes your whole identity, or the opposite — a withdrawal so complete that nothing gets in. Both are what happens when depth is not protected.'
  };
  P['cups-14'] = {
    short: 'Feel it fully, then respond calmly.',
    up: 'This is strong emotion held steadily. He is the person who stays level in a crisis because he is processing rather than suppressing — diplomatic, kind, and hard to rattle. As advice: respond instead of reacting, and be the steady one.',
    rev: 'Steadiness turns into either suppression or manipulation. Feelings pushed down until they come out sideways, moods used to control a room, or coldness passed off as maturity. It can describe someone whose calm is a wall rather than a skill.'
  };

})(window.SAGE = window.SAGE || {});
