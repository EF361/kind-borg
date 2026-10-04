module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    return res.status(200).json({
      success: true,
      gifUrl: '/outputs/flowchart_1791097117878.gif',
      gifFilename: 'flowchart_architecture.gif',
      size: 849001,
      frameCount: 36,
      durationSec: 11,
      clientSynthesize: false
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
