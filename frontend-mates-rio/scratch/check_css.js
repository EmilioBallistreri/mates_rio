const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'styles.css');
const css = fs.readFileSync(cssPath, 'utf8');

console.log('=== CSS RESPONSIVE & LAYOUT AUDIT ===\n');

// 1. Check fixed widths
const fixedWidthRegex = /([^{}]+)\{([^}]+)\}/g;
let match;

const potentialOverflowRules = [];

while ((match = fixedWidthRegex.exec(css)) !== null) {
  const selector = match[1].trim();
  const body = match[2];

  // Look for width: Npx where N > 320 and no max-width: 100% in body
  const widthMatch = body.match(/(?<!max-|min-)width\s*:\s*(\d+)px/);
  const minWidthMatch = body.match(/min-width\s*:\s*(\d+)px/);

  if (widthMatch) {
    const px = parseInt(widthMatch[1], 10);
    if (px > 340 && !body.includes('max-width') && !selector.includes('@media') && !selector.includes('container')) {
      potentialOverflowRules.push({ selector, prop: `width: ${px}px`, snippet: body.trim().replace(/\s+/g, ' ').slice(0, 100) });
    }
  }

  if (minWidthMatch) {
    const px = parseInt(minWidthMatch[1], 10);
    if (px > 340 && !body.includes('max-width')) {
      potentialOverflowRules.push({ selector, prop: `min-width: ${px}px`, snippet: body.trim().replace(/\s+/g, ' ').slice(0, 100) });
    }
  }
}

console.log(`Found ${potentialOverflowRules.length} potential fixed/min width issues that could cause mobile overflow:`);
potentialOverflowRules.forEach(r => {
  console.log(`  - [${r.selector}] -> ${r.prop}`);
});

// 2. Check z-index stacking
const zIndexMatches = [];
const zRegex = /([^{}]+)\{([^}]*z-index\s*:\s*(\d+)[^}]*)\}/g;
while ((match = zRegex.exec(css)) !== null) {
  const selector = match[1].trim().split('\n').pop().trim();
  const z = parseInt(match[3], 10);
  zIndexMatches.push({ selector, zIndex: z });
}

zIndexMatches.sort((a, b) => b.zIndex - a.zIndex);
console.log('\nTop Z-Index Elements:');
zIndexMatches.slice(0, 15).forEach(item => {
  console.log(`  - z-index: ${item.zIndex} -> ${item.selector}`);
});

// 3. Check WhatsApp popup and cart floating placement
console.log('\n--- FLOATING ACTIONS CHECK ---');
const waRules = css.match(/\.floating-whatsapp[^{]*\{[^}]+\}/g) || [];
waRules.forEach(r => console.log('WA:', r.replace(/\s+/g, ' ')));

const bttRules = css.match(/\.back-to-top[^{]*\{[^}]+\}/g) || [];
bttRules.forEach(r => console.log('BTT:', r.replace(/\s+/g, ' ')));
