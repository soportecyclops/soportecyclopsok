// js/load-modules.js
console.log('🔧 Iniciando cargador de módulos...');

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            console.log('✅ Cargado:', src);
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Error cargando:', src);
            reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
    });
}

async function loadAllModules() {
    try {
        console.log('📦 Cargando módulos...');
        
        await loadScript('js/modules/helpers.js');
        await loadScript('js/modules/ui.js');
        await loadScript('js/modules/auth.js');
        await loadScript('js/modules/forms.js');
        await loadScript('js/modules/tickets.js');
        await loadScript('js/modules/agenda.js');
        await loadScript('js/main.js');
        
        console.log('🎉 Todos los módulos cargados correctamente');
        
    } catch (error) {
        console.error('💥 Error crítico cargando módulos:', error);
        showFatalError(error);
    }
}

function showFatalError(error) {
    const errorHtml = `
        <div class="error-container" style="padding: 2rem; text-align: center; background: #f8f9fa; border-radius: 8px; margin: 2rem;">
            <h2 style="color: #dc3545;">Error al cargar la aplicación</h2>
            <p>Ha ocurrido un error al inicializar Soporte Cyclops. Por favor, recarga la página.</p>
            <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 10px;">
                Recargar Página
            </button>
            <details style="margin-top: 1rem; text-align: left;">
                <summary>Detalles técnicos</summary>
                <pre style="background: #fff; padding: 1rem; border-radius: 4px; overflow: auto;">${error.stack}</pre>
            </details>
        </div>
    `;
    document.body.innerHTML = errorHtml;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllModules);
} else {
    loadAllModules();
}
