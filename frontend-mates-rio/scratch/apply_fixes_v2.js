const fs = require('fs');
const path = require('path');

const stylesPath = path.join(__dirname, '../css/styles.css');
const jsPath = path.join(__dirname, '../js/customizer-studio.js');
const htmlMatePath = path.join(__dirname, '../personaliza-tu-mate.html');
const htmlPersPath = path.join(__dirname, '../personalizacion.html');

console.log('Starting script updates...');

// 1. UPDATE styles.css
let css = fs.readFileSync(stylesPath, 'utf8');

const newCssRules = `
/* ==========================================================================
   ENHANCED CUSTOMIZER STYLES (ITEMS 1-8 FIXES)
   ========================================================================== */

/* Item 1: Modal Catálogo Completo Profesional */
.design-modal-card {
  max-width: 860px !important;
  max-height: 88vh !important;
  background: #15110d !important;
  border: 1.5px solid var(--accent-gold) !important;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 30px rgba(197, 155, 39, 0.2) !important;
}

.design-modal-body {
  padding: 18px 24px 24px !important;
  overflow-y: auto !important;
  scrollbar-width: thin !important;
  scrollbar-color: var(--accent-gold) rgba(0, 0, 0, 0.4) !important;
}

.design-modal-body::-webkit-scrollbar {
  width: 6px;
}
.design-modal-body::-webkit-scrollbar-thumb {
  background: var(--accent-gold);
  border-radius: 4px;
}
.design-modal-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.4);
}

.modal-designs-grid,
#modal-designs-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)) !important;
  gap: 14px !important;
  margin-top: 14px !important;
}

.vector-icon-card {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 12px 8px !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.035) !important;
  border: 1px solid rgba(197, 155, 39, 0.22) !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  aspect-ratio: 1 !important;
  text-align: center !important;
  user-select: none !important;
}

.vector-icon-card:hover {
  background: rgba(197, 155, 39, 0.16) !important;
  border-color: var(--accent-gold) !important;
  transform: translateY(-3px) scale(1.02) !important;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(197, 155, 39, 0.35) !important;
}

.vector-thumb-wrap {
  width: 52px !important;
  height: 52px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 8px !important;
}

.vector-thumb-wrap img {
  max-width: 46px !important;
  max-height: 46px !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5)) !important;
}

.vector-name {
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  color: #ede8df !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 100% !important;
  line-height: 1.2 !important;
}

/* Tarjetas de Frases dentro del Modal */
.vector-phrase-item {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 12px 16px !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(197, 155, 39, 0.25) !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  grid-column: 1 / -1 !important;
}

.vector-phrase-item:hover {
  background: rgba(197, 155, 39, 0.18) !important;
  border-color: var(--accent-gold) !important;
  transform: translateX(4px) !important;
}

.vector-phrase-item .phrase-text {
  font-family: 'Cinzel', serif !important;
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  color: #f5f2ec !important;
  letter-spacing: 1px !important;
}

.vector-phrase-item .btn-add-phrase {
  padding: 6px 14px !important;
  background: var(--accent-gold) !important;
  color: #120e0a !important;
  border: none !important;
  border-radius: 6px !important;
  font-size: 0.78rem !important;
  font-weight: 800 !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

/* Item 2: Carrusel Ribbon Solo Íconos Sin Nombres & Sin Scrollbar Fea */
#ribbon-quick-designs {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  padding: 2px 0 !important;
}

#ribbon-quick-designs::-webkit-scrollbar {
  display: none !important;
}

.ribbon-icon-quick-btn {
  width: 44px !important;
  height: 44px !important;
  min-width: 44px !important;
  padding: 6px !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(197, 155, 39, 0.3) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.18s ease !important;
  position: relative !important;
  box-sizing: border-box !important;
}

.ribbon-icon-quick-btn:hover {
  background: rgba(197, 155, 39, 0.22) !important;
  border-color: var(--accent-gold) !important;
  transform: scale(1.1) !important;
  box-shadow: 0 4px 14px rgba(197, 155, 39, 0.3) !important;
  z-index: 5 !important;
}

.ribbon-icon-quick-btn img {
  width: 30px !important;
  height: 30px !important;
  max-width: 30px !important;
  max-height: 30px !important;
  object-fit: contain !important;
  pointer-events: none !important;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4)) !important;
}

.ribbon-phrase-quick-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 7px 12px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(197, 155, 39, 0.35) !important;
  border-radius: 20px !important;
  color: #ede8df !important;
  font-size: 0.76rem !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  transition: all 0.18s ease !important;
}

.ribbon-phrase-quick-btn:hover {
  background: rgba(197, 155, 39, 0.22) !important;
  border-color: var(--accent-gold) !important;
  color: var(--accent-gold) !important;
  transform: translateY(-1px) !important;
}

/* Item 3: Menú Desplegable Profesional de Tipografías */
.ribbon-font-dropdown {
  position: fixed !important;
  z-index: 999999 !important;
  width: 290px !important;
  max-height: 390px !important;
  overflow-y: auto !important;
  background: #191410 !important;
  border: 1.5px solid var(--accent-gold) !important;
  border-radius: 12px !important;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(197, 155, 39, 0.3) !important;
  padding: 8px !important;
  backdrop-filter: blur(14px) !important;
  scrollbar-width: thin !important;
  scrollbar-color: var(--accent-gold) rgba(0, 0, 0, 0.4) !important;
}

.ribbon-font-dropdown::-webkit-scrollbar {
  width: 6px;
}
.ribbon-font-dropdown::-webkit-scrollbar-thumb {
  background: var(--accent-gold);
  border-radius: 4px;
}
.ribbon-font-dropdown::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.4);
}

.ribbon-font-item {
  padding: 10px 14px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  color: #ede8df !important;
  transition: all 0.16s ease !important;
  border: 1px solid transparent !important;
  margin-bottom: 3px !important;
}

.ribbon-font-item:hover {
  background: rgba(197, 155, 39, 0.2) !important;
  border-color: rgba(197, 155, 39, 0.4) !important;
  color: var(--accent-gold) !important;
  transform: translateX(3px) !important;
}

.ribbon-font-item.selected {
  background: var(--accent-gold) !important;
  color: #120e0a !important;
  font-weight: 800 !important;
}

/* Item 5: Handles Estáticos en los Íconos */
.virola-handles-overlay {
  pointer-events: auto !important;
}

.virola-handle {
  cursor: pointer !important;
  transition: transform 0.12s ease !important;
}

.virola-handle:hover {
  transform: scale(1.22) !important;
}

/* Indicador de arrastre 360 interactivo */
.studio-360-canvas-interactive {
  cursor: grab;
}
.studio-360-canvas-interactive:active {
  cursor: grabbing;
}
`;

if (!css.includes('ENHANCED CUSTOMIZER STYLES (ITEMS 1-8 FIXES)')) {
  css += '\n' + newCssRules;
  fs.writeFileSync(stylesPath, css, 'utf8');
  console.log('styles.css updated with enhanced styles!');
} else {
  console.log('styles.css already contains fixes.');
}
