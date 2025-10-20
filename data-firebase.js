/**
 * DATA-FIREBASE.JS - Módulo de Gerenciamento de Dados com Firebase
 * Responsável por todas as operações de CRUD com sincronização em tempo real
 */

// Categorias padrão
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

// Taxas de câmbio
const EXCHANGE_RATES = {
    EUR: 1,
    USD: 1.08,
    BRL: 5.45,
    GBP: 0.86
};

/**
 * Classe de Gerenciamento de Dados com Firebase
 */
class FirebaseDataManager {
    constructor() {
        this.listeners = {};
        this.initializeFirebase();
    }

    /**
     * Inicializar Firebase e carregar dados
     */
    async initializeFirebase() {
        await waitForFirebase();
        
        // Inicializar settings padrão
        const settings = await getDocument(COLLECTIONS.SETTINGS, 'default');
        if (!settings) {
            await saveDocument(COLLECTIONS.SETTINGS, 'default', {
                currency: 'EUR',
                language: 'pt-BR',
                theme: 'auto',
                notifications: true
            });
        }

        // Configurar listeners em tempo real
        this.setupListeners();
    }

    /**
     * Configurar listeners em tempo real para todas as coleções
     */
    setupListeners() {
        // Listener para transações
        listenToCollection(COLLECTIONS.TRANSACTIONS, (data) => {
            if (this.listeners.transactions) {
                this.listeners.transactions(data);
            }
        });

        // Listener para cartões
        listenToCollection(COLLECTIONS.CARDS, (data) => {
            if (this.listeners.cards) {
                this.listeners.cards(data);
            }
        });

        // Listener para metas
        listenToCollection(COLLECTIONS.GOALS, (data) => {
            if (this.listeners.goals) {
                this.listeners.goals(data);
            }
        });

        // Listener para investimentos
        listenToCollection(COLLECTIONS.INVESTMENTS, (data) => {
            if (this.listeners.investments) {
                this.listeners.investments(data);
            }
        });

        // Listener para notificações
        listenToCollection(COLLECTIONS.NOTIFICATIONS, (data) => {
            if (this.listeners.notifications) {
                this.listeners.notifications(data);
            }
        });

        // Listener para lembretes
        listenToCollection(COLLECTIONS.REMINDERS, (data) => {
            if (this.listeners.reminders) {
                this.listeners.reminders(data);
            }
        });
    }

    /**
     * Registrar listener para mudanças em tempo real
     */
    onDataChange(collection, callback) {
        if (!this.listeners[collection]) {
            this.listeners[collection] = callback;
        }
    }

    /**
     * Gerar ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ===== TRANSAÇÕES =====

    /**
     * Adicionar transação
     */
    async addTransaction(transaction) {
        try {
            transaction.id = this.generateId();
            transaction.createdAt = new Date().toISOString();
            
            await addDocument(COLLECTIONS.TRANSACTIONS, transaction);

            // Se for despesa de cartão de crédito, atualizar limite
            if (transaction.type === 'expense' && transaction.paymentMethod === 'credit' && transaction.cardId) {
                await this.updateCardLimit(transaction.cardId, transaction.amount, 'add');
            }

            return transaction;
        } catch (error) {
            console.error('Erro ao adicionar transação:', error);
            return null;
        }
    }

    /**
     * Atualizar transação
     */
    async updateTransaction(id, updates) {
        try {
            const oldTransaction = await getDocument(COLLECTIONS.TRANSACTIONS, id);
            
            if (oldTransaction) {
                // Ajustar limite do cartão se necessário
                if (oldTransaction.type === 'expense' && oldTransaction.paymentMethod === 'credit' && oldTransaction.cardId) {
                    await this.updateCardLimit(oldTransaction.cardId, oldTransaction.amount, 'subtract');
                }

                // Aplicar atualizações
                await updateDocument(COLLECTIONS.TRANSACTIONS, id, updates);

                // Ajustar novo limite se a transação atualizada for de cartão
                if (updates.type === 'expense' && updates.paymentMethod === 'credit' && updates.cardId) {
                    await this.updateCardLimit(updates.cardId, updates.amount, 'add');
                }
            }

            return true;
        } catch (error) {
            console.error('Erro ao atualizar transação:', error);
            return false;
        }
    }

