const path = require('path');
const { Jimp } = require(path.join(__dirname, '..', 'node_modules', 'jimp'));
const potrace = require(path.join(__dirname, '..', 'node_modules', 'potrace'));
const fs = require('fs');

const userDir = 'C:/Users/marti/.gemini/antigravity-ide/brain/5a1eb8b2-dcd8-4567-8808-a1ea0a036f8f/.user_uploaded';

async function processCentral() {
  const img = await Jimp.read(path.join(userDir, 'media_1793106909025.jpg'));
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  console.log('Central original size:', w, h);

  // In Rosario Central:
  // Background is blue (#163e70)
  // The outer white border of the C is white (#ffffff)
  // The C and inner details are yellow (#f3d132) and white (#ffffff)
  // Let's create a high-contrast black & white bitmap for tracing:
  // Outer background blue -> White (transparent in potrace)
  // Yellow and white lines of C, laurel, shield, CARC, stars -> Black (#000000)
  // Blue inside C -> White

  // Clone image
  const bw = img.clone();
  
  // Sample corner color (background blue)
  const bg = bw.getPixelColor(5, 5);
  // Get RGB
  const bgR = (bg >> 24) & 255;
  const bgG = (bg >> 16) & 255;
  const bgB = (bg >> 8) & 255;
  console.log('Central BG color:', bgR, bgG, bgB);

  bw.scan(0, 0, w, h, (x, y, idx) => {
    const r = bw.bitmap.data[idx];
    const g = bw.bitmap.data[idx + 1];
    const b = bw.bitmap.data[idx + 2];

    // If blue background (high blue, lower red/green)
    const isBlue = (b > r + 30) && (b > g);
    // Yellow lines: high red, high green, low blue
    const isYellow = (r > 140 && g > 140 && b < 120);
    // White lines: high r, g, b
    const isWhite = (r > 180 && g > 180 && b > 180);

    if (isYellow || isWhite) {
      // Foreground line/detail -> Black
      bw.bitmap.data[idx] = 0;
      bw.bitmap.data[idx + 1] = 0;
      bw.bitmap.data[idx + 2] = 0;
      bw.bitmap.data[idx + 3] = 255;
    } else {
      // Background / dark fill -> White
      bw.bitmap.data[idx] = 255;
      bw.bitmap.data[idx + 1] = 255;
      bw.bitmap.data[idx + 2] = 255;
      bw.bitmap.data[idx + 3] = 255;
    }
  });

  const processedPath = path.join(__dirname, 'central_bw.png');
  await bw.write(processedPath);
  console.log('Saved central_bw.png');

  // Trace with potrace
  potrace.trace(processedPath, { color: '#14100c', background: 'transparent', optTolerance: 0.3 }, (err, svg) => {
    if (err) throw err;
    fs.writeFileSync(path.join(__dirname, 'traced_central.svg'), svg);
    console.log('Saved traced_central.svg (' + svg.length + ' chars)');
  });
}

processCentral().catch(console.error);
