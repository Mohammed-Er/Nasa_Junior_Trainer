# ARES: The Last Signal — Technical Design Document (DESIGN.md)
**Version:** 2.1 (Pre-Stage 4 Specification)  
**Status:** Architecture Locked — Pending User Approval before Stage 4 Implementation.

---

## 1. System Schemas

### 1.1 Complete Game State Schema (`gameState.js`)
```javascript
{
  saveVersion: 1,                    // Incremented on schema changes; reset safely on mismatch
  seed: 18349275,                    // 32-bit integer for Mulberry32 PRNG (campaign init only)
  
  // Progression
  sol: 1,                            // 1 to 30
  chapter: 1,                        // 1 to 5
  status: "active",                  // "briefing" | "active" | "critical_grace" | "interrupted" | "completed"
  currentScreen: "game",             // "welcome" | "briefing" | "game" | "outcome" | "ending"
  currentTab: "mission",             // "mission" | "resources" | "log"
  
  // Guard & Triage Flags
  awaitingDecision: false,           // Persistent guard: true when decision card is active, disables double-clicks
  graceUsed: false,                  // True if the 1-time emergency triage path has already been spent
  endingReason: null,                // Explanatory text for ending or abort
  
  // Exactly Three Core Indicators (0 - 100%)
  resources: {
    power: 85,
    lifeSupport: 85,
    radiationSafety: 80              // Starts at 80 (not 95)
  },
  
  // Communication Subsystem
  comm: {
    status: "blackout",              // "blackout" | "intermittent" | "restored"
    nextWindowSol: 4                 // Sol when next Earth transmission window opens
  },

  // Tracked Mission Objectives (All start false; >= 3 required for Beyond the Silence)
  objectives: {
    commsRestored: false,            // Final goal: high-gain alignment & transmitter sync
    antennaAligned: false,           // Ch 4 relay dish alignment completed
    researchSamples: false,          // True if >= 2 Martian surface/frost samples analyzed
    panelsUnderstood: false,         // Solar array dust dynamics understood via inspection
    shelterProtocolsMaintained: false// True if storm shelter was properly utilized during SPE
  },

  // Decision Memory Flags
  flags: {
    // e.g., "panels_inspected": true, "circuits_preserved": true
  },

  // Deterministic Event Schedule (Generated at campaign start via seeded shuffle + backtrack)
  eventSchedule: {
    // e.g., { "3": "evt_solar_dust", "6": "evt_frost", ... }
  },

  // Active Delayed & Ongoing Mechanics
  pendingEffects: [
    // { id, triggerSol, deltas: { power, lifeSupport, radiationSafety }, logText, cause }
    // Enforced rule: triggerSol <= 29
  ],
  modifiers: [
    // { id, resource: "power"|"lifeSupport"|"radiationSafety", perSol, expiresSol, label }
  ],
  
  // Communication Queues
  commQueue: [
    // { id, sentOnSol, deliverOnSol, sender, subject, body, validIf, staleVariant }
  ],
  commHistory: [],

  // Audits & Outcome Snapshot
  recentChanges: [],                 // Feeds "Recent Changes & Causes" on Resources tab
  logHistory: [],                    // Chronological Mission Log
  lastResolution: null,              // Holds active ResolutionResult for refresh recovery
  overnightReport: null              // Summary of overnight modifiers/pending effects on advanceSol
}
```

---

