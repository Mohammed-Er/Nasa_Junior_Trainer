/**
 * ARES: The Last Signal - Central Game Engine (v3)
 * 
 * Implements:
 * - Unified applyResourceChanges with strict clamping and post-clamp deltas
 * - Radiation allow-list guard throwing developer errors
 * - Morale tracking (0-100) integrated into applyResourceChanges
 * - Daily meal serving (serveMeal) guarded by supplyDone
 * - Choice resolver with conditional effects and relative delayed effects
 * - Sol 30 dual-choice climax (full vs short transmission)
 * - advanceSol with nightly power drain, morale drift, mood penalties, and callbacks
 * - Endings evaluated against v3 thresholds with crew spirit reflections
 */

import { GAME_CONSTANTS, getMoodInfo } from "./constants.js";
import { saveGameState } from "./gameState.js";
import { RATIONS } from "../data/rationsData.js";

/**
 * Unified Resource & Crew State Transition Function
 * ALL changes to resources (power, lifeSupport, radiationSafety) and morale MUST flow through here.
 */
export function applyResourceChanges(state, rawDeltas, causeLabel, sourceEvent = null) {
  if (!state || !rawDeltas) {
    throw new Error("[ENGINE ERROR] applyResourceChanges requires valid state and deltas objects.");
  }

  // Developer Guard: Disallow radiation changes unless explicitly allowed
  if (rawDeltas.radiationSafety && (!sourceEvent || !sourceEvent.radiationAffecting)) {
    throw new Error(
      `[DEV ERROR] Unauthorized radiation delta (${rawDeltas.radiationSafety}%) from cause: "${causeLabel}". ` +
      `sourceEvent must have radiationAffecting: true.`
    );
  }

  const before = {
    power: state.resources.power,
    lifeSupport: state.resources.lifeSupport,
    radiationSafety: state.resources.radiationSafety,
    morale: state.morale !== undefined ? state.morale : 80
  };

  // Calculate target clamped outpost meters (0 to 100)
  const after = {
    power: Math.max(0, Math.min(100, before.power + (rawDeltas.power || 0))),
    lifeSupport: Math.max(0, Math.min(100, before.lifeSupport + (rawDeltas.lifeSupport || 0))),
    radiationSafety: Math.max(0, Math.min(100, before.radiationSafety + (rawDeltas.radiationSafety || 0)))
  };

  // Calculate clamped crew morale (0 to 100)
  let afterMorale = before.morale;
  if (typeof rawDeltas.morale === "number") {
    afterMorale = Math.max(0, Math.min(100, before.morale + rawDeltas.morale));
  }

  // TRUE applied post-clamp deltas
  const appliedDeltas = {
    power: after.power - before.power,
    lifeSupport: after.lifeSupport - before.lifeSupport,
    radiationSafety: after.radiationSafety - before.radiationSafety,
    morale: afterMorale - before.morale
  };

  // Mutate state
  state.resources = after;
  state.morale = afterMorale;

  // Track lowest stats for reflection and telemetry analysis
  if (state.stats) {
    state.stats.lowest.power = Math.min(state.stats.lowest.power, state.resources.power);
    state.stats.lowest.lifeSupport = Math.min(state.stats.lowest.lifeSupport, state.resources.lifeSupport);
    state.stats.lowest.radiationSafety = Math.min(state.stats.lowest.radiationSafety, state.resources.radiationSafety);
    state.stats.lowestMorale = Math.min(state.stats.lowestMorale, state.morale);
  }

  // Append to recent changes audit feed
  state.recentChanges.unshift({
    sol: state.sol,
    cause: causeLabel,
    deltas: appliedDeltas
  });

  return {
    before,
    after: { ...after, morale: afterMorale },
    appliedDeltas
  };
}

/**
 * Serve Daily Morning Rations to the Whole Crew (Sols 1-29)
 */
