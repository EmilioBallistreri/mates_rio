const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'assets', 'images', 'designs_original_backup');
const outDir = path.join(__dirname, '..', 'scratch', 'vectorized_test');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const LASER_DARK = '#14100c';
const LASER_LIGHT = '#ffffff';

function convertSvgToLaserVector(filename, content) {
  let res = content;

  if (filename === 'boca.svg') {
    res = res.replace(/fill="#005EAC"/gi, `fill="${LASER_LIGHT}"`);
    res = res.replace(/fill="#FFD800"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#F6BB60"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#FFFFFF"/gi, `fill="${LASER_LIGHT}"`);
    return res;
  }

  if (filename === 'river.svg') {
    res = res.replace(/fill:#ed192d/gi, `fill:${LASER_DARK}`);
    res = res.replace(/fill:#231f20/gi, `fill:${LASER_DARK}`);
    res = res.replace(/fill:#ffffff/gi, `fill:${LASER_LIGHT}`);
    return res;
  }

  if (filename === 'racing.svg') {
    // Only replace the cyan color with LASER_DARK, preserving white elements and valid XML syntax
    res = res.replace(/fill="#00afe9"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/stroke="#00afe9"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/fill:\s*#00afe9/gi, `fill:${LASER_DARK}`);
    res = res.replace(/stroke:\s*#00afe9/gi, `stroke:${LASER_DARK}`);
    return res;
  }

  if (filename === 'independiente.svg') {
    res = res.replace(/\.st1\s*\{[^}]*fill:\s*#ED1C24[^}]*\}/gi, `.st1{fill:${LASER_DARK};}`);
    res = res.replace(/\.st0\s*\{[^}]*fill:\s*#FFFFFF[^}]*\}/gi, `.st0{fill:${LASER_LIGHT};}`);
    res = res.replace(/fill="#ED1C24"/gi, `fill="${LASER_DARK}"`);
    return res;
  }

  if (filename === 'talleres.svg') {
    res = res.replace(/fill:#040D2D/gi, `fill:${LASER_DARK}`);
    res = res.replace(/fill:#E2E1D8/gi, `fill:${LASER_LIGHT}`);
    return res;
  }

  if (filename === 'belgrano.svg') {
    res = res.replace(/\.fil0\s*\{fill:#373435\}/gi, `.fil0 {fill:${LASER_DARK}}`);
    res = res.replace(/\.fil1\s*\{fill:#FEFEFE\}/gi, `.fil1 {fill:${LASER_LIGHT}}`);
    res = res.replace(/\.fil2\s*\{fill:#00BBF1\}/gi, `.fil2 {fill:${LASER_DARK}}`);
    res = res.replace(/\.fil3\s*\{fill:#373435/gi, `.fil3 {fill:${LASER_DARK}`);
    return res;
  }

  if (filename === 'central.svg') {
    res = res.replace(/\.st0\s*\{[^}]*fill:\s*#002A6F[^}]*\}/gi, `.st0{fill:${LASER_DARK};}`);
    res = res.replace(/\.st1\s*\{[^}]*fill:\s*#FAC900[^}]*\}/gi, `.st1{fill:${LASER_LIGHT};}`);
    res = res.replace(/\.st2\s*\{[^}]*fill:\s*#FFCB05[^}]*\}/gi, `.st2{fill:${LASER_LIGHT};}`);
    return res;
  }

  if (filename === 'newells.svg') {
    res = res.replace(/fill="#E5231E"/gi, `fill="${LASER_DARK}"`);
    return res;
  }

  if (filename === 'sanlorenzo.svg') {
    res = res.replace(/fill:#040607/gi, `fill:${LASER_DARK}`);
    res = res.replace(/fill:#ea202c/gi, `fill:${LASER_DARK}`);
    res = res.replace(/fill:#263a54/gi, `fill:${LASER_LIGHT}`);
    res = res.replace(/fill:#fefefe/gi, `fill:${LASER_LIGHT}`);
    res = res.replace(/fill="#040607"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#ea202c"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#263a54"/gi, `fill="${LASER_LIGHT}"`);
    res = res.replace(/fill="#fefefe"/gi, `fill="${LASER_LIGHT}"`);
    return res;
  }

  if (filename === 'instituto.svg') {
    res = res.replace(/fill="url\(#SVGID_1_\)"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="url\(#SVGID_2_\)"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="url\(#SVGID_5_\)"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/#C20000/gi, LASER_DARK);
    res = res.replace(/#FF0000/gi, LASER_DARK);
    res = res.replace(/fill="#020202"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#9E9D9D"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/stroke="#020202"/gi, `stroke="${LASER_DARK}"`);
    return res;
  }

  if (filename === 'racingcordoba.svg') {
    res = res.replace(/fill="#00A1DF"/gi, `fill="${LASER_DARK}"`);
    return res;
  }

  if (filename === 'afa.svg') {
    res = res.replace(/stop-color="#ac936e"/gi, `stop-color="${LASER_DARK}"`);
    res = res.replace(/stop-color="#4f6f98"/gi, `stop-color="#241e18"`);
    res = res.replace(/fill="url\(#g[1-4]\)"/gi, `fill="${LASER_DARK}"`);
    return res;
  }

  if (filename === 'soldemayo.svg') {
    res = res.replace(/fill="#fcbf49"/gi, `fill="none"`);
    res = res.replace(/stroke="#843511"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/fill="#843511"/gi, `fill="${LASER_DARK}"`);
    return res;
  }

  if (filename === 'escarapela.svg') {
    res = res.replace(/<stop\s+offset="0%"\s+stop-color="#8fd3fe"\/>/gi, `<stop offset="0%" stop-color="${LASER_DARK}"/>`);
    res = res.replace(/<stop\s+offset="50%"\s+stop-color="#6cb4ee"\/>/gi, `<stop offset="50%" stop-color="#2a221b"/>`);
    res = res.replace(/<stop\s+offset="100%"\s+stop-color="#4695d6"\/>/gi, `<stop offset="100%" stop-color="${LASER_DARK}"/>`);
    res = res.replace(/#6cb4ee/gi, '#2a221b');
    res = res.replace(/#4695d6/gi, LASER_DARK);
    res = res.replace(/#8fd3fe/gi, LASER_DARK);
    res = res.replace(/stroke="#3a82c4"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/stroke="#2b75b8"/gi, `stroke="${LASER_DARK}"`);
    return res;
  }

  if (filename === 'ceibo.svg') {
    res = res.replace(/stop-color="#ff334b"/gi, `stop-color="#3b322a"`);
    res = res.replace(/stop-color="#c8102e"/gi, `stop-color="${LASER_DARK}"`);
    res = res.replace(/stop-color="#7a0016"/gi, `stop-color="${LASER_DARK}"`);
    res = res.replace(/stop-color="#4a7c29"/gi, `stop-color="#2a221b"`);
    res = res.replace(/stop-color="#234510"/gi, `stop-color="${LASER_DARK}"`);
    res = res.replace(/fill="#3a6920"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#4a7c29"/gi, `fill="#2a221b"`);
    res = res.replace(/fill="#5c1d1d"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#e61c38"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/stroke="#1d380f"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/stroke="#254a13"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/stroke="#330b0b"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/fill="#ff4a65"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/stroke="#940520"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/stroke="#5e0010"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/stroke="#7a0016"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/stroke="#ffe066"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/fill="#ffb700"/gi, `fill="${LASER_DARK}"`);
    return res;
  }

  if (filename === 'mate.svg') {
    res = res.replace(/stop-color="#4a2e1b"/gi, `stop-color="#2e251e"`);
    res = res.replace(/stop-color="#2c1a0e"/gi, `stop-color="${LASER_DARK}"`);
    res = res.replace(/stop-color="#140b06"/gi, `stop-color="${LASER_DARK}"`);
    res = res.replace(/fill="#e5c158"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/stroke="#a3821e"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/stroke="#1a0f08"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/stroke="#7a5230"/gi, `stroke="${LASER_DARK}"`);
    res = res.replace(/stroke="#c29b68"/gi, `stroke="#ffffff"`);
    res = res.replace(/fill="#2d421e"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#3d5e27"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#5c873b"/gi, `fill="#2a221b"`);
    return res;
  }

  if (filename === 'malvinas_blank.svg') {
    res = res.replace(/fill="#fefee4"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/stroke="#0978ab"/gi, `stroke="${LASER_DARK}"`);
    return res;
  }

  if (filename === 'mapa.svg') {
    res = res.replace(/fill:#d3d3d3/gi, `fill:${LASER_DARK}`);
    res = res.replace(/fill:#ececec/gi, `fill:${LASER_DARK}`);
    res = res.replace(/fill="#d3d3d3"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/fill="#ececec"/gi, `fill="${LASER_DARK}"`);
    res = res.replace(/stroke:#ffffff/gi, `stroke:${LASER_DARK}`);
    res = res.replace(/stroke="#ffffff"/gi, `stroke="${LASER_DARK}"`);
    return res;
  }

  // General conversion for illustrative icons (animals, symbols)
  const colorMap = {
    // Reds / Pinks
    '#e61c33': LASER_DARK, '#9e0a1b': LASER_DARK, '#b80f22': LASER_DARK, '#ff384d': '#3b3128',
    '#ff3344': '#3b3128', '#d4152b': LASER_DARK, '#8a0717': LASER_DARK, '#4d010b': LASER_DARK,
    '#3d0309': LASER_DARK, '#3d010a': LASER_DARK, '#c4122d': LASER_DARK, '#b30e28': LASER_DARK,
    '#6e0515': LASER_DARK, '#4d010b': LASER_DARK, '#e62e43': '#3b3128', '#2b0207': LASER_DARK,
    // Blues / Cyans
    '#8fd3fe': '#3b3128', '#559bd6': LASER_DARK, '#2b6da8': LASER_DARK, '#144fb8': LASER_DARK,
    // Golds / Yellows
    '#fff0aa': '#ded8cf', '#e6b830': LASER_DARK, '#ba8611': LASER_DARK, '#735003': LASER_DARK,
    '#5c4002': LASER_DARK, '#3b2901': LASER_DARK, '#ffd56b': '#ded8cf', '#c59b27': LASER_DARK,
    '#694e09': LASER_DARK, '#4a3707': LASER_DARK, '#fff1b0': '#ded8cf', '#d4a326': LASER_DARK,
    '#73540a': LASER_DARK, '#523c07': LASER_DARK, '#f5d367': '#ded8cf', '#fceda2': '#ded8cf',
    '#c99b24': LASER_DARK, '#735508': LASER_DARK, '#fff0a3': '#ded8cf', '#cfa229': LASER_DARK,
    '#7a5c0a': LASER_DARK, '#fff5b8': '#ded8cf', '#d9a726': LASER_DARK, '#855f08': LASER_DARK,
    '#5e4202': LASER_DARK, '#0d8242': LASER_DARK,
    // Browns (carpincho, guanaco, ciervo, hornero)
    '#8a5629': '#3b3128', '#5e3818': LASER_DARK, '#3b200b': LASER_DARK, '#241205': LASER_DARK,
    '#190a02': LASER_DARK, '#1a0c03': LASER_DARK, '#2d1708': LASER_DARK, '#a66e3c': '#3b3128',
    '#140600': LASER_DARK, '#bf7a37': '#3b3128', '#945520': LASER_DARK, '#542c0c': LASER_DARK,
    '#4d443e': LASER_DARK, '#2e2621': LASER_DARK, '#140f0c': LASER_DARK, '#261203': LASER_DARK,
    '#c96f2e': '#3b3128', '#994c16': LASER_DARK, '#5e2908': LASER_DARK, '#3b1703': LASER_DARK,
    '#735e49': LASER_DARK, '#423425': LASER_DARK, '#693b18': LASER_DARK, '#241407': LASER_DARK,
    '#9e6938': '#3b3128', '#4a2e12': LASER_DARK, '#211104': LASER_DARK, '#6e451f': LASER_DARK,
    '#4a301a': LASER_DARK, '#29180b': LASER_DARK, '#c4793d': '#3b3128', '#3d210c': LASER_DARK,
    '#8c471c': LASER_DARK, '#d98c4e': '#3b3128', '#a65d28': LASER_DARK, '#703610': LASER_DARK,
    '#2e1a0b': LASER_DARK, '#140b04': LASER_DARK, '#4d280b': LASER_DARK, '#7a3d13': LASER_DARK
  };

  for (const [col, rep] of Object.entries(colorMap)) {
    const reg = new RegExp(col, 'gi');
    res = res.replace(reg, rep);
  }

  return res;
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.svg'));
files.forEach(f => {
  const content = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const converted = convertSvgToLaserVector(f, content);
  fs.writeFileSync(path.join(outDir, f), converted, 'utf8');
});

console.log(`Re-converted ${files.length} SVGs cleanly into vectorized_test!`);
