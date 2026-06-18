
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
    description TEXT,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    items_description TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('Aberto', 'Cozinha', 'Entrega', 'Entregue', 'Cancelado') DEFAULT 'Aberto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO items (name, description, price) VALUES 
('Marmita P', 'Arroz, feijão, 1 mistura, guarnição', 15.00),
('Marmita M', 'Arroz, feijão, 2 misturas, guarnição', 20.00),
('Marmita G', 'Arroz, feijão, 3 misturas, salada e fritas', 25.00),
('Refrigerante Lata', 'Coca-cola, Guaraná, Fanta 350ml', 5.00),
('Suco Natural', 'Laranja, Limão ou Maracujá 500ml', 8.00);