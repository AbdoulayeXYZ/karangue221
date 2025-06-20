const express = require('express');
const cors = require('cors');
require('dotenv').config();

const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const vehicleAssignmentRoutes = require('./routes/vehicleAssignmentRoutes');
const violationRoutes = require('./routes/violationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const db = require('./config/db');

const app = express();
app.use(cors({ origin: 'http://localhost:4028' }));
app.use(express.json());

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fleets', fleetRoutes);
app.use('/api/vehicle-assignments', vehicleAssignmentRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5001;

db.getConnection()
  .then(conn => {
    console.log('✅ Connexion à la base de données MySQL réussie');
    conn.release();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données MySQL :', err.message);
    process.exit(1);
  }); 