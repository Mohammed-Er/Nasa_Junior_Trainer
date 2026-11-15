/**
 * ARES: The Last Signal - Sequential Scene Runner & Reveal Engine
 * 
 * Guarantees that every decision moment reveals content step-by-step
 * with locked inputs until revealed, so players don't miss key story info.
 */

/**
 * Check if user prefers reduced motion or slower reading speed
 */
export function getTimingMultiplier() {
  let mult = 1.0;
  if (typeof localStorage !== "undefined") {
    if (localStorage.getItem("ares_slow_reading") === "true") {
      mult *= 1.5;
    }
  }
  return mult;
}

export function isReducedMotion() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

/**
 * Reveal an array of elements sequentially with staggered animations.
 * Returns a Promise that resolves when all elements have finished revealing.
 */
export function reveal(elements, { stagger = 350, animation = "pop-in" } = {}) {
  const elems = Array.from(elements).filter(Boolean);
  if (elems.length === 0) return Promise.resolve();

  if (isReducedMotion()) {
    elems.forEach((el) => {
      el.classList.add("reveal-item", "is-in");
      el.style.opacity = "1";
    });
    return Promise.resolve();
  }

  const mult = getTimingMultiplier();
  const adjustedStagger = stagger * mult;

  return new Promise((resolve) => {
    let completed = 0;
    elems.forEach((el, index) => {
      el.classList.add("reveal-item");
      el.style.setProperty("--i", index);
      el.style.animationDelay = `${index * adjustedStagger}ms`;

      // Trigger animation
      requestAnimationFrame(() => {
        el.classList.add("is-in");
      });

      const totalDelay = index * adjustedStagger + 450;
      setTimeout(() => {
        completed++;
        if (completed >= elems.length) {
          resolve();
        }
      }, totalDelay);
    });
  });
}

/**
 * Typewriter effect for story dialogue text.
 * Clicking or pressing Space/Enter finishes instantly.
 */
export function typewriter(el, fullText, { cps = 40 } = {}) {
  if (!el || !fullText) return Promise.resolve();

  if (isReducedMotion()) {
    el.textContent = fullText;
    return Promise.resolve();
  }

  const mult = getTimingMultiplier();
  const delay = (1000 / cps) * mult;

  return new Promise((resolve) => {
    let index = 0;
    el.textContent = "";
    let isCancelled = false;

    function finishInstantly() {
      if (isCancelled) return;
      isCancelled = true;
      el.textContent = fullText;
      el.removeEventListener("click", finishInstantly);
      document.removeEventListener("keydown", handleKey);
      resolve();
    }

    function handleKey(e) {
      if (e.key === " " || e.key === "Enter") {
        finishInstantly();
      }
    }

    el.addEventListener("click", finishInstantly);
    document.addEventListener("keydown", handleKey);

    const timer = setInterval(() => {
      if (isCancelled) {
        clearInterval(timer);
        return;
      }
      index++;
      el.textContent = fullText.slice(0, index);

      if (index >= fullText.length) {
        clearInterval(timer);
        el.removeEventListener("click", finishInstantly);
        document.removeEventListener("keydown", handleKey);
        resolve();
      }
    }, delay);
  });
}

/**
 * SceneRunner: Orchestrates multi-beat scenes with Next/Skip controls.
 */
export class SceneRunner {
  constructor(beats = [], { onComplete = null } = {}) {
    this.beats = beats;
    this.currentIndex = 0;
    this.isRunning = false;
    this.isSkipped = false;
    this.onComplete = onComplete;
  }

  async play() {
    this.isRunning = true;
    this.currentIndex = 0;
    this.isSkipped = false;

    while (this.currentIndex < this.beats.length && !this.isSkipped) {
      const beatFn = this.beats[this.currentIndex];
      if (typeof beatFn === "function") {
        await beatFn(this);
      }
      this.currentIndex++;
    }

    this.isRunning = false;
    if (this.onComplete) {
      this.onComplete();
    }
  }

  skip() {
    this.isSkipped = true;
    this.isRunning = false;
    if (this.onComplete) {
      this.onComplete();
    }
  }
}
