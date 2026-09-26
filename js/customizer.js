// ==========================================================================
// PERSONALIZÁ TU MATE: DEDICATED STUDIO ENGINE (Mates Río)
// ==========================================================================

const studioState = {
  selectedMateId: 'mate-1',
  metalFinish: 'alpaca-brillante', // 'alpaca-brillante' | 'acero-satinado' | 'alpaca-envejecida'
  technique: 'laser', // 'laser' | 'cincelado' | 'fotograbado'
  designTab: 'texto', // 'texto' | 'escudos' | 'criollo' | 'guardas' | 'logo'
  text: 'JUAN & SOFÍA',
  font: 'gauchesca', // 'gauchesca' | 'cursiva' | 'serif' | 'sans'
  location: 'frente', // 'frente' | 'ambos' | 'completa'
  selectedGraphicId: null,
  selectedGuardaId: 'lisa', // 'lisa' | 'pampa' | 'floral' | 'lineas'
  uploadedFileName: null,
  uploadedFileDataUrl: null,
  notes: '',
  viewMode: 'frente' // 'frente' | 'dorso'
};

const METAL_FINISHES = {
  'alpaca-brillante': {
    id: 'alpaca-brillante',
    name: 'Alpaca Maciza Pulida Espejo',
    cssClass: 'finish-alpaca',
    desc: 'Brillo tradicional orfebre plateado'
  },
  'acero-satinado': {
    id: 'acero-satinado',
    name: 'Acero Quirúrgico Satinado',
    cssClass: 'finish-acero',
    desc: 'Terminación mate de máxima resistencia'
  },
  'alpaca-envejecida': {
    id: 'alpaca-envejecida',
    name: 'Alpaca Envejecida Artesanal',
    cssClass: 'finish-envejecida',
    desc: 'Pátina rústica campestre gauchesca'
  }
};

const GUARDAS = {
  'lisa': { id: 'lisa', name: 'Sin guarda (Virola lisa)', preview: 'Sin guarda' },
  'pampa': { id: 'pampa', name: 'Guarda Pampa Continua', preview: '▲▼▲▼▲▼▲▼▲▼▲' },
  'floral': { id: 'floral', name: 'Cincelado Floral Gauchesco', preview: '✿ ❀ ✿ ❀ ✿ ❀ ✿' },
  'lineas': { id: 'lineas', name: 'Líneas Dobles de Precisión', preview: '═════════════' }
};

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

function initStudio() {
  // 1. Read URL parameter "?mate=mate-X"
  const urlParams = new URLSearchParams(window.location.search);
  const mateFromUrl = urlParams.get('mate') || urlParams.get('product');

  if (mateFromUrl && typeof PRODUCTS_DATA !== 'undefined' && PRODUCTS_DATA.some(p => p.id === mateFromUrl)) {
    studioState.selectedMateId = mateFromUrl;
  }

  // 2. If the user already had this mate in cart with customization, pre-fill it!
  if (typeof state !== 'undefined' && state.cart) {
    const existing = state.cart.find(i => i.id === studioState.selectedMateId);
    if (existing && existing.customization) {
      const c = existing.customization;
      if (c.metalFinish) studioState.metalFinish = c.metalFinish;
      if (c.type) studioState.technique = c.type;
      if (c.text !== undefined) studioState.text = c.text;
      if (c.font) studioState.font = c.font;
      if (c.location) studioState.location = c.location;
      if (c.graphicId) studioState.selectedGraphicId = c.graphicId;
      if (c.guardaId) studioState.selectedGuardaId = c.guardaId;
      if (c.uploadedFile) studioState.uploadedFileName = c.uploadedFile;
      if (c.notes) {
        studioState.notes = c.notes;
        const notesInput = document.getElementById('custom-notes-input');
        if (notesInput) notesInput.value = c.notes;
      }

      const textInput = document.getElementById('custom-text-input');
      if (textInput) textInput.value = studioState.text;
    }
  }

  // 3. Render Mates and Graphics
  renderStudioMates();
  renderStudioGraphics();

  // 4. Update initial states
  selectMetalFinish(studioState.metalFinish);
  selectEngraveTechnique(studioState.technique);
  selectEngraveFont(studioState.font);
  selectLocation(studioState.location);
  selectGuarda(studioState.selectedGuardaId);
  switchDesignTab(studioState.designTab);

  updateStudioSimulation();
}

