class MainApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('🚀 Inicializando aplicación Soporte Cyclops...');

            // Show loading overlay
            this.showLoading();

            // Initialize core modules
            await this.initializeModules();

            // Initialize UI components
            this.initializeUI();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize projects module
            this.modules.projects = new Projects();
            this.modules.projects.init();

            // Hide loading overlay
            this.hideLoading();

            this.isInitialized = true;
            console.log('✅ Aplicación inicializada correctamente');

            // Run integrity check
            setTimeout(() => {
                if (typeof IntegrityChecker !== 'undefined') {
                    IntegrityChecker.check();
                }
            }, 1000);

        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.hideLoading();
        }
    }

    async initializeModules() {
        // Modules are loaded via script tags, just ensure they're available
        this.modules.ui = window.UI || new UI();
        this.modules.auth = window.Auth || new Auth();
        this.modules.forms = window.Forms || new Forms();
        this.modules.tickets = window.Tickets || new Tickets();
        this.modules.agenda = window.Agenda || new Agenda();

        // Initialize each module
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.init === 'function') {
                module.init();
            }
        });
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
                this.modules.ui.showModal(document.getElementById('loginModal'));
            });
        }

        // Modal close buttons
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.modules.ui.hideModal(modal);
            });
        }

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm && this.modules.forms) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.modules.forms.handleContactSubmit(e);
            });
        }

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm && this.modules.auth) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.modules.auth.handleLogin(e);
            });
        }
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }
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
    if (window.app && window.app.modules.projects) {
        window.app.modules.projects.openProject(projectId);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MainApp();
    window.app.initialize();
});

// Global registration
window.MainApp = MainApp;
