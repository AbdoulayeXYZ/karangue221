// src/services/teltonika/utils/DeviceMapper.js

class TeltonikaDeviceMapper {
  constructor() {
    this.deviceTypeMap = {
      'FMB920': 'Advanced GPS Tracker',
      'FMB964': 'Professional GPS Tracker',
      'FMT100': 'Personal GPS Tracker',
      'FMC640': 'CAN Bus Tracker'
    };

    this.statusMap = {
      'active': 'Actif',
      'idle': 'Au Ralenti',
      'offline': 'Hors Ligne',
      'warning': 'Alerte'
    };
  }

  mapDeviceData(teltonikaData) {
    const { imei, records, timestamp } = teltonikaData;
    
    if (!records || records.length === 0) {
      return null;
    }

    const latestRecord = records[records.length - 1];
    
    return {
      id: imei,
      imei,
      plateNumber: this.getPlateNumber(imei),
      driverName: this.getDriverName(imei),
      deviceType: this.getDeviceType(imei),
      status: this.determineStatus(latestRecord),
      location: this.mapLocation(latestRecord.gps),
      speed: latestRecord.gps.speed,
      heading: latestRecord.gps.angle,
      lastUpdate: latestRecord.timestamp,
      fuel: this.getFuelLevel(latestRecord.io),
      engineStatus: this.getEngineStatus(latestRecord.io),
      temperature: this.getTemperature(latestRecord.io),
      odometer: this.getOdometer(latestRecord.io),
      iButtonId: this.getIButtonId(latestRecord.io),
      alerts: this.generateAlerts(latestRecord),
      adas: this.mapAdasData(latestRecord.io),
      dms: this.mapDmsData(latestRecord.io),
      telemetry: this.mapTelemetryData(latestRecord),
      rawData: teltonikaData
    };
  }

  mapLocationData(imei, record, device) {
    return {
      deviceId: imei,
      imei,
      timestamp: record.timestamp,
      coordinates: {
        latitude: record.gps.latitude,
        longitude: record.gps.longitude,
        altitude: record.gps.altitude
      },
      speed: record.gps.speed,
      heading: record.gps.angle,
      satellites: record.gps.satellites,
      accuracy: this.calculateAccuracy(record.gps),
      address: null, // To be geocoded separately
      isValid: record.gps.valid,
      priority: record.priority,
      ioData: record.io
    };
  }

  mapLocation(gpsData) {
    if (!gpsData.valid) {
      return {
        lat: 0,
        lng: 0,
        address: 'Position non disponible',
        accuracy: 0
      };
    }

    return {
      lat: gpsData.latitude,
      lng: gpsData.longitude,
      altitude: gpsData.altitude,
      address: 'Adresse à géocoder', // Placeholder for reverse geocoding
      accuracy: this.calculateAccuracy(gpsData)
    };
  }

  mapTelemetryData(record) {
    const { gps, io } = record;
    
    return {
      gpsSignal: this.calculateGpsSignalStrength(gps),
      satellites: gps.satellites,
      hdop: this.calculateHdop(gps),
      batteryVoltage: io.analogInputs?.batteryVoltage || 0,
      externalVoltage: io.analogInputs?.externalVoltage || 0,
      engineTemp: this.getEngineTemperature(io),
      coolantTemp: this.getCoolantTemperature(io),
      oilPressure: this.getOilPressure(io),
      rpm: io.engineStatus?.rpm || 0,
      digitalInputs: io.digitalInputs,
      analogInputs: io.analogInputs
    };
  }

  mapAdasData(ioData) {
    // Map ADAS-related IO elements
    return {
      forwardCollisionWarning: this.getAdasAlert(ioData, 'fcw'),
      laneDepartureWarning: this.getAdasAlert(ioData, 'ldw'),
      driverFatigue: this.getAdasAlert(ioData, 'fatigue'),
      blindSpotWarning: this.getAdasAlert(ioData, 'bsw'),
      speedLimitWarning: this.getAdasAlert(ioData, 'speed_limit')
    };
  }

  mapDmsData(ioData) {
    // Map Driver Monitoring System data
    return {
      driverPresent: this.getDmsStatus(ioData, 'driver_present'),
      eyesClosed: this.getDmsStatus(ioData, 'eyes_closed'),
      phoneUsage: this.getDmsStatus(ioData, 'phone_usage'),
      smoking: this.getDmsStatus(ioData, 'smoking'),
      driverDistracted: this.getDmsStatus(ioData, 'distracted'),
      faceRecognized: this.getDmsStatus(ioData, 'face_recognized')
    };
  }

