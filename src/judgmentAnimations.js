// Judgment reactions controller: typewriter + behavior-aware animation cues against <div id="judgment"></div>.

import Attitude, { LEVELS } from "./attitudeSystem.js";
import { getRandomMessage } from "./messages.js";

const DEFAULTS = Object.freeze({
  typeSpeedMs: 24,
  animationDurationMs: 600,
  cooldownMs: 1200,
  secretThreshold: 5,
  secretChance: 0.25,
  reduceMotion: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

const CATEGORY_ANIMATIONS = Object.freeze({
  scroll: "judgment-bounce",
  click: "judgment-shake",
  idle: "judgment-pop",
  tab: "judgment-bounce",
  endState: "judgment-pop",
  secret: "judgment-bounce",
});

const LEVEL_ANIMATIONS = Object.freeze({
  [LEVELS.DONE_WITH_YOU]: "judgment-pop",
  [LEVELS.JUDGY]: "judgment-shake",
  [LEVELS.DISAPPOINTED]: "judgment-shake",
  [LEVELS.NEUTRAL]: "judgment-bounce",
  [LEVELS.RESPECTFUL]: "judgment-bounce",
});

const CATEGORY_KEYWORDS = Object.freeze({
  tab: ["multitasking", "wait", "back"],
  scroll: ["scroll", "read", "bold assumption", "fast", "calm"],
  idle: ["thinking", "left", "idle", "afk"],
  click: ["click", "interactive", "suspicious", "button", "guess", "choice", "spam"],
});

let lastCategory = null;
let lastCategoryAt = 0;

function setClassForDuration(el, className, durationMs = DEFAULTS.animationDurationMs) {
  if (!el || !className) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), durationMs);
}

function shouldThrottleCategory(category, cooldownMs) {
  if (!category) return false;
  const now = performance.now();
  if (category === lastCategory && now - lastCategoryAt < cooldownMs) {
    return true;
  }
  lastCategory = category;
  lastCategoryAt = now;
  return false;
}

function typeWriterEffect(el, text, speedMs, reduceMotion, callback) {
  if (!el) return;
  const cleaned = String(text || "");
  if (reduceMotion) {
    el.textContent = cleaned;
    callback?.(cleaned);
    return;
  }

  let i = 0;
  el.textContent = "";
  el.classList.add("judgment-typewriter");

  const tick = () => {
    el.textContent = cleaned.slice(0, i);
    i += 1;
    if (i <= cleaned.length) {
      requestAnimationFrame(() => setTimeout(tick, speedMs));
    } else {
      el.classList.remove("judgment-typewriter");
      callback?.(cleaned);
    }
  };

  tick();
}

function mapReasonToCategory(reason) {
  const normalized = String(reason || "").toLowerCase().replace(/’/g, "'").trim();
  if (CATEGORY_KEYWORDS.tab.some((keyword) => normalized.includes(keyword))) return "tab";
  if (CATEGORY_KEYWORDS.scroll.some((keyword) => normalized.includes(keyword))) return "scroll";
  if (CATEGORY_KEYWORDS.idle.some((keyword) => normalized.includes(keyword))) return "idle";
  if (CATEGORY_KEYWORDS.click.some((keyword) => normalized.includes(keyword))) return "click";
  return "click";
}

export function showJudgmentMessage(category = "click", options = {}) {
  const config = { ...DEFAULTS, ...options };
  const normalizedCategory = category || "click";
  if (shouldThrottleCategory(normalizedCategory, config.cooldownMs)) {
    return "";
  }

  const animationClass =
    options.animationClass ?? CATEGORY_ANIMATIONS[normalizedCategory] ?? CATEGORY_ANIMATIONS.click;
  const reduceMotion = options.reduceMotion ?? config.reduceMotion;

  const message = options.overrideMessage || getRandomMessage(normalizedCategory);
  if (!message) return "";

  const el = document.getElementById("judgment");
  if (!el) return message;

  if (!reduceMotion && animationClass) {
    setClassForDuration(el, animationClass, config.animationDurationMs);
  }

  typeWriterEffect(el, message, options.typeSpeedMs ?? config.typeSpeedMs, reduceMotion, options.onComplete);

  return message;
}

export function initJudgmentAnimations(options = {}) {
  const config = { ...DEFAULTS, ...options };

  Attitude.onScoreChange(({ reason, score }) => {
    const category = mapReasonToCategory(reason);
    showJudgmentMessage(category, config);
    if (score >= config.secretThreshold && Math.random() < config.secretChance) {
      showJudgmentMessage("secret", config);
    }
  });

  Attitude.onLevelChange(({ level }) => {
    const animationClass = LEVEL_ANIMATIONS[level] ?? CATEGORY_ANIMATIONS.click;
    const el = document.getElementById("judgment");
    if (el && !config.reduceMotion) {
      setClassForDuration(el, animationClass, config.animationDurationMs);
    }
    if (level === LEVELS.DONE_WITH_YOU) {
      showJudgmentMessage("endState", config);
    }
  });

  return {
    showJudgmentMessage,
  };
}

export default initJudgmentAnimations;
