# 🔧 Environment Setup Guide
## AI Fleet & Route Optimization Management System

This guide will walk you through setting up all the necessary environment variables for the fleet management system.

---

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js (v14 or higher) installed
- MongoDB installed and running
- A code editor (VS Code recommended)

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
MONGODB_URI=mongodb://localhost:27017/aifleetdb
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
PORT=3000
NODE_ENV=development
```

**What to do:**
- Keep `PORT=3000` for local development
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

**Example:**
```env
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
```

### Step 4: File Upload Configuration

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

### Step 5: Security Configuration

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

### Step 6: Logging and Development

```env
# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Development Configuration
DEBUG=true
ENABLE_HOT_RELOAD=true
```

**What to do:**
- Create a `logs` directory in your project root
- Set `LOG_LEVEL` to `debug` for development, `info` for production

---

## 🗺️ Maps Configuration

This project uses Leaflet with OpenStreetMap for maps, which is completely free and doesn't require any API keys. This is a great advantage over Google Maps, which requires API keys and has usage limits.

### Benefits of using Leaflet with OpenStreetMap:
- **Free to use**: No API keys or billing setup required
- **No usage limits**: Unlimited map loads
- **Open source**: Community-supported mapping solution
- **Customizable**: Extensive styling options
- **Privacy-focused**: No tracking of user data

### How it works:
The application uses:
1. **Leaflet.js**: A lightweight JavaScript library for interactive maps
2. **OpenStreetMap**: Free, editable map of the world
3. **CartoDB Dark Matter**: A beautiful dark-themed map style for better UI integration

No additional setup is required for maps functionality!

---

## 🔒 Security Best Practices

### 1. Never Commit .env Files
```bash
# Ensure .env is in your .gitignore
echo ".env" >> .gitignore
```

### 2. Use Different Configurations for Development and Production
- Development: Use local MongoDB
- Production: Use MongoDB Atlas with proper authentication

### 3. Regular Secret Rotation
- Rotate session secrets every 3-6 months
- Monitor application logs for unusual activity

---

## 📝 Complete .env Example

Here's a complete example of your `.env` file:

```env
# AI Fleet & Route Optimization Management System
# Environment Configuration File

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/aifleetdb
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/aifleetdb

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
SESSION_COOKIE_MAX_AGE=86400000

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

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

### 2. Test Map Functionality
- Open your application
- Navigate to the Routes page
- Check if the map loads correctly
- Try adding waypoints and creating routes

### 3. Test File Upload
- Try uploading a vehicle image
- Check if files are saved in the uploads directory

---

## 🆘 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string format
   - Verify network access

2. **Map Not Loading**
   - Check if Leaflet CSS and JS are properly loaded
   - Verify network connectivity to OpenStreetMap servers
   - Check browser console for any JavaScript errors

3. **File Upload Fails**
   - Check upload directory permissions
   - Verify file size limits
   - Check allowed file types

---

## 📞 Support

If you encounter issues:
1. Check the error logs in `./logs/app.log`
2. Ensure all services are running
3. Check the troubleshooting section above

---

**🎉 Congratulations! Your environment is now properly configured for the AI Fleet & Route Optimization Management System!**