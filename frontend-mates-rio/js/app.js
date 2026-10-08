/**
 * MATES RÍO - E-COMMERCE CORE APPLICATION
 * Modern, Interactive, Argentine Mate Venture Web App
 */

// Global State
const state = {
  cart: JSON.parse(localStorage.getItem('mates_rio_cart')) || [],
  activeCategory: 'all',
  activeSubcategory: 'all',
  searchQuery: '',
  priceRange: 'all',
  sortBy: 'featured',
  activeCoupon: JSON.parse(localStorage.getItem('mates_rio_coupon')) || null,
  currentUser: JSON.parse(localStorage.getItem('mates_rio_user')) || null,
  usersDb: JSON.parse(localStorage.getItem('mates_rio_users_db')) || [
    {
      name: "Juan Matero",
      email: "juan@ejemplo.com",
      phone: "1155554444",
      password: "123",
      role: "customer"
    },
    {
      name: "Administrador General Mates Río",
      email: "mates.rio6@gmail.com",
      phone: "3513830111",
      password: "matesriomanavella6",
      role: "admin"
    }
  ],
  orders: JSON.parse(localStorage.getItem('mates_rio_orders')) || [
    {
      id: "RIO-9842",
      date: "20/09/2026",
      items: "1x Mate Imperial Artesanal Cuero Negro, 1x Bombilla Alpaca Maciza",
      total: 63400,
      status: "Entregado"
    }
  ]
};

// Constant Config
const CONFIG = {
  siteUrl: "http://localhost:5005",
  freeShippingThreshold: 60000,
  shippingCost: 3800,
  transferDiscountRate: 0.10, // 10% OFF
  whatsappNumber: "5493513830111", // WhatsApp Oficial Mates Río (3513830111)
  whatsappDisplay: "+54 9 351 383-0111",
  email: "mates.rio6@gmail.com",
  instagramUrl: "https://www.instagram.com/mates_rio_/",
  instagramHandle: "@mates_rio_",
  tiktokUrl: "https://www.tiktok.com/@Mates_rio",
  tiktokHandle: "@Mates_rio",
  originCity: "Río Ceballos",
  originProvince: "Córdoba",
  locationDisplay: "Río Ceballos, Sierras Chicas, Córdoba, Argentina"
};

// Zonas de Envío desde Río Ceballos, Córdoba
const SHIPPING_ZONES = {
  local: {
    id: "local",
    name: "Río Ceballos & Sierras Chicas (Local)",
    cost: 2500,
    time: "24 hs hábiles / Retiro en Taller",
    match: ["rio ceballos", "río ceballos", "unquillo", "mendiolaza", "salsipuedes", "villa allende"]
  },
  cordoba_capital: {
    id: "cordoba_capital",
    name: "Córdoba Capital & Gran Córdoba",
    cost: 3800,
    time: "24 a 48 hs hábiles",
    match: ["cordoba", "córdoba", "cordoba capital", "córdoba capital", "la calera"]
  },
  cordoba_interior: {
    id: "cordoba_interior",
    name: "Interior de la Provincia de Córdoba",
    cost: 5200,
    time: "2 a 3 días hábiles",
    provinceMatch: ["cordoba", "córdoba"]
  },
  nacional: {
    id: "nacional",
    name: "Resto del País (Envío Nacional)",
    cost: 6900,
    time: "3 a 5 días hábiles a todo el país vía Correo/Andreani"
  }
};

function calculateShippingZone(province = '', city = '') {
  const pNorm = (province || '').toLowerCase().trim();
  const cNorm = (city || '').toLowerCase().trim();

  // 1. Local Sierras Chicas
  if (SHIPPING_ZONES.local.match.some(m => cNorm.includes(m))) {
    return SHIPPING_ZONES.local;
  }
  // 2. Córdoba Capital
  if (SHIPPING_ZONES.cordoba_capital.match.some(m => cNorm.includes(m))) {
    return SHIPPING_ZONES.cordoba_capital;
  }
  // 3. Interior de Córdoba
  if (pNorm.includes('cordoba') || pNorm.includes('córdoba') || cNorm.includes('cba')) {
    return SHIPPING_ZONES.cordoba_interior;
  }
  // 4. Nacional
  return SHIPPING_ZONES.nacional;
}

// Currency Formatter (Argentine Pesos)
function formatARS(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount).replace('ARS', '$');
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, icon = 'fa-check-circle') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas ${icon}" style="color: var(--accent-gold); font-size: 1.2rem;"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================================================
// COLOR INVERSION / THEME TOGGLE (MODO CLARO / MODO OSCURO)
// ==========================================================================
function getPreferredThemeMode() {
  const saved = localStorage.getItem('mates_rio_theme_mode');
  if (saved) return saved;
  const legacyInverted = localStorage.getItem('mates_rio_theme_inverted');
  if (legacyInverted === 'true') return 'light';
  return 'dark'; // Modo oscuro artesanal original de Mates Río
}

function initThemeMode() {
  const currentMode = getPreferredThemeMode();
  applyThemeMode(currentMode, false);
}

function applyThemeMode(mode, showNotification = false) {
  const isLight = mode === 'light';
  document.body.classList.toggle('theme-light', isLight);
  document.body.classList.toggle('theme-dark', !isLight);
  document.body.classList.toggle('theme-inverted', isLight);
  localStorage.setItem('mates_rio_theme_mode', mode);
  localStorage.setItem('mates_rio_theme_inverted', isLight ? 'true' : 'false');

  updateThemeToggleIcons(isLight);

  if (showNotification) {
    showToast(isLight ? 'Modo Claro activado ☀️' : 'Modo Oscuro activado 🌙', isLight ? 'fa-sun' : 'fa-moon');
  }
}

function toggleColorTheme() {
  const isLightNow = document.body.classList.contains('theme-light') || document.body.classList.contains('theme-inverted');
  const newMode = isLightNow ? 'dark' : 'light';
  applyThemeMode(newMode, true);
}

function updateThemeToggleIcons(isLight) {
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.innerHTML = isLight 
      ? '<i class="fas fa-moon"></i>' 
      : '<i class="fas fa-sun"></i>';
    btn.setAttribute('title', isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro');
    btn.setAttribute('aria-label', isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro');
  });

  const mobileIcon = document.getElementById('mobile-theme-icon');
  const mobileLabel = document.getElementById('mobile-theme-label');
  if (mobileIcon) mobileIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
  if (mobileLabel) mobileLabel.textContent = isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro';
}

// ==========================================================================
// SPECIAL OCCASION ANNOUNCEMENT BANNER
// ==========================================================================
function renderSpecialOccasionBanner() {
  const container = document.getElementById('special-occasion-banner');
  if (!container) return;

  const config = typeof getSpecialOccasionConfig === 'function' ? getSpecialOccasionConfig() : null;
  if (!config || !config.active) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  // Ubicación independiente configurada por el Administrador
  const pos = config.position || 'top-bar';
  try {
    if (pos === 'top-bar') {
      const siteHeader = document.getElementById('site-header') || document.querySelector('.site-header');
      if (siteHeader && container.nextElementSibling !== siteHeader) {
        siteHeader.parentNode.insertBefore(container, siteHeader);
      }
    } else if (pos === 'after-hero') {
      const heroSection = document.getElementById('inicio') || document.querySelector('.hero-slider-section');
      if (heroSection && heroSection.nextSibling !== container) {
        heroSection.parentNode.insertBefore(container, heroSection.nextSibling);
      }
    } else if (pos === 'before-custom') {
      const customSection = document.getElementById('banner-personalizado') || document.querySelector('.banner-personalizado-section');
      if (customSection && container.nextElementSibling !== customSection) {
        customSection.parentNode.insertBefore(container, customSection);
      }
    } else if (pos === 'bottom') {
      const footer = document.querySelector('footer.site-footer') || document.getElementById('contacto');
      if (footer && container.nextElementSibling !== footer) {
        footer.parentNode.insertBefore(container, footer);
      }
    }
  } catch (err) {
    console.warn('Error reposicionando banner especial:', err);
  }

  container.className = `special-occasion-banner occasion-theme-${config.theme || 'custom'} occasion-pos-${pos}`;
  container.style.display = 'block';
  container.innerHTML = `
    <div class="container occasion-inner">
      <div class="occasion-content">
        <span class="occasion-badge">${config.badge || 'FECHA ESPECIAL'}</span>
        <div class="occasion-texts">
          <strong class="occasion-title">${config.title || ''}</strong>
          <span class="occasion-subtitle">${config.subtitle || ''}</span>
        </div>
      </div>
      ${config.btnLink ? `
        <a href="${config.btnLink}" class="btn-occasion-cta">
          ${config.btnText || 'Aprovechar Promo'} <i class="fas fa-arrow-right"></i>
        </a>
      ` : ''}
    </div>
  `;
}

// ==========================================================================
// BANNER SLIDER (HERO CAROUSEL)
// ==========================================================================
let currentSlide = 0;
let slideInterval = null;

function renderHeroSlides() {
  const slider = document.querySelector('.hero-slider');
  const dotsContainer = document.getElementById('slider-dots');
  if (!slider || typeof getActiveHomeSlides !== 'function') return;

  const slidesData = getActiveHomeSlides();
  if (!slidesData || !slidesData.length) return;

  slider.innerHTML = slidesData.map((s, idx) => `
    <div class="hero-slide ${idx === 0 ? 'active' : ''}" data-slide-index="${idx}">
      <img src="${s.image}" alt="${s.title}" class="hero-slide-bg" />
      <div class="hero-overlay"></div>
      <div class="container">
        <div class="hero-content">
          ${s.tag ? `<span class="hero-tag"><i class="fas fa-sparkles"></i> ${s.tag}</span>` : ''}
          <h2 class="hero-title">${s.title}</h2>
          <p class="hero-description">${s.subtitle || ''}</p>
          <div class="hero-cta-group">
            <a href="${s.btnLink || 'catalogo.html'}" class="btn btn-primary">
              <i class="fas fa-shopping-bag"></i> ${s.btnText || 'Ver Catálogo'}
            </a>
            <a href="https://wa.me/5493513830111?text=Hola%20Mates%20R%C3%ADo!%20Quiero%20consultar%20por%20este%20producto." target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  if (dotsContainer) {
    dotsContainer.innerHTML = slidesData.map((_, idx) => `
      <button class="slider-dot ${idx === 0 ? 'active' : ''}" data-slide="${idx}" aria-label="Ir al banner ${idx + 1}"></button>
    `).join('');
  }
}

function initSlider() {
  renderHeroSlides();
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');
  const sliderContainer = document.querySelector('.hero-slider-section');

  if (!slides.length) return;

  function showSlide(index) {
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    currentSlide = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function startAutoPlay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5500);
  }

  function stopAutoPlay() {
    clearInterval(slideInterval);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      startAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      startAutoPlay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      showSlide(idx);
      startAutoPlay();
    });
  });

  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);

    // Touch swipe support
    let touchStartX = 0;
    sliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        showSlide(currentSlide + 1);
      } else if (touchEndX - touchStartX > 50) {
        showSlide(currentSlide - 1);
      }
      startAutoPlay();
    }, { passive: true });
  }

  startAutoPlay();
}

// ==========================================================================
// CATEGORIES & CATALOG FILTERING
// ==========================================================================
function renderCategoriesGrid() {
  const container = document.getElementById('categories-grid');
  if (!container) return;
  const cats = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);

  container.innerHTML = cats.map(cat => `
    <div class="category-card" data-category="${cat.id}">
      <img src="${cat.image}" alt="${cat.name}" class="category-card-bg" loading="lazy" />
      <div class="category-card-overlay"></div>
      <div class="category-card-content">
        <span class="category-badge">${cat.badge || ''}</span>
        <h3 class="category-name">${cat.name}</h3>
        <div class="category-footer-row">
          <span class="category-sub">${cat.label || ''}</span>
          <div class="category-arrow-icon">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Click on category card filters catalog if on catalog page, or navigates to dedicated catalog page
  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.getAttribute('data-category');
      if (catId === 'promos') {
        window.location.href = 'promos.html';
        return;
      }
      const productsGrid = document.getElementById('products-grid');
      if (productsGrid) {
        setCategoryFilter(catId);
        const catalogEl = document.getElementById('catalogo');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.location.href = 'catalogo.html?categoria=' + encodeURIComponent(catId);
      }
    });
  });
}

