/**
 * ARES: The Last Signal - Post-Game Reflection & Mission Journal
 * 
 * Manages the 4 sequential reflective questions and renders the printable
 * Mission Journal summary card.
 */

import { REFLECTION_QUESTIONS } from "../data/reflectionData.js";
import { saveGameState, clearSavedGame } from "./gameState.js";
import { reveal } from "./sequencer.js";
import { getMoodInfo } from "./constants.js";

let currentQuestionIndex = 0;
let onJournalCompleteCallback = null;

/**
 * Build dynamic options based on actual gameplay state
 */
export function prepareQuestionOptions(questionDef, state) {
  const options = [...questionDef.baseOptions];

  if (questionDef.id === "q1_hardest" && state.stats && state.stats.lowest) {
    const { power, lifeSupport, radiationSafety } = state.stats.lowest;
    let lowestMeter = "Power";
    let lowestVal = power;
    if (lifeSupport < lowestVal) {
      lowestMeter = "Life Support";
      lowestVal = lifeSupport;
    }
    if (radiationSafety < lowestVal) {
      lowestMeter = "Radiation Safety";
      lowestVal = radiationSafety;
    }
    options.splice(2, 0, `Keeping ${lowestMeter} from running out`);
  }

  if (questionDef.id === "q3_decision") {
    // Find decisions with biggest negative impacts
    const decisions = (state.logHistory || []).filter(l => l.type === "decision");
    if (decisions.length > 0) {
      const scoredDecisions = decisions.map(d => {
        const deltas = d.appliedDeltas || {};
        const cost = Math.abs(Math.min(0, deltas.power || 0)) +
                     Math.abs(Math.min(0, deltas.lifeSupport || 0)) +
                     Math.abs(Math.min(0, deltas.radiationSafety || 0)) +
                     Math.abs(Math.min(0, deltas.morale || 0));
        return { ...d, cost };
      });

      scoredDecisions.sort((a, b) => b.cost - a.cost);
      const top3 = scoredDecisions.slice(0, 3);
      top3.forEach(td => {
        options.push(`Sol ${td.sol} · ${td.title}`);
      });
    }

    if (options.length === 0) {
      options.push(...(questionDef.fallbackOptions || []));
    }
  }

  return options;
}

/**
 * Render Question Screen
 */
export function renderReflectionScreen(containerEl, state, onFinished) {
  if (!containerEl || !state) return;
  onJournalCompleteCallback = onFinished;

  // Restore question index if partially completed
  const answeredCount = Object.keys(state.reflection?.answers || {}).length;
  currentQuestionIndex = Math.min(answeredCount, REFLECTION_QUESTIONS.length - 1);

  renderActiveQuestion(containerEl, state);
}

function renderActiveQuestion(containerEl, state) {
  const qDef = REFLECTION_QUESTIONS[currentQuestionIndex];
  if (!qDef) {
    // All 4 questions done -> render journal
    renderJournalScreen(containerEl, state);
    return;
  }

  const options = prepareQuestionOptions(qDef, state);
  const isMulti = qDef.type === "multi";
  const existingAnswer = state.reflection?.answers[qDef.id] || (isMulti ? [] : null);

  containerEl.innerHTML = `
    <div class="reflection-card">
      <div class="reflection-progress">
        <span class="reflection-step-label">Question ${qDef.number} of ${REFLECTION_QUESTIONS.length}</span>
        <div class="progress-dots">
          ${REFLECTION_QUESTIONS.map((_, i) => `<span class="dot ${i === currentQuestionIndex ? "active" : i < currentQuestionIndex ? "completed" : ""}"></span>`).join("")}
        </div>
      </div>

      <h2 class="reflection-title">${qDef.question}</h2>
      <p class="reflection-subtitle">${qDef.subtitle}</p>

      <div class="reflection-options" id="reflection-options-list">
        ${options.map((opt, i) => {
          const isSelected = isMulti ? existingAnswer.includes(opt) : existingAnswer === opt;
          return `
            <button class="reflection-opt-btn ${isSelected ? "selected" : ""}" type="button" data-index="${i}" data-value="${opt}">
              <span class="opt-check">${isSelected ? "✓" : "○"}</span>
              <span class="opt-text">${opt}</span>
            </button>
          `;
        }).join("")}

        ${qDef.allowCustom ? `
          <button class="reflection-opt-btn custom-toggle-btn ${typeof existingAnswer === "string" && !options.includes(existingAnswer) ? "selected" : ""}" type="button" id="custom-answer-toggle">
            <span class="opt-check">✎</span>
            <span class="opt-text">${qDef.id === "q4_future" ? "Write my own advice…" : "Something else…"}</span>
          </button>
          <div class="custom-input-wrap ${typeof existingAnswer === "string" && !options.includes(existingAnswer) ? "" : "hidden"}" id="custom-input-wrap">
            <p class="privacy-disclaimer">Privacy notice: Don't write your real name or where you live.</p>
            <input type="text" id="custom-text-input" maxlength="140" placeholder="${qDef.customPlaceholder || "Write your thought..."}" value="${typeof existingAnswer === "string" && !options.includes(existingAnswer) ? existingAnswer : ""}">
            <span class="char-count" id="char-count">0/140</span>
          </div>
        ` : ""}
      </div>

      <div class="reflection-actions">
        ${currentQuestionIndex > 0 ? `
          <button class="btn btn-secondary" id="btn-reflection-back" type="button">◀ Back</button>
        ` : "<div></div>"}
        <button class="btn btn-primary" id="btn-reflection-next" type="button" ${!existingAnswer || (isMulti && existingAnswer.length === 0) ? "disabled" : ""}>
          ${currentQuestionIndex === REFLECTION_QUESTIONS.length - 1 ? "Complete Mission Journal ▶" : "Next Question ▶"}
        </button>
      </div>
    </div>
  `;

  // Animate options popping in
  const optBtns = containerEl.querySelectorAll(".reflection-opt-btn");
  reveal(optBtns, { stagger: 100 });

  // Attach event handlers
  setupQuestionEvents(containerEl, state, qDef, options);
}

