const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir a interface do Frontend (arquivos estáticos da pasta public)
app.use(express.static(path.join(__dirname, '../public')));

// Registra as rotas da nossa aplicação no prefixo /api
app.use('/api', apiRoutes);

// Rota de teste padrão
app.get('/api/status', (req, res) => {
    res.json({ message: 'Present Time API está rodando e conectada ao Momento Presente!' });
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Acesse o App pelo navegador em: http://localhost:${PORT}`);
});
