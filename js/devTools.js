/**
 * ARES: The Last Signal - Developer Diagnostics & Testing Tools
 * Gated strictly behind URL query ?dev=1 or hidden hotkey '~' (Backquote).
 */

import { GAME_CONSTANTS } from "./constants.js";
import { EVENTS_DATA } from "../data/eventsData.js";
import { saveGameState, clearSavedGame } from "./gameState.js";
import { evaluateMissionEnding, advanceSol } from "./gameEngine.js";

export function initDevTools({ getState, setState, syncUI, renderSol, showEnding, showScreen }) {
  const wrapper = document.getElementById("dev-tools-wrapper");
  const panel = document.getElementById("dev-tools-panel");
  const toggleBtn = document.getElementById("btn-dev-toggle");

  if (!wrapper || !panel || !toggleBtn) return;

  // Make the Dev Tools toggle button accessible by default on localhost or with ?dev=1 / '~'
  wrapper.hidden = false;

  // Keyboard shortcut '~' (Backquote) to toggle developer panel
  window.addEventListener("keydown", (e) => {
    if (e.key === "~" || e.key === "`") {
      panel.hidden = !panel.hidden;
    }
  });

  toggleBtn.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
  });

  // Render DevTools UI Controls
  panel.innerHTML = `
    <div class="dev-tools-header">
      <span class="dev-tools-title">🛠️ ARES DEV CONTROLS</span>
      <button id="btn-dev-close" class="btn-close" style="font-size: 1.2rem; width: 1.8rem; height: 1.8rem;">&times;</button>
    </div>

    <!-- 1. Jump to Sol -->
    <div class="dev-tools-group">
      <label class="dev-tools-label" for="dev-select-sol">Jump to Sol (1–30):</label>
      <div style="display:flex; gap:0.4rem;">
        <select id="dev-select-sol" class="dev-tools-select" style="flex-grow:1;">
          ${Array.from({ length: 30 }, (_, i) => i + 1).map((s) => `
            <option value="${s}">Sol ${s < 10 ? "0" + s : s}</option>
          `).join("")}
        </select>
        <button id="btn-dev-jump-sol" class="dev-tools-btn" type="button">Jump</button>
      </div>
    </div>

    <!-- 2. Resource Adjustments (+10 / -10) -->
    <div class="dev-tools-group">
      <label class="dev-tools-label">Adjust Resources (&plusmn;10%):</label>
      <div class="dev-tools-btn-row">
        <button id="btn-dev-p-up" class="dev-tools-btn" type="button">⚡ +10</button>
        <button id="btn-dev-p-down" class="dev-tools-btn" type="button">⚡ -10</button>
        <button id="btn-dev-ls-up" class="dev-tools-btn" type="button">🌿 +10</button>
        <button id="btn-dev-ls-down" class="dev-tools-btn" type="button">🌿 -10</button>
        <button id="btn-dev-rad-up" class="dev-tools-btn" type="button">🛡️ +10</button>
        <button id="btn-dev-rad-down" class="dev-tools-btn" type="button">🛡️ -10</button>
      </div>
    </div>

    <!-- 3. Force Trigger Events -->
    <div class="dev-tools-group">
      <label class="dev-tools-label" for="dev-select-event">Force Trigger Event:</label>
      <div style="display:flex; gap:0.4rem;">
        <select id="dev-select-event" class="dev-tools-select" style="flex-grow:1; max-width:230px;">
          ${Object.entries(EVENTS_DATA).map(([id, ev]) => `
            <option value="${id}">${ev.title.slice(0, 28)}...</option>
          `).join("")}
        </select>
        <button id="btn-dev-fire-event" class="dev-tools-btn" type="button">Trigger</button>
      </div>
    </div>

    <!-- 4. Test Trigger All 3 Endings -->
    <div class="dev-tools-group">
      <label class="dev-tools-label">Test Trigger Endings:</label>
      <div class="dev-tools-btn-row">
        <button id="btn-dev-end-1" class="dev-tools-btn" style="color:#69F0AE;" type="button">Ending 1 (Beyond)</button>
        <button id="btn-dev-end-2" class="dev-tools-btn" style="color:#FFD54F;" type="button">Ending 2 (Costly)</button>
        <button id="btn-dev-end-3" class="dev-tools-btn" style="color:#FF8A80;" type="button">Ending 3 (Abort)</button>
      </div>
    </div>

    <!-- 5. Toggle Objectives -->
    <div class="dev-tools-group">
      <label class="dev-tools-label">Toggle Objectives:</label>
      <div class="dev-tools-btn-row">
        <button id="btn-dev-obj-comms" class="dev-tools-btn" type="button">📡 Comms</button>
        <button id="btn-dev-obj-antenna" class="dev-tools-btn" type="button">🛰️ Antenna</button>
        <button id="btn-dev-obj-samples" class="dev-tools-btn" type="button">🔬 Samples</button>
        <button id="btn-dev-obj-panels" class="dev-tools-btn" type="button">☀️ Panels</button>
        <button id="btn-dev-obj-shelter" class="dev-tools-btn" type="button">🛡️ Shelter</button>
      </div>
    </div>

    <!-- 6. Reset Save -->
    <div class="dev-tools-group" style="padding-top:0.4rem; border-top:1px solid var(--color-space-medium);">
      <button id="btn-dev-reset-all" class="dev-tools-btn" style="color:#FF8A80; width:100%;" type="button">
        Wipe Save &amp; Reload Fresh
      </button>
    </div>
  `;

  document.getElementById("btn-dev-close")?.addEventListener("click", () => {
    panel.hidden = true;
  });

  // Jump to Sol Listener
  document.getElementById("btn-dev-jump-sol")?.addEventListener("click", () => {
    const state = getState();
    const select = document.getElementById("dev-select-sol");
    const targetSol = parseInt(select.value, 10);

    // If advancing forward, run advanceSol up to targetSol so modifiers, pending effects, and comms deliver
    if (targetSol > state.sol) {
      while (state.sol < targetSol) {
        advanceSol(state);
      }
    } else {
      state.sol = targetSol;
    }

    // Update chapter
    const matchingChapter = GAME_CONSTANTS.CHAPTERS.find(
      (c) => state.sol >= c.startSol && state.sol <= c.endSol
    );
    if (matchingChapter) {
      state.chapter = matchingChapter.number;
    }

    state.awaitingDecision = false;
    saveGameState(state);
    showScreen("screen-game");
    syncUI();
    renderSol();
  });

  // Resource Adjusters
  const modifyRes = (key, delta) => {
    const state = getState();
    state.resources[key] = Math.max(0, Math.min(100, state.resources[key] + delta));
    saveGameState(state);
    syncUI();
  };

  document.getElementById("btn-dev-p-up")?.addEventListener("click", () => modifyRes("power", 10));
  document.getElementById("btn-dev-p-down")?.addEventListener("click", () => modifyRes("power", -10));
  document.getElementById("btn-dev-ls-up")?.addEventListener("click", () => modifyRes("lifeSupport", 10));
  document.getElementById("btn-dev-ls-down")?.addEventListener("click", () => modifyRes("lifeSupport", -10));
  document.getElementById("btn-dev-rad-up")?.addEventListener("click", () => modifyRes("radiationSafety", 10));
  document.getElementById("btn-dev-rad-down")?.addEventListener("click", () => modifyRes("radiationSafety", -10));

  // Force Trigger Event Listener
  document.getElementById("btn-dev-fire-event")?.addEventListener("click", () => {
    const state = getState();
    const select = document.getElementById("dev-select-event");
    const eventId = select.value;
    const eventData = EVENTS_DATA[eventId];
    if (!eventData) return;

    // Inject event into current Sol view
    showScreen("screen-game");
    state.awaitingDecision = true;
    renderSol(eventData);
  });

  // Trigger Endings Instant Previews
  document.getElementById("btn-dev-end-1")?.addEventListener("click", () => {
    const state = getState();
    state.sol = 30;
    state.resources.power = 75;
    state.resources.lifeSupport = 85;
    state.resources.radiationSafety = 80;
    state.objectives.commsRestored = true;
    state.objectives.antennaAligned = true;
    state.objectives.researchSamples = true;
    state.objectives.panelsUnderstood = true;
    state.objectives.shelterProtocolsMaintained = true;
    state.status = "completed";
    saveGameState(state);
    showEnding(evaluateMissionEnding(state));
  });

  document.getElementById("btn-dev-end-2")?.addEventListener("click", () => {
    const state = getState();
    state.sol = 30;
    state.resources.power = 35;
    state.resources.lifeSupport = 40;
    state.resources.radiationSafety = 30;
    state.objectives.commsRestored = true;
    state.objectives.antennaAligned = true;
    state.objectives.researchSamples = false;
    state.objectives.panelsUnderstood = false;
    state.objectives.shelterProtocolsMaintained = false;
    state.status = "completed";
    saveGameState(state);
    showEnding(evaluateMissionEnding(state));
  });

  document.getElementById("btn-dev-end-3")?.addEventListener("click", () => {
    const state = getState();
    state.sol = 30;
    state.resources.power = 15;
    state.resources.lifeSupport = 10;
    state.resources.radiationSafety = 15;
    state.objectives.commsRestored = false;
    state.status = "interrupted";
    state.endingReason = "Critical power failure and antenna misalignment during final transmission.";
    saveGameState(state);
    showEnding(evaluateMissionEnding(state));
  });

  // Objective Toggles
  const toggleObj = (key) => {
    const state = getState();
    state.objectives[key] = !state.objectives[key];
    saveGameState(state);
    syncUI();
  };

  document.getElementById("btn-dev-obj-comms")?.addEventListener("click", () => toggleObj("commsRestored"));
  document.getElementById("btn-dev-obj-antenna")?.addEventListener("click", () => toggleObj("antennaAligned"));
  document.getElementById("btn-dev-obj-samples")?.addEventListener("click", () => toggleObj("researchSamples"));
  document.getElementById("btn-dev-obj-panels")?.addEventListener("click", () => toggleObj("panelsUnderstood"));
  document.getElementById("btn-dev-obj-shelter")?.addEventListener("click", () => toggleObj("shelterProtocolsMaintained"));

  // Reset Save
  document.getElementById("btn-dev-reset-all")?.addEventListener("click", () => {
    clearSavedGame();
    window.location.reload();
  });
}
