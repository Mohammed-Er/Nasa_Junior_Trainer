/**
 * ARES: The Last Signal - Master Application Orchestrator
 * Stages 1 through 10: Complete Implementation
 * - Welcoming & NASA Briefing
 * - Persistent HUD & Navigation Tabs
 * - Dynamic Campaign & Seeded Events
 * - Decision Cards with Trade-off Previews
 * - Dedicated Outcome Report
 * - Delayed Interplanetary Earth Communications System (Stage 8)
 * - Sol 30 Ending Evaluation, Mission Patches & Soft Grace Triage (Stage 9)
 * - Developer Diagnostics Overlay (Stage 10)
 */

import { TAG_DEFINITIONS, FICTIONAL_DISCLAIMER, SOURCES } from "../data/sources.js";
import { CREW } from "../data/crew.js";
import { GAME_CONSTANTS } from "./constants.js";
import { createInitialState, saveGameState, loadGameState, clearSavedGame } from "./gameState.js";
import {
  applyChoice,
  advanceSol,
  sendStatusQuery,
  applyEmergencyTriage,
  EMERGENCY_TRIAGE_OPTIONS,
  evaluateMissionEnding
} from "./gameEngine.js";
import { EVENTS_DATA } from "../data/eventsData.js";
import { CAMPAIGN_BEATS } from "../data/campaign.js";
import { initDevTools } from "./devTools.js";

// Master In-Memory State
let state = null;
let currentEvent = null;
let selectedChoiceId = null;
let selectedTriageId = null;
let lastFocusedElement = null;

// Screen Elements
const screenWelcome = document.getElementById("screen-welcome");
const screenBriefing = document.getElementById("screen-briefing");
const screenGame = document.getElementById("screen-game");
const screenOutcome = document.getElementById("screen-outcome");
const screenEnding = document.getElementById("screen-ending");

// Navigation & Header Elements
const btnStartMission = document.getElementById("btn-start-mission");
const btnBriefingBack = document.getElementById("btn-briefing-back");
const btnBeginMission = document.getElementById("btn-begin-mission");
const btnRestartGame = document.getElementById("btn-restart-game");

const hudSolDisplay = document.getElementById("hud-sol-display");
const hudChapterDisplay = document.getElementById("hud-chapter-display");
const hudProgressFill = document.getElementById("hud-progress-fill");
const hudProgressText = document.getElementById("hud-progress-text");
const hudCommBadge = document.getElementById("hud-comm-badge");
const hudCommStatus = document.getElementById("hud-comm-status");
const btnHudQuery = document.getElementById("btn-hud-query");

// Tab Navigation Elements
const tabBtns = {
  mission: document.getElementById("tab-btn-mission"),
  resources: document.getElementById("tab-btn-resources"),
  log: document.getElementById("tab-btn-log")
};

const tabPanes = {
  mission: document.getElementById("tab-mission"),
  resources: document.getElementById("tab-resources"),
  log: document.getElementById("tab-log")
};

// Mission Tab Dynamic Containers
const missionEventContainer = document.getElementById("mission-event-container");
const overnightReportBox = document.getElementById("overnight-report-box");
const overnightReportList = document.getElementById("overnight-report-list");
const incomingCommBanner = document.getElementById("incoming-comm-banner");

// Resources Tab Elements
const valPower = document.getElementById("val-power");
const bandPower = document.getElementById("band-power");
const gaugePower = document.getElementById("gauge-power");

const valLifeSupport = document.getElementById("val-lifesupport");
const bandLifeSupport = document.getElementById("band-lifesupport");
const gaugeLifeSupport = document.getElementById("gauge-lifesupport");

const valRadiation = document.getElementById("val-radiation");
const bandRadiation = document.getElementById("band-radiation");
const gaugeRadiation = document.getElementById("gauge-radiation");

const resourceAuditFeed = document.getElementById("resource-audit-feed");
const logTimeline = document.querySelector(".log-timeline");

// Comm Console Elements (in Mission Log Tab)
const btnSendCommQuery = document.getElementById("btn-send-comm-query");
const commConsoleStatusPill = document.getElementById("comm-console-status-pill");
const commQueryStatus = document.getElementById("comm-query-status");

// Outcome Screen Elements
const outcomeSolBadge = document.getElementById("outcome-sol-badge");
const outcomeEventTitle = document.getElementById("outcome-event-title");
const outcomeChoiceLabel = document.getElementById("outcome-choice-label");
const outcomeNarrativeText = document.getElementById("outcome-narrative-text");

const outcomeDeltaPower = document.getElementById("outcome-delta-power");
const outcomeBeforePower = document.getElementById("outcome-before-power");
const outcomeAfterPower = document.getElementById("outcome-after-power");

const outcomeDeltaLs = document.getElementById("outcome-delta-ls");
const outcomeBeforeLs = document.getElementById("outcome-before-ls");
const outcomeAfterLs = document.getElementById("outcome-after-ls");

const outcomeDeltaRad = document.getElementById("outcome-delta-rad");
const outcomeBeforeRad = document.getElementById("outcome-before-rad");
const outcomeAfterRad = document.getElementById("outcome-after-rad");

const outcomeCrewName = document.getElementById("outcome-crew-name");
const outcomeCrewRole = document.getElementById("outcome-crew-role");
const outcomeCrewQuote = document.getElementById("outcome-crew-quote");
const outcomeScienceTag = document.getElementById("outcome-science-tag");
const outcomeScienceText = document.getElementById("outcome-science-text");
const btnOutcomeContinue = document.getElementById("btn-outcome-continue");

