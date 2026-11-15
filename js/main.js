/**
 * ARES: The Last Signal - Master Application Orchestrator (v3)
 * 
 * Implements:
 * - Full v3 story bible & kid-friendly tone (Grades 4-5)
 * - 2D background atmosphere and particle management
 * - 7-beat skippable intro cinematic
 * - 3-panel comic briefing
 * - Top persistent HUD (Sol, Chapter Goal, 5-step antenna tracker, 3 gauges, Morale face)
 * - Day flow state machine: opening -> supply -> event / routine -> outcome -> night
 * - Morning meal serving animation with 4 illustrated astronaut busts
 * - Sequential event reveals with directional arrows
 * - Dedicated outcome screen with before-and-after gauges
 * - Overnight report with delayed consequence callbacks
 * - Post-game 4 reflection questions and printable 1-page Mission Journal
 * - Non-blocking in-game toasts (zero alert() calls)
 */

import { GAME_CONSTANTS, getMoodInfo } from "./constants.js";
import { createInitialState, saveGameState, loadGameState, clearSavedGame } from "./gameState.js";
import {
  applyChoice,
  advanceSol,
  serveMeal,
  sendStatusQuery,
  applyEmergencyTriage,
  EMERGENCY_TRIAGE_OPTIONS,
  evaluateMissionEnding
} from "./gameEngine.js";
import { EVENTS_DATA } from "../data/eventsData.js";
import { CAMPAIGN_BEATS } from "../data/campaign.js";
import { RATIONS, getMenuForSol } from "../data/rationsData.js";
import { initGlossary, explain } from "./glossary.js";
import { renderAstronaut, normalizeCrewId } from "./astronaut.js";
import { initBackground, setBackground } from "./background.js";
import { reveal, typewriter, isReducedMotion } from "./sequencer.js";
import { renderReflectionScreen, renderJournalScreen } from "./reflection.js";
import { initDevTools } from "./devTools.js";
import { SOURCES, TAG_DEFINITIONS } from "../data/sources.js";

// Master In-Memory State
let state = null;
let currentEvent = null;
let selectedChoice = null;
let selectedMealRationId = null;
let selectedTriageId = null;

// Screen DOM Elements
const screens = {
  welcome: document.getElementById("screen-welcome"),
  briefing: document.getElementById("screen-briefing"),
  game: document.getElementById("screen-game"),
  outcome: document.getElementById("screen-outcome"),
  night: document.getElementById("screen-night"),
  ending: document.getElementById("screen-ending"),
  reflection: document.getElementById("screen-reflection"),
  journal: document.getElementById("screen-journal")
};

// Global HUD Element
const globalHud = document.getElementById("global-hud");

// Toast Notification System
export function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Switch Active Screen
 */
