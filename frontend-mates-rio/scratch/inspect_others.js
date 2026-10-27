const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets', 'images', 'designs');

const others = ['escarapela.svg', 'ceibo.svg', 'mate.svg', 'corazon.svg', 'corona.svg', 'cruz.svg', 'laurel.svg', 'infinito.svg', 'estrella_fed.svg', 'carpincho.svg', 'hornero.svg', 'condor.svg', 'guanaco.svg', 'ciervo.svg'];

others.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  console.log(`\n================== ${file} ==================`);
  const grads = [...content.matchAll(/<(?:linearGradient|radialGradient)\b[^>]*id="([^"]+)"/gi)].map(m => m[1]);
  console.log('Gradients:', grads);
  const colors = new Set();
  const hexes = content.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  hexes.forEach(h => colors.add(h.toLowerCase()));
  console.log('Hex colors:', Array.from(colors).slice(0, 10));
});
