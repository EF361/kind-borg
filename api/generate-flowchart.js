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
      clientSynthesize: true,
      title: body.title || 'Architecture Flow',
      nodes: body.nodes || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
