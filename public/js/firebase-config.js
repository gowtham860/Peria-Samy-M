/**
 * SkillPath AI — Firebase Client Initialization & Environment Adapter
 * Supports Live Firebase, Firebase Local Emulator Suite, and In-Browser Demo Mode.
 */

// Production / Development Firebase Web SDK credentials
// You can replace these with your actual Firebase Project config from the Firebase Console
export const firebaseConfig = {
  apiKey: window.__FIREBASE_API_KEY__ || "AIzaSySkillPathMockKeyForDevelopmentOnly",
  authDomain: window.__FIREBASE_AUTH_DOMAIN__ || "skillpath-ai-prod.firebaseapp.com",
  projectId: window.__FIREBASE_PROJECT_ID__ || "skillpath-ai-prod",
  storageBucket: window.__FIREBASE_STORAGE_BUCKET__ || "skillpath-ai-prod.appspot.com",
  messagingSenderId: window.__FIREBASE_MESSAGING_SENDER_ID__ || "123456789012",
  appAppId: window.__FIREBASE_APP_ID__ || "1:123456789012:web:abcdef1234567890"
};

// Check if running against local emulators
export const isEmulatorMode = window.location.hostname === 'localhost' && window.location.port === '5000';

let authInstance = null;
let dbInstance = null;
let functionsInstance = null;
let isDemoMode = false;

// Mock storage for Demo Mode when Firebase is not connected
class LocalDemoStore {
  constructor() {
    this.storageKey = 'skillpath_demo_db_v1';
    this.currentUser = JSON.parse(localStorage.getItem('skillpath_demo_user') || 'null');
  }

  getData() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{"users":{},"plans":{},"quizzes":[],"sessions":[]}');
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('skillpath_demo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('skillpath_demo_user');
    }
  }
}

export const demoStore = new LocalDemoStore();

/**
 * Initialize Firebase services or gracefully fallback to Demo Mode
 */
export async function initFirebase() {
  if (window.__firebaseInitialized) {
    return { auth: authInstance, db: dbInstance, functions: functionsInstance, isDemoMode };
  }

  try {
    // Attempt dynamic import from official Firebase v10 CDN
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getAuth, connectAuthEmulator } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { getFirestore, connectFirestoreEmulator } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { getFunctions, connectFunctionsEmulator } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js');

    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    functionsInstance = getFunctions(app);

    if (isEmulatorMode) {
      connectAuthEmulator(authInstance, 'http://localhost:9099');
      connectFirestoreEmulator(dbInstance, 'localhost', 8080);
      connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
      console.log('Firebase Emulators connected (Auth: 9099, Firestore: 8080, Functions: 5001)');
    }

    isDemoMode = false;
    window.__firebaseInitialized = true;
    console.log('Firebase initialized successfully.');
  } catch (err) {
    console.warn('Firebase CDN or network unavailable, enabling SkillPath Demo Mode:', err);
    isDemoMode = true;
    window.__firebaseInitialized = true;
  }

  return { auth: authInstance, db: dbInstance, functions: functionsInstance, isDemoMode };
}

export { authInstance as auth, dbInstance as db, functionsInstance as functions, isDemoMode };
