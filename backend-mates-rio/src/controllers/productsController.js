const Product = require('../models/Product');

// GET /api/products
const getProducts = (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const products = Product.findAll({ category, search, minPrice, maxPrice });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = (req, res, next) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Producto con ID ${req.params.id} no encontrado`
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products (Protegido Admin)
const createProduct = (req, res, next) => {
  try {
    const { name, category, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el precio del producto son obligatorios'
      });
    }

    const newProduct = Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id (Protegido Admin)
const updateProduct = (req, res, next) => {
  try {
    const updated = Product.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Producto con ID ${req.params.id} no encontrado`
      });
    }
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id (Protegido Admin)
const deleteProduct = (req, res, next) => {
  try {
    const deleted = Product.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Producto con ID ${req.params.id} no encontrado`
      });
    }
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
