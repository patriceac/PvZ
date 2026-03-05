import {
  BOARD,
  CANVAS,
  DIFFICULTY,
  GAME,
  HOUSE,
  MOWER,
  PLANT_DEFS,
  PROJECTILE,
  PROJECTILE_DEFS,
  SUN,
  ZOMBIE_DEFS
} from "./constants.js";
import { gridToWorld, laneToWorldY, inBounds } from "./geometry.js";
import { nextId } from "./state.js";

function getDifficultyConfig(state) {
  return DIFFICULTY[state.difficulty] ?? DIFFICULTY.normal;
}

function getPlantDef(plantId, plantDefs = PLANT_DEFS) {
  return plantDefs[plantId];
}

function getZombieDef(zombieType, zombieDefs = ZOMBIE_DEFS) {
  return zombieDefs[zombieType];
}

function getProjectileDef(projectileType, projectileDefs = PROJECTILE_DEFS) {
  return projectileDefs[projectileType];
}

function findPlantAt(state, row, col) {
  return state.plants.find((plant) => plant.row === row && plant.col === col && !plant.dead);
}

function getPlantDamageStage(plant) {
  if (plant.type !== "wallnut") {
    return "healthy";
  }
  const ratio = plant.hp / plant.maxHp;
  if (ratio > 0.66) {
    return "healthy";
  }
  if (ratio > 0.33) {
    return "cracked";
  }
  return "broken";
}

function getZombieDamageStage(zombie) {
  const max = zombie.maxHp + zombie.maxArmor;
  const current = Math.max(0, zombie.hp) + Math.max(0, zombie.armor);
  if (max <= 0) {
    return "critical";
  }
  const ratio = current / max;
  if (ratio > 0.66) {
    return "healthy";
  }
  if (ratio > 0.33) {
    return "damaged";
  }
  return "critical";
}

function getZombieGearStage(zombie) {
  if (zombie.maxArmor <= 0) {
    return "none";
  }
  const ratio = zombie.armor / zombie.maxArmor;
  if (ratio > 0.66) {
    return "full";
  }
  if (ratio > 0.2) {
    return "cracked";
  }
  return "none";
}

function plantSpriteKey(plant) {
  if (plant.type === "wallnut") {
    return `plant_wallnut_${getPlantDamageStage(plant)}`;
  }
  if (plant.type === "potato_mine") {
    return plant.armed ? "plant_potato_armed" : "plant_potato_unarmed";
  }
  return getPlantDef(plant.type)?.spriteKey ?? "plant_peashooter";
}

function zombieSpriteKey(zombie) {
  const action = zombie.state === "attack" ? "attack" : "walk";
  const damage = getZombieDamageStage(zombie);
  const gear = getZombieGearStage(zombie);
  return `zombie_${zombie.type}_${action}_${damage}_${gear}`;
}

function addEffect(state, effect) {
  state.effects.push({
    id: nextId(state, "effect"),
    lifeMs: effect.lifeMs,
    x: effect.x,
    y: effect.y,
    radius: effect.radius ?? 40,
    color: effect.color ?? "rgba(255, 200, 110, 0.8)"
  });
}

function spawnSun(state, { kind, x, y, targetY }) {
  state.suns.push({
    id: nextId(state, "sun"),
    kind,
    x,
    y,
    targetY,
    value: SUN.value,
    lifeMs: SUN.lifetimeMs
  });
}

function spawnSkySun(state) {
  const lane = Math.floor(state.rng() * BOARD.rows);
  const laneY = laneToWorldY(lane);
  const x = BOARD.x + (state.rng() * (BOARD.cols * BOARD.cellWidth));
  spawnSun(state, {
    kind: "sky",
    x,
    y: 58,
    targetY: laneY - 18
  });
}

