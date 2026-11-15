/**
 * ARES: The Last Signal - Verified Sources & Scientific Reference Registry
 * 
 * Rules:
 * 1. Every educational claim or science note in the game links to an entry here.
 * 2. An entry has `verified: false` until a researcher verifies the exact URL.
 * 3. The in-game About / Sources modal will ONLY render entries where `verified: true`.
 * 4. Content is classified with the kid-friendly tags:
 *    - Real NASA fact: Direct data recorded by NASA rovers or orbiters.
 *    - Science idea: Established physics, chemistry, or space science.
 *    - Made simpler for the game: Intentional gameplay abstraction for ages 7–12.
 *    - Story only: Fictional story elements created for the ARES-1 mission.
 */

export const TAG_DEFINITIONS = {
  real_fact: {
    label: "Real NASA fact",
    badgeClass: "tag-real",
    description: "Documented measurements and events recorded by NASA and international Mars missions."
  },
  science_idea: {
    label: "Science idea",
    badgeClass: "tag-science",
    description: "Core principles of Martian physics, orbital mechanics, atmospheric chemistry, and spaceflight."
  },
  gameplay_simpler: {
    label: "Made simpler for the game",
    badgeClass: "tag-simplification",
    description: "Design choices that simplify complex aerospace engineering into clear game mechanics for ages 7–12."
  },
  story_only: {
    label: "Story only",
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
    url: "",
    eventDate: "March 2005 (Sol 420)",
    verified: false,
    typeTag: "real_fact",
    summary: "NASA's Spirit rover experienced unexpected power surges when Martian dust devils passed over its solar panels, sweeping away accumulated atmospheric dust."
  },
  "nasa-mars-comm-delay": {
    id: "nasa-mars-comm-delay",
    title: "NASA Mars Communication Latency & Distance Variations",
    url: "https://www.nasa.gov/wp-content/uploads/2024/02/10-2024-architecture-workshop-white-paper-mars-challenges.pdf",
    eventDate: "February 2024",
    verified: false,
    typeTag: "science_idea",
    summary: "Because Earth and Mars orbit the Sun at different speeds and distances, one-way radio communication latency ranges between approximately 3 and 22 minutes."
  },
  "perseverance-dust-hazards": {
    id: "perseverance-dust-hazards",
    title: "Protecting Future Crews from Mars Dust Hazards",
    url: "https://www.nasa.gov/missions/mars-2020-perseverance/nasas-perseverance-offers-clues-to-protect-crews-from-mars-dust/",
    eventDate: "August 2023",
    verified: false,
    typeTag: "real_fact",
    summary: "Martian dust is fine, electrostatically charged, abrasive, and contains chemical perchlorates, posing challenges for seals, suit joints, and airlock filtration."
  },
  "mars-solar-conjunction": {
    id: "mars-solar-conjunction",
    title: "Mars Solar Conjunction Interference",
    url: "https://mars.nasa.gov/all-about-mars/night-sky/solar-conjunction/",
    eventDate: "Every ~26 Months",
    verified: false,
    typeTag: "science_idea",
    summary: "During solar conjunction, Mars passes behind the Sun from Earth's viewpoint. The Sun's hot, ionized outer corona distorts and degrades radio transmissions, necessitating communication moratoriums."
  },
  "curiosity-radiation-data": {
    id: "curiosity-radiation-data",
    title: "Radiation Assessment Detector (RAD) on Mars Curiosity Rover",
    url: "",
    eventDate: "2012–Present",
    verified: false,
    typeTag: "real_fact",
    summary: "Curiosity's RAD instrument measures high-energy galactic cosmic rays and solar particle events at the Martian surface, helping NASA design habitats and storm shelters."
  },
  "nasa-mars-exploration-faq": {
    id: "nasa-mars-exploration-faq",
    title: "NASA Mars Exploration Program & Atmosphere Overview",
    url: "",
    eventDate: "Ongoing",
    verified: false,
    typeTag: "science_idea",
    summary: "Mars has a very thin atmosphere composed predominantly of carbon dioxide, with sub-zero nightly temperatures reaching -100°C and surface atmospheric pressure less than 1% of Earth's."
  },
  "nasa-space-food-system": {
    id: "nasa-space-food-system",
    title: "NASA Space Food Systems & Astronaut Nutrition",
    url: "",
    eventDate: "Ongoing",
    verified: false,
    typeTag: "real_fact",
    summary: "Astronauts consume rehydratable pouches, tortillas, and thermo-stabilized meals. Salt and pepper are provided in liquid form to prevent particles from floating into air filters."
  }
};
