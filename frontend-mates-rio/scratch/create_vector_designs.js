const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../assets/images/designs');

console.log('Writing clean vector laser SVGs to:', dir);

const laserColor = '#14100c'; // Color oficial del quemado láser CNC en alpaca/acero

// 1. DEPORTES
const designs = {
  // AFA 3 Estrellas
  'afa.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - AFA 3 Estrellas -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- 3 Estrellas de Campeones del Mundo -->
    <polygon points="50,6 52.8,14.6 61.8,14.6 54.5,19.9 57.3,28.5 50,23.2 42.7,28.5 45.5,19.9 38.2,14.6 47.2,14.6" stroke-width="0.8"/>
    <polygon points="30,13 32.2,19.8 39.4,19.8 33.6,24 35.8,30.8 30,26.6 24.2,30.8 26.4,24 20.6,19.8 27.8,19.8" stroke-width="0.8"/>
    <polygon points="70,13 72.2,19.8 79.4,19.8 73.6,24 75.8,30.8 70,26.6 64.2,30.8 66.4,24 60.6,19.8 67.8,19.8" stroke-width="0.8"/>
    <!-- Escudo Contorno Láser -->
    <path d="M 22 36 L 78 36 C 78 72 65 96 50 116 C 35 96 22 72 22 36 Z" fill="none" stroke-width="3"/>
    <path d="M 26 40 L 74 40 C 74 70 63 92 50 110 C 37 92 26 70 26 40 Z" fill="none" stroke-width="1.2"/>
    <!-- Monograma Central AFA Vectorial -->
    <path d="M 50 48 L 56 68 L 44 68 Z M 48 43 L 52 43 L 64 84 L 58 84 L 54.5 72 L 45.5 72 L 42 84 L 36 84 Z" fill="${laserColor}" stroke-width="0.5"/>
    <path d="M 40 58 C 36 58 33 62 33 68 C 33 76 37 82 43 83 L 44 79 C 40 78 37 74 37 68 C 37 64 39 62 41 62 Z" fill="${laserColor}"/>
    <path d="M 60 58 C 64 58 67 62 67 68 C 67 76 63 82 57 83 L 56 79 C 60 78 63 74 63 68 C 63 64 61 62 59 62 Z" fill="${laserColor}"/>
    <rect x="36" y="88" width="28" height="2" rx="1" fill="${laserColor}"/>
  </g>
</svg>`,

  // Boca Juniors
  'boca.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Boca Juniors -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Contorno Exterior e Interior del Escudo -->
    <path d="M 12 16 L 88 16 C 88 64 74 95 50 114 C 26 95 12 64 12 16 Z" fill="none" stroke-width="3.5"/>
    <path d="M 16 20 L 84 20 C 84 62 71 92 50 110 C 29 92 16 62 16 20 Z" fill="none" stroke-width="1.2"/>
    <!-- Franja Central Vectorial -->
    <path d="M 15 48 L 85 48 M 15 72 L 85 72" fill="none" stroke-width="2.5"/>
    <!-- Tipografía C.A.B.J. -->
    <text x="50" y="65" font-family="'Arial Black', Impact, sans-serif" font-size="14" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none" letter-spacing="1.5">CABJ</text>
    <!-- Estrellas Superiores (Láser) -->
    <polygon points="50,25 51.5,29.5 56,29.5 52.5,32 54,36.5 50,34 46,36.5 47.5,32 44,29.5 48.5,29.5" stroke-width="0.5"/>
    <polygon points="35,27 36.2,30.6 40,30.6 37,32.7 38.2,36.3 35,34.2 31.8,36.3 33,32.7 30,30.6 33.8,30.6" stroke-width="0.5"/>
    <polygon points="65,27 66.2,30.6 70,30.6 67,32.7 68.2,36.3 65,34.2 61.8,36.3 63,32.7 60,30.6 63.8,30.6" stroke-width="0.5"/>
    <polygon points="24,34 25,37 28.5,37 25.8,39 26.8,42 24,40.2 21.2,42 22.2,39 19.5,37 23,37" stroke-width="0.5"/>
    <polygon points="76,34 77,37 80.5,37 77.8,39 78.8,42 76,40.2 73.2,42 74.2,39 71.5,37 75,37" stroke-width="0.5"/>
    <!-- Estrellas Inferiores (Láser) -->
    <polygon points="50,78 51.5,82.5 56,82.5 52.5,85 54,89.5 50,87 46,89.5 47.5,85 44,82.5 48.5,82.5" stroke-width="0.5"/>
    <polygon points="38,82 39.2,85.6 43,85.6 40,87.7 41.2,91.3 38,89.2 34.8,91.3 36,87.7 33,85.6 36.8,85.6" stroke-width="0.5"/>
    <polygon points="62,82 63.2,85.6 67,85.6 64,87.7 65.2,91.3 62,89.2 58.8,91.3 60,87.7 57,85.6 60.8,85.6" stroke-width="0.5"/>
    <polygon points="50,94 51.2,97.6 55,97.6 52,99.7 53.2,103.3 50,101.2 46.8,103.3 48,99.7 45,97.6 48.8,97.6" stroke-width="0.5"/>
  </g>
</svg>`,

  // River Plate
  'river.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - River Plate -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Contorno del Escudo -->
    <path d="M 12 16 L 88 16 C 88 64 74 95 50 114 C 26 95 12 64 12 16 Z" fill="none" stroke-width="3.5"/>
    <path d="M 16 20 L 84 20 C 84 62 71 92 50 110 C 29 92 16 62 16 20 Z" fill="none" stroke-width="1.2"/>
    <!-- Banda Roja Diagonal (Vector Grabado) -->
    <path d="M 18 20 L 40 20 L 83 95 L 61 95 Z" fill="${laserColor}" stroke="none"/>
    <!-- Círculo Central con Monograma CARP -->
    <circle cx="50" cy="58" r="22" fill="#ffffff" stroke="${laserColor}" stroke-width="2.5"/>
    <!-- Letras CARP -->
    <text x="50" y="64" font-family="'Times New Roman', serif" font-size="15" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none" letter-spacing="1">CARP</text>
  </g>
</svg>`,

  // Rosario Central
  'central.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Rosario Central -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 14 16 L 86 16 C 86 64 74 95 50 114 C 26 95 14 64 14 16 Z" fill="none" stroke-width="3.5"/>
    <path d="M 18 20 L 82 20 C 82 62 71 92 50 110 C 29 92 18 62 18 20 Z" fill="none" stroke-width="1.2"/>
    <!-- Rayas Verticales Grabadas -->
    <rect x="27" y="20" width="9" height="66" fill="${laserColor}" stroke="none"/>
    <rect x="45.5" y="20" width="9" height="88" fill="${laserColor}" stroke="none"/>
    <rect x="64" y="20" width="9" height="66" fill="${laserColor}" stroke="none"/>
    <!-- Monograma Central CARC -->
    <ellipse cx="50" cy="58" rx="20" ry="16" fill="#ffffff" stroke="${laserColor}" stroke-width="2"/>
    <text x="50" y="63" font-family="'Arial Black', sans-serif" font-size="11" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none">CARC</text>
  </g>
</svg>`,

  // Newell's Old Boys
  'newells.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Newell's Old Boys -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 14 16 L 86 16 C 86 64 74 95 50 114 C 26 95 14 64 14 16 Z" fill="none" stroke-width="3.5"/>
    <path d="M 18 20 L 82 20 C 82 62 71 92 50 110 C 29 92 18 62 18 20 Z" fill="none" stroke-width="1.2"/>
    <!-- Mitad Izquierda Grabada -->
    <path d="M 18 20 L 50 20 L 50 110 C 29 92 18 62 18 20 Z" fill="${laserColor}" stroke="none"/>
    <!-- Tipografía NOB en Contraste -->
    <text x="34" y="64" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" text-anchor="middle" fill="#ffffff" stroke="none">N</text>
    <text x="66" y="64" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none">OB</text>
    <circle cx="50" cy="20" r="1.5" fill="${laserColor}"/>
  </g>
</svg>`,

  // Racing Club
  'racing.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Racing Club -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 14 16 L 86 16 C 86 64 74 95 50 114 C 26 95 14 64 14 16 Z" fill="none" stroke-width="3.5"/>
    <path d="M 18 20 L 82 20 C 82 62 71 92 50 110 C 29 92 18 62 18 20 Z" fill="none" stroke-width="1.2"/>
    <!-- Rayas Láser -->
    <rect x="25" y="38" width="8" height="48" fill="${laserColor}"/>
    <rect x="41" y="38" width="8" height="66" fill="${laserColor}"/>
    <rect x="57" y="38" width="8" height="66" fill="${laserColor}"/>
    <rect x="73" y="38" width="8" height="48" fill="${laserColor}"/>
    <!-- Barra Superior -->
    <line x1="18" y1="36" x2="82" y2="36" stroke-width="2.5"/>
    <text x="50" y="30" font-family="'Arial Black', sans-serif" font-size="9" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none" letter-spacing="1.2">RACING</text>
  </g>
</svg>`,

  // Independiente
  'independiente.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Independiente -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 14 16 L 86 16 C 86 64 74 95 50 114 C 26 95 14 64 14 16 Z" fill="none" stroke-width="3.5"/>
    <path d="M 18 20 L 82 20 C 82 62 71 92 50 110 C 29 92 18 62 18 20 Z" fill="none" stroke-width="1.2"/>
    <!-- Escudo Grabado Completo -->
    <path d="M 22 24 L 78 24 C 78 58 68 86 50 104 C 32 86 22 58 22 24 Z" fill="${laserColor}" stroke="none"/>
    <!-- Cruz / Banda Blanca Láser -->
    <path d="M 22 24 L 78 80 M 78 24 L 22 80" stroke="#ffffff" stroke-width="5"/>
    <!-- Monograma Central CAI -->
    <circle cx="50" cy="52" r="14" fill="#ffffff" stroke="${laserColor}" stroke-width="1.5"/>
    <text x="50" y="56" font-family="'Arial Black', sans-serif" font-size="8" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none">CAI</text>
  </g>
</svg>`,

  // San Lorenzo
  'sanlorenzo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - San Lorenzo -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="46" fill="none" stroke-width="3.5"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke-width="1.2"/>
    <!-- Franjas Verticales Circulares -->
    <rect x="28" y="16" width="9" height="68" fill="${laserColor}"/>
    <rect x="45.5" y="8" width="9" height="84" fill="${laserColor}"/>
    <rect x="63" y="16" width="9" height="68" fill="${laserColor}"/>
    <!-- Círculo Central CASLA -->
    <circle cx="50" cy="50" r="22" fill="#ffffff" stroke="${laserColor}" stroke-width="2"/>
    <text x="50" y="55" font-family="'Arial Black', sans-serif" font-size="9" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none" letter-spacing="0.5">CASLA</text>
  </g>
</svg>`,

  // Belgrano de Córdoba
  'belgrano.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Belgrano de Córdoba -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="46" fill="none" stroke-width="3.5"/>
    <circle cx="50" cy="50" r="41" fill="none" stroke-width="1.2"/>
    <!-- Calavera Pirata & Ancla Grabada -->
    <path d="M 40 32 C 40 24 60 24 60 32 C 60 36 58 40 56 42 L 56 46 L 44 46 L 44 42 C 42 40 40 36 40 32 Z" fill="${laserColor}"/>
    <!-- Ojos de Calavera -->
    <circle cx="46" cy="34" r="2.5" fill="#ffffff"/>
    <circle cx="54" cy="34" r="2.5" fill="#ffffff"/>
    <!-- Huesos Cruzados -->
    <line x1="32" y1="52" x2="68" y2="28" stroke-width="3.5"/>
    <line x1="32" y1="28" x2="68" y2="52" stroke-width="3.5"/>
    <!-- Siglas CAB -->
    <text x="50" y="76" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none" letter-spacing="2">CAB</text>
    <!-- Corona de Laureles -->
    <path d="M 22 56 C 22 72 34 86 50 86 C 66 86 78 72 78 56" fill="none" stroke-width="2" stroke-dasharray="3,2"/>
  </g>
</svg>`,

  // Talleres de Córdoba
  'talleres.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Talleres de Córdoba -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 14 16 L 86 16 C 86 64 74 95 50 114 C 26 95 14 64 14 16 Z" fill="none" stroke-width="3.5"/>
    <path d="M 18 20 L 82 20 C 82 62 71 92 50 110 C 29 92 18 62 18 20 Z" fill="none" stroke-width="1.2"/>
    <!-- Rayas Verticales Albiazules (Láser) -->
    <rect x="25" y="20" width="8" height="52" fill="${laserColor}"/>
    <rect x="41" y="20" width="8" height="88" fill="${laserColor}"/>
    <rect x="57" y="20" width="8" height="88" fill="${laserColor}"/>
    <rect x="73" y="20" width="8" height="52" fill="${laserColor}"/>
    <!-- Círculo Central con Monograma C.A.T. -->
    <circle cx="50" cy="58" r="20" fill="#ffffff" stroke="${laserColor}" stroke-width="2.5"/>
    <text x="50" y="64" font-family="'Arial Black', sans-serif" font-size="12" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none" letter-spacing="1">CAT</text>
  </g>
</svg>`,

  // Instituto ACC
  'instituto.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Instituto ACC -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 14 16 L 86 16 C 86 64 74 95 50 114 C 26 95 14 64 14 16 Z" fill="none" stroke-width="3.5"/>
    <path d="M 18 20 L 82 20 C 82 62 71 92 50 110 C 29 92 18 62 18 20 Z" fill="none" stroke-width="1.2"/>
    <rect x="27" y="38" width="9" height="48" fill="${laserColor}"/>
    <rect x="45.5" y="38" width="9" height="66" fill="${laserColor}"/>
    <rect x="64" y="38" width="9" height="48" fill="${laserColor}"/>
    <line x1="18" y1="36" x2="82" y2="36" stroke-width="2.5"/>
    <text x="50" y="30" font-family="'Arial Black', sans-serif" font-size="10" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none" letter-spacing="1">IACC</text>
  </g>
</svg>`,

  // Racing de Córdoba
  'racingcordoba.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Racing de Córdoba -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 14 16 L 86 16 C 86 64 74 95 50 114 C 26 95 14 64 14 16 Z" fill="none" stroke-width="3.5"/>
    <path d="M 18 20 L 82 20 C 82 62 71 92 50 110 C 29 92 18 62 18 20 Z" fill="none" stroke-width="1.2"/>
    <rect x="30" y="38" width="10" height="56" fill="${laserColor}"/>
    <rect x="60" y="38" width="10" height="56" fill="${laserColor}"/>
    <line x1="18" y1="36" x2="82" y2="36" stroke-width="2.5"/>
    <text x="50" y="30" font-family="'Arial Black', sans-serif" font-size="10" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none" letter-spacing="1">RAC</text>
  </g>
</svg>`,

  // Mate Imperial Vector
  'mate.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Mate Imperial -->
  <g fill="none" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Bombilla Pico Loro -->
    <path d="M 52 45 L 72 16 C 74 13 78 14 80 16 C 82 18 81 22 78 24 L 60 52" stroke-width="2.8"/>
    <ellipse cx="71" cy="20" rx="3" ry="1.5" transform="rotate(-45, 71, 20)" fill="${laserColor}"/>
    <!-- Corona / Virola Orfebre del Mate -->
    <ellipse cx="50" cy="46" rx="30" ry="9" stroke-width="3.2" fill="none"/>
    <ellipse cx="50" cy="46" rx="22" ry="6" stroke-width="1.5" fill="none"/>
    <!-- Guardas cinceladas de la virola -->
    <path d="M 25 46 Q 30 50 35 46 Q 40 50 45 46 Q 50 50 55 46 Q 60 50 65 46 Q 70 50 75 46" stroke-width="1.2"/>
    <!-- Calabaza / Cuerpo de Cuero -->
    <path d="M 23 48 C 18 64 22 84 35 90 C 44 94 56 94 65 90 C 78 84 82 64 77 48" stroke-width="3.2"/>
    <!-- Costura del Cuero -->
    <path d="M 50 55 L 50 92" stroke-width="1.8" stroke-dasharray="3,2"/>
    <!-- Base de 4 patas orfebre -->
    <path d="M 36 90 L 32 96 M 64 90 L 68 96 M 44 93 L 42 97 M 56 93 L 58 97" stroke-width="2.8"/>
  </g>
</svg>`,

  // Sol de Mayo
  'soldemayo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Sol de Mayo -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="18" fill="none" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="15" fill="none" stroke-width="1"/>
    <!-- Ojos, Nariz y Boca del Sol -->
    <path d="M 43 45 Q 46 43 48 46 M 52 46 Q 54 43 57 45" fill="none" stroke-width="1.4"/>
    <circle cx="45" cy="46" r="1" fill="${laserColor}"/>
    <circle cx="55" cy="46" r="1" fill="${laserColor}"/>
    <path d="M 50 46 L 49 53 L 52 53" fill="none" stroke-width="1.2"/>
    <path d="M 44 57 Q 50 61 56 57" fill="none" stroke-width="1.4"/>
    <!-- 16 Rayos Flamígeros y Rectos del Sol -->
    <!-- Rayos Cardinales -->
    <polygon points="50,4 52.5,26 47.5,26" stroke-width="0.5"/>
    <polygon points="50,96 52.5,74 47.5,74" stroke-width="0.5"/>
    <polygon points="4,50 26,52.5 26,47.5" stroke-width="0.5"/>
    <polygon points="96,50 74,52.5 74,47.5" stroke-width="0.5"/>
    <!-- Diagonales Rectos -->
    <polygon points="17,17 33,30 29,34" stroke-width="0.5"/>
    <polygon points="83,83 67,70 71,66" stroke-width="0.5"/>
    <polygon points="83,17 70,33 66,29" stroke-width="0.5"/>
    <polygon points="17,83 30,67 34,71" stroke-width="0.5"/>
    <!-- Rayos Ondulados Intermedios -->
    <path d="M 50 30 Q 56 22 50 14 Q 46 10 50 6" fill="none" stroke-width="2"/>
    <path d="M 50 70 Q 56 78 50 86 Q 46 90 50 94" fill="none" stroke-width="2"/>
    <path d="M 30 50 Q 22 56 14 50 Q 10 46 6 50" fill="none" stroke-width="2"/>
    <path d="M 70 50 Q 78 56 86 50 Q 90 46 94 50" fill="none" stroke-width="2"/>
  </g>
</svg>`,

  // Escarapela Argentina
  'escarapela.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Escarapela Argentina -->
  <g fill="none" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Círculo Exterior Plisado -->
    <circle cx="50" cy="50" r="44" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="38" stroke-width="1.2" stroke-dasharray="3,2"/>
    <!-- Franja Intermedia -->
    <circle cx="50" cy="50" r="28" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="22" stroke-width="1" stroke-dasharray="2,2"/>
    <!-- Centro del Sol -->
    <circle cx="50" cy="50" r="14" fill="${laserColor}"/>
    <circle cx="50" cy="50" r="10" fill="#ffffff"/>
    <circle cx="50" cy="50" r="5" fill="${laserColor}"/>
  </g>
</svg>`,

  // Ceibo Flor Nacional
  'ceibo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Flor de Ceibo -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Pétalo Estandarte Central -->
    <path d="M 50 15 C 32 30 36 60 50 85 C 64 60 68 30 50 15 Z" fill="${laserColor}" stroke-width="1.5"/>
    <!-- Pétalos Laterales / Alas -->
    <path d="M 45 40 C 25 45 20 65 35 75 C 42 70 45 55 45 40 Z" fill="none" stroke-width="2.5"/>
    <path d="M 55 40 C 75 45 80 65 65 75 C 58 70 55 55 55 40 Z" fill="none" stroke-width="2.5"/>
    <!-- Cáliz y Tallo -->
    <path d="M 42 80 C 46 88 48 94 50 96 C 52 94 54 88 58 80 Z" fill="${laserColor}"/>
    <path d="M 50 75 L 50 35 M 46 55 L 42 62 M 54 55 L 58 62" stroke="#ffffff" stroke-width="1.5"/>
  </g>
</svg>`,

  // Caballo Criollo
  'caballo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Caballo Criollo -->
  <g fill="${laserColor}" stroke="${laserColor}">
    <path d="M 20 68 C 22 55 30 46 40 44 C 44 43 48 38 52 28 C 54 22 56 16 62 14 C 66 12 70 14 74 18 C 76 20 78 26 74 30 C 70 34 68 36 66 40 C 64 44 68 46 76 48 C 82 50 86 56 86 64 C 86 72 80 78 74 80 L 76 90 L 70 90 L 68 80 C 60 81 52 81 44 80 L 40 90 L 34 90 L 36 78 C 28 77 22 73 20 68 Z M 64 24 C 64 22 66 22 66 24 C 66 26 64 26 64 24 Z" stroke-width="1.5"/>
  </g>
</svg>`,

  // Guarda Pampa
  'guardapampa.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Guarda Pampa -->
  <g fill="${laserColor}" stroke="${laserColor}">
    <rect x="5" y="15" width="90" height="4" fill="${laserColor}"/>
    <rect x="5" y="81" width="90" height="4" fill="${laserColor}"/>
    <!-- Cruz Escalonada Pampa Central -->
    <polygon points="50,26 62,26 62,38 74,38 74,62 62,62 62,74 50,74 38,74 38,62 26,62 26,38 38,38 38,26" fill="${laserColor}"/>
    <!-- Hueco Interior Escalonado -->
    <polygon points="50,38 56,38 56,44 62,44 62,56 56,56 56,62 50,62 44,62 44,56 38,56 38,44 44,44 44,38" fill="#ffffff"/>
    <rect x="47" y="47" width="6" height="6" fill="${laserColor}"/>
  </g>
</svg>`,

  // Cruz Criolla Gauchesca
  'cruz.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Cruz Criolla -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Maderas de la Cruz Tallada -->
    <rect x="44" y="10" width="12" height="80" rx="3" stroke-width="2"/>
    <rect x="18" y="28" width="64" height="12" rx="3" stroke-width="2"/>
    <!-- Círculo de Gloria / Resplandor -->
    <circle cx="50" cy="34" r="16" fill="none" stroke-width="2" stroke-dasharray="3,2"/>
    <!-- Vetas de Madera Rústica -->
    <line x1="50" y1="14" x2="50" y2="86" stroke="#ffffff" stroke-width="1.2"/>
    <line x1="22" y1="34" x2="78" y2="34" stroke="#ffffff" stroke-width="1.2"/>
  </g>
</svg>`,

  // Islas Malvinas
  'malvinas.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Islas Malvinas -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Gran Malvina (Oeste) -->
    <path d="M 22 42 C 26 34 36 30 42 36 C 46 42 45 52 40 58 C 36 64 30 72 24 66 C 18 60 18 50 22 42 Z" stroke-width="2"/>
    <!-- Soledad (Este) -->
    <path d="M 54 36 C 62 26 78 30 82 40 C 86 50 84 62 76 68 C 68 74 58 68 56 60 C 54 54 52 44 54 36 Z" stroke-width="2"/>
    <!-- Estrecho de San Carlos -->
    <text x="50" y="88" font-family="'Arial Black', sans-serif" font-size="8" font-weight="900" text-anchor="middle" fill="${laserColor}" stroke="none" letter-spacing="1">MALVINAS</text>
  </g>
</svg>`,
  'malvinas_blank.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 22 42 C 26 34 36 30 42 36 C 46 42 45 52 40 58 C 36 64 30 72 24 66 C 18 60 18 50 22 42 Z" stroke-width="2"/>
    <path d="M 54 36 C 62 26 78 30 82 40 C 86 50 84 62 76 68 C 68 74 58 68 56 60 C 54 54 52 44 54 36 Z" stroke-width="2"/>
  </g>
</svg>`,

  // Mapa de Argentina
  'mapa.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Silueta Argentina -->
  <g fill="${laserColor}" stroke="${laserColor}">
    <path d="M 44 10 L 65 14 L 62 28 L 74 36 L 68 46 L 56 50 L 52 64 L 48 78 L 44 94 L 40 108 L 46 112 L 40 114 L 34 104 L 38 88 L 38 70 L 40 54 L 36 34 L 40 18 Z" stroke-width="2.5"/>
  </g>
</svg>`,
  'mapa_clean.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
  <g fill="${laserColor}" stroke="${laserColor}">
    <path d="M 44 10 L 65 14 L 62 28 L 74 36 L 68 46 L 56 50 L 52 64 L 48 78 L 44 94 L 40 108 L 46 112 L 40 114 L 34 104 L 38 88 L 38 70 L 40 54 L 36 34 L 40 18 Z" stroke-width="2.5"/>
  </g>
</svg>`,

  // Cóndor Andino
  'condor.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Cóndor Andino -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Alas Desplegadas -->
    <path d="M 50 48 Q 30 20 6 32 Q 22 52 42 58 L 50 78 L 58 58 Q 78 52 94 32 Q 70 20 50 48 Z" stroke-width="2"/>
    <!-- Collar Blanco y Cabeza -->
    <circle cx="50" cy="38" r="5" fill="#ffffff" stroke="${laserColor}" stroke-width="1.5"/>
    <path d="M 48 34 C 48 28 52 28 54 32 L 58 34" fill="none" stroke-width="2"/>
    <!-- Plumas / Guías de Vuelo -->
    <line x1="20" y1="36" x2="34" y2="48" stroke-width="1.5"/>
    <line x1="80" y1="36" x2="66" y2="48" stroke-width="1.5"/>
  </g>
</svg>`,

  // Hornero Nacional
  'hornero.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Hornero -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Rama -->
    <line x1="10" y1="80" x2="90" y2="80" stroke-width="3"/>
    <!-- Cuerpo del Ave -->
    <path d="M 35 48 C 35 34 46 25 56 25 C 64 25 70 30 76 26 L 82 28 L 74 36 C 76 45 74 60 62 68 C 50 74 38 72 26 78 L 22 72 C 30 65 35 58 35 48 Z" stroke-width="2"/>
    <!-- Ojo -->
    <circle cx="62" cy="32" r="1.5" fill="#ffffff"/>
    <!-- Patas -->
    <line x1="46" y1="72" x2="44" y2="80" stroke-width="2"/>
    <line x1="56" y1="70" x2="56" y2="80" stroke-width="2"/>
  </g>
</svg>`,

  // Carpincho
  'carpincho.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Carpincho -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 22 65 C 22 50 32 40 44 38 C 52 36 62 30 72 30 C 80 30 84 36 86 42 C 86 48 80 50 78 52 C 78 56 80 62 76 68 L 74 78 L 68 78 L 68 68 C 56 69 46 69 38 68 L 36 78 L 30 78 L 30 68 C 26 68 22 66 22 65 Z" stroke-width="2"/>
    <!-- Hocico y Ojo -->
    <circle cx="74" cy="36" r="2" fill="#ffffff"/>
    <path d="M 82 44 L 78 44" stroke="#ffffff" stroke-width="1.5"/>
  </g>
</svg>`,

  // Guanaco
  'guanaco.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Guanaco -->
  <g fill="${laserColor}" stroke="${laserColor}">
    <path d="M 32 60 C 32 48 40 46 44 44 L 48 24 L 56 16 L 62 16 L 60 22 L 56 26 L 52 44 C 60 46 72 48 74 58 L 74 85 L 68 85 L 68 64 L 46 64 L 46 85 L 40 85 L 40 64 C 36 63 32 62 32 60 Z" stroke-width="1.8"/>
  </g>
</svg>`,

  // Ciervo de los Pantanos
  'ciervo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Ciervo -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Cornamenta -->
    <path d="M 46 26 L 40 14 M 40 18 L 34 16 M 40 22 L 34 24" stroke-width="2"/>
    <path d="M 54 26 L 60 14 M 60 18 L 66 16 M 60 22 L 66 24" stroke-width="2"/>
    <!-- Cuerpo y Cabeza -->
    <path d="M 34 60 C 34 50 42 46 46 42 L 48 28 L 52 28 L 54 42 C 60 46 70 50 72 58 L 72 85 L 67 85 L 67 64 L 45 64 L 45 85 L 40 85 L 40 63 C 36 62 34 61 34 60 Z" stroke-width="1.8"/>
  </g>
</svg>`,

  // Corazón
  'corazon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Corazón -->
  <g fill="${laserColor}" stroke="${laserColor}">
    <path d="M 50 82 C 20 62 12 40 24 24 C 34 12 46 18 50 28 C 54 18 66 12 76 24 C 88 40 80 62 50 82 Z" stroke-width="3" fill="none"/>
    <path d="M 50 72 C 30 54 24 38 32 28 C 38 20 46 24 50 32 C 54 24 62 20 68 28 C 76 38 70 54 50 72 Z" stroke-width="1" fill="${laserColor}"/>
  </g>
</svg>`,

  // Corona Real Imperial
  'corona.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Corona Imperial -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Puntas de la Corona -->
    <polygon points="18,72 20,38 36,54 50,26 64,54 80,38 82,72" stroke-width="2.5"/>
    <circle cx="20" cy="34" r="3.5" fill="${laserColor}"/>
    <circle cx="50" cy="22" r="4.5" fill="${laserColor}"/>
    <circle cx="80" cy="34" r="3.5" fill="${laserColor}"/>
    <!-- Base con Joyas Láser -->
    <rect x="18" y="74" width="64" height="10" rx="3" stroke-width="2"/>
    <circle cx="32" cy="79" r="2.5" fill="#ffffff"/>
    <circle cx="50" cy="79" r="2.5" fill="#ffffff"/>
    <circle cx="68" cy="79" r="2.5" fill="#ffffff"/>
  </g>
</svg>`,

  // Estrella Federal Argentina
  'estrella_fed.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Estrella Federal -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="50,10 58,34 82,24 72,48 94,58 72,68 82,92 58,82 50,106 42,82 18,92 28,68 6,58 28,48 18,24 42,34" stroke-width="2"/>
    <circle cx="50" cy="58" r="10" fill="#ffffff" stroke="${laserColor}" stroke-width="2"/>
    <circle cx="50" cy="58" r="4" fill="${laserColor}"/>
  </g>
</svg>`,

  // Infinito
  'infinito.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Infinito -->
  <g fill="none" stroke="${laserColor}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 30 50 C 15 35 15 65 30 50 C 45 35 55 65 70 50 C 85 35 85 65 70 50 C 55 35 45 65 30 50 Z"/>
  </g>
</svg>`,

  // Corona de Laureles
  'laurel.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Grabado Láser Vectorial - Corona de Laureles -->
  <g fill="${laserColor}" stroke="${laserColor}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Rama Izquierda -->
    <path d="M 50 86 C 26 84 18 64 24 36 C 26 28 32 20 38 14" fill="none" stroke-width="3"/>
    <!-- Hojas Izquierdas -->
    <ellipse cx="22" cy="58" rx="7" ry="3.5" transform="rotate(-30, 22, 58)"/>
    <ellipse cx="20" cy="44" rx="7" ry="3.5" transform="rotate(-15, 20, 44)"/>
    <ellipse cx="24" cy="30" rx="7" ry="3.5" transform="rotate(15, 24, 30)"/>
    <ellipse cx="32" cy="20" rx="7" ry="3.5" transform="rotate(40, 32, 20)"/>
    <!-- Rama Derecha -->
    <path d="M 50 86 C 74 84 82 64 76 36 C 74 28 68 20 62 14" fill="none" stroke-width="3"/>
    <!-- Hojas Derechas -->
    <ellipse cx="78" cy="58" rx="7" ry="3.5" transform="rotate(30, 78, 58)"/>
    <ellipse cx="80" cy="44" rx="7" ry="3.5" transform="rotate(15, 80, 44)"/>
    <ellipse cx="76" cy="30" rx="7" ry="3.5" transform="rotate(-15, 76, 30)"/>
    <ellipse cx="68" cy="20" rx="7" ry="3.5" transform="rotate(-40, 68, 20)"/>
    <!-- Moño Inferior -->
    <circle cx="50" cy="86" r="4" fill="${laserColor}"/>
    <path d="M 46 88 L 38 96 M 54 88 L 62 96" stroke-width="2.5"/>
  </g>
</svg>`
};

let writtenCount = 0;
for (const [filename, svgContent] of Object.entries(designs)) {
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, svgContent.trim(), 'utf8');
  writtenCount++;
}

console.log(`Successfully generated and saved ${writtenCount} pure monochrome vector laser SVGs!`);
