/**
 * FIREBASE-CONFIG.JS - Configuração do Firebase
 * Este arquivo contém a configuração para conectar o site ao Firebase Realtime Database
 */

const firebaseConfig = {
  apiKey: "AIzaSyCz9FO9lKmZZkVsSRRYbd0Y7S9wihUY-1w",
  authDomain: "site-financeiro-eduardo.firebaseapp.com",
  databaseURL: "https://site-financeiro-eduardo-default-rtdb.firebaseio.com",
  projectId: "site-financeiro-eduardo",
  storageBucket: "site-financeiro-eduardo.firebasestorage.app",
  messagingSenderId: "730286119473",
  appId: "1:730286119473:web:adb0a7dbd2f8aa2f975310"
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

