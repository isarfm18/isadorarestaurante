CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Aberto'
);

INSERT INTO users (username, password) VALUES ('admin', '$2b$10$EPf9X7A8ytYmGvYJIn.S9OphHInR6T6tUfLdfx8A6p.O7n8F9WpS.');
INSERT INTO users (username, password) VALUES ('isadora', '$2b$10$vM2BfIuYyvW.Z3k9Xq2mOu1T2S0G1zL8a5u7z3mR4xQ9e8a7i6o5u');
