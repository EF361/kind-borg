const { GIFEncoder, quantize, applyPalette } = require('gifenc');
const { PNG } = require('pngjs');
const fs = require('fs');

/**
 * Encodes an array of PNG frame buffers into a smooth, color-quantized GIF.
 * @param {Array<{ buffer: Buffer, delay: number }>} frames Array of PNG buffers and their display durations in ms
 * @param {string} outputPath Destination file path
 * @param {number} [targetWidth] Optional resize width
 * @param {number} [targetHeight] Optional resize height
 * @returns {Promise<{ path: string, size: number, frameCount: number }>}
 */
async function encodeGifFromPngFrames(frames, outputPath, targetWidth = null, targetHeight = null) {
  if (!frames || frames.length === 0) {
    throw new Error('No frames provided for GIF encoding');
  }

  const firstPng = PNG.sync.read(frames[0].buffer);
  const srcWidth = firstPng.width;
  const srcHeight = firstPng.height;

  // Use natural or scaled dimensions (keeping dimensions reasonable for fast encoding & compact GIF size)
  let width = targetWidth || srcWidth;
  let height = targetHeight || srcHeight;

  // If width is larger than 800, scale down proportionally for web/social GIF efficiency
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
      // Nearest-neighbor / bilinear downsample for frame buffer resizing
      rgba = resizeRgba(png.data, png.width, png.height, width, height);
    }

    // High quality color quantization
    const palette = quantize(rgba, 256, {
      format: 'rgba4444',
      oneBitAlpha: true
    });
    const index = applyPalette(rgba, palette);
    
    // Convert ms delay to GIF delay in hundredths of a second (10ms units) or ms
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
 * Fast bilinear resize for RGBA image buffers
 */
function resizeRgba(srcData, srcW, srcH, dstW, dstH) {
  const dst = new Uint8Array(dstW * dstH * 4);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;

  for (let y = 0; y < dstH; y++) {
    const srcY = Math.min(srcH - 1, Math.floor(y * yRatio));
    for (let x = 0; x < dstW; x++) {
      const srcX = Math.min(srcW - 1, Math.floor(x * xRatio));
      const srcIdx = (srcY * srcW + srcX) * 4;
      const dstIdx = (y * dstW + x) * 4;

      dst[dstIdx + 0] = srcData[srcIdx + 0];
      dst[dstIdx + 1] = srcData[srcIdx + 1];
      dst[dstIdx + 2] = srcData[srcIdx + 2];
      dst[dstIdx + 3] = srcData[srcIdx + 3];
    }
  }

  return dst;
}

module.exports = {
  encodeGifFromPngFrames
};
