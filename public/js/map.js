// AI Fleet Management System - Map and Location Services

// Global map variables
let map, vehicleMarkers = {}, routeLayers = {}, currentRoute = null;
let mapInitialized = false;

// Map configuration
const MAP_CONFIG = {
    defaultCenter: [40.7128, -74.0060], // New York City
    defaultZoom: 10,
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
};

// Vehicle marker icons
const VEHICLE_ICONS = {
    active: L.divIcon({
        className: 'vehicle-marker vehicle-marker--active',
        html: '<i class="material-icons">directions_car</i>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    }),
    inactive: L.divIcon({
        className: 'vehicle-marker vehicle-marker--inactive',
        html: '<i class="material-icons">directions_car</i>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    }),
    maintenance: L.divIcon({
        className: 'vehicle-marker vehicle-marker--maintenance',
        html: '<i class="material-icons">build</i>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    }),
    trip: L.divIcon({
        className: 'vehicle-marker vehicle-marker--trip',
        html: '<i class="material-icons">navigation</i>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    })
};

// Initialize map
function initializeMap(containerId = 'map', options = {}) {
    if (mapInitialized) return;
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Map container not found:', containerId);
        return;
    }
    
    // Merge options with defaults
    const mapOptions = {
        center: options.center || MAP_CONFIG.defaultCenter,
        zoom: options.zoom || MAP_CONFIG.defaultZoom,
        zoomControl: true,
        attributionControl: true,
        ...options
    };
    
    // Create map instance
    map = L.map(containerId, mapOptions);
    
    // Add tile layer
    L.tileLayer(MAP_CONFIG.tileLayer, {
        attribution: MAP_CONFIG.attribution,
        maxZoom: 18
    }).addTo(map);
    
    // Add scale control
    L.control.scale().addTo(map);
    
    // Add fullscreen control
    L.control.fullscreen({
        position: 'topleft',
        title: 'Full Screen',
        titleCancel: 'Exit Full Screen'
    }).addTo(map);
    
    // Add layer control
    const layerControl = L.control.layers(null, null, {
        position: 'topright',
        collapsed: false
    }).addTo(map);
    
    // Store layer control for later use
    map.layerControl = layerControl;
    
    // Add custom controls
    addMapControls();
    
    // Set up event listeners
    setupMapEventListeners();
    
    mapInitialized = true;
    console.log('Map initialized successfully');
    
    // Trigger map ready event
    const event = new CustomEvent('mapReady', { detail: { map } });
    document.dispatchEvent(event);
}

// Add custom map controls
function addMapControls() {
    // Vehicle filter control
    const vehicleFilterControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-vehicle-filter');
            container.innerHTML = `
                <div class="vehicle-filter-panel">
                    <h4>Vehicle Filters</h4>
                    <label>
                        <input type="checkbox" id="filter-active" checked> Active
                    </label>
                    <label>
                        <input type="checkbox" id="filter-inactive"> Inactive
                    </label>
                    <label>
                        <input type="checkbox" id="filter-maintenance"> Maintenance
                    </label>
                    <label>
                        <input type="checkbox" id="filter-trip" checked> On Trip
                    </label>
                </div>
            `;
            
            // Add event listeners
            container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', updateVehicleVisibility);
            });
            
            return container;
        }
    });
    
    map.addControl(new vehicleFilterControl());
    
    // Route optimization control
    const routeControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-route');
            container.innerHTML = `
                <button class="route-optimize-btn" onclick="optimizeCurrentRoute()">
                    <i class="material-icons">timeline</i>
                    Optimize Route
                </button>
            `;
            
            return container;
        }
    });
    
    map.addControl(new routeControl());
}

// Setup map event listeners
function setupMapEventListeners() {
    // Map click event
    map.on('click', function(e) {
        const latlng = e.latlng;
        console.log('Map clicked at:', latlng);
        
        // Show coordinates in a popup
        L.popup()
            .setLatLng(latlng)
            .setContent(`
                <div class="coordinates-popup">
                    <h4>Coordinates</h4>
                    <p>Latitude: ${latlng.lat.toFixed(6)}</p>
                    <p>Longitude: ${latlng.lng.toFixed(6)}</p>
                    <button onclick="addWaypoint(${latlng.lat}, ${latlng.lng})">
                        Add as Waypoint
                    </button>
                </div>
            `)
            .openOn(map);
    });
    
    // Map zoom event
    map.on('zoomend', function() {
        updateMarkerSizes();
    });
    
    // Map move event
    map.on('moveend', function() {
        // Update visible vehicles if needed
        updateVisibleVehicles();
    });
}

