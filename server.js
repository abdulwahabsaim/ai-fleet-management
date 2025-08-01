const express = require('express');
const path = require('path');
const ejs = require('ejs'); // Keep EJS as templating engine
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
require('dotenv').config(); // Load environment variables from .env file

// Import database connection
const dbConnect = require('./config/db');

// Connect to database
dbConnect().then(() => {
    logger.info('Database connected successfully');
}).catch((error) => {
    logger.error('Database connection failed', { error: error.message });
});

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "wss:", "ws:"]
        }
    }
}));

// Compression middleware
app.use(compression());

// CORS middleware - Configure for API routes
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
        : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// NOTE: express-ejs-layouts is removed for this setup.
// No app.engine('ejs', require('express-ejs-layouts'));
// No app.set('layout', 'main');

// Static folder for CSS, JS, images
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(express.urlencoded({ extended: false })); // For parsing form data
app.use(express.json()); // For parsing JSON data

// Express session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Use a strong secret from .env
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    }
}));

// Connect flash middleware (for displaying messages)
app.use(flash());

// Custom middleware to set global variables for EJS templates
const { setUser, ensureAuthenticated } = require('./middleware/authMiddleware');
app.use(setUser); // Make user and isAuthenticated available to all EJS templates

// Logging middleware for HTTP requests
app.use((req, res, next) => {
    const start = Date.now();
    
    // Log the request
    logger.info(`Incoming ${req.method} request to ${req.url}`, {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: req.session?.userId || 'anonymous'
    });
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const responseTime = Date.now() - start;
        logger.access(req, res, responseTime);
        originalEnd.call(this, chunk, encoding);
    };
    
    next();
});

// Global variables for flash messages and current path (so they are available in all templates)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.path = req.path;
    res.locals.pageTitle = getPageTitle(req.path);
    next();
});

// Helper function to get page title based on path
function getPageTitle(path) {
    if (path === '/admin/dashboard') return 'Admin Dashboard';
    if (path === '/dashboard') return 'Fleet Dashboard';
    if (path === '/vehicles') return 'Vehicle Management';
    if (path.includes('/vehicles/add')) return 'Add Vehicle';
    if (path.includes('/vehicles/edit')) return 'Edit Vehicle';
    if (path === '/admin/users') return 'User Management';
    if (path === '/auth/register') return 'Create User';
    if (path === '/auth/login') return 'Login';
    return 'AI Fleet Management';
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    // Join user to their room for personalized updates
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
    });

    // Handle vehicle location updates
    socket.on('vehicleLocation', (data) => {
        // Broadcast to all clients (in a real app, you'd filter by permissions)
        io.emit('vehicleLocationUpdate', data);
    });

    // Handle maintenance alerts
    socket.on('maintenanceAlert', (data) => {
        // Send to specific user or admin
        io.to(`user_${data.userId}`).emit('maintenanceAlert', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Make io available to routes
app.set('io', io);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const routeRoutes = require('./routes/routeRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');

// Use Routes
app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/admin', adminRoutes);
app.use('/routes', routeRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Home route - redirect to login or dashboard if already logged in
app.get('/', (req, res) => {
    if (req.session.userId) {
        if (req.session.userRole === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/dashboard'); // For other roles like fleet_manager
        }
    } else {
        res.redirect('/auth/login');
    }
});

// Generic dashboard route for non-admin users (fleet managers)
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    if (req.session.userRole === 'admin') {
        res.redirect('/admin/dashboard');
    } else {
        // Render the generic dashboard specific for non-admin users
        res.render('generic_dashboard', {
            title: 'Fleet Manager Dashboard'
            // user, path, pageTitle, success_msg, and error_msg are available via res.locals
        });
    }
});

// API health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Handle 404 (Not Found)
app.use((req, res, next) => {
    res.status(404).render('404', { // NO layout option here
        title: 'Page Not Found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error occurred', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        userId: req.session?.userId || 'anonymous'
    });
    
    res.status(500).render('500', { // NO layout option here
        title: 'Server Error',
        error: err.message
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
    console.log(`Server running on port ${PORT}`);
});