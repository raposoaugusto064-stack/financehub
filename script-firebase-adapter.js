/**
 * SCRIPT-FIREBASE-ADAPTER.JS
 * Adaptador para fazer o script.js funcionar com Firebase
 * Substitui chamadas ao dataManager original pelo novo dataManager com Firebase
 */

// Aguardar Firebase estar pronto antes de inicializar a aplicação
let firebaseInitialized = false;

async function initFirebaseAndApp() {
    await waitForFirebase();
    firebaseInitialized = true;
    
    // Inicializar a aplicação após Firebase estar pronto
    initializeApp();
}

// Sobrescrever a inicialização padrão
document.addEventListener('DOMContentLoaded', () => {
    initFirebaseAndApp();
});

// Adapter para compatibilidade com o código existente
// O dataManager agora é o FirebaseDataManager que foi criado em data-firebase.js

// Função para sincronizar dados em tempo real
function setupRealtimeSyncListeners() {
    // Listener para transações
    dataManager.onDataChange('transactions', (transactions) => {
        // Atualizar UI quando transações mudarem
        if (appState.currentPage === 'transactions') {
            loadTransactions();
        }
        if (appState.currentPage === 'dashboard') {
            loadDashboard();
        }
    });

    // Listener para cartões
    dataManager.onDataChange('cards', (cards) => {
        // Atualizar UI quando cartões mudarem
        if (appState.currentPage === 'cards') {
            loadCards();
        }
        if (appState.currentPage === 'dashboard') {
            loadDashboard();
        }
    });

    // Listener para metas
    dataManager.onDataChange('goals', (goals) => {
        // Atualizar UI quando metas mudarem
        if (appState.currentPage === 'goals') {
            loadGoals();
        }
        if (appState.currentPage === 'dashboard') {
            loadDashboard();
        }
    });

    // Listener para investimentos
    dataManager.onDataChange('investments', (investments) => {
        // Atualizar UI quando investimentos mudarem
        if (appState.currentPage === 'investments') {
            loadInvestments();
        }
        if (appState.currentPage === 'dashboard') {
            loadDashboard();
        }
    });
}

// Função para inicializar a aplicação com Firebase
async function initializeAppWithFirebase() {
    // Aguardar Firebase estar pronto
    await waitForFirebase();
    
    // Inicializar ícones Lucide
    lucide.createIcons();
    
    // Verificar tema salvo
    applyTheme();
    
    // Como estamos usando compartilhado sem login, pular a tela de login
    appState.isLoggedIn = true;
    appState.currentUser = { name: 'Usuário', isGuest: true };
    
    // Mostrar app
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.getElementById('userName').textContent = 'Usuário';
    
    // Inicializar event listeners
    initializeEventListeners();
    
    // Configurar listeners de sincronização em tempo real
    setupRealtimeSyncListeners();
    
    // Carregar dashboard
    loadDashboard();
    
    // Verificar lembretes e notificações
    checkReminders();
}

// Sobrescrever checkLoginStatus para pular a autenticação
function checkLoginStatus() {
    // Como estamos usando compartilhado sem login, sempre permitir acesso
    appState.isLoggedIn = true;
    appState.currentUser = { name: 'Usuário', isGuest: true };
    
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.getElementById('userName').textContent = 'Usuário';
}

// Sobrescrever login para pular verificação de senha
function login(password) {
    appState.isLoggedIn = true;
    appState.currentUser = { name: 'Usuário', isGuest: true };
    
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.getElementById('userName').textContent = 'Usuário';
    
    loadDashboard();
    
    return true;
}

// Sobrescrever loginAsGuest
function loginAsGuest() {
    appState.isLoggedIn = true;
    appState.currentUser = { name: 'Usuário', isGuest: true };
    
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.getElementById('userName').textContent = 'Usuário';
    
    loadDashboard();
}

// Modificar initializeApp para usar Firebase
const originalInitializeApp = typeof initializeApp === 'function' ? initializeApp : null;

function initializeApp() {
    // Chamar a inicialização com Firebase
    initializeAppWithFirebase();
}

