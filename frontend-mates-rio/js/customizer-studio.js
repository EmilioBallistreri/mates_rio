// ==========================================================================
// MATES RÍO: ESTUDIO DE PERSONALIZACIÓN VIRTUAL (MOTOR DE VIROLA CIRCULAR)
// Inspirado fielmente en el taller interactivo de orfebrería y grabado láser
// ==========================================================================

const STUDIO_CONFIG = {
  cx: 250,
  cy: 250,
  rInner: 120,
  rRing: 175,
  rOuter: 232,
  minScale: 0.4,
  maxScale: 2.2
};

// Estado central del estudio
const studio = {
  currentStep: 1, // 1: Plantillas | 2: Diseño | 3: Confirmar
  selectedMateId: 'mate-1',
  purchaseType: 'web', // 'web' | 'local'
  circularLines: 'doble', // 'no' | 'simple' | 'doble'
  
  // Elementos activos en la virola
  activeItemId: null,
  items: [], // Array de { id, type, text, font, fontSize, graphicId, svgUrl, svgContent, angle, radius, rotation, scale, arcPosition, isUpper }

  // Configuración de texto actual
  textInput: 'MATES RÍO',
  selectedFont: 'Cinzel',
  fontSize: 22,
  arcPosition: 'top', // 'top' | 'bottom'

  // Categoría de íconos activa
  activeCategory: 'deportes',

  // Notas del cliente
  notes: '',

  // Estado de arrastre interactivo
  dragMode: null, // 'move' | 'scale' | 'rotate'
  dragItemId: null,
  dragStart: { x: 0, y: 0, angle: 0, itemAngle: 0, itemRotation: 0, itemScale: 1 }
};

// BIBLIOTECA DE DISEÑOS VECTORIALES CATEGORIZADOS
const VECTOR_CATEGORIES = {
  deportes: {
    name: '🏆 Escudos Deportivos',
    items: [
      { id: 'afa', name: 'AFA 3 Estrellas', file: 'assets/images/designs/afa.svg' },
      { id: 'boca', name: 'Boca Juniors', file: 'assets/images/designs/boca.svg' },
      { id: 'river', name: 'River Plate', file: 'assets/images/designs/river.svg' },
      { id: 'racing', name: 'Racing Club', file: 'assets/images/designs/racing.svg' },
      { id: 'independiente', name: 'Independiente', file: 'assets/images/designs/independiente.svg' },
      { id: 'sanlorenzo', name: 'San Lorenzo', file: 'assets/images/designs/sanlorenzo.svg' },
      { id: 'belgrano', name: 'Belgrano de Córdoba', file: 'assets/images/designs/belgrano.svg' },
      { id: 'talleres', name: 'Talleres de Córdoba', file: 'assets/images/designs/talleres.svg' },
      { id: 'instituto', name: 'Instituto ACC', file: 'assets/images/designs/instituto.svg' },
      { id: 'racingcordoba', name: 'Racing de Córdoba', file: 'assets/images/designs/racingcordoba.svg' },
      { id: 'central', name: 'Rosario Central', inline: 'central' },
      { id: 'newells', name: "Newell's Old Boys", inline: 'newells' }
    ]
  },
  criollo: {
    name: '🇦🇷 Motivos Criollos & Tradición',
    items: [
      { id: 'soldemayo', name: 'Sol de Mayo', file: 'assets/images/designs/soldemayo.svg' },
      { id: 'caballo', name: 'Caballo Criollo', file: 'assets/images/designs/caballo.svg' },
      { id: 'guardapampa', name: 'Guarda Pampa', file: 'assets/images/designs/guardapampa.svg' },
      { id: 'malvinas', name: 'Islas Malvinas', file: 'assets/images/designs/malvinas.svg' },
      { id: 'mapa', name: 'Silueta Argentina', file: 'assets/images/designs/mapa.svg' },
      { id: 'escarapela', name: 'Escarapela Argentina', inline: 'escarapela' },
      { id: 'ceibo', name: 'Flor de Ceibo', inline: 'ceibo' },
      { id: 'cruz', name: 'Cruz Criolla', inline: 'cruz' },
      { id: 'mate_icono', name: 'Mate Tradicional', inline: 'mate' }
    ]
  },
  fauna: {
    name: '🦅 Fauna & Naturaleza',
    items: [
      { id: 'condor', name: 'Cóndor Andino', inline: 'condor' },
      { id: 'hornero', name: 'Hornero Nacional', inline: 'hornero' },
      { id: 'carpincho', name: 'Carpincho / Capibara', inline: 'carpincho' },
      { id: 'guanaco', name: 'Guanaco Criollo', inline: 'guanaco' },
      { id: 'ciervo', name: 'Ciervo de los Pantanos', inline: 'ciervo' }
    ]
  },
  frases: {
    name: '💬 Frases & Pasión',
    items: [
      { id: 'frase_gloria', name: 'Coronados de Gloria', inline: 'frase_gloria' },
      { id: 'frase_mate', name: 'El Amor por el Mate', inline: 'frase_mate' },
      { id: 'frase_costumbres', name: 'Costumbres Argentinas', inline: 'frase_costumbres' },
      { id: 'frase_pasion', name: 'Pasión & Tradición', inline: 'frase_pasion' },
      { id: 'frase_amistad', name: 'Amistad Criolla', inline: 'frase_amistad' }
    ]
  },
  simbolos: {
    name: '✨ Símbolos & Formas',
    items: [
      { id: 'corona', name: 'Corona Imperial', inline: 'corona' },
      { id: 'laurel', name: 'Corona de Laureles', inline: 'laurel' },
      { id: 'estrella_fed', name: 'Estrella Federal', inline: 'estrella_fed' },
      { id: 'infinito', name: 'Infinito Eterno', inline: 'infinito' },
      { id: 'corazon', name: 'Corazón Gaucho', inline: 'corazon' }
    ]
  }
};

