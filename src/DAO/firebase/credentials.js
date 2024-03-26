// Importamos la función para inicializar la aplicación de Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Añade aquí tus credenciales
const firebaseConfig = {
    apiKey: "AIzaSyCPFG0wLhE2eZ3qfzHVS9UdnvkXh3lV7mM",
    authDomain: "ciclopista.firebaseapp.com",
    projectId: "ciclopista",
    storageBucket: "ciclopista.appspot.com",
    messagingSenderId: "797905124061",
    appId: "1:797905124061:web:5f94af70f0925e8732f934",
    measurementId: "G-YZNHY1P4NV"
};

// Inicializamos la aplicación y la guardamos en firebaseApp
const firebaseApp = initializeApp(firebaseConfig);
// Exportamos firebaseApp para poder utilizarla en cualquier lugar de la aplicación
// const analytics = getAnalytics(app);
export default firebaseApp;