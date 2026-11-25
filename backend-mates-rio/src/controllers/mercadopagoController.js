// ==========================================================================
// CONTROLADOR OFICIAL DE MERCADO PAGO - MATES RÍO
// ==========================================================================

const DEFAULT_ACCESS_TOKEN = 'APP_USR-353036032959418-112414-2c054aee001c6185e3dd573c1a14a7e5-2091268509';
const DEFAULT_PUBLIC_KEY = 'APP_USR-617f12c2-bb8d-4a01-9c1e-95929d12de50';

/**
 * Obtener clave pública de Mercado Pago para inicializar SDK en el cliente
 */
const getPublicKey = (req, res) => {
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;
  res.json({
    success: true,
    publicKey
  });
};

/**
 * Crear preferencia de pago en Mercado Pago (Checkout Pro Oficial)
 */
const createPreference = async (req, res, next) => {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || DEFAULT_ACCESS_TOKEN;
    const {
      items = [],
      payer = {},
      external_reference = '',
      shipping_cost = 0,
      back_urls = {},
      auto_return = 'approved',
      metadata = {}
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La preferencia de pago debe contener al menos un producto'
      });
    }

    // Normalizar items para la API de Mercado Pago
    const mpItems = items.map((item, idx) => ({
      id: String(item.id || `item_${idx + 1}`),
      title: String(item.title || item.name || 'Producto Mates Río').substring(0, 255),
      description: item.description ? String(item.description).substring(0, 255) : undefined,
      picture_url: item.picture_url || item.image || undefined,
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      currency_id: 'ARS',
      unit_price: Math.max(1, Math.round(Number(item.unit_price || item.price || 0)))
    }));

    // Agregar costo de envío si corresponde
    const numShipping = Math.max(0, Math.round(Number(shipping_cost || 0)));
    if (numShipping > 0) {
      mpItems.push({
        id: 'shipping_cost',
        title: 'Costo de Envío y Despacho',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: numShipping
      });
    }

    // Construir URLs de retorno
    const origin = req.headers.origin || req.headers.referer || process.env.FRONTEND_URL || 'https://matesrio.com.ar';
    const cleanOrigin = origin.replace(/\/$/, '');
    const isLocalhost = cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1');
    const autoReturnVal = isLocalhost ? undefined : (auto_return || 'approved');

    const defaultBackUrls = {
      success: `${cleanOrigin}/index.html?payment_status=approved&order_id=${encodeURIComponent(external_reference)}`,
      failure: `${cleanOrigin}/index.html?payment_status=failure&order_id=${encodeURIComponent(external_reference)}`,
      pending: `${cleanOrigin}/index.html?payment_status=pending&order_id=${encodeURIComponent(external_reference)}`
    };

    const finalBackUrls = {
      success: back_urls.success || defaultBackUrls.success,
      failure: back_urls.failure || defaultBackUrls.failure,
      pending: back_urls.pending || defaultBackUrls.pending
    };

    const preferencePayload = {
      items: mpItems,
      payer: {
        name: payer.name || 'Cliente Mates Río',
        surname: payer.surname || '',
        email: payer.email || 'ventas@matesrio.com.ar',
        phone: payer.phone ? { number: String(payer.phone).replace(/\D/g, '') } : undefined,
        identification: payer.dni ? { type: 'DNI', number: String(payer.dni).replace(/\D/g, '') } : undefined,
        address: payer.address ? {
          street_name: String(payer.address).substring(0, 255),
          zip_code: String(payer.zip || '').substring(0, 10)
        } : undefined
      },
      back_urls: finalBackUrls,
      ...(autoReturnVal ? { auto_return: autoReturnVal } : {}),
      external_reference: String(external_reference || `RIO-${Date.now()}`),
      statement_descriptor: 'MATES RIO',
      binary_mode: false,
      expires: false,
      metadata: {
        store: 'Mates Río Oficial',
        ...metadata
      }
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferencePayload)
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Error respuesta Mercado Pago:', data);
      return res.status(mpResponse.status || 500).json({
        success: false,
        message: data.message || 'Error al comunicarse con Mercado Pago',
        error: data
      });
    }

    res.status(201).json({
      success: true,
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
      externalReference: preferencePayload.external_reference
    });
  } catch (error) {
    console.error('Error en createPreference:', error);
    next(error);
  }
};

module.exports = {
  getPublicKey,
  createPreference
};
