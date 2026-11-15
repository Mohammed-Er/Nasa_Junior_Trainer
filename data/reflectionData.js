/**
 * ARES: The Last Signal - Post-Mission Reflection Questions
 */

export const REFLECTION_QUESTIONS = [
  {
    id: "q1_hardest",
    number: 1,
    question: "What were the hardest things you met?",
    subtitle: "Choose up to two challenges that tested you most.",
    type: "multi",
    maxChoices: 2,
    baseOptions: [
      "Keeping the crew happy",
      "Not letting Life Support run out",
      "Saving power",
      "Making choices without help from Earth",
      "Understanding the science words"
    ],
    hasDynamicOption: true,
    dynamicType: "lowest_meter",
    allowCustom: true,
    customPlaceholder: "Write another challenge here..."
  },
  {
    id: "q2_learned",
    number: 2,
    question: "What was the most important thing you learned?",
    subtitle: "Pick the one big lesson that stuck with you.",
    type: "single",
    baseOptions: [
      "Power, air, food and the crew's mood all affect each other",
      "Radio messages take a long time, so astronauts must decide for themselves",
      "Shelters and walls protect astronauts from solar storms",
      "Saving supplies can make the crew unhappy"
    ],
    allowCustom: true,
    customPlaceholder: "Write what you learned..."
  },
  {
    id: "q3_decision",
    number: 3,
    question: "What was your hardest decision?",
    subtitle: "Pick the one moment that made you think the hardest.",
    type: "single",
    baseOptions: [],
    hasDynamicOption: true,
    dynamicType: "hardest_decisions",
    fallbackOptions: [
      "Sol 14 — Solar Storm Warning",
      "Sol 21 — Turn the Dish Toward Earth",
      "Choosing daily meals when supplies ran low"
    ],
    allowCustom: true,
    customPlaceholder: "Describe your toughest choice..."
  },
  {
    id: "q4_future",
    number: 4,
    question: "What should future Mars explorers remember?",
    subtitle: "Leave one piece of advice for the next crew.",
    type: "single",
    baseOptions: [
      "Look after your crew, not only your machines",
      "Plan for the unexpected",
      "Test things before you need them",
      "Every choice has a cost"
    ],
    allowCustom: true,
    customPlaceholder: "Write your advice for future astronauts..."
  }
];
