const express = require('express');
const router = express.Router();
const driverAnalyticsController = require('../controllers/driverAnalyticsController');
const authMiddleware = require('../middleware/auth');

// Middleware de journalisation pour le débogage
router.use((req, res, next) => {
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes publiques (sans authentification)
router.get('/violations/types', (req, res) => {
  console.log('📊 Serving public violation types');
  // Retourner les types de violations directement
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

// Appliquer le middleware d'authentification aux routes protégées
router.use(authMiddleware);

// Routes protégées pour les analyses des conducteurs
router.get('/drivers/:id/analytics', driverAnalyticsController.getDriverAnalytics);
router.get('/drivers/:id/violations', driverAnalyticsController.getDriverViolations);
router.get('/drivers/:id/metrics', driverAnalyticsController.getDriverMetrics);

// Routes pour les exports
router.get('/drivers/:id/export/pdf', driverAnalyticsController.exportPDFReport);
router.get('/drivers/:id/export/csv', driverAnalyticsController.exportCSVData);
router.post('/drivers/:id/export/email', driverAnalyticsController.emailReport);

// Validation améliorée des paramètres
router.param('id', (req, res, next, id) => {
  try {
    if (!id) {
      console.log('❌ Validation failed: Missing ID parameter');
      return res.status(400).json({ 
        error: 'ID de conducteur manquant',
        details: 'Le paramètre ID est requis'
      });
    }
    
    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      console.log(`❌ Validation failed: Invalid ID format - ${id}`);
      return res.status(400).json({ 
        error: 'ID de conducteur invalide',
        details: 'L\'ID doit être un nombre entier positif'
      });
    }
    
    req.params.id = parsedId;
    console.log(`✅ Validated driver ID: ${parsedId}`);
    next();
  } catch (error) {
    console.error('❌ Error during ID validation:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la validation de l\'ID' });
  }
});

module.exports = router;
