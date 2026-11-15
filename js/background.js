/**
 * ARES: The Last Signal - Modular Mars Background & Particle System
 * 
 * Provides 2D Mars visual background with dynamic atmospheric chapter tints
 * and slow floating dust particles canvas.
 * Designed so a future 3D WebGL globe can replace this module cleanly.
 */

let stageContainer = null;
let particleCanvas = null;
let particleCtx = null;
let animFrameId = null;
let particles = [];
let currentChapter = 1;
let currentDanger = "low";

/**
 * Initialize background layers inside containerEl
 */
export function initBackground(containerEl) {
  if (!containerEl) return;
  stageContainer = containerEl;
  stageContainer.innerHTML = "";
  stageContainer.setAttribute("aria-hidden", "true");

  // Layer 1: Landscape image container
  const photoLayer = document.createElement("div");
  photoLayer.className = "stage-layer stage-landscape";
  stageContainer.appendChild(photoLayer);

  // Layer 2: Particle canvas
  particleCanvas = document.createElement("canvas");
  particleCanvas.className = "stage-layer stage-particles";
  stageContainer.appendChild(particleCanvas);
  particleCtx = particleCanvas.getContext("2d");

  // Layer 3: Vignette & tint overlay
  const vignetteLayer = document.createElement("div");
  vignetteLayer.className = "stage-layer stage-vignette";
  stageContainer.appendChild(vignetteLayer);

  // Layer 4: Readability scrim (ensures contrast >= 4.5:1)
  const scrimLayer = document.createElement("div");
  scrimLayer.className = "stage-layer stage-scrim";
  stageContainer.appendChild(scrimLayer);

  // Resize canvas
  handleResize();
  window.addEventListener("resize", handleResize);

  // Initialize particles
  initParticles();
  startAnimationLoop();

  // Apply default state
  setBackground({ chapter: 1, danger: "low" });
}

function handleResize() {
  if (!particleCanvas) return;
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}

function initParticles() {
  const isMobile = window.innerWidth < 768;
  const isReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = isReducedMotion ? 0 : (isMobile ? 20 : 60);

  particles = [];
  const width = window.innerWidth || 1280;
  const height = window.innerHeight || 800;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: Math.random() * 0.4 + 0.1,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.2
    });
  }
}

function startAnimationLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  function render() {
    if (particleCtx && particleCanvas) {
      particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

      const color = currentChapter === 3 ? "245, 120, 80" : "210, 150, 110";

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x > particleCanvas.width) p.x = -10;
        if (p.y > particleCanvas.height) p.y = -10;
        if (p.y < -10) p.y = particleCanvas.height + 10;

        particleCtx.fillStyle = `rgba(${color}, ${p.opacity})`;
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        particleCtx.fill();
      }
    }
    animFrameId = requestAnimationFrame(render);
  }

  render();
}

/**
 * Transition background tint and atmosphere based on chapter and danger
 */
export function setBackground({ chapter = 1, danger = "low" }) {
  currentChapter = chapter;
  currentDanger = danger;

  if (!stageContainer) return;

  // Chapter tints:
  // Ch1: dawn (warm, orange morning)
  // Ch2: noon (clear, amber)
  // Ch3: dust haze (storm red tint)
  // Ch4: dusk (purple twilight)
  // Ch5: night (dark, starry deep navy)
  stageContainer.classList.remove(
    "chapter-1", "chapter-2", "chapter-3", "chapter-4", "chapter-5",
    "danger-low", "danger-medium", "danger-high"
  );

  stageContainer.classList.add(`chapter-${chapter}`);
  stageContainer.classList.add(`danger-${danger}`);
}
