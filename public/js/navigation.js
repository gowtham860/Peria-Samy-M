/**
 * SkillPath AI — Navigation, Sidebar & Layout Controller
 */

import { initThemeToggle, initLucideIcons } from './ui.js';
import { logout, onAuthChanged } from './auth.js';

export function initNavigation() {
  initThemeToggle();
  initLucideIcons();

  // Highlight current navigation link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile menu drawer toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.app-sidebar');
  let backdrop = document.querySelector('.sidebar-backdrop');

  if (mobileMenuBtn && sidebar) {
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('active');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('active');
    });
  }

  // Logout button event
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });

  // User details in header
  onAuthChanged(user => {
    const avatarEl = document.querySelector('.user-avatar');
    const nameEl = document.querySelector('.user-display-name');
    const emailEl = document.querySelector('.user-email');

    if (user) {
      const initials = (user.displayName || user.email || 'U').substring(0, 2).toUpperCase();
      if (avatarEl) avatarEl.textContent = initials;
      if (nameEl) nameEl.textContent = user.displayName || user.email.split('@')[0];
      if (emailEl) emailEl.textContent = user.email;
    }
  });
}
