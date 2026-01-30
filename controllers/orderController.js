// Order controller - handles checkout and order management
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');

class OrderController {
    // Show checkout page
    static async showCheckout(req, res) {
        try {
            const cart = req.session.cart || Cart.init();
            
            if (cart.items.length === 0) {
                req.flash('error', 'Your cart is empty');
                return res.redirect('/cart');
            }
            
            const user = await User.findById(req.session.userId);
            
            res.render('checkout', {
                title: 'Checkout',
                cart,
                user,
                paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY
            });
        } catch (error) {
            console.error('Error loading checkout:', error);
            req.flash('error', 'Error loading checkout');
            res.redirect('/cart');
        }
    }
    
    // Create order (called after payment verification)
    static async createOrder(req, res) {
        try {
            const { shippingAddress, paymentReference } = req.body;
            const cart = req.session.cart;
            
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cart is empty' 
                });
            }
            
            // Prepare order data
            const orderData = {
                userId: req.session.userId,
                totalAmount: cart.totalPrice,
                shippingAddress,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            
            // Create order
            const order = await Order.create(orderData);
            
            // Update payment reference
            if (paymentReference) {
                await Order.updatePaymentStatus(paymentReference, 'success');
            }
            
            // Clear cart
            Cart.clear(req.session.cart);
            
            res.json({ 
                success: true, 
                orderId: order.id,
                message: 'Order created successfully' 
            });
            
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error processing order' 
            });
        }
    }
    
    // Show user's orders
    static async showOrders(req, res) {
        try {
            const orders = await Order.findByUserId(req.session.userId);
            
            res.render('orders', {
                title: 'My Orders',
                orders
            });
        } catch (error) {
            console.error('Error loading orders:', error);
            req.flash('error', 'Error loading orders');
            res.render('orders', {
                title: 'My Orders',
                orders: []
            });
        }
    }
    
    // Show single order details
    static async showOrderDetail(req, res) {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId);
            
            if (!order || order.user_id !== req.session.userId) {
                req.flash('error', 'Order not found');
                return res.redirect('/orders');
            }
            
            res.render('order-detail', {
                title: `Order #${order.id}`,
                order
            });
        } catch (error) {
            console.error('Error loading order:', error);
            req.flash('error', 'Error loading order');
            res.redirect('/orders');
        }
    }
    
    // Verify Paystack payment
    static async verifyPayment(req, res) {
        try {
            const { reference } = req.body;
            
            // Call Paystack API to verify payment
            const https = require('https');
            
            const options = {
                hostname: 'api.paystack.co',
                port: 443,
                path: `/transaction/verify/${reference}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            };
            
            const paystackReq = https.request(options, paystackRes => {
                let data = '';
                
                paystackRes.on('data', chunk => {
                    data += chunk;
                });
                
                paystackRes.on('end', () => {
                    const response = JSON.parse(data);
                    
                    if (response.data.status === 'success') {
                        res.json({ 
                            success: true, 
                            data: response.data 
                        });
                    } else {
                        res.json({ 
                            success: false, 
                            message: 'Payment verification failed' 
                        });
                    }
                });
            });
            
            paystackReq.on('error', error => {
                console.error('Paystack verification error:', error);
                res.status(500).json({ 
                    success: false, 
                    message: 'Error verifying payment' 
                });
            });
            
            paystackReq.end();
            
        } catch (error) {
            console.error('Payment verification error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error verifying payment' 
            });
        }
    }
}

module.exports = OrderController;