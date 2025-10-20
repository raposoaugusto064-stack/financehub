/**
 * FIREBASE-CONFIG.JS - Configuração do Firebase e Firestore
 * Responsável pela inicialização do Firebase e gerenciamento de conexão
 */

// Importar Firebase SDK (será carregado via CDN no HTML)
// Credenciais de configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC-bX6-vUG485oKqsnS6FFersLqxKXSXcM",
    authDomain: "eduardofinancasnovo.firebaseapp.com",
    projectId: "eduardofinancasnovo",
    storageBucket: "eduardofinancasnovo.firebasestorage.app",
    messagingSenderId: "963248768085",
    appId: "1:963248768085:web:3b434be645d8f490fa80dc",
    measurementId: "G-BFKK89TNTW"
};

// Inicializar Firebase
let db = null;
let firebaseReady = false;

function initializeFirebase() {
    try {
        // Inicializar Firebase App
        firebase.initializeApp(firebaseConfig);
        
        // Obter referência do Firestore
        db = firebase.firestore();
        
        // Configurar Firestore para modo offline
        db.enablePersistence().catch((err) => {
            if (err.code == 'failed-precondition') {
                console.log('Múltiplas abas abertas');
            } else if (err.code == 'unimplemented') {
                console.log('Navegador não suporta persistência offline');
            }
        });
        
        firebaseReady = true;
        console.log('Firebase inicializado com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
        return false;
    }
}

/**
 * Aguardar Firebase estar pronto
 */
async function waitForFirebase() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (firebaseReady && db) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
        
        // Timeout de 10 segundos
        setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
        }, 10000);
    });
}

/**
 * Coleções do Firestore
 */
const COLLECTIONS = {
    TRANSACTIONS: 'transactions',
    CARDS: 'cards',
    GOALS: 'goals',
    INVESTMENTS: 'investments',
    SETTINGS: 'settings',
    NOTIFICATIONS: 'notifications',
    REMINDERS: 'reminders'
};

/**
 * Salvar documento no Firestore
 */
async function saveDocument(collection, docId, data) {
    try {
        await db.collection(collection).doc(docId).set(data, { merge: true });
        return true;
    } catch (error) {
        console.error('Erro ao salvar documento:', error);
        return false;
    }
}

/**
 * Obter documento do Firestore
 */
async function getDocument(collection, docId) {
    try {
        const doc = await db.collection(collection).doc(docId).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error('Erro ao obter documento:', error);
        return null;
    }
}

/**
 * Obter todos os documentos de uma coleção
 */
async function getCollection(collection) {
    try {
        const snapshot = await db.collection(collection).get();
        const data = [];
        snapshot.forEach(doc => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return data;
    } catch (error) {
        console.error('Erro ao obter coleção:', error);
        return [];
    }
}

/**
 * Deletar documento do Firestore
 */
async function deleteDocument(collection, docId) {
    try {
        await db.collection(collection).doc(docId).delete();
        return true;
    } catch (error) {
        console.error('Erro ao deletar documento:', error);
        return false;
    }
}

/**
 * Ouvir mudanças em tempo real em uma coleção
 */
function listenToCollection(collection, callback) {
    try {
        return db.collection(collection).onSnapshot(snapshot => {
            const data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            callback(data);
        }, error => {
            console.error('Erro ao ouvir coleção:', error);
        });
    } catch (error) {
        console.error('Erro ao configurar listener:', error);
        return null;
    }
}

/**
 * Ouvir mudanças em tempo real em um documento específico
 */
function listenToDocument(collection, docId, callback) {
    try {
        return db.collection(collection).doc(docId).onSnapshot(doc => {
            if (doc.exists) {
                callback({ id: doc.id, ...doc.data() });
            }
        }, error => {
            console.error('Erro ao ouvir documento:', error);
        });
    } catch (error) {
        console.error('Erro ao configurar listener de documento:', error);
        return null;
    }
}

/**
 * Adicionar documento com ID automático
 */
async function addDocument(collection, data) {
    try {
        const docRef = await db.collection(collection).add({
            ...data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, ...data };
    } catch (error) {
        console.error('Erro ao adicionar documento:', error);
        return null;
    }
}

/**
 * Atualizar documento no Firestore
 */
async function updateDocument(collection, docId, data) {
    try {
        await db.collection(collection).doc(docId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Erro ao atualizar documento:', error);
        return false;
    }
}

/**
 * Executar transação no Firestore
 */
async function executeTransaction(callback) {
    try {
        const result = await db.runTransaction(async (transaction) => {
            return await callback(transaction);
        });
        return result;
    } catch (error) {
        console.error('Erro ao executar transação:', error);
        return null;
    }
}

