const path = require('path');
const potrace = require(path.join(__dirname, '..', 'node_modules', 'potrace'));
const fs = require('fs');

const userDir = 'C:/Users/marti/.gemini/antigravity-ide/brain/5a1eb8b2-dcd8-4567-8808-a1ea0a036f8f/.user_uploaded';
const imgPath = path.join(userDir, 'media_1793106893459.png');

const params = {
  color: '#14100c',
  background: 'transparent',
  threshold: 128,
  optTolerance: 0.4
};

potrace.trace(imgPath, params, (err, svg) => {
  if (err) throw err;
  fs.writeFileSync(path.join(__dirname, 'traced_instituto.svg'), svg);
  console.log('Successfully traced Instituto to traced_instituto.svg (' + svg.length + ' chars)');
});
