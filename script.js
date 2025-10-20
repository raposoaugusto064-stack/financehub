/**
 * SCRIPT.JS - Lógica Principal da Aplicação
 * Responsável por toda a interação do usuário e integração dos módulos
 */

// ===== ESTADO GLOBAL DA APLICAÇÃO =====
const appState = {
    currentPage: 'dashboard',
    isLoggedIn: false,
    currentUser: null,
    filters: {
        month: 'all',
        year: 'all',
        category: 'all'
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Inicializar ícones Lucide
    lucide.createIcons();
    
    // Verificar tema salvo
    applyTheme();
    
    // Verificar se há usuário logado
    checkLoginStatus();
    
    // Inicializar event listeners
    initializeEventListeners();
    
    // Verificar lembretes e notificações
    checkReminders();
}

// ===== AUTENTICAÇÃO =====
function checkLoginStatus() {
    const user = dataManager.getUser();
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    
    // Para desenvolvimento, permitir acesso direto
    if (!user || !user.password) {
        loginScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
    } else {
        // Se já tem senha configurada, mostrar tela de login
        loginScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

function login(password) {
    if (dataManager.verifyPassword(password)) {
        appState.isLoggedIn = true;
        appState.currentUser = dataManager.getUser();
        
        // Inicializar sincronização com Firebase
        const userId = window.firebaseSync.constructor.generateUserId(password);
        window.firebaseSync.initialize(userId).then(success => {
            if (success) {
                console.log('Sincronização com Firebase ativada');
            }
        });
        
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        
        // Atualizar nome do usuário
        const userName = appState.currentUser?.name || 'Usuário';
        document.getElementById('userName').textContent = userName;
        
        // Carregar dashboard
        loadDashboard();
        
        return true;
    }
    return false;
}

function loginAsGuest() {
    appState.isLoggedIn = true;
    appState.currentUser = { name: 'Visitante', isGuest: true };
    
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    
    document.getElementById('userName').textContent = 'Visitante';
    
    loadDashboard();
}

function logout() {
    appState.isLoggedIn = false;
    appState.currentUser = null;
    
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    
    // Limpar senha do input
    document.getElementById('loginPassword').value = '';
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', () => {
        const password = document.getElementById('loginPassword').value;
        if (password) {
            if (login(password)) {
                document.getElementById('loginPassword').value = '';
            } else {
                alert('Senha incorreta!');
            }
        } else {
            alert('Por favor, digite uma senha.');
        }
    });
    
    document.getElementById('guestBtn').addEventListener('click', loginAsGuest);
    
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Toggle sidebar (mobile)
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Toggle tema
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Notificações
    document.getElementById('notificationBtn').addEventListener('click', toggleNotifications);
    document.getElementById('clearNotifications').addEventListener('click', clearNotifications);
    
    // Modais - fechar
    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-modal')) {
                const modalId = e.target.getAttribute('data-modal');
                closeModal(modalId);
            } else {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            }
        });
    });
    
    // Fechar modal ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Transações
    document.getElementById('addTransactionBtn').addEventListener('click', () => openTransactionModal());
    document.getElementById('transactionForm').addEventListener('submit', saveTransaction);
    
    // Filtros de transação
    document.getElementById('searchTransaction').addEventListener('input', filterTransactions);
    document.getElementById('filterTransactionType').addEventListener('change', filterTransactions);
    document.getElementById('filterTransactionCategory').addEventListener('change', filterTransactions);
    
    // Cartões
    document.getElementById('addCardBtn').addEventListener('click', () => openCardModal());
    document.getElementById('cardForm').addEventListener('submit', saveCard);
    
    // Metas
    document.getElementById('addGoalBtn').addEventListener('click', () => openGoalModal());
    document.getElementById('goalForm').addEventListener('submit', saveGoal);
    
    // Tabs de metas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Tipo de meta (mostrar/ocultar categoria)
    document.querySelectorAll('input[name="goalType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const categoryGroup = document.getElementById('goalCategoryGroup');
            if (e.target.value === 'budget') {
                categoryGroup.style.display = 'block';
            } else {
                categoryGroup.style.display = 'none';
            }
        });
    });
    
    // Investimentos
    document.getElementById('addInvestmentBtn').addEventListener('click', () => openInvestmentModal());
    document.getElementById('investmentForm').addEventListener('submit', saveInvestment);
    
    // Relatórios
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    document.getElementById('reportPeriod').addEventListener('change', updateReports);
    
    // Estatísticas
    document.getElementById('viewAnnualBtn').addEventListener('click', toggleAnnualView);
    
    // Configurações
    document.getElementById('settingCurrency').addEventListener('change', updateCurrency);
    document.getElementById('settingLanguage').addEventListener('change', updateLanguage);
    document.getElementById('settingTheme').addEventListener('change', updateThemeSetting);
    document.getElementById('updatePasswordBtn').addEventListener('click', updatePassword);
    document.getElementById('backupDataBtn').addEventListener('click', backupData);
    document.getElementById('restoreDataBtn').addEventListener('click', restoreData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    
    // Ferramentas
    document.getElementById('currencyConverterBtn').addEventListener('click', () => openModal('currencyConverterModal'));
    document.getElementById('interestCalculatorBtn').addEventListener('click', () => openModal('interestCalculatorModal'));
    document.getElementById('installmentSimulatorBtn').addEventListener('click', () => openModal('installmentSimulatorModal'));
    
    document.getElementById('convertBtn').addEventListener('click', convertCurrency);
    document.getElementById('calculateInterestBtn').addEventListener('click', calculateInterest);
    document.getElementById('simulateInstallmentBtn').addEventListener('click', simulateInstallment);
    
    // Filtros do dashboard
    document.getElementById('filterMonth').addEventListener('change', applyDashboardFilters);
    document.getElementById('filterYear').addEventListener('change', applyDashboardFilters);
    document.getElementById('filterCategory').addEventListener('change', applyDashboardFilters);
}

