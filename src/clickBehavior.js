// Click Behavior Tracker: detects click spam and non-interactive clicks.
// Integrates with Attitude brain system.

import Attitude from "./attitudeSystem.js";

const DEFAULTS = Object.freeze({
  // Click spam thresholds. Adjust to be stricter/looser.
  clickWindowMs: 2000, // time window to count clicks
  clickSpamCount: 8, // clicks within window to trigger spam
  clickSpamCooldown: 3000, // cooldown between spam penalties

  // Interactive click feedback. Adjust to change how often it reacts.
  interactiveRewardDelta: 1,
  interactiveRewardReason: "Polite click",
  interactiveRewardCooldown: 1200,

  // Non-interactive click tags. Add/remove tags to tune.
  nonInteractiveTags: ["DIV", "SPAN", "P", "H1", "H2", "H3", "H4", "H5", "H6"],
});

export function createClickBehaviorTracker(options = {}) {
  const config = { ...DEFAULTS, ...options };
  let clickTimes = [];
  let lastSpamAt = 0;
  let lastInteractiveAt = 0;

  function isInteractiveElement(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "BUTTON" || tag === "A" || tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
      return true;
    }
    if (el.closest && el.closest("button, a, input, select, textarea, [role='button']")) {
      return true;
    }
    return false;
  }

  function onClick(event) {
    const now = performance.now();

    // Track click frequency in rolling window.
    clickTimes.push(now);
    const windowStart = now - config.clickWindowMs;
    clickTimes = clickTimes.filter((t) => t >= windowStart);

    if (clickTimes.length >= config.clickSpamCount && now - lastSpamAt > config.clickSpamCooldown) {
      lastSpamAt = now;
      Attitude.changeScore(-2, "Click spam");
    }

    // Penalize clicks on non-interactive elements (headings, divs, etc.).
    const target = event.target;
    const tag = target && target.tagName ? target.tagName : "";
    const isNonInteractiveTag = config.nonInteractiveTags.includes(tag);
    if (isNonInteractiveTag && !isInteractiveElement(target)) {
      Attitude.changeScore(-1, "That wasn’t interactive");
      return;
    }

    // Provide visible feedback for actual interactive clicks.
    if (isInteractiveElement(target) && now - lastInteractiveAt > config.interactiveRewardCooldown) {
      lastInteractiveAt = now;
      if (config.interactiveRewardDelta !== 0) {
        Attitude.changeScore(config.interactiveRewardDelta, config.interactiveRewardReason);
      }
    }
  }

  function start() {
    document.addEventListener("click", onClick, { passive: true });
  }

  function stop() {
    document.removeEventListener("click", onClick);
  }

  return {
    start,
    stop,
  };
}

export default createClickBehaviorTracker;
