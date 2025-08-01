const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Trip management page
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('trips/index', {
        title: 'Trip Management'
    });
});

module.exports = router;