/**
 * ARES: The Last Signal - Central Game Engine
 * 
 * Implements:
 * - Unified applyResourceChanges with strict clamping and post-clamp deltas
 * - Radiation allow-list guard throwing developer errors
 * - Choice resolver with persistent awaitingDecision protection
 * - advanceSol executing in the strict 8-step sequence
 * - Overnight report generation
 */

import { GAME_CONSTANTS } from "./constants.js";
import { saveGameState } from "./gameState.js";

/**
 * Unified Resource Transition Function
 * ALL changes to resources (choices, pending effects, modifiers, triage) MUST flow through here.
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

  const before = { ...state.resources };

  // Calculate target clamped values (0 to 100)
  const after = {
    power: Math.max(0, Math.min(100, before.power + (rawDeltas.power || 0))),
    lifeSupport: Math.max(0, Math.min(100, before.lifeSupport + (rawDeltas.lifeSupport || 0))),
    radiationSafety: Math.max(0, Math.min(100, before.radiationSafety + (rawDeltas.radiationSafety || 0)))
  };

  // TRUE applied post-clamp deltas
  const appliedDeltas = {
    power: after.power - before.power,
    lifeSupport: after.lifeSupport - before.lifeSupport,
    radiationSafety: after.radiationSafety - before.radiationSafety
  };

  // Mutate state resources
  state.resources = after;

  // Append to recent changes audit feed
  state.recentChanges.unshift({
    sol: state.sol,
    cause: causeLabel,
    deltas: appliedDeltas
  });

  return { before, after, appliedDeltas };
}

/**
 * Apply Player Decision to Game State
 */
