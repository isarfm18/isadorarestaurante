const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');
<<<<<<< HEAD
const bcrypt = require('bcrypt');

=======
>>>>>>> 9b23f602fa317018eb5fee1270f319b7752c0b59
const app = express();
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'marmitadb'
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

app.get('/', (req, res) => res.render('login'));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
<<<<<<< HEAD

        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            const user = rows[0];


            const match = await bcrypt.compare(password, user.password);

            if (match) {
                res.redirect('/dashboard');
            } else {
                res.send('<h1>Senha Inválida</h1><a href="/">Voltar</a>');
            }
        } else {
            res.send('<h1>Usuário não encontrado</h1><a href="/">Voltar</a>');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro no processamento do login.");
=======
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            const user = rows[0];
            // O segredo do DevOps: validar a segurança via código
            const match = await bcrypt.compare(password, user.password);
            if (match) return res.redirect('/dashboard');
        }
        res.send('<h1>Login Inválido</h1><a href="/">Voltar</a>');
    } catch (err) {
        res.status(500).send("Erro no servidor.");
>>>>>>> 9b23f602fa317018eb5fee1270f319b7752c0b59
    }
});
app.get('/dashboard', async (req, res) => {
    const [items] = await pool.query('SELECT * FROM items');
    const [orders] = await pool.query('SELECT * FROM orders');
    res.render('dashboard', { items, orders });
});

app.use(express.static('public'));

connectWithRetry().then(() => {
    app.listen(3000, () => {
        console.log('🚀 ISADORA RESTAURANT ONLINE NA PORTA 3000');
    });
});
