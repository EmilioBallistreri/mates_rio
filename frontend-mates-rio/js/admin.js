/**
 * MATES RÍO - PANEL DE ADMINISTRACIÓN (ADMIN ENGINE)
 * Seguridad, Control de Stock, Métricas de Ventas y Gestión de Pedidos
 */

// ==========================================================================
// 1. CONFIG & CREDENTIALS
// ==========================================================================
const ADMIN_CREDENTIALS = [
  {
    email: "mates.rio6@gmail.com",
    password: "matesriomanavella6",
    name: "Administrador General Mates Río",
    role: "Super Administrador"
  }
];

// Current Admin Session State
let currentAdminUser = null;
let currentActiveSection = 'dashboard';

// Currency Formatter (safe check)
if (typeof formatARS !== 'function') {
  window.formatARS = function(amount) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount).replace('ARS', '$');
  };
}

// Accent-insensitive normalization helper
if (typeof cleanStr !== 'function') {
  window.cleanStr = function(s) {
    return (s || '')
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };
}

// ==========================================================================
// 2. INITIALIZATION & SECURITY CHECK
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initInventoryDB();
  initOrdersDB();
  initUsersDB();
  initDragAndDropZones();
  onCategorySelectChange('new');
  initAdminThemeMode();
  checkAdminSession();
});

// Check if an admin session already exists
function checkAdminSession() {
  const session = sessionStorage.getItem('mates_rio_admin_session') || localStorage.getItem('mates_rio_admin_session');
  let hasValidAdmin = false;

  const isAdminRole = (u) => {
    if (!u) return false;
    const r = (u.role || '').toLowerCase();
    const e = (u.email || '').toLowerCase();
    return r.includes('admin') || e === 'mates.rio6@gmail.com';
  };

  if (session) {
    try {
      const user = JSON.parse(session);
      if (isAdminRole(user)) {
        loginAdminSuccess(user, false);
        hasValidAdmin = true;
      }
    } catch (e) {
      console.error('Session parse error:', e);
    }
  }

  // Also check if user is already logged in as admin in main store session
  if (!hasValidAdmin) {
    try {
      const storeUserStr = localStorage.getItem('mates_rio_user');
      if (storeUserStr) {
        const storeUser = JSON.parse(storeUserStr);
        if (isAdminRole(storeUser)) {
          loginAdminSuccess(storeUser, false);
          hasValidAdmin = true;
        }
      }
    } catch (e) {
      console.error('Store user parse error:', e);
    }
  }

  const isEmbedded = !!document.getElementById('admin-embedded-view');

  if (!hasValidAdmin) {
    if (!isEmbedded) {
      showSecurityGate();
    }
  }

  // Check secret URL hash: index.html#admin
  if (window.location.hash === '#admin') {
    openAdminEmbeddedView();
  }
}

function showSecurityGate() {
  const gate = document.getElementById('admin-gate-screen');
  const app = document.getElementById('admin-app-wrapper');
  if (gate) gate.style.display = 'flex';
  if (app) app.style.display = 'none';
}

function hideSecurityGate() {
  const gate = document.getElementById('admin-gate-screen');
  const app = document.getElementById('admin-app-wrapper');
  if (gate) gate.style.display = 'none';
  if (app) app.style.display = 'flex';
}

// Open Hidden Embedded Admin View inside index.html
function openAdminEmbeddedView() {
  const embedded = document.getElementById('admin-embedded-view');
  if (!embedded) {
    window.location.href = 'admin.html';
    return;
  }

  embedded.classList.add('active');
  document.body.style.overflow = 'hidden';

  const session = sessionStorage.getItem('mates_rio_admin_session') || localStorage.getItem('mates_rio_admin_session');
  if (session) {
    try {
      const user = JSON.parse(session);
      if (user && (user.role === 'admin' || user.role === 'Super Administrador' || user.role === 'Taller & Depósito')) {
        loginAdminSuccess(user, false);
        return;
      }
    } catch (e) {}
  }

  showSecurityGate();
}

// Close Hidden Embedded Admin View
function closeAdminEmbeddedView() {
  const embedded = document.getElementById('admin-embedded-view');
  if (embedded) {
    embedded.classList.remove('active');
    document.body.style.overflow = '';
    if (window.location.hash === '#admin') {
      history.replaceState(null, null, ' ');
    }
  }
}

// Secret click trigger (e.g. 3 rapid clicks on footer copyright or logo)
let secretClickCount = 0;
let secretClickTimer = null;

function handleSecretAdminTrigger() {
  secretClickCount++;
  clearTimeout(secretClickTimer);

  if (secretClickCount >= 3) {
    secretClickCount = 0;
    openAdminEmbeddedView();
    showAdminToast('Portal Secreto Activado: Abriendo Panel Admin', 'fa-key');
  } else {
    secretClickTimer = setTimeout(() => {
      secretClickCount = 0;
    }, 1500);
  }
}

// Secret Keyboard Shortcut: Ctrl + Shift + A
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    openAdminEmbeddedView();
  }
});

// Handle login attempt
function handleAdminLogin(e) {
  e.preventDefault();

  const email = document.getElementById('admin-email')?.value.trim().toLowerCase();
  const password = document.getElementById('admin-password')?.value;
  const errorBox = document.getElementById('admin-error-box');
  const errorText = document.getElementById('admin-error-text');

  if (!email || !password) return;

  // 1. Check in hardcoded admin list
  let found = ADMIN_CREDENTIALS.find(u => u.email.toLowerCase() === email && u.password === password);

  // 2. Check in registered users database (localStorage)
  if (!found) {
    const usersDb = JSON.parse(localStorage.getItem('mates_rio_users_db')) || [];
    const dbUser = usersDb.find(u => u.email.toLowerCase() === email);

    if (dbUser) {
      if (dbUser.password === password) {
        if (dbUser.role === 'admin' || dbUser.role === 'Super Administrador') {
          found = {
            email: dbUser.email,
            name: dbUser.name,
            role: "Super Administrador"
          };
        } else {
          // Security violation: customer tried to access admin panel!
          showGateError('Acceso Denegado: Tu cuenta no posee permisos de administrador. Esta sección es exclusiva para el personal autorizado de Mates Río.');
          logAuditAction('Intento de Acceso No Autorizado', `Cliente ${dbUser.name} (${dbUser.email}) intentó entrar al panel.`);
          return;
        }
      }
    }
  }

  if (found) {
    if (errorBox) errorBox.style.display = 'none';
    loginAdminSuccess(found, true);
  } else {
    showGateError('Credenciales incorrectas. Verificá tu correo y contraseña de administrador.');
  }
}

function showGateError(msg) {
  const errorBox = document.getElementById('admin-error-box');
  const errorText = document.getElementById('admin-error-text');
  if (errorBox && errorText) {
    errorText.textContent = msg;
    errorBox.style.display = 'flex';
    // Shake animation
    const box = document.querySelector('.admin-gate-box');
    box.style.animation = 'none';
    setTimeout(() => {
      box.style.animation = 'gateFadeIn 0.3s ease-out';
    }, 10);
  }
}

function loginAdminSuccess(user, isNewLogin = true) {
  currentAdminUser = user;
  sessionStorage.setItem('mates_rio_admin_session', JSON.stringify(user));
  localStorage.setItem('mates_rio_admin_session', JSON.stringify(user));

  // Update sidebar info
  const nameEl = document.getElementById('sidebar-admin-name');
  const roleEl = document.getElementById('sidebar-admin-role');
  const avatarEl = document.getElementById('sidebar-admin-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();

  hideSecurityGate();

  if (isNewLogin) {
    showAdminToast(`¡Bienvenido al Panel, ${user.name.split(' ')[0]}!`, 'fa-circle-check');
    logAuditAction('Inicio de Sesión', `Usuario ${user.name} (${user.role}) inició sesión en el panel.`);
  }

  // Load all dashboard sections
  refreshDashboardData();
}

function handleAdminLogout() {
  if (confirm('¿Deseás cerrar la sesión administrativa?')) {
    logAuditAction('Cierre de Sesión', `Usuario ${currentAdminUser?.name || 'Admin'} cerró su sesión.`);
    sessionStorage.removeItem('mates_rio_admin_session');
    localStorage.removeItem('mates_rio_admin_session');
    currentAdminUser = null;
    showSecurityGate();
    showAdminToast('Sesión administrativa finalizada correctamente', 'fa-arrow-right-from-bracket');
  }
}

function fillAdminDemo(email, pass) {
  const emailInput = document.getElementById('admin-email');
  const passInput = document.getElementById('admin-password');
  if (emailInput && passInput) {
    emailInput.value = email;
    passInput.value = pass;
    document.getElementById('admin-login-form')?.dispatchEvent(new Event('submit'));
  }
}

function toggleAdminPasswordVisibility() {
  const pwdInput = document.getElementById('admin-password');
  const icon = document.getElementById('pwd-eye-icon');
  if (pwdInput && icon) {
    const isPwd = pwdInput.type === 'password';
    pwdInput.type = isPwd ? 'text' : 'password';
    icon.className = isPwd ? 'fas fa-eye-slash' : 'fas fa-eye';
  }
}

// ==========================================================================
// 3. NAVIGATION & TABS
// ==========================================================================
function switchAdminSection(sectionId) {
  currentActiveSection = sectionId;

  // 1. Sidebar items
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
  });

  // 2. Sections
  document.querySelectorAll('.admin-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const targetSec = document.getElementById(`sec-${sectionId}`);
  if (targetSec) targetSec.classList.add('active');

  // 3. Topbar breadcrumb
  const pageNames = {
    dashboard: 'Dashboard General',
    inventory: 'Control de Inventario & Stock',
    purchases: 'Compras a Proveedores & Costos',
    orders: 'Ventas & Gestión de Pedidos',
    stats: 'Estadísticas & Rendimiento',
    'home-design': 'Diseño & Inicio Web',
    users: 'Clientes & Accesos',
    audit: 'Registro de Actividad'
  };

  const breadcrumb = document.getElementById('topbar-current-page');
  if (breadcrumb) breadcrumb.textContent = pageNames[sectionId] || 'Panel';

  // 4. Refresh section data
  if (sectionId === 'dashboard') refreshDashboardData();
  if (sectionId === 'inventory') renderInventoryTable();
  if (sectionId === 'purchases') renderPurchasesSection();
  if (sectionId === 'orders') renderOrdersTable();
  if (sectionId === 'stats') renderStatsSection();
  if (sectionId === 'home-design') renderHomeDesignSection();
  if (sectionId === 'users') renderUsersTable();
  if (sectionId === 'audit') renderAuditTable();

  // Close mobile sidebar if open
  closeMobileSidebar();
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-sidebar-overlay');
  const isOpen = sidebar?.classList.toggle('sidebar-open');
  if (overlay) overlay.classList.toggle('active', !!isOpen);
}

function closeMobileSidebar() {
  document.getElementById('admin-sidebar')?.classList.remove('sidebar-open');
  document.getElementById('admin-sidebar-overlay')?.classList.remove('active');
}

