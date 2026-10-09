// ==========================================================================
// MATES RÍO: ESTUDIO DE PERSONALIZACIÓN VIRTUAL (MOTOR DE VIROLA CIRCULAR)
// Taller interactivo de orfebrería, cincelado y grabado láser de alta definición
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
  
  // Elementos activos en la virola (textos, escudos, logos)
  activeItemId: null,
  items: [], // Array de { id, type, text, font, fontSize, offset, graphicId, file, angle, radius, rotation, scale, arcPosition }

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
  dragMode: null, // 'move' | 'scale' | 'rotate' | 'text_move'
  dragItemId: null,
  dragStart: { x: 0, y: 0, angle: 0, itemAngle: 0, itemRotation: 0, itemScale: 1, itemOffset: 50 }
};

// BIBLIOTECA DE DISEÑOS VECTORIALES ORIGINALES CATEGORIZADOS
const VECTOR_CATEGORIES = {
  deportes: {
    name: '🏆 Escudos Deportivos',
    items: [
      { id: 'afa', name: 'AFA 3 Estrellas', file: 'assets/images/designs/afa.svg' },
      { id: 'boca', name: 'Boca Juniors', file: 'assets/images/designs/boca.svg' },
      { id: 'river', name: 'River Plate', file: 'assets/images/designs/river.svg' },
      { id: 'central', name: 'Rosario Central (Oficial)', file: 'assets/images/designs/central.svg' },
      { id: 'newells', name: "Newell's Old Boys (Oficial)", file: 'assets/images/designs/newells.svg' },
      { id: 'racing', name: 'Racing Club', file: 'assets/images/designs/racing.svg' },
      { id: 'independiente', name: 'Independiente', file: 'assets/images/designs/independiente.svg' },
      { id: 'sanlorenzo', name: 'San Lorenzo', file: 'assets/images/designs/sanlorenzo.svg' },
      { id: 'belgrano', name: 'Belgrano de Córdoba', file: 'assets/images/designs/belgrano.svg' },
      { id: 'talleres', name: 'Talleres de Córdoba', file: 'assets/images/designs/talleres.svg' },
      { id: 'instituto', name: 'Instituto ACC', file: 'assets/images/designs/instituto.svg' },
      { id: 'racingcordoba', name: 'Racing de Córdoba', file: 'assets/images/designs/racingcordoba.svg' }
    ]
  },
  criollo: {
    name: '🇦🇷 Motivos Criollos & Tradición',
    items: [
      { id: 'soldemayo', name: 'Sol de Mayo', file: 'assets/images/designs/soldemayo.svg' },
      { id: 'escarapela', name: 'Escarapela Argentina (Original)', file: 'assets/images/designs/escarapela.svg' },
      { id: 'ceibo', name: 'Flor de Ceibo Nacional (Original)', file: 'assets/images/designs/ceibo.svg' },
      { id: 'mate_icono', name: 'Mate Tradicional Imperial (Original)', file: 'assets/images/designs/mate.svg' },
      { id: 'cruz', name: 'Cruz Criolla Gauchesca (Original)', file: 'assets/images/designs/cruz.svg' },
      { id: 'caballo', name: 'Caballo Criollo', file: 'assets/images/designs/caballo.svg' },
      { id: 'guardapampa', name: 'Guarda Pampa', file: 'assets/images/designs/guardapampa.svg' },
      { id: 'malvinas', name: 'Islas Malvinas', file: 'assets/images/designs/malvinas.svg' },
      { id: 'mapa', name: 'Silueta Argentina', file: 'assets/images/designs/mapa.svg' }
    ]
  },
  fauna: {
    name: '🦅 Fauna & Naturaleza',
    items: [
      { id: 'condor', name: 'Cóndor Andino (Original)', file: 'assets/images/designs/condor.svg' },
      { id: 'hornero', name: 'Hornero Nacional (Original)', file: 'assets/images/designs/hornero.svg' },
      { id: 'carpincho', name: 'Carpincho / Capibara (Original)', file: 'assets/images/designs/carpincho.svg' },
      { id: 'guanaco', name: 'Guanaco Criollo (Original)', file: 'assets/images/designs/guanaco.svg' },
      { id: 'ciervo', name: 'Ciervo de los Pantanos (Original)', file: 'assets/images/designs/ciervo.svg' }
    ]
  },
  frases: {
    name: '💬 Frases & Pasión',
    items: [
      { id: 'frase_gloria', name: 'CORONADOS DE GLORIA', text: 'CORONADOS DE GLORIA' },
      { id: 'frase_mate', name: 'EL AMOR POR EL MATE', text: 'EL AMOR POR EL MATE' },
      { id: 'frase_costumbres', name: 'COSTUMBRES ARGENTINAS', text: 'COSTUMBRES ARGENTINAS' },
      { id: 'frase_pasion', name: 'PASIÓN & TRADICIÓN', text: 'PASIÓN & TRADICIÓN' },
      { id: 'frase_amistad', name: 'AMISTAD CRIOLLA', text: 'AMISTAD CRIOLLA' },
      { id: 'frase_campeon', name: 'CAMPEONES DEL MUNDO', text: 'CAMPEONES DEL MUNDO' },
      { id: 'frase_siempre', name: 'SIEMPRE CON VOS', text: 'SIEMPRE CON VOS' }
    ]
  },
  simbolos: {
    name: '✨ Símbolos & Formas',
    items: [
      { id: 'corona', name: 'Corona Imperial (Original)', file: 'assets/images/designs/corona.svg' },
      { id: 'laurel', name: 'Corona de Laureles (Original)', file: 'assets/images/designs/laurel.svg' },
      { id: 'estrella_fed', name: 'Estrella Federal (Original)', file: 'assets/images/designs/estrella_fed.svg' },
      { id: 'infinito', name: 'Infinito Eterno (Original)', file: 'assets/images/designs/infinito.svg' },
      { id: 'corazon', name: 'Corazón de Gaucho (Original)', file: 'assets/images/designs/corazon.svg' }
    ]
  }
};

