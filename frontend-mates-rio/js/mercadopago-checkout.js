// ==========================================================================
// INTEGRACIÓN OFICIAL MERCADO PAGO - MATES RÍO
// Credenciales de Producción y Pasarela de Pago Transaccional
// ==========================================================================

(function (window) {
  'use strict';

  const MP_CONFIG = {
    publicKey: 'APP_USR-617f12c2-bb8d-4a01-9c1e-95929d12de50',
    accessToken: 'APP_USR-353036032959418-112414-2c054aee001c6185e3dd573c1a14a7e5-2091268509',
    locale: 'es-AR',
    storeName: 'Mates Río'
  };

  let mpInstance = null;

  function getMPInstance() {
    if (!mpInstance && typeof window.MercadoPago !== 'undefined') {
      try {
        mpInstance = new window.MercadoPago(MP_CONFIG.publicKey, {
          locale: MP_CONFIG.locale
        });
      } catch (err) {
        console.warn('Error inicializando MercadoPago SDK:', err);
      }
    }
    return mpInstance;
  }

  function getApiCandidates() {
    const list = [];
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      const hostname = window.location.hostname || 'localhost';

      list.push(`${origin}/api/create-preference`);
      list.push(`${origin}/api/mercadopago/create-preference`);
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        list.push(`http://${hostname}:5000/api/mercadopago/create-preference`);
      }
      list.push('http://localhost:5000/api/mercadopago/create-preference');
      list.push('http://127.0.0.1:5000/api/mercadopago/create-preference');
    }
    return [...new Set(list)];
  }

  /**
   * Crear la preferencia de pago en Mercado Pago
   */
  async function createPreference(orderData) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://matesrio.com.ar';
    const orderId = orderData.orderId || orderData.id || `RIO-${Date.now()}`;
    const cleanOrigin = origin.replace(/\/$/, '');
    const isLocalhost = cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1');
    const autoReturnVal = isLocalhost ? undefined : 'approved';

    const payload = {
      items: (orderData.items || []).map((item, idx) => ({
        id: String(item.id || `item_${idx + 1}`),
        title: String(item.title || item.name || 'Producto Mates Río'),
        quantity: Math.max(1, parseInt(item.quantity || item.qty, 10) || 1),
        unit_price: Math.max(1, Math.round(Number(item.price || item.unit_price || 0))),
        currency_id: 'ARS'
      })),
      shipping_cost: Math.max(0, Math.round(Number(orderData.shippingCost || orderData.shipping_cost || 0))),
      payer: {
        name: orderData.customerName || orderData.contactName || orderData.name || 'Cliente Mates Río',
        email: orderData.customerEmail || orderData.email || 'ventas@matesrio.com.ar',
        phone: orderData.customerPhone || orderData.phone || '',
        dni: orderData.customerDni || orderData.cuit || '',
        address: orderData.address || orderData.location || '',
        zip: orderData.zip || ''
      },
      external_reference: orderId,
      back_urls: {
        success: `${cleanOrigin}/index.html?payment_status=approved&order_id=${encodeURIComponent(orderId)}`,
        failure: `${cleanOrigin}/index.html?payment_status=failure&order_id=${encodeURIComponent(orderId)}`,
        pending: `${cleanOrigin}/index.html?payment_status=pending&order_id=${encodeURIComponent(orderId)}`
      },
      ...(autoReturnVal ? { auto_return: autoReturnVal } : {}),
      metadata: {
        isB2B: Boolean(orderData.isB2B),
        orderId: orderId
      }
    };

    // 1. Intentar a través de endpoints locales o serverless
    const endpoints = getApiCandidates();
    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json();
          if (data && (data.initPoint || data.init_point)) {
            return {
              success: true,
              preferenceId: data.preferenceId || data.id,
              initPoint: data.initPoint || data.init_point,
              sandboxInitPoint: data.sandboxInitPoint || data.sandbox_init_point
            };
          }
        }
      } catch (err) {
        // Seguir al siguiente endpoint
      }
    }

    // 2. Fallback de alta resiliencia directo a la API de Mercado Pago
    try {
      const mpDirectItems = payload.items.map(i => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        currency_id: 'ARS',
        unit_price: i.unit_price
      }));

      if (payload.shipping_cost > 0) {
        mpDirectItems.push({
          id: 'shipping',
          title: 'Costo de Envío Oficial',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: payload.shipping_cost
        });
      }

      const directRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: mpDirectItems,
          payer: {
            name: payload.payer.name,
            email: payload.payer.email,
            phone: payload.payer.phone ? { number: String(payload.payer.phone).replace(/\D/g, '') } : undefined,
            identification: payload.payer.dni ? { type: 'DNI', number: String(payload.payer.dni).replace(/\D/g, '') } : undefined,
            address: payload.payer.address ? { street_name: String(payload.payer.address).substring(0, 200) } : undefined
          },
          back_urls: payload.back_urls,
          ...(autoReturnVal ? { auto_return: autoReturnVal } : {}),
          external_reference: payload.external_reference,
          statement_descriptor: 'MATES RIO'
        })
      });

      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData && directData.init_point) {
          return {
            success: true,
            preferenceId: directData.id,
            initPoint: directData.init_point,
            sandboxInitPoint: directData.sandbox_init_point
          };
        }
      }
    } catch (directErr) {
      console.error('Error en fallback directo Mercado Pago:', directErr);
    }

    throw new Error('No se pudo generar la preferencia de Mercado Pago');
  }

  /**
   * Mostrar modal / overlay de carga mientras se conecta a Mercado Pago
   */
  function showLoadingOverlay(message) {
    let overlay = document.getElementById('mp-loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'mp-loading-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.78);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        color: #ffffff;
        font-family: var(--font-body, system-ui, sans-serif);
        text-align: center;
        padding: 24px;
        box-sizing: border-box;
      `;
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div style="background: #ffffff; color: #111111; border-radius: 18px; padding: 32px 28px; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div style="width: 58px; height: 58px; border-radius: 50%; background: #e8f4fd; display: flex; align-items: center; justify-content: center; color: #009ee3; font-size: 1.8rem;">
          <i class="fas fa-credit-card fa-beat-fade"></i>
        </div>
        <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #09090b;">Conectando con Mercado Pago</h3>
        <p style="margin: 0; font-size: 0.88rem; color: #52525b; line-height: 1.4;">
          ${message || 'Estamos preparando tu enlace de pago seguro con tarjetas bancarias, cuotas y dinero en cuenta...'}
        </p>
        <div style="width: 100%; height: 6px; background: #e4e4e7; border-radius: 999px; overflow: hidden; position: relative;">
          <div style="width: 50%; height: 100%; background: #009ee3; border-radius: 999px; animation: mpProgress 1.4s infinite ease-in-out;"></div>
        </div>
        <small style="color: #a1a1aa; font-size: 0.75rem;">Pasarela Oficial Protegida por Mercado Pago Argentina</small>
      </div>
      <style>
        @keyframes mpProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      </style>
    `;
    overlay.style.display = 'flex';
  }

  function hideLoadingOverlay() {
    const overlay = document.getElementById('mp-loading-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  /**
   * Iniciar el proceso completo de pago con Mercado Pago
   */
  async function initiatePayment(orderData) {
    showLoadingOverlay('Generando tu orden de pago oficial...');
    try {
      const pref = await createPreference(orderData);
      if (pref && pref.initPoint) {
        showLoadingOverlay('¡Orden lista! Redirigiéndote a Mercado Pago...');
        setTimeout(() => {
          window.location.href = pref.initPoint;
        }, 600);
        return pref;
      } else {
        throw new Error('Respuesta inválida de Mercado Pago');
      }
    } catch (err) {
      hideLoadingOverlay();
      console.error('Error iniciando pago Mercado Pago:', err);
      if (typeof window.showToast === 'function') {
        window.showToast('No se pudo conectar con Mercado Pago. Podés abonar por Transferencia Bancaria.', 'fa-exclamation-triangle');
      } else {
        alert('Hubo un inconveniente al conectar con Mercado Pago. Podés abonar por Transferencia Bancaria.');
      }
      return null;
    }
  }

  /**
   * Verificar parámetros de retorno de Mercado Pago en la URL
   */
  function checkUrlReturnStatus() {
    if (typeof window === 'undefined' || !window.location || !window.location.search) return;

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment_status') || params.get('collection_status') || params.get('status');
    const orderId = params.get('order_id') || params.get('external_reference');

    if (!paymentStatus && !orderId) return;

    // 1. Estado Aprobado
    if (paymentStatus === 'approved') {
      try {
        const rawOrders = localStorage.getItem('mates_rio_orders');
        if (rawOrders) {
          const orders = JSON.parse(rawOrders);
          const found = orders.find(o => o.id === orderId);
          if (found) {
            found.status = 'Aprobado - En preparación artesanal';
            found.paymentStatus = 'approved';
            localStorage.setItem('mates_rio_orders', JSON.stringify(orders));
          }
        }
      } catch (e) {}

      if (typeof window.showToast === 'function') {
        window.showToast(`¡Pago de orden #${orderId || ''} acreditado con éxito por Mercado Pago! 🎉`, 'fa-check-circle');
      }

      // Abrir modal de éxito si existe en la página
      const orderIdSpan = document.getElementById('success-order-id');
      if (orderIdSpan && orderId) orderIdSpan.textContent = orderId;
      const successModal = document.getElementById('order-success-modal');
      if (successModal) {
        successModal.classList.add('active');
        const cbuSection = successModal.querySelector('[style*="border-top: 1px dashed"]');
        if (cbuSection) cbuSection.style.display = 'none';
      }
    } else if (paymentStatus === 'pending') {
      if (typeof window.showToast === 'function') {
        window.showToast(`Tu pago #${orderId || ''} está pendiente de acreditación en Mercado Pago.`, 'fa-clock');
      }
    } else if (paymentStatus === 'failure') {
      if (typeof window.showToast === 'function') {
        window.showToast(`El pago con Mercado Pago no pudo completarse. Podés reintentarlo o elegir Transferencia.`, 'fa-times-circle');
      }
    }

    // Limpiar URL para no re-ejecutar en futuros refrescos
    if (window.history && window.history.replaceState) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  // Auto-verificar retorno al cargar
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkUrlReturnStatus);
    } else {
      checkUrlReturnStatus();
    }
  }

  window.MatesRioMP = {
    config: MP_CONFIG,
    getMPInstance,
    createPreference,
    initiatePayment,
    showLoadingOverlay,
    hideLoadingOverlay,
    checkUrlReturnStatus
  };

})(typeof window !== 'undefined' ? window : this);
