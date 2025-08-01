// Trip Management JavaScript

let tripData = [];
let vehicles = [];
let drivers = [];
let routes = [];

// Initialize the trips page
document.addEventListener('DOMContentLoaded', function() {
    loadTripData();
    loadVehicles();
    loadDrivers();
    loadRoutes();
    setupEventListeners();
});

// Load trip data from API
function loadTripData() {
    fetch('/trips/api')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load trip data');
            }
            return response.json();
        })
        .then(data => {
            tripData = data;
            updateTripStats();
            renderTripList();
        })
        .catch(error => {
            console.error('Error loading trip data:', error);
            showNotification('Failed to load trip data', 'error');
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

// Load drivers for the dropdown
function loadDrivers() {
    fetch('/drivers/api')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load drivers');
            }
            return response.json();
        })
        .then(data => {
            drivers = data;
            populateDriverDropdown();
        })
        .catch(error => {
            console.error('Error loading drivers:', error);
        });
}

// Load routes for the dropdown
function loadRoutes() {
    fetch('/routes/api')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load routes');
            }
            return response.json();
        })
        .then(data => {
            routes = data;
            populateRouteDropdown();
        })
        .catch(error => {
            console.error('Error loading routes:', error);
        });
}

// Update trip statistics
function updateTripStats() {
    const stats = {
        total: tripData.length,
        completed: tripData.filter(t => t.status === 'completed').length,
        inProgress: tripData.filter(t => t.status === 'in_progress').length,
        scheduled: tripData.filter(t => t.status === 'scheduled').length,
        cancelled: tripData.filter(t => t.status === 'cancelled').length
    };

    if (document.getElementById('totalTrips')) {
        document.getElementById('totalTrips').textContent = stats.total;
    }
    if (document.getElementById('completedTrips')) {
        document.getElementById('completedTrips').textContent = stats.completed;
    }
    if (document.getElementById('inProgressTrips')) {
        document.getElementById('inProgressTrips').textContent = stats.inProgress;
    }
    if (document.getElementById('scheduledTrips')) {
        document.getElementById('scheduledTrips').textContent = stats.scheduled;
    }
}

// Render trip list
function renderTripList() {
    const container = document.getElementById('tripList');
    if (!container) return;

    if (tripData.length === 0) {
        container.innerHTML = '<p class="no-data">No trips found.</p>';
        return;
    }

    const table = `
        <table class="table">
            <thead>
                <tr>
                    <th>Trip #</th>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Scheduled Time</th>
                    <th>Status</th>
                    <th>Efficiency</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tripData.map(trip => `
                    <tr>
                        <td>${trip.tripNumber}</td>
                        <td>${trip.route ? trip.route.name : 'N/A'}</td>
                        <td>${trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model} (${trip.vehicle.licensePlate})` : 'N/A'}</td>
                        <td>${trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'N/A'}</td>
                        <td>${formatDateTime(trip.scheduledStartTime)}</td>
                        <td>
                            <span class="status-indicator status-indicator--${getStatusClass(trip.status)}">
                                ${formatStatus(trip.status)}
                            </span>
                        </td>
                        <td>
                            <div class="performance-bar">
                                <div class="performance-fill" style="width: ${trip.efficiencyScore || 0}%">
                                    ${trip.efficiencyScore || 0}%
                                </div>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn--secondary btn--sm" onclick="editTrip('${trip._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            ${trip.status === 'scheduled' ? `
                                <button class="btn btn--success btn--sm" onclick="startTrip('${trip._id}')">
                                    <i class="fas fa-play"></i> Start
                                </button>
                            ` : ''}
                            ${trip.status === 'in_progress' ? `
                                <button class="btn btn--success btn--sm" onclick="completeTrip('${trip._id}')">
                                    <i class="fas fa-check"></i> Complete
                                </button>
                            ` : ''}
                            ${trip.status !== 'completed' && trip.status !== 'cancelled' ? `
                                <button class="btn btn--error btn--sm" onclick="cancelTrip('${trip._id}')">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            ` : ''}
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

// Populate driver dropdown
function populateDriverDropdown() {
    const select = document.getElementById('driver');
    if (!select) return;

    select.innerHTML = '<option value="">Select Driver</option>';
    drivers.forEach(driver => {
        const option = document.createElement('option');
        option.value = driver._id;
        option.textContent = `${driver.firstName} ${driver.lastName}`;
        select.appendChild(option);
    });
}

// Populate route dropdown
function populateRouteDropdown() {
    const select = document.getElementById('route');
    if (!select) return;

    select.innerHTML = '<option value="">Select Route</option>';
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route._id;
        option.textContent = route.name;
        select.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add trip button
    const addBtn = document.getElementById('addTripBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openModal);
    }

    // Modal close button
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Modal form submission
    const form = document.getElementById('tripForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Search functionality
    const searchInput = document.getElementById('searchTrip');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('tripModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Open modal for adding/editing trip
function openModal(tripId = null) {
    const modal = document.getElementById('tripModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('tripForm');

    if (tripId) {
        // Edit mode
        const trip = tripData.find(t => t._id === tripId);
        if (trip) {
            modalTitle.textContent = 'Edit Trip';
            populateForm(trip);
            form.dataset.tripId = tripId;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add Trip';
        form.reset();
        delete form.dataset.tripId;
    }

    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('tripModal');
    modal.style.display = 'none';
}

// Populate form with trip data
function populateForm(trip) {
    document.getElementById('tripNumber').value = trip.tripNumber || '';
    document.getElementById('title').value = trip.title || '';
    document.getElementById('vehicle').value = trip.vehicle || '';
    document.getElementById('driver').value = trip.driver || '';
    document.getElementById('route').value = trip.route || '';
    document.getElementById('scheduledStartTime').value = formatDateTimeLocal(trip.scheduledStartTime);
    document.getElementById('scheduledEndTime').value = formatDateTimeLocal(trip.scheduledEndTime);
    document.getElementById('plannedDistance').value = trip.plannedDistance || '';
    document.getElementById('plannedFuelConsumption').value = trip.plannedFuelConsumption || '';
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const tripId = form.dataset.tripId;
    const formData = new FormData(form);
    
    const tripData = {
        tripNumber: formData.get('tripNumber'),
        title: formData.get('title'),
        vehicle: formData.get('vehicle'),
        driver: formData.get('driver'),
        route: formData.get('route'),
        scheduledStartTime: formData.get('scheduledStartTime'),
        scheduledEndTime: formData.get('scheduledEndTime'),
        plannedDistance: parseFloat(formData.get('plannedDistance')),
        plannedFuelConsumption: parseFloat(formData.get('plannedFuelConsumption')),
        status: 'scheduled',
        createdBy: formData.get('createdBy') || null
    };

    const url = tripId ? `/trips/api/${tripId}` : '/trips/api';
    const method = tripId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tripData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save trip');
        }
        return response.json();
    })
    .then(data => {
        showNotification('Trip saved successfully', 'success');
        closeModal();
        loadTripData();
    })
    .catch(error => {
        console.error('Error saving trip:', error);
        showNotification('Failed to save trip', 'error');
    });
}

// Edit trip
function editTrip(tripId) {
    openModal(tripId);
}

// Start trip
function startTrip(tripId) {
    fetch(`/trips/api/${tripId}/start`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to start trip');
        }
        return response.json();
    })
    .then(data => {
        showNotification('Trip started successfully', 'success');
        loadTripData();
    })
    .catch(error => {
        console.error('Error starting trip:', error);
        showNotification('Failed to start trip', 'error');
    });
}

// Complete trip
function completeTrip(tripId) {
    fetch(`/trips/api/${tripId}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            actualFuelConsumption: 0, // This would typically come from a form
            actualDistance: 0,        // This would typically come from a form
            efficiencyScore: 85       // This would typically be calculated
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to complete trip');
        }
        return response.json();
    })
    .then(data => {
        showNotification('Trip completed successfully', 'success');
        loadTripData();
    })
    .catch(error => {
        console.error('Error completing trip:', error);
        showNotification('Failed to complete trip', 'error');
    });
}

