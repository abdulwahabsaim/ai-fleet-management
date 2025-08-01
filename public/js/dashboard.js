// AI Fleet Management - Dashboard JavaScript

// Global variables for charts
let fuelConsumptionChart;
let tripEfficiencyChart;
let maintenanceCostChart;
let performanceTrendChart;
let dashboardData = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initializeCharts();
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up refresh interval (every 5 minutes)
    setInterval(loadDashboardData, 5 * 60 * 1000);
});

// Initialize chart objects
function initializeCharts() {
    // Fuel consumption chart
    const fuelCtx = document.getElementById('fuelConsumptionChart');
    if (fuelCtx) {
        fuelConsumptionChart = new Chart(fuelCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Fuel Consumption (L)',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e0e0e0'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        });
    }

    // Trip efficiency chart
    const tripCtx = document.getElementById('tripEfficiencyChart');
    if (tripCtx) {
        tripEfficiencyChart = new Chart(tripCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Trip Efficiency Score',
                    data: [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e0e0e0'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        });
    }

    // Maintenance cost chart
    const maintenanceCtx = document.getElementById('maintenanceCostChart');
    if (maintenanceCtx) {
        maintenanceCostChart = new Chart(maintenanceCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Maintenance Cost',
                    data: [],
                    backgroundColor: [
                        'rgba(255, 87, 34, 0.7)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(156, 39, 176, 0.7)',
                        'rgba(0, 150, 136, 0.7)',
                        'rgba(63, 81, 181, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        });
    }

    // Performance trend chart
    const performanceCtx = document.getElementById('performanceTrendChart');
    if (performanceCtx) {
        performanceTrendChart = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Health Score',
                        data: [],
                        borderColor: '#F44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Efficiency Score',
                        data: [],
                        borderColor: '#9C27B0',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e0e0e0'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        });
    }
}

// Load dashboard data from API
function loadDashboardData() {
    // Show loading indicator
    document.querySelectorAll('.chart-container').forEach(container => {
        container.classList.add('loading');
    });
    
    // Fetch dashboard data
    fetch('/api/dashboard/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load dashboard data');
            }
            return response.json();
        })
        .then(data => {
            dashboardData = data;
            updateDashboardStats(data);
            updateAIPredictions(data.aiPredictions);
            
            // Load analytics data for charts
            return fetch('/api/dashboard/analytics?period=month');
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load analytics data');
            }
            return response.json();
        })
        .then(data => {
            updateCharts(data);
            
            // Hide loading indicators
            document.querySelectorAll('.chart-container').forEach(container => {
                container.classList.remove('loading');
            });
        })
        .catch(error => {
            console.error('Dashboard data error:', error);
            showNotification('Failed to load dashboard data. Please try again.', 'error');
            
            // Hide loading indicators
            document.querySelectorAll('.chart-container').forEach(container => {
                container.classList.remove('loading');
            });
        });
}

// Update dashboard statistics
function updateDashboardStats(data) {
    // Update fleet stats
    document.getElementById('totalVehicles').textContent = data.fleet.total;
    document.getElementById('activeVehicles').textContent = data.fleet.active;
    document.getElementById('inMaintenanceVehicles').textContent = data.fleet.inMaintenance;
    document.getElementById('onTripVehicles').textContent = data.fleet.onTrip;
    
    // Update trip stats
    if (document.getElementById('totalTrips')) {
        document.getElementById('totalTrips').textContent = data.trips.total;
    }
    if (document.getElementById('completedTrips')) {
        document.getElementById('completedTrips').textContent = data.trips.completed;
    }
    if (document.getElementById('activeTrips')) {
        document.getElementById('activeTrips').textContent = data.trips.active;
    }
    
    // Update maintenance stats
    if (document.getElementById('overdueMaintenance')) {
        document.getElementById('overdueMaintenance').textContent = data.maintenance.overdue;
    }
    if (document.getElementById('criticalMaintenance')) {
        document.getElementById('criticalMaintenance').textContent = data.maintenance.critical;
    }
    
    // Update performance stats
    if (document.getElementById('averageHealthScore')) {
        document.getElementById('averageHealthScore').textContent = 
            data.performance.averageHealthScore.toFixed(1);
    }
    if (document.getElementById('averageEfficiencyScore')) {
        document.getElementById('averageEfficiencyScore').textContent = 
            data.performance.averageEfficiencyScore.toFixed(1);
    }
    
    // Update fuel stats
    if (document.getElementById('totalFuelConsumed')) {
        document.getElementById('totalFuelConsumed').textContent = 
            data.fuel.totalFuelConsumed.toFixed(1);
    }
    if (document.getElementById('averageConsumption')) {
        document.getElementById('averageConsumption').textContent = 
            data.fuel.averageConsumption.toFixed(1);
    }
}

