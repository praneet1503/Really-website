// Mascot Reactions Module
// HTML target: <div id="mascot"></div>
// This module injects simple mascot markup if #mascot is empty.

import Attitude from "./attitudeSystem.js";

const DEFAULTS = Object.freeze({
  reduceMotion: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

function ensureMascotMarkup(container) {
  if (!container) return;
  if (container.children.length > 0) return;

  container.innerHTML = `
    <div class="mascot-face">
      <span class="mascot-brow left"></span>
      <span class="mascot-brow right"></span>
      <span class="mascot-eye left"></span>
      <span class="mascot-eye right"></span>
      <span class="mascot-mouth"></span>
      <span class="mascot-shoulders"></span>
    </div>
  `;
}

function setMascotLevel(container, level) {
  if (!container) return;
  container.dataset.level = level;
}

export function initMascotReactions(options = {}) {
  const config = { ...DEFAULTS, ...options };
  const container = document.getElementById("mascot");
  if (!container) return { setLevel: () => {} };

  ensureMascotMarkup(container);
  if (config.reduceMotion) container.classList.add("mascot-reduce-motion");

  function runAnimation(level) {
    setMascotLevel(container, level);
  }

  // Initial state
  runAnimation(Attitude.getLevel());

  // Hook: update on Attitude changes
  Attitude.onLevelChange(({ level }) => {
    runAnimation(level);
  });

  return {
    setLevel: (level) => runAnimation(level),
  };
}

export default initMascotReactions;
