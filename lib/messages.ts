import type { MessageTopic } from './types';

export const topicMessages: Record<
  MessageTopic,
  { phase1: string[]; phase2: string[]; phase3: string[] }
> = {
  food: {
    phase1: [
      'So. Dinner.',
      'Interesting question. Very interesting question.',
      'You want to know about dinner. Right now. At this hour.',
    ],
    phase2: [
      "This is not just about dinner. This is about every time I've cooked and you've said 'smells good' and walked away.",
      'The chicken has been marinating since 3pm. Three. P.M.',
      "Remember when you said you'd handle Tuesday? Tuesday came and went. Like a ghost. A hungry ghost.",
      "I reorganized the entire spice rack for this meal and you're asking *if* it's ready.",
      "You know what? I also wanted Thai food last week. But I didn't say anything. I made rice.",
    ],
    phase3: [
      "This dinner represents a level of effort that I don't think you're fully equipped to appreciate.",
      'I tasted it four times to make sure it was right. Four times. For you.',
      "The fact that you're texting instead of smelling the kitchen tells me everything.",
      "Gordon Ramsay would have texted too. And that's why he's divorced.",
    ],
  },
  time: {
    phase1: [
      'Oh, timing. My favourite subject.',
      "Let's talk about time. Since that's what you brought up.",
      "You're asking about time. As if time is something you've respected.",
    ],
    phase2: [
      "You said 7. It is now 7:43. These are facts, not opinions.",
      "I've been ready since 6:50. I've been *aggressively* ready.",
      'Do you know what I did while waiting? I reorganized my feelings. Twice.',
      "My mother was right. She said 'he'll be late to his own birthday.' I defended you.",
      'I checked my phone 11 times. I know because I counted. To stay calm.',
    ],
    phase3: [
      'Time is the one thing you cannot get back. You took mine and spent it on whatever that was.',
      'I had a whole plan for this evening. It was a good plan. A realistic plan. You were in it.',
      "Punctuality is love language #6. Look it up. Actually don't, you'll just be late to the article.",
    ],
  },
  location: {
    phase1: [
      'Where. Okay.',
      'You want to know where I am. Right. Yes.',
      'Location. As a question. Bold.',
    ],
    phase2: [
      'I told you I was going out. I said it clearly. You were looking at your phone but your ears were technically present.',
      "I've been here for 40 minutes. The Wi-Fi is bad and I've been thinking. About everything.",
      "You know what I never ask? Where you are. Because I trust you. Remember trust?",
      "I left a note. On the counter. Under your keys. Which you apparently didn't touch.",
      "My location is: disappointed. You can't pin that on a map.",
    ],
    phase3: [
      "The fact that you don't know where I am means you weren't paying attention when I told you.",
      "I'm somewhere you should have known about. That's all I'll say.",
      "I exist in a physical space and you just... forgot about it. About me. Briefly. But still.",
    ],
  },
  plans: {
    phase1: [
      "The plans. Yes. Let's discuss the plans.",
      'Oh good. You remembered we had plans.',
      'Plans. As a topic. Sure.',
    ],
    phase2: [
      "I've been thinking about this for three days. Three days of mental preparation and you're asking right now.",
      "I told Priya we'd be there by 8. I've already texted her twice to manage expectations.",
      "You know, when you cancel, it's not just you cancelling. It's me having to explain. Again.",
      'I had an outfit ready. It was a great outfit. It deserved to be worn tonight.',
      "Last time we cancelled on them we said 'next time for sure.' This was next time.",
    ],
    phase3: [
      'Plans are not suggestions. Plans are a form of commitment. A social contract. We violated a contract.',
      "Do you know what it's like to get excited about something for a week and then have to recalibrate in real time?",
      'The reservation was non-refundable. The reservation was made with hope. You cancelled hope.',
    ],
  },
  money: {
    phase1: [
      "Money. Great. Let's go there.",
      'You want to talk about the bill. Fine.',
      'Ah. Finances. My second favourite source of tension.',
    ],
    phase2: [
      "I looked at the statement. I didn't want to. But I looked.",
      "There are three charges here I don't recognize and I've been very calm about it. Until now.",
      "I'm not saying you spend too much. I'm saying the spreadsheet tells a different story.",
      'We said we had a budget. A budget is a promise to your future self. And you broke it.',
      'The subscription you forgot to cancel has now charged us for 14 months.',
    ],
    phase3: [
      'Money is just energy. And right now the energy is very chaotic.',
      "I'm not materialistic. I just believe in financial honesty. Which is a form of intimacy. Which you're avoiding.",
      'I made a whole budget tracker for us. In colour. With formulas. You opened it once.',
    ],
  },
  phone: {
    phase1: [
      'The irony of you texting this to me.',
      'Oh, you found your phone. Wonderful.',
      'You replied. At last. The prodigal message returns.',
    ],
    phase2: [
      "I can see when you were last active. I'm not a detective. I just have eyes.",
      "You had time to post a story but not to reply. I saw it. I said nothing. I'm saying something now.",
      'I sent three messages. Three. The first two were reasonable. The third one was art.',
      "Being 'busy' and being 'unable to send a 2-letter reply' are two different things. I've been busy and I've still replied.",
      "My read receipts are on. Out of respect. Yours are off. That's a lifestyle choice and I've noted it.",
    ],
    phase3: [
      "Communication is not a burden. It's a form of saying 'I know you exist and I acknowledge that.' You chose not to.",
      "I wasn't worried. I was aware. There's a difference and both are exhausting.",
      'The phone is always in your hand. That makes the silence a decision.',
    ],
  },
  vague: {
    phase1: [
      "...that's it?",
      "Okay. So we're doing this.",
      'You opened a conversation with that. Deliberately.',
      "I've been waiting for this message. I assumed it would contain more.",
    ],
    phase2: [
      "The brevity. The casual deployment of a single syllable. As if I don't have feelings with a full vocabulary.",
      "I could write paragraphs. I could fill books. You sent '{userMessage}'. And expected a response.",
      'You know what that message communicated? Everything. In the worst possible way.',
      "I've been thinking all day. Crafting thoughts. And you arrived with '{userMessage}' like it was enough.",
      "My therapist would have so much to say about this. She'd probably start with the message and end with your childhood.",
    ],
    phase3: [
      "'{userMessage}' is not a conversation. It's a test. And we both know which one of us is being tested.",
      "I've read that message six times. I've found new meaning in it each time. None of the meanings were good.",
      'One character. You gave me one character. I gave you my afternoon.',
    ],
  },
  generic: {
    phase1: [
      'So you sent that. Knowing full well what it would do.',
      'Interesting. Very bold choice.',
      "You typed '{userMessage}' and hit send. Just like that.",
    ],
    phase2: [
      "This is not about what you said. This is about the pattern.",
      "I've been very patient. Measurably patient. Spreadsheet-level patient.",
      "There are things I've let go. This is not one of those things.",
      "This is exactly like the coriander incident. You don't remember the coriander incident. That's also part of the problem.",
    ],
    phase3: [
      "You sent '{userMessage}' like it was a normal thing to send.",
      'I have a whole archive of moments exactly like this one. It is a large archive.',
      "I'm not overreacting. I'm reacting at the correct size for this situation.",
    ],
  },
};

