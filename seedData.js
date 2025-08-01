const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Route = require('./models/Route');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const Maintenance = require('./models/Maintenance');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aifleetdb')
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

// Hash password function
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Create sample data
const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Vehicle.deleteMany({});
        await Route.deleteMany({});
        await Driver.deleteMany({});
        await Trip.deleteMany({});
        await Maintenance.deleteMany({});

        console.log('Cleared existing data');

        // Create users
        const hashedPassword = await hashPassword('123');
        
        const users = await User.insertMany([
            {
                username: 'fitter',
                email: 'fitter@example.com',
                password: hashedPassword,
                role: 'admin',
                firstName: 'Fitter',
                lastName: 'Admin',
                phone: '555-123-4567'
            },
            {
                username: 'wahab',
                email: 'wahab@example.com',
                password: hashedPassword,
                role: 'fleet_manager',
                firstName: 'Wahab',
                lastName: 'Manager',
                phone: '555-234-5678'
            }
        ]);

        console.log('Created users');

        // Create driver users first
        const driverUsers = await User.insertMany([
            {
                username: 'rehan',
                email: 'rehan@example.com',
                password: hashedPassword,
                role: 'driver',
                firstName: 'Rehan',
                lastName: 'Driver',
                phone: '555-345-6789'
            },
            {
                username: 'farhat',
                email: 'farhat@example.com',
                password: hashedPassword,
                role: 'driver',
                firstName: 'Farhat',
                lastName: 'Driver',
                phone: '555-456-7890'
            },
            {
                username: 'shuaib',
                email: 'shuaib@example.com',
                password: hashedPassword,
                role: 'driver',
                firstName: 'Shuaib',
                lastName: 'Driver',
                phone: '555-567-8901'
            },
            {
                username: 'mussa',
                email: 'mussa@example.com',
                password: hashedPassword,
                role: 'driver',
                firstName: 'Mussa',
                lastName: 'Driver',
                phone: '555-678-9012'
            }
        ]);

        console.log('Created driver users');

        // Create drivers
        const drivers = await Driver.insertMany([
            {
                user: driverUsers[0]._id,
                firstName: 'Rehan',
                lastName: 'Driver',
                licenseNumber: 'DL12345678',
                licenseType: 'B',
                licenseExpiryDate: new Date('2025-05-15'),
                phone: '555-345-6789',
                email: 'rehan@example.com',
                dateOfBirth: new Date('1990-05-15'),
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'USA'
                },
                status: 'active',
                availability: 'available',
                performanceScore: 85,
                safetyScore: 90,
                efficiencyMetrics: {
                    fuelEfficiency: 82,
                    timeEfficiency: 85,
                    safetyEfficiency: 90
                },
                hireDate: new Date('2022-01-10')
            },
            {
                user: driverUsers[1]._id,
                firstName: 'Farhat',
                lastName: 'Driver',
                licenseNumber: 'DL87654321',
                licenseType: 'C',
                licenseExpiryDate: new Date('2024-08-22'),
                phone: '555-456-7890',
                email: 'farhat@example.com',
                dateOfBirth: new Date('1988-08-22'),
                address: {
                    street: '456 Oak St',
                    city: 'Chicago',
                    state: 'IL',
                    zipCode: '60601',
                    country: 'USA'
                },
                status: 'on_trip',
                availability: 'busy',
                performanceScore: 92,
                safetyScore: 95,
                efficiencyMetrics: {
                    fuelEfficiency: 88,
                    timeEfficiency: 92,
                    safetyEfficiency: 95
                },
                hireDate: new Date('2021-06-15')
            },
            {
                user: driverUsers[2]._id,
                firstName: 'Shuaib',
                lastName: 'Driver',
                licenseNumber: 'DL24681357',
                licenseType: 'B',
                licenseExpiryDate: new Date('2026-11-03'),
                phone: '555-567-8901',
                email: 'shuaib@example.com',
                dateOfBirth: new Date('1992-11-03'),
                address: {
                    street: '789 Pine St',
                    city: 'Los Angeles',
                    state: 'CA',
                    zipCode: '90001',
                    country: 'USA'
                },
                status: 'active',
                availability: 'off_duty',
                performanceScore: 78,
                safetyScore: 82,
                efficiencyMetrics: {
                    fuelEfficiency: 75,
                    timeEfficiency: 80,
                    safetyEfficiency: 82
                },
                hireDate: new Date('2022-03-20')
            },
            {
                user: driverUsers[3]._id,
                firstName: 'Mussa',
                lastName: 'Driver',
                licenseNumber: 'DL13579246',
                licenseType: 'C',
                licenseExpiryDate: new Date('2025-02-28'),
                phone: '555-678-9012',
                email: 'mussa@example.com',
                dateOfBirth: new Date('1985-02-28'),
                address: {
                    street: '101 Elm St',
                    city: 'Houston',
                    state: 'TX',
                    zipCode: '77001',
                    country: 'USA'
                },
                status: 'active',
                availability: 'available',
                performanceScore: 88,
                safetyScore: 85,
                efficiencyMetrics: {
                    fuelEfficiency: 90,
                    timeEfficiency: 85,
                    safetyEfficiency: 88
                },
                hireDate: new Date('2021-09-05')
            }
        ]);

        console.log('Created drivers');

        // Create vehicles
        const vehicles = await Vehicle.insertMany([
            {
                make: 'Toyota',
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC-123',
                vin: '1HGCM82633A123456',
                status: 'active',
                currentMileage: 25000,
                fuelType: 'gasoline',
                fuelCapacity: 50,
                fuelConsumption: 7.5,
                lastMaintenanceDate: new Date('2023-05-15'),
                nextMaintenanceDate: new Date('2023-11-15'),
                healthScore: 85,
                efficiencyScore: 82,
                maintenanceHistory: [
                    {
                        type: 'routine',
                        date: new Date('2023-05-15'),
                        mileage: 22500,
                        cost: 45,
                        description: 'Regular oil change'
                    },
                    {
                        type: 'routine',
                        date: new Date('2023-03-10'),
                        mileage: 20000,
                        cost: 30,
                        description: 'Rotated all tires'
                    }
                ]
            },
            {
                make: 'Honda',
                model: 'Civic',
                year: 2021,
                licensePlate: 'XYZ-789',
                vin: '2HGES16553H789012',
                status: 'on_trip',
                currentMileage: 18000,
                fuelType: 'gasoline',
                fuelCapacity: 47,
                fuelConsumption: 6.8,
                lastMaintenanceDate: new Date('2023-06-20'),
                nextMaintenanceDate: new Date('2023-12-20'),
                healthScore: 92,
                efficiencyScore: 88,
                maintenanceHistory: [
                    {
                        type: 'routine',
                        date: new Date('2023-06-20'),
                        mileage: 15000,
                        cost: 45,
                        description: 'Regular oil change'
                    },
                    {
                        type: 'repair',
                        date: new Date('2023-04-05'),
                        mileage: 12000,
                        cost: 150,
                        description: 'Replaced front brake pads'
                    }
                ]
            },
            {
                make: 'Ford',
                model: 'Focus',
                year: 2019,
                licensePlate: 'DEF-456',
                vin: '3FAHP0JA9CR345678',
                status: 'in_maintenance',
                currentMileage: 35000,
                fuelType: 'gasoline',
                fuelCapacity: 52,
                fuelConsumption: 8.2,
                lastMaintenanceDate: new Date('2023-07-10'),
                nextMaintenanceDate: new Date('2024-01-10'),
                healthScore: 75,
                efficiencyScore: 70,
                maintenanceHistory: [
                    {
                        type: 'routine',
                        date: new Date('2023-07-10'),
                        mileage: 32000,
                        cost: 250,
                        description: 'Full service including oil change, filters, and fluid checks'
                    },
                    {
                        type: 'repair',
                        date: new Date('2023-05-25'),
                        mileage: 30000,
                        cost: 400,
                        description: 'Replaced all four tires'
                    }
                ]
            },
            {
                make: 'Nissan',
                model: 'Altima',
                year: 2022,
                licensePlate: 'GHI-789',
                vin: '4N1AB6AP7CN901234',
                status: 'active',
                currentMileage: 12000,
                fuelType: 'gasoline',
                fuelCapacity: 55,
                fuelConsumption: 7.0,
                lastMaintenanceDate: new Date('2023-08-05'),
                nextMaintenanceDate: new Date('2024-02-05'),
                healthScore: 95,
                efficiencyScore: 90,
                maintenanceHistory: [
                    {
                        type: 'routine',
                        date: new Date('2023-08-05'),
                        mileage: 10000,
                        cost: 45,
                        description: 'Regular oil change'
                    },
                    {
                        type: 'routine',
                        date: new Date('2023-02-15'),
                        mileage: 5000,
                        cost: 50,
                        description: 'First service inspection'
                    }
                ]
            }
        ]);

        console.log('Created vehicles');

        // Create routes
        const routes = await Route.insertMany([
            {
                name: 'Downtown Delivery Route',
                description: 'Main delivery route covering downtown area',
                waypoints: [
                    { latitude: 40.7128, longitude: -74.0060, name: 'Start Point', order: 0 },
                    { latitude: 40.7282, longitude: -73.9942, name: 'Waypoint 1', order: 1 },
                    { latitude: 40.7338, longitude: -73.9911, name: 'Waypoint 2', order: 2 },
                    { latitude: 40.7484, longitude: -73.9857, name: 'End Point', order: 3 }
                ],
                totalDistance: 8.5,
                estimatedTime: 35,
                estimatedFuelConsumption: 0.7,
                optimizationScore: 85,
                status: 'active',
                createdBy: users[1]._id,
                createdAt: new Date('2023-08-01')
            },
            {
                name: 'Airport Transfer Route',
                description: 'Route from city center to international airport',
                waypoints: [
                    { latitude: 40.7128, longitude: -74.0060, name: 'Start Point', order: 0 },
                    { latitude: 40.6413, longitude: -73.7781, name: 'End Point', order: 1 }
                ],
                totalDistance: 20.2,
                estimatedTime: 45,
                estimatedFuelConsumption: 1.8,
                optimizationScore: 92,
                status: 'active',
                createdBy: users[1]._id,
                createdAt: new Date('2023-08-05')
            },
            {
                name: 'Suburban Delivery Route',
                description: 'Route covering northern suburban areas',
                waypoints: [
                    { latitude: 40.7128, longitude: -74.0060, name: 'Start Point', order: 0 },
                    { latitude: 40.8224, longitude: -73.9495, name: 'Waypoint 1', order: 1 },
                    { latitude: 40.8591, longitude: -73.9135, name: 'Waypoint 2', order: 2 },
                    { latitude: 40.9006, longitude: -73.8465, name: 'Waypoint 3', order: 3 },
                    { latitude: 40.9312, longitude: -73.7987, name: 'End Point', order: 4 }
                ],
                totalDistance: 25.8,
                estimatedTime: 60,
                estimatedFuelConsumption: 2.3,
                optimizationScore: 78,
                status: 'active',
                createdBy: users[1]._id,
                createdAt: new Date('2023-08-10')
            }
        ]);

        console.log('Created routes');

        // Skip creating trips and maintenance records for now
        console.log('Skipping trip and maintenance creation due to schema complexity');

        console.log('Database seeded successfully!');
        console.log('\nLogin credentials:');
        console.log('Admin: username=fitter, password=123');
        console.log('Fleet Manager: username=wahab, password=123');
        console.log('\nDrivers: Rehan, Farhat, Shuaib, Mussa');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed function
seedDatabase();