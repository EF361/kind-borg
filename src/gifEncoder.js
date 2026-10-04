const { GIFEncoder, quantize, applyPalette } = require('gifenc');
const { PNG } = require('pngjs');
const fs = require('fs');

/**
 * Encodes an array of PNG frame buffers into a smooth, color-quantized GIF
 * with crop or contain options that NEVER distort or squish aspect ratios.
 * @param {Array<{ buffer: Buffer, delay: number }>} frames Array of PNG buffers and their display durations in ms
 * @param {string} outputPath Destination file path
 * @param {number} [targetWidth] Target width in pixels
 * @param {number} [targetHeight] Target height in pixels
 * @param {'crop'|'contain'} [fitMode] 'crop' (center-crop) or 'contain' (letterbox with dark frame)
 * @returns {Promise<{ path: string, size: number, frameCount: number, width: number, height: number }>}
 */
async function encodeGifFromPngFrames(frames, outputPath, targetWidth = null, targetHeight = null, fitMode = 'crop') {
  if (!frames || frames.length === 0) {
    throw new Error('No frames provided for GIF encoding');
  }

  const firstPng = PNG.sync.read(frames[0].buffer);
  const srcWidth = firstPng.width;
  const srcHeight = firstPng.height;

  let width = targetWidth || srcWidth;
  let height = targetHeight || srcHeight;

  // If width is larger than 800 without custom target, scale down proportionally
  if (!targetWidth && width > 800) {
    const scale = 800 / width;
    width = 800;
    height = Math.round(srcHeight * scale);
  }

  // Ensure dimensions are even
  width = width % 2 === 0 ? width : width - 1;
  height = height % 2 === 0 ? height : height - 1;

  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const png = PNG.sync.read(frame.buffer);

    let rgba;
    if (png.width === width && png.height === height) {
      rgba = png.data;
    } else {
      // Crop or fit with ZERO stretching/squishing
      rgba = cropOrFitRgba(png.data, png.width, png.height, width, height, fitMode);
    }

    // High quality color quantization
    const palette = quantize(rgba, 256, {
      format: 'rgba4444',
      oneBitAlpha: true
    });
    const index = applyPalette(rgba, palette);
    
    const delay = Math.max(20, frame.delay || 100);
    gif.writeFrame(index, width, height, {
      palette,
      delay
    });
  }

  gif.finish();
  const buffer = Buffer.from(gif.bytes());
  fs.writeFileSync(outputPath, buffer);

  return {
    path: outputPath,
    size: buffer.length,
    frameCount: frames.length,
    width,
    height
  };
}

/**
 * Center-crop or letterbox RGBA image buffers maintaining natural aspect ratio.
 * NEVER squishes or distorts the image.
 */
function cropOrFitRgba(srcData, srcW, srcH, dstW, dstH, mode = 'crop') {
  const dst = new Uint8Array(dstW * dstH * 4);

  if (mode === 'crop') {
    // Cover & Center-Crop: scale to cover destination, crop extra edges without distortion
    const scale = Math.max(dstW / srcW, dstH / srcH);
    const scaledW = srcW * scale;
    const scaledH = srcH * scale;
    const cropX = (scaledW - dstW) / 2;
    const cropY = (scaledH - dstH) / 2;

    for (let y = 0; y < dstH; y++) {
      const srcY = Math.min(srcH - 1, Math.max(0, Math.floor((y + cropY) / scale)));
      for (let x = 0; x < dstW; x++) {
        const srcX = Math.min(srcW - 1, Math.max(0, Math.floor((x + cropX) / scale)));
        const srcIdx = (srcY * srcW + srcX) * 4;
        const dstIdx = (y * dstW + x) * 4;

        dst[dstIdx + 0] = srcData[srcIdx + 0];
        dst[dstIdx + 1] = srcData[srcIdx + 1];
        dst[dstIdx + 2] = srcData[srcIdx + 2];
        dst[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }
  } else {
    // Contain mode: letterbox with sleek dark canvas (#0a0e17)
    for (let i = 0; i < dstW * dstH; i++) {
      dst[i * 4 + 0] = 10;
      dst[i * 4 + 1] = 14;
      dst[i * 4 + 2] = 23;
      dst[i * 4 + 3] = 255;
    }

    const scale = Math.min(dstW / srcW, dstH / srcH);
    const renderW = Math.round(srcW * scale);
    const renderH = Math.round(srcH * scale);
    const padX = Math.floor((dstW - renderW) / 2);
    const padY = Math.floor((dstH - renderH) / 2);

    for (let y = 0; y < renderH; y++) {
      const srcY = Math.min(srcH - 1, Math.floor(y / scale));
      const dstY = padY + y;
      if (dstY < 0 || dstY >= dstH) continue;

      for (let x = 0; x < renderW; x++) {
        const srcX = Math.min(srcW - 1, Math.floor(x / scale));
        const dstX = padX + x;
        if (dstX < 0 || dstX >= dstW) continue;

        const srcIdx = (srcY * srcW + srcX) * 4;
        const dstIdx = (dstY * dstW + dstX) * 4;

        dst[dstIdx + 0] = srcData[srcIdx + 0];
        dst[dstIdx + 1] = srcData[srcIdx + 1];
        dst[dstIdx + 2] = srcData[srcIdx + 2];
        dst[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }
  }

  return dst;
}

module.exports = {
  encodeGifFromPngFrames,
  cropOrFitRgba
};
