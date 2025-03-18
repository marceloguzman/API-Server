const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route to get all products and create new products
router
  .route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);

// Routes to get, update and delete a specific product
router
  .route('/:id')
  .get(productController.getProductById)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router; 