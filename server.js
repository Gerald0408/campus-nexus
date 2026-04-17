require('dotenv').config();

const express     = require('express');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const session     = require('express-session');
const MongoStore  = require('connect-mongo');
const path        = require('path');
const connectDB   = require('./config/db');

// ── Connect to MongoDB ─────────────────────────────────────────
connectDB();

const app = express();
app.set('trust proxy', 1);

// ── Security headers ───────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc:   ["'self'", "'unsafe-inline'",
                         "https://cdn.jsdelivr.net",
                         "https://fonts.googleapis.com"],
            fontSrc:    ["'self'",
                         "https://fonts.gstatic.com",
                         "https://cdn.jsdelivr.net"],
            scriptSrc:  ["'self'", "'unsafe-inline'",
                         "https://cdn.jsdelivr.net"],
            imgSrc:     ["'self'", "data:", "https:"],
        }
    }
}));

// ── Body parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Static files ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── View engine ────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Rate limiting ──────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
    standardHeaders: true,
    legacyHeaders:   false,
    message: 'Too many requests — please try again later.'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 login attempts per window
    message: 'Too many login attempts — please wait 15 minutes.',
    standardHeaders: true,
    legacyHeaders:   false
});

app.use(globalLimiter);
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Session ────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
    secret: process.env.SESSION_SECRET || (() => {
        if (isProduction) throw new Error('SESSION_SECRET must be set in production');
        console.warn('⚠️  Using insecure fallback session secret. Set SESSION_SECRET in .env');
        return 'dev_fallback_secret_change_me';
    })(),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 60 * 60,        // session TTL: 1 hour
        autoRemove: 'native'
    }),
    cookie: {
        httpOnly: true,
        secure:   isProduction, // HTTPS-only in production
        sameSite: 'lax',
        maxAge:   60 * 60 * 1000  // 1 hour
    },
    name: 'sid'  // Don't expose the default 'connect.sid' name
}));

// ── Routes ─────────────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/login'));
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/dashboardRoutes'));

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).send('<h2>404 — Page not found</h2><a href="/dashboard">Go home</a>');
});

// ── Global error handler ───────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('<h2>500 — Internal Server Error</h2>');
});

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Campus Nexus running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
