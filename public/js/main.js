document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // Flash message auto-dismiss
    const flashMessages = document.querySelectorAll('.flash-message');
    if (flashMessages.length > 0) {
        flashMessages.forEach(message => {
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    message.style.display = 'none';
                }, 300);
            }, 5000);
        });
    }
    
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                event.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
    
    // Password confirmation check
    const passwordForm = document.querySelector('form[action="/auth/register"]');
    if (passwordForm) {
        const password = passwordForm.querySelector('#password');
        const password2 = passwordForm.querySelector('#password2');
        
        passwordForm.addEventListener('submit', function(event) {
            if (password.value !== password2.value) {
                event.preventDefault();
                alert('Passwords do not match.');
                password2.classList.add('error');
            }
        });
    }
    
    // Status indicator color based on status
    const statusIndicators = document.querySelectorAll('.status-indicator');
    if (statusIndicators.length > 0) {
        statusIndicators.forEach(indicator => {
            const status = indicator.textContent.trim().toLowerCase();
            if (status.includes('active')) {
                indicator.classList.add('status-indicator--active');
            } else if (status.includes('inactive')) {
                indicator.classList.add('status-indicator--inactive');
            } else if (status.includes('maintenance')) {
                indicator.classList.add('status-indicator--in-maintenance');
            } else if (status.includes('trip')) {
                indicator.classList.add('status-indicator--on-trip');
            }
        });
    }
});