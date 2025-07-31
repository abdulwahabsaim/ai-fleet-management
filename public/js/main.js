// AI Fleet Management System - Main JavaScript

// Global variables
let topAppBar, drawer, snackbar, userMenu, notificationsMenu;
let socket;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeComponents();
    initializeSocketIO();
    setupEventListeners();
    initializeNotifications();
    
    // Show welcome message
    showNotification('Welcome to AI Fleet Management System!', 'success');
});

// Initialize Material Design Components
function initializeComponents() {
    // Top App Bar
    topAppBar = new mdc.topAppBar.MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
    
    // Navigation Drawer
    const drawerElement = document.querySelector('.mdc-drawer');
    if (drawerElement) {
        drawer = new mdc.drawer.MDCDrawer(drawerElement);
        topAppBar.setScrollTarget(document.querySelector('.main-content'));
        topAppBar.listen('MDCTopAppBar:nav', () => {
            drawer.open = !drawer.open;
        });
    }
    
    // User Menu
    const userMenuElement = document.querySelector('#user-menu');
    if (userMenuElement) {
        userMenu = new mdc.menu.MDCMenu(userMenuElement);
    }
    
    // Notifications Menu
    const notificationsMenuElement = document.querySelector('#notifications-menu');
    if (notificationsMenuElement) {
        notificationsMenu = new mdc.menu.MDCMenu(notificationsMenuElement);
    }
    
    // Initialize all snackbars
    const snackbarElements = document.querySelectorAll('.mdc-snackbar');
    snackbarElements.forEach(element => {
        new mdc.snackbar.MDCSnackbar(element);
    });
    
    // Initialize all buttons
    const buttonElements = document.querySelectorAll('.mdc-button');
    buttonElements.forEach(element => {
        new mdc.ripple.MDCRipple(element);
    });
    
    // Initialize all icon buttons
    const iconButtonElements = document.querySelectorAll('.mdc-icon-button');
    iconButtonElements.forEach(element => {
        new mdc.ripple.MDCRipple(element);
    });
    
    // Initialize all list items
    const listItemElements = document.querySelectorAll('.mdc-list-item');
    listItemElements.forEach(element => {
        new mdc.ripple.MDCRipple(element);
    });
}

