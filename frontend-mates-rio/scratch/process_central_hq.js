const path = require('path');
const { Jimp } = require(path.join(__dirname, '..', 'node_modules', 'jimp'));
const potrace = require(path.join(__dirname, '..', 'node_modules', 'potrace'));
const fs = require('fs');

const userDir = 'C:/Users/marti/.gemini/antigravity-ide/brain/5a1eb8b2-dcd8-4567-8808-a1ea0a036f8f/.user_uploaded';

async function processCentralHQ() {
  const img = await Jimp.read(path.join(userDir, 'media_1793106909025.jpg'));
  
  // Resize to 880x880 to increase vector point resolution and smoothness
  img.resize({ w: 880, h: 880 });
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  // Let's create an enhanced silhouette mask
  const bw = img.clone();

  bw.scan(0, 0, w, h, (x, y, idx) => {
    const r = bw.bitmap.data[idx];
    const g = bw.bitmap.data[idx + 1];
    const b = bw.bitmap.data[idx + 2];

    // In Rosario Central:
    // Background blue: r ~ 15-40, g ~ 55-90, b ~ 100-140 (b is significantly higher than r and g)
    // Foreground yellow/gold and white lines:
    // Yellow: r > 110, g > 110
    // White: r > 160, g > 160, b > 160
    const isBlueBg = (b > r + 35) && (b > g);
    const isBrightYellow = (r > 105 && g > 105);
    const isWhite = (r > 150 && g > 150 && b > 150);

    // If it's part of the C, laurel, shield, stars, letters:
    if (!isBlueBg && (isBrightYellow || isWhite)) {
      bw.bitmap.data[idx] = 0;
      bw.bitmap.data[idx + 1] = 0;
      bw.bitmap.data[idx + 2] = 0;
      bw.bitmap.data[idx + 3] = 255;
    } else {
      bw.bitmap.data[idx] = 255;
      bw.bitmap.data[idx + 1] = 255;
      bw.bitmap.data[idx + 2] = 255;
      bw.bitmap.data[idx + 3] = 255;
    }
  });

  const processedPath = path.join(__dirname, 'central_bw_hq.png');
  await bw.write(processedPath);

  potrace.trace(processedPath, {
    color: '#14100c',
    background: 'transparent',
    optTolerance: 0.2,
    threshold: 128,
    turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY
  }, (err, svg) => {
    if (err) throw err;
    fs.writeFileSync(path.join(__dirname, 'traced_central.svg'), svg);
    console.log('Saved enhanced traced_central.svg (' + svg.length + ' chars)');
  });
}

processCentralHQ().catch(console.error);
