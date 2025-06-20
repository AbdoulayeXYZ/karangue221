// src/services/teltonika/utils/DataValidator.js

class TeltonikaDataValidator {
  constructor() {
    this.validationRules = {
      imei: {
        required: true,
        pattern: /^\d{15}$/,
        message: 'IMEI must be 15 digits'
      },
      latitude: {
        required: true,
        min: -90,
        max: 90,
        message: 'Latitude must be between -90 and 90'
      },
      longitude: {
        required: true,
        min: -180,
        max: 180,
        message: 'Longitude must be between -180 and 180'
      },
      speed: {
        required: false,
        min: 0,
        max: 300,
        message: 'Speed must be between 0 and 300 km/h'
      },
      satellites: {
        required: false,
        min: 0,
        max: 50,
        message: 'Satellite count must be between 0 and 50'
      },
      timestamp: {
        required: true,
        message: 'Valid timestamp is required'
      }
    };
  }

  validate(data) {
    const errors = [];
    const warnings = [];
    
    try {
      // Validate basic structure
      if (!data || typeof data !== 'object') {
        return {
          isValid: false,
          errors: ['Invalid data structure'],
          warnings: []
        };
      }

      // Validate IMEI
      const imeiValidation = this.validateField('imei', data.imei);
      if (!imeiValidation.isValid) {
        errors.push(...imeiValidation.errors);
      }

      // Validate records
      if (!data.records || !Array.isArray(data.records)) {
        errors.push('Records must be an array');
      } else {
        data.records.forEach((record, index) => {
          const recordValidation = this.validateRecord(record, index);
          errors.push(...recordValidation.errors);
          warnings.push(...recordValidation.warnings);
        });
      }

      // Validate codec ID
      if (data.codecId !== undefined && data.codecId !== 0x8E) {
        warnings.push(`Unexpected codec ID: ${data.codecId}`);
      }

      // Validate record count consistency
      if (data.recordCount !== undefined && data.records?.length !== data.recordCount) {
        errors.push('Record count mismatch');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        validRecords: data.records?.filter((_, index) => 
          this.validateRecord(data.records[index]).errors.length === 0
        ).length || 0
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: []
      };
    }
  }

  validateRecord(record, index = 0) {
    const errors = [];
    const warnings = [];
    const prefix = `Record ${index}:`;

    // Validate timestamp
    if (!record.timestamp || !(record.timestamp instanceof Date) || isNaN(record.timestamp.getTime())) {
      errors.push(`${prefix} Invalid timestamp`);
    } else {
      // Check if timestamp is reasonable (not too old or in future)
      const now = Date.now();
      const recordTime = record.timestamp.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (recordTime > now + oneDayMs) {
        warnings.push(`${prefix} Timestamp is in the future`);
      } else if (recordTime < now - (30 * oneDayMs)) {
        warnings.push(`${prefix} Timestamp is more than 30 days old`);
      }
    }

    // Validate GPS data
    if (record.gps) {
      const gpsValidation = this.validateGpsData(record.gps, prefix);
      errors.push(...gpsValidation.errors);
      warnings.push(...gpsValidation.warnings);
    } else {
      errors.push(`${prefix} Missing GPS data`);
    }

    // Validate IO data
    if (record.io) {
      const ioValidation = this.validateIoData(record.io, prefix);
      errors.push(...ioValidation.errors);
      warnings.push(...ioValidation.warnings);
    }

    // Validate priority
    if (record.priority !== undefined && (record.priority < 0 || record.priority > 3)) {
      warnings.push(`${prefix} Unusual priority value: ${record.priority}`);
    }

    return { errors, warnings };
  }

