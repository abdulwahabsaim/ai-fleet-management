// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initDashboardMap();
});

function initDashboardMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    // Create map centered on a default location
    const map = L.map('map').setView([40.7128, -74.0060], 10); // Default to New York
    
    // Add dark theme tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    // Add sample vehicle markers
    const vehicles = [
        { 
            make: 'Toyota', 
            model: 'Corolla', 
            licensePlate: 'ABC-123', 
            status: 'active',
            location: { lat: 40.7128, lng: -74.0060 }
        },
        { 
            make: 'Honda', 
            model: 'Civic', 
            licensePlate: 'XYZ-789', 
            status: 'on_trip',
            location: { lat: 40.7328, lng: -73.9860 }
        }
    ];
    
    // Add markers for each vehicle
    vehicles.forEach(vehicle => {
        // Determine marker color based on status
        let markerColor;
        switch (vehicle.status) {
            case 'active':
                markerColor = '#28a745'; // Green
                break;
            case 'inactive':
                markerColor = '#6c757d'; // Gray
                break;
            case 'in_maintenance':
                markerColor = '#ffc107'; // Yellow
                break;
            case 'on_trip':
                markerColor = '#17a2b8'; // Blue
                break;
            default:
                markerColor = '#6c757d'; // Gray
        }
        
        // Create custom marker
        const marker = L.marker([vehicle.location.lat, vehicle.location.lng], {
            icon: L.divIcon({
                className: 'custom-map-marker',
                html: `<div class="marker-inner" style="background-color: ${markerColor};"></div>`,
                iconSize: [20, 20]
            })
        }).addTo(map);
        
        // Add popup with vehicle info
        marker.bindPopup(`
            <strong>${vehicle.make} ${vehicle.model}</strong><br>
            License: ${vehicle.licensePlate}<br>
            Status: ${vehicle.status}
        `);
    });
    
    // Connect to Socket.IO for real-time updates
    if (typeof io !== 'undefined') {
        const socket = io();
        
        // Listen for vehicle location updates
        socket.on('vehicleLocationUpdate', function(data) {
            console.log('Vehicle location update:', data);
            // In a real app, you would update the marker position here
        });
    }
}