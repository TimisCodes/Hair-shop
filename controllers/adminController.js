// Admin controller - handles admin operations
const Product = require('../models/Product');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

class AdminController {
    // Show admin dashboard
    static async showDashboard(req, res) {
        try {
            const products = await Product.getAll();
            const orders = await Order.getAll();
            
            // Calculate statistics
            const totalProducts = products.length;
            const totalOrders = orders.length;
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            const totalRevenue = orders
                .filter(o => o.payment_status === 'success')
                .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
            
            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                stats: {
                    totalProducts,
                    totalOrders,
                    pendingOrders,
                    totalRevenue
                },
                recentOrders: orders.slice(0, 5)
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            req.flash('error', 'Error loading dashboard');
            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                stats: {},
                recentOrders: []
            });
        }
    }
    
    // Show products management page
    static async showProducts(req, res) {
        try {
            const products = await Product.getAll();
            
            res.render('admin/products', {
                title: 'Manage Products',
                products
            });
        } catch (error) {
            console.error('Error loading products:', error);
            req.flash('error', 'Error loading products');
            res.render('admin/products', {
                title: 'Manage Products',
                products: []
            });
        }
    }
    
    // Show add product form
    static showAddProduct(req, res) {
        res.render('admin/add-product', {
            title: 'Add Product',
            errors: [],
            formData: {}
        });
    }
    
    // Handle add product
    static async addProduct(req, res) {
        try {
            const { name, description, price, length, hairType, texture, color, stockQuantity } = req.body;
            
            let imageUrl = '/uploads/placeholder.jpg';
            if (req.file) {
                imageUrl = '/uploads/' + req.file.filename;
            }
            
            await Product.create({
                name,
                description,
                price: parseFloat(price),
                length,
                hairType,
                texture,
                color,
                stockQuantity: parseInt(stockQuantity),
                imageUrl
            });
            
            req.flash('success', 'Product added successfully');
            res.redirect('/admin/products');
            
        } catch (error) {
            console.error('Error adding product:', error);
            req.flash('error', 'Error adding product');
            res.redirect('/admin/products/add');
        }
    }
    
    // Show edit product form
    static async showEditProduct(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId);
            
            if (!product) {
                req.flash('error', 'Product not found');
                return res.redirect('/admin/products');
            }
            
            res.render('admin/edit-product', {
                title: 'Edit Product',
                product,
                errors: []
            });
        } catch (error) {
            console.error('Error loading product:', error);
            req.flash('error', 'Error loading product');
            res.redirect('/admin/products');
        }
    }
    
    // Handle edit product
    static async editProduct(req, res) {
        try {
            const productId = req.params.id;
            const { name, description, price, length, hairType, texture, color, stockQuantity } = req.body;
            
            const product = await Product.findById(productId);
            let imageUrl = product.image_url;
            
            if (req.file) {
                imageUrl = '/uploads/' + req.file.filename;
            }
            
            await Product.update(productId, {
                name,
                description,
                price: parseFloat(price),
                length,
                hairType,
                texture,
                color,
                stockQuantity: parseInt(stockQuantity),
                imageUrl
            });
            
            req.flash('success', 'Product updated successfully');
            res.redirect('/admin/products');
            
        } catch (error) {
            console.error('Error updating product:', error);
            req.flash('error', 'Error updating product');
            res.redirect('/admin/products');
        }
    }
    
    // Handle delete product
    static async deleteProduct(req, res) {
        try {
            const productId = req.params.id;
            await Product.delete(productId);
            
            req.flash('success', 'Product deleted successfully');
            res.redirect('/admin/products');
            
        } catch (error) {
            console.error('Error deleting product:', error);
            req.flash('error', 'Error deleting product');
            res.redirect('/admin/products');
        }
    }
    
    // Show orders management page
    static async showOrders(req, res) {
        try {
            const orders = await Order.getAll();
            
            res.render('admin/orders', {
                title: 'Manage Orders',
                orders
            });
        } catch (error) {
            console.error('Error loading orders:', error);
            req.flash('error', 'Error loading orders');
            res.render('admin/orders', {
                title: 'Manage Orders',
                orders: []
            });
        }
    }
    
    // Update order status
    static async updateOrderStatus(req, res) {
        try {
            const orderId = req.params.id;
            const { status } = req.body;
            
            await Order.updateStatus(orderId, status);
            
            req.flash('success', 'Order status updated');
            res.redirect('/admin/orders');
            
        } catch (error) {
            console.error('Error updating order:', error);
            req.flash('error', 'Error updating order');
            res.redirect('/admin/orders');
        }
    }
}

// Export controller and upload middleware
AdminController.upload = upload;
module.exports = AdminController;