function renderSubcategoriesFilterBar(categoryId) {
  const container = document.getElementById('subcategory-filter-bar');
  if (!container) return;

  if (!categoryId || categoryId === 'all') {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  const allCats = typeof getActiveCategories === 'function' ? getActiveCategories() : (typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : []);
  const currentCat = allCats.find(c => c.id.toLowerCase() === categoryId.toLowerCase());

  if (!currentCat || !currentCat.subcategories || !currentCat.subcategories.length) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'flex';
  const subcats = currentCat.subcategories;

  container.innerHTML = `
    <span class="subcat-label"><i class="fas fa-filter"></i> Subcategorías:</span>
    <button type="button" class="subcat-chip ${(!state.activeSubcategory || state.activeSubcategory === 'all') ? 'active' : ''}" onclick="setSubcategoryFilter('all')">
      Todas
    </button>
    ${subcats.map(sub => `
      <button type="button" class="subcat-chip ${state.activeSubcategory === sub ? 'active' : ''}" onclick="setSubcategoryFilter('${sub}')">
        ${sub}
      </button>
    `).join('')}
  `;
}

function setSubcategoryFilter(subcat) {
  state.activeSubcategory = subcat;
  renderSubcategoriesFilterBar(state.activeCategory);
  renderProducts();
}

function setCategoryFilter(categoryId) {
  state.activeCategory = categoryId;
  state.activeSubcategory = 'all';

  const productsGrid = document.getElementById('products-grid');
  if (!productsGrid) {
    if (categoryId === 'promos') {
      window.location.href = 'promos.html';
    } else {
      window.location.href = 'catalogo.html?categoria=' + encodeURIComponent(categoryId);
    }
    return;
  }

  // Update pills UI
  document.querySelectorAll('.filter-pill').forEach(pill => {
    const pillCat = pill.getAttribute('data-category');
    const isActive = pillCat === categoryId;
    pill.classList.toggle('active', isActive);
    if (isActive && typeof pill.scrollIntoView === 'function') {
      pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  });

  renderSubcategoriesFilterBar(categoryId);
  renderProducts();
}

// Helper for accent-insensitive search
function cleanStr(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

let promoCurrentSubfilter = 'all';

function filterPromosLive() {
  const input = document.getElementById('promos-search-input');
  if (!input) return;
  state.searchQuery = input.value;
  renderProducts();
}

function setPromoSubfilter(subfilter, btnEl) {
  promoCurrentSubfilter = subfilter;
  state.promoSubfilter = subfilter;
  if (btnEl) {
    document.querySelectorAll('.promos-filter-chips .filter-pill').forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
  }
  renderProducts();
}

function getAllProducts() {
  if (typeof PRODUCTS_DATA === 'undefined') return [];
  try {
    const deletedRaw = localStorage.getItem('mates_rio_deleted_products');
    const deletedIds = new Set(deletedRaw ? (JSON.parse(deletedRaw) || []) : []);
    const custom = JSON.parse(localStorage.getItem('mates_rio_custom_products')) || [];

    let list = PRODUCTS_DATA.filter(p => !deletedIds.has(p.id));
    if (custom.length > 0) {
      const existingIds = new Set(list.map(p => p.id));
      const newItems = custom.filter(p => !existingIds.has(p.id) && !deletedIds.has(p.id));
      list = [...newItems, ...list];
    }
    return list;
  } catch (e) {
    console.error("Error cargando productos personalizados:", e);
  }
  return PRODUCTS_DATA;
}

function getFilteredProducts() {
  let list = getAllProducts();
  if (!list.length) return [];

  // 1. Filter by category
  if (state.activeCategory !== 'all') {
    list = list.filter(p => p.category.toLowerCase() === state.activeCategory.toLowerCase());
  }

  // 1.2. Filter by subcategory
  if (state.activeSubcategory && state.activeSubcategory !== 'all') {
    list = list.filter(p => p.subcategory && p.subcategory.toLowerCase() === state.activeSubcategory.toLowerCase());
  }

  // 1.5. Subfilter for Promos (Combos categorization)
  const activePromoFilter = promoCurrentSubfilter !== 'all' ? promoCurrentSubfilter : state.promoSubfilter;
  if ((state.activeCategory === 'promos' || window.location.pathname.includes('promos')) && activePromoFilter && activePromoFilter !== 'all') {
    if (activePromoFilter === 'termo') {
      list = list.filter(p => cleanStr(p.name).includes('termo') || cleanStr(p.description).includes('termo'));
    } else if (activePromoFilter === 'imperial') {
      list = list.filter(p => cleanStr(p.name).includes('imperial') || cleanStr(p.description).includes('imperial'));
    } else if (activePromoFilter === 'canasta') {
      list = list.filter(p => cleanStr(p.name).includes('canasta') || cleanStr(p.description).includes('canasta') || cleanStr(p.name).includes('matera') || cleanStr(p.description).includes('matera') || cleanStr(p.name).includes('bolso') || cleanStr(p.description).includes('bolso'));
    } else if (activePromoFilter === 'under-80k') {
      list = list.filter(p => p.price <= 80000);
    }
  }

  // 2. Filter by search query (Accent-insensitive)
  if (state.searchQuery && state.searchQuery.trim()) {
    const q = cleanStr(state.searchQuery);
    list = list.filter(p => 
      cleanStr(p.name).includes(q) ||
      cleanStr(p.description).includes(q) ||
      cleanStr(p.categoryName).includes(q) ||
      cleanStr(p.subcategory).includes(q) ||
      cleanStr(p.badge).includes(q)
    );
  }

  // 3. Filter by price range
  if (state.priceRange === 'under-40k') {
    list = list.filter(p => p.price < 40000);
  } else if (state.priceRange === '40k-70k') {
    list = list.filter(p => p.price >= 40000 && p.price <= 70000);
  } else if (state.priceRange === 'over-70k') {
    list = list.filter(p => p.price > 70000);
  }

  // 4. Sort
  if (state.sortBy === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'name-asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  return list;
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  const countEl = document.getElementById('results-count');
  const clearLink = document.getElementById('clear-filters-link');
  if (!container) return;

  const products = getFilteredProducts();

  // Update count & clear link visibility
  if (countEl) {
    countEl.innerHTML = `Mostrando <b>${products.length}</b> productos`;
  }

  const isFiltered = state.activeCategory !== 'all' || 
                     (state.activeSubcategory && state.activeSubcategory !== 'all') ||
                     (state.searchQuery && state.searchQuery.trim().length > 0) || 
                     state.priceRange !== 'all';
                     
  if (clearLink) {
    clearLink.classList.toggle('visible', isFiltered);
  }

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-catalog-state">
        <i class="fas fa-search empty-icon"></i>
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 8px;">No encontramos productos con esos filtros</h3>
        <p style="color: var(--text-secondary); max-width: 420px; margin: 0 auto;">
          Probá buscando con otras palabras clave o elegí otra categoría de nuestro menú.
        </p>
        <button class="btn btn-primary" style="margin-top: 20px;" onclick="resetFilters()">
          <i class="fas fa-redo"></i> Ver todos los productos
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(prod => {
    const installmentPrice = Math.round(prod.price / 3);
    const transferPrice = Math.round(prod.price * (1 - CONFIG.transferDiscountRate));
    const subcatDisplay = prod.subcategory ? ` • <span style="color: var(--accent-gold);">${prod.subcategory}</span>` : '';

    return `
      <div class="product-card" data-id="${prod.id}">
        <div class="product-image-wrap" onclick="openQuickView('${prod.id}')">
          <img src="${prod.image}" alt="${prod.name}" class="product-img" loading="lazy" />
          <div class="product-badges">
            ${prod.badge ? `<span class="badge-tag ${prod.badgeType || 'promo'}">${prod.badge}</span>` : ''}
          </div>
          <button class="quick-view-btn" onclick="event.stopPropagation(); openQuickView('${prod.id}')">
            <i class="far fa-eye"></i> Vista Rápida
          </button>
        </div>

        <div class="product-info">
          <span class="product-category-meta">${prod.categoryName}${subcatDisplay}</span>
          <h4 class="product-title" onclick="openQuickView('${prod.id}')" title="${prod.name}">${prod.name}</h4>

          <div class="product-pricing">
            <div class="product-price-row">
              <span class="product-price">${formatARS(prod.price)}</span>
              ${prod.originalPrice ? `<span class="product-original-price">${formatARS(prod.originalPrice)}</span>` : ''}
            </div>
            <div class="installments-text">
              <i class="far fa-credit-card"></i> 3 cuotas sin interés de ${formatARS(installmentPrice)}
            </div>
            <div class="transfer-discount-text">
              <strong>${formatARS(transferPrice)}</strong> pagando con transferencia (10% OFF)
            </div>
          </div>

          <div class="product-actions">
            <button class="add-to-cart-btn" id="btn-add-${prod.id}" onclick="addToCart('${prod.id}', 1)">
              <i class="fas fa-shopping-bag"></i> Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getStarRatingHtml(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i - 0.5 <= rating) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }
  return stars;
}

function resetFilters() {
  state.activeCategory = 'all';
  state.searchQuery = '';
  state.priceRange = 'all';
  
  const searchInput = document.getElementById('catalog-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const priceSelect = document.getElementById('catalog-price-select');

  if (searchInput) searchInput.value = '';
  if (clearBtn) clearBtn.classList.remove('visible');
  if (priceSelect) priceSelect.value = 'all';

  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-category') === 'all');
  });

  renderProducts();
}

// ==========================================================================
// SHOPPING CART ENGINE
// ==========================================================================
// Track recently added product for animation
let lastAddedProductId = null;
let addedBannerTimeout = null;

function addToCart(productId, quantity = 1) {
  if (typeof PRODUCTS_DATA === 'undefined') return;
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const existingItem = state.cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      categoryName: product.categoryName,
      quantity: quantity
    });
  }

  lastAddedProductId = productId;
  saveCart();
  updateCartUI();
  showToast(`¡"${product.name}" agregado al carrito!`, 'fa-shopping-bag');

  // Visual button feedback on product card
  const btn = document.getElementById(`btn-add-${productId}`);
  if (btn) {
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-check"></i> ¡Agregado!`;
    btn.classList.add('added');
    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.classList.remove('added');
    }, 1400);
  }

  // Header cart badge bump animation
  const openCartBtn = document.getElementById('open-cart-btn');
  if (openCartBtn) {
    openCartBtn.classList.remove('cart-bump');
    void openCartBtn.offsetWidth; // Trigger reflow
    openCartBtn.classList.add('cart-bump');
    setTimeout(() => openCartBtn.classList.remove('cart-bump'), 450);
  }

  // Open cart drawer
  openCartDrawer();

  // Show in-drawer added alert banner
  const banner = document.getElementById('cart-added-banner');
  const bannerText = document.getElementById('cart-added-banner-text');
  if (banner && bannerText) {
    const isMate = product.category === 'mates' || (product.specs && product.specs.virola);
    if (isMate) {
      bannerText.innerHTML = `<span>¡<b>${product.name}</b> agregado!</span> <button type="button" class="btn-banner-personalize" onclick="goToPersonalizarMate('${productId}')"><i class="fas fa-magic"></i> Personalizar virola 👉</button>`;
    } else {
      bannerText.innerHTML = `<span>¡<b>${product.name}</b> agregado al carrito!</span>`;
    }
    banner.classList.add('active');
    clearTimeout(addedBannerTimeout);
    addedBannerTimeout = setTimeout(() => {
      banner.classList.remove('active');
    }, 4500);
  }

  // Scroll to recently added item in cart
  setTimeout(() => {
    const itemEl = document.getElementById(`cart-item-${productId}`);
    if (itemEl) {
      itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 150);

  // Clear highlight after 2.5 seconds
  setTimeout(() => {
    lastAddedProductId = null;
    const itemEl = document.getElementById(`cart-item-${productId}`);
    if (itemEl) itemEl.classList.remove('recently-added');
  }, 2500);
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  const item = state.cart.find(i => i.id === productId);
  const name = item ? item.name : 'Producto';
  state.cart = state.cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
  showToast(`"${name}" eliminado del carrito`, 'fa-trash-alt');
}

function confirmClearCart() {
  if (state.cart.length === 0) return;
  if (confirm('¿Estás seguro de que querés vaciar todos los productos de tu carrito?')) {
    clearCart();
  }
}

function clearCart() {
  if (state.cart.length === 0) return;
  state.cart = [];
  saveCart();
  updateCartUI();
  showToast('Vaciaste el carrito de compras', 'fa-info-circle');
}

function confirmClearCart() {
  if (state.cart.length === 0) return;
  if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
    clearCart();
  }
}

function saveCart() {
  localStorage.setItem('mates_rio_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const countTitle = document.getElementById('cart-count-title');
  const itemsContainer = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping-amount');
  const totalEl = document.getElementById('cart-total');
  const meterText = document.getElementById('free-shipping-text');
  const meterBar = document.getElementById('free-shipping-bar');

  // Total items count
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) badge.textContent = totalCount;
  const floatingCount = document.getElementById('floating-cart-badge') || document.getElementById('floating-cart-count');
  if (floatingCount) floatingCount.textContent = totalCount;
  if (countTitle) countTitle.textContent = `(${totalCount} ${totalCount === 1 ? 'producto' : 'productos'})`;

  // Subtotal calculation
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotalEl) subtotalEl.textContent = formatARS(subtotal);

  // Free shipping meter
  if (meterText && meterBar) {
    if (subtotal === 0) {
      meterText.innerHTML = `<i class="fas fa-truck-fast"></i> ¡Sumá <b>${formatARS(CONFIG.freeShippingThreshold)}</b> para <b>ENVÍO GRATIS</b>!`;
      meterBar.style.width = '0%';
      meterBar.style.background = 'linear-gradient(90deg, var(--accent-gold) 0%, #27ae60 100%)';
    } else if (subtotal >= CONFIG.freeShippingThreshold) {
      meterText.innerHTML = `<span style="color: #27ae60; font-weight: 700;"><i class="fas fa-check-circle"></i> ¡Tenés ENVÍO GRATIS a todo el país!</span>`;
      meterBar.style.width = '100%';
      meterBar.style.background = '#27ae60';
    } else {
      const remaining = CONFIG.freeShippingThreshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / CONFIG.freeShippingThreshold) * 100));
      meterText.innerHTML = `<i class="fas fa-truck-fast"></i> ¡Te faltan <b>${formatARS(remaining)}</b> para <b>ENVÍO GRATIS</b>!`;
      meterBar.style.width = `${pct}%`;
      meterBar.style.background = 'linear-gradient(90deg, var(--accent-gold) 0%, #27ae60 100%)';
    }
  }

  // Calculate shipping preview
  const isFreeShipping = subtotal >= CONFIG.freeShippingThreshold;
  if (shippingEl) {
    if (subtotal === 0) {
      shippingEl.textContent = 'A calcular';
      shippingEl.style.color = 'inherit';
    } else if (isFreeShipping) {
      shippingEl.innerHTML = `<b style="color: #27ae60;"><i class="fas fa-check"></i> ¡GRATIS!</b>`;
      shippingEl.style.color = '#27ae60';
    } else {
      shippingEl.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-secondary);">Calculado según tu zona</span>`;
      shippingEl.style.color = 'inherit';
    }
  }

  // Final Total
  if (totalEl) totalEl.textContent = formatARS(subtotal);

  // Render items
  if (!itemsContainer) return;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <div class="empty-cart-icon-circle">
          <i class="fas fa-shopping-bag"></i>
        </div>
        <h4 class="empty-cart-title">Tu carrito está vacío</h4>
        <p class="empty-cart-subtitle">Descubrí nuestros mates imperiales de autor, termos y combos completos con 3 cuotas sin interés.</p>
        <button class="btn btn-primary" onclick="closeCartDrawer(); if (document.getElementById('catalogo')) { document.getElementById('catalogo').scrollIntoView({behavior: 'smooth'}); } else { window.location.href = 'catalogo.html'; }">
          <i class="fas fa-shopping-bag"></i> Explorar Catálogo
        </button>
      </div>
    `;
    return;
  }

  itemsContainer.innerHTML = state.cart.map(item => {
    const isRecentlyAdded = lastAddedProductId === item.id;
    const unitPrice = item.price;
    const itemTotal = item.price * item.quantity;

    const isCustomizable = item.categoryName === 'MATES' || item.id.startsWith('mate-') || (typeof PRODUCTS_DATA !== 'undefined' && PRODUCTS_DATA.find(p => p.id === item.id)?.specs?.virola);
    let customCtaHtml = '';
    if (isCustomizable) {
      if (item.customization) {
        customCtaHtml = `
          <div class="cart-item-custom-badge">
            <div class="custom-badge-header">
              <span class="custom-badge-title"><i class="fas fa-magic"></i> Virola: <b>${item.customization.typeName}</b></span>
              <button type="button" class="btn-cart-edit-custom" onclick="goToPersonalizarMate('${item.id}')" title="Modificar diseño de virola"><i class="fas fa-edit"></i> Editar</button>
            </div>
            <div class="custom-badge-desc">
              ${item.customization.text ? `<div>• Texto: "<b>${item.customization.text}</b>" <small>(${item.customization.fontName})</small></div>` : ''}
              ${item.customization.graphicName ? `<div>• Motivo: <b>${item.customization.graphicName}</b></div>` : ''}
              ${item.customization.uploadedFile ? `<div>• Logo: <b>${item.customization.uploadedFile}</b></div>` : ''}
              <div>• Ubicación: ${item.customization.locationName}</div>
            </div>
          </div>
        `;
      } else {
        customCtaHtml = `
          <div class="cart-item-custom-cta">
            <button type="button" class="btn-cart-customize" onclick="goToPersonalizarMate('${item.id}')" title="Personalizá la virola de este mate">
              <i class="fas fa-magic"></i> Personalizar Virola <span class="badge-mini-gold">¡Bonificado!</span>
            </button>
          </div>
        `;
      }
    }

    return `
      <div class="cart-item ${isRecentlyAdded ? 'recently-added' : ''}" id="cart-item-${item.id}">
        <div class="cart-item-img-wrap" onclick="openQuickView('${item.id}'); closeCartDrawer();" title="Ver detalle de ${item.name}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <span class="cart-item-zoom-icon"><i class="fas fa-search-plus"></i></span>
        </div>

        <div class="cart-item-info">
          <div class="cart-item-header-row">
            <span class="cart-item-category">${item.categoryName || 'Colección'}</span>
            <button class="cart-item-remove-btn" onclick="removeFromCart('${item.id}')" title="Eliminar ${item.name}" aria-label="Eliminar producto">
              <i class="far fa-trash-alt"></i>
            </button>
          </div>

          <h5 class="cart-item-title" onclick="openQuickView('${item.id}'); closeCartDrawer();" title="${item.name}">${item.name}</h5>

          ${customCtaHtml}

          <div class="cart-item-bottom-row">
            <div class="cart-item-price-group">
              <span class="cart-item-total-price">${formatARS(itemTotal)}</span>
              ${item.quantity > 1 ? `<span class="cart-item-unit-price">${formatARS(unitPrice)} c/u</span>` : ''}
            </div>

            <div class="qty-stepper">
              <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)" aria-label="Disminuir" title="Restar">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)" aria-label="Aumentar" title="Sumar">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Collapsible Drawer Tools (Cupón & Envío)
