/**
 * ARES: The Last Signal - Daily Campaign Story & Crew Status Registry
 * 
 * Sols 1–8 Vertical Slice beats.
 * Routine sols provide crew morale, habitat observations, and duty roster logs.
 * Event slots (Sol 3, 6, 8, etc.) trigger major decision events.
 */

export const CAMPAIGN_BEATS = {
  1: {
    sol: 1,
    chapter: 1,
    title: "Autonomous Protocol Engaged",
    type: "briefing",
    crewSpeaker: "Dr. Evelyn Reed",
    crewRole: "Medical Officer",
    crewAvatar: "medic",
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
    crewAvatar: "scientist",
    crewDialogue: "Marcus and I inspected the exterior airlock sensors this morning. Marcus found Martian red dust inside the coffee grinder filter! Spirits are good—we're keeping busy.",
    habitatStatus: "Battery storage charged to 85%. Thermal heaters holding cabin temperature at a comfortable 21°C.",
    crewMood: "Optimistic & Cohesive",
    hasDecision: false
  },
  3: {
    sol: 3,
    chapter: 1,
    title: "The Mysterious Solar Panel Miracle",
    type: "random_slot",
    eventId: "evt_solar_dust",
    hasDecision: true
  },
  4: {
    sol: 4,
    chapter: 1,
    title: "Post-Vortex Outpost Recalibration",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewAvatar: "engineer",
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
    crewAvatar: "commander",
    crewDialogue: "We've survived five sols cut off from Earth. The crew's trust in your command is solid. Tomorrow we begin independent long-range rover traverses.",
    habitatStatus: "All four habitat pods pressurized. Rover battery placed on trickle charge.",
    crewMood: "Determined & Ready",
    hasDecision: false
  },
  6: {
    sol: 6,
    chapter: 2,
    title: "The Red Snow That Isn't Snow",
    type: "random_slot",
    eventId: "evt_frost",
    hasDecision: true
  },
  7: {
    sol: 7,
    chapter: 2,
    title: "Habitat Thermal Regulation Check",
    type: "routine",
    crewSpeaker: "Marcus Vance",
    crewRole: "Systems & Power Engineer",
    crewAvatar: "engineer",
    crewDialogue: "Sub-zero winds howling outside the dome, but our insulation jacket is doing its job. Dr. Reed treated minor dry skin from the low cabin humidity.",
    habitatStatus: "Cabin air humidity at 32%. Thermal heating grid drawing normal baseline load.",
    crewMood: "Cozy & Focused",
    hasDecision: false
  },
  8: {
    sol: 8,
    chapter: 2,
    title: "The Suit That Won't Let You Go Home",
    type: "random_slot",
    eventId: "evt_suit_dust",
    hasDecision: true
  }
};
