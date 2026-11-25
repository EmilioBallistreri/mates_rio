// ==========================================================================
// VERCEL / SERVERLESS ENDPOINT: CREAR PREFERENCIA MERCADO PAGO - MATES RÍO
// ==========================================================================

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-353036032959418-112414-2c054aee001c6185e3dd573c1a14a7e5-2091268509';

module.exports = async function handler(req, res) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Utilizar POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'JSON inválido' });
      }
    }
    body = body || {};

    const {
      items = [],
      payer = {},
      external_reference = '',
      shipping_cost = 0,
      back_urls = {},
      auto_return = 'approved',
      metadata = {}
    } = body;

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

    const origin = req.headers.origin || req.headers.referer || 'https://matesrio.com.ar';
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
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
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
  } catch (err) {
    console.error('Error procesando preferencia Mercado Pago:', err);
    res.status(500).json({
      success: false,
      message: 'Error interno al procesar el pago con Mercado Pago',
      error: err.message
    });
  }
};
