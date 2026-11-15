/**
 * ARES: The Last Signal - 30-Sol Campaign Registry (v3)
 * 
 * Maps all 30 sols across the 5 story chapters with kid-friendly writing.
 * Sentences <= 18 words.
 * Includes the 3 automatic antenna repair steps (Sols 5, 12, 18)
 * and the 3 story morale gifts (Sols 10, 17, 26).
 */

export const CAMPAIGN_BEATS = {
  // =========================================================================
  // CHAPTER 1: THE LAST SIGNAL (SOLS 1–5) · Goal: Find out what broke.
  // =========================================================================
  1: {
    sol: 1,
    chapter: 1,
    chapterGoal: "Find out what broke.",
    title: "First Day Cut Off From Earth",
    type: "briefing",
    crewSpeaker: "Dr. Hoshi Reed",
    crewRole: "Medical Officer",
    crewDialogue: "Everyone is resting quietly in their bunks. The storm was loud, but we are all safe.",
    habitatStatus: "Air and water systems are cycling smoothly.",
    crewMood: "Calm & Alert",
    hasDecision: false
  },
  2: {
    sol: 2,
    chapter: 1,
    chapterGoal: "Find out what broke.",
    title: "Morning Systems Inspection",
    type: "routine",
    crewSpeaker: "Dr. Tariq Al-Mansoor",
    crewRole: "Mission Scientist",
    crewDialogue: "Marcus and I checked the airlock seals this morning. Red dust gets into everything!",
    habitatStatus: "Batteries charged. Cabin temperature is warm and steady.",
    crewMood: "Cheerful & Busy",
    hasDecision: false
  },
  3: {
    sol: 3,
    chapter: 1,
    chapterGoal: "Find out what broke.",
    title: "Event Slot: Sol 3",
    type: "random_slot",
    hasDecision: true
  },
  4: {
    sol: 4,
    chapter: 1,
    chapterGoal: "Find out what broke.",
    title: "Cleaning Up After the Dust",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "All circuit breakers have cooled down nicely. We spent the morning cleaning air filters.",
    habitatStatus: "Solar panels tracking the sun. Oxygen flow is steady.",
    crewMood: "Steady & Relieved",
    hasDecision: false
  },
  5: {
    sol: 5,
    chapter: 1,
    chapterGoal: "Find out what broke.",
    title: "Antenna Inspection: Step 1 Complete",
    type: "repair_step",
    antennaStep: 1,
    repairTitle: "Step 1: Find the damage",
    crewSpeaker: "Commander Elena Rivera",
    crewRole: "Outpost Commander",
    crewDialogue: "Marcus climbed the antenna tower outside. He found a bent motor arm and a cracked cable!",
    habitatStatus: "Antenna damage diagnosed. Spare parts needed.",
    crewMood: "Determined",
    hasDecision: false
  },

  // =========================================================================
  // CHAPTER 2: ALONE ON MARS (SOLS 6–12) · Goal: Build the parts.
  // =========================================================================
  6: {
    sol: 6,
    chapter: 2,
    chapterGoal: "Build the parts.",
    title: "Event Slot: Sol 6",
    type: "random_slot",
    hasDecision: true
  },
  7: {
    sol: 7,
    chapter: 2,
    chapterGoal: "Build the parts.",
    title: "Cold Wind Outside",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "Cold winds are howling outside our dome. Our thick walls keep us warm.",
    habitatStatus: "Cabin air humidity is steady. Heaters working normally.",
    crewMood: "Cozy & Focused",
    hasDecision: false
  },
  8: {
    sol: 8,
    chapter: 2,
    chapterGoal: "Build the parts.",
    title: "Event Slot: Sol 8",
    type: "random_slot",
    hasDecision: true
  },
  9: {
    sol: 9,
    chapter: 2,
    chapterGoal: "Build the parts.",
    title: "Rocks Under the Microscope",
    type: "routine",
    crewSpeaker: "Dr. Tariq Al-Mansoor",
    crewRole: "Mission Scientist",
    crewDialogue: "These ancient volcanic rock slices look amazing under the lens! Billions of years old.",
    habitatStatus: "Science lab drawing low power. All primary meters green.",
    crewMood: "Curious & Happy",
    hasDecision: false
  },
  10: {
    sol: 10,
    chapter: 2,
    chapterGoal: "Build the parts.",
    title: "Milestone Celebration: Sol 10",
    type: "morale_gift",
    giftDeltas: { morale: 8 },
    crewSpeaker: "Dr. Hoshi Reed",
    crewRole: "Medical Officer",
    crewDialogue: "Ten sols complete, Commander! We opened a pouch of sweet holiday snacks to celebrate!",
    habitatStatus: "Crew hearts and lungs in top health. Morale +8!",
    crewMood: "High Spirits",
    hasDecision: false
  },
  11: {
    sol: 11,
    chapter: 2,
    chapterGoal: "Build the parts.",
    title: "Event Slot: Sol 11",
    type: "random_slot",
    hasDecision: true
  },
  12: {
    sol: 12,
    chapter: 2,
    chapterGoal: "Build the parts.",
    title: "Spare Parts Built: Step 2 Complete",
    type: "repair_step",
    antennaStep: 2,
    repairTitle: "Step 2: Build spare parts",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "I made a new motor arm from the spare rover motor. It fits great!",
    habitatStatus: "Antenna replacement gear ready for installation.",
    crewMood: "Proud & Ready",
    hasDecision: false
  },

  // =========================================================================
  // CHAPTER 3: THE BREAKING POINT (SOLS 13–18) · Goal: Survive the solar storm.
  // =========================================================================
  13: {
    sol: 13,
    chapter: 3,
    chapterGoal: "Survive the solar storm.",
    title: "Space Weather Alert",
    type: "routine",
    crewSpeaker: "Dr. Tariq Al-Mansoor",
    crewRole: "Mission Scientist",
    crewDialogue: "Commander, our sensors show energy bursts from the Sun. A storm is coming.",
    habitatStatus: "Radiation monitors reporting rising background solar energy.",
    crewMood: "Alert & Focused",
    hasDecision: false
  },
  14: {
    sol: 14,
    chapter: 3,
    chapterGoal: "Survive the solar storm.",
    title: "Solar Storm Warning",
    type: "story",
    fixedEventId: "evt_solar_particle",
    hasDecision: true
  },
  15: {
    sol: 15,
    chapter: 3,
    chapterGoal: "Survive the solar storm.",
    title: "Event Slot: Sol 15",
    type: "random_slot",
    hasDecision: true
  },
  16: {
    sol: 16,
    chapter: 3,
    chapterGoal: "Survive the solar storm.",
    title: "The Storm Has Passed",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "The solar storm is finally over. The outer wiring took minor hits, but power is solid.",
    habitatStatus: "Radiation levels back to safe normal background.",
    crewMood: "Relieved",
    hasDecision: false
  },
  17: {
    sol: 17,
    chapter: 3,
    chapterGoal: "Survive the solar storm.",
    title: "Fresh Greenhouse Harvest",
    type: "morale_gift",
    giftDeltas: { lifeSupport: 6, morale: 6 },
    crewSpeaker: "Dr. Hoshi Reed",
    crewRole: "Medical Officer",
    crewDialogue: "We picked crisp fresh radishes and green leaves from our greenhouse bay today!",
    habitatStatus: "Hydroponic bay thriving. Life Support +6%, Morale +6!",
    crewMood: "Delighted & Refreshed",
    hasDecision: false
  },
  18: {
    sol: 18,
    chapter: 3,
    chapterGoal: "Survive the solar storm.",
    title: "Motor Test: Step 3 Complete",
    type: "repair_step",
    antennaStep: 3,
    repairTitle: "Step 3: Test the motor",
    crewSpeaker: "Commander Elena Rivera",
    crewRole: "Outpost Commander",
    crewDialogue: "Marcus bolted the new motor onto the dish and tested it. The dish pivots smoothly!",
    habitatStatus: "Antenna motor alignment tested and verified.",
    crewMood: "Confident",
    hasDecision: false
  },

  // =========================================================================
  // CHAPTER 4: THE FINAL ATTEMPT (SOLS 19–25) · Goal: Turn the dish toward Earth.
  // =========================================================================
  19: {
    sol: 19,
    chapter: 4,
    chapterGoal: "Turn the dish toward Earth.",
    title: "Event Slot: Sol 19",
    type: "random_slot",
    hasDecision: true
  },
  20: {
    sol: 20,
    chapter: 4,
    chapterGoal: "Turn the dish toward Earth.",
    title: "Preparing for Alignment",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "Tomorrow we aim the dish toward Earth. I am checking the motors today.",
    habitatStatus: "Transmitter power capacitors fully checked.",
    crewMood: "Careful & Ready",
    hasDecision: false
  },
  21: {
    sol: 21,
    chapter: 4,
    chapterGoal: "Turn the dish toward Earth.",
    title: "Turn the Dish Toward Earth",
    type: "story",
    fixedEventId: "evt_antenna_alignment",
    hasDecision: true
  },
  22: {
    sol: 22,
    chapter: 4,
    chapterGoal: "Turn the dish toward Earth.",
    title: "Fix the Shield Wall",
    type: "story",
    fixedEventId: "evt_regolith_shielding",
    hasDecision: true
  },
  23: {
    sol: 23,
    chapter: 4,
    chapterGoal: "Turn the dish toward Earth.",
    title: "Event Slot: Sol 23",
    type: "random_slot",
    hasDecision: true
  },
  24: {
    sol: 24,
    chapter: 4,
    chapterGoal: "Turn the dish toward Earth.",
    title: "Listening to the Stars",
    type: "routine",
    crewSpeaker: "Dr. Hoshi Reed",
    crewRole: "Medical Officer",
    crewDialogue: "We ran radio tests today. Earth is slowly moving into our view.",
    habitatStatus: "Antenna dish held firmly in place.",
    crewMood: "Hopeful & Eager",
    hasDecision: false
  },
  25: {
    sol: 25,
    chapter: 4,
    chapterGoal: "Turn the dish toward Earth.",
    title: "The Final Five Sols Ahead",
    type: "routine",
    crewSpeaker: "Commander Elena Rivera",
    crewRole: "Outpost Commander",
    crewDialogue: "Twenty-five sols complete. In five days, our big transmission window opens!",
    habitatStatus: "All four astronauts healthy and ready.",
    crewMood: "United & Focused",
    hasDecision: false
  },

  // =========================================================================
  // CHAPTER 5: THE LAST FIVE SOLS (SOLS 26–30) · Goal: Send the signal home.
  // =========================================================================
  26: {
    sol: 26,
    chapter: 5,
    chapterGoal: "Send the signal home.",
    title: "Earth in the Evening Sky",
    type: "morale_gift",
    giftDeltas: { morale: 6 },
    crewSpeaker: "Dr. Tariq Al-Mansoor",
    crewRole: "Mission Scientist",
    crewDialogue: "Look out the window! Earth is shining like a bright blue star in the twilight sky!",
    habitatStatus: "Earth clearly visible. Morale +6!",
    crewMood: "Inspired",
    hasDecision: false
  },
  27: {
    sol: 27,
    chapter: 5,
    chapterGoal: "Send the signal home.",
    title: "Event Slot: Sol 27",
    type: "random_slot",
    hasDecision: true
  },
  28: {
    sol: 28,
    chapter: 5,
    chapterGoal: "Send the signal home.",
    title: "Two Days to Transmission",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "Just 48 hours to our transmission window. I tightened every wire on the radio dish.",
    habitatStatus: "Radio amplifiers warmed up and ready on standby.",
    crewMood: "Excited & Ready",
    hasDecision: false
  },
  29: {
    sol: 29,
    chapter: 5,
    chapterGoal: "Send the signal home.",
    title: "The Eve of the Signal",
    type: "routine",
    crewSpeaker: "Commander Elena Rivera",
    crewRole: "Outpost Commander",
    crewDialogue: "Tomorrow is Sol 30. We made it through storms and cold nights. Tomorrow, we beam home!",
    habitatStatus: "All outpost systems ready for final broadcast.",
    crewMood: "Unshakable",
    hasDecision: false
  },
  30: {
    sol: 30,
    chapter: 5,
    chapterGoal: "Send the signal home.",
    title: "The Last Signal",
    type: "story",
    fixedEventId: "evt_final_transmission",
    hasDecision: true
  }
};