function renderStudioMates() {
  const container = document.getElementById('customizer-mates-grid');
  if (!container || typeof PRODUCTS_DATA === 'undefined') return;

  const mates = PRODUCTS_DATA.filter(p => p.category === 'mates');
  if (mates.length === 0) return;

  container.innerHTML = mates.map(mate => {
    const isSelected = studioState.selectedMateId === mate.id;
    return `
      <div class="custom-mate-card ${isSelected ? 'active' : ''}" id="custom-mate-card-${mate.id}" onclick="selectStudioMate('${mate.id}')">
        <img src="${mate.image}" alt="${mate.name}" class="custom-mate-thumb" />
        <div class="custom-mate-meta">
          <strong class="custom-mate-name">${mate.name}</strong>
          <span class="custom-mate-virola">${mate.specs?.virola || 'Virola de Alpaca'}</span>
          <span class="custom-mate-price">${formatARS(mate.price)}</span>
        </div>
        <div class="custom-mate-radio"><i class="fas fa-check"></i></div>
      </div>
    `;
  }).join('');
}

function renderStudioGraphics() {
  const escudosContainer = document.getElementById('escudos-selector-grid');
  const criollosContainer = document.getElementById('criollos-selector-grid');

  if (escudosContainer && typeof GRAPHICS !== 'undefined') {
    const escudos = Object.values(GRAPHICS).filter(g => g.category === 'escudos' || g.id === 'none');
    escudosContainer.innerHTML = escudos.map(g => {
      const isSelected = studioState.selectedGraphicId === g.id;
      return `
        <button type="button" class="graphic-btn ${isSelected ? 'active' : ''}" data-graphic-id="${g.id}" onclick="selectGraphic('${g.id}')" title="${g.name}">
          <div class="graphic-svg-wrap">${g.svg}</div>
          <span class="graphic-btn-name">${g.name}</span>
        </button>
      `;
    }).join('');
  }

  if (criollosContainer && typeof GRAPHICS !== 'undefined') {
    const criollos = Object.values(GRAPHICS).filter(g => g.category === 'criollo' || g.id === 'none');
    criollosContainer.innerHTML = criollos.map(g => {
      const isSelected = studioState.selectedGraphicId === g.id;
      return `
        <button type="button" class="graphic-btn ${isSelected ? 'active' : ''}" data-graphic-id="${g.id}" onclick="selectGraphic('${g.id}')" title="${g.name}">
          <div class="graphic-svg-wrap">${g.svg}</div>
          <span class="graphic-btn-name">${g.name}</span>
        </button>
      `;
    }).join('');
  }
}

function selectStudioMate(mateId) {
  studioState.selectedMateId = mateId;
  document.querySelectorAll('.custom-mate-card').forEach(c => {
    c.classList.toggle('active', c.id === `custom-mate-card-${mateId}`);
  });
  updateStudioSimulation();
}

function selectMetalFinish(metalId) {
  if (!METAL_FINISHES[metalId]) return;
  studioState.metalFinish = metalId;
  document.querySelectorAll('.metal-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-metal') === metalId);
  });
  updateStudioSimulation();
}

function selectEngraveTechnique(techId) {
  if (typeof TECHNIQUES === 'undefined' || !TECHNIQUES[techId]) return;
  studioState.technique = techId;
  document.querySelectorAll('.technique-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-technique') === techId);
  });
  updateStudioSimulation();
}

function switchDesignTab(tabId) {
  studioState.designTab = tabId;
  document.querySelectorAll('.design-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-design-tab') === tabId);
  });
  document.querySelectorAll('.design-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `design-panel-${tabId}`);
  });
}

function onCustomTextChange(val) {
  studioState.text = val.slice(0, 30);
  const countEl = document.getElementById('text-char-count');
  if (countEl) countEl.textContent = `${studioState.text.length} / 30`;
  updateStudioSimulation();
}

function clearCustomText() {
  const input = document.getElementById('custom-text-input');
  if (input) input.value = '';
  onCustomTextChange('');
  input?.focus();
}

function selectEngraveFont(fontId) {
  if (typeof FONTS === 'undefined' || !FONTS[fontId]) return;
  studioState.font = fontId;
  document.querySelectorAll('.font-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-font') === fontId);
  });
  updateStudioSimulation();
}