    /**
     * Deletar transação
     */
    async deleteTransaction(id) {
        try {
            const transaction = await getDocument(COLLECTIONS.TRANSACTIONS, id);
            
            if (transaction && transaction.type === 'expense' && transaction.paymentMethod === 'credit' && transaction.cardId) {
                await this.updateCardLimit(transaction.cardId, transaction.amount, 'subtract');
            }

            await deleteDocument(COLLECTIONS.TRANSACTIONS, id);
            return true;
        } catch (error) {
            console.error('Erro ao deletar transação:', error);
            return false;
        }
    }

    /**
     * Obter transações com filtros
     */
    async getTransactions(filters = {}) {
        try {
            let transactions = await getCollection(COLLECTIONS.TRANSACTIONS);
            
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
            
            // Ordenar por data
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            return transactions;
        } catch (error) {
            console.error('Erro ao obter transações:', error);
            return [];
        }
    }

    /**
     * Obter transação por ID
     */
    async getTransactionById(id) {
        try {
            return await getDocument(COLLECTIONS.TRANSACTIONS, id);
        } catch (error) {
            console.error('Erro ao obter transação:', error);
            return null;
        }
    }

    // ===== CARTÕES =====

    /**
     * Adicionar cartão
     */
    async addCard(card) {
        try {
            card.id = this.generateId();
            card.limitUsed = 0;
            card.availableLimit = parseFloat(card.limit);
            card.createdAt = new Date().toISOString();
            
            await addDocument(COLLECTIONS.CARDS, card);
            return card;
        } catch (error) {
            console.error('Erro ao adicionar cartão:', error);
            return null;
        }
    }

    /**
     * Atualizar cartão
     */
    async updateCard(id, updates) {
        try {
            await updateDocument(COLLECTIONS.CARDS, id, updates);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar cartão:', error);
            return false;
        }
    }

    /**
     * Deletar cartão
     */
    async deleteCard(id) {
        try {
            await deleteDocument(COLLECTIONS.CARDS, id);
            return true;
        } catch (error) {
            console.error('Erro ao deletar cartão:', error);
            return false;
        }
    }

    /**
     * Obter todos os cartões
     */
    async getCards() {
        try {
            return await getCollection(COLLECTIONS.CARDS);
        } catch (error) {
            console.error('Erro ao obter cartões:', error);
            return [];
        }
    }

    /**
     * Obter cartão por ID
     */
    async getCardById(id) {
        try {
            return await getDocument(COLLECTIONS.CARDS, id);
        } catch (error) {
            console.error('Erro ao obter cartão:', error);
            return null;
        }
    }

