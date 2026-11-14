/**
 * ARES: The Last Signal - Master Application Orchestrator
 * Stages 1 through 6: Welcome, Briefing, HUD, Daily Crew Dispatch,
 * Event Decisions, and Dedicated Outcome Screen.
 */

import { TAG_DEFINITIONS, FICTIONAL_DISCLAIMER, SOURCES } from "../data/sources.js";
import { CREW } from "../data/crew.js";
import { GAME_CONSTANTS } from "./constants.js";
import { createInitialState, saveGameState, loadGameState, clearSavedGame } from "./gameState.js";
import { applyChoice, advanceSol } from "./gameEngine.js";
import { EVENTS_DATA } from "../data/eventsData.js";
import { CAMPAIGN_BEATS } from "../data/campaign.js";

// Master In-Memory State
let state = null;
let currentEvent = null;
let selectedChoiceId = null;

// Screen Elements
const screenWelcome = document.getElementById("screen-welcome");
const screenBriefing = document.getElementById("screen-briefing");
const screenGame = document.getElementById("screen-game");
const screenOutcome = document.getElementById("screen-outcome");

// Navigation & Header Elements
const btnStartMission = document.getElementById("btn-start-mission");
const btnBriefingBack = document.getElementById("btn-briefing-back");
const btnBeginMission = document.getElementById("btn-begin-mission");
const btnRestartGame = document.getElementById("btn-restart-game");

const hudSolDisplay = document.getElementById("hud-sol-display");
const hudChapterDisplay = document.getElementById("hud-chapter-display");
const hudProgressFill = document.getElementById("hud-progress-fill");
const hudProgressText = document.getElementById("hud-progress-text");
const hudCommStatus = document.getElementById("hud-comm-status");

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

// Crew Dossier Container
const crewDossierGrid = document.getElementById("crew-dossier-grid");

let lastFocusedElement = null;

/**
 * Screen Navigator - Transitions between major screens
 */
function showScreen(screenId) {
  const allScreens = [screenWelcome, screenBriefing, screenGame, screenOutcome];
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
 * Synchronize UI with State
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

  if (hudCommStatus) {
    if (state.comm.status === "restored") {
      hudCommStatus.textContent = "SIGNAL CARRIER: ACTIVE";
      hudCommStatus.parentElement.style.borderColor = "rgba(39, 174, 96, 0.4)";
      hudCommStatus.parentElement.style.color = "#69F0AE";
    } else {
      hudCommStatus.textContent = "SIGNAL LOST // BLACKOUT";
      hudCommStatus.parentElement.style.borderColor = "rgba(231, 76, 60, 0.4)";
      hudCommStatus.parentElement.style.color = "#FF8A80";
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

  // 4. Mission Log Tab Feed
  if (logTimeline && state.logHistory) {
    logTimeline.innerHTML = state.logHistory.map((item) => `
      <article class="log-item">
        <div class="log-item-header">
          <span class="log-item-sol">SOL ${item.sol < 10 ? "0" + item.sol : item.sol} // LOG RECORD</span>
          <span class="tag tag-science">${item.type.toUpperCase()}</span>
        </div>
        <h4 class="log-item-title">${item.title}</h4>
        <p class="log-item-body">${item.text}</p>
      </article>
    `).join("");
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
function renderSolView() {
  if (!missionEventContainer || !state) return;

  const currentBeat = CAMPAIGN_BEATS[state.sol];

  // If this is a Routine Day (NO decision required: every 3-4 days an event happens)
  if (!currentBeat || !currentBeat.hasDecision) {
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
      syncUIWithState();
      renderSolView();
    });

    return;
  }

  // If this IS an Event Sol (e.g. Sol 3, Sol 6, Sol 8)
  const eventData = EVENTS_DATA[currentBeat.eventId];
  if (!eventData) return;

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

    // Open Screen 5: Dedicated Outcome Screen
    showOutcomeScreen(resolution, eventData);
  });
}

/**
 * Stage 6: Dedicated Decision Outcome Screen Controller
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

  // Show the Screen
  showScreen("screen-outcome");
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

  // Outcome Screen Continue Action -> Advances Sol & returns to Mission Tab
  btnOutcomeContinue?.addEventListener("click", () => {
    advanceSol(state);
    selectedChoiceId = null;
    showScreen("screen-game");
    switchTab("mission");
    syncUIWithState();
    renderSolView();
  });

  btnAbout?.addEventListener("click", () => openModal(modalAbout, btnCloseModal));
  btnCloseModal?.addEventListener("click", () => closeModal(modalAbout));
  btnModalDone?.addEventListener("click", () => closeModal(modalAbout));
  modalAbout?.addEventListener("click", (e) => {
    if (e.target === modalAbout) closeModal(modalAbout);
  });

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

  // Screen restoration
  if (state.status === "active") {
    showScreen("screen-game");
    switchTab(state.currentTab || "mission");
    syncUIWithState();
    renderSolView();
  } else {
    showScreen("screen-welcome");
    syncUIWithState();
  }

  console.log("ARES initialized (Sols 1–8 Vertical Slice + Dedicated Outcome Screen).");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
