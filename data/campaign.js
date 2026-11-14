/**
 * ARES: The Last Signal - Complete 30-Sol Campaign Registry
 * 
 * Maps all 30 sols across the 5 story chapters:
 * - Chapter 1 (Sols 1–5): The Last Signal
 * - Chapter 2 (Sols 6–12): Alone on Mars
 * - Chapter 3 (Sols 13–18): The Breaking Point
 * - Chapter 4 (Sols 19–25): The Final Attempt
 * - Chapter 5 (Sols 26–30): The Last Five Sols
 * 
 * Includes daily crew mood, rotating in-character dialogues,
 * habitat telemetry checks, and designated event slots.
 */

export const CAMPAIGN_BEATS = {
  // --- CHAPTER 1: THE LAST SIGNAL (SOLS 1–5) ---
  1: {
    sol: 1,
    chapter: 1,
    title: "Autonomous Protocol Engaged",
    type: "briefing",
    crewSpeaker: "Dr. Evelyn Reed",
    crewRole: "Medical Officer",
    crewDialogue: "Crew vitals are normal despite the shock of losing the Earth relay. Everyone is resting in their quarters. Let's establish our baseline maintenance before nightfall.",
    habitatStatus: "Airlock seals pressurized. Water recyclers cycling at 98% efficiency.",
    crewMood: "Focused & Alert",
    hasDecision: false
  },
  2: {
    sol: 2,
    chapter: 1,
    title: "Routine Dust Sweeping & Soil Analysis",
    type: "routine",
    crewSpeaker: "Dr. Tariq Al-Mansoor",
    crewRole: "Mission Scientist",
    crewDialogue: "Marcus and I inspected the exterior airlock sensors this morning. Marcus found Martian red dust inside the coffee grinder filter! Spirits are good—we're keeping busy.",
    habitatStatus: "Battery storage charged to 85%. Thermal heaters holding cabin temperature at a comfortable 21°C.",
    crewMood: "Optimistic & Cohesive",
    hasDecision: false
  },
  3: {
    sol: 3,
    chapter: 1,
    title: "Event Slot: Sol 03",
    type: "random_slot",
    hasDecision: true
  },
  4: {
    sol: 4,
    chapter: 1,
    title: "Post-Vortex Outpost Recalibration",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "Following yesterday's vortex event, all circuit breakers have cooled down. The crew spent the morning running scheduled filter purges.",
    habitatStatus: "Solar field tracking the morning sun smoothly. Secondary oxygen loop nominal.",
    crewMood: "Cautious & Relieved",
    hasDecision: false
  },
  5: {
    sol: 5,
    chapter: 1,
    title: "End of Chapter 1: The Highland Survey",
    type: "routine",
    crewSpeaker: "Commander Elena Rivera",
    crewRole: "Outpost Commander",
    crewDialogue: "We've survived five sols cut off from Earth. The crew's trust in your command is solid. Tomorrow we begin independent long-range rover traverses.",
    habitatStatus: "All four habitat pods pressurized. Rover battery placed on trickle charge.",
    crewMood: "Determined & Ready",
    hasDecision: false
  },

  // --- CHAPTER 2: ALONE ON MARS (SOLS 6–12) ---
  6: {
    sol: 6,
    chapter: 2,
    title: "Event Slot: Sol 06",
    type: "random_slot",
    hasDecision: true
  },
  7: {
    sol: 7,
    chapter: 2,
    title: "Habitat Thermal Regulation Check",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "Sub-zero winds howling outside the dome, but our insulation jacket is doing its job. Dr. Reed treated minor dry skin from the low cabin humidity.",
    habitatStatus: "Cabin air humidity at 32%. Thermal heating grid drawing normal baseline load.",
    crewMood: "Cozy & Focused",
    hasDecision: false
  },
  8: {
    sol: 8,
    chapter: 2,
    title: "Event Slot: Sol 08",
    type: "random_slot",
    hasDecision: true
  },
  9: {
    sol: 9,
    chapter: 2,
    title: "Geological Slide Microscopy",
    type: "routine",
    crewSpeaker: "Dr. Tariq Al-Mansoor",
    crewRole: "Mission Scientist",
    crewDialogue: "The thin-section mineral slides under the optical microscope look breathtaking. Martian basalts show microscopic volcanic gas vesicles from billions of years ago.",
    habitatStatus: "Spectrometer bench drawing 2% auxiliary power. Primary systems green.",
    crewMood: "Curious & Absorbed",
    hasDecision: false
  },
  10: {
    sol: 10,
    chapter: 2,
    title: "One-Third Mission Milestone Check",
    type: "routine",
    crewSpeaker: "Dr. Evelyn Reed",
    crewRole: "Medical Officer",
    crewDialogue: "Ten sols complete, Commander! We did our routine exercise on the cycle ergometers. Cardiovascular metrics are top-notch for all four of us.",
    habitatStatus: "Cabin carbon dioxide scrubbing at 0.3% partial pressure (well below safety limit).",
    crewMood: "High Spirits & Energetic",
    hasDecision: false
  },
  11: {
    sol: 11,
    chapter: 2,
    title: "Event Slot: Sol 11",
    type: "random_slot",
    hasDecision: true
  },
  12: {
    sol: 12,
    chapter: 2,
    title: "Pre-Midpoint Diagnostic Run",
    type: "routine",
    crewSpeaker: "Commander Elena Rivera",
    crewRole: "Outpost Commander",
    crewDialogue: "Tomorrow marks the midpoint of our 30-sol survival mission. Marcus is checking solar flare monitors on the weather mast.",
    habitatStatus: "All four spacesuit life-support backpacks fully recharged.",
    crewMood: "Vigilant & Confident",
    hasDecision: false
  },

  // --- CHAPTER 3: THE BREAKING POINT (SOLS 13–18) ---
  13: {
    sol: 13,
    chapter: 3,
    title: "Space Weather Storm Telemetry Alert",
    type: "routine",
    crewSpeaker: "Dr. Tariq Al-Mansoor",
    crewRole: "Mission Scientist",
    crewDialogue: "Commander, our radiometer is picking up increased high-energy X-ray flux from the Sun. A solar active region just rotated into view.",
    habitatStatus: "Cosmic ray monitors reporting rising background ionizing flux.",
    crewMood: "Tense & Prepared",
    hasDecision: false
  },
  14: {
    sol: 14,
    chapter: 3,
    title: "Solar Particle Event (SPE) Storm Alert",
    type: "story",
    fixedEventId: "evt_solar_particle",
    hasDecision: true
  },
  15: {
    sol: 15,
    chapter: 3,
    title: "Event Slot: Sol 15",
    type: "random_slot",
    hasDecision: true
  },
  16: {
    sol: 16,
    chapter: 3,
    title: "Post-Crisis Habitat Inspection",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "The storm has passed. We inspected exterior cable conduits; minor static discharge pitting, but the main power backbone is intact.",
    habitatStatus: "Radiation safety verified. Air filtration scrubbers purged and online.",
    crewMood: "Relieved & Resilient",
    hasDecision: false
  },
  17: {
    sol: 17,
    chapter: 3,
    title: "Hydroponics Green Bay Refresh",
    type: "routine",
    crewSpeaker: "Dr. Evelyn Reed",
    crewRole: "Medical Officer",
    crewDialogue: "We harvested fresh microgreens from the vertical hydroponic rack today! The crunch of fresh radishes did wonders for crew morale.",
    habitatStatus: "Hydroponic nutrient reservoirs refilled. Water recovery loop at 95%.",
    crewMood: "Delighted & Rested",
    hasDecision: false
  },
  18: {
    sol: 18,
    chapter: 3,
    title: "Chapter 3 Wrap-Up: Outpost Survives",
    type: "routine",
    crewSpeaker: "Commander Elena Rivera",
    crewRole: "Outpost Commander",
    crewDialogue: "Eighteen sols behind us. We survived the hardest multi-system crisis Mars could throw at us. Now, we focus on getting our voice back to Earth.",
    habitatStatus: "Outpost core integrity holding firm. Preparing communication hardware.",
    crewMood: "Proud & Determined",
    hasDecision: false
  },

  // --- CHAPTER 4: THE FINAL ATTEMPT (SOLS 19–25) ---
  19: {
    sol: 19,
    chapter: 4,
    title: "Event Slot: Sol 19",
    type: "random_slot",
    hasDecision: true
  },
  20: {
    sol: 20,
    chapter: 4,
    title: "Pre-Antenna Realignment Checklist",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "Tomorrow we climb the exterior mast gantry to calibrate the high-gain dish. I'm testing the stepper motor coils right now.",
    habitatStatus: "Transmitter power capacitors undergoing insulation resistance tests.",
    crewMood: "Methodical & Steady",
    hasDecision: false
  },
  21: {
    sol: 21,
    chapter: 4,
    title: "High-Gain Antenna Realignment",
    type: "story",
    fixedEventId: "evt_antenna_alignment",
    hasDecision: true
  },
  22: {
    sol: 22,
    chapter: 4,
    title: "Regolith Berm Reinforcement",
    type: "story",
    fixedEventId: "evt_regolith_shielding",
    hasDecision: true
  },
  23: {
    sol: 23,
    chapter: 4,
    title: "Event Slot: Sol 23",
    type: "random_slot",
    hasDecision: true
  },
  24: {
    sol: 24,
    chapter: 4,
    title: "Deep Space Network Listening Watch",
    type: "routine",
    crewSpeaker: "Dr. Evelyn Reed",
    crewRole: "Medical Officer",
    crewDialogue: "We ran radio sweeps across the 8.4 GHz X-band frequencies today. Faint carrier hums, but Earth is slowly moving into line-of-sight.",
    habitatStatus: "Transmitter dish locked onto azimuth 114°.",
    crewMood: "Hopeful & Eager",
    hasDecision: false
  },
  25: {
    sol: 25,
    chapter: 4,
    title: "Chapter 4 Conclusion: The Final Five Sols Beckon",
    type: "routine",
    crewSpeaker: "Commander Elena Rivera",
    crewRole: "Outpost Commander",
    crewDialogue: "Twenty-five sols on Mars. In five days, our primary transmission window opens. Keep your eyes sharp and our systems balanced.",
    habitatStatus: "All four astronauts cleared medical fitness checks. Systems ready.",
    crewMood: "Unyielding & United",
    hasDecision: false
  },

  // --- CHAPTER 5: THE LAST FIVE SOLS (SOLS 26–30) ---
  26: {
    sol: 26,
    chapter: 5,
    title: "The Final Five Sols Begin",
    type: "routine",
    crewSpeaker: "Dr. Tariq Al-Mansoor",
    crewRole: "Mission Scientist",
    crewDialogue: "Earth is rising above the Martian dawn horizon like a brilliant blue beacon. We are compiling our geological findings for transmission.",
    habitatStatus: "Scientific datasets packaged into compressed telemetry packets.",
    crewMood: "Inspired & Hopeful",
    hasDecision: false
  },
  27: {
    sol: 27,
    chapter: 5,
    title: "Event Slot: Sol 27",
    type: "random_slot",
    hasDecision: true
  },
  28: {
    sol: 28,
    chapter: 5,
    title: "Countdown: 48 Hours to Transmission",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewDialogue: "T-minus 48 hours to the carrier window. I've re-torqued all electrical bus connections. Battery banks are in top shape.",
    habitatStatus: "High-gain transmitter amplifiers warming up on standby.",
    crewMood: "Electrified & Ready",
    hasDecision: false
  },
  29: {
    sol: 29,
    chapter: 5,
    title: "Eve of the Last Signal",
    type: "routine",
    crewSpeaker: "Commander Elena Rivera",
    crewRole: "Outpost Commander",
    crewDialogue: "Tomorrow is Sol 30. We've weathered dust vortexes, freezing nights, and silence from home. Tomorrow, we fire the carrier signal to Earth.",
    habitatStatus: "Outpost standing at peak operational readiness.",
    crewMood: "Unshakable",
    hasDecision: false
  },
  30: {
    sol: 30,
    chapter: 5,
    title: "The Last Signal to Earth",
    type: "story",
    fixedEventId: "evt_final_transmission",
    hasDecision: true
  }
};
