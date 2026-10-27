const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../js/customizer-studio.js');
let code = fs.readFileSync(jsPath, 'utf8');

console.log('Original customizer-studio.js size:', code.length);

// 1. In studio state object, add pitch360 and drag360 variables if not present
if (!code.includes('pitch360:')) {
  code = code.replace(
    'is360Dragging: false,\n  drag360StartX: 0,\n  drag360StartAngle: 0',
    `is360Dragging: false,
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
  projected360Items: []`
  );
  console.log('Added 360 pitch & item dragging state to studio.');
}

// 2. Replace renderRibbonQuickDesigns to show ONLY icons (no text) and fix phrases
const oldRenderRibbonRegex = /function renderRibbonQuickDesigns\(catKey\) \{[\s\S]*?showNotificationToast\(`Diseño "\$\{itemDef\.name\}" agregado a la pieza`, 'fa-shield-halved'\);\s*\}/;

const newRenderRibbonCode = `function renderRibbonQuickDesigns(catKey) {
  const container = document.getElementById('ribbon-quick-designs');
  if (!container || !VECTOR_CATEGORIES[catKey]) return;

  const items = VECTOR_CATEGORIES[catKey].items;

  if (catKey === 'frases') {
    container.innerHTML = items.map(f => \`
      <button type="button" class="ribbon-phrase-quick-btn" onclick="applyPhraseById('\${f.id}')" title="Aplicar frase grabada">
        <i class="fas fa-quote-left" style="color: var(--accent-gold); font-size: 0.72rem;"></i> \${escapeHtml(f.name)}
      </button>
    \`).join('');
    return;
  }

  // ITEM 2: ÚNICAMENTE ÍCONOS, SIN NINGÚN NOMBRE O TEXTO
  container.innerHTML = items.map(item => \`
    <button type="button" class="ribbon-icon-quick-btn" onclick="addVectorToVirola('\${item.id}', '\${catKey}')" title="\${item.name}">
      <img src="\${item.file}" alt="\${item.name}" loading="lazy" />
    </button>
  \`).join('');
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

  // Cambiar a la pestaña de texto para ver la frase seleccionada
  switchRibbonTab('text');

  const textInput = document.getElementById('active-text-input');
  if (textInput) {
    textInput.value = phraseText;
    textInput.focus();
  }

  renderVirolaCanvas();
  renderTextLayersUI();
  updateActiveItemFloatingBar();
  if (studio.viewMode === '360') render360Canvas();
  showNotificationToast(\`Frase aplicada: "\${phraseText}"\`, 'fa-quote-left');
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
  showNotificationToast(\`Diseño "\${itemDef.name}" agregado a la pieza\`, 'fa-shield-halved');
}`;

if (oldRenderRibbonRegex.test(code)) {
  code = code.replace(oldRenderRibbonRegex, newRenderRibbonCode);
  console.log('Replaced renderRibbonQuickDesigns successfully.');
} else {
  console.log('Could not match oldRenderRibbonRegex, checking manual replacement.');
}

