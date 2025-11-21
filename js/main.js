// js/main.js - VERSIÓN COMPLETAMENTE CORREGIDA
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
        console.log('🏗️ CyclopsApp construido');
    }

    init() {
        try {
            if (this.isInitialized) {
                console.warn('CyclopsApp ya está inicializado');
                return;
            }

            console.log('🚀 Inicializando Soporte Cyclops v' + this.version);
            
            // Ocultar loading screen
            this.hideLoadingScreen();
            
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
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        }
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
