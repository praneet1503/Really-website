// Cartoon Animation Module: typewriter, mascot expressions, parallax, and motion effects.
// Hooks into Attitude level changes for mood-based animation tuning.

import Attitude from "./attitudeSystem.js";

const DEFAULTS = Object.freeze({
  typewriterSpeedMs: 22,
  typewriterCursor: true,
  scrollWobbleThreshold: 1.1, // px/ms (adjust for more/less wobble)
  parallaxStrength: 12, // px (mouse move depth)
  scrollParallaxStrength: 18, // px (scroll depth)
  reduceMotion: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

function setClassTemporarily(el, className, durationMs = 600) {
  if (!el) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), durationMs);
}

function typewriter(el, text, speedMs, showCursor) {
  if (!el) return;
  el.dataset.fullText = text;
  if (DEFAULTS.reduceMotion) {
    el.textContent = text;
    return;
  }

  let i = 0;
  el.textContent = "";
  if (showCursor) el.classList.add("typewriter");

  const tick = () => {
    el.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) {
      requestAnimationFrame(() => setTimeout(tick, speedMs));
    } else if (showCursor) {
      el.classList.remove("typewriter");
    }
  };

  tick();
}

function setMascotExpression(level) {
  const mascot = document.getElementById("mascot");
  if (!mascot) return;
  mascot.dataset.level = level;
}

function applyMoodAnimationTuning(level) {
  const root = document.documentElement;
  // Adjust animation speed based on mood.
  // Done With You = sluggish, Judgy = slightly slow, Neutral/Respectful = lively.
  let speed = 1;
  if (level === "Done With You") speed = 1.4;
  else if (level === "Judgy") speed = 1.2;
  else if (level === "Disappointed") speed = 1.1;
  else speed = 0.9;

  root.style.setProperty("--mood-animation-speed", String(speed));
}

function initParallax(config) {
  const layers = Array.from(document.querySelectorAll("[data-depth]"));
  if (layers.length === 0) return;

  const onMouseMove = (event) => {
    if (config.reduceMotion) return;
    const { innerWidth, innerHeight } = window;
    const x = (event.clientX / innerWidth - 0.5) * 2;
    const y = (event.clientY / innerHeight - 0.5) * 2;

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0.1);
      const dx = x * config.parallaxStrength * depth;
      const dy = y * config.parallaxStrength * depth;
      layer.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
  };

  const onScroll = () => {
    if (config.reduceMotion) return;
    const scrollY = window.scrollY || 0;
    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0.1);
      const dy = (scrollY * depth * config.scrollParallaxStrength) / 100;
      layer.style.setProperty("--scroll-offset", `${dy}px`);
    });
  };

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initScrollWobble(config) {
  const surface = document.getElementById("page-content");
  if (!surface) return;

  let lastY = window.scrollY || 0;
  let lastTime = performance.now();

  const onScroll = () => {
    const now = performance.now();
    const y = window.scrollY || 0;
    const distance = Math.abs(y - lastY);
    const dt = Math.max(1, now - lastTime);
    const speed = distance / dt;

    if (speed >= config.scrollWobbleThreshold) {
      setClassTemporarily(surface, "wobble", 500);
    }

    lastY = y;
    lastTime = now;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

export function updateMoodAnimations(level) {
  const root = document.documentElement;
  applyMoodAnimationTuning(level);

  // Trigger a mood change animation.
  if (level === "Disappointed") setClassTemporarily(root, "anim-shake", 600);
  else if (level === "Judgy") setClassTemporarily(root, "anim-wobble", 700);
  else if (level === "Done With You") setClassTemporarily(root, "anim-bounce", 600);
  else setClassTemporarily(root, "anim-bounce", 500);

  setMascotExpression(level);

  // Typewriter refresh for the main judgment message.
  const messageEl = document.getElementById("judgment-message");
  if (messageEl && messageEl.textContent) {
    typewriter(messageEl, messageEl.textContent, DEFAULTS.typewriterSpeedMs, DEFAULTS.typewriterCursor);
  }
}

export function initCartoonUI(options = {}) {
  const config = { ...DEFAULTS, ...options };

  // Typewriter effect for toast messages on score changes.
  const toastEl = document.getElementById("attitude-toast");
  Attitude.onScoreChange(({ reason }) => {
    if (!reason || !toastEl) return;
    typewriter(toastEl, reason, config.typewriterSpeedMs, false);
  });

  // Attitude level change hooks.
  Attitude.onLevelChange(({ level }) => {
    updateMoodAnimations(level);
  });

  // Initialize animations on load.
  updateMoodAnimations(Attitude.getLevel());
  initParallax(config);
  initScrollWobble(config);

  return {
    updateMoodAnimations,
  };
}

export default initCartoonUI;