// Ending Screen Elements (Stage 9)
const endingBadgeTag = document.getElementById("ending-badge-tag");
const endingTitle = document.getElementById("ending-title");
const endingSubtitle = document.getElementById("ending-subtitle");
const endingBadgeContainer = document.getElementById("ending-badge-container");
const endingStatusTag = document.getElementById("ending-status-tag");
const endingNarrative = document.getElementById("ending-narrative");
const endingCrewSpeaker = document.getElementById("ending-crew-speaker");
const endingCrewRole = document.getElementById("ending-crew-role");
const endingCrewQuote = document.getElementById("ending-crew-quote");

const endingValPower = document.getElementById("ending-val-power");
const endingPowerTag = document.getElementById("ending-power-tag");
const endingValLs = document.getElementById("ending-val-ls");
const endingLsTag = document.getElementById("ending-ls-tag");
const endingValRad = document.getElementById("ending-val-rad");
const endingRadTag = document.getElementById("ending-rad-tag");

const endingObjectivesCount = document.getElementById("ending-objectives-count");
const endingObjectivesList = document.getElementById("ending-objectives-list");
const endingScienceTakeaway = document.getElementById("ending-science-takeaway");
const btnEndingReviewLog = document.getElementById("btn-ending-review-log");
const btnEndingRestart = document.getElementById("btn-ending-restart");

// Modal Elements: About & Sources
const btnAbout = document.getElementById("btn-about");
const modalAbout = document.getElementById("modal-about");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnModalDone = document.getElementById("btn-modal-done");
const tagLegendContainer = document.getElementById("tag-legend-container");
const verifiedSourcesList = document.getElementById("verified-sources-list");
const disclaimerText = document.getElementById("disclaimer-text");

// Modal Elements: Restart Confirmation
const modalRestart = document.getElementById("modal-restart");
const btnCloseRestart = document.getElementById("btn-close-restart");
const btnCancelRestart = document.getElementById("btn-cancel-restart");
const btnConfirmRestart = document.getElementById("btn-confirm-restart");

// Modal Elements: Emergency Lifeboat Triage
const modalTriage = document.getElementById("modal-triage");
const triageCardsGrid = document.getElementById("triage-cards-grid");
const btnConfirmTriage = document.getElementById("btn-confirm-triage");

// Crew Dossier Container
const crewDossierGrid = document.getElementById("crew-dossier-grid");

/**
 * Screen Navigator - Transitions between major screens
 */
