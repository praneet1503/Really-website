// Behavior System: wires all behavior trackers together.
// Easy to add/remove modules.

import { createScrollBehaviorTracker } from "./scrollBehavior.js";
import { createClickBehaviorTracker } from "./clickBehavior.js";
import { createIdleBehaviorTracker } from "./idleBehavior.js";
import { createTabBehaviorTracker } from "./tabBehavior.js";
import { createResizeBehaviorTracker } from "./resizeBehavior.js";

export function createBehaviorSystem(options = {}) {
  const scroll = createScrollBehaviorTracker(options.scroll);
  const click = createClickBehaviorTracker(options.click);
  const idle = createIdleBehaviorTracker(options.idle);
  const tab = createTabBehaviorTracker(options.tab);
  const resize = createResizeBehaviorTracker(options.resize);

  function start() {
    scroll.start();
    click.start();
    idle.start();
    tab.start();
    resize.start();
  }

  function stop() {
    scroll.stop();
    click.stop();
    idle.stop();
    tab.stop();
    resize.stop();
  }

  return {
    start,
    stop,
    modules: {
      scroll,
      click,
      idle,
      tab,
      resize,
    },
  };
}

export default createBehaviorSystem;
