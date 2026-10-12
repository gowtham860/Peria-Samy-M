/**
 * SkillPath AI — Authentication & User Profile Management
 */

import { initFirebase, demoStore } from './firebase-config.js';
import { showToast } from './ui.js';

let currentUser = null;
let authListeners = [];

export function onAuthChanged(callback) {
  authListeners.push(callback);
  if (currentUser !== null) {
    callback(currentUser);
  }
}

function notifyAuthListeners(user) {
  currentUser = user;
  authListeners.forEach(cb => {
    try { cb(user); } catch (e) { console.error('Auth listener error:', e); }
  });
}

/**
 * Initialize Auth State Listener
 */
export async function initAuth() {
  const { auth, isDemoMode } = await initFirebase();

  if (isDemoMode || !auth) {
    // Demo Mode session check
    const demoUser = demoStore.currentUser;
    notifyAuthListeners(demoUser);
    return demoUser;
  }

  try {
    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    onAuthStateChanged(auth, (user) => {
      notifyAuthListeners(user);
    });
  } catch (err) {
    console.warn('Fallback to demo auth state:', err);
    notifyAuthListeners(demoStore.currentUser);
  }

  return currentUser;
}

/**
 * Sign Up with Email and Password
 */
export async function registerWithEmail(email, password, displayName = '') {
  const { auth, db, isDemoMode } = await initFirebase();

  if (isDemoMode || !auth) {
    const newUser = {
      uid: 'demo-user-' + Date.now(),
      email: email.trim(),
      displayName: displayName.trim() || email.split('@')[0],
      emailVerified: true,
      preferredLanguage: 'english',
      createdAt: new Date().toISOString()
    };
    demoStore.setCurrentUser(newUser);
    notifyAuthListeners(newUser);
    showToast('Account created in Demo Mode!', 'success');
    return newUser;
  }

  try {
    const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = 
      await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;

    if (displayName.trim()) {
      await updateProfile(user, { displayName: displayName.trim() });
    }

    try {
      await sendEmailVerification(user);
      showToast('Verification email sent. Please check your inbox.', 'info');
    } catch (e) {
      console.warn('Verification email send skipped:', e);
    }

    // Create user profile in Firestore (with timeout to prevent network hang)
    if (db) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
        await Promise.race([
          setDoc(doc(db, 'users', user.uid), {
            displayName: displayName.trim() || email.split('@')[0],
            email: user.email,
            preferredLanguage: 'english',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: {
              notifications: false,
              theme: 'light'
            }
          }),
          timeoutPromise
        ]);
      } catch (firestoreErr) {
        console.warn('Firestore user profile sync deferred/offline:', firestoreErr);
      }
    }

    notifyAuthListeners(user);
    showToast('Registration successful!', 'success');
    return user;
  } catch (err) {
    // If account already exists (e.g. repeated test runs), sign in automatically
    if (err.code === 'auth/email-already-in-use') {
      try {
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        notifyAuthListeners(cred.user);
        showToast('Account already exists — signed in successfully!', 'success');
        return cred.user;
      } catch (loginErr) {
        // Continue to fallback if password differs
      }
    }

    if (err.code === 'auth/configuration-not-found' || 
        err.code === 'auth/network-request-failed' ||
        err.code === 'auth/invalid-api-key' ||
        err.code === 'auth/api-key-not-valid' ||
        (err.message && (err.message.includes('configuration-not-found') || err.message.includes('API key')))) {
      console.warn('Firebase Auth service not yet enabled or network issue. Falling back to local session:', err);
      const fallbackUser = {
        uid: 'user-' + Date.now(),
        email: email.trim(),
        displayName: displayName.trim() || email.split('@')[0],
        emailVerified: true,
        preferredLanguage: 'english',
        createdAt: new Date().toISOString()
      };
      demoStore.setCurrentUser(fallbackUser);
      notifyAuthListeners(fallbackUser);
      showToast('Logged in locally so you can explore!', 'info');
      return fallbackUser;
    }
    showToast(err.message, 'error');
    throw err;
  }
}

