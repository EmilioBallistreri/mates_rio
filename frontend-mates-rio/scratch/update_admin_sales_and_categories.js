const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '..', 'js', 'admin.js');
let adminJs = fs.readFileSync(adminJsPath, 'utf8');

// 1. Add delete button in renderOrdersTable
const oldOrderActions = `<button type="button" class="btn-table-action" onclick="contactCustomerWhatsApp('\${order.customerPhone || '5493513830111'}', '\${order.id}', '\${order.customerName || 'Cliente'}', '\${order.status}')" title="Contactar por WhatsApp">
              <i class="fab fa-whatsapp" style="color: #27ae60;"></i>
            </button>
          </div>`;

const newOrderActions = `<button type="button" class="btn-table-action" onclick="contactCustomerWhatsApp('\${order.customerPhone || '5493513830111'}', '\${order.id}', '\${order.customerName || 'Cliente'}', '\${order.status}')" title="Contactar por WhatsApp">
              <i class="fab fa-whatsapp" style="color: #27ae60;"></i>
            </button>
            <button type="button" class="btn-table-action" onclick="deleteOrder('\${order.id}')" title="Eliminar Venta / Pedido" style="color: #ef4444;">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>`;

if (adminJs.includes(oldOrderActions)) {
  adminJs = adminJs.replace(oldOrderActions, newOrderActions);
  console.log('Order table actions updated with delete button!');
} else {
  console.log('oldOrderActions not found, searching alternative...');
}

// 1.2 Add deleteOrder function right after changeOrderStatus
const oldChangeOrderStatus = `function changeOrderStatus(orderId, newStatus) {`;
const newDeleteOrderCode = `function deleteOrder(orderId) {
  if (!confirm(\`¿Estás seguro de que deseás eliminar permanentemente la venta #\${orderId}? Esta acción no se puede deshacer.\`)) {
    return;
  }
  let orders = getOrders();
  const orderToDelete = orders.find(o => o.id === orderId);
  orders = orders.filter(o => o.id !== orderId);
  saveOrders(orders);
  
  renderOrdersTable();
  if (typeof refreshDashboardData === 'function') refreshDashboardData();
  if (typeof renderDashboardRecentOrders === 'function') renderDashboardRecentOrders();
  if (typeof updateKPIs === 'function') updateKPIs();
  
  logAuditAction('Eliminación de Venta', \`Se eliminó el pedido #\${orderId} (\${orderToDelete?.customerName || 'Cliente'}).\`);
  showAdminToast(\`Venta #\${orderId} eliminada correctamente\`, 'fa-trash-can');
}

function changeOrderStatus(orderId, newStatus) {`;

if (adminJs.includes(oldChangeOrderStatus)) {
  adminJs = adminJs.replace(oldChangeOrderStatus, newDeleteOrderCode);
  console.log('deleteOrder function inserted!');
}

// 1.3 Add delete button in Wholesale orders
const oldWsOrderActions = `<a href="https://wa.me/\${(order.phone || '').replace(/\\D/g, '')}?text=Hola%20\${encodeURIComponent(order.contactName)}%20de%20\${encodeURIComponent(order.businessName)},%20te%20escribimos%20de%20Mates%20R%C3%ADo%20por%20tu%20pedido%20mayorista%20#\${order.id}." target="_blank" class="btn-table-action" title="Contactar por WhatsApp">
              <i class="fab fa-whatsapp" style="color: #25d366;"></i>
            </a>
          </div>`;

const newWsOrderActions = `<a href="https://wa.me/\${(order.phone || '').replace(/\\D/g, '')}?text=Hola%20\${encodeURIComponent(order.contactName)}%20de%20\${encodeURIComponent(order.businessName)},%20te%20escribimos%20de%20Mates%20R%C3%ADo%20por%20tu%20pedido%20mayorista%20#\${order.id}." target="_blank" class="btn-table-action" title="Contactar por WhatsApp">
              <i class="fab fa-whatsapp" style="color: #25d366;"></i>
            </a>
            <button type="button" class="btn-table-action" onclick="deleteWholesaleOrder('\${order.id}')" title="Eliminar Pedido Mayorista" style="color: #ef4444;">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>`;

if (adminJs.includes(oldWsOrderActions)) {
  adminJs = adminJs.replace(oldWsOrderActions, newWsOrderActions);
  console.log('Wholesale order table actions updated with delete button!');
}

