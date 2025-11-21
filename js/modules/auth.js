class AuthModule {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
    }

    init() {
        console.log('🔐 AuthModule inicializado');
        this.bindAuthEvents();
        this.checkAuthStatus();
        return this;
    }

    bindAuthEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Buscar botón de logout de forma más flexible
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.classList.contains('logout-btn')) {
                this.handleLogout();
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const credentials = Object.fromEntries(formData);

        try {
            console.log('🔐 Intentando login:', credentials);
            await this.authenticate(credentials);
            this.showAuthSuccess();
            e.target.reset();
            
            // Cerrar modal después de login exitoso
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.remove('active');
            }
        } catch (error) {
            this.showAuthError(error.message);
        }
    }

    async authenticate(credentials) {
        // Simular API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (credentials.email && credentials.password) {
                    this.isAuthenticated = true;
                    this.currentUser = { 
                        name: 'Usuario Demo', 
                        email: credentials.email 
                    };
                    resolve(this.currentUser);
                } else {
                    reject(new Error('Credenciales inválidas'));
                }
            }, 1000);
        });
    }

    handleLogout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.updateAuthUI();
        console.log('👋 Usuario deslogueado');
    }

    checkAuthStatus() {
        // Verificar si hay sesión activa (simulado)
        const token = localStorage.getItem('authToken');
        if (token) {
            this.isAuthenticated = true;
            this.currentUser = { name: 'Usuario', email: 'user@example.com' };
        }
        this.updateAuthUI();
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');

        if (this.isAuthenticated && this.currentUser) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                const userNameElement = userMenu.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = this.currentUser.name;
                }
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    showAuthSuccess() {
        // Usar notificación nativa si Helpers no está disponible
        if (typeof Helpers !== 'undefined' && Helpers.showNotification) {
            Helpers.showNotification('✅ Login exitoso', 'success');
        } else {
            alert('✅ Login exitoso');
        }
        this.updateAuthUI();
    }

    showAuthError(message) {
        if (typeof Helpers !== 'undefined' && Helpers.showNotification) {
            Helpers.showNotification(`❌ ${message}`, 'error');
        } else {
            alert(`❌ ${message}`);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasPermission(permission) {
        // Lógica de permisos simplificada
        return this.isAuthenticated;
    }
}

// Global registration
window.AuthModule = AuthModule;
console.log('✅ Auth module loaded');