export function serveMeal(state, rationId) {
  if (state.supplyDone) {
    console.warn("[ENGINE WARNING] Morning rations already served for this sol.");
    return null;
  }
  if (state.sol > 29) {
    console.warn("[ENGINE WARNING] Final sol 30 is transmission day; no morning meal served.");
    return null;
  }

  const ration = RATIONS.find((r) => r.id === rationId);
  if (!ration) {
    throw new Error(`[ENGINE ERROR] Unknown ration id: "${rationId}"`);
  }

  // Apply resource & morale deltas through choke point
  const resChanges = applyResourceChanges(
    state,
    ration.deltas,
    `Morning Rations: ${ration.label}`
  );

  // Update history & stats
  state.rationHistory.push({
    sol: state.sol,
    choice: rationId
  });

  if (state.stats) {
    if (rationId === "full") state.stats.fullDays++;
    else if (rationId === "light") state.stats.lightDays++;
    else if (rationId === "emergency") state.stats.emergencyDays++;
  }

  // Lock meal serving for this sol
  state.supplyDone = true;

  saveGameState(state);

  return {
    ration,
    resChanges
  };
}

/**
 * Apply Player Decision to Game State
 */
export function applyChoice(state, choice, eventData) {
  if (!state.awaitingDecision) {
    console.warn("[ENGINE WARNING] Attempted to apply choice while awaitingDecision is false. Action ignored.");
    return null;
  }

  // Evaluate conditional effects
  let effectiveDeltas = { ...(choice.deltas || {}) };
  let conditionalNotes = [];

  if (choice.conditionalEffects && choice.conditionalEffects.length > 0) {
    for (const ce of choice.conditionalEffects) {
      let isMet = true;
      if (ce.if) {
        for (const [key, cond] of Object.entries(ce.if)) {
          const currentVal = key === "morale" ? state.morale : state.resources[key];
          if (cond.below !== undefined && !(currentVal < cond.below)) isMet = false;
          if (cond.atLeast !== undefined && !(currentVal >= cond.atLeast)) isMet = false;
        }
      }
      if (isMet) {
        if (ce.deltas) {
          for (const [dk, dv] of Object.entries(ce.deltas)) {
            effectiveDeltas[dk] = (effectiveDeltas[dk] || 0) + dv;
          }
        }
        if (ce.extraText) {
          conditionalNotes.push(ce.extraText);
        }
      }
    }
  }

  // 1. Apply immediate resource & morale deltas through the single choke point
  const resChanges = applyResourceChanges(state, effectiveDeltas, choice.label, eventData);

  // 2. Set flags
  if (choice.flags && choice.flags.length > 0) {
    choice.flags.forEach((f) => {
      state.flags[f] = true;
    });
  }

  // 3. Queue pending effects (supporting relative triggerInSols and legacy triggerSol)
  if (choice.pendingEffects && choice.pendingEffects.length > 0) {
    for (const pe of choice.pendingEffects) {
      let targetSol;
      if (typeof pe.triggerInSols === "number") {
        targetSol = Math.min(29, state.sol + pe.triggerInSols);
      } else if (typeof pe.triggerSol === "number") {
        targetSol = Math.min(29, pe.triggerSol);
      } else {
        targetSol = Math.min(29, state.sol + 2);
      }

      state.pendingEffects.push({
        ...pe,
        sourceSol: state.sol,
        triggerSol: targetSol,
        callbackText: pe.callbackText || pe.logText || `Consequence of decision from Sol ${state.sol}`
      });
    }
  }

  // 4. Add ongoing modifiers (supporting lengthInSols)
  if (choice.modifiers && choice.modifiers.length > 0) {
    for (const mod of choice.modifiers) {
      const expiresSol = typeof mod.lengthInSols === "number" ? state.sol + mod.lengthInSols : mod.expiresSol;
      state.modifiers.push({
        ...mod,
        expiresSol
      });
    }
  }

  // 5. Remove any cancelled modifiers
  if (choice.removesModifiers && choice.removesModifiers.length > 0) {
    state.modifiers = state.modifiers.filter((m) => !choice.removesModifiers.includes(m.id));
  }

  // 6. Update tracked objectives
  if (choice.objectiveChanges) {
    Object.assign(state.objectives, choice.objectiveChanges);
  }

  // Antenna alignment flag handling
  if (choice.align || (choice.objectiveChanges && choice.objectiveChanges.antennaAligned)) {
    state.objectives.antennaAligned = true;
    state.comm.status = "intermittent";
    state.antennaStep = Math.max(state.antennaStep || 0, 4);
  }

  // Sol 30 Climax: Final Transmission Evaluation
  if (state.sol === 30 && eventData.id === "evt_final_transmission") {
    const isShort = choice.id === "choice_transmit_short" || choice.shortMessage;
    const requiredPower = isShort ? GAME_CONSTANTS.ENDING.finalShortPowerAfter : GAME_CONSTANTS.ENDING.finalPowerAfter;

    if (state.objectives.antennaAligned && state.resources.power >= requiredPower) {
      state.objectives.commsRestored = true;
      state.comm.status = "restored";
      state.antennaStep = 5;

      if (isShort) {
        // Short message drops research objectives
        state.objectives.researchSamples = false;
        state.objectives.panelsUnderstood = false;
      }
    } else {
      state.objectives.commsRestored = false;
      state.comm.status = "blackout";
      if (!state.objectives.antennaAligned) {
        state.endingReason = "The high-gain antenna was not aligned toward Earth.";
      } else {
        state.endingReason = `Antenna transmitter lacked enough power (needed ${requiredPower}%, had ${state.resources.power}%).`;
      }
    }
  }

  // Check for immediate zero resource depletion
  const { power, lifeSupport, radiationSafety } = state.resources;
  const anyDepleted = power <= 0 || lifeSupport <= 0 || radiationSafety <= 0;
  if (anyDepleted) {
    if (!state.graceUsed) {
      state.status = "critical_grace";
      state.graceUsed = true;
    } else {
      state.status = "interrupted";
      state.endingReason = state.endingReason || "Core outpost systems depleted beyond life-support recovery capabilities.";
    }
  }

  // 7. Formalize ResolutionResult
  const resolutionResult = {
    choiceId: choice.id,
    choiceLabel: choice.label,
    before: resChanges.before,
    after: resChanges.after,
    appliedDeltas: resChanges.appliedDeltas,
    narrativeOutcome: choice.outcomeText + (conditionalNotes.length > 0 ? " " + conditionalNotes.join(" ") : ""),
    crewReaction: choice.crewReaction,
    science: choice.science,
    flagsAdded: choice.flags || [],
    pendingEffectsAdded: choice.pendingEffects || []
  };

  // 8. Log into chronological mission history
  state.logHistory.unshift({
    id: `log_sol_${state.sol}_${choice.id}`,
    sol: state.sol,
    type: "decision",
    title: `${eventData.title}: ${choice.label}`,
    text: choice.outcomeText,
    appliedDeltas: resChanges.appliedDeltas
  });

  state.lastResolution = resolutionResult;
  state.awaitingDecision = false;

  // Persist state
  saveGameState(state);

  return resolutionResult;
}

