/**
 * ARES: The Last Signal - Developer Diagnostics & Testing Tools (v3)
 * Gated behind URL query (?dev=1, ?dev, ?devtools=1, ?debug=1),
 * keyboard shortcut '~' (Backquote), or the floating DEV TOOLS button.
 */

import { GAME_CONSTANTS } from "./constants.js";
import { EVENTS_DATA } from "../data/eventsData.js";
import { saveGameState, clearSavedGame } from "./gameState.js";
import { evaluateMissionEnding, serveMeal, applyResourceChanges } from "./gameEngine.js";

export function initDevTools({
  getState,
  setState,
  syncUI,
  renderSol,
  showEnding,
  showScreen,
  startDayPhase,
  renderReflection,
  renderJournal
}) {
  const wrapper = document.getElementById("dev-tools-wrapper");
  const panel = document.getElementById("dev-tools-panel");
  const toggleBtn = document.getElementById("btn-dev-toggle");

  if (!wrapper || !panel || !toggleBtn) return;

  // URL param detection (?dev=1, ?dev, ?devtools=1, ?debug=1)
  const searchParams = new URLSearchParams(window.location.search);
  const isDevUrl =
    searchParams.has("dev") ||
    searchParams.has("devtools") ||
    searchParams.has("debug") ||
    window.location.hash.includes("dev");

  const openPanel = () => {
    panel.hidden = false;
    toggleBtn.classList.add("is-active");
    toggleBtn.setAttribute("aria-expanded", "true");
  };

  const closePanel = () => {
    panel.hidden = true;
    toggleBtn.classList.remove("is-active");
    toggleBtn.setAttribute("aria-expanded", "false");
  };

  const togglePanel = () => {
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  };

  // If URL has ?dev=1, auto-open immediately
  if (isDevUrl) {
    openPanel();
  } else {
    panel.hidden = true;
  }

  // Keyboard shortcut '~' (Backquote) or Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "~" || e.key === "`") {
      e.preventDefault();
      togglePanel();
    } else if (e.key === "Escape" && !panel.hidden) {
      closePanel();
    }
  });

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePanel();
  });

  // Render DevTools UI Controls
  panel.innerHTML = `
    <div class="dev-tools-header">
      <span class="dev-tools-title">🛠️ ARES DEV CONTROLS (v3)</span>
      <button id="btn-dev-close" class="dev-tools-close-btn" type="button" aria-label="Close Developer Controls">&times;</button>
    </div>

    <!-- 1. Jump to Sol -->
    <div class="dev-tools-group">
      <label class="dev-tools-label" for="dev-select-sol">Jump to Sol (1–30):</label>
      <div style="display:flex; gap:0.4rem;">
        <select id="dev-select-sol" class="dev-tools-select" style="flex-grow:1;">
          ${Array.from({ length: 30 }, (_, i) => i + 1).map((s) => {
            const hasEvent = [3, 6, 8, 11, 14, 15, 19, 21, 22, 23, 27, 30].includes(s);
            const num = s < 10 ? "0" + s : s;
            return `<option value="${s}">Sol ${num} ${hasEvent ? "⚡ (Event)" : "· (Routine)"}</option>`;
          }).join("")}
        </select>
        <button id="btn-dev-jump-sol" class="dev-tools-btn" type="button">Jump</button>
      </div>
    </div>

    <!-- 2. Resource & Morale Adjustments (+10 / -10) -->
    <div class="dev-tools-group">
      <label class="dev-tools-label">Adjust Meters & Morale (&plusmn;10):</label>
      <div class="dev-tools-btn-row">
        <button id="btn-dev-p-up" class="dev-tools-btn" type="button">⚡ +10</button>
        <button id="btn-dev-p-down" class="dev-tools-btn" type="button">⚡ -10</button>
        <button id="btn-dev-ls-up" class="dev-tools-btn" type="button">💧 +10</button>
        <button id="btn-dev-ls-down" class="dev-tools-btn" type="button">💧 -10</button>
        <button id="btn-dev-rad-up" class="dev-tools-btn" type="button">🛡️ +10</button>
        <button id="btn-dev-rad-down" class="dev-tools-btn" type="button">🛡️ -10</button>
        <button id="btn-dev-m-up" class="dev-tools-btn" type="button">🙂 +10</button>
        <button id="btn-dev-m-down" class="dev-tools-btn" type="button">🙁 -10</button>
      </div>
    </div>

    <!-- 3. Serve Meal Shortcut & Force Crew Break -->
    <div class="dev-tools-group">
      <label class="dev-tools-label">Rations & Crew Actions:</label>
      <div class="dev-tools-btn-row">
        <button id="btn-dev-serve-full" class="dev-tools-btn" type="button">🍲 Serve Full</button>
        <button id="btn-dev-serve-light" class="dev-tools-btn" type="button">🥣 Serve Half</button>
        <button id="btn-dev-force-break" class="dev-tools-btn" style="color:#f59e0b;" type="button">🧘 Force Crew Break</button>
      </div>
    </div>

    <!-- 4. Force Trigger Events -->
    <div class="dev-tools-group">
      <label class="dev-tools-label" for="dev-select-event">Force Trigger Event:</label>
      <div style="display:flex; gap:0.4rem;">
        <select id="dev-select-event" class="dev-tools-select" style="flex-grow:1; max-width:210px;">
          ${Object.entries(EVENTS_DATA).map(([id, ev]) => `
            <option value="${id}">${ev.title.slice(0, 24)}...</option>
          `).join("")}
        </select>
        <button id="btn-dev-fire-event" class="dev-tools-btn" type="button">Trigger</button>
      </div>
    </div>

    <!-- 5. Jump to Screens & Endings -->
    <div class="dev-tools-group">
      <label class="dev-tools-label">Jump to Screen / Endings:</label>
      <div class="dev-tools-btn-row">
        <button id="btn-dev-screen-refl" class="dev-tools-btn" type="button">📝 Reflection</button>
        <button id="btn-dev-screen-jour" class="dev-tools-btn" type="button">📜 Journal</button>
        <button id="btn-dev-end-1" class="dev-tools-btn" style="color:#6ee7b7;" type="button">Ending 1</button>
        <button id="btn-dev-end-2" class="dev-tools-btn" style="color:#fde047;" type="button">Ending 2</button>
        <button id="btn-dev-end-3" class="dev-tools-btn" style="color:#fca5a5;" type="button">Ending 3</button>
      </div>
    </div>

    <!-- 6. Toggle Objectives -->
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

    <!-- 7. Reset Save -->
    <div class="dev-tools-group" style="margin-bottom:0; border-bottom:none;">
      <button id="btn-dev-reset" class="dev-tools-btn" style="width:100%; border-color:#ef4444; color:#fca5a5;" type="button">
        🗑️ Clear Save & Reload
      </button>
    </div>
  `;

  panel.querySelector("#btn-dev-close").addEventListener("click", () => {
    closePanel();
  });

  // Jump to Sol
  panel.querySelector("#btn-dev-jump-sol").addEventListener("click", () => {
    const targetSol = parseInt(panel.querySelector("#dev-select-sol").value, 10);
    const state = getState();
    state.sol = targetSol;
    state.supplyDone = false;
    state.awaitingDecision = false;
    state.chapter = Math.min(5, Math.floor((targetSol - 1) / 6) + 1);
    state.status = "active";
    saveGameState(state);
    if (showScreen) showScreen("game");
    if (renderSol) renderSol();
    if (syncUI) syncUI();
  });

  // Resource Adjustments
  const adjust = (deltas) => {
    const state = getState();
    applyResourceChanges(state, deltas, "Developer Tools Override", { radiationAffecting: true });
    saveGameState(state);
    if (syncUI) syncUI();
  };

  panel.querySelector("#btn-dev-p-up").addEventListener("click", () => adjust({ power: 10 }));
  panel.querySelector("#btn-dev-p-down").addEventListener("click", () => adjust({ power: -10 }));
  panel.querySelector("#btn-dev-ls-up").addEventListener("click", () => adjust({ lifeSupport: 10 }));
  panel.querySelector("#btn-dev-ls-down").addEventListener("click", () => adjust({ lifeSupport: -10 }));
  panel.querySelector("#btn-dev-rad-up").addEventListener("click", () => adjust({ radiationSafety: 10 }));
  panel.querySelector("#btn-dev-rad-down").addEventListener("click", () => adjust({ radiationSafety: -10 }));
  panel.querySelector("#btn-dev-m-up").addEventListener("click", () => adjust({ morale: 10 }));
  panel.querySelector("#btn-dev-m-down").addEventListener("click", () => adjust({ morale: -10 }));

  // Serve Meal shortcuts
  panel.querySelector("#btn-dev-serve-full").addEventListener("click", () => {
    const state = getState();
    state.supplyDone = false;
    serveMeal(state, "full");
    if (syncUI) syncUI();
  });
  panel.querySelector("#btn-dev-serve-light").addEventListener("click", () => {
    const state = getState();
    state.supplyDone = false;
    serveMeal(state, "light");
    if (syncUI) syncUI();
  });

  // Force Crew Break
  panel.querySelector("#btn-dev-force-break").addEventListener("click", () => {
    const state = getState();
    state.morale = 10;
    state.crewBreakLastSol = -99;
    state.status = "active";
    if (showScreen) showScreen("game");
    if (startDayPhase) startDayPhase("event", "evt_crew_break");
    if (syncUI) syncUI();
  });

  // Force Trigger Event
  panel.querySelector("#btn-dev-fire-event").addEventListener("click", () => {
    const eventId = panel.querySelector("#dev-select-event").value;
    const state = getState();
    state.status = "active";
    if (showScreen) showScreen("game");
    if (startDayPhase) startDayPhase("event", eventId);
  });

  // Jump to Screen
  panel.querySelector("#btn-dev-screen-refl").addEventListener("click", () => {
    if (renderReflection) renderReflection();
  });
  panel.querySelector("#btn-dev-screen-jour").addEventListener("click", () => {
    if (renderJournal) renderJournal();
  });

  // Toggle Objectives
  const toggleObj = (key) => {
    const state = getState();
    if (!state.objectives) state.objectives = {};
    state.objectives[key] = !state.objectives[key];
    saveGameState(state);
    if (syncUI) syncUI();
  };
  panel.querySelector("#btn-dev-obj-comms")?.addEventListener("click", () => toggleObj("commsRestored"));
  panel.querySelector("#btn-dev-obj-antenna")?.addEventListener("click", () => toggleObj("antennaAligned"));
  panel.querySelector("#btn-dev-obj-samples")?.addEventListener("click", () => toggleObj("researchSamples"));
  panel.querySelector("#btn-dev-obj-panels")?.addEventListener("click", () => toggleObj("panelsUnderstood"));
  panel.querySelector("#btn-dev-obj-shelter")?.addEventListener("click", () => toggleObj("shelterProtocolsMaintained"));

  // Endings
  panel.querySelector("#btn-dev-end-1").addEventListener("click", () => {
    const state = getState();
    state.sol = 30;
    state.status = "completed";
    state.resources = { power: 65, lifeSupport: 60, radiationSafety: 60 };
    state.morale = 75;
    state.objectives = { commsRestored: true, antennaAligned: true, researchSamples: true, panelsUnderstood: true, shelterProtocolsMaintained: true };
    const ending = evaluateMissionEnding(state);
    if (showEnding) showEnding(ending);
  });
  panel.querySelector("#btn-dev-end-2").addEventListener("click", () => {
    const state = getState();
    state.sol = 30;
    state.status = "completed";
    state.resources = { power: 25, lifeSupport: 25, radiationSafety: 25 };
    state.morale = 30;
    state.objectives = { commsRestored: true, antennaAligned: true, researchSamples: false, panelsUnderstood: false, shelterProtocolsMaintained: false };
    const ending = evaluateMissionEnding(state);
    if (showEnding) showEnding(ending);
  });
  panel.querySelector("#btn-dev-end-3").addEventListener("click", () => {
    const state = getState();
    state.sol = 30;
    state.status = "completed";
    state.resources = { power: 12, lifeSupport: 14, radiationSafety: 15 };
    state.morale = 20;
    state.objectives = { commsRestored: false, antennaAligned: false, researchSamples: false, panelsUnderstood: false, shelterProtocolsMaintained: false };
    state.endingReason = "Resource reserves dropped below critical thresholds and Earth communication could not be restored before orbital alignment closed. Automated safety computers sealed the habitat in emergency sleep mode until the next launch window.";
    const ending = evaluateMissionEnding(state);
    if (showEnding) showEnding(ending);
  });

  // Reset Save
  panel.querySelector("#btn-dev-reset").addEventListener("click", () => {
    clearSavedGame();
    window.location.reload();
  });

  // Expose convenient global helper on window for browser console access
  window.aresDev = {
    open: openPanel,
    close: closePanel,
    toggle: togglePanel,
    getState,
    jumpSol: (sol) => {
      const state = getState();
      state.sol = sol;
      state.supplyDone = false;
      state.awaitingDecision = false;
      state.chapter = Math.min(5, Math.floor((sol - 1) / 6) + 1);
      state.status = "active";
      saveGameState(state);
      if (showScreen) showScreen("game");
      if (renderSol) renderSol();
      if (syncUI) syncUI();
    },
    triggerEvent: (eventId) => {
      const state = getState();
      state.status = "active";
      if (showScreen) showScreen("game");
      if (startDayPhase) startDayPhase("event", eventId);
    },
    setResources: (deltas) => adjust(deltas),
    showEnding: (code = 1) => {
      const btn = panel.querySelector(`#btn-dev-end-${code}`);
      if (btn) btn.click();
    },
    reset: () => {
      clearSavedGame();
      window.location.reload();
    }
  };
}
