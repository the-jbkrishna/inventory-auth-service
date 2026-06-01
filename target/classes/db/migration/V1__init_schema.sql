-- Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Roles Table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create Permissions Table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create User-Roles Join Table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create Role-Permissions Join Table
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create User-Permissions Join Table (for direct overrides)
CREATE TABLE user_permissions (
    user_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, permission_id),
    CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Roles
INSERT INTO roles (name) VALUES ('ROLE_SUPER_ADMIN');
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT INTO roles (name) VALUES ('ROLE_USER');

-- Seed Permissions
INSERT INTO permissions (name) VALUES ('VIEW_PRODUCTS');
INSERT INTO permissions (name) VALUES ('CREATE_PRODUCTS');
INSERT INTO permissions (name) VALUES ('UPDATE_PRODUCTS');
INSERT INTO permissions (name) VALUES ('DELETE_PRODUCTS');
INSERT INTO permissions (name) VALUES ('VIEW_STOCK');
INSERT INTO permissions (name) VALUES ('UPDATE_STOCK');
INSERT INTO permissions (name) VALUES ('VIEW_ORDERS');
INSERT INTO permissions (name) VALUES ('CREATE_ORDERS');
INSERT INTO permissions (name) VALUES ('DELETE_ORDERS');

-- Map All Permissions to ROLE_SUPER_ADMIN (optional but helper reference)
-- ROLE_SUPER_ADMIN ID is 1, and permissions IDs are 1 to 9
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'ROLE_SUPER_ADMIN';

-- Map Products & Stock Permissions to ROLE_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'ROLE_ADMIN' 
  AND p.name IN ('VIEW_PRODUCTS', 'CREATE_PRODUCTS', 'UPDATE_PRODUCTS', 'DELETE_PRODUCTS', 'VIEW_STOCK', 'UPDATE_STOCK');

-- Map Products & Stock Read-only Permissions to ROLE_USER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'ROLE_USER' 
  AND p.name IN ('VIEW_PRODUCTS', 'VIEW_STOCK');


