// js/modules/auth.js - VERSIÓN CORREGIDA (NO MODULAR)
class AuthModule {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.token = null;
        console.log('🔐 Auth Module creado');
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔐 Inicializando módulo de Auth...');
        
        try {
            this.loadStoredAuth();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Auth Module inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Auth Module:', error);
            throw error;
        }
    }

    loadStoredAuth() {
        // Cargar datos de autenticación guardados
        try {
            const storedUser = localStorage.getItem('cyclops_user');
            const storedToken = localStorage.getItem('cyclops_token');
            
            if (storedUser && storedToken) {
                this.currentUser = JSON.parse(storedUser);
                this.token = storedToken;
                console.log('👤 Usuario cargado desde almacenamiento local');
            }
        } catch (error) {
            console.warn('Error cargando autenticación almacenada:', error);
            this.clearAuth();
        }
    }

    setupEventListeners() {
        // Escuchar eventos de login/logout
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn')) {
                this.logout();
            }
        });

        // Formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const loading = window.CyclopsApp?.getModule('ui')?.showLoading(form);
            
            // Simular autenticación (reemplazar con API real)
            await this.mockLogin(email, password);
            
            window.CyclopsApp?.getModule('ui')?.hideLoading(loading);
            window.CyclopsApp?.getModule('helpers')?.showNotification('Login exitoso', 'success');
            
            // Cerrar modal de login si existe
            window.CyclopsApp?.getModule('ui')?.hideModal('loginModal');
            form.reset();

        } catch (error) {
            window.CyclopsApp?.getModule('ui')?.hideLoading(loading);
            window.CyclopsApp?.getModule('helpers')?.showNotification(error.message, 'error');
        }
    }

    async mockLogin(email, password) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Validaciones básicas
        const helpers = window.CyclopsApp?.getModule('helpers');
        if (!helpers || !helpers.validateEmail(email)) {
            throw new Error('Email inválido');
        }

        if (!password || password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Simular usuario de prueba
        this.currentUser = {
            id: 'user_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            role: 'user'
        };

        this.token = 'mock_jwt_token_' + Date.now();

        // Guardar en localStorage
        this.saveAuth();

        // Actualizar UI
        this.updateAuthUI();

        return { user: this.currentUser, token: this.token };
    }

    saveAuth() {
        try {
            localStorage.setItem('cyclops_user', JSON.stringify(this.currentUser));
            localStorage.setItem('cyclops_token', this.token);
        } catch (error) {
            console.error('Error guardando autenticación:', error);
        }
    }

    clearAuth() {
        this.currentUser = null;
        this.token = null;
        try {
            localStorage.removeItem('cyclops_user');
            localStorage.removeItem('cyclops_token');
        } catch (error) {
            console.error('Error limpiando autenticación:', error);
        }
        
        this.updateAuthUI();
    }

    logout() {
        this.clearAuth();
        window.CyclopsApp?.getModule('helpers')?.showNotification('Sesión cerrada', 'info');
    }

    updateAuthUI() {
        const authElements = document.querySelectorAll('.auth-state');
        
        authElements.forEach(element => {
            if (this.isAuthenticated()) {
                element.classList.remove('logged-out');
                element.classList.add('logged-in');
                
                // Actualizar nombre de usuario si existe el elemento
                const userNameEl = element.querySelector('.user-name');
                if (userNameEl && this.currentUser) {
                    userNameEl.textContent = this.currentUser.name;
                }
            } else {
                element.classList.remove('logged-in');
                element.classList.add('logged-out');
            }
        });
    }

    isAuthenticated() {
        return !!this.currentUser && !!this.token;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }

    // Verificar permisos (para futuras implementaciones)
    hasPermission(permission) {
        if (!this.isAuthenticated()) return false;
        
        // Lógica simple de permisos (expandir según necesidades)
        const userPermissions = {
            'user': ['read_tickets', 'create_tickets'],
            'admin': ['read_tickets', 'create_tickets', 'manage_users', 'view_reports']
        };

        return userPermissions[this.currentUser.role]?.includes(permission) || false;
    }
}