// DEFINICIONES DE SVGS INLINE VECTORIALES DE ALTA DEFINICIÓN
const INLINE_SVGS = {
  central: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 5 L85 20 L85 60 C85 80 50 95 50 95 C50 95 15 80 15 60 L15 20 Z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M25 35 L75 35 M25 50 L75 50 M25 65 L75 65" stroke="currentColor" stroke-width="3"/><text x="50" y="28" font-size="12" font-weight="900" text-anchor="middle" fill="currentColor">CARC</text></svg>`,
  newells: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 5 L85 20 L85 60 C85 80 50 95 50 95 C50 95 15 80 15 60 L15 20 Z" fill="none" stroke="currentColor" stroke-width="4"/><line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="3"/><text x="50" y="55" font-size="16" font-weight="900" text-anchor="middle" fill="currentColor">NOB</text></svg>`,
  escarapela: `<svg viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="50" cy="50" r="16" fill="currentColor"/><circle cx="50" cy="50" r="6" fill="#fff"/></svg>`,
  ceibo: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 15 C40 30 30 50 50 85 C70 50 60 30 50 15 Z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M50 25 C45 35 40 45 50 65 C60 45 55 35 50 25 Z" fill="currentColor"/><path d="M35 50 C20 60 25 75 40 70 M65 50 C80 60 75 75 60 70" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
  cruz: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M42 10 H58 V35 H85 V51 H58 V90 H42 V51 H15 V35 H42 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="43" r="6" fill="currentColor"/></svg>`,
  mate: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M30 40 C30 25 70 25 70 40 C75 55 72 80 50 85 C28 80 25 55 30 40 Z" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="50" cy="38" rx="18" ry="6" fill="none" stroke="currentColor" stroke-width="3"/><line x1="62" y1="40" x2="80" y2="12" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="80" cy="12" r="3" fill="currentColor"/></svg>`,
  condor: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 35 Q30 15 10 25 Q25 45 42 45 Q50 65 50 85 Q50 65 58 45 Q75 45 90 25 Q70 15 50 35 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="25" r="5" fill="currentColor"/></svg>`,
  hornero: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M20 65 Q30 40 55 42 Q75 35 85 45 Q70 60 55 60 Q40 75 20 65 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="70" cy="42" r="2.5" fill="currentColor"/><path d="M85 45 L95 47 L85 50 Z" fill="currentColor"/><path d="M45 60 L40 85 M55 60 L58 85" stroke="currentColor" stroke-width="3"/></svg>`,
  carpincho: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M25 60 C25 45 35 35 55 35 C70 35 82 42 85 55 C82 70 65 72 45 72 C30 72 25 68 25 60 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="75" cy="46" r="2.5" fill="currentColor"/><path d="M60 35 Q62 28 66 35" stroke="currentColor" stroke-width="3"/><path d="M35 72 L35 84 M45 72 L45 84 M70 70 L70 84 M78 68 L78 84" stroke="currentColor" stroke-width="3"/></svg>`,
  guanaco: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M35 70 Q45 65 65 65 Q70 50 68 35 Q65 20 72 15 Q78 18 75 28 Q78 45 75 65 Q80 75 75 85 M40 70 L35 85 M65 65 L65 85" fill="none" stroke="currentColor" stroke-width="3.5"/></svg>`,
  ciervo: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M40 70 Q50 65 65 65 Q70 50 68 40 Q62 25 70 20 M68 32 Q60 15 52 20 M70 28 Q78 12 85 18" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M42 70 L40 85 M62 65 L60 85 M68 65 L70 85" stroke="currentColor" stroke-width="3"/></svg>`,
  frase_gloria: `<svg viewBox="0 0 100 50" fill="currentColor"><text x="50" y="24" font-size="9" font-family="'Cinzel', serif" font-weight="900" text-anchor="middle" fill="currentColor">CORONADOS</text><text x="50" y="38" font-size="8" font-family="'Cinzel', serif" font-weight="700" text-anchor="middle" fill="currentColor">DE GLORIA</text></svg>`,
  frase_mate: `<svg viewBox="0 0 100 50" fill="currentColor"><text x="50" y="22" font-size="8" font-family="'Dancing Script', cursive" font-weight="700" text-anchor="middle" fill="currentColor">El Amor por</text><text x="50" y="38" font-size="10" font-family="'Cinzel', serif" font-weight="900" text-anchor="middle" fill="currentColor">EL MATE</text></svg>`,
  frase_costumbres: `<svg viewBox="0 0 100 50" fill="currentColor"><text x="50" y="24" font-size="8.5" font-family="'Montserrat', sans-serif" font-weight="800" text-anchor="middle" fill="currentColor">COSTUMBRES</text><text x="50" y="38" font-size="7.5" font-family="'Montserrat', sans-serif" font-weight="600" text-anchor="middle" fill="currentColor">ARGENTINAS</text></svg>`,
  frase_pasion: `<svg viewBox="0 0 100 50" fill="currentColor"><text x="50" y="24" font-size="9" font-family="'Cinzel', serif" font-weight="900" text-anchor="middle" fill="currentColor">PASIÓN &amp;</text><text x="50" y="38" font-size="8.5" font-family="'Cinzel', serif" font-weight="700" text-anchor="middle" fill="currentColor">TRADICIÓN</text></svg>`,
  frase_amistad: `<svg viewBox="0 0 100 50" fill="currentColor"><text x="50" y="24" font-size="8.5" font-family="'Dancing Script', cursive" font-weight="700" text-anchor="middle" fill="currentColor">Amistad</text><text x="50" y="38" font-size="9" font-family="'Montserrat', sans-serif" font-weight="800" text-anchor="middle" fill="currentColor">CRIOLLA</text></svg>`,
  corona: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M15 70 L20 35 L40 55 L50 20 L60 55 L80 35 L85 70 Z" fill="none" stroke="currentColor" stroke-width="4"/><rect x="15" y="70" width="70" height="10" rx="3" fill="currentColor"/><circle cx="50" cy="18" r="4" fill="currentColor"/><circle cx="20" cy="32" r="3.5" fill="currentColor"/><circle cx="80" cy="32" r="3.5" fill="currentColor"/></svg>`,
  laurel: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M30 80 C15 50 25 25 50 15 C75 25 85 50 70 80" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M30 75 Q20 65 28 55 Q35 65 30 75 M25 55 Q15 45 25 35 Q32 45 25 55 M32 35 Q25 25 35 18 Q40 28 32 35" fill="currentColor"/><path d="M70 75 Q80 65 72 55 Q65 65 70 75 M75 55 Q85 45 75 35 Q68 45 75 55 M68 35 Q75 25 65 18 Q60 28 68 35" fill="currentColor"/></svg>`,
  estrella_fed: `<svg viewBox="0 0 100 100" fill="currentColor"><polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="10" fill="currentColor"/></svg>`,
  infinito: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M30 35 C15 35 15 65 30 65 C45 65 55 35 70 35 C85 35 85 65 70 65 C55 65 45 35 30 35 Z" fill="none" stroke="currentColor" stroke-width="5"/></svg>`,
  corazon: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 82 C20 60 12 40 22 26 C32 14 46 20 50 30 C54 20 68 14 78 26 C88 40 80 60 50 82 Z" fill="none" stroke="currentColor" stroke-width="4.5"/><path d="M50 72 C30 52 24 38 30 29 C36 21 46 25 50 34 C54 25 64 21 70 29 C76 38 70 52 50 72 Z" fill="currentColor"/></svg>`
};

