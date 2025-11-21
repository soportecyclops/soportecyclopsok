class FormsModule {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        console.log('📝 FormsModule inicializado');
        this.bindFormEvents();
        this.initialized = true;
        return this;
    }

    bindFormEvents() {
        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Generic form validation
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.validateField(e.target);
            }
        });
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        console.log('📧 Enviando formulario de contacto:', data);
        
        // Validar campos requeridos
        if (!this.validateRequiredFields(e.target)) {
            this.showFormError('Por favor completa todos los campos requeridos');
            return;
        }

        // Validar email
        if (data.email && !this.validateEmail(data.email)) {
            this.showFormError('Por favor ingresa un email válido');
            return;
        }

        // Simular envío
        try {
            await this.submitForm(data);
            this.showFormSuccess('✅ Mensaje enviado correctamente. Te contactaremos pronto.');
            e.target.reset();
        } catch (error) {
            this.showFormError('❌ Error al enviar el mensaje. Por favor intenta nuevamente.');
        }
    }

    validateRequiredFields(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        return isValid;
    }

    validateField(field) {
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.classList.add('error');
            return false;
        }

        if (field.type === 'email' && field.value) {
            if (!this.validateEmail(field.value)) {
                field.classList.add('error');
                return false;
            }
        }

        field.classList.remove('error');
        return true;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    submitForm(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form submitted successfully:', data);
                resolve({ success: true, message: 'Form submitted' });
            }, 1500);
        });
    }

    showFormSuccess(message) {
        if (typeof Helpers !== 'undefined' && Helpers.showNotification) {
            Helpers.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    showFormError(message) {
        if (typeof Helpers !== 'undefined' && Helpers.showNotification) {
            Helpers.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    // Método para resetear formularios
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            // Limpiar clases de error
            form.querySelectorAll('.error').forEach(field => {
                field.classList.remove('error');
            });
        }
    }
}

// Global registration
window.FormsModule = FormsModule;
console.log('✅ Forms module loaded');
