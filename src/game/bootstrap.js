import { GameApp } from "./GameApp.js";

let app = null;
let appInitPromise = null;

async function ensureApp(dom) {
  if (!app) {
    if (!dom) {
      throw new Error("startGame requires dom refs on first call.");
    }
    app = new GameApp(dom);
    appInitPromise = app.init();
  }
  if (appInitPromise) {
    await appInitPromise;
    appInitPromise = null;
  }
  return app;
}

export async function startGame(config = {}) {
  const instance = await ensureApp(config.dom);
  return instance.start(config);
}

export async function prepareMenu(config = {}) {
  const instance = await ensureApp(config.dom);
  instance.prepareMenu(config.difficulty ?? "normal");
}

export function resetGame() {
  if (!app) {
    return;
  }
  app.reset();
}

export function togglePause() {
  if (!app) {
    return;
  }
  app.togglePause();
}

export function forceLoseForTest() {
  if (!app) {
    return;
  }
  app.forceLoseScenario();
}

export function getGameSnapshot() {
  if (!app) {
    return null;
  }
  return app.getSnapshot();
}
