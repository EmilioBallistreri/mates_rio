const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'images', 'designs');

['river.svg', 'boca.svg', 'afa.svg', 'racing.svg', 'talleres.svg', 'sanlorenzo.svg', 'belgrano.svg', 'central.svg', 'newells.svg', 'independiente.svg', 'instituto.svg', 'soldemayo.svg'].forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  console.log(`\n================== ${file} ==================`);
  
  // Extract all paths/polygons/rects with their fill and stroke
  const tagRe = /<(path|polygon|polyline|rect|circle|ellipse|g)\b([^>]*)>/gi;
  let match;
  let count = 0;
  while ((match = tagRe.exec(content)) !== null) {
    const tag = match[1];
    const attrs = match[2];
    const fill = attrs.match(/fill[:=]["']?([^"';\s>]+)/i);
    const stroke = attrs.match(/stroke[:=]["']?([^"';\s>]+)/i);
    const id = attrs.match(/id=["']([^"']+)["']/i);
    const cls = attrs.match(/class=["']([^"']+)["']/i);
    if (fill || stroke || cls) {
      count++;
      if (count <= 10) {
        console.log(`  <${tag} id="${id ? id[1] : ''}" class="${cls ? cls[1] : ''}" fill="${fill ? fill[1] : ''}" stroke="${stroke ? stroke[1] : ''}">`);
      }
    }
  }
  console.log(`  Total tagged shape elements: ${count}`);
});
