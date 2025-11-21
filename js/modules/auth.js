import { Helpers } from '../utils/helpers.js';
import { apiClient } from '../utils/api.js';
import { CONFIG, MESSAGES } from '../utils/constants.js';

// Módulo de autenticación
export class AuthModule {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        console.log('🔐 Inicializando módulo de autenticación...');
        this.checkExistingAuth();
        this.setupEventListeners();
    }

    checkExistingAuth() {
        const token = Helpers.getStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const userData = Helpers.getStorage(CONFIG.STORAGE_KEYS.USER_DATA);
        
        if (token && userData) {
            this.currentUser = userData;
            this.isAuthenticated = true;
            this.updateUI();
            
            // Verificar si el token sigue siendo válido
            this.validateToken();
        }
    }

    async validateToken() {
        try {
            await apiClient.getUserProfile();
        } catch (error) {
            console.warn('Token inválido o expirado:', error);
            this.logout();
            Helpers.showNotification(MESSAGES.ERROR.SESSION_EXPIRED, 'warning');
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Auth modal triggers
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-auth-action]')) {
                const action = e.target.dataset.authAction;
                this.handleAuthAction(action);
            }
        });

        // Cerrar sesión por inactividad
        this.setupInactivityTimer();
    }

    handleAuthAction(action) {
        switch (action) {
            case 'login':
                window.cyclops.app.getModule('ui').openModal('loginModal');
                break;
            case 'register':
                window.cyclops.app.getModule('ui').openModal('registerModal');
                break;
            case 'logout':
                this.handleLogout();
                break;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        // Validación básica
        if (!Helpers.isValidEmail(email)) {
            Helpers.showNotification(MESSAGES.ERROR.INVALID_EMAIL, 'error');
            return;
        }

        if (!password) {
            Helpers.showNotification(MESSAGES.ERROR.REQUIRED_FIELD, 'error');
            return;
        }

        Helpers.setFormLoading(form, true);

        try {
            const result = await apiClient.login({ email, password });
            
            if (result.success && result.data) {
                this.currentUser = result.data.user;
                this.isAuthenticated = true;
                
                // Guardar en localStorage
                Helpers.setStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN, result.data.token);
                Helpers.setStorage(CONFIG.STORAGE_KEYS.USER_DATA, result.data.user);
                
                Helpers.showNotification(MESSAGES.SUCCESS.LOGIN_SUCCESS, 'success');
                this.updateUI();
                window.cyclops.app.getModule('ui').closeModal();
                
                // Redirigir o actualizar la vista
                setTimeout(() => {
                    if (window.location.pathname === CONFIG.ROUTES.HOME) {
                        window.cyclops.app.getModule('ui').scrollToSection('servicios');
                    }
                }, 1000);
            } else {
                Helpers.showNotification(result.message || MESSAGES.ERROR.AUTH_FAILED, 'error');
            }
        } catch (error) {
            Helpers.handleError(error, 'login');
        } finally {
            Helpers.setFormLoading(form, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validaciones
        if (!name || !email || !password || !confirmPassword) {
            Helpers.showNotification(MESSAGES.ERROR.REQUIRED_FIELD, 'error');
            return;
        }

        if (!Helpers.isValidEmail(email)) {
            Helpers.showNotification(MESSAGES.ERROR.INVALID_EMAIL, 'error');
            return;
        }

        if (!Helpers.isValidPassword(password)) {
            Helpers.showNotification(MESSAGES.ERROR.PASSWORD_TOO_SHORT, 'error');
            return;
        }

        if (!Helpers.passwordsMatch(password, confirmPassword)) {
            Helpers.showNotification(MESSAGES.ERROR.PASSWORD_MISMATCH, 'error');
            return;
        }

        Helpers.setFormLoading(form, true);

        try {
            const result = await apiClient.register({
                name,
                email,
                password
            });
            
            if (result.success) {
                Helpers.showNotification(MESSAGES.SUCCESS.REGISTER_SUCCESS, 'success');
                form.reset();
                window.cyclops.app.getModule('ui').closeModal();
                
                // Auto-login después del registro
                setTimeout(() => {
                    window.cyclops.app.getModule('ui').openModal('loginModal');
                }, 1500);
            } else {
                Helpers.showNotification(result.message || MESSAGES.ERROR.AUTH_FAILED, 'error');
            }
        } catch (error) {
            Helpers.handleError(error, 'register');
        } finally {
            Helpers.setFormLoading(form, false);
        }
    }

    async handleLogout() {
        try {
            await apiClient.logout();
        } catch (error) {
            console.warn('Error durante logout:', error);
        } finally {
            this.performLogout();
        }
    }

    performLogout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Limpiar localStorage
        Helpers.removeStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        Helpers.removeStorage(CONFIG.STORAGE_KEYS.USER_DATA);
        
        Helpers.showNotification(MESSAGES.SUCCESS.LOGOUT_SUCCESS, 'success');
        this.updateUI();
        
        // Recargar la página para limpiar el estado
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    updateUI() {
        const authElements = document.querySelectorAll('[data-auth-state]');
        const userElements = document.querySelectorAll('[data-user-info]');
        
        authElements.forEach(element => {
            const state = element.dataset.authState;
            if (state === 'authenticated') {
                element.style.display = this.isAuthenticated ? 'flex' : 'none';
            } else if (state === 'anonymous') {
                element.style.display = this.isAuthenticated ? 'none' : 'flex';
            }
        });

        userElements.forEach(element => {
            const infoType = element.dataset.userInfo;
            if (this.currentUser && this.currentUser[infoType]) {
                element.textContent = this.currentUser[infoType];
            }
        });

        // Actualizar navegación basada en autenticación
        this.updateNavigation();
    }

    updateNavigation() {
        // Aquí puedes agregar lógica para mostrar/ocultar
        // elementos de navegación basados en la autenticación
        // y roles del usuario
    }

    setupInactivityTimer() {
        let inactivityTime;
        
        const resetTimer = () => {
            clearTimeout(inactivityTime);
            if (this.isAuthenticated) {
                inactivityTime = setTimeout(() => {
                    this.handleInactivity();
                }, 30 * 60 * 1000); // 30 minutos
            }
        };

        // Eventos que resetearán el timer
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetTimer, false);
        });

        resetTimer();
    }

    handleInactivity() {
        if (this.isAuthenticated) {
            window.cyclops.app.getModule('ui').createConfirmModal(
                'Sesión por expirar',
                'Tu sesión está a punto de expirar por inactividad. ¿Deseas continuar?',
                () => {
                    // Extender sesión
                    this.resetInactivityTimer();
                },
                () => {
                    // Cerrar sesión
                    this.handleLogout();
                }
            );
        }
    }

    resetInactivityTimer() {
        this.setupInactivityTimer();
    }

    // ===== GETTERS Y UTILIDADES =====
    
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    hasRole(role) {
        return this.isAuthenticated && 
               this.currentUser && 
               this.currentUser.role === role;
    }

    getAuthToken() {
        return Helpers.getStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }

    // ===== MÉTODOS PARA OTROS MÓDULOS =====
    
    requireAuth(callback) {
        if (!this.isAuthenticated) {
            window.cyclops.app.getModule('ui').openModal('loginModal');
            return false;
        }
        
        if (callback) {
            callback();
        }
        
        return true;
    }

    async refreshToken() {
        try {
            const result = await apiClient.post(CONFIG.ENDPOINTS.AUTH.REFRESH);
            if (result.success && result.data) {
                Helpers.setStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN, result.data.token);
                return true;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
        
        return false;
    }
}