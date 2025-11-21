class RobustLoader {
    constructor() {
        this.loadedModules = new Set();
        this.failedModules = new Set();
        this.moduleDependencies = new Map();
        this.initializationOrder = [];
    }

    async loadModule(moduleName, modulePath, dependencies = []) {
        try {
            console.log(`📦 Cargando módulo: ${moduleName}`);

            // Check if module is already loaded
            if (this.loadedModules.has(moduleName)) {
                console.log(`✅ Módulo ${moduleName} ya estaba cargado`);
                return true;
            }

            // Check dependencies
            for (const dep of dependencies) {
                if (!this.loadedModules.has(dep)) {
                    console.warn(`⚠️ Dependencia ${dep} no cargada para ${moduleName}`);
                    return false;
                }
            }

            // Load module script
            await this.loadScript(modulePath);

            // Verify module is available globally
            if (this.verifyModule(moduleName)) {
                this.loadedModules.add(moduleName);
                this.initializationOrder.push(moduleName);
                console.log(`✅ Módulo ${moduleName} cargado exitosamente`);
                return true;
            } else {
                throw new Error(`Módulo ${moduleName} no disponible globalmente`);
            }

        } catch (error) {
            console.error(`❌ Error cargando módulo ${moduleName}:`, error);
            this.failedModules.add(moduleName);
            this.fallbackLoad(moduleName);
            return false;
        }
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    verifyModule(moduleName) {
        // Check if module is available in global scope
        const globalModule = window[moduleName];
        if (globalModule && typeof globalModule === 'function') {
            return true;
        }

        // Additional checks for specific modules
        switch (moduleName) {
            case 'UI':
                return typeof window.UI !== 'undefined';
            case 'Auth':
                return typeof window.Auth !== 'undefined';
            case 'Forms':
                return typeof window.Forms !== 'undefined';
            case 'Tickets':
                return typeof window.Tickets !== 'undefined';
            case 'Agenda':
                return typeof window.Agenda !== 'undefined';
            case 'Projects':
                return typeof window.Projects !== 'undefined';
            default:
                return false;
        }
    }

    fallbackLoad(moduleName) {
        console.log(`🔄 Intentando carga alternativa para ${moduleName}`);
        
        // Implement fallback modules or stubs
        switch (moduleName) {
            case 'Projects':
                if (typeof window.Projects === 'undefined') {
                    window.Projects = class FallbackProjects {
                        init() { console.log('Fallback Projects initialized'); }
                        openProject() { console.log('Fallback project open'); }
                    };
                    console.log(`✅ Fallback para ${moduleName} creado`);
                }
                break;
        }
    }

    getLoadReport() {
        return {
            loaded: Array.from(this.loadedModules),
            failed: Array.from(this.failedModules),
            order: this.initializationOrder,
            allSuccessful: this.failedModules.size === 0
        };
    }

    diagnose() {
        console.group('🔍 Diagnóstico de Carga de Módulos');
        console.log('✅ Módulos cargados:', this.loadedModules);
        console.log('❌ Módulos fallidos:', this.failedModules);
        console.log('📋 Orden de inicialización:', this.initializationOrder);
        
        // Check global availability
        const requiredModules = ['UI', 'Auth', 'Forms', 'Tickets', 'Agenda', 'Projects'];
        requiredModules.forEach(module => {
            const available = this.verifyModule(module);
            console.log(`${available ? '✅' : '❌'} ${module}: ${available ? 'Disponible' : 'No disponible'}`);
        });
        
        console.groupEnd();
    }
}

// Initialize loader
window.moduleLoader = new RobustLoader();

// Auto-load critical modules
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando carga robusta de módulos...');
    
    // Define module loading sequence
    const loadSequence = [
        { name: 'Helpers', path: 'js/utils/helpers.js' },
        { name: 'UI', path: 'js/modules/ui.js' },
        { name: 'Auth', path: 'js/modules/auth.js' },
        { name: 'Forms', path: 'js/modules/forms.js' },
        { name: 'Tickets', path: 'js/modules/tickets.js' },
        { name: 'Agenda', path: 'js/modules/agenda.js' },
        { name: 'Projects', path: 'js/modules/projects.js' }
    ];

    // Load modules in sequence
    for (const module of loadSequence) {
        await window.moduleLoader.loadModule(module.name, module.path);
    }

    // Run diagnosis
    setTimeout(() => {
        window.moduleLoader.diagnose();
    }, 1000);
});
