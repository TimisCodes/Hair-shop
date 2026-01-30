// Order model - handles all order-related database operations
const pool = require('../config/database');

class Order {
    // Create new order with items
    static async create(orderData) {
        const client = await pool.connect();
        
        try {
            // Start transaction
            await client.query('BEGIN');
            
            const { userId, totalAmount, shippingAddress, items } = orderData;
            
            // Insert order
            const orderQuery = `
                INSERT INTO orders (user_id, total_amount, shipping_address)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            
            const orderResult = await client.query(orderQuery, [userId, totalAmount, shippingAddress]);
            const order = orderResult.rows[0];
            
            // Insert order items
            for (const item of items) {
                const itemQuery = `
                    INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                    VALUES ($1, $2, $3, $4, $5)
                `;
                
                await client.query(itemQuery, [
                    order.id,
                    item.productId,
                    item.productName,
                    item.quantity,
                    item.price
                ]);
                
                // Update product stock
                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                    [item.quantity, item.productId]
                );
            }
            
            // Commit transaction
            await client.query('COMMIT');
            
            return order;
        } catch (error) {
            // Rollback on error
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Get order by ID with items
    static async findById(id) {
        const orderQuery = 'SELECT * FROM orders WHERE id = $1';
        const orderResult = await pool.query(orderQuery, [id]);
        
        if (orderResult.rows.length === 0) {
            return null;
        }
        
        const order = orderResult.rows[0];
        
        // Get order items
        const itemsQuery = 'SELECT * FROM order_items WHERE order_id = $1';
        const itemsResult = await pool.query(itemsQuery, [id]);
        
        order.items = itemsResult.rows;
        
        return order;
    }
    
    // Get all orders for a user
    static async findByUserId(userId) {
        const query = `
            SELECT o.*, 
                   COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }
    
    // Get all orders (admin)
    static async getAll() {
        const query = `
            SELECT o.*, 
                   u.first_name, u.last_name, u.email,
                   COUNT(oi.id) as item_count
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id, u.id
            ORDER BY o.created_at DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }
    
    // Update order status
    static async updateStatus(id, status) {
        const query = `
            UPDATE orders 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    }
    
    // Update payment status
    static async updatePaymentStatus(reference, status) {
        const query = `
            UPDATE orders 
            SET payment_status = $1, payment_reference = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = (SELECT id FROM orders WHERE payment_reference = $2)
            RETURNING *
        `;
        
        const result = await pool.query(query, [status, reference]);
        return result.rows[0];
    }
}

module.exports = Order;