/**
 * FIREBASE-SYNC.JS - Módulo de Sincronização com Firebase
 * Responsável por sincronizar dados entre o LocalStorage e o Firebase Realtime Database
 */

class FirebaseSync {
    constructor() {
        this.userId = null;
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.listeners = {};
        
        // Monitorar conexão de internet
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Inicializar sincronização com Firebase
     * @param {string} userId - ID único do usuário (pode ser gerado localmente)
     */
    async initialize(userId) {
        if (!window.firebaseDB || !window.firebaseDB.isConfigured) {
            console.warn('Firebase não configurado. Usando apenas LocalStorage.');
            return false;
        }

        this.userId = userId;
        
        try {
            // Sincronizar dados do Firebase para LocalStorage na primeira carga
            await this.syncFromFirebase();
            
            // Configurar listeners para mudanças em tempo real
            this.setupRealtimeListeners();
            
            console.log('Firebase Sync inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao inicializar Firebase Sync:', error);
            return false;
        }
    }

    /**
     * Sincronizar dados do Firebase para LocalStorage
     */
    async syncFromFirebase() {
        if (!this.userId || !window.firebaseDB) return;

        try {
            const snapshot = await window.firebaseDB.database
                .ref(`users/${this.userId}`)
                .once('value');
            
            const firebaseData = snapshot.val();
            
            if (firebaseData) {
                // Mesclar dados do Firebase com LocalStorage (Firebase tem prioridade)
                Object.entries(firebaseData).forEach(([key, value]) => {
                    localStorage.setItem(key, JSON.stringify(value));
                });
                
                console.log('Dados sincronizados do Firebase');
            }
        } catch (error) {
            console.error('Erro ao sincronizar do Firebase:', error);
        }
    }

    /**
     * Sincronizar dados do LocalStorage para Firebase
     * @param {string} key - Chave do localStorage a sincronizar
     * @param {any} data - Dados a sincronizar
     */
    async syncToFirebase(key, data) {
        if (!this.userId || !window.firebaseDB || !this.isOnline) {
            console.log('Offline ou Firebase não configurado. Dados salvos localmente.');
            return false;
        }

        if (this.syncInProgress) return;
        
        this.syncInProgress = true;

        try {
            await window.firebaseDB.database
                .ref(`users/${this.userId}/${key}`)
                .set(data);
            
            console.log(`Dados sincronizados para Firebase: ${key}`);
            return true;
        } catch (error) {
            console.error('Erro ao sincronizar para Firebase:', error);
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Configurar listeners para mudanças em tempo real do Firebase
     */
    setupRealtimeListeners() {
        if (!this.userId || !window.firebaseDB) return;

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

        // Listener para cada tipo de dado
        Object.values(STORAGE_KEYS).forEach(key => {
            window.firebaseDB.database
                .ref(`users/${this.userId}/${key}`)
                .on('value', (snapshot) => {
                    const value = snapshot.val();
                    if (value !== null) {
                        localStorage.setItem(key, JSON.stringify(value));
                        
                        // Disparar evento customizado para notificar mudanças
                        window.dispatchEvent(new CustomEvent('dataUpdated', {
                            detail: { key, data: value }
                        }));
                        
                        console.log(`Dados atualizados do Firebase: ${key}`);
                    }
                });
        });
    }

    /**
     * Sincronizar todos os dados locais para Firebase
     */
    async syncAllData() {
        if (!this.userId || !window.firebaseDB || !this.isOnline) return;

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

        try {
            const updates = {};
            
            Object.values(STORAGE_KEYS).forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    updates[key] = JSON.parse(data);
                }
            });

            await window.firebaseDB.database
                .ref(`users/${this.userId}`)
                .update(updates);
            
            console.log('Todos os dados sincronizados para Firebase');
            return true;
        } catch (error) {
            console.error('Erro ao sincronizar todos os dados:', error);
            return false;
        }
    }

    /**
     * Manipular quando o usuário fica online
     */
    handleOnline() {
        this.isOnline = true;
        console.log('Conexão restaurada. Sincronizando dados...');
        this.syncAllData();
    }

    /**
     * Manipular quando o usuário fica offline
     */
    handleOffline() {
        this.isOnline = false;
        console.log('Conexão perdida. Dados serão sincronizados quando online.');
    }

    /**
     * Gerar ID único para o usuário (baseado em hash da senha)
     */
    static generateUserId(password) {
        // Simples hash da senha para gerar ID único
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converter para inteiro de 32 bits
        }
        return `user_${Math.abs(hash)}`;
    }
}

// Criar instância global
const firebaseSync = new FirebaseSync();

// Exportar para uso em outros arquivos
window.firebaseSync = firebaseSync;