function toggleCartTool(tool) {
  const couponBox = document.getElementById('collapse-coupon');
  const shippingBox = document.getElementById('collapse-shipping');
  const arrowCoupon = document.getElementById('arrow-coupon');
  const arrowShipping = document.getElementById('arrow-shipping');
  const btnCoupon = document.getElementById('btn-toggle-coupon');
  const btnShipping = document.getElementById('btn-toggle-shipping');

  if (tool === 'coupon') {
    const isOpen = couponBox?.classList.contains('active');
    couponBox?.classList.toggle('active', !isOpen);
    arrowCoupon?.classList.toggle('open', !isOpen);
    btnCoupon?.classList.toggle('active', !isOpen);
    if (shippingBox) {
      shippingBox.classList.remove('active');
      arrowShipping?.classList.remove('open');
      btnShipping?.classList.remove('active');
    }
    if (!isOpen) {
      setTimeout(() => document.getElementById('cart-coupon-input')?.focus(), 150);
    }
  } else if (tool === 'shipping') {
    const isOpen = shippingBox?.classList.contains('active');
    shippingBox?.classList.toggle('active', !isOpen);
    arrowShipping?.classList.toggle('open', !isOpen);
    btnShipping?.classList.toggle('active', !isOpen);
    if (couponBox) {
      couponBox.classList.remove('active');
      arrowCoupon?.classList.remove('open');
      btnCoupon?.classList.remove('active');
    }
    if (!isOpen) {
      setTimeout(() => document.getElementById('cart-cp-input')?.focus(), 150);
    }
  }
}

