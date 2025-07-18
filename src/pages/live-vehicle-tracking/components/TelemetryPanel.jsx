import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import { Transition } from '@headlessui/react';

const TelemetryPanel = memo(({ 
  selectedVehicle, 
  liveEvents = [], 
  telemetryData = null, 
  onClose, 
  loading = false, 
  isConnected = false,
  lastUpdate = null
}) => {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [expandedCamera, setExpandedCamera] = useState(null);
  const [localTelemetry, setLocalTelemetry] = useState({});
  const [updatedFields, setUpdatedFields] = useState({});
  const prevTelemetryRef = useRef({});

  const tabs = [
    { id: 'telemetry', label: 'Télémétrie', icon: 'Activity' },
    { id: 'adas', label: 'ADAS', icon: 'Shield' },
    { id: 'cameras', label: 'Caméras', icon: 'Video' },
    { id: 'events', label: 'Événements', icon: 'Bell' }
  ];

  // Mock camera feeds
  const cameraFeeds = [
    {
      id: 'front',
      name: 'Caméra Avant',
      status: 'active',
      thumbnail: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      resolution: '1080p',
      fps: 30
    },
    {
      id: 'cabin',
      name: 'Caméra Cabine',
      status: 'active',
      thumbnail: 'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      resolution: '720p',
      fps: 15
    }
  ];
  // Highlight fields that have changed
  const highlightChanges = useCallback((newData, prevData) => {
    if (!prevData || !newData) return {};
    
    const changedFields = {};
    Object.keys(newData).forEach(key => {
      if (newData[key] !== prevData[key]) {
        changedFields[key] = true;
      }
    });
    
    return changedFields;
  }, []);

  // Update local telemetry state when telemetryData props changes
  // Optimize with useMemo for expensive comparison operations
  const changes = useMemo(() => {
    if (telemetryData && selectedVehicle) {
      return highlightChanges(telemetryData, prevTelemetryRef.current);
    }
    return {};
  }, [telemetryData, selectedVehicle, highlightChanges]);
  
  useEffect(() => {
    if (telemetryData && selectedVehicle) {
      // Highlight changed fields
      setUpdatedFields(changes);
      
      // Store current data for next comparison
      setLocalTelemetry(telemetryData);
      prevTelemetryRef.current = telemetryData;
      
      // Clear highlights after animation
      const timer = setTimeout(() => {
        setUpdatedFields({});
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [telemetryData, selectedVehicle, changes]);

  // Fallback to use vehicle telemetry if specific telemetry data not provided
  useEffect(() => {
    if (!telemetryData && selectedVehicle) {
      // Use vehicle data as telemetry source if specific telemetry not provided
      const basicTelemetry = {
        timestamp: new Date(),
        gpsSignal: 95,
        satellites: 12,
        hdop: '1.2',
        batteryVoltage: '12.8',
        engineTemp: 85,
        coolantTemp: 80,
        oilPressure: 35,
        rpm: 1800,
        ...selectedVehicle.telemetry
      };
      
      setLocalTelemetry(basicTelemetry);
    }
  }, [telemetryData, selectedVehicle]);

  const getEventSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error';
      case 'warning': return 'text-warning';
      case 'info': return 'text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const getEventSeverityBg = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-error-100';
      case 'warning': return 'bg-warning-100';
      case 'info': return 'bg-secondary-100';
      default: return 'bg-surface-secondary';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'speed_violation': return 'Gauge';
      case 'harsh_acceleration': return 'TrendingUp';
      case 'harsh_braking': return 'TrendingDown';
      case 'engine_idle': return 'Pause';
      case 'driver_fatigue': return 'Eye';
      case 'device_offline': return 'WifiOff';
      default: return 'AlertCircle';
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `Il y a ${diff}s`;
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)}j`;
  };

  // Render animated value that highlights changes (memoized for performance)
  const AnimatedValue = useCallback(({ value, field, prefix = '', suffix = '', isNumeric = true }) => {
    const hasChanged = updatedFields[field];
    const displayValue = value !== undefined && value !== null ? value : '–';
    
    return (
      <span className={`${hasChanged ? 'relative' : ''} transition-colors duration-500`}>
        {prefix}{displayValue}{suffix}
        
        {hasChanged && isNumeric && (
          <span className="absolute left-0 top-0 w-full bg-primary-100 rounded-sm animate-highlight-pulse z-0">
            {prefix}{displayValue}{suffix}
          </span>
        )}
      </span>
    );
  }, [updatedFields]);

  if (loading) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Chargement des données de télémétrie...</p>
        </div>
      </div>
    );
  }

  if (!selectedVehicle) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-center">
          <Icon name="Truck" size={48} className="text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary">Sélectionnez un véhicule pour voir les détails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-heading font-semibold text-text-primary">
              {selectedVehicle.plateNumber}
            </h3>
            <p className="text-sm text-text-secondary">{selectedVehicle.driverName}</p>
          </div>
          
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-base hover:bg-surface-secondary transition-colors duration-150"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-surface-secondary rounded-base p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name={tab.icon} size={12} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'telemetry' && (
          <div className="p-4 space-y-4">
            {/* Vehicle Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text-primary text-sm">État du Véhicule</h4>
                {isConnected && (
                  <span className="text-xs flex items-center text-success">
                    <span className="w-2 h-2 bg-success rounded-full mr-1 animate-pulse"></span>
                    En direct
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className={`bg-surface-secondary rounded-base p-3 relative overflow-hidden ${updatedFields.speed ? 'highlight-card' : ''}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="Gauge" size={14} className="text-text-secondary" />
                    <span className="text-xs text-text-secondary">Vitesse</span>
                  </div>
                  <p className="text-lg font-semibold text-text-primary font-data relative z-10">
                    <AnimatedValue value={selectedVehicle.speed} field="speed" suffix=" km/h" />
                  </p>
                </div>
                
                <div className={`bg-surface-secondary rounded-base p-3 relative overflow-hidden ${updatedFields.fuel ? 'highlight-card' : ''}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="Fuel" size={14} className="text-text-secondary" />
                    <span className="text-xs text-text-secondary">Carburant</span>
                  </div>
                  <p className="text-lg font-semibold text-text-primary font-data relative z-10">
                    <AnimatedValue value={selectedVehicle.fuel} field="fuel" suffix="%" />
                  </p>
                </div>
                
                <div className={`bg-surface-secondary rounded-base p-3 relative overflow-hidden ${updatedFields.temperature ? 'highlight-card' : ''}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="Thermometer" size={14} className="text-text-secondary" />
                    <span className="text-xs text-text-secondary">Température</span>
                  </div>
                  <p className="text-lg font-semibold text-text-primary font-data relative z-10">
                    <AnimatedValue 
                      value={selectedVehicle.temperature} 
                      field="temperature" 
                      suffix="°C" 
                    />
                  </p>
                </div>
                
                <div className={`bg-surface-secondary rounded-base p-3 relative overflow-hidden ${updatedFields.engineStatus ? 'highlight-card' : ''}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="Settings" size={14} className="text-text-secondary" />
                    <span className="text-xs text-text-secondary">Moteur</span>
                  </div>
                  <p className="text-lg font-semibold text-text-primary capitalize relative z-10">
                    <AnimatedValue 
                      value={selectedVehicle.engineStatus} 
                      field="engineStatus" 
                      isNumeric={false}
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* GPS & Device Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-text-primary text-sm">Informations GPS</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Signal GPS</span>
                  <span className={`text-xs font-medium text-text-primary font-data ${updatedFields.gpsSignal ? 'bg-primary-100 px-1 rounded animate-pulse' : ''}`}>
                    <AnimatedValue value={localTelemetry.gpsSignal} field="gpsSignal" suffix="%" />
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Satellites</span>
                  <span className={`text-xs font-medium text-text-primary font-data ${updatedFields.satellites ? 'bg-primary-100 px-1 rounded animate-pulse' : ''}`}>
                    <AnimatedValue value={localTelemetry.satellites} field="satellites" />
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">HDOP</span>
                  <span className={`text-xs font-medium text-text-primary font-data ${updatedFields.hdop ? 'bg-primary-100 px-1 rounded animate-pulse' : ''}`}>
                    <AnimatedValue value={localTelemetry.hdop} field="hdop" />
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Dispositif</span>
                  <span className={`text-xs font-medium text-text-primary ${updatedFields.deviceType ? 'bg-primary-100 px-1 rounded animate-pulse' : ''}`}>
                    <AnimatedValue 
                      value={selectedVehicle.deviceType} 
                      field="deviceType" 
                      isNumeric={false} 
                    />
                  </span>
                </div>
                
                {localTelemetry.batteryVoltage && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">Batterie</span>
                    <span className={`text-xs font-medium text-text-primary font-data ${updatedFields.batteryVoltage ? 'bg-primary-100 px-1 rounded animate-pulse' : ''}`}>
                      <AnimatedValue 
                        value={localTelemetry.batteryVoltage} 
                        field="batteryVoltage" 
                        suffix="V" 
                      />
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Info */}
            {selectedVehicle.iButtonId && (
              <div className="space-y-3">
                <h4 className="font-medium text-text-primary text-sm">Conducteur</h4>
                
                <div className="bg-surface-secondary rounded-base p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Icon name="User" size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">{selectedVehicle.driverName}</p>
                      <p className="text-xs text-text-secondary font-data">iButton: {selectedVehicle.iButtonId}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'adas' && (
          <div className="p-4 space-y-4">
            <h4 className="font-medium text-text-primary text-sm">Systèmes d'Assistance</h4>
            
            <div className="space-y-3">
              {/* Forward Collision Warning */}
              <div className={`p-3 rounded-base border ${
                selectedVehicle.adas.forwardCollisionWarning 
                  ? 'border-error bg-error-50' :'border-border bg-surface-secondary'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name="AlertTriangle" 
                      size={16} 
                      className={selectedVehicle.adas.forwardCollisionWarning ? 'text-error' : 'text-text-secondary'} 
                    />
                    <span className="text-sm font-medium text-text-primary">
                      Collision Frontale
                    </span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    selectedVehicle.adas.forwardCollisionWarning ? 'bg-error animate-pulse' : 'bg-success'
                  }`}></div>
                </div>
                {selectedVehicle.adas.forwardCollisionWarning && (
                  <p className="text-xs text-error mt-2">Risque de collision détecté</p>
                )}
              </div>

              {/* Lane Departure Warning */}
              <div className={`p-3 rounded-base border ${
                selectedVehicle.adas.laneDepartureWarning 
                  ? 'border-warning bg-warning-50' :'border-border bg-surface-secondary'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name="Navigation" 
                      size={16} 
                      className={selectedVehicle.adas.laneDepartureWarning ? 'text-warning' : 'text-text-secondary'} 
                    />
                    <span className="text-sm font-medium text-text-primary">
                      Sortie de Voie
                    </span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    selectedVehicle.adas.laneDepartureWarning ? 'bg-warning animate-pulse' : 'bg-success'
                  }`}></div>
                </div>
                {selectedVehicle.adas.laneDepartureWarning && (
                  <p className="text-xs text-warning mt-2">Sortie de voie détectée</p>
                )}
              </div>

              {/* Driver Fatigue */}
              <div className={`p-3 rounded-base border ${
                selectedVehicle.adas.driverFatigue 
                  ? 'border-error bg-error-50' :'border-border bg-surface-secondary'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name="Eye" 
                      size={16} 
                      className={selectedVehicle.adas.driverFatigue ? 'text-error' : 'text-text-secondary'} 
                    />
                    <span className="text-sm font-medium text-text-primary">
                      Fatigue Conducteur
                    </span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    selectedVehicle.adas.driverFatigue ? 'bg-error animate-pulse' : 'bg-success'
                  }`}></div>
                </div>
                {selectedVehicle.adas.driverFatigue && (
                  <p className="text-xs text-error mt-2">Signes de fatigue détectés</p>
                )}
              </div>
            </div>

            {/* DMS Status */}
            <div className="space-y-3">
              <h4 className="font-medium text-text-primary text-sm">Surveillance Conducteur</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2 rounded text-center text-xs ${
                  selectedVehicle.dms.driverPresent ? 'bg-success-100 text-success' : 'bg-error-100 text-error'
                }`}>
                  <Icon name="User" size={14} className="mx-auto mb-1" />
                  <p>Présence</p>
                </div>
                
                <div className={`p-2 rounded text-center text-xs ${
                  !selectedVehicle.dms.eyesClosed ? 'bg-success-100 text-success' : 'bg-error-100 text-error'
                }`}>
                  <Icon name="Eye" size={14} className="mx-auto mb-1" />
                  <p>Vigilance</p>
                </div>
                
                <div className={`p-2 rounded text-center text-xs ${
                  !selectedVehicle.dms.phoneUsage ? 'bg-success-100 text-success' : 'bg-warning-100 text-warning'
                }`}>
                  <Icon name="Phone" size={14} className="mx-auto mb-1" />
                  <p>Téléphone</p>
                </div>
                
                <div className={`p-2 rounded text-center text-xs ${
                  !selectedVehicle.dms.smoking ? 'bg-success-100 text-success' : 'bg-warning-100 text-warning'
                }`}>
                  <Icon name="Cigarette" size={14} className="mx-auto mb-1" />
                  <p>Tabac</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cameras' && (
          <div className="p-4 space-y-4">
            <h4 className="font-medium text-text-primary text-sm">Flux Caméras</h4>
            
            <div className="space-y-3">
              {cameraFeeds.map((camera) => (
                <div key={camera.id} className="border border-border rounded-base overflow-hidden">
                  <div className="p-3 bg-surface-secondary">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary text-sm">{camera.name}</h5>
                        <p className="text-xs text-text-secondary">
                          {camera.resolution} • {camera.fps} fps
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        camera.status === 'active' ? 'bg-success animate-pulse' : 'bg-error'
                      }`}></div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Image
                      src={camera.thumbnail}
                      alt={camera.name}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity duration-150"
                      onClick={() => setExpandedCamera(expandedCamera === camera.id ? null : camera.id)}
                    />
                    <button
                      onClick={() => setExpandedCamera(expandedCamera === camera.id ? null : camera.id)}
                      className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-all duration-150"
                    >
                      <Icon name={expandedCamera === camera.id ? "Minimize2" : "Maximize2"} size={12} />
                    </button>
                    
                    {camera.status === 'active' && (
                      <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    )}
                  </div>
                  
                  {expandedCamera === camera.id && (
                    <div className="p-3 bg-surface-secondary">
                      <div className="flex space-x-2">
                        <button className="flex-1 btn-secondary text-xs py-1">
                          <Icon name="Download" size={12} className="mr-1" />
                          Capturer
                        </button>
                        <button className="flex-1 btn-secondary text-xs py-1">
                          <Icon name="Video" size={12} className="mr-1" />
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-text-primary text-sm">Événements en Direct</h4>
              <button className="text-xs text-secondary hover:text-secondary-700 font-medium">
                Tout effacer
              </button>
            </div>
            
            <div className="space-y-3">
              {liveEvents
                .filter(event => !selectedVehicle || event.vehicleId === selectedVehicle.id)
                .slice(0, 10)
                .map((event) => (
                <div key={event.id} className={`p-3 rounded-base border ${getEventSeverityBg(event.severity)}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${getEventSeverityBg(event.severity)}`}>
                      <Icon 
                        name={getEventIcon(event.type)} 
                        size={14} 
                        className={getEventSeverityColor(event.severity)} 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary mb-1">{event.message}</p>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{event.location}</span>
                        <span>{formatRelativeTime(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {liveEvents.filter(event => !selectedVehicle || event.vehicleId === selectedVehicle.id).length === 0 && (
                <div className="text-center py-8">
                  <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Aucun événement récent</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-surface-secondary">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Mise à jour: {lastUpdate ? formatTime(lastUpdate) : formatTime(new Date())}</span>
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>En direct</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-error rounded-full"></div>
                <span>Déconnecté</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Add custom CSS for animation using useEffect to avoid duplicates
const TelemetryPanelWithStyles = (props) => {
  useEffect(() => {
    // Check if the style already exists
    const existingStyle = document.getElementById('telemetry-animations');
    if (existingStyle) {
      return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'telemetry-animations';
    style.textContent = `
      @keyframes highlight-pulse {
        0% { opacity: 0.8; }
        50% { opacity: 0.4; }
        100% { opacity: 0; }
      }
      
      .animate-highlight-pulse {
        animation: highlight-pulse 2s ease-in-out;
      }
      
      .highlight-card {
        position: relative;
      }
      
      .highlight-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(79, 70, 229, 0.1);
        animation: highlight-pulse 2s ease-in-out;
        pointer-events: none;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup function to remove style on unmount
    return () => {
      const styleToRemove = document.getElementById('telemetry-animations');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  return <TelemetryPanel {...props} />;
};

export default React.memo(TelemetryPanelWithStyles);
