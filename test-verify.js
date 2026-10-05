const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./src/server');
const { planInstructions } = require('./src/planner');
const { generateFlowchartGif } = require('./src/flowchartAnimator');
const { recordWalkthrough } = require('./src/recorder');

const TEST_PORT = 3001;

async function runTests() {
  console.log('=== Starting VisualProof Studio Automated Verification ===\n');

  // Start test server
  const server = app.listen(TEST_PORT);
  console.log(`[PASS] Server started on port ${TEST_PORT}`);

  try {
    // 1. Health check
    const healthRes = await fetch(`http://localhost:${TEST_PORT}/api/health`);
    const healthData = await healthRes.json();
    if (healthData.status !== 'ok') throw new Error('Health check failed');
    console.log('[PASS] Health check OK:', healthData);

    // 2. Test Step Planner
    const userPrompt = `Quick one-tap generation on Desktop showing the split-panel with the sticky settings sidebar.
Toggling into Passphrase mode (showing words like correct-horse-battery-staple).
Clicking the QR Code button and showing the SVG modal open.
Switching the viewport to Mobile to highlight the sticky thumb-reach action bar at the bottom.`;

    const plan = planInstructions(userPrompt, `http://localhost:${TEST_PORT}/demo`, { duration: 18 });
    if (!plan.steps || plan.steps.length !== 5) {
      throw new Error(`Expected 5 steps, got ${plan.steps ? plan.steps.length : 0}`);
    }
    console.log(`[PASS] Step planner produced 5 detailed steps (~${plan.estimatedDurationSec}s estimated duration)`);
    plan.steps.forEach((s, idx) => {
      console.log(`   Step ${idx + 1}: ${s.caption} (${s.type}, ${s.durationMs}ms)`);
    });

    // 3. Test Flowchart GIF generator
    console.log('\nTesting Flowchart GIF generation...');
    const flowRes = await generateFlowchartGif({
      title: 'Test Verification Architecture Flow',
      outputDir: path.join(__dirname, 'public', 'outputs')
    });
    if (!fs.existsSync(flowRes.gifPath)) throw new Error('Flowchart GIF file was not created');
    const flowHeader = fs.readFileSync(flowRes.gifPath).slice(0, 6).toString('ascii');
    if (!flowHeader.startsWith('GIF89') && !flowHeader.startsWith('GIF87')) {
      throw new Error(`Invalid GIF header: ${flowHeader}`);
    }
    console.log(`[PASS] Flowchart GIF generated successfully: ${flowRes.gifFilename} (${flowRes.frameCount} frames, ${Math.round(flowRes.size / 1024)} KB, ${flowRes.durationSec}s)`);

    // 4. Test Playwright Web App Walkthrough recording
    console.log('\nTesting Web Walkthrough recording with Playwright...');
    const walkRes = await recordWalkthrough(plan, {
      outputDir: path.join(__dirname, 'public', 'outputs')
    });
    if (!fs.existsSync(walkRes.gifPath)) throw new Error('Walkthrough GIF file was not created');
    const walkHeader = fs.readFileSync(walkRes.gifPath).slice(0, 6).toString('ascii');
    if (!walkHeader.startsWith('GIF89') && !walkHeader.startsWith('GIF87')) {
      throw new Error(`Invalid GIF header: ${walkHeader}`);
    }
    console.log(`[PASS] Walkthrough GIF generated successfully: ${walkRes.gifFilename} (${walkRes.frameCount} frames, ${(walkRes.size / (1024 * 1024)).toFixed(2)} MB, ${walkRes.durationSec}s)`);

    console.log('\n=== All Tests Passed Successfully! ===');
  } finally {
    server.close();
    console.log('Test server closed.');
  }
}

runTests().catch(err => {
  console.error('\n[FAIL] Test verification failed:', err);
  process.exit(1);
});
