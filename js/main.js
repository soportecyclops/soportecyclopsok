// js/main.js - VERSIÓN CORREGIDA
import Helpers from './modules/helpers.js';
import UIModule from './modules/ui.js';
import AuthModule from './modules/auth.js';
import FormsModule from './modules/forms.js';
import TicketsModule from './modules/tickets.js';
import AgendaModule from './modules/agenda.js';

class CyclopsApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    async init() {
        try {
            if (this.isInitialized) {
                console.warn('CyclopsApp ya está inicializado');
                return;
            }

            // Inicializar módulos en orden correcto
            await this.initializeModules();
            
            this.setupGlobalErrorHandling();
            this.setupServiceWorker();
            
            this.isInitialized = true;
            console.log('✅ Soporte Cyclops inicializado correctamente');

        } catch (error) {
            console.error('❌ Error crítico al inicializar la aplicación:', error);
            this.showFatalError(error);
        }
    }

    initializeModules() {
        try {
            // 1. Helpers primero (dependencia base)
            this.modules.helpers = Helpers;
            console.log('✅ Helpers inicializado');

            // 2. UI Module (depende de Helpers)
            this.modules.ui = new UIModule();
            this.modules.ui.init();
            console.log('✅ UI Module inicializado');

            // 3. Auth Module
            this.modules.auth = new AuthModule();
            this.modules.auth.init();
            console.log('✅ Auth Module inicializado');

            // 4. Forms Module (depende de Helpers y Auth)
            this.modules.forms = new FormsModule();
            this.modules.forms.init();
            console.log('✅ Forms Module inicializado');

            // 5. Módulos específicos de funcionalidad
            this.modules.tickets = new TicketsModule();
            this.modules.tickets.init();
            console.log('✅ Tickets Module inicializado');

            this.modules.agenda = new AgendaModule();
            this.modules.agenda.init();
            console.log('✅ Agenda Module inicializado');

        } catch (error) {
            console.error('Error al inicializar módulos:', error);
            throw error;
        }
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Error global capturado:', event.error);
            this.modules.helpers.showNotification('Ha ocurrido un error inesperado', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rechazada:', event.reason);
            event.preventDefault();
        });
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registrado correctamente');
            } catch (error) {
                console.warn('ServiceWorker no registrado:', error);
            }
        }
    }

    showFatalError(error) {
        // Mostrar interfaz de error al usuario
        const errorHtml = `
            <div class="error-container" style="padding: 2rem; text-align: center; background: #f8f9fa; border-radius: 8px; margin: 2rem;">
                <h2 style="color: #dc3545;">Error al cargar la aplicación</h2>
                <p>Ha ocurrido un error al inicializar Soporte Cyclops. Por favor, recarga la página.</p>
                <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                    Recargar Página
                </button>
                <details style="margin-top: 1rem; text-align: left;">
                    <summary>Detalles técnicos</summary>
                    <pre style="background: #fff; padding: 1rem; border-radius: 4px; overflow: auto;">${error.stack}</pre>
                </details>
            </div>
        `;
        
        document.body.innerHTML = errorHtml;
    }

    getModule(name) {
        return this.modules[name];
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    window.CyclopsApp = new CyclopsApp();
    await window.CyclopsApp.init();
});

// Export para uso en otros módulos si es necesario
export default CyclopsApp;
