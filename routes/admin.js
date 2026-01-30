// Admin routes
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');

// All admin routes require authentication and admin privileges
router.use(isAuthenticated);
router.use(isAdmin);

// GET /admin/dashboard - Admin dashboard
router.get('/dashboard', AdminController.showDashboard);

// Product management
router.get('/products', AdminController.showProducts);
router.get('/products/add', AdminController.showAddProduct);
router.post('/products/add', AdminController.upload.single('image'), AdminController.addProduct);
router.get('/products/edit/:id', AdminController.showEditProduct);
router.post('/products/edit/:id', AdminController.upload.single('image'), AdminController.editProduct);
router.get('/products/delete/:id', AdminController.deleteProduct);

// Order management
router.get('/orders', AdminController.showOrders);
router.post('/orders/update-status/:id', AdminController.updateOrderStatus);

module.exports = router;