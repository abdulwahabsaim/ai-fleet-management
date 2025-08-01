const express = require('express');
const router = express.Router();
const MaintenanceController = require('../controllers/maintenanceController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Maintenance management page
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('maintenance/index', {
        title: 'Maintenance Management'
    });
});

// API Routes
router.get('/api', ensureAuthenticated, (req, res) => MaintenanceController.getAllMaintenance(req, res));
router.get('/api/:id', ensureAuthenticated, (req, res) => MaintenanceController.getMaintenanceById(req, res));
router.post('/api', ensureAuthenticated, (req, res) => MaintenanceController.createMaintenance(req, res));
router.put('/api/:id', ensureAuthenticated, (req, res) => MaintenanceController.updateMaintenance(req, res));
router.delete('/api/:id', ensureAuthenticated, (req, res) => MaintenanceController.deleteMaintenance(req, res));
router.get('/api/stats', ensureAuthenticated, (req, res) => MaintenanceController.getMaintenanceStats(req, res));

module.exports = router;