export function applyChoice(state, choice, eventData) {
  if (!state.awaitingDecision) {
    console.warn("[ENGINE WARNING] Attempted to apply choice while awaitingDecision is false. Action ignored.");
    return null;
  }

  // Enforce rule: No pending effect can have triggerSol > 29
  if (choice.pendingEffects && choice.pendingEffects.length > 0) {
    for (const pe of choice.pendingEffects) {
      if (pe.triggerSol > 29) {
        throw new Error(`[DEV ERROR] Pending effect triggerSol (${pe.triggerSol}) exceeds maximum allowed of 29.`);
      }
    }
  }

  // 1. Apply immediate resource deltas
  const resChanges = applyResourceChanges(state, choice.deltas, choice.label, eventData);

  // 2. Set flags
  if (choice.flags && choice.flags.length > 0) {
    choice.flags.forEach((f) => {
      state.flags[f] = true;
    });
  }

  // 3. Queue pending effects
  if (choice.pendingEffects && choice.pendingEffects.length > 0) {
    state.pendingEffects.push(...choice.pendingEffects);
  }

  // 4. Add ongoing modifiers
  if (choice.modifiers && choice.modifiers.length > 0) {
    state.modifiers.push(...choice.modifiers);
  }

  // 5. Remove any cancelled modifiers
  if (choice.removesModifiers && choice.removesModifiers.length > 0) {
    state.modifiers = state.modifiers.filter((m) => !choice.removesModifiers.includes(m.id));
  }

  // 6. Update tracked objectives
  if (choice.objectiveChanges) {
    Object.assign(state.objectives, choice.objectiveChanges);
  }

  // Sol 30 Climax: Final Transmission Evaluation
  if (state.sol === 30 && eventData.id === "evt_final_transmission") {
    if (state.objectives.antennaAligned && state.resources.power >= 20) {
      state.objectives.commsRestored = true;
      state.comm.status = "restored";
    } else {
      state.objectives.commsRestored = false;
      state.comm.status = "blackout";
      state.endingReason = "High-gain transmitter lacked alignment or power to establish carrier lock with Earth.";
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
    narrativeOutcome: choice.outcomeText,
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
 * Advance Sol Loop
 * Follows the strict 8-step sequence defined in DESIGN.md.
 */
export function advanceSol(state) {
  const overnightLog = [];

  // Step 1: Increment Sol
  state.sol += 1;
  overnightLog.push(`Entering Sol ${state.sol < 10 ? "0" + state.sol : state.sol}`);

  // Step 2: Apply ongoing modifiers
  if (state.modifiers && state.modifiers.length > 0) {
    const activeModifiers = [];
    for (const mod of state.modifiers) {
      const deltas = { power: 0, lifeSupport: 0, radiationSafety: 0 };
      deltas[mod.resource] = mod.perSol;
      const res = applyResourceChanges(state, deltas, `Ongoing: ${mod.label}`);
      overnightLog.push(`${mod.label}: ${res.appliedDeltas[mod.resource]}% ${mod.resource}`);

      // Check expiration
      if (!mod.expiresSol || state.sol < mod.expiresSol) {
        activeModifiers.push(mod);
      }
    }
    state.modifiers = activeModifiers;
  }

  // Step 3: Apply due pending effects (triggerSol === sol)
  if (state.pendingEffects && state.pendingEffects.length > 0) {
    const remainingEffects = [];
    for (const pe of state.pendingEffects) {
      if (pe.triggerSol === state.sol) {
        const res = applyResourceChanges(state, pe.deltas, pe.cause);
        overnightLog.push(`Delayed Effect: ${pe.logText}`);
      } else {
        remainingEffects.push(pe);
      }
    }
    state.pendingEffects = remainingEffects;
  }

  // Step 4: Deliver due communication messages (deliverOnSol === sol)
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

        // Add to chronological mission log history
        state.logHistory.unshift({
          id: `log_comm_${state.sol}_${msg.id}`,
          sol: state.sol,
          type: "transmission",
          title: `Deep Space Comm: ${msg.subject}`,
          text: `[${msg.sender}] ${deliveredBody}${isStale ? " (Telemetry Note: Orbital parameters have lapsed since original transmission)" : ""}`,
          sender: msg.sender,
          wasStale: !!isStale
        });
      } else {
        undelivered.push(msg);
      }
    }
    state.commQueue = undelivered;
  }

  // Step 5: Zero/grace check
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

  // Step 6: Chapter transitions
  const matchingChapter = GAME_CONSTANTS.CHAPTERS.find(
    (c) => state.sol >= c.startSol && state.sol <= c.endSol
  );
  if (matchingChapter && matchingChapter.number !== state.chapter) {
    state.chapter = matchingChapter.number;
    overnightLog.push(`Chapter Advanced: Chapter ${matchingChapter.number} - ${matchingChapter.title}`);
  }

  // Step 7: Overnight Report summary
  state.overnightReport = {
    sol: state.sol,
    log: overnightLog,
    resources: { ...state.resources }
  };

  // Step 8: Save game state
  saveGameState(state);

  return state.overnightReport;
}

/**
 * Dispatch Status Query to Earth (2-Sol Latency)
 */
