// Product routes
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// GET / - Home page with products
router.get('/', ProductController.showHome);

// GET /products/:id - Product detail page
router.get('/products/:id', ProductController.showProduct);

module.exports = router;