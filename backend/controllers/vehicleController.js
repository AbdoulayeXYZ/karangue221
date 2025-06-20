const Vehicle = require('../models/vehicleModel');

/**
 * Enrich vehicle data with all necessary properties for frontend display
 * @param {Object} vehicle - Raw vehicle data from database
 * @returns {Object} - Enriched vehicle data with all required properties
 */
function enrichVehicleData(vehicle) {
  // Handle registration property (using license_plate if available)
  vehicle.registration = vehicle.license_plate || vehicle.registration || 'Non défini';
  
  // Add image property with default if not present
  vehicle.image = vehicle.image_url || `https://via.placeholder.com/400x300?text=${encodeURIComponent(vehicle.registration || 'Véhicule')}`;
  
  // Status with default (active, maintenance, offline)
  vehicle.status = vehicle.status || 'active';
  
  // Handle driver information if available
  if (vehicle.driver_id) {
    vehicle.driver = {
      id: vehicle.driver_id,
      name: vehicle.driver_name || 'Conducteur',
      phone: vehicle.driver_phone || 'Non défini',
      iButtonId: vehicle.driver_ibutton || vehicle.license_number || 'Non défini'
    };
  }
  
  // Add insurance information
  vehicle.insurance = {
    provider: vehicle.insurance_provider || 'Non renseigné',
    policyNumber: vehicle.insurance_policy_number || 'Non renseigné',
    coverage: vehicle.insurance_coverage || 'Standard',
    expiryDate: vehicle.insurance_expiry || null
  };
  
  // Add device statuses (GPS, ADAS, DMS, camera)
  vehicle.devices = {
    gps: {
      status: vehicle.gps_status || 'offline',
      signalStrength: vehicle.gps_signal_strength || Math.floor(Math.random() * 30), // Default lower for offline
      lastUpdate: vehicle.gps_last_update || new Date().toISOString(),
      firmwareVersion: vehicle.gps_firmware_version || `v2.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
    },
    adas: {
      status: vehicle.adas_status || 'offline',
      signalStrength: vehicle.adas_signal_strength || Math.floor(Math.random() * 30),
      lastUpdate: vehicle.adas_last_update || new Date().toISOString(),
      firmwareVersion: vehicle.adas_firmware_version || `v2.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
    },
    dms: {
      status: vehicle.dms_status || 'offline',
      signalStrength: vehicle.dms_signal_strength || Math.floor(Math.random() * 30),
      lastUpdate: vehicle.dms_last_update || new Date().toISOString(),
      firmwareVersion: vehicle.dms_firmware_version || `v2.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
    },
    camera: {
      status: vehicle.camera_status || 'offline',
      signalStrength: vehicle.camera_signal_strength || Math.floor(Math.random() * 30),
      lastUpdate: vehicle.camera_last_update || new Date().toISOString(),
      firmwareVersion: vehicle.camera_firmware_version || `v2.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
    }
  };
  
  // Add common locations for Dakar if not specified
  const commonLocations = [
    'Dakar Centre', 'Parcelles Assainies', 'Pikine', 'Guédiawaye', 'Rufisque'
  ];
  vehicle.location = vehicle.location || commonLocations[Math.floor(Math.random() * commonLocations.length)];
  
  // Add missing properties with defaults
  vehicle.licensePlate = vehicle.license_plate || vehicle.registration || 'Non défini';
  vehicle.brand = vehicle.brand || 'Non défini';
  vehicle.model = vehicle.model || 'Non défini';
  vehicle.year = vehicle.year || new Date().getFullYear();
  vehicle.type = vehicle.type || 'Bus';
  vehicle.mileage = vehicle.mileage || 0;
  vehicle.color = vehicle.color || 'Blanc';
  vehicle.imei_device = vehicle.imei || 'Non défini';
  vehicle.fuel_type = vehicle.fuel_type || 'Diesel';
  vehicle.tank_capacity = vehicle.tank_capacity || 100;
  
  // Maintenance dates
  vehicle.last_maintenance_date = vehicle.last_maintenance_date || null;
  vehicle.next_maintenance_date = vehicle.next_maintenance_date || null;
  
  // Clean up database-specific properties that aren't needed in frontend
  delete vehicle.driver_id;
  delete vehicle.driver_name;
  delete vehicle.driver_phone;
  delete vehicle.driver_ibutton;
  delete vehicle.license_plate;
  delete vehicle.image_url;
  delete vehicle.insurance_provider;
  delete vehicle.insurance_policy_number;
  delete vehicle.insurance_coverage;
  delete vehicle.insurance_expiry;
  delete vehicle.gps_status;
  delete vehicle.gps_signal_strength;
  delete vehicle.gps_last_update;
  delete vehicle.adas_status;
  delete vehicle.adas_signal_strength;
  delete vehicle.adas_last_update;
  delete vehicle.dms_status;
  delete vehicle.dms_signal_strength;
  delete vehicle.dms_last_update;
  delete vehicle.dms_firmware_version;
  delete vehicle.camera_status;
  delete vehicle.camera_signal_strength;
  delete vehicle.camera_last_update;
  delete vehicle.camera_firmware_version;
  delete vehicle.gps_firmware_version;
  delete vehicle.adas_firmware_version;
  
  return vehicle;
}