// ===== NAVEGAÇÃO =====
function navigateToPage(page) {
    // Atualizar estado
    appState.currentPage = page;
    
    // Atualizar navegação ativa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });
    
    // Atualizar páginas
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`${page}Page`).classList.add('active');
    
    // Atualizar título
    const titles = {
        dashboard: 'Dashboard',
        transactions: 'Transações',
        cards: 'Cartões',
        goals: 'Metas e Orçamentos',
        investments: 'Investimentos',
        reports: 'Relatórios',
        statistics: 'Estatísticas',
        settings: 'Configurações'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    
    // Carregar conteúdo da página
    loadPageContent(page);
    
    // Fechar sidebar no mobile
    if (window.innerWidth <= 1024) {
        document.querySelector('.sidebar').classList.remove('active');
    }
}

function loadPageContent(page) {
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'cards':
            loadCards();
            break;
        case 'goals':
            loadGoals();
            break;
        case 'investments':
            loadInvestments();
            break;
        case 'reports':
            loadReports();
            break;
        case 'statistics':
            loadStatistics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ===== DASHBOARD =====
function loadDashboard() {
    // Atualizar filtros
    populateFilterOptions();
    
    // Aplicar filtros
    const filters = getDashboardFilters();
    
    // Carregar resumo financeiro
    const summary = dataManager.getFinancialSummary(filters);
    document.getElementById('totalBalance').textContent = dataManager.formatCurrency(summary.balance);
    document.getElementById('totalIncome').textContent = dataManager.formatCurrency(summary.income);
    document.getElementById('totalExpense').textContent = dataManager.formatCurrency(summary.expense);
    document.getElementById('totalSavings').textContent = dataManager.formatCurrency(summary.savings);
    
    // Carregar gráficos
    const categoryExpenses = dataManager.getExpensesByCategory(filters);
    chartManager.createCategoryChart('categoryChart', categoryExpenses);
    
    const monthlyData = dataManager.getMonthlyEvolution();
    chartManager.createMonthlyChart('monthlyChart', monthlyData);
    
    // Carregar transações recentes
    loadRecentTransactions();
    
    // Carregar próximos vencimentos
    loadUpcomingBills();
}

function populateFilterOptions() {
    // Meses
    const monthSelect = document.getElementById('filterMonth');
    if (monthSelect.options.length === 1) {
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        monthNames.forEach((name, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = name;
            monthSelect.appendChild(option);
        });
    }
    
    // Anos
    const yearSelect = document.getElementById('filterYear');
    if (yearSelect.options.length === 1) {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= currentYear - 5; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }
    
    // Categorias
    const categorySelects = [
        document.getElementById('filterCategory'),
        document.getElementById('filterTransactionCategory')
    ];
    
    categorySelects.forEach(select => {
        if (select && select.options.length === 1) {
            const allCategories = [
                ...dataManager.getCategories('income'),
                ...dataManager.getCategories('expense')
            ];
            const uniqueCategories = [...new Set(allCategories)];
            
            uniqueCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
        }
    });
}

function getDashboardFilters() {
    const filters = {};
    
    const month = document.getElementById('filterMonth').value;
    const year = document.getElementById('filterYear').value;
    const category = document.getElementById('filterCategory').value;
    
    if (month !== 'all') {
        const selectedYear = year !== 'all' ? parseInt(year) : new Date().getFullYear();
        filters.startDate = new Date(selectedYear, parseInt(month) - 1, 1).toISOString();
        filters.endDate = new Date(selectedYear, parseInt(month), 0).toISOString();
    } else if (year !== 'all') {
        filters.startDate = new Date(parseInt(year), 0, 1).toISOString();
        filters.endDate = new Date(parseInt(year), 11, 31).toISOString();
    }
    
    if (category !== 'all') {
        filters.category = category;
    }
    
    return filters;
}

function applyDashboardFilters() {
    loadDashboard();
}

function loadRecentTransactions() {
    const transactions = dataManager.getTransactions();
    const recent = transactions.slice(0, 5);
    const container = document.getElementById('recentTransactions');
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-tertiary);">Nenhuma transação encontrada</p>';
        return;
    }
    
    container.innerHTML = recent.map(t => `
        <div class="recent-item">
            <div class="recent-item-left">
                <div class="recent-item-icon ${t.type}-icon">
                    ${t.type === 'income' ? '↑' : '↓'}
                </div>
                <div class="recent-item-info">
                    <div class="recent-item-title">${t.description}</div>
                    <div class="recent-item-subtitle">${t.category} • ${formatDate(t.date)}</div>
                </div>
            </div>
            <div class="recent-item-amount ${t.type}-amount">
                ${t.type === 'income' ? '+' : '-'} ${dataManager.formatCurrency(t.amount)}
            </div>
        </div>
    `).join('');
}

