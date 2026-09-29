const fs = require('fs');
const css = fs.readFileSync('css/admin.css', 'utf8');

const mqRegex = /@media\s*([^{]+)\{([\s\S]+?\}\s*\})/g;
let m;
console.log('--- MEDIA QUERIES IN admin.css ---');
while ((m = mqRegex.exec(css)) !== null) {
  console.log(`  - ${m[1].trim()} (${m[2].length} chars)`);
}
