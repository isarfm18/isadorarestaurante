const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
app.disable('x-powered-by');

const dbConfig = {
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'isadoradb',
    charset: 'utf8mb4'
};

let pool;

async function connectWithRetry() {
    console.log('🔍 [INFRA] Tentando conectar ao MySQL...');
    for (let i = 1; i <= 10; i++) {
        try {
            pool = mysql.createPool(dbConfig);
            await pool.query('SELECT 1');
            console.log('✅ [DATABASE] Conectado ao MySQL com sucesso!');
            return;
        } catch (err) {
            console.log(`⚠️ [DATABASE] Tentativa ${i}/10 falhou. Aguardando...`);
            await new Promise(res => setTimeout(res, 3000));
        }
    }
    process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.get('/', (req, res) => res.render('login'));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Usuário e senha são obrigatórios.');
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            const user = rows[0];


            const match = await bcrypt.compare(password, user.password);

            if (match) {
                return res.redirect('/dashboard');
            } else {
                return res.send('<h1>Senha Inválida</h1><a href="/">Voltar</a>');
            }
        } else {
            return res.send('<h1>Usuário não encontrado</h1><a href="/">Voltar</a>');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro no processamento do login.");
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Usuário e senha são obrigatórios.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        return res.status(201).send('Usuário cadastrado com sucesso.');
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Usuário já existe.');
        }
        console.error(err);
        return res.status(500).send('Erro ao cadastrar usuário.');
    }
});

app.post('/add-item', async (req, res) => {
    const { name, category, price, description } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedCategory = typeof category === 'string' ? category.trim() : '';
    const normalizedDesc = typeof description === 'string' ? description.trim() : '';
    const parsedPrice = Number(price);

    if (!normalizedName || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).send('Dados inválidos: nome obrigatório e preço deve ser número positivo.');
    }

    try {
        await pool.query(
            'INSERT INTO items (name, category, price, description) VALUES (?, ?, ?, ?)',
            [normalizedName, normalizedCategory || null, parsedPrice, normalizedDesc || null]
        );
        return res.redirect('/dashboard?toast=Item_Cadastrado');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Erro ao cadastrar item.');
    }
});

app.post('/orders', async (req, res) => {
    const { customer_name, item_ids } = req.body;
    const normalizedName = typeof customer_name === 'string' ? customer_name.trim() : '';
    
    let ids = [];
    if (Array.isArray(item_ids)) ids = item_ids.map(Number);
    else if (item_ids) ids = [Number(item_ids)];

    if (!normalizedName || ids.length === 0) {
        return res.status(400).send('Dados inválidos: nome do cliente e marmitas são obrigatórios.');
    }

    try {
        const [items] = await pool.query('SELECT id, price FROM items WHERE id IN (?)', [ids]);
        let total = 0;
        ids.forEach(id => {
            const item = items.find(i => i.id === id);
            if (item) total += Number(item.price);
        });

        const [orderResult] = await pool.query(
            'INSERT INTO orders (customer_name, total, status) VALUES (?, ?, ?)',
            [normalizedName, total, 'Aberto']
        );
        const orderId = orderResult.insertId;

        for (const id of ids) {
            await pool.query(
                'INSERT INTO order_items (order_id, item_id, quantity) VALUES (?, ?, ?)',
                [orderId, id, 1]
            );
        }

        return res.redirect('/dashboard?toast=Pedido_Registrado');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Erro ao registrar pedido.');
    }
});

app.post('/update-order-status', async (req, res) => {
    const { order_id, new_status } = req.body;

    if (!order_id || !new_status) {
        return res.status(400).json({ error: 'ID do pedido e novo status são obrigatórios.' });
    }

    try {
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [new_status, Number(order_id)]
        );
        if (req.headers.accept?.includes('application/json')) {
            return res.json({ success: true });
        }
        return res.redirect('/dashboard?toast=Status_Atualizado');
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar status do pedido.' });
    }
});

app.post('/cancel-order', async (req, res) => {
    const { order_id } = req.body;
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['Cancelado', Number(order_id)]);
        return res.redirect('/dashboard?toast=Pedido_Cancelado');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Erro ao cancelar pedido.');
    }
});

app.get('/dashboard', async (req, res) => {
    try {
        const [items] = await pool.query('SELECT * FROM items');
        const [orders] = await pool.query("SELECT * FROM orders WHERE status != 'Cancelado' ORDER BY created_at DESC");
        const [orderItems] = await pool.query(`
            SELECT oi.order_id, i.name AS item_name, i.price 
            FROM order_items oi 
            JOIN items i ON oi.item_id = i.id
        `);

        orders.forEach(o => {
            o.itemsList = orderItems.filter(oi => oi.order_id === o.id);
        });

        const [faturamentoResult] = await pool.query(`
            SELECT SUM(total) AS faturamento 
            FROM orders 
            WHERE DATE(created_at) = CURDATE() AND status = 'Entregue'
        `);
        const faturamentoHoje = faturamentoResult[0].faturamento || 0;

        res.render('dashboard', { items, orders, faturamentoHoje });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar o dashboard.");
    }
});

app.get('/admin/export', async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT orders.id, orders.customer_name, orders.total, orders.status, orders.created_at
            FROM orders 
        `);

        let csv = 'ID;Cliente;Valor Total;Status;Data\n';
        orders.forEach(order => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            csv += `${order.id};"${order.customer_name}";${order.total};${order.status};${date}\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=vendas.csv');
        return res.send(csv);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Erro ao exportar relatório.');
    }
});

app.get('/faturamento', async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT SUM(total) AS total_hoje
            FROM orders 
            WHERE DATE(created_at) = CURDATE() AND status = 'Entregue'
        `);
        
        const [orders_hoje] = await pool.query(`
            SELECT orders.id, orders.customer_name, items.name AS item_name, items.price, orders.status, orders.created_at
            FROM orders 
            JOIN order_items ON orders.id = order_items.order_id
            JOIN items ON order_items.item_id = items.id
            WHERE DATE(orders.created_at) = CURDATE() AND orders.status = 'Entregue'
            ORDER BY orders.created_at DESC
        `);

        const total_hoje = result[0].total_hoje || 0;
        res.render('faturamento', { total_hoje, orders_hoje });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar faturamento.");
    }
});

app.get('/health', async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ status: 'unhealthy', reason: 'db_pool_not_initialized' });
        }
        await pool.query('SELECT 1');
        return res.json({ status: 'healthy' });
    } catch (err) {
        return res.status(500).json({ status: 'unhealthy', error: err.message });
    }
});

connectWithRetry().then(() => {
    app.listen(3000, () => {
        console.log('ISADORA RESTAURANT ONLINE NA PORTA 3000');
    });
});
