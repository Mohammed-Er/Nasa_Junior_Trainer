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
        state.commHistory.push({
          ...msg,
          deliveredOnSol: state.sol,
          activeBody: deliveredBody,
          wasStale: isStale
        });
        overnightLog.push(`Incoming Radio Transmission: ${msg.subject}`);
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
      state.endingReason = "Core outpost systems depleted beyond life-support recovery capabilities.";
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
