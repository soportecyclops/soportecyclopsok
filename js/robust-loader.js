// Robust Loader - Carga módulos de forma segura
class RobustLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        console.log('🔄 RobustLoader inicializado');
    }

    async loadModule(moduleName, modulePath) {
        // Si ya está cargando, retornar esa promesa
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        // Si ya está cargado, retornar inmediatamente
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        console.log(`📦 Cargando módulo: ${moduleName}`);

        const loadPromise = new Promise(async (resolve, reject) => {
            try {
                await this.loadScript(modulePath);
                
                // Esperar un tick para que el módulo se registre
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Verificar que el módulo se registró globalmente
                if (this.verifyModule(moduleName)) {
                    this.loadedModules.set(moduleName, true);
                    console.log(`✅ ${moduleName} cargado correctamente`);
                    resolve(true);
                } else {
                    throw new Error(`Módulo ${moduleName} no se registró globalmente`);
                }
            } catch (error) {
                console.error(`❌ Error cargando ${moduleName}:`, error);
                this.loadedModules.set(moduleName, false);
                reject(error);
            } finally {
                this.loadingPromises.delete(moduleName);
            }
        });

        this.loadingPromises.set(moduleName, loadPromise);
        return loadPromise;
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Verificar si el script ya existe
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`📜 Script ${src} ya estaba cargado`);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`📜 Script ${src} cargado`);
                resolve();
            };
            script.onerror = () => {
                console.error(`❌ Error cargando script: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };
            document.head.appendChild(script);
        });
    }

    verifyModule(moduleName) {
        const globalNames = {
            'Helpers': 'Helpers',
            'UI': 'UI', 
            'Auth': 'Auth',
            'Forms': 'Forms',
            'Tickets': 'Tickets',
            'Agenda': 'Agenda',
            'Projects': 'Projects'
        };

        const globalName = globalNames[moduleName];
        return globalName && window[globalName] !== undefined;
    }

    async loadAllModules() {
        const modules = [
            { name: 'Helpers', path: 'js/utils/helpers.js' },
            { name: 'UI', path: 'js/modules/ui.js' },
            { name: 'Auth', path: 'js/modules/auth.js' },
            { name: 'Forms', path: 'js/modules/forms.js' },
            { name: 'Tickets', path: 'js/modules/tickets.js' },
            { name: 'Agenda', path: 'js/modules/agenda.js' },
            { name: 'Projects', path: 'js/modules/projects.js' }
        ];

        console.log('🚀 Iniciando carga de todos los módulos...');

        // Cargar módulos en serie para evitar dependencias
        for (const module of modules) {
            try {
                await this.loadModule(module.name, module.path);
            } catch (error) {
                console.warn(`⚠️ No se pudo cargar ${module.name}, continuando...`);
            }
        }

        this.reportStatus();
        return this.areAllModulesLoaded();
    }

    areAllModulesLoaded() {
        const required = ['Helpers', 'UI', 'Auth', 'Forms', 'Projects'];
        return required.every(module => this.loadedModules.get(module));
    }

    reportStatus() {
        console.group('📊 Estado de Módulos');
        this.loadedModules.forEach((loaded, module) => {
            console.log(`${loaded ? '✅' : '❌'} ${module}`);
        });
        console.groupEnd();
    }

    getModuleStatus() {
        return Object.fromEntries(this.loadedModules);
    }
}

// Inicializar loader global
window.moduleLoader = new RobustLoader();

// Carga automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOM listo, iniciando carga de módulos...');
    
    try {
        await window.moduleLoader.loadAllModules();
        
        // Inicializar la aplicación principal
        if (typeof window.MainApp !== 'undefined') {
            const app = new window.MainApp();
            await app.initialize();
        } else {
            console.warn('⚠️ MainApp no disponible, iniciando UI básica');
            // Inicializar UI básica si MainApp no está disponible
            if (typeof window.UI !== 'undefined') {
                window.UI.init();
            }
        }
        
    } catch (error) {
        console.error('💥 Error crítico durante la carga:', error);
        // Mostrar interfaz de error al usuario
        showErrorToUser();
    }
});

function showErrorToUser() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
                <h1 style="color: #ef4444;">⚠️ Error de Carga</h1>
                <p>Estamos experimentando problemas técnicos. Por favor, recarga la página.</p>
                <button onclick="window.location.reload()" style="
                    background: #2563eb; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 8px; 
                    cursor: pointer;
                    margin-top: 1rem;
                ">Reintentar</button>
            </div>
        `;
    }
}
