// Environment variable setup
require('dotenv').config();

// Core dependencies
const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Database configuration
const db = require('./config/db');

// Authentication middleware
const auth = require('./middleware/auth');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const violationRoutes = require('./routes/violationRoutes');
const driverAnalyticsRoutes = require('./routes/driverAnalyticsRoutes');
const vehicleAssignmentRoutes = require('./routes/vehicleAssignmentRoutes');
const activityRoutes = require('./routes/activityRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Check for required dependencies at startup
const requiredDependencies = ['pdfkit', 'csv-writer', 'nodemailer', 'moment'];
try {
  requiredDependencies.forEach(dep => {
    require.resolve(dep);
    console.log(`✅ Dépendance trouvée: ${dep}`);
  });
} catch (err) {
  console.error(`❌ Dépendance manquante: ${err.message}`);
  console.error('Exécutez npm install pour installer les dépendances manquantes');
  process.exit(1);
}

// Create temp directory for exports if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  try {
    fs.mkdirSync(tempDir);
    console.log(`✅ Dossier temporaire créé: ${tempDir}`);
  } catch (err) {
    console.error(`❌ Erreur lors de la création du dossier temporaire: ${err.message}`);
    // Continue despite error, folder will be created on first use
  }
}

// Enhanced CORS configuration for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'http://localhost:4028' 
    : ['http://localhost:4028', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Development mode configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment) {
  process.env.BYPASS_AUTH = 'true';
  console.log('⚠️ Mode développement: Authentification assouplie pour le débogage');
}

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Add a global route for violation types (public)
app.get('/api/violations/types', (req, res) => {
  console.log('📊 Serving global violation types');
  const violationTypes = [
    { value: 'speeding', label: 'Excès de vitesse', icon: 'Gauge' },
    { value: 'harsh_braking', label: 'Freinage brusque', icon: 'AlertTriangle' },
    { value: 'harsh_acceleration', label: 'Accélération brusque', icon: 'TrendingUp' },
    { value: 'sharp_cornering', label: 'Virages serrés', icon: 'RotateCcw' },
    { value: 'fatigue', label: 'Fatigue détectée', icon: 'Eye' },
    { value: 'distraction', label: 'Distraction', icon: 'Smartphone' }
  ];
  res.json(violationTypes);
});

// Register routes in proper order (more specific routes first)
app.use('/api/analytics', auth, driverAnalyticsRoutes);
app.use('/api/driver-analytics', auth, driverAnalyticsRoutes); // Keep both paths for backward compatibility
app.use('/api/vehicles', auth, vehicleRoutes);
app.use('/api/drivers', auth, driverRoutes);
app.use('/api/incidents', auth, incidentRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/fleets', auth, fleetRoutes);
app.use('/api/vehicle-assignments', auth, vehicleAssignmentRoutes);
app.use('/api/violations', auth, violationRoutes);
app.use('/api/activities', auth, activityRoutes);
app.use('/api/telemetry', auth, telemetryRoutes);
app.use('/api/devices', auth, deviceRoutes);
app.use('/api/notifications', auth, notificationRoutes);
app.use('/api/dashboard', auth, require('./routes/dashboardRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize WebSocket server
const initWebSocketServer = require('./services/websocket'); 
initWebSocketServer(server);

// Start the server
const PORT = process.env.PORT || 5001;

// Connect to database and then start server
db.getConnection()
  .then(connection => {
    console.log('✅ Connexion à la base de données MySQL réussie');
    connection.release();
    
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ WebSocket server available at ws://localhost:${PORT}/ws`);
      console.log(`✅ Driver Analytics API endpoints disponibles`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données MySQL:', err.message);
    process.exit(1);
  });

// Export for testing
module.exports = app;
