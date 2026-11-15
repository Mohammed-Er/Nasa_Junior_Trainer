/**
 * ARES: The Last Signal - Headless Balance Simulator (v3)
 * 
 * Runs full 30-sol campaign playthroughs using the REAL engine logic
 * (createInitialState, serveMeal, applyChoice, advanceSol, evaluateMissionEnding)
 * across 400 seeds to mathematically verify all balance targets.
 */

import { createInitialState } from "./gameState.js";
import { applyChoice, advanceSol, serveMeal, evaluateMissionEnding, applyEmergencyTriage, EMERGENCY_TRIAGE_OPTIONS } from "./gameEngine.js";
import { CAMPAIGN_BEATS } from "../data/campaign.js";
import { EVENTS_DATA } from "../data/eventsData.js";
import { GAME_CONSTANTS } from "./constants.js";

// Deterministic PRNG for simulation policies
function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert choice deltas to vector [P, L, R, M]
function getChoiceDeltas(choice) {
  const d = choice.deltas || {};
  return [d.power || 0, d.lifeSupport || 0, d.radiationSafety || 0, d.morale || 0];
}

// Score a choice in real engine format
function scoreChoice(choice, state) {
  const [p, l, r, m] = getChoiceDeltas(choice);
  const wP = 1 + (100 - state.resources.power) / 25;
  const wL = 1 + (100 - state.resources.lifeSupport) / 25;
  const wR = 1 + (100 - state.resources.radiationSafety) / 25;

  let totalScore = p * wP + l * wL + r * wR + m * 0.6;

  // Pending effects
  if (choice.pendingEffects && choice.pendingEffects.length > 0) {
    for (const pe of choice.pendingEffects) {
      const ped = pe.deltas || {};
      totalScore += (ped.power || 0) * wP + (ped.lifeSupport || 0) * wL + (ped.radiationSafety || 0) * wR;
    }
  }

  // Modifiers
  if (choice.modifiers && choice.modifiers.length > 0) {
    for (const mod of choice.modifiers) {
      const len = mod.lengthInSols || 5;
      totalScore += mod.perSol * len * 0.8;
    }
  }

  // Objectives & Alignment
  if (choice.objectiveChanges) {
    if (choice.objectiveChanges.antennaAligned || choice.align) totalScore += 40;
    if (choice.objectiveChanges.panelsUnderstood) totalScore += 3;
    if (choice.objectiveChanges.researchSamples) totalScore += 3;
    if (choice.objectiveChanges.shelterProtocolsMaintained) totalScore += 3;
  }

  return totalScore;
}

export const RATION_POLICIES = {
  smart: (state) => (state.morale < 62 ? "full" : "light"),
  careful: (state) => (state.morale < 48 ? "full" : "light"),
  alwaysFull: () => "full",
  alwaysLight: () => "light",
  alwaysEmergency: () => "emergency",
  random: (state, prng) => {
    const opts = ["full", "light", "emergency"];
    return opts[Math.floor(prng() * 3)];
  }
};

export const EVENT_POLICIES = {
  smart: (eventData, state) => {
    return [...eventData.choices].sort((a, b) => scoreChoice(b, state) - scoreChoice(a, state))[0];
  },
  greedy: (eventData) => {
    return [...eventData.choices].sort((a, b) => {
      const da = getChoiceDeltas(a);
      const db = getChoiceDeltas(b);
      return (db[0] + db[1] + db[2]) - (da[0] + da[1] + da[2]);
    })[0];
  },
  ignoreAntenna: (eventData, state) => {
    if (eventData.id === "evt_antenna_alignment") {
      const deferChoice = eventData.choices.find(c => c.id === "defer");
      if (deferChoice) return deferChoice;
    }
    return EVENT_POLICIES.smart(eventData, state);
  },
  random: (eventData, state, prng) => {
    return eventData.choices[Math.floor(prng() * eventData.choices.length)];
  }
};

/**
 * Headless Simulation Runner for a chosen Strategy Profile
 */