export function sendStatusQuery(state) {
  if (!state || !state.commQueue) return { success: false, reason: "invalid_state" };
  if (state.commQueue.some((m) => m.isQuery)) {
    return { success: false, reason: "query_already_in_transit" };
  }

  const deliverSol = Math.min(30, state.sol + 2);
  const queryId = `query_sol_${state.sol}`;

  // Log outgoing transmission in mission log
  state.logHistory.unshift({
    id: `log_query_${state.sol}`,
    sol: state.sol,
    type: "transmission",
    title: `Telemetry Query Dispatched to Houston (Sol ${state.sol < 10 ? "0" + state.sol : state.sol})`,
    text: `Commander Rivera beamed outpost diagnostic telemetry (Power ${state.resources.power}%, Life Support ${state.resources.lifeSupport}%, Rad Safety ${state.resources.radiationSafety}%) to NASA Deep Space Network. Speed-of-light turnaround: ~2 sols.`,
    sender: "Commander Elena Rivera // ARES-1",
    wasStale: false
  });

  // Tailor Houston MCC response to current survival margins
  let responseBody = "Houston MCC Telemetry Desk: Packet decoded. All three indicators are tracking within anticipated survival margins. Maintain scheduled maintenance rosters.";
  if (state.resources.power < 40) {
    responseBody = "Houston MCC Power Desk: Telemetry indicates power margins are declining. Goddard recommends shedding auxiliary science equipment and preparing panel heaters for low-light conditions.";
  } else if (state.resources.lifeSupport < 40) {
    responseBody = "Houston MCC Environmental Desk: Outpost life support recycling telemetry shows elevated consumable usage. Dr. Reed should monitor crew rations and water recycler cycle times.";
  } else if (state.resources.radiationSafety < 40) {
    responseBody = "Goddard Space Weather Desk: Orbital monitoring satellites indicate elevated coronal mass activity. Recommend crew verify storm shelter seal integrity and reinforce regolith berms.";
  } else if (state.objectives.antennaAligned) {
    responseBody = "Madrid Tracking Station: Excellent work on dish calibration! Carrier beacon strength is verified at -94 dBm. Line-of-sight geometry for Sol 30 final transmission is confirmed.";
  }

  state.commQueue.push({
    id: queryId,
    sender: "Flight Director Chen // Houston MCC",
    subject: `Houston MCC Advisory (Re: Sol ${state.sol < 10 ? "0" + state.sol : state.sol} Telemetry)`,
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
 * Mid-Campaign Emergency Lifeboat Triage Options
 */
export const EMERGENCY_TRIAGE_OPTIONS = [
  {
    id: "triage_aux_cells",
    label: "Burn Auxiliary Hydrazine Chemical Cells",
    desc: "Divert emergency rocket descent fuel into auxiliary catalytic heaters and generators to restore power.",
    tradeoff: "Restores +25% Power and +10% Life Support, but releases toxic exhaust stressing radiation seals (-10% Rad Safety).",
    deltas: { power: 25, lifeSupport: 10, radiationSafety: -10 }
  },
  {
    id: "triage_emergency_o2",
    label: "Emergency Oxygen & Nitrogen Tank Venting",
    desc: "Crack high-pressure backup storage bottles to immediately repressurize habitat life support modules.",
    tradeoff: "Restores +30% Life Support, but draws compressor power (-10% Power) and strains airlock seals (-5% Rad Safety).",
    deltas: { power: -10, lifeSupport: 30, radiationSafety: -5 }
  },
  {
    id: "triage_regolith_lockdown",
    label: "Regolith Storm Vault Emergency Lockdown",
    desc: "Abandon outer research modules, seal bulkheads, and cram the crew into the heavily sandbagged core storm bunker.",
    tradeoff: "Restores +30% Radiation Safety, but forces extreme power shedding (-5% Power) and ration cuts (-10% Life Support).",
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

  // Log into mission history
  state.logHistory.unshift({
    id: `log_triage_sol_${state.sol}`,
    sol: state.sol,
    type: "triage",
    title: `EMERGENCY LIFEBOAT TRIAGE: ${triage.label}`,
    text: `${triage.desc} Outpost stabilized from total system failure.`,
    appliedDeltas: res.appliedDeltas
  });

  // Verify whether the outpost recovered
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
 * Sol 30 Ending Evaluator
 */
export function evaluateMissionEnding(state) {
  const { power, lifeSupport, radiationSafety } = state.resources;
  const anyDepleted = power <= 0 || lifeSupport <= 0 || radiationSafety <= 0;
  const completedObjectivesCount = Object.values(state.objectives).filter((v) => v === true).length;
  const COSTLY_MIN = GAME_CONSTANTS.ENDING.COSTLY_SUCCESS_RESOURCE_MIN; // 20

  // 1. Ending 3: Mission Interrupted
  if (
    state.status === "interrupted" ||
    anyDepleted ||
    !state.objectives.commsRestored ||
    power < COSTLY_MIN ||
    lifeSupport < COSTLY_MIN ||
    radiationSafety < COSTLY_MIN
  ) {
    return {
      id: "ending_interrupted",
      code: 3,
      badgeClass: "badge-interrupted",
      title: "Ending 3: Mission Interrupted",
      subtitle: "Autonomous Emergency Suspension Activated",
      tag: "MISSION INTERRUPTED",
      tagClass: "tag-critical",
      narrative:
        state.endingReason ||
        "The harsh Martian environment proved too formidable. ARES-1 was unable to maintain critical outpost life-support reserves or establish the primary carrier lock with Earth. Automated fail-safe protocols sealed the living modules and entered low-power hibernation, preserving flight recorders for the next exploration window.",
      crewQuote: {
        speaker: "Commander Elena Rivera",
        role: "Outpost Commander",
        text: "We fought for every watt of power and every liter of recycled water. Mars doesn't forgive mistakes, but what we learned here will ensure the next crew survives."
      },
      scienceTakeaway:
        "Human Mars exploration requires multiple overlapping redundant systems. NASA's architecture emphasizes automated hibernation and pre-deployed supplies to safeguard human crews during unexpected planetary equipment failures.",
      stats: {
        sol: state.sol,
        power,
        lifeSupport,
        radiationSafety,
        completedObjectivesCount,
        totalObjectives: 5,
        commsRestored: state.objectives.commsRestored
      }
    };
  }

  // 2. Ending 1: Beyond the Silence (Optimal Victory)
  if (
    power >= GAME_CONSTANTS.ENDING.BEYOND_SILENCE_RESOURCE_MIN &&
    lifeSupport >= GAME_CONSTANTS.ENDING.BEYOND_SILENCE_RESOURCE_MIN &&
    radiationSafety >= GAME_CONSTANTS.ENDING.BEYOND_SILENCE_RESOURCE_MIN &&
    completedObjectivesCount >= GAME_CONSTANTS.ENDING.BEYOND_SILENCE_OBJECTIVES_MIN
  ) {
    return {
      id: "ending_optimal",
      code: 1,
      badgeClass: "badge-optimal",
      title: "Ending 1: Beyond the Silence",
      subtitle: "Flawless Mission Victory • Interplanetary Link Restored",
      tag: "OPTIMAL VICTORY",
      tagClass: "tag-optimal",
      narrative:
        "Against incredible odds, Outpost ARES-1 has survived 30 sols in peak operational health! When Earth swept into the optimal sky quadrant on Sol 30, Marcus's antenna calibration locked onto the Deep Space Network. The 3.2-meter high-gain dish beamed gigabytes of vital scientific samples, habitat logs, and atmospheric data directly to Madrid and Goldstone. Houston has confirmed receipt with zero packet loss, and orbital relief trajectories are underway. The silence from Mars has ended!",
      crewQuote: {
        speaker: "Commander Elena Rivera",
        role: "Outpost Commander",
        text: "Houston, this is ARES-1. We hear you loud and clear. Outpost is fully pressurized, our scientific research is secured, and all four crew members are coming home!"
      },
      scienceTakeaway:
        "Successful Mars surface exploration requires rigorous resource balance, preventive maintenance of solar arrays, and disciplined radiation shelter management. Your command embodied the real-world teamwork NASA instills in every astronaut.",
      stats: {
        sol: 30,
        power,
        lifeSupport,
        radiationSafety,
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
    subtitle: "Outpost Survived • Signal Sent Under Strained Reserves",
    tag: "PRAGMATIC SURVIVAL",
    tagClass: "tag-caution",
    narrative:
      "ARES-1 persevered through 30 sols of total blackout and beamed the survival carrier signal home! NASA Deep Space Network dishes in California and Spain picked up your carrier wave, confirming all four crew members survived. However, the mission took a heavy toll: electrical reserves and water loops are running on emergency margins, and non-essential scientific experiments had to be sacrificed for raw survival. It was a harrowing trial, but the crew is alive and Earth knows your position.",
    crewQuote: {
      speaker: "Marcus Vance",
      role: "Systems & Power Engineer",
      text: "The battery banks are running hot and we're down to auxiliary rations, but that dish fired true and the signal reached home. We made it through."
    },
    scienceTakeaway:
      "Survival in deep space frequently forces flight directors into ruthless trade-offs: trading science data and comfort for core power and atmospheric survival. Balancing these limits is the core of mission planning.",
    stats: {
      sol: 30,
      power,
      lifeSupport,
      radiationSafety,
      completedObjectivesCount,
      totalObjectives: 5,
      commsRestored: true
    }
  };
}
