// Maintenance Management JavaScript

let maintenanceData = [];
let vehicles = [];

// Initialize the maintenance page
document.addEventListener('DOMContentLoaded', function() {
    loadMaintenanceData();
    loadVehicles();
    setupEventListeners();
});

// Load maintenance data from API
function loadMaintenanceData() {
    fetch('/maintenance/api')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load maintenance data');
            }
            return response.json();
        })
        .then(data => {
            maintenanceData = data;
            updateMaintenanceStats();
            renderMaintenanceList();
        })
        .catch(error => {
            console.error('Error loading maintenance data:', error);
            showNotification('Failed to load maintenance data', 'error');
        });
}

// Load vehicles for the dropdown
function loadVehicles() {
    fetch('/vehicles/api')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load vehicles');
            }
            return response.json();
        })
        .then(data => {
            vehicles = data;
            populateVehicleDropdown();
        })
        .catch(error => {
            console.error('Error loading vehicles:', error);
        });
}

// Update maintenance statistics
function updateMaintenanceStats() {
    const stats = {
        total: maintenanceData.length,
        scheduled: maintenanceData.filter(m => m.status === 'scheduled').length,
        inProgress: maintenanceData.filter(m => m.status === 'in_progress').length,
        overdue: maintenanceData.filter(m => 
            m.status === 'scheduled' && new Date(m.scheduledDate) < new Date()
        ).length
    };

    document.getElementById('totalMaintenance').textContent = stats.total;
    document.getElementById('scheduledMaintenance').textContent = stats.scheduled;
    document.getElementById('inProgressMaintenance').textContent = stats.inProgress;
    document.getElementById('overdueMaintenance').textContent = stats.overdue;
}

// Render maintenance list
function renderMaintenanceList() {
    const container = document.getElementById('maintenanceList');
    if (!container) return;

    if (maintenanceData.length === 0) {
        container.innerHTML = '<p class="no-data">No maintenance records found.</p>';
        return;
    }

    const table = `
        <table class="table">
            <thead>
                <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                    <th>Estimated Cost</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${maintenanceData.map(maintenance => `
                    <tr>
                        <td>${maintenance.vehicle ? `${maintenance.vehicle.make} ${maintenance.vehicle.model} (${maintenance.vehicle.licensePlate})` : 'N/A'}</td>
                        <td>${maintenance.type}</td>
                        <td>${maintenance.category}</td>
                        <td>${formatDate(maintenance.scheduledDate)}</td>
                        <td>
                            <span class="status-indicator status-indicator--${getStatusClass(maintenance.status)}">
                                ${formatStatus(maintenance.status)}
                            </span>
                        </td>
                        <td>$${maintenance.estimatedCost ? maintenance.estimatedCost.toFixed(2) : '0.00'}</td>
                        <td>
                            <button class="btn btn--secondary btn--sm" onclick="editMaintenance('${maintenance._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn--error btn--sm" onclick="deleteMaintenance('${maintenance._id}')">
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

// Populate vehicle dropdown
function populateVehicleDropdown() {
    const select = document.getElementById('vehicle');
    if (!select) return;

    select.innerHTML = '<option value="">Select Vehicle</option>';
    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle._id;
        option.textContent = `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
        select.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add maintenance button
    const addBtn = document.getElementById('addMaintenanceBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openModal);
    }

    // Modal close button
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Modal form submission
    const form = document.getElementById('maintenanceForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Search functionality
    const searchInput = document.getElementById('searchMaintenance');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('maintenanceModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Open modal for adding/editing maintenance
function openModal(maintenanceId = null) {
    const modal = document.getElementById('maintenanceModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('maintenanceForm');

    if (maintenanceId) {
        // Edit mode
        const maintenance = maintenanceData.find(m => m._id === maintenanceId);
        if (maintenance) {
            modalTitle.textContent = 'Edit Maintenance Record';
            populateForm(maintenance);
            form.dataset.maintenanceId = maintenanceId;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add Maintenance Record';
        form.reset();
        delete form.dataset.maintenanceId;
    }

    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('maintenanceModal');
    modal.style.display = 'none';
}

// Populate form with maintenance data
function populateForm(maintenance) {
    document.getElementById('vehicle').value = maintenance.vehicle || '';
    document.getElementById('type').value = maintenance.type || '';
    document.getElementById('category').value = maintenance.category || '';
    document.getElementById('description').value = maintenance.description || '';
    document.getElementById('scheduledDate').value = formatDateTimeLocal(maintenance.scheduledDate);
    document.getElementById('estimatedCost').value = maintenance.estimatedCost || '';
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const maintenanceId = form.dataset.maintenanceId;
    const formData = new FormData(form);
    
    const maintenanceData = {
        vehicle: formData.get('vehicle'),
        type: formData.get('type'),
        category: formData.get('category'),
        description: formData.get('description'),
        scheduledDate: formData.get('scheduledDate'),
        estimatedCost: parseFloat(formData.get('estimatedCost')),
        status: 'scheduled'
    };

    const url = maintenanceId ? `/maintenance/api/${maintenanceId}` : '/maintenance/api';
    const method = maintenanceId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(maintenanceData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save maintenance record');
        }
        return response.json();
    })
    .then(data => {
        showNotification('Maintenance record saved successfully', 'success');
        closeModal();
        loadMaintenanceData();
    })
    .catch(error => {
        console.error('Error saving maintenance:', error);
        showNotification('Failed to save maintenance record', 'error');
    });
}

// Edit maintenance record
function editMaintenance(maintenanceId) {
    openModal(maintenanceId);
}

// Delete maintenance record
function deleteMaintenance(maintenanceId) {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
        fetch(`/maintenance/api/${maintenanceId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete maintenance record');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Maintenance record deleted successfully', 'success');
            loadMaintenanceData();
        })
        .catch(error => {
            console.error('Error deleting maintenance:', error);
            showNotification('Failed to delete maintenance record', 'error');
        });
    }
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredData = maintenanceData.filter(maintenance => {
        const vehicleText = maintenance.vehicle ? 
            `${maintenance.vehicle.make} ${maintenance.vehicle.model} ${maintenance.vehicle.licensePlate}`.toLowerCase() : '';
        const categoryText = maintenance.category ? maintenance.category.toLowerCase() : '';
        const descriptionText = maintenance.description ? maintenance.description.toLowerCase() : '';
        
        return vehicleText.includes(searchTerm) || 
               categoryText.includes(searchTerm) || 
               descriptionText.includes(searchTerm);
    });

    renderFilteredMaintenanceList(filteredData);
}

