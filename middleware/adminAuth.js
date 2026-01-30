// Admin authorization middleware - ensures user is admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.isAdmin) {
        // User is admin, continue
        return next();
    }
    
    // User is not admin
    req.flash('error', 'Access denied. Admin privileges required.');
    res.redirect('/');
};

module.exports = { isAdmin };