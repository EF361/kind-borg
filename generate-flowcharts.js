const path = require('path');
const fs = require('fs');
const { generateFlowchartGif } = require('./src/flowchartAnimator');

async function main() {
  const outputDir = path.join(__dirname, 'public', 'outputs');
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('Generating 1. Multicolor Architecture Flowchart (Tech Brand Accents)...');
  const multiRes = await generateFlowchartGif({
    outputDir,
    colorMode: 'multicolor',
    filenamePrefix: 'flowchart_multicolor',
    title: 'Enterprise Serverless & Edge Pipeline'
  });
  console.log('Multicolor Flowchart complete:', multiRes.gifFilename, (multiRes.size / 1024 / 1024).toFixed(2), 'MB');

  console.log('\nGenerating 2. One Color Architecture Flowchart (Minimalist Blue)...');
  const oneRes = await generateFlowchartGif({
    outputDir,
    colorMode: 'onecolor',
    filenamePrefix: 'flowchart_onecolor',
    title: 'Enterprise Serverless & Edge Pipeline'
  });
  console.log('One Color Flowchart complete:', oneRes.gifFilename, (oneRes.size / 1024 / 1024).toFixed(2), 'MB');

  // Also create backward compatibility copy for flowchart_architecture.gif
  fs.copyFileSync(path.join(outputDir, 'flowchart_multicolor.gif'), path.join(outputDir, 'flowchart_architecture.gif'));
  fs.copyFileSync(path.join(outputDir, 'flowchart_multicolor.webm'), path.join(outputDir, 'flowchart_architecture.webm'));
  console.log('\nCopied fallback compatibility files (flowchart_architecture.gif & .webm).');
}

main().catch(err => {
  console.error('Flowchart generation error:', err);
  process.exit(1);
});