function selectLocation(locId) {
  if (typeof LOCATIONS === 'undefined' || !LOCATIONS[locId]) return;
  studioState.location = locId;
  document.querySelectorAll('.location-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-loc') === locId);
  });
  updateStudioSimulation();
}

function selectGraphic(graphicId) {
  if (graphicId === 'none' || studioState.selectedGraphicId === graphicId) {
    studioState.selectedGraphicId = null;
  } else {
    studioState.selectedGraphicId = graphicId;
  }

  document.querySelectorAll('.graphic-btn').forEach(btn => {
    const id = btn.getAttribute('data-graphic-id');
    btn.classList.toggle('active', id === (studioState.selectedGraphicId || 'none'));
  });

  updateStudioSimulation();
}

function selectGuarda(guardaId) {
  if (!GUARDAS[guardaId]) return;
  studioState.selectedGuardaId = guardaId;
  document.querySelectorAll('.guarda-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-guarda') === guardaId);
  });
  updateStudioSimulation();
}

function handleLogoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  studioState.uploadedFileName = file.name;

  const reader = new FileReader();
  reader.onload = (event) => {
    studioState.uploadedFileDataUrl = event.target?.result;
    const previewImg = document.getElementById('engraving-uploaded-preview');
    if (previewImg) previewImg.src = studioState.uploadedFileDataUrl;

    const chip = document.getElementById('uploaded-logo-chip');
    const chipName = document.getElementById('uploaded-logo-name');
    if (chip && chipName) {
      chipName.textContent = file.name;
      chip.style.display = 'inline-flex';
    }

    updateStudioSimulation();
    showToast(`Logo "${file.name}" cargado para grabado en virola`, 'fa-check');
  };
  reader.readAsDataURL(file);
}

function removeUploadedLogo() {
  studioState.uploadedFileName = null;
  studioState.uploadedFileDataUrl = null;

  const fileInput = document.getElementById('custom-logo-file');
  if (fileInput) fileInput.value = '';

  const chip = document.getElementById('uploaded-logo-chip');
  if (chip) chip.style.display = 'none';

  updateStudioSimulation();
}

function switchSimulatorView(mode) {
  studioState.viewMode = mode;
  document.querySelectorAll('.sim-ctrl-btn').forEach(b => b.classList.remove('active'));

  const ring = document.getElementById('virola-metallic-ring');
  const projection = document.getElementById('engraving-projection');

  if (mode === 'frente') {
    document.getElementById('btn-view-frente')?.classList.add('active');
    if (projection) projection.style.opacity = '1';
    if (ring) ring.classList.remove('view-dorso');
  } else if (mode === 'dorso') {
    document.getElementById('btn-view-dorso')?.classList.add('active');
    if (ring) ring.classList.add('view-dorso');
    // If location is frente only, show back is plain
    if (studioState.location === 'frente' && projection) {
      projection.style.opacity = '0.15';
    } else if (projection) {
      projection.style.opacity = '1';
    }
  }
}

function toggleSimulatorZoom() {
  const stage = document.querySelector('.simulator-stage');
  const btn = document.getElementById('btn-view-zoom');
  if (stage && btn) {
    const isZoomed = stage.classList.toggle('stage-macro-zoom');
    btn.classList.toggle('active', isZoomed);
  }
}

function resetCustomizerForm() {
  studioState.selectedMateId = 'mate-1';
  studioState.metalFinish = 'alpaca-brillante';
  studioState.technique = 'laser';
  studioState.designTab = 'texto';
  studioState.text = 'JUAN & SOFÍA';
  studioState.font = 'gauchesca';
  studioState.location = 'frente';
  studioState.selectedGraphicId = null;
  studioState.selectedGuardaId = 'lisa';
  studioState.uploadedFileName = null;
  studioState.uploadedFileDataUrl = null;

  const textInput = document.getElementById('custom-text-input');
  if (textInput) textInput.value = 'JUAN & SOFÍA';
  const notesInput = document.getElementById('custom-notes-input');
  if (notesInput) notesInput.value = '';

  removeUploadedLogo();
  renderStudioMates();
  renderStudioGraphics();
  selectMetalFinish('alpaca-brillante');
  selectEngraveTechnique('laser');
  selectEngraveFont('gauchesca');
  selectLocation('frente');
  selectGuarda('lisa');
  switchDesignTab('texto');
  switchSimulatorView('frente');
  updateStudioSimulation();
  showToast('Estudio de personalización restablecido', 'fa-undo');
}