// 1.4 Add deleteWholesaleOrder function
const oldUpdateWsOrderStatus = `function updateWholesaleOrderStatus(orderId, newStatus) {`;
const newDeleteWsOrderCode = `function deleteWholesaleOrder(orderId) {
  if (!confirm(\`¿Estás seguro de que deseás eliminar el pedido mayorista #\${orderId}? Esta acción no se puede deshacer.\`)) {
    return;
  }
  let orders = getWholesaleOrders();
  const orderToDelete = orders.find(o => o.id === orderId);
  orders = orders.filter(o => o.id !== orderId);
  saveWholesaleOrders(orders);
  
  renderWholesaleOrdersTable();
  if (typeof refreshDashboardData === 'function') refreshDashboardData();
  
  logAuditAction('Eliminación de Pedido Mayorista', \`Se eliminó el pedido mayorista #\${orderId} (\${orderToDelete?.businessName || ''}).\`);
  showAdminToast(\`Pedido mayorista #\${orderId} eliminado\`, 'fa-trash-can');
}

function updateWholesaleOrderStatus(orderId, newStatus) {`;

if (adminJs.includes(oldUpdateWsOrderStatus)) {
  adminJs = adminJs.replace(oldUpdateWsOrderStatus, newDeleteWsOrderCode);
  console.log('deleteWholesaleOrder function inserted!');
}

// 2. Enhanced Category Management in admin.js
const oldCategoryFunctionsBlock = `function renderAdminCategoriesGrid() {
  const container = document.getElementById('admin-categories-editor-grid');
  if (!container) return;

  const categories = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);

  container.innerHTML = categories.map(cat => {
    const subcats = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    return \`
      <div class="admin-category-card">
        <div class="admin-cat-img-wrap">
          <img src="\${cat.image}" alt="\${cat.name}" class="admin-cat-img" />
          \${cat.badge ? \`<span class="admin-cat-badge-pill">\${cat.badge}</span>\` : ''}
          <div class="admin-cat-overlay-title">
            \${cat.name}
          </div>
        </div>
        <div class="admin-cat-body">
          <div>
            <div class="admin-cat-label-sub">
              <i class="fas fa-layer-group"></i> \${cat.label || ''}
            </div>
            <div class="admin-cat-subcats-count">
              Subcategorías activas (\${subcats.length}):
            </div>
            <div class="admin-cat-chips-list">
              \${subcats.map(sc => \`<span class="admin-subcat-chip">\${sc}</span>\`).join('')}
            </div>
          </div>
          <button type="button" class="btn-admin btn-admin-gold" style="width: 100%; justify-content: center; font-size: 0.82rem; margin-top: 10px;" onclick="openCategoryModal('\${cat.id}')">
            <i class="fas fa-pen-to-square"></i> Modificar Categoría & Subcategorías
          </button>
        </div>
      </div>
    \`;
  }).join('');
}

function openCategoryModal(catId) {
  currentEditingCatId = catId;
  const categories = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;

  const idEl = document.getElementById('cat-edit-id');
  if (idEl) idEl.value = cat.id;

  const nameEl = document.getElementById('cat-edit-name');
  if (nameEl) nameEl.value = cat.name || '';

  const badgeEl = document.getElementById('cat-edit-badge');
  if (badgeEl) badgeEl.value = cat.badge || '';

  const labelEl = document.getElementById('cat-edit-label');
  if (labelEl) labelEl.value = cat.label || '';

  currentEditingSubcats = Array.isArray(cat.subcategories) ? [...cat.subcategories] : [];
  renderCatSubcatsChips();

  const modal = document.getElementById('category-editor-modal');
  if (modal) modal.classList.add('active');
}

function closeCategoryModal() {
  const modal = document.getElementById('category-editor-modal');
  if (!modal) return;
  modal.classList.remove('active');
}

function renderCatSubcatsChips() {
  const container = document.getElementById('cat-edit-subcats-container');
  if (!container) return;

  if (currentEditingSubcats.length === 0) {
    container.innerHTML = '<span style="font-size: 0.78rem; color: var(--admin-text-muted);">Sin subcategorías cargadas. Agregá una arriba.</span>';
    return;
  }

  container.innerHTML = currentEditingSubcats.map((sc, idx) => \`
    <span class="admin-subcat-chip-interactive">
      \${sc}
      <button type="button" onclick="removeSubcatChip(\${idx})" aria-label="Eliminar subcategoría">
        <i class="fas fa-times"></i>
      </button>
    </span>
  \`).join('');
}

function addNewSubcatChip() {
  const input = document.getElementById('new-subcat-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  if (!currentEditingSubcats.includes(val)) {
    currentEditingSubcats.push(val);
    renderCatSubcatsChips();
  }
  input.value = '';
}

function removeSubcatChip(idx) {
  currentEditingSubcats.splice(idx, 1);
  renderCatSubcatsChips();
}

function saveCategoryEdits() {
  if (!currentEditingCatId) return;

  const name = document.getElementById('cat-edit-name')?.value.trim();
  const badge = document.getElementById('cat-edit-badge')?.value.trim();
  const label = document.getElementById('cat-edit-label')?.value.trim();

  if (!name) {
    alert('El nombre de la categoría es obligatorio.');
    return;
  }

  let categories = typeof getActiveCategories === 'function' ? [...getActiveCategories()] : [...CATEGORIES_DATA];
  const cat = categories.find(c => c.id === currentEditingCatId);

  if (cat) {
    cat.name = name;
    cat.badge = badge;
    cat.label = label;
    cat.subcategories = [...currentEditingSubcats];

    if (typeof saveActiveCategories === 'function') {
      saveActiveCategories(categories);
    }
  }

  closeCategoryModal();
  renderAdminCategoriesGrid();
  showAdminToast(\`Categoría "\${name}" actualizada correctamente\`, 'fa-tags');
  logAuditAction('Diseño Web', \`Categoría "\${name}" y sus subcategorías fueron modificadas.\`);
}`;

