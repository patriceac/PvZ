import { buildBitmapAtlas } from "../assets/atlas.js";
import { createSvgAssets } from "../assets/svgFactory.js";
import { BOARD, CANVAS, DIFFICULTY, GAME, HOUSE, PLANT_DEFS, PLANT_ORDER } from "./constants.js";
import { worldToGrid } from "./geometry.js";
import { getWaveProgress, isPointInsideBoard, isSunHit, spawnZombieForDebug, stepGameState } from "./logic.js";
import { GameRenderer } from "./renderer.js";
import { createInitialState } from "./state.js";
import { initSeedBank, showOverlay, updateHud, updateSeedBank } from "./ui.js";
import { loadWaves } from "./waves.js";

const DEFAULT_START = {
  difficulty: "normal",
  autoplay: null
};

function normalizedDifficulty(difficulty) {
  if (DIFFICULTY[difficulty]) {
    return difficulty;
  }
  return "normal";
}

function toCanvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (CANVAS.width / rect.width),
    y: (event.clientY - rect.top) * (CANVAS.height / rect.height)
  };
}

function createAutoplayScript() {
  const script = [];
  for (let lane = 0; lane < 5; lane += 1) {
    script.push({ timeMs: 200 + (lane * 120), plantId: "sunflower", row: lane, col: 0 });
    script.push({ timeMs: 1300 + (lane * 140), plantId: "repeater", row: lane, col: 2 });
    script.push({ timeMs: 2600 + (lane * 150), plantId: "repeater", row: lane, col: 3 });
  }
  script.push({ timeMs: 3300, plantId: "wallnut", row: 2, col: 1 });
  script.push({ timeMs: 4100, plantId: "cherry_bomb", row: 2, col: 4 });
  return script;
}

export class GameApp {
  constructor(dom) {
    this.dom = dom;
    this.state = null;
    this.renderer = null;
    this.atlas = null;
    this.seedCards = null;
    this.initialized = false;
    this.actions = [];
    this.accumulator = 0;
    this.lastFrameTime = 0;
    this.rafId = 0;
    this.lastStartConfig = { ...DEFAULT_START };
    this.autoplayMode = null;
    this.autoplayScript = [];
    this.autoplayCursor = 0;

    this.loop = this.loop.bind(this);
    this.handleCanvasPointer = this.handleCanvasPointer.bind(this);
  }

  async init() {
    if (this.initialized) {
      return;
    }

    const manifest = createSvgAssets();
    this.atlas = await buildBitmapAtlas(manifest);
    this.renderer = new GameRenderer(this.dom.canvas, this.atlas);
    this.seedCards = initSeedBank(this.dom.seedBank, PLANT_ORDER, PLANT_DEFS, (plantId) => {
      this.enqueueAction({ type: "selectPlant", plantId });
    });
    this.dom.canvas.addEventListener("pointerdown", this.handleCanvasPointer);

    this.initialized = true;
    this.prepareMenu("normal");
  }

  prepareMenu(difficulty) {
    const selectedDifficulty = normalizedDifficulty(difficulty);
    this.state = createInitialState({
      difficulty: selectedDifficulty,
      waves: loadWaves(selectedDifficulty),
      seed: 1337,
      cheatPlanting: false
    });
    this.state.overlay = {
      title: "Backyard Defense",
      text: "Defend the house. Collect sun, place plants, survive all scripted waves.",
      actionLabel: "Start Match",
      visible: true
    };
    this.state.status = "menu";
    this.lastStartConfig = {
      difficulty: selectedDifficulty,
      autoplay: null
    };
    this.render();
  }

  start({
    difficulty = "normal",
    autoplay = null,
    autorun = true
  } = {}) {
    const selectedDifficulty = normalizedDifficulty(difficulty);
    this.autoplayMode = autoplay;
    this.autoplayScript = autoplay === "win" ? createAutoplayScript() : [];
    this.autoplayCursor = 0;

    this.state = createInitialState({
      difficulty: selectedDifficulty,
      waves: loadWaves(selectedDifficulty),
      seed: 1337,
      cheatPlanting: autoplay === "win"
    });
    this.state.selectedPlantId = "sunflower";
    if (autoplay === "win") {
      this.state.sun = 3000;
    }

    if (autorun) {
      this.state.status = "running";
      this.state.overlay.visible = false;
    } else {
      this.state.status = "menu";
      this.state.overlay = {
        title: "Backyard Defense",
        text: "Press Start Match when ready.",
        actionLabel: "Start Match",
        visible: true
      };
    }

    this.lastStartConfig = {
      difficulty: selectedDifficulty,
      autoplay
    };

    if (!this.rafId) {
      this.lastFrameTime = 0;
      this.accumulator = 0;
      this.rafId = requestAnimationFrame(this.loop);
    }

    this.render();
    return this.getSnapshot();
  }

