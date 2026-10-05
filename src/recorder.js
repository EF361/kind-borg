const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { PNG } = require('pngjs');
const { encodeGifFromPngFrames } = require('./gifEncoder');

/**
 * Frames screenshot onto sleek dark studio background #0a0e17
 * Centering and maintaining aspect ratio without squishing.
 */
function frameOnCanvas(pngBuffer, canvasWidth, canvasHeight, fitMode = 'crop') {
  const src = PNG.sync.read(pngBuffer);
  if (src.width === canvasWidth && src.height === canvasHeight) {
    return pngBuffer;
  }

  const canvas = new PNG({ width: canvasWidth, height: canvasHeight });
  // Fill dark background #0a0e17
  for (let i = 0; i < canvasWidth * canvasHeight; i++) {
    canvas.data[i * 4 + 0] = 10;
    canvas.data[i * 4 + 1] = 14;
    canvas.data[i * 4 + 2] = 23;
    canvas.data[i * 4 + 3] = 255;
  }

  let drawW = src.width;
  let drawH = src.height;

  // Scale if larger than canvas
  if (drawW > canvasWidth || drawH > canvasHeight) {
    const scale = Math.min(canvasWidth / drawW, canvasHeight / drawH);
    drawW = Math.round(drawW * scale);
    drawH = Math.round(drawH * scale);
  }

  const padX = Math.floor((canvasWidth - src.width) / 2);
  const padY = Math.floor((canvasHeight - src.height) / 2);

  for (let y = 0; y < src.height; y++) {
    const dy = padY + y;
    if (dy < 0 || dy >= canvasHeight) continue;
    for (let x = 0; x < src.width; x++) {
      const dx = padX + x;
      if (dx < 0 || dx >= canvasWidth) continue;
      const srcIdx = (y * src.width + x) * 4;
      const dstIdx = (dy * canvasWidth + dx) * 4;
      canvas.data[dstIdx + 0] = src.data[srcIdx + 0];
      canvas.data[dstIdx + 1] = src.data[srcIdx + 1];
      canvas.data[dstIdx + 2] = src.data[srcIdx + 2];
      canvas.data[dstIdx + 3] = src.data[srcIdx + 3];
    }
  }

  return PNG.sync.write(canvas);
}

/**
 * Injects modern cursor pointer, ripple wave effects, and step caption badge.
 */
