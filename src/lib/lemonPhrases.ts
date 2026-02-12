const LEMON_PHRASES = [
  "Squeeze the day! 🍋",
  "When life gives you lemons, take a shot! 🍋",
  "Stay zesty, stay focused 🍋",
  "One slice at a time 🍋",
  "Fresh squeeze loading… 🍋",
  "Make it count, make it zesty 🍋",
  "Sour power activated 🍋",
  "Life's better with a twist 🍋",
  "Peel back distractions 🍋",
  "Keep it fresh, keep it sharp 🍋",
  "Zest mode: ON 🍋",
  "Drop by drop, shot by shot 🍋",
  "Your daily dose of focus 🍋",
  "Citrus-powered productivity 🍋",
  "No pulp, pure focus 🍋",
  "Time to get juicy 🍋",
  "Freshly squeezed motivation 🍋",
  "A little sour, a lot of power 🍋",
  "Slice through your tasks 🍋",
  "Vitamin Focus, served fresh 🍋",
];

let lastIndex = -1;

export function getRandomPhrase(): string {
  let index: number;
  do {
    index = Math.floor(Math.random() * LEMON_PHRASES.length);
  } while (index === lastIndex && LEMON_PHRASES.length > 1);
  lastIndex = index;
  return LEMON_PHRASES[index];
}