export function simulatePlaythrough(profileName, seed = 12345) {
  const state = createInitialState(seed);
  state.status = "active";
  const prng = mulberry32(seed);

  // Policy lookup
  let rationPolicy = RATION_POLICIES.smart;
  let eventPolicy = EVENT_POLICIES.smart;
  let mistakeProbability = 0;

  if (profileName === "thoughtful") {
    rationPolicy = RATION_POLICIES.smart;
    eventPolicy = EVENT_POLICIES.smart;
  } else if (profileName === "mostlyThoughtful") {
    rationPolicy = RATION_POLICIES.smart;
    eventPolicy = EVENT_POLICIES.smart;
    mistakeProbability = 0.20;
  } else if (profileName === "alwaysFull") {
    rationPolicy = RATION_POLICIES.alwaysFull;
    eventPolicy = EVENT_POLICIES.smart;
  } else if (profileName === "alwaysLight") {
    rationPolicy = RATION_POLICIES.alwaysLight;
    eventPolicy = EVENT_POLICIES.smart;
  } else if (profileName === "alwaysEmergency") {
    rationPolicy = RATION_POLICIES.alwaysEmergency;
    eventPolicy = EVENT_POLICIES.smart;
  } else if (profileName === "ignoreAntenna") {
    rationPolicy = RATION_POLICIES.smart;
    eventPolicy = EVENT_POLICIES.ignoreAntenna;
  } else if (profileName === "random") {
    rationPolicy = (s) => RATION_POLICIES.random(s, prng);
    eventPolicy = (ev, s) => EVENT_POLICIES.random(ev, s, prng);
  }

  while (state.sol <= 30 && state.status !== "interrupted") {
    const currentSol = state.sol;

    // Morning Rations (Sols 1-29)
    if (currentSol <= 29 && !state.supplyDone) {
      const chosenRation = rationPolicy(state, prng);
      serveMeal(state, chosenRation);
    }

    // Check forced crew break event (when morale < 15 and cooldown elapsed)
    if (state.morale < GAME_CONSTANTS.CREW_BREAK.below && currentSol - state.crewBreakLastSol >= GAME_CONSTANTS.CREW_BREAK.cooldown && currentSol < 30) {
      state.crewBreakLastSol = currentSol;
      state.awaitingDecision = true;
      const breakEvent = EVENTS_DATA["evt_crew_break"];
      // Choose movie night or team talk to restore morale
      const breakChoice = breakEvent.choices.find(c => c.id === "choice_movie_night") || breakEvent.choices[0];
      applyChoice(state, breakChoice, breakEvent);
    }

    // Daily Beat & Event Check
    const beat = CAMPAIGN_BEATS[currentSol];
    if (beat && beat.hasDecision && !state.awaitingDecision) {
      state.awaitingDecision = true;

      let eventId = beat.fixedEventId;
      if (!eventId && beat.type === "random_slot") {
        eventId = state.eventSchedule ? state.eventSchedule[currentSol] : null;
      }
      const eventData = EVENTS_DATA[eventId];

      if (eventData && eventData.choices && eventData.choices.length > 0) {
        let pickedChoice = null;
        if (mistakeProbability > 0 && prng() < mistakeProbability) {
          pickedChoice = EVENT_POLICIES.random(eventData, state, prng);
        } else {
          pickedChoice = eventPolicy(eventData, state, prng);
        }

        if (!pickedChoice) pickedChoice = eventData.choices[0];
        applyChoice(state, pickedChoice, eventData);
      }
    }

    // Emergency Grace Handling
    if (state.status === "critical_grace" && !state.graceUsed) {
      // Pick best triage
      applyEmergencyTriage(state, "triage_emergency_o2");
    }

    // Sol 30 Climax check
    if (currentSol === 30) {
      break;
    }

    advanceSol(state);
  }

  const ending = evaluateMissionEnding(state);
  return {
    ending,
    state,
    completedObjectives: Object.values(state.objectives).filter(v => v === true).length
  };
}

/**
 * Run full 400-seed suite and display acceptance table
 */
export function runSuitAnalysis() {
  const profiles = [
    { id: "thoughtful", name: "Thoughtful (Smart rations + smart events)" },
    { id: "mostlyThoughtful", name: "Mostly thoughtful (20% random mistakes)" },
    { id: "alwaysFull", name: "Always FULL rations + smart events" },
    { id: "alwaysLight", name: "Always HALF rations + smart events" },
    { id: "alwaysEmergency", name: "Always SNACK-ONLY + smart events" },
    { id: "ignoreAntenna", name: "Ignores the antenna + smart events" },
    { id: "random", name: "Fully random rations + random events" }
  ];

  const N = 400;
  const resultsTable = [];

  for (const prof of profiles) {
    const tally = { 1: 0, 2: 0, 3: 0 };
    let sums = { power: 0, lifeSupport: 0, radiationSafety: 0, morale: 0 };

    for (let seed = 1; seed <= N; seed++) {
      const sim = simulatePlaythrough(prof.id, seed);
      tally[sim.ending.code]++;
      sums.power += sim.state.resources.power;
      sums.lifeSupport += sim.state.resources.lifeSupport;
      sums.radiationSafety += sim.state.resources.radiationSafety;
      sums.morale += (sim.state.morale !== undefined ? sim.state.morale : 80);
    }

    resultsTable.push({
      "Profile": prof.name,
      "Ending 1 (Beyond)": ((tally[1] / N) * 100).toFixed(0) + "%",
      "Ending 2 (Costly)": ((tally[2] / N) * 100).toFixed(0) + "%",
      "Ending 3 (Interrupted)": ((tally[3] / N) * 100).toFixed(0) + "%",
      "Avg Power": (sums.power / N).toFixed(0),
      "Avg LS": (sums.lifeSupport / N).toFixed(0),
      "Avg Rad": (sums.radiationSafety / N).toFixed(0),
      "Avg Mood": (sums.morale / N).toFixed(0)
    });
  }

  console.table(resultsTable);
  return resultsTable;
}

// Auto-run if executed directly via Node
if (typeof process !== "undefined" && process.argv && process.argv[1] && process.argv[1].includes("balanceSimulator")) {
  runSuitAnalysis();
}
