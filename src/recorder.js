const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { encodeGifFromPngFrames } = require('./gifEncoder');

/**
 * Executes planned steps using Playwright, injecting animated cursor overlays,
 * capturing frame buffers, and producing an optimized 15-20s GIF and video.
 */
async function recordWalkthrough(plan, options = {}) {
  const outputDir = options.outputDir || path.join(__dirname, 'outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const gifFilename = `visualproof_${timestamp}.gif`;
  const gifPath = path.join(outputDir, gifFilename);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const frames = [];
  let currentCursor = { x: 200, y: 200 };

  try {
    const initialViewport = (plan.steps[0] && plan.steps[0].viewport) || { width: 1280, height: 750 };
    const context = await browser.newContext({
      viewport: initialViewport,
      deviceScaleFactor: 1
    });

    const page = await context.newPage();

    // Navigate to target URL
    console.log(`Navigating to ${plan.targetUrl}...`);
    await page.goto(plan.targetUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(err => {
      console.warn('Navigation warning:', err.message);
    });

    // Inject cursor & ripple overlay script
    await injectVisualOverlay(page);

    // Iterate through steps
    for (let sIdx = 0; sIdx < plan.steps.length; sIdx++) {
      const step = plan.steps[sIdx];
      console.log(`Executing step ${sIdx + 1}/${plan.steps.length}: ${step.name}`);

      // Handle close modal prerequisite if switching to mobile
      if (step.closeModalFirst) {
        try {
          const closeBtn = await page.$(step.closeModalFirst);
          if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(400);
          }
        } catch (_) {}
      }

      // Viewport resize if required
      if (step.viewport) {
        const curSize = page.viewportSize();
        if (!curSize || curSize.width !== step.viewport.width || curSize.height !== step.viewport.height) {
          await page.setViewportSize(step.viewport);
          await page.waitForTimeout(500);
          // Re-inject overlay after viewport adjust if needed
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
          console.warn(`Selector lookup failed for ${step.selector}:`, e.message);
        }
      }

      if (!targetCoord) {
        targetCoord = { x: 400, y: 300 };
      }

      // Smooth cursor glide (interpolate 6 waypoints)
      const glideFrames = 6;
      for (let g = 1; g <= glideFrames; g++) {
        const t = g / glideFrames;
        // Ease out cubic
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
        frames.push({ buffer: buf, delay: 180 });
      }

      currentCursor = { ...targetCoord };

      // Perform Click or Hover Action
      if (step.action === 'click') {
        // Trigger ripple effect in browser overlay
        await page.evaluate(({ x, y }) => {
          const ripple = document.createElement('div');
          ripple.className = '__vp_click_ripple';
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          document.body.appendChild(ripple);
          setTimeout(() => ripple.remove(), 800);
        }, currentCursor);

        // Capture frame showing ripple start
        const clickBuf = await page.screenshot({ type: 'png' });
        frames.push({ buffer: clickBuf, delay: 250 });

        // Trigger real Playwright mouse click
        if (step.selector) {
          try {
            await page.click(step.selector, { timeout: 3000 }).catch(() => {
              return page.mouse.click(currentCursor.x, currentCursor.y);
            });
          } catch (_) {
            await page.mouse.click(currentCursor.x, currentCursor.y);
          }
        } else {
          await page.mouse.click(currentCursor.x, currentCursor.y);
        }
      }

      // Dwell & capture settle frames
      const waitTime = step.waitAfterMs || 1500;
      const settleSteps = Math.max(5, Math.floor(waitTime / 250));
      for (let s = 0; s < settleSteps; s++) {
        await page.waitForTimeout(250);
        const settleBuf = await page.screenshot({ type: 'png' });
        frames.push({ buffer: settleBuf, delay: 350 });
      }
    }

    await browser.close();

    console.log(`Collected ${frames.length} total frames. Encoding GIF to ${gifPath}...`);
    // Encode to optimized GIF (scale to max 720px width for fast loading, ultra crisp output)
    const gifResult = await encodeGifFromPngFrames(frames, gifPath, 720);

    return {
      success: true,
      gifFilename,
      gifPath,
      size: gifResult.size,
      frameCount: gifResult.frameCount,
      width: gifResult.width,
      height: gifResult.height,
      durationSec: Math.round(frames.reduce((acc, f) => acc + (f.delay || 100), 0) / 1000)
    };
  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }
}

/**
 * Injects modern cursor pointer, ripple wave effects, and step caption badge.
 */
async function injectVisualOverlay(page) {
  await page.evaluate(() => {
    // Clean up any existing overlay
    const oldStyles = document.getElementById('__vp_styles');
    if (oldStyles) oldStyles.remove();

    const style = document.createElement('style');
    style.id = '__vp_styles';
    style.innerHTML = `
      #__vp_cursor {
        position: fixed;
        width: 24px;
        height: 24px;
        z-index: 9999999;
        pointer-events: none;
        transform: translate(-2px, -2px);
        transition: transform 0.05s ease-out;
        filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4));
      }
      .__vp_click_ripple {
        position: fixed;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 3px solid #06b6d4;
        background: rgba(6, 182, 212, 0.4);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999998;
        animation: __vp_ripple_anim 0.75s ease-out forwards;
      }
      @keyframes __vp_ripple_anim {
        0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
      }
      #__vp_step_badge {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(8px);
        color: #f8fafc;
        border: 1px solid rgba(6, 182, 212, 0.5);
        border-radius: 9999px;
        padding: 8px 20px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.02em;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        z-index: 9999999;
        pointer-events: none;
        transition: opacity 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #__vp_step_badge::before {
        content: '';
        width: 8px;
        height: 8px;
        background: #06b6d4;
        border-radius: 50%;
        box-shadow: 0 0 8px #06b6d4;
      }
    `;
    document.head.appendChild(style);

    // Cursor Element (macOS/Modern style arrow)
    let cur = document.getElementById('__vp_cursor');
    if (!cur) {
      cur = document.createElement('div');
      cur.id = '__vp_cursor';
      cur.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5.5 3.2L18.8 13.6L12.4 14.7L9.5 20.8L7.1 19.6L9.9 13.7L5.5 10.3V3.2Z" fill="#06b6d4"/>
          <path d="M5.5 3.2L18.8 13.6L12.4 14.7L9.5 20.8L7.1 19.6L9.9 13.7L5.5 10.3V3.2Z" stroke="#ffffff" stroke-width="1.8"/>
        </svg>
      `;
      document.body.appendChild(cur);
    }

    // Step Badge Element
    let badge = document.getElementById('__vp_step_badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = '__vp_step_badge';
      badge.textContent = 'Initializing Recording...';
      document.body.appendChild(badge);
    }
  });
}

module.exports = {
  recordWalkthrough
};