/**
 * Advance Sol Loop (Strict Sequence with v3 Nightly Power Drain & Morale Consequences)
 */
export function advanceSol(state) {
  const overnightLog = [];
  const callbacks = [];

  // Step 1: Increment Sol
  state.sol += 1;
  overnightLog.push(`Entering Sol ${state.sol < 10 ? "0" + state.sol : state.sol}`);

  // Reset daily meal guard for the new sol
  state.supplyDone = false;
  state.awaitingDecision = false;

  // Step 2: Nightly baseline drains (Power -1%, Morale -1)
  if (state.sol <= 30) {
    const drainDeltas = {
      power: -GAME_CONSTANTS.NIGHT_POWER_DRAIN,
      morale: -GAME_CONSTANTS.NIGHT_MORALE_DRIFT
    };
    applyResourceChanges(state, drainDeltas, "Overnight Habitat Support & Isolation");
    overnightLog.push("Nightly Habitat: Heaters, lights and computers used some electricity (Power -1%).");
    overnightLog.push("Nightly Isolation: Being far from home is tiring (Crew Morale -1).");
  }

  // Step 3: Mood consequences based on current morale
  if (state.morale < 15) {
    applyResourceChanges(state, { power: -2, lifeSupport: -1 }, "Exhausted Crew Mistakes");
    overnightLog.push("Exhausted Crew: Tired astronauts made errors on the night shift (Power -2%, Life Support -1%).");
  } else if (state.morale < 30) {
    applyResourceChanges(state, { power: -1 }, "Grumpy Crew Sluggishness");
    overnightLog.push("Grumpy Crew: Low morale led to skipped maintenance chores (Power -1%).");
  }

  // Step 4: Story-beat automatic gifts (Sols 10, 17, 26)
  if (state.sol === 10) {
    applyResourceChanges(state, { morale: 8 }, "Sol 10 Milestone Celebration");
    overnightLog.push("Milestone: Crew celebrated 10 sols on Mars with saved treats (Morale +8)!");
  } else if (state.sol === 17) {
    applyResourceChanges(state, { lifeSupport: 6, morale: 6 }, "Greenhouse Harvest");
    overnightLog.push("Greenhouse Harvest: Fresh micro-greens and radishes harvested (Life Support +6%, Morale +6)!");
  } else if (state.sol === 26) {
    applyResourceChanges(state, { morale: 6 }, "Earth Sighting in Evening Sky");
    overnightLog.push("Observation: Earth was visible as a bright blue star in the twilight sky (Morale +6)!");
  }

  // Step 5: Automatic Antenna Repair Progression Tracker
  if (state.sol === 5) {
    state.antennaStep = Math.max(state.antennaStep || 0, 1);
    overnightLog.push("Antenna Tracker: Step 1 Complete - Found damage (bent motor arm and cracked cable).");
  } else if (state.sol === 12) {
    state.antennaStep = Math.max(state.antennaStep || 0, 2);
    overnightLog.push("Antenna Tracker: Step 2 Complete - Built spare parts from rover backup motor.");
  } else if (state.sol === 18) {
    state.antennaStep = Math.max(state.antennaStep || 0, 3);
    overnightLog.push("Antenna Tracker: Step 3 Complete - Tested motor alignment drive.");
  }

  // Step 6: Apply ongoing modifiers
  if (state.modifiers && state.modifiers.length > 0) {
    const activeModifiers = [];
    for (const mod of state.modifiers) {
      const deltas = { power: 0, lifeSupport: 0, radiationSafety: 0, morale: 0 };
      deltas[mod.resource] = mod.perSol;
      const res = applyResourceChanges(state, deltas, `Ongoing: ${mod.label}`);
      overnightLog.push(`${mod.label}: ${res.appliedDeltas[mod.resource] > 0 ? "+" : ""}${res.appliedDeltas[mod.resource]}% ${mod.resource}`);

      if (!mod.expiresSol || state.sol < mod.expiresSol) {
        activeModifiers.push(mod);
      }
    }
    state.modifiers = activeModifiers;
  }

  // Step 7: Apply due pending effects (triggerSol === sol) with callbacks
  if (state.pendingEffects && state.pendingEffects.length > 0) {
    const remainingEffects = [];
    for (const pe of state.pendingEffects) {
      if (pe.triggerSol === state.sol) {
        const res = applyResourceChanges(state, pe.deltas, pe.cause);
        const callbackMsg = pe.callbackText || pe.logText || `Delayed consequence from Sol ${pe.sourceSol || "past"}`;
        overnightLog.push(`Delayed Consequence: ${callbackMsg}`);
        callbacks.push({
          sourceSol: pe.sourceSol,
          text: callbackMsg,
          deltas: res.appliedDeltas
        });
      } else {
        remainingEffects.push(pe);
      }
    }
    state.pendingEffects = remainingEffects;
  }

  // Step 8: Deliver due communication messages (deliverOnSol === sol)
  if (state.commQueue && state.commQueue.length > 0) {
    const undelivered = [];
    for (const msg of state.commQueue) {
      if (msg.deliverOnSol <= state.sol) {
        const isStale = msg.validIf && !state.flags[msg.validIf];
        const deliveredBody = isStale && msg.staleVariant ? msg.staleVariant : msg.body;
        const commItem = {
          ...msg,
          deliveredOnSol: state.sol,
          activeBody: deliveredBody,
          wasStale: !!isStale
        };
        state.commHistory.push(commItem);
        state.latestComm = commItem;
        overnightLog.push(`Incoming Radio Transmission: ${msg.subject}`);

        state.logHistory.unshift({
          id: `log_comm_${state.sol}_${msg.id}`,
          sol: state.sol,
          type: "transmission",
          title: `Earth Radio Transmission: ${msg.subject}`,
          text: `[${msg.sender}] ${deliveredBody}`,
          sender: msg.sender,
          wasStale: !!isStale
        });
      } else {
        undelivered.push(msg);
      }
    }
    state.commQueue = undelivered;
  }

  // Step 9: Zero/grace check
  const { power, lifeSupport, radiationSafety } = state.resources;
  const anyDepleted = power <= 0 || lifeSupport <= 0 || radiationSafety <= 0;

  if (anyDepleted) {
    if (!state.graceUsed) {
      state.status = "critical_grace";
      state.graceUsed = true;
      overnightLog.push("EMERGENCY ALERT: Outpost system reached 0%! Emergency lifeboat triage required.");
    } else {
      state.status = "interrupted";
      state.endingReason = state.endingReason || "Core outpost systems depleted beyond life-support recovery capabilities.";
      overnightLog.push("MISSION INTERRUPTED: Emergency suspension protocols activated.");
    }
  }

  // Step 10: Chapter transitions
  const matchingChapter = GAME_CONSTANTS.CHAPTERS.find(
    (c) => state.sol >= c.startSol && state.sol <= c.endSol
  );
  if (matchingChapter && matchingChapter.number !== state.chapter) {
    state.chapter = matchingChapter.number;
    overnightLog.push(`Chapter Advanced: Chapter ${matchingChapter.number} - ${matchingChapter.title}`);
  }

  // Step 11: Overnight Report summary
  state.overnightReport = {
    sol: state.sol,
    log: overnightLog,
    callbacks,
    resources: { ...state.resources },
    morale: state.morale
  };

  // Step 12: Save game state
  saveGameState(state);

  return state.overnightReport;
}

