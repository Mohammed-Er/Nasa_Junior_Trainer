/**
 * ARES: The Last Signal - Deterministic Event Scheduler
 * 
 * Uses Mulberry32 PRNG and recursive backtracking to allocate
 * all 8 designated events across the 8 event slots (Sols 3, 6, 8, 11, 15, 19, 23, 27).
 */

import { EVENTS_DATA } from "../data/eventsData.js";

/**
 * 32-bit Mulberry32 PRNG
 */
export function createPRNG(seed) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates array shuffle with PRNG
 */
function shuffle(array, prng) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const EVENT_SLOTS = [3, 6, 8, 11, 15, 19, 23, 27];

/**
 * Build Event Schedule using Shuffle + Backtracking
 * Guarantees every single one of the 8 events is placed into an eligible slot without repetition.
 */
export function buildEventSchedule(seed) {
  const prng = createPRNG(seed);
  const eventIds = Object.keys(EVENTS_DATA).filter(id => EVENTS_DATA[id].type === "random");
  
  if (eventIds.length !== 8) {
    console.warn(`[SCHEDULER WARNING] Expected 8 random events, found ${eventIds.length}.`);
  }

  function backtrack(slotIndex, usedEventIds, currentSchedule) {
    if (slotIndex === EVENT_SLOTS.length) {
      return currentSchedule; // All 8 slots successfully placed
    }

    const sol = EVENT_SLOTS[slotIndex];
    // Find unused events eligible for this sol
    const candidates = eventIds.filter(id => {
      if (usedEventIds.has(id)) return false;
      const def = EVENTS_DATA[id];
      return def && def.eligibleSlots && def.eligibleSlots.includes(sol);
    });

    const shuffledCandidates = shuffle(candidates, prng);

    for (const candidateId of shuffledCandidates) {
      usedEventIds.add(candidateId);
      currentSchedule[sol] = candidateId;

      const result = backtrack(slotIndex + 1, usedEventIds, currentSchedule);
      if (result) return result;

      // Backtrack
      usedEventIds.delete(candidateId);
      delete currentSchedule[sol];
    }

    return null; // Dead end, trigger backtracking in caller
  }

  const schedule = backtrack(0, new Set(), {});
  if (!schedule) {
    throw new Error(`[SCHEDULER ERROR] Failed to find valid event schedule for seed ${seed}`);
  }

  return schedule;
}

/**
 * Validator: Verify that buildEventSchedule succeeds across 1,000 consecutive seeds
 */
export function validateEventPoolSolvability(iterations = 1000) {
  for (let i = 0; i < iterations; i++) {
    const testSeed = (i + 10000) >>> 0;
    const schedule = buildEventSchedule(testSeed);
    const assignedEvents = Object.values(schedule);

    if (assignedEvents.length !== 8) {
      throw new Error(`Incomplete schedule on seed ${testSeed}: got ${assignedEvents.length}/8 events.`);
    }

    const uniqueSet = new Set(assignedEvents);
    if (uniqueSet.size !== 8) {
      throw new Error(`Duplicate event detected on seed ${testSeed}`);
    }
  }

  console.log(`[PASS] Event pool 100% solvable across ${iterations} random seeds.`);
  return true;
}
