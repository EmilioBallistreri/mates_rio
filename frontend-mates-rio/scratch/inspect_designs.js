const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'images', 'designs');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const fills = {};
  const re = /(?:fill|stroke)\s*[:=]\s*["']?([^"';\s>)]+)/gi;
  let match;
  while ((match = re.exec(content)) !== null) {
    const val = match[1];
    fills[val] = (fills[val] || 0) + 1;
  }
  console.log(`=== ${f} ===`);
  console.log(fills);
});
