const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Maintenance management page
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('maintenance/index', {
        title: 'Maintenance Management'
    });
});

module.exports = router;