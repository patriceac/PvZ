import { BOARD, DIFFICULTY, GAME, MOWER, PLANT_ORDER, SUN } from "./constants.js";
import { createRng } from "./rng.js";

function createMowers() {
  return Array.from({ length: BOARD.rows }, (_, lane) => ({
    id: `mower_${lane}`,
    lane,
    x: MOWER.startX,
    state: "idle"
  }));
}

function createCooldownState() {
  const map = {};
  for (const plantId of PLANT_ORDER) {
    map[plantId] = 0;
  }
  return map;
}

export function createInitialState({ difficulty = "normal", waves, seed = 1337, cheatPlanting = false }) {
  const difficultyConfig = DIFFICULTY[difficulty] ?? DIFFICULTY.normal;
  const flags = waves.filter((entry) => entry.flag).length;
  return {
    difficulty: difficultyConfig.id,
    status: "menu",
    nowMs: 0,
    lastId: 0,
    rng: createRng(seed),
    waves,
    waveCursor: 0,
    flagsTriggered: 0,
    totalFlags: flags,
    sun: difficultyConfig.startingSun ?? GAME.startingSun,
    sunCap: GAME.sunCap,
    skySunTimerMs: SUN.skyDropIntervalMs,
    selectedPlantId: null,
    plants: [],
    zombies: [],
    projectiles: [],
    suns: [],
    effects: [],
    mowers: createMowers(),
    cooldownEnds: createCooldownState(),
    actionQueue: [],
    overlay: {
      title: "Backyard Defense",
      text: "Press Start to begin.",
      actionLabel: "Start Match",
      visible: true
    },
    debug: {
      cheatPlanting
    }
  };
}

export function nextId(state, prefix) {
  state.lastId += 1;
  return `${prefix}_${state.lastId}`;
}
