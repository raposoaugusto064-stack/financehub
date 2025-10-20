/**
 * DATA.JS - Módulo de Gerenciamento de Dados e Persistência
 * Responsável por todas as operações de CRUD e armazenamento local
 */

// ===== CONSTANTES =====
const STORAGE_KEYS = {
    USER: 'financehub_user',
    TRANSACTIONS: 'financehub_transactions',
    CARDS: 'financehub_cards',
    GOALS: 'financehub_goals',
    INVESTMENTS: 'financehub_investments',
    SETTINGS: 'financehub_settings',
    NOTIFICATIONS: 'financehub_notifications',
    REMINDERS: 'financehub_reminders'
};

// Categorias padrão com as personalizações solicitadas
const DEFAULT_CATEGORIES = {
    expense: [
        'Alimentação',
        'Transporte',
        'Moradia',
        'Saúde',
        'Educação',
        'Lazer',
        'Compras',
        'Contas',
        'Academia',
        'Streaming',
        'Restaurantes',
        'Viagens',
        'Pets',
        'Outros'
    ],
    income: [
        'Salário',
        'Freelance',
        'Investimentos',
        'Bônus',
        'Presente',
        'Outros'
    ]
};

// Taxas de câmbio (valores aproximados - em produção, usar API)
const EXCHANGE_RATES = {
    EUR: 1,
    USD: 1.08,
    BRL: 5.45,
    GBP: 0.86
};

// ===== CLASSE DE GERENCIAMENTO DE DADOS =====
class DataManager {
    constructor() {
        this.initializeStorage();
    }

    // Inicializar armazenamento local
    initializeStorage() {
        if (!this.getData(STORAGE_KEYS.SETTINGS)) {
            this.saveData(STORAGE_KEYS.SETTINGS, {
                currency: 'EUR',
                language: 'pt-BR',
                theme: 'auto',
                notifications: true
            });
        }

        if (!this.getData(STORAGE_KEYS.TRANSACTIONS)) {
            this.saveData(STORAGE_KEYS.TRANSACTIONS, []);
        }

        if (!this.getData(STORAGE_KEYS.CARDS)) {
            this.saveData(STORAGE_KEYS.CARDS, []);
        } else {
            // Migrar cartões existentes para incluir limitUsed e availableLimit se não existirem
            let cards = this.getData(STORAGE_KEYS.CARDS);
            let updated = false;
            cards = cards.map(card => {
                if (card.limitUsed === undefined || card.availableLimit === undefined) {
                    card.limitUsed = 0;
                    card.availableLimit = parseFloat(card.limit) || 0;
                    updated = true;
                }
                return card;
            });
            if (updated) {
                this.saveData(STORAGE_KEYS.CARDS, cards);
            }
        }

        if (!this.getData(STORAGE_KEYS.GOALS)) {
            this.saveData(STORAGE_KEYS.GOALS, []);
        }

        if (!this.getData(STORAGE_KEYS.INVESTMENTS)) {
            this.saveData(STORAGE_KEYS.INVESTMENTS, []);
        }

        if (!this.getData(STORAGE_KEYS.NOTIFICATIONS)) {
            this.saveData(STORAGE_KEYS.NOTIFICATIONS, []);
        }

        if (!this.getData(STORAGE_KEYS.REMINDERS)) {
            this.saveData(STORAGE_KEYS.REMINDERS, []);
        }
    }

