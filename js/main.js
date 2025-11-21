// Main Application - Soporte Cyclops
class MainApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('🚀 Inicializando aplicación Soporte Cyclops...');

            // Initialize core modules
            await this.initializeModules();

            // Initialize UI components
            this.initializeUI();

            // Set up event listeners
            this.setupEventListeners();

            this.isInitialized = true;
            console.log('✅ Aplicación inicializada correctamente');

        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.showError(error);
        }
    }

    async initializeModules() {
        // Modules are loaded via script tags, just ensure they're available
        if (typeof UIModule !== 'undefined') {
            this.modules.ui = UIModule;
            UIModule.init();
        }
        
        if (typeof AuthModule !== 'undefined') {
            this.modules.auth = AuthModule;
            AuthModule.init();
        }
        
        if (typeof FormsModule !== 'undefined') {
            this.modules.forms = FormsModule;
            FormsModule.init();
        }
        
        if (typeof Projects !== 'undefined') {
            this.modules.projects = Projects;
            Projects.init();
        }

        console.log('📦 Módulos inicializados:', Object.keys(this.modules));
    }

    initializeUI() {
        // Initialize smooth scrolling
        this.initializeSmoothScrolling();

        // Initialize header scroll effect
        this.initializeHeaderScroll();

        // Initialize mobile menu
        this.initializeMobileMenu();
    }

    initializeSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.main-header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update active nav link
                    this.updateActiveNavLink(targetId);
                }
            });
        });
    }

    initializeHeaderScroll() {
        const header = document.querySelector('.main-header');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Update active nav link based on scroll position
            this.updateActiveNavLinkOnScroll();
        });
    }

    initializeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mainNav = document.querySelector('.main-nav');

        if (mobileMenuBtn && mainNav) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenuBtn.classList.toggle('active');
                mainNav.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            const navLinks = mainNav.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenuBtn.classList.remove('active');
                    mainNav.classList.remove('active');
                });
            });
        }
    }

    updateActiveNavLink(targetId) {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });
    }

    updateActiveNavLinkOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const headerHeight = document.querySelector('.main-header').offsetHeight;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = '#' + section.getAttribute('id');
            }
        });

        if (currentSection) {
            this.updateActiveNavLink(currentSection);
        }
    }

    setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showLoginModal();
            });
        }

        // Modal close buttons
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmit(e);
            });
        }

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoginSubmit(e);
            });
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    hideModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    handleContactSubmit(e) {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        console.log('📧 Enviando formulario de contacto:', data);
        
        // Simular envío
        setTimeout(() => {
            alert('✅ Mensaje enviado correctamente. Te contactaremos pronto.');
            e.target.reset();
        }, 1000);
    }

    handleLoginSubmit(e) {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        console.log('🔐 Intentando login:', data);
        
        // Simular login
        setTimeout(() => {
            alert('✅ Login exitoso (simulado)');
            this.hideLoginModal();
            e.target.reset();
        }, 1000);
    }

    showError(error) {
        console.error('💥 Error en la aplicación:', error);
        // Puedes mostrar una notificación al usuario aquí
    }
}

// Global functions for HTML onclick attributes
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = document.querySelector('.main-header').offsetHeight;
        const offsetPosition = element.offsetTop - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function openProject(projectId) {
    if (typeof Projects !== 'undefined') {
        Projects.openProject(projectId);
    } else {
        console.warn('Projects module not available');
        // Fallback: open in new tab
        const projects = {
            cyclobot: 'https://soportecyclops.github.io/CycloBot/',
            original: 'https://soportecyclops.github.io/soportecyclopsoficial/'
        };
        
        if (projects[projectId]) {
            window.open(projects[projectId], '_blank');
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MainApp();
    window.app.initialize().catch(console.error);
});

// Global registration
window.MainApp = MainApp;