// TIPOGRAFÍAS DISPONIBLES EN GOOGLE FONTS
const GOOGLE_FONTS = [
  { id: 'Cinzel', name: 'Cinzel', style: 'Romana Orfebre', sample: 'CLÁSICA' },
  { id: 'Playfair Display', name: 'Playfair Display', style: 'Serif Elegante', sample: 'Elegancia' },
  { id: 'Montserrat', name: 'Montserrat', style: 'Moderna Premium', sample: 'MODERNA' },
  { id: 'Dancing Script', name: 'Dancing Script', style: 'Cursiva Artesanal', sample: 'Tradición' },
  { id: 'Bebas Neue', name: 'Bebas Neue', style: 'Impacto / Tribuna', sample: 'PASIÓN' },
  { id: 'Outfit', name: 'Outfit', style: 'Geométrica Limpia', sample: 'Geométrica' },
  { id: 'Great Vibes', name: 'Great Vibes', style: 'Caligráfica Gala', sample: 'Recuerdo' },
  { id: 'Poppins', name: 'Poppins', style: 'Moderna Suave', sample: 'Minimal' },
  { id: 'Oswald', name: 'Oswald', style: 'Condensada Fuerte', sample: 'POTENCIA' }
];

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
  initStudioEngine();
});

function initStudioEngine() {
  // Renderizar las categorías y tipografías
  renderCategoryPills();
  renderVectorLibrary('deportes');
  renderFontCards();
  renderMatesDropdown();

  // Escuchar parámetros de URL
  const urlParams = new URLSearchParams(window.location.search);
  const mateFromUrl = urlParams.get('mate') || urlParams.get('product');
  if (mateFromUrl) {
    studio.selectedMateId = mateFromUrl;
  }

  // Cargar plantilla por defecto: "Texto + 2 Íconos"
  applyTemplate('text_2icons');

  // Inicializar eventos de interacción con el Canvas SVG
  initCanvasInteraction();

  // Actualizar UI de pasos
  switchStudioStep(1);
}

// ==========================================================================
// 1. SISTEMA DE PASOS (1: Plantillas | 2: Diseño | 3: Confirmar)
// ==========================================================================
function switchStudioStep(stepNum) {
  studio.currentStep = stepNum;

  // Actualizar botones de pasos
  document.querySelectorAll('.studio-step-tab').forEach(tab => {
    tab.classList.toggle('active', parseInt(tab.getAttribute('data-step')) === stepNum);
  });

  // Mostrar panel correspondiente
  document.querySelectorAll('.studio-panel-step').forEach(panel => {
    panel.classList.toggle('active', parseInt(panel.getAttribute('data-step-panel')) === stepNum);
  });

  if (stepNum === 3) {
    updateSummaryConfirmation();
  }

  // Scroll suave al inicio del panel en móviles
  if (window.innerWidth < 992) {
    document.querySelector('.studio-sidebar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ==========================================================================
// 2. PLANTILLAS PRE-CONFIGURADAS
// ==========================================================================
function applyTemplate(templateKey) {
  studio.items = [];
  studio.activeItemId = null;

  if (templateKey === 'text_2icons') {
    // Texto superior curvo + 2 iconos a los lados + doble línea
    studio.circularLines = 'doble';
    studio.items.push({
      id: 'item_text_top',
      type: 'text',
      text: 'MATES RÍO',
      font: 'Cinzel',
      fontSize: 22,
      arcPosition: 'top'
    });
    studio.items.push({
      id: 'item_icon_left',
      type: 'icon',
      graphicId: 'soldemayo',
      file: 'assets/images/designs/soldemayo.svg',
      angle: 180, // Izquierda
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      scale: 1.05
    });
    studio.items.push({
      id: 'item_icon_right',
      type: 'icon',
      graphicId: 'afa',
      file: 'assets/images/designs/afa.svg',
      angle: 0, // Derecha
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      scale: 1.05
    });
  } else if (templateKey === 'text_3icons') {
    // Texto superior curvo + 3 iconos (izquierda, inferior, derecha) + doble línea
    studio.circularLines = 'doble';
    studio.items.push({
      id: 'item_text_top',
      type: 'text',
      text: 'TRADICIÓN & NOBLEZA',
      font: 'Cinzel',
      fontSize: 20,
      arcPosition: 'top'
    });
    studio.items.push({
      id: 'item_icon_left',
      type: 'icon',
      graphicId: 'soldemayo',
      file: 'assets/images/designs/soldemayo.svg',
      angle: 160,
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      scale: 0.95
    });
    studio.items.push({
      id: 'item_icon_bottom',
      type: 'icon',
      graphicId: 'caballo',
      file: 'assets/images/designs/caballo.svg',
      angle: 90, // Abajo
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      scale: 1.1
    });
    studio.items.push({
      id: 'item_icon_right',
      type: 'icon',
      graphicId: 'afa',
      file: 'assets/images/designs/afa.svg',
      angle: 20,
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      scale: 0.95
    });
  } else if (templateKey === 'text_1icon') {
    // Texto superior curvo + 1 icono inferior + simple línea
    studio.circularLines = 'simple';
    studio.items.push({
      id: 'item_text_top',
      type: 'text',
      text: 'EDICIÓN IMPERIAL',
      font: 'Playfair Display',
      fontSize: 22,
      arcPosition: 'top'
    });
    studio.items.push({
      id: 'item_icon_bottom',
      type: 'icon',
      graphicId: 'soldemayo',
      file: 'assets/images/designs/soldemayo.svg',
      angle: 90,
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      scale: 1.15
    });
  } else if (templateKey === 'scratch') {
    // Empezar de cero
    studio.circularLines = 'doble';
  }

  // Marcar tarjeta de plantilla activa
  document.querySelectorAll('.template-choice-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-tpl') === templateKey);
  });

  // Actualizar controles de líneas circulares
  selectCircularLines(studio.circularLines, false);

  // Re-renderizar canvas SVG
  renderVirolaCanvas();

  if (typeof showAdminToast === 'function') {
    showAdminToast('Plantilla aplicada a la virola', 'fa-wand-magic-sparkles');
  }
}

