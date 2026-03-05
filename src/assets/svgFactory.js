function wrapSvg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

function sunflowerSvg() {
  return wrapSvg(
    80,
    96,
    [
      `<rect x="38" y="36" width="6" height="44" rx="2" fill="#3f8e3c" />`,
      `<circle cx="26" cy="56" r="8" fill="#4a9a43" />`,
      `<circle cx="54" cy="56" r="8" fill="#4a9a43" />`,
      `<g fill="#f6c640">`,
      `<circle cx="40" cy="19" r="13" />`,
      `<circle cx="24" cy="22" r="10" />`,
      `<circle cx="56" cy="22" r="10" />`,
      `<circle cx="32" cy="8" r="9" />`,
      `<circle cx="48" cy="8" r="9" />`,
      `</g>`,
      `<circle cx="40" cy="20" r="10" fill="#915d2e" />`,
      `<circle cx="36" cy="18" r="2" fill="#1f2518" />`,
      `<circle cx="44" cy="18" r="2" fill="#1f2518" />`,
      `<path d="M34 24 Q40 29 46 24" stroke="#1f2518" stroke-width="2" fill="none" />`
    ].join("")
  );
}

function peashooterSvg(doubleHead) {
  const extra = doubleHead
    ? `<circle cx="61" cy="30" r="10" fill="#57a84e" /><circle cx="70" cy="30" r="4.8" fill="#2f5e2a" />`
    : "";
  return wrapSvg(
    88,
    96,
    [
      `<rect x="40" y="37" width="7" height="43" rx="2" fill="#3f8e3c" />`,
      `<ellipse cx="33" cy="60" rx="13" ry="8" fill="#4ca548" />`,
      `<ellipse cx="55" cy="60" rx="13" ry="8" fill="#4ca548" />`,
      `<circle cx="45" cy="29" r="12" fill="#57a84e" />`,
      `<circle cx="57" cy="29" r="13" fill="#67b85d" />`,
      `<circle cx="67" cy="29" r="10.5" fill="#58a74f" />`,
      `<circle cx="74" cy="29" r="5" fill="#2f5e2a" />`,
      `<circle cx="42" cy="24" r="2" fill="#203118" />`,
      `<circle cx="46" cy="24" r="2" fill="#203118" />`,
      `<path d="M41 33 Q45 36 49 33" stroke="#203118" stroke-width="2" fill="none" />`,
      extra
    ].join("")
  );
}

function wallnutSvg(stage) {
  const crack = {
    healthy: "",
    cracked: `<path d="M33 36 L40 50 L35 66" stroke="#4b2e18" stroke-width="2" fill="none" /><path d="M46 38 L51 47 L47 63" stroke="#4b2e18" stroke-width="2" fill="none" />`,
    broken: `<path d="M28 33 L41 50 L31 70" stroke="#4b2e18" stroke-width="3" fill="none" /><path d="M53 33 L42 51 L52 72" stroke="#4b2e18" stroke-width="3" fill="none" /><path d="M38 30 L45 45 L41 60" stroke="#4b2e18" stroke-width="2.5" fill="none" />`
  }[stage];
  const tone = stage === "broken" ? "#a87842" : "#b5854c";
  return wrapSvg(
    80,
    96,
    [
      `<ellipse cx="40" cy="54" rx="24" ry="31" fill="${tone}" />`,
      `<ellipse cx="40" cy="58" rx="22" ry="29" fill="rgba(255,255,255,0.06)" />`,
      `<circle cx="33" cy="48" r="3" fill="#1d2118" />`,
      `<circle cx="47" cy="48" r="3" fill="#1d2118" />`,
      `<path d="M31 61 Q40 67 49 61" stroke="#442914" stroke-width="2.4" fill="none" />`,
      crack
    ].join("")
  );
}

function potatoMineSvg(armed) {
  const eye = armed ? "#fef07a" : "#1f251a";
  const ring = armed ? `<circle cx="40" cy="23" r="8" fill="#b52e2e" /><circle cx="40" cy="23" r="4" fill="#f8d089" />` : "";
  return wrapSvg(
    80,
    96,
    [
      `<ellipse cx="40" cy="63" rx="19" ry="13" fill="#5d3d22" />`,
      `<ellipse cx="40" cy="57" rx="22" ry="16" fill="#7f5a35" />`,
      `<circle cx="33" cy="53" r="2.8" fill="${eye}" />`,
      `<circle cx="47" cy="53" r="2.8" fill="${eye}" />`,
      `<path d="M32 61 Q40 66 48 61" stroke="#4a2e19" stroke-width="2" fill="none" />`,
      ring
    ].join("")
  );
}

