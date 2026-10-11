/**
 * SkillPath AI — UI Controls, Notifications, Modals & Theme Manager
 */

export function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  initLucideIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 300ms ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export function initModalListeners() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });
}

export function initThemeToggle() {
  const savedTheme = localStorage.getItem('skillpath_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  applyTheme(savedTheme);

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem('skillpath_theme', nextTheme);
    });
  });
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const iconName = theme === 'dark' ? 'sun' : 'moon';
  document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
    icon.setAttribute('data-lucide', iconName);
  });
  initLucideIcons();
}

export function initLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

export function setButtonLoading(buttonEl, isLoading, loadingText = 'Loading...') {
  if (!buttonEl) return;
  if (isLoading) {
    buttonEl.dataset.originalHtml = buttonEl.innerHTML;
    buttonEl.disabled = true;
    buttonEl.innerHTML = `
      <span class="spinner spinner-dark" style="margin-right:0.5rem;"></span>
      <span>${loadingText}</span>
    `;
  } else {
    buttonEl.disabled = false;
    if (buttonEl.dataset.originalHtml) {
      buttonEl.innerHTML = buttonEl.dataset.originalHtml;
    }
    initLucideIcons();
  }
}
