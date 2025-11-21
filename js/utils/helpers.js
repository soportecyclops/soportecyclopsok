// js/modules/helpers.js - VERSIÓN CORREGIDA (NO MODULAR)
class Helpers {
    constructor() {
        console.log('🛠️ Helpers inicializado');
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait, immediate) {
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
    }

    formatPhone(phone) {
        // Limpiar y formatear número de teléfono
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
        }
        return phone;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showNotification(message, type = 'info') {
        // Implementación simple de notificación
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.3s ease;
        `;

        const colors = {
            info: '#007bff',
            success: '#28a745', 
            warning: '#ffc107',
            error: '#dc3545'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}
