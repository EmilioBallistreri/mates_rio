const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Gather all JS function names from js/*.js
const jsFiles = ['products.js', 'app.js', 'customizer.js', 'admin.js'];
const definedFunctions = new Set();

jsFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, 'js', file), 'utf8');
  // Match function name(...)
  const fnRegex = /(?:function\s+([a-zA-Z0-9_$]+)\s*\(|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g;
  let m;
  while ((m = fnRegex.exec(content)) !== null) {
    const fnName = m[1] || m[2];
    definedFunctions.add(fnName);
  }
});

console.log(`Gathered ${definedFunctions.size} defined JS functions.`);

// 2. Check inline handlers in HTML files
const htmlFiles = ['index.html', 'catalogo.html', 'promos.html', 'personaliza-tu-mate.html', 'admin.html'];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  console.log(`\n--- Auditing inline handlers in ${file} ---`);

  const handlerRegex = /\s(on[a-z]+)=["']([^"']+)["']/gi;
  let m;
  const missingHandlers = [];

  while ((m = handlerRegex.exec(content)) !== null) {
    const handlerType = m[1];
    const code = m[2];

    // Find function calls like fnName(...)
    const callRegex = /([a-zA-Z0-9_$]+)\s*\(/g;
    let callMatch;
    while ((callMatch = callRegex.exec(code)) !== null) {
      const fnName = callMatch[1];
      // ignore built-ins
      if (['parseInt', 'parseFloat', 'alert', 'confirm', 'prompt', 'encodeURIComponent', 'decodeURIComponent', 'Math', 'Date', 'Set', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'close'].includes(fnName)) continue;
      if (code.includes(`.${fnName}(`)) continue; // method call like e.preventDefault() or document.getElementById(...) or overlay.classList.remove(...)

      if (!definedFunctions.has(fnName)) {
        missingHandlers.push({ handler: handlerType, code: code.trim(), fnName });
      }
    }
  }

  if (missingHandlers.length === 0) {
    console.log(`  All inline handler functions are defined!`);
  } else {
    missingHandlers.forEach(mh => {
      console.warn(`  [MISSING FUNCTION] In ${file}: ${mh.handler}="${mh.code}" calls undefined "${mh.fnName}"`);
    });
  }
});
