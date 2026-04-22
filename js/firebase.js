import { initializeApp } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js)";
import { getFirestore } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js)";

const firebaseConfig = {
    apiKey: "AIzaSyCDBVvf6Q18-cdcLouUVenDOeYPtfKOZt8",
    authDomain: "stealth-drive-ca20e.firebaseapp.com",
    projectId: "stealth-drive-ca20e",
    storageBucket: "stealth-drive-ca20e.firebasestorage.app",
    messagingSenderId: "72158519364",
    appId: "1:72158519364:web:f17473d7446225b9a99c11"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
