#!/usr/bin/env node

/**
 * AI Fleet & Route Optimization Management System
 * Quick Setup Script
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚗 AI Fleet & Route Optimization Management System');
console.log('==================================================\n');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function generateSecret() {
    return crypto.randomBytes(64).toString('hex');
}

async function createEnvFile() {
    log('📝 Creating .env file...', 'blue');
    
    const envPath = path.join(__dirname, '.env');
    
    if (fs.existsSync(envPath)) {
        const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            log('❌ Setup cancelled.', 'red');
            return false;
        }
    }
    
    // Generate secure secrets
    const sessionSecret = await generateSecret();
    const jwtSecret = await generateSecret();
    
    const envContent = `# AI Fleet & Route Optimization Management System
# Environment Configuration File

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/fleet_management
MONGODB_URI_PROD=mongodb://your-production-mongodb-uri

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=${sessionSecret}
SESSION_COOKIE_MAX_AGE=86400000

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=24h

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@fleetmanagement.com

# External API Keys (Optional - see ENV_SETUP_GUIDE.md for setup instructions)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
WEATHER_API_KEY=your_weather_api_key_here
TRAFFIC_API_KEY=your_traffic_api_key_here

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Monitoring Configuration
ENABLE_MONITORING=true
MONITORING_PORT=3001

# Development Configuration
DEBUG=true
ENABLE_HOT_RELOAD=true
`;
    
    fs.writeFileSync(envPath, envContent);
    log('✅ .env file created successfully!', 'green');
    return true;
}

async function createDirectories() {
    log('📁 Creating necessary directories...', 'blue');
    
    const directories = [
        'logs',
        'uploads',
        'uploads/vehicles',
        'uploads/documents'
    ];
    
    for (const dir of directories) {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            log(`✅ Created directory: ${dir}`, 'green');
        } else {
            log(`ℹ️  Directory already exists: ${dir}`, 'yellow');
        }
    }
}

async function checkDependencies() {
    log('🔍 Checking dependencies...', 'blue');
    
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        log('❌ package.json not found!', 'red');
        return false;
    }
    
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        log('⚠️  node_modules not found. Installing dependencies...', 'yellow');
        const { execSync } = require('child_process');
        try {
            execSync('npm install', { stdio: 'inherit' });
            log('✅ Dependencies installed successfully!', 'green');
        } catch (error) {
            log('❌ Failed to install dependencies!', 'red');
            return false;
        }
    } else {
        log('✅ Dependencies already installed.', 'green');
    }
    
    return true;
}

async function checkMongoDB() {
    log('🔍 Checking MongoDB connection...', 'blue');
    
    try {
        const mongoose = require('mongoose');
        await mongoose.connect('mongodb://localhost:27017/fleet_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        log('✅ MongoDB connection successful!', 'green');
        await mongoose.disconnect();
        return true;
    } catch (error) {
        log('⚠️  MongoDB connection failed. Please ensure MongoDB is running.', 'yellow');
        log('   You can start MongoDB with: mongod', 'yellow');
        const continueAnyway = await question('Continue anyway? (y/N): ');
        return continueAnyway.toLowerCase() === 'y';
    }
}

async function setupGitignore() {
    log('🔒 Setting up .gitignore...', 'blue');
    
    const gitignorePath = path.join(__dirname, '.gitignore');
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Uploads
uploads/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
    
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, gitignoreContent);
        log('✅ .gitignore created successfully!', 'green');
    } else {
        log('ℹ️  .gitignore already exists.', 'yellow');
    }
}

async function main() {
    try {
        log('🚀 Starting setup process...\n', 'blue');
        
        // Check dependencies
        const depsOk = await checkDependencies();
        if (!depsOk) {
            log('❌ Setup failed due to dependency issues.', 'red');
            process.exit(1);
        }
        
        // Create .env file
        const envOk = await createEnvFile();
        if (!envOk) {
            process.exit(0);
        }
        
        // Create directories
        await createDirectories();
        
        // Setup .gitignore
        await setupGitignore();
        
        // Check MongoDB
        await checkMongoDB();
        
        log('\n🎉 Setup completed successfully!', 'green');
        log('\n📋 Next steps:', 'blue');
        log('1. Configure your API keys in the .env file', 'yellow');
        log('2. See ENV_SETUP_GUIDE.md for detailed API setup instructions', 'yellow');
        log('3. Start the application with: npm run dev', 'yellow');
        log('4. Access the application at: http://localhost:5000', 'yellow');
        log('5. Login with default admin credentials: admin/admin123', 'yellow');
        
        log('\n📚 Documentation:', 'blue');
        log('- README.md - Main documentation', 'yellow');
        log('- ENV_SETUP_GUIDE.md - Environment setup guide', 'yellow');
        
    } catch (error) {
        log(`❌ Setup failed: ${error.message}`, 'red');
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run setup if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { main }; 