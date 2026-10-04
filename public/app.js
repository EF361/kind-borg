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
  const presetBuiltinBtn = document.getElementById('preset-builtin-btn');
  const presetExternalBtn = document.getElementById('preset-external-btn');
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

  // Presets
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

  // Fetch / Parse Steps
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
      const data = await res.json();
      if (data.success && data.plan) {
        currentPlan = data.plan;
        renderTimeline(data.plan.steps);
      }
    } catch (err) {
      console.error('Failed to parse plan:', err);
    }
  }

  function renderTimeline(steps) {
    stepTimeline.innerHTML = '';
    steps.forEach((step, idx) => {
      const item = document.createElement('div');
      item.className = 'step-item';
      item.innerHTML = `
        <span class="step-index-badge">${idx + 1}</span>
        <span class="step-item-desc">${step.caption || step.name}</span>
        <span class="step-item-duration">${Math.round(step.durationMs / 1000)}s</span>
      `;
      stepTimeline.appendChild(item);
    });
  }

  // Record Walkthrough
  recordBtn.addEventListener('click', async () => {
    if (!currentPlan) {
      await fetchPlan();
    }

    startRecordingUI('Launching Headless Playwright Agent...');

    try {
      // Simulate progress bar while server records
      let progress = 10;
      const progressTimer = setInterval(() => {
        if (progress < 90) {
          progress += Math.floor(Math.random() * 8) + 4;
          progressBarFill.style.width = `${progress}%`;
          if (progress > 30 && progress < 60) {
            progressStatusTitle.textContent = 'Simulating User Interactions...';
            progressStatusDesc.textContent = 'Executing clicks, interpolation of cursor position, and capturing frame buffers.';
          } else if (progress >= 60) {
            progressStatusTitle.textContent = 'Encoding High-Precision GIF...';
            progressStatusDesc.textContent = 'Applying NeuQuant 256-color palette quantization via gifenc.';
          }
        }
      }, 1200);

      const res = await fetch('/api/generate-walkthrough', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: currentPlan,
          prompt: instructionsInput.value.trim(),
          targetUrl: targetUrlInput.value.trim(),
          duration: parseInt(durationSelect.value, 10)
        })
      });

      clearInterval(progressTimer);
      progressBarFill.style.width = '100%';

      const data = await res.json();
      if (data.success) {
        showResultUI(data);
        fetchRecentOutputs();
      } else {
        alert('Recording failed: ' + (data.error || 'Unknown error'));
        resetUI();
      }
    } catch (err) {
      console.error('Recording request error:', err);
      alert('Recording error: ' + err.message);
      resetUI();
    }
  });

  // Flowchart Generation
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

    try {
      let progress = 15;
      const progressTimer = setInterval(() => {
        if (progress < 90) {
          progress += 10;
          progressBarFill.style.width = `${progress}%`;
        }
      }, 1000);

      const res = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, nodes })
      });

      clearInterval(progressTimer);
      progressBarFill.style.width = '100%';

      const data = await res.json();
      if (data.success) {
        showResultUI(data);
        fetchRecentOutputs();
      } else {
        alert('Flowchart generation failed: ' + (data.error || 'Unknown error'));
        resetUI();
      }
    } catch (err) {
      alert('Flowchart error: ' + err.message);
      resetUI();
    }
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

    // Set GIF image source
    gifResultImg.src = `${data.gifUrl}?t=${Date.now()}`;
    downloadGifBtn.href = data.gifUrl;
    downloadGifBtn.download = data.gifFilename || 'visual_proof.gif';

    openNewTabBtn.onclick = () => window.open(data.gifUrl, '_blank');

    // Metadata badges
    outputMetaPills.classList.remove('hidden');
    metaDuration.textContent = `${data.durationSec || 18}s duration`;
    metaFrames.textContent = `${data.frameCount || 60} frames`;
    const sizeMb = (data.size / (1024 * 1024)).toFixed(2);
    metaSize.textContent = `${sizeMb} MB`;
  }

  function resetUI() {
    recordBtn.disabled = false;
    flowchartBtn.disabled = false;
    recordingProgress.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
  }

  async function fetchRecentOutputs() {
    try {
      const res = await fetch('/api/outputs');
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        recentList.innerHTML = '';
        data.files.forEach(f => {
          const item = document.createElement('a');
          item.className = 'recent-thumb-item';
          item.href = f.url;
          item.target = '_blank';
          const sizeKb = Math.round(f.sizeBytes / 1024);
          item.innerHTML = `
            <span>🎬</span>
            <span>${f.filename}</span>
            <span style="color:#64748b">(${sizeKb} KB)</span>
          `;
          recentList.appendChild(item);
        });
      }
    } catch (_) {}
  }

  planBtn.addEventListener('click', fetchPlan);

  // Initialize
  fetchPlan();
  fetchRecentOutputs();
});
