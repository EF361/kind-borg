const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { encodeGifFromPngFrames } = require('./gifEncoder');
const { resolveTechIcon } = require('./techIcons');

/**
 * Renders and animates a clean, minimalistic 2D architecture flowchart.
 * Smooth 60fps-interpolated energy packet flow along curved Bezier conduits.
 * Directly based on the reference layout:
 * Start circle -> Pill 1 -> Diamond 1 -> Pill 2 -> Diamond 2 -> Pill 3 -> Pill 4/Diamond 3 -> End circle
 */
async function generateFlowchartGif(options = {}) {
  const outputDir = options.outputDir || path.join(__dirname, '..', 'public', 'outputs');
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
  const height = 740;

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
            background: #080c15;
            color: #f1f5f9;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            user-select: none;
          }

          /* Ambient dark grid */
          body::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: 
              radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 70%),
              linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 100% 100%, 36px 36px, 36px 36px;
            pointer-events: none;
          }

          /* Header */
          .header-bar {
            padding: 20px 42px 14px 42px;
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
            background: rgba(15, 23, 42, 0.85);
            color: ${defaultAccent};
            padding: 5px 14px;
            border-radius: 9999px;
            border: 1px solid rgba(59, 130, 246, 0.3);
            letter-spacing: 0.04em;
          }

          /* Canvas */
          .canvas-flow {
            flex: 1;
            position: relative;
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
            stroke-width: 2.4;
            fill: none;
            transition: stroke 0.3s ease, filter 0.3s ease;
          }
          .flow-line.active {
            stroke: ${defaultAccent};
            stroke-width: 2.8;
            filter: drop-shadow(0 0 6px ${defaultAccent});
          }

          /* Smooth Energy Packet */
          .flow-packet {
            position: absolute;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #ffffff;
            box-shadow: 0 0 10px #ffffff, 0 0 20px ${defaultAccent}, 0 0 35px ${defaultAccent};
            z-index: 30;
            opacity: 0;
            transform: translate(-50%, -50%);
            pointer-events: none;
            transition: opacity 0.2s ease;
          }

          /* Second parallel packet for branching */
          .flow-packet-sub {
            position: absolute;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #ffffff;
            box-shadow: 0 0 10px #ffffff, 0 0 20px ${defaultAccent}, 0 0 35px ${defaultAccent};
            z-index: 30;
            opacity: 0;
            transform: translate(-50%, -50%);
            pointer-events: none;
          }

          /* Circular Terminals: Start & End */
          .node-terminal {
            width: 78px;
            height: 78px;
            border-radius: 50%;
            background: #101726;
            border: 2px solid #2e3e55;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            position: absolute;
            z-index: 15;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            transform: translate(-50%, -50%);
          }
          .node-terminal.start.active {
            border-color: #60a5fa;
            background: #0f1d38;
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.55);
            transform: translate(-50%, -50%) scale(1.06);
          }
          .node-terminal.end {
            border-color: #1e3a35;
          }
          .node-terminal.end.active {
            border-color: #34d399;
            background: #092620;
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
            transform: translate(-50%, -50%) scale(1.08);
          }
          .terminal-label {
            font-size: 13px;
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

          /* Rounded Stadium / Pill Nodes */
          .node-pill {
            width: 172px;
            background: #0f172a;
            border: 1.8px solid #223249;
            border-radius: 26px;
            padding: 12px 14px 10px 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: absolute;
            z-index: 15;
            box-shadow: 0 8px 24px rgba(0,0,0,0.45);
            transform: translate(-50%, -50%);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .node-pill.active {
            border-color: var(--accent);
            transform: translate(-50%, -50%) scale(1.05);
            box-shadow: 0 12px 30px rgba(0,0,0,0.65), 0 0 22px var(--glow);
            background: #131d33;
          }

          .tech-icon-frame {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 6px;
            color: var(--accent);
            transition: all 0.3s ease;
          }
          .node-pill.active .tech-icon-frame {
            background: rgba(255,255,255,0.08);
            border-color: var(--accent);
            box-shadow: 0 0 12px var(--glow);
          }
          .tech-icon-frame svg {
            width: 18px;
            height: 18px;
          }

          .node-name {
            font-size: 12px;
            font-weight: 700;
            color: #ffffff;
            text-align: center;
            line-height: 1.2;
            margin-bottom: 3px;
          }
          .node-subtext {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: 600;
            color: #94a3b8;
            text-align: center;
            margin-bottom: 7px;
          }

          /* Inner stadium bar */
          .inner-pill-bar {
            width: 60px;
            height: 6px;
            border-radius: 9999px;
            background: #24344d;
            transition: all 0.3s ease;
          }
          .node-pill.active .inner-pill-bar {
            background: var(--accent);
            box-shadow: 0 0 10px var(--accent);
          }

          /* Decision Diamond Nodes */
          .node-diamond-wrapper {
            width: 78px;
            height: 78px;
            position: absolute;
            z-index: 15;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .diamond-card {
            width: 66px;
            height: 66px;
            background: #0f172a;
            border: 1.8px solid #223249;
            transform: rotate(45deg);
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            transition: all 0.3s ease;
          }
          .node-diamond-wrapper.active .diamond-card {
            border-color: ${defaultAccent};
            box-shadow: 0 0 24px ${defaultAccent}66;
            transform: rotate(45deg) scale(1.08);
            background: #131d33;
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

          /* Status Bar */
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
          <!-- Row 1: Start (170, 95), Pill 1 (540, 95), Diamond 1 (900, 95) -->
          <div class="node-terminal start active" id="terminal-start" style="left: 170px; top: 95px;">
            <div class="terminal-label">START</div>
            <div class="terminal-sub">CLIENT</div>
          </div>

          <div class="node-pill" id="stage-node-0" style="left: 540px; top: 95px; --accent: ${stages[0].color}; --glow: ${stages[0].color}44;">
            <div class="tech-icon-frame">${stages[0].iconSvg}</div>
            <div class="node-name">${stages[0].label}</div>
            <div class="node-subtext">${stages[0].subLabel}</div>
            <div class="inner-pill-bar"></div>
          </div>

          <div class="node-diamond-wrapper" id="diamond-node-1" style="left: 900px; top: 95px;">
            <div class="diamond-card">
              <div class="diamond-content">
                <span class="diamond-icon">◇</span>
                <span class="diamond-label">WAF &amp; EDGE</span>
              </div>
            </div>
          </div>

          <!-- Row 2: Diamond 2 (540, 260), Pill 2 (900, 260) -->
          <div class="node-pill" id="stage-node-1" style="left: 900px; top: 260px; --accent: ${stages[1].color}; --glow: ${stages[1].color}44;">
            <div class="tech-icon-frame">${stages[1].iconSvg}</div>
            <div class="node-name">${stages[1].label}</div>
            <div class="node-subtext">${stages[1].subLabel}</div>
            <div class="inner-pill-bar"></div>
          </div>

          <div class="node-diamond-wrapper" id="diamond-node-2" style="left: 540px; top: 260px;">
            <div class="diamond-card">
              <div class="diamond-content">
                <span class="diamond-icon">◇</span>
                <span class="diamond-label">AUTH TOKEN</span>
              </div>
            </div>
          </div>

          <!-- Row 3: Pill 4 (170, 425), Pill 3 (540, 425), Diamond 3 (900, 425) -->
          <div class="node-pill" id="stage-node-3" style="left: 170px; top: 425px; --accent: ${stages[3].color}; --glow: ${stages[3].color}44;">
            <div class="tech-icon-frame">${stages[3].iconSvg}</div>
            <div class="node-name">${stages[3].label}</div>
            <div class="node-subtext">${stages[3].subLabel}</div>
            <div class="inner-pill-bar"></div>
          </div>

          <div class="node-pill" id="stage-node-2" style="left: 540px; top: 425px; --accent: ${stages[2].color}; --glow: ${stages[2].color}44;">
            <div class="tech-icon-frame">${stages[2].iconSvg}</div>
            <div class="node-name">${stages[2].label}</div>
            <div class="node-subtext">${stages[2].subLabel}</div>
            <div class="inner-pill-bar"></div>
          </div>

          <div class="node-diamond-wrapper" id="diamond-node-3" style="left: 900px; top: 425px;">
            <div class="diamond-card">
              <div class="diamond-content">
                <span class="diamond-icon">◇</span>
                <span class="diamond-label">${stages[4] ? stages[4].label : 'DATA TX'}</span>
              </div>
            </div>
          </div>

          <!-- Row 4: End terminal (900, 560) -->
          <div class="node-terminal end" id="terminal-end" style="left: 900px; top: 560px;">
            <div class="terminal-label">END</div>
            <div class="terminal-sub">200 OK</div>
          </div>

          <!-- SVG Arrows connecting items with smooth rounded Bezier elbow for line 8 -->
          <svg class="connector-svg" id="connector-svg">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${defaultAccent}"/>
              </marker>
              <marker id="arrow-dim" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1e293b"/>
              </marker>
            </defs>
          </svg>

          <!-- Smooth Energy Packet -->
          <div class="flow-packet" id="flow-packet"></div>
          <div class="flow-packet-sub" id="flow-packet-sub"></div>
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
    await page.waitForTimeout(200);

    // Inject SVG lines with smooth Bezier curve on the bottom elbow
    await page.evaluate(() => {
      const svg = document.getElementById('connector-svg');
      if (!svg) return;

      const lines = [
        { id: 'flow-line-0', d: 'M 215 95 L 450 95' }, // Start -> Pill 1
        { id: 'flow-line-1', d: 'M 630 95 L 850 95' }, // Pill 1 -> Diamond 1
        { id: 'flow-line-2', d: 'M 900 145 L 900 220' }, // Diamond 1 -> Pill 2
        { id: 'flow-line-3', d: 'M 810 260 L 590 260' }, // Pill 2 -> Diamond 2
        { id: 'flow-line-4', d: 'M 540 310 L 540 385' }, // Diamond 2 -> Pill 3
        { id: 'flow-line-5', d: 'M 450 425 L 260 425' }, // Pill 3 -> Pill 4
        { id: 'flow-line-6', d: 'M 630 425 L 850 425' }, // Pill 3 -> Diamond 3
        { id: 'flow-line-7', d: 'M 900 475 L 900 518' }, // Diamond 3 -> End
        { id: 'flow-line-8', d: 'M 170 465 L 170 535 Q 170 560 195 560 L 855 560' } // Pill 4 -> smooth curve -> End
      ];

      lines.forEach(lineDef => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', lineDef.id);
        path.setAttribute('class', 'flow-line');
        path.setAttribute('d', lineDef.d);
        path.setAttribute('marker-end', 'url(#arrow-dim)');
        svg.appendChild(path);
      });
    });

    // Helper: capture frame
    async function capture(delay = 75) {
      const buf = await page.screenshot({ type: 'png' });
      frames.push({ buffer: buf, delay });
    }

    // Initial frame
    await capture(300);

    // Cubic ease-in-out helper
    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Sequence of transitions
    const segments = [
      {
        lineId: 'flow-line-0',
        targetId: 'stage-node-0',
        message: `Client SPA renders and dispatches payload [${stages[0].label}]`,
        protocol: 'POST /api/v1/auth',
        steps: 8
      },
      {
        lineId: 'flow-line-1',
        targetId: 'diamond-node-1',
        message: 'Edge WAF inspection & Rate Limit verified',
        protocol: 'WAF Rule 0ms · Passed',
        steps: 8
      },
      {
        lineId: 'flow-line-2',
        targetId: 'stage-node-1',
        message: `Edge CDN proxies request to nearest region [${stages[1].label}]`,
        protocol: 'Edge Cache · Pop SFO',
        steps: 7
      },
      {
        lineId: 'flow-line-3',
        targetId: 'diamond-node-2',
        message: 'HMAC-SHA256 Token Signature Authenticated',
        protocol: 'OAuth2 JWT · Valid',
        steps: 8
      },
      {
        lineId: 'flow-line-4',
        targetId: 'stage-node-2',
        message: `API Gateway routes payload to microservices [${stages[2].label}]`,
        protocol: 'gRPC / GraphQL Schema',
        steps: 7
      },
      {
        lineId: 'flow-line-5',
        targetId: 'stage-node-3',
        message: `Auth & Session Vault verifies air-gapped claim [${stages[3].label}]`,
        protocol: 'Zero-Knowledge Proof',
        steps: 7
      },
      {
        lineId: 'flow-line-6',
        targetId: 'diamond-node-3',
        message: 'Distributed DB & Redis cache commits state transaction',
        protocol: 'ACID TX · 1.4ms Cache',
        steps: 7
      },
      {
        lineId: 'flow-line-7',
        targetId: 'terminal-end',
        message: 'Pipeline complete: Sealed 200 OK dispatched to client',
        protocol: '200 OK · 18ms Roundtrip',
        steps: 6
      },
      {
        lineId: 'flow-line-8',
        targetId: 'terminal-end',
        message: 'Session Token synchronized across edge nodes',
        protocol: 'Global Sync · 200 OK',
        steps: 9
      }
    ];

    // Animate each segment smoothly
    for (let sIdx = 0; sIdx < segments.length; sIdx++) {
      const seg = segments[sIdx];

      // Activate line
      await page.evaluate(({ lineId }) => {
        const line = document.getElementById(lineId);
        if (line) {
          line.classList.add('active');
          line.setAttribute('marker-end', 'url(#arrow)');
        }
      }, { lineId: seg.lineId });

      // Animate packet fluidly along line
      for (let f = 1; f <= seg.steps; f++) {
        const rawT = f / seg.steps;
        const easedT = easeInOut(rawT);

        await page.evaluate(({ lineId, t }) => {
          const line = document.getElementById(lineId);
          const packet = document.getElementById('flow-packet');
          if (line && packet) {
            const len = line.getTotalLength();
            const pt = line.getPointAtLength(len * t);
            packet.style.opacity = '1';
            packet.style.left = `${Math.round(pt.x)}px`;
            packet.style.top = `${Math.round(pt.y)}px`;
          }
        }, { lineId: seg.lineId, t: easedT });

        await capture(75);
      }

      // Destination node lights up upon packet arrival!
      await page.evaluate(({ targetId, message, protocol }) => {
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');

        const msg = document.getElementById('status-message');
        const proto = document.getElementById('status-protocol');
        if (msg) msg.textContent = message;
        if (proto) proto.textContent = protocol;
      }, { targetId: seg.targetId, message: seg.message, protocol: seg.protocol });

      // Linger on node arrival for visual punch
      await capture(120);
    }

    // Final hold frames: all circuits lit, complete pipeline loop
    await page.evaluate(() => {
      document.getElementById('status-message').textContent = '✓ Pipeline Executed: Zero Bottlenecks · Stream Complete';
      document.getElementById('status-protocol').textContent = 'LATENCY: 18ms';
      document.querySelectorAll('.flow-line').forEach(line => {
        line.classList.add('active');
        line.setAttribute('marker-end', 'url(#arrow)');
      });
      const p1 = document.getElementById('flow-packet');
      const p2 = document.getElementById('flow-packet-sub');
      if (p1) p1.style.opacity = '0';
      if (p2) p2.style.opacity = '0';
    });

    for (let h = 0; h < 4; h++) {
      await capture(300);
    }

    // Finalize video
    await page.close();
    const video = page.video();
    if (video) {
      const recordedVideoPath = await video.path();
      fs.copyFileSync(recordedVideoPath, videoPath);
      console.log(`[Flowchart] Saved Smooth HD Video: ${videoFilename}`);
    }

    await context.close();
    await browser.close();

    console.log(`[Flowchart] Collected ${frames.length} frames. Encoding GIF: ${gifFilename}...`);
    const gifRes = await encodeGifFromPngFrames(frames, gifPath, width, height, 'contain');
    console.log(`[Flowchart] Saved Smooth GIF: ${gifFilename} (${(gifRes.size / 1024 / 1024).toFixed(2)} MB)`);

    const videoSize = fs.existsSync(videoPath) ? fs.statSync(videoPath).size : 0;

    return {
      success: true,
      gifFilename,
      videoFilename,
      gifPath,
      videoPath,
      gifUrl: `/outputs/${gifFilename}`,
      videoUrl: `/outputs/${videoFilename}`,
      size: gifRes.size,
      videoSize,
      frameCount: frames.length,
      width,
      height,
      colorMode,
      durationSec: Math.round(frames.reduce((a, b) => a + (b.delay || 75), 0) / 1000)
    };
  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }
}

module.exports = {
  generateFlowchartGif
};