// Render filtered maintenance list
function renderFilteredMaintenanceList(filteredData) {
    const container = document.getElementById('maintenanceList');
    if (!container) return;

    if (filteredData.length === 0) {
        container.innerHTML = '<p class="no-data">No maintenance records found matching your search.</p>';
        return;
    }

    const table = `
        <table class="table">
            <thead>
                <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                    <th>Estimated Cost</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredData.map(maintenance => `
                    <tr>
                        <td>${maintenance.vehicle ? `${maintenance.vehicle.make} ${maintenance.vehicle.model} (${maintenance.vehicle.licensePlate})` : 'N/A'}</td>
                        <td>${maintenance.type}</td>
                        <td>${maintenance.category}</td>
                        <td>${formatDate(maintenance.scheduledDate)}</td>
                        <td>
                            <span class="status-indicator status-indicator--${getStatusClass(maintenance.status)}">
                                ${formatStatus(maintenance.status)}
                            </span>
                        </td>
                        <td>$${maintenance.estimatedCost ? maintenance.estimatedCost.toFixed(2) : '0.00'}</td>
                        <td>
                            <button class="btn btn--secondary btn--sm" onclick="editMaintenance('${maintenance._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn--error btn--sm" onclick="deleteMaintenance('${maintenance._id}')">
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
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
}

function formatStatus(status) {
    const statusMap = {
        'scheduled': 'Scheduled',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classMap = {
        'scheduled': 'active',
        'in_progress': 'in-maintenance',
        'completed': 'success',
        'cancelled': 'inactive'
    };
    return classMap[status] || 'inactive';
}

// Global functions for onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.editMaintenance = editMaintenance;
window.deleteMaintenance = deleteMaintenance; 