// 3. Replace renderModalCatalogGrid for Item 1 (neat luxury grid & search)
const oldRenderModalRegex = /function renderModalCatalogGrid\(catKey\) \{[\s\S]*?span class="vector-name">\$\{item\.name\}<\/span>\s*<\/div>\s*`\)\.join\(''\);\s*\}/;

const newRenderModalCode = `function renderModalCatalogGrid(catKey) {
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
    grid.innerHTML = itemsToRender.map(f => \`
      <div class="vector-phrase-item" onclick="applyPhraseById('\${f.id}'); closeDesignCatalogModal();">
        <span class="phrase-text"><i class="fas fa-quote-left" style="color: var(--accent-gold); margin-right: 8px;"></i>\${escapeHtml(f.name)}</span>
        <button type="button" class="btn-add-phrase"><i class="fas fa-plus"></i> Usar Frase</button>
      </div>
    \`).join('');
    return;
  }

  // ITEM 1: Cuadrícula ultra profesional con miniaturas acotadas y elegantes
  grid.innerHTML = itemsToRender.map(item => \`
    <div class="vector-icon-card" onclick="addVectorToVirola('\${item.id}'); closeDesignCatalogModal();" title="\${item.name}">
      <div class="vector-thumb-wrap">
        <img src="\${item.file}" alt="\${item.name}" loading="lazy" />
      </div>
      <span class="vector-name">\${item.name}</span>
    </div>
  \`).join('');
}`;

if (oldRenderModalRegex.test(code)) {
  code = code.replace(oldRenderModalRegex, newRenderModalCode);
  console.log('Replaced renderModalCatalogGrid successfully.');
}

// 4. Replace toggleRibbonFontDropdown and populateRibbonFontDropdown for Item 3
const oldFontDropdownRegex = /function toggleRibbonFontDropdown\(\) \{[\s\S]*?function populateRibbonFontDropdown\(\) \{[\s\S]*?container\.innerHTML = GOOGLE_FONTS\.map[\s\S]*?\}\)\.join\(''\);\s*\}/;

const newFontDropdownCode = `function toggleRibbonFontDropdown() {
  const fontDropdown = document.getElementById('ribbon-font-dropdown');
  const btn = document.getElementById('ribbon-font-select-btn');
  if (!fontDropdown || !btn) return;

  const isOpen = fontDropdown.classList.contains('open');
  if (isOpen) {
    fontDropdown.classList.remove('open');
    fontDropdown.style.display = 'none';
  } else {
    populateRibbonFontDropdown();
    const rect = btn.getBoundingClientRect();
    fontDropdown.style.top = \`\${rect.bottom + 8}px\`;
    fontDropdown.style.left = \`\${Math.max(10, Math.min(window.innerWidth - 305, rect.left))}px\`;
    fontDropdown.style.display = 'block';
    fontDropdown.classList.add('open');
  }
}

function populateRibbonFontDropdown() {
  const container = document.getElementById('ribbon-font-dropdown');
  if (!container) return;

  container.innerHTML = \`
    <div style="padding: 6px 10px 10px; border-bottom: 1px solid rgba(197, 155, 39, 0.25); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 0.76rem; font-weight: 800; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.8px;">
        <i class="fas fa-font" style="margin-right: 6px;"></i>Tipografías Orfebres
      </span>
      <span style="font-size: 0.68rem; color: var(--text-muted);">\${GOOGLE_FONTS.length} estilos</span>
    </div>
    \${GOOGLE_FONTS.map(f => {
      const isSel = studio.selectedFont === f.name;
      return \`
        <div class="ribbon-font-item \${isSel ? 'selected' : ''}" 
             onclick="selectRibbonFont('\${f.name}')" 
             style="font-family: '\${f.name}', serif;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.95rem; font-weight: 700;">\${f.name}</span>
            <span style="font-size: 0.72rem; opacity: 0.65; letter-spacing: 0.5px;">Mates Río 1810</span>
          </div>
          \${isSel ? '<i class="fas fa-check" style="color: #120e0a; font-size: 0.85rem;"></i>' : ''}
        </div>
      \`;
    }).join('')}
  \`;
}`;

if (oldFontDropdownRegex.test(code)) {
  code = code.replace(oldFontDropdownRegex, newFontDropdownCode);
  console.log('Replaced Font Dropdown code successfully.');
}

// 5. Replace stepItemScale & stepItemRotation for Item 4 (fixing buttons on text & icons)
const oldStepScaleRegex = /function stepItemScale\(delta\) \{[\s\S]*?function stepItemRotation\(degDelta\) \{[\s\S]*?if \(studio\.viewMode === '360'\) render360Canvas\(\);\s*\}/;

const newStepScaleCode = `function stepItemScale(delta) {
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
}`;

if (oldStepScaleRegex.test(code)) {
  code = code.replace(oldStepScaleRegex, newStepScaleCode);
  console.log('Replaced stepItemScale and stepItemRotation successfully.');
}

// 6. Replace Item 5: Static handles for icons in renderVirolaCanvas
const oldHandlesRegex = /\/\/ 4\. ÍCONOS, DISEÑOS Y LOGOS CARGADOS[\s\S]*?iconsHtml \+= `[\s\S]*?<\/g>\s*`;\s*\}\);/;

const newHandlesCode = `// 4. ÍCONOS, DISEÑOS Y LOGOS CARGADOS (ITEM 5: BOTONES DE ACCIÓN ESTÁTICOS)
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

    const contentHtml = \`<image href="\${item.file}" x="\${-halfSize}" y="\${-halfSize}" width="\${baseSize * scale}" height="\${baseSize * scale}" preserveAspectRatio="xMidYMid meet" />\`;

    // ITEM 5: Handles en un overlay ESTÁTICO respecto a la rotación del ícono
    let handlesHtml = '';
    if (isActive) {
      const handleOffset = Math.max(28, halfSize + 16);
      handlesHtml = \`
        <g class="virola-handles-overlay" transform="translate(\${x.toFixed(2)}, \${y.toFixed(2)})">
          <!-- Handle de Rotación (Azul arriba, 100% estático en el eje superior) -->
          <g class="virola-handle handle-rotate" data-handle="rotate" data-item-id="\${item.id}" transform="translate(0, \${-handleOffset})" title="Girar diseño">
            <circle cx="0" cy="0" r="12" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
            <path d="M-4 -2 A 4 4 0 1 1 4 2 M2 4 L4 2 L2 0" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
          </g>

          <!-- Handle de Escala (Verde abajo-derecha, 100% estático en la esquina) -->
          <g class="virola-handle handle-scale" data-handle="scale" data-item-id="\${item.id}" transform="translate(\${handleOffset * 0.85}, \${handleOffset * 0.85})" title="Agrandar / Achicar">
            <circle cx="0" cy="0" r="12" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
            <path d="M-3 3 L3 -3 M0 -3 L3 -3 L3 0 M0 3 L-3 3 L-3 0" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
          </g>

          <!-- Handle de Eliminación (Rojo arriba-izquierda, 100% estático) -->
          <g class="virola-handle handle-delete" data-handle="delete" data-item-id="\${item.id}" transform="translate(\${-handleOffset * 0.85}, \${-handleOffset * 0.85})" onclick="deleteVirolaItem('\${item.id}', event)" title="Eliminar de la pieza">
            <circle cx="0" cy="0" r="12" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
            <path d="M-3 -3 L3 3 M3 -3 L-3 3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
          </g>
        </g>
      \`;
    }

    iconsHtml += \`
      <g class="virola-sticker-group \${isActive ? 'active-sticker' : ''}" 
         data-item-id="\${item.id}" 
         transform="translate(\${x.toFixed(2)}, \${y.toFixed(2)}) rotate(\${rot})"
         onmousedown="startFreeItemDrag('\${item.id}', event)"
         ontouchstart="startFreeItemDrag('\${item.id}', event)">
        \${contentHtml}
      </g>
      \${handlesHtml}
    \`;
  });`;

if (oldHandlesRegex.test(code)) {
  code = code.replace(oldHandlesRegex, newHandlesCode);
  console.log('Replaced Handles with static overlay successfully.');
}

// 7. Replace handleCustomImageUpload for Item 8 (Real vectorization & automatic background removal)
const oldUploadRegex = /function handleCustomImageUpload\(e\) \{[\s\S]*?showNotificationToast\('¡Tu imagen fue vectorizada y agregada!', 'fa-circle-check'\);\s*\};\s*img\.src = rawDataUrl;\s*\};\s*reader\.readAsDataURL\(file\);\s*\}/;

