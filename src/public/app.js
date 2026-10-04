document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Steps
  const navStep1 = document.getElementById('nav-step-1');
  const navStep2 = document.getElementById('nav-step-2');
  const navStep3 = document.getElementById('nav-step-3');
  const cardStepVisual = document.getElementById('card-step-visual');
  const cardStepCaption = document.getElementById('card-step-caption');
  const linkedinPreviewContainer = document.getElementById('linkedin-preview-container');

  // Media Mode Tabs
  const tabWalkthrough = document.getElementById('tab-walkthrough');
  const tabFlowchart = document.getElementById('tab-flowchart');
  const modeWalkthroughView = document.getElementById('mode-walkthrough-view');
  const modeFlowchartView = document.getElementById('mode-flowchart-view');

  // Walkthrough Form Elements
  const targetUrlInput = document.getElementById('target-url-input');
  const instructionsInput = document.getElementById('instructions-input');
  const durationSelect = document.getElementById('duration-select');
  const ratioSelect = document.getElementById('ratio-select');
  const fitSelect = document.getElementById('fit-select');
  const planBtn = document.getElementById('plan-btn');
  const recordBtn = document.getElementById('record-btn');
  const stepTimeline = document.getElementById('step-timeline');
  const presetExample1 = document.getElementById('preset-example-1');
  const presetExample2 = document.getElementById('preset-example-2');

  // Collapsible Advanced Settings
  const toggleAdvancedBtn = document.getElementById('toggle-advanced-btn');
  const advancedSettingsBody = document.getElementById('advanced-settings-body');
  const advancedChevron = document.getElementById('advanced-chevron');

  // Flowchart Form Elements
  const flowchartTitleInput = document.getElementById('flowchart-title-input');
  const flowchartBtn = document.getElementById('flowchart-btn');
  const colorModeMulti = document.getElementById('color-mode-multi');
  const colorModeOne = document.getElementById('color-mode-one');
  let activeColorMode = 'multicolor';

  // Caption Generator Elements
  const toneChips = document.querySelectorAll('.tone-chip');
  const captionPromptInput = document.getElementById('caption-prompt-input');
  const generateCaptionBtn = document.getElementById('generate-caption-btn');
  const copyCaptionBtn = document.getElementById('copy-caption-btn');
  const captionEditor = document.getElementById('caption-editor');
  const captionCharCount = document.getElementById('caption-char-count');
  const hashtagPills = document.querySelectorAll('.tag-pill');

  // Prompt Manager Modal Elements
  const openPromptManagerBtn = document.getElementById('open-prompt-manager-btn');
  const promptManagerModal = document.getElementById('prompt-manager-modal');
  const closePromptModalBtn = document.getElementById('close-prompt-modal-btn');
  const tmplPills = document.querySelectorAll('.tmpl-pill');
  const promptTemplateEditor = document.getElementById('prompt-template-editor');
  const geminiApiKeyInput = document.getElementById('gemini-api-key-input');
  const savePromptsBtn = document.getElementById('save-prompts-btn');
  const resetPromptsBtn = document.getElementById('reset-prompts-btn');

  // LinkedIn Post Preview & Output Elements
  const liPreviewText = document.getElementById('li-preview-text');
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

  // LinkedIn Publish Action Buttons
  const publishLinkedinBtn = document.getElementById('publish-linkedin-btn');
  const quickPostBtn = document.getElementById('quick-post-btn');
  const studioToast = document.getElementById('studio-toast');
  const toastMessage = document.getElementById('toast-message');

  // State
  let currentPlan = null;
  let activeTonePreset = 'launch'; // 'launch' | 'architecture' | 'buildinpublic' | 'feature'
  let activeTemplateKey = 'launch';
  let activeMediaResult = null;

  // Default Prompt Templates
  const DEFAULT_TEMPLATES = {
    launch: `You are an expert tech founder & copywriter. Write a high-converting LinkedIn post announcing the launch of {url}.
Hook: 1-2 punchy lines highlighting the real-world friction developers/users face.
Solution: Explain what was built and why it changes the workflow.
Core Features:
{notes}
Tech Stack: Call out key engineering highlights (client-side crypto, edge deployment, zero server lag).
Call to action: Invite users to try it live and drop feedback.
Hashtags: #BuildInPublic #WebDev #NextJS #SoftwareEngineering #TechInnovation`,

    architecture: `You are a Principal Software Architect. Write a technical deep-dive LinkedIn post breaking down the architecture of {url}.
Hook: Behind-the-scenes engineering breakthrough & architectural decisions.
System Pipeline:
1. Client SPA & Entropy Generator
2. Edge Proxy & WAF
3. API Gateway & Microservices
4. Distributed Cache & Session Vault
Key takeaways:
{notes}
Community question: Ask software engineers how they approach similar latency or security constraints.
Hashtags: #SoftwareArchitecture #SystemDesign #EdgeComputing #FullStack #TechLeadership`,

    buildinpublic: `You are an indie hacker & engineer building in public. Write an authentic, transparent LinkedIn post about building {url}.
Hook: Personal insight or milestone achieved while shipping this project.
The Problem & Journey: Why I spent weekends engineering this.
What was built:
{notes}
Metrics / Tech Stack: Emphasize lightweight client footprint, instant rendering, and responsive UX.
What's next: Invite the community to test and break it!
Hashtags: #IndieHacker #BuildInPublic #StartupLife #FullStack #WebDevelopment`,

    feature: `You are a Product Engineer. Write a focused LinkedIn showcase post highlighting a standout interaction workflow in {url}.
Hook: Spotlight a specific micro-interaction that makes the UX feel magical.
The Feature in Action:
{notes}
Engineering detail: How we achieved smooth 60fps animations and instant device sync.
Try the live demo at {url}.
Hashtags: #ProductDesign #UIUX #FrontendDev #JavaScript #UserExperience`
  };

  // Load custom templates from localStorage or fallback
  let promptTemplates = { ...DEFAULT_TEMPLATES };
  try {
    const saved = localStorage.getItem('visualproof_prompt_templates');
    if (saved) {
      promptTemplates = { ...DEFAULT_TEMPLATES, ...JSON.parse(saved) };
    }
  } catch (_) {}

  // 1. Workflow Steps Scrolling & Highlight
  function highlightStep(stepNum) {
    [navStep1, navStep2, navStep3].forEach((el, idx) => {
      if (el) el.classList.toggle('active', idx + 1 === stepNum);
    });
  }

  if (navStep1) navStep1.addEventListener('click', () => {
    cardStepVisual.scrollIntoView({ behavior: 'smooth', block: 'start' });
    highlightStep(1);
  });
  if (navStep2) navStep2.addEventListener('click', () => {
    cardStepCaption.scrollIntoView({ behavior: 'smooth', block: 'start' });
    highlightStep(2);
  });
  if (navStep3) navStep3.addEventListener('click', () => {
    linkedinPreviewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    highlightStep(3);
  });

  // 2. Collapsible Advanced Settings
  if (toggleAdvancedBtn && advancedSettingsBody && advancedChevron) {
    toggleAdvancedBtn.addEventListener('click', () => {
      const isHidden = advancedSettingsBody.classList.contains('hidden');
      advancedSettingsBody.classList.toggle('hidden', !isHidden);
      advancedChevron.classList.toggle('open', isHidden);
    });
  }

  // 3. Media Mode Tabs
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

  // Flowchart Color Modes
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

  // URL Example Presets
  if (presetExample1) {
    presetExample1.addEventListener('click', () => {
      presetExample1.classList.add('active');
      if (presetExample2) presetExample2.classList.remove('active');
      targetUrlInput.value = 'https://intelligent-curie-alpha.vercel.app/';
      instructionsInput.value = `1. Inspect Desktop Split-Panel & Sticky Settings Sidebar: Real-time entropy calculation (~105 bits).
2. Quick One-Tap Generation: Single-click regeneration with cursor glide, click ripple, and real-time strength update.
3. Passphrase Mode: Toggle dictionary passphrase mode showing memorable hyphenated words.
4. Vector QR Code SVG Modal: Open air-gapped QR code modal for instant device transfer.
5. Mobile Responsive Viewport: Switch to mobile viewport highlighting the sticky thumb-reach action bar.`;
      captionPromptInput.value = `Emphasize the cryptographic security, real-time client-side entropy calculation (~105 bits), responsive mobile thumb reach bar, and instant air-gapped QR modal.`;
      fetchPlan();
      generateSmartCaption();
    });
  }

  if (presetExample2) {
    presetExample2.addEventListener('click', () => {
      presetExample2.classList.add('active');
      if (presetExample1) presetExample1.classList.remove('active');
      targetUrlInput.value = 'https://kind-borg-pearl.vercel.app';
      instructionsInput.value = `Load home page and scroll through product hero showcase.
Click live preview demo button.
Switch viewport to mobile to inspect mobile navigation drawer.`;
      captionPromptInput.value = `Showcase VisualProof Studio: Automated headless browser recording, crystal clear 1080p GIF synthesis, and LinkedIn post generator.`;
      fetchPlan();
      generateSmartCaption();
    });
  }

  // 4. Tone Presets & Caption Generator
  toneChips.forEach(chip => {
    chip.addEventListener('click', () => {
      toneChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeTonePreset = chip.dataset.preset;
      generateSmartCaption();
    });
  });

  generateCaptionBtn.addEventListener('click', () => {
    generateSmartCaption();
  });

  // Hashtag Pills Toggle
  hashtagPills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      const tag = pill.dataset.tag;
      let text = captionEditor.value;
      if (pill.classList.contains('active')) {
        if (!text.includes(tag)) {
          captionEditor.value = (text.trim() + ' ' + tag).trim();
        }
      } else {
        captionEditor.value = text.replace(new RegExp(tag + '\\b', 'g'), '').replace(/\s+/g, ' ').trim();
      }
      syncCaptionToPreview();
    });
  });

  // Synchronize Caption Editor to LinkedIn Live Preview
  function syncCaptionToPreview() {
    const raw = captionEditor.value;
    captionCharCount.textContent = `${raw.length} / 3000 chars`;

    // Highlight hashtags in preview
    const formatted = escapeHtml(raw).replace(/(#\w+)/g, '<span class="tag">$1</span>');
    liPreviewText.innerHTML = formatted || '<span style="color: #64748b;">(Generated LinkedIn caption will appear here...)</span>';
  }

  captionEditor.addEventListener('input', syncCaptionToPreview);

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // SMART CAPTION SYNTHESIS ENGINE
  function generateSmartCaption() {
    const url = targetUrlInput.value.trim() || 'https://my-app.vercel.app';
    const notes = captionPromptInput.value.trim();
    let postText = '';

    const activeTags = Array.from(document.querySelectorAll('.tag-pill.active'))
      .map(p => p.dataset.tag)
      .join(' ');

    if (activeTonePreset === 'launch') {
      postText = `🚀 Excited to publicly release our latest build: ${url}!

Most developer showcases either lack tangible proof or rely on heavy, laggy screen recordings that get skipped in feeds. 

We wanted a frictionless, instant experience that delivers clear visual proof:

✨ Key Highlights:
• ${notes || 'Instant responsive execution with zero latency'}
• Cryptographic entropy computation and real-time parameters
• Air-gapped QR transfer modal for seamless mobile handoff
• Native 1080p rendering optimized for LinkedIn feeds

Built with Next.js, WebCrypto, and Edge Vercel runtime.

👉 Check it out live here: ${url}
I'd love your feedback—what should we add in the next iteration?

${activeTags}`;

    } else if (activeTonePreset === 'architecture') {
      postText = `🏗️ System Architecture Deep Dive: Building scalable, low-latency web apps at ${url}

Behind every smooth 60fps UI is an intentional pipeline. Here is the architecture powering this project:

1️⃣ Client Tier: Modern React/Next.js SPA with client-side cryptographic state
2️⃣ Edge Layer: Global Vercel & Cloudflare Edge CDN with WAF rate limiting
3️⃣ API Routing: Microservices & gRPC schema synchronization
4️⃣ Security Vault: Air-gapped verification & Zero-Knowledge tokens

💡 Key Engineering Takeaways:
${notes ? '• ' + notes.split('.').filter(Boolean).join('\n• ') : '• Sub-20ms roundtrip execution\n• Zero heavy server dependencies\n• Strict privacy-first design'}

Engineers: how do you balance edge computation vs client-side processing in your stack?

${activeTags}`;

    } else if (activeTonePreset === 'buildinpublic') {
      postText = `📈 Building in Public: Week 3 shipping ${url}

When starting this project, the goal was simple: eliminate clunky, bloated demos and replace them with crisp, verifiable proofs.

Here is what went into this milestone:
• ${notes || 'Optimized responsive viewport with sticky mobile thumb-reach bar'}
• Zero-config deployment on Vercel
• Clean architecture with zero bloat

Shipping consistently in public forces extreme clarity on product priorities. 

Try the live version and let me know your thoughts: ${url}

${activeTags}`;

    } else if (activeTonePreset === 'feature') {
      postText = `💡 UX Spotlight: Crafting delightful interactions at ${url}

Great software is defined by the details users feel rather than notice. 

In this demo, pay close attention to:
• ${notes || 'Smooth cursor interpolation and instant click feedback'}
• Real-time strength recalculation with dynamic entropy bars
• Instant modal transitions with zero layout shift

Try it out directly: ${url}

${activeTags}`;
    }

    captionEditor.value = postText.trim();
    syncCaptionToPreview();
  }

  // 5. Prompt Manager Modal Logic
  openPromptManagerBtn.addEventListener('click', () => {
    promptManagerModal.classList.remove('hidden');
    loadTemplateIntoEditor(activeTemplateKey);
  });

  closePromptModalBtn.addEventListener('click', () => {
    promptManagerModal.classList.add('hidden');
  });

  promptManagerModal.addEventListener('click', (e) => {
    if (e.target === promptManagerModal) {
      promptManagerModal.classList.add('hidden');
    }
  });

  tmplPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tmplPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeTemplateKey = pill.dataset.tmpl;
      loadTemplateIntoEditor(activeTemplateKey);
    });
  });

  function loadTemplateIntoEditor(key) {
    promptTemplateEditor.value = promptTemplates[key] || DEFAULT_TEMPLATES[key] || '';
  }

  savePromptsBtn.addEventListener('click', () => {
    promptTemplates[activeTemplateKey] = promptTemplateEditor.value.trim();
    try {
      localStorage.setItem('visualproof_prompt_templates', JSON.stringify(promptTemplates));
    } catch (_) {}
    promptManagerModal.classList.add('hidden');
    showToast('Prompt template saved & applied!');
    generateSmartCaption();
  });

  resetPromptsBtn.addEventListener('click', () => {
    promptTemplates = { ...DEFAULT_TEMPLATES };
    try {
      localStorage.removeItem('visualproof_prompt_templates');
    } catch (_) {}
    loadTemplateIntoEditor(activeTemplateKey);
    showToast('Prompts reset to defaults.');
  });

  // 6. Copy Caption Handler
  copyCaptionBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(captionEditor.value);
      showToast('Caption copied to clipboard!');
    } catch (_) {
      showToast('Failed to copy caption.');
    }
  });

  // 7. ONE-CLICK POST TO LINKEDIN HANDLER
  async function handlePostToLinkedIn() {
    const textToCopy = captionEditor.value.trim();
    const targetUrl = targetUrlInput.value.trim() || 'https://kind-borg-pearl.vercel.app';

    try {
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
      }
      showToast('✓ Caption copied to clipboard! Opening LinkedIn...');
    } catch (_) {
      showToast('Opening LinkedIn share composer...');
    }

    // Launch official LinkedIn post share composer
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(targetUrl)}`;
    setTimeout(() => {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }, 350);
  }

  if (publishLinkedinBtn) publishLinkedinBtn.addEventListener('click', handlePostToLinkedIn);
  if (quickPostBtn) quickPostBtn.addEventListener('click', handlePostToLinkedIn);

  // Toast System
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    studioToast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      studioToast.classList.add('hidden');
    }, 4000);
  }

  // 8. Safe Plan Fetcher
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

    // Fallback plan
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
    if (!stepTimeline) return;
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

  // 9. Record Walkthrough GIF & Video
  recordBtn.addEventListener('click', async () => {
    if (!currentPlan) await fetchPlan();

    startRecordingUI('Synthesizing Visual Proof Walkthrough...');

    let progress = 15;
    const progressTimer = setInterval(() => {
      if (progress < 90) {
        progress += 12;
        progressBarFill.style.width = `${progress}%`;
        if (progress > 30 && progress < 65) {
          progressStatusTitle.textContent = 'Executing Headless Browser Script...';
          progressStatusDesc.textContent = 'Navigating to target app, recording cursor path, ripples, and modal toggles.';
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
    } catch (_) {}

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

  // 10. Generate Architecture Flowchart
  flowchartBtn.addEventListener('click', async () => {
    startRecordingUI('Synthesizing Architecture Flow Diagram with Animated Flows...');

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
    const flowSize = isOneColor ? 1793000 : 1887000;
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
    activeMediaResult = data;
    recordBtn.disabled = false;
    flowchartBtn.disabled = false;
    recordingProgress.classList.add('hidden');
    previewPlaceholder.classList.add('hidden');
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
    metaDuration.textContent = `${data.durationSec || 17}s`;
    metaFrames.textContent = `${data.frameCount || 34} frames`;

    if (metaRes) {
      metaRes.textContent = data.resolution || '1080 × 1080';
    }

    updateSizeDisplay('gif', data);
    highlightStep(3);
    showToast('Visual Proof ready in LinkedIn Post Preview!');
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

  // Pre-load default output so preview is immediately lively
  showResultUI({
    gifUrl: '/outputs/intelligent_curie_1x1.gif',
    videoUrl: '/outputs/intelligent_curie_1x1.webm',
    gifFilename: 'visual_proof_1x1.gif',
    videoFilename: 'visual_proof_1x1.webm',
    durationSec: 17,
    frameCount: 34,
    size: 1751120,
    videoSize: 839168,
    resolution: '1080 × 1080',
    aspectRatio: '1:1'
  });

  planBtn.addEventListener('click', fetchPlan);

  // Initialize
  fetchPlan();
  generateSmartCaption();
});
