const fs = require('fs');
const path = require('path');

// 1. UPDATE styles.css
const cssPath = path.join(__dirname, '..', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/rgba\(43,\s*24,\s*16,/g, 'rgba(0, 0, 0,');
css = css.replace(/background:\s*rgba\(22,\s*17,\s*13,\s*0\.94\);/g, 'background: #141416;');
css = css.replace(/#261f18/g, '#161618');
css = css.replace(/rgba\(184,\s*134,\s*11,\s*0\.3\)/g, 'rgba(0, 0, 0, 0.4)');
css = css.replace(/#f7d577/g, '#ffffff');

const overrideBlock = `
/* ==========================================================================
   BOTONERA INFERIOR DEL LIENZO: DESHACER, REHACER, CENTRAR, DESELECCIONAR, LIMPIAR
   ESTRICTO BITONO BLANCO Y NEGRO (CERO BORDES DORADOS, CERO MARRONES, CERO SOMBRAS AMARILLAS)
   ========================================================================== */
.stage-bottombar-tools {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  margin-top: 16px !important;
  padding: 8px 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  z-index: 35 !important;
  position: relative !important;
}

.stage-tools-pill-group {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 8px !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Modo Oscuro: Píldoras negras con contorno sutil blanco y texto blanco puro */
.stage-tool-pill,
#btn-studio-undo,
#btn-studio-redo {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  padding: 8px 16px !important;
  border-radius: 999px !important;
  background: #141416 !important;
  border: 1px solid rgba(255, 255, 255, 0.28) !important;
  color: #ffffff !important;
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  transition: all 0.18s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
  text-shadow: none !important;
  outline: none !important;
}

.stage-tool-pill i,
#btn-studio-undo i,
#btn-studio-redo i {
  color: #ffffff !important;
  font-size: 0.82rem !important;
  transition: color 0.18s ease !important;
}

.stage-tool-pill:hover:not(:disabled),
#btn-studio-undo:hover:not(:disabled),
#btn-studio-redo:hover:not(:disabled) {
  background: #ffffff !important;
  color: #000000 !important;
  border-color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-1px) !important;
}

.stage-tool-pill:hover:not(:disabled) i,
#btn-studio-undo:hover:not(:disabled) i,
#btn-studio-redo:hover:not(:disabled) i {
  color: #000000 !important;
}

.stage-tool-pill:disabled,
#btn-studio-undo:disabled,
#btn-studio-redo:disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  background: #141416 !important;
  color: #888888 !important;
}

.stage-tool-pill:disabled i,
#btn-studio-undo:disabled i,
#btn-studio-redo:disabled i {
  color: #888888 !important;
}

/* Modo Claro: Píldoras blancas con contorno negro sutil y texto negro puro */
html.theme-light .stage-tool-pill,
body.theme-light .stage-tool-pill,
body.theme-inverted .stage-tool-pill,
html.theme-light #btn-studio-undo,
body.theme-light #btn-studio-undo,
html.theme-light #btn-studio-redo,
body.theme-light #btn-studio-redo {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.22) !important;
  color: #0a0a0a !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08) !important;
}

html.theme-light .stage-tool-pill i,
body.theme-light .stage-tool-pill i,
body.theme-inverted .stage-tool-pill i,
html.theme-light #btn-studio-undo i,
body.theme-light #btn-studio-undo i,
html.theme-light #btn-studio-redo i,
body.theme-light #btn-studio-redo i {
  color: #0a0a0a !important;
}

html.theme-light .stage-tool-pill:hover:not(:disabled),
body.theme-light .stage-tool-pill:hover:not(:disabled),
body.theme-inverted .stage-tool-pill:hover:not(:disabled),
html.theme-light #btn-studio-undo:hover:not(:disabled),
body.theme-light #btn-studio-undo:hover:not(:disabled),
html.theme-light #btn-studio-redo:hover:not(:disabled),
body.theme-light #btn-studio-redo:hover:not(:disabled) {
  background: #000000 !important;
  color: #ffffff !important;
  border-color: #000000 !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22) !important;
  transform: translateY(-1px) !important;
}

html.theme-light .stage-tool-pill:hover:not(:disabled) i,
body.theme-light .stage-tool-pill:hover:not(:disabled) i,
body.theme-inverted .stage-tool-pill:hover:not(:disabled) i,
html.theme-light #btn-studio-undo:hover:not(:disabled) i,
body.theme-light #btn-studio-undo:hover:not(:disabled) i,
html.theme-light #btn-studio-redo:hover:not(:disabled) i,
body.theme-light #btn-studio-redo:hover:not(:disabled) i {
  color: #ffffff !important;
}

html.theme-light .stage-tool-pill:disabled,
body.theme-light .stage-tool-pill:disabled,
html.theme-light #btn-studio-undo:disabled,
body.theme-light #btn-studio-undo:disabled,
html.theme-light #btn-studio-redo:disabled,
body.theme-light #btn-studio-redo:disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
  border-color: rgba(0, 0, 0, 0.12) !important;
  background: #ffffff !important;
  color: #aaaaaa !important;
}

html.theme-light .stage-tool-pill:disabled i,
body.theme-light .stage-tool-pill:disabled i,
html.theme-light #btn-studio-undo:disabled i,
body.theme-light #btn-studio-undo:disabled i,
html.theme-light #btn-studio-redo:disabled i,
body.theme-light #btn-studio-redo:disabled i {
  color: #aaaaaa !important;
}

/* Barra de control activa del elemento (sin bordes dorados ni sombras ámbar) */
.virola-active-item-controls {
  background: #141416 !important;
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5) !important;
}

.virola-active-item-controls.has-active-item {
  border-color: rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 4px 18px rgba(255, 255, 255, 0.12) !important;
}

.active-item-name-badge {
  color: #ffffff !important;
}

.active-item-name-badge i {
  color: #ffffff !important;
}

html.theme-light .virola-active-item-controls,
body.theme-light .virola-active-item-controls,
body.theme-inverted .virola-active-item-controls {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.18) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08) !important;
}

html.theme-light .virola-active-item-controls.has-active-item,
body.theme-light .virola-active-item-controls.has-active-item,
body.theme-inverted .virola-active-item-controls.has-active-item {
  border-color: #000000 !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
}

html.theme-light .active-item-name-badge,
body.theme-light .active-item-name-badge,
body.theme-inverted .active-item-name-badge {
  color: #000000 !important;
}

html.theme-light .active-item-name-badge i,
body.theme-light .active-item-name-badge i,
body.theme-inverted .active-item-name-badge i {
  color: #000000 !important;
}

.item-quick-btn {
  background: #18181b !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
}

.item-quick-btn:hover {
  background: #ffffff !important;
  color: #000000 !important;
  border-color: #ffffff !important;
}

html.theme-light .item-quick-btn,
body.theme-light .item-quick-btn,
body.theme-inverted .item-quick-btn {
  background: #f4f4f5 !important;
  border: 1px solid rgba(0, 0, 0, 0.18) !important;
  color: #000000 !important;
}

html.theme-light .item-quick-btn:hover,
body.theme-light .item-quick-btn:hover,
body.theme-inverted .item-quick-btn:hover {
  background: #000000 !important;
  color: #ffffff !important;
  border-color: #000000 !important;
}
`;

css += '\n' + overrideBlock;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('styles.css updated!');

// 2. UPDATE customizer-studio.js
const studioJsPath = path.join(__dirname, '..', 'js', 'customizer-studio.js');
let studioJs = fs.readFileSync(studioJsPath, 'utf8');

studioJs = studioJs.replace(/rgba\(197,\s*155,\s*39,\s*0\.25\)/g, 'rgba(255, 255, 255, 0.18)');
studioJs = studioJs.replace(/rgba\(197,\s*155,\s*39,\s*0\.35\)/g, 'rgba(255, 255, 255, 0.28)');
studioJs = studioJs.replace(/rgba\(197,\s*155,\s*39,\s*0\.45\)/g, 'rgba(255, 255, 255, 0.28)');
studioJs = studioJs.replace(/rgba\(22,\s*17,\s*13,\s*0\.96\)/g, '#18181b');
studioJs = studioJs.replace(/border:\s*1\.5px\s*solid\s*var\(--accent-gold\);/g, 'border: 1.5px solid rgba(255, 255, 255, 0.28);');
studioJs = studioJs.replace(/style="color:\s*var\(--accent-gold\);\s*margin-right:\s*6px;"/g, 'style="margin-right: 6px;"');
studioJs = studioJs.replace(/style="color:\s*var\(--accent-gold\);\s*font-size:\s*1rem;"/g, 'style="color: #ffffff; font-size: 1rem;"');
studioJs = studioJs.replace(/stop-color="#c59b27"/g, 'stop-color="#ffffff"');
studioJs = studioJs.replace(/stop-color="#8f6e16"/g, 'stop-color="#888888"');
studioJs = studioJs.replace(/fill="#c59b27"/g, 'fill="#ffffff"');
studioJs = studioJs.replace(/ctx\.strokeStyle\s*=\s*'#c59b27';/g, "ctx.strokeStyle = '#ffffff';");
studioJs = studioJs.replace(/ctx\.fillStyle\s*=\s*'#c59b27';/g, "ctx.fillStyle = '#ffffff';");
studioJs = studioJs.replace(/ctx\.strokeStyle\s*=\s*'#6b500d';/g, "ctx.strokeStyle = '#333333';");

fs.writeFileSync(studioJsPath, studioJs, 'utf8');
console.log('customizer-studio.js updated!');

// 3. UPDATE admin.js
const adminJsPath = path.join(__dirname, '..', 'js', 'admin.js');
let adminJs = fs.readFileSync(adminJsPath, 'utf8');
adminJs = adminJs.replace(/rgba\(197,\s*155,\s*39,\s*0\.2\); color: #c59b27;/g, 'rgba(255, 255, 255, 0.15); color: #ffffff;');
adminJs = adminJs.replace(/rgba\(197,\s*155,\s*39,\s*0\.08\)/g, 'rgba(255, 255, 255, 0.06)');
adminJs = adminJs.replace(/rgba\(197,\s*155,\s*39,\s*0\.3\)/g, 'rgba(255, 255, 255, 0.2)');
fs.writeFileSync(adminJsPath, adminJs, 'utf8');
console.log('admin.js updated!');

// 4. UPDATE HTML files with cachebuster v=20261113-v5 and clean inline icons
const htmlDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(f => {
  const p = path.join(htmlDir, f);
  let html = fs.readFileSync(p, 'utf8');
  
  // Cachebuster
  html = html.replace(/styles\.css(?:\?v=[^"']*)?/g, 'styles.css?v=20261113-v5');
  
  // Remove inline gold color on hand-pointer and shield icons
  html = html.replace(/<i class="fas fa-hand-pointer" style="color: var\(--accent-gold\); margin-right: 6px;"><\/i>/g, '<i class="fas fa-hand-pointer" style="margin-right: 6px;"></i>');
  html = html.replace(/<i class="fas fa-shield-halved" style="color: var\(--accent-gold\); font-size: 1\.25rem;"><\/i>/g, '<i class="fas fa-shield-halved" style="font-size: 1.25rem;"></i>');

  fs.writeFileSync(p, html, 'utf8');
  console.log(f + ' updated!');
});

console.log('All updates complete!');
