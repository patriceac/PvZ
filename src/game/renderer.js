import { BOARD, CANVAS, RENDER_THEME } from "./constants.js";
import { getWaveProgress } from "./logic.js";

function drawBoardBackground(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS.height);
  sky.addColorStop(0, RENDER_THEME.skyTop);
  sky.addColorStop(0.4, RENDER_THEME.skyBottom);
  sky.addColorStop(0.4, RENDER_THEME.grassLight);
  sky.addColorStop(1, RENDER_THEME.grassDark);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  ctx.fillStyle = RENDER_THEME.house;
  ctx.fillRect(0, BOARD.y - 6, BOARD.x - 28, (BOARD.rows * BOARD.cellHeight) + 12);

  for (let row = 0; row < BOARD.rows; row += 1) {
    const y = BOARD.y + (row * BOARD.cellHeight);
    ctx.fillStyle = row % 2 === 0 ? "rgba(193,232,127,0.35)" : "rgba(118,184,77,0.35)";
    ctx.fillRect(BOARD.x, y, BOARD.cols * BOARD.cellWidth, BOARD.cellHeight);
  }

  ctx.strokeStyle = RENDER_THEME.laneLine;
  ctx.lineWidth = 1;
  for (let row = 0; row <= BOARD.rows; row += 1) {
    const y = BOARD.y + (row * BOARD.cellHeight);
    ctx.beginPath();
    ctx.moveTo(BOARD.x, y);
    ctx.lineTo(BOARD.x + (BOARD.cols * BOARD.cellWidth), y);
    ctx.stroke();
  }
  for (let col = 0; col <= BOARD.cols; col += 1) {
    const x = BOARD.x + (col * BOARD.cellWidth);
    ctx.beginPath();
    ctx.moveTo(x, BOARD.y);
    ctx.lineTo(x, BOARD.y + (BOARD.rows * BOARD.cellHeight));
    ctx.stroke();
  }
}

function drawEffects(ctx, state) {
  for (const effect of state.effects) {
    const alpha = Math.max(0, Math.min(1, effect.lifeMs / 330));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = effect.color;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (1 - (alpha * 0.2)), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawDebugOverlay(ctx, state) {
  if (state.status !== "paused") {
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(20,20,20,0.55)";
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  ctx.fillStyle = "#f9fbe8";
  ctx.font = "700 48px Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Paused", CANVAS.width / 2, CANVAS.height / 2);
  ctx.restore();
}

export class GameRenderer {
  constructor(canvas, atlas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.atlas = atlas;
  }

  render(state) {
    const { ctx } = this;
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
    drawBoardBackground(ctx);

    for (const mower of state.mowers) {
      const key = mower.state === "active" ? "mower_active" : "mower_idle";
      const y = BOARD.y + (mower.lane * BOARD.cellHeight) + (BOARD.cellHeight * 0.92);
      this.atlas.draw(ctx, key, mower.x, y);
    }

    for (const plant of state.plants) {
      this.atlas.draw(ctx, plant.spriteKey, plant.x, plant.y);
    }

    for (const projectile of state.projectiles) {
      this.atlas.draw(ctx, projectile.spriteKey, projectile.x, projectile.y);
    }

    for (const zombie of state.zombies) {
      this.atlas.draw(ctx, zombie.spriteKey, zombie.x, zombie.y);
    }

    for (const sun of state.suns) {
      const bob = Math.sin((state.nowMs / 350) + sun.x) * 2;
      this.atlas.draw(ctx, "sun_drop", sun.x, sun.y + bob, { alpha: 0.98 });
    }

    drawEffects(ctx, state);

    const progress = getWaveProgress(state);
    ctx.save();
    ctx.fillStyle = "rgba(15,27,12,0.75)";
    ctx.font = "700 18px Trebuchet MS, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      `Time ${Math.floor(state.nowMs / 1000)}s  |  Waves ${progress.spawned}/${progress.total}  |  Flags ${progress.flags}/${progress.totalFlags}`,
      14,
      28
    );
    ctx.restore();

    drawDebugOverlay(ctx, state);
  }
}