// ==========================================================================
// 3. CONTROL DE LÍNEAS CIRCULARES (NO / SIMPLE / DOBLE)
// ==========================================================================
function selectCircularLines(mode, render = true) {
  studio.circularLines = mode;
  document.querySelectorAll('.lines-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lines') === mode);
  });
  if (render) renderVirolaCanvas();
}

// ==========================================================================
// 4. EDICIÓN DE TEXTO CURVO
// ==========================================================================
function renderFontCards() {
  const container = document.getElementById('fonts-selector-grid');
  if (!container) return;

  container.innerHTML = GOOGLE_FONTS.map(f => `
    <div class="font-choice-card ${studio.selectedFont === f.id ? 'active' : ''}" 
         data-font="${f.id}" 
         onclick="selectStudioFont('${f.id}')"
         style="font-family: '${f.id}', sans-serif;">
      <div class="font-preview-sample">${f.sample}</div>
      <div class="font-meta">
        <strong>${f.name}</strong>
        <span>${f.style}</span>
      </div>
    </div>
  `).join('');
}

function selectStudioFont(fontId) {
  studio.selectedFont = fontId;
  document.querySelectorAll('.font-choice-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-font') === fontId);
  });

  // Si hay un texto seleccionado, actualizarlo directamente
  const activeItem = studio.items.find(i => i.id === studio.activeItemId);
  if (activeItem && activeItem.type === 'text') {
    activeItem.font = fontId;
    renderVirolaCanvas();
  }
}

function onStudioTextInput(val) {
  studio.textInput = val;
  const counter = document.getElementById('studio-text-counter');
  if (counter) counter.textContent = `${val.length}/35`;

  // Si hay un elemento de texto activo o solo uno en la virola, actualizarlo en vivo
  let textItem = studio.items.find(i => i.id === studio.activeItemId && i.type === 'text');
  if (!textItem) {
    textItem = studio.items.find(i => i.type === 'text' && i.arcPosition === studio.arcPosition);
  }

  if (textItem) {
    textItem.text = val.trim();
    textItem.font = studio.selectedFont;
    renderVirolaCanvas();
  }
}

function applyTextToVirola() {
  const text = studio.textInput.trim();
  if (!text) {
    showNotificationToast('Por favor escribí un texto para la virola', 'fa-pen');
    return;
  }

  // Comprobar si ya existe texto en esa posición de arco
  let existing = studio.items.find(i => i.type === 'text' && i.arcPosition === studio.arcPosition);
  if (existing) {
    existing.text = text;
    existing.font = studio.selectedFont;
    existing.fontSize = studio.fontSize;
    studio.activeItemId = existing.id;
  } else {
    const newItem = {
      id: 'text_' + Date.now(),
      type: 'text',
      text: text,
      font: studio.selectedFont,
      fontSize: studio.fontSize,
      arcPosition: studio.arcPosition
    };
    studio.items.push(newItem);
    studio.activeItemId = newItem.id;
  }

  renderVirolaCanvas();
  showNotificationToast('Texto aplicado en la curvatura de la virola', 'fa-check');
}

function toggleArcPosition(pos) {
  studio.arcPosition = pos;
  document.querySelectorAll('.arc-pos-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-pos') === pos);
  });

  const textInput = document.getElementById('studio-text-input');
  const existing = studio.items.find(i => i.type === 'text' && i.arcPosition === pos);
  if (existing && textInput) {
    textInput.value = existing.text;
    studio.textInput = existing.text;
  }
}

// ==========================================================================
// 5. BIBLIOTECA DE VECTORES & CATEGORÍAS
// ==========================================================================
function renderCategoryPills() {
  const container = document.getElementById('vector-cat-pills');
  if (!container) return;

  container.innerHTML = Object.entries(VECTOR_CATEGORIES).map(([key, cat]) => `
    <button type="button" 
            class="vector-cat-pill ${studio.activeCategory === key ? 'active' : ''}" 
            onclick="switchVectorCategory('${key}')">
      ${cat.name}
    </button>
  `).join('');
}

