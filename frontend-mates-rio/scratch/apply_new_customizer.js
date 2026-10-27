const fs = require('fs');
const path = require('path');

const targetHtmlPath = path.join(__dirname, '..', 'personaliza-tu-mate.html');
let html = fs.readFileSync(targetHtmlPath, 'utf8');

// 1. Text replacements for titles & tags
html = html.replace('TALLER DE PERSONALIZACIÓN', 'ESTUDIO DE PERSONALIZACIÓN 360°');
html = html.replace(
  '<li class="active"><span>Personalizá tu Mate</span></li>',
  '<li class="active"><span>Personalización</span></li>'
);
html = html.replace(
  '<span><i class="fas fa-magic" style="width: 22px; color: var(--accent-gold);"></i> Personalizá tu Mate</span>',
  '<span><i class="fas fa-magic" style="width: 22px; color: var(--accent-gold);"></i> Personalización</span>'
);

// 2. Identify <main class="customizer-main-container"> to </main>
const mainStartStr = '<main class="customizer-main-container">';
const mainEndStr = '</main>';

const startIdx = html.indexOf(mainStartStr);
const endIdx = html.indexOf(mainEndStr, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find main tags!', startIdx, endIdx);
  process.exit(1);
}

const newMainContent = `<main class="customizer-main-container">
    <div class="container customizer-container-wide">
      
      <!-- 1. ENCABEZADO DE LA SECCIÓN -->
      <div class="customizer-hero-head">
        <div class="studio-badge-pill">
          <i class="fas fa-magic"></i> ESTUDIO DE PERSONALIZACIÓN PROFESIONAL 360°
        </div>
        <h1 class="studio-page-title">Personalización</h1>
        <p class="studio-page-subtitle">
          Elegí qué pieza querés grabar, redactá tus textos con libertad total de tamaño y longitud, sumá escudos o tu propio logo y disfrutá de la previsualización interactiva en 360°.
        </p>
      </div>

      <!-- 2. CARDS DE ELECCIÓN DE PRODUCTO: MATE, TERMO O CAJA (ITEM 6) -->
      <div class="product-selector-cards-wrap" id="product-selection-cards">
        
        <!-- Card 1: Mate Imperial -->
        <div class="prod-select-card active" data-product="mate" onclick="switchActiveProduct('mate')">
          <span class="prod-card-badge">Más Popular</span>
          <div class="prod-card-icon-wrap">
            <i class="fas fa-mug-hot"></i>
          </div>
          <div class="prod-card-body">
            <h3 class="prod-card-title">Mate Imperial</h3>
            <p class="prod-card-desc">Corona de alpaca maciza / acero y cuero vacuno. Grabado láser milimétrico, cincelado y vista 360°.</p>
            <div class="prod-card-meta">
              <span class="prod-card-price">Desde $ 46.500</span>
              <span class="prod-card-free">Grabado BONIFICADO</span>
            </div>
          </div>
          <div class="prod-card-check"><i class="fas fa-check"></i></div>
        </div>

        <!-- Card 2: Termo de Acero -->
        <div class="prod-select-card" data-product="termo" onclick="switchActiveProduct('termo')">
          <span class="prod-card-badge">Doble Capa</span>
          <div class="prod-card-icon-wrap">
            <i class="fas fa-temperature-high"></i>
          </div>
          <div class="prod-card-body">
            <h3 class="prod-card-title">Termo de Acero</h3>
            <p class="prod-card-desc">Acero inoxidable 18/8 de 1 Litro térmico 24hs. Grabado indeleble de alta definición a lo largo del cuerpo.</p>
            <div class="prod-card-meta">
              <span class="prod-card-price">Desde $ 42.900</span>
              <span class="prod-card-free">Grabado BONIFICADO</span>
            </div>
          </div>
          <div class="prod-card-check"><i class="fas fa-check"></i></div>
        </div>

        <!-- Card 3: Caja Matera Premium -->
        <div class="prod-select-card" data-product="caja" onclick="switchActiveProduct('caja')">
          <span class="prod-card-badge">Ideal Regalo</span>
          <div class="prod-card-icon-wrap">
            <i class="fas fa-box-open"></i>
          </div>
          <div class="prod-card-body">
            <h3 class="prod-card-title">Caja Matera Premium</h3>
            <p class="prod-card-desc">Caja de madera noble para regalo o presentación. Pirograbado y láser de precisión en tapa y laterales.</p>
            <div class="prod-card-meta">
              <span class="prod-card-price">Desde $ 32.000</span>
              <span class="prod-card-free">Grabado BONIFICADO</span>
            </div>
          </div>
          <div class="prod-card-check"><i class="fas fa-check"></i></div>
        </div>

      </div>

      <!-- 3. BARRA RIBBON SUPERIOR ESTILO PAINT / WORD (ITEMS 3 & 4) -->
      <div class="studio-ribbon-container" id="studio-ribbon">
        
        <!-- Pestañas de la barra Ribbon -->
        <div class="ribbon-tabs-strip">
          <button type="button" class="ribbon-tab-btn" data-tab="product" onclick="switchRibbonTab('product')">
            <i class="fas fa-sliders"></i> <span>Producto & Vista</span>
          </button>
          <button type="button" class="ribbon-tab-btn active" data-tab="text" onclick="switchRibbonTab('text')">
            <i class="fas fa-font"></i> <span>Texto & Tipografía</span>
          </button>
          <button type="button" class="ribbon-tab-btn" data-tab="icons" onclick="switchRibbonTab('icons')">
            <i class="fas fa-shield-halved"></i> <span>Diseños & Escudos</span>
          </button>
          <button type="button" class="ribbon-tab-btn" data-tab="upload" onclick="switchRibbonTab('upload')">
            <i class="fas fa-cloud-arrow-up"></i> <span>Tu Logo / Imagen</span>
          </button>
          <button type="button" class="ribbon-tab-btn" data-tab="lines" onclick="switchRibbonTab('lines')">
            <i class="fas fa-circle-notch"></i> <span>Cincelado & Acabados</span>
          </button>
          <button type="button" class="ribbon-tab-btn ribbon-tab-finish" data-tab="finish" onclick="switchRibbonTab('finish')">
            <i class="fas fa-shopping-bag"></i> <span>Finalizar Pedido</span>
          </button>
        </div>

        <!-- Contenido dinámico del Ribbon organizado por Grupos -->
        <div class="ribbon-toolbar-content">
          
          <!-- PESTAÑA 1: PRODUCTO & VISTA -->
          <div class="ribbon-tab-panel" data-panel="product" id="ribbon-panel-product">
            <!-- Grupo: Selección de Producto -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn active" data-prod-btn="mate" onclick="switchActiveProduct('mate')">
                  <i class="fas fa-mug-hot"></i> Mate
                </button>
                <button type="button" class="ribbon-btn" data-prod-btn="termo" onclick="switchActiveProduct('termo')">
                  <i class="fas fa-temperature-high"></i> Termo
                </button>
                <button type="button" class="ribbon-btn" data-prod-btn="caja" onclick="switchActiveProduct('caja')">
                  <i class="fas fa-box-open"></i> Caja
                </button>
              </div>
              <span class="ribbon-group-label">Producto</span>
            </div>

            <!-- Grupo: Modelo Base -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <select id="mate-model-select" class="ribbon-select" onchange="onMateModelChange(this.value)" style="min-width: 220px;">
                  <!-- Populated via JS -->
                </select>
              </div>
              <span class="ribbon-group-label">Modelo Base</span>
            </div>

            <!-- Grupo: Modo de Vista -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn active" id="ribbon-view-2d-btn" onclick="setStudioViewMode('2d')">
                  <i class="fas fa-pen-ruler"></i> Vista Grabado 2D
                </button>
                <button type="button" class="ribbon-btn" id="ribbon-view-360-btn" onclick="setStudioViewMode('360')">
                  <i class="fas fa-rotate"></i> Giro 360°
                </button>
              </div>
              <span class="ribbon-group-label">Modo Visualización</span>
            </div>

            <!-- Grupo: Acciones del Lienzo -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn" onclick="autoCenterAndBalanceVirola()" title="Centrar concéntricamente">
                  <i class="fas fa-crosshairs"></i> Centrar
                </button>
                <button type="button" class="ribbon-btn" onclick="resetVirolaStudio()" title="Limpiar todo">
                  <i class="fas fa-trash-can"></i> Limpiar
                </button>
              </div>
              <span class="ribbon-group-label">Lienzo</span>
            </div>
          </div>

          <!-- PESTAÑA 2: TEXTO & TIPOGRAFÍA (LIBERTAD TOTAL, ITEM 5) -->
          <div class="ribbon-tab-panel active" data-panel="text" id="ribbon-panel-text">
            
            <!-- Grupo 1: Redacción Libre (Sin límites de texto) -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <div style="position: relative; display: flex; align-items: center;">
                  <input type="text" 
                         id="active-text-input" 
                         class="ribbon-input-text" 
                         placeholder="Escribí nombres, fechas, frases o dedicatorias..." 
                         oninput="onActiveTextInput(this.value)" />
                  <button type="button" class="ribbon-btn ribbon-btn-icon-only" onclick="clearActiveText()" title="Borrar texto" style="position: absolute; right: 4px; border: none; background: transparent;">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button type="button" class="ribbon-btn ribbon-btn-lg" onclick="addNewTextBlock('', 'top')" title="Agregar otro bloque de texto libre">
                  <i class="fas fa-plus"></i> Nuevo Texto
                </button>
              </div>
              <span class="ribbon-group-label">Redacción Libre</span>
            </div>

            <!-- Grupo 2: Tipografía de Grabado -->
            <div class="ribbon-group" style="position: relative;">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn ribbon-font-preview-btn" id="ribbon-font-select-btn" onclick="toggleRibbonFontDropdown()">
                  <span id="active-text-font-badge" style="font-family: 'Cinzel', serif; font-weight: 800;">Cinzel</span>
                  <i class="fas fa-chevron-down" style="font-size: 0.7rem; margin-left: 8px;"></i>
                </button>
                <div class="ribbon-font-dropdown" id="ribbon-font-dropdown">
                  <!-- Generado dinámicamente -->
                </div>
              </div>
              <span class="ribbon-group-label">Fuente Orfebre</span>
            </div>

            <!-- Grupo 3: Tamaño de Letra (Libre de 8px a 140px+) -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn ribbon-btn-icon-only" onclick="stepTextFontSize(-2)" title="Achicar letra (A-)">
                  <i class="fas fa-font" style="font-size: 0.72rem;"></i>-
                </button>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <input type="number" id="active-text-size-input" class="ribbon-select" min="8" max="160" value="20" style="width: 60px; text-align: center;" onchange="onActiveTextSizeChange(this.value)" />
                  <span style="font-size: 0.75rem; color: var(--text-muted);">px</span>
                </div>
                <button type="button" class="ribbon-btn ribbon-btn-icon-only" onclick="stepTextFontSize(2)" title="Agrandar letra (A+)">
                  <i class="fas fa-font" style="font-size: 1rem;"></i>+
                </button>
                <input type="range" id="active-text-size-slider" min="8" max="140" step="1" value="20" oninput="onActiveTextSizeChange(this.value)" style="width: 90px; accent-color: var(--accent-gold);" />
              </div>
              <span class="ribbon-group-label">Tamaño</span>
            </div>

            <!-- Grupo 4: Curvatura / Formato -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn active-text-curve-btn" data-pos="top" onclick="setActiveTextCurvature('top')" title="Curva Superior ⌒">
                  <i class="fas fa-arrow-up"></i> Curva Arriba
                </button>
                <button type="button" class="ribbon-btn active-text-curve-btn" data-pos="straight" onclick="setActiveTextCurvature('straight')" title="Recto Libre —">
                  <i class="fas fa-minus"></i> Recto
                </button>
                <button type="button" class="ribbon-btn active-text-curve-btn" data-pos="bottom" onclick="setActiveTextCurvature('bottom')" title="Curva Inferior ⌣">
                  <i class="fas fa-arrow-down"></i> Curva Abajo
                </button>
              </div>
              <span class="ribbon-group-label">Formato & Curvatura</span>
            </div>

            <!-- Grupo 5: Capas de Texto Activas -->
            <div class="ribbon-group">
              <div class="ribbon-group-content" id="text-layers-container">
                <!-- Capas en pills dinámicos -->
              </div>
              <span class="ribbon-group-label">Capas Activas</span>
            </div>

            <!-- Grupo 6: Operaciones -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn" onclick="duplicateActiveItem()" title="Duplicar texto">
                  <i class="fas fa-clone"></i>
                </button>
                <button type="button" class="ribbon-btn" onclick="deleteActiveVirolaItem()" title="Eliminar texto" style="color: #ef4444;">
                  <i class="fas fa-trash-can"></i>
                </button>
              </div>
              <span class="ribbon-group-label">Editar</span>
            </div>

          </div>

          <!-- PESTAÑA 3: DISEÑOS & ESCUDOS -->
          <div class="ribbon-tab-panel" data-panel="icons" id="ribbon-panel-icons">
            
            <!-- Grupo 1: Filtro de Categoría -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn active" data-cat-filter="deportes" onclick="filterRibbonDesigns('deportes')">
                  🏆 Deportes
                </button>
                <button type="button" class="ribbon-btn" data-cat-filter="criollo" onclick="filterRibbonDesigns('criollo')">
                  🇦🇷 Criollos
                </button>
                <button type="button" class="ribbon-btn" data-cat-filter="fauna" onclick="filterRibbonDesigns('fauna')">
                  🦅 Fauna
                </button>
                <button type="button" class="ribbon-btn" data-cat-filter="simbolos" onclick="filterRibbonDesigns('simbolos')">
                  ✨ Símbolos
                </button>
                <button type="button" class="ribbon-btn" data-cat-filter="frases" onclick="filterRibbonDesigns('frases')">
                  💬 Frases
                </button>
              </div>
              <span class="ribbon-group-label">Categorías</span>
            </div>

            <!-- Grupo 2: Diseños Rápidos (Carrusel clickeable para insertar al instante) -->
            <div class="ribbon-group">
              <div class="ribbon-group-content" id="ribbon-quick-designs" style="max-width: 480px; overflow-x: auto; padding-bottom: 2px;">
                <!-- Populated via JS -->
              </div>
              <span class="ribbon-group-label">Inserción Rápida con 1 Clic</span>
            </div>

            <!-- Grupo 3: Catálogo Completo -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn ribbon-btn-lg" onclick="openDesignCatalogModal()">
                  <i class="fas fa-th-large"></i> Ver Todo el Catálogo
                </button>
              </div>
              <span class="ribbon-group-label">Galería Completa</span>
            </div>

          </div>

          <!-- PESTAÑA 4: TU LOGO / IMAGEN (ESCALA LIBRE SIN LÍMITES, ITEM 5) -->
          <div class="ribbon-tab-panel" data-panel="upload" id="ribbon-panel-upload">
            
            <!-- Grupo 1: Subir Archivo Propio -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <input type="file" id="studio-custom-file-upload" accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" style="display: none;" onchange="handleCustomImageUpload(event)" />
                <button type="button" class="ribbon-btn ribbon-btn-lg" onclick="document.getElementById('studio-custom-file-upload').click()" style="background: var(--accent-gold); color: #120e0a;">
                  <i class="fas fa-upload"></i> Subir Logo o Imagen
                </button>
                <span style="font-size: 0.74rem; color: var(--text-muted); max-width: 170px; line-height: 1.3;">
                  Auto-vectorizado y eliminación de fondo automática.
                </span>
              </div>
              <span class="ribbon-group-label">Cargar Archivo</span>
            </div>

            <!-- Grupo 2: Escala Libre (Puede abarcar toda la virola o producto) -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn ribbon-btn-icon-only" onclick="stepItemScale(-0.15)" title="Achicar">
                  <i class="fas fa-minus"></i>
                </button>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span id="ribbon-image-scale-val" style="font-size: 0.8rem; font-weight: 800; color: var(--accent-gold); min-width: 45px; text-align: center;">100%</span>
                </div>
                <button type="button" class="ribbon-btn ribbon-btn-icon-only" onclick="stepItemScale(0.15)" title="Agrandar libremente">
                  <i class="fas fa-plus"></i>
                </button>
                <button type="button" class="ribbon-btn" onclick="setItemFullSurfaceScale()" title="Agrandar para cubrir superficie">
                  <i class="fas fa-expand"></i> Escala Máxima
                </button>
              </div>
              <span class="ribbon-group-label">Escala Libre (Sin Límite)</span>
            </div>

            <!-- Grupo 3: Rotación y Ajuste -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn" onclick="stepItemRotation(-15)" title="Girar a la izquierda">
                  <i class="fas fa-rotate-left"></i> -15°
                </button>
                <button type="button" class="ribbon-btn" onclick="stepItemRotation(15)" title="Girar a la derecha">
                  <i class="fas fa-rotate-right"></i> +15°
                </button>
                <button type="button" class="ribbon-btn" onclick="resetItemTransform()" title="Restablecer giro">
                  <i class="fas fa-undo"></i> 0°
                </button>
              </div>
              <span class="ribbon-group-label">Orientación</span>
            </div>

          </div>

          <!-- PESTAÑA 5: CINCELADO & ACABADOS -->
          <div class="ribbon-tab-panel" data-panel="lines" id="ribbon-panel-lines">
            
            <!-- Grupo 1: Ranuras Cinceladas -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn lines-pill-btn" data-lines="no" onclick="selectCircularLines('no')">
                  Sin Ranuras
                </button>
                <button type="button" class="ribbon-btn lines-pill-btn" data-lines="simple" onclick="selectCircularLines('simple')">
                  Línea Simple
                </button>
                <button type="button" class="ribbon-btn lines-pill-btn active" data-lines="doble" onclick="selectCircularLines('doble')">
                  Línea Doble Concéntrica
                </button>
              </div>
              <span class="ribbon-group-label">Ranuras Cinceladas en Virola</span>
            </div>

            <!-- Grupo 2: Metal y Acabado -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn active" id="metal-alpaca-btn" onclick="setMetalFinish('alpaca')">
                  <i class="fas fa-gem"></i> Alpaca Maciza
                </button>
                <button type="button" class="ribbon-btn" id="metal-acero-btn" onclick="setMetalFinish('acero')">
                  <i class="fas fa-shield"></i> Acero Quirúrgico
                </button>
              </div>
              <span class="ribbon-group-label">Material de la Corona</span>
            </div>

            <!-- Grupo 3: Asistencias CAD -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn active" id="toggle-snapping-btn" onclick="toggleSnappingGuides()">
                  <i class="fas fa-magnet"></i> Guías Imán (Snap)
                </button>
                <button type="button" class="ribbon-btn active" id="toggle-clipping-btn" onclick="toggleClipToMetal()">
                  <i class="fas fa-crop-simple"></i> Recorte al Metal
                </button>
              </div>
              <span class="ribbon-group-label">Asistencias CAD</span>
            </div>

          </div>

          <!-- PESTAÑA 6: FINALIZAR PEDIDO -->
          <div class="ribbon-tab-panel" data-panel="finish" id="ribbon-panel-finish">
            
            <!-- Grupo 1: Resumen de Precios -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <span style="font-size: 0.75rem; color: var(--text-muted);">Total de la pieza:</span>
                  <strong id="confirm-mate-price" style="font-size: 1.15rem; color: var(--accent-gold);">$ 46.500</strong>
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px; margin-left: 14px;">
                  <span style="font-size: 0.72rem; color: #10b981; font-weight: 800;">GRABADO BONIFICADO ($0)</span>
                  <span id="confirm-items-count" style="font-size: 0.72rem; color: var(--text-muted);">3 elementos</span>
                </div>
              </div>
              <span class="ribbon-group-label">Precio</span>
            </div>

            <!-- Grupo 2: Modalidad de Entrega -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn active" id="purchase-type-web-btn" onclick="setPurchaseType('web')">
                  <i class="fas fa-truck-fast"></i> Compra Web (Envío)
                </button>
                <button type="button" class="ribbon-btn" id="purchase-type-local-btn" onclick="setPurchaseType('local')">
                  <i class="fas fa-store"></i> Retiro Río Ceballos
                </button>
              </div>
              <span class="ribbon-group-label">Entrega</span>
            </div>

            <!-- Grupo 3: Acciones Finales -->
            <div class="ribbon-group">
              <div class="ribbon-group-content">
                <button type="button" class="ribbon-btn ribbon-btn-lg" onclick="finalizeAndAddToCart()" style="background: var(--accent-gold); color: #120e0a; font-weight: 900; padding: 10px 22px;">
                  <i class="fas fa-shopping-bag"></i> Agregar al Carrito
                </button>
                <button type="button" class="ribbon-btn" onclick="downloadVectorLaserFile()" title="Descargar plano SVG para máquina láser">
                  <i class="fas fa-file-arrow-down" style="color: var(--accent-gold);"></i> SVG Láser
                </button>
              </div>
              <span class="ribbon-group-label">Confirmar</span>
            </div>

          </div>

        </div>

      </div>

      <!-- 4. LIENZO CENTRAL EXPANDIDO (OCUPA LA MAYOR PARTE DE LA PANTALLA) (ITEMS 3 & 4) -->
      <section class="studio-main-stage-full" id="studio-main-stage" aria-label="Lienzo de Grabado y Simulador 360°">
        
        <!-- Barra de Control Superior en el Lienzo -->
        <div class="stage-topbar-controls">
          <div class="stage-mode-switch-segmented">
            <button type="button" class="stage-mode-btn active" id="stage-btn-2d" onclick="setStudioViewMode('2d')" title="Vista plana para diseñar milimétricamente">
              <i class="fas fa-pen-ruler"></i> Vista Grabado 2D
            </button>
            <button type="button" class="stage-mode-btn" id="stage-btn-360" onclick="setStudioViewMode('360')" title="Vista 3D interactiva orbital 360°">
              <i class="fas fa-rotate"></i> Vista 360° Interactiva
            </button>
          </div>

          <div class="stage-badge-status" id="stage-badge-status">
            <i class="fas fa-circle live-pulse-dot"></i> <span id="stage-status-text">CORONA DE ALPACA MACIZA (ANCHO 70MM) • ESCALA 1:1 CNC</span>
          </div>
        </div>

        <!-- Contenedor del Lienzo: Alterna entre SVG 2D CNC y Viewport 360° -->
        <div class="studio-canvas-wrap" id="studio-canvas-wrap">
          
          <!-- VISTA 1: CANVAS SVG INTERACTIVO 2D (DISEÑO MILIMÉTRICO) -->
          <div id="studio-2d-viewport" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
            <svg id="virola-studio-svg" viewBox="0 0 500 500" class="studio-svg-viewport" xmlns="http://www.w3.org/2000/svg">
              <!-- Renderizado dinámicamente por customizer-studio.js -->
            </svg>
          </div>

          <!-- VISTA 2: VIEWPORT 360° INTERACTIVO ORBITAL 3D (ITEM 6) -->
          <div id="studio-360-viewport" class="studio-360-viewport" style="display: none;" 
               onmousedown="start360RotationDrag(event)" 
               ontouchstart="start360RotationDrag(event)">
            <canvas id="studio-360-canvas" width="560" height="520" style="width: 100%; height: 100%; max-width: 560px; max-height: 520px;"></canvas>
            
            <div class="rotation-guide-overlay">
              <i class="fas fa-arrows-left-right"></i>
              <span>Arrastrá libremente para girar 360°</span>
              <span class="rotation-degree-val" id="rotation-degree-val">0°</span>
              <button type="button" class="ribbon-btn ribbon-btn-icon-only" id="toggle-autorotate-btn" onclick="toggleAutoRotate360(event)" title="Giro automático continuo" style="width: 26px; height: 26px; font-size: 0.72rem; margin-left: 6px;">
                <i class="fas fa-play" id="autorotate-icon"></i>
              </button>
            </div>
          </div>

        </div>

        <!-- Barra Flotante de Herramientas para el Elemento Seleccionado -->
        <div id="virola-active-item-controls" class="virola-active-item-controls" style="display: none;">
          <div class="active-item-status">
            <span id="active-item-name-badge" class="active-item-name-badge">Elemento Seleccionado</span>
          </div>
          <div class="active-item-actions">
            <button type="button" class="item-quick-btn" onclick="stepItemScale(-0.1)" title="Achicar"><i class="fas fa-minus"></i></button>
            <button type="button" class="item-quick-btn" onclick="stepItemScale(0.1)" title="Agrandar libremente"><i class="fas fa-plus"></i></button>
            <button type="button" class="item-quick-btn" onclick="stepItemRotation(-15)" title="Girar a la izquierda"><i class="fas fa-rotate-left"></i></button>
            <button type="button" class="item-quick-btn" onclick="stepItemRotation(15)" title="Girar a la derecha"><i class="fas fa-rotate-right"></i></button>
            <button type="button" class="item-quick-btn" onclick="duplicateActiveItem()" title="Duplicar capa"><i class="fas fa-clone"></i></button>
            <button type="button" class="item-quick-btn btn-delete-item" onclick="deleteActiveVirolaItem()" title="Eliminar"><i class="fas fa-trash-can"></i></button>
          </div>
        </div>

        <!-- Barra Inferior de Herramientas del Escenario -->
        <div class="stage-bottombar-tools">
          <div class="stage-tools-pill-group">
            <button type="button" class="stage-tool-pill" onclick="autoCenterAndBalanceVirola()" title="Centrar concéntricamente">
              <i class="fas fa-crosshairs"></i> Centrar
            </button>
            <button type="button" class="stage-tool-pill" id="canvas-snap-btn" onclick="toggleSnappingGuides()" title="Guías magnéticas de imán">
              <i class="fas fa-magnet"></i> Snapping
            </button>
            <button type="button" class="stage-tool-pill" onclick="studio.activeItemId = null; renderVirolaCanvas();" title="Deseleccionar">
              <i class="fas fa-mouse-pointer"></i> Deseleccionar
            </button>
            <button type="button" class="stage-tool-pill" onclick="resetVirolaStudio()" title="Limpiar lienzo">
              <i class="fas fa-trash-can"></i> Limpiar
            </button>
          </div>

          <div class="stage-tools-pill-group">
            <button type="button" class="stage-tool-pill" onclick="downloadVectorLaserFile()" title="Descargar SVG vectorial para máquina láser">
              <i class="fas fa-file-arrow-down" style="color: var(--accent-gold);"></i> SVG Láser CNC
            </button>
          </div>
        </div>

      </section>

    </div>
  </main>

  <!-- MODAL: CATÁLOGO COMPLETO DE DISEÑOS & ESCUDOS (40+ DISEÑOS) -->
  <div class="design-catalog-modal" id="design-catalog-modal" onclick="closeDesignCatalogModal(event)">
    <div class="design-modal-card" onclick="event.stopPropagation()">
      <div class="design-modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-shield-halved" style="color: var(--accent-gold); font-size: 1.25rem;"></i>
          <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800;">Catálogo Completo de Diseños & Escudos</h3>
        </div>
        <button type="button" class="ribbon-btn ribbon-btn-icon-only" onclick="closeDesignCatalogModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="design-modal-body">
        <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
          <button type="button" class="ribbon-btn active modal-cat-tab-btn" data-modal-cat="all" onclick="filterModalCatalog('all')">Todos</button>
          <button type="button" class="ribbon-btn modal-cat-tab-btn" data-modal-cat="deportes" onclick="filterModalCatalog('deportes')">Deportes</button>
          <button type="button" class="ribbon-btn modal-cat-tab-btn" data-modal-cat="criollo" onclick="filterModalCatalog('criollo')">Criollos & Tradición</button>
          <button type="button" class="ribbon-btn modal-cat-tab-btn" data-modal-cat="fauna" onclick="filterModalCatalog('fauna')">Fauna Nacional</button>
          <button type="button" class="ribbon-btn modal-cat-tab-btn" data-modal-cat="simbolos" onclick="filterModalCatalog('simbolos')">Símbolos</button>
          <button type="button" class="ribbon-btn modal-cat-tab-btn" data-modal-cat="frases" onclick="filterModalCatalog('frases')">Frases</button>
        </div>

        <div class="vector-icons-grid" id="modal-designs-grid" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));">
          <!-- Populated via JS -->
        </div>
      </div>
    </div>
  </div>`;

html = html.substring(0, startIdx) + newMainContent + html.substring(endIdx + mainEndStr.length);

fs.writeFileSync(targetHtmlPath, html, 'utf8');
console.log('Successfully updated personaliza-tu-mate.html with Ribbon & 360 Studio!');

// Also create personalizacion.html as an exact mirror for clean URL support
const mirrorPath = path.join(__dirname, '..', 'personalizacion.html');
fs.writeFileSync(mirrorPath, html, 'utf8');
console.log('Successfully created personalizacion.html mirror!');
