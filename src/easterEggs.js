// Easter Egg module for the Flavortown judgment experience.
// Hooks into #judgment, #mascot, and Attitude to celebrate good behavior.
// To add new triggers, append entries to EASTER_EGG_TRIGGERS and handle them
// in triggerEasterEgg; the helpers (checkEasterEggs, triggerEasterEgg, resetEasterEggs)
// stay reusable and can be called from other modules or test rigs.

import Attitude, { LEVELS } from "./attitudeSystem.js";
import { showJudgmentMessage } from "./judgmentAnimations.js";

const SECRET_COMBO = "FLAVOR";

const EASTER_EGG_TYPES = Object.freeze({
  HIGH_SCORE: "highScoreSecret",
  PERFECT_SCROLL: "perfectScroll",
  CLICK_MASTER: "clickMaster",
  KEY_COMBO: "keyCombo",
  SUPER: "superEnding",
});

const DEFAULTS = Object.freeze({
  perfectScrollDepth: 0.93,
  perfectScrollDurationMs: 8000,
  slowScrollSpeedThreshold: 0.33,
  clickStreakTarget: 10,
  highScoreWindowMs: 30000,
  highScoreCooldownMs: 60000,
  comboCooldownMs: 40000,
  eggDurationMs: 5200,
  reduceMotion:
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

const CONFETTI_COLORS = ["#ffe066", "#ff6b6b", "#5dd39e", "#82cfff", "#d782ff"];

const state = {
  slowScrollStartAt: null,
  perfectScrollTriggered: false,
  clickStreak: 0,
  clickMasterTriggered: false,
  comboBuffer: "",
  comboCooldownAt: 0,
  highScoreStartAt: null,
  highScoreTriggered: false,
  highScoreCooldownAt: 0,
  lastNegativeAt: -Infinity,
  superEggTriggered: false,
  activeEgg: null,
  resetTimer: null,
  confettiContainer: null,
  overlayEl: null,
  lastScrollY: 0,
  lastScrollTime: performance.now(),
};

let runtimeConfig = { ...DEFAULTS };

function isInteractiveElement(target) {
  if (!target) return false;
  const tag = target.tagName ? target.tagName.toUpperCase() : "";
  const interactiveTags = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"];
  if (interactiveTags.includes(tag)) return true;
  if (target.closest && target.closest("button, a, input, select, textarea, [role='button']")) {
    return true;
  }
  return false;
}

function animateMascot(effect) {
  const mascot = document.getElementById("mascot");
  if (!mascot) return;
  const className = `mascot-${effect}`;
  mascot.classList.add(className);
  window.setTimeout(() => mascot.classList.remove(className), runtimeConfig.eggDurationMs);
}

function spawnConfetti(pieces = 28) {
  if (runtimeConfig.reduceMotion) return;
  if (state.confettiContainer) {
    state.confettiContainer.remove();
    state.confettiContainer = null;
  }
  const container = document.createElement("div");
  container.className = "confetti-burst";
  for (let i = 0; i < pieces; i += 1) {
    const dot = document.createElement("span");
    dot.className = "confetti-piece";
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    dot.style.animationDelay = `${Math.random() * 0.8}s`;
    dot.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(dot);
  }
  document.body.appendChild(container);
  state.confettiContainer = container;
  window.setTimeout(() => {
    container.classList.add("fade-out");
    window.setTimeout(() => container.remove(), 900);
  }, runtimeConfig.eggDurationMs);
}

function showGoodEndingOverlay() {
  if (state.overlayEl) return;
  const overlay = document.createElement("div");
  overlay.className = "good-ending-overlay";
  overlay.innerHTML = `
    <div class="good-ending-card">
      <p class="good-ending-title">You've exceeded expectations.</p>
      <p class="good-ending-body">Truly Flavortown-level courtesy. Waves, applause, and a little fireworks for you.</p>
      <button type="button" class="good-ending-dismiss">Close</button>
    </div>
  `;
  const dismiss = () => {
    overlay.remove();
    state.overlayEl = null;
  };
  overlay.addEventListener("click", dismiss, { once: true });
  document.body.appendChild(overlay);
  state.overlayEl = overlay;
}

export function resetEasterEggs() {
  if (state.resetTimer) {
    window.clearTimeout(state.resetTimer);
    state.resetTimer = null;
  }
  document.body.classList.remove("palette-burst", "good-ending-palette");
  const judgment = document.getElementById("judgment");
  judgment?.classList.remove("text-glow");
  const mascot = document.getElementById("mascot");
  if (mascot) {
    mascot.classList.remove("mascot-dance", "mascot-wave", "mascot-wink", "mascot-spark");
  }
  if (state.confettiContainer) {
    state.confettiContainer.remove();
    state.confettiContainer = null;
  }
  if (state.overlayEl) {
    state.overlayEl.remove();
    state.overlayEl = null;
  }
  state.activeEgg = null;
}

export function triggerEasterEgg(type, options = {}) {
  resetEasterEggs();
  state.activeEgg = type;
  const judgmentMessage = options.message || "The judgment is pleasantly surprised.";
  const keepGlow = options.glow ?? true;
  showJudgmentMessage("secret", {
    overrideMessage: judgmentMessage,
    typeSpeedMs: options.typeSpeedMs ?? 20,
    onComplete: () => {
      if (keepGlow) document.getElementById("judgment")?.classList.add("text-glow");
    },
  });

  if (!runtimeConfig.reduceMotion) {
    switch (type) {
      case EASTER_EGG_TYPES.HIGH_SCORE:
        animateMascot("dance");
        document.body.classList.add("palette-burst");
        spawnConfetti();
        break;
      case EASTER_EGG_TYPES.PERFECT_SCROLL:
        animateMascot("wave");
        document.body.classList.add("palette-burst");
        spawnConfetti(20);
        break;
      case EASTER_EGG_TYPES.CLICK_MASTER:
        animateMascot("wink");
        spawnConfetti(24);
        break;
      case EASTER_EGG_TYPES.KEY_COMBO:
        animateMascot("spark");
        spawnConfetti(30);
        break;
      case EASTER_EGG_TYPES.SUPER:
        animateMascot("dance");
        document.body.classList.add("good-ending-palette");
        showGoodEndingOverlay();
        spawnConfetti(60);
        break;
      default:
        spawnConfetti();
    }
  }

  state.resetTimer = window.setTimeout(() => {
    resetEasterEggs();
  }, options.durationMs ?? runtimeConfig.eggDurationMs);
}

function handleClick(event) {
  if (isInteractiveElement(event.target)) {
    state.clickStreak += 1;
    if (!state.clickMasterTriggered && state.clickStreak >= runtimeConfig.clickStreakTarget) {
      state.clickMasterTriggered = true;
      triggerEasterEgg(EASTER_EGG_TYPES.CLICK_MASTER, {
        message: "Click master unlocked. Smooth moves!",
      });
      evaluateSuperEgg();
    }
    return;
  }
  state.clickStreak = 0;
}

function handleScroll() {
  const now = performance.now();
  const y = window.scrollY || window.pageYOffset || 0;
  const doc = document.documentElement;
  const scrollHeight = doc.scrollHeight - doc.clientHeight || 1;
  const depth = Math.min(1, Math.max(0, y / scrollHeight));
  const deltaY = Math.abs(y - (state.lastScrollY ?? y));
  const deltaMs = Math.max(1, now - (state.lastScrollTime ?? now));
  const speed = deltaY / deltaMs;
  state.lastScrollY = y;
  state.lastScrollTime = now;

  if (speed <= runtimeConfig.slowScrollSpeedThreshold) {
    if (!state.slowScrollStartAt) state.slowScrollStartAt = now;
  } else {
    state.slowScrollStartAt = null;
  }

  if (
    !state.perfectScrollTriggered &&
    depth >= runtimeConfig.perfectScrollDepth &&
    state.slowScrollStartAt &&
    now - state.slowScrollStartAt >= runtimeConfig.perfectScrollDurationMs
  ) {
    state.perfectScrollTriggered = true;
    triggerEasterEgg(EASTER_EGG_TYPES.PERFECT_SCROLL, {
      message: "Perfect scroll detected. You read the whole thing!",
    });
    evaluateSuperEgg();
  }
}

function handleKeydown(event) {
  const key = String(event.key).toUpperCase();
  if (!/^[A-Z]$/.test(key)) return;
  state.comboBuffer = `${state.comboBuffer}${key}`.slice(-SECRET_COMBO.length);
  const now = performance.now();
  if (state.comboBuffer === SECRET_COMBO && now > state.comboCooldownAt) {
    state.comboCooldownAt = now + runtimeConfig.comboCooldownMs;
    triggerEasterEgg(EASTER_EGG_TYPES.KEY_COMBO, {
      message: "Flavor text: you cracked the secret combo.",
    });
    evaluateSuperEgg();
  }
}

function handleScoreChange({ score, delta }) {
  const now = performance.now();
  if (delta < 0) {
    state.lastNegativeAt = now;
    state.highScoreStartAt = null;
    state.highScoreTriggered = false;
    state.superEggTriggered = false;
  }
  if (score >= 5) {
    if (!state.highScoreStartAt) state.highScoreStartAt = now;
  } else {
    state.highScoreStartAt = null;
  }
  checkEasterEggs();
}

function handleLevelChange({ level }) {
  if (level === LEVELS.RESPECTFUL) {
    checkEasterEggs();
  }
}

export function evaluateSuperEgg() {
  if (
    state.highScoreTriggered &&
    state.clickMasterTriggered &&
    state.perfectScrollTriggered &&
    !state.superEggTriggered
  ) {
    state.superEggTriggered = true;
    triggerEasterEgg(EASTER_EGG_TYPES.SUPER, {
      message: "Good ending unlocked. Flavortown applause incoming.",
    });
  }
}

export function checkEasterEggs() {
  const now = performance.now();
  const score = Attitude.attitudeScore ?? Attitude.getScore();
  if (state.highScoreTriggered && now >= state.highScoreCooldownAt) {
    state.highScoreTriggered = false;
  }
  if (state.highScoreTriggered && now < state.highScoreCooldownAt) return;
  if (score >= 5 && !state.highScoreTriggered) {
    if (!state.highScoreStartAt) state.highScoreStartAt = now;
    if (
      state.highScoreStartAt &&
      now - state.highScoreStartAt >= runtimeConfig.highScoreWindowMs &&
      now - state.lastNegativeAt >= runtimeConfig.highScoreWindowMs
    ) {
      state.highScoreTriggered = true;
      state.highScoreCooldownAt = now + runtimeConfig.highScoreCooldownMs;
      triggerEasterEgg(EASTER_EGG_TYPES.HIGH_SCORE, {
        message: "Secret high-score mode: the judgment is impressed.",
      });
      evaluateSuperEgg();
    }
  }
  evaluateSuperEgg();
}

export function initEasterEggs(options = {}) {
  runtimeConfig = {
    ...DEFAULTS,
    ...options,
  };
  if (runtimeConfig.reduceMotion === undefined) {
    runtimeConfig.reduceMotion = DEFAULTS.reduceMotion;
  }
  const scrollHandler = (event) => handleScroll(event);
  const clickHandler = (event) => handleClick(event);
  const keyHandler = (event) => handleKeydown(event);

  window.addEventListener("scroll", scrollHandler, { passive: true });
  window.addEventListener("click", clickHandler, { passive: true });
  window.addEventListener("keydown", keyHandler);

  const unsubscribeScore = Attitude.onScoreChange(handleScoreChange);
  const unsubscribeLevel = Attitude.onLevelChange(handleLevelChange);

  checkEasterEggs();

  return {
    checkEasterEggs,
    triggerEasterEgg,
    resetEasterEggs,
    destroy() {
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("click", clickHandler);
      window.removeEventListener("keydown", keyHandler);
      unsubscribeScore();
      unsubscribeLevel();
      resetEasterEggs();
    },
  };
}

export default initEasterEggs;
