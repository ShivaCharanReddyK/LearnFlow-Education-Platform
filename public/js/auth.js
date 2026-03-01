/* ═══════════════════════════════════════
   LearnFlow - Auth Pages (Login/Register)
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (auth.isLoggedIn()) {
        const user = auth.getUser();
        window.location.href = user.role === 'counselor' ? '/counselor' : '/dashboard';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Signing in...';

            try {
                const data = await api.post('/auth/login', {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                }, false);

                auth.login(data.token, data.user);
                toast.success('Welcome back, ' + data.user.name + '!');

                setTimeout(() => {
                    window.location.href = data.user.role === 'counselor' ? '/counselor' : '/dashboard';
                }, 500);
            } catch (error) {
                toast.error(error.message);
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Creating account...';

            try {
                const data = await api.post('/auth/register', {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password,
                    role: document.getElementById('role')?.value || 'student',
                    phone: document.getElementById('phone')?.value || ''
                }, false);

                auth.login(data.token, data.user);
                toast.success('Account created! Welcome to LearnFlow!');

                setTimeout(() => {
                    window.location.href = data.user.role === 'counselor' ? '/counselor' : '/programs';
                }, 500);
            } catch (error) {
                toast.error(error.message);
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }
});
