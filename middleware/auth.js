/**
 * Middleware: isAuthenticated
 * Protects routes that require a logged-in session.
 * Redirects to /login with an error flash message if not authenticated.
 */
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    req.session.flashError = 'Please log in to continue.';
    return res.redirect('/login');
};

module.exports = { isAuthenticated };
