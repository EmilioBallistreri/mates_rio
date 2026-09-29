const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('=== STARTING AUTOMATED AUDIT OF MATES RÍO ===\n');

// 1. Load products.js
let productsFile = fs.readFileSync(path.join(rootDir, 'js', 'products.js'), 'utf8');
// Evaluate products in a sandboxed context
const vm = require('vm');
const sandbox = { window: {}, console: console };
vm.createContext(sandbox);
try {
  vm.runInContext(productsFile + '; window.PRODUCTS_DATA = PRODUCTS_DATA; window.CATEGORIES_DATA = CATEGORIES_DATA;', sandbox);
} catch (e) {
  console.error('ERROR executing products.js:', e.message);
}

const products = sandbox.window.PRODUCTS_DATA || [];
const categories = sandbox.window.CATEGORIES_DATA || [];
console.log(`Loaded ${products.length} products and ${categories.length} categories.`);

// Check products
const productIds = new Set();
const missingImages = [];
const pricingErrors = [];

products.forEach(p => {
  if (productIds.has(p.id)) {
    console.warn(`[PRODUCT ERROR] Duplicate product ID: ${p.id} (${p.name})`);
  }
  productIds.add(p.id);

  if (p.image) {
    const imgPath = path.join(rootDir, p.image.replace(/\//g, path.sep));
    if (!fs.existsSync(imgPath)) {
      missingImages.push({ id: p.id, name: p.name, image: p.image });
    }
  } else {
    missingImages.push({ id: p.id, name: p.name, image: 'NO IMAGE DEFINED' });
  }

  if (typeof p.price !== 'number' || isNaN(p.price) || p.price <= 0) {
    pricingErrors.push({ id: p.id, name: p.name, issue: `Invalid price: ${p.price}` });
  }

  if (p.originalPrice && p.originalPrice <= p.price) {
    pricingErrors.push({ id: p.id, name: p.name, issue: `originalPrice (${p.originalPrice}) <= current price (${p.price})` });
  }
});

console.log(`\n--- PRODUCT INTEGRITY ---`);
console.log(`Duplicate IDs: ${products.length - productIds.size}`);
console.log(`Products with missing images: ${missingImages.length}`);
missingImages.forEach(m => console.log(`  - [${m.id}] ${m.name}: ${m.image}`));
console.log(`Pricing errors: ${pricingErrors.length}`);
pricingErrors.forEach(pe => console.log(`  - [${pe.id}] ${pe.name}: ${pe.issue}`));

// 2. Check HTML files for broken image references, scripts, stylesheets, and anchors
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

console.log(`\n--- HTML RESOURCE CHECKS ---`);
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  console.log(`\nAuditing ${file}...`);

  // Check <img src="...">
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) continue;
    const cleanSrc = src.split('?')[0].split('#')[0];
    const absPath = path.join(rootDir, cleanSrc.replace(/\//g, path.sep));
    if (!fs.existsSync(absPath)) {
      console.warn(`  [404 IMG] ${file} references non-existent image: ${src}`);
    }
  }

  // Check <link rel="stylesheet" href="...">
  const linkRegex = /<link[^>]+href=["']([^"']+)["']/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) continue;
    const cleanHref = href.split('?')[0].split('#')[0];
    const absPath = path.join(rootDir, cleanHref.replace(/\//g, path.sep));
    if (!fs.existsSync(absPath)) {
      console.warn(`  [404 CSS] ${file} references non-existent stylesheet: ${href}`);
    }
  }

  // Check <script src="...">
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  while ((match = scriptRegex.exec(content)) !== null) {
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) continue;
    const cleanSrc = src.split('?')[0].split('#')[0];
    const absPath = path.join(rootDir, cleanSrc.replace(/\//g, path.sep));
    if (!fs.existsSync(absPath)) {
      console.warn(`  [404 JS] ${file} references non-existent script: ${src}`);
    }
  }

  // Check internal links <a href="...">
  const aRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  while ((match = aRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href === '#') continue;
    
    if (href.startsWith('#')) {
      const id = href.slice(1);
      // check if id exists in content
      const idRegex = new RegExp(`id=["']${id}["']`, 'i');
      if (!idRegex.test(content)) {
        console.warn(`  [BROKEN ANCHOR] ${file} has link to non-existent id: ${href}`);
      }
    } else {
      const parts = href.split('#');
      const page = parts[0];
      const targetId = parts[1];
      if (page) {
        const absPath = path.join(rootDir, page.replace(/\//g, path.sep));
        if (!fs.existsSync(absPath)) {
          console.warn(`  [404 LINK] ${file} links to non-existent page: ${page}`);
        } else if (targetId) {
          const targetContent = fs.readFileSync(absPath, 'utf8');
          const idRegex = new RegExp(`id=["']${targetId}["']`, 'i');
          if (!idRegex.test(targetContent)) {
            console.warn(`  [BROKEN ANCHOR IN TARGET] ${file} links to ${page}#${targetId}, but id="${targetId}" does not exist in ${page}`);
          }
        }
      }
    }
  }
});
