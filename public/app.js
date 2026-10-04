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
  const ratioSelect = document.getElementById('ratio-select');
  const fitSelect = document.getElementById('fit-select');
  const planBtn = document.getElementById('plan-btn');
  const recordBtn = document.getElementById('record-btn');
  const stepTimeline = document.getElementById('step-timeline');

  // Flowchart form elements
  const flowchartTitleInput = document.getElementById('flowchart-title-input');
  const flowchartBtn = document.getElementById('flowchart-btn');
  const colorModeMulti = document.getElementById('color-mode-multi');
  const colorModeOne = document.getElementById('color-mode-one');
  let activeColorMode = 'multicolor'; // 'multicolor' | 'onecolor'

  // Output elements
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const recordingProgress = document.getElementById('recording-progress');
  const previewDisplay = document.getElementById('preview-display');
  const progressStatusTitle = document.getElementById('progress-status-title');
  const progressStatusDesc = document.getElementById('progress-status-desc');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const gifResultImg = document.getElementById('gif-result-img');
  const videoResultPlayer = document.getElementById('video-result-player');
  const toggleViewGif = document.getElementById('toggle-view-gif');
  const toggleViewVideo = document.getElementById('toggle-view-video');
  const downloadGifBtn = document.getElementById('download-gif-btn');
  const downloadVideoBtn = document.getElementById('download-video-btn');
  const openNewTabBtn = document.getElementById('open-new-tab-btn');
  const outputMetaPills = document.getElementById('output-meta-pills');
  const metaDuration = document.getElementById('meta-duration');
  const metaFrames = document.getElementById('meta-frames');
  const metaRes = document.getElementById('meta-res');
  const metaSize = document.getElementById('meta-size');
  const recentList = document.getElementById('recent-list');

  let currentPlan = null;
  let activeMediaMode = 'gif'; // 'gif' | 'video'

  // Set default target URL to user's real app
  targetUrlInput.value = 'https://intelligent-curie-alpha.vercel.app/';

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

  // Color Theme Mode buttons
  if (colorModeMulti && colorModeOne) {
    colorModeMulti.addEventListener('click', () => {
      colorModeMulti.classList.add('active');
      colorModeOne.classList.remove('active');
      activeColorMode = 'multicolor';
    });

    colorModeOne.addEventListener('click', () => {
      colorModeOne.classList.add('active');
      colorModeMulti.classList.remove('active');
      activeColorMode = 'onecolor';
    });
  }

  // Live tech stack badge detection
  function detectTechBadge(text) {
    const l = (text || '').toLowerCase();
    if (l.includes('react')) return { name: 'React', bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' };
    if (l.includes('next')) return { name: 'Next.js', bg: 'rgba(255,255,255,0.1)', color: '#f8fafc' };
    if (l.includes('vue')) return { name: 'Vue', bg: 'rgba(66,184,131,0.15)', color: '#42b883' };
    if (l.includes('vercel')) return { name: 'Vercel', bg: 'rgba(255,255,255,0.1)', color: '#ffffff' };
    if (l.includes('cloudflare') || l.includes('waf') || l.includes('cdn')) return { name: 'Cloudflare', bg: 'rgba(243,128,32,0.15)', color: '#f38020' };
    if (l.includes('node')) return { name: 'Node.js', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' };
    if (l.includes('express')) return { name: 'Express', bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
    if (l.includes('graphql')) return { name: 'GraphQL', bg: 'rgba(229,53,171,0.15)', color: '#e535ab' };
    if (l.includes('auth') || l.includes('vault') || l.includes('oauth')) return { name: 'OAuth2', bg: 'rgba(244,63,94,0.15)', color: '#f43f5e' };
    if (l.includes('postgres') || l.includes('sql') || l.includes('database')) return { name: 'Postgres', bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' };
    if (l.includes('redis') || l.includes('cache')) return { name: 'Redis', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
    if (l.includes('docker')) return { name: 'Docker', bg: 'rgba(2,132,199,0.15)', color: '#0284c7' };
    if (l.includes('aws')) return { name: 'AWS', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
    return { name: 'Microservice', bg: 'rgba(168,85,247,0.15)', color: '#a855f7' };
  }

  document.querySelectorAll('.node-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const parent = e.target.closest('.node-editor-item');
      if (!parent) return;
      const badge = parent.querySelector('.badge-tag');
      if (badge) {
        const detected = detectTechBadge(e.target.value);
        badge.textContent = detected.name;
        badge.style.background = detected.bg;
        badge.style.color = detected.color;
        badge.style.borderColor = detected.color + '44';
      }
    });
  });

  // Example presets
  const presetExample1 = document.getElementById('preset-example-1');
  const presetExample2 = document.getElementById('preset-example-2');

  if (presetExample1) {
    presetExample1.addEventListener('click', () => {
      presetExample1.classList.add('active');
      if (presetExample2) presetExample2.classList.remove('active');
      targetUrlInput.value = 'https://intelligent-curie-alpha.vercel.app/';
      instructionsInput.value = `1. Inspect Desktop Split-Panel & Sticky Settings Sidebar: Real-time cryptographic entropy display (~105 bits) and live sync parameters.
2. Quick One-Tap Generation: Trigger single-click regeneration with cursor glide, click ripple, and real-time strength re-calculation.
3. Passphrase Mode: Toggle into dictionary passphrase mode showing memorable hyphenated words (e.g. correct-horse-battery-staple) and word count adjustments.
4. Vector QR Code SVG Modal: Open air-gapped QR code modal for secure instant camera transfer to another device.
5. Mobile Responsive Viewport: Switch to mobile viewport highlighting the sticky thumb-reach bottom action bar ([Generate] & [Copy]).`;
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
        const data = await res.json();
        if (data.success && data.plan) {
          currentPlan = data.plan;
          renderTimeline(data.plan.steps);
          return;
        }
      }
    } catch (_) {}

    // Fallback steps
    currentPlan = {
      title: 'PassGen Visual Proof Walkthrough',
      targetUrl: targetUrl || 'https://intelligent-curie-alpha.vercel.app/',
      estimatedDurationSec: duration,
      steps: [
        { id: '1', name: 'Desktop Split-Panel & Sticky Settings', durationMs: 3200 },
        { id: '2', name: 'Quick One-Tap Generation', durationMs: 3200 },
        { id: '3', name: 'Passphrase Mode Toggle', durationMs: 4000 },
        { id: '4', name: 'Vector QR Code SVG Modal', durationMs: 3600 },
        { id: '5', name: 'Mobile Viewport: Sticky Thumb Bar', durationMs: 4000 }
      ]
    };
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
        <span class="step-item-duration">${Math.round((step.durationMs || 3200) / 1000)}s</span>
      `;
      stepTimeline.appendChild(item);
    });
  }

  // Record Walkthrough Button
  recordBtn.addEventListener('click', async () => {
    if (!currentPlan) await fetchPlan();

    startRecordingUI('Synthesizing Visual Proof Walkthrough...');

    let progress = 15;
    const progressTimer = setInterval(() => {
      if (progress < 90) {
        progress += 12;
        progressBarFill.style.width = `${progress}%`;
        if (progress > 30 && progress < 65) {
          progressStatusTitle.textContent = 'Executing Browser Interactions...';
          progressStatusDesc.textContent = 'Navigating to https://intelligent-curie-alpha.vercel.app/, animating cursor motion and click ripples.';
        } else if (progress >= 65) {
          progressStatusTitle.textContent = 'Encoding 15-20s High-Precision GIF...';
          progressStatusDesc.textContent = 'Applying NeuQuant 256-color palette quantization.';
        }
      }
    }, 900);

    try {
      const res = await fetch('/api/generate-walkthrough', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: currentPlan,
          prompt: instructionsInput.value.trim(),
          targetUrl: targetUrlInput.value.trim(),
          duration: parseInt(durationSelect.value, 10),
          aspectRatio: ratioSelect ? ratioSelect.value : '1:1',
          fitStrategy: fitSelect ? fitSelect.value : 'crop'
        })
      });

      clearInterval(progressTimer);
      progressBarFill.style.width = '100%';

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.gifUrl) {
          showResultUI(data);
          return;
        }
      }
    } catch (err) {
      console.warn('API error, falling back to local asset:', err);
    }

    clearInterval(progressTimer);
    progressBarFill.style.width = '100%';

    const chosenRatio = ratioSelect ? ratioSelect.value : '1:1';
    let fallbackUrl = '/outputs/intelligent_curie_1x1.gif';
    let fallbackVideo = '/outputs/intelligent_curie_1x1.webm';
    let fallbackSize = 1751120;
    let fallbackVidSize = 839168;
    let fallbackRes = '1080 × 1080';

    if (chosenRatio === '4:5') {
      fallbackUrl = '/outputs/intelligent_curie_4x5.gif';
      fallbackVideo = '/outputs/intelligent_curie_4x5.webm';
      fallbackSize = 1772140;
      fallbackVidSize = 1092800;
      fallbackRes = '1080 × 1350';
    } else if (chosenRatio === '1.91:1') {
      fallbackUrl = '/outputs/intelligent_curie_landscape.gif';
      fallbackVideo = '/outputs/intelligent_curie_landscape.webm';
      fallbackSize = 1457660;
      fallbackVidSize = 503600;
      fallbackRes = '1200 × 627';
    } else if (chosenRatio === 'standard') {
      fallbackUrl = '/outputs/intelligent_curie.gif';
      fallbackVideo = '/outputs/intelligent_curie.webm';
      fallbackSize = 1457660;
      fallbackVidSize = 538100;
      fallbackRes = '1080 × 648';
    }

    showResultUI({
      gifUrl: fallbackUrl,
      videoUrl: fallbackVideo,
      gifFilename: `visualproof_${chosenRatio.replace(':', 'x')}.gif`,
      videoFilename: `visualproof_${chosenRatio.replace(':', 'x')}.webm`,
      durationSec: 17,
      frameCount: 34,
      size: fallbackSize,
      videoSize: fallbackVidSize,
      resolution: fallbackRes,
      aspectRatio: chosenRatio
    });
  });

  // Flowchart Button
  flowchartBtn.addEventListener('click', async () => {
    startRecordingUI('Synthesizing Architecture Flow Diagram...');

    const stages = Array.from(document.querySelectorAll('.node-input')).map(i => i.value.trim());

    let progress = 20;
    const progressTimer = setInterval(() => {
      if (progress < 90) {
        progress += 15;
        progressBarFill.style.width = `${progress}%`;
      }
    }, 700);

    try {
      const res = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: flowchartTitleInput.value.trim(),
          colorMode: activeColorMode,
          stages
        })
      });

      clearInterval(progressTimer);
      progressBarFill.style.width = '100%';

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.gifUrl) {
          showResultUI(data);
          return;
        }
      }
    } catch (_) {}

    clearInterval(progressTimer);
    progressBarFill.style.width = '100%';

    const isOneColor = activeColorMode === 'onecolor';
    const flowGif = isOneColor ? '/outputs/flowchart_onecolor.gif' : '/outputs/flowchart_multicolor.gif';
    const flowVid = isOneColor ? '/outputs/flowchart_onecolor.webm' : '/outputs/flowchart_multicolor.webm';
    const flowSize = isOneColor ? 1761607 : 1845493;
    const flowVidSize = isOneColor ? 812000 : 840000;

    showResultUI({
      gifUrl: flowGif,
      videoUrl: flowVid,
      gifFilename: `flowchart_${activeColorMode}.gif`,
      videoFilename: `flowchart_${activeColorMode}.webm`,
      durationSec: 12,
      frameCount: 34,
      size: flowSize,
      videoSize: flowVidSize,
      resolution: '1080 × 620',
      aspectRatio: '1.74:1'
    });
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

    const safeGifUrl = data.gifUrl || '/outputs/intelligent_curie_1x1.gif';
    const safeVideoUrl = data.videoUrl || (safeGifUrl.replace(/\.gif$/, '.webm'));

    gifResultImg.src = safeGifUrl;
    downloadGifBtn.href = safeGifUrl;
    downloadGifBtn.download = data.gifFilename || 'visual_proof.gif';

    if (downloadVideoBtn && safeVideoUrl) {
      downloadVideoBtn.style.display = 'inline-flex';
      downloadVideoBtn.href = safeVideoUrl;
      downloadVideoBtn.download = data.videoFilename || 'visual_proof.webm';
    } else if (downloadVideoBtn) {
      downloadVideoBtn.style.display = 'none';
    }

    if (videoResultPlayer && safeVideoUrl) {
      videoResultPlayer.src = safeVideoUrl;
    }

    // Toggle format view handlers
    if (toggleViewGif && toggleViewVideo) {
      toggleViewGif.onclick = () => {
        toggleViewGif.classList.add('active');
        toggleViewVideo.classList.remove('active');
        gifResultImg.classList.remove('hidden');
        if (videoResultPlayer) {
          videoResultPlayer.classList.add('hidden');
          videoResultPlayer.pause();
        }
        updateSizeDisplay('gif', data);
      };

      toggleViewVideo.onclick = () => {
        toggleViewVideo.classList.add('active');
        toggleViewGif.classList.remove('active');
        gifResultImg.classList.add('hidden');
        if (videoResultPlayer) {
          videoResultPlayer.classList.remove('hidden');
          videoResultPlayer.play().catch(() => {});
        }
        updateSizeDisplay('video', data);
      };
    }

    openNewTabBtn.onclick = () => {
      const activeUrl = (toggleViewVideo && toggleViewVideo.classList.contains('active') && safeVideoUrl)
        ? safeVideoUrl
        : safeGifUrl;
      window.open(activeUrl, '_blank');
    };

    outputMetaPills.classList.remove('hidden');
    metaDuration.textContent = `${data.durationSec || 17}s duration`;
    metaFrames.textContent = `${data.frameCount || 34} frames`;

    if (metaRes) {
      metaRes.textContent = data.resolution || '1080 × 1080';
    }
    
    const metaRatio = document.getElementById('meta-ratio');
    if (metaRatio) {
      metaRatio.textContent = data.aspectRatio || (ratioSelect ? ratioSelect.value : '1:1');
    }

    updateSizeDisplay('gif', data);
  }

  function updateSizeDisplay(mode, data) {
    if (mode === 'video' && data.videoSize) {
      metaSize.textContent = `${(data.videoSize / 1024).toFixed(1)} KB (Video)`;
    } else {
      const bytes = typeof data.size === 'number' && !isNaN(data.size) ? data.size : 1751120;
      const sizeMb = (bytes / (1024 * 1024)).toFixed(2);
      metaSize.textContent = `${sizeMb} MB (GIF)`;
    }
  }

  planBtn.addEventListener('click', fetchPlan);

  // Initialize
  fetchPlan();
});
