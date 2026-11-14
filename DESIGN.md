# ARES: The Last Signal — Technical Design Document (DESIGN.md)

This document formalizes the mechanical rules, formulas, schemas, and state algorithms required before implementing Stages 2–10.

---

## 1. Constants & Core Thresholds (`constants.js`)

To eliminate undefined gaps in indicator bands:

```javascript
export const GAME_CONSTANTS = {
  SAVE_KEY: "ares_mission_save_v1",
  SAVE_VERSION: 1,
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
  // Depleted: 0% (triggers grace triage or abort)
  BANDS: {
    OPTIMAL_MIN: 60,
    CAUTION_MIN: 20,
    CRITICAL_MAX: 19
  },

  // Ending Evaluation Thresholds
  ENDING: {
    BEYOND_SILENCE_RESOURCE_MIN: 60,
    BEYOND_SILENCE_OBJECTIVES_MIN: 3,
    COSTLY_SUCCESS_RESOURCE_MIN: 20 // If any resource is <= 0, mission fails
  }
};
```

---

## 2. Factory: `createInitialState(seed)`

Seed initialization supports URL override (`?seed=12345`). PRNG is **only** used at campaign generation to build `eventSchedule`; it is **never** invoked mid-gameplay.

```javascript
export function createInitialState(seed = Math.floor(Math.random() * 1000000)) {
  return {
    saveVersion: GAME_CONSTANTS.SAVE_VERSION,
    seed: seed,
    sol: 1,
    chapter: 1,
    status: "briefing",               // "briefing" | "active" | "critical_grace" | "interrupted" | "completed"
    graceUsed: false,                 // Tracks whether the 1-time emergency recovery path was spent
    currentScreen: "welcome",
    currentTab: "mission",
    awaitingDecision: false,
    endingReason: null,               // Explanatory code for game completion or abort
    
    resources: { ...GAME_CONSTANTS.STARTING_RESOURCES },
    
    // Communication Subsystem Status
    comms: {
      status: "blackout",             // "blackout" | "intermittent" | "restored"
      nextWindowSol: 4                // Sol when next Earth transmission window opens
    },

    // Tracked Mission Objectives (All start false; >= 3 required for Beyond the Silence)
    objectives: {
      commsRestored: false,           // Main goal: high-gain alignment & transmitter sync
      antennaAligned: false,          // Ch 4 relay dish calibration completed
      researchSamples: 0,             // Counts valid Martian surface/frost analysis
      panelsUnderstood: false,        // Solar array dust dynamics understood via inspection
      shelterProtocolsMaintained: true // True if radiation shelter protocol was respected
    },

    flags: {},                        // Choice memory flags
    eventSchedule: {},                // Sol -> Event ID mapping
    pendingEffects: [],               // Deferred effects capped at triggerSol <= 29
    modifiers: [],                    // Ongoing modifiers per sol
    recentChanges: [],
    commQueue: [],
    commHistory: [],
    logHistory: [],
    lastResolution: null
  };
}
```

---

## 3. Event Scheduling Algorithm (`js/eventScheduler.js`)

One `buildEventSchedule(seed)` function using shuffle with recursive backtracking to guarantee 100% solvability across all 8 slots (`[3, 6, 8, 11, 15, 19, 23, 27]`).

- Removed the `first_query_sent` prerequisite on Event 2 (Ghost Message) so it can trigger whenever eligible (Ch 4 or 5).
- Solvability validation script calls this exact function across 1,000 seeds.

---

## 4. Radiation Safety Mechanics

1. **Strict Code Error:**  
   If an event or action attempts to modify `radiationSafety` without `event.radiationAffecting === true`, `gameEngine` throws a `Console Error` during development, blocking illegal stealth changes.
2. **Real Downstream Impact:**  
   If `radiationSafety < 50%`, outdoor EVA tasks (such as solar array manual wiping or antenna climbing) carry an additional Life Support/Power penalty due to astronaut exposure time constraints.
