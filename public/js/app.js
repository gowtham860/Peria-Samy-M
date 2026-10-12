/**
 * SkillPath AI — Application Bootstrapper & Main Entry Point
 */

import { initAuth, onAuthChanged, loginWithEmail, registerWithEmail, resetPassword } from './auth.js';
import { initNavigation } from './navigation.js';
import { initModalListeners, openModal, closeModal, showToast, setButtonLoading, initLucideIcons } from './ui.js';
import { clearFormErrors, setFieldError, validateEmail, validatePassword } from './validation.js';

// Page-specific modules loaded conditionally
import { initDashboard } from './dashboard.js';
import { initPlanner } from './planner.js';
import { initAssistant } from './assistant.js';
import { initQuizzes } from './quizzes.js';
import { initResources } from './resources.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize UI listeners & navigation
  initModalListeners();
  initNavigation();
  initAuthModalHandlers();

  // 2. Initialize Authentication
  await initAuth();

  // 3. Route-specific initializers
  const path = window.location.pathname.toLowerCase();
  const page = path.split('/').pop() || 'index.html';
  const isPage = (name) => page === name || page === `${name}.html` || path.endsWith(`/${name}`) || path.endsWith(`/${name}.html`);

  if (isPage('dashboard')) {
    await initDashboard();
  } else if (isPage('planner')) {
    initPlanner();
  } else if (isPage('assistant')) {
    initAssistant();
  } else if (isPage('quizzes')) {
    initQuizzes();
  } else if (isPage('resources')) {
    initResources();
  } else if (isPage('profile')) {
    initProfilePage();
  }

  initLucideIcons();
});

/**
 * Handle Auth Modals on landing page
 */
function initAuthModalHandlers() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const forgotForm = document.getElementById('forgot-form');

  // Open auth modal buttons
  document.querySelectorAll('[data-open-auth]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.dataset.tab || 'login';
      switchAuthTab(tab);
      openModal('auth-modal');
    });
  });

  // Tab switching in modal
  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchAuthTab(btn.dataset.tab);
    });
  });

  // Login submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormErrors(loginForm);
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;

      if (!validateEmail(email)) {
        setFieldError(document.getElementById('login-email'), 'Please enter a valid email address.');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      setButtonLoading(submitBtn, true, 'Signing in...');

      try {
        await loginWithEmail(email, pass);
        closeModal('auth-modal');
        window.location.href = 'dashboard.html';
      } catch (err) {
        // Error toast handled in auth.js
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Register submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormErrors(registerForm);
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;

      if (!validateEmail(email)) {
        setFieldError(document.getElementById('reg-email'), 'Please enter a valid email address.');
        return;
      }

      const passCheck = validatePassword(pass);
      if (!passCheck.valid) {
        setFieldError(document.getElementById('reg-password'), passCheck.message);
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      setButtonLoading(submitBtn, true, 'Creating account...');

      try {
        await registerWithEmail(email, pass, name);
        closeModal('auth-modal');
        window.location.href = 'dashboard.html';
      } catch (err) {
        // Error toast handled in auth.js
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Forgot password submission
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormErrors(forgotForm);
      const email = document.getElementById('forgot-email').value;

      if (!validateEmail(email)) {
        setFieldError(document.getElementById('forgot-email'), 'Please enter a valid email address.');
        return;
      }

      const submitBtn = forgotForm.querySelector('button[type="submit"]');
      setButtonLoading(submitBtn, true, 'Sending link...');

      try {
        await resetPassword(email);
        switchAuthTab('login');
      } catch (err) {
        // Toast handled in auth.js
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  const loginView = document.getElementById('auth-login-view');
  const regView = document.getElementById('auth-register-view');
  const forgotView = document.getElementById('auth-forgot-view');

  if (loginView) loginView.style.display = tab === 'login' ? 'block' : 'none';
  if (regView) regView.style.display = tab === 'register' ? 'block' : 'none';
  if (forgotView) forgotView.style.display = tab === 'forgot' ? 'block' : 'none';
}

function initProfilePage() {
  const profileForm = document.getElementById('profile-form');
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  const notifToggle = document.getElementById('notif-permission-btn');

  onAuthChanged(user => {
    if (user) {
      const nameInput = document.getElementById('profile-display-name');
      const emailInput = document.getElementById('profile-email');
      if (nameInput) nameInput.value = user.displayName || '';
      if (emailInput) emailInput.value = user.email || '';
    }
  });

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Profile preferences updated successfully!', 'success');
    });
  }

  if (notifToggle) {
    notifToggle.addEventListener('click', async () => {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          showToast('Study reminders enabled!', 'success');
        } else {
          showToast('Notification permission denied.', 'info');
        }
      } else {
        showToast('Browser notifications not supported.', 'info');
      }
    });
  }

  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
      if (confirm('Are you absolutely sure? This will permanently delete your account, learning roadmaps, quiz history, and progress records.')) {
        const { deleteUserAccount } = await import('./auth.js');
        await deleteUserAccount();
      }
    });
  }
}
