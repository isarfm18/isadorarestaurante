-- Garante que começaremos com a tabela limpa
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL 
);

INSERT INTO users (username, password) VALUES ('admin', '$2a$10$EPf9X7A8ytYmGvYJIn.S9OphHInR6T6tUfLdfx8A6p.O7n8F9WpS.');
INSERT INTO users (username, password) VALUES ('isadora', '$2a$10$EPf9X7A8ytYmGvYJIn.S9OphHInR6T6tUfLdfx8A6p.O7n8F9WpS.');

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