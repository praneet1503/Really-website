// Flavortown UI Module: bold colors, playful motion, mascot reactions.
// Integrates with Attitude and existing behavior modules.

import Attitude from "./attitudeSystem.js";

const DEFAULTS = Object.freeze({
  typewriterSpeedMs: 24,
  flameBurstDurationMs: 700,
  reduceMotion: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

const MOODS = Object.freeze({
  NEUTRAL: "Neutral",
  DISAPPOINTED: "Disappointed",
  JUDGY: "Judgy",
  DONE_WITH_YOU: "Done With You",
  RESPECTFUL: "Respectful",
});

const MOOD_PALETTES = Object.freeze({
  [MOODS.NEUTRAL]: {
    primary: "#ff6b35",
    accent: "#ffd166",
    bg: "#fff3e6",
    text: "#2b2b2b",
    motion: 1,
  },
  [MOODS.DISAPPOINTED]: {
    primary: "#ff7f50",
    accent: "#fcbf49",
    bg: "#fff0e0",
    text: "#3a3a3a",
    motion: 1.1,
  },
  [MOODS.JUDGY]: {
    primary: "#ff5a5f",
    accent: "#ffa600",
    bg: "#ffe7dc",
    text: "#2d2d2d",
    motion: 1.25,
  },
  [MOODS.DONE_WITH_YOU]: {
    primary: "#ff3b3b",
    accent: "#ff9f1c",
    bg: "#ffe1d6",
    text: "#444",
    motion: 1.5,
  },
  [MOODS.RESPECTFUL]: {
    primary: "#ff8f00",
    accent: "#ffe066",
    bg: "#fff7e1",
    text: "#1f1f1f",
    motion: 0.9,
  },
});

function typewriter(el, text, speedMs, reduceMotion) {
  if (!el) return;
  if (reduceMotion) {
    el.textContent = text;
    return;
  }

  let i = 0;
  el.textContent = "";
  el.classList.add("ft-typewriter");

  const tick = () => {
    el.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) {
      requestAnimationFrame(() => setTimeout(tick, speedMs));
    } else {
      el.classList.remove("ft-typewriter");
    }
  };

  tick();
}

function setClassForDuration(el, className, durationMs) {
  if (!el) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), durationMs);
}

function setMascotExpression(level) {
  const mascot = document.getElementById("mascot");
  if (!mascot) return;
  mascot.dataset.level = level;
}

export function updateFlavortownMood(level) {
  const palette = MOOD_PALETTES[level] || MOOD_PALETTES[MOODS.NEUTRAL];
  const root = document.documentElement;

  root.style.setProperty("--ft-primary", palette.primary);
  root.style.setProperty("--ft-accent", palette.accent);
  root.style.setProperty("--ft-bg", palette.bg);
  root.style.setProperty("--ft-text", palette.text);
  root.style.setProperty("--ft-motion", String(palette.motion));

  const body = document.body;
  setClassForDuration(body, "ft-pop", 450);
  if (level === MOODS.DISAPPOINTED) setClassForDuration(body, "ft-shake", 600);
  if (level === MOODS.JUDGY) setClassForDuration(body, "ft-wobble", 650);
  if (level === MOODS.DONE_WITH_YOU) setClassForDuration(body, "ft-bounce", 650);

  setMascotExpression(level);

  const flame = document.getElementById("flame-burst");
  if (flame) setClassForDuration(flame, "show", DEFAULTS.flameBurstDurationMs);

  const messageEl = document.getElementById("judgment");
  if (messageEl && messageEl.textContent) {
    typewriter(messageEl, messageEl.textContent, DEFAULTS.typewriterSpeedMs, DEFAULTS.reduceMotion);
  }
}

export function initFlavortownUI(options = {}) {
  const config = { ...DEFAULTS, ...options };

  // Hook attitude changes (main integration point).
  Attitude.onLevelChange(({ level }) => {
    updateFlavortownMood(level);
  });

  // Optional hook for other behaviors (scroll, click, tab):
  // Call updateFlavortownMood(Attitude.getLevel()) after custom effects.

  // Typewriter for toast changes.
  const toastEl = document.getElementById("attitude-toast");
  Attitude.onScoreChange(({ reason }) => {
    if (!reason || !toastEl) return;
    typewriter(toastEl, reason, config.typewriterSpeedMs, config.reduceMotion);
  });

  updateFlavortownMood(Attitude.getLevel());

  return {
    updateFlavortownMood,
  };
}

export default initFlavortownUI;
