module.exports = {
    ensureAuthenticated: function(req, res, next) {
        try {
            if (req.session && req.session.userId) { // Check if user ID exists in session
                return next();
            }
            req.flash('error_msg', 'Please log in to view that resource');
            res.redirect('/auth/login');
        } catch (error) {
            console.error('Error in ensureAuthenticated middleware:', error);
            req.flash('error_msg', 'Authentication error. Please log in again.');
            res.redirect('/auth/login');
        }
    },
    ensureAdmin: function(req, res, next) {
        try {
            if (req.session && req.session.userRole === 'admin') {
                return next();
            }
            req.flash('error_msg', 'You do not have administrative privileges');
            res.redirect('/dashboard'); // Or back to login
        } catch (error) {
            console.error('Error in ensureAdmin middleware:', error);
            req.flash('error_msg', 'Authentication error. Please log in again.');
            res.redirect('/auth/login');
        }
    },
    // Middleware to set user in res.locals for EJS
    // This populates req.user and res.locals.user so EJS can access user data
    setUser: function(req, res, next) {
        try {
            if (req.session && req.session.userId && req.session.username && req.session.userRole) {
                res.locals.isAuthenticated = true;
                res.locals.user = {
                    id: req.session.userId,
                    username: req.session.username,
                    role: req.session.userRole
                };
                // Also set req.user for consistency
                req.user = res.locals.user;
            } else {
                res.locals.isAuthenticated = false;
                res.locals.user = null;
                req.user = null;
            }
        } catch (error) {
            console.error('Error in setUser middleware:', error);
            res.locals.isAuthenticated = false;
            res.locals.user = null;
            req.user = null;
        }
        next();
    }
};