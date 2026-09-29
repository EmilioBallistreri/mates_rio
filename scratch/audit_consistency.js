const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'catalogo.html', 'promos.html', 'personaliza-tu-mate.html', 'admin.html'];

console.log('=== 1. ENCODING & MOJISAKE / CORRUPTED CHARACTERS AUDIT ===');
const corruptedPatterns = [
  /Ã¡/g, /Ã©/g, /Ã­/g, /Ã³/g, /Ãº/g, /Ã±/g, /Â¿/g, /Â¡/g, /â€/g, /Ã/g
];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  corruptedPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      console.warn(`[CORRUPT CHAR] In ${file}: found pattern ${pattern}`);
    }
  });
});

console.log('\n=== 2. CONTACT INFO & SOCIAL MEDIA CONSISTENCY ===');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  console.log(`\n-- ${file} --`);
  
  // WhatsApp links
  const waMatches = content.match(/href=["'](https?:\/\/(wa\.me|api\.whatsapp\.com)[^"']+)["']/g) || [];
  const uniqueWa = [...new Set(waMatches.map(m => m.replace(/href=["']|["']/g, '')))];
  console.log('  WhatsApp links:', uniqueWa);

  // Instagram links
  const igMatches = content.match(/href=["'](https?:\/\/(www\.)?instagram\.com[^"']+)["']/g) || [];
  const uniqueIg = [...new Set(igMatches.map(m => m.replace(/href=["']|["']/g, '')))];
  console.log('  Instagram links:', uniqueIg);

  // TikTok links
  const ttMatches = content.match(/href=["'](https?:\/\/(www\.)?tiktok\.com[^"']+)["']/g) || [];
  const uniqueTt = [...new Set(ttMatches.map(m => m.replace(/href=["']|["']/g, '')))];
  console.log('  TikTok links:', uniqueTt);

  // Facebook links
  const fbMatches = content.match(/href=["'](https?:\/\/(www\.)?facebook\.com[^"']+)["']/g) || [];
  const uniqueFb = [...new Set(fbMatches.map(m => m.replace(/href=["']|["']/g, '')))];
  console.log('  Facebook links:', uniqueFb);

  // Emails
  const mailMatches = content.match(/mailto:([^"']+)/g) || [];
  const uniqueMail = [...new Set(mailMatches.map(m => m.replace(/mailto:/g, '')))];
  console.log('  Emails:', uniqueMail);
});

console.log('\n=== 3. MARKETING PROMOS & THRESHOLDS CONSISTENCY ===');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  console.log(`\n-- ${file} --`);
  
  // Free shipping mention
  const shippingMentions = content.match(/(?:env[íi]o|gratis)[^<.\n]{0,40}(?:\d{2,3}[\.,]?\d{3}|gratis)/gi) || [];
  console.log('  Shipping mentions:', [...new Set(shippingMentions)].slice(0, 5));

  // Installments mention
  const installmentMentions = content.match(/\d+\s+cuotas[^<.\n]{0,30}/gi) || [];
  console.log('  Installments:', [...new Set(installmentMentions)].slice(0, 5));

  // Transfer discount mention
  const transferMentions = content.match(/\d+%\s*off[^<.\n]{0,30}/gi) || [];
  console.log('  Discount mentions:', [...new Set(transferMentions)].slice(0, 5));
});