function switchVectorCategory(catKey) {
  studio.activeCategory = catKey;
  renderCategoryPills();
  renderVectorLibrary(catKey);
}

function renderVectorLibrary(catKey) {
  const container = document.getElementById('vector-icons-grid');
  if (!container) return;

  const cat = VECTOR_CATEGORIES[catKey];
  if (!cat) return;

  container.innerHTML = cat.items.map(item => {
    let previewHtml = '';
    if (item.file) {
      previewHtml = `<img src="${item.file}" alt="${item.name}" class="vector-thumb-img" />`;
    } else if (item.inline && INLINE_SVGS[item.inline]) {
      previewHtml = `<div class="vector-thumb-inline">${INLINE_SVGS[item.inline]}</div>`;
    }

    return `
      <div class="vector-card-item" onclick="addVectorToVirola('${item.id}', '${catKey}')" title="${item.name}">
        <div class="vector-card-preview">${previewHtml}</div>
        <span class="vector-card-name">${item.name}</span>
        <button type="button" class="vector-add-badge"><i class="fas fa-plus"></i></button>
      </div>
    `;
  }).join('');
}

function addVectorToVirola(itemId, catKey) {
  const cat = VECTOR_CATEGORIES[catKey];
  const itemDef = cat?.items.find(i => i.id === itemId);
  if (!itemDef) return;

  // Calcular un ángulo disponible para que no caigan todos encimados
  const existingAngles = studio.items.filter(i => i.type === 'icon').map(i => i.angle);
  let newAngle = 90; // Abajo por defecto
  if (existingAngles.includes(90)) {
    if (!existingAngles.includes(180)) newAngle = 180;
    else if (!existingAngles.includes(0)) newAngle = 0;
    else if (!existingAngles.includes(135)) newAngle = 135;
    else if (!existingAngles.includes(45)) newAngle = 45;
    else newAngle = (existingAngles[existingAngles.length - 1] + 45) % 360;
  }

  const newItem = {
    id: 'icon_' + Date.now(),
    type: 'icon',
    graphicId: itemId,
    name: itemDef.name,
    file: itemDef.file || null,
    inlineKey: itemDef.inline || null,
    angle: newAngle,
    radius: STUDIO_CONFIG.rRing,
    rotation: 0,
    scale: 1.0
  };

  studio.items.push(newItem);
  studio.activeItemId = newItem.id;
  renderVirolaCanvas();

  showNotificationToast(`Diseño "${itemDef.name}" agregado a la virola`, 'fa-circle-check');
}

// Subir logo o imagen propia
function handleCustomImageUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target?.result;
    const newItem = {
      id: 'icon_custom_' + Date.now(),
      type: 'icon',
      graphicId: 'custom',
      name: file.name,
      file: dataUrl,
      angle: 90,
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      scale: 1.1
    };

    studio.items.push(newItem);
    studio.activeItemId = newItem.id;
    renderVirolaCanvas();
    showNotificationToast(`Imagen "${file.name}" cargada en la virola`, 'fa-upload');
  };
  reader.readAsDataURL(file);
}

