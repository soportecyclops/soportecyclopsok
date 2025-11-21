import { Helpers } from '../utils/helpers.js';
import { apiClient } from '../utils/api.js';
import { CONFIG, MESSAGES } from '../utils/constants.js';

// Módulo de manejo de formularios
export class FormsModule {
    constructor() {
        this.forms = new Map();
        this.init();
    }

    init() {
        console.log('📝 Inicializando módulo de formularios...');
        this.registerForms();
        this.setupGlobalFormHandlers();
    }

    registerForms() {
        // Formulario de contacto
        this.registerForm('contactForm', {
            rules: {
                name: { required: true },
                email: { required: true, email: true },
                message: { required: true }
            },
            onSubmit: (formData) => this.handleContactForm(formData)
        });

        // Formulario de soporte
        this.registerForm('supportForm', {
            rules: {
                supportType: { required: true },
                description: { required: true },
                urgency: { required: true }
            },
            onSubmit: (formData) => this.handleSupportForm(formData)
        });

        // Formulario de registro
        this.registerForm('registerForm', {
            rules: {
                name: { required: true },
                email: { required: true, email: true },
                password: { required: true, password: true },
                confirmPassword: { required: true, confirmPassword: true }
            },
            onSubmit: (formData) => this.handleRegisterForm(formData)
        });

        // Formulario de login
        this.registerForm('loginForm', {
            rules: {
                email: { required: true, email: true },
                password: { required: true }
            },
            onSubmit: (formData) => this.handleLoginForm(formData)
        });
    }

