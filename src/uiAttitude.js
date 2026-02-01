// UI Attitude Module: updates page mood based on Attitude level (vanilla JS)
// No framework dependencies.

import Attitude from "./attitudeSystem.js";
import { getRandomMessage } from "./messages.js";

const DEFAULTS = Object.freeze({
  // Selector for an optional element to show rotating judgment messages.
  messageTargetSelector: null,

  // Toggle for automatic message updates.
  enableMessages: false,

  // Update message on every level change.
  updateMessageOnLevelChange: true,

  // CSS class prefix for moods.
  moodClassPrefix: "mood-",
});

const MOODS = Object.freeze({
  NEUTRAL: "Neutral",
  DISAPPOINTED: "Disappointed",
  JUDGY: "Judgy",
  DONE_WITH_YOU: "Done With You",
  RESPECTFUL: "Respectful",
});

const LEVEL_MESSAGE_CATEGORY = Object.freeze({
  [MOODS.RESPECTFUL]: "secret",
  [MOODS.DONE_WITH_YOU]: "endState",
  [MOODS.JUDGY]: "click",
  [MOODS.DISAPPOINTED]: "idle",
  [MOODS.NEUTRAL]: "scroll",
});

// Mood definitions use CSS variables for easy theming.
// Adjust these to tweak fonts, spacing, colors, and interaction feel.
const MOOD_STYLES = Object.freeze({
  [MOODS.NEUTRAL]: {
    // Clean font, soft colors, polite spacing.
    fontSize: "1rem",
    letterSpacing: "0.02em",
    lineHeight: "1.6",
    hue: "210",
    saturation: "20%",
    lightness: "98%",
    textColor: "#222",
    filter: "none",
    cursorDelay: "0ms",
    buttonLatency: "0ms",
    opacity: "1",
  },
  [MOODS.DISAPPOINTED]: {
    // Slightly smaller text, muted colors, more whitespace.
    fontSize: "0.95rem",
    letterSpacing: "0.01em",
    lineHeight: "1.7",
    hue: "200",
    saturation: "10%",
    lightness: "96%",
    textColor: "#444",
    filter: "saturate(0.9)",
    cursorDelay: "0ms",
    buttonLatency: "40ms",
    opacity: "1",
  },
  [MOODS.JUDGY]: {
    // Tighter layout, subtle cursor delays, buttons slightly less responsive.
    fontSize: "0.92rem",
    letterSpacing: "0em",
    lineHeight: "1.45",
    hue: "190",
    saturation: "8%",
    lightness: "94%",
    textColor: "#3d3d3d",
    filter: "contrast(0.98)",
    cursorDelay: "80ms",
    buttonLatency: "120ms",
    opacity: "1",
  },
  [MOODS.DONE_WITH_YOU]: {
    // Page greys out, text barely reacts, show "..." messages.
    fontSize: "0.9rem",
    letterSpacing: "-0.01em",
    lineHeight: "1.35",
    hue: "0",
    saturation: "0%",
    lightness: "92%",
    textColor: "#666",
    filter: "grayscale(1)",
    cursorDelay: "150ms",
    buttonLatency: "180ms",
    opacity: "0.7",
  },
  [MOODS.RESPECTFUL]: {
    // Slightly warmer, confident mood.
    fontSize: "1.02rem",
    letterSpacing: "0.02em",
    lineHeight: "1.65",
    hue: "45",
    saturation: "18%",
    lightness: "98%",
    textColor: "#1f1f1f",
    filter: "none",
    cursorDelay: "0ms",
    buttonLatency: "0ms",
    opacity: "1",
  },
});

function ensureStyleTag() {
  let style = document.getElementById("attitude-ui-styles");
  if (style) return style;

  style = document.createElement("style");
  style.id = "attitude-ui-styles";
  style.textContent = `
:root {
  --attitude-font-size: 1rem;
  --attitude-letter-spacing: 0.02em;
  --attitude-line-height: 1.6;
  --attitude-bg-hue: 210;
  --attitude-bg-saturation: 20%;
  --attitude-bg-lightness: 98%;
  --attitude-text-color: #222;
  --attitude-filter: none;
  --attitude-opacity: 1;
  --attitude-cursor-delay: 0ms;
  --attitude-button-latency: 0ms;

  /* Smooth transitions between moods. */
  --attitude-transition: 400ms ease;
}

body {
  font-size: var(--attitude-font-size);
  letter-spacing: var(--attitude-letter-spacing);
  line-height: var(--attitude-line-height);
  color: var(--attitude-text-color);
  background-color: hsl(var(--attitude-bg-hue), var(--attitude-bg-saturation), var(--attitude-bg-lightness));
  transition: all var(--attitude-transition);
}

.attitude-surface {
  filter: var(--attitude-filter);
  opacity: var(--attitude-opacity);
  transition: all var(--attitude-transition);
}

/* Subtle cursor delay via transition on pointer targets. */
button, a, input, select, textarea {
  transition: transform var(--attitude-transition), opacity var(--attitude-transition);
  transition-delay: var(--attitude-button-latency);
}
`;

  document.head.appendChild(style);
  return style;
}

function applyMood(mood, options) {
  const root = document.documentElement;
  const classPrefix = options.moodClassPrefix;
  const styles = MOOD_STYLES[mood] || MOOD_STYLES[MOODS.NEUTRAL];

  // Apply CSS variables for easy extension.
  root.style.setProperty("--attitude-font-size", styles.fontSize);
  root.style.setProperty("--attitude-letter-spacing", styles.letterSpacing);
  root.style.setProperty("--attitude-line-height", styles.lineHeight);
  root.style.setProperty("--attitude-bg-hue", styles.hue);
  root.style.setProperty("--attitude-bg-saturation", styles.saturation);
  root.style.setProperty("--attitude-bg-lightness", styles.lightness);
  root.style.setProperty("--attitude-text-color", styles.textColor);
  root.style.setProperty("--attitude-filter", styles.filter);
  root.style.setProperty("--attitude-opacity", styles.opacity);
  root.style.setProperty("--attitude-cursor-delay", styles.cursorDelay);
  root.style.setProperty("--attitude-button-latency", styles.buttonLatency);

  // Swap mood classes for easier custom CSS.
  Object.values(MOODS).forEach((value) => {
    root.classList.remove(`${classPrefix}${value.toLowerCase().replace(/\s+/g, "-")}`);
  });
  root.classList.add(`${classPrefix}${mood.toLowerCase().replace(/\s+/g, "-")}`);
}

export function createAttitudeUI(options = {}) {
  const config = { ...DEFAULTS, ...options };
  const messageTarget = config.messageTargetSelector
    ? document.querySelector(config.messageTargetSelector)
    : null;

  function updateMessage(level) {
    if (!config.enableMessages || !messageTarget) return;
    if (level === MOODS.DONE_WITH_YOU) {
      messageTarget.textContent = "...";
      return;
    }
    const category = LEVEL_MESSAGE_CATEGORY[level] || LEVEL_MESSAGE_CATEGORY[MOODS.NEUTRAL];
    messageTarget.textContent = getRandomMessage(category);
  }

  function init() {
    ensureStyleTag();
    applyMood(Attitude.getLevel(), config);
    if (config.updateMessageOnLevelChange) updateMessage(Attitude.getLevel());

    // Hook into attitude changes for live UI updates.
    Attitude.onLevelChange(({ level }) => {
      applyMood(level, config);
      if (config.updateMessageOnLevelChange) updateMessage(level);
    });
  }

  return {
    init,
    applyMood: (level) => applyMood(level, config),
    updateMessage,
  };
}

export default createAttitudeUI;
