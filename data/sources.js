/**
 * ARES: The Last Signal - Verified Sources & Scientific Reference Registry
 * 
 * Rules:
 * 1. Every educational claim or science blurb in the game links to an entry here.
 * 2. An entry has `verified: false` until a human researcher verifies the exact URL and text.
 * 3. The in-game About / Sources modal will ONLY render entries where `verified: true`.
 * 4. Content is classified with one of four tags:
 *    - real_observation: Direct data/events recorded by NASA/ESA rovers or orbiters.
 *    - scientific_explanation: Established physics, chemistry, or orbital mechanics.
 *    - gameplay_simplification: Intentional gameplay abstraction of complex engineering.
 *    - fictional: Outpost, crew dialogue, and narrative mission scenarios.
 */

export const TAG_DEFINITIONS = {
  real_observation: {
    label: "Real Observation",
    badgeClass: "tag-real",
    description: "Documented measurements and events recorded by NASA and international Mars missions."
  },
  scientific_explanation: {
    label: "Scientific Explanation",
    badgeClass: "tag-science",
    description: "Core principles of Martian physics, orbital mechanics, atmospheric chemistry, and spaceflight."
  },
  gameplay_simplification: {
    label: "Gameplay Simplification",
    badgeClass: "tag-simplification",
    description: "Design choices that simplify complex aerospace engineering into clear game mechanics for ages 7–12."
  },
  fictional: {
    label: "Fictional Scenario",
    badgeClass: "tag-fictional",
    description: "Fictional story elements, outpost incidents, and characters created for the ARES-1 mission."
  }
};

export const FICTIONAL_DISCLAIMER = 
  "ARES-1 is a fictional research mission created for the NASA Space Apps Challenge. " +
  "All incidents, crew dialogues, and outpost emergencies are fictional gameplay scenarios " +
  "and do not represent actual NASA mission events or astronaut casualties.";

export const SOURCES = {
  "mer-spirit-dust-devil": {
    id: "mer-spirit-dust-devil",
    title: "NASA Spirit Rover Solar Array Cleaning Events",
    url: "", // Pending verification against official JPL archives
    eventDate: "March 2005 (Sol 420)",
    verified: false,
    typeTag: "real_observation",
    summary: "NASA's Spirit rover experienced unexpected power surges when Martian dust devils passed over its solar panels, sweeping away accumulated atmospheric dust."
  },
  "nasa-mars-comm-delay": {
    id: "nasa-mars-comm-delay",
    title: "NASA Mars Communication Latency & Distance Variations",
    url: "https://www.nasa.gov/wp-content/uploads/2024/02/10-2024-architecture-workshop-white-paper-mars-challenges.pdf",
    eventDate: "February 2024",
    verified: false,
    typeTag: "scientific_explanation",
    summary: "Because Earth and Mars orbit the Sun at different speeds and distances, one-way radio communication latency ranges between approximately 3 and 22 minutes."
  },
  "perseverance-dust-hazards": {
    id: "perseverance-dust-hazards",
    title: "Protecting Future Crews from Mars Dust Hazards",
    url: "https://www.nasa.gov/missions/mars-2020-perseverance/nasas-perseverance-offers-clues-to-protect-crews-from-mars-dust/",
    eventDate: "August 2023",
    verified: false,
    typeTag: "scientific_explanation",
    summary: "Martian dust is fine, electrostatically charged, abrasive, and contains chemical perchlorates, posing challenges for seals, suit joints, and airlock filtration."
  },
  "mars-solar-conjunction": {
    id: "mars-solar-conjunction",
    title: "Mars Solar Conjunction Interference",
    url: "https://mars.nasa.gov/all-about-mars/night-sky/solar-conjunction/",
    eventDate: "Every ~26 Months",
    verified: false,
    typeTag: "scientific_explanation",
    summary: "During solar conjunction, Mars passes behind the Sun from Earth's viewpoint. The Sun's hot, ionized outer corona distorts and degrades radio transmissions, necessitating communication moratoriums."
  }
};
