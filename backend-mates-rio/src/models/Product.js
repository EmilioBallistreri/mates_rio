const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/initialProducts.json');

// Cargar productos en memoria desde el archivo JSON inicial
let products = [];
function loadProductsFromDisk() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf8');
      products = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error cargando initialProducts.json:', e.message);
    products = [];
  }
}

function saveProductsToDisk() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
  } catch (e) {
    console.error('Error guardando initialProducts.json:', e.message);
  }
}

loadProductsFromDisk();

const Product = {
  findAll: (filter = {}) => {
    let result = [...products];

    if (filter.category && filter.category !== 'all') {
      result = result.filter(p => p.category === filter.category);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (filter.minPrice !== undefined) {
      result = result.filter(p => p.price >= Number(filter.minPrice));
    }

    if (filter.maxPrice !== undefined) {
      result = result.filter(p => p.price <= Number(filter.maxPrice));
    }

    return result;
  },

  findById: (id) => {
    return products.find(p => p.id === id || String(p.id) === String(id)) || null;
  },

  create: (data) => {
    const cost = data.cost !== undefined ? Number(data.cost) : Math.round((Number(data.price) || 0) * 0.5);
    const price = Number(data.price) || 0;
    const wholesalePrice = data.wholesalePrice !== undefined ? Number(data.wholesalePrice) : Math.round(price * 0.7);
    const retailMarginPercent = cost > 0 ? Math.round(((price - cost) / cost) * 100) : (Number(data.retailMarginPercent) || 100);
    const wholesaleMarginPercent = cost > 0 ? Math.round(((wholesalePrice - cost) / cost) * 100) : (Number(data.wholesaleMarginPercent) || 40);

    const newProduct = {
      id: data.id || `prod-${Date.now()}`,
      name: data.name || 'Nuevo Producto',
      category: data.category || 'mates',
      categoryName: (data.category || 'mates').toUpperCase(),
      price: price,
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      cost: cost,
      wholesalePrice: wholesalePrice,
      retailMarginPercent: retailMarginPercent,
      wholesaleMarginPercent: wholesaleMarginPercent,
      stock: data.stock !== undefined ? Number(data.stock) : 15,
      badge: data.badge || null,
      badgeType: data.badgeType || null,
      rating: Number(data.rating) || 5.0,
      reviewsCount: Number(data.reviewsCount) || 0,
      image: data.image || 'assets/images/prod_mate_imperial.jpg',
      images: Array.isArray(data.images) ? data.images : [data.image || 'assets/images/prod_mate_imperial.jpg'],
      description: data.description || '',
      specs: data.specs || {},
      inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    saveProductsToDisk();
    return newProduct;
  },

  update: (id, updateData) => {
    const index = products.findIndex(p => p.id === id || String(p.id) === String(id));
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updateData,
      id: products[index].id,
      updatedAt: new Date().toISOString()
    };
    saveProductsToDisk();
    return products[index];
  },

  delete: (id) => {
    const index = products.findIndex(p => p.id === id || String(p.id) === String(id));
    if (index === -1) return false;
    products.splice(index, 1);
    saveProductsToDisk();
    return true;
  }
};

module.exports = Product;
