const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Extract all document.getElementById and querySelector from js/app.js
const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8');

const idRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
const appIds = new Set();
let m;
while ((m = idRegex.exec(appJs)) !== null) {
  appIds.add(m[1]);
}

console.log(`js/app.js references ${appIds.size} unique element IDs via getElementById.`);

const pages = ['index.html', 'catalogo.html', 'promos.html', 'personaliza-tu-mate.html'];

pages.forEach(page => {
  const html = fs.readFileSync(path.join(rootDir, page), 'utf8');
  console.log(`\n--- Element ID check for ${page} ---`);
  const missing = [];
  appIds.forEach(id => {
    if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
      missing.push(id);
    }
  });
  console.log(`Missing element IDs (${missing.length}):`, missing);
});
