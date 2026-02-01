import Attitude from "./src/attitudeSystem.js";
import createBehaviorSystem from "./src/behaviorSystem.js";
import createAttitudeUI from "./src/uiAttitude.js";
import initCartoonUI from "./src/cartoonAnimations.js";
import initFlavortownUI from "./src/flavortownUI.js";

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

// Cartoon animations + parallax + typewriter effects.
initCartoonUI();

// Flavortown aesthetic + mascot mood reactions.
initFlavortownUI();

// Optional: expose Attitude for quick console testing.
window.Attitude = Attitude;

// Visible debug panel wiring (helps confirm reactions).
const scoreEl = document.getElementById("debug-score");
const levelEl = document.getElementById("debug-level");
const reasonEl = document.getElementById("debug-reason");
const statusEl = document.getElementById("debug-status");
const toastEl = document.getElementById("attitude-toast");
let toastTimer = null;
const suspiciousButton = document.getElementById("suspicious-button");
const politeButton = document.getElementById("polite-button");
const definitelyNotButton = document.getElementById("definitely-not-button");

if (scoreEl && levelEl && reasonEl) {
  scoreEl.textContent = String(Attitude.getScore());
  levelEl.textContent = Attitude.getLevel();
  if (statusEl) statusEl.textContent = "System online";

  Attitude.onScoreChange(({ score, reason }) => {
    scoreEl.textContent = String(score);
    if (reason) reasonEl.textContent = reason;

    if (toastEl && reason) {
      toastEl.textContent = reason;
      toastEl.classList.add("show");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastEl.classList.remove("show");
      }, 1200);
    }
  });

  Attitude.onLevelChange(({ level }) => {
    levelEl.textContent = level;
  });
}

if (politeButton) {
  politeButton.addEventListener("click", () => {
    Attitude.changeScore(1, "Polite click");
  });
}

if (suspiciousButton) {
  const randomReactions = [
    { delta: -1, reason: "Suspicious vibes" },
    { delta: 1, reason: "Unexpectedly wholesome" },
    { delta: -2, reason: "Too eager" },
    { delta: 2, reason: "Bold, yet acceptable" },
  ];

  suspiciousButton.addEventListener("click", () => {
    const pick = randomReactions[Math.floor(Math.random() * randomReactions.length)];
    Attitude.changeScore(pick.delta, pick.reason);
  });
}

if (definitelyNotButton) {
  definitelyNotButton.addEventListener("change", () => {
    Attitude.changeScore(-1, "Still not a button");
  });
}

window.addEventListener("error", (event) => {
  if (statusEl) statusEl.textContent = `Error: ${event.message}`;
});

window.addEventListener("unhandledrejection", (event) => {
  if (statusEl) statusEl.textContent = `Promise error: ${event.reason}`;
});
