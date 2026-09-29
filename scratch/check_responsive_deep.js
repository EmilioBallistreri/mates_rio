const fs = require('fs');

const css = fs.readFileSync('css/styles.css', 'utf8');

// Find all media query blocks
const mqRegex = /@media\s*([^{]+)\{([\s\S]+?\}\s*\})/g;
let m;
const queries = [];
while ((m = mqRegex.exec(css)) !== null) {
  queries.push({ query: m[1].trim(), length: m[2].length });
}

console.log('--- MEDIA QUERIES DEFINED IN styles.css ---');
queries.forEach(q => console.log(`  - ${q.query} (${q.length} chars)`));

// Check flex rows without wrap
console.log('\n--- CHECKING NON-WRAPPING FLEX CONTAINERS ---');
const flexRegex = /([^{}]+)\{([^}]*display\s*:\s*flex[^}]*)\}/g;
let flexMatch;
while ((flexMatch = flexRegex.exec(css)) !== null) {
  const sel = flexMatch[1].trim().replace(/\s+/g, ' ');
  const body = flexMatch[2];
  if (!body.includes('flex-wrap') && !body.includes('flex-direction: column')) {
    // Check if it has fixed children or lots of gap
    if (body.includes('gap:') && (body.includes('min-width') || body.includes('padding: 1'))) {
      // potentially interesting
    }
  }
}

// Check HTML elements with inline styles that could cause mobile overflow
console.log('\n--- CHECKING INLINE STYLES IN HTML FOR FIXED WIDTHS ---');
const htmlFiles = ['index.html', 'catalogo.html', 'promos.html', 'personaliza-tu-mate.html', 'admin.html'];
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const styleMatches = content.match(/style=["'][^"']*width\s*:\s*\d{3,}px[^"']*["']/gi) || [];
  if (styleMatches.length > 0) {
    console.log(`\nIn ${file}:`);
    styleMatches.forEach(s => console.log('  ', s));
  }
});
