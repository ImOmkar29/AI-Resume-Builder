// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";  // Import GoogleAuthProvider

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCmpaG3Dne4Mr726ybYJemkxl3ycMb-Jo0",
  authDomain: "ai-resume-builder-e6453.firebaseapp.com",
  projectId: "ai-resume-builder-e6453",
  storageBucket: "ai-resume-builder-e6453.firebasestorage.app",
  messagingSenderId: "976948077277",
  appId: "1:976948077277:web:1b4db9a022e0a1e12ab134",
  measurementId: "G-R853CXVSD1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Google Auth Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();  // Google Auth Provider

// Export auth and googleProvider for use in your app
export { auth, googleProvider };
