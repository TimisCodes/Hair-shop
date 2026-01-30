// Authentication middleware - protects routes
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        // User is logged in, continue
        return next();
    }
    
    // User not logged in, redirect to login
    req.flash('error', 'Please log in to continue');
    res.redirect('/auth/login');
};

// Middleware to pass user data to all views
const loadUser = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const User = require('../models/User');
            const user = await User.findById(req.session.userId);
            res.locals.user = user;
        } catch (error) {
            console.error('Error loading user:', error);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};

module.exports = { isAuthenticated, loadUser };