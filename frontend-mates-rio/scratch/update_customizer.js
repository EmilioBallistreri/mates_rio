const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'personaliza-tu-mate.html');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '      <!-- Studio 2-Column Split Workspace -->';
const endMarker = '    <!-- Mobile Sticky Bottom Action Bar -->';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! Start:', startIndex, 'End:', endIndex);
  process.exit(1);
}

const newWorkspaceHtml = `      <!-- Studio 2-Column Split Workspace (Sidebar 3 Pasos + Canvas Circular Virola) -->
      <div class="studio-layout-grid">
        
        <!-- ==========================================================================
             COLUMNA IZQUIERDA: PANEL DE 3 PASOS (PLANTILLAS, DISEÑO, CONFIRMAR)
             ========================================================================== -->
        <aside class="studio-sidebar" aria-label="Controles del Taller de Grabado">
          
          <!-- Navegación de los 3 Pasos -->
          <div class="studio-step-tabs">
            <button type="button" class="studio-step-tab active" data-step="1" onclick="switchStudioStep(1)">
              <i class="fas fa-layer-group"></i> 1. Plantillas
            </button>
            <button type="button" class="studio-step-tab" data-step="2" onclick="switchStudioStep(2)">
              <i class="fas fa-pen-nib"></i> 2. Diseño
            </button>
            <button type="button" class="studio-step-tab" data-step="3" onclick="switchStudioStep(3)">
              <i class="fas fa-circle-check"></i> 3. Confirmar
            </button>
          </div>

          <!-- PASO 1: PLANTILLAS PRE-CONFIGURADAS -->
          <div class="studio-panel-step active" data-step-panel="1" id="step-panel-1">
            <h3 class="studio-step-title"><i class="fas fa-wand-magic-sparkles" style="color: var(--accent-gold);"></i> Elegí una Plantilla de Inicio</h3>
            <p class="studio-step-sub">Comenzá con una distribución orfebre equilibrada o armá tu diseño desde una virola en blanco:</p>

            <div class="templates-list-grid">
              <!-- Plantilla 1: Texto + 2 Íconos -->
              <div class="template-choice-card active" data-tpl="text_2icons" onclick="applyTemplate('text_2icons')">
                <div class="tpl-icon-box"><i class="fas fa-crown"></i></div>
                <div class="tpl-info">
                  <strong>Texto + 2 Íconos (Recomendado)</strong>
                  <span>Texto superior curvado, 2 escudos simétricos a los lados y líneas dobles cinceladas.</span>
                </div>
              </div>

              <!-- Plantilla 2: Texto + 3 Íconos -->
              <div class="template-choice-card" data-tpl="text_3icons" onclick="applyTemplate('text_3icons')">
                <div class="tpl-icon-box"><i class="fas fa-shapes"></i></div>
                <div class="tpl-info">
                  <strong>Texto + 3 Íconos</strong>
                  <span>Texto en la curva superior y 3 motivos criollos distribuidos (izq, base y der).</span>
                </div>
              </div>

              <!-- Plantilla 3: Texto + 1 Ícono -->
              <div class="template-choice-card" data-tpl="text_1icon" onclick="applyTemplate('text_1icon')">
                <div class="tpl-icon-box"><i class="fas fa-certificate"></i></div>
                <div class="tpl-info">
                  <strong>Texto + 1 Ícono</strong>
                  <span>Frase curva de homenaje y un escudo o sol central en la parte inferior.</span>
                </div>
              </div>

              <!-- Plantilla 4: Empezar desde cero -->
              <div class="template-choice-card" data-tpl="scratch" onclick="applyTemplate('scratch')">
                <div class="tpl-icon-box"><i class="fas fa-plus"></i></div>
                <div class="tpl-info">
                  <strong>Empezar desde cero</strong>
                  <span>Virola circular limpia para agregar tus textos y diseños libremente.</span>
                </div>
              </div>
            </div>

            <div style="margin-top: 24px;">
              <button type="button" class="btn btn-primary" onclick="switchStudioStep(2)" style="width: 100%; padding: 12px; font-weight: 800;">
                Personalizar Diseño <i class="fas fa-arrow-right" style="margin-left: 6px;"></i>
              </button>
            </div>
          </div>

          <!-- PASO 2: DISEÑO (TEXTO, ICONOS, LÍNEAS CIRCULARES, SUBIR LOGO) -->
          <div class="studio-panel-step" data-step-panel="2" id="step-panel-2">
            <h3 class="studio-step-title"><i class="fas fa-palette" style="color: var(--accent-gold);"></i> Personalizá tu Diseño</h3>
            <p class="studio-step-sub">Editá el texto curvo, agregá escudos y símbolos vectorizados y configurá las ranuras:</p>

            <!-- 2.1 TEXTO CURVO EN LA VIROLA -->
            <div class="design-sub-section">
              <div class="sub-section-header">
                <span class="sub-section-title"><i class="fas fa-font"></i> 1. Texto Curvo de la Virola</span>
                <span id="studio-text-counter" style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">10/35</span>
              </div>

              <div class="input-with-action">
                <input type="text" 
                       id="studio-text-input" 
                       class="studio-input" 
                       value="MATES RÍO" 
                       maxlength="35"
                       placeholder="Escribí nombres, fechas o frases..."
                       oninput="onStudioTextInput(this.value)" />
                <button type="button" class="input-action-btn" onclick="document.getElementById('studio-text-input').value=''; onStudioTextInput('');" title="Borrar texto">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- Posición de Curva -->
              <div style="display: flex; gap: 8px; margin-top: 8px; margin-bottom: 12px;">
                <button type="button" class="btn btn-sm btn-outline-dark arc-pos-btn active" data-pos="top" onclick="toggleArcPosition('top')" style="flex: 1; font-size: 0.76rem;">
                  <i class="fas fa-arrow-up"></i> Curva Superior
                </button>
                <button type="button" class="btn btn-sm btn-outline-dark arc-pos-btn" data-pos="bottom" onclick="toggleArcPosition('bottom')" style="flex: 1; font-size: 0.76rem;">
                  <i class="fas fa-arrow-down"></i> Curva Inferior
                </button>
              </div>

              <!-- Selector de Tipografías Google Fonts -->
              <label class="sub-label" style="margin-top: 10px;">Tipografía en Google Fonts:</label>
              <div class="fonts-selector-grid" id="fonts-selector-grid">
                <!-- Rendered dynamically via customizer-studio.js -->
              </div>

              <button type="button" class="btn btn-outline-dark btn-sm" onclick="applyTextToVirola()" style="width: 100%; margin-top: 10px; font-weight: 700;">
                <i class="fas fa-check"></i> Aplicar / Agregar Texto a la Virola
              </button>
            </div>

            <!-- 2.2 ÍCONOS & DISEÑOS PREDETERMINADOS -->
            <div class="design-sub-section">
              <div class="sub-section-header">
                <span class="sub-section-title"><i class="fas fa-icons"></i> 2. Íconos y Diseños Vectoriales</span>
              </div>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px;">
                Hacé clic en cualquier diseño para insertarlo en la virola circular:
              </p>

              <!-- Categorías Pills -->
              <div class="vector-cat-pills" id="vector-cat-pills">
                <!-- Populated via JS -->
              </div>

              <!-- Grid de Íconos -->
              <div class="vector-icons-grid" id="vector-icons-grid">
                <!-- Populated via JS -->
              </div>
            </div>

            <!-- 2.3 LÍNEAS CIRCULARES (CINCELADO) -->
            <div class="design-sub-section">
              <div class="sub-section-header">
                <span class="sub-section-title"><i class="fas fa-circle-notch"></i> 3. Líneas Circulares en Virola</span>
              </div>
              <div class="lines-pill-group">
                <button type="button" class="lines-pill-btn" data-lines="no" onclick="selectCircularLines('no')">
                  No
                </button>
                <button type="button" class="lines-pill-btn" data-lines="simple" onclick="selectCircularLines('simple')">
                  Simple
                </button>
                <button type="button" class="lines-pill-btn active" data-lines="doble" onclick="selectCircularLines('doble')">
                  Doble
                </button>
              </div>
            </div>

            <!-- 2.4 SUBIR LOGO PROPIO / VECTORIZAR -->
            <div class="design-sub-section">
              <div class="sub-section-header">
                <span class="sub-section-title"><i class="fas fa-cloud-arrow-up"></i> 4. Subir Imagen Propia o Logo</span>
              </div>
              <p style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 8px;">
                ¿Tenés tu marca de ganado, escudo de club o logo de empresa? Subilo en PNG, JPG o SVG:
              </p>
              <input type="file" id="studio-custom-file-upload" accept="image/png, image/jpeg, image/svg+xml" style="display: none;" onchange="handleCustomImageUpload(event)" />
              <button type="button" class="btn btn-outline-dark" onclick="document.getElementById('studio-custom-file-upload').click()" style="width: 100%; padding: 8px; font-size: 0.8rem; font-weight: 700;">
                <i class="fas fa-upload"></i> Seleccionar Imagen / Vector
              </button>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <button type="button" class="btn btn-outline-dark" onclick="switchStudioStep(1)" style="flex: 1;">
                <i class="fas fa-arrow-left"></i> Volver
              </button>
              <button type="button" class="btn btn-primary" onclick="switchStudioStep(3)" style="flex: 2; font-weight: 800;">
                Confirmar Grabado <i class="fas fa-arrow-right" style="margin-left: 6px;"></i>
              </button>
            </div>
          </div>

          <!-- PASO 3: CONFIRMAR (COMPRA WEB/LOCAL, ORDEN, NOTAS, DESCARGAR VECTOR, CARRITO) -->
          <div class="studio-panel-step" data-step-panel="3" id="step-panel-3">
            <h3 class="studio-step-title"><i class="fas fa-circle-check" style="color: var(--accent-gold);"></i> 3. Confirmar Pedido de Grabado</h3>
            <p class="studio-step-sub">Revisá tu configuración final, seleccioná el tipo de compra y enviá tu pedido al taller:</p>

            <!-- Selector Compra Web vs Local -->
            <label class="sub-label">Modalidad de Compra:</label>
            <div class="purchase-types-grid">
              <div class="purchase-type-card active" data-type="web" onclick="setPurchaseType('web')">
                <i class="fas fa-truck-fast"></i>
                <strong>Compra Web</strong>
                <span>Envío a domicilio o sucursal de todo el país</span>
              </div>
              <div class="purchase-type-card" data-type="local" onclick="setPurchaseType('local')">
                <i class="fas fa-store"></i>
                <strong>Compra Local</strong>
                <span>Retiro en taller oficial en Río Ceballos, Córdoba</span>
              </div>
            </div>

            <!-- Selector del Modelo de Mate Base -->
            <div style="margin-bottom: 16px;">
              <label class="sub-label" for="mate-model-select">Modelo de Mate a Personalizar:</label>
              <select id="mate-model-select" class="form-control" onchange="onMateModelChange(this.value)" style="width: 100%; height: 42px; border-radius: var(--radius-sm); border: 1.5px solid var(--border-light); padding: 0 12px; font-weight: 700; background: var(--bg-surface); color: var(--text-main);">
                <!-- Populated via JS -->
              </select>
            </div>

            <!-- Resumen Técnico -->
            <div class="custom-action-summary-card" style="margin-top: 0; margin-bottom: 16px;">
              <div class="summary-line-row">
                <span>Mate seleccionado:</span>
                <strong id="confirm-mate-name">Mate Imperial Cuero Negro</strong>
              </div>
              <div class="summary-line-row">
                <span>Precio del Mate:</span>
                <strong id="confirm-mate-price">$ 46.500</strong>
              </div>
              <div class="summary-line-row">
                <span>Grabado Láser HD en Virola:</span>
                <span class="summary-price-free"><b>¡BONIFICADO! ($0)</b></span>
              </div>
              <div class="summary-line-row">
                <span>Elementos grabados:</span>
                <span id="confirm-items-count">3 elementos</span>
              </div>
              <div class="summary-line-row">
                <span>Cincelado de virola:</span>
                <span id="confirm-lines-type">Líneas Dobles</span>
              </div>
            </div>

            <!-- Notas Especiales -->
            <div style="margin-bottom: 18px;">
              <label class="sub-label" for="custom-order-notes">Notas / Especificaciones para el orfebre (opcional):</label>
              <textarea id="custom-order-notes" class="form-control" rows="2" placeholder="Ej: Alinear el escudo con la costura del cuero, letra bien visible..." style="width: 100%; border-radius: var(--radius-sm); border: 1.5px solid var(--border-light); padding: 10px; font-size: 0.82rem; background: var(--bg-surface); color: var(--text-main); resize: vertical;"></textarea>
            </div>

            <!-- Botones de Acción -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button type="button" class="btn btn-primary" onclick="finalizeAndAddToCart()" style="width: 100%; padding: 14px; font-size: 0.95rem; font-weight: 800;">
                <i class="fas fa-shopping-bag"></i> Finalizar & Agregar al Carrito
              </button>

              <button type="button" class="btn btn-outline-dark" onclick="downloadVectorLaserFile()" style="width: 100%; padding: 10px; font-size: 0.84rem; font-weight: 700;">
                <i class="fas fa-file-arrow-down" style="color: var(--accent-gold);"></i> Descargar Archivo Vectorial (SVG Láser)
              </button>

              <button type="button" class="btn btn-link" onclick="switchStudioStep(2)" style="color: var(--text-muted); font-size: 0.78rem;">
                <i class="fas fa-arrow-left"></i> Volver a editar diseño
              </button>
            </div>

          </div>

        </aside>

        <!-- ==========================================================================
             COLUMNA DERECHA: CANVAS CIRCULAR INTERACTIVO DE LA VIROLA
             ========================================================================== -->
        <section class="studio-canvas-stage" aria-label="Simulador Circular de Virola">
          
          <div class="stage-header-badge">
            <i class="fas fa-circle live-pulse-dot"></i> VISTA EN VIVO • CORONA DE ALPACA MACIZA (VISTA SUPERIOR)
          </div>

          <!-- Canvas SVG Interactivo -->
          <svg id="virola-studio-svg" viewBox="0 0 500 500" class="virola-studio-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Rendered dynamically by customizer-studio.js -->
          </svg>

          <!-- Floating Canvas Controls -->
          <div class="canvas-bottom-toolbar">
            <button type="button" class="canvas-tool-btn" onclick="renderVirolaCanvas()" title="Centrar / Refrescar">
              <i class="fas fa-crosshairs"></i> Centrar
            </button>
            <button type="button" class="canvas-tool-btn" onclick="studio.activeItemId = null; renderVirolaCanvas();" title="Deseleccionar">
              <i class="fas fa-mouse-pointer"></i> Deseleccionar
            </button>
            <button type="button" class="canvas-tool-btn" onclick="resetVirolaStudio()" title="Limpiar elementos">
              <i class="fas fa-trash-can"></i> Limpiar
            </button>
            <a href="https://wa.me/5493513830111?text=Hola%20Mates%20R%C3%ADo!%20Quiero%20consultar%20por%20un%20dise%C3%B1o%20de%20virola." target="_blank" rel="noopener noreferrer" class="canvas-tool-btn" style="color: #25d366;">
              <i class="fab fa-whatsapp"></i> Ayuda WhatsApp
            </a>
          </div>

          <div style="margin-top: 14px; font-size: 0.72rem; color: rgba(255,255,255,0.6); text-align: center;">
            💡 <i>Podés arrastrar los íconos alrededor de la corona, escalarlos (verde), rotarlos (azul) o eliminarlos (rojo).</i>
          </div>

        </section>

      </div>
    </div>
  </main>
\n`;

content = content.slice(0, startIndex) + newWorkspaceHtml + content.slice(endIndex);

// Also replace the script tag at the bottom if needed
content = content.replace('<script src="js/customizer.js"></script>', '<script src="js/customizer-studio.js"></script>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated personaliza-tu-mate.html!');
