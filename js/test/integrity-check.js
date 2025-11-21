// js/test/integrity-check.js - ACTUALIZADO
const IntegrityChecker = (() => {
    const checkModuleDependencies = () => {
        const checks = [
            {
                name: 'Helpers throttle function',
                check: () => typeof window.CyclopsApp?.getModule('helpers')?.throttle === 'function',
                error: 'Helpers.throttle no está disponible'
            },
            {
                name: 'UI Module initialization',
                check: () => window.CyclopsApp?.getModule('ui')?.isInitialized === true,
                error: 'UI Module no se inicializó correctamente'
            },
            // ... otros checks
        ];

        return checks;
    };

    return {
        check: () => {
            const results = checkModuleDependencies();
            const passed = results.filter(r => r.check());
            const failed = results.filter(r => !r.check());
            
            console.group('🔍 Integrity Check - Dependencias de Módulos');
            console.log(`✅ ${passed.length} checks pasados`);
            failed.forEach(f => console.error(`❌ ${f.name}: ${f.error}`));
            console.groupEnd();

            return {
                passed: passed.length,
                failed: failed.length,
                total: results.length,
                details: { passed, failed }
            };
        }
    };
})();
