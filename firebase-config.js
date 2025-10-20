/**
 * FIREBASE-CONFIG.JS - Configuração do Firebase
 * Este arquivo contém a configuração para conectar o site ao Firebase Realtime Database
 */

// Configuração do Firebase - VOCÊ PRECISA PREENCHER COM SEUS DADOS
// Siga as instruções em FIREBASE_SETUP.md para obter essas credenciais
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obter referência ao banco de dados
const database = firebase.database();

// Exportar para uso em outros arquivos
window.firebaseDB = {
    database: database,
    isConfigured: firebaseConfig.apiKey !== "YOUR_API_KEY"
};

