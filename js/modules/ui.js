// js/modules/ui.js - VERSIÓN CORREGIDA (NO MODULAR)
class UIModule {
    constructor() {
        this.isInitialized = false;
        console.log('🎨 UI Module creado');
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🎨 Inicializando módulo de UI...');
        
        try {
            this.setupEventListeners();
            this.setupScrollEffects();
            this.setupAnimations();
            this.setupModals();
            
            this.isInitialized = true;
            console.log('✅ UI Module inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando UI Module:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Navegación móvil
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }

        // Cerrar menú al hacer clic en enlace
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu) navMenu.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            });
        });

        // Smooth scroll para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupScrollEffects() {
        // Usar throttle para optimizar scroll
        const helpers = window.CyclopsAppInstance?.getModule?.('helpers') || window.Helpers;
        const throttledScroll = helpers ? helpers.throttle(this.handleScroll.bind(this), 100) : this.handleScroll.bind(this);
        
        window.addEventListener('scroll', throttledScroll);
        // Ejecutar una vez al inicio
        this.handleScroll();
    }

    handleScroll() {
        const header = document.querySelector('.main-header');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (header) {
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Animación de elementos al hacer scroll
        this.animateOnScroll();
    }

    animateOnScroll() {
        const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    setupAnimations() {
        // Inicializar animaciones CSS
        const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
        animatedElements.forEach(el => {
            if (!el.classList.contains('animate')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
            }
        });

        // Disparar animación inicial
        setTimeout(() => {
            this.animateOnScroll();
        }, 100);
    }

    setupModals() {
        // Configurar cierre de modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
                this.hideModal(e.target.closest('.modal').id);
            }
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Animación de entrada
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.hideModal(modal.id);
        });
    }

    // Método para mostrar/ocultar loading
    showLoading(container = document.body) {
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading-overlay';
        loadingEl.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Cargando...</p>
            </div>
        `;
        container.appendChild(loadingEl);
        return loadingEl;
    }

    hideLoading(loadingEl) {
        if (loadingEl && loadingEl.parentNode) {
            loadingEl.parentNode.removeChild(loadingEl);
        }
    }
}
