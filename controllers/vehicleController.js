const Vehicle = require('../models/Vehicle');
const User = require('../models/User'); // To get who registered the vehicle if needed

module.exports = {
    // Show all vehicles
    listVehicles: async (req, res) => {
        try {
            const vehicles = await Vehicle.find({});
            res.render('vehicles/list', { // Removed layout: 'main'
                vehicles: vehicles,
                success_msg: req.flash('success_msg'),
                error_msg: req.flash('error_msg')
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Could not retrieve vehicles.');
            res.redirect('/dashboard'); // Redirect to dashboard on error
        }
    },

    // Show form to add new vehicle
    showAddVehicleForm: (req, res) => {
        res.render('vehicles/add', { // Removed layout: 'main'
            error_msg: req.flash('error_msg')
        });
    },

    // Handle adding new vehicle
    addVehicle: async (req, res) => {
        const { make, model, year, vin, licensePlate, capacity, currentMileage } = req.body;
        let errors = [];

        // Basic validation
        if (!make || !model || !year || !vin || !licensePlate) {
            errors.push({ msg: 'Please enter all required fields.' });
        }
        if (vin && vin.length !== 17) {
            errors.push({ msg: 'VIN must be 17 characters long.' });
        }

        if (errors.length > 0) {
            req.flash('error_msg', errors.map(err => err.msg).join(', '));
            return res.redirect('/vehicles/add');
        }

        try {
            // Check if VIN or license plate already exists
            const existingVehicle = await Vehicle.findOne({ $or: [{ vin: vin.toUpperCase() }, { licensePlate: licensePlate.toUpperCase() }] });
            if (existingVehicle) {
                req.flash('error_msg', 'Vehicle with this VIN or License Plate already exists.');
                return res.redirect('/vehicles/add');
            }

            const newVehicle = new Vehicle({
                make,
                model,
                year,
                vin: vin.toUpperCase(),
                licensePlate: licensePlate.toUpperCase(),
                capacity: capacity || 0, // Default to 0 if not provided
                currentMileage: currentMileage || 0,
                registeredBy: req.session.userId // Associate with the logged-in user
            });

            await newVehicle.save();
            req.flash('success_msg', 'Vehicle added successfully!');
            res.redirect('/vehicles');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error adding vehicle.');
            res.redirect('/vehicles/add');
        }
    },

    // Show form to edit existing vehicle
    showEditVehicleForm: async (req, res) => {
        try {
            const vehicle = await Vehicle.findById(req.params.id);
            if (!vehicle) {
                req.flash('error_msg', 'Vehicle not found.');
                return res.redirect('/vehicles');
            }
            res.render('vehicles/edit', { // Removed layout: 'main'
                vehicle: vehicle,
                error_msg: req.flash('error_msg')
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error retrieving vehicle for edit.');
            res.redirect('/vehicles');
        }
    },

    // Handle updating vehicle
    updateVehicle: async (req, res) => {
        const { make, model, year, vin, licensePlate, capacity, currentMileage, status, lastMaintenanceDate, currentLocation_latitude, currentLocation_longitude } = req.body;
        let errors = [];

        // Basic validation (similar to add)
        if (!make || !model || !year || !vin || !licensePlate) {
            errors.push({ msg: 'Please enter all required fields.' });
        }
        if (vin && vin.length !== 17) {
            errors.push({ msg: 'VIN must be 17 characters long.' });
        }

        if (errors.length > 0) {
            req.flash('error_msg', errors.map(err => err.msg).join(', '));
            return res.redirect('/vehicles/edit/' + req.params.id);
        }

        try {
            const vehicle = await Vehicle.findById(req.params.id);
            if (!vehicle) {
                req.flash('error_msg', 'Vehicle not found.');
                return res.redirect('/vehicles');
            }

            // Check for duplicate VIN/License Plate excluding the current vehicle
            const duplicateVehicle = await Vehicle.findOne({
                $or: [{ vin: vin.toUpperCase() }, { licensePlate: licensePlate.toUpperCase() }],
                _id: { $ne: req.params.id } // Exclude the current vehicle
            });
            if (duplicateVehicle) {
                req.flash('error_msg', 'Another vehicle with this VIN or License Plate already exists.');
                return res.redirect('/vehicles/edit/' + req.params.id);
            }

            // Update fields
            vehicle.make = make;
            vehicle.model = model;
            vehicle.year = year;
            vehicle.vin = vin.toUpperCase();
            vehicle.licensePlate = licensePlate.toUpperCase();
            vehicle.capacity = capacity || 0;
            vehicle.currentMileage = currentMileage || 0;
            vehicle.status = status;
            vehicle.lastMaintenanceDate = lastMaintenanceDate ? new Date(lastMaintenanceDate) : undefined;
            vehicle.currentLocation = {
                latitude: currentLocation_latitude || 0,
                longitude: currentLocation_longitude || 0
            };


            await vehicle.save();
            req.flash('success_msg', 'Vehicle updated successfully!');
            res.redirect('/vehicles');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error updating vehicle.');
            res.redirect('/vehicles/edit/' + req.params.id);
        }
    },

    // Handle deleting vehicle
    deleteVehicle: async (req, res) => {
        try {
            const result = await Vehicle.findByIdAndDelete(req.params.id);
            if (!result) {
                req.flash('error_msg', 'Vehicle not found or already deleted.');
                return res.redirect('/vehicles');
            }
            req.flash('success_msg', 'Vehicle deleted successfully!');
            res.redirect('/vehicles');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error deleting vehicle.');
            res.redirect('/vehicles');
        }
    }
};