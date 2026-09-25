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

  saveCart();
  updateCartUI();
  showToast(`¡Agregaste "${product.name}" al carrito!`);

  // Visual button feedback
  const btn = document.getElementById(`btn-add-${productId}`);
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-check"></i> ¡Agregado!`;
    btn.classList.add('added');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('added');
    }, 1400);
  }

  // Open cart drawer
  openCartDrawer();
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
  state.cart = state.cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
  showToast('Producto eliminado del carrito');
}

function clearCart() {
  if (state.cart.length === 0) return;
  state.cart = [];
  saveCart();
  updateCartUI();
  showToast('Vaciaste el carrito de compras');
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
  if (countTitle) countTitle.textContent = `(${totalCount})`;

  // Subtotal calculation
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotalEl) subtotalEl.textContent = formatARS(subtotal);

  // Free shipping meter
  if (meterText && meterBar) {
    if (subtotal === 0) {
      meterText.innerHTML = `¡Sumá <b>${formatARS(CONFIG.freeShippingThreshold)}</b> para tener <b>ENVÍO GRATIS</b> a todo el país!`;
      meterBar.style.width = '0%';
    } else if (subtotal >= CONFIG.freeShippingThreshold) {
      meterText.innerHTML = `🎉 <b>¡Felicitaciones! Tenés ENVÍO GRATIS a todo el país</b>`;
      meterBar.style.width = '100%';
    } else {
      const remaining = CONFIG.freeShippingThreshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / CONFIG.freeShippingThreshold) * 100));
      meterText.innerHTML = `¡Te faltan <b>${formatARS(remaining)}</b> para <b>ENVÍO GRATIS</b>!`;
      meterBar.style.width = `${pct}%`;
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
          <i class="fas fa-tag"></i> ${state.activeCoupon} (${COUPONS[state.activeCoupon].label})
          <button onclick="removeCoupon()" title="Quitar cupón">×</button>
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
    shippingEl.textContent = subtotal === 0 ? '$ 0' : (isFreeShipping ? '¡GRATIS!' : formatARS(shippingAmount));
    shippingEl.style.color = isFreeShipping ? '#27ae60' : 'inherit';
  }

  // Final Total
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingAmount);
  if (totalEl) totalEl.textContent = formatARS(finalTotal);

  // Render items
  if (!itemsContainer) return;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <i class="fas fa-shopping-bag"></i>
        <h4 style="font-family: var(--font-heading); font-size: 1.25rem;">Tu carrito está vacío</h4>
        <p style="font-size: 0.88rem; margin: 8px 0 20px;">Descubrí nuestros mates imperiales, termos y combos de autor.</p>
        <button class="btn btn-outline-dark" onclick="closeCartDrawer(); document.getElementById('catalogo').scrollIntoView({behavior: 'smooth'})">
          <i class="fas fa-shopping-basket"></i> Ver Catálogo
        </button>
      </div>
    `;
    return;
  }

  itemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <h5 class="cart-item-title" onclick="openQuickView('${item.id}'); closeCartDrawer();" style="cursor: pointer;">${item.name}</h5>
        <span class="cart-item-price">${formatARS(item.price * item.quantity)}</span>
        
        <div class="cart-item-controls">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)" aria-label="Disminuir">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)" aria-label="Aumentar">+</button>
          </div>

          <button class="cart-item-remove-btn" onclick="removeFromCart('${item.id}')" title="Eliminar del carrito" aria-label="Eliminar producto">
            <i class="far fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
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
    showToast(`¡Cupón "${code}" aplicado: ${COUPONS[code].label}!`);
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

  summaryEl.innerHTML = `
    <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
      <div style="display: flex; justify-content: space-between;">
        <span>Productos (${state.cart.reduce((s, i) => s + i.quantity, 0)}):</span>
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
});
