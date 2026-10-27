const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../js/customizer-studio.js');
const cssPath = path.join(__dirname, '../css/styles.css');

console.log('--- Applying Customizer UI Enhancements ---');

// ==========================================================================
// 1. UPDATE customizer-studio.js
// ==========================================================================
let js = fs.readFileSync(jsPath, 'utf8');

// A. Remove switchRibbonTab('text') from applyPhraseToVirola so user stays in Designs tab
if (js.includes("switchRibbonTab('text');")) {
  js = js.replace(
    "// Cambiar a la pestaña de texto para ver la frase seleccionada\n  switchRibbonTab('text');",
    "// Mantener al usuario en la pestaña de Diseños para que pueda seguir agregando íconos y explorando"
  );
  // Also try single line if comments differed
  js = js.replace("switchRibbonTab('text');\n", "// switchRibbonTab('text');\n");
  console.log('Fixed applyPhraseToVirola: removed tab auto-switching.');
}

// B. Add scrollRibbonDesigns and initRibbonCarouselEvents
const carouselHelpers = `
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
`;

if (!js.includes('function scrollRibbonDesigns')) {
  js = js.replace('function renderRibbonQuickDesigns(catKey) {', carouselHelpers + '\nfunction renderRibbonQuickDesigns(catKey) {');
  console.log('Added scrollRibbonDesigns and initRibbonCarouselEvents.');
}

// Ensure initRibbonCarouselEvents is called in initStudioEngine
if (!js.includes('initRibbonCarouselEvents()')) {
  js = js.replace('init360CanvasEvents();', 'init360CanvasEvents();\n  initRibbonCarouselEvents();');
  console.log('Attached initRibbonCarouselEvents to initStudioEngine.');
}

// C. Replace handlesHtml with clean static selection border in renderVirolaCanvas
const oldHandlesRegex = /\/\/ ITEM 5: Handles en un overlay ESTÁTICO[\s\S]*?iconsHtml \+= `[\s\S]*?<\/g>\s*`;\s*\}\);/;
const newCleanStickersCode = `// ÍCONOS Y DISEÑOS CON MARCO DE SELECCIÓN LIMPIO (SIN BOTONES FLOTANTES DESPROLIJOS)
    let selectionBorderHtml = '';
    if (isActive) {
      selectionBorderHtml = \`
        <rect x="\${(-halfSize - 5).toFixed(2)}" y="\${(-halfSize - 5).toFixed(2)}" 
              width="\${(baseSize * scale + 10).toFixed(2)}" height="\${(baseSize * scale + 10).toFixed(2)}" 
              fill="none" stroke="#c59b27" stroke-width="1.8" stroke-dasharray="4,4" 
              rx="6" ry="6" opacity="0.9" pointer-events="none" />
      \`;
    }

    iconsHtml += \`
      <g class="virola-sticker-group \${isActive ? 'active-sticker' : ''}" 
         data-item-id="\${item.id}" 
         transform="translate(\${x.toFixed(2)}, \${y.toFixed(2)}) rotate(\${rot})"
         onmousedown="startFreeItemDrag('\${item.id}', event)"
         ontouchstart="startFreeItemDrag('\${item.id}', event)"
         style="cursor: grab;">
        \${contentHtml}
        \${selectionBorderHtml}
      </g>
    \`;
  });`;

if (oldHandlesRegex.test(js)) {
  js = js.replace(oldHandlesRegex, newCleanStickersCode);
  console.log('Replaced moving circle handles with clean selection border on canvas.');
} else {
  console.log('Could not match oldHandlesRegex, checking manual fallback...');
}

