const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // For all vehicle routes

// All routes here require authentication

// @route   GET /vehicles
// @desc    List all vehicles
router.get('/', ensureAuthenticated, vehicleController.listVehicles);

// @route   GET /vehicles/add
// @desc    Show form to add a new vehicle
router.get('/add', ensureAuthenticated, vehicleController.showAddVehicleForm);

// @route   POST /vehicles/add
// @desc    Add a new vehicle
router.post('/add', ensureAuthenticated, vehicleController.addVehicle);

// @route   GET /vehicles/edit/:id
// @desc    Show form to edit a vehicle
router.get('/edit/:id', ensureAuthenticated, vehicleController.showEditVehicleForm);

// @route   POST /vehicles/edit/:id
// @desc    Update a vehicle
router.post('/edit/:id', ensureAuthenticated, vehicleController.updateVehicle);

// @route   POST /vehicles/delete/:id
// @desc    Delete a vehicle
router.post('/delete/:id', ensureAuthenticated, vehicleController.deleteVehicle); // Using POST for delete for forms

module.exports = router;