// ==========================================================================
// 6. RENDERIZADO DEL CANVAS SVG DE LA VIROLA CIRCULAR INTERACTIVA
// ==========================================================================
function renderVirolaCanvas() {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg) return;

  const { cx, cy, rInner, rRing, rOuter } = STUDIO_CONFIG;

  // Generar trazado de arcos para textos superior e inferior
  // Arco superior: de 195° a 345° (reloj)
  const rTextTop = rRing + 2;
  const startAngleTop = 195 * (Math.PI / 180);
  const endAngleTop = 345 * (Math.PI / 180);
  const x1Top = cx + rTextTop * Math.cos(startAngleTop);
  const y1Top = cy + rTextTop * Math.sin(startAngleTop);
  const x2Top = cx + rTextTop * Math.cos(endAngleTop);
  const y2Top = cy + rTextTop * Math.sin(endAngleTop);

  // Arco inferior: de 15° a 165°
  const rTextBottom = rRing + 2;
  const startAngleBottom = 165 * (Math.PI / 180);
  const endAngleBottom = 15 * (Math.PI / 180);
  const x1Bottom = cx + rTextBottom * Math.cos(startAngleBottom);
  const y1Bottom = cy + rTextBottom * Math.sin(startAngleBottom);
  const x2Bottom = cx + rTextBottom * Math.cos(endAngleBottom);
  const y2Bottom = cy + rTextBottom * Math.sin(endAngleBottom);

  // Líneas circulares orfebres
  let circularLinesHtml = '';
  if (studio.circularLines === 'simple') {
    circularLinesHtml = `
      <circle cx="${cx}" cy="${cy}" r="${rRing + 32}" fill="none" stroke="rgba(30, 20, 15, 0.55)" stroke-width="1.8" stroke-dasharray="none" />
    `;
  } else if (studio.circularLines === 'doble') {
    circularLinesHtml = `
      <circle cx="${cx}" cy="${cy}" r="${rRing + 38}" fill="none" stroke="rgba(30, 20, 15, 0.65)" stroke-width="1.8" />
      <circle cx="${cx}" cy="${cy}" r="${rRing + 26}" fill="none" stroke="rgba(30, 20, 15, 0.45)" stroke-width="1.4" />
    `;
  }

  // Trazados de textos
  let textsHtml = '';
  const textItems = studio.items.filter(i => i.type === 'text');
  textItems.forEach(t => {
    const isTop = t.arcPosition === 'top';
    const pathId = isTop ? 'arc-top-path' : 'arc-bottom-path';
    const isActive = t.id === studio.activeItemId;

    textsHtml += `
      <text font-family="'${t.font}', serif" 
            font-size="${t.fontSize || 22}" 
            font-weight="800" 
            letter-spacing="2px"
            fill="#120e0a"
            class="virola-curved-text ${isActive ? 'active-text-element' : ''}"
            data-item-id="${t.id}"
            onclick="selectVirolaItem('${t.id}', event)">
        <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">
          ${escapeHtml(t.text)}
        </textPath>
      </text>
    `;
  });

  // Íconos / Stickers
  let iconsHtml = '';
  const iconItems = studio.items.filter(i => i.type === 'icon');
  iconItems.forEach(item => {
    const rad = (item.angle * Math.PI) / 180;
    const x = cx + item.radius * Math.cos(rad);
    const y = cy + item.radius * Math.sin(rad);
    const scale = item.scale || 1.0;
    const rot = item.rotation || 0;
    const isActive = item.id === studio.activeItemId;

    const baseSize = 44;
    const halfSize = (baseSize * scale) / 2;

    let contentHtml = '';
    if (item.file) {
      contentHtml = `<image href="${item.file}" x="${-halfSize}" y="${-halfSize}" width="${baseSize * scale}" height="${baseSize * scale}" preserveAspectRatio="xMidYMid meet" />`;
    } else if (item.inlineKey && INLINE_SVGS[item.inlineKey]) {
      contentHtml = `
        <g transform="translate(${-halfSize}, ${-halfSize}) scale(${(baseSize * scale) / 100})">
          ${INLINE_SVGS[item.inlineKey]}
        </g>
      `;
    }

    // Handles interactivos (Rotación azul, Escala verde, Borrar rojo)
    let handlesHtml = '';
    if (isActive) {
      const handleOffset = halfSize + 14;
      handlesHtml = `
        <!-- Cuadro selector / Ring -->
        <circle cx="0" cy="0" r="${halfSize + 8}" fill="none" stroke="#c59b27" stroke-width="1.8" stroke-dasharray="4,4" />

        <!-- Handle Azul (Rotación) Arriba -->
        <g class="virola-handle handle-rotate" data-handle="rotate" data-item-id="${item.id}" transform="translate(0, ${-handleOffset})">
          <circle cx="0" cy="0" r="10" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
          <path d="M-4 -2 A 4 4 0 1 1 4 2 M2 4 L4 2 L2 0" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
        </g>

        <!-- Handle Verde (Escala) Abajo-Derecha -->
        <g class="virola-handle handle-scale" data-handle="scale" data-item-id="${item.id}" transform="translate(${handleOffset * 0.75}, ${handleOffset * 0.75})">
          <circle cx="0" cy="0" r="10" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
          <path d="M-3 3 L3 -3 M0 -3 L3 -3 L3 0 M0 3 L-3 3 L-3 0" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
        </g>

        <!-- Handle Rojo (Eliminar) Arriba-Izquierda -->
        <g class="virola-handle handle-delete" data-handle="delete" data-item-id="${item.id}" transform="translate(${-handleOffset * 0.75}, ${-handleOffset * 0.75})" onclick="deleteVirolaItem('${item.id}', event)">
          <circle cx="0" cy="0" r="10" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
          <path d="M-3 -3 L3 3 M3 -3 L-3 3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
        </g>
      `;
    }

    iconsHtml += `
      <g class="virola-sticker-group ${isActive ? 'active-sticker' : ''}" 
         data-item-id="${item.id}" 
         transform="translate(${x}, ${y}) rotate(${rot})"
         onmousedown="startStickerDrag('${item.id}', event)"
         ontouchstart="startStickerDrag('${item.id}', event)">
        ${contentHtml}
        ${handlesHtml}
      </g>
    `;
  });

  // Ensamblado final del SVG con sombreado metálico realista
  svg.innerHTML = `
    <defs>
      <!-- Gradiente Metálico de Alpaca Maciza -->
      <radialGradient id="metal-sheen-grad" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
        <stop offset="25%" stop-color="#f0ece6" />
        <stop offset="55%" stop-color="#d9d1c7" />
        <stop offset="80%" stop-color="#b8ad9e" />
        <stop offset="100%" stop-color="#8a7c6b" />
      </radialGradient>

      <!-- Gradiente Cónico / Anular de Reflejos -->
      <linearGradient id="metal-reflection" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
        <stop offset="30%" stop-color="#c5bcaf" stop-opacity="0.2" />
        <stop offset="70%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#736655" stop-opacity="0.8" />
      </linearGradient>

      <!-- Sombra interior de la calabaza -->
      <radialGradient id="calabaza-interior" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#110d0a" />
        <stop offset="65%" stop-color="#1f1812" />
        <stop offset="90%" stop-color="#2a2018" />
        <stop offset="100%" stop-color="#0d0906" />
      </radialGradient>

      <!-- Trazado de Texto Superior -->
      <path id="arc-top-path" d="M ${x1Top} ${y1Top} A ${rTextTop} ${rTextTop} 0 0 1 ${x2Top} ${y2Top}" fill="none" />
      
      <!-- Trazado de Texto Inferior -->
      <path id="arc-bottom-path" d="M ${x1Bottom} ${y1Bottom} A ${rTextBottom} ${rTextBottom} 0 0 1 ${x2Bottom} ${y2Bottom}" fill="none" />
    </defs>

    <!-- 1. Borde Exterior de Cuero Vacuno Repujado -->
    <circle cx="${cx}" cy="${cy}" r="${rOuter + 8}" fill="#1b120c" stroke="#3d2a1d" stroke-width="4" />
    <circle cx="${cx}" cy="${cy}" r="${rOuter + 5}" fill="none" stroke="#c59b27" stroke-width="1" stroke-dasharray="2,3" opacity="0.6" />

    <!-- 2. Corona de Alpaca / Virola Metálica Principal -->
    <path d="M ${cx} ${cy - rOuter} 
             A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy + rOuter} 
             A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy - rOuter} Z
             M ${cx} ${cy - rInner} 
             A ${rInner} ${rInner} 0 1 1 ${cx} ${cy + rInner} 
             A ${rInner} ${rInner} 0 1 1 ${cx} ${cy - rInner} Z"
          fill="url(#metal-sheen-grad)" 
          stroke="#7d6f5f" 
          stroke-width="1.5"
          fill-rule="evenodd" />

    <!-- 3. Brillos y Reflejos Metálicos -->
    <path d="M ${cx} ${cy - rOuter} 
             A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy + rOuter} 
             A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy - rOuter} Z
             M ${cx} ${cy - rInner} 
             A ${rInner} ${rInner} 0 1 1 ${cx} ${cy + rInner} 
             A ${rInner} ${rInner} 0 1 1 ${cx} ${cy - rInner} Z"
          fill="url(#metal-reflection)" 
          fill-rule="evenodd" 
          opacity="0.45" />

    <!-- 4. Líneas Circulares Orfebres -->
    ${circularLinesHtml}

    <!-- 5. Boca Interior del Mate (Calabaza curada con sombra de profundidad) -->
    <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="url(#calabaza-interior)" stroke="#3d2d1e" stroke-width="3" />
    <!-- Yerba y bombilla sutil en el centro -->
    <circle cx="${cx}" cy="${cy}" r="${rInner - 18}" fill="#162212" opacity="0.85" />
    <circle cx="${cx}" cy="${cy}" r="${rInner - 22}" fill="none" stroke="#25381e" stroke-width="3" stroke-dasharray="3,4" opacity="0.7" />
    <!-- Sombra biselada del labio interior -->
    <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="none" stroke="rgba(0,0,0,0.6)" stroke-width="4" />

    <!-- 6. Textos Curvos Grabados a Láser HD -->
    <g class="virola-texts-layer">
      ${textsHtml}
    </g>

    <!-- 7. Íconos y Stickers Interactivos -->
    <g class="virola-icons-layer">
      ${iconsHtml}
    </g>
  `;
}

