// Central message catalog for behavior-aware judgment text.

export const messages = Object.freeze({
  scroll: [
    "That was fast.",
    "You skimmed.",
    "Impressive confidence.",
    "Handle that scrollbar like a pro.",
  ],
  click: [
    "That wasn't interactive.",
    "Interesting choice.",
    "You're guessing.",
    "Polite clicks never go unnoticed.",
    "Click with purpose.",
    "Every click counts.",
    "Careful where you click.",
  ],
  idle: [
    "Still here?",
    "I'll wait.",
    "Any moment now.",
    "Blinking cursor is still watching.",
    "Thinking is good.",
    "Did you step away?",
    "Lost in thought?",
    "I'm patient, but not forever.",
  ],
  tab: [
    "Welcome back.",
    "That didn't take long.",
    "As expected.",
    "Two tabs but only one focus?",
    "Multitasking, are we?",
    "I see you switched tabs.",
    "Don't worry, I'll be here when you return.",
  ],
  endState: [
    "I've adjusted my expectations.",
    "We're done pretending.",
    "It's fine.",
    "Let's call it a day.",
  ],
  secret: [
    "Wow, look at you behaving!",
    "You're making me proud.",
    "Exceptional patience detected.",
    "Respectful scrolls only.",
  ],
});

const DEFAULT_CATEGORY = "scroll";

export const messageCategories = Object.freeze(Object.keys(messages));

export function getRandomMessage(category = DEFAULT_CATEGORY) {
  const bucket = messages[category];
  if (!Array.isArray(bucket) || bucket.length === 0) {
    const fallback = messages[DEFAULT_CATEGORY];
    const index = Math.floor(Math.random() * fallback.length);
    return fallback[index];
  }
  const index = Math.floor(Math.random() * bucket.length);
  return bucket[index];
}
