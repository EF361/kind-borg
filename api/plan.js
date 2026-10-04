const { planInstructions } = require('../src/planner');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const prompt = body.prompt || 'Quick one-tap generation on Desktop...';
    const targetUrl = body.targetUrl || 'https://my-app.vercel.app';
    const duration = body.duration || 18;

    const plan = planInstructions(prompt, targetUrl, { duration });
    return res.status(200).json({ success: true, plan });
  } catch (err) {
    console.error('Plan API error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