    // Salvar dados no LocalStorage
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    }

    // Obter dados do LocalStorage
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    }

    // Limpar todos os dados
    clearAllData() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            this.initializeStorage();
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return false;
        }
    }

    // Exportar todos os dados
    exportData() {
        const data = {};
        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            data[name] = this.getData(key);
        });
        return data;
    }

    // Importar dados
    importData(data) {
        try {
            Object.entries(data).forEach(([name, value]) => {
                const key = STORAGE_KEYS[name];
                if (key) {
                    this.saveData(key, value);
                }
            });
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }

    // ===== TRANSAÇÕES =====
    
    // Adicionar transação
    addTransaction(transaction) {
        const transactions = this.getData(STORAGE_KEYS.TRANSACTIONS);
        transaction.id = this.generateId();
        transaction.createdAt = new Date().toISOString();
        transactions.push(transaction);
        this.saveData(STORAGE_KEYS.TRANSACTIONS, transactions);

        // Se for uma despesa e o método de pagamento for 'credit', deduzir do limite do cartão
        if (transaction.type === 'expense' && transaction.paymentMethod === 'credit' && transaction.cardId) {
            const card = this.getCardById(transaction.cardId);
            if (card) {
                card.limitUsed = (parseFloat(card.limitUsed) || 0) + parseFloat(transaction.amount);
                card.availableLimit = parseFloat(card.limit) - card.limitUsed;
                this.updateCard(card.id, { limitUsed: card.limitUsed, availableLimit: card.availableLimit });
            }
        }
        return transaction;
    }

    // Atualizar transação
    updateTransaction(id, updates) {
        const transactions = this.getData(STORAGE_KEYS.TRANSACTIONS);
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            const oldTransaction = { ...transactions[index] };
            transactions[index] = { ...oldTransaction, ...updates };
            this.saveData(STORAGE_KEYS.TRANSACTIONS, transactions);

            // Lógica para ajustar o limite do cartão ao atualizar uma transação
            if (oldTransaction.type === 'expense' && oldTransaction.paymentMethod === 'credit' && oldTransaction.cardId) {
                const card = this.getCardById(oldTransaction.cardId);
                if (card) {
                    card.limitUsed = (parseFloat(card.limitUsed) || 0) - parseFloat(oldTransaction.amount);
                    card.availableLimit = parseFloat(card.limit) - card.limitUsed;
                    this.updateCard(card.id, { limitUsed: card.limitUsed, availableLimit: card.availableLimit });
                }
            }

            if (transactions[index].type === 'expense' && transactions[index].paymentMethod === 'credit' && transactions[index].cardId) {
                const card = this.getCardById(transactions[index].cardId);
                if (card) {
                    card.limitUsed = (parseFloat(card.limitUsed) || 0) + parseFloat(transactions[index].amount);
                    card.availableLimit = parseFloat(card.limit) - card.limitUsed;
                    this.updateCard(card.id, { limitUsed: card.limitUsed, availableLimit: card.availableLimit });
                }
            }
            return transactions[index];
        }
        return null;
    }

    // Deletar transação
    deleteTransaction(id) {
        const transactions = this.getData(STORAGE_KEYS.TRANSACTIONS);
        const transactionToDelete = transactions.find(t => t.id === id);
        const filtered = transactions.filter(t => t.id !== id);
        this.saveData(STORAGE_KEYS.TRANSACTIONS, filtered);

        // Se a transação deletada for uma despesa de cartão de crédito, retornar o valor ao limite
        if (transactionToDelete && transactionToDelete.type === 'expense' && transactionToDelete.paymentMethod === 'credit' && transactionToDelete.cardId) {
            const card = this.getCardById(transactionToDelete.cardId);
            if (card) {
                card.limitUsed = (parseFloat(card.limitUsed) || 0) - parseFloat(transactionToDelete.amount);
                card.availableLimit = parseFloat(card.limit) - card.limitUsed;
                this.updateCard(card.id, { limitUsed: card.limitUsed, availableLimit: card.availableLimit });
            }
        }
        return true;
    }

    // Obter todas as transações
    getTransactions(filters = {}) {
        let transactions = this.getData(STORAGE_KEYS.TRANSACTIONS);
        
        // Aplicar filtros
        if (filters.type) {
            transactions = transactions.filter(t => t.type === filters.type);
        }
        if (filters.category) {
            transactions = transactions.filter(t => t.category === filters.category);
        }
        if (filters.startDate) {
            transactions = transactions.filter(t => new Date(t.date) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            transactions = transactions.filter(t => new Date(t.date) <= new Date(filters.endDate));
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            transactions = transactions.filter(t => 
                t.description.toLowerCase().includes(search) ||
                (t.notes && t.notes.toLowerCase().includes(search))
            );
        }
        
        // Ordenar por data (mais recente primeiro)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return transactions;
    }

    // Obter transação por ID
    getTransactionById(id) {
        const transactions = this.getData(STORAGE_KEYS.TRANSACTIONS);
        return transactions.find(t => t.id === id);
    }

    // ===== CARTÕES =====
    
    // Adicionar cartão
    addCard(card) {
        const cards = this.getData(STORAGE_KEYS.CARDS);
        card.id = this.generateId();
            card.limitUsed = 0;
            card.availableLimit = parseFloat(card.limit);
        card.createdAt = new Date().toISOString();
        cards.push(card);
        this.saveData(STORAGE_KEYS.CARDS, cards);
        return card;
    }

    // Atualizar cartão
    updateCard(id, updates) {
        const cards = this.getData(STORAGE_KEYS.CARDS);
        const index = cards.findIndex(c => c.id === id);
        if (index !== -1) {
            cards[index] = { ...cards[index], ...updates };
            this.saveData(STORAGE_KEYS.CARDS, cards);
            return cards[index];
        }
        return null;
    }

    // Deletar cartão
    deleteCard(id) {
        const cards = this.getData(STORAGE_KEYS.CARDS);
        const filtered = cards.filter(c => c.id !== id);
        this.saveData(STORAGE_KEYS.CARDS, filtered);
        return true;
    }

    // Obter todos os cartões
    getCards() {
        return this.getData(STORAGE_KEYS.CARDS);
    }

    // Obter cartão por ID
    getCardById(id) {
        const cards = this.getData(STORAGE_KEYS.CARDS);
        return cards.find(c => c.id === id);
    }



    // ===== METAS E ORÇAMENTOS =====
    
    // Adicionar meta/orçamento
    addGoal(goal) {
        const goals = this.getData(STORAGE_KEYS.GOALS);
        goal.id = this.generateId();
        goal.createdAt = new Date().toISOString();
        goals.push(goal);
        this.saveData(STORAGE_KEYS.GOALS, goals);
        return goal;
    }

    // Atualizar meta/orçamento
    updateGoal(id, updates) {
        const goals = this.getData(STORAGE_KEYS.GOALS);
        const index = goals.findIndex(g => g.id === id);
        if (index !== -1) {
            goals[index] = { ...goals[index], ...updates };
            this.saveData(STORAGE_KEYS.GOALS, goals);
            return goals[index];
        }
        return null;
    }

    // Deletar meta/orçamento
    deleteGoal(id) {
        const goals = this.getData(STORAGE_KEYS.GOALS);
        const filtered = goals.filter(g => g.id !== id);
        this.saveData(STORAGE_KEYS.GOALS, filtered);
        return true;
    }

    // Obter metas/orçamentos
    getGoals(type = null) {
        let goals = this.getData(STORAGE_KEYS.GOALS);
        if (type) {
            goals = goals.filter(g => g.type === type);
        }
        return goals;
    }

    // Obter meta/orçamento por ID
    getGoalById(id) {
        const goals = this.getData(STORAGE_KEYS.GOALS);
        return goals.find(g => g.id === id);
    }

    // ===== INVESTIMENTOS =====
    
    // Adicionar investimento
    addInvestment(investment) {
        const investments = this.getData(STORAGE_KEYS.INVESTMENTS);
        investment.id = this.generateId();
        investment.createdAt = new Date().toISOString();
        investments.push(investment);
        this.saveData(STORAGE_KEYS.INVESTMENTS, investments);
        return investment;
    }

    // Atualizar investimento
    updateInvestment(id, updates) {
        const investments = this.getData(STORAGE_KEYS.INVESTMENTS);
        const index = investments.findIndex(i => i.id === id);
        if (index !== -1) {
            investments[index] = { ...investments[index], ...updates };
            this.saveData(STORAGE_KEYS.INVESTMENTS, investments);
            return investments[index];
        }
        return null;
    }

    // Deletar investimento
    deleteInvestment(id) {
        const investments = this.getData(STORAGE_KEYS.INVESTMENTS);
        const filtered = investments.filter(i => i.id !== id);
        this.saveData(STORAGE_KEYS.INVESTMENTS, filtered);
        return true;
    }

    // Obter todos os investimentos
    getInvestments() {
        return this.getData(STORAGE_KEYS.INVESTMENTS);
    }

    // Obter investimento por ID
    getInvestmentById(id) {
        const investments = this.getData(STORAGE_KEYS.INVESTMENTS);
        return investments.find(i => i.id === id);
    }

    // ===== NOTIFICAÇÕES =====
    
    // Adicionar notificação
    addNotification(notification) {
        const notifications = this.getData(STORAGE_KEYS.NOTIFICATIONS);
        notification.id = this.generateId();
        notification.createdAt = new Date().toISOString();
        notification.read = false;
        notifications.unshift(notification); // Adicionar no início
        
        // Manter apenas as últimas 50 notificações
        if (notifications.length > 50) {
            notifications.splice(50);
        }
        
        this.saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
        return notification;
    }

    // Marcar notificação como lida
    markNotificationAsRead(id) {
        const notifications = this.getData(STORAGE_KEYS.NOTIFICATIONS);
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
        }
    }

    // Limpar todas as notificações
    clearNotifications() {
        this.saveData(STORAGE_KEYS.NOTIFICATIONS, []);
    }

    // Obter notificações
    getNotifications(unreadOnly = false) {
        let notifications = this.getData(STORAGE_KEYS.NOTIFICATIONS);
        if (unreadOnly) {
            notifications = notifications.filter(n => !n.read);
        }
        return notifications;
    }

    // ===== LEMBRETES =====
    
    // Adicionar lembrete
    addReminder(reminder) {
        const reminders = this.getData(STORAGE_KEYS.REMINDERS);
        reminder.id = this.generateId();
        reminder.createdAt = new Date().toISOString();
        reminders.push(reminder);
        this.saveData(STORAGE_KEYS.REMINDERS, reminders);
        return reminder;
    }

    // Deletar lembrete
    deleteReminder(id) {
        const reminders = this.getData(STORAGE_KEYS.REMINDERS);
        const filtered = reminders.filter(r => r.id !== id);
        this.saveData(STORAGE_KEYS.REMINDERS, filtered);
        return true;
    }

    // Obter lembretes
    getReminders() {
        return this.getData(STORAGE_KEYS.REMINDERS);
    }

    // ===== CONFIGURAÇÕES =====
    
    // Obter configurações
    getSettings() {
        return this.getData(STORAGE_KEYS.SETTINGS);
    }

    // Atualizar configurações
    updateSettings(updates) {
        const settings = this.getData(STORAGE_KEYS.SETTINGS);
        const newSettings = { ...settings, ...updates };
        this.saveData(STORAGE_KEYS.SETTINGS, newSettings);
        return newSettings;
    }

    // ===== USUÁRIO =====
    
    // Salvar usuário
    saveUser(user) {
        this.saveData(STORAGE_KEYS.USER, user);
    }

    // Obter usuário
    getUser() {
        return this.getData(STORAGE_KEYS.USER);
    }

    // Verificar senha
    verifyPassword(password) {
        const user = this.getUser();
        if (!user || !user.password) {
            // Primeira vez - criar senha
            this.saveUser({ password, name: 'Usuário' });
            return true;
        }
        return user.password === password;
    }

    // Atualizar senha
    updatePassword(newPassword) {
        const user = this.getUser() || {};
        user.password = newPassword;
        this.saveUser(user);
    }

    // ===== CÁLCULOS E ESTATÍSTICAS =====
    
    // Calcular resumo financeiro
    getFinancialSummary(filters = {}) {
        const transactions = this.getTransactions(filters);
        
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const balance = income - expense;
        const savings = balance > 0 ? balance : 0;
        
        return { income, expense, balance, savings };
    }

    // Calcular gastos por categoria
    getExpensesByCategory(filters = {}) {
        const transactions = this.getTransactions({ ...filters, type: 'expense' });
        const categories = {};
        
        transactions.forEach(t => {
            if (!categories[t.category]) {
                categories[t.category] = 0;
            }
            categories[t.category] += parseFloat(t.amount);
        });
        
        return categories;
    }

    // Calcular evolução mensal
    getMonthlyEvolution(year = new Date().getFullYear()) {
        const months = Array.from({ length: 12 }, (_, i) => i);
        const data = months.map(month => {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);
            
            const summary = this.getFinancialSummary({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
            
            return {
                month,
                income: summary.income,
                expense: summary.expense,
                balance: summary.balance
            };
        });
        
        return data;
    }

    // Calcular estatísticas avançadas
    getAdvancedStatistics() {
        const transactions = this.getTransactions();
        const expenses = transactions.filter(t => t.type === 'expense');
        
        // Média mensal de gastos
        const monthlyExpenses = this.getMonthlyEvolution();
        const avgMonthlyExpense = monthlyExpenses.reduce((sum, m) => sum + m.expense, 0) / 12;
        
        // Maior despesa
        const maxExpense = expenses.length > 0 
            ? Math.max(...expenses.map(e => parseFloat(e.amount)))
            : 0;
        
        // Categoria mais gasta
        const categoryExpenses = this.getExpensesByCategory();
        const topCategory = Object.entries(categoryExpenses)
            .sort((a, b) => b[1] - a[1])[0];
        
        // Taxa de economia
        const summary = this.getFinancialSummary();
        const savingsRate = summary.income > 0 
            ? (summary.savings / summary.income) * 100 
            : 0;
        
        return {
            avgMonthlyExpense,
            maxExpense,
            topCategory: topCategory ? topCategory[0] : '-',
            topCategoryAmount: topCategory ? topCategory[1] : 0,
            savingsRate
        };
    }

    // Previsão de saldo futuro (simples)
    getForecast(months = 6) {
        const monthlyEvolution = this.getMonthlyEvolution();
        const recentMonths = monthlyEvolution.slice(-3); // Últimos 3 meses
        
        const avgIncome = recentMonths.reduce((sum, m) => sum + m.income, 0) / 3;
        const avgExpense = recentMonths.reduce((sum, m) => sum + m.expense, 0) / 3;
        const avgBalance = avgIncome - avgExpense;
        
        const currentBalance = this.getFinancialSummary().balance;
        const forecast = [];
        
        for (let i = 1; i <= months; i++) {
            forecast.push({
                month: i,
                predictedBalance: currentBalance + (avgBalance * i),
                predictedIncome: avgIncome,
                predictedExpense: avgExpense
            });
        }
        
        return forecast;
    }

    // ===== UTILITÁRIOS =====
    
    // Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Formatar moeda
    formatCurrency(amount, currency = null) {
        const settings = this.getSettings();
        const curr = currency || settings.currency || 'EUR';
        
        const symbols = {
            EUR: '€',
            USD: '$',
            BRL: 'R$',
            GBP: '£'
        };
        
        const formatted = parseFloat(amount).toFixed(2).replace('.', ',');
        return `${symbols[curr]} ${formatted}`;
    }

    // Converter moeda
    convertCurrency(amount, from, to) {
        if (from === to) return amount;
        
        // Converter para EUR primeiro (moeda base)
        const amountInEUR = amount / EXCHANGE_RATES[from];
        
        // Converter de EUR para moeda de destino
        return amountInEUR * EXCHANGE_RATES[to];
    }

    // Calcular juros compostos
    calculateCompoundInterest(principal, rate, time, monthlyContribution = 0) {
        let amount = principal;
        
        for (let i = 0; i < time; i++) {
            amount = amount * (1 + rate / 100) + monthlyContribution;
        }
        
        return {
            finalAmount: amount,
            totalContributed: principal + (monthlyContribution * time),
            totalInterest: amount - principal - (monthlyContribution * time)
        };
    }

    // Simular parcelamento
    simulateInstallment(totalAmount, installments, interestRate = 0) {
        if (interestRate === 0) {
            const installmentValue = totalAmount / installments;
            return {
                installmentValue,
                totalAmount,
                totalInterest: 0
            };
        }
        
        // Fórmula de Price (Sistema Francês de Amortização)
        const monthlyRate = interestRate / 100;
        const installmentValue = totalAmount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
                                 (Math.pow(1 + monthlyRate, installments) - 1);
        const finalTotal = installmentValue * installments;
        
        return {
            installmentValue,
            totalAmount: finalTotal,
            totalInterest: finalTotal - totalAmount
        };
    }

    // Obter categorias
    getCategories(type = null) {
        if (type) {
            return DEFAULT_CATEGORIES[type] || [];
        }
        return DEFAULT_CATEGORIES;
    }
}

// Instância global do gerenciador de dados
const dataManager = new DataManager();

