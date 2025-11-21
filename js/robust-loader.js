// js/robust-loader.js - Cargador robusto con diagnóstico
console.log('🚀 INICIANDO CARGA ROBUSTA');

class RobustLoader {
    constructor() {
        this.loadedModules = new Set();
        this.failedModules = new Set();
        this.moduleDependencies = new Map();
    }

    // Definir dependencias entre módulos
    setupDependencies() {
        this.moduleDependencies.set('Helpers', []);
        this.moduleDependencies.set('UIModule', ['Helpers']);
        this.moduleDependencies.set('AuthModule', ['Helpers']);
        this.moduleDependencies.set('FormsModule', ['Helpers', 'AuthModule']);
        this.moduleDependencies.set('TicketsModule', ['Helpers']);
        this.moduleDependencies.set('AgendaModule', ['Helpers']);
        this.moduleDependencies.set('CyclopsApp', ['Helpers', 'UIModule', 'AuthModule', 'FormsModule', 'TicketsModule', 'AgendaModule']);
    }

    // Verificar si un módulo puede cargarse (dependencias satisfechas)
    canLoadModule(moduleName) {
        const dependencies = this.moduleDependencies.get(moduleName) || [];
        return dependencies.every(dep => this.loadedModules.has(dep));
    }

    // Cargar un módulo individual
    loadModule(modulePath, moduleName) {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            if (this.loadedModules.has(moduleName)) {
                console.log(`✅ ${moduleName} ya estaba cargado`);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = modulePath;
            
            script.onload = () => {
                // Verificar que el módulo se registró globalmente
                setTimeout(() => {
                    if (this.isModuleAvailable(moduleName)) {
                        this.loadedModules.add(moduleName);
                        console.log(`✅ ${moduleName} cargado correctamente`);
                        resolve();
                    } else {
                        const error = `${moduleName} no se registró globalmente`;
                        console.error(`❌ ${error}`);
                        this.failedModules.add(moduleName);
                        reject(new Error(error));
                    }
                }, 100);
            };

            script.onerror = (error) => {
                const errorMsg = `Error cargando ${modulePath}`;
                console.error(`❌ ${errorMsg}`);
                this.failedModules.add(moduleName);
                reject(new Error(errorMsg));
            };

            document.head.appendChild(script);
        });
    }

    // Verificar si un módulo está disponible globalmente
    isModuleAvailable(moduleName) {
        const globalNames = {
            'Helpers': 'Helpers',
            'UIModule': 'UIModule',
            'AuthModule': 'AuthModule',
            'FormsModule': 'FormsModule',
            'TicketsModule': 'TicketsModule',
            'AgendaModule': 'AgendaModule'
        };

        return typeof window[globalNames[moduleName]] !== 'undefined';
    }

    // Cargar todos los módulos en orden correcto
    async loadAllModules() {
        this.setupDependencies();

        const modules = [
            { path: 'js/utils/helpers.js', name: 'Helpers' },
            { path: 'js/modules/ui.js', name: 'UIModule' },
            { path: 'js/modules/auth.js', name: 'AuthModule' },
            { path: 'js/modules/forms.js', name: 'FormsModule' },
            { path: 'js/modules/tickets.js', name: 'TicketsModule' },
            { path: 'js/modules/agenda.js', name: 'AgendaModule' }
        ];

        console.log('📦 Iniciando carga de módulos...');

        for (const module of modules) {
            if (!this.canLoadModule(module.name)) {
                const missingDeps = this.moduleDependencies.get(module.name)
                    .filter(dep => !this.loadedModules.has(dep));
                console.warn(`⏳ ${module.name} esperando dependencias: ${missingDeps.join(', ')}`);
                
                // Reintentar después
                await this.delay(500);
                continue;
            }

            try {
                await this.loadModule(module.path, module.name);
            } catch (error) {
                console.error(`💥 Error crítico en ${module.name}:`, error);
                // Continuar con otros módulos
            }

            await this.delay(100); // Pequeña pausa entre módulos
        }

        this.reportStatus();
        
        // Cargar main.js si todos los módulos están listos
        if (this.canLoadModule('CyclopsApp')) {
            await this.loadMainApp();
        } else {
            console.error('❌ No se puede cargar la aplicación - módulos faltantes');
            this.showErrorPage();
        }
    }

    async loadMainApp() {
        try {
            await this.loadModule('js/main.js', 'CyclopsApp');
            console.log('🎉 Aplicación cargada correctamente');
            
            // Inicializar la aplicación
            if (typeof window.CyclopsApp !== 'undefined') {
                window.CyclopsAppInstance = new window.CyclopsApp();
                window.CyclopsAppInstance.init();
            }
        } catch (error) {
            console.error('💥 Error cargando main.js:', error);
            this.showErrorPage();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reportStatus() {
        console.log('📊 REPORTE FINAL:');
        console.log(`✅ Módulos cargados: ${Array.from(this.loadedModules).join(', ')}`);
        console.log(`❌ Módulos fallidos: ${Array.from(this.failedModules).join(', ')}`);
        
        if (this.failedModules.size > 0) {
            console.error('🚨 ALGUNOS MÓDULOS FALLARON');
        }
    }

    showErrorPage() {
        const errorHtml = `
            <div style="padding: 2rem; text-align: center; background: #f8f9fa; border-radius: 8px; margin: 2rem;">
                <h2 style="color: #dc3545;">Error de Carga</h2>
                <p>Algunos módulos no pudieron cargarse correctamente.</p>
                <div style="margin: 1rem 0;">
                    <strong>Módulos cargados:</strong> ${Array.from(this.loadedModules).join(', ') || 'Ninguno'}<br>
                    <strong>Módulos fallidos:</strong> ${Array.from(this.failedModules).join(', ') || 'Ninguno'}
                </div>
                <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 10px;">
                    Reintentar
                </button>
                <button onclick="new DiagnosticTool().runFullDiagnosis()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 10px;">
                    Ver Diagnóstico
                </button>
            </div>
        `;
        document.body.innerHTML = errorHtml;
    }
}

// Inicializar carga cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const loader = new RobustLoader();
    loader.loadAllModules().catch(error => {
        console.error('💥 Error fatal en el cargador:', error);
    });
});

console.log('🔧 RobustLoader inicializado');