// Live Clock for Buenos Aires
function initLiveClock() {
  const clockEl = document.getElementById('clock-display');
  function updateTime() {
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// ==========================================================================
// 4. INVENTORY & STOCK ENGINE
// ==========================================================================
function initInventoryDB() {
  let inventory = JSON.parse(localStorage.getItem('mates_rio_inventory'));
  const deletedRaw = localStorage.getItem('mates_rio_deleted_products');
  const deletedIds = new Set(deletedRaw ? (JSON.parse(deletedRaw) || []) : []);

  if (!inventory || Object.keys(inventory).length === 0) {
    inventory = {};
    
    // Seed realistic stock levels based on PRODUCTS_DATA
    if (typeof PRODUCTS_DATA !== 'undefined') {
      const mockStocks = {
        'promo-1': 8,
        'promo-2': 12,
        'promo-3': 3, // Low stock demo!
        'mate-1': 14,
        'mate-2': 9,
        'mate-3': 2, // Low stock demo!
        'mate-4': 6,
        'termo-1': 11,
        'termo-2': 5,
        'termo-3': 0, // Out of stock demo!
        'acc-1': 24,
        'acc-2': 18,
        'acc-3': 15,
        'acc-4': 7,
        'yerba-1': 35,
        'yerba-2': 28,
        'yerba-3': 20,
        'equipo-1': 5,
        'equipo-2': 3, // Low stock demo!
        'equipo-3': 9
      };

      PRODUCTS_DATA.forEach(p => {
        if (deletedIds.has(p.id)) return;
        inventory[p.id] = {
          id: p.id,
          name: p.name,
          category: p.category,
          categoryName: p.categoryName || (p.category ? p.category.toUpperCase() : 'GENERAL'),
          price: p.price,
          originalPrice: p.originalPrice || null,
          image: p.image,
          stock: mockStocks[p.id] !== undefined ? mockStocks[p.id] : 10,
          minStock: 5,
          inStock: (mockStocks[p.id] !== undefined ? mockStocks[p.id] : 10) > 0,
          badge: p.badge || '',
          badgeType: p.badgeType || 'new',
          description: p.description || '',
          isCustom: !!p.isCustom
        };
      });
    }

    localStorage.setItem('mates_rio_inventory', JSON.stringify(inventory));
  } else {
    let changed = false;

    // Quitar del inventario productos que hayan sido eliminados
    deletedIds.forEach(id => {
      if (inventory[id]) {
        delete inventory[id];
        changed = true;
      }
    });

    // Sincronizar productos nuevos o creados por el admin que falten en inventory
    if (typeof PRODUCTS_DATA !== 'undefined') {
      PRODUCTS_DATA.forEach(p => {
        if (deletedIds.has(p.id)) return;
        if (!inventory[p.id]) {
          inventory[p.id] = {
            id: p.id,
            name: p.name,
            category: p.category,
            categoryName: p.categoryName || (p.category ? p.category.toUpperCase() : 'GENERAL'),
            price: p.price,
            originalPrice: p.originalPrice || null,
            image: p.image,
            stock: p.stock !== undefined ? p.stock : 10,
            minStock: p.minStock !== undefined ? p.minStock : 5,
            inStock: (p.stock !== undefined ? p.stock : 10) > 0,
            badge: p.badge || '',
            badgeType: p.badgeType || 'new',
            description: p.description || '',
            isCustom: !!p.isCustom
          };
          changed = true;
        }
      });
    }
    if (changed) {
      localStorage.setItem('mates_rio_inventory', JSON.stringify(inventory));
    }
  }
}

function getInventory() {
  return JSON.parse(localStorage.getItem('mates_rio_inventory')) || {};
}

function saveInventory(inv) {
  localStorage.setItem('mates_rio_inventory', JSON.stringify(inv));
  updateInventoryBadges();
}

function updateInventoryBadges() {
  const inv = getInventory();
  let lowCount = 0;

  Object.values(inv).forEach(p => {
    if (p.stock <= p.minStock) lowCount++;
  });

  const badge = document.getElementById('sidebar-low-stock-badge');
  if (badge) {
    badge.textContent = lowCount;
    badge.style.display = lowCount > 0 ? 'inline-block' : 'none';
  }
}

function renderInventoryTable() {
  const inv = getInventory();
  const tbody = document.getElementById('inventory-table-tbody');
  if (!tbody) return;

  const searchQuery = cleanStr(document.getElementById('inventory-search-input')?.value);
  const catFilter = document.getElementById('inventory-cat-filter')?.value || 'all';
  const stockFilter = document.getElementById('inventory-stock-filter')?.value || 'all';

  let list = Object.values(inv);

  // Filter by category
  if (catFilter !== 'all') {
    list = list.filter(p => p.category.toLowerCase() === catFilter.toLowerCase());
  }

  // Filter by search
  if (searchQuery) {
    list = list.filter(p => cleanStr(p.name).includes(searchQuery) || cleanStr(p.id).includes(searchQuery));
  }

  // Filter by stock status
  if (stockFilter === 'low') {
    list = list.filter(p => p.stock > 0 && p.stock <= p.minStock);
  } else if (stockFilter === 'out') {
    list = list.filter(p => p.stock === 0);
  } else if (stockFilter === 'healthy') {
    list = list.filter(p => p.stock > p.minStock);
  }

  const countLabel = document.getElementById('inventory-count-label');
  if (countLabel) countLabel.textContent = `Mostrando ${list.length} de ${Object.keys(inv).length} productos`;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 36px 14px; color: var(--admin-text-muted);">
          <i class="fas fa-boxes-packing" style="font-size: 2rem; margin-bottom: 8px; opacity: 0.4;"></i>
          <p>No se encontraron productos con los filtros seleccionados.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(item => {
    let stockBadgeClass = 'stock-good';
    let stockBadgeText = 'En Stock';
    let stockIcon = 'fa-check';

    if (item.stock === 0) {
      stockBadgeClass = 'stock-out';
      stockBadgeText = 'Agotado';
      stockIcon = 'fa-circle-xmark';
    } else if (item.stock <= item.minStock) {
      stockBadgeClass = 'stock-low';
      stockBadgeText = `Bajo (${item.stock})`;
      stockIcon = 'fa-triangle-exclamation';
    }

    return `
      <tr>
        <td>
          <div class="product-row-item">
            <img src="${item.image}" alt="${item.name}" class="table-product-thumb" />
            <div class="table-product-info">
              <span class="table-product-name">${item.name} ${item.isCustom ? '<span style="font-size: 0.65rem; background: rgba(197, 155, 39, 0.2); color: #c59b27; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 4px;">NUEVO</span>' : ''}</span>
              <span class="table-product-sku">ID: <code>${item.id}</code></span>
            </div>
          </div>
        </td>
        <td>
          <span class="sidebar-badge badge-info" style="font-size: 0.65rem;">${item.categoryName || item.category.toUpperCase()}</span>
        </td>
        <td>
          <strong style="color: var(--admin-text-main);">${formatARS(item.price)}</strong>
        </td>
        <td>
          <span style="font-size: 0.95rem; font-weight: 800;">${item.stock}</span> un.
        </td>
        <td>
          <span class="badge-stock ${stockBadgeClass}">
            <i class="fas ${stockIcon}"></i> ${stockBadgeText}
          </span>
        </td>
        <td>
          <div class="stock-counter-pill">
            <button type="button" class="stock-btn-step" onclick="quickAdjustStock('${item.id}', -1)" title="Restar 1 unidad">−</button>
            <span class="stock-val-display">${item.stock}</span>
            <button type="button" class="stock-btn-step" onclick="quickAdjustStock('${item.id}', 1)" title="Sumar 1 unidad">+</button>
          </div>
        </td>
        <td>
          <div class="action-btn-cell">
            <button type="button" class="btn-table-action btn-action-edit" onclick="openEditProductModal('${item.id}')" title="Editar Producto">
              <i class="fas fa-pen"></i>
            </button>
            <button type="button" class="btn-table-action" onclick="quickAdjustStock('${item.id}', 10)" title="Reabastecer +10">
              <i class="fas fa-truck-ramp-box"></i>
            </button>
            <button type="button" class="btn-table-action btn-action-delete" onclick="deleteProduct('${item.id}')" title="Eliminar Producto del Catálogo">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterInventoryTable() {
  renderInventoryTable();
}

function quickAdjustStock(productId, delta) {
  const inv = getInventory();
  if (!inv[productId]) return;

  const oldStock = inv[productId].stock;
  inv[productId].stock = Math.max(0, inv[productId].stock + delta);
  inv[productId].inStock = inv[productId].stock > 0;
  saveInventory(inv);

  renderInventoryTable();
  updateKPIs();

  logAuditAction('Ajuste Rápido de Stock', `${inv[productId].name}: ${oldStock} → ${inv[productId].stock} unidades.`);
  showAdminToast(`Stock de "${inv[productId].name}" actualizado a ${inv[productId].stock} un.`);
}

// ==========================================================================
// 4.0 PRODUCT MULTI-IMAGE & SUBCATEGORY HELPERS
// ==========================================================================
let uploadedImagesNew = [];
let uploadedImagesEdit = [];

function onCategorySelectChange(mode) {
  const catSelect = document.getElementById(mode === 'edit' ? 'edit-prod-category' : 'new-prod-category');
  const subcatSelect = document.getElementById(mode === 'edit' ? 'edit-prod-subcategory' : 'new-prod-subcategory');
  if (!catSelect || !subcatSelect) return;

  const catId = catSelect.value;
  const categories = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);
  const foundCat = categories.find(c => c.id === catId);
  const subcats = (foundCat && foundCat.subcategories && foundCat.subcategories.length > 0)
    ? foundCat.subcategories
    : ['General'];

  subcatSelect.innerHTML = subcats.map(sc => `<option value="${sc}">${sc}</option>`).join('');
}

function handleProductFilesSelect(event, mode) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const targetList = mode === 'edit' ? uploadedImagesEdit : uploadedImagesNew;

  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      targetList.push(e.target.result);
      renderUploadedImagesPreview(mode);
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

function renderUploadedImagesPreview(mode) {
  const container = document.getElementById(mode === 'edit' ? 'edit-prod-preview-grid' : 'new-prod-preview-grid');
  if (!container) return;

  const list = mode === 'edit' ? uploadedImagesEdit : uploadedImagesNew;
  if (list.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; font-size: 0.8rem; color: var(--admin-text-muted); text-align: center; margin: 6px 0;">Sin imágenes adicionales cargadas aún.</p>';
    return;
  }

  container.innerHTML = list.map((imgSrc, idx) => `
    <div class="preview-thumb-card ${idx === 0 ? 'is-primary' : ''}">
      <img src="${imgSrc}" alt="Foto ${idx + 1}" />
      ${idx === 0 ? '<span class="thumb-badge-primary">Portada</span>' : ''}
      <button type="button" class="btn-remove-thumb" onclick="removeUploadedImage('${mode}', ${idx})" title="Eliminar foto">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');

  if (mode === 'edit') {
    const previewThumb = document.getElementById('edit-prod-preview-thumb');
    if (previewThumb && list.length > 0) previewThumb.src = list[0];
  }
}

function removeUploadedImage(mode, idx) {
  if (mode === 'edit') {
    uploadedImagesEdit.splice(idx, 1);
    renderUploadedImagesPreview('edit');
  } else {
    uploadedImagesNew.splice(idx, 1);
    renderUploadedImagesPreview('new');
  }
}

function initDragAndDropZones() {
  ['new', 'edit'].forEach(mode => {
    const dropzone = document.getElementById(mode === 'new' ? 'new-prod-dropzone' : 'edit-prod-dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt ? dt.files : null;
      if (files && files.length > 0) {
        handleProductFilesSelect({ target: { files: files, value: '' } }, mode);
      }
    }, false);
  });
}

function openEditProductModal(productId) {
  const inv = getInventory();
  let prod = inv[productId];

  // Si no está en inventario, buscar en PRODUCTS_DATA
  if (!prod && typeof PRODUCTS_DATA !== 'undefined') {
    const p = PRODUCTS_DATA.find(x => x.id === productId);
    if (p) {
      prod = {
        id: p.id,
        name: p.name,
        category: p.category,
        categoryName: p.categoryName || (p.category ? p.category.toUpperCase() : 'GENERAL'),
        subcategory: p.subcategory || '',
        price: p.price,
        originalPrice: p.originalPrice || null,
        stock: p.stock !== undefined ? p.stock : 10,
        minStock: p.minStock || 5,
        image: p.image || 'assets/images/prod_mate_imperial.jpg',
        images: Array.isArray(p.images) ? p.images : [p.image || 'assets/images/prod_mate_imperial.jpg'],
        badge: p.badge || '',
        badgeType: p.badgeType || 'new',
        description: p.description || '',
        specs: p.specs || {}
      };
    }
  }

  if (!prod) return;

  const idEl = document.getElementById('edit-product-id');
  if (idEl) idEl.value = prod.id;

  const skuEl = document.getElementById('edit-prod-sku-display');
  if (skuEl) skuEl.textContent = `ID: ${prod.id}`;

  const catBadgeEl = document.getElementById('edit-prod-cat-badge');
  if (catBadgeEl) catBadgeEl.textContent = prod.categoryName || (prod.category ? prod.category.toUpperCase() : 'PRODUCTO');

  const titleEl = document.getElementById('edit-prod-preview-title');
  if (titleEl) titleEl.textContent = prod.name;

  const pricePreviewEl = document.getElementById('edit-prod-preview-price');
  if (pricePreviewEl) pricePreviewEl.textContent = formatARS(prod.price);

  const thumbEl = document.getElementById('edit-prod-preview-thumb');
  if (thumbEl) thumbEl.src = prod.image || 'assets/images/prod_mate_imperial.jpg';

  const nameEl = document.getElementById('edit-prod-name');
  if (nameEl) nameEl.value = prod.name;

  const catEl = document.getElementById('edit-prod-category');
  if (catEl) {
    catEl.value = prod.category || 'mates';
    onCategorySelectChange('edit');
  }

  const subcatEl = document.getElementById('edit-prod-subcategory');
  if (subcatEl && prod.subcategory) {
    let exists = Array.from(subcatEl.options).some(o => o.value === prod.subcategory);
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = prod.subcategory;
      opt.textContent = prod.subcategory;
      subcatEl.appendChild(opt);
    }
    subcatEl.value = prod.subcategory;
  }

  const priceEl = document.getElementById('edit-prod-price');
  if (priceEl) priceEl.value = prod.price;

  const origPriceEl = document.getElementById('edit-prod-orig-price');
  if (origPriceEl) origPriceEl.value = prod.originalPrice || '';

  const badgeEl = document.getElementById('edit-prod-badge');
  if (badgeEl) badgeEl.value = prod.badge || '';

  const badgeTypeEl = document.getElementById('edit-prod-badge-type');
  if (badgeTypeEl) badgeTypeEl.value = prod.badgeType || 'new';

  const stockEl = document.getElementById('edit-prod-stock');
  if (stockEl) stockEl.value = prod.stock !== undefined ? prod.stock : 10;

  const minStockEl = document.getElementById('edit-prod-min-stock');
  if (minStockEl) minStockEl.value = prod.minStock !== undefined ? prod.minStock : 5;

  // Cargar lista de imágenes
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    uploadedImagesEdit = [...prod.images];
  } else if (prod.image) {
    uploadedImagesEdit = [prod.image];
  } else {
    uploadedImagesEdit = ['assets/images/prod_mate_imperial.jpg'];
  }
  renderUploadedImagesPreview('edit');

  // Descripción y specs
  let fullProd = (typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA.find(p => p.id === prod.id) : null) || prod;
  const descEl = document.getElementById('edit-prod-desc');
  if (descEl) descEl.value = fullProd.description || prod.description || '';

  const specMatEl = document.getElementById('edit-prod-spec-material');
  if (specMatEl) specMatEl.value = (fullProd.specs && fullProd.specs.material) || '';

  const specVirEl = document.getElementById('edit-prod-spec-virola');
  if (specVirEl) specVirEl.value = (fullProd.specs && fullProd.specs.virola) || '';

  const specExtraEl = document.getElementById('edit-prod-spec-extra');
  if (specExtraEl) specExtraEl.value = (fullProd.specs && (fullProd.specs.garantia || fullProd.specs.extra)) || '';

  const modal = document.getElementById('edit-product-modal');
  if (modal) modal.classList.add('active');
}

function closeEditProductModal() {
  const modal = document.getElementById('edit-product-modal');
  if (modal) modal.classList.remove('active');
}

function deleteProductFromModal() {
  const id = document.getElementById('edit-product-id')?.value;
  if (id) deleteProduct(id);
}

function saveProductEdits() {
  const id = document.getElementById('edit-product-id')?.value;
  if (!id) return;

  const name = document.getElementById('edit-prod-name')?.value.trim();
  const category = document.getElementById('edit-prod-category')?.value;
  const subcategory = document.getElementById('edit-prod-subcategory')?.value || '';
  const price = parseInt(document.getElementById('edit-prod-price')?.value, 10);
  const origPriceVal = document.getElementById('edit-prod-orig-price')?.value;
  const origPrice = origPriceVal ? parseInt(origPriceVal, 10) : null;
  const badge = document.getElementById('edit-prod-badge')?.value.trim();
  const badgeType = document.getElementById('edit-prod-badge-type')?.value || 'new';
  const stock = parseInt(document.getElementById('edit-prod-stock')?.value, 10);
  const minStock = parseInt(document.getElementById('edit-prod-min-stock')?.value, 10) || 5;

  const mainImage = uploadedImagesEdit.length > 0 ? uploadedImagesEdit[0] : 'assets/images/prod_mate_imperial.jpg';
  const allImages = uploadedImagesEdit.length > 0 ? [...uploadedImagesEdit] : [mainImage];

  const desc = document.getElementById('edit-prod-desc')?.value.trim();
  const specMaterial = document.getElementById('edit-prod-spec-material')?.value.trim();
  const specVirola = document.getElementById('edit-prod-spec-virola')?.value.trim();
  const specExtra = document.getElementById('edit-prod-spec-extra')?.value.trim();

  if (!name || !category || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
    alert('Por favor completá los campos obligatorios con valores válidos (Nombre, Categoría, Precio y Stock).');
    return;
  }

  const catNamesMap = {
    'mates': 'MATES',
    'promos': 'PROMOS',
    'termos': 'TERMOS',
    'accesorios': 'ACCESORIOS',
    'yerbas': 'YERBAS',
    'equipos': 'EQUIPOS DE MATE'
  };
  const categoryName = catNamesMap[category] || category.toUpperCase();

  const inv = getInventory();
  if (!inv[id]) {
    inv[id] = { id: id };
  }

  inv[id].name = name;
  inv[id].category = category;
  inv[id].categoryName = categoryName;
  inv[id].subcategory = subcategory;
  inv[id].price = price;
  inv[id].originalPrice = origPrice;
  inv[id].stock = stock;
  inv[id].minStock = minStock;
  inv[id].inStock = stock > 0;
  inv[id].image = mainImage;
  inv[id].images = allImages;
  inv[id].badge = badge;
  inv[id].badgeType = badgeType;
  inv[id].description = desc;

  saveInventory(inv);

  // Guardar en mates_rio_edited_products para persistir cambios en todo el sitio
  try {
    let edited = JSON.parse(localStorage.getItem('mates_rio_edited_products') || '{}');
    edited[id] = {
      name,
      category,
      categoryName,
      subcategory,
      price,
      originalPrice,
      stock,
      minStock,
      inStock: stock > 0,
      image: mainImage,
      images: allImages,
      badge,
      badgeType,
      description: desc,
      specs: {
        material: specMaterial || 'Material artesanal de primera calidad',
        virola: specVirola || 'Terminación artesanal',
        garantia: specExtra || 'Garantía artesanal Mates Río'
      }
    };
    localStorage.setItem('mates_rio_edited_products', JSON.stringify(edited));
  } catch (e) {
    console.warn('Error al guardar producto editado:', e);
  }

  // Actualizar en custom products si aplica
  try {
    let customProducts = JSON.parse(localStorage.getItem('mates_rio_custom_products')) || [];
    const cp = customProducts.find(x => x.id === id);
    if (cp) {
      cp.name = name;
      cp.category = category;
      cp.categoryName = categoryName;
      cp.subcategory = subcategory;
      cp.price = price;
      cp.originalPrice = origPrice;
      cp.stock = stock;
      cp.minStock = minStock;
      cp.inStock = stock > 0;
      cp.image = mainImage;
      cp.images = allImages;
      cp.badge = badge;
      cp.badgeType = badgeType;
      cp.description = desc;
      if (!cp.specs) cp.specs = {};
      if (specMaterial) cp.specs.material = specMaterial;
      if (specVirola) cp.specs.virola = specVirola;
      if (specExtra) cp.specs.garantia = specExtra;
      localStorage.setItem('mates_rio_custom_products', JSON.stringify(customProducts));
    }
  } catch (e) {}

  // Sincronizar en memoria PRODUCTS_DATA
  if (typeof PRODUCTS_DATA !== 'undefined') {
    const p = PRODUCTS_DATA.find(x => x.id === id);
    if (p) {
      p.name = name;
      p.category = category;
      p.categoryName = categoryName;
      p.subcategory = subcategory;
      p.price = price;
      p.originalPrice = origPrice;
      p.stock = stock;
      p.minStock = minStock;
      p.inStock = stock > 0;
      p.image = mainImage;
      p.images = allImages;
      p.badge = badge;
      p.badgeType = badgeType;
      if (desc) p.description = desc;
      if (!p.specs) p.specs = {};
      if (specMaterial) p.specs.material = specMaterial;
      if (specVirola) p.specs.virola = specVirola;
      if (specExtra) p.specs.garantia = specExtra;
    }
  }

  closeEditProductModal();
  renderInventoryTable();
  updateKPIs();

  if (typeof renderProducts === 'function') {
    renderProducts();
  }
  if (typeof renderCategoriesGrid === 'function') {
    renderCategoriesGrid();
  }

  logAuditAction('Edición de Producto', `Producto "${name}" actualizado: ${formatARS(price)}, Stock: ${stock} un.`);
  showAdminToast(`¡"${name}" actualizado exitosamente!`, 'fa-circle-check');
}

function restockAllProducts(qty = 10) {
  if (confirm(`¿Deseás sumar +${qty} unidades a todos los productos con stock bajo o agotados?`)) {
    const inv = getInventory();
    let count = 0;

    Object.values(inv).forEach(p => {
      if (p.stock <= p.minStock) {
        p.stock += qty;
        p.inStock = true;
        count++;
      }
    });

    saveInventory(inv);
    renderInventoryTable();
    updateKPIs();

    logAuditAction('Reabastecimiento Masivo', `Se sumaron +${qty} unidades a ${count} productos en alerta.`);
    showAdminToast(`¡Reabastecimiento masivo aplicado a ${count} productos!`, 'fa-boxes-packing');
  }
}

// ==========================================================================
// 4.1 PRODUCT CREATION & DELETION (ADMIN ENGINE)
// ==========================================================================
function openCreateProductModal() {
  const modal = document.getElementById('create-product-modal');
  if (!modal) return;

  const form = document.getElementById('new-product-form');
  if (form) form.reset();

  uploadedImagesNew = [];
  renderUploadedImagesPreview('new');
  onCategorySelectChange('new');

  modal.classList.add('active');
}

function closeCreateProductModal() {
  const modal = document.getElementById('create-product-modal');
  if (modal) modal.classList.remove('active');
}

function handleCreateProduct() {
  const name = document.getElementById('new-prod-name')?.value.trim();
  const category = document.getElementById('new-prod-category')?.value;
  const subcategory = document.getElementById('new-prod-subcategory')?.value || '';
  const price = parseInt(document.getElementById('new-prod-price')?.value, 10);
  const origPriceVal = document.getElementById('new-prod-orig-price')?.value;
  const origPrice = origPriceVal ? parseInt(origPriceVal, 10) : null;
  const badge = document.getElementById('new-prod-badge')?.value.trim();
  const badgeType = document.getElementById('new-prod-badge-type')?.value || 'new';

  const mainImage = uploadedImagesNew.length > 0 ? uploadedImagesNew[0] : 'assets/images/prod_mate_imperial.jpg';
  const allImages = uploadedImagesNew.length > 0 ? [...uploadedImagesNew] : [mainImage];

  const desc = document.getElementById('new-prod-desc')?.value.trim();
  const specMaterial = document.getElementById('new-prod-spec-material')?.value.trim();
  const specVirola = document.getElementById('new-prod-spec-virola')?.value.trim();
  const specExtra = document.getElementById('new-prod-spec-extra')?.value.trim();
  const stock = parseInt(document.getElementById('new-prod-stock')?.value, 10);
  const minStock = parseInt(document.getElementById('new-prod-min-stock')?.value, 10) || 5;

  if (!name || !category || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0 || !desc) {
    alert('Por favor completá todos los campos obligatorios con valores válidos (Nombre, Categoría, Precio, Stock y Descripción).');
    return;
  }

  const prodId = `prod-custom-${Date.now()}`;
  const catNamesMap = {
    'mates': 'MATES',
    'promos': 'PROMOS',
    'termos': 'TERMOS',
    'accesorios': 'ACCESORIOS',
    'yerbas': 'YERBAS',
    'equipos': 'EQUIPOS DE MATE'
  };

  const newProduct = {
    id: prodId,
    name: name,
    category: category,
    categoryName: catNamesMap[category] || category.toUpperCase(),
    subcategory: subcategory,
    price: price,
    originalPrice: origPrice && origPrice > price ? origPrice : null,
    badge: badge || (origPrice && origPrice > price ? 'OFERTA' : 'NUEVO'),
    badgeType: badgeType,
    image: mainImage,
    images: allImages,
    description: desc,
    specs: {
      material: specMaterial || 'Material artesanal de primera calidad',
      virola: specVirola || 'Terminación artesanal',
      garantia: specExtra || 'Garantía artesanal Mates Río'
    },
    inStock: stock > 0,
    isCustom: true
  };

  // 1. Guardar en localStorage custom products
  let customProducts = [];
  try {
    const raw = localStorage.getItem('mates_rio_custom_products');
    if (raw) customProducts = JSON.parse(raw) || [];
  } catch (e) {
    customProducts = [];
  }
  customProducts.push(newProduct);
  localStorage.setItem('mates_rio_custom_products', JSON.stringify(customProducts));

  // 2. Insertar en tiempo de ejecución en PRODUCTS_DATA
  if (typeof PRODUCTS_DATA !== 'undefined' && !PRODUCTS_DATA.some(p => p.id === newProduct.id)) {
    PRODUCTS_DATA.push(newProduct);
  }

  // 3. Registrar en base de datos de inventario
  const inv = getInventory();
  inv[newProduct.id] = {
    id: newProduct.id,
    name: newProduct.name,
    category: newProduct.category,
    categoryName: newProduct.categoryName,
    subcategory: newProduct.subcategory,
    price: newProduct.price,
    image: newProduct.image,
    images: newProduct.images,
    stock: stock,
    minStock: minStock,
    inStock: stock > 0,
    isCustom: true
  };
  saveInventory(inv);

  // 4. Actualizar interfaz
  closeCreateProductModal();
  renderInventoryTable();
  updateKPIs();

  if (typeof renderProducts === 'function') {
    renderProducts();
  }
  if (typeof renderCategoriesGrid === 'function') {
    renderCategoriesGrid();
  }

  logAuditAction('Carga de Producto', `Nuevo producto creado: "${newProduct.name}" (${newProduct.categoryName} - ${subcategory || 'General'}) con ${stock} un.`);
  showAdminToast(`¡"${newProduct.name}" publicado exitosamente!`, 'fa-circle-check');
}

function deleteProduct(productId) {
  const inv = getInventory();
  const prod = inv[productId] || (typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA.find(p => p.id === productId) : null);
  const prodName = prod ? prod.name : productId;

  if (!confirm(`¿Estás seguro de que deseás eliminar permanentemente "${prodName}" del catálogo y del inventario? Esta acción no se puede deshacer.`)) {
    return;
  }

  // 1. Agregar a lista de productos eliminados para que no vuelva a cargarse
  try {
    let deleted = JSON.parse(localStorage.getItem('mates_rio_deleted_products') || '[]');
    if (!deleted.includes(productId)) {
      deleted.push(productId);
      localStorage.setItem('mates_rio_deleted_products', JSON.stringify(deleted));
    }
  } catch (e) {
    console.warn('Error al guardar producto eliminado:', e);
  }

  // 2. Eliminar de custom products en localStorage
  try {
    let customProducts = JSON.parse(localStorage.getItem('mates_rio_custom_products')) || [];
    customProducts = customProducts.filter(p => p.id !== productId);
    localStorage.setItem('mates_rio_custom_products', JSON.stringify(customProducts));
  } catch (e) {
    console.warn('Error al actualizar custom products:', e);
  }

  // 3. Eliminar de edited products en localStorage si existía
  try {
    let edited = JSON.parse(localStorage.getItem('mates_rio_edited_products') || '{}');
    if (edited[productId]) {
      delete edited[productId];
      localStorage.setItem('mates_rio_edited_products', JSON.stringify(edited));
    }
  } catch (e) {}

  // 4. Eliminar de PRODUCTS_DATA en memoria
  if (typeof PRODUCTS_DATA !== 'undefined') {
    const idx = PRODUCTS_DATA.findIndex(p => p.id === productId);
    if (idx !== -1) {
      PRODUCTS_DATA.splice(idx, 1);
    }
  }

  // 5. Eliminar de inventario
  delete inv[productId];
  saveInventory(inv);

  // 6. Cerrar modal de edición si estaba abierto
  closeEditProductModal();

  // 7. Actualizar vistas y KPIs
  renderInventoryTable();
  updateKPIs();

  if (typeof renderProducts === 'function') {
    renderProducts();
  }
  if (typeof renderCategoriesGrid === 'function') {
    renderCategoriesGrid();
  }

  logAuditAction('Eliminación de Producto', `Producto "${prodName}" eliminado permanentemente del catálogo.`);
  showAdminToast(`Producto "${prodName}" eliminado del catálogo`, 'fa-trash-alt');
}

function deleteProductFromModal() {
  const id = document.getElementById('edit-product-id')?.value;
  if (id) {
    deleteProduct(id);
  }
}

// Compatibilidad con llamadas previas a deleteCustomProduct
function deleteCustomProduct(productId) {
  deleteProduct(productId);
}

// ==========================================================================
// 5. SALES & ORDERS MANAGEMENT
// ==========================================================================
function initOrdersDB() {
  let orders = JSON.parse(localStorage.getItem('mates_rio_orders'));

  if (!orders || orders.length === 0) {
    orders = [
      {
        id: "RIO-9847",
        date: "26/09/2026",
        customerName: "Gonzalo Herrera",
        customerPhone: "1165432109",
        customerEmail: "gonzalo.h@gmail.com",
        items: "1x Mochila Matera Cuero Genuino Suela con Separadores",
        total: 89900,
        status: "Entregado",
        address: "Av. Cabildo 2400, CABA",
        paymentMethod: "transferencia",
        hasCustomEngraving: false
      },
      {
        id: "RIO-9846",
        date: "25/09/2026",
        customerName: "Valentina Rossi",
        customerPhone: "1143219876",
        customerEmail: "valen_rossi@hotmail.com",
        items: "1x Set Matero Camionero Marrón + Matera de Cuero Vacuno",
        total: 72500,
        status: "Enviado",
        address: "Calle 14 Nº 580, La Plata",
        paymentMethod: "tarjeta",
        hasCustomEngraving: false
      },
      {
        id: "RIO-9845",
        date: "25/09/2026",
        customerName: "Lucas Benítez",
        customerPhone: "1123456789",
        customerEmail: "lucasb@yahoo.com.ar",
        items: "1x Termo Media Manija Cuero Acero Inoxidable 1L",
        total: 42900,
        status: "Confirmado - En preparación artesanal",
        address: "San Martín 820, Rosario",
        paymentMethod: "transferencia",
        hasCustomEngraving: false
      },
      {
        id: "RIO-9844",
        date: "24/09/2026",
        customerName: "Marcos Di Palma",
        customerPhone: "1198765432",
        customerEmail: "marcos_dip@gmail.com",
        items: "1x Mate Imperial Deluxe Base Esculpida Alpaca 100%",
        total: 52000,
        status: "Enviado",
        address: "Belgrano 110, Arrecifes",
        paymentMethod: "tarjeta",
        hasCustomEngraving: true,
        engravingDetails: {
          text: "ESCUDO AFA 3 ESTRELLAS",
          technique: "Grabado Láser HD",
          font: "Gauchesca Criolla",
          location: "Frente Centrado"
        }
      },
      {
        id: "RIO-9843",
        date: "23/09/2026",
        customerName: "Sofía Albarracín",
        customerPhone: "1133445566",
        customerEmail: "sofia_albarracin@gmail.com",
        items: "1x Combo Río Imperial Black + Termo 1L + Bombilla Alpaca",
        total: 84900,
        status: "Confirmado - En preparación artesanal",
        address: "Corrientes 1540, CABA",
        paymentMethod: "transferencia",
        hasCustomEngraving: true,
        engravingDetails: {
          text: "SOFÍA & TEO",
          technique: "Cincelado Orfebre",
          font: "Cursiva Elegante",
          location: "Frente y Dorso"
        }
      },
      {
        id: "RIO-9842",
        date: "20/09/2026",
        customerName: "Juan Matero",
        customerPhone: "1155554444",
        customerEmail: "juan@ejemplo.com",
        items: "1x Mate Imperial Artesanal Cuero Negro, 1x Bombilla Alpaca Maciza",
        total: 63400,
        status: "Entregado",
        address: "Av. Libertador 4200, CABA",
        paymentMethod: "transferencia",
        hasCustomEngraving: false
      }
    ];

    localStorage.setItem('mates_rio_orders', JSON.stringify(orders));
  }
}

function getOrders() {
  return JSON.parse(localStorage.getItem('mates_rio_orders')) || [];
}

function saveOrders(orders) {
  localStorage.setItem('mates_rio_orders', JSON.stringify(orders));
  updateOrdersBadge();
}

function updateOrdersBadge() {
  const orders = getOrders();
  const activeOrders = orders.filter(o => o.status.includes('preparación') || o.status.includes('Confirmado')).length;

  const badge = document.getElementById('sidebar-orders-badge');
  if (badge) {
    badge.textContent = activeOrders;
    badge.style.display = activeOrders > 0 ? 'inline-block' : 'none';
  }
}

function renderOrdersTable() {
  const orders = getOrders();
  const tbody = document.getElementById('orders-table-tbody');
  if (!tbody) return;

  const search = cleanStr(document.getElementById('orders-search-input')?.value);
  const statusFilter = document.getElementById('orders-status-filter')?.value || 'all';

  let list = [...orders];

  if (search) {
    list = list.filter(o => 
      cleanStr(o.id).includes(search) || 
      (o.customerName && cleanStr(o.customerName).includes(search)) ||
      (o.items && cleanStr(o.items).includes(search))
    );
  }

  if (statusFilter === 'prep') {
    list = list.filter(o => o.status.includes('preparación') || o.status.includes('Confirmado'));
  } else if (statusFilter === 'shipped') {
    list = list.filter(o => o.status.toLowerCase().includes('enviado') || o.status.toLowerCase().includes('despachado'));
  } else if (statusFilter === 'delivered') {
    list = list.filter(o => o.status.toLowerCase().includes('entregado'));
  } else if (statusFilter === 'cancelled') {
    list = list.filter(o => o.status.toLowerCase().includes('cancelado'));
  }

  const countLabel = document.getElementById('orders-count-label');
  if (countLabel) countLabel.textContent = `Total: ${list.length} de ${orders.length} pedidos`;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 36px 14px; color: var(--admin-text-muted);">
          <i class="fas fa-receipt" style="font-size: 2rem; margin-bottom: 8px; opacity: 0.4;"></i>
          <p>No se encontraron pedidos con el criterio seleccionado.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(order => {
    let statusClass = 'status-prep';
    if (order.status.toLowerCase().includes('enviado') || order.status.toLowerCase().includes('despachado')) {
      statusClass = 'status-shipped';
    } else if (order.status.toLowerCase().includes('entregado')) {
      statusClass = 'status-delivered';
    } else if (order.status.toLowerCase().includes('cancelado')) {
      statusClass = 'status-cancelled';
    }

    const payLabel = order.paymentMethod === 'transferencia' 
      ? '<span style="display:inline-block;">🏦 Transferencia</span> <span style="display:inline-block; font-size:0.67rem; color:var(--admin-gold); font-weight:700;">(10% OFF)</span>' 
      : '💳 Tarjeta de Crédito';

    return `
      <tr>
        <td class="col-order-id">
          <strong style="color: var(--admin-leather); font-family: var(--font-heading);">${order.id}</strong>
        </td>
        <td class="col-order-date" style="color: var(--admin-text-muted); font-size: 0.74rem;">${order.date}</td>
        <td class="col-order-customer">
          <div style="font-weight: 700; color: var(--admin-text-main); font-size: 0.8rem; line-height: 1.25;">${order.customerName || 'Cliente Web'}</div>
          <div style="font-size: 0.68rem; color: var(--admin-text-muted); margin-top: 2px;">${order.customerPhone || '-'}</div>
        </td>
        <td class="col-order-items">
          <div class="order-items-summary">${order.items}</div>
          ${order.hasCustomEngraving ? `<span class="engraving-tag"><i class="fas fa-magic"></i> Grabado</span>` : ''}
        </td>
        <td class="col-order-total">
          <strong style="font-size: 0.92rem; color: var(--admin-text-main);">${formatARS(order.total)}</strong>
        </td>
        <td class="col-order-payment">${payLabel}</td>
        <td class="col-order-status">
          <select class="order-status-select ${statusClass}" onchange="changeOrderStatus('${order.id}', this.value)" title="Cambiar estado del pedido">
            <option value="Confirmado - En preparación artesanal" ${order.status.includes('preparación') ? 'selected' : ''}>⏳ En Taller / Prep.</option>
            <option value="Enviado" ${order.status === 'Enviado' ? 'selected' : ''}>🚚 Despachado</option>
            <option value="Entregado" ${order.status === 'Entregado' ? 'selected' : ''}>✅ Entregado</option>
            <option value="Cancelado" ${order.status === 'Cancelado' ? 'selected' : ''}>❌ Cancelado</option>
          </select>
        </td>
        <td class="col-order-actions">
          <div class="action-btn-cell">
            <button type="button" class="btn-table-action" onclick="openOrderDetailModal('${order.id}')" title="Ver Detalle / Remito">
              <i class="fas fa-eye"></i>
            </button>
            <button type="button" class="btn-table-action" onclick="contactCustomerWhatsApp('${order.customerPhone || '5493513830111'}', '${order.id}', '${order.customerName || 'Cliente'}', '${order.status}')" title="Contactar por WhatsApp">
              <i class="fab fa-whatsapp" style="color: #27ae60;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterOrdersTable() {
  renderOrdersTable();
}

function changeOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const oldStatus = order.status;
  order.status = newStatus;
  saveOrders(orders);

  renderOrdersTable();
  renderDashboardRecentOrders();
  updateKPIs();

  logAuditAction('Cambio de Estado de Pedido', `Pedido ${orderId}: "${oldStatus}" → "${newStatus}".`);
  showAdminToast(`Pedido #${orderId} actualizado a "${newStatus}"`, 'fa-rotate');
}

function openOrderDetailModal(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const body = document.getElementById('order-detail-modal-body');
  if (!body) return;

  const payLabel = order.paymentMethod === 'transferencia' ? 'Transferencia Bancaria Directa (-10% OFF aplicado)' : 'Tarjeta de Crédito / Débito (3 Cuotas)';

  body.innerHTML = `
    <div style="background: #faf8f5; border: 1.5px solid var(--admin-border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--admin-leather);">${order.id}</span>
        <span class="badge-stock stock-good" style="font-size: 0.75rem;">${order.status}</span>
      </div>
      <div style="font-size: 0.78rem; color: var(--admin-text-muted);">Fecha de Emisión: <b>${order.date}</b></div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
      <div style="background: var(--admin-bg-main); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--admin-border);">
        <strong style="display: block; font-size: 0.78rem; color: var(--admin-leather); margin-bottom: 4px;">Datos del Cliente</strong>
        <div style="font-size: 0.84rem; font-weight: 700;">${order.customerName || 'Cliente de la Tienda'}</div>
        <div style="font-size: 0.74rem; color: var(--admin-text-muted);"><i class="fas fa-phone"></i> ${order.customerPhone || 'Sin teléfono'}</div>
        <div style="font-size: 0.74rem; color: var(--admin-text-muted);"><i class="fas fa-envelope"></i> ${order.customerEmail || 'Sin email'}</div>
      </div>

      <div style="background: var(--admin-bg-main); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--admin-border);">
        <strong style="display: block; font-size: 0.78rem; color: var(--admin-leather); margin-bottom: 4px;">Envío & Entrega</strong>
        <div style="font-size: 0.82rem; font-weight: 700;"><i class="fas fa-location-dot" style="color: var(--admin-gold);"></i> ${order.address || 'Taller Río Ceballos, Córdoba'}</div>
        <div style="font-size: 0.74rem; color: var(--admin-text-muted); margin-top: 4px;">Método de Pago: <b>${payLabel}</b></div>
      </div>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 0.88rem; font-weight: 800; margin-bottom: 8px;">Artículos incluidos en el remito:</h4>
      <div style="background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--radius-sm); padding: 12px; font-size: 0.84rem; line-height: 1.5;">
        ${order.items}
      </div>
    </div>

    ${order.hasCustomEngraving && order.engravingDetails ? `
      <div style="background: #fdfaf2; border: 1.5px solid var(--admin-gold); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <i class="fas fa-magic" style="color: var(--admin-gold); font-size: 1.1rem;"></i>
          <strong style="color: var(--admin-leather); font-size: 0.9rem;">Instrucciones para el Taller de Grabado en Virola:</strong>
        </div>
        <ul style="font-size: 0.8rem; list-style: none; padding-left: 0; line-height: 1.6;">
          ${order.engravingDetails.text ? `<li>• <b>Texto a Grabar:</b> <span style="font-family: monospace; background: #fff; padding: 2px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem; font-weight: bold;">"${order.engravingDetails.text}"</span></li>` : ''}
          ${order.engravingDetails.technique ? `<li>• <b>Técnica en Virola:</b> ${order.engravingDetails.technique}</li>` : ''}
          ${order.engravingDetails.metalFinish ? `<li>• <b>Terminación Virola:</b> ${order.engravingDetails.metalFinish}</li>` : ''}
          ${order.engravingDetails.font ? `<li>• <b>Tipografía:</b> ${order.engravingDetails.font}</li>` : ''}
          ${order.engravingDetails.guarda && order.engravingDetails.guarda !== 'Sin guarda' && order.engravingDetails.guarda !== 'Lisa' ? `<li>• <b>Guarda Perimetral:</b> ${order.engravingDetails.guarda}</li>` : ''}
          ${order.engravingDetails.location ? `<li>• <b>Ubicación:</b> ${order.engravingDetails.location}</li>` : ''}
          ${order.engravingDetails.uploadedFile ? `<li>• <b>Archivo Adjunto:</b> <code>${order.engravingDetails.uploadedFile}</code></li>` : ''}
          ${order.engravingDetails.notes ? `<li>• <b>Notas del Cliente:</b> <em>"${order.engravingDetails.notes}"</em></li>` : ''}
        </ul>
      </div>
    ` : ''}

    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: #faf8f5; border-radius: var(--radius-sm); border: 1px solid var(--admin-border);">
      <span style="font-weight: 700;">Monto Total Facturado:</span>
      <strong style="font-size: 1.3rem; color: var(--admin-leather); font-family: var(--font-heading);">${formatARS(order.total)}</strong>
    </div>
  `;

  // Set WhatsApp button handler
  const btnWa = document.getElementById('btn-modal-whatsapp-contact');
  if (btnWa) {
    btnWa.onclick = () => contactCustomerWhatsApp(order.customerPhone || '5493513830111', order.id, order.customerName || 'Cliente', order.status);
  }

  document.getElementById('order-detail-modal').classList.add('active');
}

function closeOrderDetailModal() {
  document.getElementById('order-detail-modal').classList.remove('active');
}

function contactCustomerWhatsApp(phone, orderId, name, status) {
  const cleanPhone = (phone || '').replace(/\D/g, '') || '5493513830111';
  const msg = `¡Hola ${name}! Te escribimos desde *Mates Río* respecto a tu pedido *#${orderId}*. Tu orden se encuentra en estado: *${status}*. Si necesitás realizar alguna consulta o requerimiento para el taller, estamos a tu disposición. ¡Muchas gracias!`;
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function createSampleOrder() {
  const orders = getOrders();
  const sampleNames = ["Federico Rossi", "Camila Gómez", "Martín Palermo", "Luciana Méndez", "Ignacio Soria"];
  const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newOrderId = `RIO-${randomNum}`;

  const inv = getInventory();
  const prodKeys = Object.keys(inv);
  const randomProd1 = inv[prodKeys[Math.floor(Math.random() * prodKeys.length)]];
  const randomProd2 = inv[prodKeys[Math.floor(Math.random() * prodKeys.length)]];

  const total = randomProd1.price + (randomProd1.id !== randomProd2.id ? randomProd2.price : 0);
  const hasEngraving = Math.random() > 0.4;

  const newOrder = {
    id: newOrderId,
    date: new Date().toLocaleDateString('es-AR'),
    customerName: randomName,
    customerPhone: "11" + Math.floor(10000000 + Math.random() * 90000000),
    customerEmail: randomName.toLowerCase().replace(' ', '.') + "@gmail.com",
    items: `1x ${randomProd1.name}${randomProd1.id !== randomProd2.id ? `, 1x ${randomProd2.name}` : ''}`,
    total: total,
    status: "Confirmado - En preparación artesanal",
    address: "Av. Rivadavia " + Math.floor(1000 + Math.random() * 8000) + ", CABA",
    paymentMethod: Math.random() > 0.5 ? "transferencia" : "tarjeta",
    hasCustomEngraving: hasEngraving,
    engravingDetails: hasEngraving ? {
      text: randomName.toUpperCase(),
      technique: "Grabado Láser HD",
      font: "Gauchesca Criolla",
      location: "Frente Centrado"
    } : null
  };

  orders.unshift(newOrder);
  saveOrders(orders);

  renderOrdersTable();
  refreshDashboardData();

  logAuditAction('Nuevo Pedido Registrado', `Pedido de prueba #${newOrderId} generado por ${formatARS(total)}.`);
  showAdminToast(`¡Pedido #${newOrderId} generado con éxito!`, 'fa-circle-plus');
}

// ==========================================================================
// 6. METRICS & DASHBOARD CALCULATIONS
// ==========================================================================
function refreshDashboardData() {
  updateKPIs();
  renderCategoryBars();
  renderPaymentMethods();
  renderDashboardRecentOrders();
  updateInventoryBadges();
  updateOrdersBadge();
}

function updateKPIs() {
  const orders = getOrders();
  const inv = getInventory();

  // 1. Total Revenue
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.status !== 'Cancelado') return sum + (o.total || 0);
    return sum;
  }, 0);

  const kpiRevenue = document.getElementById('kpi-total-revenue');
  if (kpiRevenue) kpiRevenue.textContent = formatARS(totalRevenue);

  // 2. Total Orders & Pending in Workshop
  const kpiOrders = document.getElementById('kpi-total-orders');
  if (kpiOrders) kpiOrders.textContent = orders.length;

  const prepCount = orders.filter(o => o.status.includes('preparación') || o.status.includes('Confirmado')).length;
  const kpiPendingText = document.getElementById('kpi-pending-orders-text');
  if (kpiPendingText) kpiPendingText.textContent = `${prepCount} pedidos en taller`;

  // 3. Average Ticket
  const validOrdersCount = orders.filter(o => o.status !== 'Cancelado').length;
  const avgTicket = validOrdersCount > 0 ? Math.round(totalRevenue / validOrdersCount) : 0;
  const kpiAvg = document.getElementById('kpi-avg-ticket');
  if (kpiAvg) kpiAvg.textContent = formatARS(avgTicket);

  // 4. Virola Engraving Rate
  const engravedCount = orders.filter(o => o.hasCustomEngraving).length;
  const engRate = orders.length > 0 ? Math.round((engravedCount / orders.length) * 100) : 0;
  const kpiEng = document.getElementById('kpi-engraving-rate');
  if (kpiEng) kpiEng.textContent = `${engRate}%`;
}

function renderCategoryBars() {
  const container = document.getElementById('category-bars-list');
  if (!container) return;

  const categories = [
    { id: 'promos', name: 'Combos & Promos', pct: 38, count: '38% de ventas' },
    { id: 'mates', name: 'Mates Imperiales & Torpedos', pct: 31, count: '31% de ventas' },
    { id: 'termos', name: 'Termos de Acero & Cuero', pct: 15, count: '15% de ventas' },
    { id: 'accesorios', name: 'Bombillas & Accesorios', pct: 8, count: '8% de ventas' },
    { id: 'equipos', name: 'Equipos & Materas', pct: 5, count: '5% de ventas' },
    { id: 'yerbas', name: 'Yerbas Seleccionadas', pct: 3, count: '3% de ventas' }
  ];

  container.innerHTML = categories.map(cat => `
    <div class="bar-row">
      <div class="bar-labels">
        <span style="color: var(--admin-text-main);">${cat.name}</span>
        <span style="color: var(--admin-text-muted); font-size: 0.72rem;">${cat.count}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${cat.pct}%;"></div>
      </div>
    </div>
  `).join('');
}

function renderPaymentMethods() {
  const container = document.getElementById('payment-methods-list');
  if (!container) return;

  const orders = getOrders();
  const total = orders.length || 1;
  const transferCount = orders.filter(o => o.paymentMethod === 'transferencia').length;
  const cardCount = total - transferCount;

  const transferPct = Math.round((transferCount / total) * 100);
  const cardPct = 100 - transferPct;

  container.innerHTML = `
    <div class="payment-method-row">
      <div class="payment-method-info">
        <div class="payment-method-icon"><i class="fas fa-building-columns"></i></div>
        <div>
          <div class="payment-method-name">Transferencia Bancaria</div>
          <div class="payment-method-sub">Con 10% de Bonificación</div>
        </div>
      </div>
      <div class="payment-method-stat">
        <div class="payment-method-pct">${transferPct}%</div>
        <div class="payment-method-count">${transferCount} pedidos</div>
      </div>
    </div>

    <div class="payment-method-row">
      <div class="payment-method-info">
        <div class="payment-method-icon"><i class="fas fa-credit-card"></i></div>
        <div>
          <div class="payment-method-name">Tarjetas de Crédito</div>
          <div class="payment-method-sub">3 Cuotas Sin Interés</div>
        </div>
      </div>
      <div class="payment-method-stat">
        <div class="payment-method-pct">${cardPct}%</div>
        <div class="payment-method-count">${cardCount} pedidos</div>
      </div>
    </div>
  `;
}

function renderDashboardRecentOrders() {
  const orders = getOrders().slice(0, 5);
  const tbody = document.getElementById('dashboard-recent-orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Sin pedidos registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    let statusClass = 'status-prep';
    if (order.status.toLowerCase().includes('enviado')) statusClass = 'status-shipped';
    if (order.status.toLowerCase().includes('entregado')) statusClass = 'status-delivered';

    return `
      <tr>
        <td><strong style="color: var(--admin-leather); font-family: var(--font-heading);">${order.id}</strong></td>
        <td style="color: var(--admin-text-muted); font-size: 0.74rem;">${order.date}</td>
        <td><strong>${order.customerName || 'Cliente'}</strong></td>
        <td>
          <span style="font-size: 0.78rem;">${order.items.substring(0, 48)}${order.items.length > 48 ? '...' : ''}</span>
          ${order.hasCustomEngraving ? `<span class="engraving-tag"><i class="fas fa-magic"></i> Grabado</span>` : ''}
        </td>
        <td><strong>${formatARS(order.total)}</strong></td>
        <td><span class="badge-stock ${statusClass}">${order.status.split('-')[0].trim()}</span></td>
        <td>
          <button type="button" class="btn-table-action" onclick="openOrderDetailModal('${order.id}')" title="Ver Detalle">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================================================
// 7. STATS SECTION (Top products, etc.)
// ==========================================================================
function renderStatsSection() {
  const container = document.getElementById('top-products-list');
  if (!container) return;

  const topItems = [
    { name: "Combo Río Imperial Black + Termo 1L + Bombilla Alpaca", units: 48, pct: 100 },
    { name: "Mate Imperial Artesanal Cuero Negro & Virola Cincelada", units: 39, pct: 81 },
    { name: "Set Matero Camionero Marrón + Matera de Cuero Vacuno", units: 32, pct: 66 },
    { name: "Termo Media Manija Cuero Acero Inoxidable 1L", units: 28, pct: 58 },
    { name: "Bombilla Pico de Loro Alpaca Maciza Cincelada", units: 24, pct: 50 }
  ];

  container.innerHTML = topItems.map((item, idx) => `
    <div class="bar-row">
      <div class="bar-labels">
        <span><b>#${idx + 1}</b> ${item.name}</span>
        <span style="color: var(--admin-leather); font-weight: 800;">${item.units} vendidas</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${item.pct}%;"></div>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// 8. USERS MANAGEMENT
// ==========================================================================
function initUsersDB() {
  let users = JSON.parse(localStorage.getItem('mates_rio_users_db'));

  if (!users) {
    users = [
      {
        name: "Administrador General Mates Río",
        email: "mates.rio6@gmail.com",
        phone: "3513830111",
        password: "matesriomanavella6",
        role: "admin"
      },
      {
        name: "Juan Matero",
        email: "juan@ejemplo.com",
        phone: "1155554444",
        password: "123",
        role: "customer"
      },
      {
        name: "Sofía Albarracín",
        email: "sofia_albarracin@gmail.com",
        phone: "1133445566",
        password: "123",
        role: "customer"
      }
    ];

    localStorage.setItem('mates_rio_users_db', JSON.stringify(users));
  }
}

function renderUsersTable() {
  const users = JSON.parse(localStorage.getItem('mates_rio_users_db')) || [];
  const orders = getOrders();
  const tbody = document.getElementById('users-table-tbody');
  if (!tbody) return;

  tbody.innerHTML = users.map(u => {
    const userOrdersCount = orders.filter(o => o.customerEmail === u.email).length;
    const isAdmin = u.role === 'admin' || u.role === 'Super Administrador' || u.role === 'Taller & Depósito';

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas ${isAdmin ? 'fa-user-shield' : 'fa-user'}" style="color: ${isAdmin ? 'var(--admin-gold)' : 'var(--admin-leather)'};"></i>
            <strong>${u.name}</strong>
          </div>
        </td>
        <td><code>${u.email}</code></td>
        <td>${u.phone || 'Sin registrar'}</td>
        <td>
          <span class="sidebar-badge ${isAdmin ? 'badge-alert' : 'badge-info'}">
            ${isAdmin ? '👑 Administrador' : '👤 Cliente'}
          </span>
        </td>
        <td>
          <strong>${userOrdersCount}</strong> pedido(s)
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================================================
// 9. AUDIT LOGGING
// ==========================================================================
function logAuditAction(action, detail) {
  let log = JSON.parse(localStorage.getItem('mates_rio_audit_log')) || [];
  
  const entry = {
    date: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR'),
    user: currentAdminUser ? `${currentAdminUser.name} (${currentAdminUser.role})` : 'Sistema',
    action: action,
    detail: detail
  };

  log.unshift(entry);
  if (log.length > 100) log = log.slice(0, 100);
  localStorage.setItem('mates_rio_audit_log', JSON.stringify(log));
}

function renderAuditTable() {
  const log = JSON.parse(localStorage.getItem('mates_rio_audit_log')) || [];
  const tbody = document.getElementById('audit-table-tbody');
  if (!tbody) return;

  if (log.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 24px; color: var(--admin-text-muted);">Sin registros de auditoría recientes.</td></tr>`;
    return;
  }

  tbody.innerHTML = log.map(entry => `
    <tr>
      <td style="font-size: 0.74rem; color: var(--admin-text-muted);">${entry.date}</td>
      <td><strong>${entry.user}</strong></td>
      <td><span class="badge-stock stock-good">${entry.action}</span></td>
      <td style="font-size: 0.78rem;">${entry.detail}</td>
    </tr>
  `).join('');
}

function clearAuditLog() {
  if (confirm('¿Deseás vaciar el registro de auditoría?')) {
    localStorage.removeItem('mates_rio_audit_log');
    renderAuditTable();
    showAdminToast('Registro de auditoría vaciado');
  }
}

// ==========================================================================
// 10. EXPORT DATA (CSV)
// ==========================================================================
function exportSalesReportCSV() {
  const orders = getOrders();
  if (orders.length === 0) {
    alert('No hay ventas registradas para exportar.');
    return;
  }

  let csv = "\uFEFF"; // UTF-8 BOM for Excel
  csv += "ID Pedido,Fecha,Cliente,Telefono,Email,Items,Total ARS,Metodo Pago,Estado,Grabado Virola\n";

  orders.forEach(o => {
    const itemsEscaped = `"${(o.items || '').replace(/"/g, '""')}"`;
    const clienteEscaped = `"${(o.customerName || '').replace(/"/g, '""')}"`;
    csv += `${o.id},${o.date},${clienteEscaped},${o.customerPhone || ''},${o.customerEmail || ''},${itemsEscaped},${o.total},${o.paymentMethod},"${o.status}",${o.hasCustomEngraving ? 'SI' : 'NO'}\n`;
  });

  downloadCSV(csv, `Mates_Rio_Reporte_Ventas_${new Date().toISOString().slice(0, 10)}.csv`);
  showAdminToast('Reporte de ventas exportado con éxito', 'fa-file-excel');
  logAuditAction('Exportación de Ventas', 'Se descargó el reporte de ventas en CSV.');
}

function exportInventoryCSV() {
  const inv = getInventory();
  const list = Object.values(inv);
  if (list.length === 0) return;

  let csv = "\uFEFF"; // UTF-8 BOM
  csv += "ID,Producto,Categoria,Precio ARS,Stock Actual,Alerta Minima,Estado\n";

  list.forEach(p => {
    const nameEscaped = `"${p.name.replace(/"/g, '""')}"`;
    const status = p.stock === 0 ? 'AGOTADO' : (p.stock <= p.minStock ? 'BAJO STOCK' : 'NORMAL');
    csv += `${p.id},${nameEscaped},${p.category},${p.price},${p.stock},${p.minStock},${status}\n`;
  });

  downloadCSV(csv, `Mates_Rio_Inventario_Stock_${new Date().toISOString().slice(0, 10)}.csv`);
  showAdminToast('Reporte de inventario exportado con éxito', 'fa-file-csv');
  logAuditAction('Exportación de Inventario', 'Se descargó el reporte de stock en CSV.');
}

function downloadCSV(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================================================
// 11. TOAST NOTIFICATIONS
// ==========================================================================
function showAdminToast(message, icon = 'fa-info-circle') {
  const container = document.getElementById('admin-toast-box');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.innerHTML = `<i class="fas ${icon}" style="color: var(--admin-gold);"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================================================
// 12. COMPRAS A PROVEEDORES (COSTOS & TALLER)
// ==========================================================================
function renderPurchasesSection() {
  const purchases = typeof getSupplierPurchases === 'function' ? getSupplierPurchases() : [];
  const tbody = document.getElementById('purchases-table-tbody');
  
  // Calculate KPIs
  let totalCost = 0;
  let totalUnits = 0;
  let pendingCount = 0;

  purchases.forEach(p => {
    totalCost += Number(p.totalCost || (p.quantity * p.unitCost) || 0);
    totalUnits += Number(p.quantity || 0);
    if (p.status !== 'Recibido') pendingCount++;
  });

  const kpiTotal = document.getElementById('kpi-purchases-total');
  const kpiUnits = document.getElementById('kpi-purchases-units');
  const kpiPending = document.getElementById('kpi-purchases-pending');

  if (kpiTotal) kpiTotal.textContent = formatARS(totalCost);
  if (kpiUnits) kpiUnits.textContent = `${totalUnits} un.`;
  if (kpiPending) kpiPending.textContent = `${pendingCount} lotes`;

  if (!tbody) return;

  if (purchases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 28px; color: var(--admin-text-muted);">Sin compras a proveedores registradas. Hacé clic en "Registrar Nueva Compra".</td></tr>`;
    return;
  }

  tbody.innerHTML = purchases.map(p => {
    const statusClass = (p.status || '').toLowerCase().includes('recibido') ? 'status-recibido' : ((p.status || '').toLowerCase().includes('camino') ? 'status-camino' : 'status-pendiente');
    return `
      <tr>
        <td style="font-weight: 700; font-family: monospace; font-size: 0.8rem; color: var(--admin-leather);">${p.id}</td>
        <td style="font-size: 0.78rem; color: var(--admin-text-muted);">${p.date}</td>
        <td><strong>${p.supplier}</strong></td>
        <td>${p.item}</td>
        <td><span class="badge-stock stock-good" style="font-size: 0.7rem;">${p.category}</span></td>
        <td style="font-weight: 700;">${p.quantity} un.</td>
        <td style="font-size: 0.82rem;">${formatARS(p.unitCost)}</td>
        <td style="font-weight: 800; color: var(--admin-text-main); font-size: 0.92rem;">${formatARS(p.totalCost)}</td>
        <td><span class="badge-purchase ${statusClass}">${p.status}</span></td>
        <td>
          <button type="button" class="btn-admin-icon" onclick="deletePurchase('${p.id}')" title="Eliminar registro" style="color: var(--admin-danger);">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openCreatePurchaseModal() {
  const modal = document.getElementById('new-purchase-modal');
  if (!modal) return;
  const form = document.getElementById('new-purchase-form');
  if (form) form.reset();
  calculatePurchaseTotal();
  modal.classList.add('active');
}

function closeCreatePurchaseModal() {
  const modal = document.getElementById('new-purchase-modal');
  if (!modal) return;
  modal.classList.remove('active');
}

function calculatePurchaseTotal() {
  const qty = parseInt(document.getElementById('purchase-qty')?.value, 10) || 0;
  const cost = parseInt(document.getElementById('purchase-unit-cost')?.value, 10) || 0;
  const totalDisplay = document.getElementById('purchase-total-display');
  if (totalDisplay) {
    totalDisplay.textContent = formatARS(qty * cost);
  }
}

function handleCreatePurchase() {
  const supplier = document.getElementById('purchase-supplier')?.value.trim();
  const item = document.getElementById('purchase-item')?.value.trim();
  const category = document.getElementById('purchase-category')?.value;
  const status = document.getElementById('purchase-status')?.value;
  const qty = parseInt(document.getElementById('purchase-qty')?.value, 10);
  const unitCost = parseInt(document.getElementById('purchase-unit-cost')?.value, 10);
  const notes = document.getElementById('purchase-notes')?.value.trim();

  if (!supplier || !item || isNaN(qty) || qty <= 0 || isNaN(unitCost) || unitCost <= 0) {
    alert('Por favor completá los campos obligatorios de la compra con valores válidos.');
    return;
  }

  const purchases = typeof getSupplierPurchases === 'function' ? getSupplierPurchases() : [];
  const newPurchase = {
    id: `COM-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().slice(0, 10),
    supplier,
    item,
    category,
    quantity: qty,
    unitCost,
    totalCost: qty * unitCost,
    status,
    notes: notes || ''
  };

  purchases.unshift(newPurchase);
  if (typeof saveSupplierPurchases === 'function') {
    saveSupplierPurchases(purchases);
  }

  closeCreatePurchaseModal();
  renderPurchasesSection();
  logAuditAction('Registro de Compra', `Compra ${newPurchase.id} a ${supplier}: ${qty} un. de ${item} (${formatARS(newPurchase.totalCost)})`);
  showAdminToast(`¡Compra registrada con éxito!`, 'fa-truck-ramp-box');
}

function deletePurchase(purchaseId) {
  if (!confirm(`¿Deseás eliminar la compra ${purchaseId}?`)) return;
  let purchases = typeof getSupplierPurchases === 'function' ? getSupplierPurchases() : [];
  purchases = purchases.filter(p => p.id !== purchaseId);
  if (typeof saveSupplierPurchases === 'function') {
    saveSupplierPurchases(purchases);
  }
  renderPurchasesSection();
  showAdminToast(`Registro de compra eliminado`, 'fa-trash-alt');
}

// ==========================================================================
// 13. DISEÑO & GESTIÓN DEL INICIO WEB (BANNERS, CATEGORÍAS & ANUNCIOS)
// ==========================================================================
let currentDesignTab = 'slides';

function switchDesignTab(tabName) {
  currentDesignTab = tabName;

  document.querySelectorAll('.home-design-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === `tab-btn-${tabName}`);
  });

  const panels = ['slides', 'categories', 'occasions'];
  panels.forEach(p => {
    const panel = document.getElementById(`design-panel-${p}`);
    if (panel) {
      if (p === tabName) {
        panel.style.display = 'block';
        panel.classList.add('active');
      } else {
        panel.style.display = 'none';
        panel.classList.remove('active');
      }
    }
  });

  if (tabName === 'slides') renderAdminSlidesList();
  if (tabName === 'categories') renderAdminCategoriesGrid();
  if (tabName === 'occasions') renderOccasionSettings();
}

function renderHomeDesignSection() {
  switchDesignTab(currentDesignTab || 'slides');
}

// --- 13.1 HERO BANNERS ---
function renderAdminSlidesList() {
  const container = document.getElementById('admin-slides-list');
  if (!container) return;

  const slides = typeof getActiveHomeSlides === 'function' ? getActiveHomeSlides() : [];

  if (slides.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--admin-text-muted);">Sin slides configurados. Hacé clic en "Agregar Nuevo Banner".</p>`;
    return;
  }

  container.innerHTML = slides.map(slide => `
    <div style="background: #ffffff; border: 1.5px solid var(--admin-border); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column;">
      <div style="height: 140px; position: relative; overflow: hidden; background: #222;">
        <img src="${slide.image}" alt="${slide.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        <span style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: #c5a059; padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800;">
          ${slide.tag || 'Slide'}
        </span>
      </div>
      <div style="padding: 14px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 6px; color: var(--admin-text-main);">${slide.title}</h4>
          <p style="font-size: 0.78rem; color: var(--admin-text-muted); line-height: 1.4; margin-bottom: 8px;">${slide.subtitle || ''}</p>
          <div style="font-size: 0.74rem; color: var(--admin-leather); font-weight: 700;">
            <i class="fas fa-link"></i> ${slide.btnText || 'Ver Más'} (${slide.btnLink || 'index.html'})
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--admin-border);">
          <button type="button" class="btn-admin btn-admin-outline" style="padding: 6px 12px; font-size: 0.78rem;" onclick="openEditSlideModal('${slide.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button type="button" class="btn-admin btn-admin-danger" style="padding: 6px 12px; font-size: 0.78rem;" onclick="deleteSlide('${slide.id}')" title="Eliminar banner">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddSlideModal() {
  const modal = document.getElementById('slide-modal');
  if (!modal) return;
  const form = document.getElementById('slide-editor-form');
  if (form) form.reset();
  const idEl = document.getElementById('slide-id');
  if (idEl) idEl.value = '';
  const preview = document.getElementById('slide-img-preview');
  if (preview) preview.src = 'assets/images/banner_1.jpg';
  modal.classList.add('active');
}

function openEditSlideModal(slideId) {
  const slides = typeof getActiveHomeSlides === 'function' ? getActiveHomeSlides() : [];
  const slide = slides.find(s => s.id === slideId);
  if (!slide) return;

  const idEl = document.getElementById('slide-id');
  if (idEl) idEl.value = slide.id;

  const titleEl = document.getElementById('slide-title-input');
  if (titleEl) titleEl.value = slide.title || '';

  const subtitleEl = document.getElementById('slide-subtitle-input');
  if (subtitleEl) subtitleEl.value = slide.subtitle || '';

  const tagEl = document.getElementById('slide-tag-input');
  if (tagEl) tagEl.value = slide.tag || '';

  const btnTextEl = document.getElementById('slide-btn-text');
  if (btnTextEl) btnTextEl.value = slide.btnText || '';

  const btnLinkEl = document.getElementById('slide-btn-link');
  if (btnLinkEl) btnLinkEl.value = slide.btnLink || '';

  const imgUrlEl = document.getElementById('slide-img-url');
  if (imgUrlEl) imgUrlEl.value = slide.image || '';

  const preview = document.getElementById('slide-img-preview');
  if (preview) preview.src = slide.image || 'assets/images/banner_1.jpg';

  const modal = document.getElementById('slide-modal');
  if (modal) modal.classList.add('active');
}

function closeSlideModal() {
  const modal = document.getElementById('slide-modal');
  if (!modal) return;
  modal.classList.remove('active');
}

function handleSlideFileSelect(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const url = e.target.result;
    const preview = document.getElementById('slide-img-preview');
    const input = document.getElementById('slide-img-url');
    if (preview) preview.src = url;
    if (input) input.value = url;
  };
  reader.readAsDataURL(file);
}

function saveSlideForm() {
  const id = document.getElementById('slide-id')?.value;
  const title = document.getElementById('slide-title-input')?.value.trim();
  const subtitle = document.getElementById('slide-subtitle-input')?.value.trim();
  const tag = document.getElementById('slide-tag-input')?.value.trim();
  const btnText = document.getElementById('slide-btn-text')?.value.trim();
  const btnLink = document.getElementById('slide-btn-link')?.value.trim();
  const imgUrl = document.getElementById('slide-img-url')?.value.trim() || document.getElementById('slide-img-preview')?.src;

  if (!title) {
    alert('Por favor completá el título del banner.');
    return;
  }

  let slides = typeof getActiveHomeSlides === 'function' ? getActiveHomeSlides() : [];

  if (id) {
    const s = slides.find(x => x.id === id);
    if (s) {
      s.title = title;
      s.subtitle = subtitle;
      s.tag = tag;
      s.btnText = btnText;
      s.btnLink = btnLink;
      if (imgUrl) s.image = imgUrl;
    }
  } else {
    slides.push({
      id: `slide-${Date.now()}`,
      title,
      subtitle,
      tag: tag || 'Novedad',
      badge: '',
      btnText: btnText || 'Ver Catálogo',
      btnLink: btnLink || 'catalogo.html',
      image: imgUrl || 'assets/images/banner_1.jpg'
    });
  }

  if (typeof saveActiveHomeSlides === 'function') {
    saveActiveHomeSlides(slides);
  }

  closeSlideModal();
  renderAdminSlidesList();
  showAdminToast('¡Banner del carrusel guardado con éxito!', 'fa-images');
  logAuditAction('Diseño Web', `Banner de inicio "${title}" actualizado/creado.`);
}

function deleteSlide(slideId) {
  let slides = typeof getActiveHomeSlides === 'function' ? getActiveHomeSlides() : [];
  if (slides.length <= 1) {
    alert('Debe quedar al menos 1 banner en el carrusel de inicio.');
    return;
  }
  if (!confirm('¿Deseás eliminar este banner del inicio?')) return;
  slides = slides.filter(s => s.id !== slideId);
  if (typeof saveActiveHomeSlides === 'function') {
    saveActiveHomeSlides(slides);
  }
  renderAdminSlidesList();
  showAdminToast('Banner eliminado del carrusel', 'fa-trash-alt');
}

// --- 13.2 CATEGORÍAS & SUBCATEGORÍAS ---
let currentEditingCatId = null;
let currentEditingSubcats = [];

function renderAdminCategoriesGrid() {
  const container = document.getElementById('admin-categories-editor-grid');
  if (!container) return;

  const categories = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);

  container.innerHTML = categories.map(cat => {
    const subcats = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    return `
      <div style="background: #ffffff; border: 1.5px solid var(--admin-border); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column;">
        <div style="height: 120px; position: relative; overflow: hidden; background: #333;">
          <img src="${cat.image}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: cover;" />
          ${cat.badge ? `<span style="position: absolute; top: 10px; right: 10px; background: var(--admin-gold); color: #121212; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 0.68rem;">${cat.badge}</span>` : ''}
          <div style="position: absolute; bottom: 8px; left: 10px; color: #fff; font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
            ${cat.name}
          </div>
        </div>
        <div style="padding: 14px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 0.8rem; color: var(--admin-text-muted); margin-bottom: 8px;">
              <i class="fas fa-layer-group"></i> ${cat.label || ''}
            </div>
            <div style="font-size: 0.76rem; font-weight: 700; color: var(--admin-leather); margin-bottom: 6px;">
              Subcategorías activas (${subcats.length}):
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px;">
              ${subcats.map(sc => `<span style="background: #faf8f5; border: 1px solid var(--admin-border); padding: 3px 8px; border-radius: 12px; font-size: 0.72rem; color: var(--admin-text-main); font-weight: 600;">${sc}</span>`).join('')}
            </div>
          </div>
          <button type="button" class="btn-admin btn-admin-gold" style="width: 100%; justify-content: center; font-size: 0.82rem;" onclick="openCategoryModal('${cat.id}')">
            <i class="fas fa-pen-to-square"></i> Modificar Categoría & Subcategorías
          </button>
        </div>
      </div>
    `;
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

  container.innerHTML = currentEditingSubcats.map((sc, idx) => `
    <span style="display: inline-flex; align-items: center; gap: 6px; background: #ffffff; border: 1.5px solid var(--admin-border); padding: 4px 10px; border-radius: 14px; font-size: 0.76rem; font-weight: 700; color: var(--admin-text-main);">
      ${sc}
      <button type="button" onclick="removeSubcatChip(${idx})" style="background: none; border: none; cursor: pointer; color: var(--admin-danger); padding: 0; line-height: 1;">
        <i class="fas fa-times"></i>
      </button>
    </span>
  `).join('');
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
  showAdminToast(`Categoría "${name}" actualizada correctamente`, 'fa-tags');
  logAuditAction('Diseño Web', `Categoría "${name}" y sus subcategorías fueron modificadas.`);
}

// --- 13.3 ANUNCIO DE FECHAS ESPECIALES ---
const OCCASION_PRESETS = {
  mother: {
    theme: 'mother',
    badge: '🌸 DÍA DE LA MADRE',
    title: '¡Especial Día de la Madre! Grabado personalizado de regalo',
    subtitle: 'Hasta 3 cuotas sin interés y 10% OFF extra con transferencia',
    btnText: 'Ver Regalos Materos 👉',
    btnLink: 'promos.html'
  },
  father: {
    theme: 'father',
    badge: '🎩 DÍA DEL PADRE',
    title: '¡Homenajeá a Papá con un Mate Imperial de Colección!',
    subtitle: 'Envíos express a todo el país y caja de regalo incluida',
    btnText: 'Elegir su Mate 👉',
    btnLink: 'catalogo.html'
  },
  christmas: {
    theme: 'christmas',
    badge: '🎄 NAVIDAD & AÑO NUEVO',
    title: '¡Celebrá las Fiestas con Mates Río! 15% OFF en Combos',
    subtitle: 'Regalos únicos hechos a mano en las Sierras Chicas de Córdoba',
    btnText: 'Ver Promociones 👉',
    btnLink: 'promos.html'
  },
  halloween: {
    theme: 'halloween',
    badge: '🎃 HALLOWEEN MATERO',
    title: '¡Edición Noche Criolla! Descuentos embrujados en Mates Seleccionados',
    subtitle: 'Aprovechá hasta agotar stock de lotes especiales',
    btnText: 'Aprovechar Ofertas 👉',
    btnLink: 'catalogo.html'
  },
  cyber: {
    theme: 'cyber',
    badge: '⚡ BLACK FRIDAY MATERO',
    title: '¡Cyber & Black Days! Hasta 30% OFF y 3 cuotas sin interés',
    subtitle: 'La mejor orfebrería criolla con precios irrepetibles',
    btnText: 'Comprar Ahora 👉',
    btnLink: 'catalogo.html'
  },
  custom: {
    theme: 'custom',
    badge: '⭐ EDICIÓN ESPECIAL',
    title: '¡Nueva Colección 2026 de Mates Río!',
    subtitle: 'Calabaza gruesa, cuero legítimo y orfebrería de alpaca',
    btnText: 'Descubrir Novedades 👉',
    btnLink: 'catalogo.html'
  }
};

function renderOccasionSettings() {
  const config = typeof getSpecialOccasionConfig === 'function' ? getSpecialOccasionConfig() : null;
  const activeToggle = document.getElementById('occasion-active-toggle');
  const statusLabel = document.getElementById('occasion-status-label');

  const def = config || OCCASION_PRESETS.mother;

  if (activeToggle) {
    activeToggle.checked = !!(config && config.active);
    if (statusLabel) {
      statusLabel.textContent = activeToggle.checked ? 'Anuncio Activado en la Web' : 'Anuncio Desactivado';
      statusLabel.style.color = activeToggle.checked ? 'var(--admin-success)' : 'var(--admin-text-muted)';
    }
  }

  const badgeIn = document.getElementById('occasion-badge-input');
  if (badgeIn) badgeIn.value = def.badge || '';

  const themeIn = document.getElementById('occasion-theme-select');
  if (themeIn) themeIn.value = def.theme || 'mother';

  const titleIn = document.getElementById('occasion-title-input');
  if (titleIn) titleIn.value = def.title || '';

  const subIn = document.getElementById('occasion-subtitle-input');
  if (subIn) subIn.value = def.subtitle || '';

  const btnTextIn = document.getElementById('occasion-btn-text');
  if (btnTextIn) btnTextIn.value = def.btnText || '';

  const btnLinkIn = document.getElementById('occasion-btn-link');
  if (btnLinkIn) btnLinkIn.value = def.btnLink || '';

  updateOccasionLivePreview();
}

function selectOccasionPreset(presetKey) {
  const preset = OCCASION_PRESETS[presetKey];
  if (!preset) return;

  const badgeIn = document.getElementById('occasion-badge-input');
  if (badgeIn) badgeIn.value = preset.badge;

  const themeIn = document.getElementById('occasion-theme-select');
  if (themeIn) themeIn.value = preset.theme;

  const titleIn = document.getElementById('occasion-title-input');
  if (titleIn) titleIn.value = preset.title;

  const subIn = document.getElementById('occasion-subtitle-input');
  if (subIn) subIn.value = preset.subtitle;

  const btnTextIn = document.getElementById('occasion-btn-text');
  if (btnTextIn) btnTextIn.value = preset.btnText;

  const btnLinkIn = document.getElementById('occasion-btn-link');
  if (btnLinkIn) btnLinkIn.value = preset.btnLink;

  updateOccasionLivePreview();
  showAdminToast(`Plantilla "${preset.badge}" cargada`, 'fa-wand-magic-sparkles');
}

function toggleOccasionActive(checked) {
  const statusLabel = document.getElementById('occasion-status-label');
  if (statusLabel) {
    statusLabel.textContent = checked ? 'Anuncio Activado en la Web' : 'Anuncio Desactivado';
    statusLabel.style.color = checked ? 'var(--admin-success)' : 'var(--admin-text-muted)';
  }
}

function updateOccasionLivePreview() {
  const previewBox = document.getElementById('occasion-preview-container');
  const badgeEl = document.getElementById('preview-occasion-badge');
  const titleEl = document.getElementById('preview-occasion-title');
  const subEl = document.getElementById('preview-occasion-subtitle');
  const btnEl = document.getElementById('preview-occasion-btn');

  const theme = document.getElementById('occasion-theme-select')?.value || 'mother';
  const badge = document.getElementById('occasion-badge-input')?.value || 'ANUNCIO';
  const title = document.getElementById('occasion-title-input')?.value || 'Título del Anuncio';
  const sub = document.getElementById('occasion-subtitle-input')?.value || '';
  const btnText = document.getElementById('occasion-btn-text')?.value || 'Ver Más';

  if (previewBox) {
    previewBox.className = `special-occasion-banner occasion-theme-${theme}`;
  }
  if (badgeEl) badgeEl.textContent = badge;
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = sub;
  if (btnEl) btnEl.textContent = btnText;
}

function saveOccasionSettings() {
  const active = !!document.getElementById('occasion-active-toggle')?.checked;
  const theme = document.getElementById('occasion-theme-select')?.value || 'mother';
  const badge = document.getElementById('occasion-badge-input')?.value.trim() || 'ANUNCIO';
  const title = document.getElementById('occasion-title-input')?.value.trim() || '¡Aprovechá la fecha especial!';
  const subtitle = document.getElementById('occasion-subtitle-input')?.value.trim() || '';
  const btnText = document.getElementById('occasion-btn-text')?.value.trim() || 'Ver Promociones';
  const btnLink = document.getElementById('occasion-btn-link')?.value.trim() || 'promos.html';

  const config = {
    active,
    theme,
    badge,
    title,
    subtitle,
    btnText,
    btnLink
  };

  if (typeof saveSpecialOccasionConfig === 'function') {
    saveSpecialOccasionConfig(config);
  }

  logAuditAction('Diseño Web', `Anuncio de Fecha Especial (${badge}) ${active ? 'ACTIVADO' : 'desactivado'}.`);
  showAdminToast(`Configuración de anuncio guardada (${active ? 'Activo' : 'Inactivo'})`, 'fa-circle-check');
}

// ==========================================================================
// 14. ADMIN THEME MODE (MODO CLARO / MODO OSCURO)
// ==========================================================================
function initAdminThemeMode() {
  const saved = localStorage.getItem('mates_rio_admin_theme') || 'light';
  applyAdminThemeMode(saved, false);
}

function applyAdminThemeMode(mode, notify = false) {
  const isDark = mode === 'dark';
  document.body.classList.toggle('admin-dark-mode', isDark);
  localStorage.setItem('mates_rio_admin_theme', mode);

  const icon = document.getElementById('admin-theme-icon');
  const label = document.getElementById('admin-theme-label');
  const btn = document.getElementById('admin-theme-toggle-btn');

  if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  if (label) label.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
  if (btn) btn.setAttribute('title', isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro');

  if (notify && typeof showAdminToast === 'function') {
    showAdminToast(isDark ? 'Panel en Modo Oscuro 🌙' : 'Panel en Modo Claro ☀️', isDark ? 'fa-moon' : 'fa-sun');
  }
}

function toggleAdminThemeMode() {
  const isCurrentlyDark = document.body.classList.contains('admin-dark-mode');
  applyAdminThemeMode(isCurrentlyDark ? 'light' : 'dark', true);
}
