/**
 * ARES: The Last Signal - Illustrated Astronaut Busts (SVG)
 * 
 * Generates illustrated astronaut character portraits with 3 mood expressions:
 * - happy (morale >= 70)
 * - neutral (morale 45-69)
 * - tired (morale < 45)
 */

export function normalizeCrewId(id) {
  if (!id) return "commander";
  const lower = id.toLowerCase();
  if (lower.includes("rivera") || lower.includes("commander") || lower.includes("lead")) return "commander";
  if (lower.includes("mansoor") || lower.includes("scientist") || lower.includes("tariq") || lower.includes("geo")) return "scientist";
  if (lower.includes("vance") || lower.includes("engineer") || lower.includes("marcus") || lower.includes("eng")) return "engineer";
  if (lower.includes("reed") || lower.includes("medic") || lower.includes("hoshi") || lower.includes("evelyn") || lower.includes("med")) return "medic";
  return "commander";
}

export function getExpressionFromMorale(morale) {
  if (morale >= 70) return "happy";
  if (morale >= 45) return "neutral";
  return "tired";
}

/**
 * Render inline SVG for an astronaut bust
 * @param {string} rawId - Crew ID or name
 * @param {string|number} moodOrMorale - "happy"|"neutral"|"tired" or numeric morale 0-100
 * @param {number} size - Pixel size (default 80)
 */
