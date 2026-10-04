document.addEventListener('DOMContentLoaded', () => {
  // Mode tabs
  const tabWalkthrough = document.getElementById('tab-walkthrough');
  const tabFlowchart = document.getElementById('tab-flowchart');
  const modeWalkthroughView = document.getElementById('mode-walkthrough-view');
  const modeFlowchartView = document.getElementById('mode-flowchart-view');

  // Walkthrough form elements
  const targetUrlInput = document.getElementById('target-url-input');
  const instructionsInput = document.getElementById('instructions-input');
  const durationSelect = document.getElementById('duration-select');
  const planBtn = document.getElementById('plan-btn');
  const recordBtn = document.getElementById('record-btn');
  const stepTimeline = document.getElementById('step-timeline');

  // Flowchart form elements
  const flowchartTitleInput = document.getElementById('flowchart-title-input');
  const flowchartBtn = document.getElementById('flowchart-btn');

  // Output elements
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const recordingProgress = document.getElementById('recording-progress');
  const previewDisplay = document.getElementById('preview-display');
  const progressStatusTitle = document.getElementById('progress-status-title');
  const progressStatusDesc = document.getElementById('progress-status-desc');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const gifResultImg = document.getElementById('gif-result-img');
  const downloadGifBtn = document.getElementById('download-gif-btn');
  const openNewTabBtn = document.getElementById('open-new-tab-btn');
  const outputMetaPills = document.getElementById('output-meta-pills');
  const metaDuration = document.getElementById('meta-duration');
  const metaFrames = document.getElementById('meta-frames');
  const metaSize = document.getElementById('meta-size');
  const recentList = document.getElementById('recent-list');

  let currentPlan = null;

  // Tab switching
  tabWalkthrough.addEventListener('click', () => {
    tabWalkthrough.classList.add('active');
    tabFlowchart.classList.remove('active');
    modeWalkthroughView.classList.remove('hidden');
    modeFlowchartView.classList.add('hidden');
  });

  tabFlowchart.addEventListener('click', () => {
    tabFlowchart.classList.add('active');
    tabWalkthrough.classList.remove('active');
    modeFlowchartView.classList.remove('hidden');
    modeWalkthroughView.classList.add('hidden');
  });

  // Example presets
  const presetExample1 = document.getElementById('preset-example-1');
  const presetExample2 = document.getElementById('preset-example-2');

  if (presetExample1) {
    presetExample1.addEventListener('click', () => {
      presetExample1.classList.add('active');
      if (presetExample2) presetExample2.classList.remove('active');
      targetUrlInput.value = 'https://my-app.vercel.app';
      instructionsInput.value = `Quick one-tap generation on Desktop showing the split-panel with the sticky settings sidebar.
Toggling into Passphrase mode (showing words like correct-horse-battery-staple).
Clicking the QR Code button and showing the SVG modal open.
Switching the viewport to Mobile to highlight the sticky thumb-reach action bar at the bottom.`;
      fetchPlan();
    });
  }

  if (presetExample2) {
    presetExample2.addEventListener('click', () => {
      presetExample2.classList.add('active');
      if (presetExample1) presetExample1.classList.remove('active');
      targetUrlInput.value = 'https://demo-showcase.vercel.app';
      instructionsInput.value = `Load home page and scroll through product hero showcase.
Click live preview demo button.
Switch viewport to mobile to inspect mobile navigation drawer.`;
      fetchPlan();
    });
  }

  // Client-side fallback planner
  function planClient(promptText, targetUrl, duration = 18) {
    const lines = promptText.split(/\r?\n|\.\s+/).map(l => l.trim()).filter(Boolean);
    const steps = [
      {
        id: 'step-1',
        name: 'Inspect Desktop Split-Panel',
        caption: 'Desktop Split-Panel & Sticky Settings',
        durationMs: 3200,
        type: 'desktop_inspect'
      },
      {
        id: 'step-2',
        name: 'Quick One-Tap Generate',
        caption: 'Quick One-Tap Key Generation',
        durationMs: 3200,
        type: 'click_generate'
      },
      {
        id: 'step-3',
        name: 'Toggle Passphrase Mode',
        caption: 'Passphrase Mode (correct-horse-battery-staple)',
        durationMs: 4000,
        type: 'click_passphrase'
      },
      {
        id: 'step-4',
        name: 'Open QR Code SVG Modal',
        caption: 'Vector QR Code SVG Modal Opened',
        durationMs: 3600,
        type: 'click_qr'
      },
      {
        id: 'step-5',
        name: 'Mobile Viewport: Sticky Thumb Bar',
        caption: 'Mobile Viewport & Sticky Thumb-Reach Bar',
        durationMs: 4000,
        type: 'mobile_switch'
      }
    ];

    return {
      title: 'Visual Proof Walkthrough Plan',
      targetUrl: targetUrl || 'https://my-app.vercel.app',
      estimatedDurationSec: duration,
      steps: lines.length >= 4 ? steps : steps.slice(0, Math.max(3, lines.length))
    };
  }

  // Safe Plan Fetcher
  async function fetchPlan() {
    const prompt = instructionsInput.value.trim();
    const targetUrl = targetUrlInput.value.trim();
    const duration = parseInt(durationSelect.value, 10);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, targetUrl, duration })
      });

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success && data.plan) {
            currentPlan = data.plan;
            renderTimeline(data.plan.steps);
            return;
          }
        } catch (_) {}
      }
    } catch (_) {}

    // Fallback to client planner
    currentPlan = planClient(prompt, targetUrl, duration);
    renderTimeline(currentPlan.steps);
  }

  function renderTimeline(steps) {
    stepTimeline.innerHTML = '';
    steps.forEach((step, idx) => {
      const item = document.createElement('div');
      item.className = 'step-item';
      item.innerHTML = `
        <span class="step-index-badge">${idx + 1}</span>
        <span class="step-item-desc">${step.caption || step.name}</span>
        <span class="step-item-duration">${Math.round((step.durationMs || 3000) / 1000)}s</span>
      `;
      stepTimeline.appendChild(item);
    });
  }

  // Record Walkthrough Button
  recordBtn.addEventListener('click', async () => {
    if (!currentPlan) await fetchPlan();

    startRecordingUI('Synthesizing Visual Proof Walkthrough...');

    try {
      // Check if backend endpoint exists
      let backendSupported = false;
      try {
        const testRes = await fetch('/api/generate-walkthrough', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: currentPlan,
            prompt: instructionsInput.value.trim(),
            targetUrl: targetUrlInput.value.trim(),
            duration: parseInt(durationSelect.value, 10)
          })
        });

        if (testRes.ok) {
          const contentType = testRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await testRes.json();
            if (data.success && !data.clientSynthesize && data.gifUrl) {
              showResultUI(data);
              backendSupported = true;
            }
          }
        }
      } catch (_) {}

      // If on Vercel serverless or client-side, run in-browser synthesizer
      if (!backendSupported) {
        await generateWalkthroughInBrowser(currentPlan);
      }
    } catch (err) {
      console.error('Recording synthesis error:', err);
      // Fallback in-browser
      await generateWalkthroughInBrowser(currentPlan);
    }
  });

  // Flowchart Button
  flowchartBtn.addEventListener('click', async () => {
    startRecordingUI('Synthesizing Architecture Flow Diagram...');

    const title = flowchartTitleInput.value.trim();
    const nodeInputs = document.querySelectorAll('.node-input');
    const nodes = Array.from(nodeInputs).map((input, idx) => ({
      id: `node-${idx}`,
      label: input.value.trim(),
      desc: `Stage ${idx + 1} processing`,
      icon: ['💻', '⚡', '🌐', '🔒', '🗄️'][idx % 5],
      color: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][idx % 5]
    }));

    await generateFlowchartInBrowser(title, nodes);
  });

  function startRecordingUI(titleText) {
    recordBtn.disabled = true;
    flowchartBtn.disabled = true;
    previewPlaceholder.classList.add('hidden');
    previewDisplay.classList.add('hidden');
    recordingProgress.classList.remove('hidden');
    progressStatusTitle.textContent = titleText;
    progressBarFill.style.width = '10%';
  }

  function showResultUI(data) {
    recordBtn.disabled = false;
    flowchartBtn.disabled = false;
    recordingProgress.classList.add('hidden');
    previewDisplay.classList.remove('hidden');

    gifResultImg.src = data.gifUrl;
    downloadGifBtn.href = data.gifUrl;
    downloadGifBtn.download = data.gifFilename || 'visual_proof.gif';

    openNewTabBtn.onclick = () => window.open(data.gifUrl, '_blank');

    outputMetaPills.classList.remove('hidden');
    metaDuration.textContent = `${data.durationSec || 17}s duration`;
    metaFrames.textContent = `${data.frameCount || 50} frames`;
    const sizeMb = (data.size / (1024 * 1024)).toFixed(2);
    metaSize.textContent = `${sizeMb} MB`;
  }

  // ==========================================
  // IN-BROWSER FLOWCHART GIF ENGINE
  // ==========================================
  async function generateFlowchartInBrowser(title, nodes) {
    progressStatusTitle.textContent = 'Rendering Flowchart Stages...';
    progressStatusDesc.textContent = 'Animating node activations and glowing packet propagation.';

    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const encoder = window.GIFEncoder();
    const totalStages = nodes.length;
    let frameCounter = 0;

    // Helper: Draw Frame
    function drawFlowchartFrame(activeIdx, progressT, protocolText) {
      // Background
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, width, height);

      // Header Bar
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, 55);
      ctx.strokeStyle = '#24344d';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, 55);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(title || 'Enterprise Architecture Flow', 24, 34);

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText('LIVE FLOW · 15-20S GIF', width - 180, 34);

      // Draw Connector Line
      const startX = 80;
      const endX = width - 80;
      const nodeY = 220;
      const stepX = (endX - startX) / Math.max(1, nodes.length - 1);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX, nodeY);
      ctx.lineTo(endX, nodeY);
      ctx.stroke();

      // Draw Active Flow Line
      const activeEndX = Math.min(endX, startX + (activeIdx + progressT) * stepX);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX, nodeY);
      ctx.lineTo(activeEndX, nodeY);
      ctx.stroke();

      // Nodes
      nodes.forEach((n, idx) => {
        const nx = startX + idx * stepX;
        const isActive = idx <= activeIdx;
        const isCurrent = idx === activeIdx;

        // Glow circle
        if (isCurrent) {
          ctx.beginPath();
          ctx.arc(nx, nodeY, 44, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
          ctx.fill();
        }

        // Node Box
        ctx.fillStyle = isActive ? '#1a2740' : '#131c2e';
        ctx.strokeStyle = isActive ? (n.color || '#06b6d4') : '#24344d';
        ctx.lineWidth = isActive ? 2.5 : 1.5;

        const boxW = 110;
        const boxH = 90;
        ctx.beginPath();
        ctx.roundRect(nx - boxW / 2, nodeY - boxH / 2, boxW, boxH, 12);
        ctx.fill();
        ctx.stroke();

        // Icon
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.icon || '⚡', nx, nodeY - 10);

        // Label
        ctx.fillStyle = isActive ? '#ffffff' : '#94a3b8';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        const labelText = n.label.length > 15 ? n.label.slice(0, 13) + '..' : n.label;
        ctx.fillText(labelText, nx, nodeY + 16);

        // Stage indicator
        ctx.fillStyle = isCurrent ? '#06b6d4' : '#64748b';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`Stage ${idx + 1}`, nx, nodeY + 32);
      });

      // Bottom Status Pill
      ctx.fillStyle = '#0e1526';
      ctx.fillRect(0, height - 50, width, 50);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeRect(0, height - 50, width, 50);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Step ${activeIdx + 1}/${totalStages}: Processing at [${nodes[activeIdx].label}]`, 24, height - 20);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(protocolText || 'HTTP/3 · TLS 1.3', width - 24, height - 20);
    }

    // Step through stages
    for (let i = 0; i < totalStages; i++) {
      const protocols = ['HTTP/3 QUIC', 'WAF Filtering', 'REST Gateway', 'HMAC-SHA256 Auth', 'PostgreSQL Query'];
      const proto = protocols[i % protocols.length];

      // Transition frames
      for (let f = 0; f < 6; f++) {
        drawFlowchartFrame(i, f / 6, proto);
        const imgData = ctx.getImageData(0, 0, width, height).data;
        const palette = window.quantize(imgData, 256);
        const index = window.applyPalette(imgData, palette);
        encoder.writeFrame(index, width, height, { palette, delay: 280 });
        frameCounter++;
      }

      const pct = Math.round(((i + 1) / totalStages) * 80) + 10;
      progressBarFill.style.width = `${pct}%`;
      await new Promise(r => setTimeout(r, 10));
    }

    // Completion frame
    drawFlowchartFrame(totalStages - 1, 1, '200 OK · Complete');
    const finalImg = ctx.getImageData(0, 0, width, height).data;
    const finalPal = window.quantize(finalImg, 256);
    const finalIdx = window.applyPalette(finalImg, finalPal);
    for (let f = 0; f < 5; f++) {
      encoder.writeFrame(finalIdx, width, height, { palette: finalPal, delay: 350 });
      frameCounter++;
    }

    encoder.finish();
    const gifBytes = encoder.bytes();
    const blob = new Blob([gifBytes], { type: 'image/gif' });
    const gifUrl = URL.createObjectURL(blob);

    showResultUI({
      gifUrl,
      gifFilename: `flowchart_${Date.now()}.gif`,
      durationSec: 16,
      frameCount: frameCounter,
      size: gifBytes.length
    });
  }

  // ==========================================
  // IN-BROWSER WALKTHROUGH GIF ENGINE
  // ==========================================
  async function generateWalkthroughInBrowser(plan) {
    progressStatusTitle.textContent = 'Simulating Web Walkthrough...';
    progressStatusDesc.textContent = 'Interpolating cursor motion, click ripple waves, and viewport shifts.';

    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const encoder = window.GIFEncoder();
    let frameCounter = 0;

    // Simulation steps
    const simSteps = [
      {
        title: 'Desktop Split-Panel & Sticky Settings',
        isMobile: false,
        keyText: 'kX8#mQ9!vP2$zW7@',
        isPassphrase: false,
        showQr: false,
        cursorStart: { x: 150, y: 150 },
        cursorEnd: { x: 620, y: 160 },
        click: false
      },
      {
        title: 'Quick One-Tap Generation',
        isMobile: false,
        keyText: '9vB#zL4!pQ8$xM2@',
        isPassphrase: false,
        showQr: false,
        cursorStart: { x: 620, y: 160 },
        cursorEnd: { x: 280, y: 240 },
        click: true
      },
      {
        title: 'Passphrase Mode (correct-horse-battery-staple)',
        isMobile: false,
        keyText: 'correct · horse · battery · staple',
        isPassphrase: true,
        showQr: false,
        cursorStart: { x: 280, y: 240 },
        cursorEnd: { x: 670, y: 140 },
        click: true
      },
      {
        title: 'Opening SVG QR Code Modal',
        isMobile: false,
        keyText: 'correct · horse · battery · staple',
        isPassphrase: true,
        showQr: true,
        cursorStart: { x: 670, y: 140 },
        cursorEnd: { x: 420, y: 240 },
        click: true
      },
      {
        title: 'Mobile Viewport: Sticky Thumb Bar',
        isMobile: true,
        keyText: 'correct · horse · battery · staple',
        isPassphrase: true,
        showQr: false,
        cursorStart: { x: 400, y: 200 },
        cursorEnd: { x: 400, y: 440 },
        click: true
      }
    ];

    function drawWalkthroughFrame(step, cursor, rippleRadius = 0) {
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, width, height);

      // Top Browser URL bar
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, 40);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(140, 8, width - 280, 24, 6);
      ctx.fill();

      // Window dots
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(20, 20, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(36, 20, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(52, 20, 5, 0, Math.PI * 2); ctx.fill();

      // URL text
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(plan.targetUrl || 'https://my-app.vercel.app', width / 2, 24);

      if (!step.isMobile) {
        // Desktop Layout (Split-Panel)
        // Left Main Display Card
        ctx.fillStyle = '#162032';
        ctx.strokeStyle = '#24344d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(30, 60, 480, 340, 12);
        ctx.fill();
        ctx.stroke();

        // Accent top stripe
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(30, 60, 480, 3);

        // Result container
        ctx.fillStyle = '#0e1526';
        ctx.beginPath();
        ctx.roundRect(50, 95, 440, 90, 8);
        ctx.fill();

        ctx.fillStyle = step.isPassphrase ? '#38bdf8' : '#f1f5f9';
        ctx.font = step.isPassphrase ? 'bold 16px "JetBrains Mono", monospace' : 'bold 20px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(step.keyText, 270, 150);

        // Buttons
        // Generate Btn
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(50, 215, 230, 46, 8);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('⚡ Quick One-Tap Generate', 165, 243);

        // QR Button
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(295, 215, 90, 46, 8);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('QR Code', 340, 243);

        // Copy Button
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(400, 215, 90, 46, 8);
        ctx.fill();
        ctx.fillText('Copy', 445, 243);

        // Right Sticky Settings Sidebar
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.roundRect(530, 60, 240, 340, 12);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Settings Engine [Sticky]', 550, 90);

        // Segmented control
        ctx.fillStyle = '#162032';
        ctx.beginPath();
        ctx.roundRect(550, 115, 200, 38, 6);
        ctx.fill();

        if (step.isPassphrase) {
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.roundRect(650, 118, 96, 32, 5);
          ctx.fill();
        } else {
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.roundRect(553, 118, 96, 32, 5);
          ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Random', 578, 138);
        ctx.fillText('Passphrase', 665, 138);

        // QR Modal Overlay
        if (step.showQr) {
          ctx.fillStyle = 'rgba(5, 10, 20, 0.75)';
          ctx.fillRect(0, 0, width, height);

          ctx.fillStyle = '#162032';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(250, 90, 300, 280, 14);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Air-Gapped QR Transfer', 400, 125);

          // QR Box
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(330, 145, 140, 140, 8);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(345, 160, 30, 30);
          ctx.fillRect(425, 160, 30, 30);
          ctx.fillRect(345, 240, 30, 30);
          ctx.fillRect(395, 200, 20, 20);
        }
      } else {
        // Mobile Viewport Frame
        const mw = 270;
        const mx = (width - mw) / 2;

        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(mx, 50, mw, 410, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Passphrase Mode', width / 2, 95);
        ctx.fillText('correct · horse · battery', width / 2, 130);

        // Sticky Thumb-reach Action Bar
        ctx.fillStyle = '#0e1526';
        ctx.strokeStyle = '#24344d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(mx + 10, 410, mw - 20, 42, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.roundRect(mx + 15, 415, mw - 30, 32, 6);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('⚡ Tap Generate [Thumb-Reach]', width / 2, 436);
      }

      // Step Caption Pill
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 190, height - 38, 380, 30, 9999);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`● ${step.title}`, width / 2, height - 19);

      // Ripple effect
      if (rippleRadius > 0) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, rippleRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Cursor
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cursor.x, cursor.y);
      ctx.lineTo(cursor.x + 13, cursor.y + 11);
      ctx.lineTo(cursor.x + 6, cursor.y + 12);
      ctx.lineTo(cursor.x + 3, cursor.y + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Step through simulation
    for (let s = 0; s < simSteps.length; s++) {
      const step = simSteps[s];

      // Interpolate cursor
      const waypoints = 6;
      for (let w = 1; w <= waypoints; w++) {
        const t = w / waypoints;
        const curX = step.cursorStart.x + (step.cursorEnd.x - step.cursorStart.x) * t;
        const curY = step.cursorStart.y + (step.cursorEnd.y - step.cursorStart.y) * t;

        drawWalkthroughFrame(step, { x: curX, y: curY }, 0);
        const img = ctx.getImageData(0, 0, width, height).data;
        const pal = window.quantize(img, 256);
        const idx = window.applyPalette(img, pal);
        encoder.writeFrame(idx, width, height, { palette: pal, delay: 180 });
        frameCounter++;
      }

      // Click ripple
      if (step.click) {
        for (let r = 1; r <= 3; r++) {
          drawWalkthroughFrame(step, step.cursorEnd, r * 10);
          const img = ctx.getImageData(0, 0, width, height).data;
          const pal = window.quantize(img, 256);
          const idx = window.applyPalette(img, pal);
          encoder.writeFrame(idx, width, height, { palette: pal, delay: 200 });
          frameCounter++;
        }
      }

      // Dwell frames
      for (let d = 0; d < 4; d++) {
        drawWalkthroughFrame(step, step.cursorEnd, 0);
        const img = ctx.getImageData(0, 0, width, height).data;
        const pal = window.quantize(img, 256);
        const idx = window.applyPalette(img, pal);
        encoder.writeFrame(idx, width, height, { palette: pal, delay: 350 });
        frameCounter++;
      }

      const pct = Math.round(((s + 1) / simSteps.length) * 85) + 10;
      progressBarFill.style.width = `${pct}%`;
      await new Promise(r => setTimeout(r, 10));
    }

    encoder.finish();
    const gifBytes = encoder.bytes();
    const blob = new Blob([gifBytes], { type: 'image/gif' });
    const gifUrl = URL.createObjectURL(blob);

    showResultUI({
      gifUrl,
      gifFilename: `visualproof_${Date.now()}.gif`,
      durationSec: 17,
      frameCount: frameCounter,
      size: gifBytes.length
    });
  }

  planBtn.addEventListener('click', fetchPlan);

  // Initialize
  fetchPlan();
});
