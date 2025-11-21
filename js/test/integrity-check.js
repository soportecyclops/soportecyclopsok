// js/test/integrity-check.js - VERSIÓN ACTUALIZADA
const IntegrityChecker = (() => {
    const checkApplication = () => {
        return {
            initialized: !!window.CyclopsApp?.isInitialized,
            version: window.CyclopsApp?.version || 'undefined',
            config: window.CyclopsApp ? 'LOADED' : 'MISSING'
        };
    };

    const checkCSS = () => {
        const sheets = Array.from(document.styleSheets);
        const loaded = [];
        const failed = [];

        sheets.forEach(sheet => {
            try {
                const rules = sheet.cssRules || sheet.rules;
                if (rules && rules.length > 0) {
                    loaded.push(sheet.href ? sheet.href.split('/').pop() : 'inline');
                } else {
                    failed.push(sheet.href || 'unknown');
                }
            } catch (error) {
                failed.push(sheet.href || 'unknown');
            }
        });

        return {
            loaded,
            failed,
            total: sheets.length
        };
    };

    const checkJavaScript = () => {
        const scripts = Array.from(document.scripts);
        const loaded = [];
        const missing = [];

        // Verificar módulos críticos
        const criticalModules = [
            'helpers.js', 'ui.js', 'auth.js', 'forms.js', 
            'tickets.js', 'agenda.js', 'main.js'
        ];

        criticalModules.forEach(module => {
            const found = scripts.some(script => script.src.includes(module));
            if (found) {
                loaded.push(module);
            } else {
                missing.push(module);
            }
        });

        return {
            loaded,
            missing,
            total: criticalModules.length
        };
    };

    const checkHTML = () => {
        const criticalElements = [
            'mainHeader', 'mainContent', 'mainFooter', 
            'modalsContainer', 'loginForm', 'contactForm', 'supportForm'
        ];

        const present = [];
        const missing = [];

        criticalElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                present.push(id);
            } else {
                missing.push(id);
            }
        });

        return {
            present: present.length,
            missing,
            total: criticalElements.length
        };
    };

    const checkModules = () => {
        const modules = [
            'UIModule', 'AuthModule', 'FormsModule', 
            'TicketsModule', 'AgendaModule', 'Helpers', 'apiClient'
        ];

        const present = [];
        const missing = [];

        modules.forEach(module => {
            if (module === 'Helpers') {
                if (typeof Helpers !== 'undefined') {
                    present.push(module);
                } else {
                    missing.push(module);
                }
            } else if (window.CyclopsApp?.getModule(module.toLowerCase().replace('module', ''))) {
                present.push(module);
            } else {
                missing.push(module);
            }
        });

        return {
            present: present.length,
            missing,
            total: modules.length
        };
    };

    const checkStorage = () => {
        const available = typeof Storage !== 'undefined';
        let working = false;
        let test = 'FAILED';

        if (available) {
            try {
                localStorage.setItem('test', 'test');
                working = localStorage.getItem('test') === 'test';
                localStorage.removeItem('test');
                test = 'PASSED';
            } catch (error) {
                working = false;
                test = 'FAILED';
            }
        }

        return {
            available,
            working,
            test
        };
    };

    const checkPerformance = () => {
        const perf = performance.timing;
        const domReady = perf.domContentLoadedEventEnd - perf.navigationStart;
        const pageLoad = perf.loadEventEnd - perf.navigationStart;
        const resources = performance.getEntriesByType('resource').length;

        return {
            domReady,
            pageLoad,
            resources
        };
    };

    const checkModuleDependencies = () => {
        const checks = [
            {
                name: 'Helpers throttle function',
                check: () => {
                    const helpers = window.CyclopsApp?.getModule('helpers');
                    return typeof helpers?.throttle === 'function';
                },
                error: 'Helpers.throttle no está disponible'
            },
            {
                name: 'UI Module initialization',
                check: () => {
                    const ui = window.CyclopsApp?.getModule('ui');
                    return ui?.isInitialized === true;
                },
                error: 'UI Module no se inicializó correctamente'
            },
            {
                name: 'Auth Module functionality',
                check: () => {
                    const auth = window.CyclopsApp?.getModule('auth');
                    return typeof auth?.isAuthenticated === 'function';
                },
                error: 'Auth Module no funciona correctamente'
            },
            {
                name: 'Forms Module validation',
                check: () => {
                    const forms = window.CyclopsApp?.getModule('forms');
                    return typeof forms?.validateField === 'function';
                },
                error: 'Forms Module no funciona correctamente'
            }
        ];

        const passed = checks.filter(r => r.check());
        const failed = checks.filter(r => !r.check());

        return {
            passed: passed.length,
            failed: failed.length,
            total: checks.length,
            details: { passed, failed }
        };
    };

    const printResults = (results) => {
        console.group('🔍 VERIFICACIÓN DE INTEGRIDAD - SOPORTE CYCLOPS');
        console.log('📊 Fecha:', new Date().toLocaleString('es-AR'));
        
        console.group('🚀 APLICACIÓN');
        console.log('✅ Inicializada:', results.app.initialized);
        console.log('📦 Versión:', results.app.version);
        console.log('⚙️ Config:', results.app.config);
        console.groupEnd();

        console.group('🎨 CSS');
        console.log('✅ Cargados:', results.css.loaded.join(', '));
        console.log('❌ Fallaron:', results.css.failed.join(', '));
        console.log('📈 Total:', results.css.total, 'hojas de estilo');
        console.groupEnd();

        console.group('📜 JAVASCRIPT');
        console.log('✅ Cargados:', results.js.loaded.join(', '));
        console.log('❌ Faltantes:', results.js.missing.join(', '));
        console.log('📈 Total:', results.js.loaded.length, 'scripts');
        console.groupEnd();

        console.group('🏗️ HTML');
        console.log('✅ Elementos presentes:', results.html.present + '/' + results.html.total);
        console.log('❌ Elementos faltantes:', results.html.missing.join(', '));
        console.groupEnd();

        console.group('⚙️ MÓDULOS');
        console.log('✅ Módulos cargados:', results.modules.present + '/' + results.modules.total);
        console.log('❌ Módulos faltantes:', results.modules.missing.join(', '));
        console.groupEnd();

        console.group('💾 ALMACENAMIENTO');
        console.log('✅ Disponible:', results.storage.available);
        console.log('✅ Funcionando:', results.storage.working);
        console.log('🧪 Test:', results.storage.test);
        console.groupEnd();

        console.group('⚡ RENDIMIENTO');
        console.log('📊 DOM Ready:', results.performance.domReady + 'ms');
        console.log('📊 Page Load:', results.performance.pageLoad + 'ms');
        console.log('📊 Recursos:', results.performance.resources);
        console.groupEnd();

        // Verificación de dependencias
        const deps = checkModuleDependencies();
        console.group('🔗 DEPENDENCIAS DE MÓDULOS');
        console.log('✅ Checks pasados:', deps.passed + '/' + deps.total);
        deps.details.failed.forEach(f => {
            console.error('❌', f.name + ':', f.error);
        });
        console.groupEnd();

        console.group('📋 RESUMEN GENERAL');
        const totalChecks = 6;
        const passedChecks = [
            results.app.initialized,
            results.js.loaded.length > 0,
            results.html.present > 0,
            results.modules.present > 0,
            results.storage.working,
            deps.passed > 0
        ].filter(Boolean).length;

        console.log('🏆 Estado:', passedChecks === totalChecks ? 'PASSED' : 
                   passedChecks >= totalChecks / 2 ? 'WARNING' : 'FAILED');
        console.log('✅ Checks pasados:', passedChecks + '/' + totalChecks);

        if (passedChecks === totalChecks) {
            console.log('🎉 ¡Todas las verificaciones pasaron! La aplicación está funcionando correctamente.');
        } else if (passedChecks >= totalChecks / 2) {
            console.log('⚠️ Algunas verificaciones fallaron. Revisa los detalles arriba.');
        } else {
            console.error('❌ Múltiples verificaciones fallaron. La aplicación puede no funcionar correctamente.');
        }
        console.groupEnd();

        console.groupEnd();

        return {
            app: results.app,
            css: results.css,
            js: results.js,
            html: results.html,
            modules: results.modules,
            storage: results.storage,
            performance: results.performance,
            dependencies: deps,
            summary: {
                passed: passedChecks,
                total: totalChecks,
                status: passedChecks === totalChecks ? 'PASSED' : 
                       passedChecks >= totalChecks / 2 ? 'WARNING' : 'FAILED'
            }
        };
    };

    return {
        check: () => {
            const results = {
                app: checkApplication(),
                css: checkCSS(),
                js: checkJavaScript(),
                html: checkHTML(),
                modules: checkModules(),
                storage: checkStorage(),
                performance: checkPerformance()
            };

            return printResults(results);
        },

        checkModule: (moduleName) => {
            const module = window.CyclopsApp?.getModule(moduleName);
            if (!module) {
                console.error(`❌ Módulo ${moduleName} no encontrado`);
                return false;
            }

            console.group(`🔍 Verificando módulo: ${moduleName}`);
            console.log('✅ Encontrado:', true);
            console.log('✅ Inicializado:', module.isInitialized || 'No disponible');
            console.log('🔧 Métodos:', Object.getOwnPropertyNames(Object.getPrototypeOf(module)));
            console.groupEnd();

            return true;
        },

        runAllTests: () => {
            console.log('🧪 EJECUTANDO TODAS LAS PRUEBAS...');
            const results = this.check();
            
            // Pruebas adicionales
            this.testHelpers();
            this.testUI();
            
            return results;
        },

        testHelpers: () => {
            console.group('🧪 Probando Helpers...');
            const helpers = window.CyclopsApp?.getModule('helpers');
            
            if (helpers) {
                // Test throttle
                let throttleCount = 0;
                const throttled = helpers.throttle(() => throttleCount++, 100);
                throttled();
                throttled();
                console.log('✅ Throttle:', throttleCount === 1 ? 'PASSED' : 'FAILED');

                // Test email validation
                console.log('✅ Email validation:', 
                    helpers.validateEmail('test@test.com') === true ? 'PASSED' : 'FAILED');

                // Test phone formatting
                console.log('✅ Phone format:', 
                    helpers.formatPhone('1123456789') === '11 2345-6789' ? 'PASSED' : 'FAILED');
            } else {
                console.error('❌ Helpers no disponible');
            }
            console.groupEnd();
        },

        testUI: () => {
            console.group('🧪 Probando UI...');
            const ui = window.CyclopsApp?.getModule('ui');
            
            if (ui) {
                console.log('✅ UI Module:', ui.isInitialized ? 'INITIALIZED' : 'NOT INITIALIZED');
                console.log('🔧 Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(ui)).length);
            } else {
                console.error('❌ UI Module no disponible');
            }
            console.groupEnd();
        }
    };
})();

// Hacer disponible globalmente
window.IntegrityChecker = IntegrityChecker;

// Auto-ejecutar si está en desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🔍 Ejecutando verificación de integridad automática...');
            IntegrityChecker.check();
        }, 1000);
    });
}
