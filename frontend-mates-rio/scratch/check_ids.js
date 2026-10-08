const fs = require('fs');
const studioJs = fs.readFileSync('js/customizer-studio.js', 'utf8');
const html = fs.readFileSync('personaliza-tu-mate.html', 'utf8');

const regex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = new Set();
while ((match = regex.exec(studioJs)) !== null) {
  ids.add(match[1]);
}

const missing = [];
for (const id of ids) {
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    missing.push(id);
  }
}

console.log('Total checked IDs:', ids.size);
console.log('Missing IDs:', missing);
