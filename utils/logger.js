const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams for different log levels
const createWriteStream = (filename) => {
    return fs.createWriteStream(path.join(logsDir, filename), { flags: 'a' });
};

const errorStream = createWriteStream('error.log');
const infoStream = createWriteStream('info.log');
const accessStream = createWriteStream('access.log');

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// Current log level (can be set via environment variable)
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

// Helper function to format log messages
const formatLog = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data })
    };
    return JSON.stringify(logEntry) + '\n';
};

// Logger object
const logger = {
    error: (message, data = null) => {
        if (currentLogLevel >= LOG_LEVELS.ERROR) {
            const logMessage = formatLog('ERROR', message, data);
            errorStream.write(logMessage);
            console.error(`[ERROR] ${message}`, data || '');
        }
    },

    warn: (message, data = null) => {
        if (currentLogLevel >= LOG_LEVELS.WARN) {
            const logMessage = formatLog('WARN', message, data);
            infoStream.write(logMessage);
            console.warn(`[WARN] ${message}`, data || '');
        }
    },

    info: (message, data = null) => {
        if (currentLogLevel >= LOG_LEVELS.INFO) {
            const logMessage = formatLog('INFO', message, data);
            infoStream.write(logMessage);
            console.log(`[INFO] ${message}`, data || '');
        }
    },

    debug: (message, data = null) => {
        if (currentLogLevel >= LOG_LEVELS.DEBUG) {
            const logMessage = formatLog('DEBUG', message, data);
            infoStream.write(logMessage);
            console.log(`[DEBUG] ${message}`, data || '');
        }
    },

    // Access log for HTTP requests
    access: (req, res, responseTime) => {
        const logEntry = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            userId: req.session?.userId || 'anonymous'
        };
        
        const logMessage = formatLog('ACCESS', 'HTTP Request', logEntry);
        accessStream.write(logMessage);
    },

    // Database operation logging
    db: (operation, collection, query = null, result = null, error = null) => {
        const logEntry = {
            operation,
            collection,
            ...(query && { query }),
            ...(result && { result }),
            ...(error && { error: error.message })
        };
        
        if (error) {
            logger.error(`Database ${operation} failed`, logEntry);
        } else {
            logger.debug(`Database ${operation} successful`, logEntry);
        }
    }
};

module.exports = logger; 