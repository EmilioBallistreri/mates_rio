const fs = require('fs');

['racing.svg', 'sanlorenzo.svg', 'ceibo.svg', 'mapa.svg'].forEach(f => {
  const content = fs.readFileSync('frontend-mates-rio/scratch/vectorized_test/' + f, 'utf8');
  console.log('=== ' + f + ' ===');
  const fills = content.match(/(?:fill|stroke|stop-color)\s*[:=]\s*["']?([^"';\s>)]+)/gi);
  console.log(fills);
});
