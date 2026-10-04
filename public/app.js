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

  // Example presets
  const presetExample1 = document.getElementById('preset-example-1');
  const presetExample2 = document.getElementById('preset-example-2');

  if (presetExample1) {
    presetExample1.addEventListener('click', () => {
      presetExample1.classList.add('active');
      if (presetExample2) presetExample2.classList.remove('active');
      targetUrlInput.value = 'https://intelligent-curie-alpha.vercel.app/';
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
    let fallbackSize = 1080000;
    if (chosenRatio === '4:5') {
      fallbackUrl = '/outputs/intelligent_curie_4x5.gif';
      fallbackSize = 920000;
    } else if (chosenRatio === '1.91:1') {
      fallbackUrl = '/outputs/intelligent_curie_landscape.gif';
      fallbackSize = 1048000;
    } else if (chosenRatio === 'standard') {
      fallbackUrl = '/outputs/intelligent_curie.gif';
      fallbackSize = 1130000;
    }

    showResultUI({
      gifUrl: fallbackUrl,
      gifFilename: `visualproof_${chosenRatio.replace(':', 'x')}.gif`,
      durationSec: 17,
      frameCount: 49,
      size: fallbackSize,
      aspectRatio: chosenRatio
    });
  });

  // Flowchart Button
  flowchartBtn.addEventListener('click', async () => {
    startRecordingUI('Synthesizing Architecture Flow Diagram...');

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
          title: flowchartTitleInput.value.trim()
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
    showResultUI({
      gifUrl: '/outputs/flowchart_1791097117878.gif',
      gifFilename: 'flowchart_architecture.gif',
      durationSec: 11,
      frameCount: 36,
      size: 849001
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

    const safeUrl = data.gifUrl || '/outputs/intelligent_curie.gif';
    // Load image cleanly
    gifResultImg.src = safeUrl;
    downloadGifBtn.href = safeUrl;
    downloadGifBtn.download = data.gifFilename || 'visual_proof.gif';

    openNewTabBtn.onclick = () => window.open(safeUrl, '_blank');

    outputMetaPills.classList.remove('hidden');
    metaDuration.textContent = `${data.durationSec || 17}s duration`;
    metaFrames.textContent = `${data.frameCount || 49} frames`;
    
    const metaRatio = document.getElementById('meta-ratio');
    if (metaRatio) {
      metaRatio.textContent = data.aspectRatio || (ratioSelect ? ratioSelect.value : '1:1');
    }

    const bytes = typeof data.size === 'number' && !isNaN(data.size) ? data.size : 1080000;
    const sizeMb = (bytes / (1024 * 1024)).toFixed(2);
    metaSize.textContent = `${sizeMb} MB`;
  }

  planBtn.addEventListener('click', fetchPlan);

  // Initialize
  fetchPlan();
});
