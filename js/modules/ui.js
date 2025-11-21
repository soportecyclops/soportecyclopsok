// UI Module - Manejo de interfaz de usuario
if (typeof window.UI === 'undefined') {
    window.UI = {
        init: function() {
            console.log('🎨 Inicializando UI module');
            this.initModals();
            this.initMobileMenu();
            this.initSmoothScroll();
        },

        initModals: function() {
            // Cerrar modal al hacer click fuera
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideModal(e.target);
                }
            });

            // Cerrar modal con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const openModal = document.querySelector('.modal.active');
                    if (openModal) {
                        this.hideModal(openModal);
                    }
                }
            });
        },

        initMobileMenu: function() {
            const menuBtn = document.getElementById('mobileMenuBtn');
            const nav = document.querySelector('.main-nav');

            if (menuBtn && nav) {
                menuBtn.addEventListener('click', () => {
                    menuBtn.classList.toggle('active');
                    nav.classList.toggle('active');
                });
            }
        },

        initSmoothScroll: function() {
            const links = document.querySelectorAll('a[href^="#"]');
            
            links.forEach(link => {
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
                    }
                });
            });
        },

        showModal: function(modal) {
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },

        hideModal: function(modal) {
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        showLoading: function() {
            let overlay = document.getElementById('loadingOverlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loadingOverlay';
                overlay.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Cargando...</p>
                    </div>
                `;
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    color: white;
                    font-family: Arial, sans-serif;
                `;
                document.body.appendChild(overlay);
            }
            overlay.style.display = 'flex';
        },

        hideLoading: function() {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        },

        updateActiveNav: function(sectionId) {
            const links = document.querySelectorAll('.nav-link');
            links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    };

    // Auto-inicialización cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.UI.init());
    } else {
        window.UI.init();
    }

    console.log('✅ UI module cargado y disponible globalmente');
}
// Global registration
window.UIModule = UIModule;
