// Pruebas específicas para módulos
class ModuleTester {
    static testUIModule() {
        console.group('🧪 TEST: Módulo UI');
        
        const uiModule = window.cyclops?.app?.getModule('ui');
        if (!uiModule) {
            console.error('❌ Módulo UI no disponible');
            return false;
        }

        const tests = [
            {
                name: 'Menú Móvil',
                test: () => {
                    const mobileBtn = document.getElementById('mobileMenuBtn');
                    return !!mobileBtn;
                }
            },
            {
                name: 'Navegación',
                test: () => {
                    const navMenu = document.getElementById('navMenu');
                    return !!navMenu && navMenu.querySelectorAll('.nav-link').length > 0;
                }
            },
            {
                name: 'Sistema de Modals',
                test: () => {
                    const modalsContainer = document.getElementById('modalsContainer');
                    return !!modalsContainer;
                }
            }
        ];

        let allPassed = true;

        tests.forEach(test => {
            const passed = test.test();
            console.log(`${passed ? '✅' : '❌'} ${test.name}`);
            if (!passed) allPassed = false;
        });

        console.log(allPassed ? '🎉 Módulo UI: TODAS LAS PRUEBAS PASARON' : '⚠️ Módulo UI: ALGUNAS PRUEBAS FALLARON');
        console.groupEnd();

        return allPassed;
    }

    static testAuthModule() {
        console.group('🧪 TEST: Módulo Auth');
        
        const authModule = window.cyclops?.app?.getModule('auth');
        if (!authModule) {
            console.error('❌ Módulo Auth no disponible');
            return false;
        }

        const tests = [
            {
                name: 'Formulario Login',
                test: () => {
                    const loginForm = document.getElementById('loginForm');
                    return !!loginForm;
                }
            },
            {
                name: 'Formulario Registro',
                test: () => {
                    const registerForm = document.getElementById('registerForm');
                    return !!registerForm;
                }
            },
            {
                name: 'Botones Auth',
                test: () => {
                    const loginBtn = document.getElementById('loginBtn');
                    const registerBtn = document.getElementById('registerBtn');
                    return !!loginBtn && !!registerBtn;
                }
            }
        ];

        let allPassed = true;

        tests.forEach(test => {
            const passed = test.test();
            console.log(`${passed ? '✅' : '❌'} ${test.name}`);
            if (!passed) allPassed = false;
        });

        console.log(allPassed ? '🎉 Módulo Auth: TODAS LAS PRUEBAS PASARON' : '⚠️ Módulo Auth: ALGUNAS PRUEBAS FALLARON');
        console.groupEnd();

        return allPassed;
    }

    static testFormsModule() {
        console.group('🧪 TEST: Módulo Forms');
        
        const formsModule = window.cyclops?.app?.getModule('forms');
        if (!formsModule) {
            console.error('❌ Módulo Forms no disponible');
            return false;
        }

        const tests = [
            {
                name: 'Formulario Contacto',
                test: () => {
                    const contactForm = document.getElementById('contactForm');
                    return !!contactForm;
                }
            },
            {
                name: 'Formulario Soporte',
                test: () => {
                    const supportForm = document.getElementById('supportForm');
                    return !!supportForm;
                }
            },
            {
                name: 'Validación Email',
                test: () => {
                    return window.Helpers.isValidEmail('test@example.com') &&
                           !window.Helpers.isValidEmail('invalid-email');
                }
            }
        ];

        let allPassed = true;

        tests.forEach(test => {
            const passed = test.test();
            console.log(`${passed ? '✅' : '❌'} ${test.name}`);
            if (!passed) allPassed = false;
        });

        console.log(allPassed ? '🎉 Módulo Forms: TODAS LAS PRUEBAS PASARON' : '⚠️ Módulo Forms: ALGUNAS PRUEBAS FALLARON');
        console.groupEnd();

        return allPassed;
    }

    static runAllTests() {
        console.log('🚀 EJECUTANDO TODAS LAS PRUEBAS DE MÓDULOS...');
        
        const results = {
            ui: this.testUIModule(),
            auth: this.testAuthModule(),
            forms: this.testFormsModule()
        };

        const allPassed = Object.values(results).every(result => result);
        
        console.group('📋 RESUMEN DE PRUEBAS');
        console.log(`✅ UI Module: ${results.ui ? 'PASSED' : 'FAILED'}`);
        console.log(`✅ Auth Module: ${results.auth ? 'PASSED' : 'FAILED'}`);
        console.log(`✅ Forms Module: ${results.forms ? 'PASSED' : 'FAILED'}`);
        console.log(allPassed ? '🎉 ¡TODAS LAS PRUEBAS PASARON!' : '❌ Algunas pruebas fallaron');
        console.groupEnd();

        return allPassed;
    }
}

// Ejecutar pruebas cuando la app esté lista
document.addEventListener('cyclops:ready', () => {
    setTimeout(() => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            ModuleTester.runAllTests();
        }
    }, 1000);
});

// Exportar para uso global
window.ModuleTester = ModuleTester;