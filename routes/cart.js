// Cart routes
const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');

// GET /cart - Show cart
router.get('/cart', CartController.showCart);

// POST /cart/add - Add to cart
router.post('/cart/add', CartController.addToCart);

// POST /cart/update - Update cart item
router.post('/cart/update', CartController.updateCart);

// GET /cart/remove/:id - Remove from cart
router.get('/cart/remove/:id', CartController.removeFromCart);

// GET /cart/clear - Clear cart
router.get('/cart/clear', CartController.clearCart);

module.exports = router;