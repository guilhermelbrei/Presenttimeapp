const express = require('express');
const router = express.Router();
const mockDB = require('../data/mockDB');

// Endpoint de Diagnóstico: O motor da Tríade
router.post('/diagnosis', (req, res) => {
    // Recebe as notas avaliadas pelo usuário de 1 a 5
    const { physical, mental, spiritual } = req.body;
    
    // Zera a rotina atual para gerar uma nova
    mockDB.userRoutine = [];

    // Lógica do Motor: se a nota for menor ou igual a 3 (sinal de alerta), adicionamos um micro-gesto específico
    if (physical <= 3) {
        mockDB.userRoutine.push({ id: Date.now() + 1, type: 'Físico', task: mockDB.microGestures.physical[0], isFocus: true });
    }
    if (mental <= 3) {
        mockDB.userRoutine.push({ id: Date.now() + 2, type: 'Mental', task: mockDB.microGestures.mental[0], isFocus: true });
    }
    if (spiritual <= 3) {
        mockDB.userRoutine.push({ id: Date.now() + 3, type: 'Espiritual', task: mockDB.microGestures.spiritual[0], isFocus: true });
    }

    // Se o usuário estiver equilibrado (todas as notas > 3), mandamos uma rotina de manutenção base
    if (mockDB.userRoutine.length === 0) {
        mockDB.userRoutine.push({ id: Date.now() + 1, type: 'Físico', task: mockDB.microGestures.physical[1], isFocus: true });
        mockDB.userRoutine.push({ id: Date.now() + 2, type: 'Mental', task: mockDB.microGestures.mental[1], isFocus: true });
    }

    res.json({ message: 'Diagnóstico processado com sucesso!', routine: mockDB.userRoutine });
});

// Endpoint para ler a rotina do usuário
router.get('/routine', (req, res) => {
    res.json({ routine: mockDB.userRoutine });
});

// Endpoint para adicionar tarefas mecânicas à To-Do list
router.post('/tasks', (req, res) => {
    const { title } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Título da tarefa é obrigatório.' });
    }

    const newTask = {
        id: Date.now(),
        type: 'Mecânica',
        task: title,
        isFocus: false
    };
    
    mockDB.userRoutine.push(newTask);
    res.json({ message: 'Tarefa adicionada', task: newTask });
});

// NOVO: Endpoint para obter uma Frase Diária Aleatória
router.get('/phrases/daily', (req, res) => {
    const randomIndex = Math.floor(Math.random() * mockDB.dailyPhrases.length);
    res.json({ phrase: mockDB.dailyPhrases[randomIndex] });
});

// NOVO: Endpoint para acessar a Biblioteca de Práticas Explicativas
router.get('/practices', (req, res) => {
    res.json({ practices: mockDB.practicesLibrary });
});

// NOVO: Endpoint para registrar conclusão de prática
router.post('/practices/complete', (req, res) => {
    const { category } = req.body; // 'physical', 'mental', or 'spiritual'
    
    // Para MVP, pegamos o usuário de teste (id: 1)
    const user = mockDB.users.find(u => u.id === 1);
    
    if (user && user.history && user.history.length > 0) {
        // Pega o último dia (hoje no mock)
        const todayStats = user.history[user.history.length - 1];
        
        if (category && todayStats[category] !== undefined) {
            // Soma 1 ponto, com limite máximo de 5
            todayStats[category] = Math.min(5, todayStats[category] + 1);
        }
    }
    res.json({ message: 'Prática concluída com sucesso! Histórico atualizado.' });
});

// NOVO: Endpoint para acessar o Histórico de Desempenho
router.get('/history', (req, res) => {
    // Para fins do MVP e apresentação, retornamos o histórico do usuário de teste
    const user = mockDB.users.find(u => u.id === 1);
    const history = user && user.history ? user.history : [];
    res.json({ history });
});

// NOVO: Endpoint para Registro (Mock)
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const userExists = mockDB.users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    const newUser = { id: Date.now(), name, email, password };
    mockDB.users.push(newUser);
    
    res.json({ message: 'Cadastro realizado com sucesso!', user: { id: newUser.id, name: newUser.name } });
});

// NOVO: Endpoint para Login (Mock)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = mockDB.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    res.json({ message: 'Login realizado com sucesso!', user: { id: user.id, name: user.name } });
});

module.exports = router;
