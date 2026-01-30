// Cart controller - handles shopping cart operations
const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartController {
    // Show cart page
    static showCart(req, res) {
        const cart = req.session.cart || Cart.init();
        
        res.render('cart', {
            title: 'Shopping Cart',
            cart
        });
    }
    
    // Add item to cart
    static async addToCart(req, res) {
        try {
            const productId = req.body.productId;
            const quantity = parseInt(req.body.quantity) || 1;
            
            // Get product details
            const product = await Product.findById(productId);
            
            if (!product) {
                req.flash('error', 'Product not found');
                return res.redirect('/');
            }
            
            // Check stock availability
            if (product.stock_quantity < quantity) {
                req.flash('error', 'Insufficient stock available');
                return res.redirect(`/products/${productId}`);
            }
            
            // Initialize cart if it doesn't exist
            if (!req.session.cart) {
                req.session.cart = Cart.init();
            }
            
            // Add item to cart
            Cart.addItem(req.session.cart, product, quantity);
            
            req.flash('success', 'Product added to cart');
            res.redirect('/cart');
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            req.flash('error', 'Error adding product to cart');
            res.redirect('/');
        }
    }
    
    // Update cart item quantity
    static updateCart(req, res) {
        try {
            const productId = req.body.productId;
            const quantity = parseInt(req.body.quantity);
            
            if (!req.session.cart) {
                return res.redirect('/cart');
            }
            
            Cart.updateQuantity(req.session.cart, productId, quantity);
            
            req.flash('success', 'Cart updated');
            res.redirect('/cart');
            
        } catch (error) {
            console.error('Error updating cart:', error);
            req.flash('error', 'Error updating cart');
            res.redirect('/cart');
        }
    }
    
    // Remove item from cart
    static removeFromCart(req, res) {
        try {
            const productId = req.params.id;
            
            if (req.session.cart) {
                Cart.removeItem(req.session.cart, productId);
                req.flash('success', 'Item removed from cart');
            }
            
            res.redirect('/cart');
            
        } catch (error) {
            console.error('Error removing from cart:', error);
            req.flash('error', 'Error removing item');
            res.redirect('/cart');
        }
    }
    
    // Clear entire cart
    static clearCart(req, res) {
        if (req.session.cart) {
            Cart.clear(req.session.cart);
            req.flash('success', 'Cart cleared');
        }
        
        res.redirect('/cart');
    }
}

module.exports = CartController;