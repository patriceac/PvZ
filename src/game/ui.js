export function initSeedBank(container, plantOrder, plantDefs, onSelect) {
  container.innerHTML = "";
  const cards = new Map();
  for (const plantId of plantOrder) {
    const def = plantDefs[plantId];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "seed-card";
    button.dataset.plantId = plantId;
    button.innerHTML = [
      `<span class="seed-card-icon">${def.cardSymbol}</span>`,
      `<span class="seed-card-info">`,
      `<span class="seed-card-title">${def.name}</span>`,
      `<span class="seed-card-cost">Cost ${def.cost}</span>`,
      `<span class="seed-card-cooldown"><span></span></span>`,
      `</span>`
    ].join("");
    button.addEventListener("click", () => onSelect(plantId));
    container.append(button);
    cards.set(plantId, button);
  }
  return cards;
}

export function updateSeedBank(cards, state, plantDefs) {
  for (const [plantId, card] of cards.entries()) {
    const def = plantDefs[plantId];
    const cooldownEnd = state.cooldownEnds[plantId] ?? 0;
    const remaining = Math.max(0, cooldownEnd - state.nowMs);
    const ratio = def.cooldownMs > 0 ? (remaining / def.cooldownMs) : 0;
    const cooldownBar = card.querySelector(".seed-card-cooldown > span");
    cooldownBar.style.width = `${Math.round(ratio * 100)}%`;
    const unavailable = (state.sun < def.cost) || remaining > 0;
    card.classList.toggle("disabled", unavailable);
    card.classList.toggle("selected", state.selectedPlantId === plantId);
    card.disabled = false;
  }
}

export function updateHud(elements, state, waveProgress) {
  elements.sunCount.textContent = `Sun: ${state.sun}`;
  elements.waveStatus.textContent = `Wave: ${waveProgress.spawned} / ${waveProgress.total}`;
}

export function showOverlay(elements, { title, text, actionLabel, visible }) {
  elements.overlayTitle.textContent = title;
  elements.overlayText.textContent = text;
  elements.overlayAction.textContent = actionLabel;
  elements.overlay.classList.toggle("hidden", !visible);
}
