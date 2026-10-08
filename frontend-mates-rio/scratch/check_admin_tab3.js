const fs = require('fs');
const adminJs = fs.readFileSync('js/admin.js', 'utf8');
const adminHtml = fs.readFileSync('admin.html', 'utf8');

const targetFunctions = [
  'selectOccasionPosition',
  'renderOccasionEmojiPalette',
  'switchEmojiCategory',
  'insertOccasionEmoji',
  'saveOccasionSettings',
  'applyOccasionPreset',
  'updateOccasionPreview'
];

const missingFns = targetFunctions.filter(fn => !adminJs.includes(`function ${fn}`) && !adminJs.includes(`${fn} =`));
console.log('Missing Tab 3 Functions:', missingFns);

const targetIds = [
  'occasion-pos-top-bar',
  'occasion-pos-after-hero',
  'occasion-pos-before-custom',
  'occasion-pos-bottom',
  'occasion-emoji-palette',
  'occasion-preview-banner',
  'occasion-badge',
  'occasion-title',
  'occasion-subtitle',
  'occasion-btn-text',
  'occasion-btn-url',
  'occasion-active'
];

const missingIds = targetIds.filter(id => !adminHtml.includes(id));
console.log('Missing Tab 3 IDs:', missingIds);
