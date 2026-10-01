/**
 * Modelo de Órdenes / Pedidos para Mates Río
 */

let orders = [
  {
    id: "ORD-1001",
    client: {
      name: "Juan Pérez",
      phone: "+54 9 11 4455-6677",
      email: "juanperez@example.com",
      city: "Rosario, Santa Fe"
    },
    items: [
      {
        id: "mate-1",
        name: "Mate Imperial Criollo de Alpaca Cincelada",
        price: 49500,
        quantity: 1
      },
      {
        id: "acc-1",
        name: "Bombillón Pico de Loro Alpaca Maciza",
        price: 18500,
        quantity: 1
      }
    ],
    total: 68000,
    status: "entregado", // 'pendiente', 'en_produccion', 'enviado', 'entregado', 'cancelado'
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "ORD-1002",
    client: {
      name: "Sofía Martínez",
      phone: "+54 9 341 5566-7788",
      email: "sofia.m@example.com",
      city: "Córdoba Capital"
    },
    items: [
      {
        id: "promo-1",
        name: "Combo Río Imperial Black + Termo 1L + Bombilla Alpaca",
        price: 84900,
        quantity: 1
      }
    ],
    total: 84900,
    status: "en_produccion",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const Order = {
  findAll: (filter = {}) => {
    let result = [...orders];
    if (filter.status) {
      result = result.filter(o => o.status === filter.status);
    }
    return result;
  },

  findById: (id) => {
    return orders.find(o => o.id === id) || null;
  },

  create: (data) => {
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      client: data.client || {},
      items: data.items || [],
      total: Number(data.total) || 0,
      customization: data.customization || null,
      status: data.status || 'pendiente',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    return newOrder;
  },

  updateStatus: (id, status) => {
    const order = orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }
};

module.exports = Order;
