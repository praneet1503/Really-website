// Attitude System: brain logic for judging user behavior (no UI)
// Vanilla JS, modular, easy to extend.

const listeners = {
  score: new Set(),
  level: new Set(),
};

const LEVELS = Object.freeze({
  RESPECTFUL: "Respectful",
  NEUTRAL: "Neutral",
  DISAPPOINTED: "Disappointed",
  JUDGY: "Judgy",
  DONE_WITH_YOU: "Done With You",
});

let attitudeScore = 0;
let attitudeLevel = getLevelForScore(attitudeScore);

function getLevelForScore(score) {
  if (score >= 5) return LEVELS.RESPECTFUL;
  if (score >= 1) return LEVELS.NEUTRAL;
  if (score >= -5) return LEVELS.DISAPPOINTED;
  if (score >= -9) return LEVELS.JUDGY;
  return LEVELS.DONE_WITH_YOU;
}

function emitScoreChange(payload) {
  listeners.score.forEach((fn) => fn(payload));
}

function emitLevelChange(payload) {
  listeners.level.forEach((fn) => fn(payload));
}

function changeScore(delta, reason = "") {
  const previousScore = attitudeScore;
  const previousLevel = attitudeLevel;

  attitudeScore += Number(delta) || 0;
  attitudeLevel = getLevelForScore(attitudeScore);

  emitScoreChange({
    previousScore,
    score: attitudeScore,
    delta: attitudeScore - previousScore,
    reason,
    level: attitudeLevel,
  });

  if (attitudeLevel !== previousLevel) {
    emitLevelChange({
      previousLevel,
      level: attitudeLevel,
      score: attitudeScore,
      reason,
    });
  }

  return {
    score: attitudeScore,
    level: attitudeLevel,
  };
}

function getScore() {
  return attitudeScore;
}

function getLevel() {
  return attitudeLevel;
}

function onScoreChange(handler) {
  if (typeof handler !== "function") return () => {};
  listeners.score.add(handler);
  return () => listeners.score.delete(handler);
}

function onLevelChange(handler) {
  if (typeof handler !== "function") return () => {};
  listeners.level.add(handler);
  return () => listeners.level.delete(handler);
}

function resetScore(nextScore = 0, reason = "reset") {
  const previousScore = attitudeScore;
  const previousLevel = attitudeLevel;

  attitudeScore = Number(nextScore) || 0;
  attitudeLevel = getLevelForScore(attitudeScore);

  emitScoreChange({
    previousScore,
    score: attitudeScore,
    delta: attitudeScore - previousScore,
    reason,
    level: attitudeLevel,
  });

  if (attitudeLevel !== previousLevel) {
    emitLevelChange({
      previousLevel,
      level: attitudeLevel,
      score: attitudeScore,
      reason,
    });
  }

  return {
    score: attitudeScore,
    level: attitudeLevel,
  };
}

function registerHook(type, handler) {
  if (type === "score") return onScoreChange(handler);
  if (type === "level") return onLevelChange(handler);
  return () => {};
}

const AttitudeSystem = Object.freeze({
  changeScore,
  getScore,
  getLevel,
  resetScore,
  onScoreChange,
  onLevelChange,
  registerHook,
  LEVELS,
});

export default AttitudeSystem;
export {
  changeScore,
  getScore,
  getLevel,
  resetScore,
  onScoreChange,
  onLevelChange,
  registerHook,
  LEVELS,
};