/**
 * Dispatch Status Query to Earth (Only enabled once antenna beacon works)
 */
export function sendStatusQuery(state) {
  if (!state || !state.commQueue) return { success: false, reason: "invalid_state" };

  if (state.comm.status === "blackout") {
    return {
      success: false,
      reason: "blackout",
      message: "Earth can't hear us yet. The high-gain antenna is broken; we can only listen until Sol 21 alignment."
    };
  }

  if (state.commQueue.some((m) => m.isQuery)) {
    return {
      success: false,
      reason: "query_already_in_transit",
      message: "A radio message is already traveling across space to Houston."
    };
  }

  const deliverSol = Math.min(30, state.sol + 2);
  const queryId = `query_sol_${state.sol}`;

  state.logHistory.unshift({
    id: `log_query_${state.sol}`,
    sol: state.sol,
    type: "transmission",
    title: `Beacon Ping Sent to Houston (Sol ${state.sol < 10 ? "0" + state.sol : state.sol})`,
    text: `Commander Rivera sent outpost telemetry to Earth using the intermittent beacon. Power: ${state.resources.power}%, Life Support: ${state.resources.lifeSupport}%, Radiation: ${state.resources.radiationSafety}%, Crew Morale: ${state.morale}.`,
    sender: "Commander Elena Rivera // ARES-1",
    wasStale: false
  });

  let responseBody = "Houston MCC Telemetry Desk: Beacon packet decoded! All indicators are holding steady. Keep following your checklist!";
  if (state.resources.power < 40) {
    responseBody = "Houston MCC Power Desk: Telemetry shows battery reserves dipping low. Turn off extra heaters and keep panel surfaces dust-free.";
  } else if (state.resources.lifeSupport < 40) {
    responseBody = "Houston MCC Environmental Desk: Water loop telemetry is lower than optimal. Dr. Reed should monitor ration choices.";
  } else if (state.resources.radiationSafety < 40) {
    responseBody = "Goddard Space Weather Desk: Sunspot activity is increasing. Make sure your regolith berms and storm shelter are ready.";
  }

  state.commQueue.push({
    id: queryId,
    sender: "Flight Director Chen // Houston MCC",
    subject: `Houston MCC Advisory (Re: Sol ${state.sol < 10 ? "0" + state.sol : state.sol} Beacon Ping)`,
    body: responseBody,
    sentOnSol: state.sol,
    deliverOnSol: deliverSol,
    validIf: null,
    staleVariant: null,
    isQuery: true
  });

  saveGameState(state);
  return { success: true, deliverOnSol: deliverSol };
}

