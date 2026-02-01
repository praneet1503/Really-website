// Scroll Behavior Tracker: integrates with Attitude brain system (no UI)
// Tracks scroll speed and scroll depth vs. time.

import Attitude from "./attitudeSystem.js";

const DEFAULTS = Object.freeze({
  // Speed thresholds (px/ms). Adjust these to be stricter or more forgiving.
  // Example: 1.2 px/ms = 1200 px/s (pretty fast).
  fastSpeed: 1.2,
  // Example: 0.2 px/ms = 200 px/s (calm reading).
  calmSpeed: 0.2,

  // Minimum distance (px) to treat a scroll as meaningful.
  minDistance: 120,

  // Cooldowns (ms) to avoid score spam.
  fastCooldown: 2000,
  calmCooldown: 3000,

  // Ultra-fast scroll-to-bottom threshold (ms).
  // Adjust to tighten or loosen "Bold assumption" detection.
  ultraFastBottomMs: 2000,
});

export function createScrollBehaviorTracker(options = {}) {
  const config = { ...DEFAULTS, ...options };

  let lastY = window.scrollY || 0;
  let lastTime = performance.now();
  let maxDepth = 0;
  let sessionStart = lastTime;

  let lastFastAt = 0;
  let lastCalmAt = 0;
  let ultraFastTriggered = false;

  function getScrollDepth() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const scrollHeight = doc.scrollHeight || 0;
    const clientHeight = doc.clientHeight || window.innerHeight || 1;
    const depth = scrollHeight - clientHeight > 0
      ? scrollTop / (scrollHeight - clientHeight)
      : 0;
    return Math.max(0, Math.min(1, depth));
  }

  function getMetrics() {
    const now = performance.now();
    const elapsedMs = now - sessionStart;
    return {
      maxDepth,
      elapsedMs,
    };
  }

  function onScroll() {
    const now = performance.now();
    const currentY = window.scrollY || 0;
    const distance = Math.abs(currentY - lastY);
    const deltaMs = Math.max(1, now - lastTime);
    const speed = distance / deltaMs;

    // Track scroll depth vs. time.
    const depth = getScrollDepth();
    if (depth > maxDepth) maxDepth = depth;

    // Ignore tiny movements to reduce noise.
    if (distance >= config.minDistance) {
      if (speed >= config.fastSpeed && now - lastFastAt > config.fastCooldown) {
        lastFastAt = now;
        Attitude.changeScore(-2, "Scrolls too fast");
      } else if (speed <= config.calmSpeed && now - lastCalmAt > config.calmCooldown) {
        lastCalmAt = now;
        Attitude.changeScore(1, "Reads calmly");
      }
    }

    // Ultra-fast scroll to bottom detection.
    // Adjust ultraFastBottomMs in config to change strictness.
    if (!ultraFastTriggered) {
      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight || 0;
      const clientHeight = doc.clientHeight || window.innerHeight || 0;
      const atBottom = currentY + clientHeight >= scrollHeight - 2;

      if (atBottom && now - sessionStart <= config.ultraFastBottomMs) {
        ultraFastTriggered = true;
        Attitude.changeScore(-2, "Bold assumption");
      }
    }

    lastY = currentY;
    lastTime = now;
  }

  function start() {
    sessionStart = performance.now();
    lastTime = sessionStart;
    lastY = window.scrollY || 0;
    maxDepth = getScrollDepth();
    ultraFastTriggered = false;
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function stop() {
    window.removeEventListener("scroll", onScroll);
  }

  return {
    start,
    stop,
    getMetrics,
  };
}

export default createScrollBehaviorTracker;
