/**
 * ARES: The Last Signal - Headless Balance Simulator
 * 
 * Runs full 30-sol campaign playthroughs using the REAL engine logic
 * to mathematically verify game balance and ending reachability.
 */

import { createInitialState } from "./gameState.js";
import { applyChoice, advanceSol } from "./gameEngine.js";
import { CAMPAIGN_BEATS } from "../data/campaign.js";
import { EVENTS_DATA } from "../data/eventsData.js";

/**
 * Headless Simulation Runner for a chosen Strategy Profile
 */
export function simulatePlaythrough(strategy = "optimal", seed = 12345) {
  const state = createInitialState(seed);
  state.status = "active";
  const decisionLog = [];

  while (state.sol <= 30 && state.status !== "interrupted") {
    const currentSol = state.sol;
    const beat = CAMPAIGN_BEATS[currentSol];

    if (beat && beat.hasDecision) {
      state.awaitingDecision = true;

      // Find event
      let eventId = beat.fixedEventId;
      if (!eventId && beat.type === "random_slot") {
        eventId = state.eventSchedule ? state.eventSchedule[currentSol] : null;
      }
      const eventData = EVENTS_DATA[eventId];

      if (eventData && eventData.choices && eventData.choices.length > 0) {
        let pickedChoice = null;

        if (strategy === "optimal") {
          // Optimal: Prioritizes research, panel understanding, storm shelter, and antenna
          if (eventId === "evt_solar_dust") pickedChoice = eventData.choices.find(c => c.id === "choice_inspect");
          else if (eventId === "evt_solar_particle") pickedChoice = eventData.choices.find(c => c.id === "choice_storm_shelter");
          else if (eventId === "evt_antenna_alignment") pickedChoice = eventData.choices.find(c => c.id === "choice_align_antenna");
          else if (eventId === "evt_regolith_shielding") pickedChoice = eventData.choices.find(c => c.id === "choice_reinforce_berm");
          else if (eventId === "evt_frost") pickedChoice = eventData.choices.find(c => c.id === "choice_sample_frost");
          else if (eventId === "evt_suit_dust") pickedChoice = eventData.choices.find(c => c.id === "choice_deep_clean_suit");
          else if (eventId === "evt_oxygen_rate") pickedChoice = eventData.choices.find(c => c.id === "choice_run_o2_diagnostic");
          else if (eventId === "evt_frozen_battery") pickedChoice = eventData.choices.find(c => c.id === "choice_rover_thermal_shed");
          else if (eventId === "evt_radio_silence") pickedChoice = eventData.choices.find(c => c.id === "choice_preloaded_instructions");
          else if (eventId === "evt_temp_drop") pickedChoice = eventData.choices.find(c => c.id === "choice_cross_check_sensors");
          else if (eventId === "evt_ghost_msg") pickedChoice = eventData.choices.find(c => c.id === "choice_autonomous_command");
          else if (eventId === "evt_final_transmission") pickedChoice = eventData.choices.find(c => c.id === "choice_transmit_signal");
        } else if (strategy === "pragmatic") {
          // Pragmatic: Max power generation and basic survival, skips deep research
          if (eventId === "evt_solar_dust") pickedChoice = eventData.choices.find(c => c.id === "choice_recharge");
          else if (eventId === "evt_solar_particle") pickedChoice = eventData.choices.find(c => c.id === "choice_active_scrubbers");
          else if (eventId === "evt_antenna_alignment") pickedChoice = eventData.choices.find(c => c.id === "choice_align_antenna");
          else if (eventId === "evt_regolith_shielding") pickedChoice = eventData.choices.find(c => c.id === "choice_skip_berm");
          else if (eventId === "evt_frost") pickedChoice = eventData.choices.find(c => c.id === "choice_remote_photo");
          else if (eventId === "evt_suit_dust") pickedChoice = eventData.choices.find(c => c.id === "choice_isolate_suit");
          else if (eventId === "evt_oxygen_rate") pickedChoice = eventData.choices.find(c => c.id === "choice_switch_backup_o2");
          else if (eventId === "evt_frozen_battery") pickedChoice = eventData.choices.find(c => c.id === "choice_rover_shut_instruments");
          else if (eventId === "evt_radio_silence") pickedChoice = eventData.choices.find(c => c.id === "choice_suspend_nonessential");
          else if (eventId === "evt_temp_drop") pickedChoice = eventData.choices.find(c => c.id === "choice_boost_heaters");
          else if (eventId === "evt_ghost_msg") pickedChoice = eventData.choices.find(c => c.id === "choice_follow_delayed");
          else if (eventId === "evt_final_transmission") pickedChoice = eventData.choices.find(c => c.id === "choice_transmit_signal");
        } else {
          // Careless: Ignores alarms, bypasses cleaning, stays in lab during CME
          if (eventId === "evt_solar_dust") pickedChoice = eventData.choices.find(c => c.id === "choice_recharge");
          else if (eventId === "evt_solar_particle") pickedChoice = eventData.choices.find(c => c.id === "choice_stay_lab_work");
          else if (eventId === "evt_antenna_alignment") pickedChoice = eventData.choices.find(c => c.id === "choice_defer_antenna");
          else if (eventId === "evt_regolith_shielding") pickedChoice = eventData.choices.find(c => c.id === "choice_skip_berm");
          else if (eventId === "evt_frost") pickedChoice = eventData.choices.find(c => c.id === "choice_ignore_frost");
          else if (eventId === "evt_suit_dust") pickedChoice = eventData.choices.find(c => c.id === "choice_bypass_dust_protocol");
          else if (eventId === "evt_oxygen_rate") pickedChoice = eventData.choices.find(c => c.id === "choice_ration_o2_power");
          else if (eventId === "evt_frozen_battery") pickedChoice = eventData.choices.find(c => c.id === "choice_push_rover_night");
          else if (eventId === "evt_radio_silence") pickedChoice = eventData.choices.find(c => c.id === "choice_suspend_nonessential");
          else if (eventId === "evt_temp_drop") pickedChoice = eventData.choices.find(c => c.id === "choice_ignore_temp");
          else if (eventId === "evt_ghost_msg") pickedChoice = eventData.choices.find(c => c.id === "choice_follow_delayed");
          else if (eventId === "evt_final_transmission") pickedChoice = eventData.choices.find(c => c.id === "choice_transmit_signal");
        }

        if (!pickedChoice) pickedChoice = eventData.choices[0];

        // Apply choice through gameEngine
        applyChoice(state, pickedChoice, eventData);
        decisionLog.push({ sol: currentSol, event: eventData.title, choice: pickedChoice.label });
      }
    }

    // Sol 30 final transmission condition
    if (currentSol === 30) {
      if (state.objectives.antennaAligned && state.resources.power >= 20) {
        state.objectives.commsRestored = true;
      }
      break;
    }

    advanceSol(state);
  }

  // Evaluate final ending
  const { power, lifeSupport, radiationSafety } = state.resources;
  const anyDepleted = power <= 0 || lifeSupport <= 0 || radiationSafety <= 0;
  const completedObjectivesCount = Object.values(state.objectives).filter(v => v === true).length;

  let ending = "Mission Interrupted";
  if (state.status !== "interrupted" && !anyDepleted && state.objectives.commsRestored) {
    if (power >= 60 && lifeSupport >= 60 && radiationSafety >= 60 && completedObjectivesCount >= 3) {
      ending = "Beyond the Silence";
    } else if (power >= 20 && lifeSupport >= 20 && radiationSafety >= 20) {
      ending = "A Costly Success";
    }
  }

  return {
    strategy,
    seed,
    finalSol: state.sol,
    status: state.status,
    ending,
    resources: state.resources,
    completedObjectivesCount,
    objectives: state.objectives,
    decisionCount: decisionLog.length
  };
}

