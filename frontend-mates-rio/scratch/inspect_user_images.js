const path = require('path');
const Jimp = require(path.join(__dirname, '..', 'node_modules', 'jimp'));
const fs = require('fs');

const userDir = 'C:/Users/marti/.gemini/antigravity-ide/brain/5a1eb8b2-dcd8-4567-8808-a1ea0a036f8f/.user_uploaded';

async function inspectImages() {
  const central = await Jimp.read(path.join(userDir, 'media_1793106909025.jpg'));
  console.log('Central dimensions:', central.bitmap.width, 'x', central.bitmap.height);
  
  const sanlorenzo = await Jimp.read(path.join(userDir, 'media_1793106934749.jpg'));
  console.log('San Lorenzo dimensions:', sanlorenzo.bitmap.width, 'x', sanlorenzo.bitmap.height);

  const instituto = await Jimp.read(path.join(userDir, 'media_1793106893459.png'));
  console.log('Instituto dimensions:', instituto.bitmap.width, 'x', instituto.bitmap.height);
}

inspectImages().catch(console.error);
