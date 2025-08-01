const express = require('express');
const router = express.Router();
const DriverController = require('../controllers/driverController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Driver management page
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('drivers/index', {
        title: 'Driver Management'
    });
});

// API Routes
router.get('/api', ensureAuthenticated, (req, res) => DriverController.getAllDrivers(req, res));
router.get('/api/:id', ensureAuthenticated, (req, res) => DriverController.getDriverById(req, res));
router.post('/api', ensureAuthenticated, (req, res) => DriverController.createDriver(req, res));
router.put('/api/:id', ensureAuthenticated, (req, res) => DriverController.updateDriver(req, res));
router.delete('/api/:id', ensureAuthenticated, (req, res) => DriverController.deleteDriver(req, res));
router.get('/api/stats', ensureAuthenticated, (req, res) => DriverController.getDriverStats(req, res));
router.get('/api/available', ensureAuthenticated, (req, res) => DriverController.getAvailableDrivers(req, res));

module.exports = router;