    /**
     * Atualizar limite do cartão
     */
    async updateCardLimit(cardId, amount, operation) {
        try {
            const card = await this.getCardById(cardId);
            if (card) {
                const amountNum = parseFloat(amount);
                if (operation === 'add') {
                    card.limitUsed = (parseFloat(card.limitUsed) || 0) + amountNum;
                } else if (operation === 'subtract') {
                    card.limitUsed = Math.max(0, (parseFloat(card.limitUsed) || 0) - amountNum);
                }
                card.availableLimit = parseFloat(card.limit) - card.limitUsed;
                await this.updateCard(cardId, { 
                    limitUsed: card.limitUsed, 
                    availableLimit: card.availableLimit 
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar limite do cartão:', error);
        }
    }

    // ===== METAS =====

    /**
     * Adicionar meta
     */
    async addGoal(goal) {
        try {
            goal.id = this.generateId();
            goal.createdAt = new Date().toISOString();
            
            await addDocument(COLLECTIONS.GOALS, goal);
            return goal;
        } catch (error) {
            console.error('Erro ao adicionar meta:', error);
            return null;
        }
    }

    /**
     * Atualizar meta
     */
    async updateGoal(id, updates) {
        try {
            await updateDocument(COLLECTIONS.GOALS, id, updates);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar meta:', error);
            return false;
        }
    }

    /**
     * Deletar meta
     */
    async deleteGoal(id) {
        try {
            await deleteDocument(COLLECTIONS.GOALS, id);
            return true;
        } catch (error) {
            console.error('Erro ao deletar meta:', error);
            return false;
        }
    }

    /**
     * Obter todas as metas
     */
    async getGoals() {
        try {
            return await getCollection(COLLECTIONS.GOALS);
        } catch (error) {
            console.error('Erro ao obter metas:', error);
            return [];
        }
    }

    // ===== INVESTIMENTOS =====

    /**
     * Adicionar investimento
     */
    async addInvestment(investment) {
        try {
            investment.id = this.generateId();
            investment.createdAt = new Date().toISOString();
            
            await addDocument(COLLECTIONS.INVESTMENTS, investment);
            return investment;
        } catch (error) {
            console.error('Erro ao adicionar investimento:', error);
            return null;
        }
    }

    /**
     * Atualizar investimento
     */
    async updateInvestment(id, updates) {
        try {
            await updateDocument(COLLECTIONS.INVESTMENTS, id, updates);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar investimento:', error);
            return false;
        }
    }

    /**
     * Deletar investimento
     */
    async deleteInvestment(id) {
        try {
            await deleteDocument(COLLECTIONS.INVESTMENTS, id);
            return true;
        } catch (error) {
            console.error('Erro ao deletar investimento:', error);
            return false;
        }
    }

    /**
     * Obter todos os investimentos
     */
    async getInvestments() {
        try {
            return await getCollection(COLLECTIONS.INVESTMENTS);
        } catch (error) {
            console.error('Erro ao obter investimentos:', error);
            return [];
        }
    }

    // ===== CONFIGURAÇÕES =====

    /**
     * Obter configurações
     */
    async getSettings() {
        try {
            return await getDocument(COLLECTIONS.SETTINGS, 'default');
        } catch (error) {
            console.error('Erro ao obter configurações:', error);
            return null;
        }
    }

    /**
     * Atualizar configurações
     */
    async updateSettings(updates) {
        try {
            await saveDocument(COLLECTIONS.SETTINGS, 'default', updates);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar configurações:', error);
            return false;
        }
    }

    // ===== NOTIFICAÇÕES =====

    /**
     * Adicionar notificação
     */
    async addNotification(notification) {
        try {
            notification.id = this.generateId();
            notification.createdAt = new Date().toISOString();
            
            await addDocument(COLLECTIONS.NOTIFICATIONS, notification);
            return notification;
        } catch (error) {
            console.error('Erro ao adicionar notificação:', error);
            return null;
        }
    }

    /**
     * Obter notificações
     */
    async getNotifications() {
        try {
            return await getCollection(COLLECTIONS.NOTIFICATIONS);
        } catch (error) {
            console.error('Erro ao obter notificações:', error);
            return [];
        }
    }

    /**
     * Deletar notificação
     */
    async deleteNotification(id) {
        try {
            await deleteDocument(COLLECTIONS.NOTIFICATIONS, id);
            return true;
        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
            return false;
        }
    }

    // ===== LEMBRETES =====

    /**
     * Adicionar lembrete
     */
    async addReminder(reminder) {
        try {
            reminder.id = this.generateId();
            reminder.createdAt = new Date().toISOString();
            
            await addDocument(COLLECTIONS.REMINDERS, reminder);
            return reminder;
        } catch (error) {
            console.error('Erro ao adicionar lembrete:', error);
            return null;
        }
    }

    /**
     * Obter lembretes
     */
    async getReminders() {
        try {
            return await getCollection(COLLECTIONS.REMINDERS);
        } catch (error) {
            console.error('Erro ao obter lembretes:', error);
            return [];
        }
    }

    /**
     * Deletar lembrete
     */
    async deleteReminder(id) {
        try {
            await deleteDocument(COLLECTIONS.REMINDERS, id);
            return true;
        } catch (error) {
            console.error('Erro ao deletar lembrete:', error);
            return false;
        }
    }

    // ===== EXPORTAR/IMPORTAR =====

    /**
     * Exportar todos os dados
     */
    async exportData() {
        try {
            const data = {
                transactions: await getCollection(COLLECTIONS.TRANSACTIONS),
                cards: await getCollection(COLLECTIONS.CARDS),
                goals: await getCollection(COLLECTIONS.GOALS),
                investments: await getCollection(COLLECTIONS.INVESTMENTS),
                settings: await getDocument(COLLECTIONS.SETTINGS, 'default'),
                notifications: await getCollection(COLLECTIONS.NOTIFICATIONS),
                reminders: await getCollection(COLLECTIONS.REMINDERS)
            };
            return data;
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            return null;
        }
    }
}

// Criar instância global do gerenciador de dados
const dataManager = new FirebaseDataManager();

