
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
    price DECIMAL(10,2) NOT NULL,
    description VARCHAR(255)
);

INSERT INTO items (name, price, category, description) VALUES 
('Marmita Executiva Mista', 25.90, 'Principal', 'Acompanha arroz branco, feijão tropeiro, bife acebolado, frango grelhado e salada.'),
('Strogonoff de Frango', 22.00, 'Principal', 'Delicioso strogonoff cremoso, acompanha arroz branco e batata palha extra crocante.'),
('Feijoada Completa', 35.00, 'Principal', 'Feijoada tradicional com carnes nobres, arroz, couve refogada, farofa e laranja.'),
('Lasanha à Bolonhesa', 28.50, 'Principal', 'Lasanha artesanal com muito queijo e molho bolonhesa especial.'),
('Porção de Fritas', 15.00, 'Acompanhamento', 'Porção de batatas fritas rústicas e crocantes.'),
('Salada Fit', 18.00, 'Acompanhamento', 'Mix de folhas verdes, tomate cereja, palmito e molho de mostarda e mel.'),
('Refrigerante Lata 350ml', 6.00, 'Bebida', 'Coca-cola, Guaraná Antarctica ou Sprite bem gelados.'),
('Suco Natural de Laranja', 8.50, 'Bebida', 'Suco feito na hora (500ml), sem adição de açúcar.'),
('Pudim de Leite', 12.50, 'Sobremesa', 'Fatia generosa de pudim de leite condensado artesanal com calda de caramelo.'),
('Brownie com Sorvete', 16.00, 'Sobremesa', 'Brownie de chocolate meio amargo servido quente com bola de sorvete de creme.');

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Aberto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
