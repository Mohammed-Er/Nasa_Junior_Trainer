/**
 * ARES: The Last Signal - Events & Story Data Registry
 * 
 * Conforms to Event/Choice Schema defined in DESIGN.md.
 * Rules:
 * - Only immediate deltas are visible on choice preview cards.
 * - Flags, pendingEffects, and modifiers are concealed until the decision outcome.
 * - triggerSol on any pendingEffect MUST be <= 29.
 * - radiationAffecting must be true for any event altering radiationSafety.
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
        // Payoff: Prevents electrical breaker faults in later chapters and provides immediate LS efficiency
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
        // Payoff: Unlocks a specialized cleaning protocol during the Sol 15 dust event, avoiding a severe -20% Power loss!
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
  }
};