function showScreen(screenId) {
  const allScreens = [screenWelcome, screenBriefing, screenGame, screenOutcome, screenEnding];
  allScreens.forEach((screen) => {
    if (screen) {
      screen.classList.remove("active");
      screen.hidden = true;
    }
  });

  const target = document.getElementById(screenId);
  if (target) {
    target.hidden = false;
    requestAnimationFrame(() => {
      target.classList.add("active");
    });
  }

  if (state) {
    state.currentScreen = screenId.replace("screen-", "");
    saveGameState(state);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Tab Switcher - Switches between Mission, Resources, and Log
 */
function switchTab(targetTabKey) {
  Object.keys(tabBtns).forEach((key) => {
    const btn = tabBtns[key];
    const pane = tabPanes[key];

    if (key === targetTabKey) {
      btn?.classList.add("active");
      btn?.setAttribute("aria-selected", "true");
      pane?.classList.add("active");
    } else {
      btn?.classList.remove("active");
      btn?.setAttribute("aria-selected", "false");
      pane?.classList.remove("active");
    }
  });

  if (state) {
    state.currentTab = targetTabKey;
    saveGameState(state);
  }
}

/**
 * Modal Controller Helpers
 */
function openModal(modalEl, focusEl) {
  lastFocusedElement = document.activeElement;
  modalEl.hidden = false;
  requestAnimationFrame(() => {
    modalEl.classList.add("active");
    focusEl?.focus();
  });
  document.body.style.overflow = "hidden";
}

function closeModal(modalEl) {
  modalEl.classList.remove("active");
  setTimeout(() => {
    modalEl.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }, 200);
}

/**
 * Render Status Band (Optimal / Caution / Critical)
 */
function getBandClassAndLabel(value) {
  if (value >= GAME_CONSTANTS.BANDS.OPTIMAL_MIN) {
    return { className: "tag tag-optimal", label: "OPTIMAL" };
  } else if (value >= GAME_CONSTANTS.BANDS.CAUTION_MIN) {
    return { className: "tag tag-caution", label: "CAUTION" };
  } else {
    return { className: "tag tag-critical", label: "CRITICAL" };
  }
}

/**
 * Synchronize UI with Master State
 */
function syncUIWithState() {
  if (!state) return;

  // 1. HUD Header Elements
  if (hudSolDisplay) {
    hudSolDisplay.textContent = `SOL ${state.sol < 10 ? "0" + state.sol : state.sol} / ${GAME_CONSTANTS.TOTAL_SOLS}`;
  }

  const currentChap = GAME_CONSTANTS.CHAPTERS.find((c) => c.number === state.chapter);
  if (hudChapterDisplay && currentChap) {
    hudChapterDisplay.textContent = `Chapter ${currentChap.number}: ${currentChap.title}`;
  }

  const progressPct = ((state.sol / GAME_CONSTANTS.TOTAL_SOLS) * 100).toFixed(1);
  if (hudProgressFill) {
    hudProgressFill.style.width = `${progressPct}%`;
  }
  if (hudProgressText) {
    hudProgressText.textContent = `${state.sol}/${GAME_CONSTANTS.TOTAL_SOLS}`;
  }

  // HUD Comm Badge & Mission Log Comm Pill
  if (hudCommStatus) {
    if (state.comm.status === "restored") {
      hudCommStatus.textContent = "SIGNAL CARRIER: ACTIVE";
      hudCommStatus.parentElement.style.borderColor = "rgba(39, 174, 96, 0.4)";
      hudCommStatus.parentElement.style.color = "#69F0AE";
      if (commConsoleStatusPill) {
        commConsoleStatusPill.textContent = "CARRIER ACTIVE";
        commConsoleStatusPill.className = "tag tag-optimal";
      }
    } else if (state.comm.status === "intermittent") {
      hudCommStatus.textContent = "SIGNAL: INTERMITTENT";
      hudCommStatus.parentElement.style.borderColor = "rgba(243, 156, 18, 0.4)";
      hudCommStatus.parentElement.style.color = "#FFD54F";
      if (commConsoleStatusPill) {
        commConsoleStatusPill.textContent = "INTERMITTENT";
        commConsoleStatusPill.className = "tag tag-caution";
      }
    } else {
      hudCommStatus.textContent = "SIGNAL LOST // BLACKOUT";
      hudCommStatus.parentElement.style.borderColor = "rgba(231, 76, 60, 0.4)";
      hudCommStatus.parentElement.style.color = "#FF8A80";
      if (commConsoleStatusPill) {
        commConsoleStatusPill.textContent = "BLACKOUT";
        commConsoleStatusPill.className = "tag tag-critical";
      }
    }
  }

  // Earth Comm Query Console State
  const pendingQuery = state.commQueue ? state.commQueue.find((m) => m.isQuery) : null;
  if (pendingQuery) {
    if (btnSendCommQuery) btnSendCommQuery.disabled = true;
    if (btnHudQuery) btnHudQuery.disabled = true;
    if (commQueryStatus) {
      commQueryStatus.textContent = `Carrier packet en route to Earth. Houston reply expected on Sol ${pendingQuery.deliverOnSol < 10 ? "0" + pendingQuery.deliverOnSol : pendingQuery.deliverOnSol}.`;
      commQueryStatus.style.color = "var(--color-mars-orange)";
    }
  } else {
    if (btnSendCommQuery) btnSendCommQuery.disabled = false;
    if (btnHudQuery) btnHudQuery.disabled = false;
    if (commQueryStatus) {
      commQueryStatus.textContent = "Relay transceiver idle. Ready to transmit outpost telemetry packet.";
      commQueryStatus.style.color = "var(--color-text-dim)";
    }
  }

  // 2. Resources Gauges
  const pBand = getBandClassAndLabel(state.resources.power);
  if (valPower) valPower.textContent = `${state.resources.power}%`;
  if (gaugePower) gaugePower.style.width = `${state.resources.power}%`;
  if (bandPower) {
    bandPower.className = pBand.className;
    bandPower.textContent = pBand.label;
  }

  const lsBand = getBandClassAndLabel(state.resources.lifeSupport);
  if (valLifeSupport) valLifeSupport.textContent = `${state.resources.lifeSupport}%`;
  if (gaugeLifeSupport) gaugeLifeSupport.style.width = `${state.resources.lifeSupport}%`;
  if (bandLifeSupport) {
    bandLifeSupport.className = lsBand.className;
    bandLifeSupport.textContent = lsBand.label;
  }

  const radBand = getBandClassAndLabel(state.resources.radiationSafety);
  if (valRadiation) valRadiation.textContent = `${state.resources.radiationSafety}%`;
  if (gaugeRadiation) gaugeRadiation.style.width = `${state.resources.radiationSafety}%`;
  if (bandRadiation) {
    bandRadiation.className = radBand.className;
    bandRadiation.textContent = radBand.label;
  }

  // 3. Resources Tab Audit Feed
  if (resourceAuditFeed && state.recentChanges) {
    resourceAuditFeed.innerHTML = state.recentChanges.slice(0, 8).map((entry) => {
      const deltas = entry.deltas;
      const deltaTokens = [];
      if (deltas.power !== 0) deltaTokens.push(`Power ${deltas.power > 0 ? "+" : ""}${deltas.power}%`);
      if (deltas.lifeSupport !== 0) deltaTokens.push(`Life Support ${deltas.lifeSupport > 0 ? "+" : ""}${deltas.lifeSupport}%`);
      if (deltas.radiationSafety !== 0) deltaTokens.push(`Rad Safety ${deltas.radiationSafety > 0 ? "+" : ""}${deltas.radiationSafety}%`);
      const deltaSummary = deltaTokens.length > 0 ? deltaTokens.join(" • ") : "No Resource Shift";

      return `
        <div class="audit-feed-item">
          <div>
            <strong style="color:var(--color-text-primary);">Sol ${entry.sol < 10 ? "0" + entry.sol : entry.sol}: ${entry.cause}</strong>
            <p style="color:var(--color-text-secondary); font-size:0.8rem;">${deltaSummary}</p>
          </div>
          <span class="tag tag-optimal">Verified</span>
        </div>
      `;
    }).join("");
  }

  // 4. Mission Log Tab Feed (with Comm Transmissions & Triage)
  if (logTimeline && state.logHistory) {
    logTimeline.innerHTML = state.logHistory.map((item) => {
      let badgeTag = item.type.toUpperCase();
      let badgeClass = "tag-science";

      if (item.type === "transmission") {
        badgeTag = item.wasStale ? "STALE COMM" : "DEEP SPACE RELAY";
        badgeClass = item.wasStale ? "tag-caution" : "tag-optimal";
      } else if (item.type === "triage") {
        badgeTag = "CRITICAL TRIAGE";
        badgeClass = "tag-critical";
      }

      return `
        <article class="log-item" style="${item.type === 'transmission' ? 'border-left: 3px solid #3498DB;' : ''}">
          <div class="log-item-header">
            <span class="log-item-sol">SOL ${item.sol < 10 ? "0" + item.sol : item.sol} // ${item.sender || "MISSION LOG"}</span>
            <span class="tag ${badgeClass}">[${badgeTag}]</span>
          </div>
          <h4 class="log-item-title">${item.title}</h4>
          <p class="log-item-body">${item.text}</p>
        </article>
      `;
    }).join("");
  }

  // 5. Overnight Report Box
  if (overnightReportBox && overnightReportList) {
    if (state.overnightReport && state.overnightReport.log && state.overnightReport.log.length > 0) {
      overnightReportBox.hidden = false;
      overnightReportList.innerHTML = state.overnightReport.log
        .map((line) => `<li>• ${line}</li>`)
        .join("");
    } else {
      overnightReportBox.hidden = true;
    }
  }

  // 6. Incoming Earth Comm Banner in Mission Tab
  if (incomingCommBanner) {
    if (state.latestComm && state.latestComm.deliveredOnSol === state.sol) {
      incomingCommBanner.hidden = false;
      incomingCommBanner.innerHTML = `
        <div class="incoming-comm-top">
          <div class="incoming-comm-title-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3498DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
              <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"></path>
            </svg>
            <span class="incoming-comm-title">${state.latestComm.subject}</span>
          </div>
          <span class="tag ${state.latestComm.wasStale ? 'tag-caution' : 'tag-science'}">
            ${state.latestComm.wasStale ? 'STALE ADVISORY' : 'EARTH COMM'}
          </span>
        </div>
        <span class="incoming-comm-sender">${state.latestComm.sender} // RECEIVED SOL ${state.sol < 10 ? '0' + state.sol : state.sol}</span>
        <p class="incoming-comm-body">"${state.latestComm.activeBody}"</p>
      `;
    } else {
      incomingCommBanner.hidden = true;
    }
  }

  // 7. Check for Mid-Campaign Emergency Lifeboat Triage
  if (state.status === "critical_grace") {
    openTriageModal();
  }
}

/**
 * Render Immediate Delta Pills on Decision Cards
 */
function renderDeltaPills(deltas) {
  const pills = [];

  if (deltas.power > 0) {
    pills.push(`<span class="delta-pill pos">⚡ +${deltas.power}% Power</span>`);
  } else if (deltas.power < 0) {
    pills.push(`<span class="delta-pill neg">⚡ ${deltas.power}% Power</span>`);
  }

  if (deltas.lifeSupport > 0) {
    pills.push(`<span class="delta-pill pos">🌿 +${deltas.lifeSupport}% Life Support</span>`);
  } else if (deltas.lifeSupport < 0) {
    pills.push(`<span class="delta-pill neg">🌿 ${deltas.lifeSupport}% Life Support</span>`);
  }

  if (deltas.radiationSafety > 0) {
    pills.push(`<span class="delta-pill pos">🛡️ +${deltas.radiationSafety}% Rad Safety</span>`);
  } else if (deltas.radiationSafety < 0) {
    pills.push(`<span class="delta-pill neg">🛡️ ${deltas.radiationSafety}% Rad Safety</span>`);
  }

  if (pills.length === 0) {
    pills.push(`<span class="delta-pill neutral">No Resource Drain</span>`);
  }

  return pills.join(" ");
}

/**
 * Render Current Sol View (Routine Briefing vs Major Event)
 */
function renderSolView(eventOverride = null) {
  if (!missionEventContainer || !state) return;

  const currentBeat = CAMPAIGN_BEATS[state.sol];

  // If this is a Routine Day without override (NO decision required: every 3-4 days an event happens)
  if (!eventOverride && (!currentBeat || !currentBeat.hasDecision)) {
    selectedChoiceId = null;
    currentEvent = null;
    state.awaitingDecision = false;

    const beat = currentBeat || {
      sol: state.sol,
      title: "Outpost Daily Maintenance",
      crewSpeaker: "Marcus Vance",
      crewRole: "Systems Engineer",
      crewDialogue: "Power grids and life-support loops checked out clean this morning. Continuing scheduled duties.",
      habitatStatus: "All modules nominal. Pressurization stable.",
      crewMood: "Steady & Operational"
    };

    missionEventContainer.innerHTML = `
      <section class="decision-section" style="border-color: var(--color-space-medium);">
        <div class="decision-section-header">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <span class="decision-directive-tag" style="color:var(--color-text-secondary);">
              DAILY OUTPOST LOG // SOL ${state.sol < 10 ? "0" + state.sol : state.sol}
            </span>
            <span class="tag tag-optimal">[CREW MOOD: ${beat.crewMood}]</span>
          </div>
          <h3 class="decision-section-title">${beat.title}</h3>
          <p class="decision-section-intro">${beat.habitatStatus}</p>
        </div>

        <!-- Daily Crew Dispatch Bubble -->
        <article class="crew-speech-card" style="margin: 0.5rem 0;">
          <div class="crew-speech-avatar" aria-hidden="true" style="border-color: var(--color-space-medium); color: var(--color-mars-orange);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="crew-speech-content">
            <div class="crew-speech-author">
              <span class="crew-speech-name">${beat.crewSpeaker}</span>
              <span class="crew-speech-role">${beat.crewRole}</span>
            </div>
            <p class="crew-speech-bubble">"${beat.crewDialogue}"</p>
          </div>
        </article>

        <div class="decision-confirm-bar">
          <span class="decision-selection-note">Daily checks completed. No immediate operational emergency reported.</span>
          <button id="btn-advance-routine" class="btn btn-primary" type="button">
            Acknowledge &amp; Advance to Sol ${state.sol + 1 < 10 ? "0" + (state.sol + 1) : state.sol + 1} &rarr;
          </button>
        </div>
      </section>
    `;

    document.getElementById("btn-advance-routine")?.addEventListener("click", () => {
      advanceSol(state);
      if (state.status === "interrupted") {
        showEndingScreen(evaluateMissionEnding(state));
        return;
      }
      syncUIWithState();
      renderSolView();
    });

    return;
  }

  // If this IS an Event Sol (Fixed Story Beat or Random Slot)
  let eventData = eventOverride;
  if (!eventData) {
    let eventId = currentBeat?.fixedEventId;
    if (!eventId && currentBeat?.type === "random_slot") {
      eventId = state.eventSchedule ? state.eventSchedule[state.sol] : null;
    }
    if (!eventId) {
      eventId = currentBeat?.eventId;
    }

    eventData = EVENTS_DATA[eventId];
  }

  if (!eventData) {
    console.warn(`[EVENT LOOKUP WARNING] No event found for Sol ${state.sol}`);
    return;
  }

  currentEvent = eventData;
  state.awaitingDecision = true;

  missionEventContainer.innerHTML = `
    <section class="decision-section" aria-labelledby="decision-title">
      <div class="decision-section-header">
        <span class="decision-directive-tag">COMMAND DIRECTIVE REQUIRED // SOL ${state.sol < 10 ? "0" + state.sol : state.sol}</span>
        <h3 id="decision-title" class="decision-section-title">${eventData.title}</h3>
        <p class="decision-section-intro">${eventData.intro}</p>
      </div>

      <!-- Decision Cards Grid -->
      <div id="decision-cards-grid" class="decision-cards-grid" role="radiogroup" aria-label="Command Decision Options">
        ${eventData.choices.map((choice, idx) => `
          <div class="decision-card ${selectedChoiceId === choice.id ? "selected" : ""}" 
               tabindex="0" 
               role="radio" 
               aria-checked="${selectedChoiceId === choice.id}" 
               data-choice-id="${choice.id}">
            <div class="decision-card-top">
              <div class="decision-card-badge-row">
                <span class="decision-card-badge">Option ${String.fromCharCode(65 + idx)}</span>
                <div class="decision-card-check" aria-hidden="true">&#10003;</div>
              </div>
              <h4 class="decision-card-title">${choice.label}</h4>
              <p class="decision-card-preview">${choice.preview}</p>
              <div class="decision-card-tradeoff">
                <strong>Trade-off:</strong> ${choice.tradeoff}
              </div>
            </div>
            
            <!-- Immediate Cost Badges -->
            <div class="decision-card-deltas">
              ${renderDeltaPills(choice.deltas)}
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Confirmation Bar -->
      <div class="decision-confirm-bar">
        <div class="decision-selection-note">
          ${selectedChoiceId 
            ? `Selected: <strong>${eventData.choices.find(c => c.id === selectedChoiceId)?.label}</strong>` 
            : `Select an order above to review its trade-offs.`}
        </div>
        <button id="btn-confirm-decision" class="btn btn-primary" type="button" ${!selectedChoiceId ? "disabled" : ""}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Confirm Commander's Order
        </button>
      </div>
    </section>
  `;

  // Attach card selection listeners
  const cards = missionEventContainer.querySelectorAll(".decision-card");
  cards.forEach((card) => {
    const choiceId = card.getAttribute("data-choice-id");

    const selectThisCard = () => {
      selectedChoiceId = choiceId;
      cards.forEach((c) => {
        c.classList.remove("selected");
        c.setAttribute("aria-checked", "false");
      });
      card.classList.add("selected");
      card.setAttribute("aria-checked", "true");

      const confirmBtn = document.getElementById("btn-confirm-decision");
      if (confirmBtn) {
        confirmBtn.removeAttribute("disabled");
      }
      const noteEl = missionEventContainer.querySelector(".decision-selection-note");
      const chosen = eventData.choices.find((c) => c.id === choiceId);
      if (noteEl && chosen) {
        noteEl.innerHTML = `Selected: <strong>${chosen.label}</strong>`;
      }
    };

    card.addEventListener("click", selectThisCard);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectThisCard();
      }
    });
  });

  // Attach Confirmation Action -> Opens Stage 6 Outcome Screen!
  const btnConfirm = document.getElementById("btn-confirm-decision");
  btnConfirm?.addEventListener("click", () => {
    if (!selectedChoiceId || !state.awaitingDecision) return;

    const choice = eventData.choices.find((c) => c.id === selectedChoiceId);
    if (!choice) return;

    // Apply decision through gameEngine
    const resolution = applyChoice(state, choice, eventData);

    // Check if immediate critical grace triage was triggered
    if (state.status === "critical_grace") {
      openTriageModal();
      return;
    }

    // Check if immediate failure occurred
    if (state.status === "interrupted") {
      showEndingScreen(evaluateMissionEnding(state));
      return;
    }

    // Open Screen 5: Dedicated Outcome Screen
    showOutcomeScreen(resolution, eventData);
  });
}

/**
 * Dedicated Decision Outcome Screen Controller
 */
function showOutcomeScreen(resolution, eventData) {
  if (!resolution) return;

  // Header & Narrative
  if (outcomeSolBadge) {
    outcomeSolBadge.textContent = `Sol ${state.sol < 10 ? "0" + state.sol : state.sol} Command Order Executed`;
  }
  if (outcomeEventTitle) {
    outcomeEventTitle.textContent = eventData.title;
  }
  if (outcomeChoiceLabel) {
    outcomeChoiceLabel.textContent = `Order: ${resolution.choiceLabel}`;
  }
  if (outcomeNarrativeText) {
    outcomeNarrativeText.textContent = resolution.narrativeOutcome;
  }

  // Exact Before-and-After Resource Changes
  const formatDelta = (delta, el) => {
    if (!el) return;
    if (delta > 0) {
      el.className = "delta-pill pos";
      el.textContent = `+${delta}%`;
    } else if (delta < 0) {
      el.className = "delta-pill neg";
      el.textContent = `${delta}%`;
    } else {
      el.className = "delta-pill neutral";
      el.textContent = "0%";
    }
  };

  formatDelta(resolution.appliedDeltas.power, outcomeDeltaPower);
  if (outcomeBeforePower) outcomeBeforePower.textContent = `${resolution.before.power}%`;
  if (outcomeAfterPower) outcomeAfterPower.textContent = `${resolution.after.power}%`;

  formatDelta(resolution.appliedDeltas.lifeSupport, outcomeDeltaLs);
  if (outcomeBeforeLs) outcomeBeforeLs.textContent = `${resolution.before.lifeSupport}%`;
  if (outcomeAfterLs) outcomeAfterLs.textContent = `${resolution.after.lifeSupport}%`;

  formatDelta(resolution.appliedDeltas.radiationSafety, outcomeDeltaRad);
  if (outcomeBeforeRad) outcomeBeforeRad.textContent = `${resolution.before.radiationSafety}%`;
  if (outcomeAfterRad) outcomeAfterRad.textContent = `${resolution.after.radiationSafety}%`;

  // Crew Reaction
  if (outcomeCrewName) outcomeCrewName.textContent = resolution.crewReaction.speaker;
  if (outcomeCrewRole) outcomeCrewRole.textContent = resolution.crewReaction.role;
  if (outcomeCrewQuote) outcomeCrewQuote.textContent = `"${resolution.crewReaction.text}"`;

  // Scientific Telemetry Blurb
  if (outcomeScienceTag) {
    outcomeScienceTag.textContent = `[${resolution.science.typeTag.toUpperCase().replace("_", " ")}]`;
  }
  if (outcomeScienceText) {
    outcomeScienceText.textContent = resolution.science.text;
  }

  // Button wording on Sol 30 vs mid-campaign
  if (btnOutcomeContinue) {
    if (state.sol === 30) {
      btnOutcomeContinue.innerHTML = "View Mission Conclusion &rarr;";
    } else {
      btnOutcomeContinue.innerHTML = "Continue Mission &rarr;";
    }
  }

  // Show the Screen
  showScreen("screen-outcome");
}

/**
 * Mid-Campaign Emergency Lifeboat Triage Modal Controller
 */
function openTriageModal() {
  if (!modalTriage || !triageCardsGrid) return;
  selectedTriageId = null;
  if (btnConfirmTriage) btnConfirmTriage.disabled = true;

  triageCardsGrid.innerHTML = EMERGENCY_TRIAGE_OPTIONS.map((opt) => `
    <div class="triage-card" data-triage-id="${opt.id}" tabindex="0" role="radio" aria-checked="false">
      <div class="triage-card-header">
        <h4 class="triage-card-title">${opt.label}</h4>
        <div class="decision-card-check" aria-hidden="true">&#10003;</div>
      </div>
      <p style="font-size:0.875rem; color:var(--color-text-secondary); line-height:1.45;">${opt.desc}</p>
      <div class="triage-card-tradeoff">
        <strong>Trade-off:</strong> ${opt.tradeoff}
      </div>
      <div class="decision-card-deltas">
        ${renderDeltaPills(opt.deltas)}
      </div>
    </div>
  `).join("");

  const cards = triageCardsGrid.querySelectorAll(".triage-card");
  cards.forEach((card) => {
    const selectThis = () => {
      selectedTriageId = card.getAttribute("data-triage-id");
      cards.forEach((c) => {
        c.classList.remove("selected");
        c.setAttribute("aria-checked", "false");
      });
      card.classList.add("selected");
      card.setAttribute("aria-checked", "true");
      if (btnConfirmTriage) btnConfirmTriage.disabled = false;
    };
    card.addEventListener("click", selectThis);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectThis();
      }
    });
  });

  openModal(modalTriage, btnConfirmTriage);
}

/**
 * Sol 30 Dedicated Mission Ending Screen Controller (Stage 9)
 */
function showEndingScreen(endingData) {
  if (!endingData) return;

  if (endingBadgeTag) {
    endingBadgeTag.textContent = `ARES-1 CAMPAIGN CONCLUSION // SOL ${state.sol < 10 ? "0" + state.sol : state.sol}`;
  }
  if (endingTitle) endingTitle.textContent = endingData.title;
  if (endingSubtitle) endingSubtitle.textContent = endingData.subtitle;

  if (endingStatusTag) {
    endingStatusTag.className = `tag ${endingData.tagClass}`;
    endingStatusTag.textContent = `[${endingData.tag}]`;
  }

  if (endingNarrative) endingNarrative.textContent = endingData.narrative;
  if (endingCrewSpeaker) endingCrewSpeaker.textContent = endingData.crewQuote.speaker;
  if (endingCrewRole) endingCrewRole.textContent = endingData.crewQuote.role;
  if (endingCrewQuote) endingCrewQuote.textContent = `"${endingData.crewQuote.text}"`;
  if (endingScienceTakeaway) endingScienceTakeaway.textContent = endingData.scienceTakeaway;

  // Final telemetry values & band tags
  const pBand = getBandClassAndLabel(endingData.stats.power);
  if (endingValPower) endingValPower.textContent = `${endingData.stats.power}%`;
  if (endingPowerTag) {
    endingPowerTag.className = pBand.className;
    endingPowerTag.textContent = pBand.label;
  }

  const lsBand = getBandClassAndLabel(endingData.stats.lifeSupport);
  if (endingValLs) endingValLs.textContent = `${endingData.stats.lifeSupport}%`;
  if (endingLsTag) {
    endingLsTag.className = lsBand.className;
    endingLsTag.textContent = lsBand.label;
  }

  const radBand = getBandClassAndLabel(endingData.stats.radiationSafety);
  if (endingValRad) endingValRad.textContent = `${endingData.stats.radiationSafety}%`;
  if (endingRadTag) {
    endingRadTag.className = radBand.className;
    endingRadTag.textContent = radBand.label;
  }

  // Objectives checklist
  if (endingObjectivesCount) {
    endingObjectivesCount.textContent = `${endingData.stats.completedObjectivesCount} / ${endingData.stats.totalObjectives} COMPLETED`;
  }

  const objectiveItems = [
    { key: "commsRestored", label: "Primary Mars-Earth Carrier Link Synchronized" },
    { key: "antennaAligned", label: "High-Gain Parabolic Antenna Azimuth Calibrated" },
    { key: "researchSamples", label: "Martian Surface & Frost Core Samples Analyzed (>= 2)" },
    { key: "panelsUnderstood", label: "Solar Array Dust Vortex Mechanics Inspected" },
    { key: "shelterProtocolsMaintained", label: "Radiation Storm Shelter Protocols Maintained (SPE)" }
  ];

  if (endingObjectivesList) {
    endingObjectivesList.innerHTML = objectiveItems.map((obj) => {
      const isCompleted = !!state.objectives[obj.key];
      return `
        <li class="ending-objective-item ${isCompleted ? 'completed' : 'failed'}">
          <span style="color:var(--color-text-primary);">${obj.label}</span>
          <span class="objective-icon-status" style="color: ${isCompleted ? 'var(--color-status-optimal)' : 'var(--color-text-dim)'};">
            ${isCompleted ? '&#10003; COMPLETED' : '&#10005; INCOMPLETE'}
          </span>
        </li>
      `;
    }).join("");
  }

  // Render SVG Mission Patch
  if (endingBadgeContainer) {
    endingBadgeContainer.className = `ending-badge-container ${endingData.badgeClass}`;
    if (endingData.id === "ending_optimal") {
      endingBadgeContainer.innerHTML = `
        <svg width="105" height="105" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="46" stroke="#27AE60" stroke-width="3" fill="rgba(39, 174, 96, 0.15)"/>
          <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3 3"/>
          <path d="M50 22 L50 36 M42 27 L58 27" stroke="#69F0AE" stroke-width="2" stroke-linecap="round"/>
          <path d="M42 16 A12 12 0 0 1 58 16" stroke="#69F0AE" stroke-width="2" fill="none"/>
          <path d="M36 10 A20 20 0 0 1 64 10" stroke="#69F0AE" stroke-width="2" fill="none"/>
          <path d="M26 72 Q50 48 74 72 Z" fill="#C65A35" stroke="#E17A43" stroke-width="2"/>
          <line x1="20" y1="72" x2="80" y2="72" stroke="#E17A43" stroke-width="2"/>
          <circle cx="34" cy="40" r="2.5" fill="#FFD54F"/>
          <circle cx="44" cy="34" r="2.5" fill="#FFD54F"/>
          <circle cx="56" cy="34" r="2.5" fill="#FFD54F"/>
          <circle cx="66" cy="40" r="2.5" fill="#FFD54F"/>
          <text x="50" y="85" font-family="monospace" font-size="7.5" font-weight="bold" fill="#69F0AE" text-anchor="middle">ARES // SOL 30</text>
        </svg>
      `;
    } else if (endingData.id === "ending_pragmatic") {
      endingBadgeContainer.innerHTML = `
        <svg width="105" height="105" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <polygon points="50,6 90,26 90,74 50,94 10,74 10,26" stroke="#F39C12" stroke-width="3" fill="rgba(243, 156, 18, 0.15)"/>
          <path d="M50 24 L50 38" stroke="#FFD54F" stroke-width="2" stroke-linecap="round"/>
          <path d="M40 18 A14 14 0 0 1 60 18" stroke="#FFD54F" stroke-width="2" fill="none"/>
          <path d="M30 68 Q50 50 70 68 Z" fill="#9E3D2F" stroke="#F39C12" stroke-width="2"/>
          <line x1="20" y1="68" x2="80" y2="68" stroke="#F39C12" stroke-width="2"/>
          <circle cx="38" cy="44" r="2" fill="#FFD54F"/>
          <circle cx="62" cy="44" r="2" fill="#FFD54F"/>
          <text x="50" y="84" font-family="monospace" font-size="7" font-weight="bold" fill="#FFD54F" text-anchor="middle">ARES-1 SURVIVED</text>
        </svg>
      `;
    } else {
      endingBadgeContainer.innerHTML = `
        <svg width="105" height="105" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <polygon points="50,6 92,28 92,72 50,94 8,72 8,28" stroke="#E74C3C" stroke-width="3" fill="rgba(231, 76, 60, 0.15)"/>
          <polygon points="50,22 76,68 24,68" stroke="#FF8A80" stroke-width="2.5" fill="none"/>
          <line x1="50" y1="36" x2="50" y2="52" stroke="#FF8A80" stroke-width="3" stroke-linecap="round"/>
          <circle cx="50" cy="60" r="2" fill="#FF8A80"/>
          <text x="50" y="84" font-family="monospace" font-size="7" font-weight="bold" fill="#FF8A80" text-anchor="middle">SUSPENDED</text>
        </svg>
      `;
    }
  }

  showScreen("screen-ending");
}

/**
 * Handle Sending Earth Status Query
 */
function handleSendQuery() {
  const result = sendStatusQuery(state);
  if (!result.success) {
    alert("Query already in transit to Earth. Radio telemetry carrier wave is traveling across interplanetary space.");
    return;
  }
  syncUIWithState();
}

/**
 * Setup Screen Transitions & Modal Listeners
 */
function setupEventListeners() {
  btnStartMission?.addEventListener("click", () => showScreen("screen-briefing"));
  btnBriefingBack?.addEventListener("click", () => showScreen("screen-welcome"));
  btnBeginMission?.addEventListener("click", () => {
    state.status = "active";
    saveGameState(state);
    showScreen("screen-game");
    switchTab("mission");
    syncUIWithState();
    renderSolView();
  });

  tabBtns.mission?.addEventListener("click", () => switchTab("mission"));
  tabBtns.resources?.addEventListener("click", () => switchTab("resources"));
  tabBtns.log?.addEventListener("click", () => switchTab("log"));

  // Outcome Screen Continue Action -> Advances Sol & returns to Mission Tab OR Final Ending
  btnOutcomeContinue?.addEventListener("click", () => {
    if (state.sol === 30) {
      state.status = "completed";
      saveGameState(state);
      showEndingScreen(evaluateMissionEnding(state));
      return;
    }

    advanceSol(state);
    selectedChoiceId = null;

    if (state.status === "interrupted") {
      showEndingScreen(evaluateMissionEnding(state));
      return;
    }

    showScreen("screen-game");
    switchTab("mission");
    syncUIWithState();
    renderSolView();
  });

  // Earth Communications Actions
  btnSendCommQuery?.addEventListener("click", handleSendQuery);
  btnHudQuery?.addEventListener("click", () => {
    switchTab("log");
    handleSendQuery();
  });
  hudCommBadge?.addEventListener("click", () => {
    showScreen("screen-game");
    switchTab("log");
  });

  // Emergency Lifeboat Triage Confirm Action
  btnConfirmTriage?.addEventListener("click", () => {
    if (!selectedTriageId) return;
    applyEmergencyTriage(state, selectedTriageId);
    closeModal(modalTriage);
    syncUIWithState();

    if (state.status === "interrupted") {
      showEndingScreen(evaluateMissionEnding(state));
    } else {
      renderSolView();
    }
  });

  // Ending Screen Actions
  btnEndingRestart?.addEventListener("click", () => {
    clearSavedGame();
    state = createInitialState();
    selectedChoiceId = null;
    currentEvent = null;
    showScreen("screen-welcome");
    syncUIWithState();
  });

  btnEndingReviewLog?.addEventListener("click", () => {
    showScreen("screen-game");
    switchTab("log");
  });

  // Modal: About & Sources
  btnAbout?.addEventListener("click", () => openModal(modalAbout, btnCloseModal));
  btnCloseModal?.addEventListener("click", () => closeModal(modalAbout));
  btnModalDone?.addEventListener("click", () => closeModal(modalAbout));
  modalAbout?.addEventListener("click", (e) => {
    if (e.target === modalAbout) closeModal(modalAbout);
  });

  // Modal: Restart Game
  btnRestartGame?.addEventListener("click", () => openModal(modalRestart, btnCancelRestart));
  btnCloseRestart?.addEventListener("click", () => closeModal(modalRestart));
  btnCancelRestart?.addEventListener("click", () => closeModal(modalRestart));
  modalRestart?.addEventListener("click", (e) => {
    if (e.target === modalRestart) closeModal(modalRestart);
  });

  btnConfirmRestart?.addEventListener("click", () => {
    closeModal(modalRestart);
    clearSavedGame();
    state = createInitialState();
    selectedChoiceId = null;
    currentEvent = null;
    showScreen("screen-welcome");
    syncUIWithState();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!modalAbout.hidden) closeModal(modalAbout);
      if (!modalRestart.hidden) closeModal(modalRestart);
    }
  });
}

