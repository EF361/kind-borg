/**
 * Hybrid AI Planner for VisualProof Studio
 * Converts natural-language instructions into timed, executable Playwright browser actions.
 */

function planInstructions(promptText, targetUrl, options = {}) {
  const targetDurationSec = options.duration || 18; // default 18 seconds (in the 15-20s window)
  const normalized = (promptText || '').toLowerCase();

  // Preset detection: Password/Passphrase Generator Demo
  const isPassphraseDemo = normalized.includes('passphrase') ||
    normalized.includes('sticky settings') ||
    normalized.includes('qr code') ||
    normalized.includes('thumb-reach') ||
    normalized.includes('correct-horse-battery-staple');

  if (isPassphraseDemo) {
    return {
      title: 'Visual Proof: Passphrase & Mobile Responsive Demo',
      targetUrl: targetUrl || 'http://localhost:3000/demo',
      estimatedDurationSec: 18,
      steps: [
        {
          id: 'step-1',
          name: 'Inspect Desktop Split-Panel',
          caption: 'Desktop Split-Panel & Sticky Settings',
          type: 'navigate_and_inspect',
          viewport: { width: 1280, height: 750 },
          durationMs: 3200,
          cursorTarget: { x: 980, y: 220 }, // Hover over sticky sidebar
          action: 'hover',
          selector: '.sticky-sidebar'
        },
        {
          id: 'step-2',
          name: 'Quick One-Tap Generate',
          caption: 'Quick One-Tap Generation',
          type: 'click_element',
          viewport: { width: 1280, height: 750 },
          selector: '#generate-btn',
          textMatch: 'Quick One-Tap Generate',
          durationMs: 3200,
          cursorTarget: { x: 380, y: 295 },
          action: 'click',
          waitAfterMs: 1200
        },
        {
          id: 'step-3',
          name: 'Toggle Passphrase Mode',
          caption: 'Switching to Passphrase Mode (correct-horse-battery-staple)',
          type: 'click_element',
          viewport: { width: 1280, height: 750 },
          selector: '#mode-passphrase-btn',
          textMatch: 'Passphrase Mode',
          durationMs: 4000,
          cursorTarget: { x: 1040, y: 155 },
          action: 'click',
          waitAfterMs: 1800
        },
        {
          id: 'step-4',
          name: 'Open Air-Gapped QR Code SVG Modal',
          caption: 'Opening SVG QR Code Modal',
          type: 'click_element',
          viewport: { width: 1280, height: 750 },
          selector: '#qr-btn',
          textMatch: 'QR Code',
          durationMs: 3600,
          cursorTarget: { x: 620, y: 295 },
          action: 'click',
          waitAfterMs: 1600
        },
        {
          id: 'step-5',
          name: 'Switch Viewport to Mobile & Highlight Sticky Thumb Bar',
          caption: 'Mobile Viewport: Sticky Thumb-Reach Action Bar',
          type: 'responsive_switch',
          viewport: { width: 390, height: 820 },
          closeModalFirst: '#close-modal-btn',
          selector: '#mobile-generate-btn',
          durationMs: 4000,
          cursorTarget: { x: 140, y: 775 }, // Thumb button position
          action: 'click',
          waitAfterMs: 1200
        }
      ]
    };
  }

  // Generic AI Step Planner for any arbitrary external web URL
  const lines = promptText.split(/\r?\n|\.\s+/).map(l => l.trim()).filter(Boolean);
  const steps = [];
  const baseStepDuration = Math.max(2500, Math.floor((targetDurationSec * 1000) / Math.max(3, lines.length)));

  // Initial step: load URL
  steps.push({
    id: 'step-init',
    name: 'Initial Desktop Load',
    caption: 'Loading Web Application',
    type: 'navigate_and_inspect',
    viewport: { width: 1280, height: 750 },
    durationMs: baseStepDuration,
    cursorTarget: { x: 640, y: 350 },
    action: 'hover'
  });

  // Parse lines into actions
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    let actionType = 'click';
    let isMobile = lower.includes('mobile') || lower.includes('viewport');

    let caption = line.length > 50 ? line.slice(0, 47) + '...' : line;
    let stepObj = {
      id: `step-${index + 1}`,
      name: line.slice(0, 30),
      caption: caption,
      durationMs: baseStepDuration,
      type: isMobile ? 'responsive_switch' : 'click_element',
      viewport: isMobile ? { width: 390, height: 820 } : { width: 1280, height: 750 },
      instruction: line
    };

    if (lower.includes('scroll')) {
      stepObj.action = 'scroll';
      stepObj.scrollDelta = 300;
    } else if (lower.includes('type') || lower.includes('enter') || lower.includes('fill')) {
      stepObj.action = 'type';
    } else {
      stepObj.action = 'click';
    }

    steps.push(stepObj);
  });

  return {
    title: 'Custom Web Application Walkthrough',
    targetUrl: targetUrl,
    estimatedDurationSec: Math.round((steps.length * baseStepDuration) / 1000),
    steps
  };
}

module.exports = {
  planInstructions
};