function openCartDrawer() {
  document.getElementById('cart-drawer')?.classList.add('active');
  document.getElementById('cart-drawer-overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  document.getElementById('cart-drawer')?.classList.remove('active');
  document.getElementById('cart-drawer-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

// Coupon Handling
function applyCoupon() {
  const input = document.getElementById('cart-coupon-input');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) return;

  if (COUPONS[code]) {
    state.activeCoupon = code;
    localStorage.setItem('mates_rio_coupon', JSON.stringify(code));
    updateCartUI();
    showToast(`¡Cupón "${code}" aplicado: ${COUPONS[code].label}!`, 'fa-tag');
    input.value = '';
  } else {
    showToast('El código de cupón no es válido (Probá MATERIO10 o PROMORIO)', 'fa-times-circle');
  }
}

function removeCoupon() {
  state.activeCoupon = null;
  localStorage.removeItem('mates_rio_coupon');
  updateCartUI();
  showToast('Cupón removido');
}

// Shipping Postal Code Calculator inside Cart
function toggleCartTool(tool) {
  const collapseEl = document.getElementById(`collapse-${tool}`);
  const arrowEl = document.getElementById(`arrow-${tool}`);
  if (!collapseEl) return;
  const isCurrentlyOpen = collapseEl.classList.contains('active') || collapseEl.style.display === 'block';
  if (isCurrentlyOpen) {
    collapseEl.classList.remove('active');
    collapseEl.style.display = 'none';
    if (arrowEl) arrowEl.style.transform = 'rotate(0deg)';
  } else {
    collapseEl.classList.add('active');
    collapseEl.style.display = 'block';
    if (arrowEl) arrowEl.style.transform = 'rotate(180deg)';
  }
}

function calculateShippingCP() {
  const cpInput = document.getElementById('cart-cp-input');
  const resultEl = document.getElementById('cart-cp-result');
  if (!cpInput || !resultEl) return;

  const cp = cpInput.value.trim();
  if (!cp || cp.length < 3) {
    resultEl.innerHTML = `<span style="color: #c0392b; font-size: 0.78rem;">Ingresá un código postal válido (ej: 1425).</span>`;
    return;
  }

  resultEl.innerHTML = `
    <div style="font-size: 0.8rem; margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
      <div style="display: flex; justify-content: space-between;">
        <span>📍 Retiro en Showroom CABA:</span>
        <b style="color: #27ae60;">GRATIS</b>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>📦 Correo Argentino (Sucursal):</span>
        <b>${formatARS(4200)}</b>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>🚚 Andreani Express (Domicilio):</span>
        <b>${formatARS(5500)}</b>
      </div>
    </div>
  `;
}

// ==========================================================================
// CHECKOUT VIA WHATSAPP (ARGENTINE CONVERSION STANDARD)
// ==========================================================================
function checkoutWhatsApp() {
  if (state.cart.length === 0) {
    showToast('Tu carrito está vacío. Agregá productos para continuar.', 'fa-exclamation-triangle');
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isFreeShipping = subtotal >= CONFIG.freeShippingThreshold || (state.activeCoupon && COUPONS[state.activeCoupon]?.freeShipping);
  const shippingAmount = isFreeShipping ? 0 : CONFIG.shippingCost;

  let discountAmount = 0;
  if (state.activeCoupon && COUPONS[state.activeCoupon]?.discount > 0) {
    discountAmount = Math.round(subtotal * COUPONS[state.activeCoupon].discount);
  }

  const total = subtotal - discountAmount + shippingAmount;

  // Build formatted message
  let msg = `🧉 *¡HOLA MATES RÍO! Quiero confirmar mi pedido desde la Tienda Online:*\n\n`;
  msg += `📦 *DETALLE DEL PEDIDO:*\n`;

  state.cart.forEach((item, idx) => {
    msg += `• ${item.quantity}x ${item.name} (${formatARS(item.price * item.quantity)})\n`;
    if (item.customization) {
      msg += `  ✨ *Grabado en Virola:* ${item.customization.typeName}\n`;
      if (item.customization.text) msg += `     - Texto: "${item.customization.text}" (${item.customization.fontName})\n`;
      if (item.customization.graphicName) msg += `     - Motivo: ${item.customization.graphicName}\n`;
      if (item.customization.uploadedFile) msg += `     - Logo/Archivo: ${item.customization.uploadedFile}\n`;
      msg += `     - Ubicación: ${item.customization.locationName}\n`;
      if (item.customization.notes) msg += `     - Nota: ${item.customization.notes}\n`;
    }
  });

  msg += `\n💵 *Subtotal:* ${formatARS(subtotal)}`;
  if (discountAmount > 0) {
    msg += `\n🏷️ *Descuento (${state.activeCoupon}):* -${formatARS(discountAmount)}`;
  }
  msg += `\n🚚 *Envío:* ${isFreeShipping ? 'GRATIS' : formatARS(shippingAmount)}`;
  msg += `\n✨ *TOTAL A PAGAR:* ${formatARS(total)}\n\n`;

  if (state.currentUser) {
    msg += `👤 *Cliente:* ${state.currentUser.name}\n`;
    msg += `📞 *Teléfono:* ${state.currentUser.phone || '-'}\n`;
  }

  msg += `👉 ¿Cómo coordinamos el pago (Transferencia con 10% OFF o Mercado Pago) y el envío? ¡Muchas gracias!`;

  const encodedMsg = encodeURIComponent(msg);
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMsg}`;

  window.open(url, '_blank');
}

// ==========================================================================
// WEB CHECKOUT MODAL & ORDER CREATION (DESDE RÍO CEBALLOS, CÓRDOBA)
// ==========================================================================
function openWebCheckout() {
  if (state.cart.length === 0) {
    showToast('Tu carrito está vacío.', 'fa-exclamation-triangle');
    return;
  }

  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  // Pre-fill user data if logged in
  if (state.currentUser) {
    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const phoneInput = document.getElementById('checkout-phone');
    const provinceSelect = document.getElementById('checkout-province');
    const cityInput = document.getElementById('checkout-city');
    const addressInput = document.getElementById('checkout-address');
    const zipInput = document.getElementById('checkout-zip');

    if (nameInput) nameInput.value = state.currentUser.name || '';
    if (emailInput) emailInput.value = state.currentUser.email || '';
    if (phoneInput) phoneInput.value = state.currentUser.phone || '';

    const addr = state.currentUser.address || {};
    if (provinceSelect && addr.province) provinceSelect.value = addr.province;
    if (cityInput && addr.city) cityInput.value = addr.city;
    if (addressInput && addr.street) addressInput.value = addr.street;
    if (zipInput && addr.zip) zipInput.value = addr.zip;
  }

  // Setup live listeners on location fields for real-time shipping calculation
  const provEl = document.getElementById('checkout-province');
  const cityEl = document.getElementById('checkout-city');
  if (provEl && !provEl.dataset.hasListener) {
    provEl.addEventListener('change', updateCheckoutSummary);
    provEl.dataset.hasListener = 'true';
  }
  if (cityEl && !cityEl.dataset.hasListener) {
    cityEl.addEventListener('input', updateCheckoutSummary);
    cityEl.dataset.hasListener = 'true';
  }

  // Update checkout order summary preview
  updateCheckoutSummary();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateCheckoutSummary() {
  const summaryEl = document.getElementById('checkout-order-summary-box');
  if (!summaryEl) return;

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Dynamic Shipping Calculation based on Río Ceballos, Córdoba
  const provVal = document.getElementById('checkout-province')?.value || state.currentUser?.address?.province || 'Córdoba';
  const cityVal = document.getElementById('checkout-city')?.value || state.currentUser?.address?.city || '';
  const zone = calculateShippingZone(provVal, cityVal);

  const isFreeShipping = subtotal >= CONFIG.freeShippingThreshold;
  const shippingAmount = isFreeShipping ? 0 : zone.cost;

  const selectedPayment = document.querySelector('input[name="payment_method"]:checked')?.value || 'transferencia';
  let paymentDiscount = 0;
  if (selectedPayment === 'transferencia') {
    paymentDiscount = Math.round(subtotal * CONFIG.transferDiscountRate);
  }

  const total = Math.max(0, subtotal - paymentDiscount + shippingAmount);

  const itemsSummaryHtml = state.cart.map(item => `
    <div style="padding: 4px 0; border-bottom: 1px dashed var(--border-light);">
      <div style="display: flex; justify-content: space-between;">
        <span>${item.quantity}x ${item.name}</span>
        <b>${formatARS(item.price * item.quantity)}</b>
      </div>
      ${item.customization ? `
        <div style="font-size: 0.74rem; color: var(--accent-leather); margin-top: 2px;">
          <i class="fas fa-magic"></i> Grabado Virola: ${item.customization.typeName}
          ${item.customization.text ? `("${item.customization.text}")` : ''}
          ${item.customization.graphicName ? `[${item.customization.graphicName}]` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');

  summaryEl.innerHTML = `
    <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
      <div style="margin-bottom: 6px; max-height: 120px; overflow-y: auto;">
        ${itemsSummaryHtml}
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Subtotal (${state.cart.reduce((s, i) => s + i.quantity, 0)} arts):</span>
        <b>${formatARS(subtotal)}</b>
      </div>
      ${paymentDiscount > 0 ? `
      <div style="display: flex; justify-content: space-between; color: #27ae60;">
        <span>10% OFF Transferencia:</span>
        <b>-${formatARS(paymentDiscount)}</b>
      </div>` : ''}
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-light); padding-top: 4px;">
        <div>
          <span>Envío:</span>
          <small style="color: var(--accent-leather); display: block; font-size: 0.74rem;">
            ${zone.name} • ${zone.time}
          </small>
        </div>
        <b>${isFreeShipping ? '<span style="color: #27ae60;">¡GRATIS! (Supera los ' + formatARS(CONFIG.freeShippingThreshold) + ')</span>' : formatARS(shippingAmount)}</b>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 1.1rem; color: var(--text-main); font-weight: 800; border-top: 1px solid var(--border-light); margin-top: 6px; padding-top: 6px;">
        <span>Total:</span>
        <b style="color: var(--accent-leather);">${formatARS(total)}</b>
      </div>
    </div>
  `;
}

function closeWebCheckout() {
  document.getElementById('checkout-modal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function processWebCheckout(e) {
  e.preventDefault();

  const name = document.getElementById('checkout-name')?.value.trim();
  const phone = document.getElementById('checkout-phone')?.value.trim();
  const email = document.getElementById('checkout-email')?.value.trim();
  const province = document.getElementById('checkout-province')?.value || 'Córdoba';
  const city = document.getElementById('checkout-city')?.value.trim();
  const address = document.getElementById('checkout-address')?.value.trim();
  const zip = document.getElementById('checkout-zip')?.value.trim();
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'transferencia';

  if (!name || !address || !city) {
    showToast('Por favor completá los campos obligatorios', 'fa-exclamation-triangle');
    return;
  }

  const orderId = 'RIO-' + Math.floor(1000 + Math.random() * 9000);
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let paymentDiscount = 0;
  if (paymentMethod === 'transferencia') {
    paymentDiscount = Math.round(subtotal * CONFIG.transferDiscountRate);
  }

  const zone = calculateShippingZone(province, city);
  const isFreeShipping = subtotal >= CONFIG.freeShippingThreshold;
  const shippingAmount = isFreeShipping ? 0 : zone.cost;
  const total = Math.max(0, subtotal - paymentDiscount + shippingAmount);

  const hasCustomization = state.cart.some(i => i.customization);
  const firstCustomItem = state.cart.find(i => i.customization);

  // Save address into logged in user profile for future purchases
  if (state.currentUser) {
    state.currentUser.address = { province, city, street: address, zip };
    localStorage.setItem('mates_rio_user', JSON.stringify(state.currentUser));
    const uIdx = state.usersDb.findIndex(u => u.email.toLowerCase() === state.currentUser.email.toLowerCase());
    if (uIdx !== -1) {
      state.usersDb[uIdx].address = state.currentUser.address;
      localStorage.setItem('mates_rio_users_db', JSON.stringify(state.usersDb));
    }
  }

  const newOrder = {
    id: orderId,
    date: new Date().toLocaleDateString('es-AR'),
    customerName: name,
    customerPhone: phone || (state.currentUser?.phone || ''),
    customerEmail: email || (state.currentUser?.email || ''),
    items: state.cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
    total: total,
    status: "Confirmado - En preparación artesanal",
    address: `${address}, ${city}, ${province} (CP ${zip})`,
    shippingZone: zone.name,
    shippingCost: shippingAmount,
    paymentMethod: paymentMethod,
    hasCustomEngraving: hasCustomization,
    engravingDetails: firstCustomItem ? {
      text: firstCustomItem.customization.text || 'Sin texto',
      technique: firstCustomItem.customization.typeName || 'Láser HD',
      font: firstCustomItem.customization.fontName || 'Gauchesca',
      location: firstCustomItem.customization.location || 'Frente'
    } : null
  };

  state.orders.unshift(newOrder);
  localStorage.setItem('mates_rio_orders', JSON.stringify(state.orders));

  // Decrement inventory stock
  try {
    const inv = JSON.parse(localStorage.getItem('mates_rio_inventory'));
    if (inv) {
      state.cart.forEach(item => {
        if (inv[item.id]) {
          inv[item.id].stock = Math.max(0, inv[item.id].stock - item.quantity);
          inv[item.id].inStock = inv[item.id].stock > 0;
        }
      });
      localStorage.setItem('mates_rio_inventory', JSON.stringify(inv));
    }
  } catch (err) {
    console.error('Error updating inventory stock:', err);
  }

  // Reset cart
  state.cart = [];
  saveCart();
  updateCartUI();

  closeWebCheckout();

  // Show Success Receipt Modal
  const successModal = document.getElementById('order-success-modal');
  const orderIdSpan = document.getElementById('success-order-id');
  const orderTotalSpan = document.getElementById('success-order-total');
  if (orderIdSpan) orderIdSpan.textContent = orderId;
  if (orderTotalSpan) orderTotalSpan.textContent = formatARS(total);

  if (successModal) {
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  showToast(`¡Pedido #${orderId} generado con éxito! 🎉`);
}

function closeOrderSuccess() {
  document.getElementById('order-success-modal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function copyCBU(aliasText) {
  navigator.clipboard.writeText(aliasText).then(() => {
    showToast(`¡"${aliasText}" copiado al portapapeles!`);
  }).catch(() => {
    showToast(`Datos: ${aliasText}`);
  });
}

// ==========================================================================
// AUTHENTICATION SYSTEM (LOGIN & REGISTER)
// ==========================================================================
function openAuthModal(initialTab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  switchAuthTab(initialTab);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  document.getElementById('auth-modal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const loginTabBtn = document.getElementById('tab-btn-login');
  const registerTabBtn = document.getElementById('tab-btn-register');
  const loginPanel = document.getElementById('auth-panel-login');
  const registerPanel = document.getElementById('auth-panel-register');

  if (tab === 'login') {
    loginTabBtn?.classList.add('active');
    registerTabBtn?.classList.remove('active');
    loginPanel?.classList.add('active');
    registerPanel?.classList.remove('active');
  } else {
    registerTabBtn?.classList.add('active');
    loginTabBtn?.classList.remove('active');
    registerPanel?.classList.add('active');
    loginPanel?.classList.remove('active');
  }
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Helper to determine if a user account has administrative privileges
function isUserAdmin(user) {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  const email = (user.email || '').toLowerCase();
  return (
    role.includes('admin') ||
    email === 'mates.rio6@gmail.com'
  );
}

function handleLogin(e) {
  e.preventDefault();
  const email = (document.getElementById('login-email')?.value || '').trim();
  const password = (document.getElementById('login-password')?.value || '').trim();

  if (!email || !password) {
    showToast('Ingresá tu correo y contraseña', 'fa-exclamation-triangle');
    return;
  }

  const emailLower = email.toLowerCase();
  const isSuperAdminCred = emailLower === 'mates.rio6@gmail.com' && password === 'matesriomanavella6';

  let user = null;

  if (isSuperAdminCred) {
    user = {
      name: "Administrador General Mates Río",
      email: "mates.rio6@gmail.com",
      phone: "3513830111",
      password: password,
      role: "Super Administrador"
    };
  } else {
    user = state.usersDb.find(u => u.email.toLowerCase() === emailLower && u.password === password);
  }

  if (user) {
    if (isUserAdmin(user)) {
      user.role = user.role || 'Super Administrador';
      localStorage.setItem('mates_rio_admin_session', JSON.stringify(user));
      sessionStorage.setItem('mates_rio_admin_session', JSON.stringify(user));
    }
    state.currentUser = user;
    localStorage.setItem('mates_rio_user', JSON.stringify(user));
    updateAuthUI();
    closeAuthModal();
    playAuthLoginEffect(user, false);
  } else {
    // If not in demo, register as new session
    const fallbackUser = {
      name: email.split('@')[0],
      email: email,
      phone: "1155554444",
      role: isUserAdmin({ email }) ? "Super Administrador" : "customer"
    };
    if (isUserAdmin(fallbackUser)) {
      localStorage.setItem('mates_rio_admin_session', JSON.stringify(fallbackUser));
      sessionStorage.setItem('mates_rio_admin_session', JSON.stringify(fallbackUser));
    }
    state.currentUser = fallbackUser;
    localStorage.setItem('mates_rio_user', JSON.stringify(fallbackUser));
    updateAuthUI();
    closeAuthModal();
    playAuthLoginEffect(fallbackUser, false);
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const phone = document.getElementById('reg-phone')?.value.trim();
  const password = document.getElementById('reg-password')?.value;
  const passConfirm = document.getElementById('reg-password-confirm')?.value;

  if (!name || !email || !password) {
    showToast('Por favor completá los campos obligatorios', 'fa-exclamation-triangle');
    return;
  }

  if (password !== passConfirm) {
    showToast('Las contraseñas no coinciden', 'fa-times-circle');
    return;
  }

  const role = isUserAdmin({ email }) ? "Super Administrador" : "customer";
  const newUser = { name, email, phone, password, role };
  state.usersDb.push(newUser);
  localStorage.setItem('mates_rio_users_db', JSON.stringify(state.usersDb));

  if (isUserAdmin(newUser)) {
    localStorage.setItem('mates_rio_admin_session', JSON.stringify(newUser));
    sessionStorage.setItem('mates_rio_admin_session', JSON.stringify(newUser));
  }

  state.currentUser = newUser;
  localStorage.setItem('mates_rio_user', JSON.stringify(newUser));

  updateAuthUI();
  closeAuthModal();
  playAuthLoginEffect(newUser, true);
}

function logoutUser() {
  const prevName = state.currentUser ? state.currentUser.name : 'Matero';
  state.currentUser = null;
  localStorage.removeItem('mates_rio_user');
  localStorage.removeItem('mates_rio_admin_session');
  sessionStorage.removeItem('mates_rio_admin_session');
  updateAuthUI();
  closeProfileModal();
  closeUserDropdown();
  playAuthLogoutEffect(prevName);
}

function toggleUserDropdown() {
  const menu = document.getElementById('user-dropdown-menu');
  if (menu) menu.classList.toggle('active');
}

function closeUserDropdown() {
  document.getElementById('user-dropdown-menu')?.classList.remove('active');
}

function updateAuthUI() {
  const userBtnText = document.getElementById('user-btn-name');
  const userBtn = document.getElementById('user-account-btn');
  const userDropdown = document.getElementById('user-dropdown-menu');
  const mobileAuthText = document.getElementById('mobile-nav-auth-text');
  const adminDropdownLinks = document.querySelectorAll('#dropdown-admin-link, #user-menu-admin-item, .admin-only-item, .btn-admin-nav-direct');
  const mobileAdminItems = document.querySelectorAll('#mobile-nav-admin-item, .mobile-admin-item');
  const profileAdminCard = document.getElementById('profile-admin-card');
  const profileAdminRoleBadge = document.getElementById('profile-admin-role-badge');

  // Auto-upgrade role if email is an admin
  if (state.currentUser && isUserAdmin(state.currentUser) && !state.currentUser.role) {
    state.currentUser.role = state.currentUser.email === 'taller@matesrio.com' ? 'Taller & Depósito' : 'Super Administrador';
    localStorage.setItem('mates_rio_user', JSON.stringify(state.currentUser));
    localStorage.setItem('mates_rio_admin_session', JSON.stringify(state.currentUser));
  }

  const isAdmin = isUserAdmin(state.currentUser);

  // Show/Hide admin panel links in dropdowns & navbar
  adminDropdownLinks.forEach(link => {
    link.style.display = isAdmin ? 'flex' : 'none';
  });

  // Show/Hide admin panel link in mobile menu drawer
  mobileAdminItems.forEach(item => {
    item.style.display = isAdmin ? 'block' : 'none';
  });

  // Show/Hide admin panel banner inside Profile Modal
  if (profileAdminCard) {
    profileAdminCard.style.display = isAdmin ? 'block' : 'none';
    if (profileAdminRoleBadge && state.currentUser) {
      profileAdminRoleBadge.textContent = state.currentUser.role || 'ADMIN';
    }
  }

  // Floating quick add button is disabled (now managed exclusively from the admin panel)
  const floatingAddBtn = document.getElementById('admin-floating-add-btn');
  if (floatingAddBtn) {
    floatingAddBtn.style.display = 'none';
  }

  if (state.currentUser) {
    const firstName = state.currentUser.name ? state.currentUser.name.split(' ')[0] : 'Usuario';
    if (userBtnText) userBtnText.textContent = isAdmin ? 'Admin' : firstName;
    if (mobileAuthText) mobileAuthText.textContent = `Hola, ${firstName} (${isAdmin ? 'Admin' : 'Mi Perfil'})`;
    if (userBtn) {
      userBtn.onclick = (e) => {
        e.stopPropagation();
        toggleUserDropdown();
      };
      userBtn.title = `Cuenta de ${state.currentUser.name}${isAdmin ? ' (Administrador)' : ''}`;
      userBtn.style.borderColor = isAdmin ? 'var(--accent-gold)' : 'var(--accent-leather)';
      if (isAdmin) {
        userBtn.classList.add('admin-active');
      } else {
        userBtn.classList.remove('admin-active');
      }
    }
  } else {
    if (userBtnText) userBtnText.textContent = "Ingresar";
    if (mobileAuthText) mobileAuthText.textContent = "Mi Cuenta / Ingresar";
    if (userBtn) {
      userBtn.onclick = () => openAuthModal('login');
      userBtn.title = "Iniciar sesión o Registrarse";
      userBtn.style.borderColor = 'var(--border-light)';
      userBtn.classList.remove('admin-active');
    }
    if (userDropdown) userDropdown.classList.remove('active');
  }
}

function handleMobileAuthClick() {
  closeMobileDrawer();
  if (state.currentUser) {
    openProfileModal();
  } else {
    openAuthModal('login');
  }
}

// User Profile & Orders Modal with Location and Tabs
function switchProfileTab(tab) {
  const tabProfileBtn = document.getElementById('profile-tab-btn-info');
  const tabOrdersBtn = document.getElementById('profile-tab-btn-orders');
  const panelProfile = document.getElementById('profile-panel-info');
  const panelOrders = document.getElementById('profile-panel-orders');

  if (tab === 'orders') {
    tabOrdersBtn?.classList.add('active');
    tabProfileBtn?.classList.remove('active');
    panelOrders?.classList.add('active');
    panelProfile?.classList.remove('active');
  } else {
    tabProfileBtn?.classList.add('active');
    tabOrdersBtn?.classList.remove('active');
    panelProfile?.classList.add('active');
    panelOrders?.classList.remove('active');
  }
}

function openProfileModal(initialTab = 'profile') {
  closeUserDropdown();
  const modal = document.getElementById('profile-modal');
  if (!modal || !state.currentUser) return;

  switchProfileTab(initialTab);

  // Populate Profile Info
  const nameEl = document.getElementById('profile-name-display');
  const emailEl = document.getElementById('profile-email-display');
  const phoneEl = document.getElementById('profile-phone-display');
  const profileAdminCard = document.getElementById('profile-admin-card');
  const profileAdminRoleBadge = document.getElementById('profile-admin-role-badge');

  if (nameEl) nameEl.textContent = state.currentUser.name;
  if (emailEl) emailEl.textContent = state.currentUser.email;
  if (phoneEl) phoneEl.textContent = state.currentUser.phone || "No especificado";

  // Populate Location Form
  const addr = state.currentUser.address || state.currentUser.location || {};
  const provEl = document.getElementById('profile-input-province');
  const cityEl = document.getElementById('profile-input-city');
  const streetEl = document.getElementById('profile-input-street') || document.getElementById('profile-input-address');
  const zipEl = document.getElementById('profile-input-zip');
  const notesEl = document.getElementById('profile-input-notes');

  if (provEl) provEl.value = addr.province || 'Córdoba';
  if (cityEl) cityEl.value = addr.city || '';
  if (streetEl) streetEl.value = addr.street || addr.address || '';
  if (zipEl) zipEl.value = addr.zip || '';
  if (notesEl) notesEl.value = addr.notes || '';

  // Calculate & show shipping zone hint for this user
  updateProfileLocationZoneHint();

  const isAdmin = isUserAdmin(state.currentUser);
  if (profileAdminCard) {
    profileAdminCard.style.display = isAdmin ? 'block' : 'none';
    if (profileAdminRoleBadge) {
      profileAdminRoleBadge.textContent = state.currentUser.role || 'ADMIN';
    }
  }

  if (ordersListEl) {
    if (state.orders.length === 0) {
      ordersListEl.innerHTML = `<p style="color: var(--text-muted); font-size: 0.88rem; text-align: center; padding: 20px;">Aún no realizaste ningún pedido.</p>`;
    } else {
      ordersListEl.innerHTML = state.orders.map(ord => `
        <div style="background: var(--bg-main); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 14px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.88rem;">
            <span>Pedido #${ord.id}</span>
            <span style="color: var(--accent-leather); font-size: 0.95rem;">${formatARS(ord.total)}</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 6px 0;">${ord.items}</p>
          <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--text-muted); margin-top: 6px; border-top: 1px dashed var(--border-light); padding-top: 6px;">
            <span>Fecha: ${ord.date}</span>
            <span style="color: #27ae60; font-weight: 700;"><i class="fas fa-truck"></i> ${ord.status}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Populate Orders List for this specific user
  renderProfileOrders();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateProfileLocationZoneHint() {
  const hintEl = document.getElementById('profile-location-zone-hint');
  if (!hintEl) return;
  const prov = document.getElementById('profile-input-province')?.value || 'Córdoba';
  const city = document.getElementById('profile-input-city')?.value || '';
  const zone = calculateShippingZone(prov, city);
  hintEl.innerHTML = `
    <div style="font-size: 0.8rem; color: var(--accent-leather); display: flex; align-items: center; gap: 6px; margin-top: 6px;">
      <i class="fas fa-truck"></i> <span>Zona asignada: <b>${zone.name}</b> (${formatARS(zone.cost)} / ${zone.time})</span>
    </div>
  `;
}

function saveUserLocation(e) {
  if (e) e.preventDefault();
  if (!state.currentUser) return;

  const province = document.getElementById('profile-input-province')?.value || 'Córdoba';
  const city = document.getElementById('profile-input-city')?.value.trim() || '';
  const street = document.getElementById('profile-input-street')?.value.trim() || '';
  const zip = document.getElementById('profile-input-zip')?.value.trim() || '';
  const notes = document.getElementById('profile-input-notes')?.value.trim() || '';

  state.currentUser.address = { province, city, street, zip, notes };

  // Update in user db & local storage
  localStorage.setItem('mates_rio_user', JSON.stringify(state.currentUser));
  const userIdx = state.usersDb.findIndex(u => u.email.toLowerCase() === state.currentUser.email.toLowerCase());
  if (userIdx !== -1) {
    state.usersDb[userIdx].address = state.currentUser.address;
    localStorage.setItem('mates_rio_users_db', JSON.stringify(state.usersDb));
  }

  updateProfileLocationZoneHint();
  showToast('¡Ubicación y dirección guardadas correctamente!', 'fa-check-circle');
}

function renderProfileOrders() {
  const ordersListEl = document.getElementById('profile-orders-list');
  if (!ordersListEl || !state.currentUser) return;

  // Filter orders by currentUser email or name
  const currentEmail = (state.currentUser.email || '').toLowerCase();
  const currentName = (state.currentUser.name || '').toLowerCase();
  const userOrders = state.orders.filter(ord => {
    const oEmail = (ord.customerEmail || '').toLowerCase();
    const oName = (ord.customerName || '').toLowerCase();
    return oEmail === currentEmail || oName === currentName || (!ord.customerEmail && currentEmail.includes('juan'));
  });

  const ordersCountBadge = document.getElementById('profile-orders-tab-count');
  if (ordersCountBadge) {
    ordersCountBadge.textContent = userOrders.length;
  }

  if (userOrders.length === 0) {
    ordersListEl.innerHTML = `
      <div style="text-align: center; padding: 32px 16px;">
        <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-main); display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1.3rem; margin-bottom: 12px;">
          <i class="fas fa-box-open"></i>
        </div>
        <h5 style="font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 6px;">Aún no realizaste ningún pedido</h5>
        <p style="color: var(--text-secondary); font-size: 0.84rem; max-width: 320px; margin: 0 auto 16px;">
          Elegí tu mate imperial favorito o armá tu set personalizado y viví la experiencia Mates Río.
        </p>
        <button class="btn btn-primary" onclick="closeProfileModal(); window.location.href='catalogo.html';" style="font-size: 0.82rem; padding: 9px 18px;">
          <i class="fas fa-store"></i> Explorar Catálogo
        </button>
      </div>
    `;
    return;
  }

  ordersListEl.innerHTML = userOrders.map(ord => `
    <div style="background: var(--bg-main); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
        <div>
          <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">Pedido #${ord.id}</span>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            <i class="far fa-calendar-alt"></i> ${ord.date}
          </div>
        </div>
        <span style="color: var(--accent-leather); font-size: 1.05rem; font-weight: 800;">${formatARS(ord.total)}</span>
      </div>

      <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 6px 0; line-height: 1.4;">
        <b>Productos:</b> ${ord.items}
      </p>

      ${ord.address ? `
        <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px;">
          <i class="fas fa-map-marker-alt" style="color: var(--accent-gold);"></i> <b>Entrega en:</b> ${ord.address}
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; border-top: 1px dashed var(--border-light); padding-top: 8px; margin-top: 6px;">
        <span style="color: #27ae60; font-weight: 700;">
          <i class="fas fa-truck"></i> ${ord.status}
        </span>
        <button class="btn btn-outline-dark" onclick="startDirectWhatsAppChat('¡Hola Mates Río! Quisiera consultar sobre el estado de mi pedido #${ord.id}')" style="font-size: 0.72rem; padding: 4px 10px;">
          <i class="fab fa-whatsapp"></i> Consultar
        </button>
      </div>
    </div>
  `).join('');
}

function closeProfileModal() {
  document.getElementById('profile-modal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function switchProfileTab(tab) {
  const panelInfo = document.getElementById('profile-panel-info');
  const panelOrders = document.getElementById('profile-panel-orders');
  const btnInfo = document.getElementById('profile-tab-btn-info');
  const btnOrders = document.getElementById('profile-tab-btn-orders');

  if (tab === 'profile') {
    if (panelInfo) panelInfo.style.display = 'block';
    if (panelOrders) panelOrders.style.display = 'none';
    if (btnInfo) btnInfo.classList.add('active');
    if (btnOrders) btnOrders.classList.remove('active');
  } else if (tab === 'orders') {
    if (panelInfo) panelInfo.style.display = 'none';
    if (panelOrders) panelOrders.style.display = 'block';
    if (btnInfo) btnInfo.classList.remove('active');
    if (btnOrders) btnOrders.classList.add('active');
  }
}

function saveUserLocation(event) {
  if (event) event.preventDefault();
  if (!state.currentUser) {
    showToast("Debes iniciar sesión para guardar tu dirección", "fa-exclamation-circle");
    return;
  }

  const province = document.getElementById('profile-input-province')?.value || '';
  const city = document.getElementById('profile-input-city')?.value || '';
  const address = document.getElementById('profile-input-address')?.value || '';
  const zip = document.getElementById('profile-input-zip')?.value || '';

  state.currentUser.location = { province, city, address, zip };
  localStorage.setItem('mates_rio_user', JSON.stringify(state.currentUser));

  const cpInput = document.getElementById('cart-cp-input');
  if (cpInput && zip) cpInput.value = zip;

  const hint = document.getElementById('profile-location-zone-hint');
  if (hint) {
    hint.textContent = `✓ Ubicación guardada: ${city}, ${province} (CP ${zip})`;
    hint.style.display = 'block';
  }

  showToast("¡Dirección de entrega guardada correctamente!", "fa-check-circle");
}

// ==========================================================================
// QUICK VIEW MODAL
// ==========================================================================
let currentQuickViewProduct = null;

function openQuickView(productId) {
  if (typeof PRODUCTS_DATA === 'undefined') return;
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;
  currentQuickViewProduct = product;

  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;

  const imgEl = document.getElementById('qv-image');
  const titleEl = document.getElementById('qv-title');
  const catEl = document.getElementById('qv-category');
  const priceEl = document.getElementById('qv-price');
  const origPriceEl = document.getElementById('qv-orig-price');
  const descEl = document.getElementById('qv-description');
  const specsEl = document.getElementById('qv-specs');
  const ratingEl = document.getElementById('qv-rating');
  const badgeEl = document.getElementById('qv-badge');
  const qtyInput = document.getElementById('qv-qty');

  if (imgEl) imgEl.src = product.image;
  if (titleEl) titleEl.textContent = product.name;
  if (catEl) catEl.textContent = product.categoryName;
  if (priceEl) priceEl.textContent = formatARS(product.price);
  if (origPriceEl) {
    if (product.originalPrice) {
      origPriceEl.textContent = formatARS(product.originalPrice);
      origPriceEl.style.display = 'inline';
    } else {
      origPriceEl.style.display = 'none';
    }
  }
  if (descEl) descEl.textContent = product.description;
  if (qtyInput) qtyInput.value = 1;

  if (ratingEl) {
    ratingEl.innerHTML = `${getStarRatingHtml(product.rating)} <span style="font-size: 0.78rem; color: #888;">(${product.reviewsCount} opiniones)</span>`;
  }

  if (badgeEl) {
    if (product.badge) {
      badgeEl.textContent = product.badge;
      badgeEl.className = `badge-tag ${product.badgeType || 'promo'}`;
      badgeEl.style.display = 'inline-block';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  // Specs
  if (specsEl && product.specs) {
    specsEl.innerHTML = Object.entries(product.specs).map(([key, val]) => `
      <li><b>${capitalizeFirstLetter(key)}:</b> ${val}</li>
    `).join('');
  }

  const btnPersonalize = document.getElementById('qv-btn-personalize');
  if (btnPersonalize) {
    const isMate = product.category === 'mates' || (product.specs && product.specs.virola);
    btnPersonalize.style.display = isMate ? 'flex' : 'none';
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function closeQuickView() {
  document.getElementById('quick-view-modal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function changeQuickViewQty(delta) {
  const q = document.getElementById('qv-qty');
  if (!q) return;
  const current = parseInt(q.value, 10) || 1;
  const next = current + delta;
  if (next >= 1 && next <= 99) {
    q.value = next;
  }
}
window.changeQuickViewQty = changeQuickViewQty;

function goToPersonalizarMate(productId) {
  window.location.href = `personaliza-tu-mate.html?mate=${encodeURIComponent(productId || '')}`;
}
window.goToPersonalizarMate = goToPersonalizarMate;

function addQuickViewToCart() {
  if (!currentQuickViewProduct) return;
  const qtyInput = document.getElementById('qv-qty');
  const qty = parseInt(qtyInput?.value || 1, 10);
  addToCart(currentQuickViewProduct.id, qty);
  closeQuickView();
}

function consultProductWhatsApp() {
  if (!currentQuickViewProduct) return;
  const msg = `¡Hola Mates Río! Quisiera consultar sobre el producto: *${currentQuickViewProduct.name}* (${formatARS(currentQuickViewProduct.price)}). ¿Tienen stock disponible y me asesoran? ¡Muchas gracias!`;
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ==========================================================================
// FLOATING WHATSAPP & CHAT POPUP
// ==========================================================================
function toggleWhatsAppChat() {
  const popup = document.getElementById('whatsapp-chat-popup');
  if (popup) {
    popup.classList.toggle('active');
  }
}

function startDirectWhatsAppChat(customMessage = null) {
  const msg = customMessage || `¡Hola Mates Río! Estuve viendo la tienda online y quisiera hacer una consulta sobre mates y termos.`;
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ==========================================================================
// MOBILE DRAWER MENU
// ==========================================================================
function openMobileDrawer() {
  document.getElementById('mobile-nav-drawer')?.classList.add('active');
  document.getElementById('mobile-nav-overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
  document.getElementById('mobile-nav-drawer')?.classList.remove('active');
  document.getElementById('mobile-nav-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function handleMobileAuthClick() {
  closeMobileDrawer();
  if (state.currentUser) {
    openProfileModal();
  } else {
    openAuthModal('login');
  }
}

// Admin Web Product Creator Modals (Redirects to Admin Panel)
function openAdminAddProductModal() {
  window.location.href = 'admin.html#sec-inventory';
}

function closeAdminAddProductModal() {
  const modal = document.getElementById('admin-add-product-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handleAdminCreateProductWeb(event) {
  if (event) event.preventDefault();
  const nameEl = document.getElementById('admin-web-name');
  const catEl = document.getElementById('admin-web-category');
  const priceEl = document.getElementById('admin-web-price');
  const origPriceEl = document.getElementById('admin-web-orig-price');
  const stockEl = document.getElementById('admin-web-stock');
  const badgeEl = document.getElementById('admin-web-badge');
  const badgeTypeEl = document.getElementById('admin-web-badge-type');
  const imgSelectEl = document.getElementById('admin-web-img-select');
  const imgCustomEl = document.getElementById('admin-web-img-custom');
  const descEl = document.getElementById('admin-web-desc');

  if (!nameEl || !priceEl) return;

  const image = (imgSelectEl && imgSelectEl.value === 'custom' && imgCustomEl && imgCustomEl.value.trim())
    ? imgCustomEl.value.trim()
    : (imgSelectEl ? imgSelectEl.value : 'assets/images/prod_mate_imperial.jpg');

  const newProduct = {
    id: `prod-custom-${Date.now()}`,
    name: nameEl.value.trim(),
    category: catEl ? catEl.value : 'mates',
    categoryName: catEl ? catEl.options[catEl.selectedIndex].text.toUpperCase() : 'MATES',
    price: parseFloat(priceEl.value) || 0,
    originalPrice: origPriceEl && origPriceEl.value ? parseFloat(origPriceEl.value) : null,
    stock: stockEl ? parseInt(stockEl.value, 10) : 10,
    inStock: true,
    badge: badgeEl && badgeEl.value.trim() ? badgeEl.value.trim() : null,
    badgeType: badgeTypeEl ? badgeTypeEl.value : 'promo',
    image: image,
    rating: 5.0,
    reviewsCount: 1,
    description: descEl ? descEl.value.trim() : '',
    specs: {
      material: "Selección artesanal Mates Río",
      garantia: "Garantía artesanal oficial de 6 meses"
    }
  };

  try {
    const customList = JSON.parse(localStorage.getItem('mates_rio_custom_products')) || [];
    customList.unshift(newProduct);
    localStorage.setItem('mates_rio_custom_products', JSON.stringify(customList));

    if (typeof PRODUCTS_DATA !== 'undefined') {
      PRODUCTS_DATA.unshift(newProduct);
    }

    closeAdminAddProductModal();
    if (typeof renderProducts === 'function') renderProducts();
    showToast("¡Producto publicado en el catálogo con éxito!", "fa-check-circle");

    const form = document.getElementById('admin-web-product-form');
    if (form) form.reset();
  } catch (err) {
    console.error("Error guardando producto:", err);
    alert("Error al publicar el producto: " + err.message);
  }
}

// ==========================================================================
// HOW TO CURE TABS SWITCHER
// ==========================================================================
const CURE_GUIDE_DATA = {
  calabaza: [
    { num: "01", title: "Llenar con Yerba Húmeda", desc: "Colocá yerba mate ya usada (húmeda y tibia) hasta el borde del mate. No uses agua hirviendo ya que puede quebrar la calabaza natural." },
    { num: "02", title: "Reposar 24 Horas", desc: "Dejalo reposar por 24 horas completas. Si notás que la yerba absorbió toda la humedad, agregale un chorrito de agua tibia para mantener el proceso." },
    { num: "03", title: "Raspar Suavemente", desc: "Vaciá el mate y con una cuchara sopera raspá suavemente las paredes internas para retirar el hollejo suelto. Enjuagá y tu mate ya está listo." }
  ],
  algarrobo: [
    { num: "01", title: "Untar con Grasa o Aceite", desc: "Untá todo el interior de la madera de algarrobo con manteca, aceite de coco o grasa vacuna para sellar los poros de la madera." },
    { num: "02", title: "Dejar Reposar 48 Horas", desc: "Dejalo en un lugar seco y templado para que la madera absorba los aceites y no se raje con el choque térmico." },
    { num: "03", title: "Lavado Suave", desc: "Enjuagá con agua tibia y jabón neutro, secá con servilleta de papel y cebá tu primera ronda de mate." }
  ],
  cuidados: [
    { num: "01", title: "Vaciado Inmediato", desc: "Nunca dejes la yerba húmeda de un día para el otro adentro del mate para evitar la formación de hongos y moho." },
    { num: "02", title: "Secado Boca Arriba", desc: "Lavá con agua tibia sin detergente y dejalo secar inclinado o boca arriba con una servilleta adentro que absorba la humedad." },
    { num: "03", title: "Cuidado de la Virola", desc: "Secá la virola y la base de alpaca con un paño seco para conservar su brillo artesanal espejo impecable." }
  ]
};

function switchCureTab(type) {
  document.querySelectorAll('.cure-tab-pill').forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-cure-tab') === type);
  });

  const grid = document.getElementById('cure-steps-grid');
  if (!grid || !CURE_GUIDE_DATA[type]) return;

  grid.innerHTML = CURE_GUIDE_DATA[type].map(step => `
    <div class="cure-step-card">
      <div class="step-number">${step.num}</div>
      <h4>${step.title}</h4>
      <p>${step.desc}</p>
    </div>
  `).join('');
}

// ==========================================================================
// APP INITIALIZATION & EVENT LISTENERS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 0. Parse URL query parameters (e.g. catalogo.html?categoria=mates or ?buscar=imperial)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('categoria') || urlParams.get('category');
    const searchParam = urlParams.get('buscar') || urlParams.get('q') || urlParams.get('search');
    const focusParam = urlParams.get('focus');

    if (catParam) {
      state.activeCategory = catParam.toLowerCase();
    }
    if (searchParam) {
      state.searchQuery = searchParam;
    }
  } catch (err) {
    console.warn('URL params parsing error:', err);
  }

  // 0.5. Init Theme Mode & Special Occasion Banner
  initThemeMode();
  renderSpecialOccasionBanner();

  // 1. Init Hero Banner Slider
  initSlider();

  // 2. Render Categories
  renderCategoriesGrid();

  // 2.5. Render Subcategory filter bar if category active
  if (state.activeCategory && state.activeCategory !== 'all') {
    renderSubcategoriesFilterBar(state.activeCategory);
  }

  // 3. Render Catalog
  renderProducts();

  // Apply search query into search input & highlight active category pill if URL set state
  const searchInputInit = document.getElementById('catalog-search-input');
  const clearBtnInit = document.getElementById('search-clear-btn');
  if (searchInputInit && state.searchQuery) {
    searchInputInit.value = state.searchQuery;
    if (clearBtnInit) clearBtnInit.classList.add('visible');
  }

  if (state.activeCategory) {
    document.querySelectorAll('.filter-pill').forEach(pill => {
      const pillCat = pill.getAttribute('data-category');
      const isActive = pillCat === state.activeCategory;
      pill.classList.toggle('active', isActive);
      if (isActive && typeof pill.scrollIntoView === 'function') {
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('focus') === 'search' && searchInputInit) {
      setTimeout(() => searchInputInit.focus(), 350);
    }
  } catch (e) {}

  // 4. Update Cart & Auth state
  updateCartUI();
  updateAuthUI();

  // 5. Sticky Header Scroll Effect & Scroll Progress Bar
  const header = document.querySelector('.site-header');
  const progressBar = document.getElementById('scroll-progress-bar');
  const backToTopBtn = document.getElementById('back-to-top-btn');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header sticky shadow
    if (scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Scroll progress calculation
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }

    // Back to top button visibility
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', scrollY > 350);
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 6. Live Search Input Debounce
  const searchInput = document.getElementById('catalog-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  let searchTimer = null;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      state.searchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.classList.toggle('visible', state.searchQuery.length > 0);
      }
      searchTimer = setTimeout(() => {
        renderProducts();
      }, 250);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      state.searchQuery = '';
      clearBtn.classList.remove('visible');
      renderProducts();
    });
  }

  // 7. Sort & Price Select Listeners
  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderProducts();
    });
  }

  const priceSelect = document.getElementById('catalog-price-select');
  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      state.priceRange = e.target.value;
      renderProducts();
    });
  }

  // 8. Category Filter Pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.getAttribute('data-category');
      setCategoryFilter(cat);
    });
  });

  // 9. Payment Method radio change updates checkout summary
  document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateCheckoutSummary();
    });
  });

  // 10. Close dropdowns and popups on document click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-btn-wrap')) {
      closeUserDropdown();
    }
    if (!e.target.closest('.floating-whatsapp-container')) {
      document.getElementById('whatsapp-chat-popup')?.classList.remove('active');
    }
  });

  // 11. Close Modals on Overlay Click or ESC Key
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      closeCartDrawer();
      closeMobileDrawer();
      document.getElementById('whatsapp-chat-popup')?.classList.remove('active');
      closeUserDropdown();
      document.body.style.overflow = '';
    }
  });

  // 12. Newsletter Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email')?.value;
      if (email) {
        showToast('¡Gracias por unirte! Tu cupón de 10% OFF es: MATERIO10');
        newsletterForm.reset();
      }
    });
  }

  // 13. Auto open cart drawer if returning from customizer
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('openCart') === 'true') {
    setTimeout(() => {
      openCartDrawer();
      showToast('¡Mate personalizado guardado en tu carrito!', 'fa-check-circle');
    }, 350);
  }

  // 14. Initialize Customizer if container exists and not already handled by dedicated customizer.js
  if (document.getElementById('customizer-mates-grid') && typeof initStudio !== 'function' && typeof initCustomizer === 'function') {
    initCustomizer();
  }
});