/**
 * Populate Crew Cards in Stage 2 Briefing
 */
function renderCrewDossier() {
  if (!crewDossierGrid) return;
  const getAvatarSvg = (iconType) => {
    switch (iconType) {
      case "commander":
        return `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`;
      case "scientist":
        return `<circle cx="12" cy="12" r="9"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path>`;
      case "engineer":
        return `<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path>`;
      case "medic":
        return `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>`;
      default:
        return `<circle cx="12" cy="12" r="10"></circle>`;
    }
  };

  crewDossierGrid.innerHTML = CREW.map((member) => `
    <article class="crew-card">
      <div class="crew-card-top">
        <div class="crew-avatar" style="border-color: ${member.badgeColor}; color: ${member.badgeColor};" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${getAvatarSvg(member.avatarIcon)}
          </svg>
        </div>
        <div class="crew-details">
          <span class="crew-name">${member.name}</span>
          <span class="crew-role">${member.role}</span>
        </div>
      </div>
      <p class="crew-bio">${member.bio}</p>
      <div class="crew-quote">"${member.quote}"</div>
    </article>
  `).join("");
}

/**
 * Populate About Modal (Stage 1)
 */
function initAboutModalContent() {
  if (disclaimerText && FICTIONAL_DISCLAIMER) {
    disclaimerText.textContent = FICTIONAL_DISCLAIMER;
  }
  if (tagLegendContainer) {
    tagLegendContainer.innerHTML = Object.entries(TAG_DEFINITIONS)
      .map(([key, tag]) => `
        <div class="tag-legend-item">
          <span class="tag ${tag.badgeClass}">[${tag.label}]</span>
          <p class="tag-legend-desc">${tag.description}</p>
        </div>
      `)
      .join("");
  }
}

/**
 * Bootstrap Application
 */
function init() {
  state = loadGameState();
  if (!state) {
    state = createInitialState();
  }

  renderCrewDossier();
  initAboutModalContent();
  setupEventListeners();

  // Initialize Developer Tools (Stage 10)
  initDevTools({
    getState: () => state,
    setState: (newState) => { state = newState; },
    syncUI: syncUIWithState,
    renderSol: (evOverride) => renderSolView(evOverride),
    showEnding: (endingData) => showEndingScreen(endingData),
    showScreen: (screenId) => showScreen(screenId)
  });

  // Screen restoration based on saved state
  if (state.status === "completed" || state.currentScreen === "ending") {
    showEndingScreen(evaluateMissionEnding(state));
  } else if (state.status === "interrupted") {
    showEndingScreen(evaluateMissionEnding(state));
  } else if (state.status === "active" || state.status === "critical_grace") {
    showScreen("screen-game");
    switchTab(state.currentTab || "mission");
    syncUIWithState();
    renderSolView();
  } else {
    showScreen("screen-welcome");
    syncUIWithState();
  }

  console.log("ARES: The Last Signal fully loaded. Stages 1–10 operational.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