### 1.2 Event & Choice Schema (`data/eventsData.js`)
```typescript
interface EventDefinition {
  id: string;                        // Unique identifier (e.g., "evt_solar_dust")
  title: string;                     // Kid-friendly title (e.g., "The Mysterious Solar Panel Miracle")
  type: "story" | "random" | "briefing";
  eligibleSlots: number[];           // Sol slots where this event may occur (e.g., [3])
  radiationAffecting: boolean;       // Dev guard: must be true to allow radiationSafety deltas
  intro: string;                     // Short narrative briefing of the situation
  choices: ChoiceDefinition[];       // Exactly 2 or 3 distinct choices
}

interface ChoiceDefinition {
  id: string;                        // e.g., "choice_inspect"
  label: string;                     // e.g., "Inspect Array Mechanisms"
  preview: string;                   // Tactical summary visible before selection
  tradeoff: string;                  // Explicit cost/benefit description visible to player
  deltas: {                          // Immediate resource costs (revealed on card)
    power: number;
    lifeSupport: number;
    radiationSafety: number;
  };
  flags: string[];                   // Flags set upon confirmation (hidden until outcome)
  pendingEffects: PendingEffect[];   // Delayed effects (hidden until outcome, triggerSol <= 29)
  modifiers: ModifierDefinition[];   // Ongoing modifiers added (hidden until outcome)
  removesModifiers: string[];        // Modifier IDs removed by this choice
  objectiveChanges: Partial<Record<string, boolean>>; // e.g., { panelsUnderstood: true }
  crewReaction: {
    speaker: string;                 // e.g., "Marcus Vance"
    role: string;                    // e.g., "Systems & Power Engineer"
    text: string;                    // In-character reaction to the command
  };
  outcomeText: string;               // Narrative description of the result
  science: {
    text: string;                    // Educational scientific explanation
    sourceId: string;                // References entry in sources.js
    typeTag: "real_observation" | "scientific_explanation" | "gameplay_simplification" | "fictional";
  };
}
```

---

### 1.3 Campaign Beat Schema (`data/campaign.js`)
```typescript
interface CampaignBeat {
  sol: number;                       // 1 to 30
  chapter: number;                   // 1 to 5
  type: "story" | "briefing" | "crisis" | "milestone";
  title: string;
  intro: string;
  requires?: string[];               // Only active if all listed flags exist
  excludes?: string[];               // Inactive if any listed flag exists
  dialogueVariants: {
    condition?: string;              // Flag required for this variant (null for default)
    speaker: string;
    role: string;
    text: string;
  }[];
  fixedEventId?: string;             // References a fixed story event (e.g., Sol 14 SPE Crisis)
}
```

---

### 1.4 Communication Message Schema (`data/commData.js`)
```typescript
interface CommMessage {
  id: string;                        // e.g., "msg_relay_echo"
  sender: string;                    // e.g., "Flight Director Chen // Mission Control Houston"
  subject: string;                   // e.g., "Outdated Relay Diagnostics"
  body: string;                      // Primary message body
  sentOnSol: number;                 // Sol when transmitted
  deliverOnSol: number;              // Sol when received (sentOnSol + 1 to 2)
  validIf?: string | null;           // Flag condition required for primary message validity
  staleVariant?: string;             // Alternate text delivered if validIf condition has lapsed
}
```

---

## 2. Rules Decided in Writing

### 2.1 Closed Resource Bands & COSTLY_SUCCESS_MIN
To eliminate undefined gaps in indicator evaluation:
* **Optimal Band:** `60% to 100%` (`[OPTIMAL]`, Green)
* **Caution Band:** `20% to 59%` (`[CAUTION]`, Amber/Yellow)
* **Critical Band:** `1% to 19%` (`[CRITICAL]`, Red)
* **Depleted Band:** `0%` (Triggers one-time Lifeboat Grace Triage or Mission Abort)

**`COSTLY_SUCCESS_MIN` Definition:**
`COSTLY_SUCCESS_MIN = 20`. On Sol 30, for a mission to achieve *"A Costly Success"*, **all three resources must be $\ge 20\%$**. If any resource is $<20\%$ or at $0\%$, the outpost cannot safely support crew survival during post-mission operations, triggering *"Mission Interrupted"*.

---

