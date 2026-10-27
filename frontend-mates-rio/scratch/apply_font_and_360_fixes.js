const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../js/customizer-studio.js');
let code = fs.readFileSync(jsPath, 'utf8');

// 1. REEMPLAZO DE DROPDOWN DE FUENTES (ITEM 3)
const oldFontBlockStart = "// Alternar dropdown de fuentes\nfunction toggleRibbonFontDropdown() {";
const oldFontBlockEnd = "  showNotificationToast(`Tipografía aplicada: ${fontId}`, 'fa-font');\n}";

const newFontBlock = `// Alternar dropdown de fuentes (ITEM 3: POPUP PROFESIONAL ELEGANTE Y POSICIONADO)
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
    fontDropdown.style.top = \`\${rect.bottom + 8}px\`;
    fontDropdown.style.left = \`\${Math.max(10, Math.min(window.innerWidth - 305, rect.left))}px\`;
    fontDropdown.style.display = 'block';
    fontDropdown.classList.add('open');
  }
}

function renderRibbonFontDropdown() {
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
      const isSel = studio.selectedFont === f.id;
      return \`
        <div class="ribbon-font-item \${isSel ? 'selected' : ''}" 
             onclick="selectStudioFont('\${f.id}')" 
             style="font-family: '\${f.id}', serif;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.95rem; font-weight: 700;">\${f.name}</span>
            <span style="font-size: 0.72rem; opacity: 0.65; letter-spacing: 0.5px;">Mates Río 1810</span>
          </div>
          \${isSel ? '<i class="fas fa-check" style="color: #120e0a; font-size: 0.85rem;"></i>' : ''}
        </div>
      \`;
    }).join('')}
  \`;
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
    badge.style.fontFamily = \`'\${fontId}', serif\`;
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
  showNotificationToast(\`Tipografía aplicada: \${fontId}\`, 'fa-font');
}`;

const startIdx = code.indexOf(oldFontBlockStart);
const endIdx = code.indexOf(oldFontBlockEnd);
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newFontBlock + code.substring(endIdx + oldFontBlockEnd.length);
  console.log('Successfully replaced font dropdown block!');
} else {
  console.log('Could not find exact indices for font dropdown block:', startIdx, endIdx);
}

// 2. REEMPLAZO DE MOTOR 360: MOVILIDAD DE ELEMENTOS Y CAJA 3D COMPLETA (ITEMS 6 & 7)
const old360Start = "function init360CanvasEvents() {";
const old360End = "    ctx.restore();\n  }\n}\n\n// ==========================================================================\n// 10. INTERACCIÓN Y MANIPULACIÓN LIBRE";

const new360Block = `function init360CanvasEvents() {
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
    if (degValEl) degValEl.textContent = \`\${studio.rotation360}°\`;

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
    if (degValEl) degValEl.textContent = \`\${studio.rotation360}°\`;
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
}

// ==========================================================================
// 10. INTERACCIÓN Y MANIPULACIÓN LIBRE`;

const start360Idx = code.indexOf(old360Start);
const end360Idx = code.indexOf(old360End);
if (start360Idx !== -1 && end360Idx !== -1) {
  code = code.substring(0, start360Idx) + new360Block + code.substring(end360Idx + old360End.length);
  console.log('Successfully replaced 360 events and 3D rendering engine!');
} else {
  console.log('Could not find exact indices for 360 block:', start360Idx, end360Idx);
}

fs.writeFileSync(jsPath, code, 'utf8');
console.log('Finished updating customizer-studio.js! Final length:', code.length);