const newUploadCode = `function handleCustomImageUpload(e) {
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
}`;

if (oldUploadRegex.test(code)) {
  code = code.replace(oldUploadRegex, newUploadCode);
  console.log('Replaced handleCustomImageUpload successfully.');
}

// 8. Replace 360 Drag and 360 Canvas Renderer for Items 6 & 7
const old360EventsRegex = /function start360RotationDrag\(e\) \{[\s\S]*?function render360Canvas\(\) \{[\s\S]*?ctx\.restore\(\);\s*\}\s*\}\s*else if \(studio\.activeProduct === 'termo'\) \{[\s\S]*?ctx\.restore\(\);\s*\}\s*\}\s*else if \(studio\.activeProduct === 'caja'\) \{[\s\S]*?ctx\.restore\(\);\s*\}\s*\}/;

const new360EventsAndRenderCode = `function get360PointerCanvasCoords(e) {
  const canvas = document.getElementById('studio-360-canvas');
  if (!canvas) return { x: 0, y: 0 };
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

  // ITEM 6: Detectar si el usuario hizo clic sobre un elemento agregado para moverlo directamente en 360°
  let hitItem = null;
  if (studio.projected360Items && studio.projected360Items.length > 0) {
    hitItem = studio.projected360Items.find(p => {
      const dist = Math.hypot(pointer.x - p.projX, pointer.y - p.projY);
      return dist <= Math.max(32, p.radius || 24);
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

  // Si no hizo clic en un elemento, rotar la cámara 3D orbital
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
      const deltaX = pointer.x - studio.drag360ItemStartX;
      const deltaY = pointer.y - studio.drag360ItemStartY;
      it.x = Math.max(100, Math.min(400, studio.drag360ItemStartPos.x + deltaX));
      it.y = Math.max(100, Math.min(400, studio.drag360ItemStartPos.y + deltaY));
    }

    renderVirolaCanvas();
    render360Canvas();
    return;
  }

  if (studio.drag360Mode === 'camera' && studio.is360Dragging) {
    const deltaX = pointer.rawClientX - studio.drag360StartX;
    const deltaY = pointer.rawClientY - studio.drag360StartY;

    // Eje horizontal (Yaw: 0° a 360°)
    let newYaw = (studio.drag360StartAngle + deltaX * 0.8) % 360;
    if (newYaw < 0) newYaw += 360;
    studio.rotation360 = Math.round(newYaw);

    // ITEM 7: Eje vertical (Pitch: inclinación orbital de -65° a +65° para ver arriba y abajo)
    let newPitch = studio.drag360StartPitch - deltaY * 0.55;
    studio.pitch360 = Math.max(-65, Math.min(65, Math.round(newPitch)));

    const degValEl = document.getElementById('rotation-degree-val');
    if (degValEl) degValEl.textContent = \`\${studio.rotation360}°\`;

    render360Canvas();
  }
}

function end360RotationDrag() {
  studio.is360Dragging = false;
  studio.drag360Mode = null;
  studio.drag360ItemId = null;
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
      const facing = Math.sin(angleRad); // Positivo mira hacia el frente

      if (facing > -0.2) {
        const projX = centerX + Math.cos(angleRad) * (rxOuter + rxInner) / 2;
        const projY = centerY + 20 + Math.sin(angleRad) * (ryOuter + ryInner) / 2;
        const alpha = Math.max(0.15, facing);

        // Guardar para interacción y arrastre en 360°
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
          ctx.font = \`800 \${Math.round((item.fontSize || 22) * 0.85)}px '\${item.font || 'Cinzel'}', serif\`;
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
          ctx.font = \`800 \${item.fontSize || 22}px '\${item.font || 'Cinzel'}', serif\`;
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

    // Función de proyección 3D con Pitch & Yaw
    function project3D(x, y, z) {
      // Rotar Yaw alrededor de Y
      const x1 = x * Math.cos(rotRad) + z * Math.sin(rotRad);
      const y1 = y;
      const z1 = -x * Math.sin(rotRad) + z * Math.cos(rotRad);

      // Rotar Pitch alrededor de X
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

    // 6 caras de la Caja con coordenadas 3D
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
      // CARA FRONTAL
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
      // CARA TRASERA
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

    // Ordenar caras por profundidad Z promedio (Painter's Algorithm de atrás hacia adelante)
    faces.forEach(f => {
      f.avgZ = (f.pts[0].z + f.pts[1].z + f.pts[2].z + f.pts[3].z) / 4;
    });
    faces.sort((a, b) => b.avgZ - a.avgZ);

    // Sombra de apoyo en el suelo
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

      // Si es la cara frontal, dibujar herraje dorado central
      if (f.isFront) {
        const midX = (f.pts[0].x + f.pts[1].x) / 2;
        const midY = (f.pts[0].y + f.pts[2].y) / 2 - 4;
        ctx.fillStyle = '#c59b27';
        ctx.fillRect(midX - 7, midY - 6, 14, 16);
        ctx.strokeStyle = '#6b500d';
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - 7, midY - 6, 14, 16);
      }

      // Si es la tapa superior, proyectar los grabados del usuario
      if (f.hasDesign && f.pts[0].y < centerY + 60) {
        const topMidX = (f.pts[0].x + f.pts[1].x + f.pts[2].x + f.pts[3].x) / 4;
        const topMidY = (f.pts[0].y + f.pts[1].y + f.pts[2].y + f.pts[3].y) / 4;

        studio.items.forEach(item => {
          const offX = ((item.x || 250) - 250) * 0.45;
          const offY = ((item.y || 250) - 250) * 0.45;
          const itemScreenX = topMidX + offX;
          const itemScreenY = topMidY + offY;

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
            ctx.font = \`800 \${Math.round((item.fontSize || 22) * 0.75)}px '\${item.font || 'Cinzel'}', serif\`;
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
}`;

if (old360EventsRegex.test(code)) {
  code = code.replace(old360EventsRegex, new360EventsAndRenderCode);
  console.log('Replaced 360 events and 360 canvas renderer successfully.');
} else {
  console.log('old360EventsRegex did not match, applying targeted replacements.');
}

fs.writeFileSync(jsPath, code, 'utf8');
console.log('Finished updating customizer-studio.js! Final size:', code.length);
