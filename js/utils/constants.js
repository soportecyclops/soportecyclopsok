// Constantes globales de la aplicación
export const CONFIG = {
    APP_NAME: 'Soporte Cyclops Oficial',
    VERSION: '1.0.0',
    API_BASE_URL: 'https://api.cyclops.com',
    STORAGE_KEYS: {
        AUTH_TOKEN: 'cyclops_auth_token',
        USER_DATA: 'cyclops_user_data',
        THEME: 'cyclops_theme'
    },
    ROUTES: {
        HOME: '/',
        DASHBOARD: '/dashboard',
        TICKETS: '/tickets',
        AGENDA: '/agenda'
    }
};

export const MESSAGES = {
    ERROR: {
        NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
        AUTH_FAILED: 'Credenciales incorrectas.',
        SESSION_EXPIRED: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
        REQUIRED_FIELD: 'Este campo es obligatorio.',
        INVALID_EMAIL: 'Por favor, ingresa un email válido.'
    },
    SUCCESS: {
        LOGIN_SUCCESS: 'Inicio de sesión exitoso.',
        LOGOUT_SUCCESS: 'Sesión cerrada correctamente.',
        FORM_SUCCESS: 'Formulario enviado correctamente.'
    }
};