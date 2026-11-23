import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGhjjU1bl3SMboRgLMRGv0DCo11zn7WHA",
  authDomain: "skatefest-a3d0f.firebaseapp.com",
  projectId: "skatefest-a3d0f",
  storageBucket: "skatefest-a3d0f.firebasestorage.app",
  messagingSenderId: "959458460857",
  appId: "1:959458460857:web:038478db4456e276d54768",
  measurementId: "G-LKND73PYQL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };