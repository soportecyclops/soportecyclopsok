import { CONFIG, MESSAGES } from './constants.js';
import { Helpers } from './helpers.js';

// Cliente API para comunicaciones con el backend
export class ApiClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders },
            ...options
        };

        // Agregar token de autenticación si existe
        const token = Helpers.getStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            throw this.handleError(error, endpoint);
        }
    }

    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await this.parseResponse(response);
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await this.parseResponse(response);
    }

    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    }

    handleError(error, context) {
        console.error(`API Error en ${context}:`, error);
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error(MESSAGES.ERROR.NETWORK_ERROR);
        }
        
        throw error;
    }

    // ===== MÉTODOS HTTP =====
    
    async get(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'GET',
            ...options
        });
    }

    async post(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    }

    async put(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    }

    async patch(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            ...options
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            ...options
        });
    }

    // ===== MÉTODOS ESPECÍFICOS DE LA APLICACIÓN =====
    
    async login(credentials) {
        return this.post(CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    }

    async register(userData) {
        return this.post(CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
    }

    async logout() {
        return this.post(CONFIG.ENDPOINTS.AUTH.LOGOUT);
    }

    async getTickets(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? 
            `${CONFIG.ENDPOINTS.TICKETS.LIST}?${queryString}` : 
            CONFIG.ENDPOINTS.TICKETS.LIST;
        
        return this.get(endpoint);
    }

    async createTicket(ticketData) {
        return this.post(CONFIG.ENDPOINTS.TICKETS.CREATE, ticketData);
    }

    async updateTicket(ticketId, ticketData) {
        const endpoint = CONFIG.ENDPOINTS.TICKETS.UPDATE.replace(':id', ticketId);
        return this.put(endpoint, ticketData);
    }

    async deleteTicket(ticketId) {
        const endpoint = CONFIG.ENDPOINTS.TICKETS.DELETE.replace(':id', ticketId);
        return this.delete(endpoint);
    }

    async getUserProfile() {
        return this.get(CONFIG.ENDPOINTS.USERS.PROFILE);
    }

    async updateUserProfile(profileData) {
        return this.put(CONFIG.ENDPOINTS.USERS.UPDATE, profileData);
    }

    // ===== MÉTODOS DE ARCHIVOS =====
    
    async uploadFile(file, onProgress = null) {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (event) => {
                if (onProgress && event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });

            const token = Helpers.getStorage(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            xhr.open('POST', `${this.baseURL}/upload`);
            
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            
            xhr.send(formData);
        });
    }
}

// Instancia global del cliente API
export const apiClient = new ApiClient();