export const universalMessages = {
  phase4: [
    "Actually, I know you're trying. I see it. ❤️",
    "You're not a bad person. You're just a *specific* kind of person.",
    "Okay. I love you. That doesn't change anything I just said, but it's true.",
    "I'm proud of you for the other things. I want that on record.",
    'You work hard. I see that. This is separate from that.',
  ],
  phase5: [
    'Anyway. Back to the issue.',
    "That moment of warmth doesn't close the tab. The tab is still open.",
    'Right. Where were we. Yes.',
    'The affection stands. The problem also stands.',
    "I meant all of that. And also: we're not done.",
  ],
  phase6: [
    "I just need you to understand. That's all.",
    'Think about it. Really think.',
    "I'm not angry. I'm calibrated.",
    'You know what to say.',
    '...',
  ],
};

export const apologyResponses = [
  'Correct.',
  'Accepted. Conditionally.',
  'Progress.',
  'That took a while.',
  'Noted. Filed.',
  'Good. We can move on. Slowly.',
  'I know.',
];

export const summaryData = {
  damageCaused: [
    'Medium-high. Recoverable.',
    'Significant. Noted in the record.',
    'Minor but cumulative.',
    "You'll be fine. Probably.",
  ],
  coreIssue: {
    food: 'Failure to provide kitchen status updates.',
    time: 'Disregard for agreed schedules.',
    location: "Failure to track partner's stated location.",
    plans: 'Undermining pre-committed social arrangements.',
    money: 'Unilateral financial decisions.',
    phone: 'Deliberate communication avoidance.',
    vague: 'Communication avoidance via minimalism.',
    generic: 'Pattern of casual disregard.',
  } as Record<MessageTopic, string>,
  relationshipStatus: [
    'Stable (monitored)',
    'Conditional peace',
    'On probation',
    'Active recovery',
    'Tense but functional',
  ],
};
