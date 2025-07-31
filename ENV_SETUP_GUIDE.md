# 🔧 Environment Setup Guide
## AI Fleet & Route Optimization Management System

This guide will walk you through setting up all the necessary environment variables and API keys for the fleet management system.

---

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js (v14 or higher) installed
- MongoDB installed and running
- A code editor (VS Code recommended)
- Basic knowledge of web APIs

---

## 🚀 Step-by-Step Setup

### Step 1: Create the .env File

1. In your project root directory, create a new file named `.env`
2. Copy the contents from `env.example` to your `.env` file

```bash
cp env.example .env
```

### Step 2: Basic Configuration

#### Database Configuration
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/fleet_management
MONGODB_URI_PROD=mongodb://your-production-mongodb-uri
```

**What to do:**
- For local development: Keep the default `MONGODB_URI`
- For production: Replace with your MongoDB Atlas or production database URL

**How to get MongoDB Atlas URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

#### Server Configuration
```env
# Server Configuration
PORT=5000
NODE_ENV=development
```

**What to do:**
- Keep `PORT=5000` for local development
- Change to your preferred port if needed
- Set `NODE_ENV=production` for production deployment

### Step 3: Security Configuration

#### Session Secret
```env
# Session Configuration
SESSION_SECRET=your_super_secret_session_key_here_make_it_long_and_random
```

**How to generate a secure session secret:**
1. **Option 1: Use Node.js crypto**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Option 2: Use an online generator**
   - Go to [Random.org](https://www.random.org/passwords/)
   - Generate a 64-character random string

3. **Option 3: Use a secure password generator**
   - Use tools like LastPass, 1Password, or Bitwarden

**Example:**
```env
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
```

#### JWT Configuration
```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_very_secure
JWT_EXPIRE=24h
```

**How to generate JWT secret:**
- Use the same method as session secret
- Make sure it's different from your session secret

### Step 4: External API Keys

#### Google Maps API Key
```env
# External API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**How to get Google Maps API Key:**

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a new project**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it "Fleet Management System"
   - Click "Create"

3. **Enable Maps JavaScript API**
   - Go to "APIs & Services" → "Library"
   - Search for "Maps JavaScript API"
   - Click on it and click "Enable"

4. **Enable additional APIs (recommended)**
   - **Directions API**: For route optimization
   - **Geocoding API**: For address conversion
   - **Places API**: For location search
   - **Distance Matrix API**: For distance calculations

5. **Create credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

6. **Restrict the API key (important for security)**
   - Click on the created API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain: `localhost:5000/*` for development
   - Under "API restrictions", select "Restrict key"
   - Select the APIs you enabled in step 4

**Example:**
```env
GOOGLE_MAPS_API_KEY=AIzaSyB_Your_Actual_API_Key_Here
```

#### Weather API Key
```env
WEATHER_API_KEY=your_weather_api_key_here
```

**How to get OpenWeatherMap API Key:**

