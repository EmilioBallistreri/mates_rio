const fs = require('fs');
const content = fs.readFileSync('frontend-mates-rio/assets/images/designs/racing.svg', 'utf8');

const matches = [...content.matchAll(/<path\b([^>]*)>/gi)];
matches.forEach((m, i) => {
  const id = m[1].match(/id="([^"]+)"/);
  const fill = m[1].match(/fill[:=]["']?([^"';\s>]+)/);
  const stroke = m[1].match(/stroke[:=]["']?([^"';\s>]+)/);
  console.log(`Racing Path ${i}: id=${id ? id[1] : ''}, fill=${fill ? fill[1] : ''}, stroke=${stroke ? stroke[1] : ''}`);
});
