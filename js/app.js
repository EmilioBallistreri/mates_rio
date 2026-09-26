/**
 * MATES RÍO - E-COMMERCE CORE APPLICATION
 * Modern, Interactive, Argentine Mate Venture Web App
 */

// Global State
const state = {
  cart: JSON.parse(localStorage.getItem('mates_rio_cart')) || [],
  activeCategory: 'all',
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
      password: "123"
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
  shippingCost: 5500,
  transferDiscountRate: 0.10, // 10% OFF
  whatsappNumber: "5491134567890",
  instagramUrl: "https://www.instagram.com/mates_rio_/"
};

// Coupons Database
const COUPONS = {
  "MATERIO10": { discount: 0.10, label: "10% OFF Bienvenida" },
  "PROMORIO": { discount: 0.15, label: "15% OFF Especial" },
  "ENVIOGRATIS": { discount: 0.0, freeShipping: true, label: "Envío Bonificado" }
};

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
// BANNER SLIDER (HERO CAROUSEL)
// ==========================================================================
let currentSlide = 0;
let slideInterval = null;

function initSlider() {
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
  if (!container || typeof CATEGORIES_DATA === 'undefined') return;

  container.innerHTML = CATEGORIES_DATA.map(cat => `
    <div class="category-card" data-category="${cat.id}">
      <img src="${cat.image}" alt="${cat.name}" class="category-card-bg" loading="lazy" />
      <div class="category-card-overlay"></div>
      <div class="category-card-content">
        <span class="category-badge">${cat.badge}</span>
        <h3 class="category-name">${cat.name}</h3>
        <div class="category-footer-row">
          <span class="category-sub">${cat.label}</span>
          <div class="category-arrow-icon">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Click on category card filters catalog and smoothly scrolls
  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.getAttribute('data-category');
      setCategoryFilter(catId);
      const catalogEl = document.getElementById('catalogo');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function setCategoryFilter(categoryId) {
  state.activeCategory = categoryId;

  // Update pills UI
  document.querySelectorAll('.filter-pill').forEach(pill => {
    const pillCat = pill.getAttribute('data-category');
    pill.classList.toggle('active', pillCat === categoryId);
  });

  renderProducts();
}

function getFilteredProducts() {
  if (typeof PRODUCTS_DATA === 'undefined') return [];
  let list = [...PRODUCTS_DATA];

  // 1. Filter by category
  if (state.activeCategory !== 'all') {
    list = list.filter(p => p.category.toLowerCase() === state.activeCategory.toLowerCase());
  }

  // 2. Filter by search query
  if (state.searchQuery && state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
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
          <span class="product-category-meta">${prod.categoryName}</span>
          <h4 class="product-title" onclick="openQuickView('${prod.id}')" title="${prod.name}">${prod.name}</h4>
          
          <div class="product-rating">
            ${getStarRatingHtml(prod.rating)}
            <span class="reviews-num">(${prod.reviewsCount})</span>
          </div>

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

function saveCart() {
  localStorage.setItem('mates_rio_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const countTitle = document.getElementById('cart-count-title');
  const itemsContainer = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountRow = document.getElementById('cart-discount-row');
  const discountEl = document.getElementById('cart-discount-amount');
  const activeCouponContainer = document.getElementById('active-coupon-container');
  const shippingEl = document.getElementById('cart-shipping-amount');
  const totalEl = document.getElementById('cart-total');
  const meterText = document.getElementById('free-shipping-text');
  const meterBar = document.getElementById('free-shipping-bar');

  // Total items count
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) badge.textContent = totalCount;
  if (countTitle) countTitle.textContent = `(${totalCount} ${totalCount === 1 ? 'producto' : 'productos'})`;

  // Subtotal calculation
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotalEl) subtotalEl.textContent = formatARS(subtotal);

  // Free shipping meter
  if (meterText && meterBar) {
    if (subtotal === 0) {
      meterText.innerHTML = `<i class="fas fa-truck-fast"></i> ¡Sumá <b>${formatARS(CONFIG.freeShippingThreshold)}</b> para tener <b>ENVÍO GRATIS</b>!`;
      meterBar.style.width = '0%';
      meterBar.style.background = 'linear-gradient(90deg, var(--accent-gold) 0%, #27ae60 100%)';
    } else if (subtotal >= CONFIG.freeShippingThreshold) {
      meterText.innerHTML = `<span style="color: #27ae60; font-weight: 700;"><i class="fas fa-check-circle"></i> ¡Felicitaciones! Tenés ENVÍO GRATIS a todo el país</span>`;
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

  // Calculate discount
  let discountAmount = 0;
  if (state.activeCoupon && COUPONS[state.activeCoupon]) {
    const couponData = COUPONS[state.activeCoupon];
    if (couponData.discount > 0) {
      discountAmount = Math.round(subtotal * couponData.discount);
    }
  }

  // Active coupon chip & row
  if (discountRow && discountEl) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `- ${formatARS(discountAmount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (activeCouponContainer) {
    if (state.activeCoupon && COUPONS[state.activeCoupon]) {
      activeCouponContainer.innerHTML = `
        <div class="active-coupon-chip">
          <i class="fas fa-tag"></i>
          <span><b>${state.activeCoupon}</b> (${COUPONS[state.activeCoupon].label})</span>
          <button onclick="removeCoupon()" title="Quitar cupón" aria-label="Quitar cupón">×</button>
        </div>
      `;
    } else {
      activeCouponContainer.innerHTML = '';
    }
  }

  // Calculate shipping
  const isFreeShipping = subtotal >= CONFIG.freeShippingThreshold || (state.activeCoupon && COUPONS[state.activeCoupon]?.freeShipping);
  const shippingAmount = subtotal > 0 ? (isFreeShipping ? 0 : CONFIG.shippingCost) : 0;
  if (shippingEl) {
    if (subtotal === 0) {
      shippingEl.textContent = 'A calcular';
      shippingEl.style.color = 'inherit';
    } else if (isFreeShipping) {
      shippingEl.innerHTML = `<b style="color: #27ae60;"><i class="fas fa-check"></i> ¡GRATIS!</b>`;
      shippingEl.style.color = '#27ae60';
    } else {
      shippingEl.textContent = formatARS(shippingAmount);
      shippingEl.style.color = 'inherit';
    }
  }

  // Final Total
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingAmount);
  if (totalEl) totalEl.textContent = formatARS(finalTotal);

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
        <button class="btn btn-primary" onclick="closeCartDrawer(); document.getElementById('catalogo')?.scrollIntoView({behavior: 'smooth'})">
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
// WEB CHECKOUT MODAL & ORDER CREATION
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
    if (nameInput) nameInput.value = state.currentUser.name || '';
    if (emailInput) emailInput.value = state.currentUser.email || '';
    if (phoneInput) phoneInput.value = state.currentUser.phone || '';
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
  const isFreeShipping = subtotal >= CONFIG.freeShippingThreshold || (state.activeCoupon && COUPONS[state.activeCoupon]?.freeShipping);
  const shippingAmount = isFreeShipping ? 0 : CONFIG.shippingCost;

  let discountAmount = 0;
  if (state.activeCoupon && COUPONS[state.activeCoupon]?.discount > 0) {
    discountAmount = Math.round(subtotal * COUPONS[state.activeCoupon].discount);
  }

  const selectedPayment = document.querySelector('input[name="payment_method"]:checked')?.value || 'transferencia';
  let paymentDiscount = 0;
  if (selectedPayment === 'transferencia') {
    paymentDiscount = Math.round((subtotal - discountAmount) * CONFIG.transferDiscountRate);
  }

  const total = Math.max(0, subtotal - discountAmount - paymentDiscount + shippingAmount);

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
      ${discountAmount > 0 ? `
      <div style="display: flex; justify-content: space-between; color: #27ae60;">
        <span>Cupón (${state.activeCoupon}):</span>
        <b>-${formatARS(discountAmount)}</b>
      </div>` : ''}
      ${paymentDiscount > 0 ? `
      <div style="display: flex; justify-content: space-between; color: #27ae60;">
        <span>10% OFF Transferencia:</span>
        <b>-${formatARS(paymentDiscount)}</b>
      </div>` : ''}
      <div style="display: flex; justify-content: space-between;">
        <span>Envío:</span>
        <b>${isFreeShipping ? 'GRATIS' : formatARS(shippingAmount)}</b>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 1.1rem; color: var(--text-main); font-weight: 800; border-top: 1px dashed var(--border-light); margin-top: 6px; padding-top: 6px;">
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
  const address = document.getElementById('checkout-address')?.value.trim();
  const city = document.getElementById('checkout-city')?.value.trim();
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
  const isFreeShipping = subtotal >= CONFIG.freeShippingThreshold || (state.activeCoupon && COUPONS[state.activeCoupon]?.freeShipping);
  const shippingAmount = isFreeShipping ? 0 : CONFIG.shippingCost;
  const total = subtotal - paymentDiscount + shippingAmount;

  const newOrder = {
    id: orderId,
    date: new Date().toLocaleDateString('es-AR'),
    items: state.cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
    total: total,
    status: "Confirmado - En preparación artesanal",
    address: `${address}, ${city}`,
    paymentMethod: paymentMethod
  };

  state.orders.unshift(newOrder);
  localStorage.setItem('mates_rio_orders', JSON.stringify(state.orders));

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

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;

  if (!email || !password) {
    showToast('Ingresá tu correo y contraseña', 'fa-exclamation-triangle');
    return;
  }

  // Find user in mock db
  const user = state.usersDb.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    state.currentUser = user;
    localStorage.setItem('mates_rio_user', JSON.stringify(user));
    updateAuthUI();
    closeAuthModal();
    showToast(`¡Bienvenido de vuelta, ${user.name}!`);
  } else {
    // If not in demo, register as new session
    const fallbackUser = {
      name: email.split('@')[0],
      email: email,
      phone: "1155554444"
    };
    state.currentUser = fallbackUser;
    localStorage.setItem('mates_rio_user', JSON.stringify(fallbackUser));
    updateAuthUI();
    closeAuthModal();
    showToast(`¡Bienvenido a Mates Río, ${fallbackUser.name}!`);
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

  const newUser = { name, email, phone, password };
  state.usersDb.push(newUser);
  localStorage.setItem('mates_rio_users_db', JSON.stringify(state.usersDb));

  state.currentUser = newUser;
  localStorage.setItem('mates_rio_user', JSON.stringify(newUser));

  updateAuthUI();
  closeAuthModal();
  showToast(`¡Cuenta creada con éxito! Bienvenido, ${name}.`);
}

function logoutUser() {
  state.currentUser = null;
  localStorage.removeItem('mates_rio_user');
  updateAuthUI();
  closeProfileModal();
  closeUserDropdown();
  showToast('Has cerrado sesión correctamente');
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

  if (state.currentUser) {
    if (userBtnText) userBtnText.textContent = state.currentUser.name.split(' ')[0];
    if (userBtn) {
      userBtn.onclick = (e) => {
        e.stopPropagation();
        toggleUserDropdown();
      };
      userBtn.title = `Cuenta de ${state.currentUser.name}`;
      userBtn.style.borderColor = 'var(--accent-gold)';
    }
  } else {
    if (userBtnText) userBtnText.textContent = "Ingresar";
    if (userBtn) {
      userBtn.onclick = () => openAuthModal('login');
      userBtn.title = "Iniciar sesión o Registrarse";
      userBtn.style.borderColor = 'var(--border-light)';
    }
    if (userDropdown) userDropdown.classList.remove('active');
  }
}

// User Profile & Orders Modal
function openProfileModal() {
  closeUserDropdown();
  const modal = document.getElementById('profile-modal');
  if (!modal || !state.currentUser) return;

  const nameEl = document.getElementById('profile-name-display');
  const emailEl = document.getElementById('profile-email-display');
  const phoneEl = document.getElementById('profile-phone-display');
  const ordersListEl = document.getElementById('profile-orders-list');

  if (nameEl) nameEl.textContent = state.currentUser.name;
  if (emailEl) emailEl.textContent = state.currentUser.email;
  if (phoneEl) phoneEl.textContent = state.currentUser.phone || "No especificado";

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

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
  document.getElementById('profile-modal')?.classList.remove('active');
  document.body.style.overflow = '';
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
  // 1. Init Hero Banner Slider
  initSlider();

  // 2. Render Categories
  renderCategoriesGrid();

  // 3. Render Catalog
  renderProducts();

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

  // 10. Close dropdowns on document click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-btn-wrap')) {
      closeUserDropdown();
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

  // 14. Initialize Customizer if container exists
  if (document.getElementById('customizer-mates-grid') && typeof initCustomizer === 'function') {
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
    svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`
  },
  'afa': {
    id: 'afa',
    name: 'AFA 3 Estrellas',
    category: 'escudos',
    svg: `<svg viewBox="0 0 100 100" class="graphic-svg" fill="currentColor">
      <path d="M50 5 L58 20 L76 20 L62 31 L67 48 L50 38 L33 48 L38 31 L24 20 L42 20 Z" transform="scale(0.35) translate(38, -10)" />
      <path d="M50 5 L58 20 L76 20 L62 31 L67 48 L50 38 L33 48 L38 31 L24 20 L42 20 Z" transform="scale(0.35) translate(92, -10)" />
      <path d="M50 5 L58 20 L76 20 L62 31 L67 48 L50 38 L33 48 L38 31 L24 20 L42 20 Z" transform="scale(0.35) translate(146, -10)" />
      <path d="M22 28 L78 28 L74 74 C69 86 50 94 50 94 C50 94 31 86 26 74 Z" fill="none" stroke="currentColor" stroke-width="4"/>
      <path d="M35 30 L35 78 M50 30 L50 85 M65 30 L65 78" stroke="currentColor" stroke-width="3"/>
      <text x="50" y="60" font-family="'Cinzel', serif" font-weight="900" font-size="18" text-anchor="middle" fill="currentColor">AFA</text>
    </svg>`
  },
  'boca': {
    id: 'boca',
    name: 'Boca Juniors',
    category: 'escudos',
    svg: `<svg viewBox="0 0 100 100" class="graphic-svg" fill="currentColor">
      <path d="M22 22 L78 22 L74 70 C70 84 50 94 50 94 C50 94 30 84 26 70 Z" fill="none" stroke="currentColor" stroke-width="4"/>
      <path d="M24 45 L76 45 L75 62 L25 62 Z" fill="currentColor" fill-opacity="0.3"/>
      <text x="50" y="58" font-family="'Montserrat', sans-serif" font-weight="900" font-size="13" letter-spacing="1" text-anchor="middle" fill="currentColor">CABJ</text>
      <circle cx="50" cy="32" r="2.5"/>
      <circle cx="38" cy="36" r="2.5"/>
      <circle cx="62" cy="36" r="2.5"/>
      <circle cx="40" cy="74" r="2.5"/>
      <circle cx="50" cy="78" r="2.5"/>
      <circle cx="60" cy="74" r="2.5"/>
    </svg>`
  },
  'river': {
    id: 'river',
    name: 'River Plate',
    category: 'escudos',
    svg: `<svg viewBox="0 0 100 100" class="graphic-svg" fill="currentColor">
      <path d="M22 22 L78 22 L74 70 C70 84 50 94 50 94 C50 94 30 84 26 70 Z" fill="none" stroke="currentColor" stroke-width="4"/>
      <path d="M22 22 L78 78 L74 70 L26 22 Z" fill="currentColor" fill-opacity="0.45"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="3"/>
      <text x="50" y="55" font-family="'Cinzel', serif" font-weight="900" font-size="12" text-anchor="middle" fill="currentColor">CARP</text>
    </svg>`
  },
  'racing': {
    id: 'racing',
    name: 'Racing Club',
    category: 'escudos',
    svg: `<svg viewBox="0 0 100 100" class="graphic-svg" fill="currentColor">
      <path d="M22 22 L78 22 L74 70 C70 84 50 94 50 94 C50 94 30 84 26 70 Z" fill="none" stroke="currentColor" stroke-width="4"/>
      <path d="M36 24 L36 82 M50 24 L50 88 M64 24 L64 82" stroke="currentColor" stroke-width="4"/>
      <text x="50" y="56" font-family="'Cinzel', serif" font-weight="900" font-size="16" text-anchor="middle" fill="currentColor">RC</text>
    </svg>`
  },
  'independiente': {
    id: 'independiente',
    name: 'Independiente',
    category: 'escudos',
    svg: `<svg viewBox="0 0 100 100" class="graphic-svg" fill="currentColor">
      <rect x="22" y="22" width="56" height="56" rx="6" fill="none" stroke="currentColor" stroke-width="4"/>
      <line x1="22" y1="22" x2="78" y2="78" stroke="currentColor" stroke-width="4"/>
      <text x="50" y="55" font-family="'Cinzel', serif" font-weight="900" font-size="14" text-anchor="middle" fill="currentColor">CAI</text>
    </svg>`
  },
  'sanlorenzo': {
    id: 'sanlorenzo',
    name: 'San Lorenzo',
    category: 'escudos',
    svg: `<svg viewBox="0 0 100 100" class="graphic-svg" fill="currentColor">
      <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" stroke-width="4"/>
      <path d="M36 22 L36 78 M50 18 L50 82 M64 22 L64 78" stroke="currentColor" stroke-width="3"/>
      <circle cx="50" cy="50" r="18" fill="currentColor" fill-opacity="0.18"/>
      <text x="50" y="54" font-family="'Cinzel', serif" font-weight="900" font-size="10.5" text-anchor="middle" fill="currentColor">CASLA</text>
    </svg>`
  },
  'soldemayo': {
    id: 'soldemayo',
    name: 'Sol de Mayo',
    category: 'criollo',
    svg: `<svg viewBox="0 0 100 100" class="graphic-svg" fill="currentColor">
      <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="3"/>
      <line x1="50" y1="12" x2="50" y2="28" stroke="currentColor" stroke-width="3"/>
      <line x1="50" y1="72" x2="50" y2="88" stroke="currentColor" stroke-width="3"/>
      <line x1="12" y1="50" x2="28" y2="50" stroke="currentColor" stroke-width="3"/>
      <line x1="72" y1="50" x2="88" y2="50" stroke="currentColor" stroke-width="3"/>
      <line x1="23" y1="23" x2="35" y2="35" stroke="currentColor" stroke-width="3"/>
      <line x1="65" y1="65" x2="77" y2="77" stroke="currentColor" stroke-width="3"/>
      <line x1="77" y1="23" x2="65" y2="35" stroke="currentColor" stroke-width="3"/>
      <line x1="23" y1="77" x2="35" y2="65" stroke="currentColor" stroke-width="3"/>
      <circle cx="44" cy="46" r="2"/>
      <circle cx="56" cy="46" r="2"/>
      <path d="M44 57 Q50 62 56 57" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`
  },
  'guardapampa': {
    id: 'guardapampa',
    name: 'Guarda Pampa',
    category: 'criollo',
    svg: `<svg viewBox="0 0 100 50" class="graphic-svg" fill="currentColor">
      <path d="M5 25 L20 10 L35 25 L50 10 L65 25 L80 10 L95 25 L80 40 L65 25 L50 40 L35 25 L20 40 Z" fill="none" stroke="currentColor" stroke-width="3.5"/>
      <rect x="16" y="21" width="8" height="8" fill="currentColor"/>
      <rect x="46" y="21" width="8" height="8" fill="currentColor"/>
      <rect x="76" y="21" width="8" height="8" fill="currentColor"/>
    </svg>`
  },
  'malvinas': {
    id: 'malvinas',
    name: 'Islas Malvinas',
    category: 'criollo',
    svg: `<svg viewBox="0 0 100 70" class="graphic-svg" fill="currentColor">
      <path d="M22 25 C18 30 16 38 20 45 C24 52 32 55 35 48 C38 42 36 34 32 28 C28 22 24 20 22 25 Z" fill="none" stroke="currentColor" stroke-width="3"/>
      <path d="M55 20 C50 24 48 35 52 42 C54 48 64 56 70 52 C76 48 78 38 75 30 C72 22 62 16 55 20 Z" fill="none" stroke="currentColor" stroke-width="3"/>
      <path d="M28 36 L48 32" stroke="currentColor" stroke-width="2" stroke-dasharray="2,2"/>
    </svg>`
  },
  'caballo': {
    id: 'caballo',
    name: 'Caballo Criollo',
    category: 'criollo',
    svg: `<svg viewBox="0 0 100 80" class="graphic-svg" fill="currentColor">
      <path d="M30 65 L36 45 C38 40 40 32 38 22 C37 18 42 12 46 15 C50 18 48 24 53 28 C58 32 68 30 74 36 C80 42 82 52 78 65" fill="none" stroke="currentColor" stroke-width="3.5"/>
      <circle cx="43" cy="20" r="2"/>
      <path d="M48 26 C53 22 60 22 65 24" fill="none" stroke="currentColor" stroke-width="2.5"/>
      <path d="M20 50 C26 42 32 46 36 45" fill="none" stroke="currentColor" stroke-width="2.5"/>
    </svg>`
  },
  'mapa': {
    id: 'mapa',
    name: 'Silueta Argentina',
    category: 'criollo',
    svg: `<svg viewBox="0 0 70 100" class="graphic-svg" fill="currentColor">
      <path d="M35 12 L48 16 L52 24 L45 32 L46 45 L38 58 L36 72 L30 88 L25 82 L26 65 L28 48 L26 35 L28 22 Z" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="36" cy="40" r="3" fill="currentColor"/>
    </svg>`
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

