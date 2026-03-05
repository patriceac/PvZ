export const CANVAS = {
  width: 1280,
  height: 720
};

export const BOARD = {
  rows: 5,
  cols: 9,
  x: 220,
  y: 140,
  cellWidth: 92,
  cellHeight: 96
};

export const HOUSE = {
  x: BOARD.x - 94
};

export const MOWER = {
  startX: BOARD.x - 70,
  triggerX: BOARD.x - 18,
  speed: 640
};

export const GAME = {
  fixedStepMs: 1000 / 60,
  maxFrameDeltaMs: 250,
  startingSun: 150,
  sunCap: 9990,
  laneProjectileHitRadius: 24
};

export const SUN = {
  value: 25,
  skyDropIntervalMs: 7000,
  skyFallSpeed: 120,
  flowerRiseSpeed: 72,
  lifetimeMs: 10000
};

export const PROJECTILE = {
  cullX: CANVAS.width + 120
};

export const DIFFICULTY = {
  normal: {
    id: "normal",
    label: "Normal",
    hpMultiplier: 1,
    speedMultiplier: 1,
    timelineMultiplier: 1,
    startingSun: 150
  },
  hard: {
    id: "hard",
    label: "Hard",
    hpMultiplier: 1.2,
    speedMultiplier: 1.15,
    timelineMultiplier: 0.86,
    startingSun: 125
  },
  smoke: {
    id: "smoke",
    label: "Smoke",
    hpMultiplier: 0.8,
    speedMultiplier: 0.9,
    timelineMultiplier: 0.55,
    startingSun: 350
  }
};

export const PLANT_ORDER = [
  "sunflower",
  "peashooter",
  "wallnut",
  "potato_mine",
  "repeater",
  "cherry_bomb"
];

export const PLANT_DEFS = {
  sunflower: {
    id: "sunflower",
    name: "Sunflower",
    cardSymbol: "SF",
    cost: 50,
    cooldownMs: 5000,
    maxHp: 300,
    spriteKey: "plant_sunflower",
    sunIntervalMs: 9000
  },
  peashooter: {
    id: "peashooter",
    name: "Peashooter",
    cardSymbol: "PS",
    cost: 100,
    cooldownMs: 7500,
    maxHp: 300,
    spriteKey: "plant_peashooter",
    shootIntervalMs: 1450,
    shotsPerVolley: 1,
    projectileDamage: 20
  },
  wallnut: {
    id: "wallnut",
    name: "Wall-nut",
    cardSymbol: "WN",
    cost: 50,
    cooldownMs: 20000,
    maxHp: 4000,
    spriteKey: "plant_wallnut_healthy"
  },
  potato_mine: {
    id: "potato_mine",
    name: "Potato Mine",
    cardSymbol: "PM",
    cost: 25,
    cooldownMs: 20000,
    maxHp: 300,
    spriteKey: "plant_potato_unarmed",
    armTimeMs: 12000,
    mineDamage: 1800,
    mineRadius: 105
  },
  repeater: {
    id: "repeater",
    name: "Repeater",
    cardSymbol: "RP",
    cost: 200,
    cooldownMs: 8000,
    maxHp: 300,
    spriteKey: "plant_repeater",
    shootIntervalMs: 1550,
    shotsPerVolley: 2,
    projectileDamage: 20
  },
  cherry_bomb: {
    id: "cherry_bomb",
    name: "Cherry Bomb",
    cardSymbol: "CB",
    cost: 150,
    cooldownMs: 35000,
    maxHp: 300,
    spriteKey: "plant_cherry",
    fuseTimeMs: 1200,
    blastDamage: 3600,
    blastRadius: 170
  }
};

export const ZOMBIE_DEFS = {
  basic: {
    id: "basic",
    name: "Basic",
    maxHp: 270,
    armor: 0,
    speed: 18,
    biteDamage: 20,
    biteIntervalMs: 1000
  },
  conehead: {
    id: "conehead",
    name: "Conehead",
    maxHp: 270,
    armor: 370,
    speed: 16,
    biteDamage: 20,
    biteIntervalMs: 1000
  },
  buckethead: {
    id: "buckethead",
    name: "Buckethead",
    maxHp: 270,
    armor: 1100,
    speed: 14,
    biteDamage: 20,
    biteIntervalMs: 1000
  },
  fast: {
    id: "fast",
    name: "Fast",
    maxHp: 200,
    armor: 0,
    speed: 30,
    biteDamage: 16,
    biteIntervalMs: 900
  },
  heavy: {
    id: "heavy",
    name: "Heavy",
    maxHp: 500,
    armor: 800,
    speed: 10,
    biteDamage: 30,
    biteIntervalMs: 1100
  }
};

export const PROJECTILE_DEFS = {
  pea: {
    id: "pea",
    spriteKey: "projectile_pea",
    speed: 325,
    damage: 20
  }
};

export const RENDER_THEME = {
  skyTop: "#a8d9ff",
  skyBottom: "#d8f0ff",
  grassLight: "#88c85a",
  grassDark: "#6fb149",
  laneLine: "rgba(35, 71, 25, 0.35)",
  dirt: "#8f6d47",
  house: "#d2cab8"
};
