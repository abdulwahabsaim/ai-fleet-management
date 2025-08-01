// AI Fleet Management - Routes JavaScript with Leaflet

// Global variables
let map;
let markers = [];
let waypoints = [];
let routeLayer;
let optimizationInProgress = false;

// Initialize the routes page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    initMap();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load routes data
    loadRoutesData();
});

// Initialize the map
function initMap() {
    // Create map centered on a default location
    map = L.map('routeMap').setView([40.7128, -74.0060], 10); // Default to New York

    // Add dark theme tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Initialize route layer
    routeLayer = L.layerGroup().addTo(map);
    
    // Add click listener to map for adding waypoints
    map.on('click', function(e) {
        if (document.getElementById('addWaypointsMode').checked) {
            addWaypoint(e.latlng);
        }
    });
}

// Add a waypoint to the map
function addWaypoint(latlng) {
    const marker = L.marker(latlng, {
        draggable: true,
        icon: L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="marker-inner" style="background-color: #42a5f5;"></div>`,
            iconSize: [20, 20]
        })
    }).addTo(map);
    
    // Add marker to the markers array
    markers.push(marker);
    
    // Add location to waypoints array
    waypoints.push({
        latitude: latlng.lat,
        longitude: latlng.lng
    });
    
    // Add marker drag listener
    marker.on('dragend', function() {
        updateWaypointPosition(marker);
    });
    
    // Add marker click listener for removal
    marker.on('click', function() {
        if (document.getElementById('removeWaypointsMode').checked) {
            removeWaypoint(marker);
        }
    });
    
    // Update the route if we have at least 2 waypoints
    if (waypoints.length >= 2) {
        calculateRoute();
    }
    
    // Update waypoints list in UI
    updateWaypointsList();
}

// Update waypoint position after drag
function updateWaypointPosition(marker) {
    const index = markers.indexOf(marker);
    if (index !== -1) {
        const latlng = marker.getLatLng();
        waypoints[index].latitude = latlng.lat;
        waypoints[index].longitude = latlng.lng;
        calculateRoute();
        updateWaypointsList();
    }
}

// Remove a waypoint
function removeWaypoint(marker) {
    const index = markers.indexOf(marker);
    if (index !== -1) {
        // Remove marker and waypoint
        map.removeLayer(marker);
        markers.splice(index, 1);
        waypoints.splice(index, 1);
        
        // Update route and UI
        if (waypoints.length >= 2) {
            calculateRoute();
        } else {
            // Clear route if less than 2 waypoints
            routeLayer.clearLayers();
        }
        updateWaypointsList();
    }
}

// Calculate and display route
function calculateRoute() {
    if (waypoints.length < 2) return;
    
    // Clear previous route
    routeLayer.clearLayers();
    
    // For simplicity, we'll just draw a straight line between waypoints
    // In a real app, you'd use a routing service like OSRM, GraphHopper, or Mapbox Directions API
    const points = waypoints.map(wp => [wp.latitude, wp.longitude]);
    
    // Create polyline for the route
    const routePolyline = L.polyline(points, {
        color: '#42a5f5',
        weight: 5,
        opacity: 0.7
    }).addTo(routeLayer);
    
    // Fit map to the route
    map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
    
    // Calculate route metrics (simplified)
    calculateRouteMetrics(points);
}

// Calculate route metrics
function calculateRouteMetrics(points) {
    let totalDistance = 0;
    
    // Calculate distance between each pair of points
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = L.latLng(points[i]);
        const p2 = L.latLng(points[i + 1]);
        totalDistance += p1.distanceTo(p2); // in meters
    }
    
    // Convert to kilometers
    const distanceKm = (totalDistance / 1000).toFixed(2);
    
    // Estimate time based on average speed (60 km/h)
    const durationMin = Math.round((distanceKm / 60) * 60);
    
    // Estimate fuel consumption (rough estimate: 8L/100km)
    const fuelConsumption = ((distanceKm / 100) * 8).toFixed(2);
    
    // Update UI
    document.getElementById('routeDistance').textContent = distanceKm;
    document.getElementById('routeDuration').textContent = durationMin;
    document.getElementById('routeFuelConsumption').textContent = fuelConsumption;
    
    // Enable save button if we have a valid route
    document.getElementById('saveRouteBtn').disabled = false;
}

// Update waypoints list in UI
function updateWaypointsList() {
    const waypointsList = document.getElementById('waypointsList');
    if (!waypointsList) return;
    
    // Clear existing list
    waypointsList.innerHTML = '';
    
    // Add each waypoint to the list
    waypoints.forEach(function(waypoint, index) {
        const lat = waypoint.latitude;
        const lng = waypoint.longitude;
        
        const listItem = document.createElement('li');
        listItem.className = 'waypoint-item';
        
        // Different styling for start and end points
        if (index === 0) {
            listItem.innerHTML = `
                <div class="waypoint-marker start-point">A</div>
                <div class="waypoint-info">
                    <div class="waypoint-title">Start Point</div>
                    <div class="waypoint-coords">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
                </div>
            `;
        } else if (index === waypoints.length - 1) {
            listItem.innerHTML = `
                <div class="waypoint-marker end-point">B</div>
                <div class="waypoint-info">
                    <div class="waypoint-title">End Point</div>
                    <div class="waypoint-coords">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
                </div>
            `;
        } else {
            listItem.innerHTML = `
                <div class="waypoint-marker">${index}</div>
                <div class="waypoint-info">
                    <div class="waypoint-title">Waypoint ${index}</div>
                    <div class="waypoint-coords">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
                </div>
            `;
        }
        
        waypointsList.appendChild(listItem);
    });
    
    // Show empty state if no waypoints
    if (waypoints.length === 0) {
        waypointsList.innerHTML = '<li class="empty-state">Click on the map to add waypoints</li>';
    }
}

// Optimize route with AI
function optimizeRouteWithAI() {
    if (waypoints.length < 3) {
        showNotification('Need at least 3 points to optimize route', 'warning');
        return;
    }
    
    // Show optimization in progress
    optimizationInProgress = true;
    document.getElementById('optimizeAIBtn').disabled = true;
    document.getElementById('optimizeAIBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
    
    // Prepare data for API
    const routeData = {
        waypoints: waypoints,
        preferences: {
            avoidTolls: document.getElementById('avoidTolls').checked,
            avoidHighways: document.getElementById('avoidHighways').checked,
            prioritizeFuelEfficiency: document.getElementById('prioritizeFuel').checked
        }
    };
    
    // Call the API
    fetch('/routes/api/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to optimize route');
        }
        return response.json();
    })
    .then(data => {
        // Update waypoints with optimized order
        updateWaypointsOrder(data.optimizedRoute);
        
        // Update UI
        calculateRoute();
        updateWaypointsList();
        
        // Show optimization metrics
        document.getElementById('optimizationScore').textContent = data.optimizationScore;
        document.getElementById('fuelSavings').textContent = data.fuelSavings.toFixed(2);
        document.getElementById('timeSavings').textContent = data.timeSavings.toFixed(0);
        
        // Show optimization results section
        document.getElementById('optimizationResults').style.display = 'block';
        
        showNotification('Route optimized successfully!', 'success');
    })
    .catch(error => {
        console.error('Route optimization error:', error);
        showNotification('Failed to optimize route. Using simple optimization instead.', 'warning');
        
        // Fallback: Simple optimization (just reverse the middle points)
        const middlePoints = waypoints.slice(1, -1);
        middlePoints.reverse();
        
        const optimizedWaypoints = [
            waypoints[0],
            ...middlePoints,
            waypoints[waypoints.length - 1]
        ];
        
        waypoints = optimizedWaypoints;
        
        // Update UI
        calculateRoute();
        updateWaypointsList();
        
        // Show simple optimization results
        document.getElementById('optimizationScore').textContent = '75';
        document.getElementById('fuelSavings').textContent = '0.50';
        document.getElementById('timeSavings').textContent = '5';
        
        // Show optimization results section
        document.getElementById('optimizationResults').style.display = 'block';
    })
    .finally(() => {
        // Reset optimization button
        optimizationInProgress = false;
        document.getElementById('optimizeAIBtn').disabled = false;
        document.getElementById('optimizeAIBtn').innerHTML = '<i class="fas fa-magic"></i> AI Optimize';
    });
}

// Update waypoints order based on optimization
function updateWaypointsOrder(optimizedRoute) {
    if (!optimizedRoute || optimizedRoute.length === 0) return;
    
    // Create new arrays for the optimized order
    const newWaypoints = [];
    const newMarkers = [];
    
    // First point (origin) stays the same
    newWaypoints.push(waypoints[0]);
    newMarkers.push(markers[0]);
    
    // Middle points get reordered
    for (let i = 0; i < optimizedRoute.length; i++) {
        const originalIndex = optimizedRoute[i] + 1; // +1 because we skip the first point
        if (originalIndex < waypoints.length - 1) { // Skip the last point for now
            newWaypoints.push(waypoints[originalIndex]);
            newMarkers.push(markers[originalIndex]);
        }
    }
    
    // Last point (destination) stays the same
    newWaypoints.push(waypoints[waypoints.length - 1]);
    newMarkers.push(markers[markers.length - 1]);
    
    // Replace the old arrays with the new ones
    waypoints = newWaypoints;
    markers = newMarkers;
}

// Save route to database
function saveRoute() {
    if (waypoints.length < 2) {
        showNotification('Need at least start and end points to save route', 'warning');
        return;
    }
    
    // Get route name from user
    const routeName = document.getElementById('routeName').value.trim();
    if (!routeName) {
        showNotification('Please enter a route name', 'warning');
        document.getElementById('routeName').focus();
        return;
    }
    
    // Prepare route data
    const routeData = {
        name: routeName,
        description: document.getElementById('routeDescription').value.trim(),
        waypoints: waypoints.map((wp, index) => ({
            latitude: wp.latitude,
            longitude: wp.longitude,
            name: index === 0 ? 'Start' : index === waypoints.length - 1 ? 'End' : `Waypoint ${index}`,
            order: index
        })),
        totalDistance: parseFloat(document.getElementById('routeDistance').textContent),
        estimatedTime: parseInt(document.getElementById('routeDuration').textContent),
        estimatedFuelConsumption: parseFloat(document.getElementById('routeFuelConsumption').textContent),
        optimizationScore: document.getElementById('optimizationScore') ? 
            parseInt(document.getElementById('optimizationScore').textContent) : 0,
        restrictions: {
            tollRoads: document.getElementById('avoidTolls').checked,
            highways: !document.getElementById('avoidHighways').checked
        }
    };
    
    // Disable save button
    const saveButton = document.getElementById('saveRouteBtn');
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    // Save route via API
    fetch('/routes/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save route');
        }
        return response.json();
    })
    .then(data => {
        showNotification('Route saved successfully!', 'success');
        
        // Reset form
        document.getElementById('routeName').value = '';
        document.getElementById('routeDescription').value = '';
        
        // Reload routes list
        loadRoutesData();
    })
    .catch(error => {
        console.error('Save route error:', error);
        showNotification('Failed to save route. Please try again.', 'error');
    })
    .finally(() => {
        // Reset save button
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Route';
    });
}

// Load routes data from API
function loadRoutesData() {
    const routesList = document.getElementById('routesList');
    if (!routesList) return;
    
    // Show loading indicator
    routesList.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading routes...</div>';
    
    // Fetch routes
    fetch('/routes/api')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load routes');
            }
            return response.json();
        })
        .then(data => {
            // Clear loading indicator
            routesList.innerHTML = '';
            
            if (data && data.length > 0) {
                // Sort routes by creation date (newest first)
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Add each route to the list
                data.forEach(route => {
                    const routeCard = document.createElement('div');
                    routeCard.className = 'route-card';
                    routeCard.innerHTML = `
                        <div class="route-header">
                            <h3>${route.name}</h3>
                            <div class="route-actions">
                                <button class="btn btn--secondary btn--sm" onclick="loadRouteOnMap('${route._id}')">
                                    <i class="fas fa-map-marker-alt"></i>
                                </button>
                                <button class="btn btn--error btn--sm" onclick="deleteRoute('${route._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="route-metrics">
                            <div class="route-metric">
                                <i class="fas fa-road"></i>
                                <span>${route.totalDistance.toFixed(2)} km</span>
                            </div>
                            <div class="route-metric">
                                <i class="fas fa-clock"></i>
                                <span>${route.estimatedTime} min</span>
                            </div>
                            <div class="route-metric">
                                <i class="fas fa-gas-pump"></i>
                                <span>${route.estimatedFuelConsumption.toFixed(2)} L</span>
                            </div>
                        </div>
                        <div class="route-optimization-score">
                            <div class="score-label">Optimization Score</div>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${route.optimizationScore}%"></div>
                            </div>
                            <div class="score-value">${route.optimizationScore}</div>
                        </div>
                        <div class="route-footer">
                            <span class="route-date">Created: ${new Date(route.createdAt).toLocaleDateString()}</span>
                            <span class="route-waypoints">${route.waypoints.length} points</span>
                        </div>
                    `;
                    
                    routesList.appendChild(routeCard);
                });
            } else {
                // No routes found
                routesList.innerHTML = '<div class="empty-state">No routes found. Create your first route!</div>';
            }
        })
        .catch(error => {
            console.error('Load routes error:', error);
            routesList.innerHTML = '<div class="error-state">Failed to load routes. Please try again.</div>';
        });
}

// Load a saved route on the map
function loadRouteOnMap(routeId) {
    // Fetch route details
    fetch(`/routes/api/${routeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load route');
            }
            return response.json();
        })
        .then(data => {
            // Clear existing route
            clearRoute();
            
            // Add waypoints from saved route
            data.waypoints.forEach(wp => {
                const latlng = L.latLng(wp.latitude, wp.longitude);
                addWaypoint(latlng);
            });
            
            // Update route name and description
            document.getElementById('routeName').value = data.name;
            document.getElementById('routeDescription').value = data.description || '';
            
            // Update restrictions checkboxes
            if (data.restrictions) {
                document.getElementById('avoidTolls').checked = data.restrictions.tollRoads;
                document.getElementById('avoidHighways').checked = !data.restrictions.highways;
            }
            
            // Show notification
            showNotification('Route loaded successfully', 'success');
            
            // Scroll to map
            document.getElementById('routeMap').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Load route error:', error);
            showNotification('Failed to load route. Please try again.', 'error');
        });
}

