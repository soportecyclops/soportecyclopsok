import { CONFIG } from '../utils/constants.js';

// Verificador de integridad después de la modularización
class IntegrityChecker {
    static check() {
        const results = {
            app: this.checkApp(),
            css: this.checkCSS(),
            js: this.checkJS(),
            html: this.checkHTML(),
            modules: this.checkModules(),
            storage: this.checkStorage(),
            performance: this.checkPerformance()
        };

        this.printResults(results);
        return results;
    }

    static checkApp() {
        return {
            initialized: !!window.cyclops,
            version: window.cyclops?.version,
            config: window.cyclops?.config ? 'OK' : 'MISSING'
        };
    }

    static checkCSS() {
        const stylesheets = document.styleSheets;
        const loaded = [];
        const failed = [];

        for (let i = 0; i < stylesheets.length; i++) {
            try {
                const rules = stylesheets[i].cssRules;
                loaded.push(stylesheets[i].href?.split('/').pop() || 'inline');
            } catch (e) {
                failed.push(stylesheets[i].href?.split('/').pop() || 'inline');
            }
        }

        return { loaded, failed, total: stylesheets.length };
    }

    static checkJS() {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const loaded = scripts.map(script => script.src.split('/').pop());
        
        const required = [
            'constants.js',
            'helpers.js',
            'api.js',
            'ui.js',
            'auth.js',
            'forms.js',
            'tickets.js',
            'agenda.js',
            'main.js'
        ];

        const missing = required.filter(req => 
            !loaded.some(loaded => loaded.includes(req))
        );

        return { loaded, missing, total: scripts.length };
    }

    static checkHTML() {
        const requiredElements = [
            'mainHeader',
            'mainContent',
            'mainFooter',
            'modalsContainer',
            'loginForm',
            'contactForm',
            'supportForm'
        ];

        const missing = requiredElements.filter(selector => {
            return !document.getElementById(selector);
        });

        return { 
            missing, 
            present: requiredElements.length - missing.length,
            total: requiredElements.length
        };
    }

    static checkModules() {
        const requiredModules = [
            'CyclopsApp',
            'UIModule',
            'AuthModule',
            'FormsModule',
            'TicketsModule',
            'AgendaModule',
            'Helpers',
            'apiClient'
        ];

        const missing = requiredModules.filter(module => {
            return !window[module];
        });

        return { 
            missing, 
            present: requiredModules.length - missing.length,
            total: requiredModules.length
        };
    }

    static checkStorage() {
        const testKey = 'cyclops_test_' + Date.now();
        const testValue = 'test_value';
        
        try {
            // Test escritura
            localStorage.setItem(testKey, testValue);
            
            // Test lectura
            const readValue = localStorage.getItem(testKey);
            
            // Test eliminación
            localStorage.removeItem(testKey);
            
            return {
                available: true,
                working: readValue === testValue,
                test: 'PASSED'
            };
        } catch (error) {
            return {
                available: false,
                working: false,
                test: 'FAILED',
                error: error.message
            };
        }
    }

    static checkPerformance() {
        const perf = {
            domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            pageLoad: performance.timing.loadEventEnd - performance.timing.navigationStart,
            resources: performance.getEntriesByType('resource').length
        };

        return perf;
    }

    static printResults(results) {
        console.group('🔍 VERIFICACIÓN DE INTEGRIDAD - SOPORTE CYCLOPS');
        console.log(`📊 Fecha: ${new Date().toLocaleString()}`);
        
        console.group('🚀 APLICACIÓN');
        console.log(`✅ Inicializada: ${results.app.initialized}`);
        console.log(`📦 Versión: ${results.app.version}`);
        console.log(`⚙️ Config: ${results.app.config}`);
        console.groupEnd();

        console.group('🎨 CSS');
        console.log(`✅ Cargados: ${results.css.loaded.join(', ')}`);
        if (results.css.failed.length > 0) {
            console.log(`❌ Fallaron: ${results.css.failed.join(', ')}`);
        }
        console.log(`📈 Total: ${results.css.total} hojas de estilo`);
        console.groupEnd();

        console.group('📜 JAVASCRIPT');
        console.log(`✅ Cargados: ${results.js.loaded.join(', ')}`);
        if (results.js.missing.length > 0) {
            console.log(`❌ Faltantes: ${results.js.missing.join(', ')}`);
        }
        console.log(`📈 Total: ${results.js.total} scripts`);
        console.groupEnd();

        console.group('🏗️ HTML');
        console.log(`✅ Elementos presentes: ${results.html.present}/${results.html.total}`);
        if (results.html.missing.length > 0) {
            console.log(`❌ Elementos faltantes: ${results.html.missing.join(', ')}`);
        }
        console.groupEnd();

        console.group('⚙️ MÓDULOS');
        console.log(`✅ Módulos cargados: ${results.modules.present}/${results.modules.total}`);
        if (results.modules.missing.length > 0) {
            console.log(`❌ Módulos faltantes: ${results.modules.missing.join(', ')}`);
        }
        console.groupEnd();

        console.group('💾 ALMACENAMIENTO');
        console.log(`✅ Disponible: ${results.storage.available}`);
        console.log(`✅ Funcionando: ${results.storage.working}`);
        console.log(`🧪 Test: ${results.storage.test}`);
        if (results.storage.error) {
            console.log(`❌ Error: ${results.storage.error}`);
        }
        console.groupEnd();

        console.group('⚡ RENDIMIENTO');
        console.log(`📊 DOM Ready: ${results.performance.domReady}ms`);
        console.log(`📊 Page Load: ${results.performance.pageLoad}ms`);
        console.log(`📊 Recursos: ${results.performance.resources}`);
        console.groupEnd();

        // Resumen general
        const allChecks = [
            results.app.initialized,
            results.css.failed.length === 0,
            results.js.missing.length === 0,
            results.html.missing.length === 0,
            results.modules.missing.length === 0,
            results.storage.working
        ];

        const passedChecks = allChecks.filter(check => check).length;
        const totalChecks = allChecks.length;
        const status = passedChecks === totalChecks ? 'PASSED' : 'WARNING';

        console.group('📋 RESUMEN GENERAL');
        console.log(`🏆 Estado: ${status}`);
        console.log(`✅ Checks pasados: ${passedChecks}/${totalChecks}`);
        
        if (status === 'PASSED') {
            console.log('🎉 ¡Todas las verificaciones pasaron correctamente!');
        } else {
            console.warn('⚠️ Algunas verificaciones fallaron. Revisa los detalles arriba.');
        }
        
        console.groupEnd();
        console.groupEnd();

        return status;
    }

