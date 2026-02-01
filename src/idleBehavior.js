// Idle Behavior Tracker: monitors mouse/keyboard inactivity.
// Integrates with Attitude brain system.

import Attitude from "./attitudeSystem.js";

const DEFAULTS = Object.freeze({
  // Idle thresholds (ms). Adjust as needed.
  idleWarnMs: 5000, // 5–10 seconds
  idleWarnMaxMs: 10000,
  idlePenaltyMs: 20000, // 20+ seconds

  // Idle check interval (ms).
  idleCheckEveryMs: 1000,
});

export function createIdleBehaviorTracker(options = {}) {
  const config = { ...DEFAULTS, ...options };
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

  function start() {
    idleTimer = setInterval(checkIdle, config.idleCheckEveryMs);
    window.addEventListener("mousemove", markActivity, { passive: true });
    window.addEventListener("keydown", markActivity);
    window.addEventListener("mousedown", markActivity, { passive: true });
    window.addEventListener("touchstart", markActivity, { passive: true });
  }

  function stop() {
    if (idleTimer) {
      clearInterval(idleTimer);
      idleTimer = null;
    }
    window.removeEventListener("mousemove", markActivity);
    window.removeEventListener("keydown", markActivity);
    window.removeEventListener("mousedown", markActivity);
    window.removeEventListener("touchstart", markActivity);
  }

  return {
    start,
    stop,
  };
}

export default createIdleBehaviorTracker;
