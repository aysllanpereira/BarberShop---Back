// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./src/config/database');
const bookingRoutes = require('./src/routes/rota');

const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', bookingRoutes);

sequelize.sync({ force: true }).then(async () => {
    const Professional = require('./src/models/professional');
    await Professional.bulkCreate([
        { name: 'Profissional 1' },
        { name: 'Profissional 2' },
        { name: 'Profissional 3' },
        { name: 'Profissional 4' }
    ]);

    app.listen(port, () => {
        console.log(`Servidor rodando na porta: ${port}`);
    });
}).catch(err => console.error('Não foi possível conectar ao banco de dados', err));

