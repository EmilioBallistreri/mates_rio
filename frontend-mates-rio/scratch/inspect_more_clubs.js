const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets', 'images', 'designs');

const clubs = ['sanlorenzo.svg', 'independiente.svg', 'talleres.svg', 'belgrano.svg', 'central.svg', 'newells.svg', 'instituto.svg', 'racingcordoba.svg', 'afa.svg'];

clubs.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  console.log(`\n================== ${file} ==================`);
  
  // Style tag if any
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    console.log('STYLES: ', styleMatch[1].replace(/\s+/g, ' ').trim());
  }

  // Paths
  const matches = [...content.matchAll(/<(path|polygon|rect|g)\b([^>]*)>/gi)].slice(0, 8);
  matches.forEach((m, i) => {
    const fill = m[2].match(/fill[:=]["']?([^"';\s>]+)/i);
    const stroke = m[2].match(/stroke[:=]["']?([^"';\s>]+)/i);
    const cls = m[2].match(/class=["']([^"']+)["']/i);
    const id = m[2].match(/id=["']([^"']+)["']/i);
    console.log(`  <${m[1]} id="${id ? id[1] : ''}" class="${cls ? cls[1] : ''}" fill="${fill ? fill[1] : ''}" stroke="${stroke ? stroke[1] : ''}">`);
  });
});
