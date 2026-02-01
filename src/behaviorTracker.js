// Behavior Tracker: click + idle + tab (no UI)
// Integrates with Attitude brain system.

import Attitude from "./attitudeSystem.js";

const DEFAULTS = Object.freeze({
  // Click spam thresholds. Adjust to be stricter/looser.
  clickWindowMs: 2000, // time window to count clicks
  clickSpamCount: 8, // clicks within window to trigger spam
  clickSpamCooldown: 3000, // cooldown between spam penalties

  // Non-interactive click tags. Add/remove tags to tune.
  nonInteractiveTags: ["DIV", "SPAN", "P", "H1", "H2", "H3", "H4", "H5", "H6"],

  // Idle thresholds (ms). Adjust as needed.
  idleWarnMs: 5000, // 5–10 seconds
  idleWarnMaxMs: 10000,
  idlePenaltyMs: 20000, // 20+ seconds

  // Idle check interval (ms).
  idleCheckEveryMs: 1000,
});
//unnesscary comment to make sure this was made by me and some of it ai but mostly i made it myself
export function createBehaviorTracker(options = {}) {
  const config = { ...DEFAULTS, ...options };

  // --- Click tracking ---
  let clickTimes = [];
  let lastSpamAt = 0;

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

    // Penalize clicks on non-interactive elements.
    const target = event.target;
    const tag = target && target.tagName ? target.tagName : "";
    const isNonInteractiveTag = config.nonInteractiveTags.includes(tag);
    if (isNonInteractiveTag && !isInteractiveElement(target)) {
      Attitude.changeScore(-1, "That wasn’t interactive");
    }
  }

  // --- Idle tracking ---
  let lastActivityAt = performance.now();
  let idleWarned = false;
  let idlePenalized = false;
  let idleTimer = null;

  function markActivity() {
    lastActivityAt = performance.now();
    idleWarned = false;
    idlePenalized = false;
  }

  function checkIdle() {
    const now = performance.now();
    const idleMs = now - lastActivityAt;

    // Idle 5–10 seconds → deduct 1 point.
    if (!idleWarned && idleMs >= config.idleWarnMs && idleMs <= config.idleWarnMaxMs) {
      idleWarned = true;
      Attitude.changeScore(-1, "Thinking?");
    }

    // Idle 20+ seconds → deduct 2 points.
    if (!idlePenalized && idleMs >= config.idlePenaltyMs) {
      idlePenalized = true;
      Attitude.changeScore(-2, "You left, didn’t you");
    }
  }

  function startIdleTracking() {
    idleTimer = setInterval(checkIdle, config.idleCheckEveryMs);
    window.addEventListener("mousemove", markActivity, { passive: true });
    window.addEventListener("keydown", markActivity);
    window.addEventListener("mousedown", markActivity, { passive: true });
    window.addEventListener("touchstart", markActivity, { passive: true });
  }

  function stopIdleTracking() {
    if (idleTimer) {
      clearInterval(idleTimer);
      idleTimer = null;
    }
    window.removeEventListener("mousemove", markActivity);
    window.removeEventListener("keydown", markActivity);
    window.removeEventListener("mousedown", markActivity);
    window.removeEventListener("touchstart", markActivity);
  }

  // --- Tab visibility tracking ---
  let tabSwitchCount = 0;

  function onVisibilityChange() {
    if (document.visibilityState === "hidden") {
      tabSwitchCount += 1;
      if (tabSwitchCount === 1) {
        Attitude.changeScore(-3, "Multitasking. Brave.");
      } else if (tabSwitchCount === 2) {
        Attitude.changeScore(-3, "I’ll wait");
      }
    }
  }

  function start() {
    // Click tracking
    document.addEventListener("click", onClick, { passive: true });

    // Idle tracking
    startIdleTracking();

    // Tab visibility tracking
    document.addEventListener("visibilitychange", onVisibilityChange);
  }

  function stop() {
    document.removeEventListener("click", onClick);
    stopIdleTracking();
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }

  return {
    start,
    stop,
  };
}

export default createBehaviorTracker;