function setupQuestionEvents(containerEl, state, qDef, options) {
  const isMulti = qDef.type === "multi";
  const maxChoices = qDef.maxChoices || 1;
  const nextBtn = containerEl.querySelector("#btn-reflection-next");
  const backBtn = containerEl.querySelector("#btn-reflection-back");
  const customToggle = containerEl.querySelector("#custom-answer-toggle");
  const customWrap = containerEl.querySelector("#custom-input-wrap");
  const customInput = containerEl.querySelector("#custom-text-input");
  const charCount = containerEl.querySelector("#char-count");

  let selections = isMulti
    ? [...(state.reflection?.answers[qDef.id] || [])]
    : state.reflection?.answers[qDef.id] || null;

  function updateNextButton() {
    if (isMulti) {
      nextBtn.disabled = selections.length === 0;
    } else {
      nextBtn.disabled = !selections || (typeof selections === "string" && selections.trim().length === 0);
    }
  }

  // Option selection
  containerEl.querySelectorAll(".reflection-opt-btn:not(.custom-toggle-btn)").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.value;

      if (isMulti) {
        if (selections.includes(val)) {
          selections = selections.filter(s => s !== val);
          btn.classList.remove("selected");
          btn.querySelector(".opt-check").textContent = "○";
        } else {
          if (selections.length < maxChoices) {
            selections.push(val);
            btn.classList.add("selected");
            btn.querySelector(".opt-check").textContent = "✓";
          }
        }
      } else {
        selections = val;
        containerEl.querySelectorAll(".reflection-opt-btn").forEach(b => {
          b.classList.remove("selected");
          b.querySelector(".opt-check").textContent = "○";
        });
        btn.classList.add("selected");
        btn.querySelector(".opt-check").textContent = "✓";
        if (customWrap) customWrap.classList.add("hidden");
      }

      updateNextButton();
    });
  });

  // Custom text handler
  if (customToggle && customWrap && customInput) {
    customToggle.addEventListener("click", () => {
      customWrap.classList.toggle("hidden");
      if (!customWrap.classList.contains("hidden")) {
        customInput.focus();
        if (!isMulti) {
          containerEl.querySelectorAll(".reflection-opt-btn:not(.custom-toggle-btn)").forEach(b => {
            b.classList.remove("selected");
            b.querySelector(".opt-check").textContent = "○";
          });
          customToggle.classList.add("selected");
          selections = customInput.value.trim();
        }
      }
      updateNextButton();
    });

    customInput.addEventListener("input", () => {
      charCount.textContent = `${customInput.value.length}/140`;
      if (!isMulti) {
        selections = customInput.value.trim();
      } else {
        // Multi with custom: replace or push custom
        selections = selections.filter(s => options.includes(s));
        if (customInput.value.trim().length > 0) {
          selections.push(customInput.value.trim());
        }
      }
      updateNextButton();
    });
  }

  // Back button
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderActiveQuestion(containerEl, state);
      }
    });
  }

  // Next / Submit button
  nextBtn.addEventListener("click", () => {
    if (!state.reflection) state.reflection = { answers: {}, done: false };
    state.reflection.answers[qDef.id] = selections;
    saveGameState(state);

    currentQuestionIndex++;
    if (currentQuestionIndex < REFLECTION_QUESTIONS.length) {
      renderActiveQuestion(containerEl, state);
    } else {
      state.reflection.done = true;
      saveGameState(state);
      renderJournalScreen(containerEl, state);
    }
  });
}

/**
 * Render Mission Journal Screen (Printable 1-page summary card)
 */
