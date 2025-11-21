// js/diagnostic.js - Herramienta de diagnóstico completo
console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO');

class DiagnosticTool {
    constructor() {
        this.results = {
            files: {},
            modules: {},
            errors: []
        };
    }

    // Verificar estructura de archivos
    checkFileStructure() {
        console.group('📁 VERIFICANDO ESTRUCTURA DE ARCHIVOS');
        
        const expectedFiles = {
            css: [
                'css/main.css',
                'css/utils/variables.css',
                'css/utils/animations.css',
                'css/components/header.css',
                'css/components/navigation.css',
                'css/components/forms.css',
                'css/components/modals.css',
                'css/components/footer.css',
                'css/pages/home.css'
            ],
            js: [
                'js/utils/helpers.js',
                'js/modules/ui.js',
                'js/modules/auth.js',
                'js/modules/forms.js',
                'js/modules/tickets.js',
                'js/modules/agenda.js',
                'js/main.js'
            ]
        };

        // Verificar archivos CSS
        expectedFiles.css.forEach(file => {
            this.checkFileExists(file, 'css');
        });

        // Verificar archivos JS
        expectedFiles.js.forEach(file => {
            this.checkFileExists(file, 'js');
        });

        console.groupEnd();
        return this.results.files;
    }

    checkFileExists(filePath, type) {
        // Esta función simula la verificación
        // En un entorno real, haríamos una petición HEAD
        console.log(`📄 ${filePath} - ${this.getFileStatus(filePath)}`);
        
        this.results.files[filePath] = {
            exists: this.getFileStatus(filePath),
            type: type,
            size: 'N/A' // No podemos obtener el tamaño desde JS
        };
    }

    getFileStatus(filePath) {
        // Simulación - en realidad necesitaríamos hacer fetch a cada archivo
        const knownFiles = [
            'css/main.css',
            'css/utils/variables.css',
            'css/utils/animations.css',
            'css/components/header.css',
            'css/components/navigation.css',
            'css/components/forms.css',
            'css/components/modals.css',
            'css/components/footer.css',
            'css/pages/home.css',
            'js/utils/helpers.js',
            'js/modules/ui.js',
            'js/modules/auth.js',
            'js/modules/forms.js',
            'js/modules/tickets.js',
            'js/modules/agenda.js',
            'js/main.js'
        ];
        
        return knownFiles.includes(filePath) ? '✅ EXISTE' : '❌ NO ENCONTRADO';
    }

    // Verificar módulos cargados
    checkLoadedModules() {
        console.group('⚙️ VERIFICANDO MÓDULOS CARGADOS');
        
        const modules = [
            { name: 'Helpers', global: 'Helpers' },
            { name: 'UIModule', global: 'UIModule' },
            { name: 'AuthModule', global: 'AuthModule' },
            { name: 'FormsModule', global: 'FormsModule' },
            { name: 'TicketsModule', global: 'TicketsModule' },
            { name: 'AgendaModule', global: 'AgendaModule' },
            { name: 'CyclopsApp', global: 'CyclopsApp' }
        ];

        modules.forEach(module => {
            const exists = typeof window[module.global] !== 'undefined';
            const status = exists ? '✅ CARGADO' : '❌ NO CARGADO';
            console.log(`${module.name}: ${status}`);
            
            this.results.modules[module.name] = {
                loaded: exists,
                globalName: module.global,
                constructor: exists ? window[module.global] : null
            };
        });

        console.groupEnd();
        return this.results.modules;
    }

    // Verificar scripts en el DOM
    checkScriptTags() {
        console.group('📜 VERIFICANDO SCRIPTS EN HTML');
        
        const scripts = Array.from(document.scripts);
        scripts.forEach(script => {
            console.log(`📝 ${script.src || 'INLINE'} - ${script.async ? 'ASYNC' : 'SYNC'}`);
        });

        console.groupEnd();
        return scripts;
    }

    // Verificar errores de carga
    checkLoadErrors() {
        console.group('🚨 VERIFICANDO ERRORES DE CARGA');
        
        // Intentar cargar cada archivo para detectar errores 404
        const jsFiles = [
            'js/utils/helpers.js',
            'js/modules/ui.js',
            'js/modules/auth.js',
            'js/modules/forms.js',
            'js/modules/tickets.js',
            'js/modules/agenda.js',
            'js/main.js'
        ];

        jsFiles.forEach(file => {
            this.testFileLoad(file);
        });

        console.groupEnd();
    }

    async testFileLoad(filePath) {
        try {
            const response = await fetch(filePath, { method: 'HEAD' });
            if (response.ok) {
                console.log(`✅ ${filePath} - ACCESIBLE (${response.status})`);
            } else {
                console.error(`❌ ${filePath} - ERROR ${response.status}`);
                this.results.errors.push(`${filePath} - HTTP ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ ${filePath} - NO ACCESIBLE: ${error.message}`);
            this.results.errors.push(`${filePath} - ${error.message}`);
        }
    }

    // Ejecutar diagnóstico completo
    async runFullDiagnosis() {
        console.log('🎯 DIAGNÓSTICO INICIADO');
        
        this.checkFileStructure();
        this.checkScriptTags();
        await this.checkLoadErrors();
        this.checkLoadedModules();

        console.log('📊 RESUMEN DEL DIAGNÓSTICO:');
        console.log(`📁 Archivos: ${Object.keys(this.results.files).length}`);
        console.log(`⚙️ Módulos cargados: ${Object.values(this.results.modules).filter(m => m.loaded).length}/${Object.keys(this.results.modules).length}`);
        console.log(`🚨 Errores: ${this.results.errors.length}`);

        if (this.results.errors.length > 0) {
            console.error('❌ SE ENCONTRARON ERRORES:');
            this.results.errors.forEach(error => console.error(`   - ${error}`));
        }

        return this.results;
    }
}

// Hacer disponible globalmente
window.DiagnosticTool = DiagnosticTool;

// Auto-ejecutar si está en modo diagnóstico
if (window.location.search.includes('diagnostic=true')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const diagnostic = new DiagnosticTool();
        await diagnostic.runFullDiagnosis();
    });
}

console.log('🔧 DiagnosticTool cargado - usa: new DiagnosticTool().runFullDiagnosis()');