// TIPOGRAFÍAS DE GRABADO DISPONIBLES EN GOOGLE FONTS (AMPLIADAS Y PROFESIONALES)
const GOOGLE_FONTS = [
  { id: 'Cinzel', name: 'Cinzel' },
  { id: 'Playfair Display', name: 'Playfair Display' },
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond' },
  { id: 'Lora', name: 'Lora' },
  { id: 'Montserrat', name: 'Montserrat' },
  { id: 'Dancing Script', name: 'Dancing Script' },
  { id: 'Great Vibes', name: 'Great Vibes' },
  { id: 'Alex Brush', name: 'Alex Brush' },
  { id: 'Marck Script', name: 'Marck Script' },
  { id: 'Bebas Neue', name: 'Bebas Neue' },
  { id: 'Outfit', name: 'Outfit' },
  { id: 'Poppins', name: 'Poppins' },
  { id: 'Oswald', name: 'Oswald' },
  { id: 'Rye', name: 'Rye' },
  { id: 'Pirata One', name: 'Pirata One' },
  { id: 'UnifrakturMaguntia', name: 'UnifrakturMaguntia' }
];

// INICIALIZACIÓN DEL ESTUDIO
document.addEventListener('DOMContentLoaded', () => {
  initStudioEngine();
});

function initStudioEngine() {
  // Renderizar vistas de categorías, tipografías y modelos
  renderVectorCategoriesView();
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
// 2. SISTEMA DE ACORDEONES (4 CATEGORÍAS COLAPSABLES)
// ==========================================================================
function toggleStudioAccordion(sectionKey) {
  const card = document.getElementById(`accordion-section-${sectionKey}`);
  if (!card) return;
  const isOpen = card.classList.contains('open');
  card.classList.toggle('open', !isOpen);

  const header = card.querySelector('.studio-accordion-header');
  if (header) {
    header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
  }
}

// ==========================================================================
// 3. PLANTILLAS PRE-CONFIGURADAS
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
      arcPosition: 'top',
      offset: 50
    });
    studio.items.push({
      id: 'item_icon_left',
      type: 'icon',
      graphicId: 'soldemayo',
      name: 'Sol de Mayo',
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
      name: 'AFA 3 Estrellas',
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
      arcPosition: 'top',
      offset: 50
    });
    studio.items.push({
      id: 'item_icon_left',
      type: 'icon',
      graphicId: 'soldemayo',
      name: 'Sol de Mayo',
      file: 'assets/images/designs/soldemayo.svg',
      angle: 150,
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      scale: 0.95
    });
    studio.items.push({
      id: 'item_icon_bottom',
      type: 'icon',
      graphicId: 'caballo',
      name: 'Caballo Criollo',
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
      name: 'AFA 3 Estrellas',
      file: 'assets/images/designs/afa.svg',
      angle: 30,
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
      arcPosition: 'top',
      offset: 50
    });
    studio.items.push({
      id: 'item_icon_bottom',
      type: 'icon',
      graphicId: 'soldemayo',
      name: 'Sol de Mayo',
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
  updateActiveItemFloatingBar();
}

// ==========================================================================
// 4. CONTROL DE LÍNEAS CIRCULARES (NO / SIMPLE / DOBLE)
// ==========================================================================
function selectCircularLines(mode, render = true) {
  studio.circularLines = mode;
  document.querySelectorAll('.lines-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lines') === mode);
  });
  if (render) renderVirolaCanvas();
}

