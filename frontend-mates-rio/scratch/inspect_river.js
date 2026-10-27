const fs = require('fs');
const content = fs.readFileSync('frontend-mates-rio/assets/images/designs/river.svg', 'utf8');

// Print all paths and their bounding/d info
const matches = [...content.matchAll(/<path\b([^>]*)>/gi)];
matches.forEach((m, i) => {
  const id = m[1].match(/id="([^"]+)"/);
  const fill = m[1].match(/fill[:=]["']?([^"';\s>]+)/);
  console.log(`Path ${i}: id=${id ? id[1] : ''}, fill=${fill ? fill[1] : ''}`);
});
