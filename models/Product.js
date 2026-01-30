// Product model - handles all product-related database operations
const pool = require('../config/database');

class Product {
    // Get all products with optional filters
    static async getAll(filters = {}) {
        let query = 'SELECT * FROM products WHERE 1=1';
        const values = [];
        let paramCount = 1;
        
        // Add filter for hair type if provided
        if (filters.hairType) {
            query += ` AND hair_type = $${paramCount}`;
            values.push(filters.hairType);
            paramCount++;
        }
        
        // Add filter for texture if provided
        if (filters.texture) {
            query += ` AND texture = $${paramCount}`;
            values.push(filters.texture);
            paramCount++;
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await pool.query(query, values);
        return result.rows;
    }
    
    // Get single product by ID
    static async findById(id) {
        const query = 'SELECT * FROM products WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
    
    // Create new product
    static async create(productData) {
        const { name, description, price, length, hairType, texture, color, stockQuantity, imageUrl } = productData;
        
        const query = `
            INSERT INTO products (name, description, price, length, hair_type, texture, color, stock_quantity, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        
        const values = [name, description, price, length, hairType, texture, color, stockQuantity, imageUrl];
        const result = await pool.query(query, values);
        
        return result.rows[0];
    }
    
    // Update product
    static async update(id, productData) {
        const { name, description, price, length, hairType, texture, color, stockQuantity, imageUrl } = productData;
        
        const query = `
            UPDATE products 
            SET name = $1, description = $2, price = $3, length = $4, 
                hair_type = $5, texture = $6, color = $7, stock_quantity = $8, 
                image_url = $9, updated_at = CURRENT_TIMESTAMP
            WHERE id = $10
            RETURNING *
        `;
        
        const values = [name, description, price, length, hairType, texture, color, stockQuantity, imageUrl, id];
        const result = await pool.query(query, values);
        
        return result.rows[0];
    }
    
    // Delete product
    static async delete(id) {
        const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
    
    // Update stock quantity
    static async updateStock(id, quantity) {
        const query = `
            UPDATE products 
            SET stock_quantity = stock_quantity - $1
            WHERE id = $2 AND stock_quantity >= $1
            RETURNING *
        `;
        
        const result = await pool.query(query, [quantity, id]);
        return result.rows[0];
    }
}

module.exports = Product;