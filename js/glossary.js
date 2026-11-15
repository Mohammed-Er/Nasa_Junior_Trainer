/**
 * ARES: The Last Signal - Glossary & Popover System
 * 
 * Automatically highlights the first occurrence of difficult space terms
 * and attaches accessible tooltips/popovers with kid-friendly definitions.
 */

import { GLOSSARY } from "../data/glossary.js";

let activePopover = null;

/**
 * Escapes regex special characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Process text and wrap the FIRST occurrence of glossary terms in interactive buttons.
 */
export function explain(text) {
  if (!text || typeof text !== "string") return "";

  let result = text;
  const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

  for (const term of terms) {
    // Only wrap the first occurrence, case-insensitively, on word boundaries
    const regex = new RegExp(`\\b(${escapeRegex(term)})\\b`, "i");
    if (regex.test(result)) {
      result = result.replace(regex, (match) => {
        return `<button class="term-btn" type="button" data-term="${term.toLowerCase()}" aria-haspopup="dialog" aria-expanded="false">${match}</button>`;
      });
    }
  }

  return result;
}

/**
 * Initialize event delegation for glossary terms
 */
export function initGlossary() {
  // Close popover on document click outside
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".term-btn");
    if (btn) {
      e.stopPropagation();
      togglePopover(btn);
      return;
    }

    if (activePopover && !activePopover.contains(e.target)) {
      closePopover();
    }
  });

  // Close popover on Esc key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activePopover) {
      closePopover();
    }
  });
}

/**
 * Open or toggle definition popover anchored to the button
 */
function togglePopover(btn) {
  const termKey = btn.dataset.term;
  const definition = GLOSSARY[termKey];
  if (!definition) return;

  if (activePopover && activePopover.dataset.forBtn === termKey) {
    closePopover();
    return;
  }

  closePopover();

  const popover = document.createElement("div");
  popover.className = "glossary-popover";
  popover.setAttribute("role", "tooltip");
  popover.dataset.forBtn = termKey;

  popover.innerHTML = `
    <div class="popover-header">
      <span class="popover-term">🚀 ${termKey.toUpperCase()}</span>
      <button class="popover-close" type="button" aria-label="Close definition">&times;</button>
    </div>
    <p class="popover-body">${definition}</p>
  `;

  popover.querySelector(".popover-close").addEventListener("click", (e) => {
    e.stopPropagation();
    closePopover();
  });

  document.body.appendChild(popover);
  btn.setAttribute("aria-expanded", "true");

  // Position popover
  const rect = btn.getBoundingClientRect();
  const popoverWidth = Math.min(300, window.innerWidth - 32);
  let left = rect.left + rect.width / 2 - popoverWidth / 2;
  left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, left));

  let top = rect.bottom + 8;
  if (top + 140 > window.innerHeight) {
    top = rect.top - 140 - 8;
  }

  popover.style.width = `${popoverWidth}px`;
  popover.style.left = `${left}px`;
  popover.style.top = `${Math.max(16, top)}px`;

  activePopover = popover;
}

/**
 * Close active popover
 */
export function closePopover() {
  if (activePopover) {
    const termKey = activePopover.dataset.forBtn;
    const btn = document.querySelector(`.term-btn[data-term="${termKey}"]`);
    if (btn) btn.setAttribute("aria-expanded", "false");

    activePopover.remove();
    activePopover = null;
  }
}
