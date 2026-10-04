const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { PNG } = require('pngjs');
const { encodeGifFromPngFrames } = require('./src/gifEncoder');

function frameOnCanvas(pngBuffer, canvasWidth, canvasHeight) {
  const src = PNG.sync.read(pngBuffer);
  if (src.width === canvasWidth && src.height === canvasHeight) {
    return pngBuffer;
  }
  const canvas = new PNG({ width: canvasWidth, height: canvasHeight });
  // Fill sleek dark studio background #0a0e17
  for (let i = 0; i < canvasWidth * canvasHeight; i++) {
    canvas.data[i * 4 + 0] = 10;
    canvas.data[i * 4 + 1] = 14;
    canvas.data[i * 4 + 2] = 23;
    canvas.data[i * 4 + 3] = 255;
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

async function injectOverlay(page) {
  await page.evaluate(() => {
    const oldStyles = document.getElementById('__vp_styles');
    if (oldStyles) oldStyles.remove();

    const style = document.createElement('style');
    style.id = '__vp_styles';
    style.innerHTML = `
      #__vp_cursor {
        position: fixed; width: 28px; height: 28px; z-index: 9999999;
        pointer-events: none; filter: drop-shadow(0 3px 8px rgba(0,0,0,0.7));
      }
      .__vp_click_ripple {
        position: fixed; width: 20px; height: 20px; border-radius: 50%;
        border: 3px solid #38bdf8; background: rgba(56, 189, 248, 0.45);
        transform: translate(-50%, -50%); pointer-events: none; z-index: 9999998;
        animation: __vp_r 0.75s ease-out forwards;
      }
      @keyframes __vp_r {
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
        letter-spacing: 0.02em;
      }
    `;
    document.head.appendChild(style);

    let cur = document.getElementById('__vp_cursor');
    if (!cur) {
      cur = document.createElement('div');
      cur.id = '__vp_cursor';
      cur.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M5.5 3.2L18.8 13.6L12.4 14.7L9.5 20.8L7.1 19.6L9.9 13.7L5.5 10.3V3.2Z" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/></svg>';
      document.body.appendChild(cur);
    }

    let badge = document.getElementById('__vp_step_badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = '__vp_step_badge';
      badge.textContent = 'Initializing...';
      document.body.appendChild(badge);
    }
  });
}

async function recordSpec(browser, spec, outputDir) {
  const { width, height, gifName, videoName, mobileW, mobileH, label } = spec;
  console.log(`\n========================================`);
  console.log(`Recording spec: ${label} (${width}x${height})...`);
  console.log(`========================================`);

  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: {
      dir: outputDir,
      size: { width, height }
    }
  });

  const page = await context.newPage();
  const frames = [];
  let currentCursor = { x: Math.round(width * 0.3), y: Math.round(height * 0.25) };

  await page.goto('https://intelligent-curie-alpha.vercel.app/', { waitUntil: 'networkidle' });
  await injectOverlay(page);

  async function glideCursorTo(targetX, targetY, waypoints = 4) {
    for (let w = 1; w <= waypoints; w++) {
      const t = w / waypoints;
      const ease = 1 - Math.pow(1 - t, 3);
      const curX = Math.round(currentCursor.x + (targetX - currentCursor.x) * ease);
      const curY = Math.round(currentCursor.y + (targetY - currentCursor.y) * ease);

      await page.evaluate(({ x, y }) => {
        const cur = document.getElementById('__vp_cursor');
        if (cur) { cur.style.left = `${x}px`; cur.style.top = `${y}px`; }
      }, { x: curX, y: curY });

      const raw = await page.screenshot({ type: 'png' });
      frames.push({ buffer: frameOnCanvas(raw, width, height), delay: 200 });
    }
    currentCursor = { x: targetX, y: targetY };
  }

  async function clickWithRipple() {
    await page.evaluate(({ x, y }) => {
      const ripple = document.createElement('div');
      ripple.className = '__vp_click_ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    }, currentCursor);

    const clickBuf = await page.screenshot({ type: 'png' });
    frames.push({ buffer: frameOnCanvas(clickBuf, width, height), delay: 280 });
  }

  async function settle(count = 3, delay = 350) {
    for (let i = 0; i < count; i++) {
      await page.waitForTimeout(160);
      const buf = await page.screenshot({ type: 'png' });
      frames.push({ buffer: frameOnCanvas(buf, width, height), delay });
    }
  }

  async function setBadge(text) {
    await page.evaluate((caption) => {
      const badge = document.getElementById('__vp_step_badge');
      if (badge) badge.textContent = caption;
    }, text);
  }

  // Step 1: Desktop Split-Panel & Sticky Settings Sidebar
  await setBadge('Desktop Split-Panel & Sticky Settings Sidebar');
  await glideCursorTo(Math.min(width - 150, Math.round(width * 0.75)), Math.round(height * 0.35), 4);
  await settle(3);

  // Step 2: Quick One-Tap Generate
  await setBadge('Quick One-Tap Generation');
  const genBtn = await page.$('button:has-text("Regenerate Password")');
  if (genBtn) {
    const box = await genBtn.boundingBox();
    if (box) {
      await glideCursorTo(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2), 4);
      await clickWithRipple();
      await genBtn.click();
      await settle(4);
    }
  }

  // Step 3: Passphrase Mode Toggle
  await setBadge('Passphrase Mode (correct-horse-battery-staple)');
  const passBtn = await page.$('button:has-text("Passphrase")');
  if (passBtn) {
    const box = await passBtn.boundingBox();
    if (box) {
      await glideCursorTo(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2), 4);
      await clickWithRipple();
      await passBtn.click();
      await settle(4);
    }
  }

  // Step 4: Click QR Code Button
  await setBadge('Vector QR Code SVG Modal Open');
  const qrBtn = await page.$('button[title="Show QR code"], button[aria-label="Toggle QR code"]');
  if (qrBtn) {
    const box = await qrBtn.boundingBox();
    if (box) {
      await glideCursorTo(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2), 4);
      await clickWithRipple();
      await qrBtn.click();
      await settle(4);
    }
  }

  // Step 5: Switch Viewport to Mobile
  await page.setViewportSize({ width: mobileW, height: mobileH });
  await page.waitForTimeout(400);
  await injectOverlay(page);
  await setBadge('Mobile Viewport: Sticky Thumb-Reach Action Bar');
  currentCursor = { x: Math.round(mobileW / 2), y: Math.round(mobileH * 0.6) };

  const mobileGen = await page.$('button:has-text("Generate")');
  if (mobileGen) {
    const box = await mobileGen.boundingBox();
    if (box) {
      await glideCursorTo(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2), 4);
      await clickWithRipple();
      await mobileGen.click();
      await settle(4);
    }
  }

  // Close context to finalize video
  await page.close();
  const video = page.video();
  const recordedVideoPath = await video.path();
  const finalVideoPath = path.join(outputDir, videoName);
  fs.copyFileSync(recordedVideoPath, finalVideoPath);
  console.log(`Video saved: ${videoName}`);

  await context.close();

  // Encode GIF with rgb565 high fidelity
  console.log(`Encoding GIF: ${gifName}...`);
  const finalGifPath = path.join(outputDir, gifName);
  const gifRes = await encodeGifFromPngFrames(frames, finalGifPath, width, height, 'crop');
  console.log(`GIF saved: ${gifName} (${(gifRes.size / 1024 / 1024).toFixed(2)} MB, ${gifRes.frameCount} frames)`);

  return { gifRes, videoPath: finalVideoPath };
}

