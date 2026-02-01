// Tab Behavior Tracker: watches visibility changes.
// Integrates with Attitude brain system.

import Attitude from "./attitudeSystem.js";

export function createTabBehaviorTracker() {
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
    document.addEventListener("visibilitychange", onVisibilityChange);
  }

  function stop() {
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }

  return {
    start,
    stop,
  };
}

export default createTabBehaviorTracker;
