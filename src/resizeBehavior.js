// Resize Behavior Tracker (optional placeholder).
// Add logic later if you want to judge resizing habits.

export function createResizeBehaviorTracker() {
  function onResize() {
    // Example: Attitude.changeScore(-1, "Fidgety resizer")
    // Adjust thresholds here if you implement scoring.
  }

  function start() {
    window.addEventListener("resize", onResize, { passive: true });
  }

  function stop() {
    window.removeEventListener("resize", onResize);
  }

  return {
    start,
    stop,
  };
}

export default createResizeBehaviorTracker;
