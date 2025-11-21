// js/fix-modules.js - Verificar y corregir módulos
console.log('🔧 VERIFICANDO REGISTRO DE MÓDULOS');

function checkModuleRegistration() {
    const modules = [
        { name: 'Helpers', global: 'Helpers', file: 'js/utils/helpers.js' },
        { name: 'UIModule', global: 'UIModule', file: 'js/modules/ui.js' },
        { name: 'AuthModule', global: 'AuthModule', file: 'js/modules/auth.js' },
        { name: 'FormsModule', global: 'FormsModule', file: 'js/modules/forms.js' },
        { name: 'TicketsModule', global: 'TicketsModule', file: 'js/modules/tickets.js' },
        { name: 'AgendaModule', global: 'AgendaModule', file: 'js/modules/agenda.js' }
    ];

    console.group('🔍 VERIFICANDO REGISTRO GLOBAL');
    
    modules.forEach(module => {
        const isRegistered = typeof window[module.global] !== 'undefined';
        const status = isRegistered ? '✅ REGISTRADO' : '❌ NO REGISTRADO';
        console.log(`${module.name}: ${status}`);
        
        if (!isRegistered) {
            console.warn(`   ⚠️  ${module.name} necesita: window.${module.global} = ${module.global};`);
        }
    });
    
    console.groupEnd();
}

// Verificar después de un breve delay para que carguen los scripts
setTimeout(checkModuleRegistration, 1000);

// También verificar cuando se haga clic
window.checkModules = checkModuleRegistration;

console.log('🔧 Para verificar módulos, ejecuta: checkModules()');