// ==========================================================================
// 5. EDICIÓN DE TEXTO CURVO EN LA VIROLA (PROFESIONAL Y PROLIJO)
// ==========================================================================
function renderFontCards() {
  const container = document.getElementById('fonts-selector-grid');
  if (!container) return;

  container.innerHTML = GOOGLE_FONTS.map(f => `
    <div class="font-choice-card ${studio.selectedFont === f.id ? 'active' : ''}" 
         data-font="${f.id}" 
         onclick="selectStudioFont('${f.id}')"
         style="font-family: '${f.id}', serif;"
         title="${f.name}">
      <span class="font-name-only">${f.name}</span>
    </div>
  `).join('');
}

function selectStudioFont(fontId) {
  studio.selectedFont = fontId;
  document.querySelectorAll('.font-choice-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-font') === fontId);
  });

  const fontPill = document.getElementById('selected-font-name-pill');
  if (fontPill) fontPill.textContent = fontId;

  // Si hay un texto seleccionado, actualizarlo directamente
  const activeItem = studio.items.find(i => i.id === studio.activeItemId);
  if (activeItem && activeItem.type === 'text') {
    activeItem.font = fontId;
    renderVirolaCanvas();
  } else {
    // Actualizar el primer texto existente si no hay activo
    const firstText = studio.items.find(i => i.type === 'text');
    if (firstText) {
      firstText.font = fontId;
      renderVirolaCanvas();
    }
  }
}

function onStudioTextInput(val) {
  studio.textInput = val;
  const counter = document.getElementById('studio-text-counter');
  if (counter) counter.textContent = `${val.length}/35`;

  // Si hay un elemento de texto activo o en la posición actual, actualizar en vivo
  let textItem = studio.items.find(i => i.id === studio.activeItemId && i.type === 'text');
  if (!textItem) {
    textItem = studio.items.find(i => i.type === 'text' && i.arcPosition === studio.arcPosition);
  }

  if (textItem) {
    textItem.text = val;
    textItem.font = studio.selectedFont;
    renderVirolaCanvas();
    updateActiveItemFloatingBar();
  }
}

function clearStudioText() {
  const input = document.getElementById('studio-text-input');
  if (input) input.value = '';
  onStudioTextInput('');
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
    existing.offset = 50;
    studio.activeItemId = existing.id;
  } else {
    const newItem = {
      id: 'text_' + Date.now(),
      type: 'text',
      text: text,
      font: studio.selectedFont,
      fontSize: studio.fontSize,
      arcPosition: studio.arcPosition,
      offset: 50
    };
    studio.items.push(newItem);
    studio.activeItemId = newItem.id;
  }

  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  showNotificationToast('Texto aplicado en la curvatura de la virola', 'fa-check');
}

function toggleArcPosition(pos) {
  studio.arcPosition = pos;
  document.querySelectorAll('.arc-segment-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-pos') === pos);
  });

  const textInput = document.getElementById('studio-text-input');
  const existing = studio.items.find(i => i.type === 'text' && i.arcPosition === pos);
  if (existing && textInput) {
    textInput.value = existing.text;
    studio.textInput = existing.text;
    const counter = document.getElementById('studio-text-counter');
    if (counter) counter.textContent = `${existing.text.length}/35`;
    studio.activeItemId = existing.id;
    updateActiveItemFloatingBar();
  }
}