  determineStatus(record) {
    const { gps, io } = record;
    
    // Check for critical alerts
    const hasAlerts = this.hasActiveAlerts(record);
    if (hasAlerts) {
      return 'warning';
    }
    
    // Check if device is offline (old data)
    const isRecent = (Date.now() - record.timestamp.getTime()) < 300000; // 5 minutes
    if (!isRecent) {
      return 'offline';
    }
    
    // Check if moving
    if (gps.speed > 5) {
      return 'active';
    }
    
    // Check if engine is on but not moving
    if (io.engineStatus?.ignition && gps.speed <= 5) {
      return 'idle';
    }
    
    return 'active';
  }

  generateAlerts(record) {
    const alerts = [];
    const { gps, io } = record;
    
    // Speed limit alerts
    if (gps.speed > 80) { // Configurable threshold
      alerts.push('speed_limit');
    }
    
    // Engine alerts
    if (io.engineStatus?.rpm > 3000) {
      alerts.push('high_rpm');
    }
    
    // Temperature alerts
    const temp = this.getEngineTemperature(io);
    if (temp > 100) {
      alerts.push('high_temperature');
    }
    
    // Battery alerts
    if (io.analogInputs?.batteryVoltage < 11.5) {
      alerts.push('low_battery');
    }
    
    // GPS signal alerts
    if (gps.satellites < 4) {
      alerts.push('poor_gps_signal');
    }
    
    return alerts;
  }

  // Helper methods
  getPlateNumber(imei) {
    // Map IMEI to plate number from configuration or database
    const plateMap = {
      '860003007560101': 'DK-2847-AB',
      '860003007560102': 'DK-3951-CD',
      '860003007560103': 'DK-1234-EF'
    };
    
    return plateMap[imei] || `VEH-${imei.slice(-4)}`;
  }

  getDriverName(imei) {
    // Map IMEI to driver name from configuration or database
    const driverMap = {
      '860003007560101': 'Amadou Diallo',
      '860003007560102': 'Fatou Sall',
      '860003007560103': 'Moussa Ba'
    };
    
    return driverMap[imei] || 'Conducteur Inconnu';
  }

  getDeviceType(imei) {
    // Determine device type from IMEI or configuration
    return 'FMB920'; // Default or lookup from database
  }

  getFuelLevel(ioData) {
    return ioData.fuelLevel || Math.floor(Math.random() * 100); // Mock if not available
  }

  getEngineStatus(ioData) {
    if (ioData.engineStatus?.running) {
      return 'running';
    } else if (ioData.engineStatus?.ignition) {
      return 'idle';
    }
    return 'off';
  }

  getTemperature(ioData) {
    return ioData.temperature?.sensor1 || 25; // Default temperature
  }

  getOdometer(ioData) {
    return ioData.elements?.[199]?.value || 0; // Odometer IO element
  }

  getIButtonId(ioData) {
    const iButtonData = ioData.elements?.[78]?.value; // iButton IO element
    return iButtonData ? `BTN-${iButtonData.slice(-6)}` : null;
  }

  calculateAccuracy(gpsData) {
    // Calculate GPS accuracy based on satellites and HDOP
    const satFactor = Math.min(gpsData.satellites / 12, 1);
    return Math.floor(satFactor * 100);
  }

  calculateGpsSignalStrength(gpsData) {
    return Math.min((gpsData.satellites / 12) * 100, 100);
  }

  calculateHdop(gpsData) {
    // Mock HDOP calculation based on satellites
    return (2.0 - (gpsData.satellites / 12)).toFixed(1);
  }

  getEngineTemperature(ioData) {
    return ioData.temperature?.sensor1 || 85;
  }

  getCoolantTemperature(ioData) {
    return ioData.temperature?.sensor2 || 80;
  }

  getOilPressure(ioData) {
    return ioData.elements?.[110]?.value || 35; // Oil pressure IO element
  }

  getAdasAlert(ioData, alertType) {
    // Map specific IO elements to ADAS alerts
    const adasElements = {
      'fcw': 385, // Forward Collision Warning
      'ldw': 386, // Lane Departure Warning
      'fatigue': 387, // Driver Fatigue
      'bsw': 388, // Blind Spot Warning
      'speed_limit': 389 // Speed Limit Warning
    };
    
    return !!(ioData.elements?.[adasElements[alertType]]?.value);
  }

  getDmsStatus(ioData, statusType) {
    // Map specific IO elements to DMS status
    const dmsElements = {
      'driver_present': 390,
      'eyes_closed': 391,
      'phone_usage': 392,
      'smoking': 393,
      'distracted': 394,
      'face_recognized': 395
    };
    
    return !!(ioData.elements?.[dmsElements[statusType]]?.value);
  }

  hasActiveAlerts(record) {
    const alerts = this.generateAlerts(record);
    return alerts.length > 0;
  }
}

export { TeltonikaDeviceMapper };