/**
 * Mid-Campaign Emergency Lifeboat Triage Options (Kid-friendly wording)
 */
export const EMERGENCY_TRIAGE_OPTIONS = [
  {
    id: "triage_aux_cells",
    label: "Fire Emergency Rocket Fuel Generator",
    desc: "Use spare descent rocket fuel to run emergency electric generators and warm the outpost.",
    tradeoff: "Restores +25% Power and +10% Life Support, but rocket exhaust stains outer seals (-10% Radiation Safety).",
    deltas: { power: 25, lifeSupport: 10, radiationSafety: -10 }
  },
  {
    id: "triage_emergency_o2",
    label: "Open High-Pressure Backup Air Tanks",
    desc: "Crack open the heavy emergency steel oxygen and nitrogen bottles to refill habitat air.",
    tradeoff: "Restores +30% Life Support, but compressors use electricity (-10% Power) and airlock seals flex (-5% Radiation Safety).",
    deltas: { power: -10, lifeSupport: 30, radiationSafety: -5 }
  },
  {
    id: "triage_regolith_lockdown",
    label: "Lock Down in the Heavy Storm Bunker",
    desc: "Crowd all four crew members into the thick underground sandbagged vault.",
    tradeoff: "Restores +30% Radiation Safety, but forces extreme power shutoffs (-5% Power) and meal cuts (-10% Life Support).",
    deltas: { power: -5, lifeSupport: -10, radiationSafety: 30 }
  }
];

