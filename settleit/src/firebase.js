import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from "firebase/analytics";

// SettleIt Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAHIlVwv_4Q2GrxoGHccB_OpLsRQzmG4OM",
    authDomain: "settleit-e1a15.firebaseapp.com",
    projectId: "settleit-e1a15",
    storageBucket: "settleit-e1a15.firebasestorage.app",
    messagingSenderId: "680237775620",
    appId: "1:680237775620:web:0b9ac7dd83da907d02ae51",
    measurementId: "G-7VPY623WPL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const analytics = getAnalytics(app)

const isConfigured = !!auth

export { db, auth, isConfigured, analytics }