export function createZombieInstance(state, zombieType, lane, xOverride = null, zombieDefs = ZOMBIE_DEFS) {
  const def = getZombieDef(zombieType, zombieDefs);
  if (!def) {
    return null;
  }
  const difficulty = getDifficultyConfig(state);
  const hp = Math.round(def.maxHp * difficulty.hpMultiplier);
  const armor = Math.round(def.armor * difficulty.hpMultiplier);
  const zombie = {
    id: nextId(state, "zombie"),
    type: zombieType,
    lane,
    x: xOverride ?? (BOARD.x + (BOARD.cols * BOARD.cellWidth) + 70),
    y: laneToWorldY(lane),
    hp,
    maxHp: hp,
    armor,
    maxArmor: armor,
    speed: def.speed * difficulty.speedMultiplier,
    biteDamage: def.biteDamage,
    biteIntervalMs: def.biteIntervalMs,
    attackTimerMs: 0,
    state: "walk",
    dead: false,
    spriteKey: ""
  };
  zombie.spriteKey = zombieSpriteKey(zombie);
  return zombie;
}

function spawnZombieFromWave(state, waveEntry, zombieDefs = ZOMBIE_DEFS) {
  const zombie = createZombieInstance(state, waveEntry.zombieType, waveEntry.lane, null, zombieDefs);
  if (!zombie) {
    return;
  }
  state.zombies.push(zombie);
  if (waveEntry.flag) {
    state.flagsTriggered += 1;
  }
}

function spawnProjectile(state, lane, x, damage, projectileDefs = PROJECTILE_DEFS) {
  const projectileDef = getProjectileDef("pea", projectileDefs);
  state.projectiles.push({
    id: nextId(state, "projectile"),
    type: projectileDef.id,
    lane,
    x,
    y: laneToWorldY(lane) - 30,
    damage: damage ?? projectileDef.damage,
    speed: projectileDef.speed,
    dead: false,
    spriteKey: projectileDef.spriteKey
  });
}

function hasZombieAhead(state, lane, x) {
  return state.zombies.some((zombie) => !zombie.dead && zombie.lane === lane && zombie.x > x);
}

function getBiteTarget(state, zombie) {
  let target = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const plant of state.plants) {
    if (plant.dead || plant.row !== zombie.lane) {
      continue;
    }
    const distance = zombie.x - plant.x;
    if (distance < -30 || distance > 46) {
      continue;
    }
    if (distance < bestDistance) {
      bestDistance = distance;
      target = plant;
    }
  }
  return target;
}

export function applyDamageToZombie(zombie, damage) {
  let remaining = damage;
  if (zombie.armor > 0) {
    const armorLoss = Math.min(remaining, zombie.armor);
    zombie.armor -= armorLoss;
    remaining -= armorLoss;
  }
  if (remaining > 0) {
    zombie.hp -= remaining;
  }
  if (zombie.hp <= 0) {
    zombie.dead = true;
  }
}

function triggerMowers(state) {
  for (const zombie of state.zombies) {
    if (zombie.dead || zombie.x > MOWER.triggerX) {
      continue;
    }
    const mower = state.mowers[zombie.lane];
    if (mower && mower.state === "idle") {
      mower.state = "active";
      mower.x = MOWER.startX;
    }
  }
}

function updatePlantSystems(state, dtMs, plantDefs = PLANT_DEFS, projectileDefs = PROJECTILE_DEFS) {
  for (const plant of state.plants) {
    if (plant.dead) {
      continue;
    }
    const def = getPlantDef(plant.type, plantDefs);
    if (!def) {
      continue;
    }

    if (plant.type === "sunflower") {
      plant.sunTimerMs -= dtMs;
      while (plant.sunTimerMs <= 0) {
        spawnSun(state, {
          kind: "flower",
          x: plant.x + ((state.rng() - 0.5) * 18),
          y: plant.y - 10,
          targetY: plant.y - 52
        });
        plant.sunTimerMs += def.sunIntervalMs;
      }
    }

    if (plant.type === "potato_mine" && !plant.armed) {
      plant.armTimerMs -= dtMs;
      if (plant.armTimerMs <= 0) {
        plant.armed = true;
      }
    }

    if (plant.type === "cherry_bomb" && !plant.pendingExplosion) {
      plant.fuseTimerMs -= dtMs;
      if (plant.fuseTimerMs <= 0) {
        plant.pendingExplosion = true;
      }
    }

    if (def.shootIntervalMs && hasZombieAhead(state, plant.row, plant.x)) {
      plant.shootTimerMs -= dtMs;
      if (plant.shootTimerMs <= 0) {
        const shots = def.shotsPerVolley ?? 1;
        for (let index = 0; index < shots; index += 1) {
          spawnProjectile(
            state,
            plant.row,
            plant.x + 18 + (index * 12),
            def.projectileDamage,
            projectileDefs
          );
        }
        plant.shootTimerMs += def.shootIntervalMs;
      }
    }
  }
}

