// Driver Management JavaScript

let driverData = [];

// Initialize the drivers page
document.addEventListener('DOMContentLoaded', function() {
    loadDriverData();
    setupEventListeners();
});

// Load driver data from API
function loadDriverData() {
    fetch('/drivers/api')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load driver data');
            }
            return response.json();
        })
        .then(data => {
            driverData = data;
            updateDriverStats();
            renderDriverList();
        })
        .catch(error => {
            console.error('Error loading driver data:', error);
            showNotification('Failed to load driver data', 'error');
        });
}

// Update driver statistics
function updateDriverStats() {
    const stats = {
        total: driverData.length,
        active: driverData.filter(d => d.status === 'active').length,
        onTrip: driverData.filter(d => d.status === 'on_trip').length,
        onLeave: driverData.filter(d => d.status === 'on_leave').length,
        suspended: driverData.filter(d => d.status === 'suspended').length
    };

    if (document.getElementById('totalDrivers')) {
        document.getElementById('totalDrivers').textContent = stats.total;
    }
    if (document.getElementById('activeDrivers')) {
        document.getElementById('activeDrivers').textContent = stats.active;
    }
    if (document.getElementById('onTripDrivers')) {
        document.getElementById('onTripDrivers').textContent = stats.onTrip;
    }
    if (document.getElementById('onLeaveDrivers')) {
        document.getElementById('onLeaveDrivers').textContent = stats.onLeave;
    }
    if (document.getElementById('suspendedDrivers')) {
        document.getElementById('suspendedDrivers').textContent = stats.suspended;
    }
}

// Render driver list
function renderDriverList() {
    const container = document.getElementById('driverList');
    if (!container) return;

    if (driverData.length === 0) {
        container.innerHTML = '<p class="no-data">No drivers found.</p>';
        return;
    }

    const table = `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>License</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Performance</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${driverData.map(driver => `
                    <tr>
                        <td>${driver.firstName} ${driver.lastName}</td>
                        <td>${driver.licenseNumber} (${driver.licenseType})</td>
                        <td>${driver.phone}</td>
                        <td>
                            <span class="status-indicator status-indicator--${getStatusClass(driver.status)}">
                                ${formatStatus(driver.status)}
                            </span>
                        </td>
                        <td>
                            <div class="performance-bar">
                                <div class="performance-fill" style="width: ${driver.performanceScore || 0}%">
                                    ${driver.performanceScore || 0}%
                                </div>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn--secondary btn--sm" onclick="editDriver('${driver._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn--error btn--sm" onclick="deleteDriver('${driver._id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Setup event listeners
function setupEventListeners() {
    // Add driver button
    const addBtn = document.getElementById('addDriverBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openModal);
    }

    // Modal close button
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Modal form submission
    const form = document.getElementById('driverForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Search functionality
    const searchInput = document.getElementById('searchDriver');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('driverModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Open modal for adding/editing driver
function openModal(driverId = null) {
    const modal = document.getElementById('driverModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('driverForm');

    if (driverId) {
        // Edit mode
        const driver = driverData.find(d => d._id === driverId);
        if (driver) {
            modalTitle.textContent = 'Edit Driver';
            populateForm(driver);
            form.dataset.driverId = driverId;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add Driver';
        form.reset();
        delete form.dataset.driverId;
    }

    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('driverModal');
    modal.style.display = 'none';
}

// Populate form with driver data
function populateForm(driver) {
    document.getElementById('firstName').value = driver.firstName || '';
    document.getElementById('lastName').value = driver.lastName || '';
    document.getElementById('email').value = driver.email || '';
    document.getElementById('phone').value = driver.phone || '';
    document.getElementById('licenseNumber').value = driver.licenseNumber || '';
    document.getElementById('licenseType').value = driver.licenseType || '';
    document.getElementById('licenseExpiryDate').value = formatDateInput(driver.licenseExpiryDate);
    document.getElementById('status').value = driver.status || 'active';
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const driverId = form.dataset.driverId;
    const formData = new FormData(form);
    
    const driverData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        licenseNumber: formData.get('licenseNumber'),
        licenseType: formData.get('licenseType'),
        licenseExpiryDate: formData.get('licenseExpiryDate'),
        status: formData.get('status'),
        user: formData.get('user') || null
    };

    const url = driverId ? `/drivers/api/${driverId}` : '/drivers/api';
    const method = driverId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(driverData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save driver');
        }
        return response.json();
    })
    .then(data => {
        showNotification('Driver saved successfully', 'success');
        closeModal();
        loadDriverData();
    })
    .catch(error => {
        console.error('Error saving driver:', error);
        showNotification('Failed to save driver', 'error');
    });
}

// Edit driver
function editDriver(driverId) {
    openModal(driverId);
}

// Delete driver
function deleteDriver(driverId) {
    if (confirm('Are you sure you want to delete this driver?')) {
        fetch(`/drivers/api/${driverId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete driver');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Driver deleted successfully', 'success');
            loadDriverData();
        })
        .catch(error => {
            console.error('Error deleting driver:', error);
            showNotification('Failed to delete driver', 'error');
        });
    }
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredData = driverData.filter(driver => {
        const nameText = `${driver.firstName} ${driver.lastName}`.toLowerCase();
        const licenseText = driver.licenseNumber ? driver.licenseNumber.toLowerCase() : '';
        const phoneText = driver.phone ? driver.phone.toLowerCase() : '';
        const emailText = driver.email ? driver.email.toLowerCase() : '';
        
        return nameText.includes(searchTerm) || 
               licenseText.includes(searchTerm) || 
               phoneText.includes(searchTerm) ||
               emailText.includes(searchTerm);
    });

    renderFilteredDriverList(filteredData);
}

// Render filtered driver list
function renderFilteredDriverList(filteredData) {
    const container = document.getElementById('driverList');
    if (!container) return;

    if (filteredData.length === 0) {
        container.innerHTML = '<p class="no-data">No drivers found matching your search.</p>';
        return;
    }

    const table = `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>License</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Performance</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredData.map(driver => `
                    <tr>
                        <td>${driver.firstName} ${driver.lastName}</td>
                        <td>${driver.licenseNumber} (${driver.licenseType})</td>
                        <td>${driver.phone}</td>
                        <td>
                            <span class="status-indicator status-indicator--${getStatusClass(driver.status)}">
                                ${formatStatus(driver.status)}
                            </span>
                        </td>
                        <td>
                            <div class="performance-bar">
                                <div class="performance-fill" style="width: ${driver.performanceScore || 0}%">
                                    ${driver.performanceScore || 0}%
                                </div>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn--secondary btn--sm" onclick="editDriver('${driver._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn--error btn--sm" onclick="deleteDriver('${driver._id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Helper functions
function formatStatus(status) {
    const statusMap = {
        'active': 'Active',
        'inactive': 'Inactive',
        'on_trip': 'On Trip',
        'on_leave': 'On Leave',
        'suspended': 'Suspended'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classMap = {
        'active': 'active',
        'inactive': 'inactive',
        'on_trip': 'in-maintenance',
        'on_leave': 'warning',
        'suspended': 'error'
    };
    return classMap[status] || 'inactive';
}

function formatDateInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Global functions for onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.editDriver = editDriver;
window.deleteDriver = deleteDriver;