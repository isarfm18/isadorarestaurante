const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();

const dbConfig = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'isadoradb'
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

app.use(bodyParser.urlencoded({ extended: true }));
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
    const { name, category, price } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedCategory = typeof category === 'string' ? category.trim() : '';
    const parsedPrice = Number(price);

    if (!normalizedName || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).send('Dados inválidos: nome obrigatório e preço deve ser número positivo.');
    }

    try {
        await pool.query(
            'INSERT INTO items (name, category, price) VALUES (?, ?, ?)',
            [normalizedName, normalizedCategory || null, parsedPrice]
        );
        return res.redirect('/dashboard?toast=Item_Cadastrado');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Erro ao cadastrar item.');
    }
});

app.post('/orders', async (req, res) => {
    const { customer_name, item_id } = req.body;
    const normalizedName = typeof customer_name === 'string' ? customer_name.trim() : '';
    const parsedItemId = Number(item_id);

    if (!normalizedName || !Number.isInteger(parsedItemId) || parsedItemId <= 0) {
        return res.status(400).send('Dados inválidos: nome do cliente e marmita são obrigatórios.');
    }

    try {
        await pool.query(
            'INSERT INTO orders (customer_name, item_id, status) VALUES (?, ?, ?)',
            [normalizedName, parsedItemId, 'Aberto']
        );
        return res.redirect('/dashboard?toast=Pedido_Registrado');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Erro ao registrar pedido.');
    }
});

app.post('/update-order-status', async (req, res) => {
    const { order_id, new_status } = req.body;

    if (!order_id || !new_status) {
        return res.status(400).send('ID do pedido e novo status são obrigatórios.');
    }

    try {
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [new_status, Number(order_id)]
        );
        return res.redirect('/dashboard?toast=Status_Atualizado');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Erro ao atualizar status do pedido.');
    }
});

app.get('/dashboard', async (req, res) => {
    try {
        const [items] = await pool.query('SELECT * FROM items');
        const [orders] = await pool.query(`
            SELECT orders.*, items.name AS item_name 
            FROM orders 
            LEFT JOIN items ON orders.item_id = items.id
        `);
        res.render('dashboard', { items, orders });
    } catch (err) {
        res.status(500).send("Erro ao carregar o dashboard.");
    }
});

app.get('/admin/export', async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT orders.id, orders.customer_name, items.name AS item_name, items.price, orders.status, orders.created_at
            FROM orders 
            LEFT JOIN items ON orders.item_id = items.id
        `);

        let csv = 'ID,Cliente,Item,Valor,Status,Data\n';
        orders.forEach(order => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            csv += `${order.id},"${order.customer_name}","${order.item_name || ''}",${order.price || 0},${order.status},${date}\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=vendas.csv');
        return res.send(csv);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Erro ao exportar relatório.');
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