3. **Sol 14 (Ch 3 SPE Crisis) Rebalanced Options:**
   - **Option A (Water/Regolith Storm Shelter):** Crew enters the heavy water-jacket/regolith shelter. Safe from radiation, nonessential systems power down.  
     *Deltas: Power -10, Life Support -5, Radiation Safety +10.*
   - **Option B (Deploy Habitat Aux Shielding & Active Filtration):** Heavy power drain to run high-volume magnetic particulate scrubbers.  
     *Deltas: Power -25, Life Support +5, Radiation Safety +5.*
   - **Option C (Stay in Main Habitat to Finish Power Repairs):** Protects the power grid, but crew absorbs moderate ambient dosage.  
     *Deltas: Power +10, Life Support 0, Radiation Safety -25.* (Flags `shelterProtocolsMaintained = false`).
4. **Second Radiation Event (Sol 22 - Pre-Antenna Shielding Inspection):**  
   Player must choose between spending an extra sol reinforcing the airlock regolith shielding (+15 Rad Safety, -10 Power) or prioritizing communication electronics.

---

## 5. Unified Resource Transition Function (`gameEngine.js`)

Every resource modification—whether from a player choice, a `pendingEffect`, an ongoing `modifier`, or emergency triage—funnels through **one single function**:

```javascript
export function applyResourceChanges(state, rawDeltas, causeLabel, sourceEvent = null) {
  if (rawDeltas.radiationSafety && (!sourceEvent || !sourceEvent.radiationAffecting)) {
    throw new Error(`[DEV ERROR] Disallowed radiation delta from cause: ${causeLabel}`);
  }

  const before = { ...state.resources };
  const after = {
    power: Math.max(0, Math.min(100, before.power + (rawDeltas.power || 0))),
    lifeSupport: Math.max(0, Math.min(100, before.lifeSupport + (rawDeltas.lifeSupport || 0))),
    radiationSafety: Math.max(0, Math.min(100, before.radiationSafety + (rawDeltas.radiationSafety || 0)))
  };

  const appliedDeltas = {
    power: after.power - before.power,
    lifeSupport: after.lifeSupport - before.lifeSupport,
    radiationSafety: after.radiationSafety - before.radiationSafety
  };

  state.resources = after;
  state.recentChanges.unshift({
    sol: state.sol,
    cause: causeLabel,
    deltas: appliedDeltas
  });

  return { before, after, appliedDeltas };
}
```

### Overnight Sol Advance Sequence
When `advanceSol()` runs:
1. `sol = sol + 1`.
2. Apply ongoing `modifiers` (e.g., degraded filters).
3. Apply matching `pendingEffects` where `triggerSol === state.sol`.
4. Deliver queued communication messages where `deliverOnSol === state.sol`.
5. Generate an **Overnight Status Report** summarizing changes for the player.
6. Check for Sol 30 ending or resource depletion grace triggers.

---

## 6. Endings Decision Logic

Evaluated strictly on Sol 30 (or upon critical abort):
```javascript
export function evaluateEnding(state) {
  const { power, lifeSupport, radiationSafety } = state.resources;
  const anyDepleted = power <= 0 || lifeSupport <= 0 || radiationSafety <= 0;

  if (state.status === "interrupted" || anyDepleted) {
    return {
      endingId: "mission_interrupted",
      title: "Mission Interrupted",
      reason: state.endingReason || "Outpost core systems depleted beyond safe operational limits."
    };
  }

  if (!state.objectives.commsRestored) {
    return {
      endingId: "mission_interrupted",
      title: "Mission Interrupted",
      reason: "Sol 30 communication window closed before high-gain link could be re-established."
    };
  }

  const allOptimal = (power >= 60 && lifeSupport >= 60 && radiationSafety >= 60);
  const completedCount = Object.values(state.objectives).filter(v => v === true || v > 0).length;

  if (allOptimal && completedCount >= GAME_CONSTANTS.ENDING.BEYOND_SILENCE_OBJECTIVES_MIN) {
    return {
      endingId: "beyond_the_silence",
      title: "Beyond the Silence",
      reason: "ARES-1 maintained full system integrity, restored communication with Earth, and completed primary Mars science goals."
    };
  }

  return {
    endingId: "a_costly_success",
    title: "A Costly Success",
    reason: "ARES-1 successfully restored communication with Earth, but outpost systems suffered strain and research priorities were sacrificed."
  };
}
```

