// Importaciones de módulos
import { UIModule } from './modules/ui.js';
import { AuthModule } from './modules/auth.js';
import { FormsModule } from './modules/forms.js';
import { TicketsModule } from './modules/tickets.js';
import { AgendaModule } from './modules/agenda.js';
import { CONFIG } from './utils/constants.js';

// Aplicación principal de Cyclops
class CyclopsApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.init();
    }

    init() {
        console.log(`🚀 Iniciando ${CONFIG.APP_NAME} v${CONFIG.VERSION}...`);
        
        try {
            // Inicializar módulos en orden específico
            this.initializeModules();
            
            // Configuración global
            window.cyclops = {
                app: this,
                config: CONFIG,
                version: CONFIG.VERSION,
                utils: {
                    helpers: window.Helpers,
                    api: window.apiClient
                }
            };

            this.isInitialized = true;
            
            // Evento personalizado para indicar que la app está lista
            document.dispatchEvent(new CustomEvent('cyclops:ready'));
            
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error crítico inicializando la aplicación:', error);
            this.handleInitError(error);
        }
    }

    initializeModules() {
        // Orden de inicialización importante
        // 1. UI Module primero (maneja DOM y eventos básicos)
        this.modules.ui = new UIModule();
        
        // 2. Auth Module (maneja autenticación y sesiones)
        this.modules.auth = new AuthModule();
        
        // 3. Forms Module (maneja formularios y validaciones)
        this.modules.forms = new FormsModule();
        
        // 4. Tickets Module (gestión de tickets de soporte)
        this.modules.tickets = new TicketsModule();
        
        // 5. Agenda Module (calendario y eventos)
        this.modules.agenda = new AgendaModule();
    }

    handleInitError(error) {
        // Mostrar error al usuario de manera amigable
        const errorHtml = `
            <div class="error-boundary">
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Error al cargar la aplicación</h2>
                    <p>Ha ocurrido un error al inicializar Soporte Cyclops. Por favor, recarga la página.</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        Recargar Página
                    </button>
                    <details class="error-details">
                        <summary>Detalles técnicos</summary>
                        <pre>${error.stack}</pre>
                    </details>
                </div>
            </div>
        `;

        document.body.innerHTML = errorHtml;
    }

    // Método para obtener módulos
    getModule(moduleName) {
        if (!this.modules[moduleName]) {
            console.warn(`Módulo no encontrado: ${moduleName}`);
            return null;
        }
        return this.modules[moduleName];
    }

    // Método para verificar si un módulo está disponible
    hasModule(moduleName) {
        return !!this.modules[moduleName];
    }

    // Método para reiniciar la aplicación
    restart() {
        console.log('🔄 Reiniciando aplicación...');
        
        // Limpiar módulos
        this.modules = {};
        this.isInitialized = false;
        
        // Reinicializar
        setTimeout(() => this.init(), 100);
    }

    // Método para obtener estado de la aplicación
    getStatus() {
        return {
            initialized: this.isInitialized,
            modules: Object.keys(this.modules),
            config: CONFIG
        };
    }

    // Método para manejar errores globales
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Error global:', event.error);
            this.handleGlobalError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rechazada no manejada:', event.reason);
            this.handleGlobalError(event.reason);
        });
    }

    handleGlobalError(error) {
        // En producción, podrías enviar esto a un servicio de monitoreo
        console.error('Error global manejado:', error);
        
        // Mostrar notificación al usuario solo si no es un error crítico
        if (!this.isCriticalError(error)) {
            window.Helpers.showNotification(
                'Ha ocurrido un error inesperado. Si el problema persiste, contacta al soporte.',
                'error'
            );
        }
    }

    isCriticalError(error) {
        // Definir qué errores consideramos críticos
        const criticalErrors = [
            'NetworkError',
            'TypeError',
            'ReferenceError'
        ];
        
        return criticalErrors.some(criticalError => 
            error.name === criticalError || error.message.includes(criticalError)
        );
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CyclopsApp();
    });
} else {
    new CyclopsApp();
}

// Configurar manejo de errores globales
window.addEventListener('load', () => {
    if (window.cyclops && window.cyclops.app) {
        window.cyclops.app.setupErrorHandling();
    }
});

// Exportar para uso global si es necesario
window.CyclopsApp = CyclopsApp;

// Hacer disponibles utilidades globalmente para debugging
window.Helpers = Helpers;
window.apiClient = apiClient;