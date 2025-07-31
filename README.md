# 🚗 AI Fleet & Route Optimization Management System

A comprehensive fleet management system powered by AI that predicts vehicle maintenance, optimizes routes, and reduces fuel consumption. Built with Node.js, Express, MongoDB, and EJS with a beautiful Material Design frontend.

## ✨ Features

### 🎯 Core Features
- **Vehicle Management**: Complete fleet tracking with detailed vehicle information
- **Route Optimization**: AI-powered route planning with multiple optimization algorithms
- **Predictive Maintenance**: Machine learning-based maintenance scheduling
- **Fuel Analytics**: Comprehensive fuel consumption tracking and analysis
- **Real-time Tracking**: Live vehicle location updates with Socket.IO
- **Driver Management**: Driver profiles, performance metrics, and scheduling

### 🤖 AI-Powered Features
- **Maintenance Prediction**: Predicts when vehicles need maintenance based on usage patterns
- **Route Optimization**: Optimizes routes for fuel efficiency, time, and distance
- **Performance Analytics**: AI-driven insights into fleet performance
- **Anomaly Detection**: Identifies unusual patterns in vehicle behavior
- **Predictive Alerts**: Proactive notifications for potential issues

### 📊 Analytics & Reporting
- **Real-time Dashboard**: Live fleet overview with key metrics
- **Performance Charts**: Interactive charts for fuel consumption, efficiency, and costs
- **Custom Reports**: Generate detailed reports for any time period
- **Export Functionality**: Export data to CSV, PDF, or Excel formats

### 🎨 Modern UI/UX
- **Material Design**: Beautiful, responsive interface following Google's Material Design
- **Interactive Maps**: Real-time vehicle tracking with Leaflet.js
- **Mobile Responsive**: Works perfectly on all devices
- **Dark Mode Support**: Automatic dark mode detection
- **Real-time Updates**: Live data updates without page refresh

## 🛠️ Technology Stack

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: Secure authentication and authorization

### Frontend
- **EJS**: Server-side templating engine
- **Material Design Components**: Modern UI components
- **Chart.js**: Interactive charts and graphs
- **Leaflet.js**: Interactive maps
- **CSS3**: Modern styling with CSS Grid and Flexbox

### AI & Analytics
- **Machine Learning**: Predictive maintenance algorithms
- **Route Optimization**: Advanced routing algorithms
- **Data Analytics**: Real-time data processing and analysis

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/ai-fleet-route-optimization-system.git
cd ai-fleet-route-optimization-system
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/fleet_management
MONGODB_URI_PROD=your_production_mongodb_uri

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your_session_secret_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h

# API Keys (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
WEATHER_API_KEY=your_weather_api_key
```

### Step 4: Database Setup
```bash
# Start MongoDB (if not running)
mongod

# Seed initial admin user
node seedAdmin.js
```

### Step 5: Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:5000`

## 🚀 Quick Start

### 1. Access the Application
- Open your browser and navigate to `http://localhost:5000`
- Login with the default admin credentials:
  - Username: `admin`
  - Password: `admin123`

### 2. Add Your First Vehicle
- Navigate to "Vehicles" in the sidebar
- Click "Add Vehicle" button
- Fill in the vehicle details
- Save the vehicle

### 3. Create a Route
- Go to "Routes" section
- Click "Create Route"
- Add waypoints and optimization preferences
- Save the route

### 4. Schedule a Trip
- Navigate to "Trips"
- Create a new trip
- Assign vehicle and driver
- Set route and schedule

## 📋 Project Structure

```
ai-fleet-route-optimization-system/
├── config/                 # Configuration files
│   ├── db.js              # Database connection
│   └── keys.js            # API keys and secrets
├── controllers/           # Route controllers
│   ├── adminController.js # Admin functionality
│   ├── authController.js  # Authentication
│   ├── dashboardController.js # Dashboard analytics
│   ├── routeController.js # Route management
│   └── vehicleController.js # Vehicle management
├── middleware/            # Custom middleware
│   └── authMiddleware.js  # Authentication middleware
├── models/               # Database models
│   ├── Driver.js         # Driver model
│   ├── Maintenance.js    # Maintenance model
│   ├── Route.js          # Route model
│   ├── Trip.js           # Trip model
│   ├── User.js           # User model
│   └── Vehicle.js        # Vehicle model
├── public/               # Static assets
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       ├── main.js       # Main JavaScript
│       └── map.js        # Map functionality
├── routes/               # Route definitions
│   ├── adminRoutes.js    # Admin routes
│   ├── authRoutes.js     # Authentication routes
│   ├── dashboardRoutes.js # Dashboard routes
│   ├── routeRoutes.js    # Route management routes
│   └── vehicleRoutes.js  # Vehicle routes
├── views/                # EJS templates
│   ├── layouts/          # Layout templates
│   ├── partials/         # Reusable components
│   └── ...               # Page templates
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔧 Configuration

### Database Models

#### Vehicle Model
- Basic information (make, model, year, VIN)
- Fuel consumption tracking
- Maintenance history
- Performance metrics
- AI health and efficiency scores

#### Route Model
- Waypoint coordinates
- Optimization factors
- Distance and time calculations
- Fuel consumption estimates

#### Trip Model
- Vehicle and driver assignment
- Route information
- Real-time tracking
- Performance analytics

#### Maintenance Model
- Scheduled maintenance
- Predictive maintenance
- Cost tracking
- Service history

### API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/logout` - User logout

#### Dashboard
- `GET /api/dashboard/data` - Dashboard analytics
- `GET /api/dashboard/analytics` - Chart data

#### Vehicles
- `GET /vehicles` - List all vehicles
- `POST /vehicles` - Add new vehicle
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

#### Routes
- `GET /api/routes` - List all routes
- `POST /api/routes` - Create new route
- `POST /api/routes/optimize` - Optimize route
- `GET /api/routes/recommendations` - Get route recommendations

## 🎨 Customization

### Styling
The application uses CSS custom properties for easy theming. Modify the variables in `public/css/style.css`:

```css
:root {
    --primary-color: #1976d2;
    --secondary-color: #dc004e;
    --success-color: #4caf50;
    --warning-color: #ff9800;
    --error-color: #f44336;
    /* ... more variables */
}
```

### Adding New Features
1. Create a new model in the `models/` directory
2. Add controller logic in `controllers/`
3. Define routes in `routes/`
4. Create views in `views/`
5. Add frontend functionality in `public/js/`

## 🔒 Security Features

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive form validation
- **SQL Injection Protection**: MongoDB with Mongoose
- **XSS Protection**: Content Security Policy headers
- **Rate Limiting**: API rate limiting
- **Session Security**: Secure session configuration

## 📊 Performance Optimization

- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for static assets
- **CDN**: Content Delivery Network for static files
- **Lazy Loading**: On-demand data loading
- **Pagination**: Efficient data pagination

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
```

## 📈 Monitoring & Analytics

- **Real-time Monitoring**: Live system health monitoring
- **Performance Metrics**: Response time and throughput tracking
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: User behavior and usage patterns
- **System Alerts**: Automated alerting for issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/yourusername/ai-fleet-route-optimization-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-fleet-route-optimization-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-fleet-route-optimization-system/discussions)

## 🙏 Acknowledgments

- [Material Design](https://material.io/) for the beautiful UI components
- [Leaflet.js](https://leafletjs.com/) for interactive maps
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Socket.IO](https://socket.io/) for real-time communication

---

**Made with ❤️ for efficient fleet management** 