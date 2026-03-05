import { DIFFICULTY } from "./constants.js";

const BASE_SCRIPT = [
  { timeMs: 3500, lane: 2, zombieType: "basic" },
  { timeMs: 7000, lane: 1, zombieType: "basic" },
  { timeMs: 8200, lane: 3, zombieType: "basic" },
  { timeMs: 12000, lane: 0, zombieType: "basic" },
  { timeMs: 15000, lane: 4, zombieType: "basic" },
  { timeMs: 18500, lane: 2, zombieType: "conehead" },
  { timeMs: 22500, lane: 1, zombieType: "basic" },
  { timeMs: 24400, lane: 3, zombieType: "basic" },
  { timeMs: 28500, lane: 0, zombieType: "conehead" },
  { timeMs: 32000, lane: 4, zombieType: "basic", flag: true },
  { timeMs: 33000, lane: 2, zombieType: "conehead" },
  { timeMs: 33750, lane: 1, zombieType: "basic" },
  { timeMs: 34500, lane: 3, zombieType: "basic" },
  { timeMs: 36500, lane: 0, zombieType: "conehead" },
  { timeMs: 38900, lane: 4, zombieType: "conehead" },
  { timeMs: 42000, lane: 2, zombieType: "buckethead" },
  { timeMs: 45500, lane: 0, zombieType: "fast" },
  { timeMs: 46000, lane: 4, zombieType: "fast" },
  { timeMs: 48000, lane: 2, zombieType: "basic" },
  { timeMs: 51000, lane: 1, zombieType: "conehead" },
  { timeMs: 53700, lane: 3, zombieType: "conehead" },
  { timeMs: 57500, lane: 2, zombieType: "heavy", flag: true },
  { timeMs: 58100, lane: 0, zombieType: "conehead" },
  { timeMs: 58700, lane: 4, zombieType: "conehead" },
  { timeMs: 59800, lane: 1, zombieType: "buckethead" },
  { timeMs: 60500, lane: 3, zombieType: "buckethead" },
  { timeMs: 62200, lane: 2, zombieType: "fast" },
  { timeMs: 64600, lane: 0, zombieType: "heavy" },
  { timeMs: 66200, lane: 4, zombieType: "heavy" },
  { timeMs: 67900, lane: 1, zombieType: "buckethead" },
  { timeMs: 69600, lane: 3, zombieType: "buckethead" },
  { timeMs: 71000, lane: 2, zombieType: "buckethead", flag: true }
];

const SMOKE_SCRIPT = [
  { timeMs: 1200, lane: 2, zombieType: "basic" },
  { timeMs: 2600, lane: 1, zombieType: "basic" },
  { timeMs: 3800, lane: 3, zombieType: "basic" },
  { timeMs: 5200, lane: 0, zombieType: "conehead", flag: true },
  { timeMs: 6400, lane: 4, zombieType: "conehead" },
  { timeMs: 7800, lane: 2, zombieType: "conehead" },
  { timeMs: 9100, lane: 1, zombieType: "basic" },
  { timeMs: 10400, lane: 3, zombieType: "basic" },
  { timeMs: 11900, lane: 2, zombieType: "buckethead", flag: true }
];

export function loadWaves(difficultyId = "normal") {
  const difficulty = DIFFICULTY[difficultyId] ?? DIFFICULTY.normal;
  const base = difficulty.id === "smoke" ? SMOKE_SCRIPT : BASE_SCRIPT;
  return base
    .map((entry) => ({
      ...entry,
      timeMs: Math.round(entry.timeMs * difficulty.timelineMultiplier)
    }))
    .sort((a, b) => a.timeMs - b.timeMs);
}
