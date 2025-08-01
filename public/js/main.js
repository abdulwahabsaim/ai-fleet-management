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

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' :
                 type === 'error' ? 'fas fa-exclamation-circle' :
                 type === 'warning' ? 'fas fa-exclamation-triangle' :
                 'fas fa-info-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Make notification function globally available
window.showNotification = showNotification;