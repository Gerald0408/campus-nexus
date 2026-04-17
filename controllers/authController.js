const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ── GET /register ─────────────────────────────────────────────
exports.showRegister = (req, res) => {
    const flash = req.session.flashError || null;
    delete req.session.flashError;
    res.render('register', { error: flash });
};

// ── POST /api/auth/register ────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { fullname, studentId, email, courses, password, confirmPassword } = req.body;

        // Basic server-side validation
        if (!fullname || !studentId || !password) {
            req.session.flashError = 'Full name, Student ID and password are required.';
            return res.redirect('/register');
        }

        if (password !== confirmPassword) {
            req.session.flashError = 'Passwords do not match.';
            return res.redirect('/register');
        }

        if (password.length < 8) {
            req.session.flashError = 'Password must be at least 8 characters.';
            return res.redirect('/register');
        }

        // Check for duplicate student ID
        const existing = await User.findOne({ studentId });
        if (existing) {
            req.session.flashError = 'That Student ID is already registered.';
            return res.redirect('/register');
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Normalise courses: accept comma-separated string or array
        let parsedCourses = [];
        if (courses) {
            parsedCourses = Array.isArray(courses)
                ? courses.map(c => c.trim()).filter(Boolean)
                : courses.split(',').map(c => c.trim()).filter(Boolean);
        }

        await User.create({
            fullname,
            studentId,
            email: email || undefined,
            courses: parsedCourses,
            password: hashedPassword
        });

        req.session.flashSuccess = `Welcome, ${fullname}! Your account has been created.`;
        return res.redirect('/login');

    } catch (err) {
        console.error('Registration error:', err);
        req.session.flashError = 'Something went wrong. Please try again.';
        return res.redirect('/register');
    }
};

// ── GET /login ─────────────────────────────────────────────────
exports.showLogin = (req, res) => {
    const error = req.session.flashError || null;
    const success = req.session.flashSuccess || null;
    delete req.session.flashError;
    delete req.session.flashSuccess;
    res.render('login', { error, success });
};

// ── POST /api/auth/login ───────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { studentId, password } = req.body;

        if (!studentId || !password) {
            req.session.flashError = 'Student ID and password are required.';
            return res.redirect('/login');
        }

        const user = await User.findOne({ studentId }).select('+password');
        if (!user) {
            // Same message for both "not found" and "wrong password" — avoids user enumeration
            req.session.flashError = 'Invalid Student ID or password.';
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.session.flashError = 'Invalid Student ID or password.';
            return res.redirect('/login');
        }

        // Regenerate session to prevent fixation attacks
        req.session.regenerate((err) => {
            if (err) {
                console.error('Session regeneration error:', err);
                req.session.flashError = 'Login failed. Please try again.';
                return res.redirect('/login');
            }
            req.session.user = {
                id: user._id.toString(),
                name: user.fullname,
                studentId: user.studentId,
                email: user.email || '',
                role: user.role
            };
            res.redirect('/dashboard');
        });

    } catch (err) {
        console.error('Login error:', err);
        req.session.flashError = 'Something went wrong. Please try again.';
        return res.redirect('/login');
    }
};

// ── GET /logout ────────────────────────────────────────────────
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};
