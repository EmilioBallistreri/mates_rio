const path = require('path');
const { Jimp } = require(path.join(__dirname, '..', 'node_modules', 'jimp'));
const potrace = require(path.join(__dirname, '..', 'node_modules', 'potrace'));
const fs = require('fs');

const userDir = 'C:/Users/marti/.gemini/antigravity-ide/brain/5a1eb8b2-dcd8-4567-8808-a1ea0a036f8f/.user_uploaded';

async function processSanLorenzo() {
  const img = await Jimp.read(path.join(userDir, 'media_1793106934749.jpg'));
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  console.log('San Lorenzo original size:', w, h);

  // In San Lorenzo:
  // Background is dark navy gradient (#232b3c) with drop shadow.
  // The shield outline has a black border (#000000), then a red border (#c8102e), then navy fill with red vertical stripes.
  // In the center, there is a circular badge: outer blue ring, white background, circular blue ring, and CASLA monogram in navy.
  // For laser engraving:
  // - Shield outer border -> Black
  // - Red stripes -> Black
  // - CASLA letters and circular rings -> Black
  // - White circle background -> White
  // - Blue stripes -> White (or hatched)
  // - Background outside shield -> White

  // Let's crop to the shield bounding box first to remove empty padding:
  // Let's find top, bottom, left, right of the shield
  let minX = w, maxX = 0, minY = h, maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = img.bitmap.data[idx];
      const g = img.bitmap.data[idx + 1];
      const b = img.bitmap.data[idx + 2];

      // Red color of the shield border/stripes
      const isRed = (r > 130 && r > g * 2 && r > b * 2);
      if (isRed) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log('Shield bounding box:', { minX, maxX, minY, maxY });
  // Add 10px margin
  minX = Math.max(0, minX - 12);
  maxX = Math.min(w - 1, maxX + 12);
  minY = Math.max(0, minY - 12);
  maxY = Math.min(h - 1, maxY + 12);

  const croppedW = maxX - minX + 1;
  const croppedH = maxY - minY + 1;
  const cropped = img.clone().crop({ x: minX, y: minY, w: croppedW, h: croppedH });

  const bw = cropped.clone();
  bw.scan(0, 0, croppedW, croppedH, (x, y, idx) => {
    const r = bw.bitmap.data[idx];
    const g = bw.bitmap.data[idx + 1];
    const b = bw.bitmap.data[idx + 2];

    // Background outside the shield is navy/shadow: r < 50, g < 60, b < 80
    // Red stripes/border: r > 100 && r > g * 1.5 && r > b * 1.5
    const isRed = (r > 100 && r > g * 1.4 && r > b * 1.4);
    // Dark outline / CASLA monogram inside center circle:
    // Center circle has white background: r > 180, g > 180, b > 180
    // Inside center circle, CASLA letters are dark navy: r < 60, g < 70, b < 100
    // Also outer black border of shield: very dark (lum < 30)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const isWhite = (r > 175 && g > 175 && b > 175);

    // If red -> Black (laser engraved)
    // If CASLA letters (dark surrounded by white or inside circle) -> Black
    // If black shield outline -> Black
    // If white circle background -> White
    // If blue stripes/background outside -> White

    // Distance to center of cropped image
    const cx = croppedW / 2;
    const cy = croppedH / 2;
    const distToCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const inCenterCircle = distToCenter < (croppedW * 0.24);

    if (inCenterCircle) {
      if (isWhite) {
        // White circular background
        bw.bitmap.data[idx] = 255;
        bw.bitmap.data[idx + 1] = 255;
        bw.bitmap.data[idx + 2] = 255;
        bw.bitmap.data[idx + 3] = 255;
      } else {
        // CASLA letters and concentric rings -> Black
        bw.bitmap.data[idx] = 0;
        bw.bitmap.data[idx + 1] = 0;
        bw.bitmap.data[idx + 2] = 0;
        bw.bitmap.data[idx + 3] = 255;
      }
    } else {
      if (isRed) {
        // Red stripes & border -> Black
        bw.bitmap.data[idx] = 0;
        bw.bitmap.data[idx + 1] = 0;
        bw.bitmap.data[idx + 2] = 0;
        bw.bitmap.data[idx + 3] = 255;
      } else if (lum < 25 && distToCenter < (croppedW * 0.48)) {
        // Outer black border of shield
        bw.bitmap.data[idx] = 0;
        bw.bitmap.data[idx + 1] = 0;
        bw.bitmap.data[idx + 2] = 0;
        bw.bitmap.data[idx + 3] = 255;
      } else {
        // Blue stripes / outside background -> White
        bw.bitmap.data[idx] = 255;
        bw.bitmap.data[idx + 1] = 255;
        bw.bitmap.data[idx + 2] = 255;
        bw.bitmap.data[idx + 3] = 255;
      }
    }
  });

  const processedPath = path.join(__dirname, 'sanlorenzo_bw.png');
  await bw.write(processedPath);
  console.log('Saved sanlorenzo_bw.png');

  potrace.trace(processedPath, { color: '#14100c', background: 'transparent', optTolerance: 0.3 }, (err, svg) => {
    if (err) throw err;
    fs.writeFileSync(path.join(__dirname, 'traced_sanlorenzo.svg'), svg);
    console.log('Saved traced_sanlorenzo.svg (' + svg.length + ' chars)');
  });
}

processSanLorenzo().catch(console.error);
