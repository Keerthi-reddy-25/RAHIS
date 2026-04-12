/* ============================================
   Authentication Module
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Register Page Logic ──
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      App.hideMessage('registerMsg');

      const username = document.getElementById('regUsername').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const confirmPassword = document.getElementById('regConfirmPassword').value.trim();

      // Validation
      if (!username || !password || !confirmPassword) {
        App.showMessage('registerMsg', 'Please fill in all fields.', 'error');
        return;
      }

      if (username.length < 3) {
        App.showMessage('registerMsg', 'Username must be at least 3 characters.', 'error');
        return;
      }

      if (password.length < 4) {
        App.showMessage('registerMsg', 'Password must be at least 4 characters.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        App.showMessage('registerMsg', 'Passwords do not match.', 'error');
        return;
      }

      const users = App.getUsers();

      if (users[username]) {
        App.showMessage('registerMsg', 'Username already exists. Try another.', 'error');
        return;
      }

      // Save user
      users[username] = { password, createdAt: new Date().toISOString() };
      App.saveUsers(users);

      App.showMessage('registerMsg', 'Account created successfully! Redirecting...', 'success');
      App.showToast('Welcome aboard! 🎉', '🚀');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    });
  }

  // ── Login Page Logic ──
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      App.hideMessage('loginMsg');

      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      if (!username || !password) {
        App.showMessage('loginMsg', 'Please fill in all fields.', 'error');
        return;
      }

      const users = App.getUsers();

      if (!users[username]) {
        App.showMessage('loginMsg', 'User not found. Please register first.', 'error');
        return;
      }

      if (users[username].password !== password) {
        App.showMessage('loginMsg', 'Incorrect password. Please try again.', 'error');
        return;
      }

      // Login success
      localStorage.setItem('habitiq-currentUser', username);
      App.showToast(`Welcome back, ${username}!`, '👋');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);
    });
  }

  // ── Password Visibility Toggles ──
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? '🙈' : '👁️';
    });
  });
});