const newCategoryFunctionsBlock = `function renderAdminCategoriesGrid() {
  const container = document.getElementById('admin-categories-editor-grid');
  if (!container) return;

  const categories = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);

  container.innerHTML = categories.map(cat => {
    const subcats = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    const isHomeVisible = cat.showOnHome !== false;
    return \`
      <div class="admin-category-card">
        <div class="admin-cat-img-wrap">
          <img src="\${cat.image || 'assets/images/cat_accesorios.jpg'}" alt="\${cat.name}" class="admin-cat-img" onerror="this.src='assets/images/cat_accesorios.jpg'" />
          \${cat.badge ? \`<span class="admin-cat-badge-pill">\${cat.badge}</span>\` : ''}
          <div class="admin-cat-overlay-title">
            \${cat.name}
          </div>
        </div>
        <div class="admin-cat-body">
          <div>
            <div style="margin-bottom: 8px;">
              <span class="badge-stock \${isHomeVisible ? 'stock-good' : 'stock-out'}" style="font-size: 0.68rem; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 4px;">
                \${isHomeVisible ? '<i class=\"fas fa-home\"></i> En Inicio y Catálogo' : '<i class=\"fas fa-filter\"></i> Solo en Catálogo y Filtros'}
              </span>
            </div>
            <div class="admin-cat-label-sub">
              <i class="fas fa-layer-group"></i> \${cat.label || cat.subtitle || 'Sin subtítulo'}
            </div>
            <div class="admin-cat-subcats-count">
              Subcategorías activas (\${subcats.length}):
            </div>
            <div class="admin-cat-chips-list">
              \${subcats.length > 0 ? subcats.map(sc => \`<span class=\"admin-subcat-chip\">\${sc}</span>\`).join('') : '<span style=\"font-size: 0.72rem; color: var(--admin-text-muted);\">Sin subcategorías</span>'}
            </div>
          </div>
          <button type="button" class="btn-admin btn-admin-gold" style="width: 100%; justify-content: center; font-size: 0.82rem; margin-top: 10px;" onclick="openCategoryModal('\${cat.id}')">
            <i class="fas fa-pen-to-square"></i> Editar Categoría & Subcategorías
          </button>
        </div>
      </div>
    \`;
  }).join('');
}

function openCreateCategoryModal() {
  currentEditingCatId = '__new__';
  const modalTitle = document.getElementById('cat-modal-title');
  if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus" style="color: var(--admin-gold);"></i> Agregar Nueva Categoría';
  
  const idEl = document.getElementById('cat-edit-id');
  if (idEl) idEl.value = '';

  const nameEl = document.getElementById('cat-edit-name');
  if (nameEl) nameEl.value = '';

  const badgeEl = document.getElementById('cat-edit-badge');
  if (badgeEl) badgeEl.value = '';

  const labelEl = document.getElementById('cat-edit-label');
  if (labelEl) labelEl.value = '';

  const imgEl = document.getElementById('cat-edit-image');
  if (imgEl) imgEl.value = 'assets/images/cat_accesorios.jpg';

  const showHomeEl = document.getElementById('cat-edit-show-on-home');
  if (showHomeEl) showHomeEl.checked = false; // Por defecto: no en el inicio, tal como pidió el cliente

  const deleteBtn = document.getElementById('btn-delete-cat');
  if (deleteBtn) deleteBtn.style.display = 'none';

  currentEditingSubcats = [];
  renderCatSubcatsChips();

  const modal = document.getElementById('category-editor-modal');
  if (modal) modal.classList.add('active');
}

function openCategoryModal(catId) {
  currentEditingCatId = catId;
  const categories = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;

  const modalTitle = document.getElementById('cat-modal-title');
  if (modalTitle) modalTitle.innerHTML = \`<i class="fas fa-pen-to-square" style="color: var(--admin-gold);"></i> Modificar Categoría: \${cat.name}\`;

  const idEl = document.getElementById('cat-edit-id');
  if (idEl) idEl.value = cat.id;

  const nameEl = document.getElementById('cat-edit-name');
  if (nameEl) nameEl.value = cat.name || '';

  const badgeEl = document.getElementById('cat-edit-badge');
  if (badgeEl) badgeEl.value = cat.badge || '';

  const labelEl = document.getElementById('cat-edit-label');
  if (labelEl) labelEl.value = cat.label || cat.subtitle || '';

  const imgEl = document.getElementById('cat-edit-image');
  if (imgEl) imgEl.value = cat.image || 'assets/images/cat_accesorios.jpg';

  const showHomeEl = document.getElementById('cat-edit-show-on-home');
  if (showHomeEl) showHomeEl.checked = cat.showOnHome !== false;

  const deleteBtn = document.getElementById('btn-delete-cat');
  if (deleteBtn) {
    deleteBtn.style.display = categories.length > 1 ? 'inline-flex' : 'none';
  }

  currentEditingSubcats = Array.isArray(cat.subcategories) ? [...cat.subcategories] : [];
  renderCatSubcatsChips();

  const modal = document.getElementById('category-editor-modal');
  if (modal) modal.classList.add('active');
}

function closeCategoryModal() {
  const modal = document.getElementById('category-editor-modal');
  if (!modal) return;
  modal.classList.remove('active');
  currentEditingCatId = null;
}

function renderCatSubcatsChips() {
  const container = document.getElementById('cat-edit-subcats-container');
  if (!container) return;

  if (currentEditingSubcats.length === 0) {
    container.innerHTML = '<span style="font-size: 0.78rem; color: var(--admin-text-muted);">Sin subcategorías cargadas. Agregá una arriba.</span>';
    return;
  }

  container.innerHTML = currentEditingSubcats.map((sc, idx) => \`
    <span class="admin-subcat-chip-interactive">
      \${sc}
      <button type="button" onclick="removeSubcatChip(\${idx})" aria-label="Eliminar subcategoría">
        <i class="fas fa-times"></i>
      </button>
    </span>
  \`).join('');
}

function addNewSubcatChip() {
  const input = document.getElementById('new-subcat-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  if (!currentEditingSubcats.includes(val)) {
    currentEditingSubcats.push(val);
    renderCatSubcatsChips();
  }
  input.value = '';
}

function removeSubcatChip(idx) {
  currentEditingSubcats.splice(idx, 1);
  renderCatSubcatsChips();
}

function saveCategoryEdits() {
  const name = document.getElementById('cat-edit-name')?.value.trim();
  const badge = document.getElementById('cat-edit-badge')?.value.trim();
  const label = document.getElementById('cat-edit-label')?.value.trim();
  const image = document.getElementById('cat-edit-image')?.value.trim() || 'assets/images/cat_accesorios.jpg';
  const showOnHome = document.getElementById('cat-edit-show-on-home')?.checked || false;

  if (!name) {
    alert('El nombre de la categoría es obligatorio.');
    return;
  }

  let categories = typeof getActiveCategories === 'function' ? [...getActiveCategories()] : [...CATEGORIES_DATA];

  if (currentEditingCatId === '__new__') {
    let baseId = name.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    if (!baseId) baseId = 'cat_' + Date.now();
    let uniqueId = baseId;
    let counter = 1;
    while (categories.some(c => c.id === uniqueId)) {
      uniqueId = \`\${baseId}_\${counter++}\`;
    }

    const newCat = {
      id: uniqueId,
      name: name,
      subtitle: label || '',
      label: label || '',
      badge: badge || '',
      image: image,
      subcategories: [...currentEditingSubcats],
      showOnHome: showOnHome,
      custom: true
    };
    categories.push(newCat);
    logAuditAction('Diseño Web', \`Se agregó la nueva categoría "\${name}" (ID: \${uniqueId}, En Inicio: \${showOnHome ? 'Sí' : 'No'}).\`);
    showAdminToast(\`Categoría "\${name}" creada con éxito\`, 'fa-plus');
  } else {
    const cat = categories.find(c => c.id === currentEditingCatId);
    if (cat) {
      cat.name = name;
      cat.badge = badge;
      cat.label = label;
      cat.subtitle = label;
      cat.image = image;
      cat.subcategories = [...currentEditingSubcats];
      cat.showOnHome = showOnHome;
      logAuditAction('Diseño Web', \`Categoría "\${name}" y sus subcategorías fueron modificadas.\`);
      showAdminToast(\`Categoría "\${name}" actualizada correctamente\`, 'fa-tags');
    }
  }

  if (typeof saveActiveCategories === 'function') {
    saveActiveCategories(categories);
  }

  closeCategoryModal();
  renderAdminCategoriesGrid();
  populateCategorySelects();
}

function deleteCurrentCategory() {
  if (!currentEditingCatId || currentEditingCatId === '__new__') return;
  let categories = typeof getActiveCategories === 'function' ? [...getActiveCategories()] : [...CATEGORIES_DATA];
  const cat = categories.find(c => c.id === currentEditingCatId);
  if (!cat) return;

  if (!confirm(\`¿Estás seguro de que deseás eliminar la categoría "\${cat.name}"? Los productos asociados deberán ser reclasificados.\`)) {
    return;
  }

  categories = categories.filter(c => c.id !== currentEditingCatId);
  if (typeof saveActiveCategories === 'function') {
    saveActiveCategories(categories);
  }

  closeCategoryModal();
  renderAdminCategoriesGrid();
  populateCategorySelects();
  logAuditAction('Diseño Web', \`Se eliminó la categoría "\${cat.name}".\`);
  showAdminToast(\`Categoría "\${cat.name}" eliminada\`, 'fa-trash-can');
}

function populateCategorySelects() {
  const categories = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);
  
  // 1. Selector de nuevo producto
  const newCatSelect = document.getElementById('new-prod-category');
  if (newCatSelect) {
    const currentVal = newCatSelect.value;
    newCatSelect.innerHTML = categories.map(c => \`
      <option value="\${c.id}">\${c.name}\${c.label ? ' - ' + c.label : ''}</option>
    \`).join('');
    if (currentVal && categories.some(c => c.id === currentVal)) {
      newCatSelect.value = currentVal;
    }
  }

  // 2. Selector de editar producto
  const editCatSelect = document.getElementById('edit-prod-category');
  if (editCatSelect) {
    const currentVal = editCatSelect.value;
    editCatSelect.innerHTML = categories.map(c => \`
      <option value="\${c.id}">\${c.name}\${c.label ? ' - ' + c.label : ''}</option>
    \`).join('');
    if (currentVal && categories.some(c => c.id === currentVal)) {
      editCatSelect.value = currentVal;
    }
  }

  // 3. Filtro de inventario
  const invCatFilter = document.getElementById('inventory-cat-filter');
  if (invCatFilter) {
    const currentVal = invCatFilter.value;
    invCatFilter.innerHTML = \`
      <option value="all">Todas las Categorías</option>
      \${categories.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join('')}
    \`;
    if (currentVal) invCatFilter.value = currentVal;
  }
}`;

