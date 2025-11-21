// Auth Module - Simplified
if (typeof window.Auth === 'undefined') {
    window.Auth = {
        init: function() {
            console.log('🔐 Auth module initialized');
        },
        
        handleLogin: function(formData) {
            console.log('Login attempt:', formData);
            return Promise.resolve({ success: true, user: { name: 'Demo User' } });
        },
        
        handleLogout: function() {
            console.log('User logged out');
            return Promise.resolve();
        },
        
        isAuthenticated: function() {
            return false;
        }
    };
    console.log('✅ Auth module loaded');
}