/**
 * Generate Verified Balance Table
 */
export function generateBalanceTable() {
  console.log("=== HEADLESS BALANCE SIMULATION REPORT ===");
  const optimal = simulatePlaythrough("optimal", 9999);
  const pragmatic = simulatePlaythrough("pragmatic", 9999);
  const careless = simulatePlaythrough("careless", 9999);

  const table = [
    {
      Strategy: "Optimal (Science & Discipline)",
      Power: `${optimal.resources.power}%`,
      "Life Support": `${optimal.resources.lifeSupport}%`,
      "Rad Safety": `${optimal.resources.radiationSafety}%`,
      Objectives: `${optimal.completedObjectivesCount}/5`,
      "Comms Restored": optimal.objectives.commsRestored ? "YES" : "NO",
      "Final Ending": optimal.ending
    },
    {
      Strategy: "Pragmatic (Power Survivalist)",
      Power: `${pragmatic.resources.power}%`,
      "Life Support": `${pragmatic.resources.lifeSupport}%`,
      "Rad Safety": `${pragmatic.resources.radiationSafety}%`,
      Objectives: `${pragmatic.completedObjectivesCount}/5`,
      "Comms Restored": pragmatic.objectives.commsRestored ? "YES" : "NO",
      "Final Ending": pragmatic.ending
    },
    {
      Strategy: "Careless (Bypass & Neglect)",
      Power: `${careless.resources.power}%`,
      "Life Support": `${careless.resources.lifeSupport}%`,
      "Rad Safety": `${careless.resources.radiationSafety}%`,
      Objectives: `${careless.completedObjectivesCount}/5`,
      "Comms Restored": careless.objectives.commsRestored ? "YES" : "NO",
      "Final Ending": careless.ending
    }
  ];

  console.table(table);
  return table;
}
