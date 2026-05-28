const API_URL = 'http://localhost:3000/api';

const app = {
    userName: '',
    historyChartInstance: null,
    practices: [],
    activePractice: null,
    practiceInterval: null,

    // Inicialização da Vida Útil do App
    init() {
        this.switchAuth('login');
    },

    // Controlador de Telas de Autenticação
    switchAuth(type) {
        document.querySelectorAll('.auth-view').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${type}`).classList.add('active');
        
        // Esconde a mensagem de erro da respectiva tela, caso exista
        const errorId = type === 'register' ? 'reg-error' : 'login-error';
        const errorEl = document.getElementById(errorId);
        if (errorEl) errorEl.classList.add('hidden');
    },

    // Ação pós-login bem-sucedido
    onLoginSuccess(userName) {
        this.userName = userName;
        
        // Ocultar auth views
        document.querySelectorAll('.auth-view').forEach(v => v.classList.remove('active'));
        
        // Exibir a Bottom Nav Bar
        document.getElementById('bottom-nav').classList.remove('hidden');
        
        // Muda para a tab Home via switchTab para consistência
        const homeBtn = document.querySelectorAll('.nav-btn')[0];
        this.switchTab('home', homeBtn);
        
        // Exibir nome do usuário na Home
        const welcome = document.getElementById('welcome-message');
        welcome.textContent = `Olá, ${userName}!`;
        welcome.classList.remove('hidden');
        
        // Inicializar os dados da sessão
        this.bindSliders();
        this.setDate();
        this.loadDailyPhrase();
        this.loadPractices();
        this.loadRoutine();
        this.loadHistory(); 
    },

    // Centralizador de Requisições de Autenticação
    async authRequest(endpoint, payload, errorElId) {
        const errorEl = document.getElementById(errorElId);
        try {
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.error || `Erro no ${endpoint}`);
            
            this.onLoginSuccess(data.user.name);
        } catch(e) {
            errorEl.textContent = e.message;
            errorEl.classList.remove('hidden');
        }
    },

    // Chamada à API de Registro
    register() {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        this.authRequest('register', { name, email, password }, 'reg-error');
    },

    // Chamada à API de Login
    login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        this.authRequest('login', { email, password }, 'login-error');
    },

    // Formata a data atual (Ex: Segunda-feira, 26 de Maio)
    setDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('pt-BR', options);
    },

    // Controlador de Tabs do Bottom Navigation Bar
    switchTab(tabId, btnElement) {
        // Esconde as views atuais
        document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
        
        // Exibe a view selecionada
        document.getElementById(`tab-${tabId}`).classList.add('active');

        // Troca os estilos de opacidade e cores do menu selecionado
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    },

    // Lida com a movimentação dos sliders HTML no diagnóstico
    bindSliders() {
        ['physical', 'mental', 'spiritual'].forEach(type => {
            const slider = document.getElementById(`score-${type}`);
            const display = document.getElementById(`val-${type}`);
            if(slider && display) {
                slider.addEventListener('input', (e) => display.textContent = e.target.value);
            }
        });
    },

    // Conecta na nova API de frases
    async loadDailyPhrase() {
        try {
            const res = await fetch(`${API_URL}/phrases/daily`);
            const data = await res.json();
            document.getElementById('daily-phrase').textContent = `"${data.phrase}"`;
        } catch(e) { console.error("Erro na requisição da frase:", e); }
    },

    // Conecta na nova API de práticas explicativas da Biblioteca
    async loadPractices() {
        try {
            const res = await fetch(`${API_URL}/practices`);
            const data = await res.json();
            const list = document.getElementById('practices-list');
            list.innerHTML = '';
            
            data.practices.forEach((p, index) => {
                const card = document.createElement('div');
                card.className = 'practice-card fade-in';
                card.style.animationDelay = `${index * 0.15}s`;
                
                // Escolhemos ícones dinâmicos de acordo com o tipo (brincadeira visual)
                let iconName = 'fitness-outline';
                if(p.title.includes('Montanha')) iconName = 'image-outline';
                if(p.title.includes('Body')) iconName = 'body-outline';

                card.innerHTML = `
                    <ion-icon name="${iconName}" class="practice-icon"></ion-icon>
                    <div class="practice-content">
                        <div class="practice-title">${p.title}</div>
                        <div class="practice-duration"><ion-icon name="time-outline"></ion-icon> ${p.duration}</div>
                        <div class="practice-desc">${p.description}</div>
                    </div>
                `;
                list.appendChild(card);
            });
        } catch(e) { console.error("Erro ao carregar práticas:", e); }
    },

    // Submissão do Formulário de Diagnóstico (Motor da Tríade)
    async submitDiagnosis() {
        const physical = parseInt(document.getElementById('score-physical').value);
        const mental = parseInt(document.getElementById('score-mental').value);
        const spiritual = parseInt(document.getElementById('score-spiritual').value);

        try {
            const res = await fetch(`${API_URL}/diagnosis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ physical, mental, spiritual })
            });
            const data = await res.json();
            this.renderRoutine(data.routine);
            
            // Navega automaticamente para a aba 'Rotina' usando a bottom bar simulando clique do usuário
            const routineBtn = document.querySelectorAll('.nav-btn')[1];
            this.switchTab('routine', routineBtn);
            this.loadHistory(); // Atualiza histórico após diagnóstico
        } catch (error) {
            alert("Erro ao conectar com o Motor da Tríade.");
        }
    },

    // Adiciona uma nova tarefa à To-Do list
    async addTask() {
        const input = document.getElementById('new-task-input');
        const title = input.value.trim();
        if(!title) return;

        try {
            await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            input.value = '';
            this.loadRoutine();
        } catch (error) { console.error(error); }
    },

    // Busca a rotina da memória do servidor
    async loadRoutine() {
        try {
            const res = await fetch(`${API_URL}/routine`);
            const data = await res.json();
            this.renderRoutine(data.routine);
        } catch (error) {}
    },

    // Busca a rotina da memória do servidor
    async loadPractices() {
        try {
            const response = await fetch(`${API_URL}/practices`);
            const data = await response.json();
            this.practices = data.practices;
            this.renderPractices(data.practices);
        } catch (error) {
            console.error('Erro ao buscar práticas:', error);
        }
    },

    renderPractices(practices) {
        const list = document.getElementById('practices-list');
        list.innerHTML = '';
        practices.forEach(p => {
            const card = document.createElement('div');
            card.className = 'practice-card';
            card.innerHTML = `
                <div class="practice-icon">
                    <ion-icon name="leaf-outline"></ion-icon>
                </div>
                <div class="practice-content">
                    <h3 class="mb-1">${p.title} <span class="tag tag-mental">${p.duration}</span></h3>
                    <p class="text-sm">${p.description}</p>
                    <button class="btn-primary mt-2" onclick="app.openPracticeModal(${p.id})">Praticar Agora</button>
                </div>
            `;
            list.appendChild(card);
        });
    },

    // ==========================================
    // PRÁTICA INTERATIVA (MODAL)
    // ==========================================
    openPracticeModal(id) {
        this.activePractice = this.practices.find(p => p.id === id);
        if (!this.activePractice) return;

        document.getElementById('practice-title').innerText = this.activePractice.title;
        document.getElementById('practice-status').innerText = "Prepare-se...";
        document.getElementById('practice-timer').innerText = "--";
        document.getElementById('breathing-circle').style.transform = 'scale(1)';
        
        document.getElementById('start-practice-btn').classList.remove('hidden');
        document.getElementById('interactive-modal').classList.remove('hidden');
    },

    closePracticeModal() {
        document.getElementById('interactive-modal').classList.add('hidden');
        if (this.practiceInterval) {
            clearInterval(this.practiceInterval);
            this.practiceInterval = null;
        }
    },

    async startInteractivePractice() {
        if (!this.activePractice) return;
        document.getElementById('start-practice-btn').classList.add('hidden');
        
        const statusEl = document.getElementById('practice-status');
        const timerEl = document.getElementById('practice-timer');
        const circleEl = document.getElementById('breathing-circle');

        // Contagem regressiva de preparação
        statusEl.innerText = "Começando em...";
        for (let i = 3; i > 0; i--) {
            timerEl.innerText = i;
            await new Promise(res => setTimeout(res, 1000));
        }

        const cycles = this.activePractice.cycles;
        const totalRounds = this.activePractice.totalRounds;

        for (let round = 1; round <= totalRounds; round++) {
            for (let i = 0; i < cycles.length; i++) {
                const step = cycles[i];
                statusEl.innerText = `${step.text} (Ciclo ${round}/${totalRounds})`;
                
                // Configura animação do círculo
                circleEl.style.transition = `transform ${step.time}s ease-in-out`;
                if (step.action === 'inhale') {
                    circleEl.style.transform = 'scale(1.8)';
                } else if (step.action === 'exhale') {
                    circleEl.style.transform = 'scale(1.0)';
                } else {
                    // hold: mantém escala
                }

                // Conta o tempo deste passo
                let timeLeft = step.time;
                timerEl.innerText = timeLeft;
                
                await new Promise(resolve => {
                    const stepInterval = setInterval(() => {
                        timeLeft--;
                        timerEl.innerText = timeLeft;
                        if (timeLeft <= 0) {
                            clearInterval(stepInterval);
                            resolve();
                        }
                    }, 1000);
                    // Armazena no app caso o usuário feche o modal no meio
                    this.practiceInterval = stepInterval;
                });
            }
        }

        // Finalizou a prática
        statusEl.innerText = "Prática Concluída!";
        timerEl.innerText = "✓";
        circleEl.style.transform = 'scale(1)';
        await new Promise(res => setTimeout(res, 2000));
        
        this.finishPractice();
    },

    async finishPractice() {
        try {
            await fetch(`${API_URL}/practices/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: this.activePractice.category })
            });
            // Atualiza histórico na tela
            this.loadHistory();
            this.closePracticeModal();
        } catch (error) {
            console.error('Erro ao finalizar prática', error);
        }
    },

    // Pinta a interface (DOM) com os cards da rotina (Modo Foco ou Manual)
    renderRoutine(routineArray) {
        const list = document.getElementById('routine-list');
        list.innerHTML = '';

        if(routineArray.length === 0) {
            list.innerHTML = `
                <div class="empty-state text-center mt-5">
                    <ion-icon name="calendar-clear-outline"></ion-icon>
                    <p>Sua rotina ainda não foi gerada.<br>Vá na Home e faça o Diagnóstico Sincero.</p>
                </div>`;
            return;
        }

        routineArray.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = `task-card fade-in ${item.isFocus ? 'focus-item' : 'normal-item'}`;
            card.style.animationDelay = `${index * 0.1}s`; // Animação em cascata
            card.innerHTML = `
                <input type="checkbox" onchange="this.parentElement.classList.toggle('completed')">
                <div class="task-content">
                    <div class="task-type">
                        ${item.type} 
                        ${item.isFocus ? '<span style="color:var(--focus-color)">• Foco Pleno</span>' : ''}
                    </div>
                    <div class="task-text">${item.task}</div>
                </div>
            `;
            list.appendChild(card);
        });
    },

    // ==========================================
    // HISTÓRICO E ESTATÍSTICAS
    // ==========================================
    async loadHistory() {
        try {
            const response = await fetch(`${API_URL}/history`);
            const data = await response.json();
            
            if (data.history && data.history.length > 0) {
                this.renderHistory(data.history);
            }
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
        }
    },

    renderHistory(historyData) {
        // Calcular médias da semana (usando os dados recebidos)
        const totalPhysical = historyData.reduce((acc, curr) => acc + curr.physical, 0);
        const totalMental = historyData.reduce((acc, curr) => acc + curr.mental, 0);
        const totalSpiritual = historyData.reduce((acc, curr) => acc + curr.spiritual, 0);
        const count = historyData.length;

        document.getElementById('avg-physical').innerText = (totalPhysical / count).toFixed(1);
        document.getElementById('avg-mental').innerText = (totalMental / count).toFixed(1);
        document.getElementById('avg-spiritual').innerText = (totalSpiritual / count).toFixed(1);

        // Preparar dados para o gráfico
        const labels = historyData.map(h => h.date);
        const physicalData = historyData.map(h => h.physical);
        const mentalData = historyData.map(h => h.mental);
        const spiritualData = historyData.map(h => h.spiritual);

        const canvas = document.getElementById('historyChart');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');

        // Destruir gráfico anterior se existir para evitar sobreposição
        if (this.historyChartInstance) {
            this.historyChartInstance.destroy();
        }

        // Criar novo gráfico
        this.historyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Físico',
                        data: physicalData,
                        borderColor: '#FF6B6B',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Mental',
                        data: mentalData,
                        borderColor: '#4ECDC4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Espiritual',
                        data: spiritualData,
                        borderColor: '#C56CF0',
                        backgroundColor: 'rgba(197, 108, 240, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { family: "'Outfit', sans-serif" } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
};

// Injeta a aplicação no documento
document.addEventListener('DOMContentLoaded', () => app.init());