function loadUpcomingBills() {
    const reminders = dataManager.getReminders();
    const today = new Date();
    const upcoming = reminders
        .filter(r => new Date(r.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    const container = document.getElementById('upcomingBills');
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-tertiary);">Nenhum vencimento próximo</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(r => {
        const daysUntil = Math.ceil((new Date(r.date) - today) / (1000 * 60 * 60 * 24));
        return `
            <div class="recent-item">
                <div class="recent-item-left">
                    <div class="recent-item-icon expense-icon">
                        📅
                    </div>
                    <div class="recent-item-info">
                        <div class="recent-item-title">${r.description}</div>
                        <div class="recent-item-subtitle">Vence em ${daysUntil} dia${daysUntil !== 1 ? 's' : ''}</div>
                    </div>
                </div>
                <div class="recent-item-amount expense-amount">
                    ${dataManager.formatCurrency(r.amount)}
                </div>
            </div>
        `;
    }).join('');
}

// ===== TRANSAÇÕES =====
function loadTransactions() {
    populateFilterOptions();
    populateCategorySelect('transactionCategory');
    filterTransactions();
}

function filterTransactions() {
    const search = document.getElementById('searchTransaction').value;
    const type = document.getElementById('filterTransactionType').value;
    const category = document.getElementById('filterTransactionCategory').value;
    
    const filters = {};
    if (search) filters.search = search;
    if (type !== 'all') filters.type = type;
    if (category !== 'all') filters.category = category;
    
    const transactions = dataManager.getTransactions(filters);
    displayTransactions(transactions);
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 40px; color: var(--text-tertiary);">Nenhuma transação encontrada</p>';
        return;
    }
    
    container.innerHTML = transactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-item-left">
                <div class="transaction-item-icon ${t.type}-icon">
                    ${t.type === 'income' ? '↑' : '↓'}
                </div>
                <div class="transaction-item-info">
                    <div class="transaction-item-title">${t.description}</div>
                    <div class="transaction-item-subtitle">
                        ${t.category} • ${formatDate(t.date)} • ${getPaymentMethodName(t.paymentMethod)}
                        ${t.tags ? ` • ${t.tags}` : ''}
                    </div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div class="transaction-item-amount ${t.type}-amount">
                    ${t.type === 'income' ? '+' : '-'} ${dataManager.formatCurrency(t.amount)}
                </div>
                <div class="transaction-item-actions">
                    <button class="btn-icon" onclick="editTransaction('${t.id}')" title="Editar">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteTransactionConfirm('${t.id}')" title="Excluir">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function openTransactionModal(transactionId = null) {
    const modal = document.getElementById('transactionModal');
    const form = document.getElementById('transactionForm');
    const title = document.getElementById('transactionModalTitle');
    
    form.reset();
    
    if (transactionId) {
        const transaction = dataManager.getTransactionById(transactionId);
        if (transaction) {
            title.textContent = 'Editar Transação';
            document.getElementById('transactionId').value = transaction.id;
            document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
            document.getElementById('transactionDescription').value = transaction.description;
            document.getElementById('transactionCategory').value = transaction.category;
            document.getElementById('transactionAmount').value = transaction.amount;
            document.getElementById('transactionDate').value = transaction.date;
            document.getElementById('transactionPaymentMethod').value = transaction.paymentMethod;
            document.getElementById('transactionTags').value = transaction.tags || '';
            document.getElementById('transactionNotes').value = transaction.notes || '';
            document.getElementById("transactionRecurring").checked = transaction.recurring || false;
            if (transaction.paymentMethod === 'credit' && transaction.cardId) {
                document.getElementById('transactionCard').value = transaction.cardId;
                document.getElementById('cardSelectGroup').style.display = 'block';
            } else {
                document.getElementById('cardSelectGroup').style.display = 'none';
            }
        }
    } else {
        title.textContent = "Nova Transação";
        document.getElementById("transactionDate").value = new Date().toISOString().split("T")[0];
        document.getElementById('cardSelectGroup').style.display = 'none';
    }
    
    populateCardSelect("transactionCard");
    populateCategorySelect("transactionCategory");
    openModal("transactionModal");
}

function saveTransaction(e) {
    e.preventDefault();
    
    const id = document.getElementById('transactionId').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const description = document.getElementById('transactionDescription').value;
    const category = document.getElementById('transactionCategory').value;
    const amount = document.getElementById('transactionAmount').value;
    const date = document.getElementById('transactionDate').value;
    const paymentMethod = document.getElementById('transactionPaymentMethod').value;
    const tags = document.getElementById('transactionTags').value;
    const notes = document.getElementById('transactionNotes').value;
    const recurring = document.getElementById('transactionRecurring').checked;
    
    const transaction = {
        type,
        description,
        category,
        amount: parseFloat(amount),
        date,
        paymentMethod,
        tags,
        notes,
        recurring
    };

    // Adicionar cardId se o método de pagamento for crédito
    if (paymentMethod === 'credit') {
        transaction.cardId = document.getElementById('transactionCard').value;
        if (!transaction.cardId) {
            showNotification('Selecione um cartão de crédito para a transação.', 'error');
            return;
        }
    }
    
    if (id) {
        dataManager.updateTransaction(id, transaction);
    } else {
        dataManager.addTransaction(transaction);
        
        // Se for recorrente, criar lembrete
        if (recurring) {
            const reminderDate = new Date(date);
            reminderDate.setMonth(reminderDate.getMonth() + 1);
            
            dataManager.addReminder({
                description: `Pagamento recorrente: ${description}`,
                amount: parseFloat(amount),
                date: reminderDate.toISOString().split('T')[0],
                type: 'recurring'
            });
        }
    }
    
    closeModal('transactionModal');
    
    if (appState.currentPage === 'transactions') {
        loadTransactions();
    } else {
        loadDashboard();
    }
    
    showNotification('Transação salva com sucesso!', 'success');
}