if (adminJs.includes(oldCategoryFunctionsBlock)) {
  adminJs = adminJs.replace(oldCategoryFunctionsBlock, newCategoryFunctionsBlock);
  console.log('admin.js category functions replaced successfully!');
} else {
  console.log('oldCategoryFunctionsBlock not matched directly, checking...');
}

// Ensure populateCategorySelects is called in initAdmin()
if (!adminJs.includes('populateCategorySelects();')) {
  adminJs = adminJs.replace('renderAdminCategoriesGrid();', 'renderAdminCategoriesGrid();\n  populateCategorySelects();');
  console.log('populateCategorySelects() hooked into initAdmin!');
}

fs.writeFileSync(adminJsPath, adminJs, 'utf8');
console.log('admin.js updated!');

// =========================================================================
// 2. UPDATE app.js
// =========================================================================
let appJs = fs.readFileSync(appJsPath, 'utf8');

// 2.1 Filter home categories: showOnHome !== false
const oldRenderHomeCats = `function renderCategoriesGrid() {
  const container = document.getElementById('categories-grid');
  if (!container) return;
  const cats = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);

  container.innerHTML = cats.map(cat => {`;

const newRenderHomeCats = `function renderCategoriesGrid() {
  const container = document.getElementById('categories-grid');
  if (!container) return;
  const cats = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);
  
  // Excluir categorías configuradas como showOnHome === false (no mostrarlas en los recuadros del inicio)
  const homeCats = cats.filter(c => c.showOnHome !== false);

  container.innerHTML = homeCats.map(cat => {`;