async function injectVisualOverlay(page) {
  await page.evaluate(() => {
    const oldStyles = document.getElementById('__vp_styles');
    if (oldStyles) oldStyles.remove();

    const style = document.createElement('style');
    style.id = '__vp_styles';
    style.innerHTML = `
      #__vp_cursor {
        position: fixed; width: 28px; height: 28px; z-index: 9999999;
        pointer-events: none; filter: drop-shadow(0 3px 8px rgba(0,0,0,0.7));
        transform: translate(-2px, -2px);
        transition: transform 0.05s ease-out;
      }
      .__vp_click_ripple {
        position: fixed; width: 20px; height: 20px; border-radius: 50%;
        border: 3px solid #38bdf8; background: rgba(56, 189, 248, 0.45);
        transform: translate(-50%, -50%); pointer-events: none; z-index: 9999998;
        animation: __vp_ripple_anim 0.75s ease-out forwards;
      }
      @keyframes __vp_ripple_anim {
        0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
      }
      #__vp_step_badge {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.94); backdrop-filter: blur(12px);
        color: #f8fafc; border: 1.5px solid rgba(56, 189, 248, 0.7);
        border-radius: 9999px; padding: 8px 22px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px; font-weight: 700; z-index: 9999999; pointer-events: none;
        box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 15px rgba(56, 189, 248, 0.25);
        letter-spacing: 0.02em; display: flex; align-items: center; gap: 8px;
        transition: opacity 0.3s;
      }
      #__vp_step_badge::before {
        content: ''; width: 8px; height: 8px; background: #38bdf8;
        border-radius: 50%; box-shadow: 0 0 8px #38bdf8;
      }
    `;
    document.head.appendChild(style);

    let cur = document.getElementById('__vp_cursor');
    if (!cur) {
      cur = document.createElement('div');
      cur.id = '__vp_cursor';
      cur.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M5.5 3.2L18.8 13.6L12.4 14.7L9.5 20.8L7.1 19.6L9.9 13.7L5.5 10.3V3.2Z" fill="#38bdf8" stroke="#ffffff" stroke-width="1.8"/>
        </svg>
      `;
      document.body.appendChild(cur);
    }

    let badge = document.getElementById('__vp_step_badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = '__vp_step_badge';
      badge.textContent = 'Initializing Visual Proof...';
      document.body.appendChild(badge);
    }
  });
}

/**
 * Executes planned steps using Playwright, injecting animated cursor overlays,
 * capturing frame buffers, and producing an optimized 1080p GIF and WebM video.
 */
async function recordWalkthrough(plan, options = {}) {
  const outputDir = options.outputDir || path.join(__dirname, 'outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const ratio = options.aspectRatio || '1:1';
  let targetWidth = 1080;
  let targetHeight = 1080;
  let resolutionStr = '1080 × 1080';

  if (ratio === '4:5') {
    targetWidth = 1080;
    targetHeight = 1350;
    resolutionStr = '1080 × 1350';
  } else if (ratio === '1.91:1') {
    targetWidth = 1200;
    targetHeight = 627;
    resolutionStr = '1200 × 627';
  } else if (ratio === 'standard') {
    targetWidth = 1080;
    targetHeight = 648;
    resolutionStr = '1080 × 648';
  }

  const safeRatioName = ratio.replace(/[:.]/g, 'x');
  const gifFilename = `visualproof_${safeRatioName}_${timestamp}.gif`;
  const videoFilename = `visualproof_${safeRatioName}_${timestamp}.webm`;
  const gifPath = path.join(outputDir, gifFilename);
  const videoPath = path.join(outputDir, videoFilename);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const frames = [];
  let currentCursor = { x: Math.round(targetWidth * 0.3), y: Math.round(targetHeight * 0.25) };

  try {
    const initialViewport = (plan.steps[0] && plan.steps[0].viewport) || { width: 1280, height: 750 };
    const context = await browser.newContext({
      viewport: initialViewport,
      deviceScaleFactor: 1,
      recordVideo: {
        dir: outputDir,
        size: { width: targetWidth, height: targetHeight }
      }
    });

    const page = await context.newPage();

    // Navigate to target URL
    const targetUrl = plan.targetUrl || 'http://localhost:3000/demo';
    console.log(`[Recorder] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 35000 }).catch(err => {
      console.warn('[Recorder] Navigation warning (continuing):', err.message);
    });

    // Inject visual overlay
    await injectVisualOverlay(page);

    // Initial settle frame
    await page.waitForTimeout(400);
    const initialBuf = await page.screenshot({ type: 'png' });
    frames.push({ buffer: frameOnCanvas(initialBuf, targetWidth, targetHeight), delay: 400 });

    // Iterate through steps
    const steps = plan.steps && plan.steps.length > 0 ? plan.steps : [
      { id: '1', name: 'Overview', caption: 'Application Overview', type: 'navigate_and_inspect' }
    ];

    for (let sIdx = 0; sIdx < steps.length; sIdx++) {
      const step = steps[sIdx];
      console.log(`[Recorder] Step ${sIdx + 1}/${steps.length}: ${step.name}`);

      // Handle close modal prerequisite
      if (step.closeModalFirst) {
        try {
          const closeBtn = await page.$(step.closeModalFirst);
          if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(300);
          }
        } catch (_) {}
      }

      // Viewport resize if required
      if (step.viewport) {
        const curSize = page.viewportSize();
        if (!curSize || curSize.width !== step.viewport.width || curSize.height !== step.viewport.height) {
          await page.setViewportSize(step.viewport);
          await page.waitForTimeout(400);
          await injectVisualOverlay(page);
        }
      }

      // Update step badge text
      await page.evaluate((caption) => {
        const badge = document.getElementById('__vp_step_badge');
        if (badge) {
          badge.textContent = caption;
          badge.style.opacity = '1';
        }
      }, step.caption || step.name);

      // Determine target cursor coordinate
      let targetCoord = step.cursorTarget;
      if (step.selector) {
        try {
          const el = await page.$(step.selector);
          if (el) {
            const box = await el.boundingBox();
            if (box) {
              targetCoord = {
                x: Math.round(box.x + box.width / 2),
                y: Math.round(box.y + box.height / 2)
              };
            }
          }
        } catch (e) {
          console.warn(`[Recorder] Selector lookup: ${step.selector}`, e.message);
        }
      }

      // Graceful fallback coordinate if element not found
      if (!targetCoord) {
        const vp = page.viewportSize() || { width: 1280, height: 750 };
        const factorY = (sIdx + 1) / (steps.length + 1);
        targetCoord = {
          x: Math.round(vp.width * 0.45),
          y: Math.round(vp.height * factorY)
        };
      }

      // Smooth cursor glide (4 waypoints)
      const glideFrames = 4;
      for (let g = 1; g <= glideFrames; g++) {
        const t = g / glideFrames;
        const ease = 1 - Math.pow(1 - t, 3);
        const curX = Math.round(currentCursor.x + (targetCoord.x - currentCursor.x) * ease);
        const curY = Math.round(currentCursor.y + (targetCoord.y - currentCursor.y) * ease);

        await page.evaluate(({ x, y }) => {
          const cur = document.getElementById('__vp_cursor');
          if (cur) {
            cur.style.left = `${x}px`;
            cur.style.top = `${y}px`;
          }
        }, { x: curX, y: curY });

        const buf = await page.screenshot({ type: 'png' });
        frames.push({ buffer: frameOnCanvas(buf, targetWidth, targetHeight), delay: 200 });
      }

      currentCursor = { ...targetCoord };

      // Perform Click or Action
      if (step.action === 'click') {
        // Trigger ripple effect
        await page.evaluate(({ x, y }) => {
          const ripple = document.createElement('div');
          ripple.className = '__vp_click_ripple';
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          document.body.appendChild(ripple);
          setTimeout(() => ripple.remove(), 800);
        }, currentCursor);

        const clickBuf = await page.screenshot({ type: 'png' });
        frames.push({ buffer: frameOnCanvas(clickBuf, targetWidth, targetHeight), delay: 260 });

        // Trigger real mouse click
        if (step.selector) {
          try {
            await page.click(step.selector, { timeout: 2500 }).catch(() => {
              return page.mouse.click(currentCursor.x, currentCursor.y);
            });
          } catch (_) {
            await page.mouse.click(currentCursor.x, currentCursor.y);
          }
        } else {
          await page.mouse.click(currentCursor.x, currentCursor.y);
        }
      } else if (step.action === 'scroll') {
        await page.mouse.wheel(0, step.scrollDelta || 250);
        await page.waitForTimeout(200);
      }

      // Dwell & capture settle frames
      const settleSteps = 4;
      for (let s = 0; s < settleSteps; s++) {
        await page.waitForTimeout(200);
        const settleBuf = await page.screenshot({ type: 'png' });
        frames.push({ buffer: frameOnCanvas(settleBuf, targetWidth, targetHeight), delay: 420 });
      }
    }

    // Final hold frames
    for (let h = 0; h < 3; h++) {
      await page.waitForTimeout(200);
      const holdBuf = await page.screenshot({ type: 'png' });
      frames.push({ buffer: frameOnCanvas(holdBuf, targetWidth, targetHeight), delay: 450 });
    }

    // Finalize video recording
    await page.close();
    const video = page.video();
    if (video) {
      const recordedVideoPath = await video.path();
      fs.copyFileSync(recordedVideoPath, videoPath);
      console.log(`[Recorder] Saved HD Video: ${videoFilename}`);
    }

    await context.close();
    await browser.close();

    // Duration calibration: normalize total runtime to 17.5s (17500ms)
    const targetDurationMs = (options.duration || plan.estimatedDurationSec || 17.5) * 1000;
    const rawTotalMs = frames.reduce((a, b) => a + (b.delay || 100), 0);
    const timeScale = targetDurationMs / Math.max(1000, rawTotalMs);
    frames.forEach(f => {
      f.delay = Math.max(60, Math.round((f.delay || 100) * timeScale));
    });

    console.log(`[Recorder] Collected ${frames.length} frames. Encoding GIF: ${gifFilename}...`);
    const gifResult = await encodeGifFromPngFrames(frames, gifPath, targetWidth, targetHeight, 'crop');
    console.log(`[Recorder] Saved GIF: ${gifFilename} (${(gifResult.size / 1024 / 1024).toFixed(2)} MB)`);

    const videoSize = fs.existsSync(videoPath) ? fs.statSync(videoPath).size : 0;

    return {
      success: true,
      gifFilename,
      videoFilename,
      gifPath,
      videoPath,
      gifUrl: `/outputs/${gifFilename}`,
      videoUrl: `/outputs/${videoFilename}`,
      size: gifResult.size,
      videoSize,
      frameCount: gifResult.frameCount,
      width: targetWidth,
      height: targetHeight,
      resolution: resolutionStr,
      aspectRatio: ratio,
      durationSec: Math.round(frames.reduce((acc, f) => acc + (f.delay || 100), 0) / 1000)
    };
  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }
}

module.exports = {
  recordWalkthrough
};