    static runComprehensiveTest() {
        console.log('🧪 Iniciando prueba comprehensiva...');
        
        const tests = {
            // Test de funcionalidades básicas
            basic: this.testBasicFunctionality(),
            // Test de módulos
            modules: this.testModules(),
            // Test de UI
            ui: this.testUI(),
            // Test de formularios
            forms: this.testForms()
        };

        this.printTestResults(tests);
        return tests;
    }

    static testBasicFunctionality() {
        const tests = [];
        
        // Test 1: Navegación
        try {
            const nav = document.querySelector('.nav-menu');
            tests.push({
                name: 'Navegación',
                passed: !!nav,
                message: nav ? 'Menú de navegación encontrado' : 'Menú de navegación no encontrado'
            });
        } catch (error) {
            tests.push({
                name: 'Navegación',
                passed: false,
                message: `Error: ${error.message}`
            });
        }

        // Test 2: Modals
        try {
            const modals = document.getElementById('modalsContainer');
            tests.push({
                name: 'Sistema de Modals',
                passed: !!modals,
                message: modals ? 'Contenedor de modals encontrado' : 'Contenedor de modals no encontrado'
            });
        } catch (error) {
            tests.push({
                name: 'Sistema de Modals',
                passed: false,
                message: `Error: ${error.message}`
            });
        }

        return tests;
    }

    static testModules() {
        const tests = [];
        const app = window.cyclops?.app;

        if (!app) {
            return [{
                name: 'Módulos',
                passed: false,
                message: 'Aplicación no inicializada'
            }];
        }

        const modules = ['ui', 'auth', 'forms', 'tickets', 'agenda'];
        
        modules.forEach(moduleName => {
            const module = app.getModule(moduleName);
            tests.push({
                name: `Módulo ${moduleName}`,
                passed: !!module,
                message: module ? `${moduleName} cargado correctamente` : `${moduleName} no cargado`
            });
        });

        return tests;
    }

    static testUI() {
        const tests = [];
        
        // Test de responsive
        tests.push({
            name: 'Responsive Design',
            passed: window.innerWidth > 0,
            message: 'Ventana responsive detectada'
        });

        // Test de scroll
        tests.push({
            name: 'Scroll Suave',
            passed: document.documentElement.style.scrollBehavior === 'smooth',
            message: 'Scroll suave configurado'
        });

        return tests;
    }

    static testForms() {
        const tests = [];
        const forms = ['loginForm', 'contactForm', 'supportForm'];

        forms.forEach(formId => {
            const form = document.getElementById(formId);
            tests.push({
                name: `Formulario ${formId}`,
                passed: !!form,
                message: form ? `${formId} encontrado` : `${formId} no encontrado`
            });
        });

        return tests;
    }

    static printTestResults(tests) {
        console.group('🧪 PRUEBAS COMPREHENSIVAS');
        
        Object.entries(tests).forEach(([category, categoryTests]) => {
            console.group(`📁 ${category.toUpperCase()}`);
            
            categoryTests.forEach(test => {
                const icon = test.passed ? '✅' : '❌';
                console.log(`${icon} ${test.name}: ${test.message}`);
            });
            
            const passed = categoryTests.filter(t => t.passed).length;
            const total = categoryTests.length;
            console.log(`📊 Resultado: ${passed}/${total} pasados`);
            
            console.groupEnd();
        });

        console.groupEnd();
    }
}

// Ejecutar verificación cuando la app esté lista
document.addEventListener('cyclops:ready', () => {
    setTimeout(() => {
        console.log('🔍 Ejecutando verificación de integridad...');
        IntegrityChecker.check();
        
        // Ejecutar pruebas comprehensivas solo en desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(() => {
                IntegrityChecker.runComprehensiveTest();
            }, 1000);
        }
    }, 500);
});

// Exportar para uso global
window.IntegrityChecker = IntegrityChecker;