/**
 * SkillPath AI — Frontend Form Validation & Sanitization Utilities
 */

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return { valid: false, message: 'Password is required' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
  return { valid: true };
}

export function setFieldError(fieldElement, errorMessage) {
  const formGroup = fieldElement.closest('.form-group') || fieldElement.parentElement;
  if (!formGroup) return;

  if (errorMessage) {
    formGroup.classList.add('has-error');
    let errorEl = formGroup.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      formGroup.appendChild(errorEl);
    }
    errorEl.textContent = errorMessage;
    errorEl.style.display = 'block';
  } else {
    formGroup.classList.remove('has-error');
    const errorEl = formGroup.querySelector('.form-error');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
  }
}

export function clearFormErrors(formElement) {
  formElement.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  formElement.querySelectorAll('.form-error').forEach(el => {
    el.style.display = 'none';
    el.textContent = '';
  });
}
