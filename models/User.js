// User model - handles all user-related database operations
const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // Create a new user
    static async create(userData) {
        const { firstName, lastName, email, password, phone, address } = userData;
        
        // Hash password for security (10 rounds of salting)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO users (first_name, last_name, email, password, phone, address)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, first_name, last_name, email, phone, address, is_admin, created_at
        `;
        
        const values = [firstName, lastName, email, hashedPassword, phone, address];
        const result = await pool.query(query, values);
        
        return result.rows[0];
    }
    
    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }
    
    // Find user by ID
    static async findById(id) {
        const query = `
            SELECT id, first_name, last_name, email, phone, address, is_admin, created_at
            FROM users WHERE id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
    
    // Verify user password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    // Update user profile
    static async update(id, userData) {
        const { firstName, lastName, phone, address } = userData;
        
        const query = `
            UPDATE users 
            SET first_name = $1, last_name = $2, phone = $3, address = $4
            WHERE id = $5
            RETURNING id, first_name, last_name, email, phone, address
        `;
        
        const values = [firstName, lastName, phone, address, id];
        const result = await pool.query(query, values);
        
        return result.rows[0];
    }
}

module.exports = User;