import { BOARD } from "./constants.js";

export function gridToWorld(row, col) {
  return {
    x: BOARD.x + (col * BOARD.cellWidth) + (BOARD.cellWidth / 2),
    y: BOARD.y + (row * BOARD.cellHeight) + (BOARD.cellHeight * 0.9)
  };
}

export function worldToGrid(x, y) {
  const col = Math.floor((x - BOARD.x) / BOARD.cellWidth);
  const row = Math.floor((y - BOARD.y) / BOARD.cellHeight);
  if (row < 0 || row >= BOARD.rows || col < 0 || col >= BOARD.cols) {
    return null;
  }
  return { row, col };
}

export function laneToWorldY(lane) {
  return BOARD.y + (lane * BOARD.cellHeight) + (BOARD.cellHeight * 0.9);
}

export function inBounds(row, col) {
  return row >= 0 && row < BOARD.rows && col >= 0 && col < BOARD.cols;
}