  validateGpsData(gps, prefix) {
    const errors = [];
    const warnings = [];

    // Validate coordinates
    const latValidation = this.validateField('latitude', gps.latitude);
    if (!latValidation.isValid) {
      errors.push(`${prefix} ${latValidation.errors[0]}`);
    }

    const lngValidation = this.validateField('longitude', gps.longitude);
    if (!lngValidation.isValid) {
      errors.push(`${prefix} ${lngValidation.errors[0]}`);
    }

    // Validate speed
    const speedValidation = this.validateField('speed', gps.speed);
    if (!speedValidation.isValid) {
      warnings.push(`${prefix} ${speedValidation.errors[0]}`);
    }

    // Validate satellites
    const satValidation = this.validateField('satellites', gps.satellites);
    if (!satValidation.isValid) {
      warnings.push(`${prefix} ${satValidation.errors[0]}`);
    }

    // Check GPS validity flags
    if (gps.valid === false) {
      warnings.push(`${prefix} GPS data marked as invalid`);
    }

    // Check for suspicious coordinates (exactly 0,0)
    if (gps.latitude === 0 && gps.longitude === 0) {
      warnings.push(`${prefix} Coordinates are exactly 0,0 - may be invalid`);
    }

    // Check satellite count for accuracy
    if (gps.satellites < 4) {
      warnings.push(`${prefix} Low satellite count: ${gps.satellites}`);
    }

    // Validate altitude (reasonable range)
    if (gps.altitude !== undefined && (gps.altitude < -500 || gps.altitude > 10000)) {
      warnings.push(`${prefix} Unusual altitude: ${gps.altitude}m`);
    }

    // Validate heading
    if (gps.angle !== undefined && (gps.angle < 0 || gps.angle >= 360)) {
      warnings.push(`${prefix} Invalid heading: ${gps.angle}°`);
    }

    return { errors, warnings };
  }

  validateIoData(io, prefix) {
    const errors = [];
    const warnings = [];

    // Validate event ID
    if (io.eventId !== undefined && typeof io.eventId !== 'number') {
      errors.push(`${prefix} Invalid event ID type`);
    }

    // Validate total elements count
    if (io.totalElements !== undefined) {
      const actualElements = Object.keys(io.elements || {}).length;
      if (actualElements !== io.totalElements) {
        warnings.push(`${prefix} IO element count mismatch`);
      }
    }

    // Validate IO elements structure
    if (io.elements && typeof io.elements === 'object') {
      Object.entries(io.elements).forEach(([id, element]) => {
        if (!element || typeof element !== 'object') {
          errors.push(`${prefix} Invalid IO element structure for ID ${id}`);
        } else if (element.value === undefined) {
          warnings.push(`${prefix} IO element ${id} has no value`);
        }
      });
    }

    // Validate digital inputs
    if (io.digitalInputs) {
      const digitalValidation = this.validateDigitalInputs(io.digitalInputs, prefix);
      warnings.push(...digitalValidation.warnings);
    }

    // Validate analog inputs
    if (io.analogInputs) {
      const analogValidation = this.validateAnalogInputs(io.analogInputs, prefix);
      warnings.push(...analogValidation.warnings);
    }

    return { errors, warnings };
  }

  validateDigitalInputs(digitalInputs, prefix) {
    const warnings = [];

    // Check for reasonable digital input values
    Object.entries(digitalInputs).forEach(([key, value]) => {
      if (typeof value !== 'boolean') {
        warnings.push(`${prefix} Digital input ${key} should be boolean`);
      }
    });

    return { warnings };
  }

  validateAnalogInputs(analogInputs, prefix) {
    const warnings = [];

    // Validate battery voltage
    if (analogInputs.batteryVoltage !== undefined) {
      if (analogInputs.batteryVoltage < 8 || analogInputs.batteryVoltage > 16) {
        warnings.push(`${prefix} Unusual battery voltage: ${analogInputs.batteryVoltage}V`);
      }
    }

    // Validate external voltage
    if (analogInputs.externalVoltage !== undefined) {
      if (analogInputs.externalVoltage < 0 || analogInputs.externalVoltage > 30) {
        warnings.push(`${prefix} Unusual external voltage: ${analogInputs.externalVoltage}V`);
      }
    }

    return { warnings };
  }

  validateField(fieldName, value) {
    const rule = this.validationRules[fieldName];
    const errors = [];

    if (!rule) {
      return { isValid: true, errors: [] };
    }

    // Check required
    if (rule.required && (value === undefined || value === null)) {
      errors.push(rule.message || `${fieldName} is required`);
      return { isValid: false, errors };
    }

    // Skip validation if value is not provided and not required
    if (value === undefined || value === null) {
      return { isValid: true, errors: [] };
    }

    // Check pattern
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors.push(rule.message || `${fieldName} format is invalid`);
    }

    // Check min/max for numbers
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(rule.message || `${fieldName} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(rule.message || `${fieldName} must be at most ${rule.max}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Custom validation rules for specific use cases
  addValidationRule(fieldName, rule) {
    this.validationRules[fieldName] = rule;
  }

  removeValidationRule(fieldName) {
    delete this.validationRules[fieldName];
  }

  getValidationRules() {
    return { ...this.validationRules };
  }
}

export { TeltonikaDataValidator };