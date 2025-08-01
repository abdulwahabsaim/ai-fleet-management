const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Driver management page
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('drivers/index', {
        title: 'Driver Management'
    });
});

module.exports = router;