function updateWaveSpawns(state, zombieDefs = ZOMBIE_DEFS) {
  while (state.waveCursor < state.waves.length && state.waves[state.waveCursor].timeMs <= state.nowMs) {
    const entry = state.waves[state.waveCursor];
    spawnZombieFromWave(state, entry, zombieDefs);
    state.waveCursor += 1;
  }
}

function updateSkySunSpawns(state, dtMs) {
  state.skySunTimerMs -= dtMs;
  while (state.skySunTimerMs <= 0) {
    spawnSkySun(state);
    state.skySunTimerMs += SUN.skyDropIntervalMs;
  }
}

function updateSuns(state, dtMs) {
  const dtSec = dtMs / 1000;
  for (const sun of state.suns) {
    if (sun.kind === "sky" && sun.y < sun.targetY) {
      sun.y = Math.min(sun.targetY, sun.y + (SUN.skyFallSpeed * dtSec));
    } else if (sun.kind === "flower" && sun.y > sun.targetY) {
      sun.y = Math.max(sun.targetY, sun.y - (SUN.flowerRiseSpeed * dtSec));
    }
    sun.lifeMs -= dtMs;
  }
}

function updateZombies(state, dtMs) {
  const dtSec = dtMs / 1000;
  for (const zombie of state.zombies) {
    if (zombie.dead) {
      continue;
    }
    const targetPlant = getBiteTarget(state, zombie);
    if (targetPlant) {
      zombie.state = "attack";
      zombie.attackTimerMs += dtMs;
      while (zombie.attackTimerMs >= zombie.biteIntervalMs) {
        targetPlant.hp -= zombie.biteDamage;
        zombie.attackTimerMs -= zombie.biteIntervalMs;
      }
    } else {
      zombie.state = "walk";
      zombie.attackTimerMs = 0;
      zombie.x -= zombie.speed * dtSec;
    }
  }
}

function updateProjectiles(state, dtMs) {
  const dtSec = dtMs / 1000;
  for (const projectile of state.projectiles) {
    if (projectile.dead) {
      continue;
    }
    projectile.x += projectile.speed * dtSec;
  }
}

function updateMowers(state, dtMs) {
  const dtSec = dtMs / 1000;
  for (const mower of state.mowers) {
    if (mower.state !== "active") {
      continue;
    }
    mower.x += MOWER.speed * dtSec;
    const exitX = BOARD.x + (BOARD.cols * BOARD.cellWidth) + 180;
    if (mower.x > exitX) {
      mower.state = "spent";
    }
  }
}

function updateEffects(state, dtMs) {
  for (const effect of state.effects) {
    effect.lifeMs -= dtMs;
  }
}

function resolveProjectileHits(state) {
  for (const projectile of state.projectiles) {
    if (projectile.dead) {
      continue;
    }
    let closest = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const zombie of state.zombies) {
      if (zombie.dead || zombie.lane !== projectile.lane) {
        continue;
      }
      const distance = Math.abs(projectile.x - zombie.x);
      if (distance > GAME.laneProjectileHitRadius) {
        continue;
      }
      if (distance < closestDistance) {
        closest = zombie;
        closestDistance = distance;
      }
    }
    if (closest) {
      applyDamageToZombie(closest, projectile.damage);
      projectile.dead = true;
      addEffect(state, {
        x: projectile.x,
        y: projectile.y,
        radius: 18,
        lifeMs: 140,
        color: "rgba(200,255,140,0.7)"
      });
    }
  }
}

