const productModel = require('../models/settingsModel');
const { logInventoryUpdate } = require('../middleware/logger');

const LOW_STOCK_THRESHOLD = 5;

// Attach low stock warning only when applicable
const buildResponse = (product) => {
  const response = { ...product };
  if (product.quantity < LOW_STOCK_THRESHOLD) {
    response.lowStockWarning = `Low stock warning: only ${product.quantity} unit(s) remaining`;
  }
  return response;
};

const createProduct = async (req, res, next) => {
  try {
    const { name, sku, quantity, price, category } = req.body;

    if (!name || quantity === undefined || price === undefined) {
      return res.status(400).json({ success: false, message: 'name, quantity, and price are required' });
    }
    if (quantity < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be negative' });
    }
    if (price <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }

    const product = await productModel.createProduct({ name, sku, quantity, price, category });
    logInventoryUpdate('CREATE', product);

    res.status(201).json({ success: true, data: buildResponse(product) });
  } catch (err) {
    next(err);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await productModel.getAllProducts();
    res.status(200).json({ success: true, count: products.length, data: products.map(buildResponse) });
  } catch (err) {
    next(err);
  }
};
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: buildResponse(product) });
  } catch (err) {
    next(err);
  }
};
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity, price, category } = req.body;

    const existing = await productModel.getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be negative' });
    }
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }

    const updated = await productModel.updateProduct(id, { name, sku, quantity, price, category });
    logInventoryUpdate('UPDATE', updated);

    res.status(200).json({ success: true, data: buildResponse(updated) });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await productModel.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    logInventoryUpdate('DELETE', deleted);
    res.status(200).json({ success: true, message: 'Product deleted', data: deleted });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };