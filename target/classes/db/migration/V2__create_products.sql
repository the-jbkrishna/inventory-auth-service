-- Create Products Table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    updated_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Products
INSERT INTO products (name, category, price, stock, updated_by) VALUES ('MacBook Pro M3 Max', 'Computing', 3499.00, 45, 'superadmin');
INSERT INTO products (name, category, price, stock, updated_by) VALUES ('iPhone 15 Pro Titanium', 'Smartphones', 1199.00, 120, 'superadmin');
INSERT INTO products (name, category, price, stock, updated_by) VALUES ('Sony WH-1000XM5 ANC', 'Audio', 399.00, 75, 'superadmin');
INSERT INTO products (name, category, price, stock, updated_by) VALUES ('iPad Pro M4 Tandem OLED', 'Tablets', 1299.00, 25, 'superadmin');
INSERT INTO products (name, category, price, stock, updated_by) VALUES ('Keychron Q1 Max Keyboard', 'Accessories', 219.00, 110, 'superadmin');
INSERT INTO products (name, category, price, stock, updated_by) VALUES ('Samsung Odyssey OLED G9', 'Displays', 1799.00, 15, 'superadmin');
