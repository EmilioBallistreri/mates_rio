/**
 * MATES RÍO - PANEL DE ADMINISTRACIÓN (ADMIN ENGINE)
 * Seguridad, Control de Stock, Métricas de Ventas y Gestión de Pedidos
 */

// ==========================================================================
// 1. CONFIG & CREDENTIALS
// ==========================================================================
const ADMIN_CREDENTIALS = [
  {
    email: "admin@matesrio.com",
    password: "admin123",
    name: "Administrador General",
    role: "Super Administrador"
  },
  {
    email: "admin@matesrio.com",
    password: "admin",
    name: "Administrador General",
    role: "Super Administrador"
  },
  {
    email: "taller@matesrio.com",
    password: "taller123",
    name: "Encargado de Taller",
    role: "Taller & Depósito"
  },
  {
    email: "taller@matesrio.com",
    password: "admin",
    name: "Encargado de Taller",
    role: "Taller & Depósito"
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
function cleanStr(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ==========================================================================
// 2. INITIALIZATION & SECURITY CHECK
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initInventoryDB();
  initOrdersDB();
  initUsersDB();
  checkAdminSession();
});

// Check if an admin session already exists
function checkAdminSession() {
  const session = sessionStorage.getItem('mates_rio_admin_session') || localStorage.getItem('mates_rio_admin_session');
  let hasValidAdmin = false;

  if (session) {
    try {
      const user = JSON.parse(session);
      if (user && (user.role === 'admin' || user.role === 'Super Administrador' || user.role === 'Taller & Depósito')) {
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
        if (storeUser && (storeUser.role === 'admin' || storeUser.role === 'Super Administrador')) {
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

function togglePasswordVisibility() {
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
    orders: 'Ventas & Gestión de Pedidos',
    stats: 'Estadísticas & Rendimiento',
    users: 'Clientes & Accesos',
    audit: 'Registro de Actividad'
  };

  const breadcrumb = document.getElementById('topbar-current-page');
  if (breadcrumb) breadcrumb.textContent = pageNames[sectionId] || 'Panel';

  // 4. Refresh section data
  if (sectionId === 'dashboard') refreshDashboardData();
  if (sectionId === 'inventory') renderInventoryTable();
  if (sectionId === 'orders') renderOrdersTable();
  if (sectionId === 'stats') renderStatsSection();
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
        inventory[p.id] = {
          id: p.id,
          name: p.name,
          category: p.category,
          categoryName: p.categoryName,
          price: p.price,
          image: p.image,
          stock: mockStocks[p.id] !== undefined ? mockStocks[p.id] : 10,
          minStock: 5,
          inStock: (mockStocks[p.id] !== undefined ? mockStocks[p.id] : 10) > 0
        };
      });
    }

    localStorage.setItem('mates_rio_inventory', JSON.stringify(inventory));
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
              <span class="table-product-name">${item.name}</span>
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
            <button type="button" class="btn-table-action" onclick="openEditProductModal('${item.id}')" title="Editar Producto">
              <i class="fas fa-pen"></i>
            </button>
            <button type="button" class="btn-table-action" onclick="quickAdjustStock('${item.id}', 10)" title="Reabastecer +10">
              <i class="fas fa-truck-ramp-box"></i>
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

function openEditProductModal(productId) {
  const inv = getInventory();
  const prod = inv[productId];
  if (!prod) return;

  document.getElementById('edit-product-id').value = prod.id;
  document.getElementById('edit-product-name').textContent = prod.name;
  document.getElementById('edit-product-cat').textContent = `Categoría: ${prod.categoryName || prod.category.toUpperCase()}`;
  document.getElementById('edit-product-img').src = prod.image;
  document.getElementById('edit-product-stock').value = prod.stock;
  document.getElementById('edit-product-price').value = prod.price;
  document.getElementById('edit-product-min-stock').value = prod.minStock || 5;

  document.getElementById('edit-product-modal').classList.add('active');
}

function closeEditProductModal() {
  document.getElementById('edit-product-modal').classList.remove('active');
}

function saveProductEdits() {
  const id = document.getElementById('edit-product-id').value;
  const newStock = parseInt(document.getElementById('edit-product-stock').value, 10);
  const newPrice = parseInt(document.getElementById('edit-product-price').value, 10);
  const newMin = parseInt(document.getElementById('edit-product-min-stock').value, 10);

  if (isNaN(newStock) || isNaN(newPrice) || newStock < 0 || newPrice < 0) {
    alert('Por favor ingrese valores numéricos válidos.');
    return;
  }

  const inv = getInventory();
  if (!inv[id]) return;

  inv[id].stock = newStock;
  inv[id].price = newPrice;
  inv[id].minStock = isNaN(newMin) ? 5 : newMin;
  inv[id].inStock = newStock > 0;

  saveInventory(inv);
  closeEditProductModal();
  renderInventoryTable();
  updateKPIs();

  logAuditAction('Edición de Producto', `${inv[id].name}: Stock=${newStock}, Precio=${formatARS(newPrice)}.`);
  showAdminToast(`Cambios guardados para "${inv[id].name}"`, 'fa-circle-check');
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
// 5. SALES & ORDERS MANAGEMENT
// ==========================================================================
function initOrdersDB() {
  let orders = JSON.parse(localStorage.getItem('mates_rio_orders'));

  if (!orders || orders.length <= 1) {
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

    const payLabel = order.paymentMethod === 'transferencia' ? '🏦 Transferencia (10% OFF)' : '💳 Tarjeta de Crédito';

    return `
      <tr>
        <td>
          <strong style="color: var(--admin-leather); font-family: var(--font-heading);">${order.id}</strong>
        </td>
        <td style="color: var(--admin-text-muted); font-size: 0.76rem;">${order.date}</td>
        <td>
          <div style="font-weight: 700; color: var(--admin-text-main);">${order.customerName || 'Cliente Web'}</div>
          <div style="font-size: 0.68rem; color: var(--admin-text-muted);">${order.customerPhone || '-'}</div>
        </td>
        <td>
          <div style="max-width: 280px; line-height: 1.35;">${order.items}</div>
          ${order.hasCustomEngraving ? `<span class="engraving-tag"><i class="fas fa-magic"></i> Grabado en Virola</span>` : ''}
        </td>
        <td>
          <strong style="font-size: 0.95rem; color: var(--admin-text-main);">${formatARS(order.total)}</strong>
        </td>
        <td style="font-size: 0.74rem; color: var(--admin-text-muted);">${payLabel}</td>
        <td>
          <select class="order-status-select ${statusClass}" onchange="changeOrderStatus('${order.id}', this.value)">
            <option value="Confirmado - En preparación artesanal" ${order.status.includes('preparación') ? 'selected' : ''}>⏳ En Taller / Preparación</option>
            <option value="Enviado" ${order.status === 'Enviado' ? 'selected' : ''}>🚚 Despachado / Enviado</option>
            <option value="Entregado" ${order.status === 'Entregado' ? 'selected' : ''}>✅ Entregado</option>
            <option value="Cancelado" ${order.status === 'Cancelado' ? 'selected' : ''}>❌ Cancelado</option>
          </select>
        </td>
        <td>
          <div class="action-btn-cell">
            <button type="button" class="btn-table-action" onclick="openOrderDetailModal('${order.id}')" title="Ver Detalle / Remito">
              <i class="fas fa-eye"></i>
            </button>
            <button type="button" class="btn-table-action" onclick="contactCustomerWhatsApp('${order.customerPhone || '5491134567890'}', '${order.id}', '${order.customerName || 'Cliente'}', '${order.status}')" title="Contactar por WhatsApp">
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
        <div style="font-size: 0.82rem; font-weight: 700;"><i class="fas fa-location-dot" style="color: var(--admin-gold);"></i> ${order.address || 'Showroom Retiro CABA'}</div>
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
          <li>• <b>Texto a Grabar:</b> <span style="font-family: monospace; background: #fff; padding: 2px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem; font-weight: bold;">"${order.engravingDetails.text}"</span></li>
          <li>• <b>Técnica en Virola:</b> ${order.engravingDetails.technique}</li>
          <li>• <b>Tipografía Seleccionada:</b> ${order.engravingDetails.font}</li>
          <li>• <b>Ubicación del Grabado:</b> ${order.engravingDetails.location}</li>
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
    btnWa.onclick = () => contactCustomerWhatsApp(order.customerPhone || '5491134567890', order.id, order.customerName || 'Cliente', order.status);
  }

  document.getElementById('order-detail-modal').classList.add('active');
}

function closeOrderDetailModal() {
  document.getElementById('order-detail-modal').classList.remove('active');
}

function contactCustomerWhatsApp(phone, orderId, name, status) {
  const cleanPhone = (phone || '').replace(/\D/g, '') || '5491134567890';
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
        name: "Administrador Mates Río",
        email: "admin@matesrio.com",
        phone: "1134567890",
        password: "admin",
        role: "admin"
      },
      {
        name: "Taller & Grabados",
        email: "taller@matesrio.com",
        phone: "1134567891",
        password: "admin",
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