export function renderAstronaut(rawId, moodOrMorale = "neutral", size = 80) {
  const id = normalizeCrewId(rawId);
  const mood = typeof moodOrMorale === "number" ? getExpressionFromMorale(moodOrMorale) : moodOrMorale;

  // Character-specific visual attributes
  const charConfig = {
    commander: {
      name: "Elena Rivera",
      skin: "#c68642",
      hair: "#2b1b17",
      hairStyle: "ponytail",
      badge: "#E17A43",
      collar: "#3d4b63"
    },
    scientist: {
      name: "Dr. Tariq Al-Mansoor",
      skin: "#d99b66",
      hair: "#1a1a1a",
      hairStyle: "short_curly",
      badge: "#2980B9",
      collar: "#3d4b63"
    },
    engineer: {
      name: "Marcus Vance",
      skin: "#8d5524",
      hair: "#111111",
      hairStyle: "short_crew",
      badge: "#F39C12",
      collar: "#3d4b63"
    },
    medic: {
      name: "Dr. Hoshi Reed",
      skin: "#f2c197",
      hair: "#4a3525",
      hairStyle: "bob",
      badge: "#27AE60",
      collar: "#3d4b63"
    }
  }[id];

  // Expression mouth and eyes SVG fragments
  let mouthSvg = "";
  let eyesSvg = "";
  let browSvg = "";

  if (mood === "happy") {
    // Big cheerful smile
    mouthSvg = `<path d="M40 68 Q50 78 60 68" stroke="#ffffff" stroke-width="3" fill="#c0392b" stroke-linecap="round"/>`;
    eyesSvg = `
      <circle cx="38" cy="48" r="4" fill="#1a1a1a"/>
      <circle cx="62" cy="48" r="4" fill="#1a1a1a"/>
      <circle cx="39.5" cy="46.5" r="1.5" fill="#ffffff"/>
      <circle cx="63.5" cy="46.5" r="1.5" fill="#ffffff"/>
    `;
    browSvg = `
      <path d="M34 42 Q39 39 44 42" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M56 42 Q61 39 66 42" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    `;
  } else if (mood === "neutral") {
    // Calm straight mouth
    mouthSvg = `<path d="M42 69 Q50 70 58 69" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    eyesSvg = `
      <circle cx="38" cy="48" r="3.5" fill="#1a1a1a"/>
      <circle cx="62" cy="48" r="3.5" fill="#1a1a1a"/>
      <circle cx="39" cy="47" r="1.2" fill="#ffffff"/>
      <circle cx="63" cy="47" r="1.2" fill="#ffffff"/>
    `;
    browSvg = `
      <path d="M34 43 L44 43" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M56 43 L66 43" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>
    `;
  } else {
    // Tired / Upset: droopy eyes, slight frown
    mouthSvg = `<path d="M42 71 Q50 66 58 71" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    eyesSvg = `
      <ellipse cx="38" cy="49" rx="3.5" ry="2" fill="#1a1a1a"/>
      <ellipse cx="62" cy="49" rx="3.5" ry="2" fill="#1a1a1a"/>
      <path d="M34 54 Q38 56 42 54" stroke="#888" stroke-width="1.2" fill="none"/>
      <path d="M58 54 Q62 56 66 54" stroke="#888" stroke-width="1.2" fill="none"/>
    `;
    browSvg = `
      <path d="M34 41 L44 44" stroke="#222" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M56 44 L66 41" stroke="#222" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    `;
  }

  // Hair style SVG
  let hairSvg = "";
  if (charConfig.hairStyle === "ponytail") {
    hairSvg = `
      <path d="M30 46 C28 26 72 26 70 46 C68 34 32 34 30 46 Z" fill="${charConfig.hair}"/>
      <path d="M68 38 C76 42 80 50 78 58 C74 58 72 48 68 38 Z" fill="${charConfig.hair}"/>
    `;
  } else if (charConfig.hairStyle === "short_curly") {
    hairSvg = `
      <path d="M28 46 C26 24 74 24 72 46 C66 32 34 32 28 46 Z" fill="${charConfig.hair}"/>
      <circle cx="32" cy="32" r="5" fill="${charConfig.hair}"/>
      <circle cx="42" cy="27" r="6" fill="${charConfig.hair}"/>
      <circle cx="54" cy="27" r="6" fill="${charConfig.hair}"/>
      <circle cx="66" cy="32" r="5" fill="${charConfig.hair}"/>
    `;
  } else if (charConfig.hairStyle === "short_crew") {
    hairSvg = `
      <path d="M29 45 C28 28 72 28 71 45 C67 36 33 36 29 45 Z" fill="${charConfig.hair}"/>
    `;
  } else {
    // Bob cut
    hairSvg = `
      <path d="M28 48 C26 24 74 24 72 48 C74 58 68 62 68 52 C65 32 35 32 32 52 C32 62 26 58 28 48 Z" fill="${charConfig.hair}"/>
    `;
  }

  return `
    <svg class="astronaut-bust astronaut-${id} mood-${mood}" viewBox="0 0 100 100" width="${size}" height="${size}" aria-label="${charConfig.name} (${mood})">
      <defs>
        <radialGradient id="helmet-back-${id}" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="#141c2b"/>
          <stop offset="100%" stop-color="#0a0e17"/>
        </radialGradient>
      </defs>
      
      <!-- Helmet open collar ring background -->
      <circle cx="50" cy="50" r="44" fill="url(#helmet-back-${id})" stroke="#2a3952" stroke-width="3"/>
      
      <!-- Suit Shoulders & Torso -->
      <path d="M16 96 C20 78 34 74 50 74 C66 74 80 78 84 96 Z" fill="#e2e8f0"/>
      <!-- Suit Collar Ring -->
      <ellipse cx="50" cy="74" rx="26" ry="9" fill="${charConfig.collar}" stroke="#1e293b" stroke-width="2"/>
      <!-- Mission Chest Badge -->
      <circle cx="50" cy="85" r="5" fill="${charConfig.badge}" stroke="#ffffff" stroke-width="1"/>
      <line x1="47" y1="85" x2="53" y2="85" stroke="#ffffff" stroke-width="1.5"/>

      <!-- Neck -->
      <rect x="44" y="60" width="12" height="12" fill="${charConfig.skin}" rx="3"/>

      <!-- Head Base -->
      <ellipse cx="50" cy="50" rx="19" ry="21" fill="${charConfig.skin}"/>

      <!-- Ears -->
      <circle cx="30" cy="51" r="3.5" fill="${charConfig.skin}"/>
      <circle cx="70" cy="51" r="3.5" fill="${charConfig.skin}"/>

      <!-- Hair -->
      ${hairSvg}

      <!-- Eyebrows & Eyes -->
      ${browSvg}
      ${eyesSvg}

      <!-- Nose -->
      <path d="M49 53 L48 58 L52 58" stroke="#a66e3b" stroke-width="1.5" fill="none" stroke-linecap="round"/>

      <!-- Mouth -->
      ${mouthSvg}

      <!-- Helmet outer glass rim highlight -->
      <circle cx="50" cy="50" r="43" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="14 120" opacity="0.6"/>
    </svg>
  `;
}
