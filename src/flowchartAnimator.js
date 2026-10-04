const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { encodeGifFromPngFrames } = require('./gifEncoder');
const { resolveTechIcon } = require('./techIcons');

/**
 * Renders and animates a clean, minimalistic architecture flowchart step-by-step.
 * Inspired by modern terminal-to-cloud diagrams with authentic tech stack SVG icons.
 * Supports 'multicolor' (brand accents) and 'onecolor' (minimalist electric blue).
 */
async function generateFlowchartGif(options = {}) {
  const outputDir = options.outputDir || path.join(__dirname, 'outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const colorMode = options.colorMode === 'onecolor' ? 'onecolor' : 'multicolor';
  const prefix = options.filenamePrefix || `flowchart_${colorMode}_${timestamp}`;
  const gifFilename = `${prefix}.gif`;
  const videoFilename = `${prefix}.webm`;
  const gifPath = path.join(outputDir, gifFilename);
  const videoPath = path.join(outputDir, videoFilename);

  const title = options.title || 'Enterprise Serverless & Edge Pipeline';
  const rawStages = options.stages || [
    'Web & Mobile Client (React / Next.js)',
    'Edge CDN & WAF (Vercel / Cloudflare)',
    'API Gateway (Node.js Express / GraphQL)',
    'Auth & Session Vault (OAuth2 / WebCrypto)',
    'Distributed Storage (PostgreSQL & Redis)'
  ];

  // Resolve authentic tech icons and brand colors for each stage
  const stages = rawStages.map((text, idx) => {
    const tech = resolveTechIcon(text);
    const nodeColor = colorMode === 'onecolor' ? '#3b82f6' : tech.color;
    return {
      id: `stage-${idx}`,
      rawText: text,
      label: text.split('(')[0].trim(),
      subLabel: text.includes('(') ? text.split('(')[1].replace(')', '').trim() : tech.name,
      iconSvg: tech.svg,
      techName: tech.name,
      color: nodeColor
    };
  });

  const width = 1080;
  const height = 620;

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: {
      dir: outputDir,
      size: { width, height }
    }
  });

  const page = await context.newPage();
  const frames = [];

  try {
    const defaultAccent = colorMode === 'onecolor' ? '#3b82f6' : '#06b6d4';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: ${width}px;
            height: ${height}px;
            background: #080c16;
            color: #f1f5f9;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            user-select: none;
          }

          /* Ambient decorative background grid */
          body::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: 
              radial-gradient(circle at 50% 15%, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
              linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 100% 100%, 40px 40px, 40px 40px;
            pointer-events: none;
          }

          /* Header */
          .header-bar {
            padding: 22px 42px 14px 42px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            z-index: 10;
          }
          .title-group {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .title-icon {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${defaultAccent};
          }
          .title-text {
            font-size: 19px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.02em;
          }
          .theme-pill {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            background: rgba(15, 23, 42, 0.8);
            color: ${defaultAccent};
            padding: 5px 14px;
            border-radius: 9999px;
            border: 1px solid rgba(59, 130, 246, 0.3);
            letter-spacing: 0.04em;
          }

          /* Main Flow Canvas */
          .canvas-flow {
            flex: 1;
            position: relative;
            padding: 24px 36px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 10;
          }

          /* Connecting Arrow Lines */
          .connector-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
          }
          .flow-line {
            stroke: #1e293b;
            stroke-width: 2.5;
            fill: none;
            stroke-dasharray: 6 4;
            transition: stroke 0.4s ease;
          }
          .flow-line.active {
            stroke: ${defaultAccent};
            stroke-dasharray: none;
            filter: drop-shadow(0 0 6px ${defaultAccent}88);
          }

          /* Flow Packet Pulse */
          .flow-packet {
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${defaultAccent};
            box-shadow: 0 0 16px ${defaultAccent}, 0 0 8px #ffffff;
            z-index: 20;
            opacity: 0;
            transform: translate(-50%, -50%);
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }

          /* Node 1: Start Terminal */
          .node-terminal {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: #111827;
            border: 2px solid #334155;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 20px rgba(0,0,0,0.5);
            position: relative;
            z-index: 15;
            transition: all 0.35s ease;
          }
          .node-terminal.start {
            border-color: #3b82f6;
            background: #0f172a;
          }
          .node-terminal.start.active {
            border-color: #60a5fa;
            box-shadow: 0 0 24px rgba(59, 130, 246, 0.5);
            transform: scale(1.08);
          }
          .node-terminal.end.active {
            border-color: #10b981;
            box-shadow: 0 0 24px rgba(16, 185, 129, 0.5);
            transform: scale(1.08);
          }
          .terminal-label {
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #f8fafc;
          }
          .terminal-sub {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            font-weight: 700;
            color: #94a3b8;
          }

          /* Process Stadium Pill Nodes */
          .node-pill {
            width: 152px;
            background: #0f172a;
            border: 1.8px solid #24344d;
            border-radius: 24px;
            padding: 14px 12px 12px 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            z-index: 15;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .node-pill.active {
            border-color: var(--accent);
            transform: translateY(-8px) scale(1.05);
            box-shadow: 0 14px 32px rgba(0,0,0,0.6), 0 0 20px var(--glow);
            background: #141e33;
          }

          /* Tech Icon inside node */
          .tech-icon-frame {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            color: var(--accent);
            transition: all 0.3s ease;
          }
          .node-pill.active .tech-icon-frame {
            background: rgba(255,255,255,0.08);
            border-color: var(--accent);
            box-shadow: 0 0 14px var(--glow);
          }
          .tech-icon-frame svg {
            width: 20px;
            height: 20px;
          }

          .node-name {
            font-size: 12px;
            font-weight: 700;
            color: #ffffff;
            text-align: center;
            line-height: 1.25;
            margin-bottom: 4px;
          }
          .node-subtext {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: 600;
            color: #94a3b8;
            text-align: center;
            margin-bottom: 8px;
          }

          /* Minimalist inner stadium indicator bar (matches reference design) */
          .inner-pill-bar {
            width: 54px;
            height: 6px;
            border-radius: 9999px;
            background: #24344d;
            transition: all 0.3s ease;
          }
          .node-pill.active .inner-pill-bar {
            background: var(--accent);
            box-shadow: 0 0 8px var(--accent);
          }

          /* Decision Diamond Node */
          .node-diamond-wrapper {
            width: 76px;
            height: 76px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 15;
          }
          .diamond-card {
            width: 64px;
            height: 64px;
            background: #0f172a;
            border: 1.8px solid #24344d;
            transform: rotate(45deg);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            transition: all 0.35s ease;
          }
          .node-diamond-wrapper.active .diamond-card {
            border-color: ${defaultAccent};
            box-shadow: 0 0 24px ${defaultAccent}66;
            transform: rotate(45deg) scale(1.08);
            background: #141e33;
          }
          .diamond-content {
            transform: rotate(-45deg);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .diamond-icon {
            font-size: 13px;
            font-weight: 800;
            color: #38bdf8;
          }
          .diamond-label {
            font-size: 9px;
            font-weight: 700;
            color: #f8fafc;
            line-height: 1.1;
          }

          /* Bottom Timeline & Protocol Status Bar */
          .status-bar {
            height: 52px;
            background: #0a0f1d;
            border-top: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 42px;
            font-size: 13px;
            color: #94a3b8;
            z-index: 10;
          }
          .status-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .pulse-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${defaultAccent};
            box-shadow: 0 0 10px ${defaultAccent};
            animation: pulse-ring 1.5s infinite;
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.9); opacity: 0.8; }
            50% { transform: scale(1.4); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.8; }
          }
          .status-message {
            font-weight: 600;
            color: #f1f5f9;
          }
          .status-protocol {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 700;
            color: ${defaultAccent};
            background: rgba(59, 130, 246, 0.1);
            padding: 4px 12px;
            border-radius: 6px;
            border: 1px solid rgba(59, 130, 246, 0.25);
          }
        </style>
      </head>
      <body>
        <div class="header-bar">
          <div class="title-group">
            <div class="title-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div class="title-text">${title}</div>
          </div>
          <div class="theme-pill">${colorMode === 'onecolor' ? 'MONOCHROME BLUE · MINIMALIST' : 'MULTICOLOR · TECH STACK'}</div>
        </div>

        <div class="canvas-flow" id="flow-canvas">
          <!-- Start Terminal -->
          <div class="node-terminal start active" id="terminal-start">
            <div class="terminal-label">START</div>
            <div class="terminal-sub">CLIENT</div>
          </div>

          <!-- Stage 1 Pill -->
          <div class="node-pill" id="stage-node-0" style="--accent: ${stages[0].color}; --glow: ${stages[0].color}44;">
            <div class="tech-icon-frame">${stages[0].iconSvg}</div>
            <div class="node-name">${stages[0].label}</div>
            <div class="node-subtext">${stages[0].subLabel}</div>
            <div class="inner-pill-bar"></div>
          </div>

          <!-- Stage 2 Pill -->
          <div class="node-pill" id="stage-node-1" style="--accent: ${stages[1].color}; --glow: ${stages[1].color}44;">
            <div class="tech-icon-frame">${stages[1].iconSvg}</div>
            <div class="node-name">${stages[1].label}</div>
            <div class="node-subtext">${stages[1].subLabel}</div>
            <div class="inner-pill-bar"></div>
          </div>

          <!-- Decision Diamond (WAF / Auth Check) -->
          <div class="node-diamond-wrapper" id="diamond-node">
            <div class="diamond-card">
              <div class="diamond-content">
                <span class="diamond-icon">◇</span>
                <span class="diamond-label">WAF & AUTH</span>
              </div>
            </div>
          </div>

          <!-- Stage 3 Pill -->
          <div class="node-pill" id="stage-node-2" style="--accent: ${stages[2].color}; --glow: ${stages[2].color}44;">
            <div class="tech-icon-frame">${stages[2].iconSvg}</div>
            <div class="node-name">${stages[2].label}</div>
            <div class="node-subtext">${stages[2].subLabel}</div>
            <div class="inner-pill-bar"></div>
          </div>

          <!-- Stage 4/5 Combined DB & Vault Pill -->
          <div class="node-pill" id="stage-node-3" style="--accent: ${stages[4] ? stages[4].color : stages[3].color}; --glow: ${(stages[4] ? stages[4].color : stages[3].color)}44;">
            <div class="tech-icon-frame">${stages[4] ? stages[4].iconSvg : stages[3].iconSvg}</div>
            <div class="node-name">${stages[4] ? stages[4].label : stages[3].label}</div>
            <div class="node-subtext">${stages[4] ? stages[4].subLabel : stages[3].subLabel}</div>
            <div class="inner-pill-bar"></div>
          </div>

          <!-- End Terminal -->
          <div class="node-terminal end" id="terminal-end">
            <div class="terminal-label">END</div>
            <div class="terminal-sub">200 OK</div>
          </div>

          <!-- SVG Arrows connecting items -->
          <svg class="connector-svg" id="connector-svg">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${defaultAccent}"/>
              </marker>
              <marker id="arrow-dim" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#334155"/>
              </marker>
            </defs>
          </svg>

          <!-- Animated Packet -->
          <div class="flow-packet" id="flow-packet"></div>
        </div>

        <div class="status-bar">
          <div class="status-left">
            <div class="pulse-dot"></div>
            <div class="status-message" id="status-message">Initializing request lifecycle pipeline...</div>
          </div>
          <div class="status-protocol" id="status-protocol">HTTP/3 · TLS 1.3</div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent);
    await page.waitForTimeout(400);

    // Initial frame
    const initBuf = await page.screenshot({ type: 'png' });
    frames.push({ buffer: initBuf, delay: 600 });

    // Step sequences with coordinates and protocol details
    const stepSequence = [
      { targetId: 'terminal-start', message: 'Client initiates request lifecycle', protocol: 'HTTP/3 QUIC · TLS 1.3' },
      { targetId: 'stage-node-0', message: `Client SPA renders and dispatches payload [${stages[0].label}]`, protocol: 'POST /api/v1/auth' },
      { targetId: 'stage-node-1', message: `Edge Proxy validates origin & rate limits [${stages[1].label}]`, protocol: 'WAF Rule · 0ms Edge' },
      { targetId: 'diamond-node', message: 'Security & Token Validation passed: Signature HMAC-SHA256 valid', protocol: 'OAuth2 JWT · Verified' },
      { targetId: 'stage-node-2', message: `API Gateway routes payload to microservices [${stages[2].label}]`, protocol: 'gRPC / GraphQL Schema' },
      { targetId: 'stage-node-3', message: `Database Pool & Redis Cache synchronizes state [${stages[4] ? stages[4].label : stages[3].label}]`, protocol: 'ACID TX · 1.4ms Cache' },
      { targetId: 'terminal-end', message: 'Pipeline complete: Sealed response dispatched to client', protocol: '200 OK · 18ms Roundtrip' }
    ];

    for (let s = 0; s < stepSequence.length; s++) {
      const step = stepSequence[s];

      await page.evaluate(({ seqIdx, stepInfo }) => {
        const target = document.getElementById(stepInfo.targetId);
        if (target) {
          target.classList.add('active');
        }

        const msg = document.getElementById('status-message');
        const proto = document.getElementById('status-protocol');
        if (msg) msg.textContent = stepInfo.message;
        if (proto) proto.textContent = stepInfo.protocol;

        // Position animated packet
        const packet = document.getElementById('flow-packet');
        if (packet && target) {
          const rect = target.getBoundingClientRect();
          packet.style.opacity = '1';
          packet.style.left = (rect.left + rect.width / 2) + 'px';
          packet.style.top = (rect.top + rect.height / 2) + 'px';
        }
      }, { seqIdx: s, stepInfo: step });

      // Capture progression frames
      for (let f = 0; f < 4; f++) {
        await page.waitForTimeout(200);
        const buf = await page.screenshot({ type: 'png' });
        frames.push({ buffer: buf, delay: 280 });
      }
    }

    // Final hold frames with all circuits lit
    await page.evaluate(() => {
      document.getElementById('status-message').textContent = '✓ Pipeline Executed: Zero Bottlenecks · Stream Complete';
      document.getElementById('status-protocol').textContent = 'LATENCY: 18ms';
    });
    for (let f = 0; f < 5; f++) {
      await page.waitForTimeout(200);
      const buf = await page.screenshot({ type: 'png' });
      frames.push({ buffer: buf, delay: 350 });
    }

    // Close page to finalize Playwright WebM video
    await page.close();
    const video = page.video();
    const recordedVideoPath = await video.path();
    fs.copyFileSync(recordedVideoPath, videoPath);
    console.log(`Saved Flowchart HD Video: ${videoFilename}`);

    await context.close();
    await browser.close();

    console.log(`Encoding Flowchart GIF: ${gifFilename} (${frames.length} frames)...`);
    const gifRes = await encodeGifFromPngFrames(frames, gifPath, width, height, 'contain');
    console.log(`Saved Flowchart GIF: ${gifFilename} (${(gifRes.size / 1024 / 1024).toFixed(2)} MB)`);

    return {
      success: true,
      gifFilename,
      videoFilename,
      gifPath,
      videoPath,
      size: gifRes.size,
      videoSize: fs.statSync(videoPath).size,
      frameCount: frames.length,
      width,
      height,
      colorMode,
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