// D. Replace updateActiveItemFloatingBar and add centerActiveItem
const oldUpdateBarRegex = /function updateActiveItemFloatingBar\(\) \{[\s\S]*?if \(scaleValEl && item\.scale\) \{[\s\S]*?scaleValEl\.textContent = `\$\{Math\.round\(item\.scale \* 100\)\}%\`;\s*\}\s*\}/;

const newUpdateBarCode = `function updateActiveItemFloatingBar() {
  const bar = document.getElementById('virola-active-item-controls');
  if (!bar) return;

  const nameBadge = document.getElementById('active-item-name-badge');
  const actionsGroup = document.getElementById('active-item-actions');
  const scaleDisplay = document.getElementById('active-item-scale-display');

  if (!studio.activeItemId) {
    bar.classList.remove('has-active-item');
    if (nameBadge) {
      nameBadge.innerHTML = \`<i class="fas fa-hand-pointer" style="color: var(--accent-gold); margin-right: 6px;"></i> Hacé clic en cualquier texto o grabado para editarlo\`;
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
      nameBadge.innerHTML = \`<i class="fas fa-hand-pointer" style="color: var(--accent-gold); margin-right: 6px;"></i> Hacé clic en cualquier texto o grabado para editarlo\`;
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
    const itemName = isText ? \`"\${item.text}"\` : (item.name || 'Diseño');
    nameBadge.innerHTML = \`<span class="active-item-type-tag">\${typeTag}</span> <strong>\${escapeHtml(itemName)}</strong>\`;
  }

  if (scaleDisplay) {
    if (item.type === 'text') {
      scaleDisplay.textContent = \`\${item.fontSize || 22}px\`;
    } else {
      scaleDisplay.textContent = \`\${Math.round((item.scale || 1.0) * 100)}%\`;
    }
  }

  const scaleValEl = document.getElementById('ribbon-image-scale-val');
  if (scaleValEl && item.scale) {
    scaleValEl.textContent = \`\${Math.round(item.scale * 100)}%\`;
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
}`;

if (oldUpdateBarRegex.test(js)) {
  js = js.replace(oldUpdateBarRegex, newUpdateBarCode);
  console.log('Replaced updateActiveItemFloatingBar and added centerActiveItem.');
} else {
  console.log('Could not match oldUpdateBarRegex.');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('customizer-studio.js written successfully!');

// ==========================================================================
// 2. UPDATE styles.css
// ==========================================================================
let css = fs.readFileSync(cssPath, 'utf8');

const newStylesBlock = `
/* ==========================================================================
   CAROUSEL HORIZONTAL & BARRA FIJA PERMANENTE DE CONTROLES
   ========================================================================== */

/* 1. Carrusel de Diseños Rápidos */
.ribbon-carousel-group {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

.ribbon-carousel-wrapper {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  position: relative !important;
  max-width: 580px !important;
  width: 100% !important;
}

.ribbon-carousel-nav {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  border-radius: 50% !important;
  background: rgba(30, 24, 18, 0.95) !important;
  border: 1.5px solid var(--accent-gold) !important;
  color: var(--accent-gold) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  font-size: 0.8rem !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4) !important;
  transition: all 0.2s ease !important;
  z-index: 5 !important;
}

.ribbon-carousel-nav:hover {
  background: var(--accent-gold) !important;
  color: #120e0a !important;
  transform: scale(1.1) !important;
  box-shadow: 0 0 12px rgba(197, 155, 39, 0.5) !important;
}

#ribbon-quick-designs {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  overflow-x: auto !important;
  scroll-behavior: smooth !important;
  -webkit-overflow-scrolling: touch !important;
  scrollbar-width: thin !important;
  scrollbar-color: var(--accent-gold) rgba(0, 0, 0, 0.3) !important;
  padding: 4px 6px !important;
  max-width: 500px !important;
  cursor: grab;
}

#ribbon-quick-designs.is-dragging {
  cursor: grabbing !important;
  scroll-behavior: auto !important;
}

#ribbon-quick-designs::-webkit-scrollbar {
  height: 5px !important;
  display: block !important;
}

#ribbon-quick-designs::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.4) !important;
  border-radius: 4px !important;
}

#ribbon-quick-designs::-webkit-scrollbar-thumb {
  background: var(--accent-gold) !important;
  border-radius: 4px !important;
}

/* 2. Barra Fija Permanente de Control del Elemento (Sin saltos de pantalla) */
.virola-active-item-controls {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  background: #18130e !important;
  border: 1.5px solid rgba(197, 155, 39, 0.35) !important;
  border-radius: 12px !important;
  padding: 8px 16px !important;
  margin: 10px 0 !important;
  min-height: 52px !important;
  height: 52px !important;
  box-sizing: border-box !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5) !important;
  transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
}

.virola-active-item-controls.has-active-item {
  border-color: var(--accent-gold) !important;
  box-shadow: 0 4px 22px rgba(197, 155, 39, 0.28) !important;
}

.active-item-status {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.active-item-name-badge {
  font-size: 0.8rem !important;
  font-weight: 700 !important;
  color: #ede8df !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

.active-item-type-tag {
  background: rgba(197, 155, 39, 0.2) !important;
  border: 1px solid var(--accent-gold) !important;
  color: var(--accent-gold) !important;
  font-size: 0.65rem !important;
  font-weight: 800 !important;
  padding: 2px 7px !important;
  border-radius: 6px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.6px !important;
}

.active-item-scale-pill {
  font-size: 0.72rem !important;
  font-weight: 800 !important;
  color: var(--accent-gold) !important;
  background: rgba(0, 0, 0, 0.45) !important;
  border: 1px solid rgba(197, 155, 39, 0.3) !important;
  padding: 3px 8px !important;
  border-radius: 10px !important;
  min-width: 44px !important;
  text-align: center !important;
}

.active-item-divider {
  width: 1px !important;
  height: 22px !important;
  background: rgba(255, 255, 255, 0.15) !important;
  margin: 0 4px !important;
}

.active-item-actions {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  transition: opacity 0.2s ease !important;
}

.active-item-actions.disabled {
  opacity: 0.3 !important;
  pointer-events: none !important;
}

.item-quick-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  border-radius: 8px !important;
  border: 1px solid rgba(197, 155, 39, 0.35) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  color: #ffffff !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 0.82rem !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
}

.item-quick-btn:hover {
  background: var(--accent-gold) !important;
  color: #120e0a !important;
  border-color: var(--accent-gold) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 10px rgba(197, 155, 39, 0.3) !important;
}

.item-quick-btn.btn-delete-item {
  background: rgba(220, 38, 38, 0.18) !important;
  border-color: rgba(220, 38, 38, 0.4) !important;
  color: #f87171 !important;
}

.item-quick-btn.btn-delete-item:hover {
  background: #dc2626 !important;
  color: #ffffff !important;
  border-color: #dc2626 !important;
  box-shadow: 0 3px 10px rgba(220, 38, 38, 0.4) !important;
}
`;

css += '\n' + newStylesBlock;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('styles.css updated successfully!');
