/**
 * ARES: The Last Signal - Complete Events & Story Registry
 * 
 * Contains:
 * - The 8 Designated Random Events (Sols 3, 6, 8, 11, 15, 19, 23, 27)
 * - Fixed Campaign Milestones & Crises (Sols 14, 21, 22, 30)
 * 
 * Rules:
 * - Every decision has meaningful trade-offs.
 * - radiationAffecting must be true for events touching radiationSafety.
 * - triggerSol on pending effects cannot exceed 29.
 */

export const EVENTS_DATA = {
  // =========================================================================
  // THE 8 DESIGNATED RANDOM EVENTS
  // =========================================================================

  // Event 1: The Mysterious Solar Panel Miracle
  "evt_solar_dust": {
    id: "evt_solar_dust",
    title: "The Mysterious Solar Panel Miracle",
    type: "random",
    eligibleSlots: [3],
    radiationAffecting: false,
    intro: "A localized dust vortex swept across the western solar field. Telemetry confirms solar energy output has suddenly surged by 25%.",
    choices: [
      {
        id: "choice_recharge",
        label: "Charge Reserve Battery Banks",
        preview: "Divert the full incoming surge into habitat battery storage cells.",
        tradeoff: "Provides an immediate +20% Power surge, but leaves the panel mechanisms uninspected.",
        deltas: { power: +20, lifeSupport: 0, radiationSafety: 0 },
        flags: ["batteries_charged"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Capacitor banks are humming! That gives us a reliable power buffer for cold nights."
        },
        outcomeText: "Storage capacitors are fully charged to maximum density, creating a strong electrical safety buffer.",
        science: {
          text: "Martian dust devils can reach hundreds of meters in height. Their rotating winds are capable of lifting surface particulate and clearing flat surfaces.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_preserve",
        label: "Regulate Surge & Condition Circuit Breakers",
        preview: "Route power through voltage conditioners to protect aging distribution circuits.",
        tradeoff: "Moderate power gain (+10%) and life support efficiency (+5%), while completely eliminating electrical wear.",
        deltas: { power: +10, lifeSupport: +5, radiationSafety: 0 },
        flags: ["circuits_preserved"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Disciplined engineering keeps equipment alive on Mars. Smooth voltage protects our air scrubbers."
        },
        outcomeText: "Power conditioning units absorbed the surge evenly. Subsystem stability improved across the habitat.",
        science: {
          text: "Spacecraft electrical power units use shunt regulators and filters to prevent high-voltage spikes from damaging sensitive life-support electronics.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_inspect",
        label: "Inspect Array Mechanisms & Dust Dispersion",
        preview: "Expend diagnostic power to scan array tilt actuators and measure wind shear.",
        tradeoff: "Costs 5% Power now, but uncovers dust dynamics that protect against Chapter 3 dust storms.",
        deltas: { power: -5, lifeSupport: 0, radiationSafety: 0 },
        flags: ["panels_inspected"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: { panelsUnderstood: true },
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "Fascinating data! The vortex removed fine dust without scratching the anti-reflective silica coating."
        },
        outcomeText: "Diagnostic telemetry revealed exactly how Martian wind vortexes dislodge electrostatically charged dust.",
        science: {
          text: "Martian dust particles are fine, jagged, and electrostatically charged. Understanding how surface winds dislodge them is crucial for long-duration solar array maintenance.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      }
    ]
  },

  // Event 2: The 22-Minute Ghost Message
  "evt_ghost_msg": {
    id: "evt_ghost_msg",
    title: "The 22-Minute Ghost Message",
    type: "random",
    eligibleSlots: [19, 23, 27],
    radiationAffecting: false,
    intro: "A delayed burst transmission from Houston arrived after bouncing across the Deep Space Network. However, its instructions refer to atmospheric conditions from three days ago!",
    choices: [
      {
        id: "choice_follow_delayed",
        label: "Follow Ground Control's Outdated Protocol",
        preview: "Execute Houston's instructions despite local sensor shifts to maintain mission protocol.",
        tradeoff: "Avoids procedure penalties, but burns 10% Power realigning antenna arrays unnecessarily.",
        deltas: { power: -10, lifeSupport: 0, radiationSafety: 0 },
        flags: ["houston_protocol_followed"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Standard procedures are there for a reason, but that delay cost us valuable battery reserves."
        },
        outcomeText: "The crew executed the delayed protocol. Hardware checked out, but power was wasted on redundant scans.",
        science: {
          text: "One-way radio signals between Earth and Mars take anywhere from 3 to 22 minutes depending on orbital positions, meaning real-time communication is impossible.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_autonomous_command",
        label: "Rely on Local Martian Sensor Telemetry",
        preview: "Override Houston's delayed advice and make an autonomous tactical decision on site.",
        tradeoff: "Preserves power and equipment (+10% Power, +5% LS), proving crew autonomy in deep space operations.",
        deltas: { power: +10, lifeSupport: +5, radiationSafety: 0 },
        flags: ["autonomous_command_proven"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Dr. Evelyn Reed",
          role: "Medical Officer",
          text: "Good judgment, Commander. We are on Mars; we have to trust our eyes and our instruments."
        },
        outcomeText: "Command acted on live local sensor readings, saving power and keeping life support running efficiently.",
        science: {
          text: "NASA astronauts on future Mars missions will require unprecedented operational autonomy, as Earth flight directors cannot intervene during rapidly developing surface crises.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_wait_clarification",
        label: "Transmit Query & Wait for Next Comm Window",
        preview: "Send a telemetry packet asking Houston for updated confirmation.",
        tradeoff: "Saves energy now, but delays operational progress by 2 sols.",
        deltas: { power: 0, lifeSupport: -5, radiationSafety: 0 },
        flags: ["waiting_on_earth"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "We're holding in place until the next packet arrives. Keeping systems idling draws slight baseline life support."
        },
        outcomeText: "The outpost transmitted a status query and placed nonessential repair work on hold.",
        science: {
          text: "Communication windows to Mars depend on Earth Deep Space Network ground station visibility and orbital geometry of relay spacecraft.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      }
    ]
  },

  // Event 3: The Red Snow That Isn't Snow
  "evt_frost": {
    id: "evt_frost",
    title: "The Red Snow That Isn't Snow",
    type: "random",
    eligibleSlots: [3, 6, 8],
    radiationAffecting: false,
    intro: "Early morning cameras spot a pale, crystalline coating clinging to boulders near the habitat. It could be water-ice frost or frozen carbon dioxide (dry ice).",
    choices: [
      {
        id: "choice_sample_frost",
        label: "Deploy Rover Arm to Collect Sealed Sample",
        preview: "Expend rover battery power to collect and hermetically seal the crystalline deposit.",
        tradeoff: "Burns 5% Power for rover drive/drill, but collects a verified research sample.",
        deltas: { power: -5, lifeSupport: 0, radiationSafety: 0 },
        flags: ["frost_sample_collected"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: { researchSamples: true },
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "Spectrometer confirms thin water-ice condensation on top of iron oxide rocks! This proves seasonal atmospheric moisture cycling."
        },
        outcomeText: "The robotic arm scraped and sealed 12 grams of morning frost. Spectrometry reveals it is micro-fine water-ice crystals.",
        science: {
          text: "NASA rovers and orbiters regularly observe seasonal frost forming at high Martian latitudes during early morning hours, sublimating directly back into gas as the sun rises.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "real_observation"
        }
      },
      {
        id: "choice_remote_photo",
        label: "Perform Remote Optical Multispectral Photography",
        preview: "Photograph the frost deposits from the habitat observation cupola to preserve power.",
        tradeoff: "Consumes negligible power (+5% Power preserved), but provides preliminary visual data.",
        deltas: { power: +5, lifeSupport: 0, radiationSafety: 0 },
        flags: ["frost_photographed"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Dr. Evelyn Reed",
          role: "Medical Officer",
          text: "The high-resolution photos are gorgeous through the cupola glass. The frost began sublimating within twenty minutes of sunrise."
        },
        outcomeText: "Multispectral imaging confirmed the crystals rapidly sublimated in the low Martian atmospheric pressure.",
        science: {
          text: "Mars' atmospheric pressure is less than 1% of Earth's. Under these conditions, ice transitions directly from a solid into gas (sublimation) rather than melting into liquid.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_ignore_frost",
        label: "Conserve Outpost Resources & Skip Exploration",
        preview: "Prioritize routine habitat maintenance and leave the deposits unexplored.",
        tradeoff: "Directs all energy into primary battery reserves (+10% Power), but misses a planetary science opportunity.",
        deltas: { power: +10, lifeSupport: 0, radiationSafety: 0 },
        flags: ["frost_skipped"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Our batteries stay fully devoted to habitat systems. Survival comes before geology."
        },
        outcomeText: "The frost sublimated quietly into the dawn while the outpost directed energy to primary battery reserves.",
        science: {
          text: "In space mission operations, flight controllers frequently weigh the scientific value of fleeting surface phenomena against finite spacecraft electrical budgets.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "gameplay_simplification"
        }
      }
    ]
  },

  // Event 4: The Suit That Won't Let You Go Home
  "evt_suit_dust": {
    id: "evt_suit_dust",
    title: "The Suit That Won't Let You Go Home",
    type: "random",
    eligibleSlots: [6, 8, 11, 15],
    radiationAffecting: false,
    intro: "Marcus returned from checking array wiring. The airlock contamination sensor blares: his EVA suit is coated with unusually clinging, abrasive Martian dust.",
    choices: [
      {
        id: "choice_deep_clean_suit",
        label: "Execute Full Airlock Vacuum & Electrostatic Wash",
        preview: "Run a rigorous multi-stage cleaning cycle in the secondary airlock bay.",
        tradeoff: "Burns 5% Power to run airlock vacuum pumps, but 100% protects cabin air filters (+5% LS).",
        deltas: { power: -5, lifeSupport: +5, radiationSafety: 0 },
        flags: ["suit_deep_cleaned"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Dr. Evelyn Reed",
          role: "Medical Officer",
          text: "Good call, Commander. That dust carries toxic perchlorates. Keeping it out of our cabin protects our lungs and our scrubber filters."
        },
        outcomeText: "The airlock's vacuum cycle dislodged 99% of particulate into external collection traps. Habitat air remains pristine.",
        science: {
          text: "Martian regolith dust contains chemical salts known as perchlorates, which are hazardous to human thyroids and lungs. Strict airlock decontamination protocols are required for human missions.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_isolate_suit",
        label: "Isolate Spacesuit in Exterior Airlock Chamber",
        preview: "Leave the contaminated suit locked in the outer chamber without burning pump power.",
        tradeoff: "Saves power now, but restricts exterior EVA operations until the suit is cleared.",
        deltas: { power: 0, lifeSupport: 0, radiationSafety: 0 },
        flags: ["suit_isolated"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Suit is sealed tight in Chamber B. We save our power grid, but no one's going outside until we decontaminate it."
        },
        outcomeText: "The suit was safely isolated in the outer airlock lockbox without allowing particulate into the main habitat bays.",
        science: {
          text: "NASA concept studies for Mars habitats often feature 'suitports' or isolated airlock zones where spacesuits remain outside the living pressurized volumes at all times.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_bypass_dust_protocol",
        label: "Quick Brush & Rapid Entry to Conserve Time",
        preview: "Use a simple handheld brush and enter immediately into the crew cabin.",
        tradeoff: "Saves power (+5%), but airborne dust clogs cabin filters (-5% LS now, and -10% LS on Sol 11!).",
        deltas: { power: +5, lifeSupport: -5, radiationSafety: 0 },
        flags: ["dust_protocol_bypassed"],
        pendingEffects: [
          {
            id: "pe_dust_clog",
            triggerSol: 11,
            deltas: { power: 0, lifeSupport: -10, radiationSafety: 0 },
            logText: "Unvacuumed suit dust from Sol 8 has clogged cabin air circulation scrubbers.",
            cause: "Sol 8 suit cleaning bypassed"
          }
        ],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Dr. Evelyn Reed",
          role: "Medical Officer",
          text: "Commander, this dust smells like sulfur and ozone. Our HEPA scrubbers are already straining to filter it!"
        },
        outcomeText: "Fine, jagged dust entered the living area. The crew is coughing, and cabin filters report developing clogging.",
        science: {
          text: "Martian dust grains are not smoothed by running water like Earth sand; they are jagged, sharp glass-like shards created by meteorite impacts that degrade mechanical seals quickly.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      }
    ]
  },

  // Event 5: The Oxygen That Disappeared Slowly
  "evt_oxygen_rate": {
    id: "evt_oxygen_rate",
    title: "The Oxygen That Disappeared Slowly",
    type: "random",
    eligibleSlots: [8, 11, 15],
    radiationAffecting: false,
    intro: "Habitat atmospheric pressure sensors read a normal 101 kPa, but the Sabatier oxygen generation reactor reports a subtle 15% drop in hourly production rate.",
    choices: [
      {
        id: "choice_run_o2_diagnostic",
        label: "Run Full Electrolyzer Diagnostic",
        preview: "Expend electrical power to run diagnostic tomography across oxygen generation cells.",
        tradeoff: "Consumes small power (-5%), but pinpoints cathode scaling and restores generation rate (+10% LS).",
        deltas: { power: -5, lifeSupport: +10, radiationSafety: 0 },
        flags: ["o2_diagnostic_cleared"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Diagnostic caught mineral buildup in electrolysis cell #3 before it caused a total shutdown. Production is back to 100%!"
        },
        outcomeText: "Engineers descaled the electrolysis cell, restoring full oxygen production rate across habitat scrubbers.",
        science: {
          text: "A life-support system can maintain normal cabin pressure while still experiencing falling oxygen production if nitrogen buffer gas or reserve tanks mask the deficit.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_switch_backup_o2",
        label: "Switch to Stored Chemical Oxygen Candles",
        preview: "Activate secondary solid chemical oxygen generators without burning diagnostic grid power.",
        tradeoff: "Conserves battery power (+5%), but consumes finite consumable emergency reserves.",
        deltas: { power: +5, lifeSupport: 0, radiationSafety: 0 },
        flags: ["backup_candles_burned"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Dr. Evelyn Reed",
          role: "Medical Officer",
          text: "Chemical oxygen candles are burning cleanly, but once they're gone, we have fewer emergency reserves for Chapter 3."
        },
        outcomeText: "Backup chemical candles stabilized the cabin atmosphere, bypassing the developing primary reactor issue.",
        science: {
          text: "Space habitats like the ISS carry solid sodium chlorate 'oxygen candles' as emergency backup generators when primary water electrolysis units undergo maintenance.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_ration_o2_power",
        label: "Reduce Nonessential Cabin Power While Investigating",
        preview: "Dim lighting and shut down laboratory instruments to ease electrical load on life support.",
        tradeoff: "Saves 10% Power, but slows operational pace (-5% LS).",
        deltas: { power: +10, lifeSupport: -5, radiationSafety: 0 },
        flags: ["o2_power_rationed"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Cabin is dim and quiet. We're keeping our power margin healthy while Marcus troubleshoots the valves."
        },
        outcomeText: "Power rationing prevented electrical brownouts, giving engineers time to stabilize the oxygen generation loop.",
        science: {
          text: "Spaceflight emergency procedures emphasize electrical load-shedding to protect critical environmental control and life support systems during anomalies.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      }
    ]
  },

  // Event 6: The Frozen Battery Surprise
  "evt_frozen_battery": {
    id: "evt_frozen_battery",
    title: "The Frozen Battery Surprise",
    type: "random",
    eligibleSlots: [6, 11, 19],
    radiationAffecting: false,
    intro: "During nighttime exploration, the robotic survey rover reports a sudden 40% loss in discharge capacity as exterior temperatures plummet to -85°C.",
    choices: [
      {
        id: "choice_rover_thermal_shed",
        label: "Recall Rover to Heated Habitat Garage",
        preview: "Drive the rover back into the outpost thermal bay and connect shore power heaters.",
        tradeoff: "Burns 5% Outpost Power for heating, but completely restores rover battery performance.",
        deltas: { power: -5, lifeSupport: 0, radiationSafety: 0 },
        flags: ["rover_thermal_protected"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Rover cells are warm again. Lithium-ion chemistry recovers nicely once internal electrolyte thaws."
        },
        outcomeText: "The rover was brought into the heated bay. As its internal temperature rose above -20°C, battery capacity fully recovered.",
        science: {
          text: "Cold temperatures do not automatically cause permanent damage to batteries; extreme cold dramatically slows internal chemical kinetics, causing a temporary loss of usable power that recovers when heated.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_rover_shut_instruments",
        label: "Shut Down Scientific Payloads & Warm Core Electronics",
        preview: "Keep the rover in the field, shutting down cameras and drills to divert all remaining energy to internal survival heaters.",
        tradeoff: "Conserves habitat power (+5%), but halts exterior research for 1 sol.",
        deltas: { power: +5, lifeSupport: 0, radiationSafety: 0 },
        flags: ["rover_instruments_safed"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "Instruments are asleep. It hurts to pause our geology survey, but keeping the rover alive comes first."
        },
        outcomeText: "Internal survival heaters kept the rover core alive in the field without drawing any energy from the habitat grid.",
        science: {
          text: "NASA rovers like Curiosity and Perseverance utilize radioisotope heaters and electrical survival heater loops to prevent critical avionics from freezing during the Martian night.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "real_observation"
        }
      },
      {
        id: "choice_push_rover_night",
        label: "Push Rover Exploration Through the Cold",
        preview: "Order the rover to continue drilling despite freezing temperatures to complete the survey.",
        tradeoff: "Completes research, but permanent cell degradation causes an ongoing -2% Power loss!",
        deltas: { power: -5, lifeSupport: -5, radiationSafety: 0 },
        flags: ["rover_pushed_hard"],
        pendingEffects: [],
        modifiers: [
          {
            id: "mod_rover_wear",
            resource: "power",
            perSol: -2,
            expiresSol: 25,
            label: "Damaged rover battery cells"
          }
        ],
        removesModifiers: [],
        objectiveChanges: { researchSamples: true },
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "We got the core sample, but internal lithium plating occurred in cell #2. It won't hold full charge again."
        },
        outcomeText: "The rover finished its core drill, but cold-temperature discharge permanently degraded several battery cells.",
        science: {
          text: "Forcing high-current electrical discharge through lithium-based batteries at severe sub-zero temperatures causes lithium metal plating, leading to permanent capacity degradation.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      }
    ]
  },

  // Event 7: The Mars Radio Silence (Solar Conjunction)
  "evt_radio_silence": {
    id: "evt_radio_silence",
    title: "The Mars Radio Silence",
    type: "random",
    eligibleSlots: [23, 27],
    radiationAffecting: false,
    intro: "Orbital telemetry confirms the Sun is entering alignment directly between Earth and Mars. The Sun's hot, ionized outer corona is distorting radio waves, cutting off all link attempts.",
    choices: [
      {
        id: "choice_preloaded_instructions",
        label: "Execute Preloaded Orbital Sequence",
        preview: "Follow autonomous sequencing preprogrammed before the conjunction began.",
        tradeoff: "Safe and predictable; conditions systems smoothly (+15% Power, +5% LS).",
        deltas: { power: +15, lifeSupport: +5, radiationSafety: 0 },
        flags: ["preloaded_conjunction_done"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Our pre-programmed routines are steady. We don't need Earth telling us how to run our daily checklist."
        },
        outcomeText: "The outpost smoothly executed preloaded maintenance, keeping environmental scrubbers operating at peak stability.",
        science: {
          text: "During real Mars solar conjunctions, NASA flight teams send weeks of pre-programmed commands in advance and halt transmission, allowing rovers and orbiters to operate independently.",
          sourceId: "mars-solar-conjunction",
          typeTag: "real_observation"
        }
      },
      {
        id: "choice_independent_research",
        label: "Reallocate Transmitter Power to Local Surface Science",
        preview: "Shut down high-gain transceivers and divert electrical power into Dr. Al-Mansoor's geological spectrometers.",
        tradeoff: "Advances research objectives (+5% LS), but preserves baseline power.",
        deltas: { power: 0, lifeSupport: +5, radiationSafety: 0 },
        flags: ["conjunction_science_boosted"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: { researchSamples: true },
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "With the radio quiet, we have full lab bandwidth! We've made great progress analyzing sub-surface mineral cores."
        },
        outcomeText: "Transmitter power was routed into the science bay. Dr. Al-Mansoor completed analysis of deep core samples.",
        science: {
          text: "Solar conjunction occurs approximately every 26 months. Mission controllers treat it as a planned scientific window rather than an emergency.",
          sourceId: "mars-solar-conjunction",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_suspend_nonessential",
        label: "Power Down Nonessential Systems to Low-Power Standby",
        preview: "Enter deep conservation mode until Earth emerges from behind the Sun.",
        tradeoff: "Restores +15% Power reserves, but pauses nonessential life-support recycling (-5% LS).",
        deltas: { power: +15, lifeSupport: -5, radiationSafety: 0 },
        flags: ["conjunction_standby"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Standby grid is clean. We're banking battery energy for the final Sol 30 push!"
        },
        outcomeText: "The habitat rested in low-power standby mode, maximizing battery reserves for the final campaign chapter.",
        science: {
          text: "The Sun's corona does not physically destroy spacecraft electronics; ionized gas simply degrades radio signal integrity, causing data packets to corrupt in transit.",
          sourceId: "mars-solar-conjunction",
          typeTag: "scientific_explanation"
        }
      }
    ]
  },

  // Event 8: The Habitat's Mysterious Temperature Drop
  "evt_temp_drop": {
    id: "evt_temp_drop",
    title: "The Habitat's Mysterious Temperature Drop",
    type: "random",
    eligibleSlots: [3, 11, 15],
    radiationAffecting: false,
    intro: "Sensor Bay 4 reports ambient temperature has plummeted to 4°C, while adjacent living quarters report a pleasant 21°C. Is the heating loop failing, or is a sensor malfunctioning?",
    choices: [
      {
        id: "choice_cross_check_sensors",
        label: "Cross-Check Telemetry with Backup Infrared Thermometers",
        preview: "Use handheld thermal cameras to physically measure temperature before cycling heaters.",
        tradeoff: "Conserves battery power (+5% Power, +5% LS) and reveals the issue is an isolated sensor glitch.",
        deltas: { power: +5, lifeSupport: +5, radiationSafety: 0 },
        flags: ["sensors_cross_checked"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Dr. Evelyn Reed",
          role: "Medical Officer",
          text: "Physical check confirms Bay 4 is at 20°C! The wall sensor had a cold-solder crack. No heating failure at all."
        },
        outcomeText: "Physical inspection proved the temperature drop was an isolated sensor glitch. The habitat was never at risk.",
        science: {
          text: "Spaceflight instrumentation frequently experiences false alarm anomalies caused by thermal expansion stress on sensor wiring. Verifying with redundant sensors prevents wasteful emergency responses.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_boost_heaters",
        label: "Immediately Blast Auxiliary Heaters to Protect Bay",
        preview: "Assume the temperature drop is genuine and crank auxiliary heating elements to maximum.",
        tradeoff: "Ensures safety, but burns 15% Power unnecessarily if the reading is a false alarm.",
        deltas: { power: -15, lifeSupport: +5, radiationSafety: 0 },
        flags: ["heaters_boosted_blindly"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Auxiliary coils kicked on, but Bay 4 turned into a sauna! It was just a broken sensor. We wasted power for nothing."
        },
        outcomeText: "Auxiliary heaters surged into the bay. Temperatures rose safely, but substantial battery reserves were spent.",
        science: {
          text: "Aerospace thermal control systems use thermostats and automated resistive heating strips, but reacting blindly without diagnostic confirmation wastes critical electrical reserves.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_ignore_temp",
        label: "Ignore Reading & Continue Normal Operations",
        preview: "Assume it is a false alarm without investigating.",
        tradeoff: "Conserves power (+5%), but risks pipe freezing if the sensor was correct (-10% LS).",
        deltas: { power: +5, lifeSupport: -10, radiationSafety: 0 },
        flags: ["temp_drop_ignored"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "We avoided touching the heating grid, but condensation froze on secondary plumbing before we caught it."
        },
        outcomeText: "Ignoring the warning allowed localized frost to form along condensation lines, stressing the water recycling loop.",
        science: {
          text: "Thermal management on Mars is unforgiving. Surface habitats face exterior swings from 0°C at noon to -90°C at night, requiring constant active thermal monitoring.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      }
    ]
  },

  // =========================================================================
  // FIXED CAMPAIGN MILESTONES & CRISES
  // =========================================================================

  // Sol 14: Solar Particle Event (SPE) - Fixed Chapter 3 Central Crisis
  "evt_solar_particle": {
    id: "evt_solar_particle",
    title: "Chapter 3 Crisis: Solar Particle Event (SPE)",
    type: "story",
    eligibleSlots: [14],
    radiationAffecting: true, // Developer allow-list guard enabled
    intro: "Space weather monitors detect an intense Coronal Mass Ejection (CME) erupting toward Mars. A major solar proton shower will hit the outpost within six hours!",
    choices: [
      {
        id: "choice_storm_shelter",
        label: "Retreat Crew to Water/Regolith-Shielded Storm Shelter",
        preview: "Enforce strict shelter protocol: crew retreats to the heavily shielded underground storm bunker.",
        tradeoff: "Nonessential systems power down (-10% Power, -5% LS), but crew is 100% protected (+15% Radiation Safety).",
        deltas: { power: -10, lifeSupport: -5, radiationSafety: +15 },
        flags: ["storm_shelter_used"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: { shelterProtocolsMaintained: true },
        crewReaction: {
          speaker: "Dr. Evelyn Reed",
          role: "Medical Officer",
          text: "The storm shelter water jackets and regolith roof blocked the proton flux. Crew radiation dosimetry is virtually zero!"
        },
        outcomeText: "The crew stayed in the underground storm shelter for 18 hours until the proton storm subsided. Radiation safety remains pristine.",
        science: {
          text: "Because Mars lacks a global protective magnetic field, astronauts require dedicated 'storm shelters' shielded by water tanks or meters of Martian regolith soil during solar particle events.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_active_scrubbers",
        label: "Deploy Active Electromagnetic Particulate Deflectors",
        preview: "Attempt to protect the upper living modules by energizing external electromagnetic deflector coils.",
        tradeoff: "Severe power drain (-20% Power), but protects both life support and radiation readiness.",
        deltas: { power: -20, lifeSupport: +5, radiationSafety: +5 },
        flags: ["em_coils_deployed"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Coils drew massive electrical current, but they deflected the charged particle wavefront away from our living quarters."
        },
        outcomeText: "Active electromagnetic coils absorbed the CME wave. Living quarters stayed pressurized, but outpost battery banks took a heavy drain.",
        science: {
          text: "NASA and international researchers study active magnetic and electrostatic shielding concepts as potential supplements to passive regolith mass for future planetary surface outposts.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_stay_lab_work",
        label: "Remain in Main Labs to Finish Array Wiring",
        preview: "Keep crew working in the main habitat dome to finish critical power grid connections.",
        tradeoff: "Keeps power grid online (+10%), but crew habitat absorbs radiation (-25% Radiation Safety).",
        deltas: { power: +10, lifeSupport: 0, radiationSafety: -25 },
        flags: ["shelter_bypassed"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: { shelterProtocolsMaintained: false },
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "We finished the array connections, but habitat dosimeters spiked. We violated safe shelter protocols."
        },
        outcomeText: "Electrical connections were completed, but the habitat roof absorbed moderate cosmic radiation dosage, compromising radiation readiness.",
        science: {
          text: "Bypassing radiation storm shelters during solar particle events exposes crew and habitat avionics to ionizing radiation that degrades electronic components and safety margins.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      }
    ]
  },

  // Sol 21: High-Gain Antenna Realignment - Fixed Chapter 4 Milestone
  "evt_antenna_alignment": {
    id: "evt_antenna_alignment",
    title: "Chapter 4 Milestone: High-Gain Antenna Calibration",
    type: "story",
    eligibleSlots: [21],
    radiationAffecting: false,
    intro: "With the relay blackout investigated, Marcus Vance needs command approval to recalibrate the main 3.2-meter parabolic high-gain dish toward Earth's orbital plane.",
    choices: [
      {
        id: "choice_align_antenna",
        label: "Execute Precise Stepper-Motor Antenna Calibration",
        preview: "Devote 5% Power to run elevation actuators and lock onto Earth's beacon frequency.",
        tradeoff: "Consumes 5% Power, but unlocks the antenna alignment objective required for mission success!",
        deltas: { power: -5, lifeSupport: 0, radiationSafety: 0 },
        flags: ["antenna_aligned"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: { antennaAligned: true },
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Dish is locked on target azimuth! We now have line-of-sight to the Deep Space Network."
        },
        outcomeText: "The high-gain dish smoothly pivoted and locked onto Earth's coordinates. Carrier link alignment verified.",
        science: {
          text: "Mars parabolic antennas must track Earth with sub-degree accuracy across astronomical distances to ensure focused radio wave beam transmission.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_defer_antenna",
        label: "Conserve Power & Defer Calibration to Sol 25",
        preview: "Postpone antenna motor alignment to protect battery reserves.",
        tradeoff: "Saves power now (+5%), but leaves the antenna unaligned.",
        deltas: { power: +5, lifeSupport: 0, radiationSafety: 0 },
        flags: ["antenna_deferred"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: { antennaAligned: false },
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Actuators are powered down. We keep our electrical cushion, but we can't transmit until that dish is aligned."
        },
        outcomeText: "Antenna motors were kept offline to conserve power for habitat heaters.",
        science: {
          text: "Spacecraft power budgeting requires choosing which subsystems receive priority when reserves are depleted.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "gameplay_simplification"
        }
      }
    ]
  },

  // Sol 22: Shielding Readiness Check - Fixed Chapter 4 Radiation Decision
  "evt_regolith_shielding": {
    id: "evt_regolith_shielding",
    title: "Chapter 4 Decision: Regolith Berm Reinforcement",
    type: "story",
    eligibleSlots: [22],
    radiationAffecting: true, // Developer allow-list guard enabled
    intro: "High-altitude cosmic ray sensors indicate solar activity is rising again. Dr. Reed recommends reinforcing habitat regolith shielding berms before the final communication push.",
    choices: [
      {
        id: "choice_reinforce_berm",
        label: "Deploy Rover Excavator to Pile Protective Regolith",
        preview: "Use the rover scoop to build up a 50cm protective soil layer over the habitat dome roof.",
        tradeoff: "Burns 5% Power, but strengthens radiation safety by +15%.",
        deltas: { power: -5, lifeSupport: 0, radiationSafety: +15 },
        flags: ["berm_reinforced"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Dr. Evelyn Reed",
          role: "Medical Officer",
          text: "The additional half-meter of Martian soil provides an outstanding radiation barrier for our living quarters!"
        },
        outcomeText: "The rover bulldozer piled compacted Martian regolith over the dome, providing reinforced shielding against cosmic rays.",
        science: {
          text: "In-situ resource utilization (ISRU) concepts rely on Martian regolith (soil) as a natural radiation shield, since transporting heavy lead or water shields from Earth is prohibitively expensive.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "scientific_explanation"
        }
      },
      {
        id: "choice_skip_berm",
        label: "Skip Berm Work to Save Rover Power",
        preview: "Rely on existing habitat shielding and keep battery banks untouched.",
        tradeoff: "Saves power (+5%), but leaves radiation safety margin unimproved.",
        deltas: { power: +5, lifeSupport: 0, radiationSafety: 0 },
        flags: ["berm_skipped"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Rover power is safe in the battery banks. Our existing shielding will have to carry us through Sol 30."
        },
        outcomeText: "Command prioritized power conservation over additional soil shielding reinforcement.",
        science: {
          text: "Space engineers constantly balance passive radiation shielding mass against operational mobility and electrical constraints.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "gameplay_simplification"
        }
      }
    ]
  },

  // Sol 30: Final Transmission Climax
  "evt_final_transmission": {
    id: "evt_final_transmission",
    title: "Sol 30 Climax: The Last Signal to Earth",
    type: "story",
    eligibleSlots: [30],
    radiationAffecting: false,
    intro: "The 30-sol campaign window is closing. Earth has swung into the optimal sky quadrant. It is time to energize the high-gain transmitter and send the survival signal home!",
    choices: [
      {
        id: "choice_transmit_signal",
        label: "Energize High-Gain Transmitter Array & Send Data Carrier",
        preview: "Channel primary power to broadcast telemetry, scientific samples, and crew survival logs to Earth.",
        tradeoff: "Requires aligned antenna and Power >= 30%. Determines the mission ending!",
        deltas: { power: -10, lifeSupport: 0, radiationSafety: 0 },
        flags: ["final_signal_transmitted"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Houston, this is ARES-1. We have survived 30 sols. We hear you loud and clear!"
        },
        outcomeText: "The 3.2-meter high-gain transmitter roared to life, firing a high-frequency carrier wave across millions of kilometers of deep space.",
        science: {
          text: "NASA Deep Space Network dishes in California, Spain, and Australia maintain constant listening watches for radio carrier signals emitted by Mars exploration assets.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "real_observation"
        }
      }
    ]
  }
};