/**
 * Apply Emergency Lifeboat Triage
 */
export function applyEmergencyTriage(state, triageId) {
  const triage = EMERGENCY_TRIAGE_OPTIONS.find((t) => t.id === triageId);
  if (!triage) {
    throw new Error(`[ENGINE ERROR] Unknown triage option: ${triageId}`);
  }

  // Apply resource changes (radiationAffecting explicitly allowed for lifeboat emergency triage)
  const res = applyResourceChanges(state, triage.deltas, `Emergency Triage: ${triage.label}`, { radiationAffecting: true });

  state.logHistory.unshift({
    id: `log_triage_sol_${state.sol}`,
    sol: state.sol,
    type: "triage",
    title: `EMERGENCY LIFEBOAT TRIAGE: ${triage.label}`,
    text: `${triage.desc} Outpost stabilized from total system failure.`,
    appliedDeltas: res.appliedDeltas
  });

  const { power, lifeSupport, radiationSafety } = state.resources;
  if (power <= 0 || lifeSupport <= 0 || radiationSafety <= 0) {
    state.status = "interrupted";
    state.endingReason = "Emergency triage was insufficient to stabilize depleted outpost life-support systems.";
  } else {
    state.status = "active";
  }

  saveGameState(state);
  return { triage, res };
}

/**
 * Sol 30 Ending Evaluator (v3 Balance Thresholds + Crew Spirit Summary)
 */
