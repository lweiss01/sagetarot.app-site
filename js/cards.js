/* Sage — Tarot card database
 * 78 cards, Rider–Waite–Smith. Public domain artwork (1909, Pamela Colman Smith).
 *
 * Schema:
 *   id      unique slug
 *   name    display name
 *   arcana  'major' | 'minor'
 *   suit    null | 'wands' | 'cups' | 'swords' | 'pentacles'
 *   num     0-21 for majors; 1-14 for minors (11=Page 12=Knight 13=Queen 14=King)
 *   element Fire | Water | Air | Earth  (majors use their esoteric attribution)
 *   astro   astrological / planetary attribution
 *   img     Wikimedia Commons filename
 *   kwU/kwR keyword arrays, upright / reversed
 *   up/rev  the interpretive body text
 *   sym     what to look at in the picture — the learning hook
 *   advice  the actionable turn
 */
(function (S) {
  'use strict';

  var M = 'major', W = 'wands', C = 'cups', SW = 'swords', P = 'pentacles';

  S.CARDS = [

  /* ===================== MAJOR ARCANA ===================== */

  { id:'fool', name:'The Fool', arcana:M, suit:null, num:0, element:'Air', astro:'Uranus',
    img:'RWS_Tarot_00_Fool.jpg',
    kwU:['beginnings','innocence','leap of faith','open road','trust'],
    kwR:['recklessness','hesitation at the edge','naivety','avoiding commitment'],
    up:'Something is genuinely new here, and it has not yet been shaped by experience — which is exactly its power. The Fool is the moment before the story starts, when the outcome is still unwritten and you are light enough to move. It asks you to act without the full map, because the map only gets drawn by walking. There is real risk in this card, but the risk of standing still is treated as the greater one.',
    rev:'The leap is stalled — either you are frozen at the cliff edge rehearsing everything that could go wrong, or you have already jumped without looking and the consequences are arriving. Reversed, The Fool asks which one it is, because the remedy is opposite in each case. It can also mean a beginning you keep restarting rather than committing to, staying in the pleasant weightlessness of "someday."',
    sym:'The white sun behind him, the white rose of pure intent in his hand, and the small dog — instinct — barking at his heel. His bundle is tiny: he carries almost nothing. Note that the cliff edge is real; the card does not pretend otherwise.',
    advice:'Take the first small irreversible step. Not the whole journey — the step that makes turning back inconvenient.' },

  { id:'magician', name:'The Magician', arcana:M, suit:null, num:1, element:'Air', astro:'Mercury',
    img:'RWS_Tarot_01_Magician.jpg',
    kwU:['manifestation','resourcefulness','focused will','skill','initiative'],
    kwR:['scattered energy','manipulation','untapped talent','all talk'],
    up:'You have everything you need already on the table. The Magician is not about acquiring more — it is about the concentration of what you hold into a single directed act. This card appears when capability and opportunity have quietly lined up and the only missing element is decisive use. It is the most practical card in the Major Arcana: intention becomes material through work.',
    rev:'Power is present but leaking. Reversed, this is talent left in the drawer, plans narrated rather than executed, or energy split across so many projects that none of them can reach escape velocity. In its shadow reading it warns of persuasion used to shape someone else\'s perception rather than to build something real — including self-persuasion.',
    sym:'One hand raised to the sky, one pointed to the earth: as above, so below. On the table lie all four suit emblems — wand, cup, sword, pentacle — meaning every element is already available. The lemniscate over his head and the serpent belt eating its own tail mark unbounded, renewing energy.',
    advice:'Pick the one thing. Give it your whole hand rather than a finger each to five.' },

  { id:'high-priestess', name:'The High Priestess', arcana:M, suit:null, num:2, element:'Water', astro:'Moon',
    img:'RWS_Tarot_02_High_Priestess.jpg',
    kwU:['intuition','the unrevealed','inner knowing','stillness','mystery'],
    kwR:['ignored instinct','secrets surfacing','disconnection from self','noise'],
    up:'There is knowledge here that is not available through analysis. The High Priestess marks a moment where the honest answer is "not yet visible" — and where forcing clarity would produce a false one. She favours waiting, dreaming, listening, and the kind of knowing that arrives sideways. Something is being withheld, sometimes by circumstance and sometimes by you, and the withholding is doing useful work.',
    rev:'Reversed, she is the intuition you overrode. You knew, and you talked yourself out of knowing, usually because the knowing was inconvenient. This can also indicate secrets that are becoming untenable, or a period where you are so externally noisy — advice, opinions, scrolling — that the inner signal cannot be heard at all.',
    sym:'She sits between the black and white pillars, Boaz and Jachin, at the threshold. The veil of pomegranates behind her hides the temple interior; the scroll marked TORA is half-concealed in her robe. The crescent moon at her feet ties her to tides, cycles, and the unlit half of things.',
    advice:'Do not decide today. Sleep on it and notice what you already knew when you wake.' },

  { id:'empress', name:'The Empress', arcana:M, suit:null, num:3, element:'Earth', astro:'Venus',
    img:'RWS_Tarot_03_Empress.jpg',
    kwU:['abundance','creativity','nurture','fertility','sensual life'],
    kwR:['depletion','smothering','creative block','neglecting yourself'],
    up:'This is the card of things growing because conditions are right, not because they are forced. The Empress governs creative fertility in every sense: projects, bodies, relationships, gardens. She asks for patience with process and generosity with resources, and she rewards care. Where she appears, the productive move is to tend rather than to push — and to let yourself receive pleasure from what you have made.',
    rev:'The well has run dry, or the care has curdled into control. Reversed, The Empress speaks to giving past the point of sustainability, to creative work that will not germinate because it is being dug up daily to check, or to a neglect of the body and its plain needs — food, rest, touch, beauty. Occasionally it flags dependence dressed up as devotion.',
    sym:'She reclines rather than sits — the only figure in the Major Arcana who is truly comfortable. Wheat grows at her feet, a river runs behind her, the shield bears the Venus symbol. Her crown of twelve stars ties her to the zodiac and the whole turning year.',
    advice:'Feed the thing — including yourself. Growth is a supply problem more often than a willpower problem.' },

  { id:'emperor', name:'The Emperor', arcana:M, suit:null, num:4, element:'Fire', astro:'Aries',
    img:'RWS_Tarot_04_Emperor.jpg',
    kwU:['structure','authority','boundaries','discipline','protection'],
    kwR:['rigidity','domination','absent authority','rules without reason'],
    up:'Order is the medicine here. The Emperor builds the container that lets energy be useful: schedules, boundaries, agreements, a clear chain of decision. He is unromantic and he works. Where he appears, chaos is costing you more than constraint would, and the move is to define the rules of the game — including the ones you set for yourself and actually keep.',
    rev:'Structure has become a cage, or it has collapsed entirely. Reversed, this is control exercised for its own sake, an authority figure who confuses obedience with respect, or the opposite: no one holding the line, no follow-through, a situation drifting because no one will simply decide. It can point to unfinished business with a father or a boss.',
    sym:'His throne is stone, carved with rams\' heads for Aries — hard, fixed, immovable. He wears armour under his robe: still ready for conflict even while ruling. The barren mountains behind him show the cost of pure structure; nothing grows there.',
    advice:'Write the rule down and hold it for a week. Structure you renegotiate daily is not structure.' },

  { id:'hierophant', name:'The Hierophant', arcana:M, suit:null, num:5, element:'Earth', astro:'Taurus',
    img:'RWS_Tarot_05_Hierophant.jpg',
    kwU:['tradition','teaching','shared belief','institutions','mentorship'],
    kwR:['dogma','breaking with convention','hollow ritual','questioning the teacher'],
    up:'This card points to established knowledge and the value of not reinventing it. There is a tradition, a lineage, a method, or a teacher here worth taking seriously — the accumulated answer that many people arrived at before you. The Hierophant also governs shared meaning: marriage, membership, initiation, the rituals that bind a group. Its counsel is usually to learn the form properly before improvising on it.',
    rev:'The form has outlived its content. Reversed, the Hierophant is the moment you notice the institution is repeating words no one believes, or that the mentor\'s authority rests on position rather than insight. This is a card of honourable heresy — leaving the church, quitting the programme, doing it your own way — with the caveat that rejecting a tradition you never learned is not the same as transcending it.',
    sym:'Two acolytes kneel below him, receiving rather than speaking. He raises a hand of blessing and holds the triple cross; the crossed keys at his feet unlock a door that only the tradition can open. He sits between pillars, like the High Priestess — but his door is public.',
    advice:'Find someone who has already done this and ask them how. Originality is cheaper after competence.' },

  { id:'lovers', name:'The Lovers', arcana:M, suit:null, num:6, element:'Air', astro:'Gemini',
    img:'RWS_Tarot_06_Lovers.jpg',
    kwU:['union','values-based choice','alignment','attraction','commitment'],
    kwR:['misalignment','avoided decision','disharmony','choosing against yourself'],
    up:'More than romance, this is the card of a choice that defines you. The Lovers asks what you actually value, and then asks you to choose in line with it — which is why the card so often accompanies decisions that look like relationships but are really about identity. Where it is well-placed it promises genuine union: two things that belong together, joined without either being diminished.',
    rev:'Something is out of alignment — between you and another, or between your stated values and your daily choices. Reversed, The Lovers often marks a decision being deferred so long that circumstance will make it for you. It can indicate a connection where the attraction is real but the values are not shared, which is a harder problem than it first appears.',
    sym:'The angel Raphael blesses from above while the two figures stand naked and unashamed. Behind her, the serpent and the tree of knowledge; behind him, the tree of flames. Notice she looks up at the angel and he looks at her — the chain of attention runs through the human to the divine.',
    advice:'Name the value you are actually choosing for. The right decision usually becomes obvious once it is named.' },

  { id:'chariot', name:'The Chariot', arcana:M, suit:null, num:7, element:'Water', astro:'Cancer',
    img:'RWS_Tarot_07_Chariot.jpg',
    kwU:['willpower','forward drive','control','victory','determination'],
    kwR:['losing the reins','forcing it','opposing pulls','aggression without direction'],
    up:'Motion through mastered opposition. The Chariot wins not by removing conflict but by harnessing it — the two sphinxes pull in different directions and the charioteer takes them both somewhere. This card promises progress that is earned through concentration and nerve. It rewards holding a course under pressure and generally means the campaign can be won if you refuse to be diverted.',
    rev:'The reins have slipped. Reversed, this is effort scattering, momentum lost to competing demands, or a drive so aggressive it is generating the resistance it then has to overcome. It can mean you are travelling fast in a direction you never consciously chose, or winning a contest that no longer matters to you.',
    sym:'He carries no reins — control here is exerted by will alone. The black and white sphinxes are contradiction itself, yoked. The city behind him is the safety he has left; the starry canopy above marks a journey under a larger pattern.',
    advice:'Hold the line for a defined stretch. Decide the distance now so you are not renegotiating at every mile.' },

  { id:'strength', name:'Strength', arcana:M, suit:null, num:8, element:'Fire', astro:'Leo',
    img:'RWS_Tarot_08_Strength.jpg',
    kwU:['gentle power','courage','patience','compassion','self-mastery'],
    kwR:['self-doubt','force over finesse','depleted patience','suppressed feeling'],
    up:'Strength here is the soft kind that actually works. The card describes power exercised without violence — persuasion over coercion, patience over pressure, the steady hand that calms rather than the hard one that subdues. Its subject is usually your own appetite, temper, or fear, and its message is that these are not enemies to defeat but animals to befriend. This is slower than force and considerably more durable.',
    rev:'Either the inner animal is running the show, or it has been shut in a room and is howling. Reversed, Strength points to depleted patience, to courage that has thinned into self-doubt, or to a situation you are trying to muscle through when what it needs is tenderness and time. It can also mark shame about a very ordinary human need.',
    sym:'The woman closes the lion\'s mouth with her bare hands and no visible effort — she is not straining. The lemniscate above her head links her to The Magician: the same infinite power, applied through gentleness. Flowers, not chains, circle the lion\'s neck.',
    advice:'Try the gentler version once more before escalating. Softness is a technique, not a concession.' },

  { id:'hermit', name:'The Hermit', arcana:M, suit:null, num:9, element:'Earth', astro:'Virgo',
    img:'RWS_Tarot_09_Hermit.jpg',
    kwU:['solitude','inner search','guidance','withdrawal','discernment'],
    kwR:['isolation','loneliness','refusing help','lost without a compass'],
    up:'Withdraw and look at it alone. The Hermit is a deliberate retreat from noise — not because people are the problem but because the answer is quiet and cannot be heard in company. This card often marks the middle of a long process, where the initial enthusiasm has gone and the real work is solitary. It also indicates a wise figure available to you, or that you are becoming that figure for someone else.',
    rev:'Solitude has tipped into isolation, which is a different substance entirely. Reversed, The Hermit describes withdrawal that has stopped producing insight and started producing loneliness, or a stubborn refusal of help that is costing you months. Occasionally it is the reverse: you are so surrounded that no reflection is possible, and the retreat is overdue.',
    sym:'His lamp holds a six-pointed star — the light he carries is small, and lights only the next step. He stands on a snowy peak, above and beyond the world, holding a staff for the descent. He is looking down, not up: the search is inward and earthward.',
    advice:'Take an unshared hour with the question. No input, no phone — just you and the thing.' },

  { id:'wheel', name:'Wheel of Fortune', arcana:M, suit:null, num:10, element:'Fire', astro:'Jupiter',
    img:'RWS_Tarot_10_Wheel_of_Fortune.jpg',
    kwU:['turning point','luck','cycles','fate','momentum shift'],
    kwR:['resisting change','bad timing','a downturn','clinging to a phase'],
    up:'The situation is about to turn, and not entirely by your hand. The Wheel governs the portion of life that is timing, luck, and larger cycles — the things that change while you are making other plans. Upright it generally favours you: a shift arriving, an opening, momentum returning. Its deeper counsel is that every position on the wheel is temporary, which is a comfort at the bottom and a warning at the top.',
    rev:'The wheel is turning against you, or you are trying to stop it. Reversed, this marks a downswing, an unlucky stretch, or — more usefully — the exhausting effort of holding a phase in place past its natural end. Some of what is happening is genuinely not your fault and not your responsibility to fix, and identifying which part is the work.',
    sym:'The four living creatures of the corners — man, eagle, lion, ox — read books calmly while the wheel spins; the fixed signs of the zodiac are the still points. TARO/ROTA runs around the rim, readable in either direction. The sphinx sits at the top, the serpent descends, Anubis rises.',
    advice:'Change what you can this week and stop spending energy on the part that is simply timing.' },

  { id:'justice', name:'Justice', arcana:M, suit:null, num:11, element:'Air', astro:'Libra',
    img:'RWS_Tarot_11_Justice.jpg',
    kwU:['fairness','truth','consequence','accountability','clear judgement'],
    kwR:['imbalance','avoided accountability','bias','unfair outcome'],
    up:'Cause and effect are being reckoned. Justice deals in the honest accounting: what was actually done, what is actually owed, what the fair outcome would be if sentiment were set aside. It often accompanies legal matters, contracts, and formal decisions, but its wider meaning is that a situation is now being weighed and the result will follow the evidence. Where you have acted well, this is good news.',
    rev:'The scales are off. Reversed, Justice indicates unfairness you are on the wrong end of, accountability being dodged — sometimes by you — or a judgement made on partial information and defended out of pride. It asks for the uncomfortable version of the story, the one that includes your own contribution to how things got here.',
    sym:'Unlike the blindfolded Lady Justice of courthouses, this figure looks directly at you: the judgement is informed, not impartial. Sword upright in the right hand, scales in the left — decision and weighing, in that order. The veil behind her conceals what is not yet disclosed.',
    advice:'Tell the version of events that includes your part in it. Then decide what you owe.' },

  { id:'hanged-man', name:'The Hanged Man', arcana:M, suit:null, num:12, element:'Water', astro:'Neptune',
    img:'RWS_Tarot_12_Hanged_Man.jpg',
    kwU:['suspension','new perspective','surrender','pause','willing sacrifice'],
    kwR:['stalling','pointless martyrdom','resisting the pause','stuck upside down'],
    up:'Stop struggling and look at it from the other side. The Hanged Man is a voluntary suspension — you give something up in order to see something you could not see while moving. It frequently arrives during enforced waits: the delay, the limbo, the period where nothing can be advanced. Its promise is that the pause is productive if you use it to reverse your assumptions rather than to grind your teeth.',
    rev:'The suspension has stopped teaching you anything. Reversed, this is delay you are causing, sacrifice offered to no one who wanted it, or a martyr position held because it is more comfortable than acting. It can also mean you are finally ready to come down and rejoin the world — the lesson landed and the hanging is over.',
    sym:'He hangs from a living tree, by one ankle, with the other leg crossed into a figure four. His hands are behind his back — the pose is chosen, not imposed. The halo around his head says the perspective gained is genuine illumination; his face is entirely serene.',
    advice:'Invert your main assumption and see what follows. Argue the opposite case for ten minutes.' },

  { id:'death', name:'Death', arcana:M, suit:null, num:13, element:'Water', astro:'Scorpio',
    img:'RWS_Tarot_13_Death.jpg',
    kwU:['ending','transformation','clearing','transition','release'],
    kwR:['resisting an ending','stalled transition','fear of change','a lingering corpse'],
    up:'Something is over, and treating it as over is the whole task. Death is rarely literal; it is the card of the clean ending that makes room — a job, a version of yourself, a relationship, a belief that no longer fits. It is not gentle, but it is impersonal and it is fair: what it takes was already finished. The transformation on the other side is real and is not available while the old form is maintained.',
    rev:'You are holding the door shut. Reversed, Death is a transition that has stalled — the ending acknowledged in theory but not enacted, the job you have quit in your head, the relationship being conducted on life support. The fear is understandable, but reversed the card notes that the decay is now happening in place, which is worse than the cut.',
    sym:'The skeletal rider moves steadily forward; the king lies fallen, while a child and a maiden meet him differently. Behind him, the sun rises between two towers — the same towers as The Moon, but here it is dawn. The white rose on his banner is the same rose The Fool carried.',
    advice:'Name what is already over and act as if it is. Stop funding the old version.' },

  { id:'temperance', name:'Temperance', arcana:M, suit:null, num:14, element:'Fire', astro:'Sagittarius',
    img:'RWS_Tarot_14_Temperance.jpg',
    kwU:['balance','blending','moderation','patience','the middle way'],
    kwR:['excess','impatience','things not mixing','extremes'],
    up:'The art here is proportion. Temperance blends opposites into something neither could be alone — work and rest, boldness and care, two people, two ideas. It counsels the unglamorous middle path and a longer time horizon than you would like. Where it appears, the answer is not either/or but the right ratio, found by adjustment over time rather than declared in advance.',
    rev:'Something has gone to extremes. Reversed, Temperance flags overindulgence or over-restriction, a schedule with no give, a partnership where the mixture is off, or impatience that keeps interrupting a process that only works slowly. It can also mean two elements that genuinely do not blend and should be kept separate rather than forced.',
    sym:'The angel pours between two cups with one foot on land and one in water — grounded and fluid at once. The path behind leads to a crown of light between mountains. Irises grow at the water\'s edge, for Iris the messenger; the square and triangle on the robe are matter and spirit combined.',
    advice:'Adjust the ratio rather than the plan. Small correction, repeated, beats a dramatic reset.' },

  { id:'devil', name:'The Devil', arcana:M, suit:null, num:15, element:'Earth', astro:'Capricorn',
    img:'RWS_Tarot_15_Devil.jpg',
    kwU:['attachment','compulsion','shadow','materialism','the golden cage'],
    kwR:['breaking free','confronting the shadow','loosening chains','reclaimed power'],
    up:'You are bound to something, and part of you likes it. The Devil describes the attachments that are working for you in some way — the habit that soothes, the relationship that flatters, the job that pays too well to leave, the story about yourself that excuses everything. It is not moralistic; it simply shows the chain and notes that you put it on. Nothing changes until the payoff is admitted.',
    rev:'The chain is loosening. Reversed, this is the beginning of freedom: seeing the pattern clearly, naming the compulsion, walking out. It is genuinely good news, though the card is honest that the first stretch after release is uncomfortable and the pull backwards is strong. Occasionally it warns of a shadow being suppressed rather than integrated, which returns it with interest.',
    sym:'The two figures are chained — but the chains are loose enough to lift off over their heads. They have grown horns and tails, becoming what binds them. He is an inversion of the angel in The Lovers, on the same two figures: the same union, seen through compulsion instead of choice.',
    advice:'Name what the habit is giving you. You cannot put down something whose benefit you refuse to see.' },

  { id:'tower', name:'The Tower', arcana:M, suit:null, num:16, element:'Fire', astro:'Mars',
    img:'RWS_Tarot_16_Tower.jpg',
    kwU:['sudden upheaval','revelation','collapse of a false structure','shock'],
    kwR:['delayed collapse','fear of disaster','averted crisis','slow unravelling'],
    up:'Something built on a false foundation comes down fast. The Tower is the card of the sudden revelation that makes a whole structure untenable — the discovery, the phone call, the moment the story stops working. It is violent and it is clarifying, and what it destroys was going to fall anyway. Nobody enjoys this card, but it removes in an afternoon what evasion would have preserved for years.',
    rev:'The collapse is being postponed, resisted, or is happening in slow motion. Reversed, The Tower can mean a crisis narrowly averted, a structure you are frantically shoring up, or dread of a disaster that has not come and may not. It is also the aftermath: standing in the rubble, still shaking, beginning to notice what is actually still standing.',
    sym:'Lightning strikes the crown off the tower — the false authority goes first. Two figures fall headfirst, and the tower is built on a bare rock peak, with no foundation in soil. Twenty-two yods, flames of divine spark, fall on either side: destruction and revelation are the same event.',
    advice:'Do not rebuild the same tower. Ask what the collapse revealed before you start clearing.' },

  { id:'star', name:'The Star', arcana:M, suit:null, num:17, element:'Air', astro:'Aquarius',
    img:'RWS_Tarot_17_Star.jpg',
    kwU:['hope','healing','renewal','guidance','quiet faith'],
    kwR:['discouragement','faith dimmed','disconnection','hope withheld'],
    up:'After the Tower, this. The Star is calm, unhurried restoration — the card of hope that is not naive because it comes after the worst has already happened. It promises healing that is slow and real, inspiration returning, and a sense of direction that feels less like a plan and more like a fixed point to steer by. It also indicates being seen and known; the figure is entirely unguarded.',
    rev:'The light is hard to find. Reversed, The Star is discouragement, faith worn thin, the loss of the sense that any of this is going somewhere. It can mark a period of creative or spiritual dryness. The card does not say the star has gone out — only that clouds are in the way, and that the remedy is usually rest and honesty rather than effort.',
    sym:'She is naked — nothing left to protect. One foot on land, one in the water: conscious and unconscious both. She pours from two vessels, one back into the pool, one onto the earth: nothing is wasted, everything circulates. Seven small stars for the classical planets, one great star above.',
    advice:'Do the small restorative thing daily. Hope here is maintained by practice, not by decision.' },

  { id:'moon', name:'The Moon', arcana:M, suit:null, num:18, element:'Water', astro:'Pisces',
    img:'RWS_Tarot_18_Moon.jpg',
    kwU:['uncertainty','illusion','dreams','the subconscious','navigating by feel'],
    kwR:['clarity returning','fears named','confusion lifting','truth surfacing'],
    up:'You cannot see clearly and you should proceed anyway, slowly. The Moon governs the territory of half-light: anxiety, dreams, intuition, and the distortions that fear introduces into perception. Things are not as they appear — but the card is careful to say they may be better or worse, not simply worse. It is a card of the unconscious speaking loudly, and its material is best handled with a journal rather than a decision.',
    rev:'The fog is lifting. Reversed, The Moon usually indicates confusion resolving, a fear finally named and thereby shrunk, or a deception coming to light. It can also mean you are suppressing what the dreams are telling you, keeping the unconscious material successfully at bay at the cost of a low permanent unease.',
    sym:'A path runs between two towers into the far hills — the way through exists, though it is long. A dog and a wolf howl: the tamed and the wild parts of the same instinct. A crayfish crawls from the pool, the primitive mind surfacing. The moon\'s face is turned away, sleeping.',
    advice:'Distinguish what you know from what you fear. Write both columns and see the ratio.' },

  { id:'sun', name:'The Sun', arcana:M, suit:null, num:19, element:'Fire', astro:'Sun',
    img:'RWS_Tarot_19_Sun.jpg',
    kwU:['clarity','joy','vitality','success','being seen'],
    kwR:['dimmed joy','temporary clouds','forced positivity','delayed success'],
    up:'The clearest and most generous card in the deck. The Sun means things are visible, warm, and going well — success that is not secret, health returning, joy that does not need to be justified. It carries an uncomplicated quality that adult life makes rare, and where it appears the honest reading is simply: this is good, and you are allowed to enjoy it. It also signals truth coming fully into the open.',
    rev:'The sun is still up but something is between you and it. Reversed, this is joy that is present but not landing, success that arrives without satisfaction, or optimism being performed over something unresolved. It rarely means disaster — more often a delay, or a reminder that the good thing needs to be actually felt rather than added to a list.',
    sym:'A naked child rides a white horse without a saddle — total ease, nothing hidden, nothing controlled. The sunflowers turn toward the light; the red banner streams. The wall behind is being left, not approached: the garden is not the destination.',
    advice:'Say the good thing out loud and let it count. Enjoyment here is the assignment.' },

  { id:'judgement', name:'Judgement', arcana:M, suit:null, num:20, element:'Fire', astro:'Pluto',
    img:'RWS_Tarot_20_Judgement.jpg',
    kwU:['reckoning','awakening','calling','absolution','a clear verdict'],
    kwR:['self-judgement','ignoring the call','unresolved past','harsh verdict'],
    up:'A summing-up, and then a summons. Judgement is the moment a long chapter is honestly assessed and something is asked of you as a result. It carries the sense of a calling — work you are supposed to do, a truth you are supposed to act on — and the relief of a past finally reckoned with rather than carried. Where it appears, the verdict is usually kinder than the one you have been giving yourself.',
    rev:'The call is being ignored, or the verdict is being self-administered and it is cruel. Reversed, Judgement is a past that will not close because it has never been faced, a decision endlessly appealed, or a harsh inner court that convicts on old evidence. It can also mean you hear the calling clearly and are declining it out of practicality.',
    sym:'Gabriel\'s trumpet sounds and the figures rise from their coffins with arms open — they are not afraid of the verdict. Grey figures, grey water, grey mountains: the past, colourless and complete. The cross banner is equal-armed: balance, not condemnation.',
    advice:'Close the loop. Make the call, send the message, or forgive it and stop rehearsing it.' },

  { id:'world', name:'The World', arcana:M, suit:null, num:21, element:'Earth', astro:'Saturn',
    img:'RWS_Tarot_21_World.jpg',
    kwU:['completion','wholeness','arrival','integration','fulfilment'],
    kwR:['almost there','unfinished business','anticlimax','a cycle not closed'],
    up:'The cycle completes and the pieces integrate. The World is arrival — the project delivered, the lesson learned all the way through, the sense of a chapter that actually closed rather than trailing off. It carries a note of travel and of a wider world opening, because completion here is not an ending but a graduation into a larger field. Where it appears, give yourself the credit.',
    rev:'So close. Reversed, The World is the last ten percent that never gets done, the qualification not claimed, the trip not taken, the relationship that has arrived but has not been acknowledged as arrived. It can also describe an anticlimax — reaching the goal and finding it strangely flat, which usually means the goal was inherited rather than chosen.',
    sym:'The dancer is wreathed in a laurel oval — a zero, and a door. She holds two wands, echoing The Magician\'s one: doubled mastery. The same four creatures as the Wheel sit in the corners, but here they are still, the cycle completed rather than turning.',
    advice:'Finish it formally. Mark the ending in some visible way so the next thing can begin.' },

  ];

  /* Minor arcana are appended by cards-minor.js */
})(window.SAGE = window.SAGE || {});
