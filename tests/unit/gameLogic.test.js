import { describe, expect, test } from "vitest";
import { HOUSE, PLANT_DEFS, SUN } from "../../src/game/constants.js";
import { applyDamageToZombie, spawnZombieForDebug, stepGameState } from "../../src/game/logic.js";
import { createInitialState } from "../../src/game/state.js";
import { loadWaves } from "../../src/game/waves.js";

function runningState({ difficulty = "smoke", waves = loadWaves("smoke") } = {}) {
  const state = createInitialState({
    difficulty,
    waves,
    seed: 42
  });
  state.status = "running";
  return state;
}

describe("sun economy and spending", () => {
  test("spawns sky sun, collects it, and spends on a plant", () => {
    const state = runningState();
    const originalSun = state.sun;

    stepGameState(state, [], SUN.skyDropIntervalMs, {});
    expect(state.suns.length).toBeGreaterThan(0);

    const firstSun = state.suns[0];
    stepGameState(state, [{ type: "collectSun", sunId: firstSun.id }], 0, {});
    expect(state.sun).toBe(originalSun + SUN.value);

    stepGameState(
      state,
      [
        { type: "selectPlant", plantId: "sunflower" },
        { type: "plantAt", row: 0, col: 0 }
      ],
      0,
      {}
    );
    expect(state.plants.length).toBe(1);
    expect(state.sun).toBe((originalSun + SUN.value) - PLANT_DEFS.sunflower.cost);
  });
});

describe("planting validation", () => {
  test("rejects occupied tiles and cooldown violations", () => {
    const state = runningState();
    state.sun = 1000;

    stepGameState(
      state,
      [
        { type: "selectPlant", plantId: "peashooter" },
        { type: "plantAt", row: 0, col: 0 }
      ],
      0,
      {}
    );

    stepGameState(
      state,
      [
        { type: "plantAt", row: 0, col: 0 },
        { type: "plantAt", row: 0, col: 1 }
      ],
      0,
      {}
    );

    expect(state.plants.length).toBe(1);
  });
});

describe("projectile and zombie damage", () => {
  test("projectiles collide and kill zombie entities", () => {
    const state = runningState({ waves: [] });
    state.sun = 1000;

    stepGameState(
      state,
      [
        { type: "selectPlant", plantId: "peashooter" },
        { type: "plantAt", row: 0, col: 0 }
      ],
      0,
      {}
    );

    const zombie = spawnZombieForDebug(state, "basic", 0, 420);
    expect(zombie).not.toBeNull();
    zombie.speed = 0;
    for (let i = 0; i < 500; i += 1) {
      stepGameState(state, [], 1000 / 60, {});
      if (state.zombies.length === 0) {
        break;
      }
    }
    expect(state.zombies.length).toBe(0);
  });

  test("applies armor before hp and reaches death state", () => {
    const state = runningState({ waves: [] });
    const zombie = spawnZombieForDebug(state, "buckethead", 0, 600);
    expect(zombie).not.toBeNull();
    zombie.speed = 0;

    applyDamageToZombie(zombie, 100);
    expect(zombie.armor).toBeLessThan(zombie.maxArmor);
    expect(zombie.hp).toBe(zombie.maxHp);

    applyDamageToZombie(zombie, zombie.maxArmor + zombie.maxHp + 1);
    expect(zombie.dead).toBe(true);
    stepGameState(state, [], 16, {});
    expect(state.zombies.length).toBe(0);
  });
});

describe("mowers", () => {
  test("activate per lane and only clear their own lane", () => {
    const state = runningState({ waves: [] });
    const lane0 = spawnZombieForDebug(state, "basic", 0, 194);
    const lane1 = spawnZombieForDebug(state, "basic", 1, 900);
    expect(lane0).not.toBeNull();
    expect(lane1).not.toBeNull();

    for (let i = 0; i < 240; i += 1) {
      stepGameState(state, [], 1000 / 60, {});
    }

    const lane0Alive = state.zombies.some((zombie) => zombie.lane === 0);
    const lane1Alive = state.zombies.some((zombie) => zombie.lane === 1);
    expect(lane0Alive).toBe(false);
    expect(lane1Alive).toBe(true);
  });
});

describe("wave and outcome transitions", () => {
  test("marks game as won once all waves spawn and zombies are gone", () => {
    const state = runningState({
      waves: [{ timeMs: 1, lane: 2, zombieType: "basic", flag: true }]
    });
    stepGameState(state, [], 20, {});
    expect(state.waveCursor).toBe(1);
    state.zombies.length = 0;
    stepGameState(state, [], 16, {});
    expect(state.status).toBe("won");
  });

  test("marks game as lost when zombie reaches house and mower is spent", () => {
    const state = runningState({ waves: [] });
    for (const mower of state.mowers) {
      mower.state = "spent";
    }
    spawnZombieForDebug(state, "basic", 0, HOUSE.x - 2);
    stepGameState(state, [], 16, {});
    expect(state.status).toBe("lost");
  });
});
