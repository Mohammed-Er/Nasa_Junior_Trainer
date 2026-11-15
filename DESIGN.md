# ARES: The Last Signal — Technical Design Document (v3.0)

**Project:** NASA Space Apps Challenge — Mars Survival Strategy & Education  
**Target Audience:** Children 7–12 (Grade 4–5 reading level, sentences ≤ 18 words)  
**Architecture Rules:** HTML5, CSS3, Vanilla ES6 Modules. Zero external frameworks, zero build tools. Offline-first, runnable via `python -m http.server 8085`.

---

## 1. System Schemas & State Model

### 1.1 Central Game State Schema (`gameState.js`)
```javascript
{
  saveVersion: 3,                    // Version 3 schema
  seed: 18349275,                    // 32-bit integer for Mulberry32 PRNG
  
  // Progression & Flow
  sol: 1,                            // Sols 1 to 30
  chapter: 1,                        // Chapters 1 to 5
  status: "active",                  // "briefing" | "active" | "critical_grace" | "interrupted" | "completed"
  phase: "opening",                  // "opening" | "supply" | "event" | "routine" | "outcome" | "night"
  currentScreen: "game",             // "welcome" | "briefing" | "game" | "outcome" | "night" | "ending" | "reflection" | "journal"
  
  // Guards & State Tracking
  awaitingDecision: false,           // Persistent guard: true when decision card is active
  supplyDone: false,                 // Guard: true when morning rations have been served
  graceUsed: false,                  // True if the 1-time emergency lifeboat triage has been spent
  crewBreakLastSol: -99,             // Sol of last forced crew break (cooldown: 6 sols)
  endingReason: null,                // Explanatory text for campaign conclusion
  
  // The Three Outpost Meters (0 - 100%)
  resources: {
    power: 100,                      // Starts at 100%
    lifeSupport: 100,                // Starts at 100%
    radiationSafety: 80              // Starts at 80%
  },
  
  // Crew State: Morale (0 - 100, displayed as face + word, not a percentage bar)
  morale: 80,                        // Starts at 80 (Happy)
  
  // Communication Subsystem
  comm: {
    status: "blackout",              // "blackout" (listen only) | "intermittent" (beacon unlocked Sol 21) | "restored" (Sol 30)
    nextWindowSol: 4                 // Sol when next Earth transmission window opens
  },

  // 5-Step Antenna Repair Tracker
  antennaStep: 0,                    // Steps: 1 (Sol 5), 2 (Sol 12), 3 (Sol 18), 4 (Sol 21), 5 (Sol 30)

  // Tracked Strategic Mission Objectives
  objectives: {
    commsRestored: false,            // Final signal successfully beamed to Earth
    antennaAligned: false,           // Sol 21 relay dish alignment completed
    researchSamples: false,          // Frost / mineral samples secured
    panelsUnderstood: false,         // Solar array dust dynamics understood via study
    shelterProtocolsMaintained: false// Proper shelter used during Sol 14 solar storm
  },

  // Campaign History & Logs
  rationHistory: [],                 // Array of { sol, choice }
  flags: {},                         // Narrative flags
  eventSchedule: {},                 // Deterministic Sol -> EventId schedule
  pendingEffects: [],                // Delayed effects with relative triggerInSols (<= 29)
  modifiers: [],                     // Ongoing per-sol modifiers with lengthInSols
  commQueue: [],                     // Queued Earth transmissions
  commHistory: [],                   // Delivered transmissions
  recentChanges: [],                 // Audit trail of all post-clamp resource deltas
  logHistory: [],                    // Chronological flight recorder

  // Telemetry Stats for Reflection
  stats: {
    fullDays: 0,
    lightDays: 0,
    emergencyDays: 0,
    lowestMorale: 80,
    lowest: { power: 100, lifeSupport: 100, radiationSafety: 80 }
  },

  // Post-Game Reflection Answers
  reflection: {
    answers: {},
    done: false
  }
}
```

---

## 2. Core Mechanics & Mathematical Balance

### 2.1 The Single Resource Choke Point
All changes to outpost meters (`power`, `lifeSupport`, `radiationSafety`) and `morale` must flow through `applyResourceChanges(state, rawDeltas, causeLabel, sourceEvent)`.
- Enforces strict clamping: meters clamp between 0 and 100; morale clamps between 0 and 100.
- Developer guard: `rawDeltas.radiationSafety` is forbidden unless `sourceEvent.radiationAffecting === true`.
- Returns exact post-clamp `appliedDeltas`, guaranteeing **no phantom numbers**.

### 2.2 Daily Morning Rations (Sols 1–29)
Every sol begins with a whole-crew meal choice:
- **Full Meals:** Life Support −3%, Morale +4
- **Half Meals:** Life Support −2%, Morale −2
- **Snack Bars Only:** Life Support −1%, Morale −6
Guarded by `state.supplyDone` to prevent double-serving.

