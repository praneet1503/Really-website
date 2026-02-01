// Judgment messages used by UI helpers.

export const JUDGMENT_MESSAGES = Object.freeze([
  "…",
  "Interesting choice.",
  "Bold.",
  "Sure.",
  "I’ll allow it.",
  "That’s a take.",
  "We’re just going to scroll past that, huh?",
  "Cool. Cool cool cool.",
]);

export function createMessageRotator(messages = JUDGMENT_MESSAGES) {
  let index = 0;
  return {
    next() {
      const msg = messages[index % messages.length];
      index += 1;
      return msg;
    },
    random() {
      const i = Math.floor(Math.random() * messages.length);
      return messages[i];
    },
  };
}

export function getRandomJudgmentMessage() {
  return createMessageRotator().random();
}

export function getNextJudgmentMessage() {
  return createMessageRotator().next();
}
