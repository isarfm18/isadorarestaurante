
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL 
);

INSERT INTO users (username, password) VALUES ('admin', '$2a$10$bHjlr99dp9avrV.ikw5l2.r4cuRJzO02Dq46SZ/f4hl90m2FFq0IS');
INSERT INTO users (username, password) VALUES ('isadora', '$2a$10$bHjlr99dp9avrV.ikw5l2.r4cuRJzO02Dq46SZ/f4hl90m2FFq0IS');

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    item_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Aberto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
