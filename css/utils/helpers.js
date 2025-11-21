import { CONFIG, MESSAGES, VALIDATION_RULES } from './constants.js';

// Utilidades generales de la aplicación
export class Helpers {
    
    // ===== VALIDACIONES =====
    
    static isValidEmail(email) {
        return VALIDATION_RULES.EMAIL.test(email);
    }

    static isValidPassword(password) {
        return password && password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH;
    }

    static isValidPhone(phone) {
        return VALIDATION_RULES.PHONE.test(phone);
    }

    static passwordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    }

    // ===== MANEJO DE FECHAS =====
    
    static formatDate(date, format = 'es-ES', options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString(format, { ...defaultOptions, ...options });
    }

    static formatDateTime(date, format = 'es-ES') {
        return new Date(date).toLocaleString(format, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        
        return this.formatDate(date);
    }

    // ===== ALMACENAMIENTO LOCAL =====
    
    static setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            this.showNotification(MESSAGES.ERROR.UNEXPECTED_ERROR, 'error');
            return false;
        }
    }

    static getStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error obteniendo del localStorage:', error);
            return null;
        }
    }

    static removeStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removiendo del localStorage:', error);
            return false;
        }
    }

    static clearStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
            return false;
        }
    }

    // ===== NOTIFICACIONES =====
    
    static showNotification(message, type = 'info', duration = 5000) {
        // Remover notificaciones existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.remove();
            }
        });

        const notification = document.createElement('div');
        notification.className = `notification notification-${type} notification-slide-in`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icons[type] || icons.info}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 400px;
            min-width: 300px;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;

        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            margin-left: auto;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        `;

        notification.querySelector('.notification-close:hover').style.opacity = '1';

        document.body.appendChild(notification);

        // Auto-remover después del tiempo especificado
        const timeout = setTimeout(() => {
            notification.classList.add('notification-slide-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);

        // Cerrar al hacer click
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(timeout);
            notification.classList.add('notification-slide-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });

        return notification;
    }

    static getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    // ===== MANEJO DE FORMULARIOS =====
    
    static validateForm(formData, rules) {
        const errors = {};
        const data = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData.get(field);
            data[field] = value;
            
            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = MESSAGES.ERROR.REQUIRED_FIELD;
                continue;
            }
            
            if (rule.email && value && !this.isValidEmail(value)) {
                errors[field] = MESSAGES.ERROR.INVALID_EMAIL;
            }
            
            if (rule.password && value && !this.isValidPassword(value)) {
                errors[field] = MESSAGES.ERROR.PASSWORD_TOO_SHORT;
            }
            
            if (rule.confirmPassword && value) {
                const password = formData.get('password');
                if (!this.passwordsMatch(password, value)) {
                    errors[field] = MESSAGES.ERROR.PASSWORD_MISMATCH;
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            data
        };
    }

    static serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    static setFormLoading(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, textarea, select, button');
        
        if (submitBtn) {
            const originalText = submitBtn.dataset.originalText || submitBtn.innerHTML;
            
            if (isLoading) {
                submitBtn.dataset.originalText = originalText;
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>${MESSAGES.INFO.PROCESSING}</span>
                `;
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                delete submitBtn.dataset.originalText;
            }
        }
        
        inputs.forEach(input => {
            if (input !== submitBtn && input.type !== 'submit') {
                input.disabled = isLoading;
            }
        });
    }

    // ===== MANEJO DE ERRORES =====
    
    static handleError(error, context = '') {
        console.error(`Error en ${context}:`, error);
        
        let message = MESSAGES.ERROR.UNEXPECTED_ERROR;
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            message = MESSAGES.ERROR.NETWORK_ERROR;
        } else if (error.message) {
            message = error.message;
        }
        
        this.showNotification(message, 'error');
        return message;
    }

    // ===== UTILIDADES DE DOM =====
    
    static debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static generateId(prefix = '') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ===== FORMATO DE DATOS =====
    
    static formatCurrency(amount, currency = 'USD', locale = 'es-ES') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    static formatNumber(number, locale = 'es-ES') {
        return new Intl.NumberFormat(locale).format(number);
    }

    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // ===== NAVEGACIÓN =====
    
    static navigateTo(url, options = {}) {
        if (options.replace) {
            window.location.replace(url);
        } else {
            window.location.href = url;
        }
    }

    static reloadPage() {
        window.location.reload();
    }

    // ===== MISCELÁNEOS =====
    
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    static getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }
}