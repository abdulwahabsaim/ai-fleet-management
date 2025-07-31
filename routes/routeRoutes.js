const express = require('express');
const router = express.Router();
const RouteController = require('../controllers/routeController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Route management routes
router.get('/', ensureAuthenticated, (req, res) => RouteController.getAllRoutes(req, res));
router.get('/:id', ensureAuthenticated, (req, res) => RouteController.getRoute(req, res));
router.post('/', ensureAuthenticated, (req, res) => RouteController.createRoute(req, res));
router.put('/:id', ensureAuthenticated, (req, res) => RouteController.updateRoute(req, res));
router.delete('/:id', ensureAuthenticated, (req, res) => RouteController.deleteRoute(req, res));

// Route optimization routes
router.post('/optimize', ensureAuthenticated, (req, res) => RouteController.optimizeRoute(req, res));
router.get('/recommendations', ensureAuthenticated, (req, res) => RouteController.getRouteRecommendations(req, res));

module.exports = router; 