  reset() {
    this.start(this.lastStartConfig);
  }

  togglePause() {
    if (!this.state) {
      return;
    }
    if (this.state.status === "running") {
      this.state.status = "paused";
    } else if (this.state.status === "paused") {
      this.state.status = "running";
    }
    this.render();
  }

  forceLoseScenario() {
    if (!this.state || this.state.status !== "running") {
      return;
    }
    for (const mower of this.state.mowers) {
      mower.state = "spent";
    }
    spawnZombieForDebug(this.state, "basic", 0, HOUSE.x - 6);
  }

  enqueueAction(action) {
    if (!this.state) {
      return;
    }
    this.actions.push(action);
  }

  consumeActions() {
    if (this.actions.length === 0) {
      return [];
    }
    const next = this.actions;
    this.actions = [];
    return next;
  }

  injectAutoplayActions(actions) {
    if (this.autoplayMode !== "win") {
      return;
    }
    while (
      this.autoplayCursor < this.autoplayScript.length &&
      this.autoplayScript[this.autoplayCursor].timeMs <= this.state.nowMs
    ) {
      const item = this.autoplayScript[this.autoplayCursor];
      actions.push({ type: "selectPlant", plantId: item.plantId });
      actions.push({ type: "plantAt", row: item.row, col: item.col });
      this.autoplayCursor += 1;
    }
  }

  handleCanvasPointer(event) {
    if (!this.state || this.state.status !== "running") {
      return;
    }
    const point = toCanvasPoint(this.dom.canvas, event);

    for (const sun of this.state.suns) {
      if (isSunHit(sun, point.x, point.y)) {
        this.enqueueAction({ type: "collectSun", sunId: sun.id });
        return;
      }
    }

    if (!isPointInsideBoard(point.x, point.y)) {
      this.enqueueAction({ type: "clearSelection" });
      return;
    }

    const grid = worldToGrid(point.x, point.y);
    if (!grid) {
      return;
    }
    this.enqueueAction({ type: "plantAt", row: grid.row, col: grid.col });
  }

  syncOverlay() {
    if (!this.state) {
      return;
    }
    if (this.state.status === "running" || this.state.status === "paused") {
      showOverlay(this.dom, {
        title: this.state.overlay.title,
        text: this.state.overlay.text,
        actionLabel: this.state.overlay.actionLabel,
        visible: false
      });
      return;
    }
    showOverlay(this.dom, this.state.overlay);
  }

  render() {
    if (!this.state || !this.renderer) {
      return;
    }
    this.renderer.render(this.state);
    const waveProgress = getWaveProgress(this.state);
    updateHud(this.dom, this.state, waveProgress);
    updateSeedBank(this.seedCards, this.state, PLANT_DEFS);
    this.syncOverlay();
  }

  loop(timestamp) {
    if (!this.state) {
      this.rafId = requestAnimationFrame(this.loop);
      return;
    }
    if (!this.lastFrameTime) {
      this.lastFrameTime = timestamp;
    }

    const frameDelta = Math.min(GAME.maxFrameDeltaMs, timestamp - this.lastFrameTime);
    this.lastFrameTime = timestamp;

    if (this.state.status === "running") {
      this.accumulator += frameDelta;
      while (this.accumulator >= GAME.fixedStepMs) {
        const actions = this.consumeActions();
        this.injectAutoplayActions(actions);
        stepGameState(this.state, actions, GAME.fixedStepMs);
        this.accumulator -= GAME.fixedStepMs;
        if (this.state.status === "won" || this.state.status === "lost") {
          break;
        }
      }
    }

    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  }

  getSnapshot() {
    if (!this.state) {
      return null;
    }
    const waveProgress = getWaveProgress(this.state);
    return {
      status: this.state.status,
      difficulty: this.state.difficulty,
      sun: this.state.sun,
      wavesSpawned: waveProgress.spawned,
      totalWaves: waveProgress.total,
      plants: this.state.plants.length,
      zombies: this.state.zombies.length,
      selectedPlantId: this.state.selectedPlantId
    };
  }
}
