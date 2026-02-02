# …Really? Attitude Monitor

A playful judgment-themed landing page that watches your every move with a Flavortown-style cartoon vibe while tracking how respectful (or not) you are toward the experience.

## Features
- Behavior tracking sensor suite that watches scroll speed/depth, click patterns, idle time, tab focus, and even window resizes so the page can react to every little impulse.
- Attitude tiers that climb from Neutral → Respectful → Disappointed → Judgy → Done With You, complete with a scoring brain, level hooks, and progressively sassier messages.
- Animated judgment messages with typewriter flair plus bounce, pop, and shake motion helpers that lean into the cartoons-and-flares tone.
- Cartoonish mascot reactions that change expressions, dance, wink, and glow based on how well you behave.
- Dynamic Flavortown UI moods that shift colors, layouts, cursor delays, and motion weights whenever Attitude changes its mind.
- Easter eggs for secret scroll combos, click streaks, high-score windows, and bonus "good ending" celebrations, with reset hooks and a stats-ready API for future utility screens.

## Tech Stack
- Vanilla HTML, CSS, and ES modules-driven JavaScript in the browser.
- No backend required; all behavior lives in the client and in modular scripts under `src/`.
- Lightweight animation helpers (typewriter, parallax, pop/shake/bounce utilities) augment the experience without frameworks.

## Installation & Local Run
1. Clone the repo: `git clone https://github.com/your-org/really-website.git` and `cd really-website`.
2. Open `index.html` in your favorite browser (no build step needed).
3. Optional scripts like `main.js` and the attitude modules just rely on browser ES module support; no extra npm packages are required unless you add tooling.

## File Structure
- [index.html](index.html): entry markup for the hero, scroll zone, control buttons, mascot shell, debug panel, and judgment message target.
- [style.css](style.css) plus the themed companions (`cartoon.css`, `flavortown.css`, `mascot.css`, `judgment.css`, `moodLayout.css`) define the palette, animations, mascot art, and layout rhythm.
- [main.js](main.js): boots the behavior system, ties Attitude to the UI/mood modules, wires debug hooks, and exposes `EasterEggs`/`Attitude` for exploration.
- [src/messages.js](src/messages.js): catalog of judgment text categorized by behavior types plus secret endings.
- [src/](src/): the behavior sensors (`scrollBehavior.js`, `clickBehavior.js`, `idleBehavior.js`, `tabBehavior.js`, `resizeBehavior.js`), attitude brain (`attitudeSystem.js`), animated UI helpers, and Easter egg logic.

## Usage
- Interact with the controls: polite/suspicious buttons, the fake "Definitely not a button" dropdown, and the scroll zone to trigger the different behavior detectors.
- Scroll slowly to earn points, zip through to see the judgment bounce, click actual buttons for polite boosts, and avoid endless tab switching so Attitude doesn’t slide toward "Done With You." Idle too long and it will wonder if you left.
- Every score change pushes new judgment copy via the typewriter-driven animation, and the Attitude level determines palette swaps, cursor delays, and mascot expressions.
- Secret rewards unlock when you pair perfect scroll depth, click streaks, high scores, or the FLAVOR key combo; confetti, mascot dances, glow effects, and a "good ending" overlay celebrate the behavior.

## Contributing
Feel free to dive into the modular scripts under `src/` to tweak messages, instrumentation, or animations; separating behaviors, attitude logic, and UI helpers makes adding new detectors, moods, or Easter eggs straightforward.

## Known Issues & Future Improvements
- `resizeBehavior.js` is a stub; add actual scoring or mood cues for resizing antics.
- A dedicated stats/relationship reset UI could consume `Attitude.resetScore` and `EasterEggs.resetEasterEggs` to give visitors a sense of their journey.
- More mascot animations and mood layouts could enhance the playful vibe.