function editTransaction(id) {
    openTransactionModal(id);
}

function deleteTransactionConfirm(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        dataManager.deleteTransaction(id);
        if (appState.currentPage === 'transactions') {
            loadTransactions();
        } else {
            loadDashboard();
        }
        showNotification('Transação excluída com sucesso!', 'success');
    }
}

function populateCategorySelect(selectId) {
    const select = document.getElementById(selectId);
    const type = document.querySelector('input[name="type"]:checked')?.value || 'expense';
    
    // Limpar opções existentes (exceto a primeira)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    const categories = dataManager.getCategories(type);
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function populateCardSelect(selectId) {
    const select = document.getElementById(selectId);
    const cards = dataManager.getCards();

    // Limpar opções existentes (exceto a primeira)
    while (select.options.length > 1) {
        select.remove(1);
    }

    cards.forEach(card => {
        const option = document.createElement('option');
        option.value = card.id;
        option.textContent = `${card.name} (${card.brand})`;
        select.appendChild(option);
    });
}

function toggleCardSelect() {
    const paymentMethod = document.getElementById('transactionPaymentMethod').value;
    const cardSelectGroup = document.getElementById('cardSelectGroup');
    if (paymentMethod === 'credit') {
        cardSelectGroup.style.display = 'block';
        populateCardSelect('transactionCard');
    } else {
        cardSelectGroup.style.display = 'none';
    }
}

// Atualizar categorias quando o tipo mudar
document.addEventListener('change', (e) => {
    if (e.target.name === 'type') {
        populateCategorySelect('transactionCategory');
    }
});

// Continua no próximo bloco...



// ===== CARTÕES =====
function loadCards() {
    const cards = dataManager.getCards();
    const container = document.getElementById('cardsList');
    
    if (cards.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 40px; color: var(--text-tertiary);">Nenhum cartão cadastrado</p>';
        return;
    }
    
    container.innerHTML = cards.map(card => {
        const limitUsed = parseFloat(card.limitUsed) || 0;
        const availableLimit = parseFloat(card.availableLimit) || parseFloat(card.limit);
        const percentage = (limitUsed / parseFloat(card.limit)) * 100;
        
        return `
            <div class="card-item" style="background: ${card.color};">
                <div class="card-header">
                    <div class="card-brand">${card.brand.toUpperCase()}</div>
                    <i data-lucide="credit-card"></i>
                </div>
                <div class="card-name">${card.name}</div>
                    <div class="card-limit">Limite: ${dataManager.formatCurrency(card.limit)}</div>
                    <div class="card-used">Usado: ${dataManager.formatCurrency(limitUsed)}</div>
                    <div class="card-available">Disponível: ${dataManager.formatCurrency(availableLimit)}</div>
                <div class="card-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="card-footer">
                    <div>Fecha: dia ${card.closingDay}</div>
                    <div>Vence: dia ${card.dueDay}</div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="editCard('${card.id}')">
                        <i data-lucide="edit-2"></i> Editar
                    </button>
                    <button class="btn-icon" onclick="deleteCardConfirm('${card.id}')">
                        <i data-lucide="trash-2"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

function openCardModal(cardId = null) {
    const modal = document.getElementById('cardModal');
    const form = document.getElementById('cardForm');
    const title = document.getElementById('cardModalTitle');
    
    form.reset();
    
    if (cardId) {
        const card = dataManager.getCardById(cardId);
        if (card) {
            title.textContent = 'Editar Cartão';
            document.getElementById('cardId').value = card.id;
            document.getElementById('cardName').value = card.name;
            document.getElementById('cardLimit').value = card.limit;
            document.getElementById('cardClosingDay').value = card.closingDay;
            document.getElementById('cardDueDay').value = card.dueDay;
            document.getElementById('cardBrand').value = card.brand;
            document.getElementById('cardColor').value = card.color;
        }
    } else {
        title.textContent = 'Novo Cartão';
        document.getElementById('cardColor').value = '#6366f1';
    }
    
    openModal('cardModal');
}

function saveCard(e) {
    e.preventDefault();
    
    const id = document.getElementById('cardId').value;
    const name = document.getElementById('cardName').value;
    const limit = parseFloat(document.getElementById('cardLimit').value);
    const closingDay = parseInt(document.getElementById('cardClosingDay').value);
    const dueDay = parseInt(document.getElementById('cardDueDay').value);
    const brand = document.getElementById('cardBrand').value;
    const color = document.getElementById('cardColor').value;
    
    const card = { name, limit, closingDay, dueDay, brand, color };
    
    if (id) {
        dataManager.updateCard(id, card);
    } else {
        dataManager.addCard(card);
    }
    
    closeModal('cardModal');
    loadCards();
    showNotification('Cartão salvo com sucesso!', 'success');
}

function editCard(id) {
    openCardModal(id);
}

function deleteCardConfirm(id) {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
        dataManager.deleteCard(id);
        loadCards();
        showNotification('Cartão excluído com sucesso!', 'success');
    }
}

// ===== METAS E ORÇAMENTOS =====
function loadGoals() {
    populateCategorySelect('goalCategory');
    loadGoalsList();
    loadBudgetsList();
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'goals') {
        document.getElementById('goalsTab').classList.add('active');
    } else if (tab === 'budgets') {
        document.getElementById('budgetsTab').classList.add('active');
    }
}

function loadGoalsList() {
    const goals = dataManager.getGoals('savings');
    const container = document.getElementById('goalsList');
    
    if (goals.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 40px; color: var(--text-tertiary);">Nenhuma meta cadastrada</p>';
        return;
    }
    
    container.innerHTML = goals.map(goal => {
        const progress = (goal.current / goal.target) * 100;
        const remaining = goal.target - goal.current;
        const daysRemaining = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        
        return `
            <div class="goal-item">
                <div class="goal-header">
                    <div class="goal-name">${goal.name}</div>
                    <div class="goal-amount">${dataManager.formatCurrency(goal.current)} / ${dataManager.formatCurrency(goal.target)}</div>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
                <div class="goal-info">
                    <span>Faltam ${dataManager.formatCurrency(remaining)}</span>
                    ${daysRemaining !== null ? `<span>${daysRemaining} dias restantes</span>` : '<span>Sem prazo definido</span>'}
                </div>
                <div class="goal-actions">
                    <button class="btn-secondary" onclick="updateGoalProgress('${goal.id}')">
                        <i data-lucide="plus"></i> Adicionar Progresso
                    </button>
                    <button class="btn-icon" onclick="editGoal('${goal.id}')">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteGoalConfirm('${goal.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

function loadBudgetsList() {
    const budgets = dataManager.getGoals('budget');
    const container = document.getElementById('budgetsList');
    
    if (budgets.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 40px; color: var(--text-tertiary);">Nenhum orçamento cadastrado</p>';
        return;
    }
    
    container.innerHTML = budgets.map(budget => {
        // Calcular gastos da categoria no mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const spent = dataManager.getTransactions({
            type: 'expense',
            category: budget.category,
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString()
        }).reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const progress = (spent / budget.target) * 100;
        const remaining = budget.target - spent;
        const status = progress > 100 ? 'danger' : progress > 80 ? 'warning' : 'success';
        
        return `
            <div class="budget-item goal-item">
                <div class="goal-header">
                    <div class="goal-name">${budget.category}</div>
                    <div class="goal-amount">${dataManager.formatCurrency(spent)} / ${dataManager.formatCurrency(budget.target)}</div>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${Math.min(progress, 100)}%; background: var(--${status}-color);"></div>
                    </div>
                </div>
                <div class="goal-info">
                    <span class="text-${status}">${remaining >= 0 ? 'Disponível' : 'Excedido'}: ${dataManager.formatCurrency(Math.abs(remaining))}</span>
                    <span>${progress.toFixed(1)}% utilizado</span>
                </div>
                <div class="goal-actions">
                    <button class="btn-icon" onclick="editGoal('${budget.id}')">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteGoalConfirm('${budget.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

function openGoalModal(goalId = null) {
    const modal = document.getElementById('goalModal');
    const form = document.getElementById('goalForm');
    const title = document.getElementById('goalModalTitle');
    
    form.reset();
    
    if (goalId) {
        const goal = dataManager.getGoalById(goalId);
        if (goal) {
            title.textContent = goal.type === 'savings' ? 'Editar Meta' : 'Editar Orçamento';
            document.getElementById('goalId').value = goal.id;
            document.querySelector(`input[name="goalType"][value="${goal.type}"]`).checked = true;
            document.getElementById('goalName').value = goal.name;
            document.getElementById('goalTarget').value = goal.target;
            document.getElementById('goalCurrent').value = goal.current;
            document.getElementById('goalDeadline').value = goal.deadline || '';
            
            if (goal.type === 'budget') {
                document.getElementById('goalCategoryGroup').style.display = 'block';
                document.getElementById('goalCategory').value = goal.category;
            }
        }
    } else {
        title.textContent = 'Nova Meta';
    }
    
    openModal('goalModal');
}

function saveGoal(e) {
    e.preventDefault();
    
    const id = document.getElementById('goalId').value;
    const type = document.querySelector('input[name="goalType"]:checked').value;
    const name = document.getElementById('goalName').value;
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value);
    const deadline = document.getElementById('goalDeadline').value;
    
    const goal = { type, name, target, current, deadline };
    
    if (type === 'budget') {
        goal.category = document.getElementById('goalCategory').value;
    }
    
    if (id) {
        dataManager.updateGoal(id, goal);
    } else {
        dataManager.addGoal(goal);
    }
    
    closeModal('goalModal');
    loadGoals();
    showNotification(type === 'savings' ? 'Meta salva com sucesso!' : 'Orçamento salvo com sucesso!', 'success');
}

function editGoal(id) {
    openGoalModal(id);
}

function deleteGoalConfirm(id) {
    if (confirm('Tem certeza que deseja excluir?')) {
        dataManager.deleteGoal(id);
        loadGoals();
        showNotification('Excluído com sucesso!', 'success');
    }
}

function updateGoalProgress(id) {
    const amount = prompt('Digite o valor a adicionar ao progresso:');
    if (amount && !isNaN(amount)) {
        const goal = dataManager.getGoalById(id);
        if (goal) {
            const newCurrent = goal.current + parseFloat(amount);
            dataManager.updateGoal(id, { current: newCurrent });
            loadGoals();
            showNotification('Progresso atualizado!', 'success');
        }
    }
}

// ===== INVESTIMENTOS =====
function loadInvestments() {
    const investments = dataManager.getInvestments();
    
    // Calcular totais
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.initialAmount), 0);
    const currentValue = investments.reduce((sum, inv) => sum + parseFloat(inv.currentAmount), 0);
    const returnAmount = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (returnAmount / totalInvested) * 100 : 0;
    
    document.getElementById('totalInvested').textContent = dataManager.formatCurrency(totalInvested);
    document.getElementById('currentInvestmentValue').textContent = dataManager.formatCurrency(currentValue);
    document.getElementById('investmentReturn').textContent = `${returnPercentage >= 0 ? '+' : ''}${returnPercentage.toFixed(2)}%`;
    document.getElementById('investmentReturn').className = `card-value ${returnPercentage >= 0 ? 'text-success' : 'text-danger'}`;
    
    // Gráfico
    if (investments.length > 0) {
        chartManager.createInvestmentChart('investmentChart', investments);
    }
    
    // Lista
    const container = document.getElementById('investmentsList');
    
    if (investments.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 40px; color: var(--text-tertiary);">Nenhum investimento cadastrado</p>';
        return;
    }
    
    container.innerHTML = investments.map(inv => {
        const returnAmount = inv.currentAmount - inv.initialAmount;
        const returnPercentage = (returnAmount / inv.initialAmount) * 100;
        const isPositive = returnAmount >= 0;
        
        return `
            <div class="investment-item">
                <div class="investment-info">
                    <h4>${inv.name}</h4>
                    <p>${inv.type} • ${formatDate(inv.date)}</p>
                </div>
                <div class="investment-values">
                    <div class="investment-current">${dataManager.formatCurrency(inv.currentAmount)}</div>
                    <div class="investment-return ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '+' : ''}${returnPercentage.toFixed(2)}%
                    </div>
                </div>
                <div class="transaction-item-actions">
                    <button class="btn-icon" onclick="editInvestment('${inv.id}')">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteInvestmentConfirm('${inv.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

function openInvestmentModal(investmentId = null) {
    const modal = document.getElementById('investmentModal');
    const form = document.getElementById('investmentForm');
    const title = document.getElementById('investmentModalTitle');
    
    form.reset();
    
    if (investmentId) {
        const investment = dataManager.getInvestmentById(investmentId);
        if (investment) {
            title.textContent = 'Editar Investimento';
            document.getElementById('investmentId').value = investment.id;
            document.getElementById('investmentName').value = investment.name;
            document.getElementById('investmentType').value = investment.type;
            document.getElementById('investmentInitialAmount').value = investment.initialAmount;
            document.getElementById('investmentCurrentAmount').value = investment.currentAmount;
            document.getElementById('investmentDate').value = investment.date;
        }
    } else {
        title.textContent = 'Novo Investimento';
        document.getElementById('investmentDate').value = new Date().toISOString().split('T')[0];
    }
    
    openModal('investmentModal');
}

function saveInvestment(e) {
    e.preventDefault();
    
    const id = document.getElementById('investmentId').value;
    const name = document.getElementById('investmentName').value;
    const type = document.getElementById('investmentType').value;
    const initialAmount = parseFloat(document.getElementById('investmentInitialAmount').value);
    const currentAmount = parseFloat(document.getElementById('investmentCurrentAmount').value);
    const date = document.getElementById('investmentDate').value;
    
    const investment = { name, type, initialAmount, currentAmount, date };
    
    if (id) {
        dataManager.updateInvestment(id, investment);
    } else {
        dataManager.addInvestment(investment);
    }
    
    closeModal('investmentModal');
    loadInvestments();
    showNotification('Investimento salvo com sucesso!', 'success');
}

function editInvestment(id) {
    openInvestmentModal(id);
}

function deleteInvestmentConfirm(id) {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
        dataManager.deleteInvestment(id);
        loadInvestments();
        showNotification('Investimento excluído com sucesso!', 'success');
    }
}

// Continua no próximo bloco...



// ===== RELATÓRIOS =====
function loadReports() {
    updateReports();
}

function updateReports() {
    const period = document.getElementById('reportPeriod').value;
    let filters = {};
    
    const now = new Date();
    
    switch (period) {
        case 'month':
            filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            filters.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
            break;
        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            filters.startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString();
            filters.endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString();
            break;
        case 'year':
            filters.startDate = new Date(now.getFullYear(), 0, 1).toISOString();
            filters.endDate = new Date(now.getFullYear(), 11, 31).toISOString();
            break;
        case 'custom':
            const startDate = document.getElementById('reportStartDate').value;
            const endDate = document.getElementById('reportEndDate').value;
            if (startDate && endDate) {
                filters.startDate = new Date(startDate).toISOString();
                filters.endDate = new Date(endDate).toISOString();
            }
            document.getElementById('reportStartDate').classList.remove('hidden');
            document.getElementById('reportEndDate').classList.remove('hidden');
            break;
    }
    
    if (period !== 'custom') {
        document.getElementById('reportStartDate').classList.add('hidden');
        document.getElementById('reportEndDate').classList.add('hidden');
    }
    
    // Gráficos
    const summary = dataManager.getFinancialSummary(filters);
    chartManager.createIncomeExpenseChart('incomeExpenseChart', summary);
    
    const categoryExpenses = dataManager.getExpensesByCategory(filters);
    chartManager.createCategoryDistributionChart('categoryDistributionChart', categoryExpenses);
    
    const transactions = dataManager.getTransactions(filters);
    chartManager.createPaymentMethodChart('paymentMethodChart', transactions);
}

function exportToPDF() {
    alert('Funcionalidade de exportação para PDF será implementada em breve!\n\nPor enquanto, você pode usar a função de impressão do navegador (Ctrl+P) e salvar como PDF.');
}

function exportToCSV() {
    const transactions = dataManager.getTransactions();
    
    if (transactions.length === 0) {
        alert('Não há transações para exportar.');
        return;
    }
    
    // Criar CSV
    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Método de Pagamento', 'Tags', 'Observações'];
    const rows = transactions.map(t => [
        t.date,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.description,
        t.category,
        t.amount,
        getPaymentMethodName(t.paymentMethod),
        t.tags || '',
        t.notes || ''
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financehub_transacoes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Relatório exportado com sucesso!', 'success');
}

// ===== ESTATÍSTICAS =====
function loadStatistics() {
    const stats = dataManager.getAdvancedStatistics();
    
    document.getElementById('avgMonthlyExpense').textContent = dataManager.formatCurrency(stats.avgMonthlyExpense);
    document.getElementById('maxExpense').textContent = dataManager.formatCurrency(stats.maxExpense);
    document.getElementById('topCategory').textContent = stats.topCategory;
    document.getElementById('savingsRate').textContent = `${stats.savingsRate.toFixed(1)}%`;
    
    // Gráficos
    chartManager.createTrendChart('trendChart');
    chartManager.createForecastChart('forecastChart');
}

function toggleAnnualView() {
    const annualView = document.getElementById('annualView');
    const btn = document.getElementById('viewAnnualBtn');
    
    if (annualView.classList.contains('hidden')) {
        annualView.classList.remove('hidden');
        btn.innerHTML = '<i data-lucide="x"></i> Fechar Visualização Anual';
        chartManager.createAnnualChart('annualChart');
    } else {
        annualView.classList.add('hidden');
        btn.innerHTML = '<i data-lucide="calendar"></i> Visualização Anual';
    }
    
    lucide.createIcons();
}

// ===== CONFIGURAÇÕES =====
function loadSettings() {
    const settings = dataManager.getSettings();
    
    document.getElementById('settingCurrency').value = settings.currency || 'EUR';
    document.getElementById('settingLanguage').value = settings.language || 'pt-BR';
    document.getElementById('settingTheme').value = settings.theme || 'auto';
}

function updateCurrency(e) {
    const currency = e.target.value;
    dataManager.updateSettings({ currency });
    
    // Recarregar página atual para atualizar valores
    loadPageContent(appState.currentPage);
    
    showNotification('Moeda atualizada!', 'success');
}

function updateLanguage(e) {
    const language = e.target.value;
    dataManager.updateSettings({ language });
    showNotification('Idioma atualizado! (Funcionalidade completa em breve)', 'info');
}

function updateThemeSetting(e) {
    const theme = e.target.value;
    dataManager.updateSettings({ theme });
    applyTheme();
    showNotification('Tema atualizado!', 'success');
}

function updatePassword() {
    const newPassword = document.getElementById('changePassword').value;
    
    if (!newPassword) {
        alert('Por favor, digite uma nova senha.');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('A senha deve ter pelo menos 4 caracteres.');
        return;
    }
    
    dataManager.updatePassword(newPassword);
    document.getElementById('changePassword').value = '';
    showNotification('Senha atualizada com sucesso!', 'success');
}

function backupData() {
    const data = dataManager.exportData();
    const json = JSON.stringify(data, null, 2);
    
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financehub_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Backup criado com sucesso!', 'success');
}

function restoreData() {
    const fileInput = document.getElementById('restoreDataFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, selecione um arquivo de backup.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('Tem certeza que deseja restaurar o backup? Todos os dados atuais serão substituídos.')) {
                dataManager.importData(data);
                showNotification('Backup restaurado com sucesso!', 'success');
                
                // Recarregar página
                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
        } catch (error) {
            alert('Erro ao ler arquivo de backup. Verifique se o arquivo é válido.');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('ATENÇÃO: Todos os seus dados serão perdidos permanentemente. Deseja continuar?')) {
        if (confirm('Tem CERTEZA ABSOLUTA? Esta ação não pode ser desfeita!')) {
            dataManager.clearAllData();
            showNotification('Todos os dados foram limpos.', 'info');
            
            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    }
}

// ===== FERRAMENTAS =====
function convertCurrency() {
    const amount = parseFloat(document.getElementById('converterAmount').value);
    const from = document.getElementById('converterFrom').value;
    const to = document.getElementById('converterTo').value;
    
    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, digite um valor válido.');
        return;
    }
    
    const result = dataManager.convertCurrency(amount, from, to);
    
    const symbols = { EUR: '€', USD: '$', BRL: 'R$', GBP: '£' };
    document.getElementById('converterResult').textContent = 
        `${symbols[from]} ${amount.toFixed(2)} = ${symbols[to]} ${result.toFixed(2)}`;
}

function calculateInterest() {
    const principal = parseFloat(document.getElementById('interestPrincipal').value);
    const rate = parseFloat(document.getElementById('interestRate').value);
    const time = parseInt(document.getElementById('interestTime').value);
    const monthly = parseFloat(document.getElementById('interestMonthly').value) || 0;
    
    if (isNaN(principal) || isNaN(rate) || isNaN(time)) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    const result = dataManager.calculateCompoundInterest(principal, rate, time, monthly);
    
    document.getElementById('interestResult').innerHTML = `
        <strong>Valor Final:</strong> ${dataManager.formatCurrency(result.finalAmount)}<br>
        <strong>Total Investido:</strong> ${dataManager.formatCurrency(result.totalContributed)}<br>
        <strong>Juros Ganhos:</strong> ${dataManager.formatCurrency(result.totalInterest)}
    `;
}

function simulateInstallment() {
    const amount = parseFloat(document.getElementById('installmentAmount').value);
    const number = parseInt(document.getElementById('installmentNumber').value);
    const interest = parseFloat(document.getElementById('installmentInterest').value);
    
    if (isNaN(amount) || isNaN(number) || isNaN(interest)) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    const result = dataManager.simulateInstallment(amount, number, interest);
    
    document.getElementById('installmentResult').innerHTML = `
        <strong>Valor da Parcela:</strong> ${dataManager.formatCurrency(result.installmentValue)}<br>
        <strong>Valor Total:</strong> ${dataManager.formatCurrency(result.totalAmount)}<br>
        <strong>Total de Juros:</strong> ${dataManager.formatCurrency(result.totalInterest)}
    `;
}

// ===== NOTIFICAÇÕES =====
function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('hidden');
    
    if (!dropdown.classList.contains('hidden')) {
        loadNotifications();
    }
}

function loadNotifications() {
    const notifications = dataManager.getNotifications();
    const container = document.getElementById('notificationList');
    const badge = document.querySelector('.notification-badge');
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="notification-empty">Nenhuma notificação</div>';
        return;
    }
    
    container.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markAsRead('${n.id}')">
            <h4>${n.title}</h4>
            <p>${n.message}</p>
        </div>
    `).join('');
}

function markAsRead(id) {
    dataManager.markNotificationAsRead(id);
    loadNotifications();
}

function clearNotifications() {
    if (confirm('Limpar todas as notificações?')) {
        dataManager.clearNotifications();
        loadNotifications();
    }
}

function showNotification(message, type = 'info') {
    const titles = {
        success: 'Sucesso',
        error: 'Erro',
        warning: 'Atenção',
        info: 'Informação'
    };
    
    dataManager.addNotification({
        title: titles[type] || 'Notificação',
        message,
        type
    });
    
    loadNotifications();
}

function checkReminders() {
    const reminders = dataManager.getReminders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.date);
        reminderDate.setHours(0, 0, 0, 0);
        
        const daysUntil = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));
        
        // Notificar se falta 3 dias ou menos
        if (daysUntil >= 0 && daysUntil <= 3) {
            const existingNotifications = dataManager.getNotifications();
            const alreadyNotified = existingNotifications.some(n => 
                n.message.includes(reminder.description) && 
                new Date(n.createdAt).toDateString() === today.toDateString()
            );
            
            if (!alreadyNotified) {
                showNotification(
                    `${reminder.description} - Vence em ${daysUntil} dia${daysUntil !== 1 ? 's' : ''}`,
                    'warning'
                );
            }
        }
    });
    
    // Verificar cartões próximos do limite
    const cards = dataManager.getCards();
    cards.forEach(card => {
        const currentAmount = dataManager.calculateCardAmount(card.id);
        const percentage = (currentAmount / card.limit) * 100;
        
        if (percentage >= 80) {
            const existingNotifications = dataManager.getNotifications();
            const alreadyNotified = existingNotifications.some(n => 
                n.message.includes(card.name) && 
                new Date(n.createdAt).toDateString() === today.toDateString()
            );
            
            if (!alreadyNotified) {
                showNotification(
                    `Cartão ${card.name} está com ${percentage.toFixed(0)}% do limite utilizado`,
                    'warning'
                );
            }
        }
    });
}

// ===== TEMA =====
function applyTheme() {
    const settings = dataManager.getSettings();
    let theme = settings.theme || 'auto';
    
    if (theme === 'auto') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.body.setAttribute('data-theme', theme);
    
    // Atualizar ícone do botão
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
    }
    
    // Atualizar gráficos
    setTimeout(() => {
        chartManager.updateAllCharts();
    }, 100);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    dataManager.updateSettings({ theme: newTheme });
    applyTheme();
}

// ===== MODAIS =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ===== UTILITÁRIOS =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getPaymentMethodName(method) {
    const names = {
        cash: 'Dinheiro',
        debit: 'Débito',
        credit: 'Crédito',
        pix: 'PIX',
        transfer: 'Transferência'
    };
    return names[method] || method;
}

// ===== VERIFICAÇÃO PERIÓDICA DE LEMBRETES =====
setInterval(checkReminders, 1000 * 60 * 60); // Verificar a cada hora

