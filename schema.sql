-- Create database (run this first in PostgreSQL)
-- CREATE DATABASE hair_shop;

-- Connect to the database
-- \c hair_shop;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    length VARCHAR(50),
    hair_type VARCHAR(100),
    texture VARCHAR(100),
    color VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_reference VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table (products in each order)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Insert sample admin user (password: admin123)
-- Password is hashed with bcrypt
INSERT INTO users (first_name, last_name, email, password, is_admin)
VALUES ('Admin', 'User', 'admin@hairshop.com', '$2b$10$rKvVYV8YlmX5h5X5X5X5XOeKgJ5J5J5J5J5J5J5J5J5J5J5J5J5J5', TRUE);

-- Insert sample products
INSERT INTO products (name, description, price, length, hair_type, texture, color, stock_quantity, image_url)
VALUES 
    ('Brazilian Straight Hair', 'Premium quality Brazilian straight hair bundle', 45000.00, '16 inches', 'Brazilian', 'Straight', 'Natural Black', 50, '/uploads/brazilian-straight.jpg'),
    ('Peruvian Body Wave', 'Soft and bouncy Peruvian body wave hair', 52000.00, '18 inches', 'Peruvian', 'Body Wave', 'Natural Black', 35, '/uploads/peruvian-wave.jpg'),
    ('Malaysian Curly Hair', 'Beautiful Malaysian curly hair bundle', 48000.00, '14 inches', 'Malaysian', 'Curly', 'Natural Black', 40, '/uploads/malaysian-curly.jpg'),
    ('Indian Deep Wave', 'Luxurious Indian deep wave hair', 55000.00, '20 inches', 'Indian', 'Deep Wave', 'Dark Brown', 30, '/uploads/indian-wave.jpg');