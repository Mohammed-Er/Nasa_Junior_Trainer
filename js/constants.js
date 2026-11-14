/**
 * ARES: The Last Signal - System Constants & Design Thresholds
 */

export const GAME_CONSTANTS = {
  SAVE_KEY: "ares_mission_save_v2",
  SAVE_VERSION: 2,
  TOTAL_SOLS: 30,

  STARTING_RESOURCES: {
    power: 85,
    lifeSupport: 85,
    radiationSafety: 80
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

  // Ending Evaluation Thresholds
  ENDING: {
    BEYOND_SILENCE_RESOURCE_MIN: 60,
    BEYOND_SILENCE_OBJECTIVES_MIN: 3,
    COSTLY_SUCCESS_RESOURCE_MIN: 20
  },

  CHAPTERS: [
    { number: 1, title: "The Last Signal", startSol: 1, endSol: 5 },
    { number: 2, title: "Alone on Mars", startSol: 6, endSol: 12 },
    { number: 3, title: "The Breaking Point", startSol: 13, endSol: 18 },
    { number: 4, title: "The Final Attempt", startSol: 19, endSol: 25 },
    { number: 5, title: "The Last Five Sols", startSol: 26, endSol: 30 }
  ]
};
