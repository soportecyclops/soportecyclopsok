// UI Module - Manejo de interfaz de usuario
if (typeof window.UIModule === 'undefined') {
    window.UIModule = {
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

            // Cerrar modales con botones de cerrar
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modal = e.target.closest('.modal');
                    this.hideModal(modal);
                });
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

                // Cerrar menú al hacer click en un link
                const navLinks = nav.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        menuBtn.classList.remove('active');
                        nav.classList.remove('active');
                    });
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

                        // Actualizar navegación activa
                        this.updateActiveNav(targetId.replace('#', ''));
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
        },

        // Método para mostrar notificaciones (fallback si Helpers no está disponible)
        showNotification: function(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            `;

            // Estilos básicos para la notificación
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
                color: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
            `;

            // Agregar estilos de animación si no existen
            if (!document.querySelector('#notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    .notification-close {
                        background: none;
                        border: none;
                        color: white;
                        font-size: 18px;
                        cursor: pointer;
                        margin-left: 10px;
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(notification);

            // Auto-remover después de 5 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideIn 0.3s ease-out reverse';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }
            }, 5000);

            // Cerrar al hacer click
            notification.querySelector('.notification-close').onclick = () => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            };
        },

        // Método para toggle de elementos
        toggleElement: function(element) {
            if (element) {
                element.classList.toggle('active');
            }
        },

        // Método para actualizar el header en scroll
        initHeaderScroll: function() {
            const header = document.querySelector('.main-header');
            
            if (header) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 100) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                });
            }
        }
    };

    // Auto-inicialización cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.UIModule.init();
            window.UIModule.initHeaderScroll();
        });
    } else {
        window.UIModule.init();
        window.UIModule.initHeaderScroll();
    }

    console.log('✅ UI module cargado y disponible globalmente');
}
