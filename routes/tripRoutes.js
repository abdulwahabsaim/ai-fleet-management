const express = require('express');
const router = express.Router();
const TripController = require('../controllers/tripController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Trip management page
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('trips/index', {
        title: 'Trip Management'
    });
});

// API Routes for trip management
router.get('/api', ensureAuthenticated, (req, res) => TripController.getAllTrips(req, res));
router.get('/api/stats', ensureAuthenticated, (req, res) => TripController.getTripStats(req, res));
router.get('/api/:id', ensureAuthenticated, (req, res) => TripController.getTripById(req, res));
router.post('/api', ensureAuthenticated, (req, res) => TripController.createTrip(req, res));
router.put('/api/:id', ensureAuthenticated, (req, res) => TripController.updateTrip(req, res));
router.delete('/api/:id', ensureAuthenticated, (req, res) => TripController.deleteTrip(req, res));
router.post('/api/:id/start', ensureAuthenticated, (req, res) => TripController.startTrip(req, res));
router.post('/api/:id/complete', ensureAuthenticated, (req, res) => TripController.completeTrip(req, res));
router.post('/api/:id/cancel', ensureAuthenticated, (req, res) => TripController.cancelTrip(req, res));

module.exports = router;