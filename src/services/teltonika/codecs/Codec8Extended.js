// src/services/teltonika/codecs/Codec8Extended.js

class TeltonikaCodec8Extended {
  constructor() {
    this.CODEC_ID = 0x8E; // Codec 8 Extended
    this.AVL_DATA_ARRAY_START = 8;
  }

  decode(buffer) {
    try {
      if (!buffer || buffer.length < 12) {
        throw new Error('Invalid buffer length');
      }

      const dataView = new DataView(buffer);
      let offset = 0;

      // Parse TCP packet header
      const preamble = dataView.getUint32(offset); // 4 bytes
      offset += 4;
      
      const dataFieldLength = dataView.getUint32(offset); // 4 bytes
      offset += 4;

      // Parse AVL data header
      const codecId = dataView.getUint8(offset); // 1 byte
      offset += 1;

      if (codecId !== this.CODEC_ID) {
        throw new Error(`Unsupported codec ID: ${codecId}`);
      }

      const numberOfData1 = dataView.getUint8(offset); // 1 byte
      offset += 1;

      const records = [];
      
      // Parse AVL data records
      for (let i = 0; i < numberOfData1; i++) {
        const record = this.parseAvlData(dataView, offset);
        records.push(record.data);
        offset = record.newOffset;
      }

      const numberOfData2 = dataView.getUint8(offset); // 1 byte
      offset += 1;

      // Verify data count consistency
      if (numberOfData1 !== numberOfData2) {
        throw new Error('Data count mismatch');
      }

      const crc = dataView.getUint32(offset); // 4 bytes
      
      // Extract IMEI from first connection or assume from device context
      const imei = this.extractImei(buffer) || 'unknown';

      return {
        imei,
        codecId,
        recordCount: numberOfData1,
        records,
        crc,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Codec 8 Extended decode error: ${error.message}`);
    }
  }

  parseAvlData(dataView, offset) {
    const startOffset = offset;
    
    // Timestamp (8 bytes) - milliseconds since 1970-01-01 00:00:00 UTC
    const timestamp = Number(dataView.getBigUint64(offset));
    offset += 8;

    // Priority (1 byte)
    const priority = dataView.getUint8(offset);
    offset += 1;

    // GPS data
    const gpsData = this.parseGpsData(dataView, offset);
    offset = gpsData.newOffset;

    // IO data
    const ioData = this.parseIoData(dataView, offset);
    offset = ioData.newOffset;

    return {
      data: {
        timestamp: new Date(timestamp),
        priority,
        gps: gpsData.data,
        io: ioData.data
      },
      newOffset: offset
    };
  }

  parseGpsData(dataView, offset) {
    const longitude = dataView.getInt32(offset) / 10000000; // 4 bytes
    offset += 4;

    const latitude = dataView.getInt32(offset) / 10000000; // 4 bytes
    offset += 4;

    const altitude = dataView.getInt16(offset); // 2 bytes
    offset += 2;

    const angle = dataView.getUint16(offset); // 2 bytes
    offset += 2;

    const satellites = dataView.getUint8(offset); // 1 byte
    offset += 1;

    const speed = dataView.getUint16(offset); // 2 bytes
    offset += 2;

    return {
      data: {
        longitude,
        latitude,
        altitude,
        angle,
        satellites,
        speed,
        valid: satellites >= 3 && longitude !== 0 && latitude !== 0
      },
      newOffset: offset
    };
  }

  parseIoData(dataView, offset) {
    const eventId = dataView.getUint16(offset); // 2 bytes (Extended)
    offset += 2;

    const totalElements = dataView.getUint16(offset); // 2 bytes (Extended)
    offset += 2;

    const ioElements = {};

    // Parse 1-byte IO elements
    const count1Byte = dataView.getUint16(offset); // 2 bytes (Extended)
    offset += 2;
    
    for (let i = 0; i < count1Byte; i++) {
      const id = dataView.getUint16(offset); // 2 bytes (Extended)
      offset += 2;
      const value = dataView.getUint8(offset); // 1 byte
      offset += 1;
      ioElements[id] = { value, size: 1 };
    }

    // Parse 2-byte IO elements
    const count2Byte = dataView.getUint16(offset); // 2 bytes (Extended)
    offset += 2;
    
    for (let i = 0; i < count2Byte; i++) {
      const id = dataView.getUint16(offset); // 2 bytes (Extended)
      offset += 2;
      const value = dataView.getUint16(offset); // 2 bytes
      offset += 2;
      ioElements[id] = { value, size: 2 };
    }

    // Parse 4-byte IO elements
    const count4Byte = dataView.getUint16(offset); // 2 bytes (Extended)
    offset += 2;
    
    for (let i = 0; i < count4Byte; i++) {
      const id = dataView.getUint16(offset); // 2 bytes (Extended)
      offset += 2;
      const value = dataView.getUint32(offset); // 4 bytes
      offset += 4;
      ioElements[id] = { value, size: 4 };
    }

    // Parse 8-byte IO elements
    const count8Byte = dataView.getUint16(offset); // 2 bytes (Extended)
    offset += 2;
    
    for (let i = 0; i < count8Byte; i++) {
      const id = dataView.getUint16(offset); // 2 bytes (Extended)
      offset += 2;
      const value = Number(dataView.getBigUint64(offset)); // 8 bytes
      offset += 8;
      ioElements[id] = { value, size: 8 };
    }

    // Parse variable length IO elements
    const countXByte = dataView.getUint16(offset); // 2 bytes (Extended)
    offset += 2;
    
    for (let i = 0; i < countXByte; i++) {
      const id = dataView.getUint16(offset); // 2 bytes (Extended)
      offset += 2;
      const length = dataView.getUint16(offset); // 2 bytes (Extended)
      offset += 2;
      
      const value = new Uint8Array(dataView.buffer, offset, length);
      offset += length;
      ioElements[id] = { value: Array.from(value), size: length };
    }

    return {
      data: {
        eventId,
        totalElements,
        elements: ioElements,
        // Parsed common parameters
        digitalInputs: this.parseDigitalInputs(ioElements),
        analogInputs: this.parseAnalogInputs(ioElements),
        fuelLevel: this.getFuelLevel(ioElements),
        temperature: this.getTemperature(ioElements),
        batteryVoltage: this.getBatteryVoltage(ioElements),
        engineStatus: this.getEngineStatus(ioElements)
      },
      newOffset: offset
    };
  }

  parseDigitalInputs(elements) {
    const din1 = elements[1]?.value || 0;
    return {
      ignition: !!(din1 & 0x01),
      input2: !!(din1 & 0x02),
      input3: !!(din1 & 0x04),
      input4: !!(din1 & 0x08)
    };
  }

  parseAnalogInputs(elements) {
    return {
      analog1: elements[9]?.value || 0,
      analog2: elements[10]?.value || 0,
      batteryVoltage: (elements[67]?.value || 0) / 1000, // mV to V
      externalVoltage: (elements[66]?.value || 0) / 1000 // mV to V
    };
  }

  getFuelLevel(elements) {
    return elements[83]?.value || null; // Fuel level percentage
  }

  getTemperature(elements) {
    const temp1 = elements[72]?.value;
    const temp2 = elements[73]?.value;
    return {
      sensor1: temp1 ? (temp1 - 40) : null, // Convert from offset
      sensor2: temp2 ? (temp2 - 40) : null
    };
  }

  getBatteryVoltage(elements) {
    return (elements[67]?.value || 0) / 1000; // Convert mV to V
  }

  getEngineStatus(elements) {
    const ignition = elements[239]?.value || elements[1]?.value;
    const rpm = elements[84]?.value;
    
    return {
      ignition: !!ignition,
      rpm: rpm || 0,
      running: !!(ignition && rpm > 0)
    };
  }

  extractImei(buffer) {
    // IMEI is usually sent in the first packet during device identification
    // This would be handled at the connection level
    return null;
  }

  createAcknowledgment(recordCount) {
    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer);
    dataView.setUint32(0, recordCount);
    return buffer;
  }

  encodeCommand(imei, command) {
    // Implement command encoding based on Teltonika protocol
    // This would include commands like configuration updates, etc.
    const commandString = JSON.stringify(command);
    const encoder = new TextEncoder();
    return encoder.encode(commandString);
  }
}

export { TeltonikaCodec8Extended };