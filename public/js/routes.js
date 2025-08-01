// AI Fleet Management - Routes JavaScript

// Global variables
let map;
let directionsService;
let directionsRenderer;
let markers = [];
let waypoints = [];
let optimizationInProgress = false;

// Initialize the routes page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map if Google Maps API is available
    if (typeof google !== 'undefined') {
        initMap();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load routes data
    loadRoutesData();
});

// Initialize the map
function initMap() {
    // Create map centered on a default location
    map = new google.maps.Map(document.getElementById('routeMap'), {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to New York
        zoom: 10,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
            },
            {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
            },
            {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
            },
            {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
            },
        ],
    });
    
    // Initialize directions service and renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#42a5f5',
            strokeWeight: 5,
            strokeOpacity: 0.7
        }
    });
    
    // Add click listener to map for adding waypoints
    map.addListener('click', function(event) {
        if (document.getElementById('addWaypointsMode').checked) {
            addWaypoint(event.latLng);
        }
    });
}

// Add a waypoint to the map
function addWaypoint(location) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#42a5f5',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff'
        }
    });
    
    // Add marker to the markers array
    markers.push(marker);
    
    // Add location to waypoints array
    waypoints.push({
        location: location,
        stopover: true
    });
    
    // Add marker drag listener
    marker.addListener('dragend', function() {
        updateWaypointPosition(marker);
    });
    
    // Add marker click listener for removal
    marker.addListener('click', function() {
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
        waypoints[index].location = marker.getPosition();
        calculateRoute();
        updateWaypointsList();
    }
}

// Remove a waypoint
function removeWaypoint(marker) {
    const index = markers.indexOf(marker);
    if (index !== -1) {
        // Remove marker and waypoint
        marker.setMap(null);
        markers.splice(index, 1);
        waypoints.splice(index, 1);
        
        // Update route and UI
        if (waypoints.length >= 2) {
            calculateRoute();
        } else {
            directionsRenderer.setDirections({ routes: [] });
        }
        updateWaypointsList();
    }
}

// Calculate and display route
function calculateRoute() {
    if (waypoints.length < 2) return;
    
    const origin = waypoints[0].location;
    const destination = waypoints[waypoints.length - 1].location;
    const waypointsMiddle = waypoints.slice(1, -1);
    
    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypointsMiddle,
        optimizeWaypoints: document.getElementById('optimizeRoute').checked,
        travelMode: google.maps.TravelMode.DRIVING
    };
    
    directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            
            // Update route metrics
            updateRouteMetrics(result);
        }
    });
}

// Update route metrics in UI
function updateRouteMetrics(result) {
    const route = result.routes[0];
    let totalDistance = 0;
    let totalDuration = 0;
    
    // Calculate total distance and duration
    route.legs.forEach(function(leg) {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const distanceKm = (totalDistance / 1000).toFixed(2);
    const durationMin = Math.round(totalDuration / 60);
    
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
        const lat = waypoint.location.lat();
        const lng = waypoint.location.lng();
        
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
        waypoints: waypoints.map(wp => ({
            latitude: wp.location.lat(),
            longitude: wp.location.lng()
        })),
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
        showNotification('Failed to optimize route. Please try again.', 'error');
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
            latitude: wp.location.lat(),
            longitude: wp.location.lng(),
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
            
            if (data.routes && data.routes.length > 0) {
                // Sort routes by creation date (newest first)
                data.routes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Add each route to the list
                data.routes.forEach(route => {
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
                const latLng = new google.maps.LatLng(wp.latitude, wp.longitude);
                addWaypoint(latLng);
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
        marker.setMap(null);
    });
    
    // Clear arrays
    markers = [];
    waypoints = [];
    
    // Clear directions
    directionsRenderer.setDirections({ routes: [] });
    
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
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback if main.js notification function is not available
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}