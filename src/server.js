const express = require('express');
const path = require('path');
const fs = require('fs');
const { planInstructions } = require('./planner');
const { recordWalkthrough } = require('./recorder');
const { generateFlowchartGif } = require('./flowchartAnimator');

const app = express();
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'outputs');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/outputs', express.static(OUTPUT_DIR));

// Demo route shortcut
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'demo', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'VisualProof Studio', uptime: process.uptime() });
});

// Step Planner Endpoint
app.post('/api/plan', (req, res) => {
  try {
    const { prompt, targetUrl, duration } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }
    const defaultUrl = `http://localhost:${PORT}/demo`;
    const plan = planInstructions(prompt, targetUrl || defaultUrl, { duration });
    res.json({ success: true, plan });
  } catch (err) {
    console.error('Plan generation failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate Web Walkthrough GIF & Video
app.post('/api/generate-walkthrough', async (req, res) => {
  try {
    let { plan, prompt, targetUrl, duration, aspectRatio, fitStrategy } = req.body;
    const defaultUrl = `http://localhost:${PORT}/demo`;

    if (!plan) {
      if (!prompt) {
        return res.status(400).json({ error: 'Missing plan or prompt' });
      }
      plan = planInstructions(prompt, targetUrl || defaultUrl, { duration });
    }

    // Ensure absolute targetUrl with port if local path
    if (plan.targetUrl && plan.targetUrl.startsWith('/')) {
      plan.targetUrl = `http://localhost:${PORT}${plan.targetUrl}`;
    }

    console.log(`[Server] Generating walkthrough for "${plan.title}" (${plan.targetUrl}) [${aspectRatio || '1:1'}]...`);
    const result = await recordWalkthrough(plan, {
      outputDir: OUTPUT_DIR,
      aspectRatio,
      fitStrategy,
      duration: duration || plan.estimatedDurationSec
    });

    res.json({
      success: true,
      gifUrl: `/outputs/${result.gifFilename}`,
      videoUrl: result.videoFilename ? `/outputs/${result.videoFilename}` : null,
      ...result
    });
  } catch (err) {
    console.error('Walkthrough recording failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate Flowchart Architecture GIF & Video
app.post('/api/generate-flowchart', async (req, res) => {
  try {
    const { title, nodes, stages, colorMode } = req.body;
    const resolvedStages = (stages && stages.length > 0) ? stages : nodes;
    console.log(`[Server] Generating flowchart for "${title || 'Architecture Flow'}" [${colorMode || 'multicolor'}]...`);
    const result = await generateFlowchartGif({
      title,
      stages: resolvedStages,
      colorMode: colorMode || 'multicolor',
      outputDir: OUTPUT_DIR
    });

    res.json({
      success: true,
      gifUrl: `/outputs/${result.gifFilename}`,
      videoUrl: result.videoFilename ? `/outputs/${result.videoFilename}` : null,
      ...result
    });
  } catch (err) {
    console.error('Flowchart generation failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// List recent generated outputs
app.get('/api/outputs', (req, res) => {
  try {
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.gif') || f.endsWith('.webm') || f.endsWith('.mp4'))
      .map(filename => {
        const filePath = path.join(OUTPUT_DIR, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          url: `/outputs/${filename}`,
          sizeBytes: stats.size,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`VisualProof Studio running at http://localhost:${PORT}`);
    console.log(`Built-in demo target available at http://localhost:${PORT}/demo`);
  });
}

module.exports = app;
