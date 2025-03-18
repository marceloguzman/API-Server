const { loadJsonData, saveJsonData } = require('../models/dataLoader');

/**
 * Gets all products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const products = await loadJsonData('products.json');
    
    // Filtering by query params
    let filteredProducts = [...products];
    
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(
        p => p.category === req.query.category
      );
    }
    
    if (req.query.minPrice) {
      filteredProducts = filteredProducts.filter(
        p => p.price >= parseFloat(req.query.minPrice)
      );
    }
    
    if (req.query.maxPrice) {
      filteredProducts = filteredProducts.filter(
        p => p.price <= parseFloat(req.query.maxPrice)
      );
    }
    
    res.json({
      status: 'success',
      results: filteredProducts.length,
      data: { products: filteredProducts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a product by ID
 */
const getProductById = async (req, res, next) => {
  try {
    const products = await loadJsonData('products.json');
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }
    
    res.json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new product
 */
const createProduct = async (req, res, next) => {
  try {
    const products = await loadJsonData('products.json');
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      ...req.body
    };
    
    products.push(newProduct);
    await saveJsonData('products.json', products);
    
    res.status(201).json({
      status: 'success',
      data: { product: newProduct }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing product
 */
const updateProduct = async (req, res, next) => {
  try {
    const products = await loadJsonData('products.json');
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Update product preserving the ID
    products[productIndex] = {
      ...products[productIndex],
      ...req.body,
      id: products[productIndex].id // Ensure ID doesn't change
    };
    
    await saveJsonData('products.json', products);
    
    res.json({
      status: 'success',
      data: { product: products[productIndex] }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a product
 */
const deleteProduct = async (req, res, next) => {
  try {
    const products = await loadJsonData('products.json');
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    await saveJsonData('products.json', products);
    
    res.json({
      status: 'success',
      data: { product: deletedProduct }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}; 