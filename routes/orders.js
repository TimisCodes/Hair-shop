// Order routes
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

// All order routes require authentication
router.use(isAuthenticated);

// GET /checkout - Show checkout page
router.get('/checkout', OrderController.showCheckout);

// POST /orders/create - Create order
router.post('/orders/create', OrderController.createOrder);

// POST /orders/verify-payment - Verify Paystack payment
router.post('/orders/verify-payment', OrderController.verifyPayment);

// GET /orders - Show user orders
router.get('/orders', OrderController.showOrders);

// GET /orders/:id - Show order detail
router.get('/orders/:id', OrderController.showOrderDetail);

module.exports = router;