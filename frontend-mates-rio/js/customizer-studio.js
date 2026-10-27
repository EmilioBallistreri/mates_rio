// ==========================================================================
// MATES RÍO: ESTUDIO DE PERSONALIZACIÓN PROFESIONAL 360°
// Motor CAD estilo Ribbon (Word / Paint) con visualización 2D CNC y 3D 360°
// Soporte para Mates Imperiales, Termos de Acero y Cajas Materas Premium.
// Libertad absoluta de textos, tipografías, íconos y logos sin restricciones.
// ==========================================================================

const STUDIO_CONFIG = {
  cx: 250,
  cy: 250,
  rInner: 162,   // Boca interior calabaza real
  rRing: 197,    // Centro exacto del metal (radio medio virola)
  rOuter: 232,   // Corona de alpaca maciza (ancho 70px real)
  minScale: 0.15,
  maxScale: 12.0 // Libertad total de escala: puede abarcar toda la superficie
};

// Catálogo de Productos Personalizables
const PRODUCTS_CATALOG = {
  mate: {
    id: 'mate',
    name: 'Mate Imperial',
    defaultModel: 'mate-1',
    surfaceName: 'Corona de Alpaca Maciza (Ancho 70mm)',
    models: [
      { id: 'mate-1', name: 'Mate Imperial Cuero Negro & Virola Cincelada', price: 46500, image: 'assets/images/prod_mate_imperial.jpg' },
      { id: 'mate-2', name: 'Mate Torpedo Uruguayo Cuero Tostado', price: 34200, image: 'assets/images/cat_mates.jpg' },
      { id: 'mate-3', name: 'Mate Camionero Cuero Crudo', price: 36800, image: 'assets/images/banner_1.jpg' },
      { id: 'mate-4', name: 'Mate Imperial Deluxe Base Esculpida', price: 52000, image: 'assets/images/prod_mate_imperial.jpg' }
    ]
  },
  termo: {
    id: 'termo',
    name: 'Termo de Acero Inoxidable',
    defaultModel: 'termo-1',
    surfaceName: 'Cuerpo Cilíndrico Acero Inox 1L (Grabado 360°)',
    models: [
      { id: 'termo-1', name: 'Termo Media Manija Cuero Acero Inox 1L', price: 42900, image: 'assets/images/cat_termos.jpg' },
      { id: 'termo-2', name: 'Termo Acero Negro Matte Black 1L', price: 44500, image: 'assets/images/banner_2.jpg' },
      { id: 'termo-3', name: 'Termo Stanley Clásico 1L Doble Capa', price: 48900, image: 'assets/images/prod_termo_stanley.jpg' }
    ]
  },
  caja: {
    id: 'caja',
    name: 'Caja Matera Premium',
    defaultModel: 'caja-1',
    surfaceName: 'Tapa de Madera Maciza para Regalo (Pirograbado Láser)',
    models: [
      { id: 'caja-1', name: 'Caja Matera Nogal Maciza para Regalo', price: 32000, image: 'assets/images/prod_canasta_matera.jpg' },
      { id: 'caja-2', name: 'Caja Madera Negra con Herrajes de Bronce', price: 35500, image: 'assets/images/cat_equipos.jpg' },
      { id: 'caja-3', name: 'Cofre Matero Artesanal de Lujo', price: 38000, image: 'assets/images/prod_canasta_matera.jpg' }
    ]
  }
};

// Estado central del estudio
const studio = {
  activeProduct: 'mate', // 'mate' | 'termo' | 'caja'
  activeRibbonTab: 'text', // 'product' | 'text' | 'icons' | 'upload' | 'lines' | 'finish'
  viewMode: '2d', // '2d' | '360'
  rotation360: 0,
  isAutoRotating: false,
  autoRotateTimer: null,
  
  selectedMateId: 'mate-1',
  metalFinish: 'alpaca', // 'alpaca' | 'acero'
  purchaseType: 'web', // 'web' | 'local'
  circularLines: 'doble', // 'no' | 'simple' | 'doble'
  
  // Opciones de asistencia CAD
  snappingEnabled: true,
  clipToMetal: true,
  activeGuides: { v: false, h: false, ring: false, angle: null },

  // Capas de personalización (textos, escudos, logos e imágenes)
  activeItemId: null,
  items: [],

  // Preferencias
  selectedFont: 'Cinzel',
  activeCategory: 'deportes',
  notes: '',

  // Transformación interactiva en 2D
  dragMode: null, // 'move' | 'scale' | 'rotate'
  dragItemId: null,
  dragStart: { x: 0, y: 0, itemX: 0, itemY: 0, itemAngle: 0, itemRadius: 197, itemScale: 1, itemRotation: 0, pointerAngle: 0 },

  // Interacción orbital 360°
  is360Dragging: false,
  pitch360: 20,
  drag360StartX: 0,
  drag360StartY: 0,
  drag360StartAngle: 0,
  drag360StartPitch: 20,
  drag360Mode: null, // 'camera' | 'item'
  drag360ItemId: null,
  drag360ItemStartX: 0,
  drag360ItemStartY: 0,
  drag360ItemStartAngle: 0,
  drag360ItemStartPos: { x: 250, y: 250 },
  projected360Items: []
};

// Biblioteca de Diseños Vectoriales
const VECTOR_CATEGORIES = {
  deportes: {
    name: '🏆 Escudos Deportivos',
    items: [
      { id: 'afa', name: 'AFA 3 Estrellas', file: 'assets/images/designs/afa.svg' },
      { id: 'boca', name: 'Boca Juniors', file: 'assets/images/designs/boca.svg' },
      { id: 'river', name: 'River Plate', file: 'assets/images/designs/river.svg' },
      { id: 'central', name: 'Rosario Central', file: 'assets/images/designs/central.svg' },
      { id: 'newells', name: "Newell's Old Boys", file: 'assets/images/designs/newells.svg' },
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
      { id: 'escarapela', name: 'Escarapela Argentina', file: 'assets/images/designs/escarapela.svg' },
      { id: 'ceibo', name: 'Flor de Ceibo Nacional', file: 'assets/images/designs/ceibo.svg' },
      { id: 'mate_icono', name: 'Mate Tradicional Imperial', file: 'assets/images/designs/mate.svg' },
      { id: 'cruz', name: 'Cruz Criolla Gauchesca', file: 'assets/images/designs/cruz.svg' },
      { id: 'caballo', name: 'Caballo Criollo', file: 'assets/images/designs/caballo.svg' },
      { id: 'guardapampa', name: 'Guarda Pampa', file: 'assets/images/designs/guardapampa.svg' },
      { id: 'malvinas', name: 'Islas Malvinas', file: 'assets/images/designs/malvinas.svg' },
      { id: 'mapa', name: 'Silueta Argentina', file: 'assets/images/designs/mapa.svg' }
    ]
  },
  fauna: {
    name: '🦅 Fauna & Naturaleza',
    items: [
      { id: 'condor', name: 'Cóndor Andino', file: 'assets/images/designs/condor.svg' },
      { id: 'hornero', name: 'Hornero Nacional', file: 'assets/images/designs/hornero.svg' },
      { id: 'carpincho', name: 'Carpincho', file: 'assets/images/designs/carpincho.svg' },
      { id: 'guanaco', name: 'Guanaco Criollo', file: 'assets/images/designs/guanaco.svg' },
      { id: 'ciervo', name: 'Ciervo de los Pantanos', file: 'assets/images/designs/ciervo.svg' }
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
      { id: 'corona', name: 'Corona Imperial', file: 'assets/images/designs/corona.svg' },
      { id: 'laurel', name: 'Corona de Laureles', file: 'assets/images/designs/laurel.svg' },
      { id: 'estrella_fed', name: 'Estrella Federal', file: 'assets/images/designs/estrella_fed.svg' },
      { id: 'infinito', name: 'Infinito Eterno', file: 'assets/images/designs/infinito.svg' },
      { id: 'corazon', name: 'Corazón de Gaucho', file: 'assets/images/designs/corazon.svg' }
    ]
  }
};

// Tipografías Orfebres de Lujo
const GOOGLE_FONTS = [
  { id: 'Cinzel', name: 'Cinzel' },
  { id: 'Cinzel Decorative', name: 'Cinzel Decorative' },
  { id: 'Playfair Display', name: 'Playfair Display' },
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond' },
  { id: 'Lora', name: 'Lora' },
  { id: 'Montserrat', name: 'Montserrat' },
  { id: 'Lato', name: 'Lato' },
  { id: 'Dancing Script', name: 'Dancing Script' },
  { id: 'Great Vibes', name: 'Great Vibes' },
  { id: 'Alex Brush', name: 'Alex Brush' },
  { id: 'Parisienne', name: 'Parisienne' },
  { id: 'Pinyon Script', name: 'Pinyon Script' },
  { id: 'Sacramento', name: 'Sacramento' },
  { id: 'Satisfy', name: 'Satisfy' },
  { id: 'Italianno', name: 'Italianno' },
  { id: 'Rochester', name: 'Rochester' },
  { id: 'Marck Script', name: 'Marck Script' },
  { id: 'Abril Fatface', name: 'Abril Fatface' },
  { id: 'Bebas Neue', name: 'Bebas Neue' },
  { id: 'Outfit', name: 'Outfit' },
  { id: 'Poppins', name: 'Poppins' },
  { id: 'Oswald', name: 'Oswald' },
  { id: 'Rye', name: 'Rye' },
  { id: 'Pirata One', name: 'Pirata One' },
  { id: 'UnifrakturMaguntia', name: 'UnifrakturMaguntia' }
];

// ==========================================================================
// 1. INICIALIZACIÓN DEL ESTUDIO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initStudioEngine();
});

function initStudioEngine() {
  // 1. Detectar producto de URL si existe (?product=termo o ?product=caja)
  const urlParams = new URLSearchParams(window.location.search);
  const prodFromUrl = urlParams.get('product') || urlParams.get('categoria') || urlParams.get('tipo');
  if (prodFromUrl && PRODUCTS_CATALOG[prodFromUrl]) {
    studio.activeProduct = prodFromUrl;
  }
  const mateFromUrl = urlParams.get('mate') || urlParams.get('id');
  if (mateFromUrl) {
    studio.selectedMateId = mateFromUrl;
  }

  // 2. Renderizar componentes del Ribbon
  renderProductSelectorCardsUI();
  renderModelsDropdown();
  renderRibbonFontDropdown();
  renderRibbonQuickDesigns('deportes');
  renderModalCatalogGrid('all');

  // 3. Cargar plantilla inicial por defecto si está vacío
  if (studio.items.length === 0) {
    applyDefaultProductTemplate();
  }

  // 4. Iniciar eventos del lienzo
  initCanvasInteraction();
  init360CanvasEvents();

  // 5. Renderizado inicial
  renderVirolaCanvas();
  renderTextLayersUI();
  updateStageBadge();
  updatePriceDisplay();
}

// ==========================================================================
// 2. NAVEGACIÓN Y TABS DEL RIBBON (WORD / PAINT CAD)
// ==========================================================================
function switchRibbonTab(tabKey) {
  studio.activeRibbonTab = tabKey;
  
  // Actualizar botones de pestaña
  document.querySelectorAll('.ribbon-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });

  // Mostrar panel correspondiente
  document.querySelectorAll('.ribbon-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.getAttribute('data-panel') === tabKey);
  });

  // Cerrar dropdown de fuentes si estuviera abierto
  const fontDropdown = document.getElementById('ribbon-font-dropdown');
  if (fontDropdown) fontDropdown.classList.remove('open');
}

// Compatibilidad con llamadas legacy
function switchStudioTab(tabKey) {
  switchRibbonTab(tabKey);
}

