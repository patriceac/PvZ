import {
  forceLoseForTest,
  getGameSnapshot,
  prepareMenu,
  resetGame,
  startGame,
  togglePause
} from "./game/bootstrap.js";
import { getDefaultSettings, getSettingsKey, loadSettings, saveSettings } from "./game/settings.js";

const dom = {
  canvas: document.getElementById("game-canvas"),
  seedBank: document.getElementById("seed-bank"),
  sunCount: document.getElementById("sun-count"),
  waveStatus: document.getElementById("wave-status"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayText: document.getElementById("overlay-text"),
  overlayAction: document.getElementById("overlay-action"),
  startButton: document.getElementById("start-button"),
  pauseButton: document.getElementById("pause-button"),
  restartButton: document.getElementById("restart-button"),
  difficultySelect: document.getElementById("difficulty-select")
};

let settings = {
  ...getDefaultSettings(),
  ...loadSettings()
};

if (dom.difficultySelect) {
  dom.difficultySelect.value = settings.difficulty;
}

function persistSettings() {
  settings = saveSettings({
    difficulty: dom.difficultySelect.value,
    muted: true
  });
}

async function startFromUi(options = {}) {
  persistSettings();
  await startGame({
    dom,
    difficulty: dom.difficultySelect.value,
    ...options
  });
  dom.pauseButton.textContent = "Pause";
}

function syncPauseButton() {
  const snapshot = getGameSnapshot();
  if (!snapshot) {
    dom.pauseButton.textContent = "Pause";
    return;
  }
  dom.pauseButton.textContent = snapshot.status === "paused" ? "Resume" : "Pause";
}

dom.startButton.addEventListener("click", () => {
  void startFromUi();
});

dom.overlayAction.addEventListener("click", () => {
  void startFromUi();
});

dom.restartButton.addEventListener("click", () => {
  resetGame();
  dom.pauseButton.textContent = "Pause";
});

dom.pauseButton.addEventListener("click", () => {
  togglePause();
  syncPauseButton();
});

dom.difficultySelect.addEventListener("change", () => {
  persistSettings();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    syncPauseButton();
  }
  if (event.key.toLowerCase() === "r") {
    resetGame();
    dom.pauseButton.textContent = "Pause";
  }
});

void prepareMenu({
  dom,
  difficulty: settings.difficulty
});

window.__PVZ_TEST_API__ = {
  settingsKey: getSettingsKey,
  getState: () => getGameSnapshot(),
  runWinSmoke: async () => {
    await startGame({
      dom,
      difficulty: "smoke",
      autoplay: "win"
    });
  },
  runForcedLose: async () => {
    await startGame({
      dom,
      difficulty: "smoke"
    });
    forceLoseForTest();
  },
  restart: () => resetGame(),
  setDifficulty: (difficulty) => {
    dom.difficultySelect.value = difficulty;
    persistSettings();
  }
};