// ==========================================================================
// PERSONALIZÁ TU MATE: VIROLA ENGRAVING STUDIO ENGINE
// ==========================================================================
const customizerState = {
  selectedMateId: 'mate-1',
  technique: 'laser', // 'laser' | 'cincelado' | 'fotograbado'
  designTab: 'texto', // 'texto' | 'escudos' | 'criollo' | 'logo'
  text: 'JUAN & SOFÍA',
  font: 'gauchesca', // 'gauchesca' | 'cursiva' | 'serif' | 'sans'
  location: 'frente', // 'frente' | 'ambos' | 'completa'
  selectedGraphicId: null,
  uploadedFileName: null,
  uploadedFileDataUrl: null,
  notes: ''
};

const TECHNIQUES = {
  laser: {
    id: 'laser',
    name: 'Grabado Láser HD (Oscuro)',
    shortName: 'Láser HD',
    finishDesc: 'Contraste negro nítido milimétrico',
    cost: 0
  },
  cincelado: {
    id: 'cincelado',
    name: 'Cincelado Orfebre (Plateado)',
    shortName: 'Cincelado Orfebre',
    finishDesc: 'Bajo relieve esculpido sobre alpaca con brillo artesanal',
    cost: 0
  },
  fotograbado: {
    id: 'fotograbado',
    name: 'Fotograbado Satinado (Gris)',
    shortName: 'Fotograbado Satinado',
    finishDesc: 'Tono gris mate sedoso y sutil',
    cost: 0
  }
};

