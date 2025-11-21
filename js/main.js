// js/main.js - VERSIÓN MEJORADA Y CORREGIDA
console.log('🚀 Iniciando Soporte Cyclops Oficial v1.0.0...');

// Función global para mostrar errores fatales
function showFatalError(error) {
    console.error('❌ Error fatal:', error);
    const errorHtml = `
        <div class="error-container" style="padding: 2rem; text-align: center; background: #f8f9fa; border-radius: 8px; margin: 2rem;">
            <h2 style="color: #dc3545;">Error al cargar la aplicación</h2>
            <p>Ha ocurrido un error al inicializar Soporte Cyclops. Por favor, recarga la página.</p>
            <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 10px;">
                Recargar Página
            </button>
            <details style="margin-top: 1rem; text-align: left;">
                <summary>Detalles técnicos</summary>
                <pre style="background: #fff; padding: 1rem; border-radius: 4px; overflow: auto;">${error.stack}</pre>
            </details>
        </div>
    `;
    
    // Reemplazar el contenido del body
    document.body.innerHTML = errorHtml;
}

// Verificar que todos los módulos estén cargados
function checkModulesLoaded() {
    const requiredModules = [
        'Helpers',
        'UIModule', 
        'AuthModule',
        'FormsModule',
        'TicketsModule',
        'AgendaModule'
    ];

    const missing = [];
    requiredModules.forEach(module => {
        if (typeof window[module] === 'undefined') {
            missing.push(module);
        }
    });

    if (missing.length > 0) {
        throw new Error(`Módulos no cargados: ${missing.join(', ')}`);
    }

    return true;
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('📄 DOM cargado, verificando módulos...');
        
        // Verificar que todos los módulos estén disponibles
        checkModulesLoaded();
        
        console.log('✅ Todos los módulos cargados, inicializando aplicación...');
        
        // Inicializar la aplicación
        window.CyclopsApp = new CyclopsApp();
        window.CyclopsApp.init();
        
    } catch (error) {
        console.error('❌ Error crítico al inicializar la aplicación:', error);
        showFatalError(error);
    }
});