// ==========================================================================
// 6. CATEGORÍAS DE DISEÑOS (VISTA DE CATEGORÍAS PRIMERO)
// ==========================================================================
function renderVectorCategoriesView() {
  const container = document.getElementById('vector-category-cards-grid');
  if (!container) return;

  const catMeta = {
    deportes: { icon: 'fa-trophy', label: 'Escudos Deportivos', count: '12 clubes oficiales' },
    criollo: { icon: 'fa-sun', label: 'Tradición & Patria', count: '9 motivos patrios' },
    fauna: { icon: 'fa-feather-pointed', label: 'Fauna & Naturaleza', count: '5 animales autóctonos' },
    frases: { icon: 'fa-comment-dots', label: 'Frases & Pasión', count: '7 frases listas' },
    simbolos: { icon: 'fa-shapes', label: 'Símbolos & Formas', count: '5 figuras orfebres' }
  };

  container.innerHTML = Object.entries(VECTOR_CATEGORIES).map(([key, cat]) => {
    const meta = catMeta[key] || { icon: 'fa-shapes', label: cat.name, count: `${cat.items.length} diseños` };
    return `
      <div class="vector-cat-card" onclick="selectVectorCategory('${key}')">
        <div class="vector-cat-card-icon"><i class="fas ${meta.icon}"></i></div>
        <div class="vector-cat-card-info">
          <strong>${meta.label}</strong>
          <span>${meta.count}</span>
        </div>
        <i class="fas fa-chevron-right vector-cat-card-arrow"></i>
      </div>
    `;
  }).join('');
}

function selectVectorCategory(catKey) {
  studio.activeCategory = catKey;
  const categoriesView = document.getElementById('vector-categories-view');
  const itemsView = document.getElementById('vector-items-view');
  const titleBadge = document.getElementById('active-category-title-badge');

  if (categoriesView) categoriesView.style.display = 'none';
  if (itemsView) itemsView.style.display = 'block';

  const cat = VECTOR_CATEGORIES[catKey];
  if (titleBadge && cat) {
    titleBadge.textContent = cat.name;
  }

  renderVectorLibrary(catKey);
}

function showVectorCategoriesView() {
  const categoriesView = document.getElementById('vector-categories-view');
  const itemsView = document.getElementById('vector-items-view');
  if (categoriesView) categoriesView.style.display = 'block';
  if (itemsView) itemsView.style.display = 'none';
}

