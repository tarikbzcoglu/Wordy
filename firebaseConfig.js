import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAbeYCm62Lbvz2hzQpHrnDzG4lZ-Ks9INk",
    authDomain: "wordy-a061f.firebaseapp.com",
    projectId: "wordy-a061f",
    storageBucket: "wordy-a061f.firebasestorage.app",
    messagingSenderId: "133184485692",
    appId: "1:133184485692:web:29cecf371409f377f6c639",
    measurementId: "G-CYJX9NEEVT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Analytics (optional, checks support first)
let analytics;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});

export { analytics, app, db };