// Alternar dropdown de fuentes (ITEM 3: POPUP PROFESIONAL ELEGANTE Y POSICIONADO)
function toggleRibbonFontDropdown() {
  const fontDropdown = document.getElementById('ribbon-font-dropdown');
  const btn = document.getElementById('ribbon-font-select-btn');
  if (!fontDropdown || !btn) return;

  const isOpen = fontDropdown.classList.contains('open');
  if (isOpen) {
    fontDropdown.classList.remove('open');
    fontDropdown.style.display = 'none';
  } else {
    renderRibbonFontDropdown();
    const rect = btn.getBoundingClientRect();
    fontDropdown.style.top = `${rect.bottom + 8}px`;
    fontDropdown.style.left = `${Math.max(10, Math.min(window.innerWidth - 305, rect.left))}px`;
    fontDropdown.style.display = 'block';
    fontDropdown.classList.add('open');
  }
}

function renderRibbonFontDropdown() {
  const container = document.getElementById('ribbon-font-dropdown');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 6px 10px 10px; border-bottom: 1px solid rgba(197, 155, 39, 0.25); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 0.76rem; font-weight: 800; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.8px;">
        <i class="fas fa-font" style="margin-right: 6px;"></i>Tipografías Orfebres
      </span>
      <span style="font-size: 0.68rem; color: var(--text-muted);">${GOOGLE_FONTS.length} estilos</span>
    </div>
    ${GOOGLE_FONTS.map(f => {
      const isSel = studio.selectedFont === f.id;
      return `
        <div class="ribbon-font-item ${isSel ? 'selected' : ''}" 
             onclick="selectStudioFont('${f.id}')" 
             style="font-family: '${f.id}', serif;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.95rem; font-weight: 700;">${f.name}</span>
            <span style="font-size: 0.72rem; opacity: 0.65; letter-spacing: 0.5px;">Mates Río 1810</span>
          </div>
          ${isSel ? '<i class="fas fa-check" style="color: #120e0a; font-size: 0.85rem;"></i>' : ''}
        </div>
      `;
    }).join('')}
  `;
}

function selectStudioFont(fontId) {
  studio.selectedFont = fontId;
  const activeText = studio.items.find(i => i.id === studio.activeItemId && i.type === 'text');
  if (activeText) {
    activeText.font = fontId;
  }

  // Actualizar badge visible en el botón del Ribbon
  const badge = document.getElementById('active-text-font-badge');
  if (badge) {
    badge.textContent = fontId;
    badge.style.fontFamily = `'${fontId}', serif`;
  }

  // Cerrar dropdown
  const fontDropdown = document.getElementById('ribbon-font-dropdown');
  if (fontDropdown) {
    fontDropdown.classList.remove('open');
    fontDropdown.style.display = 'none';
  }

  renderRibbonFontDropdown();
  renderVirolaCanvas();
  renderTextLayersUI();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast(`Tipografía aplicada: ${fontId}`, 'fa-font');
}

// ==========================================================================
// 3. ELECCIÓN DE PRODUCTO: MATE, TERMO O CAJA (ITEM 6)
// ==========================================================================
function switchActiveProduct(prodKey) {
  if (!PRODUCTS_CATALOG[prodKey]) return;
  studio.activeProduct = prodKey;
  const prodDef = PRODUCTS_CATALOG[prodKey];
  studio.selectedMateId = prodDef.defaultModel;

  // Actualizar Cards interactivas
  renderProductSelectorCardsUI();

  // Actualizar botones de producto en el Ribbon
  document.querySelectorAll('[data-prod-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-prod-btn') === prodKey);
  });

  // Actualizar Dropdown de modelos
  renderModelsDropdown();
  updateStageBadge();
  updatePriceDisplay();

  // Adaptar o rebalancear elementos
  autoCenterAndBalanceVirola();
  renderVirolaCanvas();
  if (studio.viewMode === '360') render360Canvas();

  showNotificationToast(`Personalizando: ${prodDef.name}`, 'fa-cube');
}

function renderProductSelectorCardsUI() {
  document.querySelectorAll('.prod-select-card').forEach(card => {
    const p = card.getAttribute('data-product');
    card.classList.toggle('active', p === studio.activeProduct);
  });
}

function renderModelsDropdown() {
  const select = document.getElementById('mate-model-select');
  if (!select) return;

  const currentProd = PRODUCTS_CATALOG[studio.activeProduct];
  if (!currentProd) return;

  select.innerHTML = currentProd.models.map(m => `
    <option value="${m.id}" ${m.id === studio.selectedMateId ? 'selected' : ''}>
      ${m.name} - $ ${m.price.toLocaleString('es-AR')}
    </option>
  `).join('');
}

function onMateModelChange(modelId) {
  studio.selectedMateId = modelId;
  updatePriceDisplay();
  if (studio.viewMode === '360') render360Canvas();
}

function updateStageBadge() {
  const badgeText = document.getElementById('stage-status-text');
  if (!badgeText) return;

  const prod = PRODUCTS_CATALOG[studio.activeProduct];
  if (studio.viewMode === '360') {
    badgeText.textContent = `VISTA INTERACTIVA 360° • ${prod.name.toUpperCase()} (ARRASTRÁ PARA GIRAR)`;
  } else {
    badgeText.textContent = `${prod.surfaceName.toUpperCase()} • ESCALA 1:1 CNC`;
  }
}

function updatePriceDisplay() {
  const prod = PRODUCTS_CATALOG[studio.activeProduct];
  if (!prod) return;
  const currentModel = prod.models.find(m => m.id === studio.selectedMateId) || prod.models[0];
  const priceStr = `$ ${currentModel.price.toLocaleString('es-AR')}`;

  const priceEl = document.getElementById('confirm-mate-price');
  if (priceEl) priceEl.textContent = priceStr;
  const mobilePriceEl = document.getElementById('mobile-bar-price');
  if (mobilePriceEl) mobilePriceEl.textContent = priceStr;
  const countEl = document.getElementById('confirm-items-count');
  if (countEl) countEl.textContent = `${studio.items.length} elemento(s)`;
}

// ==========================================================================
// 4. ALTERNANCIA ENTRE VISTA 2D CNC Y VISTA 360° INTERACTIVA (ITEM 6)
// ==========================================================================
function setStudioViewMode(mode) {
  studio.viewMode = mode;

  // Botones en el lienzo
  const btn2d = document.getElementById('stage-btn-2d');
  const btn360 = document.getElementById('stage-btn-360');
  if (btn2d) btn2d.classList.toggle('active', mode === '2d');
  if (btn360) btn360.classList.toggle('active', mode === '360');

  // Botones en el Ribbon
  const ribbon2d = document.getElementById('ribbon-view-2d-btn');
  const ribbon360 = document.getElementById('ribbon-view-360-btn');
  if (ribbon2d) ribbon2d.classList.toggle('active', mode === '2d');
  if (ribbon360) ribbon360.classList.toggle('active', mode === '360');

  // Viewports
  const vp2d = document.getElementById('studio-2d-viewport');
  const vp360 = document.getElementById('studio-360-viewport');
  if (vp2d) vp2d.style.display = mode === '2d' ? 'flex' : 'none';
  if (vp360) vp360.style.display = mode === '360' ? 'flex' : 'none';

  updateStageBadge();

  if (mode === '360') {
    render360Canvas();
    showNotificationToast('Modo 360° interactivo activado. Arrastrá para girar.', 'fa-rotate');
  } else {
    stopAutoRotate();
    renderVirolaCanvas();
  }
}

// ==========================================================================
// 5. MOTOR DE CAPAS DE TEXTO LIBRES (SIN LÍMITES DE LONGITUD NI CANTIDAD, ITEM 5)
// ==========================================================================
function addNewTextBlock(initialText = '', preferredPos = null) {
  const { cx, cy, rRing } = STUDIO_CONFIG;
  const textItems = studio.items.filter(i => i.type === 'text');
  const count = textItems.length + 1;
  const defaultText = initialText || (count === 1 ? 'MATES RÍO' : (count === 2 ? 'TRADICIÓN & PASIÓN' : `TEXTO ${count}`));
  
  let pos = preferredPos || (count === 1 ? 'top' : (count === 2 ? 'bottom' : 'straight'));
  let angle = 270;
  let radius = rRing;

  if (pos === 'bottom') {
    angle = 90;
  } else if (pos === 'straight') {
    angle = count % 2 === 0 ? 90 : 270;
    radius = rRing - (count > 2 ? (count - 2) * 12 : 0);
  }

  const rad = (angle * Math.PI) / 180;
  const newItem = {
    id: 'text_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    type: 'text',
    text: defaultText,
    font: studio.selectedFont || 'Cinzel',
    fontSize: 22,
    arcPosition: pos,
    angle: angle,
    radius: radius,
    rotation: 0,
    scale: 1.0,
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad)
  };

  studio.items.push(newItem);
  studio.activeItemId = newItem.id;

  renderVirolaCanvas();
  renderTextLayersUI();
  updateActiveTextControls(newItem);
  updatePriceDisplay();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast(`Texto "${newItem.text}" agregado con éxito`, 'fa-font');
}

function renderTextLayersUI() {
  const container = document.getElementById('text-layers-container');
  if (!container) return;

  const textItems = studio.items.filter(i => i.type === 'text');
  if (textItems.length === 0) {
    container.innerHTML = `
      <span style="font-size: 0.74rem; color: var(--text-muted);">Sin capas de texto</span>
    `;
    updateActiveTextControls(null);
    return;
  }

  let activeText = textItems.find(i => i.id === studio.activeItemId);
  if (!activeText && textItems.length > 0) {
    activeText = textItems[0];
    studio.activeItemId = activeText.id;
  }

  container.innerHTML = textItems.map(item => {
    const isActive = item.id === studio.activeItemId;
    return `
      <button type="button" class="ribbon-btn ${isActive ? 'active' : ''}" 
              onclick="selectVirolaItem('${item.id}')" 
              title="Seleccionar capa: ${escapeHtml(item.text)}">
        <i class="fas fa-font" style="font-size: 0.7rem;"></i>
        <span>${escapeHtml(item.text.substring(0, 12)) || 'Texto'}</span>
      </button>
    `;
  }).join('');

  updateActiveTextControls(activeText);
}

function updateActiveTextControls(activeText) {
  const input = document.getElementById('active-text-input');
  const sizeInput = document.getElementById('active-text-size-input');
  const sizeSlider = document.getElementById('active-text-size-slider');
  const fontBadge = document.getElementById('active-text-font-badge');

  if (!activeText) {
    if (input) input.value = '';
    return;
  }

  if (input) input.value = activeText.text || '';
  if (sizeInput) sizeInput.value = activeText.fontSize || 22;
  if (sizeSlider) sizeSlider.value = activeText.fontSize || 22;
  if (fontBadge) {
    fontBadge.textContent = activeText.font || 'Cinzel';
    fontBadge.style.fontFamily = `'${activeText.font || 'Cinzel'}', serif`;
  }

  // Actualizar botones de curvatura
  document.querySelectorAll('.active-text-curve-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-pos') === activeText.arcPosition);
  });
}

// Redacción libre sin límites de longitud (Item 5)
function onActiveTextInput(val) {
  let activeText = studio.items.find(i => i.id === studio.activeItemId && i.type === 'text');
  if (!activeText) {
    addNewTextBlock(val || 'NUEVO TEXTO', 'top');
    return;
  }

  activeText.text = val;
  renderVirolaCanvas();
  renderTextLayersUI();
  updateActiveItemFloatingBar();
  if (studio.viewMode === '360') render360Canvas();
}

function clearActiveText() {
  const activeText = studio.items.find(i => i.id === studio.activeItemId && i.type === 'text');
  if (!activeText) return;
  activeText.text = '';
  const input = document.getElementById('active-text-input');
  if (input) input.value = '';
  renderVirolaCanvas();
  renderTextLayersUI();
  if (studio.viewMode === '360') render360Canvas();
}

function setActiveTextCurvature(pos) {
  const activeText = studio.items.find(i => i.id === studio.activeItemId && i.type === 'text');
  if (!activeText) return;

  activeText.arcPosition = pos;
  if (pos === 'top' && (activeText.angle > 45 && activeText.angle < 135)) {
    activeText.angle = 270;
  } else if (pos === 'bottom' && (activeText.angle > 225 && activeText.angle < 315)) {
    activeText.angle = 90;
  }

  renderVirolaCanvas();
  renderTextLayersUI();
  updateActiveTextControls(activeText);
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast(`Curvatura: ${pos === 'top' ? 'Curva Arriba' : (pos === 'bottom' ? 'Curva Abajo' : 'Recto')}`, 'fa-arrows-rotate');
}

// Ajuste libre de tamaño de letra de 8px a 160px+ (Item 5)
function stepTextFontSize(delta) {
  const activeText = studio.items.find(i => i.id === studio.activeItemId && i.type === 'text');
  if (!activeText) return;

  const current = activeText.fontSize || 22;
  const newSize = Math.max(8, Math.min(160, current + delta));
  activeText.fontSize = newSize;

  updateActiveTextControls(activeText);
  renderVirolaCanvas();
  if (studio.viewMode === '360') render360Canvas();
}

function onActiveTextSizeChange(val) {
  const activeText = studio.items.find(i => i.id === studio.activeItemId && i.type === 'text');
  if (!activeText) return;

  const size = Math.max(8, Math.min(160, parseInt(val, 10) || 22));
  activeText.fontSize = size;

  updateActiveTextControls(activeText);
  renderVirolaCanvas();
  if (studio.viewMode === '360') render360Canvas();
}

// ==========================================================================
// 6. CATÁLOGO DE DISEÑOS, ESCUDOS Y LOGOS (ITEMS 2 & 5)
// ==========================================================================
function filterRibbonDesigns(catKey) {
  studio.activeCategory = catKey;

  document.querySelectorAll('[data-cat-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-cat-filter') === catKey);
  });

  renderRibbonQuickDesigns(catKey);
}


// ==========================================================================
// CARRUSEL Y SCROLL HORIZONTAL DE DISEÑOS RÁPIDOS
// ==========================================================================
function scrollRibbonDesigns(delta) {
  const container = document.getElementById('ribbon-quick-designs');
  if (!container) return;
  container.scrollBy({ left: delta, behavior: 'smooth' });
}

function initRibbonCarouselEvents() {
  const container = document.getElementById('ribbon-quick-designs');
  if (!container) return;

  // 1. Scroll horizontal con la rueda del mouse
  container.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      container.scrollLeft += (e.deltaY * 1.2);
    }
  }, { passive: false });

  // 2. Drag & Scroll horizontal con el cursor
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let hasMoved = false;

  container.addEventListener('mousedown', (e) => {
    isDown = true;
    hasMoved = false;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    container.classList.add('is-dragging');
  });

  window.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      container.classList.remove('is-dragging');
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX);
    if (Math.abs(walk) > 5) {
      hasMoved = true;
      e.preventDefault();
      container.scrollLeft = scrollLeft - walk;
    }
  });

  // Prevenir click accidental en un ícono si el usuario estaba desplazándose
  container.addEventListener('click', (e) => {
    if (hasMoved) {
      e.stopPropagation();
      e.preventDefault();
      hasMoved = false;
    }
  }, true);
}

function renderRibbonQuickDesigns(catKey) {
  const container = document.getElementById('ribbon-quick-designs');
  if (!container || !VECTOR_CATEGORIES[catKey]) return;

  container.scrollLeft = 0;
  const items = VECTOR_CATEGORIES[catKey].items;

  if (catKey === 'frases') {
    container.innerHTML = items.map(f => `
      <button type="button" class="ribbon-phrase-quick-btn" onclick="applyPhraseById('${f.id}')" title="Aplicar frase grabada">
        <i class="fas fa-quote-left" style="color: var(--accent-gold); font-size: 0.72rem;"></i> ${escapeHtml(f.name)}
      </button>
    `).join('');
    return;
  }

  // ITEM 2: ÚNICAMENTE ÍCONOS, SIN NINGÚN NOMBRE O TEXTO
  container.innerHTML = items.map(item => `
    <button type="button" class="ribbon-icon-quick-btn" onclick="addVectorToVirola('${item.id}', '${catKey}')" title="${item.name}">
      <img src="${item.file}" alt="${item.name}" loading="lazy" />
    </button>
  `).join('');
}

function applyPhraseById(phraseId) {
  const cat = VECTOR_CATEGORIES.frases;
  if (!cat) return;
  const item = cat.items.find(f => f.id === phraseId);
  if (item) {
    applyPhraseToVirola(item.text);
  }
}

function applyPhraseToVirola(phraseText) {
  let activeText = studio.items.find(i => i.id === studio.activeItemId && i.type === 'text');
  if (!activeText) {
    activeText = studio.items.find(i => i.type === 'text');
  }

  if (activeText) {
    activeText.text = phraseText;
    studio.activeItemId = activeText.id;
  } else {
    addNewTextBlock(phraseText, 'bottom');
    activeText = studio.items.find(i => i.id === studio.activeItemId);
  }

  // Mantener al usuario en la pestaña de Diseños para que pueda seguir agregando íconos y explorando

  const textInput = document.getElementById('active-text-input');
  if (textInput) {
    textInput.value = phraseText;
    if (studio.activeRibbonTab === 'text') textInput.focus();
  }

  renderVirolaCanvas();
  renderTextLayersUI();
  updateActiveItemFloatingBar();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast(`Frase aplicada: "${phraseText}"`, 'fa-quote-left');
}

function addVectorToVirola(itemId, catKey) {
  const cat = VECTOR_CATEGORIES[catKey || studio.activeCategory];
  if (!cat) return;
  const itemDef = cat.items.find(i => i.id === itemId);
  if (!itemDef) return;

  const { cx, cy, rRing } = STUDIO_CONFIG;
  const existingCount = studio.items.filter(i => i.type === 'icon').length;
  const suggestedAngles = [0, 180, 90, 45, 135, 225, 315];
  const angle = suggestedAngles[existingCount % suggestedAngles.length];
  const rad = (angle * Math.PI) / 180;

  const newItem = {
    id: 'icon_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    type: 'icon',
    graphicId: itemDef.id,
    name: itemDef.name,
    file: itemDef.file,
    angle: angle,
    radius: rRing,
    rotation: 0,
    scale: 1.0,
    x: cx + rRing * Math.cos(rad),
    y: cy + rRing * Math.sin(rad)
  };

  studio.items.push(newItem);
  studio.activeItemId = newItem.id;

  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  updatePriceDisplay();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast(`Diseño "${itemDef.name}" agregado a la pieza`, 'fa-shield-halved');
}

function applyPhraseToVirola(phraseText) {
  addNewTextBlock(phraseText, 'bottom');
}

// Modal de Catálogo Completo
function openDesignCatalogModal() {
  const modal = document.getElementById('design-catalog-modal');
  if (modal) {
    modal.classList.add('open');
    renderModalCatalogGrid('all');
  }
}

function closeDesignCatalogModal(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.closest('.ribbon-btn-icon-only')) return;
  const modal = document.getElementById('design-catalog-modal');
  if (modal) modal.classList.remove('open');
}

function filterModalCatalog(catKey) {
  document.querySelectorAll('.modal-cat-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-modal-cat') === catKey);
  });
  renderModalCatalogGrid(catKey);
}

function renderModalCatalogGrid(catKey) {
  const grid = document.getElementById('modal-designs-grid');
  if (!grid) return;

  let itemsToRender = [];
  if (catKey === 'all') {
    Object.keys(VECTOR_CATEGORIES).forEach(k => {
      if (k !== 'frases') itemsToRender.push(...VECTOR_CATEGORIES[k].items);
    });
  } else if (VECTOR_CATEGORIES[catKey]) {
    itemsToRender = VECTOR_CATEGORIES[catKey].items;
  }

  if (catKey === 'frases') {
    grid.innerHTML = itemsToRender.map(f => `
      <div class="vector-phrase-item" onclick="applyPhraseById('${f.id}'); closeDesignCatalogModal();">
        <span class="phrase-text"><i class="fas fa-quote-left" style="color: var(--accent-gold); margin-right: 8px;"></i>${escapeHtml(f.name)}</span>
        <button type="button" class="btn-add-phrase"><i class="fas fa-plus"></i> Usar Frase</button>
      </div>
    `).join('');
    return;
  }

  // ITEM 1: Cuadrícula ultra profesional con miniaturas acotadas y elegantes
  grid.innerHTML = itemsToRender.map(item => `
    <div class="vector-icon-card" onclick="addVectorToVirola('${item.id}'); closeDesignCatalogModal();" title="${item.name}">
      <div class="vector-thumb-wrap">
        <img src="${item.file}" alt="${item.name}" loading="lazy" />
      </div>
      <span class="vector-name">${item.name}</span>
    </div>
  `).join('');
}

// ==========================================================================
// 7. SUBIDA DE LOGO PROPIO CON ESCALA LIBRE (ITEM 5)
// ==========================================================================
function handleCustomImageUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const rawDataUrl = loadEvent.target.result;
    const img = new Image();
    img.onload = () => {
      let processedDataUrl = rawDataUrl;

      if (file.type !== 'image/svg+xml') {
        const cvs = document.createElement('canvas');
        const ctx = cvs.getContext('2d');
        const maxDim = 800;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        cvs.width = w;
        cvs.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        // ITEM 8: DETECCIÓN AVANZADA DE COLOR DE FONDO Y VECTORIZACIÓN LÁSER
        // Muestrear píxeles del perímetro exterior (las 4 esquinas y puntos medios)
        let rSum = 0, gSum = 0, bSum = 0, sampleCount = 0;
        const sampleCoords = [
          [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
          [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
          [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)],
          [2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]
        ];

        sampleCoords.forEach(([sx, sy]) => {
          const idx = (sy * w + sx) * 4;
          rSum += d[idx];
          gSum += d[idx + 1];
          bSum += d[idx + 2];
          sampleCount++;
        });

        const bgR = Math.round(rSum / sampleCount);
        const bgG = Math.round(gSum / sampleCount);
        const bgB = Math.round(bSum / sampleCount);
        const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
        const isLightBg = bgLum >= 120;
        const colorTolerance = 45;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
          if (a < 35) {
            d[i + 3] = 0;
            continue;
          }

          // Distancia de color Euclidiana respecto al fondo muestreado
          const colorDist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          let isBg = false;
          if (colorDist < colorTolerance) {
            isBg = true;
          } else if (isLightBg && lum > 215) {
            isBg = true;
          } else if (!isLightBg && lum < 40) {
            isBg = true;
          }

          if (isBg) {
            d[i + 3] = 0; // Fondo eliminado por completo
          } else {
            // Vectorizar en grabado orfebre oscuro con anti-aliasing fino
            d[i] = 18;
            d[i + 1] = 14;
            d[i + 2] = 10;
            const edgeFalloff = Math.min(1, colorDist / (colorTolerance * 1.5));
            d[i + 3] = Math.round(255 * edgeFalloff);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        processedDataUrl = cvs.toDataURL('image/png');
      }

      const { cx, cy, rRing } = STUDIO_CONFIG;
      const angle = 90;
      const rad = (angle * Math.PI) / 180;

      const newItem = {
        id: 'custom_img_' + Date.now(),
        type: 'icon',
        graphicId: 'custom_upload',
        name: file.name.substring(0, 20),
        file: processedDataUrl,
        angle: angle,
        radius: rRing,
        rotation: 0,
        scale: 1.2,
        x: cx + rRing * Math.cos(rad),
        y: cy + rRing * Math.sin(rad)
      };

      studio.items.push(newItem);
      studio.activeItemId = newItem.id;

      renderVirolaCanvas();
      updateActiveItemFloatingBar();
      updatePriceDisplay();
      if (studio.viewMode === '360') render360Canvas();
      showNotificationToast('¡Imagen vectorizada y sin fondo lista para grabar!', 'fa-circle-check');
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

// Agrandar libremente sin límites (puede abarcar toda la virola o superficie)
function setItemFullSurfaceScale() {
  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) return;

  item.scale = 3.5; // Escala gigante para abarcar toda la virola/superficie
  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast('Escala expandida para cubrir toda la superficie', 'fa-expand');
}

function resetItemTransform() {
  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) return;
  item.rotation = 0;
  item.scale = 1.0;
  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  if (studio.viewMode === '360') render360Canvas();
}

// ==========================================================================
// 8. RENDERIZADOR 2D DEL LIENZO SVG (CORONA VIROLA, CUERPO TERMO O CAJA)
// Eliminación del círculo que aparece al rededor de los íconos (Item 2)
// ==========================================================================
function renderVirolaCanvas() {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg) return;

  const { cx, cy, rInner, rRing, rOuter } = STUDIO_CONFIG;

  // 1. MÁSCARA AUTOMÁTICA DE CORTE PARA LÍNEAS CINCELADAS
  let grooveCutoutsHtml = '';
  studio.items.forEach(item => {
    const scale = item.scale || 1.0;
    const rad = (item.angle * Math.PI) / 180;
    const x = item.x !== undefined ? item.x : cx + (item.radius || rRing) * Math.cos(rad);
    const y = item.y !== undefined ? item.y : cy + (item.radius || rRing) * Math.sin(rad);

    if (item.type === 'icon') {
      const halfSize = (44 * scale) / 2 + 10;
      grooveCutoutsHtml += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${halfSize.toFixed(2)}" fill="black" />`;
    } else if (item.type === 'text') {
      const fontSize = item.fontSize || 22;
      const textLen = (item.text || '').length;

      if (item.arcPosition === 'straight') {
        const estWidth = textLen * fontSize * 0.65 + 18;
        const estHeight = fontSize + 14;
        grooveCutoutsHtml += `
          <g transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${item.rotation || 0})">
            <rect x="${(-estWidth / 2).toFixed(2)}" y="${(-estHeight / 2).toFixed(2)}" width="${estWidth.toFixed(2)}" height="${estHeight.toFixed(2)}" rx="8" fill="black" />
          </g>
        `;
      } else {
        const arcDeg = Math.min(260, Math.max(30, textLen * fontSize * 0.38));
        const maskRad = item.radius || rRing;
        grooveCutoutsHtml += `
          <circle cx="${cx}" cy="${cy}" r="${maskRad.toFixed(2)}" 
                  fill="none" stroke="black" 
                  stroke-width="${(fontSize + 16).toFixed(2)}" 
                  stroke-dasharray="${(arcDeg * 3.4).toFixed(2)} 2000" 
                  stroke-dashoffset="${(item.angle * 1.5).toFixed(2)}" />
          <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(fontSize * 1.2).toFixed(2)}" fill="black" />
        `;
      }
    }
  });

  // 2. LÍNEAS CIRCULARES CINCELADAS CONCÉNTRICAS
  let circularLinesHtml = '';
  if (studio.circularLines === 'simple') {
    circularLinesHtml = `
      <g mask="url(#virola-groove-mask)">
        <circle cx="${cx}" cy="${cy}" r="${rRing}" fill="none" stroke="rgba(30, 20, 15, 0.65)" stroke-width="1.8" />
        <circle cx="${cx}" cy="${cy}" r="${rRing}" fill="none" stroke="rgba(255, 255, 255, 0.3)" stroke-width="0.8" />
      </g>
    `;
  } else if (studio.circularLines === 'doble') {
    circularLinesHtml = `
      <g mask="url(#virola-groove-mask)">
        <circle cx="${cx}" cy="${cy}" r="${rRing - 10}" fill="none" stroke="rgba(30, 20, 15, 0.65)" stroke-width="1.6" />
        <circle cx="${cx}" cy="${cy}" r="${rRing + 10}" fill="none" stroke="rgba(30, 20, 15, 0.65)" stroke-width="1.6" />
        <circle cx="${cx}" cy="${cy}" r="${rRing - 10}" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.8" />
        <circle cx="${cx}" cy="${cy}" r="${rRing + 10}" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.8" />
      </g>
    `;
  }

  // 3. CAPAS DE TEXTO
  let textsHtml = '';
  let defsTextPathsHtml = '';
  const textItems = studio.items.filter(i => i.type === 'text');

  textItems.forEach(t => {
    const isStraight = t.arcPosition === 'straight';
    const isBottom = t.arcPosition === 'bottom';
    const isActive = t.id === studio.activeItemId;
    const r = t.radius || rRing;
    const angle = t.angle !== undefined ? t.angle : (isBottom ? 90 : 270);
    const rad = (angle * Math.PI) / 180;
    const x = t.x !== undefined ? t.x : cx + r * Math.cos(rad);
    const y = t.y !== undefined ? t.y : cy + r * Math.sin(rad);

    if (isStraight) {
      const rot = t.rotation !== undefined ? t.rotation : 0;
      textsHtml += `
        <g class="virola-text-group ${isActive ? 'active-text-item' : ''}" 
           data-item-id="${t.id}"
           transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
           onmousedown="startFreeItemDrag('${t.id}', event)"
           ontouchstart="startFreeItemDrag('${t.id}', event)">
          <text font-family="'${t.font || 'Cinzel'}', serif" 
                font-size="${t.fontSize || 22}" 
                font-weight="800" 
                letter-spacing="2px" 
                fill="#120e0a" 
                text-anchor="middle" 
                dominant-baseline="central" 
                style="cursor: grab;" 
                class="virola-curved-text ${isActive ? 'active-text-element' : ''}" 
                data-item-id="${t.id}">
            ${escapeHtml(t.text)}
          </text>
        </g>
      `;
    } else {
      const pathId = `text-path-${t.id}`;
      let pathD = '';

      if (isBottom) {
        const startDeg = angle + 150;
        const endDeg = angle - 150;
        const startRad = (startDeg * Math.PI) / 180;
        const endRad = (endDeg * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
      } else {
        const startDeg = angle - 150;
        const endDeg = angle + 150;
        const startRad = (startDeg * Math.PI) / 180;
        const endRad = (endDeg * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
      }

      defsTextPathsHtml += `<path id="${pathId}" d="${pathD}" fill="none" />`;

      textsHtml += `
        <g class="virola-text-group ${isActive ? 'active-text-item' : ''}" 
           data-item-id="${t.id}" 
           onmousedown="startFreeItemDrag('${t.id}', event)" 
           ontouchstart="startFreeItemDrag('${t.id}', event)">
          <text font-family="'${t.font || 'Cinzel'}', serif" 
                font-size="${t.fontSize || 22}" 
                font-weight="800" 
                letter-spacing="2px" 
                fill="#120e0a" 
                style="cursor: grab;" 
                class="virola-curved-text ${isActive ? 'active-text-element' : ''}" 
                data-item-id="${t.id}">
            <textPath href="#${pathId}" xlink:href="#${pathId}" startOffset="50%" text-anchor="middle">
              ${escapeHtml(t.text)}
            </textPath>
          </text>
        </g>
      `;
    }
  });

  // 4. ÍCONOS, DISEÑOS Y LOGOS CARGADOS (ITEM 5: BOTONES DE ACCIÓN ESTÁTICOS)
  let iconsHtml = '';
  const iconItems = studio.items.filter(i => i.type === 'icon');
  iconItems.forEach(item => {
    const scale = item.scale || 1.0;
    const rot = item.rotation || 0;
    const isActive = item.id === studio.activeItemId;

    const rad = (item.angle * Math.PI) / 180;
    const x = item.x !== undefined ? item.x : cx + (item.radius || rRing) * Math.cos(rad);
    const y = item.y !== undefined ? item.y : cy + (item.radius || rRing) * Math.sin(rad);

    const baseSize = 44;
    const halfSize = (baseSize * scale) / 2;

    const contentHtml = `<image href="${item.file}" x="${-halfSize}" y="${-halfSize}" width="${baseSize * scale}" height="${baseSize * scale}" preserveAspectRatio="xMidYMid meet" />`;

    // ÍCONOS Y DISEÑOS CON MARCO DE SELECCIÓN LIMPIO (SIN BOTONES FLOTANTES DESPROLIJOS)
    let selectionBorderHtml = '';
    if (isActive) {
      selectionBorderHtml = `
        <rect x="${(-halfSize - 5).toFixed(2)}" y="${(-halfSize - 5).toFixed(2)}" 
              width="${(baseSize * scale + 10).toFixed(2)}" height="${(baseSize * scale + 10).toFixed(2)}" 
              fill="none" stroke="#c59b27" stroke-width="1.8" stroke-dasharray="4,4" 
              rx="6" ry="6" opacity="0.9" pointer-events="none" />
      `;
    }

    iconsHtml += `
      <g class="virola-sticker-group ${isActive ? 'active-sticker' : ''}" 
         data-item-id="${item.id}" 
         transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
         onmousedown="startFreeItemDrag('${item.id}', event)"
         ontouchstart="startFreeItemDrag('${item.id}', event)"
         style="cursor: grab;">
        ${contentHtml}
        ${selectionBorderHtml}
      </g>
    `;
  });

  // 5. GUÍAS MAGNÉTICAS DE SNAPPING
  let snappingGuidesHtml = '';
  if (studio.snappingEnabled && studio.dragMode) {
    if (studio.activeGuides.v) {
      snappingGuidesHtml += `<line x1="${cx}" y1="10" x2="${cx}" y2="490" stroke="#c59b27" stroke-width="1.5" stroke-dasharray="4,4" />`;
    }
    if (studio.activeGuides.h) {
      snappingGuidesHtml += `<line x1="10" y1="${cy}" x2="490" y2="${cy}" stroke="#c59b27" stroke-width="1.5" stroke-dasharray="4,4" />`;
    }
    if (studio.activeGuides.ring) {
      snappingGuidesHtml += `<circle cx="${cx}" cy="${cy}" r="${rRing}" fill="none" stroke="#c59b27" stroke-width="1.5" stroke-dasharray="5,5" />`;
    }
  }

  // Color de metal según acabado
  const metalFillGrad = studio.metalFinish === 'acero' ? '#e2e8f0' : 'url(#metal-sheen-grad)';

  // RENDER SEGÚN PRODUCTO: MATE, TERMO O CAJA
  if (studio.activeProduct === 'mate') {
    // VIROLA CIRCULAR DE ALPACA MACIZA (MATE)
    svg.innerHTML = `
      <defs>
        <radialGradient id="metal-sheen-grad" cx="45%" cy="38%" r="62%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="25%" stop-color="#f2eee9" />
          <stop offset="55%" stop-color="#ded7cd" />
          <stop offset="80%" stop-color="#b8ad9e" />
          <stop offset="100%" stop-color="#8a7c6b" />
        </radialGradient>

        <linearGradient id="metal-reflection" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.65" />
          <stop offset="28%" stop-color="#c5bcaf" stop-opacity="0.15" />
          <stop offset="72%" stop-color="#ffffff" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#736655" stop-opacity="0.8" />
        </linearGradient>

        <radialGradient id="calabaza-interior" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0e0a07" />
          <stop offset="65%" stop-color="#1c1611" />
          <stop offset="90%" stop-color="#2b2017" />
          <stop offset="100%" stop-color="#0d0906" />
        </radialGradient>

        <mask id="virola-groove-mask">
          <rect x="0" y="0" width="500" height="500" fill="white" />
          ${grooveCutoutsHtml}
        </mask>

        <clipPath id="metal-ring-clip">
          <path d="M ${cx} ${cy - rOuter} 
                   A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy + rOuter} 
                   A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy - rOuter} Z
                   M ${cx} ${cy - rInner} 
                   A ${rInner} ${rInner} 0 1 1 ${cx} ${cy + rInner} 
                   A ${rInner} ${rInner} 0 1 1 ${cx} ${cy - rInner} Z"
                fill-rule="evenodd" />
        </clipPath>

        ${defsTextPathsHtml}
      </defs>

      <!-- Cuero vacuno exterior -->
      <circle cx="${cx}" cy="${cy}" r="${rOuter + 8}" fill="#1b120c" stroke="#3d2a1d" stroke-width="4" />
      <circle cx="${cx}" cy="${cy}" r="${rOuter + 5}" fill="none" stroke="#c59b27" stroke-width="1" stroke-dasharray="2,3" opacity="0.6" />

      <!-- Corona de Alpaca / Virola Metálica (Ancho 70px) -->
      <path d="M ${cx} ${cy - rOuter} 
               A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy + rOuter} 
               A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy - rOuter} Z
               M ${cx} ${cy - rInner} 
               A ${rInner} ${rInner} 0 1 1 ${cx} ${cy + rInner} 
               A ${rInner} ${rInner} 0 1 1 ${cx} ${cy - rInner} Z"
            fill="${metalFillGrad}" 
            stroke="#7d6f5f" 
            stroke-width="1.5"
            fill-rule="evenodd" />

      <!-- Brillo de Orfebre -->
      <path d="M ${cx} ${cy - rOuter} 
               A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy + rOuter} 
               A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy - rOuter} Z
               M ${cx} ${cy - rInner} 
               A ${rInner} ${rInner} 0 1 1 ${cx} ${cy + rInner} 
               A ${rInner} ${rInner} 0 1 1 ${cx} ${cy - rInner} Z"
            fill="url(#metal-reflection)" 
            fill-rule="evenodd" 
            opacity="0.4" />

      <!-- Ranuras concéntricas -->
      ${circularLinesHtml}

      <!-- Boca interior de la calabaza -->
      <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="url(#calabaza-interior)" stroke="#3d2d1e" stroke-width="3" />
      <circle cx="${cx}" cy="${cy}" r="${rInner - 22}" fill="#162212" opacity="0.85" />
      <circle cx="${cx}" cy="${cy}" r="${rInner - 26}" fill="none" stroke="#25381e" stroke-width="3" stroke-dasharray="3,4" opacity="0.7" />

      <!-- Grabados Láser -->
      <g class="virola-engravings-container" ${studio.clipToMetal ? 'clip-path="url(#metal-ring-clip)"' : ''}>
        <g class="virola-texts-layer">${textsHtml}</g>
        <g class="virola-icons-layer">${iconsHtml}</g>
      </g>

      <!-- Guías magnéticas de imán -->
      <g class="virola-snapping-guides-layer">${snappingGuidesHtml}</g>
    `;
  } else if (studio.activeProduct === 'termo') {
    // CUERPO CILÍNDRICO DE ACERO (TERMO 1L)
    svg.innerHTML = `
      <defs>
        <linearGradient id="termo-metal-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1e1e1e" />
          <stop offset="22%" stop-color="#4a4a4a" />
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="78%" stop-color="#3a3a3a" />
          <stop offset="100%" stop-color="#141414" />
        </linearGradient>
        <linearGradient id="termo-gold-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c59b27" />
          <stop offset="100%" stop-color="#8f6e16" />
        </linearGradient>
        ${defsTextPathsHtml}
      </defs>

      <!-- Cuerpo del Termo Cilíndrico de Acero Inoxidable -->
      <rect x="80" y="30" width="340" height="440" rx="20" fill="url(#termo-metal-sheen)" stroke="#2b2b2b" stroke-width="3" />
      
      <!-- Tapón y pico cebador superior -->
      <rect x="180" y="10" width="140" height="24" rx="6" fill="#111111" stroke="#333333" stroke-width="2" />
      <rect x="220" y="2" width="60" height="10" rx="3" fill="#c59b27" />

      <!-- Zona delimitada para grabado láser 360° -->
      <rect x="100" y="70" width="300" height="360" rx="10" fill="none" stroke="rgba(197, 155, 39, 0.35)" stroke-width="1.5" stroke-dasharray="4,4" />
      <text x="250" y="60" text-anchor="middle" fill="#c59b27" font-size="11" font-weight="800" letter-spacing="1">ÁREA DE GRABADO LÁSER CNC 360°</text>

      <!-- Base inferior reforzada -->
      <rect x="86" y="450" width="328" height="20" rx="8" fill="#111111" />

      <!-- Grabados Láser en el Termo -->
      <g class="virola-texts-layer">${textsHtml}</g>
      <g class="virola-icons-layer">${iconsHtml}</g>
      <g class="virola-snapping-guides-layer">${snappingGuidesHtml}</g>
    `;
  } else if (studio.activeProduct === 'caja') {
    // TAPA DE MADERA MACIZA PARA REGALO (CAJA MATERA)
    svg.innerHTML = `
      <defs>
        <linearGradient id="wood-grain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5c381e" />
          <stop offset="25%" stop-color="#462813" />
          <stop offset="50%" stop-color="#694022" />
          <stop offset="75%" stop-color="#3d220f" />
          <stop offset="100%" stop-color="#5a351b" />
        </linearGradient>
        ${defsTextPathsHtml}
      </defs>

      <!-- Tapa de Madera de Nogal Noble -->
      <rect x="50" y="40" width="400" height="420" rx="12" fill="url(#wood-grain-grad)" stroke="#261408" stroke-width="4" />
      
      <!-- Vetas de madera decorativas -->
      <line x1="60" y1="120" x2="440" y2="120" stroke="rgba(0,0,0,0.18)" stroke-width="3" />
      <line x1="60" y1="260" x2="440" y2="260" stroke="rgba(0,0,0,0.18)" stroke-width="2" />
      <line x1="60" y1="380" x2="440" y2="380" stroke="rgba(0,0,0,0.18)" stroke-width="3" />

      <!-- Esquineros metálicos de orfebrería -->
      <path d="M 50 70 L 70 70 L 70 50 L 50 40 Z" fill="#c59b27" />
      <path d="M 450 70 L 430 70 L 430 50 L 450 40 Z" fill="#c59b27" />
      <path d="M 50 430 L 70 430 L 70 450 L 50 460 Z" fill="#c59b27" />
      <path d="M 450 430 L 430 430 L 430 450 L 450 460 Z" fill="#c59b27" />

      <!-- Marco central de pirograbado -->
      <rect x="80" y="70" width="340" height="360" rx="8" fill="none" stroke="rgba(197, 155, 39, 0.45)" stroke-width="1.8" />
      <rect x="85" y="75" width="330" height="350" rx="6" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />

      <!-- Grabados en la Caja -->
      <g class="virola-texts-layer">${textsHtml}</g>
      <g class="virola-icons-layer">${iconsHtml}</g>
      <g class="virola-snapping-guides-layer">${snappingGuidesHtml}</g>
    `;
  }
}

// ==========================================================================
// 9. MOTOR 3D 360° INTERACTIVO ORBITAL (ITEM 6)
// Rotación con mouse / touch y proyección real de grabados
// ==========================================================================
function init360CanvasEvents() {
  const vp = document.getElementById('studio-360-viewport');
  if (!vp) return;

  vp.addEventListener('mousedown', start360RotationDrag);
  window.addEventListener('mousemove', on360RotationMove);
  window.addEventListener('mouseup', end360RotationDrag);

  vp.addEventListener('touchstart', start360RotationDrag, { passive: false });
  window.addEventListener('touchmove', on360RotationMove, { passive: false });
  window.addEventListener('touchend', end360RotationDrag);
}

function get360PointerCanvasCoords(e) {
  const canvas = document.getElementById('studio-360-canvas');
  if (!canvas) return { x: 0, y: 0, rawClientX: 0, rawClientY: 0 };
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
    rawClientX: clientX,
    rawClientY: clientY
  };
}