function updateStudioSimulation() {
  if (typeof PRODUCTS_DATA === 'undefined') return;

  const mate = PRODUCTS_DATA.find(p => p.id === studioState.selectedMateId) || PRODUCTS_DATA[3];
  if (!mate) return;

  // 1. Image and Titles
  const simImg = document.getElementById('sim-mate-img');
  const simModelName = document.getElementById('sim-model-name');
  const simMetalType = document.getElementById('sim-metal-type');
  const summaryMateName = document.getElementById('summary-mate-name');
  const summaryMetalName = document.getElementById('summary-metal-name');
  const summaryTechName = document.getElementById('summary-tech-name');
  const summaryFinalPrice = document.getElementById('summary-final-price');

  if (simImg) simImg.src = mate.image;
  if (simModelName) simModelName.textContent = mate.name;
  if (summaryMateName) summaryMateName.textContent = mate.name;

  const metal = METAL_FINISHES[studioState.metalFinish] || METAL_FINISHES['alpaca-brillante'];
  if (simMetalType) simMetalType.textContent = metal.name;
  if (summaryMetalName) summaryMetalName.textContent = metal.name;

  const tech = (typeof TECHNIQUES !== 'undefined' && TECHNIQUES[studioState.technique]) ? TECHNIQUES[studioState.technique] : { name: 'Grabado Láser HD' };
  if (summaryTechName) summaryTechName.textContent = tech.name;
  if (summaryFinalPrice) summaryFinalPrice.textContent = formatARS(mate.price);

  // 2. Labels on Mockup
  const simTechLabel = document.getElementById('sim-technique-label');
  const simGuardaLabel = document.getElementById('sim-guarda-label');
  const simLocLabel = document.getElementById('sim-location-label');
  if (simTechLabel) simTechLabel.innerHTML = `<i class="fas fa-bolt"></i> Técnica: <b>${tech.name}</b>`;
  if (simGuardaLabel) simGuardaLabel.innerHTML = `<i class="fas fa-border-style"></i> Guarda: <b>${GUARDAS[studioState.selectedGuardaId]?.name || 'Lisa'}</b>`;
  if (simLocLabel) simLocLabel.innerHTML = `<i class="fas fa-crosshairs"></i> Ubicación: <b>${LOCATIONS[studioState.location]?.name || 'Frente'}</b>`;

  // 3. Ring styling & classes
  const ring = document.getElementById('virola-metallic-ring');
  if (ring) {
    // Remove finish classes
    ring.classList.remove('finish-alpaca', 'finish-acero', 'finish-envejecida');
    ring.classList.add(metal.cssClass);

    // Remove technique classes
    ring.classList.remove('technique-laser', 'technique-cincelado', 'technique-fotograbado');
    ring.classList.add(`technique-${studioState.technique}`);
  }

  // 4. Perimeter Guardas
  const topGuarda = document.getElementById('guarda-top');
  const bottomGuarda = document.getElementById('guarda-bottom');
  if (topGuarda && bottomGuarda) {
    topGuarda.className = `guarda-perimetral-top guarda-${studioState.selectedGuardaId}`;
    bottomGuarda.className = `guarda-perimetral-bottom guarda-${studioState.selectedGuardaId}`;
  }

  // 5. Text slot
  const textSlot = document.getElementById('engraving-text-slot');
  if (textSlot) {
    textSlot.className = `engraving-text-slot font-${studioState.font}`;
    textSlot.textContent = studioState.text || (studioState.selectedGraphicId ? '' : 'TU TEXTO AQUÍ');
  }

  // 6. Graphic slot
  const graphicSlot = document.getElementById('engraving-graphic-slot');
  if (graphicSlot) {
    if (studioState.selectedGraphicId && GRAPHICS[studioState.selectedGraphicId]?.svg && studioState.selectedGraphicId !== 'none') {
      graphicSlot.innerHTML = GRAPHICS[studioState.selectedGraphicId].svg;
      graphicSlot.style.display = 'block';
    } else {
      graphicSlot.innerHTML = '';
      graphicSlot.style.display = 'none';
    }
  }

  // 7. Uploaded logo slot
  const uploadSlot = document.getElementById('engraving-upload-slot');
  if (uploadSlot) {
    if (studioState.uploadedFileDataUrl) {
      uploadSlot.style.display = 'block';
    } else {
      uploadSlot.style.display = 'none';
    }
  }
}