### 2.2 Objective Tracking & "$\ge 3$" Rule
All 5 tracked objectives start **`false`**:
1. `commsRestored`: Primary mission victory condition.
2. `antennaAligned`: Completed during Chapter 4 antenna calibration.
3. `researchSamples`: Completed if player analyzes $\ge 2$ surface/frost samples.
4. `panelsUnderstood`: Completed if player chooses to inspect arrays in Event 1.
5. `shelterProtocolsMaintained`: Completed if player uses the water/regolith storm shelter during the Sol 14 Solar Particle Event.

**Winning Rule:**
- **Beyond the Silence:** `commsRestored === true` AND `all resources >= 60%` AND `completedCount >= 3`.
- **A Costly Success:** `commsRestored === true` AND `all resources >= 20%` (but below 60% or fewer than 3 objectives).
- **Mission Interrupted:** `commsRestored === false` OR `any resource < 20%` OR `abortTriggered`.

---

### 2.3 What Sets `commsRestored`
`commsRestored` is **not** set arbitrarily. On **Sol 30**, the final transmission requires:
1. `antennaAligned === true` (from Chapter 4 calibration), AND
2. `power >= 30` (sufficient power to energize the high-gain transmitter).

If both conditions are met, `commsRestored = true`. If the antenna is unaligned or power is below 30%, the transmission fails, setting `commsRestored = false` and `endingReason = "High-gain transmitter lacked alignment or power to establish carrier lock with Earth."`.

---

### 2.4 Sol 14 Fixed Story Crisis: Solar Particle Event (SPE)
*Note: This is a fixed story beat, NOT one of the 8 random events.* Space weather sensors detect a Coronal Mass Ejection (CME) heading toward Mars.

* **Choice A: Retreat Crew to Water/Regolith-Shielded Storm Shelter (Safe & Balanced)**  
  * Immediate Cost: `Power: -10, Life Support: -5, Radiation Safety: +10`  
  * Objective: Sets `shelterProtocolsMaintained = true`.  
  * Trade-off: Nonessential air circulation is dialed down, but crew is 100% shielded by the outpost's water jacket and regolith embankment.
* **Choice B: Deploy Habitat Electromagnetic Scrubber Arrays**  
  * Immediate Cost: `Power: -25, Life Support: +5, Radiation Safety: +5`  
  * Trade-off: High electrical drain to run electromagnetic particle deflectors while keeping main habitat bays open.
* **Choice C: Stay in Main Lab to Finish Antenna Wiring**  
  * Immediate Cost: `Power: +10, Life Support: 0, RadiationSafety: -25`  
  * Objective: Leaves `shelterProtocolsMaintained = false`.  
  * Trade-off: Keeps power generation online, but exposes habitat to ambient cosmic radiation.

---

### 2.5 Event 1 Complete Specification (`evt_solar_dust`)
*Note: As instructed, the Spirit rover claim is NOT used until human verification is completed in `sources.js`. The science blurb uses the verified general physics of Martian dust and wind vortexes.*

```javascript
export const EVENT_1_SOLAR_DUST = {
  id: "evt_solar_dust",
  title: "The Mysterious Solar Panel Miracle",
  type: "random",
  eligibleSlots: [3],
  radiationAffecting: false,
  intro: "A localized dust vortex swept across the western array field. Solar output has suddenly jumped by 25%.",
  choices: [
    {
      id: "choice_recharge",
      label: "Charge Reserve Battery Banks",
      preview: "Direct the entire incoming surge into habitat battery cells.",
      tradeoff: "Gives an immediate +15% Power surge, but leaves the panel mechanisms uninspected.",
      deltas: { power: +15, lifeSupport: 0, radiationSafety: 0 },
      flags: ["batteries_charged"],
      pendingEffects: [],
      modifiers: [],
      removesModifiers: [],
      objectiveChanges: {},
      crewReaction: {
        speaker: "Marcus Vance",
        role: "Systems & Power Engineer",
        text: "Capacitor banks are humming! We've got plenty of electrical reserve for the night."
      },
      outcomeText: "Reserve storage cells are charged to maximum density, creating a substantial energy buffer.",
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
      tradeoff: "Moderate power gain (+5%) and life support efficiency (+5%), while eliminating electrical wear.",
      deltas: { power: +5, lifeSupport: +5, radiationSafety: 0 },
      flags: ["circuits_preserved"],
      pendingEffects: [],
      modifiers: [],
      removesModifiers: [],
      objectiveChanges: {},
      // Payoff: Prevents breaker blowout in Chapter 2 and provides Life Support efficiency
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
      tradeoff: "Costs 5% Power now, but discovers dust dynamics that protect against Chapter 3 dust storms.",
      deltas: { power: -5, lifeSupport: 0, radiationSafety: 0 },
      flags: ["panels_inspected"],
      pendingEffects: [],
      modifiers: [],
      removesModifiers: [],
      objectiveChanges: { panelsUnderstood: true },
      // Payoff: Unlocks a specialized cleaning protocol during the Sol 15 dust event, avoiding a -20% Power loss!
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
};
```