function start360RotationDrag(e) {
  const pointer = get360PointerCanvasCoords(e);
  stopAutoRotate();

  // ITEM 6: Detectar si el usuario tocó sobre un elemento agregado para moverlo en 360°
  let hitItem = null;
  if (studio.projected360Items && studio.projected360Items.length > 0) {
    hitItem = studio.projected360Items.find(p => {
      const dist = Math.hypot(pointer.x - p.projX, pointer.y - p.projY);
      return dist <= Math.max(34, p.radius || 26);
    });
  }

  if (hitItem) {
    studio.drag360Mode = 'item';
    studio.drag360ItemId = hitItem.id;
    studio.activeItemId = hitItem.id;
    studio.drag360ItemStartX = pointer.x;
    studio.drag360ItemStartY = pointer.y;

    const it = studio.items.find(i => i.id === hitItem.id);
    if (it) {
      studio.drag360ItemStartAngle = it.angle || 0;
      studio.drag360ItemStartPos = { x: it.x || 250, y: it.y || 250 };
    }

    renderVirolaCanvas();
    updateActiveItemFloatingBar();
    render360Canvas();
    return;
  }

  // Si no tocó un elemento, rotar la cámara 3D orbital
  studio.drag360Mode = 'camera';
  studio.is360Dragging = true;
  studio.drag360StartX = pointer.rawClientX;
  studio.drag360StartY = pointer.rawClientY;
  studio.drag360StartAngle = studio.rotation360;
  studio.drag360StartPitch = studio.pitch360 !== undefined ? studio.pitch360 : 20;
}