function cherrySvg() {
  return wrapSvg(
    80,
    96,
    [
      `<path d="M38 41 Q30 29 24 25" stroke="#3f8e3c" stroke-width="4" fill="none" />`,
      `<path d="M42 41 Q53 29 58 25" stroke="#3f8e3c" stroke-width="4" fill="none" />`,
      `<circle cx="31" cy="57" r="15" fill="#ca2f34" />`,
      `<circle cx="49" cy="57" r="15" fill="#d4363a" />`,
      `<circle cx="24" cy="53" r="4" fill="rgba(255,255,255,0.35)" />`,
      `<circle cx="44" cy="53" r="4" fill="rgba(255,255,255,0.35)" />`,
      `<circle cx="29" cy="56" r="2" fill="#211912" />`,
      `<circle cx="51" cy="56" r="2" fill="#211912" />`
    ].join("")
  );
}

function projectilePeaSvg() {
  return wrapSvg(
    20,
    20,
    [
      `<circle cx="10" cy="10" r="8" fill="#78c75a" />`,
      `<circle cx="7" cy="8" r="2.5" fill="rgba(255,255,255,0.45)" />`
    ].join("")
  );
}

function sunSvg() {
  return wrapSvg(
    48,
    48,
    [
      `<g fill="#f6cf46">`,
      `<circle cx="24" cy="24" r="14" />`,
      `<rect x="22.5" y="3" width="3" height="8" rx="1.2" />`,
      `<rect x="22.5" y="37" width="3" height="8" rx="1.2" />`,
      `<rect x="3" y="22.5" width="8" height="3" rx="1.2" />`,
      `<rect x="37" y="22.5" width="8" height="3" rx="1.2" />`,
      `<rect transform="rotate(45 24 24)" x="22.5" y="3" width="3" height="8" rx="1.2" />`,
      `<rect transform="rotate(-45 24 24)" x="22.5" y="3" width="3" height="8" rx="1.2" />`,
      `<rect transform="rotate(135 24 24)" x="22.5" y="3" width="3" height="8" rx="1.2" />`,
      `<rect transform="rotate(-135 24 24)" x="22.5" y="3" width="3" height="8" rx="1.2" />`,
      `</g>`,
      `<circle cx="24" cy="24" r="9" fill="#f7e39a" opacity="0.7" />`
    ].join("")
  );
}

function mowerSvg(active) {
  const blade = active ? "#f2a31e" : "#919b8c";
  return wrapSvg(
    92,
    56,
    [
      `<rect x="8" y="20" width="54" height="22" rx="6" fill="#a12828" />`,
      `<rect x="12" y="24" width="32" height="10" rx="2" fill="#d0514d" />`,
      `<circle cx="18" cy="44" r="7" fill="#333" />`,
      `<circle cx="52" cy="44" r="7" fill="#333" />`,
      `<rect x="62" y="26" width="22" height="10" rx="2" fill="${blade}" />`,
      `<rect x="62" y="23" width="3" height="16" fill="#515151" />`
    ].join("")
  );
}

