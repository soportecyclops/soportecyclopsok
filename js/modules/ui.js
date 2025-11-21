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
    }

    setupScrollEffects() {
        // Usar throttle para optimizar scroll
        const throttledScroll = window.CyclopsApp?.getModule('helpers')?.throttle?.(this.handleScroll.bind(this), 100) || 
                              this.handleScroll.bind(this);
        
        window.addEventListener('scroll', throttledScroll);
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
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });

        // Disparar animación inicial
        setTimeout(() => {
            this.animateOnScroll();
        }, 100);
    }

    setupModals() {
        // Lógica de modals aquí (simplificada)
        console.log('🔧 Modals configurados');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}