function renderVectorLibrary(catKey) {
  const container = document.getElementById('vector-icons-grid');
  if (!container) return;

  const cat = VECTOR_CATEGORIES[catKey];
  if (!cat) return;

  // Si es la categoría de Frases, renderizar como tarjetas tipográficas interactivas
  if (catKey === 'frases') {
    container.innerHTML = cat.items.map(item => `
      <div class="phrase-card-item" onclick="applyPhraseToVirola('${escapeHtml(item.text)}')" title="Hacé clic para aplicar esta frase a la virola">
        <div class="phrase-card-text">${item.name}</div>
        <button type="button" class="phrase-add-btn">
          <i class="fas fa-plus"></i> Aplicar al arco
        </button>
      </div>
    `).join('');
    return;
  }

  // Para las demás categorías, mostrar grilla de íconos vectoriales
  container.innerHTML = cat.items.map(item => {
    let previewHtml = `<img src="${item.file}" alt="${item.name}" class="vector-thumb-img" loading="lazy" />`;

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

  // Calcular un ángulo disponible para evitar encimar elementos
  const existingAngles = studio.items.filter(i => i.type === 'icon').map(i => i.angle);
  let newAngle = 90; // Abajo por defecto
  if (existingAngles.includes(90)) {
    if (!existingAngles.includes(180)) newAngle = 180;
    else if (!existingAngles.includes(0)) newAngle = 0;
    else if (!existingAngles.includes(150)) newAngle = 150;
    else if (!existingAngles.includes(30)) newAngle = 30;
    else newAngle = (existingAngles[existingAngles.length - 1] + 45) % 360;
  }

  const newItem = {
    id: 'icon_' + Date.now(),
    type: 'icon',
    graphicId: itemId,
    name: itemDef.name,
    file: itemDef.file,
    angle: newAngle,
    radius: STUDIO_CONFIG.rRing,
    rotation: 0,
    scale: 1.0
  };

  studio.items.push(newItem);
  studio.activeItemId = newItem.id;
  renderVirolaCanvas();
  updateActiveItemFloatingBar();

  showNotificationToast(`"${itemDef.name}" agregado a la virola`, 'fa-circle-check');
}

// Aplicar Frase a la virola de forma curva y limpia
function applyPhraseToVirola(phraseText) {
  studio.textInput = phraseText;
  const textInput = document.getElementById('studio-text-input');
  if (textInput) textInput.value = phraseText;
  const counter = document.getElementById('studio-text-counter');
  if (counter) counter.textContent = `${phraseText.length}/35`;

  // Buscar si ya existe texto curvo
  let existing = studio.items.find(i => i.type === 'text' && i.arcPosition === studio.arcPosition);
  if (existing) {
    existing.text = phraseText;
    existing.offset = 50;
    studio.activeItemId = existing.id;
  } else {
    const newItem = {
      id: 'text_' + Date.now(),
      type: 'text',
      text: phraseText,
      font: studio.selectedFont,
      fontSize: studio.fontSize,
      arcPosition: studio.arcPosition,
      offset: 50
    };
    studio.items.push(newItem);
    studio.activeItemId = newItem.id;
  }

  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  showNotificationToast(`Frase "${phraseText}" aplicada al arco`, 'fa-font');
}

// ==========================================================================
// 7. SUBIR IMAGEN PROPIA (VECTORIZACIÓN AUTOMÁTICA Y REMOCIÓN DE FONDO)
// ==========================================================================
function handleCustomImageUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  showNotificationToast('Procesando y vectorizando diseño...', 'fa-wand-magic-sparkles');

  const reader = new FileReader();
  reader.onload = (event) => {
    const rawData = event.target?.result;

    // Si ya es un archivo vectorial SVG, usar directamente
    if (file.type === 'image/svg+xml') {
      const newItem = {
        id: 'icon_custom_' + Date.now(),
        type: 'icon',
        graphicId: 'custom',
        name: file.name.replace(/\.[^/.]+$/, ''),
        file: rawData,
        angle: 90,
        radius: STUDIO_CONFIG.rRing,
        rotation: 0,
        scale: 1.05
      };
      studio.items.push(newItem);
      studio.activeItemId = newItem.id;
      renderVirolaCanvas();
      updateActiveItemFloatingBar();
      showNotificationToast(`Vector "${newItem.name}" cargado en la virola`, 'fa-circle-check');
      return;
    }

    // Para imágenes rasterizadas (PNG, JPG, WebP), vectorizar y remover fondo via Canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxDim = 600;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Muestrear las esquinas para determinar color de fondo predominante
      const corners = [0, (w - 1) * 4, ((h - 1) * w) * 4, ((h - 1) * w + (w - 1)) * 4];
      let bgR = 0, bgG = 0, bgB = 0, count = 0;
      corners.forEach(idx => {
        if (data[idx + 3] > 40) {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
          count++;
        }
      });
      if (count > 0) {
        bgR /= count; bgG /= count; bgB /= count;
      } else {
        bgR = 255; bgG = 255; bgB = 255;
      }
      const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
      const isLightBg = bgLum > 120;

      // Binarización inteligente y recorte de fondo para grabado láser orfebre
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 30) {
          data[i + 3] = 0;
          continue;
        }

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const distToBg = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

        // Si es fondo (cercano al tono del fondo o blanco en fondos claros)
        if (distToBg < 55 || (isLightBg && lum > 200) || (!isLightBg && lum < 40)) {
          data[i + 3] = 0; // Transparencia total
        } else {
          // Motivo gráfico: convertir a grabado láser negro orfebre (#120e0a)
          let edgeAlpha = 255;
          if (distToBg < 80) {
            edgeAlpha = Math.min(255, Math.max(0, Math.round(((distToBg - 55) / 25) * 255)));
          }
          data[i] = 18;
          data[i + 1] = 14;
          data[i + 2] = 10;
          data[i + 3] = Math.min(a, edgeAlpha);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const vectorizedDataUrl = canvas.toDataURL('image/png');

      const newItem = {
        id: 'icon_custom_' + Date.now(),
        type: 'icon',
        graphicId: 'custom',
        name: file.name.replace(/\.[^/.]+$/, ''),
        file: vectorizedDataUrl,
        angle: 90,
        radius: STUDIO_CONFIG.rRing,
        rotation: 0,
        scale: 1.1
      };

      studio.items.push(newItem);
      studio.activeItemId = newItem.id;
      renderVirolaCanvas();
      updateActiveItemFloatingBar();
      showNotificationToast(`"${newItem.name}" vectorizado y listo sin fondo ✨`, 'fa-circle-check');
    };
    img.src = rawData;
  };
  reader.readAsDataURL(file);
}