function on360RotationMove(e) {
  if (!studio.drag360Mode) return;
  const pointer = get360PointerCanvasCoords(e);

  // ITEM 6: Arrastrar el elemento sobre la superficie en 360°
  if (studio.drag360Mode === 'item' && studio.drag360ItemId) {
    const it = studio.items.find(i => i.id === studio.drag360ItemId);
    if (!it) return;

    if (studio.activeProduct === 'mate') {
      const deltaAngle = (pointer.x - studio.drag360ItemStartX) * 0.75;
      let newAngle = (studio.drag360ItemStartAngle + deltaAngle) % 360;
      if (newAngle < 0) newAngle += 360;
      it.angle = Math.round(newAngle);

      const rad = (it.angle * Math.PI) / 180;
      it.x = STUDIO_CONFIG.cx + (it.radius || STUDIO_CONFIG.rRing) * Math.cos(rad);
      it.y = STUDIO_CONFIG.cy + (it.radius || STUDIO_CONFIG.rRing) * Math.sin(rad);
    } else if (studio.activeProduct === 'termo') {
      const deltaAngle = (pointer.x - studio.drag360ItemStartX) * 0.75;
      let newAngle = (studio.drag360ItemStartAngle + deltaAngle) % 360;
      if (newAngle < 0) newAngle += 360;
      it.angle = Math.round(newAngle);

      const deltaY = (pointer.y - studio.drag360ItemStartY) * 0.9;
      it.y = Math.max(100, Math.min(390, studio.drag360ItemStartPos.y + deltaY));
    } else if (studio.activeProduct === 'caja') {
      const deltaX = (pointer.x - studio.drag360ItemStartX) * 1.5;
      const deltaY = (pointer.y - studio.drag360ItemStartY) * 1.5;
      it.x = Math.max(80, Math.min(420, studio.drag360ItemStartPos.x + deltaX));
      it.y = Math.max(80, Math.min(420, studio.drag360ItemStartPos.y + deltaY));
    }

    renderVirolaCanvas();
    render360Canvas();
    return;
  }

  // ITEM 7: Rotación orbital de la cámara (Yaw horizontal y Pitch vertical arriba/abajo)
  if (studio.drag360Mode === 'camera' && studio.is360Dragging) {
    const deltaX = pointer.rawClientX - studio.drag360StartX;
    const deltaY = pointer.rawClientY - studio.drag360StartY;

    // Horizontal (Yaw)
    let newYaw = (studio.drag360StartAngle + deltaX * 0.8) % 360;
    if (newYaw < 0) newYaw += 360;
    studio.rotation360 = Math.round(newYaw);

    // Vertical (Pitch: ver arriba y abajo)
    let newPitch = studio.drag360StartPitch - deltaY * 0.55;
    studio.pitch360 = Math.max(-65, Math.min(65, Math.round(newPitch)));

    const degValEl = document.getElementById('rotation-degree-val');
    if (degValEl) degValEl.textContent = `${studio.rotation360}°`;

    render360Canvas();
  }
}

