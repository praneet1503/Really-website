// Judgment Message Animations: typewriter + bounce/shake/pop on attitude changes.
// Target element: <div id="judgment"></div>

import Attitude from "./attitudeSystem.js";

const DEFAULTS = Object.freeze({
  typeSpeedMs: 24,
  reduceMotion: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

function setClassForDuration(el, className, durationMs = 500) {
  if (!el) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), durationMs);
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
    if (level === "Disappointed") setClassForDuration(el, "judgment-shake", 600);
    else if (level === "Judgy") setClassForDuration(el, "judgment-shake", 600);
    else if (level === "Done With You") setClassForDuration(el, "judgment-pop", 600);
    else setClassForDuration(el, "judgment-bounce", 500);
  });

  return {
    showJudgmentMessage,
  };
}

export default initJudgmentAnimations;