// Add vehicle to map
function addVehicle(vehicle) {
    if (!map || !vehicle.currentLocation) return;
    
    const latlng = [vehicle.currentLocation.latitude, vehicle.currentLocation.longitude];
    const icon = VEHICLE_ICONS[vehicle.status] || VEHICLE_ICONS.inactive;
    
    // Create marker
    const marker = L.marker(latlng, { icon })
        .bindPopup(createVehiclePopup(vehicle))
        .addTo(map);
    
    // Store marker reference
    vehicleMarkers[vehicle._id] = marker;
    
    // Add to layer control
    const layerName = `Vehicle: ${vehicle.licensePlate}`;
    map.layerControl.addOverlay(marker, layerName);
    
    return marker;
}

// Update vehicle location
function updateVehicleLocation(data) {
    const marker = vehicleMarkers[data.vehicleId];
    if (!marker) return;
    
    const newLatlng = [data.latitude, data.longitude];
    
    // Smooth animation to new position
    marker.slideTo(newLatlng, {
        duration: 2000,
        keepAtZoom: true
    });
    
    // Update popup content
    marker.getPopup().setContent(createVehiclePopup(data));
    
    // Update vehicle status if changed
    if (data.status && data.status !== marker.vehicleStatus) {
        marker.setIcon(VEHICLE_ICONS[data.status] || VEHICLE_ICONS.inactive);
        marker.vehicleStatus = data.status;
    }
}

// Create vehicle popup content
function createVehiclePopup(vehicle) {
    const statusClass = `status-indicator status-indicator--${vehicle.status}`;
    const healthColor = vehicle.healthScore > 70 ? 'green' : vehicle.healthScore > 40 ? 'orange' : 'red';
    
    return `
        <div class="vehicle-popup">
            <div class="vehicle-popup__header">
                <h4>${vehicle.make} ${vehicle.model}</h4>
                <span class="vehicle-popup__plate">${vehicle.licensePlate}</span>
            </div>
            
            <div class="vehicle-popup__status">
                <span class="${statusClass}">${vehicle.status}</span>
            </div>
            
            <div class="vehicle-popup__details">
                <div class="detail-item">
                    <span class="detail-label">Health Score:</span>
                    <span class="detail-value" style="color: ${healthColor};">${vehicle.healthScore}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Fuel Level:</span>
                    <span class="detail-value">${vehicle.currentFuelLevel}L / ${vehicle.fuelCapacity}L</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mileage:</span>
                    <span class="detail-value">${vehicle.currentMileage.toLocaleString()} km</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Last Update:</span>
                    <span class="detail-value">${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
            
            <div class="vehicle-popup__actions">
                <button onclick="viewVehicleDetails('${vehicle._id}')" class="btn btn--primary btn--small">
                    <i class="material-icons">visibility</i>
                    View Details
                </button>
                <button onclick="trackVehicle('${vehicle._id}')" class="btn btn--secondary btn--small">
                    <i class="material-icons">gps_fixed</i>
                    Track
                </button>
            </div>
        </div>
    `;
}

