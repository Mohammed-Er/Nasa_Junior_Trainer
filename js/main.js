/**
 * ARES: The Last Signal - Master Application Orchestrator
 * Stages 1, 2, and 3: Landing, Mission Briefing & Main Game Interface
 */

import { TAG_DEFINITIONS, FICTIONAL_DISCLAIMER, SOURCES } from "../data/sources.js";
import { CREW } from "../data/crew.js";
import { GAME_CONSTANTS } from "./constants.js";

// Screen Elements
const screenWelcome = document.getElementById("screen-welcome");
const screenBriefing = document.getElementById("screen-briefing");
const screenGame = document.getElementById("screen-game");

// Navigation & Trigger Buttons
const btnStartMission = document.getElementById("btn-start-mission");
const btnBriefingBack = document.getElementById("btn-briefing-back");
const btnBeginMission = document.getElementById("btn-begin-mission");
const btnRestartGame = document.getElementById("btn-restart-game");

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

// Crew Container
const crewDossierGrid = document.getElementById("crew-dossier-grid");

let lastFocusedElement = null;

/**
 * Screen Navigator - Transitions between major screens without page reloads
 */
function showScreen(screenId) {
  const allScreens = [screenWelcome, screenBriefing, screenGame];
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

  // Scroll to top on screen change
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Tab Switcher - Switches between Mission, Resources, and Log in Screen 3
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
 * Populate Crew Cards in Stage 2 Mission Briefing
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
 * Populate About Modal with Tag Definitions & Verified Sources (Stage 1)
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

  const verifiedEntries = Object.values(SOURCES).filter((source) => source.verified === true);
  if (verifiedSourcesList && verifiedEntries.length > 0) {
    verifiedSourcesList.innerHTML = verifiedEntries
      .map((source) => `
        <div class="tag-legend-item" style="border-left-color: var(--color-status-optimal);">
          <div style="display:flex; justify-content:space-between; align-items:center; gap: 0.5rem; flex-wrap:wrap;">
            <strong style="color:var(--color-text-primary); font-size: 0.95rem;">${source.title}</strong>
            <span class="tag tag-real">${source.eventDate || "Verified"}</span>
          </div>
          <p class="tag-legend-desc">${source.summary}</p>
          ${source.url ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer" style="font-size:0.8rem; margin-top:0.3rem;">Official Source Link &rarr;</a>` : ""}
        </div>
      `)
      .join("");
  }
}

/**
 * Setup All Event Listeners
 */
function setupEventListeners() {
  // Screen Transitions
  btnStartMission?.addEventListener("click", () => showScreen("screen-briefing"));
  btnBriefingBack?.addEventListener("click", () => showScreen("screen-welcome"));
  btnBeginMission?.addEventListener("click", () => {
    showScreen("screen-game");
    switchTab("mission");
  });

  // Tab Navigation in Screen 3
  tabBtns.mission?.addEventListener("click", () => switchTab("mission"));
  tabBtns.resources?.addEventListener("click", () => switchTab("resources"));
  tabBtns.log?.addEventListener("click", () => switchTab("log"));

  // About Modal
  btnAbout?.addEventListener("click", () => openModal(modalAbout, btnCloseModal));
  btnCloseModal?.addEventListener("click", () => closeModal(modalAbout));
  btnModalDone?.addEventListener("click", () => closeModal(modalAbout));
  modalAbout?.addEventListener("click", (e) => {
    if (e.target === modalAbout) closeModal(modalAbout);
  });

  // Restart Confirmation Modal
  btnRestartGame?.addEventListener("click", () => openModal(modalRestart, btnCancelRestart));
  btnCloseRestart?.addEventListener("click", () => closeModal(modalRestart));
  btnCancelRestart?.addEventListener("click", () => closeModal(modalRestart));
  modalRestart?.addEventListener("click", (e) => {
    if (e.target === modalRestart) closeModal(modalRestart);
  });

  btnConfirmRestart?.addEventListener("click", () => {
    closeModal(modalRestart);
    showScreen("screen-welcome");
  });

  // Global Escape key for any open modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!modalAbout.hidden) closeModal(modalAbout);
      if (!modalRestart.hidden) closeModal(modalRestart);
    }
  });
}

/**
 * Bootstrap Application
 */
function init() {
  renderCrewDossier();
  initAboutModalContent();
  setupEventListeners();
  console.log("ARES: The Last Signal initialized (Stages 1, 2 & 3 operational).");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
