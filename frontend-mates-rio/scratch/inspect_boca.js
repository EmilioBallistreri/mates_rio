const fs = require('fs');
const content = fs.readFileSync('frontend-mates-rio/assets/images/designs/boca.svg', 'utf8');

// Match all elements outside pattern
const withoutPattern = content.replace(/<pattern[\s\S]*?<\/pattern>/, '');
console.log('Outside pattern elements:');
const re = /<(path|polygon|rect|g)\b([^>]*)>/gi;
let m;
while ((m = re.exec(withoutPattern)) !== null) {
  const fill = m[2].match(/fill=["']?([^"';\s>]+)/i);
  const stroke = m[2].match(/stroke=["']?([^"';\s>]+)/i);
  const d = m[2].match(/d=["']([^"']{1,40})/i);
  const points = m[2].match(/points=["']([^"']{1,40})/i);
  if (fill || stroke) {
    console.log(`<${m[1]} fill="${fill ? fill[1] : ''}" stroke="${stroke ? stroke[1] : ''}" data="${d ? d[1] : (points ? points[1] : '')}...">`);
  }
}