// ==========================================================================
// COMPLETION MODAL & CHECKOUT ROUTING
// ==========================================================================
function getCustomizationPayload() {
  const notesInput = document.getElementById('custom-notes-input');
  const tech = (typeof TECHNIQUES !== 'undefined' && TECHNIQUES[studioState.technique]) ? TECHNIQUES[studioState.technique] : { name: 'Grabado Láser HD' };
  const fontObj = (typeof FONTS !== 'undefined' && FONTS[studioState.font]) ? FONTS[studioState.font] : { name: 'Gauchesca' };
  const locObj = (typeof LOCATIONS !== 'undefined' && LOCATIONS[studioState.location]) ? LOCATIONS[studioState.location] : { name: 'Frente centrado' };

  return {
    metalFinish: studioState.metalFinish,
    metalFinishName: METAL_FINISHES[studioState.metalFinish]?.name || 'Alpaca Maciza',
    type: studioState.technique,
    typeName: tech.name,
    text: (studioState.text || '').trim(),
    font: studioState.font,
    fontName: fontObj.name,
    location: studioState.location,
    locationName: locObj.name,
    graphicId: studioState.selectedGraphicId,
    graphicName: (studioState.selectedGraphicId && GRAPHICS[studioState.selectedGraphicId]) ? GRAPHICS[studioState.selectedGraphicId].name : null,
    guardaId: studioState.selectedGuardaId,
    guardaName: GUARDAS[studioState.selectedGuardaId]?.name || 'Lisa',
    uploadedFile: studioState.uploadedFileName,
    notes: notesInput?.value.trim() || ''
  };
}

function commitCustomizationToCart() {
  if (typeof PRODUCTS_DATA === 'undefined') return null;

  const product = PRODUCTS_DATA.find(p => p.id === studioState.selectedMateId);
  if (!product) return null;

  const customization = getCustomizationPayload();

  const existingItem = state.cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.customization = customization;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      categoryName: product.categoryName,
      quantity: 1,
      customization: customization
    });
  }

  saveCart();
  updateCartUI();
  return { product, customization };
}

function openCompletionModal() {
  const result = commitCustomizationToCart();
  if (!result) return;

  const { product, customization } = result;

  const previewBox = document.getElementById('completion-summary-preview');
  if (previewBox) {
    previewBox.innerHTML = `
      <div class="comp-item-header">
        <img src="${product.image}" alt="${product.name}" class="comp-item-thumb" />
        <div>
          <strong class="comp-item-title">${product.name}</strong>
          <span class="comp-item-price">${formatARS(product.price)}</span>
        </div>
      </div>
      <div class="comp-engraving-badge">
        <div><i class="fas fa-magic" style="color: var(--accent-leather);"></i> <b>Virola:</b> ${customization.typeName} (${customization.metalFinishName})</div>
        ${customization.text ? `<div>• <b>Texto:</b> "${customization.text}" <small>(${customization.fontName})</small></div>` : ''}
        ${customization.graphicName ? `<div>• <b>Motivo:</b> ${customization.graphicName}</div>` : ''}
        ${customization.guardaId !== 'lisa' ? `<div>• <b>Guarda:</b> ${customization.guardaName}</div>` : ''}
        ${customization.uploadedFile ? `<div>• <b>Logo adjunto:</b> ${customization.uploadedFile}</div>` : ''}
        <div>• <b>Ubicación:</b> ${customization.locationName}</div>
      </div>
    `;
  }

  const modal = document.getElementById('completion-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCompletionModal() {
  const modal = document.getElementById('completion-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Choice 1: Continue shopping -> Back to store with cart opened
function handleFinishAndContinueShopping() {
  closeCompletionModal();
  window.location.href = 'index.html?openCart=true';
}

// Choice 2: Online web checkout
function handleFinishAndOpenCheckout() {
  closeCompletionModal();
  openWebCheckout();
}

// Choice 3: Order via WhatsApp with complete engraving specs
function handleFinishAndOrderWhatsApp() {
  closeCompletionModal();
  checkoutWhatsApp();
}
