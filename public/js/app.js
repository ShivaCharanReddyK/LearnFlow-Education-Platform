/* ═══════════════════════════════════════════════════════════
   LearnFlow - Core App Module
   Shared utilities, API client, toast notifications, auth state
   ═══════════════════════════════════════════════════════════ */

const API_BASE = '/api';

// ── API Client ──
const api = {
    async request(method, endpoint, data = null, auth = true) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (auth) {
            const token = localStorage.getItem('learnflow_token');
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || 'Something went wrong');
        }

        return responseData;
    },

    get(endpoint, auth = true) { return this.request('GET', endpoint, null, auth); },
    post(endpoint, data, auth = true) { return this.request('POST', endpoint, data, auth); },
    patch(endpoint, data, auth = true) { return this.request('PATCH', endpoint, data, auth); },
    put(endpoint, data, auth = true) { return this.request('PUT', endpoint, data, auth); },
    delete(endpoint, auth = true) { return this.request('DELETE', endpoint, null, auth); }
};

// ── Auth State ──
const auth = {
    getUser() {
        const userStr = localStorage.getItem('learnflow_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken() {
        return localStorage.getItem('learnflow_token');
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    isStudent() {
        const user = this.getUser();
        return user?.role === 'student';
    },

    isCounselor() {
        const user = this.getUser();
        return user?.role === 'counselor';
    },

    login(token, user) {
        localStorage.setItem('learnflow_token', token);
        localStorage.setItem('learnflow_user', JSON.stringify(user));
        this.updateNav();
    },

    logout() {
        localStorage.removeItem('learnflow_token');
        localStorage.removeItem('learnflow_user');
        window.location.href = '/';
    },

    updateNav() {
        const user = this.getUser();
        const navAuth = document.getElementById('nav-auth');
        const navLinks = document.getElementById('nav-links');

        if (!navAuth) return;

        if (user) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const dashboardLink = user.role === 'counselor' ? '/counselor' : '/dashboard';

            navAuth.innerHTML = `
        <a href="${dashboardLink}" class="nav-user" id="nav-user-menu">
          <div class="avatar">${initials}</div>
          <div>
            <div class="user-name">${user.name}</div>
            <div class="user-role">${user.role}</div>
          </div>
        </a>
        <button class="btn btn-ghost btn-sm" onclick="auth.logout()" id="logout-btn">Logout</button>
      `;

            // Update nav links based on role
            if (navLinks) {
                const dashItem = document.createElement('li');
                dashItem.innerHTML = `<a href="${dashboardLink}">${user.role === 'counselor' ? 'Review Panel' : 'Dashboard'}</a>`;

                // Remove existing dashboard links
                const existing = navLinks.querySelector('[data-dynamic]');
                if (existing) existing.remove();
                dashItem.setAttribute('data-dynamic', 'true');
                navLinks.appendChild(dashItem);
            }
        } else {
            navAuth.innerHTML = `
        <a href="/login" class="btn btn-ghost btn-sm" id="login-btn">Sign In</a>
        <a href="/register" class="btn btn-primary btn-sm" id="register-btn">Get Started</a>
      `;
        }
    }
};

// ── Toast Notifications ──
const toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 4000) {
        this.init();

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toastEl = document.createElement('div');
        toastEl.className = `toast ${type}`;
        toastEl.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

        this.container.appendChild(toastEl);

        setTimeout(() => {
            toastEl.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toastEl.remove(), 300);
        }, duration);
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
};

// ── Utility Functions ──
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function getCategoryClass(category) {
    const map = {
        'Computer Science': 'cs',
        'Data Science': 'ds',
        'Design': 'design',
        'Business': 'business',
        'Engineering': 'engineering',
        'Health Sciences': 'health',
        'Arts & Humanities': 'arts',
        'Education': 'education'
    };
    return map[category] || 'cs';
}

function getCategoryIcon(category) {
    const map = {
        'Computer Science': '💻',
        'Data Science': '📊',
        'Design': '🎨',
        'Business': '📈',
        'Engineering': '⚙️',
        'Health Sciences': '🏥',
        'Arts & Humanities': '📚',
        'Education': '🎓'
    };
    return map[category] || '📖';
}

function getStatusBadge(status) {
    const map = {
        pending: { class: 'badge-warning', text: 'Pending' },
        under_review: { class: 'badge-info', text: 'Under Review' },
        approved: { class: 'badge-success', text: 'Approved' },
        denied: { class: 'badge-error', text: 'Denied' }
    };
    const s = map[status] || { class: 'badge-primary', text: status };
    return `<span class="badge ${s.class}">${s.text}</span>`;
}

function getPaymentStatusBadge(status) {
    const map = {
        not_required: { class: 'badge-primary', text: 'N/A' },
        pending: { class: 'badge-warning', text: 'Payment Due' },
        partial: { class: 'badge-info', text: 'Partial' },
        completed: { class: 'badge-success', text: 'Paid' }
    };
    const s = map[status] || { class: 'badge-primary', text: status };
    return `<span class="badge ${s.class}">${s.text}</span>`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ── Navbar Scroll Effect ──
document.addEventListener('DOMContentLoaded', () => {
    auth.updateNav();

    // Scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinksEl = document.getElementById('nav-links');
    if (navToggle && navLinksEl) {
        navToggle.addEventListener('click', () => {
            navLinksEl.classList.toggle('mobile-open');
        });
    }

    // Highlight active nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

// ── Modal Utilities ──
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});