function end360RotationDrag() {
  studio.is360Dragging = false;
  studio.drag360Mode = null;
  studio.drag360ItemId = null;
}

function toggleAutoRotate360(e) {
  if (e) e.stopPropagation();
  if (studio.isAutoRotating) {
    stopAutoRotate();
  } else {
    startAutoRotate();
  }
}

function startAutoRotate() {
  studio.isAutoRotating = true;
  const icon = document.getElementById('autorotate-icon');
  if (icon) {
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');
  }

  studio.autoRotateTimer = setInterval(() => {
    studio.rotation360 = (studio.rotation360 + 1) % 360;
    const degValEl = document.getElementById('rotation-degree-val');
    if (degValEl) degValEl.textContent = `${studio.rotation360}°`;
    render360Canvas();
  }, 35);
}

function stopAutoRotate() {
  studio.isAutoRotating = false;
  const icon = document.getElementById('autorotate-icon');
  if (icon) {
    icon.classList.remove('fa-pause');
    icon.classList.add('fa-play');
  }
  if (studio.autoRotateTimer) {
    clearInterval(studio.autoRotateTimer);
    studio.autoRotateTimer = null;
  }
}

// Renderizador del Canvas 360° en perspectiva orbital interactiva
function render360Canvas() {
  const canvas = document.getElementById('studio-360-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const rotRad = (studio.rotation360 * Math.PI) / 180;
  const pitchDeg = studio.pitch360 !== undefined ? studio.pitch360 : 20;
  const pitchRad = (pitchDeg * Math.PI) / 180;

  ctx.clearRect(0, 0, w, h);
  studio.projected360Items = [];

  if (studio.activeProduct === 'mate') {
    // 1. MATE IMPERIAL 3D PERSPECTIVA ORBITAL
    const centerX = w / 2;
    const centerY = h / 2 - 20;

    // Sombra del Mate en la mesa
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 220, 160, 36, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.filter = 'blur(10px)';
    ctx.fill();
    ctx.restore();

    // Base esculpida de Alpaca
    ctx.save();
    const baseGrad = ctx.createLinearGradient(centerX - 90, centerY + 180, centerX + 90, centerY + 180);
    baseGrad.addColorStop(0, '#5a4e40');
    baseGrad.addColorStop(0.5, '#e5ded4');
    baseGrad.addColorStop(1, '#3a3026');
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 180, 85, 26, 0, 0, Math.PI * 2);
    ctx.fillStyle = baseGrad;
    ctx.fill();
    ctx.restore();

    // Cuerpo de cuero vacuno seleccionado
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX - 165, centerY + 20);
    ctx.bezierCurveTo(centerX - 180, centerY + 110, centerX - 120, centerY + 175, centerX - 80, centerY + 180);
    ctx.lineTo(centerX + 80, centerY + 180);
    ctx.bezierCurveTo(centerX + 120, centerY + 175, centerX + 180, centerY + 110, centerX + 165, centerY + 20);
    ctx.closePath();

    const leatherGrad = ctx.createRadialGradient(centerX - 40, centerY + 80, 20, centerX, centerY + 100, 170);
    leatherGrad.addColorStop(0, '#2e1c12');
    leatherGrad.addColorStop(0.6, '#1a100a');
    leatherGrad.addColorStop(1, '#0e0906');
    ctx.fillStyle = leatherGrad;
    ctx.fill();

    // Costura uruguaya vertical que gira en 360°
    const seamOffset = Math.sin(rotRad) * 110;
    const seamCos = Math.cos(rotRad);
    if (seamCos > -0.2) {
      ctx.beginPath();
      ctx.moveTo(centerX + seamOffset, centerY + 25);
      ctx.quadraticCurveTo(centerX + seamOffset * 1.15, centerY + 100, centerX + seamOffset * 0.8, centerY + 178);
      ctx.strokeStyle = '#c59b27';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = Math.max(0.2, seamCos);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1.0;
    }
    ctx.restore();

    // Corona elíptica de Alpaca Maciza (Virola en perspectiva 3D)
    ctx.save();
    const rxOuter = 168;
    const ryOuter = 46;
    const rxInner = 118;
    const ryInner = 32;

    // Anillo exterior de la virola
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 20, rxOuter, ryOuter, 0, 0, Math.PI * 2);
    const metalGrad = ctx.createLinearGradient(centerX - rxOuter, centerY, centerX + rxOuter, centerY);
    const specOffset = (Math.sin(rotRad) + 1) / 2;
    metalGrad.addColorStop(0, '#5a4d3f');
    metalGrad.addColorStop(Math.max(0.05, Math.min(0.95, specOffset * 0.8)), '#fdfcf9');
    metalGrad.addColorStop(Math.max(0.1, Math.min(0.98, specOffset * 0.8 + 0.15)), '#d1c7b8');
    metalGrad.addColorStop(1, '#42372c');
    ctx.fillStyle = metalGrad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#2b2219';
    ctx.stroke();

    // Boca interior
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 20, rxInner, ryInner, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0705';
    ctx.fill();

    // Montañita de yerba mate
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 22, rxInner - 12, ryInner - 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1e2c18';
    ctx.fill();

    // PROYECCIÓN DE GRABADOS (TEXTOS Y ESCUDOS) EN LA VIROLA 360°
    studio.items.forEach(item => {
      const itemAngle = (item.angle || 0) + studio.rotation360;
      const angleRad = (itemAngle * Math.PI) / 180;
      const facing = Math.sin(angleRad);

      if (facing > -0.2) {
        const projX = centerX + Math.cos(angleRad) * (rxOuter + rxInner) / 2;
        const projY = centerY + 20 + Math.sin(angleRad) * (ryOuter + ryInner) / 2;
        const alpha = Math.max(0.18, facing);

        // ITEM 6: Registrar para drag interactivo en 360°
        studio.projected360Items.push({
          id: item.id,
          projX: projX,
          projY: projY,
          radius: item.type === 'text' ? 36 : 28,
          facing: facing
        });

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(projX, projY);

        if (item.type === 'text') {
          ctx.font = `800 ${Math.round((item.fontSize || 22) * 0.85)}px '${item.font || 'Cinzel'}', serif`;
          ctx.fillStyle = '#120e0a';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.text, 0, 0);
        } else if (item.type === 'icon') {
          const imgEl = new Image();
          imgEl.src = item.file;
          const s = (item.scale || 1) * 32;
          ctx.drawImage(imgEl, -s / 2, -s / 2, s, s);
        }
        ctx.restore();
      }
    });

    ctx.restore();

  } else if (studio.activeProduct === 'termo') {
    // 2. TERMO DE ACERO CILÍNDRICO 3D 360°
    const centerX = w / 2;
    const centerY = h / 2 - 10;
    const tWidth = 140;
    const tHeight = 360;

    // Sombra
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + tHeight / 2 + 10, 80, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.filter = 'blur(8px)';
    ctx.fill();
    ctx.restore();

    // Cuerpo cilíndrico de acero inoxidable
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(centerX - tWidth / 2, centerY - tHeight / 2, tWidth, tHeight, 14);
    const termoGrad = ctx.createLinearGradient(centerX - tWidth / 2, 0, centerX + tWidth / 2, 0);
    termoGrad.addColorStop(0, '#1c1b1a');
    termoGrad.addColorStop(0.25, '#403d39');
    termoGrad.addColorStop(0.5, '#ffffff');
    termoGrad.addColorStop(0.75, '#353330');
    termoGrad.addColorStop(1, '#151413');
    ctx.fillStyle = termoGrad;
    ctx.fill();
    ctx.strokeStyle = '#2b2a28';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tapón superior
    ctx.beginPath();
    ctx.roundRect(centerX - 35, centerY - tHeight / 2 - 24, 70, 26, 6);
    ctx.fillStyle = '#181512';
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(centerX - 18, centerY - tHeight / 2 - 32, 36, 10, 3);
    ctx.fillStyle = '#c59b27';
    ctx.fill();

    // PROYECCIÓN DE GRABADOS A LO LARGO DEL CILINDRO 360°
    studio.items.forEach(item => {
      const itemAngle = (item.angle || 0) + studio.rotation360;
      const angleRad = (itemAngle * Math.PI) / 180;
      const facing = Math.cos(angleRad);

      if (facing > -0.2) {
        const projX = centerX + Math.sin(angleRad) * (tWidth / 2 - 12);
        const projY = centerY - 60 + ((item.y || 250) - 250) * 0.7;
        const scaleComp = Math.max(0.2, facing);

        studio.projected360Items.push({
          id: item.id,
          projX: projX,
          projY: projY,
          radius: 30,
          facing: facing
        });

        ctx.save();
        ctx.globalAlpha = Math.max(0.18, facing);
        ctx.translate(projX, projY);
        ctx.scale(scaleComp, 1);

        if (item.type === 'text') {
          ctx.font = `800 ${item.fontSize || 22}px '${item.font || 'Cinzel'}', serif`;
          ctx.fillStyle = '#111111';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.text, 0, 0);
        } else if (item.type === 'icon') {
          const imgEl = new Image();
          imgEl.src = item.file;
          const s = (item.scale || 1) * 40;
          ctx.drawImage(imgEl, -s / 2, -s / 2, s, s);
        }
        ctx.restore();
      }
    });

    ctx.restore();

  } else if (studio.activeProduct === 'caja') {
    // 3. CAJA MATERA DE MADERA 3D (ITEM 7: VISIÓN ARRIBA, ABAJO Y TODOS LOS LADOS)
    const centerX = w / 2;
    const centerY = h / 2;
    const boxW = 120;
    const boxH = 55;
    const boxD = 120;

    // Proyección orbital 3D con Yaw y Pitch
    function project3D(x, y, z) {
      const x1 = x * Math.cos(rotRad) + z * Math.sin(rotRad);
      const y1 = y;
      const z1 = -x * Math.sin(rotRad) + z * Math.cos(rotRad);

      const x2 = x1;
      const y2 = y1 * Math.cos(pitchRad) - z1 * Math.sin(pitchRad);
      const z2 = y1 * Math.sin(pitchRad) + z1 * Math.cos(pitchRad);

      const fov = 480;
      const scale = fov / (fov + z2 + 180);
      return {
        x: centerX + x2 * scale,
        y: centerY + y2 * scale,
        z: z2
      };
    }

    // 6 caras de la Caja en el espacio 3D
    const faces = [
      // TAPA SUPERIOR (Arriba)
      {
        name: 'top',
        pts: [
          project3D(-boxW, -boxH, -boxD),
          project3D(boxW, -boxH, -boxD),
          project3D(boxW, -boxH, boxD),
          project3D(-boxW, -boxH, boxD)
        ],
        fill: '#5c381e',
        stroke: '#2a1608',
        hasDesign: true
      },
      // BASE INFERIOR (Abajo)
      {
        name: 'bottom',
        pts: [
          project3D(-boxW, boxH, -boxD),
          project3D(boxW, boxH, -boxD),
          project3D(boxW, boxH, boxD),
          project3D(-boxW, boxH, boxD)
        ],
        fill: '#382212',
        stroke: '#1f1107'
      },
      // FRENTE CON BROCHE DORADO
      {
        name: 'front',
        pts: [
          project3D(-boxW, -boxH, boxD),
          project3D(boxW, -boxH, boxD),
          project3D(boxW, boxH, boxD),
          project3D(-boxW, boxH, boxD)
        ],
        fill: '#4a2c16',
        stroke: '#221206',
        isFront: true
      },
      // CONTRAFRENTE TRASERO
      {
        name: 'back',
        pts: [
          project3D(-boxW, -boxH, -boxD),
          project3D(boxW, -boxH, -boxD),
          project3D(boxW, boxH, -boxD),
          project3D(-boxW, boxH, -boxD)
        ],
        fill: '#3a210f',
        stroke: '#1a0d05'
      },
      // LATERAL DERECHO
      {
        name: 'right',
        pts: [
          project3D(boxW, -boxH, -boxD),
          project3D(boxW, -boxH, boxD),
          project3D(boxW, boxH, boxD),
          project3D(boxW, boxH, -boxD)
        ],
        fill: '#432612',
        stroke: '#211106'
      },
      // LATERAL IZQUIERDO
      {
        name: 'left',
        pts: [
          project3D(-boxW, -boxH, -boxD),
          project3D(-boxW, -boxH, boxD),
          project3D(-boxW, boxH, boxD),
          project3D(-boxW, boxH, -boxD)
        ],
        fill: '#4f2e18',
        stroke: '#251307'
      }
    ];

    // Ordenar por Z para el algoritmo del pintor
    faces.forEach(f => {
      f.avgZ = (f.pts[0].z + f.pts[1].z + f.pts[2].z + f.pts[3].z) / 4;
    });
    faces.sort((a, b) => b.avgZ - a.avgZ);

    // Sombra en el plano de apoyo
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 130, 160, 42, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.filter = 'blur(12px)';
    ctx.fill();
    ctx.restore();

    // Dibujar cada cara 3D
    faces.forEach(f => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(f.pts[0].x, f.pts[0].y);
      for (let i = 1; i < f.pts.length; i++) {
        ctx.lineTo(f.pts[i].x, f.pts[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = f.fill;
      ctx.fill();
      ctx.strokeStyle = f.stroke;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Herraje frontal dorado
      if (f.isFront) {
        const midX = (f.pts[0].x + f.pts[1].x) / 2;
        const midY = (f.pts[0].y + f.pts[2].y) / 2 - 4;
        ctx.fillStyle = '#c59b27';
        ctx.fillRect(midX - 7, midY - 6, 14, 16);
        ctx.strokeStyle = '#6b500d';
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - 7, midY - 6, 14, 16);
      }

      // Proyección interactiva de diseños en la tapa
      if (f.hasDesign && f.pts[0].y < centerY + 60) {
        const topMidX = (f.pts[0].x + f.pts[1].x + f.pts[2].x + f.pts[3].x) / 4;
        const topMidY = (f.pts[0].y + f.pts[1].y + f.pts[2].y + f.pts[3].y) / 4;

        studio.items.forEach(item => {
          const offX = ((item.x || 250) - 250) * 0.45;
          const offY = ((item.y || 250) - 250) * 0.45;
          const itemScreenX = topMidX + offX;
          const itemScreenY = topMidY + offY;

          // ITEM 6: Registrar para drag interactivo en 360°
          studio.projected360Items.push({
            id: item.id,
            projX: itemScreenX,
            projY: itemScreenY,
            radius: 28,
            facing: 1.0
          });

          ctx.save();
          ctx.translate(itemScreenX, itemScreenY);
          ctx.rotate(rotRad * 0.4);

          if (item.type === 'text') {
            ctx.font = `800 ${Math.round((item.fontSize || 22) * 0.75)}px '${item.font || 'Cinzel'}', serif`;
            ctx.fillStyle = '#1c1008';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.text, 0, 0);
          } else if (item.type === 'icon') {
            const imgEl = new Image();
            imgEl.src = item.file;
            const s = (item.scale || 1) * 32;
            ctx.drawImage(imgEl, -s / 2, -s / 2, s, s);
          }
          ctx.restore();
        });
      }

      ctx.restore();
    });
  }
}

