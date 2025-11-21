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
                    // Intentar con nombre alternativo
                    if (this.tryAlternativeName(moduleName)) {
                        this.loadedModules.set(moduleName, true);
                        console.log(`✅ ${moduleName} cargado con nombre alternativo`);
                        resolve(true);
                    } else {
                        throw new Error(`Módulo ${moduleName} no se registró globalmente`);
                    }
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

    tryAlternativeName(moduleName) {
        // Mapear nombres antiguos a nuevos
        const nameMap = {
            'UIModule': 'UI',
            'AuthModule': 'Auth', 
            'FormsModule': 'Forms',
            'TicketsModule': 'Tickets',
            'AgendaModule': 'Agenda'
        };
        
        const alternativeName = nameMap[moduleName];
        return alternativeName && window[alternativeName] !== undefined;
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
            'UIModule': 'UI',
            'Auth': 'Auth',
            'AuthModule': 'Auth',
            'Forms': 'Forms', 
            'FormsModule': 'Forms',
            'Tickets': 'Tickets',
            'TicketsModule': 'Tickets',
            'Agenda': 'Agenda',
            'AgendaModule': 'Agenda',
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
            { name: 'Projects', path: 'js/modules/projects.js' },
            { name: 'Tickets', path: 'js/modules/tickets.js' },
            { name: 'Agenda', path: 'js/modules/agenda.js' }
        ];

        console.log('🚀 Iniciando carga de todos los módulos...');

        // Cargar módulos en serie para evitar dependencias
        for (const module of modules) {
            try {
                await this.loadModule(module.name, module.path);
            } catch (error) {
                console.warn(`⚠️ No se pudo cargar ${module.name}, continuando...`);
                // Crear stub si es crítico
                if (this.isCriticalModule(module.name)) {
                    this.createModuleStub(module.name);
                }
            }
        }

        this.reportStatus();
        return this.areCriticalModulesLoaded();
    }

    isCriticalModule(moduleName) {
        const critical = ['Helpers', 'UI', 'Projects'];
        return critical.includes(moduleName);
    }

    createModuleStub(moduleName) {
        console.log(`🛠️ Creando stub para ${moduleName}`);
        
        const stubs = {
            'UI': {
                init: () => console.log('UI stub initialized'),
                showModal: (modal) => modal?.classList.add('active'),
                hideModal: (modal) => modal?.classList.remove('active')
            },
            'Projects': {
                init: () => console.log('Projects stub initialized'),
                openProject: (id) => {
                    const projects = {
                        cyclobot: 'https://soportecyclops.github.io/CycloBot/',
                        original: 'https://soportecyclops.github.io/soportecyclopsoficial/'
                    };
                    if (projects[id]) window.open(projects[id], '_blank');
                }
            }
        };

        if (stubs[moduleName] && !window[moduleName]) {
            window[moduleName] = stubs[moduleName];
            this.loadedModules.set(moduleName, true);
        }
    }

    areCriticalModulesLoaded() {
        const critical = ['Helpers', 'UI', 'Projects'];
        return critical.every(module => this.loadedModules.get(module));
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
        const success = await window.moduleLoader.loadAllModules();
        
        if (success) {
            console.log('🎉 Todos los módulos críticos cargados correctamente');
            
            // Inicializar la aplicación principal
            if (typeof window.MainApp !== 'undefined') {
                setTimeout(() => {
                    window.app = new window.MainApp();
                    window.app.initialize().catch(console.error);
                }, 100);
            }
        } else {
            console.warn('⚠️ Algunos módulos fallaron, pero continuando...');
            // Inicializar aplicación básica de todos modos
            initializeBasicApp();
        }
        
    } catch (error) {
        console.error('💥 Error durante la carga:', error);
        initializeBasicApp();
    }
});

function initializeBasicApp() {
    console.log('🔄 Inicializando aplicación básica...');
    
    // Inicializar UI básica si está disponible
    if (window.UI && window.UI.init) {
        window.UI.init();
    }
    
    // Inicializar funcionalidades básicas
    initBasicFunctionality();
}

function initBasicFunctionality() {
    // Smooth scrolling básico
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Mobile menu básico
    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.main-nav');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Modal básico
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    console.log('✅ Funcionalidad básica inicializada');
}
