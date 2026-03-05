async function loadImageFromSvg(svgText) {
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = (error) => reject(error);
      image.src = url;
    });
    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(image);
      } catch {
        return image;
      }
    }
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function buildBitmapAtlas(manifest) {
  const sprites = new Map();
  const entries = Object.entries(manifest);
  for (const [key, descriptor] of entries) {
    const image = await loadImageFromSvg(descriptor.svg);
    sprites.set(key, {
      ...descriptor,
      image
    });
  }

  return {
    sprites,
    get(key) {
      return sprites.get(key) ?? null;
    },
    draw(ctx, key, x, y, options = {}) {
      const sprite = sprites.get(key);
      if (!sprite) {
        return;
      }
      const scale = options.scale ?? 1;
      const alpha = options.alpha ?? 1;
      const rotation = options.rotation ?? 0;
      const width = sprite.width * scale;
      const height = sprite.height * scale;
      const drawX = x - (width * sprite.anchorX);
      const drawY = y - (height * sprite.anchorY);

      ctx.save();
      ctx.globalAlpha = alpha;
      if (rotation !== 0) {
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.drawImage(
          sprite.image,
          -(width * sprite.anchorX),
          -(height * sprite.anchorY),
          width,
          height
        );
      } else {
        ctx.drawImage(sprite.image, drawX, drawY, width, height);
      }
      ctx.restore();
    }
  };
}
