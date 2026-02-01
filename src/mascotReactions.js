// Mascot Reactions Module
// HTML target: <div id="mascot"></div>
// This module injects simple mascot markup if #mascot is empty.

import Attitude from "./attitudeSystem.js";
import anime from "animejs";

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

function animateNeutral(parts, reduceMotion) {
  if (reduceMotion) return;
  anime.remove(parts.face);
  anime({
    targets: parts.face,
    translateY: [0, -3],
    duration: 1200,
    direction: "alternate",
    easing: "easeInOutSine",
    loop: true,
  });
}

function animateDisappointed(parts, reduceMotion) {
  if (reduceMotion) return;
  anime.remove([parts.face, parts.mouth, parts.shoulders]);
  anime({
    targets: parts.face,
    translateY: 2,
    duration: 300,
    easing: "easeOutQuad",
  });
  anime({
    targets: parts.mouth,
    scaleX: 0.7,
    duration: 300,
    easing: "easeOutQuad",
  });
  anime({
    targets: parts.shoulders,
    translateY: 3,
    duration: 300,
    easing: "easeOutQuad",
  });
}

function animateJudgy(parts, reduceMotion) {
  if (reduceMotion) return;
  anime.remove([parts.face, parts.eyes, parts.brows]);
  anime({
    targets: parts.eyes,
    scaleY: 0.6,
    duration: 250,
    easing: "easeOutQuad",
  });
  anime({
    targets: parts.face,
    translateX: [0, -2, 2, -1, 1, 0],
    duration: 450,
    easing: "easeInOutSine",
  });
}

function animateDoneWithYou(parts, reduceMotion) {
  if (reduceMotion) return;
  anime.remove([parts.face, parts.shoulders]);
  anime({
    targets: parts.face,
    translateY: 4,
    opacity: 0.6,
    duration: 400,
    easing: "easeOutQuad",
  });
  anime({
    targets: parts.shoulders,
    translateY: 4,
    duration: 400,
    easing: "easeOutQuad",
  });
}

export function initMascotReactions(options = {}) {
  const config = { ...DEFAULTS, ...options };
  const container = document.getElementById("mascot");
  if (!container) return { setLevel: () => {} };

  ensureMascotMarkup(container);
  if (config.reduceMotion) container.classList.add("mascot-reduce-motion");

  const parts = {
    face: container.querySelector(".mascot-face"),
    eyes: container.querySelectorAll(".mascot-eye"),
    brows: container.querySelectorAll(".mascot-brow"),
    mouth: container.querySelector(".mascot-mouth"),
    shoulders: container.querySelector(".mascot-shoulders"),
  };

  function runAnimation(level) {
    setMascotLevel(container, level);
    if (level === "Disappointed") return animateDisappointed(parts, config.reduceMotion);
    if (level === "Judgy") return animateJudgy(parts, config.reduceMotion);
    if (level === "Done With You") return animateDoneWithYou(parts, config.reduceMotion);
    return animateNeutral(parts, config.reduceMotion);
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
