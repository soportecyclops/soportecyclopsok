import { Helpers } from '../utils/helpers.js';
import { CONFIG } from '../utils/constants.js';

// Módulo de interfaz de usuario
export class UIModule {
    constructor() {
        this.isMobileMenuOpen = false;
        this.currentModal = null;
        this.init();
    }

    init() {
        console.log('🎨 Inicializando módulo de UI...');
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupNavigation();
        this.checkPreferredTheme();
    }

    setupEventListeners() {
        // Menú móvil
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && 
                !e.target.closest('#navMenu') && 
                !e.target.closest('#mobileMenuBtn')) {
                this.closeMobileMenu();
            }
        });

        // Modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });

        // Navegación suave
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            }
        });

        // Botones de acción
        const emergencyBtn = document.getElementById('emergencySupportBtn');
        const scheduleBtn = document.getElementById('scheduleServiceBtn');
        
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => this.handleEmergencySupport());
        }
        
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', () => this.handleScheduleService());
        }
    }

    setupScrollEffects() {
        // Header con scroll
        const header = document.getElementById('mainHeader');
        
        const handleScroll = Helpers.throttle(() => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Actualizar navegación activa
            this.updateActiveNavigation();
        }, 100);

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Ejecutar inicialmente
    }

    setupNavigation() {
        // Navegación por secciones
        const navLinks = document.querySelectorAll('.nav-link[data-nav]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.nav;
                this.setActiveNavigation(link);
                this.scrollToSection(section);
            });
        });

        // Actualizar navegación inicial
        this.updateActiveNavigation();
    }

    toggleMobileMenu() {
        const navMenu = document.getElementById('navMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
        
        if (mobileMenuBtn) {
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = this.isMobileMenuOpen ? 
                    'fas fa-times' : 'fas fa-bars';
            }
        }

        // Prevenir scroll del body cuando el menú está abierto
        document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        
        const navMenu = document.getElementById('navMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        
        if (mobileMenuBtn) {
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }

        document.body.style.overflow = '';
    }

    // ===== MODALS =====
    
    openModal(modalId) {
        this.closeModal(); // Cerrar modal existente
        
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal no encontrado: ${modalId}`);
            return;
        }

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        this.currentModal = modal;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.currentModal) return;

        this.currentModal.classList.remove('show');
        this.currentModal.classList.add('closing');

        setTimeout(() => {
            this.currentModal.style.display = 'none';
            this.currentModal.classList.remove('closing');
            this.currentModal = null;
            document.body.style.overflow = '';
        }, 300);
    }

    createAlertModal(title, message, type = 'info') {
        const modalId = 'alertModal_' + Helpers.generateId();
        const modalHtml = `
            <div id="${modalId}" class="modal alert-modal">
                <div class="modal-content">
                    <div class="modal-body">
                        <i class="alert-icon ${type} fas ${
                            type === 'success' ? 'fa-check-circle' :
                            type === 'error' ? 'fa-exclamation-circle' :
                            type === 'warning' ? 'fa-exclamation-triangle' :
                            'fa-info-circle'
                        }"></i>
                        <div class="alert-content">
                            <h4 class="alert-title">${title}</h4>
                            <p class="alert-message">${message}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary modal-close">Aceptar</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').insertAdjacentHTML('beforeend', modalHtml);
        this.openModal(modalId);

        // Auto-remover después de cerrar
        const modal = document.getElementById(modalId);
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.remove();
                    }
                }, 400);
            }
        });
    }

    createConfirmModal(title, message, onConfirm, onCancel = null) {
        const modalId = 'confirmModal_' + Helpers.generateId();
        const modalHtml = `
            <div id="${modalId}" class="modal confirm-modal">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="confirm-icon">
                            <i class="fas fa-question-circle"></i>
                        </div>
                        <h3 class="confirm-title">${title}</h3>
                        <p class="confirm-message">${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="confirmCancel">Cancelar</button>
                        <button class="btn btn-primary" id="confirmOk">Aceptar</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').insertAdjacentHTML('beforeend', modalHtml);
        this.openModal(modalId);

        const modal = document.getElementById(modalId);
        
        modal.querySelector('#confirmOk').addEventListener('click', () => {
            this.closeModal();
            if (onConfirm) onConfirm();
            setTimeout(() => modal.remove(), 400);
        });

        modal.querySelector('#confirmCancel').addEventListener('click', () => {
            this.closeModal();
            if (onCancel) onCancel();
            setTimeout(() => modal.remove(), 400);
        });

        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
                if (onCancel) onCancel();
                setTimeout(() => modal.remove(), 400);
            }
        });
    }

    // ===== NAVEGACIÓN =====
    
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (!element) {
            console.warn(`Sección no encontrada: ${sectionId}`);
            return;
        }

        const headerHeight = document.getElementById('mainHeader').offsetHeight;
        const targetPosition = element.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        this.closeMobileMenu();
    }

    setActiveNavigation(activeLink) {
        // Remover activo de todos los links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Agregar activo al link clickeado
        activeLink.classList.add('active');
    }

    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const headerHeight = document.getElementById('mainHeader').offsetHeight;
        let currentActive = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentActive = section.id;
            }
        });

        // Actualizar links de navegación
        document.querySelectorAll('.nav-link[data-nav]').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.nav === currentActive) {
                link.classList.add('active');
            }
        });
    }

    // ===== MANEJADORES DE ACCIÓN =====
    
    handleEmergencySupport() {
        this.createConfirmModal(
            'Soporte de Emergencia',
            '¿Estás seguro de que necesitas soporte de emergencia? Este servicio tiene prioridad máxima y puede tener costos adicionales.',
            () => {
                // Aquí iría la lógica para crear ticket de emergencia
                Helpers.showNotification('Solicitud de emergencia enviada. Te contactaremos inmediatamente.', 'success');
            }
        );
    }

    handleScheduleService() {
        this.openModal('scheduleServiceModal');
    }

    // ===== TEMA Y APARIENCIA =====
    
    checkPreferredTheme() {
        const savedTheme = Helpers.getStorage(CONFIG.STORAGE_KEYS.THEME);
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;
        
        this.setTheme(theme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Helpers.setStorage(CONFIG.STORAGE_KEYS.THEME, theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // ===== LOADING STATES =====
    
    showLoading(container, message = 'Cargando...') {
        const loadingHtml = `
            <div class="loading-overlay">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;

        container.style.position = 'relative';
        container.insertAdjacentHTML('beforeend', loadingHtml);
    }

    hideLoading(container) {
        const loadingOverlay = container.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    // ===== UTILIDADES =====
    
    updatePageTitle(title) {
        document.title = `${title} - ${CONFIG.APP_NAME}`;
    }

    showElement(element) {
        element.classList.remove('d-none');
    }

    hideElement(element) {
        element.classList.add('d-none');
    }

    toggleElement(element) {
        element.classList.toggle('d-none');
    }
}