### 2.3 Nightly Baseline Drains & Mood Consequences
Applied in `advanceSol`:
- **Nightly Power Drain:** Power −1% ("Heaters, lights and computers used some electricity.")
- **Nightly Morale Drift:** Morale −1 ("Being far from home is tiring.")
- **Mood Penalties:**
  - If Morale < 15 ("Exhausted"): Power −2%, Life Support −1% ("Exhausted crew made mistakes.")
  - Else if Morale < 30 ("Grumpy"): Power −1% ("Tired crew skipped some chores.")
- **Forced Crew Break (`evt_crew_break`):** Triggers when Morale < 15 (at most once every 6 sols) offering:
  - *Movie night:* Power −3%, Morale +20
  - *Team talk with the Commander:* Power −1%, Morale +12
  - *Keep working:* Power −4%, Morale −6

### 2.4 Story-Beat Gifts
- **Sol 10:** 10-Sol Milestone Celebration (Morale +8)
- **Sol 17:** Greenhouse Harvest (Life Support +6%, Morale +6)
- **Sol 26:** Earth Sighting in Evening Sky (Morale +6)

### 2.5 5-Step Antenna Repair Tracker
1. **Sol 5:** Find damage (bent motor arm and cracked cable). Automatic story scene.
2. **Sol 12:** Build spare parts (from rover backup motor). Automatic story scene.
3. **Sol 18:** Test motor (arms rotate smoothly). Automatic story scene.
4. **Sol 21:** Turn dish toward Earth (`evt_antenna_alignment`). Player decision.
5. **Sol 30:** Send the signal (`evt_final_transmission`). Climax decision.

### 2.6 Sol 30 Climax: Dual Choices
- **Send full message:** Power −8%, needs Power ≥ 20% after the cost. Keeps all science objectives.
- **Send short message:** Power −4%, needs Power ≥ 15% after the cost. Drops science objectives (`researchSamples` and `panelsUnderstood`).

### 2.7 Ending Evaluation Rules
- **Ending 1 — Beyond the Silence (Optimal Victory):**
  Comms restored AND Power ≥ 40% AND Life Support ≥ 40% AND Radiation Safety ≥ 40% AND Morale ≥ 40 AND Objectives ≥ 3 (out of 5).
- **Ending 2 — A Costly Success (Pragmatic Survival):**
  Comms restored AND Power ≥ 20% AND Life Support ≥ 20% AND Radiation Safety ≥ 20%.
- **Ending 3 — Mission Interrupted:**
  Comms not restored, or any meter ≤ 0%, or any meter < 20%.

---

## 3. Verified Simulation Results (400 Seeds per Policy)

| Profile | Ending 1 (Beyond) | Ending 2 (Costly) | Ending 3 (Interrupted) | Target Band | Status |
|---|---|---|---|---|---|
| **Thoughtful** (Smart rations + smart events) | **100%** | **0%** | **0%** | ≥60% End 1, ≥90% End 1/2 | **PASS** |
| **Mostly Thoughtful** (20% random mistakes) | **46%** | **48%** | **7%** | 35–60% End 1, <15% End 3 | **PASS** |
| **Always Full Meals** | **0%** | **100%** | **0%** | 0% End 1, LS < 30 | **PASS** (LS: 22%) |
| **Always Half Meals** | **0%** | **100%** | **0%** | 0% End 1, Mood < 40 | **PASS** (Mood: 30) |
| **Always Snack Bars** | **0%** | **0%** | **100%** | 100% End 3 | **PASS** |
| **Ignores Antenna** | **0%** | **0%** | **100%** | 100% End 3 | **PASS** |
| **Fully Random** | **1%** | **54%** | **46%** | 40–60% End 3, ≤5% End 1 | **PASS** |

---

## 4. UI Architecture & Features

1. **Top Persistent HUD:** Always displays Sol counter, Chapter Goal, 5-step antenna tracker, 3 chunky gauges with status bands, and Crew Morale face.
2. **Directional Arrow Cards:** Choice cards display directional arrows (`▼`, `▼▼`, `▼▼▼` / `▲`, `▲▲`, `▲▲▲`) instead of naked raw numbers. Exact before-and-after numbers appear on the dedicated outcome screen.
3. **Sequencer (`js/sequencer.js`):** Decisions reveal step-by-step (narrator → portrait typewriter → problem → choice cards 350ms apart → crew advice → confirm button).
4. **Glossary System (`js/glossary.js`):** 14 difficult space terms highlighted on first appearance with accessible tooltip popovers.
5. **Post-Game Reflection & Mission Journal (`js/reflection.js`):** 4 reflection questions followed by a printable 1-page Mission Journal card (`window.print()`).
6. **2D Mars Stage (`js/background.js`):** Floating dust particles, chapter-specific tints, and red high-danger edge vignettes.