---

## 3. Revised Roadmap & Execution Order

### Stage 4: UI & Data (Interactive Mission Screen)
- Create `data/eventsData.js` exporting `EVENT_1_SOLAR_DUST`.
- Update the Mission Tab (`#tab-mission`) to render:
  1. Active Sol and Chapter banner.
  2. Story narrative card with crew dialogue dispatch.
  3. Decision cards generated **dynamically from data** (never hardcoded in HTML).
  4. Each card shows: Title, Tactical Preview, Trade-off, and Immediate Resource Cost.
  5. Hidden until outcome: flags, pending effects, and modifiers are strictly concealed from preview.
  6. Card selection highlights with Mars orange glow; enables the "Confirm Commander's Order" button guarded by `awaitingDecision`.

### Stage 5: Game Engine & State Management
- Implement `createInitialState(seed)` factory supporting `?seed=` URL overrides.
- Implement unified `applyResourceChanges(state, rawDeltas, causeLabel, sourceEvent)`.
- Radiation Guard: throws a `new Error("[DEV ERROR] Unauthorized radiation delta...")` if `radiationAffecting !== true`.
- Implement `advanceSol()` in strict sequence:
  1. `sol = sol + 1`
  2. Apply ongoing `modifiers`
  3. Apply due `pendingEffects` (`triggerSol === sol`) — Enforce `triggerSol <= 29`
  4. Deliver due comms (`deliverOnSol === sol`)
  5. Check 0% depletion / trigger soft grace triage or abort
  6. Check chapter transitions (Sols 6, 13, 19, 26)
  7. Select Sol content / event
  8. Save state to `localStorage` with `saveVersion: 1` wrapped in `try/catch`
- Generate an **Overnight Status Report** summarizing automated changes.
- Ensure `awaitingDecision` is persistent and prevents double-click race conditions.

### 🎯 Checkpoint After Stage 6: Vertical Slice
- Sols 1–8 fully playable end-to-end:
  - Sol 1–2 story setup $\rightarrow$ Sol 3 Event 1 decision $\rightarrow$ Sol 3 Outcome Screen $\rightarrow$ Sol advance to Sol 4 with Overnight Report $\rightarrow$ Sols 5–8 campaign progression.

### Stage 7: Campaign, 8 Events & Headless Simulation
- Implement all 5 chapters and 30 sols.
- Implement the 8 selected random events with `buildEventSchedule(seed)` backtracking scheduler and 1,000-seed validation.
- Implement Sol 14 SPE fixed crisis.
- Implement headless `simulate(choicePath)` and generate verified balance table.

### Stage 8: Delayed Communication System
- Earth radio queue with 1–2 sol latency, stale-message resolution, and message templates.

### Stage 9: Mission Log & Endings
- Chronological mission history, Sol 30 ending evaluation (Beyond the Silence, A Costly Success, Mission Interrupted), and soft grace path.

### Stage 10: Final Polish, DevTools & Testing
- Dev tools panel (`?dev=1`), responsive audit, and full Sol 1–30 playthrough validation.
