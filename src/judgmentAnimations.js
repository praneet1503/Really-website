// Judgment Message Animations: typewriter + bounce/shake/pop on attitude changes.
// Target element: <div id="judgment"></div>

import Attitude from "./attitudeSystem.js";
import anime from "animejs";

const DEFAULTS = Object.freeze({
  typeSpeedMs: 24,
  reduceMotion: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

let activeTimer = null;

function clearTimers() {
  if (activeTimer) {
    clearTimeout(activeTimer);
    activeTimer = null;
  }
}

function animateBounce(el, reduceMotion) {
  if (!el || reduceMotion) return;
  anime.remove(el);
  anime({
    targets: el,
    translateY: [0, -8, 0],
    duration: 500,
    easing: "easeOutQuad",
  });
}

function animateShake(el, reduceMotion) {
  if (!el || reduceMotion) return;
  anime.remove(el);
  anime({
    targets: el,
    translateX: [0, -4, 4, -2, 2, 0],
    duration: 600,
    easing: "easeInOutSine",
  });
}

function animatePop(el, reduceMotion) {
  if (!el || reduceMotion) return;
  anime.remove(el);
  anime({
    targets: el,
    scale: [1, 1.06, 1],
    duration: 450,
    easing: "easeOutBack",
  });
}

function typewriter(el, text, speedMs, reduceMotion) {
  if (!el) return;
  if (reduceMotion) {
    el.textContent = text;
    return;
  }

  let i = 0;
  el.textContent = "";
  el.classList.add("judgment-typewriter");

  const tick = () => {
    el.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) {
      requestAnimationFrame(() => setTimeout(tick, speedMs));
    } else {
      el.classList.remove("judgment-typewriter");
    }
  };

  tick();
}

export function showJudgmentMessage(msg, options = {}) {
  const config = { ...DEFAULTS, ...options };
  const el = document.getElementById("judgment");
  if (!el) return;

  clearTimers();
  typewriter(el, msg, config.typeSpeedMs, config.reduceMotion);
}

export function initJudgmentAnimations(options = {}) {
  const config = { ...DEFAULTS, ...options };
  const el = document.getElementById("judgment");
  if (!el) return { showJudgmentMessage };

  // Hook: Attitude score changes update the message text.
  Attitude.onScoreChange(({ reason }) => {
    if (!reason) return;
    showJudgmentMessage(reason, config);
  });

  // Hook: Attitude level changes trigger a text animation.
  Attitude.onLevelChange(({ level }) => {
    if (level === "Disappointed") animateShake(el, config.reduceMotion);
    else if (level === "Judgy") animateShake(el, config.reduceMotion);
    else if (level === "Done With You") animatePop(el, config.reduceMotion);
    else animateBounce(el, config.reduceMotion);
  });

  return {
    showJudgmentMessage,
  };
}

export default initJudgmentAnimations;
