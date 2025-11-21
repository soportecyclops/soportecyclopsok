// js/modules/helpers.js - VERSIÓN CORREGIDA
const Helpers = (() => {
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const debounce = (func, wait, immediate) => {
        let timeout;
        return function(...args) {
            const context = this;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    const formatPhone = (phone) => {
        // Formatear número de teléfono
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const showNotification = (message, type = 'info') => {
        // Implementar notificación toast
        console.log(`${type.toUpperCase()}: ${message}`);
    };

    // Asegurar que todas las funciones sean exportadas
    return {
        throttle,
        debounce,
        formatPhone,
        validateEmail,
        showNotification
    };
})();

// Exportación para módulos
export default Helpers;
