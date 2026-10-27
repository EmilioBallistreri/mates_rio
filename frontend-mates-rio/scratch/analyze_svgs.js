const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'images', 'designs');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

console.log('Found ' + files.length + ' SVG files:');
files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const fills = new Set();
  const strokes = new Set();
  
  const fillMatches = content.match(/fill="([^"]+)"/gi) || [];
  fillMatches.forEach(m => {
    const val = m.replace(/fill="/i, '').replace('"', '');
    fills.add(val);
  });
  
  const strokeMatches = content.match(/stroke="([^"]+)"/gi) || [];
  strokeMatches.forEach(m => {
    const val = m.replace(/stroke="/i, '').replace('"', '');
    strokes.add(val);
  });

  // check style="fill:...; stroke:..."
  const styleMatches = content.match(/style="([^"]+)"/gi) || [];
  styleMatches.forEach(m => {
    const s = m.replace(/style="/i, '').replace('"', '');
    const sFills = s.match(/fill:\s*([^;]+)/i);
    if (sFills) fills.add(sFills[1].trim());
    const sStrokes = s.match(/stroke:\s*([^;]+)/i);
    if (sStrokes) strokes.add(sStrokes[1].trim());
  });

  console.log(f + ' -> FILLS: ' + Array.from(fills).slice(0, 6).join(', ') + ' | STROKES: ' + Array.from(strokes).slice(0, 4).join(', '));
});