export function evaluateMissionEnding(state) {
  const { power, lifeSupport, radiationSafety } = state.resources;
  const morale = state.morale !== undefined ? state.morale : 80;
  const anyDepleted = power <= 0 || lifeSupport <= 0 || radiationSafety <= 0;
  const completedObjectivesCount = Object.values(state.objectives).filter((v) => v === true).length;

  const E = GAME_CONSTANTS.ENDING;

  // Build crew spirit line based on morale and meal history
  const moodInfo = getMoodInfo(morale);
  const fullMeals = state.stats ? state.stats.fullDays : 0;
  const totalMeals = (state.rationHistory && state.rationHistory.length) || (state.sol - 1);
  const crewSpiritLine = `The crew finished the mission feeling ${moodInfo.label} (${moodInfo.face}). They ate full hot meals on ${fullMeals} of ${totalMeals} sols.`;

  // 1. Ending 3: Mission Interrupted
  if (
    state.status === "interrupted" ||
    anyDepleted ||
    !state.objectives.commsRestored ||
    power < E.costlyMin ||
    lifeSupport < E.costlyMin ||
    radiationSafety < E.costlyMin
  ) {
    return {
      id: "ending_interrupted",
      code: 3,
      badgeClass: "badge-interrupted",
      title: "Ending 3: Mission Interrupted",
      subtitle: "Outpost in Emergency Sleep Mode",
      tag: "MISSION INTERRUPTED",
      tagClass: "tag-critical",
      narrative:
        state.endingReason ||
        "The harsh Martian environment proved too tough this time. ARES-1 could not keep enough supplies or send the final signal to Earth before the launch window closed. Automated safety computers sealed the habitat and put the outpost to sleep until the next window.",
      crewQuote: {
        speaker: "Commander Elena Rivera",
        role: "Outpost Commander",
        text: "We fought for every watt of electricity and every drop of clean water. Mars is challenging, but what we learned will help the next crew succeed."
      },
      crewSpiritLine,
      scienceTakeaway:
        "Exploring Mars needs backup plans for everything. NASA designs spacecraft with automated sleep modes to keep astronauts safe even when equipment breaks down.",
      stats: {
        sol: state.sol,
        power,
        lifeSupport,
        radiationSafety,
        morale,
        completedObjectivesCount,
        totalObjectives: 5,
        commsRestored: !!state.objectives.commsRestored
      }
    };
  }

  // 2. Ending 1: Beyond the Silence (Optimal Victory)
  if (
    power >= E.beyondMin &&
    lifeSupport >= E.beyondMin &&
    radiationSafety >= E.beyondMin &&
    morale >= E.beyondMoodMin &&
    completedObjectivesCount >= E.beyondObjectives
  ) {
    return {
      id: "ending_optimal",
      code: 1,
      badgeClass: "badge-optimal",
      title: "Ending 1: Beyond the Silence",
      subtitle: "Flawless Mission Victory • Earth Hears Mars!",
      tag: "OPTIMAL VICTORY",
      tagClass: "tag-optimal",
      narrative:
        "Against incredible odds, ARES-1 survived 30 sols in great shape! When Earth rose over the Martian horizon on Sol 30, Marcus's antenna beamed scientific data, photos, and messages directly to NASA's giant radio dishes in California and Spain. Houston confirmed reception with zero lost data, and the relief ship is preparing for launch. The silence from Mars is over!",
      crewQuote: {
        speaker: "Commander Elena Rivera",
        role: "Outpost Commander",
        text: "Houston, this is ARES-1. We hear you loud and clear! Our base is strong, our research is safe, and all four of us are ready to come home!"
      },
      crewSpiritLine,
      scienceTakeaway:
        "Great mission leadership balances technology and people. Keeping solar panels clean, sheltering from solar storms, and taking care of your crew makes deep-space exploration possible.",
      stats: {
        sol: 30,
        power,
        lifeSupport,
        radiationSafety,
        morale,
        completedObjectivesCount,
        totalObjectives: 5,
        commsRestored: true
      }
    };
  }

  // 3. Ending 2: A Costly Success (Pragmatic Survival)
  return {
    id: "ending_pragmatic",
    code: 2,
    badgeClass: "badge-caution",
    title: "Ending 2: A Costly Success",
    subtitle: "Base Survived • Emergency Signal Sent",
    tag: "PRAGMATIC SURVIVAL",
    tagClass: "tag-caution",
    narrative:
      "ARES-1 fought through 30 sols of blackout and successfully beamed the survival signal home! NASA's Deep Space Network picked up your carrier wave, confirming all four crew members made it. Reserves are running thin and some scientific experiments had to be set aside, but the crew is safe and Earth knows your position.",
    crewQuote: {
      speaker: "Marcus Vance",
      role: "Systems & Power Engineer",
      text: "The battery banks are warm and we are down to emergency snacks, but our signal reached Earth. We made it through together!"
    },
    crewSpiritLine,
    scienceTakeaway:
      "Real space missions sometimes force tough choices: sacrificing science experiments to keep air, water, and power running. Making smart trade-offs is what keeps astronauts alive.",
    stats: {
      sol: 30,
      power,
      lifeSupport,
      radiationSafety,
      morale,
      completedObjectivesCount,
      totalObjectives: 5,
      commsRestored: true
    }
  };
}