if (appJs.includes(oldRenderHomeCats)) {
  appJs = appJs.replace(oldRenderHomeCats, newRenderHomeCats);
  console.log('app.js renderCategoriesGrid updated with showOnHome filter!');
}

// 2.2 Add dynamic renderCatalogCategoryPills function
const catalogPillsCode = `
// Renderizado dinámico de píldoras de categorías en el Catálogo desde getActiveCategories()
function renderCatalogCategoryPills() {
  const container = document.querySelector('.category-filter-pills');
  if (!container) return;

  const cats = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);
  
  const defaultIcons = {
    all: 'assets/images/icons-cat/cat_todos.svg',
    promos: 'assets/images/icons-cat/cat_promos.svg',
    mates: 'assets/images/icons-cat/cat_mates.svg',
    termos: 'assets/images/icons-cat/cat_termos.svg',
    accesorios: 'assets/images/icons-cat/cat_accesorios.svg',
    yerbas: 'assets/images/icons-cat/cat_yerbas.svg',
    equipos: 'assets/images/icons-cat/cat_equipos.svg'
  };

  let html = \`
    <button class="filter-pill \${state.activeCategory === 'all' ? 'active' : ''}" data-category="all">
      <img src="assets/images/icons-cat/cat_todos.svg" alt="" class="mono-cat-icon-img" /> Todos los Productos
    </button>
  \`;

  cats.forEach(cat => {
    const iconSrc = defaultIcons[cat.id] || 'assets/images/icons-cat/cat_todos.svg';
    const isActive = state.activeCategory === cat.id;
    html += \`
      <button class="filter-pill \${isActive ? 'active' : ''}" data-category="\${cat.id}">
        <img src="\${iconSrc}" alt="" class="mono-cat-icon-img" /> \${cat.name.toUpperCase()}
      </button>
    \`;
  });

  container.innerHTML = html;

  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.getAttribute('data-category');
      setCategoryFilter(cat);
    });
  });
}
`;

if (!appJs.includes('function renderCatalogCategoryPills()')) {
  // Insert before init function or DOMContentLoaded
  appJs = appJs.replace('function setCategoryFilter(categoryId) {', catalogPillsCode + '\nfunction setCategoryFilter(categoryId) {');
  console.log('renderCatalogCategoryPills inserted into app.js!');
}

// Call renderCatalogCategoryPills on DOMContentLoaded if in catalog
if (!appJs.includes('renderCatalogCategoryPills();')) {
  appJs = appJs.replace('// 8. Category Filter Pills', 'renderCatalogCategoryPills();\n  // 8. Category Filter Pills');
  console.log('renderCatalogCategoryPills hooked in DOMContentLoaded!');
}

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('app.js updated successfully!');