---

## 7. Event 1 (Solar Panel Miracle) Complete Specification

```javascript
{
  id: "evt_solar_dust",
  title: "The Mysterious Solar Panel Miracle",
  eligibleSlots: [3],
  radiationAffecting: false,
  intro: "A localized dust vortex swept across the array field. Sensors report an unexpected surge in power output.",
  choices: [
    {
      id: "choice_recharge",
      label: "Charge Reserve Battery Banks",
      preview: "Channel all incoming power surge into energy reserves.",
      tradeoff: "High power boost now, but leaves the cause unverified.",
      deltas: { power: +15, lifeSupport: 0, radiationSafety: 0 },
      flags: ["batteries_charged"],
      pendingEffects: [],
      outcomeText: "Storage capacitors are fully saturated. The outpost power grid has a comfortable safety margin.",
      crewReaction: { speaker: "Marcus Vance", role: "Mission Engineer", text: "Batteries are at maximum density. That gives us breathing room!" },
      science: {
        text: "In March 2005, NASA's Spirit rover experienced sudden power jumps when Martian dust devils unexpectedly swept accumulated dust off its solar arrays.",
        sourceId: "mer-spirit-dust-devil",
        typeTag: "real_observation"
      }
    },
    {
      id: "choice_preserve",
      label: "Preserve System Stability & Regulate Voltage",
      preview: "Carefully regulate the surge to avoid stressing aging circuit breakers.",
      tradeoff: "Moderate power gain (+5), but completely eliminates breaker wear risk.",
      deltas: { power: +5, lifeSupport: +5, radiationSafety: 0 },
      flags: ["circuits_preserved"],
      pendingEffects: [],
      outcomeText: "Voltage regulators smoothly conditioned the surge. Power efficiency improved across habitat subsystems.",
      crewReaction: { speaker: "Commander Rivera", role: "Outpost Commander", text: "Disciplined engineering keeps equipment running longer on Mars." },
      science: {
        text: "NASA spacecraft power distribution units use specialized regulators to prevent high-voltage spikes from damaging sensitive avionics.",
        sourceId: "nasa-mars-comm-delay",
        typeTag: "scientific_explanation"
      }
    },
    {
      id: "choice_inspect",
      label: "Inspect Array Mechanisms & Dust Dispersion",
      preview: "Deploy cameras and telemetry diagnostics to analyze panel surfaces.",
      tradeoff: "Small power expenditure (-5) now, but uncovers actionable dust dynamics for Chapter 3.",
      deltas: { power: -5, lifeSupport: 0, radiationSafety: 0 },
      flags: ["panels_inspected"],
      // Mechanical Payoff: Sets objective and prevents severe power degradation during Sol 15 dust event
      pendingEffects: [],
      outcomeText: "Diagnostic footage confirms wind sheer removed fine particulate without scratching the anti-reflective coating.",
      crewReaction: { speaker: "Dr. Al-Mansoor", role: "Mission Scientist", text: "Invaluable data! We can calibrate our solar tilt angle to encourage natural wind cleaning." },
      science: {
        text: "Martian dust particles are extremely fine and cling electrostatically. Understanding how natural winds dislodge them helps engineers design self-cleaning surfaces.",
        sourceId: "perseverance-dust-hazards",
        typeTag: "scientific_explanation"
      }
    }
  ]
}
```

---

## 8. Dev Tools Specification (`js/devTools.js`)

Gated strictly behind `window.location.search.includes('dev=1')`:
- Sol jump dropdown (1 to 30)
- Resource setters (+10 / -10 buttons)
- Event trigger dropdown (forces any of the 8 events immediately)
- Objectives toggles (test all 3 endings instantly)
- Headless simulation runner: `runSimulation(path)` to verify balance without manual clicks.