// ==========================================================================
// 8. RENDERIZADO DEL CANVAS SVG DE LA VIROLA CIRCULAR INTERACTIVA
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
      <circle cx="${cx}" cy="${cy}" r="${rRing + 32}" fill="none" stroke="rgba(30, 20, 15, 0.6)" stroke-width="1.8" />
    `;
  } else if (studio.circularLines === 'doble') {
    circularLinesHtml = `
      <circle cx="${cx}" cy="${cy}" r="${rRing + 38}" fill="none" stroke="rgba(30, 20, 15, 0.65)" stroke-width="1.8" />
      <circle cx="${cx}" cy="${cy}" r="${rRing + 26}" fill="none" stroke="rgba(30, 20, 15, 0.5)" stroke-width="1.4" />
    `;
  }

  // Trazados de textos curvos (con soporte drag polar y offset)
  let textsHtml = '';
  const textItems = studio.items.filter(i => i.type === 'text');
  textItems.forEach(t => {
    const isTop = t.arcPosition === 'top';
    const pathId = isTop ? 'arc-top-path' : 'arc-bottom-path';
    const isActive = t.id === studio.activeItemId;
    const offsetVal = t.offset !== undefined ? t.offset : 50;

    textsHtml += `
      <g class="virola-text-group ${isActive ? 'active-text-item' : ''}" 
         data-item-id="${t.id}"
         onmousedown="startTextDrag('${t.id}', event)"
         ontouchstart="startTextDrag('${t.id}', event)">
        <text font-family="'${t.font}', serif" 
              font-size="${t.fontSize || 22}" 
              font-weight="800" 
              letter-spacing="2px"
              fill="#120e0a"
              style="cursor: grab;"
              class="virola-curved-text ${isActive ? 'active-text-element' : ''}"
              data-item-id="${t.id}">
          <textPath href="#${pathId}" xlink:href="#${pathId}" startOffset="${offsetVal}%" text-anchor="middle">
            ${escapeHtml(t.text)}
          </textPath>
        </text>
      </g>
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

    const contentHtml = `<image href="${item.file}" x="${-halfSize}" y="${-halfSize}" width="${baseSize * scale}" height="${baseSize * scale}" preserveAspectRatio="xMidYMid meet" />`;

    // Handles interactivos fijos y estables (con rotación contraria para evitar saltos locos)
    let handlesHtml = '';
    if (isActive) {
      const handleOffset = halfSize + 14;
      handlesHtml = `
        <!-- Anillo selector punteado -->
        <circle cx="0" cy="0" r="${halfSize + 8}" fill="none" stroke="#c59b27" stroke-width="1.8" stroke-dasharray="4,4" />

        <!-- Handle de Rotación (Azul, Arriba) con contra-rotación para mantenerse siempre fijo -->
        <g class="virola-handle handle-rotate" data-handle="rotate" data-item-id="${item.id}" transform="rotate(${-rot}) translate(0, ${-handleOffset})">
          <circle cx="0" cy="0" r="11" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
          <path d="M-4 -2 A 4 4 0 1 1 4 2 M2 4 L4 2 L2 0" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
        </g>

        <!-- Handle de Escala (Verde, Abajo-Derecha) -->
        <g class="virola-handle handle-scale" data-handle="scale" data-item-id="${item.id}" transform="rotate(${-rot}) translate(${handleOffset * 0.75}, ${handleOffset * 0.75})">
          <circle cx="0" cy="0" r="11" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
          <path d="M-3 3 L3 -3 M0 -3 L3 -3 L3 0 M0 3 L-3 3 L-3 0" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
        </g>

        <!-- Handle de Eliminación (Rojo, Arriba-Izquierda) -->
        <g class="virola-handle handle-delete" data-handle="delete" data-item-id="${item.id}" transform="rotate(${-rot}) translate(${-handleOffset * 0.75}, ${-handleOffset * 0.75})" onclick="deleteVirolaItem('${item.id}', event)">
          <circle cx="0" cy="0" r="11" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
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
    <circle cx="${cx}" cy="${cy}" r="${rInner - 18}" fill="#162212" opacity="0.85" />
    <circle cx="${cx}" cy="${cy}" r="${rInner - 22}" fill="none" stroke="#25381e" stroke-width="3" stroke-dasharray="3,4" opacity="0.7" />
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
// 9. INTERACCIÓN Y MANIPULACIÓN (DRAG DE TEXTOS Y DISEÑOS, ROTATE, SCALE, DELETE)
// ==========================================================================
function selectVirolaItem(itemId, e) {
  if (e) e.stopPropagation();
  studio.activeItemId = itemId;
  renderVirolaCanvas();
  updateActiveItemFloatingBar();
}

function deleteVirolaItem(itemId, e) {
  if (e) e.stopPropagation();
  studio.items = studio.items.filter(i => i.id !== itemId);
  if (studio.activeItemId === itemId) {
    studio.activeItemId = null;
  }
  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  showNotificationToast('Elemento eliminado de la virola', 'fa-trash');
}

function deleteActiveVirolaItem() {
  if (!studio.activeItemId) return;
  deleteVirolaItem(studio.activeItemId);
}

// Iniciar arrastre de texto a lo largo del arco
function startTextDrag(itemId, e) {
  e.preventDefault();
  e.stopPropagation();

  const item = studio.items.find(i => i.id === itemId);
  if (!item) return;

  studio.activeItemId = itemId;
  studio.dragMode = 'text_move';
  studio.dragItemId = itemId;

  const coords = getPointerCoords(e);
  studio.dragStart = {
    x: coords.x,
    y: coords.y,
    itemOffset: item.offset || 50
  };

  renderVirolaCanvas();
  updateActiveItemFloatingBar();
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

  if (handleType === 'delete') {
    deleteVirolaItem(itemId, e);
    return;
  }

  const coords = getPointerCoords(e);

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
  updateActiveItemFloatingBar();
}

function initCanvasInteraction() {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg) return;

  // Deseleccionar al hacer clic en el fondo del SVG
  svg.addEventListener('click', (e) => {
    if (!e.target.closest('.virola-sticker-group') && !e.target.closest('.virola-curved-text') && !e.target.closest('.virola-handle')) {
      studio.activeItemId = null;
      renderVirolaCanvas();
      updateActiveItemFloatingBar();
    }
  });

  // Movimiento global de puntero
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

  if (studio.dragMode === 'text_move') {
    // Desplazar texto a lo largo del arco de la virola
    const dx = coords.x - cx;
    const dy = coords.y - cy;
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;

    // Si el texto está en curva superior (195° a 345°)
    if (item.arcPosition === 'top') {
      let pct = ((angleDeg - 195) / (345 - 195)) * 100;
      pct = Math.max(10, Math.min(90, pct));
      item.offset = Math.round(pct);
    } else {
      // Curva inferior (15° a 165°)
      let pct = ((angleDeg - 15) / (165 - 15)) * 100;
      pct = Math.max(10, Math.min(90, pct));
      item.offset = Math.round(pct);
    }
    renderVirolaCanvas();
  } else if (studio.dragMode === 'move') {
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
    renderVirolaCanvas();
    updateActiveItemFloatingBar();
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

// ==========================================================================
// 10. BARRA FLOTANTE DE ACCIONES RÁPIDAS DEL ELEMENTO ACTIVO
// ==========================================================================
function updateActiveItemFloatingBar() {
  const bar = document.getElementById('virola-active-item-controls');
  const badge = document.getElementById('active-item-name-badge');
  if (!bar) return;

  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';
  if (badge) {
    if (item.type === 'text') {
      badge.innerHTML = `<i class="fas fa-font"></i> Texto: "${item.text}"`;
    } else {
      badge.innerHTML = `<i class="fas fa-shield"></i> ${item.name || 'Diseño'}`;
    }
  }
}

function stepItemScale(delta) {
  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) return;

  if (item.type === 'text') {
    item.fontSize = Math.max(14, Math.min(32, (item.fontSize || 22) + Math.round(delta * 20)));
  } else {
    const cur = item.scale || 1.0;
    item.scale = parseFloat(Math.max(STUDIO_CONFIG.minScale, Math.min(STUDIO_CONFIG.maxScale, cur + delta)).toFixed(2));
  }
  renderVirolaCanvas();
}

function stepItemRotation(degDelta) {
  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) return;

  if (item.type === 'text') {
    // Mover texto a lo largo del arco
    item.offset = Math.max(10, Math.min(90, (item.offset || 50) + (degDelta > 0 ? 5 : -5)));
  } else {
    item.rotation = ((item.rotation || 0) + degDelta) % 360;
  }
  renderVirolaCanvas();
}

// ==========================================================================
// 11. CENTRADO Y DISTRIBUCIÓN AUTOMÁTICA PROFESIONAL DE LA VIROLA
// ==========================================================================
function autoCenterAndBalanceVirola() {
  // 1. Centrar todos los textos curvos
  const textItems = studio.items.filter(i => i.type === 'text');
  textItems.forEach(t => {
    t.offset = 50; // Exactamente al centro del arco
  });

  // 2. Distribuir y alinear todos los íconos/escudos
  const iconItems = studio.items.filter(i => i.type === 'icon');
  const count = iconItems.length;

  if (count === 1) {
    // Si hay texto superior, colocar el ícono abajo centrado (90°)
    const hasTopText = textItems.some(t => t.arcPosition === 'top');
    iconItems[0].angle = hasTopText ? 90 : 270;
    iconItems[0].rotation = 0;
    iconItems[0].radius = STUDIO_CONFIG.rRing;
    iconItems[0].scale = 1.05;
  } else if (count === 2) {
    // Colocación simétrica izquierda (180°) y derecha (0°)
    iconItems[0].angle = 180;
    iconItems[0].rotation = 0;
    iconItems[0].radius = STUDIO_CONFIG.rRing;
    iconItems[0].scale = 1.0;

    iconItems[1].angle = 0;
    iconItems[1].rotation = 0;
    iconItems[1].radius = STUDIO_CONFIG.rRing;
    iconItems[1].scale = 1.0;
  } else if (count === 3) {
    // 3 motivos: izquierda inferior (150°), base central (90°), derecha inferior (30°)
    iconItems[0].angle = 150;
    iconItems[0].rotation = 0;
    iconItems[0].radius = STUDIO_CONFIG.rRing;
    iconItems[0].scale = 0.95;

    iconItems[1].angle = 90;
    iconItems[1].rotation = 0;
    iconItems[1].radius = STUDIO_CONFIG.rRing;
    iconItems[1].scale = 1.0;

    iconItems[2].angle = 30;
    iconItems[2].rotation = 0;
    iconItems[2].radius = STUDIO_CONFIG.rRing;
    iconItems[2].scale = 0.95;
  } else if (count >= 4) {
    // Distribuir armónicamente en el perímetro
    const step = 360 / count;
    iconItems.forEach((item, idx) => {
      item.angle = Math.round((90 + idx * step) % 360);
      item.rotation = 0;
      item.radius = STUDIO_CONFIG.rRing;
      item.scale = 0.9;
    });
  }

  studio.activeItemId = null;
  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  showNotificationToast('Elementos centrados y distribuidos armónicamente ✨', 'fa-crosshairs');
}

function resetVirolaStudio() {
  studio.items = [];
  studio.activeItemId = null;
  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  showNotificationToast('Virola reiniciada limpia', 'fa-rotate-left');
}

// ==========================================================================
// 12. PASO 3: CONFIRMACIÓN, VECTOR DOWNLOAD & CARRITO
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
