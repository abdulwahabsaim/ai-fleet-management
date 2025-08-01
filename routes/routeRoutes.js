const express = require('express');
const router = express.Router();
const RouteController = require('../controllers/routeController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Route management page
router.get('/', ensureAuthenticated, (req, res) => {
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    res.render('routes/index', {
        title: 'Route Management',
        googleMapsApiKey
    });
});

// API Routes
router.get('/api', ensureAuthenticated, (req, res) => RouteController.getAllRoutes(req, res));
router.get('/api/:id', ensureAuthenticated, (req, res) => RouteController.getRoute(req, res));
router.post('/api', ensureAuthenticated, (req, res) => RouteController.createRoute(req, res));
router.put('/api/:id', ensureAuthenticated, (req, res) => RouteController.updateRoute(req, res));
router.delete('/api/:id', ensureAuthenticated, (req, res) => RouteController.deleteRoute(req, res));

// Route optimization routes
router.post('/api/optimize', ensureAuthenticated, (req, res) => RouteController.optimizeRoute(req, res));
router.get('/api/recommendations', ensureAuthenticated, (req, res) => RouteController.getRouteRecommendations(req, res));

module.exports = router;