function resolveMineAndBombDamage(state, plantDefs = PLANT_DEFS) {
  for (const plant of state.plants) {
    if (plant.dead) {
      continue;
    }
    const def = getPlantDef(plant.type, plantDefs);
    if (!def) {
      continue;
    }

    if (plant.type === "potato_mine" && plant.armed) {
      const trigger = state.zombies.find(
        (zombie) => !zombie.dead && zombie.lane === plant.row && Math.abs(zombie.x - plant.x) <= 34
      );
      if (trigger) {
        for (const zombie of state.zombies) {
          if (zombie.dead || zombie.lane !== plant.row) {
            continue;
          }
          if (Math.abs(zombie.x - plant.x) <= def.mineRadius) {
            applyDamageToZombie(zombie, def.mineDamage);
          }
        }
        plant.dead = true;
        addEffect(state, {
          x: plant.x,
          y: plant.y - 20,
          radius: def.mineRadius,
          lifeMs: 280,
          color: "rgba(255,190,80,0.65)"
        });
      }
    }

    if (plant.type === "cherry_bomb" && plant.pendingExplosion) {
      for (const zombie of state.zombies) {
        if (zombie.dead) {
          continue;
        }
        const laneDistance = Math.abs(zombie.lane - plant.row);
        if (laneDistance > 1) {
          continue;
        }
        const dx = zombie.x - plant.x;
        const dy = (zombie.y - plant.y) * 1.1;
        const distance = Math.hypot(dx, dy);
        if (distance <= def.blastRadius) {
          applyDamageToZombie(zombie, def.blastDamage);
        }
      }
      plant.dead = true;
      plant.pendingExplosion = false;
      addEffect(state, {
        x: plant.x,
        y: plant.y - 22,
        radius: def.blastRadius,
        lifeMs: 330,
        color: "rgba(255,128,90,0.72)"
      });
    }
  }
}

function resolveMowerHits(state) {
  for (const mower of state.mowers) {
    if (mower.state !== "active") {
      continue;
    }
    for (const zombie of state.zombies) {
      if (zombie.dead || zombie.lane !== mower.lane) {
        continue;
      }
      if (zombie.x >= mower.x - 32 && zombie.x <= mower.x + 84) {
        zombie.hp = 0;
        zombie.armor = 0;
        zombie.dead = true;
      }
    }
  }
}

function cleanupEntities(state) {
  state.plants = state.plants.filter((plant) => !plant.dead && plant.hp > 0);
  state.zombies = state.zombies.filter((zombie) => !zombie.dead && zombie.hp > 0);
  state.projectiles = state.projectiles.filter(
    (projectile) => !projectile.dead && projectile.x < PROJECTILE.cullX
  );
  state.suns = state.suns.filter((sun) => sun.lifeMs > 0);
  state.effects = state.effects.filter((effect) => effect.lifeMs > 0);
}

function updateSpriteKeys(state) {
  for (const plant of state.plants) {
    plant.spriteKey = plantSpriteKey(plant);
  }
  for (const zombie of state.zombies) {
    zombie.spriteKey = zombieSpriteKey(zombie);
  }
}

function setGameWon(state) {
  state.status = "won";
  state.overlay = {
    title: "Victory",
    text: "The final wave is defeated.",
    actionLabel: "Play Again",
    visible: true
  };
}

function setGameLost(state) {
  state.status = "lost";
  state.overlay = {
    title: "Defeat",
    text: "A zombie reached the house.",
    actionLabel: "Retry",
    visible: true
  };
}

function evaluateOutcome(state) {
  for (const zombie of state.zombies) {
    if (zombie.x > HOUSE.x) {
      continue;
    }
    const mower = state.mowers[zombie.lane];
    if (!mower || mower.state === "spent") {
      setGameLost(state);
      return;
    }
  }

  if (state.waveCursor >= state.waves.length && state.zombies.length === 0) {
    setGameWon(state);
  }
}

export function canPlant(state, plantId, row, col, plantDefs = PLANT_DEFS) {
  const def = getPlantDef(plantId, plantDefs);
  if (!def) {
    return { ok: false, reason: "unknown_plant" };
  }
  if (!inBounds(row, col)) {
    return { ok: false, reason: "out_of_bounds" };
  }
  if (findPlantAt(state, row, col)) {
    return { ok: false, reason: "occupied" };
  }
  if (!state.debug.cheatPlanting) {
    if (state.sun < def.cost) {
      return { ok: false, reason: "insufficient_sun" };
    }
    if ((state.cooldownEnds[plantId] ?? 0) > state.nowMs) {
      return { ok: false, reason: "cooldown" };
    }
  }
  return { ok: true };
}

