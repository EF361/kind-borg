const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { encodeGifFromPngFrames } = require('./gifEncoder');

/**
 * Renders and animates an architecture flowchart step-by-step, capturing an animated GIF.
 */
async function generateFlowchartGif(options = {}) {
  const outputDir = options.outputDir || path.join(__dirname, 'outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const gifFilename = `flowchart_${timestamp}.gif`;
  const gifPath = path.join(outputDir, gifFilename);

  const title = options.title || 'Microservices & Edge Architecture Flow';
  const nodes = options.nodes || [
    { id: 'client', label: 'Web / Mobile Client', icon: '💻', desc: 'React / Next.js SPA', color: '#06b6d4' },
    { id: 'edge', label: 'Edge Proxy & WAF', icon: '⚡', desc: 'Vercel / Cloudflare Edge', color: '#3b82f6' },
    { id: 'api', label: 'API Gateway Service', icon: '🌐', desc: 'Node.js Express / GraphQL', color: '#8b5cf6' },
    { id: 'auth', label: 'Auth & Session Vault', icon: '🔒', desc: 'OAuth2 / WebCrypto Engine', color: '#ec4899' },
    { id: 'db', label: 'Distributed Database', icon: '🗄️', desc: 'PostgreSQL & Redis Cache', color: '#10b981' }
  ];

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const frames = [];

  try {
    const page = await browser.newPage({
      viewport: { width: 960, height: 540 }
    });

    // Build self-contained HTML for flowchart rendering
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 960px;
            height: 540px;
            background: #0a0e1a;
            color: #f1f5f9;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
          }
          .header {
            padding: 24px 36px 12px 36px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .title { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
          .badge {
            font-size: 11px;
            font-weight: 700;
            background: rgba(6, 182, 212, 0.15);
            color: #06b6d4;
            padding: 4px 10px;
            border-radius: 9999px;
            border: 1px solid rgba(6, 182, 212, 0.3);
          }
          .stage {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 20px 30px;
            position: relative;
          }
          .node {
            width: 150px;
            background: #131c2e;
            border: 2px solid #24344d;
            border-radius: 14px;
            padding: 16px 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
            z-index: 10;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          }
          .node.active {
            border-color: var(--accent);
            transform: translateY(-8px) scale(1.05);
            box-shadow: 0 14px 32px var(--glow);
            background: #1a2740;
          }
          .node-icon { font-size: 28px; margin-bottom: 8px; }
          .node-title { font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px; }
          .node-desc { font-size: 10px; color: #94a3b8; }
          
          .connector {
            position: absolute;
            top: 50%;
            height: 3px;
            background: #1e293b;
            z-index: 5;
            transform: translateY(-50%);
          }
          .packet {
            position: absolute;
            top: -5px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #06b6d4;
            box-shadow: 0 0 12px #06b6d4;
            display: none;
          }
          .timeline-status {
            height: 48px;
            background: #0e1526;
            border-top: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 36px;
            font-size: 12px;
            color: #94a3b8;
          }
          .step-pill {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            color: #38bdf8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="badge">LIVE ARCHITECTURE FLOW</div>
        </div>

        <div class="stage" id="stage">
          ${nodes.map((n, i) => `
            <div class="node" id="node-${i}" style="--accent: ${n.color}; --glow: ${n.color}55;">
              <div class="node-icon">${n.icon}</div>
              <div class="node-title">${n.label}</div>
              <div class="node-desc">${n.desc}</div>
            </div>
          `).join('')}
        </div>

        <div class="timeline-status">
          <div id="status-text">Step 1/5: Client emits request</div>
          <div class="step-pill" id="protocol-text">HTTP/3 · TLS 1.3</div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent);
    await page.waitForTimeout(500);

    // Initial overview frames
    const initBuf = await page.screenshot({ type: 'png' });
    frames.push({ buffer: initBuf, delay: 1000 });

    // Step-by-step sequential propagation
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const stepText = `Step ${i + 1}/${nodes.length}: Processing at [${node.label}]`;
      const protocol = i === 0 ? 'HTTP/3 QUIC' : i === 1 ? 'WAF Filter' : i === 2 ? 'REST / JSON' : i === 3 ? 'HMAC-SHA256' : 'PostgreSQL Pool';

      // Activate node
      await page.evaluate(({ index, text, proto }) => {
        document.querySelectorAll('.node').forEach((n, idx) => {
          if (idx <= index) {
            n.classList.add('active');
          } else {
            n.classList.remove('active');
          }
        });
        document.getElementById('status-text').textContent = text;
        document.getElementById('protocol-text').textContent = proto;
      }, { index: i, text: stepText, proto: protocol });

      // Capture frames for this step
      for (let f = 0; f < 6; f++) {
        await page.waitForTimeout(250);
        const buf = await page.screenshot({ type: 'png' });
        frames.push({ buffer: buf, delay: 280 });
      }
    }

    // Completion / Full circuit frame
    await page.evaluate(() => {
      document.getElementById('status-text').textContent = '✓ Pipeline complete: Response streamed to Client';
      document.getElementById('protocol-text').textContent = '200 OK · 18ms';
    });
    for (let f = 0; f < 5; f++) {
      await page.waitForTimeout(250);
      const buf = await page.screenshot({ type: 'png' });
      frames.push({ buffer: buf, delay: 350 });
    }

    await browser.close();

    console.log(`Flowchart animation complete: ${frames.length} frames. Encoding GIF...`);
    const result = await encodeGifFromPngFrames(frames, gifPath, 720);

    return {
      success: true,
      gifFilename,
      gifPath,
      size: result.size,
      frameCount: result.frameCount,
      width: result.width,
      height: result.height,
      durationSec: Math.round(frames.reduce((a, b) => a + (b.delay || 100), 0) / 1000)
    };
  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }
}

module.exports = {
  generateFlowchartGif
};