// Add route to map
function addRoute(route) {
    if (!map || !route.waypoints || route.waypoints.length < 2) return;
    
    // Create route coordinates
    const coordinates = route.waypoints.map(wp => [wp.latitude, wp.longitude]);
    
    // Create polyline
    const polyline = L.polyline(coordinates, {
        color: '#1976d2',
        weight: 4,
        opacity: 0.8
    }).addTo(map);
    
    // Add start and end markers
    const startMarker = L.marker(coordinates[0], {
        icon: L.divIcon({
            className: 'route-marker route-marker--start',
            html: '<i class="material-icons">trip_origin</i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    }).addTo(map);
    
    const endMarker = L.marker(coordinates[coordinates.length - 1], {
        icon: L.divIcon({
            className: 'route-marker route-marker--end',
            html: '<i class="material-icons">place</i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    }).addTo(map);
    
    // Add waypoint markers
    const waypointMarkers = [];
    route.waypoints.slice(1, -1).forEach((wp, index) => {
        const marker = L.marker([wp.latitude, wp.longitude], {
            icon: L.divIcon({
                className: 'route-marker route-marker--waypoint',
                html: `<span>${index + 1}</span>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(map);
        waypointMarkers.push(marker);
    });
    
    // Create route layer group
    const routeLayer = L.layerGroup([polyline, startMarker, endMarker, ...waypointMarkers]);
    
    // Store route reference
    routeLayers[route._id] = {
        polyline,
        startMarker,
        endMarker,
        waypointMarkers,
        layer: routeLayer
    };
    
    // Add to layer control
    map.layerControl.addOverlay(routeLayer, `Route: ${route.name}`);
    
    // Fit map to route bounds
    map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    
    return routeLayer;
}

// Optimize current route
async function optimizeCurrentRoute() {
    if (!currentRoute) {
        showNotification('No route selected for optimization', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch('/api/routes/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                routeId: currentRoute._id,
                preferences: {
                    priority: 'fuel' // or 'time', 'distance'
                }
            })
        });
        
        const optimizedRoute = await response.json();
        
        if (response.ok) {
            // Remove current route
            removeRoute(currentRoute._id);
            
            // Add optimized route
            addRoute(optimizedRoute);
            
            showNotification('Route optimized successfully', 'success');
        } else {
            showNotification(optimizedRoute.error || 'Failed to optimize route', 'error');
        }
        
    } catch (error) {
        console.error('Route optimization error:', error);
        showNotification('Failed to optimize route', 'error');
    } finally {
        showLoading(false);
    }
}

// Remove route from map
function removeRoute(routeId) {
    const routeData = routeLayers[routeId];
    if (!routeData) return;
    
    // Remove from map
    routeData.layer.remove();
    
    // Remove from layer control
    map.layerControl.removeLayer(routeData.layer);
    
    // Remove from storage
    delete routeLayers[routeId];
}

// Add waypoint to current route
function addWaypoint(lat, lng) {
    if (!currentRoute) {
        showNotification('No route selected', 'warning');
        return;
    }
    
    // Add waypoint to route
    currentRoute.waypoints.push({
        latitude: lat,
        longitude: lng,
        order: currentRoute.waypoints.length
    });
    
    // Update route on map
    removeRoute(currentRoute._id);
    addRoute(currentRoute);
    
    showNotification('Waypoint added to route', 'success');
}

// Update vehicle visibility based on filters
function updateVehicleVisibility() {
    const filters = {
        active: document.getElementById('filter-active').checked,
        inactive: document.getElementById('filter-inactive').checked,
        maintenance: document.getElementById('filter-maintenance').checked,
        trip: document.getElementById('filter-trip').checked
    };
    
    Object.values(vehicleMarkers).forEach(marker => {
        const status = marker.vehicleStatus || 'inactive';
        const shouldShow = filters[status];
        
        if (shouldShow) {
            marker.addTo(map);
        } else {
            marker.remove();
        }
    });
}

// Update marker sizes based on zoom level
function updateMarkerSizes() {
    const zoom = map.getZoom();
    const scale = Math.max(0.5, Math.min(1.5, zoom / 10));
    
    Object.values(vehicleMarkers).forEach(marker => {
        const icon = marker.getIcon();
        if (icon.options) {
            icon.options.iconSize = [32 * scale, 32 * scale];
            icon.options.iconAnchor = [16 * scale, 16 * scale];
            marker.setIcon(icon);
        }
    });
}

// Update visible vehicles (for performance optimization)
function updateVisibleVehicles() {
    const bounds = map.getBounds();
    
    Object.values(vehicleMarkers).forEach(marker => {
        const latlng = marker.getLatLng();
        const isVisible = bounds.contains(latlng);
        
        // Update marker visibility or load additional data if needed
        if (isVisible && !marker.isVisible) {
            marker.isVisible = true;
            // Load additional vehicle data if needed
        } else if (!isVisible && marker.isVisible) {
            marker.isVisible = false;
        }
    });
}

// View vehicle details
function viewVehicleDetails(vehicleId) {
    window.location.href = `/vehicles/${vehicleId}`;
}

// Track specific vehicle
function trackVehicle(vehicleId) {
    const marker = vehicleMarkers[vehicleId];
    if (!marker) return;
    
    // Center map on vehicle
    map.setView(marker.getLatLng(), 15);
    
    // Highlight vehicle
    marker.setZIndexOffset(1000);
    
    // Show tracking notification
    showNotification('Tracking vehicle', 'info');
    
    // Reset z-index after animation
    setTimeout(() => {
        marker.setZIndexOffset(0);
    }, 2000);
}

// Get current map bounds
function getMapBounds() {
    if (!map) return null;
    return map.getBounds();
}

// Fit map to all vehicles
function fitMapToVehicles() {
    if (!map || Object.keys(vehicleMarkers).length === 0) return;
    
    const group = new L.featureGroup(Object.values(vehicleMarkers));
    map.fitBounds(group.getBounds(), { padding: [20, 20] });
}

// Clear all map data
function clearMap() {
    // Remove all vehicle markers
    Object.values(vehicleMarkers).forEach(marker => {
        marker.remove();
    });
    vehicleMarkers = {};
    
    // Remove all routes
    Object.keys(routeLayers).forEach(routeId => {
        removeRoute(routeId);
    });
    
    // Clear layer control
    if (map.layerControl) {
        map.layerControl.clearLayers();
    }
}

// Export functions for global use
window.mapServices = {
    initializeMap,
    addVehicle,
    updateVehicleLocation,
    addRoute,
    removeRoute,
    optimizeCurrentRoute,
    fitMapToVehicles,
    clearMap,
    getMapBounds
};

// Auto-initialize map if container exists
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        initializeMap('map');
    }
});