    registerForm(formId, config) {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`Formulario no encontrado: ${formId}`);
            return;
        }

        this.forms.set(formId, config);
        
        // Remover event listeners existentes
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Agregar nuevo event listener
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(formId, e);
        });

        // Validación en tiempo real
        this.setupRealTimeValidation(newForm, config.rules);
    }

    setupRealTimeValidation(form, rules) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validar al perder foco
            input.addEventListener('blur', () => {
                this.validateField(input, rules);
            });

            // Limpiar errores al empezar a escribir
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    async handleFormSubmit(formId, event) {
        const form = event.target;
        const config = this.forms.get(formId);
        
        if (!config) {
            console.warn(`Configuración no encontrada para el formulario: ${formId}`);
            return;
        }

        const formData = new FormData(form);
        const validation = Helpers.validateForm(formData, config.rules);

        // Mostrar errores
        this.clearFormErrors(form);
        if (!validation.isValid) {
            this.showFormErrors(form, validation.errors);
            Helpers.showNotification(MESSAGES.ERROR.FORM_ERROR, 'error');
            return;
        }

        // Deshabilitar formulario durante el envío
        Helpers.setFormLoading(form, true);

        try {
            await config.onSubmit(formData, validation.data);
            form.reset();
            this.clearFormErrors(form);
        } catch (error) {
            Helpers.handleError(error, `form-${formId}`);
        } finally {
            Helpers.setFormLoading(form, false);
        }
    }

    validateField(field, rules) {
        const fieldName = field.name;
        const fieldRule = rules[fieldName];
        
        if (!fieldRule) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        if (fieldRule.required && (!value || value === '')) {
            isValid = false;
            errorMessage = MESSAGES.ERROR.REQUIRED_FIELD;
        } else if (fieldRule.email && value && !Helpers.isValidEmail(value)) {
            isValid = false;
            errorMessage = MESSAGES.ERROR.INVALID_EMAIL;
        } else if (fieldRule.password && value && !Helpers.isValidPassword(value)) {
            isValid = false;
            errorMessage = MESSAGES.ERROR.PASSWORD_TOO_SHORT;
        }

        this.updateFieldStatus(field, isValid, errorMessage);
        return isValid;
    }

    updateFieldStatus(field, isValid, errorMessage = '') {
        field.classList.remove('error', 'success');
        
        if (isValid && field.value.trim() !== '') {
            field.classList.add('success');
        } else if (!isValid) {
            field.classList.add('error');
        }

        // Mostrar/ocultar mensaje de error
        this.showFieldError(field, errorMessage);
    }

    showFieldError(field, errorMessage) {
        let errorElement = field.parentNode.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }

        if (errorMessage) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        } else {
            errorElement.classList.remove('show');
        }
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    showFormErrors(form, errors) {
        Object.entries(errors).forEach(([fieldName, errorMessage]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.updateFieldStatus(field, false, errorMessage);
            }
        });
    }

    clearFormErrors(form) {
        const errorFields = form.querySelectorAll('.error');
        const errorMessages = form.querySelectorAll('.error-message');
        const successFields = form.querySelectorAll('.success');
        
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
        
        successFields.forEach(field => {
            field.classList.remove('success');
        });
        
        errorMessages.forEach(message => {
            message.classList.remove('show');
        });
    }

    // ===== HANDLERS ESPECÍFICOS DE FORMULARIOS =====
    
    async handleContactForm(formData) {
        const data = Helpers.serializeForm(formData);
        
        // Simular envío a API (reemplazar con API real)
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Datos de contacto enviados:', data);
                Helpers.showNotification(MESSAGES.SUCCESS.FORM_SUCCESS, 'success');
                resolve();
            }, 2000);
        });
    }

    async handleSupportForm(formData) {
        const data = Helpers.serializeForm(formData);
        const authModule = window.cyclops.app.getModule('auth');
        
        // Verificar autenticación para soporte
        if (!authModule.requireAuth()) {
            throw new Error('Authentication required');
        }

        try {
            const result = await apiClient.createTicket(data);
            Helpers.showNotification(MESSAGES.SUCCESS.TICKET_CREATED, 'success');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async handleRegisterForm(formData) {
        // Este handler es manejado por el AuthModule
        // Se mantiene aquí para consistencia en el registro
        return Promise.resolve();
    }

    async handleLoginForm(formData) {
        // Este handler es manejado por el AuthModule
        // Se mantiene aquí para consistencia en el registro
        return Promise.resolve();
    }

    // ===== FORMULARIOS DINÁMICOS =====
    
    setupGlobalFormHandlers() {
        // Handler para modals de formularios dinámicos
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-form-type]')) {
                const formType = e.target.dataset.formType;
                this.openFormModal(formType);
            }
        });

        // Handler para formularios dinámicos
        document.addEventListener('submit', (e) => {
            if (e.target.matches('[data-dynamic-form]')) {
                e.preventDefault();
                this.handleDynamicForm(e.target);
            }
        });
    }

    openFormModal(formType) {
        console.log(`Abriendo modal para: ${formType}`);
        // Implementar lógica para crear modals de formularios dinámicos
    }

    async handleDynamicForm(form) {
        const formType = form.dataset.dynamicForm;
        const formData = new FormData(form);

        Helpers.setFormLoading(form, true);

        try {
            // Lógica específica para cada tipo de formulario dinámico
            switch (formType) {
                case 'quick-support':
                    await this.handleQuickSupportForm(formData);
                    break;
                case 'feedback':
                    await this.handleFeedbackForm(formData);
                    break;
                default:
                    throw new Error(`Tipo de formulario no soportado: ${formType}`);
            }
        } catch (error) {
            Helpers.handleError(error, `dynamic-form-${formType}`);
        } finally {
            Helpers.setFormLoading(form, false);
        }
    }

    async handleQuickSupportForm(formData) {
        const data = Helpers.serializeForm(formData);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Soporte rápido enviado:', data);
                Helpers.showNotification('Solicitud de soporte rápido enviada', 'success');
                resolve();
            }, 1500);
        });
    }

    async handleFeedbackForm(formData) {
        const data = Helpers.serializeForm(formData);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Feedback enviado:', data);
                Helpers.showNotification('¡Gracias por tu feedback!', 'success');
                resolve();
            }, 1500);
        });
    }

    // ===== UTILIDADES DE FORMULARIOS =====
    
    createDynamicForm(config) {
        const formId = 'dynamicForm_' + Helpers.generateId();
        const formHtml = this.generateFormHtml(formId, config);
        
        document.body.insertAdjacentHTML('beforeend', formHtml);
        
        // Registrar el formulario dinámicamente
        this.registerForm(formId, config);
        
        return formId;
    }

    generateFormHtml(formId, config) {
        const fieldsHtml = config.fields.map(field => `
            <div class="form-group">
                <label for="${field.id}" class="form-label">${field.label}</label>
                ${this.generateFieldHtml(field)}
            </div>
        `).join('');

        return `
            <form id="${formId}" class="form-container">
                <h3>${config.title}</h3>
                ${fieldsHtml}
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i>
                        ${config.submitText || 'Enviar'}
                    </button>
                </div>
            </form>
        `;
    }

    generateFieldHtml(field) {
        switch (field.type) {
            case 'textarea':
                return `<textarea id="${field.id}" name="${field.name}" class="form-textarea" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`;
            
            case 'select':
                const options = field.options.map(opt => 
                    `<option value="${opt.value}">${opt.label}</option>`
                ).join('');
                return `<select id="${field.id}" name="${field.name}" class="form-select" ${field.required ? 'required' : ''}>${options}</select>`;
            
            case 'checkbox':
                return `
                    <div class="form-check">
                        <input type="checkbox" id="${field.id}" name="${field.name}" class="form-check-input" ${field.required ? 'required' : ''}>
                        <label for="${field.id}" class="form-check-label">${field.label}</label>
                    </div>
                `;
            
            default:
                return `<input type="${field.type}" id="${field.id}" name="${field.name}" class="form-input" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
        }
    }

    // ===== MÉTODOS PARA OTROS MÓDULOS =====
    
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return null;
        
        return Helpers.serializeForm(form);
    }

    setFormData(formId, data) {
        const form = document.getElementById(formId);
        if (!form) return;

        Object.entries(data).forEach(([key, value]) => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
            }
        });
    }

    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            this.clearFormErrors(form);
        }
    }
}