// Cancel trip
function cancelTrip(tripId) {
    if (confirm('Are you sure you want to cancel this trip?')) {
        fetch(`/trips/api/${tripId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cancellationReason: 'Cancelled by user'
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to cancel trip');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Trip cancelled successfully', 'success');
            loadTripData();
        })
        .catch(error => {
            console.error('Error cancelling trip:', error);
            showNotification('Failed to cancel trip', 'error');
        });
    }
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredData = tripData.filter(trip => {
        const tripNumberText = trip.tripNumber ? trip.tripNumber.toString().toLowerCase() : '';
        const titleText = trip.title ? trip.title.toLowerCase() : '';
        const vehicleText = trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model} ${trip.vehicle.licensePlate}`.toLowerCase() : '';
        const driverText = trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}`.toLowerCase() : '';
        const routeText = trip.route ? trip.route.name.toLowerCase() : '';
        
        return tripNumberText.includes(searchTerm) || 
               titleText.includes(searchTerm) || 
               vehicleText.includes(searchTerm) ||
               driverText.includes(searchTerm) ||
               routeText.includes(searchTerm);
    });

    renderFilteredTripList(filteredData);
}

// Render filtered trip list
function renderFilteredTripList(filteredData) {
    const container = document.getElementById('tripList');
    if (!container) return;

    if (filteredData.length === 0) {
        container.innerHTML = '<p class="no-data">No trips found matching your search.</p>';
        return;
    }

    const table = `
        <table class="table">
            <thead>
                <tr>
                    <th>Trip #</th>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Scheduled Time</th>
                    <th>Status</th>
                    <th>Efficiency</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredData.map(trip => `
                    <tr>
                        <td>${trip.tripNumber}</td>
                        <td>${trip.route ? trip.route.name : 'N/A'}</td>
                        <td>${trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model} (${trip.vehicle.licensePlate})` : 'N/A'}</td>
                        <td>${trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'N/A'}</td>
                        <td>${formatDateTime(trip.scheduledStartTime)}</td>
                        <td>
                            <span class="status-indicator status-indicator--${getStatusClass(trip.status)}">
                                ${formatStatus(trip.status)}
                            </span>
                        </td>
                        <td>
                            <div class="performance-bar">
                                <div class="performance-fill" style="width: ${trip.efficiencyScore || 0}%">
                                    ${trip.efficiencyScore || 0}%
                                </div>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn--secondary btn--sm" onclick="editTrip('${trip._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            ${trip.status === 'scheduled' ? `
                                <button class="btn btn--success btn--sm" onclick="startTrip('${trip._id}')">
                                    <i class="fas fa-play"></i> Start
                                </button>
                            ` : ''}
                            ${trip.status === 'in_progress' ? `
                                <button class="btn btn--success btn--sm" onclick="completeTrip('${trip._id}')">
                                    <i class="fas fa-check"></i> Complete
                                </button>
                            ` : ''}
                            ${trip.status !== 'completed' && trip.status !== 'cancelled' ? `
                                <button class="btn btn--error btn--sm" onclick="cancelTrip('${trip._id}')">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            ` : ''}
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
        'cancelled': 'error'
    };
    return classMap[status] || 'inactive';
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
}

function formatDateTimeLocal(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
}

// Global functions for onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.editTrip = editTrip;
window.startTrip = startTrip;
window.completeTrip = completeTrip;
window.cancelTrip = cancelTrip;