// Initialize Socket.IO
function initializeSocketIO() {
    if (typeof io !== 'undefined') {
        socket = io();
        
        // Handle connection
        socket.on('connect', () => {
            console.log('Connected to server');
            showNotification('Connected to real-time updates', 'success');
        });
        
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            showNotification('Connection lost. Trying to reconnect...', 'warning');
        });
        
        // Handle vehicle location updates
        socket.on('vehicleLocationUpdate', (data) => {
            handleVehicleLocationUpdate(data);
        });
        
        // Handle maintenance alerts
        socket.on('maintenanceAlert', (data) => {
            handleMaintenanceAlert(data);
        });
        
        // Handle trip updates
        socket.on('tripUpdate', (data) => {
            handleTripUpdate(data);
        });
        
        // Handle system notifications
        socket.on('systemNotification', (data) => {
            showNotification(data.message, data.type);
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (drawer) {
                drawer.open = !drawer.open;
            }
        });
    }
    
    // User menu
    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', () => {
            userMenu.open = !userMenu.open;
        });
    }
    
    // Notifications
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn && notificationsMenu) {
        notificationsBtn.addEventListener('click', () => {
            notificationsMenu.open = !notificationsMenu.open;
        });
    }
    
    // Clear notifications
    const clearNotificationsBtn = document.getElementById('clear-notifications');
    if (clearNotificationsBtn) {
        clearNotificationsBtn.addEventListener('click', clearAllNotifications);
    }
    
    // Navigation drawer items
    const navItems = document.querySelectorAll('.mdc-drawer .mdc-list-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(navItem => {
                navItem.classList.remove('mdc-list-item--activated');
            });
            // Add active class to clicked item
            item.classList.add('mdc-list-item--activated');
        });
    });
    
    // Form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
    
    // Auto-save functionality
    const autoSaveInputs = document.querySelectorAll('[data-auto-save]');
    autoSaveInputs.forEach(input => {
        input.addEventListener('change', handleAutoSave);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Initialize notifications system
function initializeNotifications() {
    // Check for browser notifications permission
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    // Load existing notifications
    loadNotifications();
}

// Handle form submissions
async function handleFormSubmit(event) {
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    
    try {
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }
        
        // Add loading overlay
        showLoading(true);
        
        // Handle form submission based on form action
        const formData = new FormData(form);
        const action = form.action;
        const method = form.method || 'POST';
        
        const response = await fetch(action, {
            method: method,
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(result.message || 'Operation completed successfully', 'success');
            
            // Handle redirect if specified
            if (result.redirect) {
                setTimeout(() => {
                    window.location.href = result.redirect;
                }, 1000);
            }
        } else {
            showNotification(result.error || 'An error occurred', 'error');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('An error occurred while processing your request', 'error');
    } finally {
        // Reset form state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
        showLoading(false);
    }
}

// Handle auto-save functionality
function handleAutoSave(event) {
    const input = event.target;
    const key = input.dataset.autoSave;
    const value = input.value;
    
    // Save to localStorage
    localStorage.setItem(`auto_save_${key}`, value);
    
    // Show auto-save indicator
    showAutoSaveIndicator();
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + K: Search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        focusSearch();
    }
    
    // Ctrl/Cmd + N: New item
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        createNewItem();
    }
    
    // Escape: Close modals/menus
    if (event.key === 'Escape') {
        closeAllModals();
    }
}

// Handle vehicle location updates
function handleVehicleLocationUpdate(data) {
    // Update map markers
    if (window.updateVehicleLocation) {
        window.updateVehicleLocation(data);
    }
    
    // Update vehicle status in tables
    updateVehicleStatus(data);
    
    // Show notification for significant updates
    if (data.alert) {
        showNotification(`Vehicle ${data.licensePlate} location updated`, 'info');
    }
}

// Handle maintenance alerts
function handleMaintenanceAlert(data) {
    // Add to notifications list
    addNotification({
        type: 'maintenance',
        title: 'Maintenance Alert',
        message: data.message,
        timestamp: new Date(),
        priority: data.priority || 'medium'
    });
    
    // Show browser notification
    if (Notification.permission === 'granted') {
        new Notification('Maintenance Alert', {
            body: data.message,
            icon: '/favicon.ico'
        });
    }
    
    // Update maintenance alerts on dashboard
    if (window.updateMaintenanceAlerts) {
        window.updateMaintenanceAlerts();
    }
}

// Handle trip updates
function handleTripUpdate(data) {
    // Update trip status in tables
    updateTripStatus(data);
    
    // Show notification for trip completion
    if (data.status === 'completed') {
        showNotification(`Trip ${data.tripNumber} completed successfully`, 'success');
    }
    
    // Update dashboard if on dashboard page
    if (window.refreshDashboard) {
        window.refreshDashboard();
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    // Create snackbar element
    const snackbar = document.createElement('div');
    snackbar.className = 'mdc-snackbar';
    snackbar.innerHTML = `
        <div class="mdc-snackbar__surface" role="status" aria-relevant="additions">
            <div class="mdc-snackbar__label" aria-atomic="false">
                ${message}
            </div>
            <div class="mdc-snackbar__actions" aria-atomic="true">
                <button type="button" class="mdc-button mdc-snackbar__action">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Dismiss</span>
                </button>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(snackbar);
    
    // Initialize and show
    const mdcSnackbar = new mdc.snackbar.MDCSnackbar(snackbar);
    mdcSnackbar.labelText = message;
    mdcSnackbar.timeoutMs = duration;
    mdcSnackbar.open();
    
    // Remove after showing
    setTimeout(() => {
        if (snackbar.parentNode) {
            snackbar.parentNode.removeChild(snackbar);
        }
    }, duration + 1000);
}

// Show loading overlay
function showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// Add notification to list
function addNotification(notification) {
    const notificationsList = document.getElementById('notifications-list');
    if (!notificationsList) return;
    
    const notificationItem = document.createElement('li');
    notificationItem.className = 'mdc-list-item';
    notificationItem.innerHTML = `
        <span class="mdc-list-item__ripple"></span>
        <i class="material-icons mdc-list-item__graphic" aria-hidden="true">
            ${getNotificationIcon(notification.type)}
        </i>
        <span class="mdc-list-item__text">
            <div style="font-weight: 500;">${notification.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">
                ${notification.message}
            </div>
            <div style="font-size: 0.625rem; color: var(--text-disabled);">
                ${formatTimestamp(notification.timestamp)}
            </div>
        </span>
    `;
    
    notificationsList.insertBefore(notificationItem, notificationsList.firstChild);
    
    // Limit notifications to 10
    while (notificationsList.children.length > 10) {
        notificationsList.removeChild(notificationsList.lastChild);
    }
    
    // Save to localStorage
    saveNotifications();
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        maintenance: 'build',
        trip: 'navigation',
        vehicle: 'directions_car',
        system: 'info',
        warning: 'warning',
        error: 'error'
    };
    return icons[type] || 'info';
}

// Format timestamp
function formatTimestamp(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return timestamp.toLocaleDateString();
}

// Load notifications from localStorage
function loadNotifications() {
    const saved = localStorage.getItem('notifications');
    if (saved) {
        try {
            const notifications = JSON.parse(saved);
            notifications.forEach(notification => {
                addNotification(notification);
            });
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
}

// Save notifications to localStorage
function saveNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    if (!notificationsList) return;
    
    const notifications = [];
    notificationsList.querySelectorAll('.mdc-list-item').forEach(item => {
        const title = item.querySelector('div').textContent;
        const message = item.querySelectorAll('div')[1].textContent;
        const timestamp = new Date();
        
        notifications.push({
            type: 'system',
            title,
            message,
            timestamp
        });
    });
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Clear all notifications
function clearAllNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = '';
        localStorage.removeItem('notifications');
    }
}

// Update vehicle status in tables
function updateVehicleStatus(data) {
    const vehicleRows = document.querySelectorAll(`[data-vehicle-id="${data.vehicleId}"]`);
    vehicleRows.forEach(row => {
        const statusCell = row.querySelector('.status-indicator');
        if (statusCell) {
            statusCell.textContent = data.status;
            statusCell.className = `status-indicator status-indicator--${data.status}`;
        }
        
        const locationCell = row.querySelector('[data-location]');
        if (locationCell) {
            locationCell.textContent = data.location || 'N/A';
        }
    });
}

// Update trip status in tables
function updateTripStatus(data) {
    const tripRows = document.querySelectorAll(`[data-trip-id="${data.tripId}"]`);
    tripRows.forEach(row => {
        const statusCell = row.querySelector('.status-indicator');
        if (statusCell) {
            statusCell.textContent = data.status;
            statusCell.className = `status-indicator status-indicator--${data.status}`;
        }
    });
}

// Utility functions
function focusSearch() {
    const searchInput = document.querySelector('input[type="search"], .search-input');
    if (searchInput) {
        searchInput.focus();
    }
}

function createNewItem() {
    // Determine current page and create appropriate new item
    const path = window.location.pathname;
    if (path.includes('/vehicles')) {
        window.location.href = '/vehicles/add';
    } else if (path.includes('/routes')) {
        window.location.href = '/routes/add';
    } else if (path.includes('/trips')) {
        window.location.href = '/trips/add';
    }
}

function closeAllModals() {
    // Close any open menus
    if (userMenu) userMenu.open = false;
    if (notificationsMenu) notificationsMenu.open = false;
    if (drawer) drawer.open = false;
}

function showAutoSaveIndicator() {
    // Show a small indicator that auto-save is working
    const indicator = document.createElement('div');
    indicator.className = 'auto-save-indicator';
    indicator.textContent = 'Auto-saved';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius);
        font-size: 0.75rem;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    document.body.appendChild(indicator);
    
    // Show and hide
    setTimeout(() => indicator.style.opacity = '1', 100);
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 300);
    }, 2000);
}

// Export functions for use in other scripts
window.fleetManagement = {
    showNotification,
    showLoading,
    addNotification,
    updateVehicleStatus,
    updateTripStatus,
    socket
};