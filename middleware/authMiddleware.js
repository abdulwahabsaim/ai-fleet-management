module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.session.userId) { // Check if user ID exists in session
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/auth/login');
    },
    ensureAdmin: function(req, res, next) {
        // This assumes req.user is populated after authentication,
        // which would require a check in app.js or a separate middleware.
        // For simplicity in Phase 1, we'll assume we directly check session role.
        if (req.session.userRole === 'admin') {
            return next();
        }
        req.flash('error_msg', 'You do not have administrative privileges');
        res.redirect('/dashboard'); // Or back to login
    },
    // Middleware to set user in res.locals for EJS
    // This populates req.user and res.locals.user so EJS can access user data
    setUser: function(req, res, next) {
        if (req.session.userId && req.session.username && req.session.userRole) {
            res.locals.isAuthenticated = true;
            res.locals.user = {
                id: req.session.userId,
                username: req.session.username,
                role: req.session.userRole
            };
        } else {
            res.locals.isAuthenticated = false;
            res.locals.user = null;
        }
        next();
    }
};