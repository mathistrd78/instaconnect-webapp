import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAw4Fa6eWt5IDLVjWe4_M6C48Pqe7A8IaY",
  authDomain: "instaconnect-62ba5.firebaseapp.com",
  projectId: "instaconnect-62ba5",
  storageBucket: "instaconnect-62ba5.firebasestorage.app",
  messagingSenderId: "821509841039",
  appId: "1:821509841039:web:e3f10cf19f841d772dd0fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
