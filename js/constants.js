/**
 * ARES: The Last Signal - System Constants & Design Thresholds (v3 Engine)
 */

export const GAME_CONSTANTS = {
  SAVE_KEY: "ares_mission_save_v3",
  SAVE_VERSION: 3,
  TOTAL_SOLS: 30,

  // Starting State: 3 outpost meters + crew morale
  STARTING_RESOURCES: {
    power: 100,
    lifeSupport: 100,
    radiationSafety: 80,
    morale: 80
  },

  // Nightly automatic drains
  NIGHT_POWER_DRAIN: 1,
  NIGHT_MORALE_DRIFT: 1,

  // Mood Bands checked on nightly update
  MOOD_BANDS: [
    { below: 15, P: -2, L: -1, name: "exhausted", label: "Exhausted", face: "😫", desc: "Exhausted crew made mistakes." },
    { below: 30, P: -1, L: 0, name: "grumpy", label: "Grumpy", face: "🙁", desc: "Tired crew skipped some chores." },
    { below: 45, P: 0, L: 0, name: "tired", label: "Tired", face: "😐", desc: "Crew is feeling the strain." },
    { below: 70, P: 0, L: 0, name: "okay", label: "Okay", face: "🙂", desc: "Crew is holding up well." },
    { below: 101, P: 0, L: 0, name: "happy", label: "Happy", face: "😄", desc: "Crew spirits are high!" }
  ],

  // Forced crew break trigger
  CREW_BREAK: {
    below: 15,
    cooldown: 6
  },

  // Resource Visual and Mechanical Bands (Closed without gaps)
  // Optimal: 60 - 100%
  // Caution: 20 - 59%
  // Critical: 1 - 19%
  // Depleted: 0%
  BANDS: {
    OPTIMAL_MIN: 60,
    CAUTION_MIN: 20,
    CRITICAL_MAX: 19
  },

  // Ending Evaluation Thresholds (v3 tuned)
  ENDING: {
    beyondMin: 40,
    beyondMoodMin: 40,
    beyondObjectives: 3,
    costlyMin: 20,
    finalPowerAfter: 20,
    finalShortPowerAfter: 15
  },

  // 5 Chapter breakdown with kid-friendly goals
  CHAPTERS: [
    { number: 1, title: "The Last Signal", goal: "Find out what broke.", startSol: 1, endSol: 5 },
    { number: 2, title: "Alone on Mars", goal: "Build the parts.", startSol: 6, endSol: 12 },
    { number: 3, title: "The Breaking Point", goal: "Survive the solar storm.", startSol: 13, endSol: 18 },
    { number: 4, title: "The Final Attempt", goal: "Turn the dish toward Earth.", startSol: 19, endSol: 25 },
    { number: 5, title: "The Last Five Sols", goal: "Send the signal home.", startSol: 26, endSol: 30 }
  ],

  // 5-step antenna repair tracker
  ANTENNA_STEPS: [
    { step: 1, label: "Find damage", sol: 5, icon: "🔍", desc: "A bent motor arm and a cracked cable." },
    { step: 2, label: "Build parts", sol: 12, icon: "🔧", desc: "Marcus builds parts from the rover's spare motor." },
    { step: 3, label: "Test motor", sol: 18, icon: "⚙️", desc: "Motor arms rotate smoothly after the solar storm." },
    { step: 4, label: "Turn dish", sol: 21, icon: "📡", desc: "Align dish with Earth's orbital coordinate." },
    { step: 5, label: "Send signal", sol: 30, icon: "📶", desc: "Transmit final carrier wave to NASA Deep Space Network." }
  ]
};

/**
 * Helper to get mood band info from morale value
 */
export function getMoodInfo(morale) {
  if (morale < 15) return GAME_CONSTANTS.MOOD_BANDS[0];
  if (morale < 30) return GAME_CONSTANTS.MOOD_BANDS[1];
  if (morale < 45) return GAME_CONSTANTS.MOOD_BANDS[2];
  if (morale < 70) return GAME_CONSTANTS.MOOD_BANDS[3];
  return GAME_CONSTANTS.MOOD_BANDS[4];
}
