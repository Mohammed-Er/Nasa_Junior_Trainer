/**
 * ARES: The Last Signal - Central Game State Manager
 * 
 * Manages mutable state, initialization factory, seed extraction,
 * and version-safe localStorage persistence.
 */

import { GAME_CONSTANTS } from "./constants.js";
import { buildEventSchedule } from "./eventScheduler.js";
import { COMM_MESSAGES } from "../data/commData.js";

/**
 * Extract seed from URL query (?seed=12345) or generate a clean 32-bit integer
 */
export function getInitialSeed() {
  if (typeof window !== "undefined" && window.location) {
    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get("seed");
    if (seedParam && !isNaN(parseInt(seedParam, 10))) {
      return parseInt(seedParam, 10);
    }
  }
  return (Math.random() * 1000000) >>> 0;
}

/**
 * Factory: Create fresh initial game state
 */
export function createInitialState(customSeed = null) {
  const seed = customSeed !== null ? customSeed : getInitialSeed();

  return {
    saveVersion: GAME_CONSTANTS.SAVE_VERSION,
    seed: seed,

    // Progression
    sol: 1,
    chapter: 1,
    status: "briefing",               // "briefing" | "active" | "critical_grace" | "interrupted" | "completed"
    currentScreen: "welcome",
    currentTab: "mission",

    // Guards & Recovery
    awaitingDecision: false,          // Persistent guard: true when decision card is active
    graceUsed: false,                 // True if 1-time emergency triage has been spent
    endingReason: null,               // Reason text for campaign ending or abort

    // The Exactly Three Core Indicators (0 - 100%)
    resources: {
      power: GAME_CONSTANTS.STARTING_RESOURCES.power,
      lifeSupport: GAME_CONSTANTS.STARTING_RESOURCES.lifeSupport,
      radiationSafety: GAME_CONSTANTS.STARTING_RESOURCES.radiationSafety
    },

    // Communication Subsystem Status
    comm: {
      status: "blackout",             // "blackout" | "intermittent" | "restored"
      nextWindowSol: 4                // Sol when next Earth transmission window opens
    },

    // Tracked Mission Objectives (All start false; >= 3 required for Beyond the Silence)
    objectives: {
      commsRestored: false,
      antennaAligned: false,
      researchSamples: false,
      panelsUnderstood: false,
      shelterProtocolsMaintained: false
    },

    // Decision Memory Flags
    flags: {},

    // Scheduled Events Map: Sol -> Event ID (Deterministic seeded allocation)
    eventSchedule: buildEventSchedule(seed),

    // Active Delayed & Ongoing Mechanics
    pendingEffects: [],               // Delayed effects with triggerSol <= 29
    modifiers: [],                    // Ongoing per-sol modifiers

    // Communication Queues
    commQueue: COMM_MESSAGES.map((m) => ({ ...m })),
    commHistory: [],
    latestComm: null,

    // Audits & Outcome Snapshot
    recentChanges: [
      {
        sol: 1,
        cause: "Outpost Baseline Diagnostics",
        deltas: { power: 0, lifeSupport: 0, radiationSafety: 0 }
      }
    ],
    logHistory: [],
    lastResolution: null,             // Snapshot of active ResolutionResult for refresh recovery
    overnightReport: null             // Summary of overnight changes from advanceSol
  };
}

/**
 * Save Game State to localStorage with error handling
 */
export function saveGameState(state) {
  if (!state) return false;
  try {
    if (typeof localStorage === "undefined") return false;
    state.saveVersion = GAME_CONSTANTS.SAVE_VERSION;
    const serialized = JSON.stringify(state);
    localStorage.setItem(GAME_CONSTANTS.SAVE_KEY, serialized);
    return true;
  } catch (err) {
    console.error("[SAVE ERROR] Failed to serialize game state to localStorage:", err);
    return false;
  }
}

/**
 * Load Game State from localStorage with version validation
 */
export function loadGameState() {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(GAME_CONSTANTS.SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.saveVersion !== GAME_CONSTANTS.SAVE_VERSION) {
      console.warn("[SAVE VERSION MISMATCH] Discarding outdated save state.");
      localStorage.removeItem(GAME_CONSTANTS.SAVE_KEY);
      return null;
    }

    return parsed;
  } catch (err) {
    console.error("[LOAD ERROR] Failed to parse saved game state:", err);
    localStorage.removeItem(GAME_CONSTANTS.SAVE_KEY);
    return null;
  }
}

/**
 * Clear Saved Game from localStorage
 */
export function clearSavedGame() {
  try {
    localStorage.removeItem(GAME_CONSTANTS.SAVE_KEY);
    return true;
  } catch (err) {
    console.error("[STORAGE ERROR] Failed to clear game state:", err);
    return false;
  }
}
