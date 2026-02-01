// Mood Layout Module: updates palette + layout by Attitude level.
// Integration target: the root document and .attitude-surface container.

import Attitude from "./attitudeSystem.js";

const DEFAULTS = Object.freeze({
  transitionMs: 450,
});

const MOODS = Object.freeze({
  NEUTRAL: "Neutral",
  DISAPPOINTED: "Disappointed",
  JUDGY: "Judgy",
  DONE_WITH_YOU: "Done With You",
  RESPECTFUL: "Respectful",
});

const MOOD_STYLES = Object.freeze({
  [MOODS.NEUTRAL]: {
    bg: "#ffffff",
    text: "#2b2b2b",
    muted: "#666",
    spacing: "24px",
    cursorDelay: "0ms",
    opacity: "1",
  },
  [MOODS.DISAPPOINTED]: {
    bg: "#f7f1f1",
    text: "#3a3a3a",
    muted: "#7a7a7a",
    spacing: "28px",
    cursorDelay: "0ms",
    opacity: "1",
  },
  [MOODS.JUDGY]: {
    bg: "#f1e9e9",
    text: "#2f2f2f",
    muted: "#6a6a6a",
    spacing: "16px",
    cursorDelay: "120ms",
    opacity: "1",
  },
  [MOODS.DONE_WITH_YOU]: {
    bg: "#ececec",
    text: "#666",
    muted: "#888",
    spacing: "14px",
    cursorDelay: "160ms",
    opacity: "0.8",
  },
  [MOODS.RESPECTFUL]: {
    bg: "#fffdf7",
    text: "#1f1f1f",
    muted: "#5c5c5c",
    spacing: "26px",
    cursorDelay: "0ms",
    opacity: "1",
  },
});

function applyMood(level, transitionMs) {
  const styles = MOOD_STYLES[level] || MOOD_STYLES[MOODS.NEUTRAL];
  const root = document.documentElement;

  root.style.setProperty("--mood-bg", styles.bg);
  root.style.setProperty("--mood-text", styles.text);
  root.style.setProperty("--mood-muted", styles.muted);
  root.style.setProperty("--mood-spacing", styles.spacing);
  root.style.setProperty("--mood-cursor-delay", styles.cursorDelay);
  root.style.setProperty("--mood-opacity", styles.opacity);
  root.style.setProperty("--mood-transition", `${transitionMs}ms ease`);

  // Apply state class for custom CSS hooks.
  root.dataset.mood = level;
}

export function initMoodLayout(options = {}) {
  const config = { ...DEFAULTS, ...options };

  applyMood(Attitude.getLevel(), config.transitionMs);

  // Hook into Attitude changes.
  Attitude.onLevelChange(({ level }) => {
    applyMood(level, config.transitionMs);
  });

  return {
    apply: (level) => applyMood(level, config.transitionMs),
  };
}

export default initMoodLayout;
