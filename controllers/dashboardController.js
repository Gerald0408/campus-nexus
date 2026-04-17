const User = require('../models/User');

// ── GET /dashboard ─────────────────────────────────────────────
exports.dashboard = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' })
            .select('studentId fullname email courses createdAt')
            .sort({ createdAt: -1 })
            .lean();

        const total = students.length;
        // Placeholder attendance stats (replace with real Attendance model later)
        const present = Math.floor(total * 0.9);
        const absent = total - present;

        res.render('dashboard', {
            currentPage: 'dashboard',
            user: req.session.user,
            students,
            stats: { totalStudents: total, present, absent },
            subjects: [],
            fees: []
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.render('dashboard', {
            currentPage: 'dashboard',
            user: req.session.user,
            students: [],
            stats: { totalStudents: 0, present: 0, absent: 0 },
            subjects: [],
            fees: [],
            error: 'Could not load student data.'
        });
    }
};

// ── GET /students ──────────────────────────────────────────────
exports.students = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' })
            .select('studentId fullname email courses createdAt')
            .sort({ fullname: 1 })
            .lean();

        res.render('dashboard', {
            currentPage: 'students',
            user: req.session.user,
            students,
            stats: { totalStudents: students.length, present: 0, absent: 0 },
            subjects: [],
            fees: []
        });
    } catch (err) {
        console.error('Students page error:', err);
        res.redirect('/dashboard');
    }
};

// ── GET /admission ─────────────────────────────────────────────
exports.admission = (req, res) => {
    res.render('dashboard', {
        currentPage: 'admission',
        user: req.session.user,
        students: [],
        stats: { totalStudents: 0, present: 0, absent: 0 },
        subjects: [],
        fees: []
    });
};

// ── GET /academic ──────────────────────────────────────────────
exports.academic = (req, res) => {
    // TODO: Replace with real Subject model
    const subjects = [
        { code: 'IT101', name: 'Web Development', teacher: 'Engr. Reyes', units: 3 },
        { code: 'IT102', name: 'Database Management', teacher: 'Prof. Ramos', units: 3 },
        { code: 'IT103', name: 'Data Structures', teacher: 'Sir Cruz', units: 3 }
    ];
    res.render('dashboard', {
        currentPage: 'academic',
        user: req.session.user,
        students: [],
        subjects,
        stats: { totalStudents: 0, present: 0, absent: 0 },
        fees: []
    });
};

// ── GET /fees ──────────────────────────────────────────────────
exports.fees = (req, res) => {
    // TODO: Replace with real Fee model
    const fees = [
        { type: 'Tuition Fee', amount: '15,000', status: 'Paid' },
        { type: 'Miscellaneous Fee', amount: '2,500', status: 'Pending' }
    ];
    res.render('dashboard', {
        currentPage: 'fees',
        user: req.session.user,
        students: [],
        subjects: [],
        fees,
        stats: { totalStudents: 0, present: 0, absent: 0 }
    });
};

// ── GET /profile ───────────────────────────────────────────────
exports.profile = async (req, res) => {
    try {
        const userRecord = await User.findById(req.session.user.id).lean();
        res.render('dashboard', {
            currentPage: 'profile',
            user: req.session.user,
            userRecord,
            students: [],
            subjects: [],
            fees: [],
            stats: { totalStudents: 0, present: 0, absent: 0 }
        });
    } catch (err) {
        console.error('Profile error:', err);
        res.redirect('/dashboard');
    }
};

// ── GET /settings ──────────────────────────────────────────────
exports.settings = (req, res) => {
    res.render('dashboard', {
        currentPage: 'settings',
        user: req.session.user,
        students: [],
        subjects: [],
        fees: [],
        stats: { totalStudents: 0, present: 0, absent: 0 }
    });
};
