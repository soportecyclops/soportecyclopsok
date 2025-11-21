// Forms Module - Simplified  
if (typeof window.Forms === 'undefined') {
    window.Forms = {
        init: function() {
            console.log('📝 Forms module initialized');
            this.bindFormEvents();
        },
        
        bindFormEvents: function() {
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
            }
        },
        
        handleContactSubmit: function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            console.log('Contact form submitted:', data);
            
            // Simulate API call
            return new Promise((resolve) => {
                setTimeout(() => {
                    alert('✅ Mensaje enviado correctamente');
                    e.target.reset();
                    resolve({ success: true });
                }, 1000);
            });
        },
        
        validateEmail: function(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
    };
    console.log('✅ Forms module loaded');
}