// ==========================================================================
// 7. INTERACCIÓN Y MANIPULACIÓN (DRAG POLAR, ROTATE, SCALE, DELETE)
// ==========================================================================
function selectVirolaItem(itemId, e) {
  if (e) e.stopPropagation();
  studio.activeItemId = itemId;
  renderVirolaCanvas();
}

function deleteVirolaItem(itemId, e) {
  if (e) e.stopPropagation();
  studio.items = studio.items.filter(i => i.id !== itemId);
  if (studio.activeItemId === itemId) {
    studio.activeItemId = null;
  }
  renderVirolaCanvas();
  showNotificationToast('Elemento eliminado de la virola', 'fa-trash');
}

function startStickerDrag(itemId, e) {
  e.preventDefault();
  e.stopPropagation();

  const item = studio.items.find(i => i.id === itemId);
  if (!item) return;

  studio.activeItemId = itemId;

  // Detectar si se hizo clic en un handle específico
  const targetHandle = e.target.closest('.virola-handle');
  const handleType = targetHandle?.getAttribute('data-handle');

  const coords = getPointerCoords(e);

  if (handleType === 'delete') {
    deleteVirolaItem(itemId, e);
    return;
  }

  if (handleType === 'scale') {
    studio.dragMode = 'scale';
  } else if (handleType === 'rotate') {
    studio.dragMode = 'rotate';
  } else {
    studio.dragMode = 'move';
  }

  studio.dragItemId = itemId;
  studio.dragStart = {
    x: coords.x,
    y: coords.y,
    itemAngle: item.angle || 0,
    itemRotation: item.rotation || 0,
    itemScale: item.scale || 1.0
  };

  renderVirolaCanvas();
}

function initCanvasInteraction() {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg) return;

  // Deseleccionar al hacer clic en el fondo
  svg.addEventListener('click', (e) => {
    if (!e.target.closest('.virola-sticker-group') && !e.target.closest('.virola-curved-text')) {
      studio.activeItemId = null;
      renderVirolaCanvas();
    }
  });

  // Movimiento
  window.addEventListener('mousemove', onCanvasPointerMove);
  window.addEventListener('touchmove', onCanvasPointerMove, { passive: false });

  // Fin de arrastre
  window.addEventListener('mouseup', onCanvasPointerEnd);
  window.addEventListener('touchend', onCanvasPointerEnd);
}

function onCanvasPointerMove(e) {
  if (!studio.dragMode || !studio.dragItemId) return;
  e.preventDefault();

  const item = studio.items.find(i => i.id === studio.dragItemId);
  if (!item) return;

  const coords = getPointerCoords(e);
  const { cx, cy } = STUDIO_CONFIG;

  if (studio.dragMode === 'move') {
    // Mover polarmente alrededor del anillo de la virola
    const dx = coords.x - cx;
    const dy = coords.y - cy;
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;

    item.angle = Math.round(angleDeg);
    renderVirolaCanvas();
  } else if (studio.dragMode === 'rotate') {
    // Rotar alrededor de su propio centro
    const rad = (item.angle * Math.PI) / 180;
    const itemCenterX = cx + item.radius * Math.cos(rad);
    const itemCenterY = cy + item.radius * Math.sin(rad);

    const dx = coords.x - itemCenterX;
    const dy = coords.y - itemCenterY;
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;

    item.rotation = Math.round(angleDeg + 90);
    renderVirolaCanvas();
  } else if (studio.dragMode === 'scale') {
    // Escalar
    const rad = (item.angle * Math.PI) / 180;
    const itemCenterX = cx + item.radius * Math.cos(rad);
    const itemCenterY = cy + item.radius * Math.sin(rad);

    const dist = Math.hypot(coords.x - itemCenterX, coords.y - itemCenterY);
    let newScale = dist / 28;
    newScale = Math.max(STUDIO_CONFIG.minScale, Math.min(STUDIO_CONFIG.maxScale, newScale));

    item.scale = parseFloat(newScale.toFixed(2));
    renderVirolaCanvas();
  }
}