1. **Go to OpenWeatherMap**
   - Visit [OpenWeatherMap](https://openweathermap.org/)
   - Click "Sign Up" and create a free account

2. **Get API Key**
   - After signing up, go to your profile
   - Click "My API Keys"
   - Copy your default API key

3. **Wait for activation**
   - New API keys take 2-4 hours to activate
   - You'll receive an email when it's ready

**Example:**
```env
WEATHER_API_KEY=1234567890abcdef1234567890abcdef
```

#### Traffic API Key (Optional)
```env
TRAFFIC_API_KEY=your_traffic_api_key_here
```

**Options for Traffic Data:**

1. **Google Maps Traffic API**
   - Use the same Google Maps API key
   - Enable "Traffic API" in Google Cloud Console

2. **TomTom Traffic API**
   - Go to [TomTom Developer Portal](https://developer.tomtom.com/)
   - Create a free account
   - Get your API key

3. **HERE Traffic API**
   - Go to [HERE Developer Portal](https://developer.here.com/)
   - Create a free account
   - Get your API key

### Step 5: Email Configuration

#### SMTP Configuration
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@fleetmanagement.com
```

**How to set up Gmail SMTP:**

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2-Factor Authentication

2. **Generate App Password**
   - Go to Google Account → Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Name it "Fleet Management System"
   - Copy the generated 16-character password

3. **Configure your .env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your.email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop  # Your 16-character app password
   EMAIL_FROM=your.email@gmail.com
   ```

**Alternative Email Providers:**

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Step 6: Redis Configuration (Optional)

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
```

**How to set up Redis:**

1. **Install Redis locally**
   - **Windows**: Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)
   - **macOS**: `brew install redis`
   - **Linux**: `sudo apt-get install redis-server`

2. **Start Redis**
   ```bash
   redis-server
   ```

3. **For production, use Redis Cloud**
   - Go to [Redis Cloud](https://redis.com/try-free/)
   - Create a free account
   - Create a database
   - Copy the connection URL

### Step 7: File Upload Configuration

```env
# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

**What to do:**
- `MAX_FILE_SIZE`: 5MB in bytes (5242880)
- `UPLOAD_PATH`: Keep default for local development
- `ALLOWED_FILE_TYPES`: Add/remove file types as needed

### Step 8: Security Configuration

```env
# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**What to do:**
- `BCRYPT_ROUNDS`: Keep at 12 for good security/performance balance
- `RATE_LIMIT_WINDOW_MS`: 15 minutes in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

### Step 9: Logging and Monitoring

```env
# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Monitoring Configuration
ENABLE_MONITORING=true
MONITORING_PORT=3001
```

**What to do:**
- Create a `logs` directory in your project root
- Set `LOG_LEVEL` to `debug` for development, `info` for production
- Enable monitoring for production environments

---

## 🔒 Security Best Practices

### 1. Never Commit .env Files
```bash
# Ensure .env is in your .gitignore
echo ".env" >> .gitignore
```

### 2. Use Different Keys for Development and Production
- Development: Use free tier APIs
- Production: Use paid tiers with higher limits

### 3. Restrict API Keys
- Always restrict API keys to your domain
- Use environment-specific keys

### 4. Regular Key Rotation
- Rotate API keys every 3-6 months
- Monitor API usage for unusual activity

---

## 📝 Complete .env Example

Here's a complete example of your `.env` file:

```env
# AI Fleet & Route Optimization Management System
# Environment Configuration File

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/fleet_management
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/fleet_management

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
SESSION_COOKIE_MAX_AGE=86400000

# JWT Configuration
JWT_SECRET=b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3
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
SMTP_USER=your.email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
EMAIL_FROM=your.email@gmail.com

# External API Keys
GOOGLE_MAPS_API_KEY=AIzaSyB_Your_Actual_Google_Maps_API_Key_Here
WEATHER_API_KEY=1234567890abcdef1234567890abcdef
TRAFFIC_API_KEY=your_traffic_api_key_here

# Redis Configuration
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
```

---

## 🧪 Testing Your Configuration

### 1. Test Database Connection
```bash
npm run dev
```
Check if MongoDB connects successfully.

### 2. Test Google Maps API
- Open your application
- Navigate to any page with maps
- Check browser console for API errors

### 3. Test Email Configuration
- Try the "Contact Us" or "Forgot Password" feature
- Check if emails are sent successfully

### 4. Test File Upload
- Try uploading a vehicle image
- Check if files are saved in the uploads directory

---

## 🆘 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string format
   - Verify network access

2. **Google Maps API Error**
   - Check if API key is correct
   - Ensure required APIs are enabled
   - Check API key restrictions

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check if 2FA is enabled for Gmail
   - Ensure app password is correct

4. **File Upload Fails**
   - Check upload directory permissions
   - Verify file size limits
   - Check allowed file types

---

## 📞 Support

If you encounter issues:
1. Check the error logs in `./logs/app.log`
2. Verify all API keys are correct
3. Ensure all services are running
4. Check the troubleshooting section above

---

**🎉 Congratulations! Your environment is now properly configured for the AI Fleet & Route Optimization Management System!** 