// ==========================================================================
// 10. INTERACCIÓN Y MANIPULACIÓN LIBRE (CANVAS / CAD ENGINE)
// ==========================================================================
function selectVirolaItem(itemId, e) {
  if (e) e.stopPropagation();
  studio.activeItemId = itemId;
  renderVirolaCanvas();
  updateActiveItemFloatingBar();

  const item = studio.items.find(i => i.id === itemId);
  if (item && item.type === 'text') {
    // switchRibbonTab('text');
    updateActiveTextControls(item);
  } else if (item && item.type === 'icon') {
    // Mantener la pestaña activa actual sin forzar cambio
  }
}

function deleteVirolaItem(itemId, e) {
  if (e) e.stopPropagation();
  studio.items = studio.items.filter(i => i.id !== itemId);
  if (studio.activeItemId === itemId) {
    studio.activeItemId = null;
  }
  renderVirolaCanvas();
  renderTextLayersUI();
  updateActiveItemFloatingBar();
  updatePriceDisplay();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast('Elemento eliminado de la pieza', 'fa-trash');
}

function deleteActiveVirolaItem() {
  if (!studio.activeItemId) return;
  deleteVirolaItem(studio.activeItemId);
}

function duplicateActiveItem() {
  if (!studio.activeItemId) return;
  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) return;

  const newItem = {
    ...item,
    id: (item.type === 'text' ? 'text_' : 'icon_') + Date.now(),
    angle: (item.angle + 25) % 360,
    x: (item.x || STUDIO_CONFIG.cx) + 14,
    y: (item.y || STUDIO_CONFIG.cy) + 14
  };
  studio.items.push(newItem);
  studio.activeItemId = newItem.id;

  renderVirolaCanvas();
  if (newItem.type === 'text') renderTextLayersUI();
  updateActiveItemFloatingBar();
  updatePriceDisplay();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast('Capa duplicada', 'fa-clone');
}

