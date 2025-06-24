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

// Multi-tenant middleware
const { extractTenant, multiTenantMiddleware } = require('./middleware/tenantMiddleware');

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
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const systemStatsRoutes = require('./routes/systemStatsRoutes');
const tenantRoutes = require('./routes/tenantRoutes');

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

// DEBUG: Forcer le CORS à tout autoriser (à ne pas laisser en production)
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-ID', 'X-Tenant-Subdomain']
}));

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware with tenant info
app.use((req, res, next) => {
  const tenantInfo = req.tenant ? `[${req.tenant.name}]` : '[No Tenant]';
  console.log(`[${new Date().toISOString()}] ${tenantInfo} ${req.method} ${req.originalUrl}`);
  next();
});

// Development mode configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment) {
  process.env.BYPASS_AUTH = 'true';
  console.log('⚠️ Mode développement: Authentification assouplie pour le débogage');
}

// Apply multi-tenant middleware to all API routes EXCEPT admin routes
app.use('/api', (req, res, next) => {
  // Skip tenant extraction for admin routes
  if (req.path.startsWith('/admin')) {
    return next();
  }
  extractTenant(req, res, next);
});

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
// All protected routes now include tenant validation
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
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/system-stats', auth, systemStatsRoutes);
app.use('/api/tenants', tenantRoutes);

// Admin routes (no tenant middleware applied)
app.use('/api/admin', adminRoutes);

app.use('/api/owner', ownerRoutes);

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
