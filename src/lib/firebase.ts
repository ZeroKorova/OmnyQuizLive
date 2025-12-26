import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAmu_S69inhan0pK45c92NVA6q4lGLuBEs",
    authDomain: "omniquizlive.firebaseapp.com",
    projectId: "omniquizlive",
    storageBucket: "omniquizlive.firebasestorage.app",
    messagingSenderId: "1084748724140",
    appId: "1:1084748724140:web:33d8a739ba892c88b3ac09"
};

const app = initializeApp(firebaseConfig);
// Init Firestore with settings to bypass potential firewall issues with WebSockets
import { initializeFirestore } from "firebase/firestore";
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