async function recordAllSpecs() {
  const outputDir = path.join(__dirname, 'public', 'outputs');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const SPECS = [
    // 1:1 Square (1080x1080)
    {
      label: '1:1 Square',
      width: 1080,
      height: 1080,
      mobileW: 420,
      mobileH: 860,
      gifName: 'intelligent_curie_1x1.gif',
      videoName: 'intelligent_curie_1x1.webm'
    },
    // 4:5 Portrait (1080x1350)
    {
      label: '4:5 Portrait',
      width: 1080,
      height: 1350,
      mobileW: 460,
      mobileH: 980,
      gifName: 'intelligent_curie_4x5.gif',
      videoName: 'intelligent_curie_4x5.webm'
    },
    // 1.91:1 Landscape (1200x627)
    {
      label: '1.91:1 Landscape',
      width: 1200,
      height: 627,
      mobileW: 400,
      mobileH: 627,
      gifName: 'intelligent_curie_landscape.gif',
      videoName: 'intelligent_curie_landscape.webm'
    },
    // Natural Standard (1080x648)
    {
      label: 'Natural Standard',
      width: 1080,
      height: 648,
      mobileW: 420,
      mobileH: 648,
      gifName: 'intelligent_curie.gif',
      videoName: 'intelligent_curie.webm'
    }
  ];

  for (const spec of SPECS) {
    await recordSpec(browser, spec, outputDir);
  }

  await browser.close();
  console.log('\nAll specs successfully recorded with crystal-clear resolution & native HD WebM videos!');
}

if (require.main === module) {
  recordAllSpecs().catch(err => {
    console.error('Recording error:', err);
    process.exit(1);
  });
}

module.exports = {
  recordAllSpecs,
  recordSpec
};
