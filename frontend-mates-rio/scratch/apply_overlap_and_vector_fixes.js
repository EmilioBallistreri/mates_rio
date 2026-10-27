const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../css/styles.css');
const mateHtmlPath = path.join(__dirname, '../personaliza-tu-mate.html');
const persHtmlPath = path.join(__dirname, '../personalizacion.html');

console.log('--- Applying Overlap and Vector Laser Styling Fixes ---');

// 1. UPDATE styles.css
let css = fs.readFileSync(cssPath, 'utf8');

const layoutAndVectorCss = `
/* ==========================================================================
   CORRECCIÓN DEFINITIVA DE SUPERPOSICIÓN & ESTILO VECTORIAL LÁSER CNC
   ========================================================================== */

/* 1. Evitar cualquier superposición en el escenario central */
.studio-main-stage-full {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-start !important;
  padding: 65px 20px 24px 20px !important;
  min-height: 690px !important;
  position: relative !important;
  overflow: visible !important;
}

.studio-canvas-wrap {
  width: 100% !important;
  max-width: 500px !important;
  height: 460px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 auto 10px auto !important;
  position: relative !important;
}

/* 2. Barra Fija de Control del Elemento (Normal Flow, encima de las herramientas inferiores) */
.virola-active-item-controls {
  position: relative !important;
  bottom: auto !important;
  left: auto !important;
  right: auto !important;
  transform: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  background: #18130e !important;
  border: 1.5px solid rgba(197, 155, 39, 0.4) !important;
  border-radius: 12px !important;
  padding: 8px 16px !important;
  margin: 8px auto 10px auto !important;
  width: 100% !important;
  max-width: 660px !important;
  min-height: 52px !important;
  height: 52px !important;
  box-sizing: border-box !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5) !important;
  z-index: 15 !important;
}

/* 3. Barra de Herramientas Inferiores (Normal Flow, debajo de la barra activa, CERO superposición) */
.stage-bottombar-tools {
  position: relative !important;
  bottom: auto !important;
  left: auto !important;
  right: auto !important;
  transform: none !important;
  width: 100% !important;
  max-width: 660px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin: 0 auto !important;
  z-index: 10 !important;
  pointer-events: auto !important;
}

/* 4. Estilo de Botonera de Diseños Vectoriales (Muestra el grabado sobre fondo de metal pulido) */
.ribbon-icon-quick-btn {
  width: 44px !important;
  height: 44px !important;
  min-width: 44px !important;
  padding: 6px !important;
  border-radius: 8px !important;
  background: radial-gradient(circle, #f4efe6 0%, #dbd4c7 100%) !important;
  border: 1.5px solid rgba(197, 155, 39, 0.45) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.18s ease !important;
  position: relative !important;
  box-sizing: border-box !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35) !important;
}

.ribbon-icon-quick-btn:hover {
  background: #ffffff !important;
  border-color: var(--accent-gold) !important;
  transform: scale(1.12) !important;
  box-shadow: 0 4px 16px rgba(197, 155, 39, 0.45) !important;
  z-index: 5 !important;
}

.ribbon-icon-quick-btn img {
  width: 32px !important;
  height: 32px !important;
  max-width: 32px !important;
  max-height: 32px !important;
  object-fit: contain !important;
  pointer-events: none !important;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)) !important;
}

/* 5. Miniaturas en el Modal del Catálogo Completo */
.vector-thumb-wrap {
  width: 58px !important;
  height: 58px !important;
  background: radial-gradient(circle, #f4efe6 0%, #dbd4c7 100%) !important;
  border: 1.5px solid rgba(197, 155, 39, 0.4) !important;
  border-radius: 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 8px !important;
  padding: 6px !important;
  box-sizing: border-box !important;
}

.vector-thumb-wrap img {
  width: 44px !important;
  height: 44px !important;
  max-width: 44px !important;
  max-height: 44px !important;
  object-fit: contain !important;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)) !important;
}

/* 6. Grabado Láser Vectorial en la Virola Metálica */
.virola-sticker-group image {
  /* Nitidez de grabado láser CNC */
  image-rendering: -webkit-optimize-contrast !important;
  image-rendering: crisp-edges !important;
  filter: contrast(120%) drop-shadow(0 0.8px 1px rgba(0,0,0,0.45)) !important;
}
`;

css += '\n' + layoutAndVectorCss;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('styles.css updated with non-overlapping flow layout and vector styling!');
