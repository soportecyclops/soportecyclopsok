// js/modules/forms.js - VERSIÓN CORREGIDA (NO MODULAR)
class FormsModule {
    constructor() {
        this.isInitialized = false;
        console.log('📝 Forms Module creado');
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('📝 Inicializando módulo de Forms...');
        
        try {
            this.setupFormListeners();
            this.setupValidation();
            
            this.isInitialized = true;
            console.log('✅ Forms Module inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Forms Module:', error);
            throw error;
        }
    }

    setupFormListeners() {
        // Formulario de contacto
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(e.target);
            });
        }

        // Formulario de soporte
        const supportForm = document.getElementById('supportForm');
        if (supportForm) {
            supportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSupportForm(e.target);
            });
        }

        // Formulario de registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegisterForm(e.target);
            });
        }

        // Validación en tiempo real
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                this.validateField(e.target);
            }
        });
    }

    setupValidation() {
        // Agregar validadores personalizados
        this.setupCustomValidators();
    }

    setupCustomValidators() {
        // Validador de teléfono argentino
        HTMLInputElement.prototype.validatePhone = function() {
            const value = this.value.replace(/\D/g, '');
            const isValid = value.length === 10 || value.length === 0;
            
            if (!isValid && value.length > 0) {
                this.setCustomValidity('El teléfono debe tener 10 dígitos');
            } else {
                this.setCustomValidity('');
            }
            
            return isValid;
        };

        // Validador de CUIT
        HTMLInputElement.prototype.validateCUIT = function() {
            const value = this.value.replace(/\D/g, '');
            let isValid = false;
            
            if (value.length === 11) {
                // Algoritmo simplificado de validación CUIT
                const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
                let total = 0;
                
                for (let i = 0; i < 10; i++) {
                    total += parseInt(value[i]) * multipliers[i];
                }
                
                const remainder = total % 11;
                const expectedDigit = remainder === 0 ? 0 : 11 - remainder;
                isValid = parseInt(value[10]) === expectedDigit;
            }
            
            if (!isValid && value.length > 0) {
                this.setCustomValidity('CUIT/CUIL inválido');
            } else {
                this.setCustomValidity('');
            }
            
            return isValid;
        };
    }

    validateField(field) {
        const helpers = window.CyclopsApp?.getModule('helpers');
        
        // Limpiar estado anterior
        field.classList.remove('valid', 'invalid');
        
        // Validación básica de required
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.classList.add('invalid');
            this.showFieldError(field, 'Este campo es obligatorio');
            return false;
        }

        // Validación de email
        if (field.type === 'email' && field.value.trim()) {
            if (!helpers || !helpers.validateEmail(field.value)) {
                field.classList.add('invalid');
                this.showFieldError(field, 'Email inválido');
                return false;
            }
        }

        // Validación de teléfono
        if (field.type === 'tel' && field.value.trim()) {
            if (!field.validatePhone()) {
                field.classList.add('invalid');
                this.showFieldError(field, 'Teléfono inválido');
                return false;
            }
        }

        // Validación de CUIT
        if (field.name === 'cuit' && field.value.trim()) {
            if (!field.validateCUIT()) {
                field.classList.add('invalid');
                this.showFieldError(field, 'CUIT/CUIL inválido');
                return false;
            }
        }

        // Si pasa todas las validaciones
        if (field.value.trim()) {
            field.classList.add('valid');
            this.clearFieldError(field);
        } else {
            this.clearFieldError(field);
        }

        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        errorEl.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;
        
        field.parentNode.appendChild(errorEl);
    }

    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleContactForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Validar todos los campos
            const isValid = this.validateForm(form);
            if (!isValid) {
                throw new Error('Por favor completa todos los campos requeridos correctamente');
            }

            const loading = window.CyclopsApp?.getModule('ui')?.showLoading(form);
            
            // Simular envío (reemplazar con API real)
            await this.mockSubmitForm(data, 'contact');
            
            window.CyclopsApp?.getModule('ui')?.hideLoading(loading);
            window.CyclopsApp?.getModule('helpers')?.showNotification('Mensaje enviado correctamente', 'success');
            
            form.reset();
            this.resetFormState(form);

        } catch (error) {
            window.CyclopsApp?.getModule('ui')?.hideLoading(loading);
            window.CyclopsApp?.getModule('helpers')?.showNotification(error.message, 'error');
        }
    }

    async handleSupportForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const isValid = this.validateForm(form);
            if (!isValid) {
                throw new Error('Por favor completa todos los campos requeridos correctamente');
            }

            const loading = window.CyclopsApp?.getModule('ui')?.showLoading(form);
            
            await this.mockSubmitForm(data, 'support');
            
            window.CyclopsApp?.getModule('ui')?.hideLoading(loading);
            window.CyclopsApp?.getModule('helpers')?.showNotification('Ticket de soporte creado correctamente', 'success');
            
            form.reset();
            this.resetFormState(form);

        } catch (error) {
            window.CyclopsApp?.getModule('ui')?.hideLoading(loading);
            window.CyclopsApp?.getModule('helpers')?.showNotification(error.message, 'error');
        }
    }

    async handleRegisterForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const isValid = this.validateForm(form);
            if (!isValid) {
                throw new Error('Por favor completa todos los campos requeridos correctamente');
            }

            // Validar contraseña
            if (data.password !== data.confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            const loading = window.CyclopsApp?.getModule('ui')?.showLoading(form);
            
            await this.mockSubmitForm(data, 'register');
            
            window.CyclopsApp?.getModule('ui')?.hideLoading(loading);
            window.CyclopsApp?.getModule('helpers')?.showNotification('Registro exitoso. Bienvenido!', 'success');
            
            form.reset();
            this.resetFormState(form);

            // Cerrar modal de registro si existe
            window.CyclopsApp?.getModule('ui')?.hideModal('registerModal');

        } catch (error) {
            window.CyclopsApp?.getModule('ui')?.hideLoading(loading);
            window.CyclopsApp?.getModule('helpers')?.showNotification(error.message, 'error');
        }
    }

    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    resetFormState(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.classList.remove('valid', 'invalid');
            this.clearFieldError(field);
        });
    }

    async mockSubmitForm(data, type) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simular respuesta exitosa
        console.log(`Formulario ${type} enviado:`, data);
        
        return {
            success: true,
            message: 'Formulario procesado correctamente',
            id: 'form_' + Date.now()
        };
    }

    // Método para habilitar/deshabilitar formulario
    setFormState(form, enabled) {
        const fields = form.querySelectorAll('input, textarea, select, button');
        fields.forEach(field => {
            field.disabled = !enabled;
        });
        
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (enabled) {
                submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Enviar';
            } else {
                submitBtn.setAttribute('data-original-text', submitBtn.textContent);
                submitBtn.textContent = 'Enviando...';
            }
        }
    }
}
