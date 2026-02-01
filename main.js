import Attitude from "./src/attitudeSystem.js";
import createBehaviorSystem from "./src/behaviorSystem.js";
import createAttitudeUI from "./src/uiAttitude.js";

// Start the behavior sensors (scroll, click, idle, tab, resize).
const behaviorSystem = createBehaviorSystem();
behaviorSystem.start();

// Start UI mood syncing with Attitude level.
const ui = createAttitudeUI({
  messageTargetSelector: "#judgment-message",
  enableMessages: true,
  updateMessageOnLevelChange: true,
});
ui.init();

// Optional: expose Attitude for quick console testing.
window.Attitude = Attitude;

// Visible debug panel wiring (helps confirm reactions).
const scoreEl = document.getElementById("debug-score");
const levelEl = document.getElementById("debug-level");
const reasonEl = document.getElementById("debug-reason");
const statusEl = document.getElementById("debug-status");
const testButton = document.getElementById("test-reaction");

if (scoreEl && levelEl && reasonEl) {
  scoreEl.textContent = String(Attitude.getScore());
  levelEl.textContent = Attitude.getLevel();
  if (statusEl) statusEl.textContent = "System online";

  Attitude.onScoreChange(({ score, reason }) => {
    scoreEl.textContent = String(score);
    if (reason) reasonEl.textContent = reason;
  });

  Attitude.onLevelChange(({ level }) => {
    levelEl.textContent = level;
  });
}

if (testButton) {
  testButton.addEventListener("click", () => {
    Attitude.changeScore(1, "Test ping");
  });
}

window.addEventListener("error", (event) => {
  if (statusEl) statusEl.textContent = `Error: ${event.message}`;
});

window.addEventListener("unhandledrejection", (event) => {
  if (statusEl) statusEl.textContent = `Promise error: ${event.reason}`;
});
