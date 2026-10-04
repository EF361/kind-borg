const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { encodeGifFromPngFrames } = require('./src/gifEncoder');

async function recordLiveUserApp() {
  console.log('Starting Playwright capture for https://intelligent-curie-alpha.vercel.app/ ...');
  const targetUrl = 'https://intelligent-curie-alpha.vercel.app/';

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const frames = [];
  let currentCursor = { x: 300, y: 200 };

  const context = await browser.newContext({
    viewport: { width: 1280, height: 750 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  console.log('Navigating to app...');
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

  // Inject overlay styles and cursor
  await injectOverlay(page);

  // Helper to glide cursor and capture
  async function glideCursorTo(targetX, targetY, waypoints = 6) {
    for (let w = 1; w <= waypoints; w++) {
      const t = w / waypoints;
      const ease = 1 - Math.pow(1 - t, 3);
      const curX = Math.round(currentCursor.x + (targetX - currentCursor.x) * ease);
      const curY = Math.round(currentCursor.y + (targetY - currentCursor.y) * ease);

      await page.evaluate(({ x, y }) => {
        const cur = document.getElementById('__vp_cursor');
        if (cur) { cur.style.left = `${x}px`; cur.style.top = `${y}px`; }
      }, { x: curX, y: curY });

      const buf = await page.screenshot({ type: 'png' });
      frames.push({ buffer: buf, delay: 180 });
    }
    currentCursor = { x: targetX, y: targetY };
  }

  // Helper to click with ripple
  async function clickWithRipple(selector = null) {
    await page.evaluate(({ x, y }) => {
      const ripple = document.createElement('div');
      ripple.className = '__vp_click_ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    }, currentCursor);

    const clickBuf = await page.screenshot({ type: 'png' });
    frames.push({ buffer: clickBuf, delay: 250 });

    if (selector) {
      try {
        await page.click(selector, { timeout: 3000 });
      } catch (_) {
        await page.mouse.click(currentCursor.x, currentCursor.y);
      }
    } else {
      await page.mouse.click(currentCursor.x, currentCursor.y);
    }
  }

  // Helper to settle
  async function settle(count = 5) {
    for (let i = 0; i < count; i++) {
      await page.waitForTimeout(250);
      const buf = await page.screenshot({ type: 'png' });
      frames.push({ buffer: buf, delay: 350 });
    }
  }

  // Helper to set badge
  async function setBadge(text) {
    await page.evaluate((caption) => {
      const badge = document.getElementById('__vp_step_badge');
      if (badge) badge.textContent = caption;
    }, text);
  }

  // Step 1: Desktop Split-Panel & Sticky Settings Sidebar
  console.log('Step 1: Inspect Desktop split panel & sticky settings...');
  await setBadge('Desktop Split-Panel & Sticky Settings Sidebar');
  await glideCursorTo(950, 200, 7);
  await settle(4);

  // Step 2: Quick One-Tap Generate
  console.log('Step 2: Quick one-tap generation...');
  await setBadge('Quick One-Tap Generation');
  const genBtn = await page.$('button[title="Generate new password"], button:has-text("Regenerate Password")');
  if (genBtn) {
    const box = await genBtn.boundingBox();
    if (box) {
      await glideCursorTo(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2));
      await clickWithRipple();
      await settle(5);
    }
  }

  // Step 3: Passphrase Mode Toggle
  console.log('Step 3: Toggling into Passphrase Mode...');
  await setBadge('Passphrase Mode (correct-horse-battery-staple)');
  const passBtn = await page.$('button:has-text("Passphrase")');
  if (passBtn) {
    const box = await passBtn.boundingBox();
    if (box) {
      await glideCursorTo(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2));
      await clickWithRipple();
      await settle(6);
    }
  }

  // Step 4: Click QR Code Button
  console.log('Step 4: Opening QR Code SVG Modal...');
  await setBadge('Vector QR Code SVG Modal Open');
  const qrBtn = await page.$('button[title="Show QR code"], button[aria-label="Toggle QR code"]');
  if (qrBtn) {
    const box = await qrBtn.boundingBox();
    if (box) {
      await glideCursorTo(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2));
      await clickWithRipple();
      await settle(6);
    }
  }

  // Step 5: Switch Viewport to Mobile
  console.log('Step 5: Switching Viewport to Mobile...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await injectOverlay(page);
  await setBadge('Mobile Viewport: Sticky Thumb-Reach Action Bar');

  // Find mobile generate button
  const mobileGen = await page.$('button:has-text("Generate")');
  if (mobileGen) {
    const box = await mobileGen.boundingBox();
    if (box) {
      await glideCursorTo(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2));
      await clickWithRipple();
      await settle(5);
    }
  }

  await browser.close();

  console.log(`Captured ${frames.length} frames. Encoding GIF...`);
  const outputPath = path.join(__dirname, 'public', 'outputs', 'intelligent_curie.gif');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const result = await encodeGifFromPngFrames(frames, outputPath, 720);
  // Also copy to visualproof_latest.gif
  fs.copyFileSync(outputPath, path.join(__dirname, 'public', 'outputs', 'visualproof_latest.gif'));
  fs.copyFileSync(outputPath, path.join(__dirname, 'src', 'outputs', 'visualproof_latest.gif'));

  console.log(`Success! Encoded GIF: ${outputPath} (${result.frameCount} frames, ${Math.round(result.size / 1024)} KB)`);
  return result;
}

async function injectOverlay(page) {
  await page.evaluate(() => {
    const oldStyles = document.getElementById('__vp_styles');
    if (oldStyles) oldStyles.remove();

    const style = document.createElement('style');
    style.id = '__vp_styles';
    style.innerHTML = `
      #__vp_cursor {
        position: fixed; width: 24px; height: 24px; z-index: 9999999;
        pointer-events: none; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
      }
      .__vp_click_ripple {
        position: fixed; width: 16px; height: 16px; border-radius: 50%;
        border: 3px solid #0284c7; background: rgba(2, 132, 199, 0.4);
        transform: translate(-50%, -50%); pointer-events: none; z-index: 9999998;
        animation: __vp_r 0.75s ease-out forwards;
      }
      @keyframes __vp_r {
        0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
      }
      #__vp_step_badge {
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(8px);
        color: #f8fafc; border: 1.5px solid rgba(2, 132, 199, 0.6);
        border-radius: 9999px; padding: 7px 18px; font-family: sans-serif;
        font-size: 13px; font-weight: 700; z-index: 9999999; pointer-events: none;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      }
    `;
    document.head.appendChild(style);

    let cur = document.getElementById('__vp_cursor');
    if (!cur) {
      cur = document.createElement('div');
      cur.id = '__vp_cursor';
      cur.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M5.5 3.2L18.8 13.6L12.4 14.7L9.5 20.8L7.1 19.6L9.9 13.7L5.5 10.3V3.2Z" fill="#0284c7" stroke="#ffffff" stroke-width="1.8"/></svg>`;
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

recordLiveUserApp().catch(e => console.error(e));