export function attemptPlant(state, plantId, row, col, plantDefs = PLANT_DEFS) {
  const check = canPlant(state, plantId, row, col, plantDefs);
  if (!check.ok) {
    return false;
  }
  const def = getPlantDef(plantId, plantDefs);
  const world = gridToWorld(row, col);
  const plant = {
    id: nextId(state, "plant"),
    type: def.id,
    row,
    col,
    lane: row,
    x: world.x,
    y: world.y,
    hp: def.maxHp,
    maxHp: def.maxHp,
    state: "idle",
    dead: false,
    spriteKey: def.spriteKey,
    shootTimerMs: def.shootIntervalMs ?? 0,
    sunTimerMs: def.sunIntervalMs ?? 0,
    armTimerMs: def.armTimeMs ?? 0,
    fuseTimerMs: def.fuseTimeMs ?? 0,
    armed: def.id !== "potato_mine",
    pendingExplosion: false
  };
  state.plants.push(plant);
  if (!state.debug.cheatPlanting) {
    state.sun -= def.cost;
    state.cooldownEnds[plantId] = state.nowMs + def.cooldownMs;
  }
  plant.spriteKey = plantSpriteKey(plant);
  return true;
}

export function collectSun(state, sunId) {
  const sun = state.suns.find((entry) => entry.id === sunId);
  if (!sun) {
    return false;
  }
  sun.lifeMs = 0;
  state.sun = Math.min(state.sunCap, state.sun + sun.value);
  return true;
}

function applyInputActions(state, actions, plantDefs = PLANT_DEFS) {
  for (const action of actions) {
    if (!action || typeof action !== "object") {
      continue;
    }
    if (action.type === "selectPlant") {
      if (getPlantDef(action.plantId, plantDefs)) {
        state.selectedPlantId = action.plantId;
      }
      continue;
    }
    if (action.type === "clearSelection") {
      state.selectedPlantId = null;
      continue;
    }
    if (action.type === "collectSun") {
      collectSun(state, action.sunId);
      continue;
    }
    if (action.type === "plantAt") {
      if (state.selectedPlantId) {
        attemptPlant(state, state.selectedPlantId, action.row, action.col, plantDefs);
      }
    }
  }
}

export function stepGameState(
  state,
  actions,
  dtMs,
  { plantDefs = PLANT_DEFS, zombieDefs = ZOMBIE_DEFS, projectileDefs = PROJECTILE_DEFS } = {}
) {
  if (state.status !== "running") {
    return;
  }

  const safeDt = Math.max(0, dtMs);

  applyInputActions(state, actions ?? [], plantDefs);

  state.nowMs += safeDt;
  updateSkySunSpawns(state, safeDt);
  updateWaveSpawns(state, zombieDefs);
  updatePlantSystems(state, safeDt, plantDefs, projectileDefs);

  updateZombies(state, safeDt);
  updateProjectiles(state, safeDt);
  updateSuns(state, safeDt);
  updateMowers(state, safeDt);
  updateEffects(state, safeDt);

  triggerMowers(state);
  resolveProjectileHits(state);
  resolveMineAndBombDamage(state, plantDefs);
  resolveMowerHits(state);

  cleanupEntities(state);
  updateSpriteKeys(state);

  evaluateOutcome(state);
}

export function getWaveProgress(state) {
  return {
    spawned: state.waveCursor,
    total: state.waves.length,
    flags: state.flagsTriggered,
    totalFlags: state.totalFlags
  };
}

export function spawnZombieForDebug(state, zombieType, lane, xOverride = null) {
  const zombie = createZombieInstance(state, zombieType, lane, xOverride);
  if (zombie) {
    state.zombies.push(zombie);
  }
  return zombie;
}

export function isPointInsideBoard(x, y) {
  return (
    x >= BOARD.x &&
    x <= BOARD.x + (BOARD.cols * BOARD.cellWidth) &&
    y >= BOARD.y &&
    y <= BOARD.y + (BOARD.rows * BOARD.cellHeight)
  );
}

export function isSunHit(sun, x, y) {
  return Math.hypot(x - sun.x, y - sun.y) <= 28;
}

export function getCanvasBounds() {
  return {
    width: CANVAS.width,
    height: CANVAS.height
  };
}