exports.getAll = async (req, res) => {
  try {
    const vehicles = await Vehicle.getAll();
    
    // Enrich all vehicles with complete data for frontend
    const enrichedVehicles = vehicles.map(vehicle => enrichVehicleData({...vehicle}));
    
    console.log(`Returning ${enrichedVehicles.length} vehicles with enriched data`);
    res.json(enrichedVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des véhicules' });
  }
};

exports.getById = async (req, res) => {
  try {
    const vehicle = await Vehicle.getById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    
    // Enrich vehicle with complete data for frontend
    // Create a copy to avoid modifying the original object
    const enrichedVehicle = enrichVehicleData({...vehicle});
    
    console.log(`Returning enriched data for vehicle ${enrichedVehicle.id}`);
    res.json(enrichedVehicle);
  } catch (error) {
    console.error(`Error fetching vehicle ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du véhicule' });
  }
};

exports.create = async (req, res) => {
  try {
    // Extract core vehicle properties for database
    const vehicleData = {
      registration: req.body.registration,
      license_plate: req.body.registration,
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
      type: req.body.type,
      mileage: req.body.mileage,
      color: req.body.color,
      status: req.body.status || 'active',
      fleet_id: req.body.fleet_id || 5, // Default to Dakar Dem Dikk fleet
      location: req.body.location,
      fuel_type: req.body.fuel_type,
      tank_capacity: req.body.tank_capacity,
      driver_id: req.body.driver_id,
      insurance_provider: req.body.insurance?.provider,
      insurance_policy_number: req.body.insurance?.policyNumber,
      insurance_coverage: req.body.insurance?.coverage,
      insurance_expiry: req.body.insurance_expiry
    };
    
    const newVehicle = await Vehicle.create(vehicleData);
    
    // Return the enriched vehicle data
    const enrichedVehicle = enrichVehicleData(newVehicle);
    
    console.log(`Created new vehicle with ID ${newVehicle.id}`);
    res.status(201).json(enrichedVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du véhicule' });
  }
};

exports.update = async (req, res) => {
  try {
    // Extract core vehicle properties for database
    const vehicleData = {
      registration: req.body.registration,
      license_plate: req.body.registration,
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
      type: req.body.type,
      mileage: req.body.mileage,
      color: req.body.color,
      status: req.body.status,
      fleet_id: req.body.fleet_id,
      location: req.body.location,
      fuel_type: req.body.fuel_type,
      tank_capacity: req.body.tank_capacity,
      driver_id: req.body.driver_id,
      insurance_provider: req.body.insurance?.provider,
      insurance_policy_number: req.body.insurance?.policyNumber,
      insurance_coverage: req.body.insurance?.coverage,
      insurance_expiry: req.body.insurance_expiry
    };
    
    // Remove undefined values
    Object.keys(vehicleData).forEach(key => 
      vehicleData[key] === undefined && delete vehicleData[key]
    );
    
    await Vehicle.update(req.params.id, vehicleData);
    
    // Get the updated vehicle
    const updatedVehicle = await Vehicle.getById(req.params.id);
    
    // Return the enriched vehicle data
    const enrichedVehicle = enrichVehicleData(updatedVehicle);
    
    console.log(`Updated vehicle with ID ${req.params.id}`);
    res.json(enrichedVehicle);
  } catch (error) {
    console.error(`Error updating vehicle ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du véhicule' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Vehicle.remove(req.params.id);
    console.log(`Removed vehicle with ID ${req.params.id}`);
    res.json({ success: true, message: 'Véhicule supprimé avec succès' });
  } catch (error) {
    console.error(`Error removing vehicle ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du véhicule' });
  }
};
