// Product controller - handles product display and operations
const Product = require('../models/Product');

class ProductController {
    // Show home page with all products
    static async showHome(req, res) {
        try {
            const filters = {
                hairType: req.query.hairType,
                texture: req.query.texture
            };
            
            const products = await Product.getAll(filters);
            
            res.render('home', {
                title: 'Hair Shop - Premium Quality Hair',
                products,
                filters
            });
        } catch (error) {
            console.error('Error loading products:', error);
            req.flash('error', 'Error loading products');
            res.render('home', {
                title: 'Hair Shop',
                products: [],
                filters: {}
            });
        }
    }
    
    // Show single product detail page
    static async showProduct(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId);
            
            if (!product) {
                req.flash('error', 'Product not found');
                return res.redirect('/');
            }
            
            res.render('product-detail', {
                title: product.name,
                product
            });
        } catch (error) {
            console.error('Error loading product:', error);
            req.flash('error', 'Error loading product');
            res.redirect('/');
        }
    }
}

module.exports = ProductController;