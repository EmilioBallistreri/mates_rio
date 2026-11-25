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

// Helper para generar emojis estilo WhatsApp en formato SVG vectorial limpio
function makeEmojiSvgDataUrl(emojiChar) {
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="54" font-size="68" text-anchor="middle" dominant-baseline="central" font-family="'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif">${emojiChar}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr);
}

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
  emojis: {
    name: '😊 Emojis WhatsApp',
    items: [
      { id: 'emoji_mate', name: 'Mate 🧉', file: makeEmojiSvgDataUrl('🧉') },
      { id: 'emoji_corazon', name: 'Corazón ❤️', file: makeEmojiSvgDataUrl('❤️') },
      { id: 'emoji_fuego', name: 'Fuego 🔥', file: makeEmojiSvgDataUrl('🔥') },
      { id: 'emoji_estrella', name: 'Estrella ⭐', file: makeEmojiSvgDataUrl('⭐') },
      { id: 'emoji_corona', name: 'Corona 👑', file: makeEmojiSvgDataUrl('👑') },
      { id: 'emoji_trofeo', name: 'Trofeo 🏆', file: makeEmojiSvgDataUrl('🏆') },
      { id: 'emoji_futbol', name: 'Fútbol ⚽', file: makeEmojiSvgDataUrl('⚽') },
      { id: 'emoji_sol', name: 'Sol ☀️', file: makeEmojiSvgDataUrl('☀️') },
      { id: 'emoji_luna', name: 'Luna 🌙', file: makeEmojiSvgDataUrl('🌙') },
      { id: 'emoji_destellos', name: 'Destellos ✨', file: makeEmojiSvgDataUrl('✨') },
      { id: 'emoji_manos', name: 'Manos 🙌', file: makeEmojiSvgDataUrl('🙌') },
      { id: 'emoji_aplausos', name: 'Aplausos 👏', file: makeEmojiSvgDataUrl('👏') },
      { id: 'emoji_apreton', name: 'Amistad 🤝', file: makeEmojiSvgDataUrl('🤝') },
      { id: 'emoji_fuerza', name: 'Fuerza 💪', file: makeEmojiSvgDataUrl('💪') },
      { id: 'emoji_brindis', name: 'Brindis 🥂', file: makeEmojiSvgDataUrl('🥂') },
      { id: 'emoji_fiesta', name: 'Fiesta 🎉', file: makeEmojiSvgDataUrl('🎉') },
      { id: 'emoji_trebol', name: 'Trébol 🍀', file: makeEmojiSvgDataUrl('🍀') },
      { id: 'emoji_infinito', name: 'Infinito ♾️', file: makeEmojiSvgDataUrl('♾️') },
      { id: 'emoji_musica', name: 'Música 🎵', file: makeEmojiSvgDataUrl('🎵') },
      { id: 'emoji_huella', name: 'Huellas 🐾', file: makeEmojiSvgDataUrl('🐾') },
      { id: 'emoji_perro', name: 'Perro 🐶', file: makeEmojiSvgDataUrl('🐶') },
      { id: 'emoji_gato', name: 'Gato 🐱', file: makeEmojiSvgDataUrl('🐱') },
      { id: 'emoji_mundo', name: 'Mundo 🌎', file: makeEmojiSvgDataUrl('🌎') },
      { id: 'emoji_avion', name: 'Viajes ✈️', file: makeEmojiSvgDataUrl('✈️') },
      { id: 'emoji_ancla', name: 'Ancla ⚓', file: makeEmojiSvgDataUrl('⚓') },
      { id: 'emoji_rayo', name: 'Rayo ⚡', file: makeEmojiSvgDataUrl('⚡') },
      { id: 'emoji_diamante', name: 'Diamante 💎', file: makeEmojiSvgDataUrl('💎') },
      { id: 'emoji_sonrisa', name: 'Sonrisa 😊', file: makeEmojiSvgDataUrl('😊') },
      { id: 'emoji_enamorado', name: 'Enamorado 😍', file: makeEmojiSvgDataUrl('😍') },
      { id: 'emoji_festejo', name: 'Festejo 🥳', file: makeEmojiSvgDataUrl('🥳') }
    ]
  },
  plantillas: {
    name: '📐 Plantillas',
    items: [
      {
        id: 'tpl_papa_leon_xiv',
        isTemplate: true,
        templateId: 'tpl_papa_leon_xiv',
        name: 'Papa León XIV',
        subtitle: 'Plantilla Completa Editable',
        file: 'assets/images/designs/papa_leon/thumb_papa_leon.png'
      }
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

// 50 Tipografías Orfebres Diferentes
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
  { id: 'UnifrakturMaguntia', name: 'UnifrakturMaguntia' },
  { id: 'Merriweather', name: 'Merriweather' },
  { id: 'EB Garamond', name: 'EB Garamond' },
  { id: 'Libre Baskerville', name: 'Libre Baskerville' },
  { id: 'Bodoni Moda', name: 'Bodoni Moda' },
  { id: 'Prata', name: 'Prata' },
  { id: 'DM Serif Display', name: 'DM Serif Display' },
  { id: 'Rozha One', name: 'Rozha One' },
  { id: 'Yeseva One', name: 'Yeseva One' },
  { id: 'Ultra', name: 'Ultra' },
  { id: 'Alfa Slab One', name: 'Alfa Slab One' },
  { id: 'Righteous', name: 'Righteous' },
  { id: 'Fredoka', name: 'Fredoka' },
  { id: 'Pacifico', name: 'Pacifico' },
  { id: 'Lobster', name: 'Lobster' },
  { id: 'Caveat', name: 'Caveat' },
  { id: 'Kaushan Script', name: 'Kaushan Script' },
  { id: 'Courgette', name: 'Courgette' },
  { id: 'Allura', name: 'Allura' },
  { id: 'Tangerine', name: 'Tangerine' },
  { id: 'Yellowtail', name: 'Yellowtail' },
  { id: 'Cookie', name: 'Cookie' },
  { id: 'Amatic SC', name: 'Amatic SC' },
  { id: 'Permanent Marker', name: 'Permanent Marker' },
  { id: 'Shadows Into Light', name: 'Shadows Into Light' },
  { id: 'Indie Flower', name: 'Indie Flower' }
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
  loadDynamicCustomizerAssets();
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
  initCanvasDragDrop();
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

  if (tabKey === 'templates') {
    renderRibbonTemplatesForActiveProduct();
  }

  // Cerrar dropdown de fuentes si estuviera abierto
  const fontDropdown = document.getElementById('ribbon-font-dropdown');
  if (fontDropdown) fontDropdown.classList.remove('open');
}

function openTemplatesRibbonTab() {
  switchRibbonTab('templates');
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
    <div style="padding: 6px 10px 10px; border-bottom: 1px solid #e4e4e7; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
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
          ${isSel ? '<i class="fas fa-check" style="color: #ffffff; font-size: 0.85rem;"></i>' : ''}
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
  renderRibbonTemplatesForActiveProduct();

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
  const items = VECTOR_CATEGORIES[catKey].items || [];

  if (items.length === 0) {
    container.innerHTML = `
      <span style="font-size: 0.78rem; color: var(--text-muted); padding: 0 14px; font-weight: 600; white-space: nowrap;">
        <i class="fas fa-layer-group" style="margin-right: 6px;"></i>Próximamente: Plantillas prediseñadas disponibles en este apartado
      </span>
    `;
    return;
  }

  if (catKey === 'plantillas') {
    container.innerHTML = items.map(item => `
      <button type="button" class="ribbon-template-card-btn" onclick="applyVirolaPresetTemplate('${item.templateId || item.id}')" title="Aplicar plantilla completa: ${item.name}">
        <span class="ribbon-template-thumb">
          <img src="${item.file}" alt="${item.name}" loading="lazy" />
        </span>
        <span class="ribbon-template-info">
          <strong class="ribbon-template-title">${item.name}</strong>
          <small class="ribbon-template-sub">${item.subtitle || 'Plantilla Editable'}</small>
        </span>
      </button>
    `).join('');
    return;
  }

  // ITEM 2: ÚNICAMENTE ÍCONOS, SIN NINGÚN NOMBRE O TEXTO (Arrastrables al lienzo)
  container.innerHTML = items.map(item => `
    <button type="button" class="ribbon-icon-quick-btn" 
      draggable="true" 
      ondragstart="handleRibbonDesignDragStart(event, '${item.id}', '${catKey}')"
      onclick="addVectorToVirola('${item.id}', '${catKey}')" 
      title="${item.name} • Hacé clic o arrastralo directamente a la superficie">
      <img src="${item.file}" alt="${item.name}" loading="lazy" draggable="false" />
    </button>
  `).join('');
}

// ==========================================================================
// SISTEMA DE PLANTILLAS PREDISEÑADAS EXCLUSIVAS POR PRODUCTO (MATE, TERMO, CAJA)
// ==========================================================================
const PRODUCT_TEMPLATES = {
  mate: [
    {
      id: 'tpl_papa_leon_xiv',
      templateId: 'tpl_papa_leon_xiv',
      name: 'Papa León XIV',
      subtitle: 'Virola con Arcos & Cruz',
      file: 'assets/images/designs/papa_leon/thumb_papa_leon.png',
      apply: () => applyVirolaPresetTemplate('tpl_papa_leon_xiv')
    },
    {
      id: 'tpl_guarda_pampa',
      name: 'Guarda Pampa Tradicional',
      subtitle: 'Guarda Criolla Perimetral',
      file: 'assets/images/designs/criollos/sol_mayo.svg',
      apply: () => applyVirolaGuardaPampaTemplate()
    },
    {
      id: 'tpl_campeones_mundo',
      name: '3 Estrellas AFA',
      subtitle: 'Campeones del Mundo',
      file: 'assets/images/designs/deportes/escudo_afa.svg',
      apply: () => applyVirolaCampeonesTemplate()
    }
  ],
  caja: [
    {
      id: 'tpl_caja_mates_rio',
      name: 'Tapa Mates Río',
      subtitle: 'Plantilla de Caja Vertical',
      file: 'assets/images/designs/criollos/guarda_lineal.svg',
      apply: () => applyCajaMatesRioTemplate()
    },
    {
      id: 'tpl_caja_dedicatoria',
      name: 'Dedicatoria & Escudo',
      subtitle: 'Grabado Láser en Madera',
      file: 'assets/images/designs/criollos/escudo_nacional.svg',
      apply: () => applyCajaDedicatoriaTemplate()
    }
  ],
  termo: [
    {
      id: 'tpl_termo_franja',
      name: 'Franja Gaucha 360°',
      subtitle: 'Plantilla de Termo 1L',
      file: 'assets/images/designs/criollos/guarda_pampa.svg',
      apply: () => applyTermoFranjaTemplate()
    },
    {
      id: 'tpl_termo_escudo',
      name: 'Escudo Nacional Argentino',
      subtitle: 'Grabado sobre Acero Inox',
      file: 'assets/images/designs/criollos/escudo_nacional.svg',
      apply: () => applyTermoEscudoTemplate()
    }
  ]
};

// ==========================================================================
// INTEGRACIÓN DINÁMICA DE ÍCONOS Y PLANTILLAS DEL PANEL DE ADMINISTRACIÓN
// ==========================================================================
const INITIAL_STATIC_VECTOR_CATEGORIES = JSON.parse(JSON.stringify(VECTOR_CATEGORIES));
const INITIAL_STATIC_PRODUCT_TEMPLATES = {
  mate: [...PRODUCT_TEMPLATES.mate],
  termo: [...PRODUCT_TEMPLATES.termo],
  caja: [...PRODUCT_TEMPLATES.caja]
};

function applyGenericCustomTemplate(tpl) {
  if (!tpl) return;
  const targetProduct = tpl.product || 'mate';
  if (studio.activeProduct !== targetProduct) {
    if (typeof switchActiveProduct === 'function') {
      switchActiveProduct(targetProduct);
    } else {
      studio.activeProduct = targetProduct;
    }
  }

  if (typeof saveStudioHistoryState === 'function') {
    saveStudioHistoryState();
  }

  const { cx, cy, rRing } = STUDIO_CONFIG;
  const ts = Date.now();

  const newItems = (tpl.items || []).map((elem, idx) => {
    const itemId = `tpl_${elem.type || 'item'}_${ts}_${idx}_${Math.floor(Math.random() * 1000)}`;
    const loc = elem.location || (idx === 0 ? 'top' : (idx === 1 ? 'bottom' : 'center'));

    if (elem.type === 'text') {
      const isTop = loc === 'top' || elem.angle === 90;
      const angle = isTop ? 90 : (loc === 'bottom' ? 270 : (elem.angle || 90));
      return {
        id: itemId,
        type: 'text',
        text: elem.text || 'TEXTO',
        font: elem.font || 'Cinzel',
        fontSize: elem.fontSize || 20,
        scale: elem.scale || 1.0,
        rotation: elem.rotation || 0,
        location: loc,
        arcPosition: isTop ? 'top' : 'bottom',
        angle: angle,
        radius: elem.radius || rRing,
        x: targetProduct === 'mate' ? cx : (elem.x || cx),
        y: targetProduct === 'mate' ? cy : (elem.y || (isTop ? 150 : (loc === 'bottom' ? 350 : 250)))
      };
    } else {
      // Icon
      const isTop = loc === 'top' || elem.angle === 90;
      const isBottom = loc === 'bottom' || elem.angle === 270;
      const angle = isTop ? 90 : (isBottom ? 270 : (elem.angle || 0));
      const iconRadius = (loc === 'center') ? 0 : (elem.radius || rRing);

      let calcX = cx;
      let calcY = cy;
      if (targetProduct === 'mate') {
        const rad = (angle - 90) * (Math.PI / 180);
        calcX = cx + iconRadius * Math.cos(rad);
        calcY = cy + iconRadius * Math.sin(rad);
      } else {
        calcX = elem.x || cx;
        calcY = elem.y || (isTop ? 180 : (isBottom ? 320 : 250));
      }

      return {
        id: itemId,
        type: 'icon',
        graphicId: elem.graphicId || elem.id || 'custom_icon',
        name: elem.name || 'Grabado',
        file: elem.file,
        fileBlack: elem.fileBlack || elem.file,
        fileWhite: elem.fileWhite || elem.file,
        scale: elem.scale || 1.1,
        angle: angle,
        radius: iconRadius,
        rotation: elem.rotation || 0,
        x: calcX,
        y: calcY
      };
    }
  });

  studio.items = newItems;
  studio.activeItemId = studio.items.length > 0 ? studio.items[0].id : null;

  renderVirolaCanvas();
  if (typeof renderTextLayersUI === 'function') renderTextLayersUI();
  if (typeof updateActiveItemFloatingBar === 'function') updateActiveItemFloatingBar();
  if (typeof updatePriceDisplay === 'function') updatePriceDisplay();
  if (typeof updateFloatingBarValues === 'function') updateFloatingBarValues();
  if (typeof renderRibbonHistoryControls === 'function') renderRibbonHistoryControls();
  if (studio.viewMode === '360' && typeof render360Canvas === 'function') render360Canvas();

  showNotificationToast(`Plantilla "${tpl.name}" aplicada con éxito`, 'fa-check');
}

function renderDynamicRibbonCategoryButtons() {
  const panel = document.getElementById('ribbon-panel-icons');
  if (!panel) return;
  const groupContent = panel.querySelector('.ribbon-group:first-child .ribbon-group-content');
  if (!groupContent) return;

  Object.keys(VECTOR_CATEGORIES).forEach(catKey => {
    if (catKey === 'plantillas') return;
    let existingBtn = groupContent.querySelector(`[data-cat-filter="${catKey}"]`);
    if (!existingBtn) {
      const newBtn = document.createElement('button');
      newBtn.type = 'button';
      newBtn.className = `ribbon-btn ${studio.activeCategory === catKey ? 'active' : ''}`;
      newBtn.setAttribute('data-cat-filter', catKey);
      newBtn.onclick = () => filterRibbonDesigns(catKey);
      const iconClass = catKey === 'deportes' ? 'fa-futbol' :
                        catKey === 'criollo' ? 'fa-sun' :
                        catKey === 'fauna' ? 'fa-feather' :
                        catKey === 'simbolos' ? 'fa-star' :
                        catKey === 'emojis' ? 'fa-face-smile' : 'fa-shapes';
      newBtn.innerHTML = `<i class="fas ${iconClass}"></i> ${VECTOR_CATEGORIES[catKey].name || catKey}`;
      groupContent.appendChild(newBtn);
    }
  });
}

function loadDynamicCustomizerAssets() {
  // 1. Cargar íconos guardados y eliminados
  const deletedIcons = (() => {
    try {
      const raw = localStorage.getItem('mates_rio_deleted_customizer_icons');
      return raw ? (JSON.parse(raw) || []) : [];
    } catch (e) { return []; }
  })();

  const customIcons = (() => {
    try {
      const raw = localStorage.getItem('mates_rio_customizer_icons');
      return raw ? (JSON.parse(raw) || []) : [];
    } catch (e) { return []; }
  })();

  // Restaurar categorías base eliminando IDs borrados
  for (const k of Object.keys(VECTOR_CATEGORIES)) {
    delete VECTOR_CATEGORIES[k];
  }
  for (const k of Object.keys(INITIAL_STATIC_VECTOR_CATEGORIES)) {
    VECTOR_CATEGORIES[k] = {
      name: INITIAL_STATIC_VECTOR_CATEGORIES[k].name,
      items: INITIAL_STATIC_VECTOR_CATEGORIES[k].items.filter(i => !deletedIcons.includes(i.id))
    };
  }

  // Incorporar íconos personalizados de admin
  customIcons.forEach(icon => {
    if (deletedIcons.includes(icon.id)) return;
    const cat = icon.category || 'simbolos';
    if (!VECTOR_CATEGORIES[cat]) {
      const catDisplayName = cat.charAt(0).toUpperCase() + cat.slice(1);
      VECTOR_CATEGORIES[cat] = {
        name: icon.categoryName || catDisplayName,
        items: []
      };
    }
    const existingIdx = VECTOR_CATEGORIES[cat].items.findIndex(i => i.id === icon.id);
    const itemData = {
      id: icon.id,
      name: icon.name,
      file: icon.file,
      fileBlack: icon.fileBlack || icon.file,
      fileWhite: icon.fileWhite || icon.file,
      isCustom: true
    };
    if (existingIdx !== -1) {
      VECTOR_CATEGORIES[cat].items[existingIdx] = itemData;
    } else {
      VECTOR_CATEGORIES[cat].items.push(itemData);
    }
  });

  // 2. Cargar plantillas guardadas y eliminadas
  const deletedTemplates = (() => {
    try {
      const raw = localStorage.getItem('mates_rio_deleted_customizer_templates');
      return raw ? (JSON.parse(raw) || []) : [];
    } catch (e) { return []; }
  })();

  const customTemplates = (() => {
    try {
      const raw = localStorage.getItem('mates_rio_customizer_templates');
      return raw ? (JSON.parse(raw) || []) : [];
    } catch (e) { return []; }
  })();

  ['mate', 'termo', 'caja'].forEach(prod => {
    PRODUCT_TEMPLATES[prod] = (INITIAL_STATIC_PRODUCT_TEMPLATES[prod] || []).filter(t => !deletedTemplates.includes(t.id));
  });

  customTemplates.forEach(tpl => {
    if (deletedTemplates.includes(tpl.id)) return;
    const prod = tpl.product || 'mate';
    if (!PRODUCT_TEMPLATES[prod]) PRODUCT_TEMPLATES[prod] = [];

    const existingIdx = PRODUCT_TEMPLATES[prod].findIndex(t => t.id === tpl.id);
    const tplObj = {
      id: tpl.id,
      name: tpl.name,
      subtitle: tpl.subtitle || 'Plantilla de Grabado',
      file: tpl.file || 'assets/images/designs/papa_leon/thumb_papa_leon.png',
      product: prod,
      items: tpl.items || [],
      isCustom: true,
      apply: () => applyGenericCustomTemplate(tpl)
    };
    if (existingIdx !== -1) {
      PRODUCT_TEMPLATES[prod][existingIdx] = tplObj;
    } else {
      PRODUCT_TEMPLATES[prod].push(tplObj);
    }
  });

  // 3. Renderizar botones de categorías si se crearon nuevas
  renderDynamicRibbonCategoryButtons();

  // 4. Actualizar carruseles de ribbon y catálogo modal
  if (typeof renderRibbonQuickDesigns === 'function') {
    renderRibbonQuickDesigns(studio.activeCategory || 'deportes');
  }
  if (typeof renderRibbonTemplatesForActiveProduct === 'function') {
    renderRibbonTemplatesForActiveProduct();
  }
  if (typeof renderModalCatalogGrid === 'function') {
    renderModalCatalogGrid('all');
  }
}

window.loadDynamicCustomizerAssets = loadDynamicCustomizerAssets;
window.applyGenericCustomTemplate = applyGenericCustomTemplate;

window.addEventListener('storage', (e) => {
  if (e.key === 'mates_rio_customizer_icons' || 
      e.key === 'mates_rio_customizer_templates' ||
      e.key === 'mates_rio_deleted_customizer_icons' ||
      e.key === 'mates_rio_deleted_customizer_templates') {
    loadDynamicCustomizerAssets();
  }
});

window.addEventListener('storeStateUpdated', () => {
  loadDynamicCustomizerAssets();
});

function renderRibbonTemplatesForActiveProduct() {
  const container = document.getElementById('ribbon-quick-templates');
  const labelEl = document.getElementById('templates-product-label');
  const instrEl = document.getElementById('ribbon-templates-instruction');
  if (!container) return;

  const prodKey = studio.activeProduct || 'mate';
  const prodNames = { mate: 'Virola de Mate', termo: 'Termo de Acero', caja: 'Caja de Presentación' };
  if (labelEl) labelEl.textContent = prodNames[prodKey] || 'Plantillas';
  if (instrEl) instrEl.textContent = `Plantillas prediseñadas para ${prodNames[prodKey] || 'este producto'}`;

  const list = PRODUCT_TEMPLATES[prodKey] || [];
  if (list.length === 0) {
    container.innerHTML = `<span style="font-size: 0.8rem; color: #71717a; padding: 10px;">Próximamente plantillas para este producto</span>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <button type="button" class="ribbon-template-card-btn" onclick="applyProductTemplate('${prodKey}', '${item.id}')" title="Aplicar plantilla: ${item.name}">
      <span class="ribbon-template-thumb">
        <img src="${item.file}" alt="${item.name}" loading="lazy" />
      </span>
      <span class="ribbon-template-info">
        <strong class="ribbon-template-title">${item.name}</strong>
        <small class="ribbon-template-sub">${item.subtitle || 'Plantilla Editable'}</small>
      </span>
    </button>
  `).join('');
}

function applyProductTemplate(prodKey, tplId) {
  const list = PRODUCT_TEMPLATES[prodKey] || [];
  const tpl = list.find(t => t.id === tplId);
  if (tpl && typeof tpl.apply === 'function') {
    tpl.apply();
  }
}

function scrollRibbonTemplates(delta) {
  const track = document.getElementById('ribbon-quick-templates');
  if (track) track.scrollBy({ left: delta, behavior: 'smooth' });
}

function applyVirolaGuardaPampaTemplate() {
  saveStudioHistoryState();
  studio.items = [
    {
      id: `tpl_txt_top_${Date.now()}`,
      type: 'text',
      text: 'TRADICIÓN & COSTUMBRES',
      font: 'Cinzel',
      fontSize: 20,
      scale: 1.0,
      location: 'top',
      angle: 90,
      radius: STUDIO_CONFIG.rRing,
      rotation: 0
    },
    {
      id: `tpl_sol_${Date.now()}`,
      type: 'icon',
      graphicId: 'sol_mayo',
      name: 'Sol Criollo',
      file: 'assets/images/designs/criollos/sol_mayo.svg',
      fileBlack: 'assets/images/designs/criollos/sol_mayo.svg',
      fileWhite: 'assets/images/designs/criollos/sol_mayo.svg',
      scale: 1.05,
      angle: 270,
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      x: STUDIO_CONFIG.cx,
      y: STUDIO_CONFIG.cy + STUDIO_CONFIG.rRing
    }
  ];
  studio.activeItemId = studio.items[0].id;
  renderVirolaCanvas();
  showNotificationToast('Plantilla Guarda Pampa aplicada con éxito', 'fa-check');
}

function applyVirolaCampeonesTemplate() {
  saveStudioHistoryState();
  studio.items = [
    {
      id: `tpl_txt_camp_${Date.now()}`,
      type: 'text',
      text: 'CAMPEONES DEL MUNDO',
      font: 'Cinzel',
      fontSize: 19,
      scale: 1.0,
      location: 'top',
      angle: 90,
      radius: STUDIO_CONFIG.rRing,
      rotation: 0
    },
    {
      id: `tpl_afa_${Date.now()}`,
      type: 'icon',
      graphicId: 'escudo_afa',
      name: 'Escudo AFA 3 Estrellas',
      file: 'assets/images/designs/deportes/escudo_afa.svg',
      fileBlack: 'assets/images/designs/deportes/escudo_afa.svg',
      fileWhite: 'assets/images/designs/deportes/escudo_afa.svg',
      scale: 1.15,
      angle: 270,
      radius: STUDIO_CONFIG.rRing,
      rotation: 0,
      x: STUDIO_CONFIG.cx,
      y: STUDIO_CONFIG.cy + STUDIO_CONFIG.rRing
    }
  ];
  studio.activeItemId = studio.items[0].id;
  renderVirolaCanvas();
  showNotificationToast('Plantilla 3 Estrellas AFA aplicada con éxito', 'fa-check');
}

function applyCajaMatesRioTemplate() {
  if (studio.activeProduct !== 'caja') {
    switchActiveProduct('caja');
  }
  saveStudioHistoryState();
  const { cx } = STUDIO_CONFIG;
  studio.items = [
    {
      id: `tpl_caja_txt1_${Date.now()}`,
      type: 'text',
      text: 'MATES RÍO',
      font: 'Cinzel',
      fontSize: 26,
      scale: 1.1,
      x: cx,
      y: 140,
      rotation: 0
    },
    {
      id: `tpl_caja_ic1_${Date.now()}`,
      type: 'icon',
      graphicId: 'cruz_pampa',
      name: 'Cruz Pampa',
      file: 'assets/images/designs/simbolos/cruz_pampa.svg',
      fileWhite: 'assets/images/designs/simbolos/cruz_pampa.svg',
      scale: 1.4,
      x: cx,
      y: 250,
      rotation: 0
    },
    {
      id: `tpl_caja_txt2_${Date.now()}`,
      type: 'text',
      text: 'INDUSTRIA ARGENTINA',
      font: 'Montserrat',
      fontSize: 13,
      scale: 1.0,
      x: cx,
      y: 350,
      rotation: 0
    }
  ];
  studio.activeItemId = studio.items[0].id;
  renderVirolaCanvas();
  showNotificationToast('Plantilla Tapa Mates Río aplicada a la Caja', 'fa-box');
}

function applyCajaDedicatoriaTemplate() {
  if (studio.activeProduct !== 'caja') {
    switchActiveProduct('caja');
  }
  saveStudioHistoryState();
  const { cx } = STUDIO_CONFIG;
  studio.items = [
    {
      id: `tpl_caja_dedic_${Date.now()}`,
      type: 'text',
      text: 'CON TODO NUESTRO AFECTO',
      font: 'Cinzel',
      fontSize: 17,
      scale: 1.0,
      x: cx,
      y: 150,
      rotation: 0
    },
    {
      id: `tpl_caja_esc_${Date.now()}`,
      type: 'icon',
      graphicId: 'escudo_nacional',
      name: 'Escudo Nacional',
      file: 'assets/images/designs/criollos/escudo_nacional.svg',
      fileWhite: 'assets/images/designs/criollos/escudo_nacional.svg',
      scale: 1.35,
      x: cx,
      y: 255,
      rotation: 0
    },
    {
      id: `tpl_caja_fecha_${Date.now()}`,
      type: 'text',
      text: 'FAMILIA & AMIGOS • 2026',
      font: 'Montserrat',
      fontSize: 14,
      scale: 1.0,
      x: cx,
      y: 345,
      rotation: 0
    }
  ];
  studio.activeItemId = studio.items[0].id;
  renderVirolaCanvas();
  showNotificationToast('Plantilla Dedicatoria aplicada a la Caja', 'fa-box');
}

function applyTermoFranjaTemplate() {
  if (studio.activeProduct !== 'termo') {
    switchActiveProduct('termo');
  }
  saveStudioHistoryState();
  const { cx } = STUDIO_CONFIG;
  studio.items = [
    {
      id: `tpl_termo_nom_${Date.now()}`,
      type: 'text',
      text: 'RÍO CEBALLOS',
      font: 'Cinzel',
      fontSize: 22,
      scale: 1.0,
      x: cx,
      y: 170,
      rotation: 0
    },
    {
      id: `tpl_termo_ic_${Date.now()}`,
      type: 'icon',
      graphicId: 'sol_mayo',
      name: 'Sol Criollo',
      file: 'assets/images/designs/criollos/sol_mayo.svg',
      fileBlack: 'assets/images/designs/criollos/sol_mayo.svg',
      scale: 1.3,
      x: cx,
      y: 260,
      rotation: 0
    }
  ];
  studio.activeItemId = studio.items[0].id;
  renderVirolaCanvas();
  showNotificationToast('Plantilla Franja Gaucha aplicada al Termo', 'fa-mug-hot');
}

function applyTermoEscudoTemplate() {
  if (studio.activeProduct !== 'termo') {
    switchActiveProduct('termo');
  }
  saveStudioHistoryState();
  const { cx } = STUDIO_CONFIG;
  studio.items = [
    {
      id: `tpl_termo_esc_${Date.now()}`,
      type: 'icon',
      graphicId: 'escudo_nacional',
      name: 'Escudo Nacional',
      file: 'assets/images/designs/criollos/escudo_nacional.svg',
      fileBlack: 'assets/images/designs/criollos/escudo_nacional.svg',
      scale: 1.45,
      x: cx,
      y: 220,
      rotation: 0
    },
    {
      id: `tpl_termo_sub_${Date.now()}`,
      type: 'text',
      text: 'REPÚBLICA ARGENTINA',
      font: 'Cinzel',
      fontSize: 16,
      scale: 1.0,
      x: cx,
      y: 310,
      rotation: 0
    }
  ];
  studio.activeItemId = studio.items[0].id;
  renderVirolaCanvas();
  showNotificationToast('Plantilla Escudo Nacional aplicada al Termo', 'fa-mug-hot');
}

// ==========================================================================
// SISTEMA DE PLANTILLAS PREDISEÑADAS COMPLETAS Y 100% EDITABLES
// ==========================================================================
function getPapaLeonTemplateItems() {
  const ts = Date.now();
  return [
    // 1. Arcos dobles superiores que enmarcan "PAPA LEÓN XIV"
    {
      id: `tpl_arco_sup_${ts}_1`,
      type: 'icon',
      graphicId: 'papa_arco_sup',
      name: 'Arco Doble Superior',
      file: 'assets/images/designs/papa_leon/papa_arco_sup.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_arco_sup.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_arco_sup_white.png',
      svgArc: { gap: 2.2, spanDeg: 92 },
      angle: 270,
      radius: 221.2,
      rotation: 0,
      scale: 1.0,
      x: 250,
      y: 28.8
    },
    {
      id: `tpl_arco_inf_${ts}_2`,
      type: 'icon',
      graphicId: 'papa_arco_inf',
      name: 'Arco Doble Interior',
      file: 'assets/images/designs/papa_leon/papa_arco_inf.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_arco_inf.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_arco_inf_white.png',
      svgArc: { gap: 2.2, spanDeg: 86 },
      angle: 270,
      radius: 169.1,
      rotation: 0,
      scale: 1.0,
      x: 250,
      y: 80.9
    },
    // 2. Íconos superiores izquierdos (Biblia, Cruz, Sol)
    {
      id: `tpl_biblia_${ts}_3`,
      type: 'icon',
      graphicId: 'papa_biblia',
      name: 'Santa Biblia',
      file: 'assets/images/designs/papa_leon/papa_biblia.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_biblia.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_biblia_white.png',
      wRatio: 0.9,
      hRatio: 1.0,
      angle: 217,
      radius: 205.2,
      rotation: 0,
      scale: 0.98,
      x: 86.15,
      y: 126.44
    },
    {
      id: `tpl_cruz_${ts}_4`,
      type: 'icon',
      graphicId: 'papa_cruz',
      name: 'Cruz Cristiana',
      file: 'assets/images/designs/papa_leon/papa_cruz.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_cruz.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_cruz_white.png',
      wRatio: 0.857,
      hRatio: 1.0,
      angle: 205,
      radius: 213.2,
      rotation: 0,
      scale: 0.86,
      x: 56.07,
      y: 161.36
    },
    {
      id: `tpl_sol_${ts}_5`,
      type: 'icon',
      graphicId: 'papa_sol',
      name: 'Sol Radiante',
      file: 'assets/images/designs/papa_leon/papa_sol.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_sol.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_sol_white.png',
      wRatio: 1.0,
      hRatio: 0.955,
      angle: 208,
      radius: 179.3,
      rotation: 0,
      scale: 1.07,
      x: 91.53,
      y: 166.2
    },
    // 3. Íconos superiores derechos (Paloma, Sagrado Corazón, Cáliz)
    {
      id: `tpl_paloma_${ts}_6`,
      type: 'icon',
      graphicId: 'papa_paloma',
      name: 'Paloma de la Paz',
      file: 'assets/images/designs/papa_leon/papa_paloma.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_paloma.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_paloma_white.png',
      wRatio: 0.727,
      hRatio: 1.0,
      angle: 322,
      radius: 208.7,
      rotation: 0,
      scale: 1.07,
      x: 414.92,
      y: 122.15
    },
    {
      id: `tpl_corazon_${ts}_7`,
      type: 'icon',
      graphicId: 'papa_corazon',
      name: 'Sagrado Corazón',
      file: 'assets/images/designs/papa_leon/papa_corazon.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_corazon.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_corazon_white.png',
      wRatio: 0.959,
      hRatio: 1.0,
      angle: 327,
      radius: 180.0,
      rotation: 0,
      scale: 1.20,
      x: 401.49,
      y: 152.77
    },
    {
      id: `tpl_caliz_${ts}_8`,
      type: 'icon',
      graphicId: 'papa_caliz',
      name: 'Cáliz Sagrado',
      file: 'assets/images/designs/papa_leon/papa_caliz.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_caliz.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_caliz_white.png',
      wRatio: 0.667,
      hRatio: 1.0,
      angle: 334,
      radius: 212.9,
      rotation: 0,
      scale: 0.74,
      x: 440.71,
      y: 155.45
    },
    // 4. Retratos laterales del Papa León XIV
    {
      id: `tpl_papa_izq_${ts}_9`,
      type: 'icon',
      graphicId: 'papa_izq',
      name: 'Papa León XIV (Ornamentos)',
      file: 'assets/images/designs/papa_leon/papa_izq.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_izq.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_izq_white.png',
      wRatio: 0.5425,
      hRatio: 1.0,
      angle: 179,
      radius: 187.0,
      rotation: 0,
      scale: 3.74,
      x: 63.05,
      y: 252.69
    },
    {
      id: `tpl_papa_der_${ts}_10`,
      type: 'icon',
      graphicId: 'papa_der',
      name: 'Papa León XIV (Retrato)',
      file: 'assets/images/designs/papa_leon/papa_der.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_der.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_der_white.png',
      wRatio: 0.4902,
      hRatio: 1.0,
      angle: 0,
      radius: 191.2,
      rotation: 0,
      scale: 3.74,
      x: 441.24,
      y: 249.46
    },
    // 5. Firuletes barrocos inferiores
    {
      id: `tpl_fir_izq_${ts}_11`,
      type: 'icon',
      graphicId: 'papa_firulete_izq',
      name: 'Firulete Izquierdo',
      file: 'assets/images/designs/papa_leon/papa_firulete_izq.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_firulete_izq.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_firulete_izq_white.png',
      wRatio: 0.9535,
      hRatio: 1.0,
      angle: 139,
      radius: 206.8,
      rotation: 0,
      scale: 2.10,
      x: 93.67,
      y: 385.37
    },
    {
      id: `tpl_fir_der_${ts}_12`,
      type: 'icon',
      graphicId: 'papa_firulete_der',
      name: 'Firulete Derecho',
      file: 'assets/images/designs/papa_leon/papa_firulete_der.png',
      fileBlack: 'assets/images/designs/papa_leon/papa_firulete_der.png',
      fileWhite: 'assets/images/designs/papa_leon/papa_firulete_der_white.png',
      wRatio: 0.7558,
      hRatio: 1.0,
      angle: 39,
      radius: 210.9,
      rotation: 0,
      scale: 2.10,
      x: 414.38,
      y: 382.15
    },
    // 6. Capas de texto editables (Superior e Inferiores)
    {
      id: `tpl_text_top_${ts}_13`,
      type: 'text',
      text: 'PAPA LEÓN XIV',
      font: 'Libre Baskerville',
      fontSize: 33,
      fontWeight: 700,
      letterSpacing: '1.2px',
      arcPosition: 'top',
      angle: 270,
      radius: 180,
      rotation: 0,
      scale: 1.0,
      x: 250,
      y: 70
    },
    {
      id: `tpl_text_bot1_${ts}_14`,
      type: 'text',
      text: '“No hay corazón demasiado roto',
      font: 'Libre Baskerville',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.2px',
      arcPosition: 'bottom',
      angle: 90,
      radius: 190,
      rotation: 0,
      scale: 1.0,
      x: 250,
      y: 440
    },
    {
      id: `tpl_text_bot2_${ts}_15`,
      type: 'text',
      text: 'para la misericordia”',
      font: 'Libre Baskerville',
      fontSize: 18.5,
      fontWeight: 700,
      letterSpacing: '0.3px',
      arcPosition: 'bottom',
      angle: 90,
      radius: 215,
      rotation: 0,
      scale: 1.0,
      x: 250,
      y: 465
    }
  ];
}

function applyVirolaPresetTemplate(templateId) {
  if (typeof saveStudioHistoryState === 'function') {
    saveStudioHistoryState();
  }

  // Asegurar que estamos en el Mate (virola circular) para que se ajuste directamente a la virola
  if (studio.activeProduct !== 'mate') {
    studio.activeProduct = 'mate';
    studio.selectedMateId = PRODUCTS_CATALOG.mate.defaultModel;
    renderProductSelectorCardsUI();
    renderModelsDropdown();
    updateStageBadge();
  }

  // Desactivar líneas genéricas porque la plantilla tiene sus propios arcos dobles
  studio.circularLines = 'no';
  document.querySelectorAll('.lines-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lines') === 'no');
  });

  if (templateId === 'tpl_papa_leon_xiv' || templateId === 'papa_leon_xiv') {
    studio.items = getPapaLeonTemplateItems();
    const topTextItem = studio.items.find(i => i.type === 'text');
    studio.activeItemId = topTextItem ? topTextItem.id : null;
    studio.selectedFont = 'Libre Baskerville';
  }

  renderVirolaCanvas();
  renderTextLayersUI();
  updateActiveItemFloatingBar();
  updatePriceDisplay();
  if (studio.viewMode === '360') render360Canvas();

  showNotificationToast('¡Plantilla "Papa León XIV" aplicada! Podés mover, editar o eliminar cualquier parte.', 'fa-Wand-magic-sparkles');
}
window.applyVirolaPresetTemplate = applyVirolaPresetTemplate;

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

  if (itemDef.isTemplate) {
    applyVirolaPresetTemplate(itemDef.templateId || itemDef.id);
    return;
  }

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
      if (VECTOR_CATEGORIES[k].items) itemsToRender.push(...VECTOR_CATEGORIES[k].items);
    });
  } else if (VECTOR_CATEGORIES[catKey]) {
    itemsToRender = VECTOR_CATEGORIES[catKey].items || [];
  }

  if (itemsToRender.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">
        <i class="fas fa-layer-group" style="font-size: 1.8rem; margin-bottom: 10px; display: block; opacity: 0.65;"></i>
        Próximamente: Plantillas prediseñadas disponibles en este apartado.
      </div>
    `;
    return;
  }

  // ITEM 1: Cuadrícula ultra profesional con miniaturas acotadas y elegantes (Arrastrables)
  grid.innerHTML = itemsToRender.map(item => {
    const clickAction = item.isTemplate
      ? `applyVirolaPresetTemplate('${item.templateId || item.id}'); closeDesignCatalogModal();`
      : `addVectorToVirola('${item.id}'); closeDesignCatalogModal();`;
    const dragAttr = !item.isTemplate
      ? `draggable="true" ondragstart="handleRibbonDesignDragStart(event, '${item.id}', 'all'); closeDesignCatalogModal();"`
      : '';
    return `
      <div class="vector-icon-card ${item.isTemplate ? 'is-template-card' : ''}" ${dragAttr} onclick="${clickAction}" title="${item.name} • Hacé clic o arrastralo al producto">
        <div class="vector-thumb-wrap">
          <img src="${item.file}" alt="${item.name}" loading="lazy" draggable="false" />
        </div>
        <span class="vector-name">${item.name}</span>
        ${item.isTemplate ? '<small style="font-size:0.68rem;opacity:0.75;display:block;margin-top:2px;">Plantilla Completa</small>' : ''}
      </div>
    `;
  }).join('');
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
function describeSvgArc(cx, cy, r, startAngleDeg, endAngleDeg) {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  let diff = (endAngleDeg - startAngleDeg) % 360;
  if (diff < 0) diff += 360;
  const largeArcFlag = diff > 180 ? 1 : 0;
  return 'M ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' A ' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 ' + largeArcFlag + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2);
}

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
      const halfSize = (44 * scale) / 2 + 12;
      grooveCutoutsHtml += '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + halfSize.toFixed(2) + '" fill="black" />';
    } else if (item.type === 'text') {
      const fontSize = item.fontSize || 22;
      const textLen = (item.text || '').length;

      if (item.arcPosition === 'straight') {
        const estWidth = textLen * fontSize * 0.65 + 24;
        const estHeight = fontSize + 20;
        grooveCutoutsHtml += '<g transform="translate(' + x.toFixed(2) + ', ' + y.toFixed(2) + ') rotate(' + (item.rotation || 0) + ')"><rect x="' + (-estWidth / 2).toFixed(2) + '" y="' + (-estHeight / 2).toFixed(2) + '" width="' + estWidth.toFixed(2) + '" height="' + estHeight.toFixed(2) + '" rx="8" fill="black" /></g>';
      } else {
        const maskRad = item.radius || rRing;
        const textArcLen = textLen * fontSize * 0.62 + 28;
        const halfDeg = ((textArcLen / 2) / maskRad) * (180 / Math.PI);
        const angle = item.angle !== undefined ? item.angle : (item.arcPosition === 'bottom' ? 90 : 270);
        const startDeg = angle - halfDeg;
        const endDeg = angle + halfDeg;
        const arcPath = describeSvgArc(cx, cy, maskRad, startDeg, endDeg);
        grooveCutoutsHtml += '<path d="' + arcPath + '" fill="none" stroke="black" stroke-width="' + (fontSize + 24).toFixed(2) + '" stroke-linecap="round" />';
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
  let activeHandlesHtml = '';
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
    const fWeight = t.fontWeight || 800;
    const lSpacing = t.letterSpacing !== undefined ? t.letterSpacing : '2px';

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
                font-weight="${fWeight}" 
                letter-spacing="${lSpacing}" 
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
                font-weight="${fWeight}" 
                letter-spacing="${lSpacing}" 
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

  // 4. ÍCONOS, DISEÑOS Y LOGOS CARGADOS
  let iconsHtml = '';
  const iconItems = studio.items.filter(i => i.type === 'icon');
  iconItems.forEach(item => {
    const scale = item.scale || 1.0;
    const rot = item.rotation || 0;
    const isActive = item.id === studio.activeItemId;

    const rad = (item.angle * Math.PI) / 180;
    const x = item.x !== undefined ? item.x : cx + (item.radius || rRing) * Math.cos(rad);
    const y = item.y !== undefined ? item.y : cy + (item.radius || rRing) * Math.sin(rad);

    if (item.svgArc && studio.activeProduct === 'mate') {
      const rMid = item.radius || rRing;
      const halfGap = (item.svgArc.gap || 2.2) / 2;
      const halfSpan = Math.min(165, ((item.svgArc.spanDeg || 90) * scale) / 2);
      const centerAng = (item.angle !== undefined ? item.angle : 270) + rot;
      const arc1 = describeSvgArc(cx, cy, rMid - halfGap, centerAng - halfSpan, centerAng + halfSpan);
      const arc2 = describeSvgArc(cx, cy, rMid + halfGap, centerAng - halfSpan, centerAng + halfSpan);
      const anchorRad = (centerAng * Math.PI) / 180;
      const anchorX = cx + rMid * Math.cos(anchorRad);
      const anchorY = cy + rMid * Math.sin(anchorRad);

      iconsHtml += `
        <g class="virola-sticker-group ${isActive ? 'active-sticker' : ''}"
           data-item-id="${item.id}"
           onmousedown="startFreeItemDrag('${item.id}', event)"
           ontouchstart="startFreeItemDrag('${item.id}', event)"
           style="cursor: grab;">
          <path d="${arc1}" fill="none" stroke="transparent" stroke-width="10" pointer-events="stroke" />
          <path d="${arc1}" fill="none" stroke="#120e0a" stroke-width="1.6" stroke-linecap="round" pointer-events="none" />
          <path d="${arc2}" fill="none" stroke="#120e0a" stroke-width="1.4" stroke-linecap="round" pointer-events="none" />
        </g>
      `;

      if (isActive) {
        activeHandlesHtml += `
          <g class="virola-sticker-group active-sticker" data-item-id="${item.id}"
             transform="translate(${anchorX.toFixed(2)}, ${anchorY.toFixed(2)})"
             onmousedown="startFreeItemDrag('${item.id}', event)"
             ontouchstart="startFreeItemDrag('${item.id}', event)">
            <g class="virola-handle handle-delete" data-handle="delete" transform="translate(22, -12)" style="cursor: pointer;">
              <circle r="10" fill="#111111" stroke="#ffffff" stroke-width="1.5" />
              <text x="0" y="3.5" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="900" pointer-events="none">✕</text>
            </g>
            <g class="virola-handle handle-scale" data-handle="scale" transform="translate(-22, -12)" style="cursor: nwse-resize;">
              <circle r="10" fill="#18181b" stroke="#ffffff" stroke-width="1.5" />
              <text x="0" y="3.5" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="900" pointer-events="none">⤡</text>
            </g>
          </g>
        `;
      }
      return;
    }

    const baseSize = 44;
    const wRatio = item.wRatio || 1.0;
    const hRatio = item.hRatio || 1.0;
    const itemW = baseSize * scale * wRatio;
    const itemH = baseSize * scale * hRatio;
    const halfW = itemW / 2;
    const halfH = itemH / 2;

    const contentHtml = `<image href="${item.file}" x="${(-halfW).toFixed(2)}" y="${(-halfH).toFixed(2)}" width="${itemW.toFixed(2)}" height="${itemH.toFixed(2)}" preserveAspectRatio="xMidYMid meet" style="filter: grayscale(100%) contrast(115%) drop-shadow(0 0.8px 1px rgba(0,0,0,0.35));" />`;

    iconsHtml += `
      <g class="virola-sticker-group ${isActive ? 'active-sticker' : ''}" 
         data-item-id="${item.id}" 
         transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
         onmousedown="startFreeItemDrag('${item.id}', event)"
         ontouchstart="startFreeItemDrag('${item.id}', event)"
         style="cursor: grab;">
        ${contentHtml}
      </g>
    `;

    if (isActive) {
      const delX = halfW + 8;
      const delY = -halfH - 8;
      const rotX = -halfW - 8;
      const rotY = -halfH - 8;
      const scX = halfW + 8;
      const scY = halfH + 8;
      activeHandlesHtml += `
        <g class="virola-sticker-group active-sticker" data-item-id="${item.id}"
           transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
           onmousedown="startFreeItemDrag('${item.id}', event)"
           ontouchstart="startFreeItemDrag('${item.id}', event)">
          <rect x="${(-halfW - 5).toFixed(2)}" y="${(-halfH - 5).toFixed(2)}" 
                width="${(itemW + 10).toFixed(2)}" height="${(itemH + 10).toFixed(2)}" 
                fill="none" stroke="#111111" stroke-width="1.8" stroke-dasharray="4,4" 
                rx="6" ry="6" opacity="0.9" pointer-events="none" />
          <g class="virola-handle handle-delete" data-handle="delete" data-item-id="${item.id}"
             transform="translate(${delX.toFixed(2)}, ${delY.toFixed(2)})"
             onmousedown="startFreeItemDrag('${item.id}', event)"
             ontouchstart="startFreeItemDrag('${item.id}', event)"
             style="cursor: pointer; touch-action: none !important;">
            <circle r="20" fill="transparent" pointer-events="all" />
            <circle r="12" fill="#111111" stroke="#ffffff" stroke-width="1.8" />
            <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900" pointer-events="none">✕</text>
          </g>
          <g class="virola-handle handle-rotate" data-handle="rotate" data-item-id="${item.id}"
             transform="translate(${rotX.toFixed(2)}, ${rotY.toFixed(2)})"
             onmousedown="startFreeItemDrag('${item.id}', event)"
             ontouchstart="startFreeItemDrag('${item.id}', event)"
             style="cursor: grab; touch-action: none !important;">
            <circle r="20" fill="transparent" pointer-events="all" />
            <circle r="12" fill="#18181b" stroke="#ffffff" stroke-width="1.8" />
            <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900" pointer-events="none">↻</text>
          </g>
          <g class="virola-handle handle-scale" data-handle="scale" data-item-id="${item.id}"
             transform="translate(${scX.toFixed(2)}, ${scY.toFixed(2)})"
             onmousedown="startFreeItemDrag('${item.id}', event)"
             ontouchstart="startFreeItemDrag('${item.id}', event)"
             style="cursor: nwse-resize; touch-action: none !important;">
            <circle r="20" fill="transparent" pointer-events="all" />
            <circle r="12" fill="#18181b" stroke="#ffffff" stroke-width="1.8" />
            <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900" pointer-events="none">⤡</text>
          </g>
        </g>
      `;
    }
  });

  // 5. GUÍAS MAGNÉTICAS DE SNAPPING
  let snappingGuidesHtml = '';
  if (studio.snappingEnabled && studio.dragMode) {
    if (studio.activeGuides.v) {
      snappingGuidesHtml += `<line x1="${cx}" y1="10" x2="${cx}" y2="490" stroke="#111111" stroke-width="1.5" stroke-dasharray="4,4" />`;
    }
    if (studio.activeGuides.h) {
      snappingGuidesHtml += `<line x1="10" y1="${cy}" x2="490" y2="${cy}" stroke="#111111" stroke-width="1.5" stroke-dasharray="4,4" />`;
    }
    if (studio.activeGuides.ring) {
      snappingGuidesHtml += `<circle cx="${cx}" cy="${cy}" r="${rRing}" fill="none" stroke="#111111" stroke-width="1.5" stroke-dasharray="5,5" />`;
    }
  }

  // Color de metal según acabado
  const metalFillGrad = studio.metalFinish === 'acero' ? '#e2e8f0' : 'url(#metal-sheen-grad)';

  // RENDER SEGÚN PRODUCTO: MATE, TERMO O CAJA
  if (studio.activeProduct === 'mate') {
    // VIROLA CIRCULAR DE ALPACA MACIZA (MATE - 100% BITONO B&W)
    svg.innerHTML = `
      <defs>
        <radialGradient id="metal-sheen-grad" cx="45%" cy="38%" r="62%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98" />
          <stop offset="25%" stop-color="#f2f2f2" />
          <stop offset="55%" stop-color="#dddddd" />
          <stop offset="80%" stop-color="#b5b5b5" />
          <stop offset="100%" stop-color="#888888" />
        </radialGradient>

        <linearGradient id="metal-reflection" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.65" />
          <stop offset="28%" stop-color="#cccccc" stop-opacity="0.15" />
          <stop offset="72%" stop-color="#ffffff" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#666666" stop-opacity="0.8" />
        </linearGradient>

        <radialGradient id="calabaza-interior" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="65%" stop-color="#fafafa" />
          <stop offset="90%" stop-color="#f4f4f5" />
          <stop offset="100%" stop-color="#e4e4e7" />
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

      <!-- Fondo completamente blanco sin sombras ni gradientes -->
      <rect width="500" height="500" fill="#ffffff" />

      <!-- Corona de la Virola: Círculo grande negro exterior y círculo chiquito negro interior sobre fondo blanco puro -->
      <circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
      <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="#ffffff" stroke="#000000" stroke-width="2.5" />

      <!-- Ranuras concéntricas opcionales -->
      ${circularLinesHtml}

      <!-- Grabados Láser -->
      <g class="virola-engravings-container" ${studio.clipToMetal ? 'clip-path="url(#metal-ring-clip)"' : ''}>
        <g class="virola-icons-layer">${iconsHtml}</g>
        <g class="virola-texts-layer">${textsHtml}</g>
      </g>

      <!-- Controles del elemento activo (sin recorte de virola para que nunca se corten los botones ✕ ↻ ⤡) -->
      <g class="virola-active-handles-layer">${activeHandlesHtml}</g>

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
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#888888" />
        </linearGradient>
        ${defsTextPathsHtml}
      </defs>

      <!-- Cuerpo del Termo Cilíndrico de Acero Inoxidable -->
      <rect x="80" y="30" width="340" height="440" rx="20" fill="url(#termo-metal-sheen)" stroke="#2b2b2b" stroke-width="3" />
      
      <!-- Tapón y pico cebador superior -->
      <rect x="180" y="10" width="140" height="24" rx="6" fill="#111111" stroke="#333333" stroke-width="2" />
      <rect x="220" y="2" width="60" height="10" rx="3" fill="#ffffff" />

      <!-- Zona delimitada para grabado láser 360° -->
      <rect x="100" y="70" width="300" height="360" rx="10" fill="none" stroke="rgba(255, 255, 255, 0.28)" stroke-width="1.5" stroke-dasharray="4,4" />
      <text x="250" y="60" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="800" letter-spacing="1">ÁREA DE GRABADO LÁSER CNC 360°</text>

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
      <path d="M 50 70 L 70 70 L 70 50 L 50 40 Z" fill="#ffffff" />
      <path d="M 450 70 L 430 70 L 430 50 L 450 40 Z" fill="#ffffff" />
      <path d="M 50 430 L 70 430 L 70 450 L 50 460 Z" fill="#ffffff" />
      <path d="M 450 430 L 430 430 L 430 450 L 450 460 Z" fill="#ffffff" />

      <!-- Marco central de pirograbado -->
      <rect x="80" y="70" width="340" height="360" rx="8" fill="none" stroke="rgba(255, 255, 255, 0.28)" stroke-width="1.8" />
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
  const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
  const clientX = touch ? touch.clientX : e.clientX;
  const clientY = touch ? touch.clientY : e.clientY;
  const scaleX = canvas.width / Math.max(1, rect.width);
  const scaleY = canvas.height / Math.max(1, rect.height);
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
      ctx.strokeStyle = '#ffffff';
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
    ctx.fillStyle = '#ffffff';
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
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(midX - 7, midY - 6, 14, 16);
        ctx.strokeStyle = '#333333';
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

function updateLiveSvgItemTransform(item) {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg || !item) return false;
  const { cx, cy, rRing } = STUDIO_CONFIG;
  const groupEl = svg.querySelector(`[data-item-id="${item.id}"]`);
  if (!groupEl) return false;

  const isMateCurvedText = studio.activeProduct === 'mate' && item.type === 'text' && item.arcPosition !== 'straight';
  if (isMateCurvedText) {
    const pathEl = document.getElementById(`text-path-${item.id}`);
    if (!pathEl) return false;
    const isBottom = item.arcPosition === 'bottom';
    const angle = item.angle !== undefined ? item.angle : (isBottom ? 90 : 270);
    const r = item.radius !== undefined ? item.radius : rRing;
    let pathD = '';
    if (isBottom) {
      const startRad = ((angle + 150) * Math.PI) / 180;
      const endRad = ((angle - 150) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    } else {
      const startRad = ((angle - 150) * Math.PI) / 180;
      const endRad = ((angle + 150) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    }
    pathEl.setAttribute('d', pathD);
    return true;
  }

  const rad = ((item.angle || 0) * Math.PI) / 180;
  const x = item.x !== undefined ? item.x : cx + (item.radius || rRing) * Math.cos(rad);
  const y = item.y !== undefined ? item.y : cy + (item.radius || rRing) * Math.sin(rad);
  const rot = item.rotation || 0;
  groupEl.setAttribute('transform', `translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})`);

  if (item.type === 'icon') {
    const imgEl = groupEl.querySelector('image');
    if (imgEl) {
      const baseSize = studio.activeProduct === 'caja' ? 48 : 44;
      const s = baseSize * (item.scale || 1.0);
      const half = s / 2;
      imgEl.setAttribute('x', (-half).toFixed(2));
      imgEl.setAttribute('y', (-half).toFixed(2));
      imgEl.setAttribute('width', s.toFixed(2));
      imgEl.setAttribute('height', s.toFixed(2));
    }
  }
  return true;
}

function startFreeItemDrag(itemId, e) {
  if (e && e.cancelable) e.preventDefault();
  if (e) e.stopPropagation();

  const item = studio.items.find(i => i.id === itemId);
  if (!item) return;

  studio.activeItemId = itemId;
  const targetHandle = e && e.target && e.target.closest ? e.target.closest('.virola-handle') : null;
  const handleType = targetHandle?.getAttribute('data-handle');

  if (handleType === 'delete') {
    deleteVirolaItem(itemId, e);
    return;
  }

  const coords = getPointerCoords(e);
  const { cx, cy, rRing } = STUDIO_CONFIG;

  const currentRad = ((item.angle || 0) * Math.PI) / 180;
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
    initialDist: Math.max(12, Math.hypot(coords.x - curX, coords.y - curY)),
    initialAngle: (Math.atan2(coords.y - curY, coords.x - curX) * 180) / Math.PI,
    pointerAngle: (Math.atan2(coords.y - cy, coords.x - cx) * 180) / Math.PI
  };

  if (item.type === 'text') {
    renderTextLayersUI();
    updateActiveTextControls(item);
  }

  const isTouchEvent = Boolean(e && (e.touches || e.changedTouches || e.type === 'touchstart'));
  if (!isTouchEvent) {
    renderVirolaCanvas();
  }
  updateActiveItemFloatingBar();
}

function initCanvasInteraction() {
  const svg = document.getElementById('virola-studio-svg');
  if (!svg) return;

  // Soporte táctil directo en el lienzo SVG para celulares (permite agarrar o ubicar elementos con precisión)
  svg.addEventListener('touchstart', (e) => {
    // 1. Detección directa de botón handle (eliminar, rotar, escalar)
    const handleTarget = e.target && e.target.closest ? e.target.closest('.virola-handle') : null;
    if (handleTarget) {
      const targetId = handleTarget.getAttribute('data-item-id') || 
                       handleTarget.closest('[data-item-id]')?.getAttribute('data-item-id') || 
                       studio.activeItemId;
      if (targetId) {
        startFreeItemDrag(targetId, e);
        return;
      }
    }

    // 2. Detección directa de elemento seleccionado o grupo de handles
    const groupTarget = e.target && e.target.closest
      ? e.target.closest('.virola-sticker-group, .virola-text-group, .virola-active-handle-group')
      : null;
    if (groupTarget) {
      const targetId = groupTarget.getAttribute('data-item-id');
      if (targetId && !studio.dragMode) {
        startFreeItemDrag(targetId, e);
      }
      return;
    }

    // 3. Tolerancia táctil por proximidad en celular
    const coords = getPointerCoords(e);
    const { cx, cy, rRing } = STUDIO_CONFIG;
    let closestItem = null;
    let minDistance = 44;

    studio.items.forEach(it => {
      let ix, iy;
      if (studio.activeProduct === 'mate') {
        const rad = ((it.angle || 0) * Math.PI) / 180;
        ix = it.x !== undefined ? it.x : cx + (it.radius || rRing) * Math.cos(rad);
        iy = it.y !== undefined ? it.y : cy + (it.radius || rRing) * Math.sin(rad);
      } else {
        ix = it.x !== undefined ? it.x : cx;
        iy = it.y !== undefined ? it.y : 250;
      }
      const d = Math.hypot(coords.x - ix, coords.y - iy);
      if (d < minDistance) {
        minDistance = d;
        closestItem = it;
      }
    });

    if (closestItem) {
      startFreeItemDrag(closestItem.id, e);
    }
  }, { passive: false });

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
  window.addEventListener('touchcancel', onCanvasPointerEnd);
}

function onCanvasPointerMove(e) {
  if (!studio.dragMode || !studio.dragItemId) return;
  if (e && e.cancelable) e.preventDefault();

  const item = studio.items.find(i => i.id === studio.dragItemId);
  if (!item) return;

  const coords = getPointerCoords(e);
  const { cx, cy, rRing } = STUDIO_CONFIG;
  const isTouchEvent = Boolean(e && (e.touches || e.changedTouches));

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
    const curAngle = (Math.atan2(coords.y - itemY, coords.x - itemX) * 180) / Math.PI;
    const deltaAngle = curAngle - (studio.dragStart.initialAngle || 0);
    let newRot = (studio.dragStart.itemRotation || 0) + deltaAngle;

    if (studio.snappingEnabled && Math.abs(newRot % 45) < 3) {
      newRot = Math.round(newRot / 45) * 45;
    }

    item.rotation = Math.round(newRot);
    renderVirolaCanvas();
  } else if (studio.dragMode === 'scale') {
    const itemX = item.x !== undefined ? item.x : cx;
    const itemY = item.y !== undefined ? item.y : cy;
    const currentDist = Math.hypot(coords.x - itemX, coords.y - itemY);
    const startDist = studio.dragStart.initialDist || 24;
    const ratio = currentDist / Math.max(10, startDist);
    let newScale = (studio.dragStart.itemScale || 1.0) * ratio;
    newScale = Math.max(STUDIO_CONFIG.minScale || 0.4, Math.min(STUDIO_CONFIG.maxScale || 3.0, newScale));

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
  const touch = (e && e.touches && e.touches[0]) || (e && e.changedTouches && e.changedTouches[0]);
  const clientX = touch ? touch.clientX : (e ? e.clientX : 0);
  const clientY = touch ? touch.clientY : (e ? e.clientY : 0);

  const viewBox = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width)
    ? svg.viewBox.baseVal
    : { width: 500, height: 500 };
  const scaleX = viewBox.width / Math.max(1, rect.width);
  const scaleY = viewBox.height / Math.max(1, rect.height);

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
      nameBadge.innerHTML = `<i class="fas fa-hand-pointer" style="margin-right: 6px;"></i> Hacé clic en cualquier texto o grabado para editarlo`;
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
      nameBadge.innerHTML = `<i class="fas fa-hand-pointer" style="margin-right: 6px;"></i> Hacé clic en cualquier texto o grabado para editarlo`;
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
    const stepPx = Math.abs(delta) < 0.08 ? (delta > 0 ? 1.5 : -1.5) : (delta > 0 ? 3 : -3);
    const newSize = Math.max(8, Math.min(160, Math.round(curSize + stepPx)));
    item.fontSize = newSize;
    const sizeInput = document.getElementById('active-text-size-input');
    const sizeSlider = document.getElementById('active-text-size-slider');
    if (sizeInput) sizeInput.value = newSize;
    if (sizeSlider) sizeSlider.value = newSize;
  } else {
    const cur = item.scale || 1.0;
    const n = Math.max(STUDIO_CONFIG.minScale, Math.min(STUDIO_CONFIG.maxScale, cur + delta));
    item.scale = parseFloat(n.toFixed(2));
    const scaleSlider = document.getElementById('logo-scale-slider');
    const scaleLabel = document.getElementById('logo-scale-val-label');
    if (scaleSlider) scaleSlider.value = Math.round(item.scale * 100);
    if (scaleLabel) scaleLabel.textContent = `${Math.round(item.scale * 100)}%`;
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
      background: #18181b;
      border: 1.5px solid rgba(255, 255, 255, 0.28);
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

  toast.innerHTML = `<i class="fas ${icon}" style="color: #ffffff; font-size: 1rem;"></i> <span>${escapeHtml(msg)}</span>`;
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


// ==========================================================================
// 11. ACTUALIZACIÓN INTEGRAL DEL ESTUDIO (MEETING FIXES: CAJA FRONTAL BLANCO,
//     DESHACER/REHACER, NO SUPERPOSICIÓN, SIN CINCELADO Y PRECIOS DINÁMICOS)
// ==========================================================================
(function() {
  // 1. Inicializar pilas de historial Deshacer / Rehacer y caché de imágenes 360
  studio.historyStack = [];
  studio.redoStack = [];
  studio.circularLines = 'no';
  studio.snappingEnabled = false;
  studio._imgCache360 = {};

  function cloneItemsState(items) {
    return JSON.parse(JSON.stringify(items || []));
  }

  window.saveStudioHistoryState = function() {
    studio.historyStack.push({
      activeProduct: studio.activeProduct,
      items: cloneItemsState(studio.items),
      activeItemId: studio.activeItemId
    });
    if (studio.historyStack.length > 50) {
      studio.historyStack.shift();
    }
    studio.redoStack = [];
    updateHistoryButtonsUI();
  };

  window.undoStudioAction = function() {
    if (!studio.historyStack || studio.historyStack.length === 0) {
      showNotificationToast('No hay más acciones para deshacer', 'fa-rotate-left');
      return;
    }
    studio.redoStack.push({
      activeProduct: studio.activeProduct,
      items: cloneItemsState(studio.items),
      activeItemId: studio.activeItemId
    });
    const prevState = studio.historyStack.pop();
    studio.items = cloneItemsState(prevState.items);
    studio.activeItemId = prevState.activeItemId;

    renderVirolaCanvas();
    renderTextLayersUI();
    updateActiveItemFloatingBar();
    updatePriceDisplay();
    updateHistoryButtonsUI();
    if (studio.viewMode === '360') render360Canvas();
    showNotificationToast('Acción deshecha (Ctrl+Z)', 'fa-rotate-left');
  };

  window.redoStudioAction = function() {
    if (!studio.redoStack || studio.redoStack.length === 0) {
      showNotificationToast('No hay acciones para rehacer', 'fa-rotate-right');
      return;
    }
    studio.historyStack.push({
      activeProduct: studio.activeProduct,
      items: cloneItemsState(studio.items),
      activeItemId: studio.activeItemId
    });
    const nextState = studio.redoStack.pop();
    studio.items = cloneItemsState(nextState.items);
    studio.activeItemId = nextState.activeItemId;

    renderVirolaCanvas();
    renderTextLayersUI();
    updateActiveItemFloatingBar();
    updatePriceDisplay();
    updateHistoryButtonsUI();
    if (studio.viewMode === '360') render360Canvas();
    showNotificationToast('Acción rehecha (Ctrl+Y)', 'fa-rotate-right');
  };

  function updateHistoryButtonsUI() {
    const canUndo = studio.historyStack && studio.historyStack.length > 0;
    const canRedo = studio.redoStack && studio.redoStack.length > 0;
    document.querySelectorAll('#btn-studio-undo, .btn-studio-undo-quick').forEach(btn => {
      btn.disabled = !canUndo;
      btn.style.opacity = canUndo ? '1' : '0.4';
    });
    document.querySelectorAll('#btn-studio-redo, .btn-studio-redo-quick').forEach(btn => {
      btn.disabled = !canRedo;
      btn.style.opacity = canRedo ? '1' : '0.4';
    });
  }

  // Atajos de teclado globales: Ctrl+Z (Deshacer) y Ctrl+Y / Ctrl+Shift+Z (Rehacer)
  document.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        window.redoStudioAction();
      } else {
        window.undoStudioAction();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      window.redoStudioAction();
    }
  });

  // 2. Sincronizar nombres simplificados y precios dinámicos desde el Panel Admin
  window.syncStudioPricingFromAdmin = function() {
    PRODUCTS_CATALOG.mate.name = 'Mate';
    PRODUCTS_CATALOG.termo.name = 'Termo';
    PRODUCTS_CATALOG.caja.name = 'Caja de presentación';
    PRODUCTS_CATALOG.caja.surfaceName = 'Frente de Caja de Presentación Vertical (Grabado Blanco)';

    if (typeof getCustomizationPricingConfig === 'function') {
      const cfg = getCustomizationPricingConfig();
      if (cfg && cfg.baseProducts) {
        if (cfg.baseProducts.mate) {
          const pMate = Number(cfg.baseProducts.mate.price) || 46500;
          PRODUCTS_CATALOG.mate.models[0].price = pMate;
          PRODUCTS_CATALOG.mate.models[0].name = 'Mate Imperial Personalizable';
        }
        if (cfg.baseProducts.termo) {
          const pTermo = Number(cfg.baseProducts.termo.price) || 42900;
          PRODUCTS_CATALOG.termo.models[0].price = pTermo;
          PRODUCTS_CATALOG.termo.models[0].name = 'Termo de Acero 1L Personalizable';
        }
        if (cfg.baseProducts.caja) {
          const pCaja = Number(cfg.baseProducts.caja.price) || 32000;
          PRODUCTS_CATALOG.caja.models[0].price = pCaja;
          PRODUCTS_CATALOG.caja.models[0].name = 'Caja de Presentación Personalizable';
        }
      }
    }

    const matePriceEl = document.getElementById('card-price-mate');
    const termoPriceEl = document.getElementById('card-price-termo');
    const cajaPriceEl = document.getElementById('card-price-caja');
    if (matePriceEl) matePriceEl.textContent = `$ ${PRODUCTS_CATALOG.mate.models[0].price.toLocaleString('es-AR')}`;
    if (termoPriceEl) termoPriceEl.textContent = `$ ${PRODUCTS_CATALOG.termo.models[0].price.toLocaleString('es-AR')}`;
    if (cajaPriceEl) cajaPriceEl.textContent = `$ ${PRODUCTS_CATALOG.caja.models[0].price.toLocaleString('es-AR')}`;
  };

  // 3. Algoritmo anti-superposición para íconos, escudos y textos
  window.findNonOverlappingPosition = function(itemType = 'icon', preferredPos = null) {
    const { cx, cy, rRing } = STUDIO_CONFIG;
    const minDistance = 54;

    function isOccupied(tx, ty) {
      return studio.items.some(existing => {
        const ex = existing.x !== undefined ? existing.x : cx;
        const ey = existing.y !== undefined ? existing.y : cy;
        return Math.hypot(tx - ex, ty - ey) < minDistance;
      });
    }

    // Caso 1: Caja de presentación VERTICAL (x entre 145..355, y entre 105..395)
    if (studio.activeProduct === 'caja') {
      const boxSlots = itemType === 'text'
        ? [
            { x: 250, y: 155, angle: 270 },
            { x: 250, y: 245, angle: 0 },
            { x: 250, y: 335, angle: 90 },
            { x: 250, y: 115, angle: 270 },
            { x: 250, y: 380, angle: 90 }
          ]
        : [
            { x: 250, y: 255, angle: 90 },
            { x: 250, y: 185, angle: 270 },
            { x: 250, y: 325, angle: 90 },
            { x: 190, y: 220, angle: 180 },
            { x: 310, y: 220, angle: 0 },
            { x: 190, y: 300, angle: 135 },
            { x: 310, y: 300, angle: 45 },
            { x: 250, y: 125, angle: 270 },
            { x: 250, y: 380, angle: 90 }
          ];

      for (const slot of boxSlots) {
        if (!isOccupied(slot.x, slot.y)) {
          return { x: slot.x, y: slot.y, angle: slot.angle, radius: rRing };
        }
      }
      const n = studio.items.length;
      const col = n % 3;
      const row = Math.floor(n / 3) % 4;
      return {
        x: 175 + col * 75,
        y: 130 + row * 72,
        angle: 90,
        radius: rRing
      };
    }

    // Caso 2: Termo cilíndrico (Cuerpo vertical o vista 360° horizontal)
    if (studio.activeProduct === 'termo') {
      if (studio.termo360Active) {
        const termo360Slots = [
          { x: 250, y: 250, angle: 0 },
          { x: 170, y: 250, angle: 0 },
          { x: 330, y: 250, angle: 0 },
          { x: 95, y: 250, angle: 0 },
          { x: 405, y: 250, angle: 0 },
          { x: 250, y: 170, angle: 0 },
          { x: 250, y: 330, angle: 0 },
          { x: 170, y: 170, angle: 0 },
          { x: 330, y: 170, angle: 0 }
        ];
        for (const slot of termo360Slots) {
          if (!isOccupied(slot.x, slot.y)) {
            return { x: slot.x, y: slot.y, angle: slot.angle, radius: rRing };
          }
        }
      }
      const termoSlots = [
        { x: 250, y: 180, angle: 270 },
        { x: 250, y: 260, angle: 90 },
        { x: 250, y: 340, angle: 90 },
        { x: 190, y: 220, angle: 180 },
        { x: 310, y: 220, angle: 0 },
        { x: 190, y: 300, angle: 135 },
        { x: 310, y: 300, angle: 45 },
        { x: 250, y: 125, angle: 270 }
      ];
      for (const slot of termoSlots) {
        if (!isOccupied(slot.x, slot.y)) {
          return { x: slot.x, y: slot.y, angle: slot.angle, radius: rRing };
        }
      }
    }

    // Caso 3: Mate (Anillo de virola circular rRing = 197)
    const candidateAngles = itemType === 'text'
      ? (preferredPos === 'bottom' ? [90, 270, 180, 0, 135, 45, 225, 315] : [270, 90, 180, 0, 315, 225, 45, 135])
      : [90, 180, 0, 270, 135, 45, 225, 315, 112, 68, 158, 22, 202, 338, 248, 292];

    for (const ang of candidateAngles) {
      const rad = (ang * Math.PI) / 180;
      const tx = cx + rRing * Math.cos(rad);
      const ty = cy + rRing * Math.sin(rad);
      if (!isOccupied(tx, ty)) {
        return {
          x: parseFloat(tx.toFixed(2)),
          y: parseFloat(ty.toFixed(2)),
          angle: ang,
          radius: rRing
        };
      }
    }

    // Si todos los ángulos principales están ocupados, buscar el siguiente hueco angular libre
    for (let step = 0; step < 360; step += 18) {
      const ang = (90 + step) % 360;
      const rad = (ang * Math.PI) / 180;
      const tx = cx + rRing * Math.cos(rad);
      const ty = cy + rRing * Math.sin(rad);
      if (!isOccupied(tx, ty)) {
        return {
          x: parseFloat(tx.toFixed(2)),
          y: parseFloat(ty.toFixed(2)),
          angle: ang,
          radius: rRing
        };
      }
    }

    const fallbackAngle = (studio.items.length * 35) % 360;
    const fallbackRad = (fallbackAngle * Math.PI) / 180;
    return {
      x: parseFloat((cx + rRing * Math.cos(fallbackRad)).toFixed(2)),
      y: parseFloat((cy + rRing * Math.sin(fallbackRad)).toFixed(2)),
      angle: fallbackAngle,
      radius: rRing
    };
  };

  // 4. Sobrescribir switchActiveProduct: visualización estándar 2D única para todos los productos (sin vista 360°)
  window.switchActiveProduct = function(prodKey) {
    if (!PRODUCTS_CATALOG[prodKey]) return;
    studio.activeProduct = prodKey;
    const prodDef = PRODUCTS_CATALOG[prodKey];
    studio.selectedMateId = prodDef.defaultModel;
    studio.viewMode = '2d';

    renderProductSelectorCardsUI();

    document.querySelectorAll('[data-prod-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-prod-btn') === prodKey);
    });

    if (prodKey === 'caja') {
      // En caja los textos se muestran rectos en el frente vertical para máxima legibilidad
      studio.items.forEach(it => {
        if (it.type === 'text') {
          it.arcPosition = 'straight';
        }
      });
    }

    renderModelsDropdown();
    updateStageBadge();
    updatePriceDisplay();

    autoCenterAndBalanceVirola();
    renderVirolaCanvas();

    showNotificationToast(`Personalizando: ${prodDef.name}`, 'fa-cube');
  };

  // Eliminar opción 360°: mantener siempre visualización estándar 2D
  const _origSetStudioViewMode = window.setStudioViewMode;
  window.setStudioViewMode = function() {
    return _origSetStudioViewMode('2d');
  };

  // 5. Sobrescribir agregado, duplicado y eliminación con Historial y No-Superposición
  window.addNewTextBlock = function(initialText = '', preferredPos = null) {
    saveStudioHistoryState();
    const textItems = studio.items.filter(i => i.type === 'text');
    const count = textItems.length + 1;
    const defaultText = initialText || (count === 1 ? 'MATES RÍO' : (count === 2 ? 'TRADICIÓN & PASIÓN' : `TEXTO ${count}`));

    let pos = preferredPos || (studio.activeProduct === 'caja' ? 'straight' : (count === 1 ? 'top' : (count === 2 ? 'bottom' : 'straight')));
    if (studio.activeProduct === 'caja') {
      pos = 'straight';
    }

    const placement = findNonOverlappingPosition('text', pos);

    const newItem = {
      id: 'text_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'text',
      text: defaultText,
      font: studio.selectedFont || 'Cinzel',
      fontSize: 22,
      arcPosition: pos,
      angle: placement.angle,
      radius: placement.radius,
      rotation: 0,
      scale: 1.0,
      x: placement.x,
      y: placement.y
    };

    studio.items.push(newItem);
    studio.activeItemId = newItem.id;

    renderVirolaCanvas();
    renderTextLayersUI();
    updateActiveTextControls(newItem);
    updatePriceDisplay();
    if (studio.viewMode === '360') render360Canvas();
    showNotificationToast(`Texto "${newItem.text}" agregado`, 'fa-font');
  };

  window.addVectorToVirola = function(itemId, catKey) {
    let itemDef = null;
    if (catKey && VECTOR_CATEGORIES[catKey]) {
      itemDef = VECTOR_CATEGORIES[catKey].items.find(i => i.id === itemId);
    }
    if (!itemDef) {
      for (const k of Object.keys(VECTOR_CATEGORIES)) {
        const found = VECTOR_CATEGORIES[k].items.find(i => i.id === itemId);
        if (found) {
          itemDef = found;
          break;
        }
      }
    }
    if (!itemDef) return;

    if (itemDef.isTemplate) {
      applyVirolaPresetTemplate(itemDef.templateId || itemDef.id);
      return;
    }

    saveStudioHistoryState();
    const placement = findNonOverlappingPosition('icon');

    const newItem = {
      id: 'icon_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'icon',
      graphicId: itemDef.id,
      name: itemDef.name,
      file: itemDef.file,
      angle: placement.angle,
      radius: placement.radius,
      rotation: 0,
      scale: 1.0,
      x: placement.x,
      y: placement.y
    };

    studio.items.push(newItem);
    studio.activeItemId = newItem.id;

    renderVirolaCanvas();
    updateActiveItemFloatingBar();
    updatePriceDisplay();
    if (studio.viewMode === '360') render360Canvas();
    showNotificationToast(`Diseño "${itemDef.name}" ubicado sin superposición`, 'fa-shield-halved');
  };

  window.duplicateActiveItem = function() {
    if (!studio.activeItemId) return;
    const item = studio.items.find(i => i.id === studio.activeItemId);
    if (!item) return;

    saveStudioHistoryState();
    const placement = findNonOverlappingPosition(item.type, item.arcPosition);

    const newItem = {
      ...item,
      id: (item.type === 'text' ? 'text_' : 'icon_') + Date.now() + '_' + Math.floor(Math.random() * 1000),
      angle: placement.angle,
      radius: placement.radius,
      x: placement.x,
      y: placement.y
    };
    studio.items.push(newItem);
    studio.activeItemId = newItem.id;

    renderVirolaCanvas();
    if (newItem.type === 'text') renderTextLayersUI();
    updateActiveItemFloatingBar();
    updatePriceDisplay();
    if (studio.viewMode === '360') render360Canvas();
    showNotificationToast('Elemento duplicado en posición libre', 'fa-clone');
  };

  const _origDeleteVirolaItem = window.deleteVirolaItem;
  window.deleteVirolaItem = function(itemId, e) {
    saveStudioHistoryState();
    return _origDeleteVirolaItem(itemId, e);
  };

  const _origResetVirolaStudio = window.resetVirolaStudio;
  window.resetVirolaStudio = function() {
    if (studio.items.length > 0) saveStudioHistoryState();
    return _origResetVirolaStudio();
  };

  const _origStartFreeItemDrag = window.startFreeItemDrag;
  window.startFreeItemDrag = function(itemId, e) {
    saveStudioHistoryState();
    return _origStartFreeItemDrag(itemId, e);
  };

  // 6. Subida y arrastre de imagen personalizada: eliminación de bordes blancos, auto-vectorización monocrómica y colocación directa
  function handleRibbonDesignDragStart(e, itemId, catKey) {
    if (!e || !e.dataTransfer) return;
    try {
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'icon', itemId, catKey }));
      e.dataTransfer.setData('text/plain', itemId);
      e.dataTransfer.effectAllowed = 'copy';
    } catch (err) {}
  }
  window.handleRibbonDesignDragStart = handleRibbonDesignDragStart;

  function processAndAddCustomImageFile(file, dropCoords = null) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const rawDataUrl = loadEvent.target.result;
      const img = new Image();
      img.onload = () => {
        let processedBlackDataUrl = rawDataUrl;
        let processedWhiteDataUrl = rawDataUrl;

        if (file.type !== 'image/svg+xml') {
          const cvs = document.createElement('canvas');
          const ctx = cvs.getContext('2d');
          const maxDim = 700;
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
          const whiteImgData = ctx.createImageData(w, h);
          const dw = whiteImgData.data;

          // Muestreo de todo el borde perimetral para eliminar cualquier marco o fondo blanco/claro
          let rSum = 0, gSum = 0, bSum = 0, sampleCount = 0;
          const borderStep = Math.max(1, Math.floor(Math.min(w, h) / 20));
          for (let bx = 0; bx < w; bx += borderStep) {
            const topIdx = bx * 4;
            const botIdx = ((h - 1) * w + bx) * 4;
            rSum += d[topIdx] + d[botIdx];
            gSum += d[topIdx + 1] + d[botIdx + 1];
            bSum += d[topIdx + 2] + d[botIdx + 2];
            sampleCount += 2;
          }
          for (let by = 0; by < h; by += borderStep) {
            const leftIdx = (by * w) * 4;
            const rightIdx = (by * w + (w - 1)) * 4;
            rSum += d[leftIdx] + d[rightIdx];
            gSum += d[leftIdx + 1] + d[rightIdx + 1];
            bSum += d[leftIdx + 2] + d[rightIdx + 2];
            sampleCount += 2;
          }

          const bgR = Math.round(rSum / sampleCount);
          const bgG = Math.round(gSum / sampleCount);
          const bgB = Math.round(bSum / sampleCount);
          const colorTolerance = 62;

          for (let py = 0; py < h; py++) {
            for (let px = 0; px < w; px++) {
              const i = (py * w + px) * 4;
              const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];

              // Recortar 2px del borde exterior para evitar líneas residuales blancas en el marco
              if (px < 2 || px >= w - 2 || py < 2 || py >= h - 2 || a < 40) {
                d[i + 3] = 0;
                dw[i + 3] = 0;
                continue;
              }

              const colorDist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;

              // Eliminar píxeles blancos/claros (> 195 lum) o similares al fondo
              if (lum > 195 || colorDist < colorTolerance) {
                d[i + 3] = 0;
                dw[i + 3] = 0;
              } else {
                const contrastAlpha = Math.min(1, (205 - lum) / 85);
                const finalAlpha = Math.round(255 * Math.max(0.25, contrastAlpha));
                // Versión grabada en negro (para Mate y Termo)
                d[i] = 16;
                d[i + 1] = 16;
                d[i + 2] = 16;
                d[i + 3] = finalAlpha;
                // Versión grabada en blanco puro (para Caja de presentación)
                dw[i] = 255;
                dw[i + 1] = 255;
                dw[i + 2] = 255;
                dw[i + 3] = finalAlpha;
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          processedBlackDataUrl = cvs.toDataURL('image/png');

          ctx.putImageData(whiteImgData, 0, 0);
          processedWhiteDataUrl = cvs.toDataURL('image/png');
        }

        saveStudioHistoryState();
        const isBox = studio.activeProduct === 'caja';
        const { cx, cy, rRing } = STUDIO_CONFIG;

        let itemAngle = 0;
        let itemRadius = rRing;
        let itemX = 250;
        let itemY = 265;

        if (dropCoords && typeof dropCoords.x === 'number' && typeof dropCoords.y === 'number') {
          if (studio.activeProduct === 'mate') {
            const dx = dropCoords.x - cx;
            const dy = dropCoords.y - cy;
            let deg = (Math.atan2(dy, dx) * 180 / Math.PI);
            deg = (deg + 360) % 360;
            itemAngle = deg;
            itemRadius = Math.max(140, Math.min(240, Math.hypot(dx, dy)));
            const rad = (itemAngle * Math.PI) / 180;
            itemX = cx + itemRadius * Math.cos(rad);
            itemY = cy + itemRadius * Math.sin(rad);
          } else {
            itemX = Math.max(60, Math.min(440, dropCoords.x));
            itemY = Math.max(60, Math.min(440, dropCoords.y));
            itemAngle = 0;
            itemRadius = 0;
          }
        } else {
          const placement = findNonOverlappingPosition('icon');
          itemAngle = studio.activeProduct === 'termo' ? 0 : placement.angle;
          itemRadius = placement.radius;
          itemX = studio.activeProduct === 'mate' ? placement.x : 250;
          itemY = studio.activeProduct === 'mate' ? placement.y : 265;
        }

        const newItem = {
          id: 'custom_img_' + Date.now(),
          type: 'icon',
          graphicId: 'custom_upload',
          name: (file.name || 'Logo personalizado').substring(0, 20),
          file: isBox ? processedWhiteDataUrl : processedBlackDataUrl,
          fileBlack: processedBlackDataUrl,
          fileWhite: processedWhiteDataUrl,
          angle: itemAngle,
          radius: itemRadius,
          rotation: 0,
          scale: 1.15,
          x: itemX,
          y: itemY
        };

        studio.items.push(newItem);
        studio.activeItemId = newItem.id;

        renderVirolaCanvas();
        updateActiveItemFloatingBar();
        updatePriceDisplay();
        if (studio.viewMode === '360') render360Canvas();
        showNotificationToast(
          isBox
            ? 'Imagen colocada y vectorizada en blanco para Caja'
            : '¡Imagen colocada y vectorizada lista para grabar!',
          'fa-circle-check'
        );
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  }
  window.processAndAddCustomImageFile = processAndAddCustomImageFile;

  window.handleCustomImageUpload = function(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    processAndAddCustomImageFile(file, null);
    if (e.target) e.target.value = '';
  };

  function addVectorToVirolaAtCoords(itemId, catKey, dropCoords) {
    let itemDef = null;
    if (catKey && VECTOR_CATEGORIES[catKey]) {
      itemDef = VECTOR_CATEGORIES[catKey].items.find(i => i.id === itemId);
    }
    if (!itemDef) {
      for (const k of Object.keys(VECTOR_CATEGORIES)) {
        const found = VECTOR_CATEGORIES[k].items.find(i => i.id === itemId);
        if (found) {
          itemDef = found;
          break;
        }
      }
    }
    if (!itemDef) return;

    if (itemDef.isTemplate) {
      applyVirolaPresetTemplate(itemDef.templateId || itemDef.id);
      return;
    }

    saveStudioHistoryState();
    const { cx, cy, rRing } = STUDIO_CONFIG;

    let itemAngle = 0;
    let itemRadius = rRing;
    let itemX = 250;
    let itemY = 250;

    if (dropCoords && typeof dropCoords.x === 'number' && typeof dropCoords.y === 'number') {
      if (studio.activeProduct === 'mate') {
        const dx = dropCoords.x - cx;
        const dy = dropCoords.y - cy;
        let deg = (Math.atan2(dy, dx) * 180 / Math.PI);
        deg = (deg + 360) % 360;
        itemAngle = deg;
        itemRadius = Math.max(140, Math.min(240, Math.hypot(dx, dy)));
        const rad = (itemAngle * Math.PI) / 180;
        itemX = cx + itemRadius * Math.cos(rad);
        itemY = cy + itemRadius * Math.sin(rad);
      } else {
        itemX = Math.max(60, Math.min(440, dropCoords.x));
        itemY = Math.max(60, Math.min(440, dropCoords.y));
        itemAngle = 0;
        itemRadius = 0;
      }
    } else {
      const placement = findNonOverlappingPosition('icon');
      itemAngle = placement.angle;
      itemRadius = placement.radius;
      itemX = placement.x;
      itemY = placement.y;
    }

    const newItem = {
      id: 'icon_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'icon',
      graphicId: itemDef.id,
      name: itemDef.name,
      file: itemDef.file,
      fileBlack: itemDef.fileBlack || itemDef.file,
      fileWhite: itemDef.fileWhite || itemDef.file,
      angle: itemAngle,
      radius: itemRadius,
      rotation: 0,
      scale: 1.0,
      x: itemX,
      y: itemY
    };

    studio.items.push(newItem);
    studio.activeItemId = newItem.id;

    renderVirolaCanvas();
    updateActiveItemFloatingBar();
    updatePriceDisplay();
    if (studio.viewMode === '360') render360Canvas();
    showNotificationToast(`Diseño "${newItem.name}" colocado en la superficie`, 'fa-palette');
  }
  window.addVectorToVirolaAtCoords = addVectorToVirolaAtCoords;

  function initCanvasDragDrop() {
    const canvasWrap = document.getElementById('studio-canvas-wrap');
    const overlay = document.getElementById('studio-canvas-drop-overlay');
    if (!canvasWrap) return;

    let dragCounter = 0;

    function showOverlay(msg) {
      if (overlay) {
        overlay.style.display = 'flex';
        const textEl = overlay.querySelector('h3');
        if (textEl && msg) textEl.textContent = msg;
      }
    }

    function hideOverlay() {
      if (overlay) overlay.style.display = 'none';
    }

    // Prevenir apertura automática del archivo de imagen en el navegador al arrastrar
    window.addEventListener('dragover', (e) => {
      if (e.target && e.target.closest && (e.target.closest('.customizer-stage') || e.target.closest('#studio-canvas-wrap') || e.target.closest('.studio-stage-panel'))) {
        e.preventDefault();
      }
    }, false);

    window.addEventListener('drop', (e) => {
      if (e.target && e.target.closest && (e.target.closest('.customizer-stage') || e.target.closest('#studio-canvas-wrap') || e.target.closest('.studio-stage-panel'))) {
        e.preventDefault();
      }
    }, false);

    canvasWrap.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      const isFile = e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files');
      showOverlay(isFile ? 'Soltá tu imagen aquí para colocarla en el producto' : 'Soltá el diseño para colocarlo aquí');
    });

    canvasWrap.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    });

    canvasWrap.addEventListener('dragleave', (e) => {
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        hideOverlay();
      }
    });

    canvasWrap.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      hideOverlay();

      const coords = getPointerCoords(e);

      // 1. Archivo arrastrado desde la PC / Explorador
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/') || /\.(png|jpe?g|svg|webp|bmp)$/i.test(file.name)) {
          processAndAddCustomImageFile(file, coords);
          return;
        }
      }

      // 2. Ícono interno arrastrado desde el Ribbon o Modal
      try {
        const rawData = e.dataTransfer.getData('application/json');
        if (rawData) {
          const payload = JSON.parse(rawData);
          if (payload && payload.type === 'icon' && payload.itemId) {
            addVectorToVirolaAtCoords(payload.itemId, payload.catKey, coords);
            return;
          }
        }
        const plainId = e.dataTransfer.getData('text/plain');
        if (plainId) {
          addVectorToVirolaAtCoords(plainId, null, coords);
          return;
        }
      } catch (err) {}
    });

    // Dropzone del Ribbon (pestaña Subir)
    const ribbonDropzone = document.getElementById('ribbon-custom-dropzone');
    if (ribbonDropzone) {
      ribbonDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        ribbonDropzone.classList.add('dropzone-hover');
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      });
      ribbonDropzone.addEventListener('dragleave', () => {
        ribbonDropzone.classList.remove('dropzone-hover');
      });
      ribbonDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        ribbonDropzone.classList.remove('dropzone-hover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/') || /\.(png|jpe?g|svg|webp|bmp)$/i.test(file.name)) {
            processAndAddCustomImageFile(file, null);
          }
        }
      });
    }
  }
  window.initCanvasDragDrop = initCanvasDragDrop;

  function syncTermo360ButtonVisibility() {
    const btn360 = document.getElementById('btn-termo-360-toggle');
    if (btn360) {
      if (studio.activeProduct === 'termo') {
        btn360.style.setProperty('display', 'inline-flex', 'important');
      } else {
        btn360.style.setProperty('display', 'none', 'important');
        studio.termo360Active = false;
        const txt = document.getElementById('termo-360-btn-text');
        if (txt) txt.textContent = '360°';
        btn360.classList.remove('active');
      }
    }
  }
  window.syncTermo360ButtonVisibility = syncTermo360ButtonVisibility;

  function syncCurvatureControlsVisibility() {
    document.body.setAttribute('data-active-product', studio.activeProduct || 'mate');
    syncTermo360ButtonVisibility();
    const curveBtn = document.querySelector('.active-text-curve-btn');
    const curveGroup = curveBtn ? curveBtn.closest('.ribbon-group') : null;
    if (curveGroup) {
      curveGroup.style.display = studio.activeProduct === 'mate' ? '' : 'none';
    }
    const virolaLinesGroup = document.getElementById('virola-lines-ribbon-group');
    if (virolaLinesGroup) {
      virolaLinesGroup.style.display = studio.activeProduct === 'mate' ? '' : 'none';
    }
  }

  // Sincronización automática al cambiar de producto (Mate / Termo en negro, Caja vertical en blanco; coordenadas centradas)
  const _origSwitchActiveProduct = window.switchActiveProduct;
  window.switchActiveProduct = function(prodType) {
    const prevProduct = studio.activeProduct;
    _origSwitchActiveProduct(prodType);
    syncCurvatureControlsVisibility();

    const svg = document.getElementById('virola-studio-svg');
    if (svg) svg.setAttribute('data-product', studio.activeProduct);

    const textItems = studio.items.filter(i => i.type === 'text');
    const iconItems = studio.items.filter(i => i.type === 'icon');

    // Actualizar automáticamente el archivo de imágenes cargadas según el color de grabado del producto
    iconItems.forEach(item => {
      if (studio.activeProduct === 'caja') {
        if (item.fileWhite) item.file = item.fileWhite;
      } else {
        if (item.fileBlack) item.file = item.fileBlack;
      }
    });

    // Ajustar coordenadas al pasar entre virola circular (mate) y superficies frontales (termo / caja vertical)
    if (studio.activeProduct === 'termo') {
      textItems.forEach((t, idx) => {
        if (prevProduct === 'mate' || t.x === undefined || t.x < 185 || t.x > 315 || t.y < 95 || t.y > 415) {
          t.x = 250;
          t.y = 175 + idx * 42;
        }
        t.angle = 0;
        t.rotation = 0;
      });
      iconItems.forEach((ic, idx) => {
        if (prevProduct === 'mate' || ic.x === undefined || ic.x < 185 || ic.x > 315 || ic.y < 95 || ic.y > 415) {
          ic.x = 250;
          ic.y = 285 + idx * 58;
        }
        ic.angle = 0;
      });
    } else if (studio.activeProduct === 'caja') {
      textItems.forEach((t, idx) => {
        if (prevProduct === 'mate' || t.x === undefined || t.x < 145 || t.x > 355 || t.y < 90 || t.y > 410) {
          t.x = 250;
          t.y = 165 + idx * 45;
        }
        t.rotation = 0;
      });
      iconItems.forEach((ic, idx) => {
        if (prevProduct === 'mate' || ic.x === undefined || ic.x < 145 || ic.x > 355 || ic.y < 90 || ic.y > 410) {
          ic.x = 250;
          ic.y = 275 + idx * 58;
        }
      });
    } else if (studio.activeProduct === 'mate' && prevProduct !== 'mate') {
      const { cx, cy, rRing } = STUDIO_CONFIG;
      textItems.forEach((t, idx) => {
        const ang = idx % 2 === 0 ? 270 : 90;
        const rad = (ang * Math.PI) / 180;
        t.angle = ang;
        t.radius = rRing;
        t.arcPosition = idx % 2 === 0 ? 'top' : 'bottom';
        t.x = cx + rRing * Math.cos(rad);
        t.y = cy + rRing * Math.sin(rad);
      });
      iconItems.forEach((ic, idx) => {
        const ang = idx === 0 ? 90 : (idx * 90) % 360;
        const rad = (ang * Math.PI) / 180;
        ic.angle = ang;
        ic.radius = rRing;
        ic.x = cx + rRing * Math.cos(rad);
        ic.y = cy + rRing * Math.sin(rad);
      });
    }

    renderVirolaCanvas();
  };

  // Helper para renderizar controles interactivos (escalar, rotar, eliminar) en Termo y Caja 2D
  function build2DItemHandlesHtml(item, halfW, halfH, isWhiteTheme) {
    if (item.id !== studio.activeItemId) return '';
    const strokeCol = isWhiteTheme ? '#ffffff' : '#111111';
    const scaleX = halfW + 10;
    const scaleY = halfH + 10;
    const rotX = -halfW - 10;
    const rotY = -halfH - 10;
    const delX = halfW + 10;
    const delY = -halfH - 10;

    return `
      <rect x="${(-halfW - 6).toFixed(2)}" y="${(-halfH - 6).toFixed(2)}"
            width="${(halfW * 2 + 12).toFixed(2)}" height="${(halfH * 2 + 12).toFixed(2)}"
            fill="none" stroke="${strokeCol}" stroke-width="1.8" stroke-dasharray="4,4"
            rx="6" ry="6" opacity="0.9" pointer-events="none" />
      <g class="virola-handle handle-delete" data-handle="delete" data-item-id="${item.id}"
         transform="translate(${delX.toFixed(2)}, ${delY.toFixed(2)})"
         onmousedown="startFreeItemDrag('${item.id}', event)"
         ontouchstart="startFreeItemDrag('${item.id}', event)"
         style="cursor: pointer; touch-action: none !important;">
        <circle r="22" fill="transparent" pointer-events="all" />
        <circle r="12" fill="#111111" stroke="#ffffff" stroke-width="1.8" />
        <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900" pointer-events="none">✕</text>
      </g>
      <g class="virola-handle handle-rotate" data-handle="rotate" data-item-id="${item.id}"
         transform="translate(${rotX.toFixed(2)}, ${rotY.toFixed(2)})"
         onmousedown="startFreeItemDrag('${item.id}', event)"
         ontouchstart="startFreeItemDrag('${item.id}', event)"
         style="cursor: grab; touch-action: none !important;">
        <circle r="22" fill="transparent" pointer-events="all" />
        <circle r="12" fill="#18181b" stroke="#ffffff" stroke-width="1.8" />
        <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900" pointer-events="none">↻</text>
      </g>
      <g class="virola-handle handle-scale" data-handle="scale" data-item-id="${item.id}"
         transform="translate(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)})"
         onmousedown="startFreeItemDrag('${item.id}', event)"
         ontouchstart="startFreeItemDrag('${item.id}', event)"
         style="cursor: nwse-resize; touch-action: none !important;">
        <circle r="22" fill="transparent" pointer-events="all" />
        <circle r="12" fill="#18181b" stroke="#ffffff" stroke-width="1.8" />
        <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900" pointer-events="none">⤡</text>
      </g>
    `;
  }

  function buildBoxHandlesHtml(item, halfW, halfH) {
    if (!item || item.id !== studio.activeItemId) return '';
    const x = item.x !== undefined ? item.x : STUDIO_CONFIG.cx;
    const y = item.y !== undefined ? item.y : 250;
    const rot = item.rotation || 0;
    return `
      <g class="virola-active-handle-group" data-item-id="${item.id}" transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})">
        ${build2DItemHandlesHtml(item, halfW, halfH, true)}
      </g>
    `;
  }

  function buildTermoHandlesHtml(item, halfW, halfH) {
    if (!item || item.id !== studio.activeItemId) return '';
    const x = item.x !== undefined ? item.x : STUDIO_CONFIG.cx;
    const y = item.y !== undefined ? item.y : 250;
    const rot = item.rotation || 0;
    return `
      <g class="virola-active-handle-group" data-item-id="${item.id}" transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})">
        ${build2DItemHandlesHtml(item, halfW, halfH, false)}
      </g>
    `;
  }

  // 7. Sobrescribir renderVirolaCanvas:
  //    - Mate: fondo blanco puro, círculo exterior negro y círculo interior negro (sin sombras ni degradados)
  //    - Termo: rectángulo vertical proporcionado (más grande de ancho y alto, blanco con trazo negro), botón 360° funcional
  //    - Caja: formato VERTICAL negro con textos e íconos en BLANCO (sin líneas de puntos ni sombreados grises)
  const _origRenderVirolaCanvas = window.renderVirolaCanvas;
  window.renderVirolaCanvas = function() {
    const svg = document.getElementById('virola-studio-svg');
    if (!svg) return;
    svg.setAttribute('data-product', studio.activeProduct);

    if (studio.activeProduct === 'mate') {
      studio.items.forEach(it => {
        if (it.type === 'icon' && it.fileBlack) it.file = it.fileBlack;
      });
      return _origRenderVirolaCanvas();
    }

    const { cx } = STUDIO_CONFIG;

    // -------------------------------------------------------------------------
    // VISTA 2D DEL TERMO (RECTÁNGULO VERTICAL AGRANDADO / VISTA 360° HORIZONTAL)
    // -------------------------------------------------------------------------
    if (studio.activeProduct === 'termo') {
      if (studio.termo360Active) {
        // Vista Horizontal 360°: Rectángulo extendido más grande y más largo
        const rectW = 470;
        const rectH = 300;
        const rectX = cx - rectW / 2; // 15
        const rectY = 100;

        let textsHtml = '';
        let handlesHtml = '';
        const textItems = studio.items.filter(i => i.type === 'text');
        textItems.forEach((t, idx) => {
          const isActive = t.id === studio.activeItemId;
          if (t.x === undefined || t.y < rectY - 30 || t.y > rectY + rectH + 30) {
            t.x = cx;
            t.y = rectY + 60 + idx * 45;
          }
          // Permitir movimiento libre hasta los bordes y esquinas para grabado CNC
          const x = Math.max(rectX - 15, Math.min(rectX + rectW + 15, t.x));
          const y = Math.max(rectY - 15, Math.min(rectY + rectH + 15, t.y));
          t.x = x;
          t.y = y;
          const rot = t.rotation || 0;
          const fSize = Math.round((t.fontSize || 22) * (t.scale || 1));
          const approxHalfW = Math.max(36, ((t.text || '').length * fSize * 0.34));
          const approxHalfH = Math.max(14, fSize * 0.65);

          textsHtml += `
            <g class="virola-text-group ${isActive ? 'active-text-item' : ''}" 
               data-item-id="${t.id}"
               transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
               onmousedown="startFreeItemDrag('${t.id}', event)"
               ontouchstart="startFreeItemDrag('${t.id}', event)">
              <text font-family="'${t.font || 'Cinzel'}', serif" 
                    font-size="${fSize}" 
                    font-weight="800" 
                    letter-spacing="1.5px" 
                    fill="#111111" 
                    text-anchor="middle" 
                    dominant-baseline="central" 
                    style="cursor: grab; fill: #111111 !important;" 
                    class="virola-curved-text ${isActive ? 'active-text-element' : ''}" 
                    data-item-id="${t.id}">
                ${escapeHtml(t.text)}
              </text>
            </g>
          `;
          if (isActive) {
            handlesHtml = buildTermoHandlesHtml(t, approxHalfW, approxHalfH);
          }
        });

        let iconsHtml = '';
        const iconItems = studio.items.filter(i => i.type === 'icon' || i.type === 'image');
        iconItems.forEach((item, idx) => {
          if (item.fileBlack) item.file = item.fileBlack;
          const scale = item.scale || 1.0;
          const rot = item.rotation || 0;
          const isActive = item.id === studio.activeItemId;
          if (item.x === undefined || item.y < rectY - 30 || item.y > rectY + rectH + 30) {
            item.x = cx;
            item.y = rectY + 110 + idx * 45;
          }
          // Permitir movimiento libre hasta los bordes y esquinas para grabado CNC
          const x = Math.max(rectX - 15, Math.min(rectX + rectW + 15, item.x));
          const y = Math.max(rectY - 15, Math.min(rectY + rectH + 15, item.y));
          item.x = x;
          item.y = y;
          const baseSize = 44;
          const wRatio = item.wRatio || 1.0;
          const hRatio = item.hRatio || 1.0;
          const itemW = baseSize * scale * wRatio;
          const itemH = baseSize * scale * hRatio;
          const halfW = itemW / 2;
          const halfH = itemH / 2;

          const contentHtml = `<image href="${item.file}" x="${-halfW}" y="${-halfH}" width="${itemW}" height="${itemH}" preserveAspectRatio="xMidYMid meet" style="filter: grayscale(100%) contrast(115%);" />`;

          iconsHtml += `
            <g class="virola-sticker-group ${isActive ? 'active-sticker' : ''}" 
               data-item-id="${item.id}" 
               transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
               onmousedown="startFreeItemDrag('${item.id}', event)"
               ontouchstart="startFreeItemDrag('${item.id}', event)"
               style="cursor: grab;">
              ${contentHtml}
            </g>
          `;
          if (isActive) {
            handlesHtml = buildTermoHandlesHtml(item, halfW, halfH);
          }
        });

        svg.innerHTML = `
          <defs>
            <clipPath id="termo-360-clip">
              <rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" rx="8" />
            </clipPath>
          </defs>

          <!-- Fondo blanco puro -->
          <rect width="500" height="500" fill="#ffffff" />

          <!-- Rectángulo Grande Horizontal 360° (Desarrollo cilíndrico completo del Termo, blanco puro con borde negro) -->
          <rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" rx="8" fill="#ffffff" stroke="#111111" stroke-width="2.5" />
          <line x1="${rectX + rectW / 3}" y1="${rectY}" x2="${rectX + rectW / 3}" y2="${rectY + rectH}" stroke="rgba(0,0,0,0.12)" stroke-width="1" stroke-dasharray="4,4" />
          <line x1="${rectX + (rectW / 3) * 2}" y1="${rectY}" x2="${rectX + (rectW / 3) * 2}" y2="${rectY + rectH}" stroke="rgba(0,0,0,0.12)" stroke-width="1" stroke-dasharray="4,4" />

          <!-- Grabados en color negro sobre el lienzo 360° (recortados estrictamente en los bordes y esquinas redondeadas del termo) -->
          <g class="virola-engravings-container" clip-path="url(#termo-360-clip)">
            <g class="virola-texts-layer">${textsHtml}</g>
            <g class="virola-icons-layer">${iconsHtml}</g>
          </g>

          <!-- Controles interactivos fuera del clipPath para garantizar accesibilidad total de los manejadores -->
          <g class="virola-active-handles-layer">${handlesHtml}</g>
        `;
        return;
      }

      // Vista Estándar del Termo: Rectángulo vertical más grande y largo (ancho 180, alto 455, blanco puro)
      const tWidth = 180;
      const tHeight = 455;
      const tX = cx - tWidth / 2; // 160
      const tY = 22;

      let textsHtml = '';
      let handlesHtml = '';
      const textItems = studio.items.filter(i => i.type === 'text');
      textItems.forEach((t, idx) => {
        const isActive = t.id === studio.activeItemId;
        if (t.x === undefined || t.y < tY || t.y > tY + tHeight) {
          t.x = cx;
          t.y = 135 + idx * 42;
        }
        const x = Math.max(tX + 16, Math.min(tX + tWidth - 16, t.x));
        const y = Math.max(tY + 24, Math.min(tY + tHeight - 24, t.y));
        t.x = x;
        t.y = y;
        const rot = t.rotation || 0;
        const fSize = Math.round((t.fontSize || 20) * (t.scale || 1));
        const approxHalfW = Math.max(30, ((t.text || '').length * fSize * 0.32));
        const approxHalfH = Math.max(14, fSize * 0.65);

        textsHtml += `
          <g class="virola-text-group ${isActive ? 'active-text-item' : ''}" 
             data-item-id="${t.id}"
             transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
             onmousedown="startFreeItemDrag('${t.id}', event)"
             ontouchstart="startFreeItemDrag('${t.id}', event)">
            <text font-family="'${t.font || 'Cinzel'}', serif" 
                  font-size="${fSize}" 
                  font-weight="800" 
                  letter-spacing="1.2px" 
                  fill="#111111" 
                  text-anchor="middle" 
                  dominant-baseline="central" 
                  style="cursor: grab; fill: #111111 !important;" 
                  class="virola-curved-text ${isActive ? 'active-text-element' : ''}" 
                  data-item-id="${t.id}">
                ${escapeHtml(t.text)}
            </text>
          </g>
        `;
        if (isActive) {
          handlesHtml = buildTermoHandlesHtml(t, approxHalfW, approxHalfH);
        }
      });

      let iconsHtml = '';
      const iconItems = studio.items.filter(i => i.type === 'icon' || i.type === 'image');
      iconItems.forEach((item, idx) => {
        if (item.fileBlack) item.file = item.fileBlack;
        const scale = item.scale || 1.0;
        const rot = item.rotation || 0;
        const isActive = item.id === studio.activeItemId;
        if (item.x === undefined || item.y < tY || item.y > tY + tHeight) {
          item.x = cx;
          item.y = 230 + idx * 50;
        }
        const x = Math.max(tX + 18, Math.min(tX + tWidth - 18, item.x));
        const y = Math.max(tY + 24, Math.min(tY + tHeight - 24, item.y));
        item.x = x;
        item.y = y;
        const baseSize = 44;
        const wRatio = item.wRatio || 1.0;
        const hRatio = item.hRatio || 1.0;
        const itemW = baseSize * scale * wRatio;
        const itemH = baseSize * scale * hRatio;
        const halfW = itemW / 2;
        const halfH = itemH / 2;

        const contentHtml = `<image href="${item.file}" x="${-halfW}" y="${-halfH}" width="${itemW}" height="${itemH}" preserveAspectRatio="xMidYMid meet" style="filter: grayscale(100%) contrast(115%);" />`;

        iconsHtml += `
          <g class="virola-sticker-group ${isActive ? 'active-sticker' : ''}" 
             data-item-id="${item.id}" 
             transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
             onmousedown="startFreeItemDrag('${item.id}', event)"
             ontouchstart="startFreeItemDrag('${item.id}', event)"
             style="cursor: grab;">
            ${contentHtml}
          </g>
        `;
        if (isActive) {
          handlesHtml = buildTermoHandlesHtml(item, halfW, halfH);
        }
      });

      svg.innerHTML = `
        <defs>
          <clipPath id="termo-face-clip">
            <rect x="${tX}" y="${tY}" width="${tWidth}" height="${tHeight}" rx="12" />
          </clipPath>
        </defs>

        <!-- Fondo blanco puro -->
        <rect width="500" height="500" fill="#ffffff" />

        <!-- Tapón y pico cebador superior del termo -->
        <rect x="${cx - 36}" y="${tY - 14}" width="72" height="14" rx="4" fill="#ffffff" stroke="#111111" stroke-width="2" />
        <rect x="${cx - 16}" y="${tY - 20}" width="32" height="6" rx="2" fill="#ffffff" stroke="#111111" stroke-width="1.5" />

        <!-- Cuerpo del Termo Cilíndrico: fondo blanco puro, trazo negro nítido -->
        <rect x="${tX}" y="${tY}" width="${tWidth}" height="${tHeight}" rx="12" fill="#ffffff" stroke="#111111" stroke-width="2.5" />
        <line x1="${tX + 10}" y1="${tY + 24}" x2="${tX + tWidth - 10}" y2="${tY + 24}" stroke="rgba(0,0,0,0.18)" stroke-width="1.2" />
        <line x1="${tX + 10}" y1="${tY + tHeight - 24}" x2="${tX + tWidth - 10}" y2="${tY + tHeight - 24}" stroke="rgba(0,0,0,0.18)" stroke-width="1.2" />

        <!-- Grabados en color negro sobre el termo (recortados suavemente en los bordes) -->
        <g class="virola-engravings-container" clip-path="url(#termo-face-clip)">
          <g class="virola-texts-layer">${textsHtml}</g>
          <g class="virola-icons-layer">${iconsHtml}</g>
        </g>

        <!-- Controles interactivos fuera de recorte para total accesibilidad -->
        <g class="virola-active-handles-layer">${handlesHtml}</g>
      `;
      return;
    }

    // -------------------------------------------------------------------------
    // VISTA 2D DE LA CAJA DE PRESENTACIÓN VERTICAL (Grabado en BLANCO, sin líneas de puntos ni sombreados)
    // -------------------------------------------------------------------------
    const boxW = 270;
    const boxH = 410;
    const boxX = cx - boxW / 2; // 115..385
    const boxY = 45;            // 45..455

    let textsHtml = '';
    let handlesHtml = '';
    const textItems = studio.items.filter(i => i.type === 'text');
    textItems.forEach((t, idx) => {
      const isActive = t.id === studio.activeItemId;
      if (t.x === undefined) {
        t.x = cx;
        t.y = 165 + idx * 45;
      }
      const x = t.x;
      const y = t.y;
      const rot = t.rotation !== undefined ? t.rotation : 0;
      const fSize = Math.round((t.fontSize || 22) * (t.scale || 1));
      const approxHalfW = Math.max(38, ((t.text || '').length * fSize * 0.34));
      const approxHalfH = Math.max(14, fSize * 0.65);

      textsHtml += `
        <g class="virola-text-group ${isActive ? 'active-text-item' : ''}" 
           data-item-id="${t.id}"
           transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
           onmousedown="startFreeItemDrag('${t.id}', event)"
           ontouchstart="startFreeItemDrag('${t.id}', event)">
          <text font-family="'${t.font || 'Cinzel'}', serif" 
                font-size="${fSize}" 
                font-weight="800" 
                letter-spacing="2px" 
                fill="#ffffff" 
                text-anchor="middle" 
                dominant-baseline="central" 
                style="cursor: grab; fill: #ffffff !important; color: #ffffff !important;" 
                class="virola-curved-text box-white-text ${isActive ? 'active-text-element' : ''}" 
                data-item-id="${t.id}">
            ${escapeHtml(t.text)}
          </text>
        </g>
      `;
      if (isActive) {
        handlesHtml = buildBoxHandlesHtml(t, approxHalfW, approxHalfH);
      }
    });

    let iconsHtml = '';
    const iconItems = studio.items.filter(i => i.type === 'icon' || i.type === 'image');
    iconItems.forEach((item, idx) => {
      const scale = item.scale || 1.0;
      const rot = item.rotation || 0;
      const isActive = item.id === studio.activeItemId;
      if (item.x === undefined) {
        item.x = cx;
        item.y = 265 + idx * 55;
      }
      const x = item.x;
      const y = item.y;
      const baseSize = 48;
      const wRatio = item.wRatio || 1.0;
      const hRatio = item.hRatio || 1.0;
      const itemW = baseSize * scale * wRatio;
      const itemH = baseSize * scale * hRatio;
      const halfW = itemW / 2;
      const halfH = itemH / 2;

      const isFootballShield = item.category === 'deportes' || /boca|river|racing|independiente|velez|sanlorenzo|talleres|belgrano|afa|estrellas/i.test(item.id || item.graphicId || '');
      const filterStyle = isFootballShield
        ? 'none'
        : 'grayscale(100%) invert(1) contrast(115%)';

      const contentHtml = `<image href="${item.file}" x="${-halfW}" y="${-halfH}" width="${itemW}" height="${itemH}" preserveAspectRatio="xMidYMid meet" style="filter: ${filterStyle};" />`;

      iconsHtml += `
        <g class="virola-sticker-group box-white-icon ${isActive ? 'active-sticker' : ''}" 
           data-item-id="${item.id}" 
           transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot})"
           onmousedown="startFreeItemDrag('${item.id}', event)"
           ontouchstart="startFreeItemDrag('${item.id}', event)"
           style="cursor: grab;">
          ${contentHtml}
        </g>
      `;
      if (isActive) {
        handlesHtml = buildBoxHandlesHtml(item, halfW, halfH);
      }
    });

    svg.innerHTML = `
      <defs>
        <clipPath id="box-face-clip">
          <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="10" />
        </clipPath>
      </defs>

      <!-- Fondo blanco puro del lienzo -->
      <rect width="500" height="500" fill="#ffffff" />

      <!-- Cuerpo Rectangular VERTICAL de la Caja de Presentación (Negra sólida, sin líneas de puntos ni sombras) -->
      <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="10" fill="#18181b" stroke="#333333" stroke-width="2.5" />

      <!-- Grabados invertidos en color blanco recortados limpiamente con los bordes de la caja -->
      <g class="virola-engravings-container" clip-path="url(#box-face-clip)">
        <g class="virola-texts-layer">${textsHtml}</g>
        <g class="virola-icons-layer">${iconsHtml}</g>
      </g>

      <!-- Controles del elemento activo (fuera de clipPath para que nunca se corten) -->
      <g class="virola-active-handles-layer">${handlesHtml}</g>
    `;
  };

  // -------------------------------------------------------------------------
  // CONTROLADOR DE VISTA 360° PARA TERMO (OPUESTO A FINALIZAR PEDIDO)
  // -------------------------------------------------------------------------
  studio.termo360Active = false;

  window.toggleTermo360View = function() {
    studio.termo360Active = !studio.termo360Active;
    const btn = document.getElementById('btn-termo-360-toggle');
    const txt = document.getElementById('termo-360-btn-text');
    if (btn && txt) {
      if (studio.termo360Active) {
        btn.classList.add('active');
        btn.style.background = '#000000';
        btn.style.color = '#ffffff';
        txt.textContent = 'Vertical';
        if (typeof showNotificationToast === 'function') {
          showNotificationToast('Vista 360° extendida horizontal activada', 'fa-arrows-rotate');
        }
      } else {
        btn.classList.remove('active');
        btn.style.background = '#ffffff';
        btn.style.color = '#000000';
        txt.textContent = '360°';
        if (typeof showNotificationToast === 'function') {
          showNotificationToast('Vista vertical estándar del termo', 'fa-arrows-rotate');
        }
      }
    }
    renderVirolaCanvas();
  };

  const _origUpdateStageBadge = window.updateStageBadge;
  window.updateStageBadge = function() {
    if (typeof _origUpdateStageBadge === 'function') _origUpdateStageBadge();
    if (typeof syncTermo360ButtonVisibility === 'function') {
      syncTermo360ButtonVisibility();
    }
  };

  window.render360Canvas = function() {
    const canvas = document.getElementById('studio-360-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const rotRad = (studio.rotation360 * Math.PI) / 180;

    ctx.clearRect(0, 0, w, h);
    studio.projected360Items = [];

    function getCachedImage(src) {
      if (!src) return null;
      if (!studio._imgCache360[src]) {
        const im = new Image();
        im.onload = () => {
          if (studio.viewMode === '360') window.render360Canvas();
        };
        im.src = src;
        studio._imgCache360[src] = im;
      }
      return studio._imgCache360[src];
    }

    if (studio.activeProduct === 'mate') {
      const centerX = w / 2;
      const centerY = h / 2 - 20;

      // Sombra
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 220, 160, 36, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fill();
      ctx.restore();

      // Base de Alpaca
      ctx.save();
      const baseGrad = ctx.createLinearGradient(centerX - 90, centerY + 180, centerX + 90, centerY + 180);
      baseGrad.addColorStop(0, '#555555');
      baseGrad.addColorStop(0.5, '#e5e5e5');
      baseGrad.addColorStop(1, '#333333');
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 180, 85, 26, 0, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.restore();

      // Cuerpo de cuero negro bitono
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX - 165, centerY + 20);
      ctx.bezierCurveTo(centerX - 180, centerY + 110, centerX - 120, centerY + 175, centerX - 80, centerY + 180);
      ctx.lineTo(centerX + 80, centerY + 180);
      ctx.bezierCurveTo(centerX + 120, centerY + 175, centerX + 180, centerY + 110, centerX + 165, centerY + 20);
      ctx.closePath();

      const leatherGrad = ctx.createRadialGradient(centerX - 40, centerY + 80, 20, centerX, centerY + 100, 170);
      leatherGrad.addColorStop(0, '#262626');
      leatherGrad.addColorStop(0.6, '#141414');
      leatherGrad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = leatherGrad;
      ctx.fill();
      ctx.restore();

      // Corona elíptica de Alpaca
      ctx.save();
      const rxOuter = 168;
      const ryOuter = 46;
      const rxInner = 118;
      const ryInner = 32;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 20, rxOuter, ryOuter, 0, 0, Math.PI * 2);
      const metalGrad = ctx.createLinearGradient(centerX - rxOuter, centerY, centerX + rxOuter, centerY);
      const specOffset = (Math.sin(rotRad) + 1) / 2;
      metalGrad.addColorStop(0, '#666666');
      metalGrad.addColorStop(Math.max(0.05, Math.min(0.95, specOffset * 0.8)), '#ffffff');
      metalGrad.addColorStop(Math.max(0.1, Math.min(0.98, specOffset * 0.8 + 0.15)), '#d4d4d4');
      metalGrad.addColorStop(1, '#444444');
      ctx.fillStyle = metalGrad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#222222';
      ctx.stroke();

      // Boca interior
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 20, rxInner, ryInner, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0a0a';
      ctx.fill();

      // Proyección limpia de textos e íconos (sin contornos rotos al girar)
      studio.items.forEach(item => {
        const itemAngle = (item.angle || 0) + studio.rotation360;
        const angleRad = (itemAngle * Math.PI) / 180;
        const facing = Math.sin(angleRad);

        if (facing > -0.15) {
          const projX = centerX + Math.cos(angleRad) * (rxOuter + rxInner) / 2;
          const projY = centerY + 20 + Math.sin(angleRad) * (ryOuter + ryInner) / 2;
          const alpha = Math.max(0.22, Math.min(1, facing + 0.2));
          const horizPerspective = Math.max(0.35, Math.abs(facing));

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
          ctx.scale(horizPerspective, 1);

          if (item.type === 'text') {
            ctx.font = `800 ${Math.round((item.fontSize || 22) * 0.78)}px '${item.font || 'Cinzel'}', serif`;
            ctx.fillStyle = '#111111';
            ctx.strokeStyle = 'transparent';
            ctx.lineWidth = 0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.text || '', 0, 0);
          } else if (item.type === 'icon') {
            const imgEl = getCachedImage(item.fileBlack || item.file);
            if (imgEl && imgEl.complete) {
              const s = (item.scale || 1) * 30;
              ctx.drawImage(imgEl, -s / 2, -s / 2, s, s);
            }
          }
          ctx.restore();
        }
      });

      ctx.restore();
    } else if (studio.activeProduct === 'termo') {
      // Mismo tamaño exacto que en la vista 2D (tWidth = 170, tHeight = 390)
      const centerX = w / 2;
      const centerY = h / 2 + 6;
      const tWidth = 170;
      const tHeight = 390;
      const tTop = centerY - tHeight / 2;

      ctx.save();
      // Sombra inferior
      ctx.beginPath();
      ctx.ellipse(centerX, tTop + tHeight + 12, 84, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Pico vertedor y tapón superior
      ctx.beginPath();
      ctx.roundRect(centerX - 21, tTop - 36, 42, 12, 3);
      ctx.fillStyle = '#262626';
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(centerX - 40, tTop - 26, 80, 28, 6);
      ctx.fillStyle = '#111111';
      ctx.fill();

      // Cuerpo cilíndrico
      ctx.beginPath();
      ctx.roundRect(centerX - tWidth / 2, tTop, tWidth, tHeight, 16);
      const termoGrad = ctx.createLinearGradient(centerX - tWidth / 2, 0, centerX + tWidth / 2, 0);
      termoGrad.addColorStop(0, '#1f1f1f');
      termoGrad.addColorStop(0.22, '#525252');
      termoGrad.addColorStop(0.5, '#f8f8f8');
      termoGrad.addColorStop(0.78, '#404040');
      termoGrad.addColorStop(1, '#141414');
      ctx.fillStyle = termoGrad;
      ctx.fill();
      ctx.strokeStyle = '#2b2b2b';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Base inferior reforzada
      ctx.beginPath();
      ctx.roundRect(centerX - tWidth / 2 + 3, tTop + tHeight - 18, tWidth - 6, 18, 8);
      ctx.fillStyle = '#141414';
      ctx.fill();

      studio.items.forEach(item => {
        const horizOffsetAngle = (((item.x !== undefined ? item.x : 250) - 250) / (tWidth / 2)) * 60;
        const itemAngle = horizOffsetAngle + studio.rotation360;
        const angleRad = (itemAngle * Math.PI) / 180;
        const facing = Math.cos(angleRad);

        if (facing > -0.15) {
          const projX = centerX + Math.sin(angleRad) * (tWidth / 2 - 14);
          const projY = tTop + ((item.y !== undefined ? item.y : 250) - 66);
          const scaleComp = Math.max(0.28, facing);

          studio.projected360Items.push({
            id: item.id,
            projX: projX,
            projY: projY,
            radius: 30,
            facing: facing
          });

          ctx.save();
          ctx.globalAlpha = Math.max(0.22, facing);
          ctx.translate(projX, projY);
          ctx.scale(scaleComp, 1);
          if (item.rotation) ctx.rotate((item.rotation * Math.PI) / 180);

          if (item.type === 'text') {
            const fSize = Math.round((item.fontSize || 22) * (item.scale || 1));
            ctx.font = `800 ${fSize}px '${item.font || 'Cinzel'}', serif`;
            ctx.fillStyle = '#120e0a';
            ctx.strokeStyle = 'transparent';
            ctx.lineWidth = 0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.text || '', 0, 0);
          } else if (item.type === 'icon') {
            const imgEl = getCachedImage(item.fileBlack || item.file);
            if (imgEl && imgEl.complete) {
              const s = (item.scale || 1) * 44;
              ctx.drawImage(imgEl, -s / 2, -s / 2, s, s);
            }
          }
          ctx.restore();
        }
      });

      ctx.restore();
    }
  };

  const _origCenterActiveItem = window.centerActiveItem;
  window.centerActiveItem = function() {
    if (studio.activeProduct === 'mate') {
      return _origCenterActiveItem();
    }
    const item = studio.items.find(i => i.id === studio.activeItemId);
    if (!item) return;
    saveStudioHistoryState();
    item.x = STUDIO_CONFIG.cx;
    item.rotation = 0;
    renderVirolaCanvas();
    updateActiveItemFloatingBar();
    if (studio.viewMode === '360') render360Canvas();
    showNotificationToast('Elemento alineado al centro', 'fa-crosshairs');
  };

  const _origStepItemRotation = window.stepItemRotation;
  window.stepItemRotation = function(degDelta) {
    if (studio.activeProduct === 'mate') {
      return _origStepItemRotation(degDelta);
    }
    const item = studio.items.find(i => i.id === studio.activeItemId);
    if (!item) return;
    saveStudioHistoryState();
    item.rotation = ((item.rotation || 0) + degDelta) % 360;
    renderVirolaCanvas();
    updateActiveItemFloatingBar();
    if (studio.viewMode === '360') render360Canvas();
  };

  const _origAutoCenter = window.autoCenterAndBalanceVirola;
  window.autoCenterAndBalanceVirola = function() {
    if (studio.activeProduct === 'mate') {
      return _origAutoCenter();
    }
    saveStudioHistoryState();
    const { cx } = STUDIO_CONFIG;
    const texts = studio.items.filter(i => i.type === 'text');
    const icons = studio.items.filter(i => i.type === 'icon');
    texts.forEach((t, idx) => {
      t.x = cx;
      t.y = (studio.activeProduct === 'termo' ? 175 : 195) + idx * 42;
      t.rotation = 0;
    });
    icons.forEach((ic, idx) => {
      ic.x = cx;
      ic.y = 285 + idx * 56;
      ic.rotation = 0;
    });
    renderVirolaCanvas();
    if (studio.viewMode === '360') render360Canvas();
    showNotificationToast('Elementos centrados y equilibrados', 'fa-crosshairs');
  };

  // 9. Inyectar controles rápidos de Deshacer/Rehacer también en la barra del elemento activo (móvil/desktop)
  function injectQuickUndoRedoButtons() {
    const activeBar = document.getElementById('virola-active-item-controls');
    if (activeBar && !document.getElementById('quick-history-controls-wrap')) {
      const wrap = document.createElement('div');
      wrap.id = 'quick-history-controls-wrap';
      wrap.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; margin-right: 8px;';
      wrap.innerHTML = `
        <button type="button" class="item-quick-btn btn-studio-undo-quick" onclick="undoStudioAction()" title="Deshacer (Ctrl+Z)">
          <i class="fas fa-rotate-left"></i>
        </button>
        <button type="button" class="item-quick-btn btn-studio-redo-quick" onclick="redoStudioAction()" title="Rehacer (Ctrl+Y)">
          <i class="fas fa-rotate-right"></i>
        </button>
      `;
      activeBar.insertBefore(wrap, activeBar.firstChild);
    }
    updateHistoryButtonsUI();
  }

  window.openCompletionModal = function() {
    if (typeof window.finalizeAndAddToCart === 'function') {
      window.finalizeAndAddToCart();
    }
  };

  const _origUpdatePriceDisplay = window.updatePriceDisplay;
  if (typeof _origUpdatePriceDisplay === 'function') {
    window.updatePriceDisplay = function() {
      _origUpdatePriceDisplay();
      const confirmPriceEl = document.getElementById('confirm-mate-price');
      const mobileBarPriceEl = document.getElementById('mobile-bar-price');
      if (confirmPriceEl && mobileBarPriceEl) {
        mobileBarPriceEl.textContent = confirmPriceEl.textContent;
      }
    };
  }

  // 10. Mantener apretado (Press-and-Hold) en botones de + / - tamaño y rotación para agrandar o achicar
  //     de forma continua sin tener que hacer múltiples clics que activen el zoom del celular.
  function setupContinuousHoldButtons() {
    const buttons = document.querySelectorAll(
      'button[onclick*="stepItemScale"], button[onclick*="stepTextFontSize"], button[onclick*="stepItemRotation"]'
    );

    buttons.forEach(btn => {
      if (btn.dataset.holdConfigured === '1') return;
      const rawOnclick = btn.getAttribute('onclick') || '';
      const match = rawOnclick.match(/(stepItemScale|stepTextFontSize|stepItemRotation)\s*\(\s*([-+]?\d*\.?\d+)\s*\)/);
      if (!match) return;

      const fnName = match[1];
      const baseVal = parseFloat(match[2]);
      if (isNaN(baseVal)) return;

      btn.dataset.holdConfigured = '1';
      btn.removeAttribute('onclick');

      let holdTimeout = null;
      let holdInterval = null;
      let isHolding = false;

      const executeStep = (continuous) => {
        const sign = baseVal >= 0 ? 1 : -1;
        if (fnName === 'stepItemScale') {
          const delta = continuous ? (sign * 0.05) : baseVal;
          window.stepItemScale(delta);
        } else if (fnName === 'stepTextFontSize') {
          const delta = continuous ? (sign * 2) : baseVal;
          window.stepTextFontSize(delta);
        } else if (fnName === 'stepItemRotation') {
          const delta = continuous ? (sign * 5) : baseVal;
          window.stepItemRotation(delta);
        }
      };

      const stopHold = () => {
        if (holdTimeout) {
          clearTimeout(holdTimeout);
          holdTimeout = null;
        }
        if (holdInterval) {
          clearInterval(holdInterval);
          holdInterval = null;
        }
        isHolding = false;
      };

      const startHold = (e) => {
        if (e.type === 'pointerdown' && e.button !== undefined && e.button !== 0) return;
        if (e.cancelable) e.preventDefault();
        stopHold();
        isHolding = true;

        if (typeof saveStudioHistoryState === 'function') {
          saveStudioHistoryState();
        }

        executeStep(false);

        holdTimeout = setTimeout(() => {
          if (!isHolding) return;
          holdInterval = setInterval(() => {
            if (!isHolding) {
              stopHold();
              return;
            }
            executeStep(true);
          }, 55);
        }, 210);
      };

      btn.addEventListener('pointerdown', startHold, { passive: false });
      btn.addEventListener('pointerup', stopHold);
      btn.addEventListener('pointercancel', stopHold);
      btn.addEventListener('pointerleave', stopHold);
      btn.addEventListener('touchend', stopHold);
      btn.addEventListener('touchcancel', stopHold);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
      btn.addEventListener('dblclick', (e) => e.preventDefault());

      // Soporte por teclado (Accesibilidad Enter / Espacio)
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          executeStep(false);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    studio.circularLines = 'no';
    studio.snappingEnabled = false;
    window.syncStudioPricingFromAdmin();
    injectQuickUndoRedoButtons();
    setupContinuousHoldButtons();
    syncCurvatureControlsVisibility();
    renderModelsDropdown();
    updatePriceDisplay();
    renderRibbonTemplatesForActiveProduct();
    renderVirolaCanvas();
  });
})();
