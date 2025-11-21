// js/main.js - VERSIÓN CORREGIDA (NO MODULAR)
console.log('🚀 Iniciando Soporte Cyclops Oficial v1.0.0...');

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Inicializar la aplicación
        window.CyclopsApp = new CyclopsApp();
        window.CyclopsApp.init();
    } catch (error) {
        console.error('❌ Error crítico al inicializar la aplicación:', error);
        showFatalError(error);
    }
});

// Función global para mostrar errores fatales
function showFatalError(error) {
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

// Clase principal de la aplicación
class CyclopsApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.version = '1.0.0';
    }

    init() {
        try {
            if (this.isInitialized) {
                console.warn('CyclopsApp ya está inicializado');
                return;
            }

            console.log('🚀 Inicializando Soporte Cyclops v' + this.version);
            
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

    initializeModules() {
        try {
            console.log('📦 Inicializando módulos...');

            // 1. Helpers primero (dependencia base)
            this.modules.helpers = new Helpers();
            console.log('✅ Helpers inicializado');

            // 2. UI Module (depende de Helpers)
            this.modules.ui = new UIModule();
            this.modules.ui.init();
            console.log('✅ UI Module inicializado');

            // 3. Auth Module
            this.modules.auth = new AuthModule();
            this.modules.auth.init();
            console.log('✅ Auth Module inicializado');

            // 4. Forms Module
            this.modules.forms = new FormsModule();
            this.modules.forms.init();
            console.log('✅ Forms Module inicializado');

            // 5. Módulos específicos
            this.modules.tickets = new TicketsModule();
            this.modules.tickets.init();
            console.log('✅ Tickets Module inicializado');

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