function zombieSvg(type, action, damageStage, gearStage) {
  const toneMap = {
    healthy: { skin: "#8cb58c", cloth: "#6f5b4a", shirt: "#f6f2dd" },
    damaged: { skin: "#759775", cloth: "#624f3f", shirt: "#d9d4bc" },
    critical: { skin: "#5f7a5f", cloth: "#4f4034", shirt: "#bcb69c" }
  };
  const tones = toneMap[damageStage];
  const torsoWidth = type === "heavy" ? 32 : 28;
  const torsoX = 43 - (torsoWidth / 2);
  const bodyHeight = type === "fast" ? 34 : 38;
  const armY = action === "attack" ? 48 : 56;
  const armRotation = action === "attack" ? -15 : 12;
  const headScale = type === "heavy" ? 1.08 : 1;
  const cone = type === "conehead" && gearStage !== "none";
  const bucket = type === "buckethead" && gearStage !== "none";
  const gearOpacity = gearStage === "cracked" ? 0.68 : 1;
  const gearCrack = gearStage === "cracked"
    ? `<path d="M36 17 L43 25 L38 33" stroke="#473b34" stroke-width="2" fill="none" />`
    : "";

  const coneShape = cone
    ? `<polygon points="43,3 31,28 55,28" fill="#ea7a2e" opacity="${gearOpacity}" />${gearCrack}`
    : "";

  const bucketShape = bucket
    ? `<rect x="30" y="4" width="26" height="23" rx="3" fill="#9ea3a7" opacity="${gearOpacity}" />${gearCrack}`
    : "";

  const heavyExtras = type === "heavy"
    ? `<rect x="${torsoX - 3}" y="62" width="${torsoWidth + 6}" height="20" rx="4" fill="#3e5162" />`
    : "";

  const fastExtras = type === "fast"
    ? `<rect x="${torsoX + 2}" y="62" width="${torsoWidth - 6}" height="17" rx="3" fill="#2f4b5f" />`
    : "";

  return wrapSvg(
    86,
    110,
    [
      `<ellipse cx="43" cy="102" rx="23" ry="6" fill="rgba(0,0,0,0.18)" />`,
      `<ellipse cx="43" cy="30" rx="${13 * headScale}" ry="${14 * headScale}" fill="${tones.skin}" />`,
      coneShape,
      bucketShape,
      `<rect x="${torsoX}" y="45" width="${torsoWidth}" height="${bodyHeight}" rx="5" fill="${tones.shirt}" />`,
      `<rect x="${torsoX + 3}" y="57" width="${torsoWidth - 6}" height="31" rx="4" fill="${tones.cloth}" />`,
      `<rect transform="rotate(${armRotation} 43 ${armY})" x="30" y="${armY}" width="26" height="8" rx="3" fill="${tones.skin}" />`,
      `<rect x="${torsoX + 1}" y="82" width="10" height="21" rx="4" fill="#4d5f71" />`,
      `<rect x="${torsoX + torsoWidth - 11}" y="82" width="10" height="21" rx="4" fill="#4d5f71" />`,
      `<circle cx="38" cy="28" r="2.2" fill="#1d2017" />`,
      `<circle cx="48" cy="28" r="2.2" fill="#1d2017" />`,
      `<path d="M37 37 Q43 41 49 37" stroke="#2f2f24" stroke-width="2" fill="none" />`,
      heavyExtras,
      fastExtras
    ].join("")
  );
}

function add(manifest, key, svg, width, height, anchorX, anchorY) {
  manifest[key] = {
    key,
    svg,
    width,
    height,
    anchorX,
    anchorY
  };
}

export function createSvgAssets(_theme = {}) {
  const manifest = {};

  add(manifest, "plant_sunflower", sunflowerSvg(), 80, 96, 0.5, 1);
  add(manifest, "plant_peashooter", peashooterSvg(false), 88, 96, 0.5, 1);
  add(manifest, "plant_repeater", peashooterSvg(true), 88, 96, 0.5, 1);
  add(manifest, "plant_wallnut_healthy", wallnutSvg("healthy"), 80, 96, 0.5, 1);
  add(manifest, "plant_wallnut_cracked", wallnutSvg("cracked"), 80, 96, 0.5, 1);
  add(manifest, "plant_wallnut_broken", wallnutSvg("broken"), 80, 96, 0.5, 1);
  add(manifest, "plant_potato_unarmed", potatoMineSvg(false), 80, 96, 0.5, 1);
  add(manifest, "plant_potato_armed", potatoMineSvg(true), 80, 96, 0.5, 1);
  add(manifest, "plant_cherry", cherrySvg(), 80, 96, 0.5, 1);

  add(manifest, "projectile_pea", projectilePeaSvg(), 20, 20, 0.5, 0.5);
  add(manifest, "sun_drop", sunSvg(), 48, 48, 0.5, 0.5);
  add(manifest, "mower_idle", mowerSvg(false), 92, 56, 0.5, 0.82);
  add(manifest, "mower_active", mowerSvg(true), 92, 56, 0.5, 0.82);

  const zombieTypes = ["basic", "conehead", "buckethead", "fast", "heavy"];
  const actions = ["walk", "attack"];
  const damages = ["healthy", "damaged", "critical"];
  const gears = ["none", "full", "cracked"];

  for (const type of zombieTypes) {
    for (const action of actions) {
      for (const damage of damages) {
        for (const gear of gears) {
          if ((type === "conehead" || type === "buckethead") || gear === "none") {
            const key = `zombie_${type}_${action}_${damage}_${gear}`;
            add(manifest, key, zombieSvg(type, action, damage, gear), 86, 110, 0.5, 1);
          }
        }
      }
    }
  }

  return manifest;
}
