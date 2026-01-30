// Cart model - handles session-based cart operations
class Cart {
    // Initialize empty cart
    static init() {
        return {
            items: [],
            totalPrice: 0,
            totalQuantity: 0
        };
    }
    
    // Add item to cart
    static addItem(cart, product, quantity = 1) {
        const existingItemIndex = cart.items.findIndex(
            item => item.productId === product.id
        );
        
        if (existingItemIndex >= 0) {
            // Item exists, update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // New item, add to cart
            cart.items.push({
                productId: product.id,
                productName: product.name,
                price: parseFloat(product.price),
                quantity: quantity,
                imageUrl: product.image_url,
                length: product.length,
                hairType: product.hair_type
            });
        }
        
        this.calculateTotals(cart);
        return cart;
    }
    
    // Update item quantity
    static updateQuantity(cart, productId, quantity) {
        const itemIndex = cart.items.findIndex(
            item => item.productId === parseInt(productId)
        );
        
        if (itemIndex >= 0) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
        }
        
        this.calculateTotals(cart);
        return cart;
    }
    
    // Remove item from cart
    static removeItem(cart, productId) {
        cart.items = cart.items.filter(
            item => item.productId !== parseInt(productId)
        );
        
        this.calculateTotals(cart);
        return cart;
    }
    
    // Calculate cart totals
    static calculateTotals(cart) {
        cart.totalQuantity = cart.items.reduce(
            (total, item) => total + item.quantity, 
            0
        );
        
        cart.totalPrice = cart.items.reduce(
            (total, item) => total + (item.price * item.quantity), 
            0
        );
        
        return cart;
    }
    
    // Clear cart
    static clear(cart) {
        cart.items = [];
        cart.totalPrice = 0;
        cart.totalQuantity = 0;
        return cart;
    }
}

module.exports = Cart;