// Update AI predictions section
function updateAIPredictions(predictions) {
    const predictionsContainer = document.getElementById('aiPredictions');
    if (!predictionsContainer) return;
    
    // Clear existing content
    predictionsContainer.innerHTML = '';
    
    if (predictions && predictions.length > 0) {
        // Sort predictions by health score (ascending)
        predictions.sort((a, b) => a.healthScore - b.healthScore);
        
        // Take top 3 predictions (vehicles with lowest health scores)
        const topPredictions = predictions.slice(0, 3);
        
        topPredictions.forEach(prediction => {
            const predictionCard = document.createElement('div');
            predictionCard.className = 'prediction-card';
            
            // Determine priority class based on health score
            let priorityClass = 'low-priority';
            if (prediction.healthScore < 50) {
                priorityClass = 'high-priority';
            } else if (prediction.healthScore < 75) {
                priorityClass = 'medium-priority';
            }
            
            predictionCard.innerHTML = `
                <div class="prediction-header ${priorityClass}">
                    <h4>${prediction.make} ${prediction.model}</h4>
                    <span>${prediction.licensePlate}</span>
                </div>
                <div class="prediction-body">
                    <div class="score-container">
                        <div class="score health-score">
                            <div class="score-value">${prediction.healthScore}</div>
                            <div class="score-label">Health</div>
                        </div>
                        <div class="score efficiency-score">
                            <div class="score-value">${prediction.efficiencyScore}</div>
                            <div class="score-label">Efficiency</div>
                        </div>
                    </div>
                    <div class="prediction-details">
                        <p><strong>Next Maintenance:</strong> ${formatDate(prediction.nextMaintenance.nextDate)}</p>
                        <p><strong>Recommendations:</strong></p>
                        <ul>
                            ${prediction.recommendations.map(rec => `
                                <li class="${rec.priority}-priority">${rec.message}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
            
            predictionsContainer.appendChild(predictionCard);
        });
    } else {
        // No predictions available
        predictionsContainer.innerHTML = '<p>No AI predictions available at this time.</p>';
    }
}

// Update all charts with new data
function updateCharts(data) {
    // Update fuel consumption chart
    if (fuelConsumptionChart && data.fuelConsumption) {
        fuelConsumptionChart.data.labels = data.fuelConsumption.map(item => item.date);
        fuelConsumptionChart.data.datasets[0].data = data.fuelConsumption.map(item => item.consumption);
        fuelConsumptionChart.update();
    }
    
    // Update trip efficiency chart
    if (tripEfficiencyChart && data.tripEfficiency) {
        tripEfficiencyChart.data.labels = data.tripEfficiency.map(item => item.date);
        tripEfficiencyChart.data.datasets[0].data = data.tripEfficiency.map(item => item.averageEfficiency);
        tripEfficiencyChart.update();
    }
    
    // Update maintenance cost chart
    if (maintenanceCostChart && data.maintenanceCosts) {
        maintenanceCostChart.data.labels = data.maintenanceCosts.map(item => item.category);
        maintenanceCostChart.data.datasets[0].data = data.maintenanceCosts.map(item => item.cost);
        maintenanceCostChart.update();
    }
    
    // Update performance trend chart
    if (performanceTrendChart && data.performanceTrends) {
        performanceTrendChart.data.labels = data.performanceTrends.map(item => item.date);
        performanceTrendChart.data.datasets[0].data = data.performanceTrends.map(item => item.averageHealth);
        performanceTrendChart.data.datasets[1].data = data.performanceTrends.map(item => item.averageEfficiency);
        performanceTrendChart.update();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Period selector for charts
    const periodSelector = document.getElementById('chartPeriodSelector');
    if (periodSelector) {
        periodSelector.addEventListener('change', function() {
            const period = this.value;
            
            // Show loading indicator
            document.querySelectorAll('.chart-container').forEach(container => {
                container.classList.add('loading');
            });
            
            // Fetch analytics data for selected period
            fetch(`/api/dashboard/analytics?period=${period}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load analytics data');
                    }
                    return response.json();
                })
                .then(data => {
                    updateCharts(data);
                    
                    // Hide loading indicators
                    document.querySelectorAll('.chart-container').forEach(container => {
                        container.classList.remove('loading');
                    });
                })
                .catch(error => {
                    console.error('Analytics data error:', error);
                    showNotification('Failed to load analytics data. Please try again.', 'error');
                    
                    // Hide loading indicators
                    document.querySelectorAll('.chart-container').forEach(container => {
                        container.classList.remove('loading');
                    });
                });
        });
    }
    
    // Refresh button
    const refreshButton = document.getElementById('refreshDashboard');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            loadDashboardData();
            showNotification('Dashboard refreshed', 'info');
        });
    }
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
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