// Delete a route
function deleteRoute(routeId) {
    if (!confirm('Are you sure you want to delete this route?')) {
        return;
    }
    
    // Delete route via API
    fetch(`/routes/api/${routeId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete route');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Route deleted successfully', 'success');
            
            // Reload routes list
            loadRoutesData();
        })
        .catch(error => {
            console.error('Delete route error:', error);
            showNotification('Failed to delete route. Please try again.', 'error');
        });
}

// Clear current route
function clearRoute() {
    // Remove all markers
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    
    // Clear arrays
    markers = [];
    waypoints = [];
    
    // Clear route layer
    routeLayer.clearLayers();
    
    // Reset UI
    updateWaypointsList();
    document.getElementById('routeDistance').textContent = '0.00';
    document.getElementById('routeDuration').textContent = '0';
    document.getElementById('routeFuelConsumption').textContent = '0.00';
    document.getElementById('saveRouteBtn').disabled = true;
    
    // Hide optimization results
    document.getElementById('optimizationResults').style.display = 'none';
}

// Set up event listeners
function setupEventListeners() {
    // Mode toggles
    const addWaypointsMode = document.getElementById('addWaypointsMode');
    const removeWaypointsMode = document.getElementById('removeWaypointsMode');
    
    if (addWaypointsMode && removeWaypointsMode) {
        addWaypointsMode.addEventListener('change', function() {
            if (this.checked) {
                removeWaypointsMode.checked = false;
            }
        });
        
        removeWaypointsMode.addEventListener('change', function() {
            if (this.checked) {
                addWaypointsMode.checked = false;
            }
        });
    }
    
    // Optimize checkbox
    const optimizeRoute = document.getElementById('optimizeRoute');
    if (optimizeRoute) {
        optimizeRoute.addEventListener('change', function() {
            if (waypoints.length >= 2) {
                calculateRoute();
            }
        });
    }
    
    // Route preferences
    const routePreferences = document.querySelectorAll('.route-preference input');
    routePreferences.forEach(preference => {
        preference.addEventListener('change', function() {
            if (waypoints.length >= 2) {
                calculateRoute();
            }
        });
    });
    
    // Clear route button
    const clearRouteBtn = document.getElementById('clearRouteBtn');
    if (clearRouteBtn) {
        clearRouteBtn.addEventListener('click', clearRoute);
    }
    
    // AI optimize button
    const optimizeAIBtn = document.getElementById('optimizeAIBtn');
    if (optimizeAIBtn) {
        optimizeAIBtn.addEventListener('click', function() {
            if (!optimizationInProgress) {
                optimizeRouteWithAI();
            }
        });
    }
    
    // Save route button
    const saveRouteBtn = document.getElementById('saveRouteBtn');
    if (saveRouteBtn) {
        saveRouteBtn.addEventListener('click', saveRoute);
    }
}

// Helper function to show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                            type === 'error' ? 'fa-exclamation-circle' : 
                            type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}