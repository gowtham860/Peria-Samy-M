/**
 * SkillPath AI — Firebase Client Initialization & Environment Adapter
 * Supports Live Firebase, Firebase Local Emulator Suite, and In-Browser Demo Mode.
 */

// Production / Development Firebase Web SDK credentials
// You can replace these with your actual Firebase Project config from the Firebase Console
export const firebaseConfig = {
  apiKey: "AIzaSyCwNdshQzO3-Ss5m1M0rHUIO9T-GEIIBAA",
  authDomain: "skillpath-ai-app.firebaseapp.com",
  projectId: "skillpath-ai-app",
  storageBucket: "skillpath-ai-app.firebasestorage.app",
  messagingSenderId: "606772195309",
  appId: "1:606772195309:web:c9ba3eab3c80b17e3c41e4",
  measurementId: "G-X1JVB30EH5"
};

// Check if running against local emulators
export const isEmulatorMode = 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  (window.location.port === '5000' || window.location.port === '5001' || Boolean(window.__USE_FIREBASE_EMULATORS__));

export const hasRealFirebaseConfig = Boolean(
  window.__FIREBASE_API_KEY__ || 
  (firebaseConfig.apiKey && 
   !firebaseConfig.apiKey.includes('MockKey') && 
   !firebaseConfig.apiKey.startsWith('AIzaSyCwNdshQzO3'))
);

let authInstance = null;
let dbInstance = null;
let functionsInstance = null;
let isDemoMode = !hasRealFirebaseConfig && !isEmulatorMode;

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
 * Call local backend API directly if available (e.g. running node server.js)
 */
export async function callBackend(endpoint, data = {}) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      return json.result || json;
    }
  } catch (e) {
    // Local server not responding or not on same host
  }
  return null;
}

/**
 * Initialize Firebase services or gracefully fallback to Demo Mode
 */
export async function initFirebase() {
  if (window.__firebaseInitialized) {
    return { auth: authInstance, db: dbInstance, functions: functionsInstance, isDemoMode };
  }

  // If using default mock key and not running emulators, activate Demo Mode immediately
  if (!hasRealFirebaseConfig && !isEmulatorMode) {
    isDemoMode = true;
    window.__firebaseInitialized = true;
    console.info('SkillPath AI running in In-Browser Demo Mode (offline local store).');
    return { auth: null, db: null, functions: null, isDemoMode: true };
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
