// Constantes globales de la aplicación
export const CONFIG = {
    APP_NAME: 'Soporte Cyclops Oficial',
    VERSION: '1.0.0',
    API_BASE_URL: 'https://api.cyclops.com/v1',
    STORAGE_KEYS: {
        AUTH_TOKEN: 'cyclops_auth_token',
        USER_DATA: 'cyclops_user_data',
        THEME: 'cyclops_theme',
        LANGUAGE: 'cyclops_language'
    },
    ROUTES: {
        HOME: '/',
        DASHBOARD: '/dashboard',
        TICKETS: '/tickets',
        AGENDA: '/agenda',
        REPORTS: '/reports'
    },
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh'
        },
        TICKETS: {
            LIST: '/tickets',
            CREATE: '/tickets',
            UPDATE: '/tickets/:id',
            DELETE: '/tickets/:id'
        },
        USERS: {
            PROFILE: '/users/profile',
            UPDATE: '/users/profile'
        }
    },
    SUPPORT_TYPES: {
        TECHNICAL: 'technical',
        NETWORK: 'network',
        SOFTWARE: 'software',
        HARDWARE: 'hardware',
        EMERGENCY: 'emergency'
    },
    URGENCY_LEVELS: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
    }
};

export const MESSAGES = {
    ERROR: {
        NETWORK_ERROR: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
        AUTH_FAILED: 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.',
        SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        REQUIRED_FIELD: 'Este campo es obligatorio.',
        INVALID_EMAIL: 'Por favor, ingresa una dirección de email válida.',
        PASSWORD_MISMATCH: 'Las contraseñas no coinciden.',
        PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres.',
        FORM_ERROR: 'Por favor, corrige los errores en el formulario.',
        UNEXPECTED_ERROR: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'
    },
    SUCCESS: {
        LOGIN_SUCCESS: '¡Inicio de sesión exitoso! Redirigiendo...',
        LOGOUT_SUCCESS: 'Sesión cerrada correctamente.',
        REGISTER_SUCCESS: '¡Cuenta creada exitosamente! Ya puedes iniciar sesión.',
        FORM_SUCCESS: 'Formulario enviado correctamente.',
        TICKET_CREATED: 'Ticket creado exitosamente. Nos pondremos en contacto contigo pronto.',
        PROFILE_UPDATED: 'Perfil actualizado correctamente.'
    },
    INFO: {
        LOADING: 'Cargando...',
        PROCESSING: 'Procesando...',
        SAVING: 'Guardando...'
    }
};

export const VALIDATION_RULES = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: {
        MIN_LENGTH: 6
    },
    PHONE: /^\+?[\d\s-()]{10,}$/
};