export function showScreen(screenId) {
  Object.entries(screens).forEach(([id, el]) => {
    if (!el) return;
    if (id === screenId) {
      el.classList.add("active");
      el.hidden = false;
    } else {
      el.classList.remove("active");
      el.hidden = true;
    }
  });

  // HUD is visible during mission gameplay screens
  const showHudScreens = ["game", "outcome", "night"];
  if (globalHud) {
    globalHud.hidden = !showHudScreens.includes(screenId);
  }

  // Update background atmosphere
  if (state) {
    const danger = currentEvent?.dangerLevel || "low";
    setBackground({ chapter: state.chapter, danger });
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Synchronize HUD Numbers, Meters, Morale Face, and Antenna Tracker
 */
export function syncHUD() {
  if (!state) return;

  // 1. Sol Counter & Chapter Goal
  const hudSolDisplay = document.getElementById("hud-sol-display");
  if (hudSolDisplay) {
    hudSolDisplay.textContent = `SOL ${state.sol < 10 ? "0" + state.sol : state.sol} / 30`;
  }

  const beat = CAMPAIGN_BEATS[state.sol];
  const goalText = beat?.chapterGoal || "Survive and fix the antenna.";
  const hudGoalDisplay = document.getElementById("hud-goal-display");
  if (hudGoalDisplay) {
    hudGoalDisplay.innerHTML = `Ch. ${state.chapter} · Goal: <strong>${goalText}</strong>`;
  }

  // 2. 5-Step Antenna Repair Tracker
  // Steps: 1 Sol 5, 2 Sol 12, 3 Sol 18, 4 Sol 21, 5 Sol 30
  let completedStep = state.antennaStep || 0;
  if (state.sol >= 5 && completedStep < 1) completedStep = 1;
  if (state.sol >= 12 && completedStep < 2) completedStep = 2;
  if (state.sol >= 18 && completedStep < 3) completedStep = 3;
  if (state.objectives.antennaAligned && completedStep < 4) completedStep = 4;
  if (state.objectives.commsRestored) completedStep = 5;

  for (let s = 1; s <= 5; s++) {
    const stepEl = document.getElementById(`ant-step-${s}`);
    if (stepEl) {
      stepEl.classList.remove("is-done", "is-current");
      if (s <= completedStep) {
        stepEl.classList.add("is-done");
      } else if (s === completedStep + 1) {
        stepEl.classList.add("is-current");
      }
    }
  }

  // 3. Outpost Core Meters (Power, Life Support, Radiation Safety)
  const { power, lifeSupport, radiationSafety } = state.resources;

  const updateGauge = (type, val) => {
    const valEl = document.getElementById(`hud-val-${type}`);
    const barEl = document.getElementById(`hud-bar-${type}`);
    const tagEl = document.getElementById(`hud-tag-${type}`);

    if (valEl) valEl.textContent = `${val}%`;
    if (barEl) barEl.style.width = `${Math.max(0, Math.min(100, val))}%`;

    if (tagEl) {
      tagEl.className = "tag";
      if (val >= GAME_CONSTANTS.BANDS.OPTIMAL_MIN) {
        tagEl.classList.add("tag-optimal");
        tagEl.textContent = "Optimal";
      } else if (val >= GAME_CONSTANTS.BANDS.CAUTION_MIN) {
        tagEl.classList.add("tag-caution");
        tagEl.textContent = "Caution";
      } else {
        tagEl.classList.add("tag-critical");
        tagEl.textContent = "Critical";
      }
    }
  };

  updateGauge("power", power);
  updateGauge("lifesupport", lifeSupport);
  updateGauge("radiation", radiationSafety);

  // 4. Crew Morale (Face + Word + Value)
  const morale = state.morale !== undefined ? state.morale : 80;
  const moodInfo = getMoodInfo(morale);

  const faceEl = document.getElementById("hud-morale-face");
  const wordEl = document.getElementById("hud-morale-word");
  if (faceEl) faceEl.textContent = moodInfo.face;
  if (wordEl) wordEl.textContent = `${moodInfo.label} (${morale})`;

  // Save state
  saveGameState(state);
}

/**
 * =========================================================================
 * INTRO CINEMATIC (Sol 0, 7 Beats, Skippable)
 * =========================================================================
 */
const INTRO_LINES = [
  "Sol 0. Mars.",
  "Four astronauts live in a small dome called ARES-1.",
  "Then a huge dust storm hit.",
  "It bent our big radio antenna. Now Earth can't hear us.",
  "We can still hear Earth. But Earth can't hear us.",
  "If Earth doesn't hear from us in 30 sols, no rescue ship will leave.",
  "You are the Commander. Fix the antenna. Keep everyone safe."
];

function playIntroCinematic(onFinish) {
  const cinematicContainer = document.getElementById("intro-cinematic");
  const textEl = document.getElementById("cinematic-text");
  const skipBtn = document.getElementById("btn-skip-cinematic");
  const welcomeCard = document.getElementById("welcome-title-card");

  if (!cinematicContainer || !textEl) {
    if (onFinish) onFinish();
    return;
  }

  cinematicContainer.hidden = false;
  welcomeCard.style.display = "none";

  let lineIndex = 0;
  let isSkipped = false;

  function showNextLine() {
    if (isSkipped) return;
    if (lineIndex >= INTRO_LINES.length) {
      endIntro();
      return;
    }

    textEl.classList.remove("active");
    setTimeout(() => {
      if (isSkipped) return;
      textEl.textContent = INTRO_LINES[lineIndex];
      textEl.classList.add("active");
      lineIndex++;
    }, 400);
  }

  function endIntro() {
    if (isSkipped) return;
    isSkipped = true;
    try {
      localStorage.setItem("ares_intro_seen", "true");
    } catch (_) {}

    cinematicContainer.style.opacity = "0";
    cinematicContainer.style.transition = "opacity 0.6s ease";
    setTimeout(() => {
      cinematicContainer.hidden = true;
      welcomeCard.style.display = "flex";
      welcomeCard.style.opacity = "1";
      if (onFinish) onFinish();
    }, 600);
  }

  skipBtn.onclick = (e) => {
    e.stopPropagation();
    endIntro();
  };

  cinematicContainer.onclick = () => {
    showNextLine();
  };

  const handleKey = (e) => {
    if (e.key === " " || e.key === "Enter") {
      showNextLine();
    }
  };
  document.addEventListener("keydown", handleKey);

  showNextLine();
  const autoTimer = setInterval(() => {
    if (isSkipped || lineIndex >= INTRO_LINES.length) {
      clearInterval(autoTimer);
      document.removeEventListener("keydown", handleKey);
      if (!isSkipped) endIntro();
    } else {
      showNextLine();
    }
  }, 3600);
}

/**
 * =========================================================================
 * 3-PANEL BRIEFING SCREEN
 * =========================================================================
 */
let briefingStep = 1;

function renderBriefingStep(step) {
  briefingStep = step;
  const contentEl = document.getElementById("briefing-panel-content");
  const prevBtn = document.getElementById("btn-briefing-prev");
  const nextBtn = document.getElementById("btn-briefing-next");

  for (let s = 1; s <= 3; s++) {
    const tabEl = document.getElementById(`b-tab-${s}`);
    if (tabEl) {
      tabEl.classList.toggle("active", s === step);
    }
  }

  prevBtn.style.visibility = step > 1 ? "visible" : "hidden";
  nextBtn.textContent = step === 3 ? "Begin Mission: Enter Sol 1 ▶" : "Next Step ▶";

  if (step === 1) {
    // 1. Meet the Crew
    contentEl.innerHTML = `
      <h2 style="font-size:1.85rem; margin-bottom:0.4rem; text-align:center;">Meet Your Expedition Crew</h2>
      <p style="text-align:center; color:var(--color-text-secondary); margin-bottom:1.5rem;">
        Four astronauts live inside ARES-1. Listen to their expert advice during crises:
      </p>
      <div class="crew-intro-grid">
        <div class="crew-intro-card">
          ${renderAstronaut("commander", "happy", 76)}
          <span class="crew-intro-name">Elena Rivera</span>
          <span class="tag tag-optimal" style="font-size:0.75rem;">Commander</span>
          <p class="crew-intro-line">Former test pilot. Calm, steady, and focused on keeping everyone safe.</p>
        </div>
        <div class="crew-intro-card">
          ${renderAstronaut("scientist", "happy", 76)}
          <span class="crew-intro-name">Dr. Tariq Al-Mansoor</span>
          <span class="tag tag-science" style="font-size:0.75rem;">Mission Scientist</span>
          <p class="crew-intro-line">Geologist. Studies Martian rocks, frost, and dangerous radiation.</p>
        </div>
        <div class="crew-intro-card">
          ${renderAstronaut("engineer", "happy", 76)}
          <span class="crew-intro-name">Marcus Vance</span>
          <span class="tag tag-caution" style="font-size:0.75rem;">Systems Engineer</span>
          <p class="crew-intro-line">Keeps solar panels clean, tests rover batteries, and fixes the big antenna.</p>
        </div>
        <div class="crew-intro-card">
          ${renderAstronaut("medic", "happy", 76)}
          <span class="crew-intro-name">Dr. Hoshi Reed</span>
          <span class="tag tag-optimal" style="font-size:0.75rem;">Medical Officer</span>
          <p class="crew-intro-line">Monitors crew health, air scrubbers, water recycling, and daily meals.</p>
        </div>
      </div>
    `;
  } else if (step === 2) {
    // 2. How a Day Works
    contentEl.innerHTML = `
      <h2 style="font-size:1.85rem; margin-bottom:0.4rem; text-align:center;">How Each Sol Works</h2>
      <p style="text-align:center; color:var(--color-text-secondary); margin-bottom:2rem;">
        A sol is one day on Mars (24 hours and 40 minutes). Every sol follows three steps:
      </p>
      <div class="day-works-grid">
        <div class="day-work-step">
          <div class="day-work-icon">🍲</div>
          <h3 style="font-size:1.25rem; color:#ffffff; margin-bottom:0.35rem;">1. Morning Meal</h3>
          <p style="font-size:0.95rem; color:var(--color-text-secondary);">
            Choose full hot meals, half meals, or snack bars for the crew. Full meals boost mood but use water and food reserves.
          </p>
        </div>
        <div class="day-work-step">
          <div class="day-work-icon">⚡</div>
          <h3 style="font-size:1.25rem; color:#ffffff; margin-bottom:0.35rem;">2. Daily Challenge</h3>
          <p style="font-size:0.95rem; color:var(--color-text-secondary);">
            When Martian storms or equipment troubles hit, choose how to respond. Every choice has a real cost.
          </p>
        </div>
        <div class="day-work-step">
          <div class="day-work-icon">🌙</div>
          <h3 style="font-size:1.25rem; color:#ffffff; margin-bottom:0.35rem;">3. Night Report</h3>
          <p style="font-size:0.95rem; color:var(--color-text-secondary);">
            While the crew sleeps, heaters use electricity and isolation makes people tired. Review what changed before the new sol.
          </p>
        </div>
      </div>
    `;
  } else {
    // 3. Your Meters
    contentEl.innerHTML = `
      <h2 style="font-size:1.85rem; margin-bottom:0.4rem; text-align:center;">The Four Things You Track</h2>
      <p style="text-align:center; color:var(--color-text-secondary); margin-bottom:1.5rem;">
        Keep all three outpost meters above zero, and keep your crew happy:
      </p>
      <div class="crew-intro-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
        <div class="crew-intro-card">
          <span style="font-size:2.5rem;">⚡</span>
          <span class="crew-intro-name">Electrical Power</span>
          <p class="crew-intro-line">Electricity from solar panels. Powers heaters, lights, computers, and the radio dish.</p>
        </div>
        <div class="crew-intro-card">
          <span style="font-size:2.5rem;">💧</span>
          <span class="crew-intro-name">Life Support</span>
          <p class="crew-intro-line">Clean air, fresh drinking water, and meal supplies recycled inside the dome.</p>
        </div>
        <div class="crew-intro-card">
          <span style="font-size:2.5rem;">🛡️</span>
          <span class="crew-intro-name">Radiation Safety</span>
          <p class="crew-intro-line">How well our thick dirt walls and underground storm shelter block dangerous space rays.</p>
        </div>
        <div class="crew-intro-card">
          <span style="font-size:2.5rem;">🙂</span>
          <span class="crew-intro-name">Crew Mood</span>
          <p class="crew-intro-line">How the astronauts feel. Hungry or exhausted crews make mistakes that cost power and air.</p>
        </div>
      </div>
    `;
  }
}

/**
 * =========================================================================
 * DAY FLOW STATE MACHINE (opening -> supply -> event/routine -> outcome -> night)
 * =========================================================================
 */
export function startDayPhase(phase, param = null) {
  if (!state) return;
  state.phase = phase;
  syncHUD();

  const viewOpening = document.getElementById("view-opening");
  const viewSupply = document.getElementById("view-supply");
  const viewEvent = document.getElementById("view-event");
  const viewRoutine = document.getElementById("view-routine");

  [viewOpening, viewSupply, viewEvent, viewRoutine].forEach((v) => {
    if (v) v.hidden = true;
  });

  // Ensure game screen is visible
  if (["opening", "supply", "event", "routine"].includes(phase)) {
    showScreen("game");
  }

  if (phase === "opening") {
    renderOpeningBeat();
  } else if (phase === "supply") {
    renderSupplyPhase();
  } else if (phase === "event") {
    renderEventPhase(param);
  } else if (phase === "routine") {
    renderRoutinePhase();
  } else if (phase === "outcome") {
    renderOutcomeScreen();
  } else if (phase === "night") {
    renderNightReport();
  }
}

/**
 * Phase 1: Opening Story Beat
 */
function renderOpeningBeat() {
  const viewOpening = document.getElementById("view-opening");
  if (!viewOpening) return;
  viewOpening.hidden = false;

  const beat = CAMPAIGN_BEATS[state.sol] || {
    title: `Sol ${state.sol}`,
    crewSpeaker: "Commander Elena Rivera",
    crewDialogue: "Another sol on Mars. Let's get our daily duties underway."
  };

  const titleEl = document.getElementById("opening-beat-title");
  const dialogueEl = document.getElementById("opening-beat-dialogue");
  const avatarSlot = document.getElementById("opening-avatar-slot");

  if (titleEl) titleEl.textContent = beat.title;
  if (dialogueEl) dialogueEl.innerHTML = explain(beat.crewDialogue);

  const speakerId = normalizeCrewId(beat.crewSpeaker);
  if (avatarSlot) {
    avatarSlot.innerHTML = renderAstronaut(speakerId, state.morale, 80);
  }

  const continueBtn = document.getElementById("btn-opening-continue");
  if (continueBtn) {
    continueBtn.onclick = () => {
      // Sol 30 is transmission day: skips morning meal directly to climax event
      if (state.sol === 30) {
        startDayPhase("event", "evt_final_transmission");
      } else if (state.supplyDone) {
        advanceToDayChallenge();
      } else {
        startDayPhase("supply");
      }
    };
  }
}

/**
 * Phase 2: Morning Rations (Sols 1-29)
 */
function renderSupplyPhase() {
  const viewSupply = document.getElementById("view-supply");
  if (!viewSupply) return;
  viewSupply.hidden = false;

  // Render today's rotating menu
  const menu = getMenuForSol(state.sol);
  const menuText = document.getElementById("menu-today-text");
  const menuFact = document.getElementById("menu-nasa-fact");
  if (menuText) {
    menuText.textContent = `Breakfast: ${menu.breakfast} · Dinner: ${menu.mainMeal} · Snack: ${menu.snack}`;
  }
  if (menuFact) {
    menuFact.textContent = `🚀 Real NASA space food fact: ${menu.nasaFact}`;
  }

  // Update astronaut busts in serving animation stage
  const crewMembers = [
    { id: "rivera", slot: "bust-rivera" },
    { id: "almansoor", slot: "bust-almansoor" },
    { id: "vance", slot: "bust-vance" },
    { id: "reed", slot: "bust-reed" }
  ];
  crewMembers.forEach((cm) => {
    const el = document.getElementById(cm.slot);
    if (el) el.innerHTML = renderAstronaut(cm.id, state.morale, 64);
  });

  // Reset serving items visibility
  document.querySelectorAll(".serving-items").forEach((si) => si.classList.remove("served"));

  const fullBtn = document.getElementById("btn-ration-full");
  const lightBtn = document.getElementById("btn-ration-light");
  const emergBtn = document.getElementById("btn-ration-emergency");
  const repeatBtn = document.getElementById("btn-ration-repeat");
  const confirmBtn = document.getElementById("btn-confirm-meal");

  [fullBtn, lightBtn, emergBtn].forEach((b) => b?.classList.remove("selected"));
  confirmBtn.disabled = true;
  selectedMealRationId = null;

  const selectRation = (id, btn) => {
    selectedMealRationId = id;
    [fullBtn, lightBtn, emergBtn].forEach((b) => b?.classList.remove("selected"));
    btn.classList.add("selected");
    confirmBtn.disabled = false;
  };

  fullBtn.onclick = () => selectRation("full", fullBtn);
  lightBtn.onclick = () => selectRation("light", lightBtn);
  emergBtn.onclick = () => selectRation("emergency", emergBtn);

  // Shortcut: Serve same as yesterday (shown Sol 2+)
  if (state.sol > 1 && state.rationHistory && state.rationHistory.length > 0) {
    repeatBtn.style.display = "inline-flex";
    const lastChoice = state.rationHistory[state.rationHistory.length - 1].choice;
    repeatBtn.onclick = () => {
      const targetBtn = lastChoice === "full" ? fullBtn : lastChoice === "light" ? lightBtn : emergBtn;
      selectRation(lastChoice, targetBtn);
    };
  } else {
    repeatBtn.style.display = "none";
  }

  confirmBtn.onclick = async () => {
    if (!selectedMealRationId) return;
    confirmBtn.disabled = true;

    // Animate serving bowls & water bottles 350ms apart across the 4 crew members
    const itemIds = ["items-rivera", "items-almansoor", "items-vance", "items-reed"];
    for (let i = 0; i < itemIds.length; i++) {
      const itemEl = document.getElementById(itemIds[i]);
      if (itemEl) itemEl.classList.add("served");
      if (!isReducedMotion()) {
        await new Promise((r) => setTimeout(r, 280));
      }
    }

    // Apply meal deltas
    serveMeal(state, selectedMealRationId);
    syncHUD();

    // Update busts with new mood expression
    crewMembers.forEach((cm) => {
      const el = document.getElementById(cm.slot);
      if (el) el.innerHTML = renderAstronaut(cm.id, state.morale, 64);
    });

    showToast(`Breakfast served: ${selectedMealRationId.toUpperCase()} meals for the crew!`, "success");

    setTimeout(() => {
      advanceToDayChallenge();
    }, 600);
  };
}

/**
 * Route from meal to event or routine day
 */
function advanceToDayChallenge() {
  // Check forced crew break trigger (morale < 15 and cooldown elapsed)
  if (
    state.morale < GAME_CONSTANTS.CREW_BREAK.below &&
    state.sol - state.crewBreakLastSol >= GAME_CONSTANTS.CREW_BREAK.cooldown &&
    state.sol < 30
  ) {
    state.crewBreakLastSol = state.sol;
    startDayPhase("event", "evt_crew_break");
    return;
  }

  const beat = CAMPAIGN_BEATS[state.sol];
  if (beat && beat.hasDecision) {
    let eventId = beat.fixedEventId;
    if (!eventId && beat.type === "random_slot") {
      eventId = state.eventSchedule ? state.eventSchedule[state.sol] : null;
    }
    startDayPhase("event", eventId);
  } else {
    startDayPhase("routine");
  }
}

/**
 * Phase 3: Daily Crisis / Decision Event (with Sequencer)
 */
function renderEventPhase(eventId) {
  const viewEvent = document.getElementById("view-event");
  if (!viewEvent) return;
  viewEvent.hidden = false;

  currentEvent = EVENTS_DATA[eventId] || EVENTS_DATA["evt_solar_dust"];
  state.awaitingDecision = true;
  selectedChoice = null;

  const container = document.getElementById("event-stage-container");
  if (!container) return;

  const danger = currentEvent.dangerLevel || "low";
  setBackground({ chapter: state.chapter, danger });

  // Map immediate deltas to arrows: |Δ| 1-3 -> ▼/▲, 4-8 -> ▼▼/▲▲, 9+ -> ▼▼▼/▲▲▲
  const formatArrows = (deltas) => {
    const pills = [];
    const mapDelta = (val, resourceName) => {
      if (!val || val === 0) return null;
      const isGain = val > 0;
      const abs = Math.abs(val);
      const symbol = isGain ? "▲" : "▼";
      const repeat = abs >= 9 ? 3 : abs >= 4 ? 2 : 1;
      const arrows = symbol.repeat(repeat);
      return `<span class="arrow-pill ${isGain ? "gain" : "cost"}">${arrows} ${resourceName}</span>`;
    };

    if (deltas.power) pills.push(mapDelta(deltas.power, "Power"));
    if (deltas.lifeSupport) pills.push(mapDelta(deltas.lifeSupport, "Life Support"));
    if (deltas.radiationSafety) pills.push(mapDelta(deltas.radiationSafety, "Radiation"));
    if (deltas.morale) pills.push(mapDelta(deltas.morale, "Mood"));

    return pills.join(" ");
  };

  container.innerHTML = `
    <div class="event-header-row">
      <span class="danger-badge danger-${danger}">⚠️ ${danger.toUpperCase()} DANGER</span>
      <span style="font-family:var(--font-family-hud); color:var(--color-text-dim); font-size:0.9rem;">
        Sol ${state.sol} · What should the crew do?
      </span>
    </div>

    <h2 style="font-size: 2rem; color: #ffffff; margin-bottom: 0.5rem;">${currentEvent.title}</h2>
    <p class="event-intro-text">${explain(currentEvent.intro)}</p>

    <!-- Crew Advice Speech Bubble -->
    ${currentEvent.crewAdvice ? `
      <div class="crew-speech-card">
        <div>${renderAstronaut(currentEvent.crewAdvice.speaker, state.morale, 60)}</div>
        <div class="crew-speech-content">
          <div>
            <span class="crew-speech-name">${currentEvent.crewAdvice.speaker}</span>
            <span class="crew-speech-role">${currentEvent.crewAdvice.role}</span>
          </div>
          <p class="crew-speech-bubble">"${currentEvent.crewAdvice.text}"</p>
        </div>
      </div>
    ` : ""}

    <!-- Decision Cards -->
    <div style="margin-bottom:0.6rem;">
      <span style="font-size:0.95rem; font-weight:700; color:var(--color-text-dim);">Think about it: Choose one order</span>
    </div>

    <div class="decision-cards-grid" id="decision-cards-list">
      ${currentEvent.choices.map((ch, idx) => `
        <div class="choice-card-item" data-index="${idx}" data-choice-id="${ch.id}">
          <div class="choice-card-top">
            <span class="choice-card-label">${ch.label}</span>
          </div>
          <p class="choice-plain-text"><strong>Plan:</strong> ${explain(ch.plain || ch.label)}</p>
        </div>
      `).join("")}
    </div>

    <div style="text-align: right; margin-top: 1.5rem;">
      <button id="btn-confirm-choice" class="btn btn-primary btn-lg" type="button" disabled>
        Confirm Command Order ▶
      </button>
    </div>
  `;

  // Stagger reveal of decision cards
  const cardElements = container.querySelectorAll(".choice-card-item");
  reveal(cardElements, { stagger: 250 });

  const confirmBtn = container.querySelector("#btn-confirm-choice");

  cardElements.forEach((card) => {
    card.addEventListener("click", () => {
      const choiceId = card.dataset.choiceId;
      selectedChoice = currentEvent.choices.find((c) => c.id === choiceId);

      cardElements.forEach((c) => {
        c.classList.remove("is-selected", "is-dimmed");
        if (c !== card) c.classList.add("is-dimmed");
      });
      card.classList.add("is-selected");
      confirmBtn.disabled = false;
    });
  });

  confirmBtn.onclick = () => {
    if (!selectedChoice) return;
    confirmBtn.disabled = true;

    // Apply choice via real engine
    applyChoice(state, selectedChoice, currentEvent);
    syncHUD();

    // Transition to outcome screen
    showScreen("outcome");
    renderOutcomeScreen();
  };
}

/**
 * Phase 4: Routine Sol (Non-event day)
 */
function renderRoutinePhase() {
  const viewRoutine = document.getElementById("view-routine");
  if (!viewRoutine) return;
  viewRoutine.hidden = false;

  const beat = CAMPAIGN_BEATS[state.sol];
  const statusBox = document.getElementById("routine-status-box");
  const statusText = document.getElementById("routine-status-text");

  if (statusText && beat) {
    statusText.textContent = beat.habitatStatus || "Outpost systems holding steady. Morning chores completed.";
  }

  const sleepBtn = document.getElementById("btn-routine-sleep");
  if (sleepBtn) {
    sleepBtn.onclick = () => {
      advanceSol(state);
      syncHUD();
      showScreen("night");
      renderNightReport();
    };
  }
}

/**
 * Screen 4: Dedicated Decision Outcome Screen
 */
function renderOutcomeScreen() {
  const res = state.lastResolution;
  if (!res) {
    showScreen("game");
    return;
  }

  const solTag = document.getElementById("outcome-tag-sol");
  const eventTitle = document.getElementById("outcome-event-title");
  const choiceLabel = document.getElementById("outcome-choice-label");
  const narrativeText = document.getElementById("outcome-narrative-text");

  if (solTag) solTag.textContent = `Sol ${state.sol} Command Order Executed`;
  if (eventTitle) eventTitle.textContent = currentEvent?.title || "Decision Outcome";
  if (choiceLabel) choiceLabel.textContent = `Order: ${res.choiceLabel}`;
  if (narrativeText) narrativeText.innerHTML = explain(res.narrativeOutcome);

  // Before-and-after gauges
  const updateOutcomeGauge = (type, beforeVal, afterVal, deltaVal) => {
    const beforeEl = document.getElementById(`outcome-before-${type}`);
    const afterEl = document.getElementById(`outcome-after-${type}`);
    const deltaEl = document.getElementById(`outcome-delta-${type}`);

    const unit = type === "morale" ? "" : "%";
    if (beforeEl) beforeEl.textContent = `${beforeVal ?? 0}${unit}`;
    if (afterEl) afterEl.textContent = `${afterVal ?? 0}${unit}`;
    if (deltaEl) {
      deltaEl.className = "delta-pill";
      if (deltaVal > 0) {
        deltaEl.classList.add("gain");
        deltaEl.textContent = `+${deltaVal}${unit}`;
      } else if (deltaVal < 0) {
        deltaEl.classList.add("cost");
        deltaEl.textContent = `${deltaVal}${unit}`;
      } else {
        deltaEl.classList.add("neutral");
        deltaEl.textContent = `0${unit}`;
      }
    }
  };

  updateOutcomeGauge("power", res.before.power, res.after.power, res.appliedDeltas.power);
  updateOutcomeGauge("ls", res.before.lifeSupport, res.after.lifeSupport, res.appliedDeltas.lifeSupport);
  updateOutcomeGauge("rad", res.before.radiationSafety, res.after.radiationSafety, res.appliedDeltas.radiationSafety);
  updateOutcomeGauge("morale", res.before.morale, res.after.morale, res.appliedDeltas.morale);

  // Crew Reaction
  const reaction = res.crewReaction || {
    speaker: "Commander Rivera",
    role: "Outpost Commander",
    text: "Order executed. Systems holding steady."
  };
  const crewNameEl = document.getElementById("outcome-crew-name");
  const crewRoleEl = document.getElementById("outcome-crew-role");
  const crewQuoteEl = document.getElementById("outcome-crew-quote");
  const avatarSlot = document.getElementById("outcome-crew-avatar-slot");

  if (crewNameEl) crewNameEl.textContent = reaction.speaker;
  if (crewRoleEl) crewRoleEl.textContent = reaction.role;
  if (crewQuoteEl) crewQuoteEl.innerHTML = `"${explain(reaction.text)}"`;
  if (avatarSlot) avatarSlot.innerHTML = renderAstronaut(reaction.speaker, state.morale, 64);

  // Science Note
  const science = res.science || {
    text: "Careful telemetry analysis ensures all outpost parameters stay within safety limits.",
    typeTag: "Science idea"
  };
  const scienceTagEl = document.getElementById("outcome-science-tag");
  const scienceTextEl = document.getElementById("outcome-science-text");
  if (scienceTagEl) scienceTagEl.textContent = science.typeTag || "Science idea";
  if (scienceTextEl) scienceTextEl.innerHTML = explain(science.text);

  const continueBtn = document.getElementById("btn-outcome-continue");
  if (continueBtn) {
    continueBtn.onclick = () => {
      // Advance Sol overnight
      advanceSol(state);
      syncHUD();
      showScreen("night");
      renderNightReport();
    };
  }
}

/**
 * Screen 5: Night Report ("While the crew slept")
 */
function renderNightReport() {
  const report = state.overnightReport;
  const listEl = document.getElementById("night-report-list");
  const solBadge = document.getElementById("night-sol-badge");
  const continueBtn = document.getElementById("btn-night-continue");

  if (solBadge) {
    solBadge.textContent = `Sol ${state.sol < 10 ? "0" + state.sol : state.sol} Morning Telemetry`;
  }

  if (listEl) {
    listEl.innerHTML = "";
    const logItems = report?.log || [
      "Heaters, lights and computers used some electricity (Power -1%).",
      "Being far from home is tiring (Crew Morale -1)."
    ];

    logItems.forEach((entry, idx) => {
      const li = document.createElement("li");
      li.className = "night-report-item";
      if (entry.includes("Delayed Consequence") || entry.includes("Remember")) {
        li.classList.add("callback");
      }
      li.innerHTML = explain(entry);
      listEl.appendChild(li);
    });

    // Stagger reveal of night report items
    reveal(listEl.querySelectorAll(".night-report-item"), { stagger: 200 });
  }

  // Check ending condition if sol reached 30
  if (state.sol > 30 || state.status === "interrupted") {
    if (continueBtn) {
      continueBtn.textContent = "View Mission Conclusion ▶";
      continueBtn.onclick = () => {
        const ending = evaluateMissionEnding(state);
        showEndingScreen(ending);
      };
    }
    return;
  }

  if (continueBtn) {
    continueBtn.textContent = `Wake Up & Start Sol ${state.sol} ▶`;
    continueBtn.onclick = () => {
      startDayPhase("opening");
    };
  }
}

/**
 * Screen 6: Sol 30 Ending Screen
 */
export function showEndingScreen(ending) {
  state.lastEnding = ending;
  saveGameState(state);

  showScreen("ending");

  const statusTag = document.getElementById("ending-status-tag");
  const titleEl = document.getElementById("ending-title");
  const subTitleEl = document.getElementById("ending-subtitle");
  const narrativeEl = document.getElementById("ending-narrative");
  const spiritBox = document.getElementById("ending-spirit-box");

  if (statusTag) {
    statusTag.className = `tag ${ending.code === 1 ? "tag-optimal" : ending.code === 2 ? "tag-caution" : "tag-critical"}`;
    statusTag.textContent = ending.tag;
  }
  if (titleEl) titleEl.textContent = ending.title;
  if (subTitleEl) subTitleEl.textContent = ending.subtitle;
  if (narrativeEl) narrativeEl.innerHTML = explain(ending.narrative);
  if (spiritBox) spiritBox.textContent = ending.crewSpiritLine || "";

  // Crew Quote
  const crewQuote = ending.crewQuote || { speaker: "Commander Elena Rivera", role: "Outpost Commander", text: "We made it through together." };
  const nameEl = document.getElementById("ending-crew-name");
  const roleEl = document.getElementById("ending-crew-role");
  const textEl = document.getElementById("ending-crew-quote");
  const avatarSlot = document.getElementById("ending-crew-avatar-slot");

  if (nameEl) nameEl.textContent = crewQuote.speaker;
  if (roleEl) roleEl.textContent = crewQuote.role;
  if (textEl) textEl.innerHTML = `"${explain(crewQuote.text)}"`;
  if (avatarSlot) avatarSlot.innerHTML = renderAstronaut(crewQuote.speaker, state.morale, 64);

  // Final Meters
  const valPEl = document.getElementById("ending-val-power");
  const valLsEl = document.getElementById("ending-val-ls");
  const valRadEl = document.getElementById("ending-val-rad");
  const valMoraleEl = document.getElementById("ending-val-morale");
  if (valPEl) valPEl.textContent = `${state.resources.power}%`;
  if (valLsEl) valLsEl.textContent = `${state.resources.lifeSupport}%`;
  if (valRadEl) valRadEl.textContent = `${state.resources.radiationSafety}%`;
  if (valMoraleEl) valMoraleEl.textContent = `${state.morale ?? 80}`;

  // 5 Tracked Mission Objectives Checklist
  const objList = [
    {
      key: "commsRestored",
      icon: "📡",
      title: "Earth Radio Link Restored",
      desc: "Sol 30 data packet successfully transmitted 225M km back to Houston."
    },
    {
      key: "antennaAligned",
      icon: "🛰️",
      title: "High-Gain Antenna Aligned",
      desc: "Rebuilt drive motor and locked onto Earth's orbital coordinate window."
    },
    {
      key: "researchSamples",
      icon: "🔬",
      title: "Martian Frost Samples Collected",
      desc: "Gathered rock sublimation frost samples before morning solar evaporation."
    },
    {
      key: "panelsUnderstood",
      icon: "☀️",
      title: "Solar Dust Physics Understood",
      desc: "Studied electrostatic dust adhesion to optimize solar panel cleaning."
    },
    {
      key: "shelterProtocolsMaintained",
      icon: "🛡️",
      title: "Solar Storm Core Shelter",
      desc: "Safely sheltered crew in the reinforced core during the Sol 14 storm."
    }
  ];

  const objContainer = document.getElementById("ending-objectives-list");
  const countBadge = document.getElementById("ending-objectives-count");
  const completedCount = objList.filter((o) => !!state.objectives?.[o.key]).length;

  if (countBadge) {
    countBadge.textContent = `Completed: ${completedCount} / 5`;
    countBadge.className = `tag ${completedCount >= 3 ? "tag-optimal" : completedCount >= 1 ? "tag-caution" : "tag-critical"}`;
  }

  if (objContainer) {
    objContainer.innerHTML = objList
      .map((o) => {
        const isDone = !!state.objectives?.[o.key];
        return `
          <div class="ending-obj-item ${isDone ? "is-complete" : "is-missed"}" style="display:flex; align-items:flex-start; gap:0.75rem; padding:0.65rem 0.85rem; border-radius:8px; background:${isDone ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.08)"}; border:1px solid ${isDone ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.25)"}; margin-bottom:0.5rem;">
            <span style="font-size:1.3rem; line-height:1;">${isDone ? "✅" : "❌"}</span>
            <div style="flex-grow:1;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.25rem;">
                <strong style="color:${isDone ? "#6ee7b7" : "#fca5a5"}; font-size:0.95rem;">${o.icon} ${o.title}</strong>
                <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:${isDone ? "#34d399" : "#f87171"};">${isDone ? "COMPLETED" : "MISSED"}</span>
              </div>
              <p style="font-size:0.85rem; color:#cbd5e1; margin:0.2rem 0 0 0;">${o.desc}</p>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // Button to reflection
  const reflBtn = document.getElementById("btn-to-reflection");
  if (reflBtn) {
    reflBtn.onclick = () => {
      showScreen("reflection");
      renderReflectionScreen(document.getElementById("reflection-container"), state, () => {
        showScreen("journal");
      });
    };
  }
}

/**
 * =========================================================================
 * MODALS SETUP (About, Radio, Audit, Triage, Restart)
 * =========================================================================
 */
function initModals() {
  // 1. About Modal
  const modalAbout = document.getElementById("modal-about");
  const linkAbout = document.getElementById("link-about-modal");
  const closeAbout = document.getElementById("btn-close-about");
  const doneAbout = document.getElementById("btn-modal-about-done");

  const openAbout = (e) => {
    e?.preventDefault();
    if (modalAbout) modalAbout.hidden = false;
  };
  linkAbout?.addEventListener("click", openAbout);
  closeAbout?.addEventListener("click", () => { modalAbout.hidden = true; });
  doneAbout?.addEventListener("click", () => { modalAbout.hidden = true; });

  // Populate sources & tags in About modal
  const tagsList = document.getElementById("about-tags-list");
  if (tagsList) {
    tagsList.innerHTML = Object.values(TAG_DEFINITIONS).map((t) => `
      <div style="background:rgba(15,25,45,0.6); padding:0.6rem 0.85rem; border-radius:var(--radius-sm); border-left:3px solid var(--color-space-medium);">
        <span class="tag ${t.badgeClass}">${t.label}</span>
        <p style="font-size:0.85rem; color:var(--color-text-secondary); margin-top:0.25rem;">${t.description}</p>
      </div>
    `).join("");
  }

  const sourcesList = document.getElementById("about-sources-list");
  if (sourcesList) {
    sourcesList.innerHTML = Object.values(SOURCES).map((s) => `
      <div style="background:rgba(15,25,45,0.6); padding:0.6rem 0.85rem; border-radius:var(--radius-sm);">
        <strong style="color:#ffffff; font-size:0.95rem;">${s.title}</strong>
        <p style="font-size:0.85rem; color:var(--color-text-secondary); margin:0.2rem 0;">${s.summary}</p>
        <span style="font-size:0.75rem; color:var(--color-text-dim);">Reference Date: ${s.eventDate}</span>
      </div>
    `).join("");
  }

  // 2. Radio Modal ("Check the radio")
  const modalRadio = document.getElementById("modal-radio");
  const btnHudRadio = document.getElementById("btn-hud-radio");
  const closeRadio = document.getElementById("btn-close-radio");
  const doneRadio = document.getElementById("btn-modal-radio-done");

  btnHudRadio?.addEventListener("click", () => {
    if (modalRadio) {
      modalRadio.hidden = false;
      renderRadioModalContent();
    }
  });
  closeRadio?.addEventListener("click", () => { modalRadio.hidden = true; });
  doneRadio?.addEventListener("click", () => { modalRadio.hidden = true; });

  function renderRadioModalContent() {
    const noticeEl = document.getElementById("radio-status-notice");
    if (noticeEl) {
      if (state.comm.status === "restored") {
        noticeEl.innerHTML = `
          <h3 style="color:#10b981;">Radio Status: Two-Way Link Restored!</h3>
          <p>Our 3.2-meter high-gain antenna is locked onto NASA's Deep Space Network.</p>
        `;
      } else if (state.comm.status === "intermittent") {
        noticeEl.innerHTML = `
          <h3 style="color:#f59e0b;">Radio Status: Backup Beacon Working!</h3>
          <p>The dish is aligned with Earth. Our carrier beacon is active!</p>
        `;
      } else {
        noticeEl.innerHTML = `
          <h3 style="color:#38bdf8;">Radio Status: Listen Only</h3>
          <p>Our big antenna is broken, so Earth cannot hear us yet. But our small listening antenna can still receive Houston's transmissions!</p>
        `;
      }
    }

    const messagesList = document.getElementById("radio-messages-list");
    if (messagesList) {
      const history = state.commHistory || [];
      if (history.length === 0) {
        messagesList.innerHTML = `<p style="color:var(--color-text-dim); font-style:italic;">No messages delivered yet. First transmission expected on Sol 3.</p>`;
      } else {
        messagesList.innerHTML = history.map((m) => `
          <div style="background:rgba(15,25,45,0.7); border:1px solid var(--color-space-medium); border-radius:var(--radius-sm); padding:0.85rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
              <strong style="color:#38bdf8; font-size:0.95rem;">${m.sender}</strong>
              <span style="font-size:0.75rem; color:var(--color-text-dim);">Delivered Sol ${m.deliveredOnSol}</span>
            </div>
            <p style="font-size:0.95rem; color:#f8fafc; line-height:1.45;">${m.activeBody || m.body}</p>
          </div>
        `).join("");
      }
    }
  }

  // 3. Audit Modal ("Why did my meters change?")
  const modalAudit = document.getElementById("modal-audit");
  const btnHudAudit = document.getElementById("btn-hud-audit");
  const closeAudit = document.getElementById("btn-close-audit");
  const doneAudit = document.getElementById("btn-modal-audit-done");

  btnHudAudit?.addEventListener("click", () => {
    if (modalAudit) {
      modalAudit.hidden = false;
      renderAuditFeed();
    }
  });
  closeAudit?.addEventListener("click", () => { modalAudit.hidden = true; });
  doneAudit?.addEventListener("click", () => { modalAudit.hidden = true; });

  function renderAuditFeed() {
    const list = document.getElementById("audit-feed-list");
    if (!list) return;
    const items = state.recentChanges || [];
    list.innerHTML = items.slice(0, 15).map((ch) => {
      const d = ch.deltas || {};
      const parts = [];
      if (d.power) parts.push(`Power ${d.power > 0 ? "+" : ""}${d.power}%`);
      if (d.lifeSupport) parts.push(`Life Support ${d.lifeSupport > 0 ? "+" : ""}${d.lifeSupport}%`);
      if (d.radiationSafety) parts.push(`Rad ${d.radiationSafety > 0 ? "+" : ""}${d.radiationSafety}%`);
      if (d.morale) parts.push(`Mood ${d.morale > 0 ? "+" : ""}${d.morale}`);
      return `
        <div style="background:rgba(15,25,45,0.6); padding:0.6rem 0.85rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#ffffff; font-size:0.95rem;">${ch.cause}</strong>
            <span style="font-size:0.75rem; color:var(--color-text-dim); margin-left:0.4rem;">Sol ${ch.sol}</span>
          </div>
          <span style="font-family:var(--font-family-hud); font-size:0.85rem; color:#93c5fd;">
            ${parts.length > 0 ? parts.join(" · ") : "No Change"}
          </span>
        </div>
      `;
    }).join("");
  }

  // 4. Restart Confirmation Modal
  const modalRestart = document.getElementById("modal-restart");
  const btnHudRestart = document.getElementById("btn-hud-restart");
  const closeRestart = document.getElementById("btn-close-restart");
  const cancelRestart = document.getElementById("btn-cancel-restart");
  const confirmRestart = document.getElementById("btn-confirm-restart");

  btnHudRestart?.addEventListener("click", () => {
    if (modalRestart) modalRestart.hidden = false;
  });
  closeRestart?.addEventListener("click", () => { modalRestart.hidden = true; });
  cancelRestart?.addEventListener("click", () => { modalRestart.hidden = true; });
  confirmRestart?.addEventListener("click", () => {
    clearSavedGame();
    window.location.reload();
  });
}

/**
 * =========================================================================
 * APPLICATION ENTRY POINT
 * =========================================================================
 */
function init() {
  // 1. Initialize modular background
  const stageEl = document.getElementById("mars-stage");
  initBackground(stageEl);

  // 2. Initialize accessible glossary tooltips
  initGlossary();

  // 3. Initialize modal dialogs
  initModals();

  // 4. Load saved game or create initial state
  const saved = loadGameState();
  if (saved) {
    state = saved;
  } else {
    state = createInitialState();
  }

  // 5. Wire Welcome Screen actions
  const startBtn = document.getElementById("btn-start-mission");
  const replayBtn = document.getElementById("btn-replay-intro");

  startBtn?.addEventListener("click", () => {
    showScreen("briefing");
    renderBriefingStep(1);
  });

  replayBtn?.addEventListener("click", () => {
    playIntroCinematic();
  });

  // Briefing carousel navigation
  const prevBtn = document.getElementById("btn-briefing-prev");
  const nextBtn = document.getElementById("btn-briefing-next");

  prevBtn?.addEventListener("click", () => {
    if (briefingStep > 1) renderBriefingStep(briefingStep - 1);
  });

  nextBtn?.addEventListener("click", () => {
    if (briefingStep < 3) {
      renderBriefingStep(briefingStep + 1);
    } else {
      // Start mission at Sol 1
      state.status = "active";
      saveGameState(state);
      startDayPhase("opening");
    }
  });

  // 6. Developer Tools integration
  initDevTools({
    getState: () => state,
    setState: (ns) => { state = ns; },
    syncUI: () => syncHUD(),
    renderSol: () => startDayPhase("opening"),
    showEnding: (end) => showEndingScreen(end),
    showScreen: (sc) => showScreen(sc),
    startDayPhase: (p, id) => startDayPhase(p, id),
    renderReflection: () => {
      showScreen("reflection");
      renderReflectionScreen(document.getElementById("reflection-container"), state, () => {
        showScreen("journal");
        renderJournalScreen(document.getElementById("journal-container"), state);
      });
    },
    renderJournal: () => {
      showScreen("journal");
      renderJournalScreen(document.getElementById("journal-container"), state);
    }
  });

  // 7. Route to saved state or show intro
  const introSeen = localStorage.getItem("ares_intro_seen");

  if (state.status === "completed") {
    const ending = evaluateMissionEnding(state);
    if (state.reflection?.done) {
      showScreen("journal");
      renderJournalScreen(document.getElementById("journal-container"), state);
    } else {
      showEndingScreen(ending);
    }
  } else if (state.status === "active") {
    startDayPhase(state.phase || "opening");
  } else {
    // New player: play intro cinematic on first visit
    if (!introSeen) {
      playIntroCinematic();
    } else {
      showScreen("welcome");
    }
  }
}

// Boot application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