function onCanvasPointerEnd() {
  if (studio.dragMode) {
    studio.dragMode = null;
    studio.dragItemId = null;
  }
}

function getPointerCoords(e) {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg) return { x: 0, y: 0 };

  const pt = svg.createSVGPoint();
  if (e.touches && e.touches.length > 0) {
    pt.x = e.touches[0].clientX;
    pt.y = e.touches[0].clientY;
  } else {
    pt.x = e.clientX;
    pt.y = e.clientY;
  }

  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: svgP.x, y: svgP.y };
}

function resetVirolaStudio() {
  studio.items = [];
  studio.activeItemId = null;
  renderVirolaCanvas();
  showNotificationToast('Virola reiniciada limpia', 'fa-rotate-left');
}

// ==========================================================================
// 8. PASO 3: CONFIRMACIÓN, VECTOR DOWNLOAD & CARRITO
// ==========================================================================
function setPurchaseType(type) {
  studio.purchaseType = type;
  document.querySelectorAll('.purchase-type-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-type') === type);
  });
}

function renderMatesDropdown() {
  const select = document.getElementById('mate-model-select');
  if (!select || typeof PRODUCTS_DATA === 'undefined') return;

  const mates = PRODUCTS_DATA.filter(p => p.category === 'mates');
  select.innerHTML = mates.map(m => `
    <option value="${m.id}" ${m.id === studio.selectedMateId ? 'selected' : ''}>
      ${m.name} - ${formatARS(m.price)}
    </option>
  `).join('');
}

function onMateModelChange(val) {
  studio.selectedMateId = val;
  updateSummaryConfirmation();
}

function updateSummaryConfirmation() {
  const mate = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA.find(p => p.id === studio.selectedMateId) : null;
  const mateNameEl = document.getElementById('confirm-mate-name');
  const matePriceEl = document.getElementById('confirm-mate-price');
  const itemsCountEl = document.getElementById('confirm-items-count');
  const linesEl = document.getElementById('confirm-lines-type');

  if (mateNameEl && mate) mateNameEl.textContent = mate.name;
  if (matePriceEl && mate) matePriceEl.textContent = formatARS(mate.price);
  if (itemsCountEl) itemsCountEl.textContent = `${studio.items.length} elemento(s)`;
  if (linesEl) {
    linesEl.textContent = studio.circularLines === 'doble' ? 'Líneas Dobles' : (studio.circularLines === 'simple' ? 'Línea Simple' : 'Sin líneas');
  }
}

// DESCARGAR ARCHIVO VECTORIAL SVG PARA LA MÁQUINA LÁSER CNC
function downloadVectorLaserFile() {
  const svgElement = document.getElementById('virola-studio-svg');
  if (!svgElement) return;

  // Clonar SVG y limpiar controles interactivos para grabado puro
  const clone = svgElement.cloneNode(true);
  clone.querySelectorAll('.virola-handle').forEach(h => h.remove());
  clone.querySelectorAll('.active-sticker circle').forEach(c => {
    if (c.getAttribute('stroke-dasharray')) c.remove();
  });

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clone);

  // Envolver en SVG estándar con metadatos de Mates Río
  svgString = `<!-- Mates Río: Archivo Vectorial de Grabado Láser CNC -->\n` + svgString;

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mates_rio_grabado_virola_${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotificationToast('Vector SVG descargado con éxito para máquina láser', 'fa-file-arrow-down');
}

// FINALIZAR Y AGREGAR AL CARRITO DE COMPRAS
function finalizeAndAddToCart() {
  const mate = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA.find(p => p.id === studio.selectedMateId) : null;
  if (!mate) {
    showNotificationToast('Seleccioná un modelo de mate válido', 'fa-exclamation-triangle');
    return;
  }

  const notesInput = document.getElementById('custom-order-notes');
  const notes = notesInput ? notesInput.value.trim() : '';

  // Construir resumen textual del grabado
  const texts = studio.items.filter(i => i.type === 'text').map(t => `"${t.text}" (${t.font})`).join(', ');
  const icons = studio.items.filter(i => i.type === 'icon').map(i => i.name || i.graphicId).join(', ');

  const customSummary = [
    texts ? `Texto: ${texts}` : null,
    icons ? `Íconos: ${icons}` : null,
    `Líneas: ${studio.circularLines}`,
    `Modalidad: ${studio.purchaseType === 'local' ? 'Retiro en Taller' : 'Envío Web'}`,
    notes ? `Nota: ${notes}` : null
  ].filter(Boolean).join(' | ');

  const customPayload = {
    customized: true,
    purchaseType: studio.purchaseType,
    summary: customSummary,
    items: studio.items,
    lines: studio.circularLines,
    notes: notes,
    createdAt: new Date().toISOString()
  };

  // Agregar al carrito mediante app.js addToCart
  if (typeof addToCart === 'function') {
    addToCart(mate.id, 1, customPayload);
    showNotificationToast(`¡${mate.name} personalizado agregado al carrito!`, 'fa-cart-shopping');
    if (typeof openCartDrawer === 'function') {
      openCartDrawer();
    }
  } else {
    showNotificationToast('Tu mate personalizado está listo para procesar', 'fa-check');
  }
}

// UTILIDADES
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showNotificationToast(msg, icon = 'fa-info-circle') {
  if (typeof showToast === 'function') {
    showToast(msg);
  } else if (typeof showAdminToast === 'function') {
    showAdminToast(msg, icon);
  } else {
    console.log(`[Toast]: ${msg}`);
  }
}