export function renderJournalScreen(containerEl, state) {
  const ending = state.lastEnding || { title: "Mission Completed", tag: "ARES-1 MISSION COMPLETE" };
  const moodInfo = getMoodInfo(state.morale);
  const fullMeals = state.stats ? state.stats.fullDays : 0;
  const halfMeals = state.stats ? state.stats.lightDays : 0;
  const snackMeals = state.stats ? state.stats.emergencyDays : 0;
  const totalMeals = fullMeals + halfMeals + snackMeals;

  const answers = state.reflection?.answers || {};

  containerEl.innerHTML = `
    <div class="journal-page-wrapper">
      <div class="journal-print-card" id="printable-journal">
        <header class="journal-header">
          <div class="journal-badge">NASA SPACE APPS CHALLENGE · ARES-1 ARCHIVE</div>
          <h1 class="journal-title">ARES-1 Mission Journal & Flight Log</h1>
          <p class="journal-subtitle">Commander Elena Rivera & Expedition Crew · Sols 1–30</p>
        </header>

        <section class="journal-metrics-grid">
          <div class="journal-metric">
            <span class="jm-label">MISSION OUTCOME</span>
            <span class="jm-value">${ending.title}</span>
          </div>
          <div class="journal-metric">
            <span class="jm-label">SOLS SURVIVED</span>
            <span class="jm-value">Sol ${state.sol} / 30</span>
          </div>
          <div class="journal-metric">
            <span class="jm-label">CREW SPIRIT</span>
            <span class="jm-value">${moodInfo.face} ${moodInfo.label} (${state.morale}%)</span>
          </div>
          <div class="journal-metric">
            <span class="jm-label">FINAL METERS</span>
            <span class="jm-value">⚡ ${state.resources.power}% · 💧 ${state.resources.lifeSupport}% · 🛡️ ${state.resources.radiationSafety}%</span>
          </div>
        </section>

        <section class="journal-meals-summary">
          <h3>Ration History</h3>
          <p>Full Meals: <strong>${fullMeals}</strong> sols · Half Meals: <strong>${halfMeals}</strong> sols · Snack Bars: <strong>${snackMeals}</strong> sols (Total: ${totalMeals} sols)</p>
        </section>

        <section class="journal-reflection-summary">
          <h3>Commander's Post-Mission Reflection</h3>
          
          <div class="reflection-qa">
            <span class="qa-q">1. Hardest challenges met:</span>
            <p class="qa-a">${Array.isArray(answers.q1_hardest) ? answers.q1_hardest.join(", ") : answers.q1_hardest || "Not answered"}</p>
          </div>

          <div class="reflection-qa">
            <span class="qa-q">2. Most important lesson learned:</span>
            <p class="qa-a">${answers.q2_learned || "Not answered"}</p>
          </div>

          <div class="reflection-qa">
            <span class="qa-q">3. Hardest decision of the mission:</span>
            <p class="qa-a">${answers.q3_decision || "Not answered"}</p>
          </div>

          <div class="reflection-qa">
            <span class="qa-q">4. Advice for future Mars explorers:</span>
            <p class="qa-a">${answers.q4_future || "Not answered"}</p>
          </div>
        </section>

        <footer class="journal-footer">
          <p>🔒 Privacy: Your answers are saved only on your device. No personal data is transmitted across the network.</p>
        </footer>
      </div>

      <div class="journal-toolbar no-print">
        <button class="btn btn-secondary" id="btn-print-journal" type="button">🖨️ Print or Save as PDF</button>
        <button class="btn btn-secondary" id="btn-copy-answers" type="button">📋 Copy My Answers</button>
        <button class="btn btn-primary" id="btn-play-again" type="button">🚀 Play Again</button>
      </div>
      <div id="copy-toast" class="journal-toast hidden" role="status">Copied answers to clipboard!</div>
    </div>
  `;

  // Attach actions
  containerEl.querySelector("#btn-print-journal")?.addEventListener("click", () => {
    window.print();
  });

  containerEl.querySelector("#btn-copy-answers")?.addEventListener("click", () => {
    const text = `ARES-1 MISSION JOURNAL\nOutcome: ${ending.title}\nSols: ${state.sol}/30\nFinal Meters: Power ${state.resources.power}%, LS ${state.resources.lifeSupport}%, Rad ${state.resources.radiationSafety}%, Morale ${state.morale}%\n\n1. Hardest: ${Array.isArray(answers.q1_hardest) ? answers.q1_hardest.join(", ") : answers.q1_hardest}\n2. Learned: ${answers.q2_learned}\n3. Toughest Decision: ${answers.q3_decision}\n4. Advice for Future: ${answers.q4_future}`;

    navigator.clipboard?.writeText(text).then(() => {
      const toast = containerEl.querySelector("#copy-toast");
      if (toast) {
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3000);
      }
    });
  });

  containerEl.querySelector("#btn-play-again")?.addEventListener("click", () => {
    clearSavedGame();
    window.location.reload();
  });
}
