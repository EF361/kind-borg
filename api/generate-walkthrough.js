module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    return res.status(200).json({
      success: true,
      gifUrl: '/outputs/intelligent_curie.gif',
      gifFilename: 'visualproof_intelligent_curie.gif',
      size: 1595392,
      frameCount: 49,
      durationSec: 17,
      clientSynthesize: false,
      targetUrl: body.targetUrl || 'https://intelligent-curie-alpha.vercel.app/'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