const FONTS = {
  gauchesca: { id: 'gauchesca', name: 'Gauchesca / Criolla', cssClass: 'font-gauchesca' },
  cursiva: { id: 'cursiva', name: 'Cursiva Elegante', cssClass: 'font-cursiva' },
  serif: { id: 'serif', name: 'Clásica Romana', cssClass: 'font-serif' },
  sans: { id: 'sans', name: 'Moderna Sans', cssClass: 'font-sans' }
};

const LOCATIONS = {
  frente: { id: 'frente', name: 'Frente centrado' },
  ambos: { id: 'ambos', name: 'Frente y Dorso' },
  completa: { id: 'completa', name: 'Vuelta completa' }
};

const GRAPHICS = {
  'none': {
    id: 'none',
    name: 'Sin escudo (Solo texto)',
    category: 'all',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`
  },
  'afa': {
    id: 'afa',
    name: 'AFA 3 Estrellas',
    category: 'escudos',
    svg: `<img src="assets/images/designs/afa.svg" alt="AFA 3 Estrellas" class="graphic-crest-img" />`
  },
  'boca': {
    id: 'boca',
    name: 'Boca Juniors',
    category: 'escudos',
    svg: `<img src="assets/images/designs/boca.svg" alt="Boca Juniors" class="graphic-crest-img" />`
  },
  'river': {
    id: 'river',
    name: 'River Plate',
    category: 'escudos',
    svg: `<img src="assets/images/designs/river.svg" alt="River Plate" class="graphic-crest-img" />`
  },
  'racing': {
    id: 'racing',
    name: 'Racing Club',
    category: 'escudos',
    svg: `<img src="assets/images/designs/racing.svg" alt="Racing Club" class="graphic-crest-img" />`
  },
  'independiente': {
    id: 'independiente',
    name: 'Independiente',
    category: 'escudos',
    svg: `<img src="assets/images/designs/independiente.svg" alt="Independiente" class="graphic-crest-img" />`
  },
  'sanlorenzo': {
    id: 'sanlorenzo',
    name: 'San Lorenzo',
    category: 'escudos',
    svg: `<img src="assets/images/designs/sanlorenzo.svg" alt="San Lorenzo" class="graphic-crest-img" />`
  },
  'belgrano': {
    id: 'belgrano',
    name: 'Belgrano',
    category: 'escudos',
    svg: `<img src="assets/images/designs/belgrano.svg" alt="Belgrano" class="graphic-crest-img" />`
  },
  'talleres': {
    id: 'talleres',
    name: 'Talleres',
    category: 'escudos',
    svg: `<img src="assets/images/designs/talleres.svg" alt="Talleres" class="graphic-crest-img" />`
  },
  'instituto': {
    id: 'instituto',
    name: 'Instituto',
    category: 'escudos',
    svg: `<img src="assets/images/designs/instituto.svg" alt="Instituto" class="graphic-crest-img" />`
  },
  'racingcordoba': {
    id: 'racingcordoba',
    name: 'Racing de Córdoba',
    category: 'escudos',
    svg: `<img src="assets/images/designs/racingcordoba.svg" alt="Racing de Córdoba" class="graphic-crest-img" />`
  },
  'soldemayo': {
    id: 'soldemayo',
    name: 'Sol de Mayo',
    category: 'criollo',
    svg: `<img src="assets/images/designs/soldemayo.svg" alt="Sol de Mayo" class="graphic-crest-img" />`
  },
  'guardapampa': {
    id: 'guardapampa',
    name: 'Guarda Pampa',
    category: 'criollo',
    svg: `<img src="assets/images/designs/guardapampa.svg" alt="Guarda Pampa" class="graphic-crest-img" />`
  },
  'malvinas': {
    id: 'malvinas',
    name: 'Islas Malvinas',
    category: 'criollo',
    svg: `<img src="assets/images/designs/malvinas.svg" alt="Islas Malvinas" class="graphic-crest-img" />`
  },
  'caballo': {
    id: 'caballo',
    name: 'Caballo Criollo',
    category: 'criollo',
    svg: `<img src="assets/images/designs/caballo.svg" alt="Caballo Criollo" class="graphic-crest-img" />`
  },
  'mapa': {
    id: 'mapa',
    name: 'Silueta Argentina',
    category: 'criollo',
    svg: `<img src="assets/images/designs/mapa.svg" alt="Silueta Argentina" class="graphic-crest-img" />`
  }
};

function initCustomizer() {
  renderCustomizerMates();
  renderCustomizerGraphics();
  updateVirolaSimulator();
}

function renderCustomizerMates() {
  const container = document.getElementById('customizer-mates-grid');
  if (!container || typeof PRODUCTS_DATA === 'undefined') return;

  const mates = PRODUCTS_DATA.filter(p => p.category === 'mates');
  if (mates.length === 0) return;

  container.innerHTML = mates.map(mate => {
    const isSelected = customizerState.selectedMateId === mate.id;
    return `
      <div class="custom-mate-card ${isSelected ? 'active' : ''}" id="custom-mate-card-${mate.id}" onclick="selectEngraveMate('${mate.id}')">
        <img src="${mate.image}" alt="${mate.name}" class="custom-mate-thumb" />
        <div class="custom-mate-meta">
          <strong class="custom-mate-name">${mate.name}</strong>
          <span class="custom-mate-virola">${mate.specs?.virola || 'Virola de Alpaca'}</span>
          <span class="custom-mate-price">${formatARS(mate.price)}</span>
        </div>
        <div class="custom-mate-radio"><i class="fas fa-check"></i></div>
      </div>
    `;
  }).join('');
}

function renderCustomizerGraphics() {
  const escudosContainer = document.getElementById('escudos-selector-grid');
  const criollosContainer = document.getElementById('criollos-selector-grid');

  if (escudosContainer) {
    const escudos = Object.values(GRAPHICS).filter(g => g.category === 'escudos' || g.id === 'none');
    escudosContainer.innerHTML = escudos.map(g => {
      const isSelected = customizerState.selectedGraphicId === g.id;
      return `
        <button type="button" class="graphic-btn ${isSelected ? 'active' : ''}" data-graphic-id="${g.id}" onclick="selectGraphic('${g.id}')" title="${g.name}">
          <div class="graphic-svg-wrap">${g.svg}</div>
          <span class="graphic-btn-name">${g.name}</span>
        </button>
      `;
    }).join('');
  }

  if (criollosContainer) {
    const criollos = Object.values(GRAPHICS).filter(g => g.category === 'criollo' || g.id === 'none');
    criollosContainer.innerHTML = criollos.map(g => {
      const isSelected = customizerState.selectedGraphicId === g.id;
      return `
        <button type="button" class="graphic-btn ${isSelected ? 'active' : ''}" data-graphic-id="${g.id}" onclick="selectGraphic('${g.id}')" title="${g.name}">
          <div class="graphic-svg-wrap">${g.svg}</div>
          <span class="graphic-btn-name">${g.name}</span>
        </button>
      `;
    }).join('');
  }
}

function selectEngraveMate(mateId) {
  customizerState.selectedMateId = mateId;
  document.querySelectorAll('.custom-mate-card').forEach(c => {
    c.classList.toggle('active', c.id === `custom-mate-card-${mateId}`);
  });
  updateVirolaSimulator();
}

function selectEngraveTechnique(techId) {
  if (!TECHNIQUES[techId]) return;
  customizerState.technique = techId;
  document.querySelectorAll('.technique-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-technique') === techId);
  });
  updateVirolaSimulator();
}

function switchDesignTab(tabId) {
  customizerState.designTab = tabId;
  document.querySelectorAll('.design-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-design-tab') === tabId);
  });
  document.querySelectorAll('.design-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `design-panel-${tabId}`);
  });
  updateVirolaSimulator();
}

function onCustomTextChange(val) {
  customizerState.text = val.slice(0, 30);
  const countEl = document.getElementById('text-char-count');
  if (countEl) countEl.textContent = `${customizerState.text.length} / 30`;
  updateVirolaSimulator();
}

function clearCustomText() {
  const input = document.getElementById('custom-text-input');
  if (input) input.value = '';
  onCustomTextChange('');
  input?.focus();
}

function selectEngraveFont(fontId) {
  if (!FONTS[fontId]) return;
  customizerState.font = fontId;
  document.querySelectorAll('.font-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-font') === fontId);
  });
  updateVirolaSimulator();
}

function selectLocation(locId) {
  if (!LOCATIONS[locId]) return;
  customizerState.location = locId;
  document.querySelectorAll('.location-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-loc') === locId);
  });
  updateVirolaSimulator();
}

function selectGraphic(graphicId) {
  if (graphicId === 'none' || customizerState.selectedGraphicId === graphicId) {
    customizerState.selectedGraphicId = null;
  } else {
    customizerState.selectedGraphicId = graphicId;
  }

  document.querySelectorAll('.graphic-btn').forEach(btn => {
    const id = btn.getAttribute('data-graphic-id');
    btn.classList.toggle('active', id === (customizerState.selectedGraphicId || 'none'));
  });

  updateVirolaSimulator();
}

function handleLogoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  customizerState.uploadedFileName = file.name;

  const reader = new FileReader();
  reader.onload = (event) => {
    customizerState.uploadedFileDataUrl = event.target?.result;
    const previewImg = document.getElementById('engraving-uploaded-preview');
    if (previewImg) previewImg.src = customizerState.uploadedFileDataUrl;

    const chip = document.getElementById('uploaded-logo-chip');
    const chipName = document.getElementById('uploaded-logo-name');
    if (chip && chipName) {
      chipName.textContent = file.name;
      chip.style.display = 'inline-flex';
    }

    updateVirolaSimulator();
    showToast(`Logo "${file.name}" cargado para grabado en virola`, 'fa-check');
  };
  reader.readAsDataURL(file);
}

function removeUploadedLogo() {
  customizerState.uploadedFileName = null;
  customizerState.uploadedFileDataUrl = null;

  const fileInput = document.getElementById('custom-logo-file');
  if (fileInput) fileInput.value = '';

  const chip = document.getElementById('uploaded-logo-chip');
  if (chip) chip.style.display = 'none';

  updateVirolaSimulator();
}

function resetCustomizerForm() {
  customizerState.selectedMateId = 'mate-1';
  customizerState.technique = 'laser';
  customizerState.designTab = 'texto';
  customizerState.text = 'JUAN & SOFÍA';
  customizerState.font = 'gauchesca';
  customizerState.location = 'frente';
  customizerState.selectedGraphicId = null;
  customizerState.uploadedFileName = null;
  customizerState.uploadedFileDataUrl = null;

  const textInput = document.getElementById('custom-text-input');
  if (textInput) textInput.value = 'JUAN & SOFÍA';
  const notesInput = document.getElementById('custom-notes-input');
  if (notesInput) notesInput.value = '';

  removeUploadedLogo();
  renderCustomizerMates();
  renderCustomizerGraphics();
  selectEngraveTechnique('laser');
  selectEngraveFont('gauchesca');
  selectLocation('frente');
  switchDesignTab('texto');
  updateVirolaSimulator();
  showToast('Personalizador restablecido', 'fa-undo');
}

function updateVirolaSimulator() {
  if (typeof PRODUCTS_DATA === 'undefined') return;

  const mate = PRODUCTS_DATA.find(p => p.id === customizerState.selectedMateId) || PRODUCTS_DATA[3];
  if (!mate) return;

  // Mate image & labels
  const simImg = document.getElementById('sim-mate-img');
  const simModelName = document.getElementById('sim-model-name');
  const simMetalType = document.getElementById('sim-metal-type');
  const summaryMateName = document.getElementById('summary-mate-name');
  const summaryTechName = document.getElementById('summary-tech-name');
  const summaryFinalPrice = document.getElementById('summary-final-price');

  if (simImg) simImg.src = mate.image;
  if (simModelName) simModelName.textContent = mate.name;
  if (simMetalType) simMetalType.textContent = mate.specs?.virola || 'Alpaca Maciza Pulida';
  if (summaryMateName) summaryMateName.textContent = mate.name;

  const tech = TECHNIQUES[customizerState.technique] || TECHNIQUES.laser;
  if (summaryTechName) summaryTechName.textContent = tech.name;
  if (summaryFinalPrice) summaryFinalPrice.textContent = formatARS(mate.price);

  // Technique and Location on Mockup Footer
  const simTechLabel = document.getElementById('sim-technique-label');
  const simLocLabel = document.getElementById('sim-location-label');
  if (simTechLabel) simTechLabel.innerHTML = `<i class="fas fa-bolt"></i> Técnica: <b>${tech.name}</b>`;
  if (simLocLabel) simLocLabel.innerHTML = `<i class="fas fa-crosshairs"></i> Ubicación: <b>${LOCATIONS[customizerState.location]?.name || 'Frente'}</b>`;

  // Ring Technique Styling
  const ring = document.getElementById('virola-metallic-ring');
  if (ring) {
    ring.classList.remove('technique-laser', 'technique-cincelado', 'technique-fotograbado');
    ring.classList.add(`technique-${customizerState.technique}`);
  }

  // Text slot
  const textSlot = document.getElementById('engraving-text-slot');
  if (textSlot) {
    textSlot.className = `engraving-text-slot font-${customizerState.font}`;
    textSlot.textContent = customizerState.text || 'TU TEXTO AQUÍ';
  }

  // Graphic slot
  const graphicSlot = document.getElementById('engraving-graphic-slot');
  if (graphicSlot) {
    if (customizerState.selectedGraphicId && GRAPHICS[customizerState.selectedGraphicId]?.svg && customizerState.selectedGraphicId !== 'none') {
      graphicSlot.innerHTML = GRAPHICS[customizerState.selectedGraphicId].svg;
      graphicSlot.style.display = 'block';
    } else {
      graphicSlot.innerHTML = '';
      graphicSlot.style.display = 'none';
    }
  }

  // Uploaded logo slot
  const uploadSlot = document.getElementById('engraving-upload-slot');
  if (uploadSlot) {
    if (customizerState.uploadedFileDataUrl) {
      uploadSlot.style.display = 'block';
    } else {
      uploadSlot.style.display = 'none';
    }
  }
}

// Redirect customer to Personalizá tu Mate dedicated studio page
function goToPersonalizarMate(productId) {
  closeCartDrawer();
  closeQuickView();
  const url = productId ? `personaliza-tu-mate.html?mate=${encodeURIComponent(productId)}` : 'personaliza-tu-mate.html';
  window.location.href = url;
}

// Save customization and add/update in cart
function saveCustomizedMateToCart() {
  if (typeof PRODUCTS_DATA === 'undefined') return;

  const product = PRODUCTS_DATA.find(p => p.id === customizerState.selectedMateId);
  if (!product) return;

  const notesInput = document.getElementById('custom-notes-input');
  const customization = {
    type: customizerState.technique,
    typeName: TECHNIQUES[customizerState.technique]?.name || 'Grabado Láser HD',
    text: (customizerState.text || '').trim(),
    font: customizerState.font,
    fontName: FONTS[customizerState.font]?.name || 'Gauchesca',
    location: customizerState.location,
    locationName: LOCATIONS[customizerState.location]?.name || 'Frente centrado',
    graphicId: customizerState.selectedGraphicId,
    graphicName: GRAPHICS[customizerState.selectedGraphicId]?.name || null,
    uploadedFile: customizerState.uploadedFileName,
    notes: notesInput?.value.trim() || ''
  };

  const existingItem = state.cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.customization = customization;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      categoryName: product.categoryName,
      quantity: 1,
      customization: customization
    });
  }

  saveCart();
  updateCartUI();
  openCartDrawer();

  // Button visual feedback
  const saveBtn = document.getElementById('btn-save-custom-mate');
  if (saveBtn) {
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = `<i class="fas fa-check"></i> ¡Grabado Guardado con Éxito!`;
    saveBtn.style.backgroundColor = '#27ae60';
    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.style.backgroundColor = '';
    }, 2000);
  }

  showToast(`¡Grabado en virola guardado para "${product.name}"!`, 'fa-check-circle');
}

// Secret shortcut trigger: double click on logo or copyright redirects to admin
function handleSecretAdminTrigger() {
  window.location.href = 'admin.html';
}

// ==========================================================================
// AUTH VISUAL EFFECTS: CELEBRATION LOGIN & GENTLE LOGOUT
// ==========================================================================
function playAuthLoginEffect(user, isNew = false) {
  const firstName = user && user.name ? user.name.split(' ')[0] : 'Matero';
  let overlay = document.getElementById('auth-effect-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'auth-effect-overlay';
    overlay.className = 'auth-effect-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="auth-login-card">
      <div class="auth-login-sparkle">
        <i class="fas fa-crown"></i>
      </div>
      <h3 style="font-family: var(--font-heading); font-size: 1.55rem; font-weight: 800; margin-bottom: 8px; color: var(--accent-gold);">
        ${isNew ? '¡Cuenta Creada con Éxito!' : '¡Bienvenido/a a Mates Río!'}
      </h3>
      <p style="font-size: 1.05rem; margin-bottom: 16px; color: #f5f5f7;">
        Hola <b>${firstName}</b>, qué lindo tenerte con nosotros.
      </p>
      <div style="font-size: 0.85rem; color: #a8a8b0; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px;">
        <i class="fas fa-shield-alt" style="color: #27ae60;"></i> Tu sesión quedó guardada. Cuando vuelvas a entrar, seguirás conectado/a.
      </div>
    </div>
  `;

  overlay.classList.add('active');

  // Add gold aura animation to user button
  const userBtn = document.getElementById('user-account-btn');
  if (userBtn) {
    userBtn.classList.add('pulse-gold-aura');
    setTimeout(() => userBtn.classList.remove('pulse-gold-aura'), 4000);
  }

  setTimeout(() => {
    overlay.classList.remove('active');
  }, 2200);
}

function playAuthLogoutEffect(name = 'Matero') {
  const firstName = name ? name.split(' ')[0] : 'Matero';
  let overlay = document.getElementById('auth-effect-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'auth-effect-overlay';
    overlay.className = 'auth-effect-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="auth-logout-card">
      <div class="auth-wave-icon">👋</div>
      <h3 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; margin-bottom: 8px;">
        ¡Hasta pronto, ${firstName}!
      </h3>
      <p style="font-size: 0.95rem; color: #a8a8b0; margin-bottom: 8px;">
        Has cerrado sesión correctamente.
      </p>
      <small style="color: var(--accent-gold); font-size: 0.8rem; font-weight: 600;">
        ¡Te esperamos en tu próxima mateada!
      </small>
    </div>
  `;

  overlay.classList.add('active');

  setTimeout(() => {
    overlay.classList.remove('active');
  }, 2000);
}

// Session Persistence Helper
function saveSessionProgress() {
  try {
    const sessionData = {
      page: window.location.pathname + window.location.search,
      userEmail: state.currentUser ? state.currentUser.email : null,
      savedAt: Date.now()
    };
    localStorage.setItem('mates_rio_last_session', JSON.stringify(sessionData));
  } catch (err) {
    // Ignore storage quota errors
  }
}
window.addEventListener('beforeunload', saveSessionProgress);

// ==========================================================================
// ADMIN DIRECT WEB PRODUCT CREATOR (COMPU Y CELU)
// ==========================================================================
function openAdminAddProductModal() {
  if (!isUserAdmin(state.currentUser)) {
    showToast('Acceso exclusivo para administradores de Mates Río', 'fa-lock');
    return;
  }
  const modal = document.getElementById('admin-add-product-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAdminAddProductModal() {
  document.getElementById('admin-add-product-modal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function handleAdminCreateProductWeb(e) {
  if (e) e.preventDefault();
  if (!isUserAdmin(state.currentUser)) return;

  const name = document.getElementById('admin-web-name')?.value.trim();
  const category = document.getElementById('admin-web-category')?.value;
  const price = parseInt(document.getElementById('admin-web-price')?.value, 10);
  const origPriceVal = document.getElementById('admin-web-orig-price')?.value;
  const origPrice = origPriceVal ? parseInt(origPriceVal, 10) : null;
  const badge = document.getElementById('admin-web-badge')?.value.trim();
  const badgeType = document.getElementById('admin-web-badge-type')?.value || 'new';
  const imgSelect = document.getElementById('admin-web-img-select')?.value;
  const imgCustom = document.getElementById('admin-web-img-custom')?.value.trim();
  const image = (imgSelect === 'custom' && imgCustom) ? imgCustom : (imgSelect || 'assets/images/prod_mate_imperial.jpg');
  const desc = document.getElementById('admin-web-desc')?.value.trim();
  const stock = parseInt(document.getElementById('admin-web-stock')?.value, 10) || 10;

  if (!name || !category || isNaN(price) || price <= 0 || !desc) {
    showToast('Por favor completá los campos obligatorios', 'fa-exclamation-triangle');
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

  const newProd = {
    id: `prod-custom-${Date.now()}`,
    name: name,
    category: category,
    categoryName: catNamesMap[category] || category.toUpperCase(),
    price: price,
    originalPrice: origPrice && origPrice > price ? origPrice : null,
    badge: badge || (origPrice && origPrice > price ? 'OFERTA' : 'NUEVO'),
    badgeType: badgeType,
    rating: 5.0,
    reviewsCount: 1,
    image: image,
    description: desc,
    specs: {
      material: "Selección artesanal de taller",
      origen: "Río Ceballos, Córdoba, Argentina",
      garantia: "Garantía artesanal Mates Río"
    },
    inStock: stock > 0,
    stock: stock,
    isCustom: true
  };

  // Add to PRODUCTS_DATA
  if (typeof PRODUCTS_DATA !== 'undefined') {
    PRODUCTS_DATA.unshift(newProd);
  }

  // Save to localStorage
  try {
    let customList = JSON.parse(localStorage.getItem('mates_rio_custom_products') || '[]');
    customList.unshift(newProd);
    localStorage.setItem('mates_rio_custom_products', JSON.stringify(customList));

    // Update inventory storage as well
    let inv = JSON.parse(localStorage.getItem('mates_rio_inventory') || '{}');
    inv[newProd.id] = { price: newProd.price, stock: stock, inStock: stock > 0 };
    localStorage.setItem('mates_rio_inventory', JSON.stringify(inv));
  } catch (err) {
    console.error('Error saving custom product:', err);
  }

  // Re-render products if on catalog or promos or index
  if (typeof renderProducts === 'function') {
    renderProducts();
  }

  closeAdminAddProductModal();
  showToast(`¡"${newProd.name}" cargado al catálogo con éxito! 🎉`, 'fa-check-circle');

  // Reset form
  document.getElementById('admin-web-product-form')?.reset();
}

// ==========================================================================
// PROMOS FILTERING ENHANCEMENT
// ==========================================================================
function setPromoSubfilter(subFilter, btnEl) {
  state.promoSubfilter = subFilter;
  document.querySelectorAll('.promos-filter-chips .filter-pill').forEach(btn => {
    btn.classList.remove('active');
  });
  if (btnEl) btnEl.classList.add('active');
  if (typeof renderProducts === 'function') {
    renderProducts();
  }
}

function filterPromosLive() {
  const input = document.getElementById('promos-search-input');
  if (!input) return;
  state.searchQuery = input.value.trim();
  if (typeof renderProducts === 'function') {
    renderProducts();
  }
}