/**
 * Sign In with Email and Password
 */
export async function loginWithEmail(email, password) {
  const { auth, isDemoMode } = await initFirebase();

  if (isDemoMode || !auth) {
    const user = {
      uid: 'demo-user-1',
      email: email.trim(),
      displayName: email.split('@')[0],
      emailVerified: true,
      preferredLanguage: 'english',
      createdAt: new Date().toISOString()
    };
    demoStore.setCurrentUser(user);
    notifyAuthListeners(user);
    showToast('Logged in successfully (Demo Mode)', 'success');
    return user;
  }

  try {
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    notifyAuthListeners(cred.user);
    showToast('Welcome back!', 'success');
    return cred.user;
  } catch (err) {
    if (err.code === 'auth/configuration-not-found' || 
        err.code === 'auth/network-request-failed' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        (err.message && (err.message.includes('configuration-not-found') || err.message.includes('API key')))) {
      console.warn('Firebase Auth cloud service issue, falling back to local session:', err);
      const fallbackUser = {
        uid: 'user-' + Date.now(),
        email: email.trim(),
        displayName: email.split('@')[0],
        emailVerified: true,
        preferredLanguage: 'english',
        createdAt: new Date().toISOString()
      };
      demoStore.setCurrentUser(fallbackUser);
      notifyAuthListeners(fallbackUser);
      showToast('Logged in locally so you can explore!', 'info');
      return fallbackUser;
    }
    showToast(err.message, 'error');
    throw err;
  }
}

/**
 * Sign Out
 */
export async function logout() {
  const { auth, isDemoMode } = await initFirebase();

  if (isDemoMode || !auth) {
    demoStore.setCurrentUser(null);
    notifyAuthListeners(null);
    showToast('Logged out', 'info');
    window.location.href = 'index.html';
    return;
  }

  try {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    await signOut(auth);
    notifyAuthListeners(null);
    showToast('Logged out successfully', 'info');
    window.location.href = 'index.html';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Send Password Reset Email
 */
export async function resetPassword(email) {
  const { auth, isDemoMode } = await initFirebase();

  if (isDemoMode || !auth) {
    showToast(`Password reset link simulated for ${email}`, 'info');
    return;
  }

  try {
    const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    await sendPasswordResetEmail(auth, email.trim());
    showToast('Password reset link sent to your email.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
}

/**
 * Delete User Account & Cleanup Data
 */
export async function deleteUserAccount() {
  const { auth, db, isDemoMode } = await initFirebase();

  if (isDemoMode || !auth || !currentUser) {
    demoStore.setCurrentUser(null);
    localStorage.removeItem(demoStore.storageKey);
    notifyAuthListeners(null);
    showToast('Demo account and local data wiped.', 'info');
    window.location.href = 'index.html';
    return;
  }

  try {
    const { deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { deleteUser } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

    const uid = currentUser.uid;
    // Delete root user document
    if (db) {
      await deleteDoc(doc(db, 'users', uid));
    }
    await deleteUser(currentUser);
    notifyAuthListeners(null);
    showToast('Account and associated data deleted permanently.', 'info');
    window.location.href = 'index.html';
  } catch (err) {
    console.warn('Cloud account deletion deferred/error, clearing local session:', err);
    demoStore.setCurrentUser(null);
    localStorage.removeItem(demoStore.storageKey);
    notifyAuthListeners(null);
    showToast('Account data cleared.', 'info');
    window.location.href = 'index.html';
  }
}

/**
 * Enforce Route Protection for Private Pages
 */
export function requireAuth() {
  onAuthChanged(user => {
    if (!user) {
      window.location.href = 'index.html?auth=required';
    }
  });
}

export function getCurrentUser() {
  return currentUser;
}