function startFreeItemDrag(itemId, e) {
  e.preventDefault();
  e.stopPropagation();

  const item = studio.items.find(i => i.id === itemId);
  if (!item) return;

  studio.activeItemId = itemId;
  const targetHandle = e.target.closest('.virola-handle');
  const handleType = targetHandle?.getAttribute('data-handle');

  if (handleType === 'delete') {
    deleteVirolaItem(itemId, e);
    return;
  }

  const coords = getPointerCoords(e);
  const { cx, cy, rRing } = STUDIO_CONFIG;

  const currentRad = (item.angle * Math.PI) / 180;
  const curX = item.x !== undefined ? item.x : cx + (item.radius || rRing) * Math.cos(currentRad);
  const curY = item.y !== undefined ? item.y : cy + (item.radius || rRing) * Math.sin(currentRad);

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
    itemX: curX,
    itemY: curY,
    itemAngle: item.angle || 0,
    itemRadius: item.radius || rRing,
    itemRotation: item.rotation || 0,
    itemScale: item.scale || 1.0,
    pointerAngle: (Math.atan2(coords.y - cy, coords.x - cx) * 180) / Math.PI
  };

  if (item.type === 'text') {
    renderTextLayersUI();
    updateActiveTextControls(item);
  }

  renderVirolaCanvas();
  updateActiveItemFloatingBar();
}

function initCanvasInteraction() {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg) return;

  svg.addEventListener('click', (e) => {
    if (!e.target.closest('.virola-sticker-group') && 
        !e.target.closest('.virola-text-group') && 
        !e.target.closest('.virola-handle')) {
      studio.activeItemId = null;
      renderVirolaCanvas();
      updateActiveItemFloatingBar();
    }
  });

  window.addEventListener('mousemove', onCanvasPointerMove);
  window.addEventListener('touchmove', onCanvasPointerMove, { passive: false });
  window.addEventListener('mouseup', onCanvasPointerEnd);
  window.addEventListener('touchend', onCanvasPointerEnd);
}

function onCanvasPointerMove(e) {
  if (!studio.dragMode || !studio.dragItemId) return;
  e.preventDefault();

  const item = studio.items.find(i => i.id === studio.dragItemId);
  if (!item) return;

  const coords = getPointerCoords(e);
  const { cx, cy, rRing } = STUDIO_CONFIG;

  if (studio.dragMode === 'move') {
    const deltaX = coords.x - studio.dragStart.x;
    const deltaY = coords.y - studio.dragStart.y;
    let targetX = studio.dragStart.itemX + deltaX;
    let targetY = studio.dragStart.itemY + deltaY;

    studio.activeGuides = { v: false, h: false, ring: false, angle: null };

    if (studio.snappingEnabled) {
      if (Math.abs(targetX - cx) < 8) {
        targetX = cx;
        studio.activeGuides.v = true;
      }
      if (Math.abs(targetY - cy) < 8) {
        targetY = cy;
        studio.activeGuides.h = true;
      }
      const distFromCenter = Math.hypot(targetX - cx, targetY - cy);
      if (Math.abs(distFromCenter - rRing) < 8) {
        const rad = Math.atan2(targetY - cy, targetX - cx);
        targetX = cx + rRing * Math.cos(rad);
        targetY = cy + rRing * Math.sin(rad);
        studio.activeGuides.ring = true;
      }
    }

    item.x = parseFloat(targetX.toFixed(2));
    item.y = parseFloat(targetY.toFixed(2));

    const dx = targetX - cx;
    const dy = targetY - cy;
    let polarAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (polarAngle < 0) polarAngle += 360;
    item.angle = Math.round(polarAngle);
    item.radius = Math.round(Math.hypot(dx, dy));

    renderVirolaCanvas();
  } else if (studio.dragMode === 'rotate') {
    const itemX = item.x !== undefined ? item.x : cx;
    const itemY = item.y !== undefined ? item.y : cy;
    const dx = coords.x - itemX;
    const dy = coords.y - itemY;
    let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

    if (studio.snappingEnabled && Math.abs(angleDeg % 45) < 3) {
      angleDeg = Math.round(angleDeg / 45) * 45;
    }

    item.rotation = Math.round(angleDeg + 90);
    renderVirolaCanvas();
  } else if (studio.dragMode === 'scale') {
    const itemX = item.x !== undefined ? item.x : cx;
    const itemY = item.y !== undefined ? item.y : cy;
    const dist = Math.hypot(coords.x - itemX, coords.y - itemY);
    let newScale = dist / 24;
    newScale = Math.max(STUDIO_CONFIG.minScale, Math.min(STUDIO_CONFIG.maxScale, newScale));

    item.scale = parseFloat(newScale.toFixed(2));
    renderVirolaCanvas();
  }
}

function onCanvasPointerEnd() {
  if (studio.dragMode) {
    studio.dragMode = null;
    studio.dragItemId = null;
    studio.activeGuides = { v: false, h: false, ring: false, angle: null };
    renderVirolaCanvas();
    updateActiveItemFloatingBar();
    if (studio.viewMode === '360') render360Canvas();
  }
}

function getPointerCoords(e) {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg) return { x: 0, y: 0 };

  const rect = svg.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const viewBox = svg.viewBox.baseVal || { width: 500, height: 500 };
  const scaleX = viewBox.width / rect.width;
  const scaleY = viewBox.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

