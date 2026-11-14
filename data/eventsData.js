/**
 * ARES: The Last Signal - Events & Story Data Registry
 * 
 * Conforms to Event/Choice Schema defined in DESIGN.md.
 * Sols 1–8 Vertical Slice Events:
 * - Sol 3: evt_solar_dust (The Mysterious Solar Panel Miracle)
 * - Sol 6: evt_frost (The Red Snow That Isn't Snow)
 * - Sol 8: evt_suit_dust (The Suit That Won't Let You Go Home)
 */

export const EVENTS_DATA = {
  "evt_solar_dust": {
    id: "evt_solar_dust",
    title: "The Mysterious Solar Panel Miracle",
    type: "random",
    eligibleSlots: [3],
    radiationAffecting: false,
    intro: "A localized dust vortex swept across the western array field. Telemetry confirms solar energy output has suddenly surged by 25%.",
    choices: [
      {
        id: "choice_recharge",
        label: "Charge Reserve Battery Banks",
        preview: "Divert the full incoming surge into habitat battery storage cells.",
        tradeoff: "Provides an immediate +15% Power surge, but leaves the panel mechanisms uninspected.",
        deltas: { power: +15, lifeSupport: 0, radiationSafety: 0 },
        flags: ["batteries_charged"],
        pendingEffects: [],
        modifiers: [],
        removesModifiers: [],
        objectiveChanges: {},
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Capacitor banks are humming! That +15% gives us a comfortable electrical reserve for the freezing night."
        },
        outcomeText: "Storage capacitors are fully charged to maximum density, creating a reliable power buffer.",
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
        tradeoff: "Moderate power gain (+5%) and life support efficiency (+5%), while completely eliminating electrical wear.",
        deltas: { power: +5, lifeSupport: +5, radiationSafety: 0 },
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

  "evt_frost": {
    id: "evt_frost",
    title: "The Red Snow That Isn't Snow",
    type: "random",
    eligibleSlots: [6],
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
        tradeoff: "Consumes negligible power, but provides only preliminary visual research data.",
        deltas: { power: 0, lifeSupport: 0, radiationSafety: 0 },
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
        tradeoff: "Zero resource expenditure, but misses an opportunity for planetary science.",
        deltas: { power: +5, lifeSupport: 0, radiationSafety: 0 },
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
        outcomeText: "The frost sublimated quietly into the Martian dawn while the outpost directed energy to primary battery reserves.",
        science: {
          text: "In space mission operations, flight controllers frequently weigh the scientific value of fleeting surface phenomena against finite spacecraft electrical budgets.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "gameplay_simplification"
        }
      }
    ]
  },

  "evt_suit_dust": {
    id: "evt_suit_dust",
    title: "The Suit That Won't Let You Go Home",
    type: "random",
    eligibleSlots: [8],
    radiationAffecting: false,
    intro: "Marcus returned from checking array wiring. The airlock contamination sensor blares: his EVA suit is coated with unusually clinging, abrasive Martian dust.",
    choices: [
      {
        id: "choice_deep_clean_suit",
        label: "Execute Full Airlock Vacuum & Electrostatic Wash",
        preview: "Run a rigorous multi-stage cleaning cycle in the secondary airlock bay.",
        tradeoff: "Burns 10% Power to run airlock vacuum pumps, but 100% protects cabin air filters.",
        deltas: { power: -10, lifeSupport: +5, radiationSafety: 0 },
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
        tradeoff: "Zero power spent, but airborne dust clogs cabin filters, causing -10% Life Support later on Sol 11!",
        deltas: { power: 0, lifeSupport: -5, radiationSafety: 0 },
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
  }
};