// Clase principal de la aplicación
class CyclopsApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.version = '1.0.0';
        this.currentUser = null;
        console.log('🏗️ CyclopsApp construido');
    }

    init() {
        try {
            if (this.isInitialized) {
                console.warn('CyclopsApp ya está inicializado');
                return;
            }

            console.log('🚀 Inicializando Soporte Cyclops v' + this.version);
            
            // Ocultar loading screen INMEDIATAMENTE
            this.hideLoadingScreen();
            
            // Configurar botones y funcionalidades
            this.setupGlobalFunctionality();
            
            // Inicializar módulos en orden correcto
            this.initializeModules();
            
            this.setupGlobalErrorHandling();
            
            this.isInitialized = true;
            console.log('✅ Soporte Cyclops inicializado correctamente');

        } catch (error) {
            console.error('❌ Error crítico al inicializar la aplicación:', error);
            showFatalError(error);
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            // Quitar inmediatamente sin animación molesta
            loadingScreen.style.display = 'none';
        }
    }

    setupGlobalFunctionality() {
        console.log('🔧 Configurando funcionalidades globales...');
        
        // Configurar botón de login
        this.setupLoginButton();
        
        // Configurar botones de contacto
        this.setupContactButtons();
        
        // Configurar botones de servicios
        this.setupServiceButtons();
        
        // Configurar formulario de contacto
        this.setupContactForm();
    }

    setupLoginButton() {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
            console.log('✅ Botón de login configurado');
        }
    }

    setupContactButtons() {
        // Botón "Solicitar Soporte" en hero
        const contactBtn = document.querySelector('.contact-btn');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                this.showContactModal();
            });
        }
        
        // Botón "Contáctanos" en about
        const aboutContactBtn = document.querySelector('.about-contact-btn');
        if (aboutContactBtn) {
            aboutContactBtn.addEventListener('click', () => {
                this.showContactModal();
            });
        }
    }

    setupServiceButtons() {
        // Botones de servicios
        const serviceBtns = document.querySelectorAll('.service-btn');
        serviceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const service = btn.dataset.service;
                this.showServiceInfo(service);
            });
        });
        
        // Botón "Nuestros Servicios" en hero
        const servicesBtn = document.querySelector('.services-btn');
        if (servicesBtn) {
            servicesBtn.addEventListener('click', () => {
                document.getElementById('servicios').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm && this.modules.forms) {
            // El forms module ya maneja el envío, pero podemos añadir lógica adicional
            contactForm.addEventListener('submit', (e) => {
                // Lógica adicional si es necesaria
                console.log('📧 Formulario de contacto enviado');
            });
        }
    }

    showLoginModal() {
        // Crear modal de login dinámicamente
        const modalHtml = `
            <div id="loginModal" class="modal">
                <div class="modal-content modal-small">
                    <div class="modal-header">
                        <h3 class="modal-title">Iniciar Sesión</h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="loginForm" class="login-form">
                            <div class="form-group">
                                <label for="loginEmail">Email</label>
                                <input type="email" id="loginEmail" name="email" placeholder="tu@email.com" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Contraseña</label>
                                <input type="password" id="loginPassword" name="password" placeholder="••••••••" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-full">
                                <i class="fas fa-sign-in-alt"></i>
                                Ingresar
                            </button>
                        </form>
                        <div style="text-align: center; margin-top: var(--space-lg);">
                            <p style="color: var(--gray-600); font-size: 0.9rem;">
                                ¿No tienes cuenta? <a href="#" style="color: var(--primary-blue);">Regístrate aquí</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir modal al contenedor
        const modalsContainer = document.getElementById('modalsContainer') || document.body;
        modalsContainer.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar modal
        if (this.modules.ui) {
            this.modules.ui.showModal('loginModal');
        }
        
        // Configurar formulario
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }
        
        // Configurar cierre del modal
        const closeBtn = document.querySelector('#loginModal .close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (this.modules.ui) {
                    this.modules.ui.hideModal('loginModal');
                }
            });
        }
    }

    showContactModal() {
        // Simplemente hacer scroll a la sección de contacto
        document.getElementById('contacto').scrollIntoView({ 
            behavior: 'smooth' 
        });
        
        // Opcional: mostrar notificación
        if (this.modules.helpers) {
            this.modules.helpers.showNotification('Completa el formulario de contacto', 'info');
        }
    }

    showServiceInfo(service) {
        const serviceNames = {
            'soporte': 'Soporte Técnico 24/7',
            'infraestructura': 'Infraestructura IT',
            'desarrollo': 'Desarrollo de Software',
            'ciberseguridad': 'Ciberseguridad',
            'cloud': 'Cloud & Hosting',
            'bases-datos': 'Base de Datos'
        };
        
        const serviceName = serviceNames[service] || 'Servicio';
        
        if (this.modules.helpers) {
            this.modules.helpers.showNotification(`Interesado en: ${serviceName}`, 'info');
        }
        
        // Hacer scroll al formulario de contacto
        setTimeout(() => {
            document.getElementById('contacto').scrollIntoView({ 
                behavior: 'smooth' 
            });
            
            // Seleccionar el servicio en el formulario
            const serviceSelect = document.getElementById('contactService');
            if (serviceSelect) {
                serviceSelect.value = service;
            }
        }, 1000);
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        
        try {
            // Mostrar loading
            let loading;
            if (this.modules.ui) {
                loading = this.modules.ui.showLoading(form);
            }
            
            // Simular proceso de login
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Ocultar loading
            if (this.modules.ui && loading) {
                this.modules.ui.hideLoading(loading);
            }
            
            // Mostrar notificación de éxito
            if (this.modules.helpers) {
                this.modules.helpers.showNotification('¡Login exitoso! Bienvenido', 'success');
            }
            
            // Cerrar modal
            if (this.modules.ui) {
                this.modules.ui.hideModal('loginModal');
            }
            
            // Actualizar UI para usuario logueado
            this.updateUIForLoggedInUser(email);
            
        } catch (error) {
            // Ocultar loading
            if (this.modules.ui && loading) {
                this.modules.ui.hideLoading(loading);
            }
            
            // Mostrar error
            if (this.modules.helpers) {
                this.modules.helpers.showNotification('Error en el login. Intenta nuevamente.', 'error');
            }
        }
    }

    updateUIForLoggedInUser(email) {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = `
                <i class="fas fa-user"></i>
                ${email.split('@')[0]}
            `;
            loginBtn.classList.add('logged-in');
            
            // Cambiar comportamiento a logout
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        this.currentUser = { email: email, name: email.split('@')[0] };
        console.log('👤 Usuario logueado:', this.currentUser);
    }

    handleLogout() {
        this.currentUser = null;
        
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = `
                <i class="fas fa-sign-in-alt"></i>
                Acceder
            `;
            loginBtn.classList.remove('logged-in');
            
            // Restaurar comportamiento original
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }
        
        if (this.modules.helpers) {
            this.modules.helpers.showNotification('Sesión cerrada correctamente', 'info');
        }
        
        console.log('👤 Usuario deslogueado');
    }

    initializeModules() {
        try {
            console.log('📦 Inicializando módulos...');

            // 1. Helpers primero (dependencia base)
            if (typeof Helpers === 'undefined') {
                throw new Error('Helpers no está definido. Verifica que helpers.js se cargó correctamente.');
            }
            this.modules.helpers = new Helpers();
            console.log('✅ Helpers inicializado');

            // 2. UI Module (depende de Helpers)
            if (typeof UIModule === 'undefined') {
                throw new Error('UIModule no está definido.');
            }
            this.modules.ui = new UIModule();
            this.modules.ui.init();
            console.log('✅ UI Module inicializado');

            // 3. Auth Module
            if (typeof AuthModule === 'undefined') {
                throw new Error('AuthModule no está definido.');
            }
            this.modules.auth = new AuthModule();
            this.modules.auth.init();
            console.log('✅ Auth Module inicializado');

            // 4. Forms Module
            if (typeof FormsModule === 'undefined') {
                throw new Error('FormsModule no está definido.');
            }
            this.modules.forms = new FormsModule();
            this.modules.forms.init();
            console.log('✅ Forms Module inicializado');

            // 5. Módulos específicos
            if (typeof TicketsModule === 'undefined') {
                throw new Error('TicketsModule no está definido.');
            }
            this.modules.tickets = new TicketsModule();
            this.modules.tickets.init();
            console.log('✅ Tickets Module inicializado');

            if (typeof AgendaModule === 'undefined') {
                throw new Error('AgendaModule no está definido.');
            }
            this.modules.agenda = new AgendaModule();
            this.modules.agenda.init();
            console.log('✅ Agenda Module inicializado');

        } catch (error) {
            console.error('❌ Error al inicializar módulos:', error);
            throw error;
        }
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Error global capturado:', event.error);
            if (this.modules.helpers) {
                this.modules.helpers.showNotification('Ha ocurrido un error inesperado', 'error');
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rechazada:', event.reason);
            event.preventDefault();
        });
    }

    getModule(name) {
        return this.modules[name];
    }
}

// Hacer disponible globalmente
window.CyclopsApp = CyclopsApp;
console.log('✅ CyclopsApp class definida y disponible');