// Barra flotante de acciones rápidas
function updateActiveItemFloatingBar() {
  const bar = document.getElementById('virola-active-item-controls');
  if (!bar) return;

  const nameBadge = document.getElementById('active-item-name-badge');
  const actionsGroup = document.getElementById('active-item-actions');
  const scaleDisplay = document.getElementById('active-item-scale-display');

  if (!studio.activeItemId) {
    bar.classList.remove('has-active-item');
    if (nameBadge) {
      nameBadge.innerHTML = `<i class="fas fa-hand-pointer" style="color: var(--accent-gold); margin-right: 6px;"></i> Hacé clic en cualquier texto o grabado para editarlo`;
    }
    if (actionsGroup) {
      actionsGroup.classList.add('disabled');
    }
    if (scaleDisplay) {
      scaleDisplay.textContent = '--';
    }
    return;
  }

  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) {
    bar.classList.remove('has-active-item');
    if (nameBadge) {
      nameBadge.innerHTML = `<i class="fas fa-hand-pointer" style="color: var(--accent-gold); margin-right: 6px;"></i> Hacé clic en cualquier texto o grabado para editarlo`;
    }
    if (actionsGroup) {
      actionsGroup.classList.add('disabled');
    }
    if (scaleDisplay) {
      scaleDisplay.textContent = '--';
    }
    return;
  }

  bar.classList.add('has-active-item');
  if (actionsGroup) {
    actionsGroup.classList.remove('disabled');
  }

  if (nameBadge) {
    const isText = item.type === 'text';
    const typeTag = isText ? 'Texto' : 'Grabado';
    const itemName = isText ? `"${item.text}"` : (item.name || 'Diseño');
    nameBadge.innerHTML = `<span class="active-item-type-tag">${typeTag}</span> <strong>${escapeHtml(itemName)}</strong>`;
  }

  if (scaleDisplay) {
    if (item.type === 'text') {
      scaleDisplay.textContent = `${item.fontSize || 22}px`;
    } else {
      scaleDisplay.textContent = `${Math.round((item.scale || 1.0) * 100)}%`;
    }
  }

  const scaleValEl = document.getElementById('ribbon-image-scale-val');
  if (scaleValEl && item.scale) {
    scaleValEl.textContent = `${Math.round(item.scale * 100)}%`;
  }
}

function centerActiveItem() {
  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) return;

  const { cx, cy, rRing } = STUDIO_CONFIG;
  if (item.type === 'text') {
    item.angle = item.arcPosition === 'bottom' ? 90 : 270;
  } else {
    item.radius = rRing;
    const rad = ((item.angle !== undefined ? item.angle : 270) * Math.PI) / 180;
    item.x = cx + rRing * Math.cos(rad);
    item.y = cy + rRing * Math.sin(rad);
  }

  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast('Elemento alineado al centro', 'fa-crosshairs');
}

function stepItemScale(delta) {
  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) return;

  if (item.type === 'text') {
    const curSize = item.fontSize || 22;
    const newSize = Math.max(10, Math.min(80, Math.round(curSize + (delta > 0 ? 3 : -3))));
    item.fontSize = newSize;
    const sizeInput = document.getElementById('active-text-size-input');
    const sizeSlider = document.getElementById('active-text-size-slider');
    if (sizeInput) sizeInput.value = newSize;
    if (sizeSlider) sizeSlider.value = newSize;
  } else {
    const cur = item.scale || 1.0;
    const n = Math.max(STUDIO_CONFIG.minScale, Math.min(STUDIO_CONFIG.maxScale, cur + delta));
    item.scale = parseFloat(n.toFixed(2));
  }

  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  if (studio.viewMode === '360') render360Canvas();
}

function stepItemRotation(degDelta) {
  const item = studio.items.find(i => i.id === studio.activeItemId);
  if (!item) return;

  if (item.type === 'text') {
    if (item.arcPosition === 'straight') {
      item.rotation = ((item.rotation || 0) + degDelta) % 360;
    } else {
      item.angle = ((item.angle !== undefined ? item.angle : (item.arcPosition === 'bottom' ? 90 : 270)) + degDelta) % 360;
      if (item.angle < 0) item.angle += 360;
    }
  } else {
    item.rotation = ((item.rotation || 0) + degDelta) % 360;
  }

  renderVirolaCanvas();
  updateActiveItemFloatingBar();
  if (studio.viewMode === '360') render360Canvas();
}

// Centrado y balance concéntrico
function autoCenterAndBalanceVirola() {
  const { cx, cy, rRing } = STUDIO_CONFIG;

  const textTop = studio.items.find(i => i.type === 'text' && i.arcPosition === 'top');
  if (textTop) {
    textTop.angle = 270;
    textTop.radius = rRing;
    textTop.x = cx;
    textTop.y = cy - rRing;
  }

  const textBottom = studio.items.find(i => i.type === 'text' && i.arcPosition === 'bottom');
  if (textBottom) {
    textBottom.angle = 90;
    textBottom.radius = rRing;
    textBottom.x = cx;
    textBottom.y = cy + rRing;
  }

  const icons = studio.items.filter(i => i.type === 'icon');
  if (icons.length === 1) {
    icons[0].angle = 90;
    icons[0].radius = rRing;
    icons[0].x = cx;
    icons[0].y = cy + rRing;
  } else if (icons.length === 2) {
    icons[0].angle = 180;
    icons[0].radius = rRing;
    icons[0].x = cx - rRing;
    icons[0].y = cy;
    icons[1].angle = 0;
    icons[1].radius = rRing;
    icons[1].x = cx + rRing;
    icons[1].y = cy;
  }

  renderVirolaCanvas();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast('Grabados alineados y balanceados concéntricamente', 'fa-crosshairs');
}

function resetVirolaStudio() {
  studio.items = [];
  studio.activeItemId = null;
  renderVirolaCanvas();
  renderTextLayersUI();
  updateActiveItemFloatingBar();
  updatePriceDisplay();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast('Lienzo limpio. Podés comenzar tu diseño de cero.', 'fa-trash-can');
}

// Plantilla inicial
function applyDefaultProductTemplate() {
  const { cx, cy, rRing } = STUDIO_CONFIG;
  studio.items = [
    {
      id: 'text_default_1',
      type: 'text',
      text: 'MATES RÍO',
      font: 'Cinzel',
      fontSize: 22,
      arcPosition: 'top',
      angle: 270,
      radius: rRing,
      rotation: 0,
      scale: 1.0,
      x: cx,
      y: cy - rRing
    },
    {
      id: 'icon_default_1',
      type: 'icon',
      graphicId: 'soldemayo',
      name: 'Sol de Mayo',
      file: 'assets/images/designs/soldemayo.svg',
      angle: 90,
      radius: rRing,
      rotation: 0,
      scale: 1.15,
      x: cx,
      y: cy + rRing
    }
  ];
  studio.activeItemId = 'text_default_1';
}

// Ranuras cinceladas
function selectCircularLines(mode) {
  studio.circularLines = mode;
  document.querySelectorAll('.lines-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lines') === mode);
  });
  renderVirolaCanvas();
}

function setMetalFinish(metal) {
  studio.metalFinish = metal;
  const alpacaBtn = document.getElementById('metal-alpaca-btn');
  const aceroBtn = document.getElementById('metal-acero-btn');
  if (alpacaBtn) alpacaBtn.classList.toggle('active', metal === 'alpaca');
  if (aceroBtn) aceroBtn.classList.toggle('active', metal === 'acero');
  renderVirolaCanvas();
  if (studio.viewMode === '360') render360Canvas();
}

function toggleSnappingGuides() {
  studio.snappingEnabled = !studio.snappingEnabled;
  const btn = document.getElementById('toggle-snapping-btn');
  const canvasBtn = document.getElementById('canvas-snap-btn');
  if (btn) btn.classList.toggle('active', studio.snappingEnabled);
  if (canvasBtn) canvasBtn.classList.toggle('active', studio.snappingEnabled);
  showNotificationToast(
    studio.snappingEnabled ? 'Guías magnéticas de imán activadas' : 'Snapping libre desactivado',
    studio.snappingEnabled ? 'fa-magnet' : 'fa-hand'
  );
  renderVirolaCanvas();
}

function toggleClipToMetal() {
  studio.clipToMetal = !studio.clipToMetal;
  const btn = document.getElementById('toggle-clipping-btn');
  if (btn) btn.classList.toggle('active', studio.clipToMetal);
  showNotificationToast(
    studio.clipToMetal ? 'Recorte visual al metal activo' : 'Recorte visual libre activo',
    'fa-crop-simple'
  );
  renderVirolaCanvas();
}

function setPurchaseType(type) {
  studio.purchaseType = type;
  const webBtn = document.getElementById('purchase-type-web-btn');
  const localBtn = document.getElementById('purchase-type-local-btn');
  if (webBtn) webBtn.classList.toggle('active', type === 'web');
  if (localBtn) localBtn.classList.toggle('active', type === 'local');
}

// Finalizar y agregar al carrito
function finalizeAndAddToCart() {
  const prod = PRODUCTS_CATALOG[studio.activeProduct];
  const model = prod.models.find(m => m.id === studio.selectedMateId) || prod.models[0];

  const customSummary = studio.items.map(i => {
    if (i.type === 'text') return `Texto: "${i.text}" (${i.font})`;
    return `Diseño: ${i.name}`;
  }).join(' | ');

  const cartItem = {
    id: `${model.id}_custom_${Date.now()}`,
    productId: model.id,
    name: `${model.name} (Personalizado en Vivo)`,
    price: model.price,
    quantity: 1,
    image: model.image,
    customization: {
      productType: prod.name,
      modelName: model.name,
      metalFinish: studio.metalFinish,
      circularLines: studio.circularLines,
      summary: customSummary,
      itemsCount: studio.items.length,
      purchaseType: studio.purchaseType,
      engravingFee: 0 // Bonificado
    }
  };

  // Agregar al carrito global si existe la función en app.js
  if (typeof addToCart === 'function') {
    addToCart(cartItem);
  } else {
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('mates_rio_cart')) || [];
    } catch(e) { cart = []; }
    cart.push(cartItem);
    localStorage.setItem('mates_rio_cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') updateCartBadge();
  }

  showNotificationToast(`¡${model.name} personalizado agregado al carrito!`, 'fa-shopping-bag');
  if (typeof openCartDrawer === 'function') {
    setTimeout(openCartDrawer, 600);
  }
}

// Descargar archivo SVG vectorial para máquina CNC láser
function downloadVectorLaserFile() {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg) return;

  const clone = svg.cloneNode(true);
  clone.querySelectorAll('.virola-handle').forEach(h => h.remove());
  clone.querySelectorAll('.virola-snapping-guides-layer').forEach(g => g.remove());

  const serializer = new XMLSerializer();
  const svgBlob = new Blob([serializer.serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grabado_cnc_${studio.activeProduct}_${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotificationToast('Vector SVG CNC generado y descargado', 'fa-file-arrow-down');
}

// Notificación Toast de diseño
function showNotificationToast(msg, icon = 'fa-check') {
  let toast = document.getElementById('studio-toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'studio-toast-notification';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      background: rgba(22, 17, 13, 0.96);
      border: 1.5px solid var(--accent-gold);
      color: #f5f2ec;
      padding: 12px 20px;
      border-radius: 40px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.6);
      font-size: 0.82rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      backdrop-filter: blur(8px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform: translateY(60px);
      opacity: 0;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas ${icon}" style="color: var(--accent-gold); font-size: 1rem;"></i> <span>${escapeHtml(msg)}</span>`;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  if (window._studioToastTimer) clearTimeout(window._studioToastTimer);
  window._studioToastTimer = setTimeout(() => {
    toast.style.transform = 'translateY(60px)';
    toast.style.opacity = '0';
  }, 2600);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
