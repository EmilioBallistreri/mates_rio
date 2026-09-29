const fs = require('fs');

const catHtml = fs.readFileSync('catalogo.html', 'utf8');
const pills = catHtml.match(/<button[^>]*class=["'][^"']*filter-pill[^"']*["'][^>]*>[\s\S]*?<\/button>/gi) || [];
console.log('--- Filter pills in catalogo.html ---');
pills.forEach(p => console.log(p.replace(/\s+/g, ' ')));

console.log('\n--- Category links in index.html ---');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const catLinks = indexHtml.match(/<a[^>]*href=["'][^"']*categoria[^"']*["'][^>]*>/gi) || [];
catLinks.forEach(l => console.log(l));
