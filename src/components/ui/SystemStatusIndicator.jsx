import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const SystemStatusIndicator = () => {
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [deviceCount, setDeviceCount] = useState(127);
  const [isExpanded, setIsExpanded] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    gpsSignal: 98,
    serverLoad: 45,
    dataLatency: 120,
    activeDevices: 127,
    totalDevices: 135
  });

  useEffect(() => {
    // Simulate real-time system status updates
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        ...prev,
        gpsSignal: Math.max(85, Math.min(100, prev.gpsSignal + (Math.random() - 0.5) * 5)),
        serverLoad: Math.max(20, Math.min(80, prev.serverLoad + (Math.random() - 0.5) * 10)),
        dataLatency: Math.max(50, Math.min(300, prev.dataLatency + (Math.random() - 0.5) * 20)),
        activeDevices: Math.max(120, Math.min(135, prev.activeDevices + Math.floor((Math.random() - 0.5) * 3)))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update connection status based on system health
    if (systemHealth.gpsSignal < 90 || systemHealth.serverLoad > 70) {
      setConnectionStatus('warning');
    } else if (systemHealth.gpsSignal < 85 || systemHealth.serverLoad > 80) {
      setConnectionStatus('error');
    } else {
      setConnectionStatus('connected');
    }
    
    setDeviceCount(systemHealth.activeDevices);
  }, [systemHealth]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-success-50';
      case 'warning': return 'bg-warning-50';
      case 'error': return 'bg-error-50';
      default: return 'bg-surface-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return 'Wifi';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'WifiOff';
      default: return 'Wifi';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Système Opérationnel';
      case 'warning': return 'Attention Requise';
      case 'error': return 'Problème Détecté';
      default: return 'État Inconnu';
    }
  };

  const getHealthColor = (value, type) => {
    if (type === 'gpsSignal') {
      if (value >= 95) return 'text-success';
      if (value >= 90) return 'text-warning';
      return 'text-error';
    }
    if (type === 'serverLoad') {
      if (value <= 50) return 'text-success';
      if (value <= 70) return 'text-warning';
      return 'text-error';
    }
    if (type === 'dataLatency') {
      if (value <= 100) return 'text-success';
      if (value <= 200) return 'text-warning';
      return 'text-error';
    }
    return 'text-text-primary';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-3 px-4 py-2 rounded-base border transition-all duration-150 ${getStatusBgColor(connectionStatus)} hover:shadow-elevation-1`}
        aria-label="État du système"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-2">
          <Icon 
            name={getStatusIcon(connectionStatus)} 
            size={16} 
            className={`${getStatusColor(connectionStatus)} transition-colors duration-150`}
          />
          <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-success animate-pulse-slow' : connectionStatus === 'warning' ? 'bg-warning' : 'bg-error'}`}></div>
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-text-primary">
            {getStatusText(connectionStatus)}
          </p>
          <p className="text-xs text-text-secondary font-data">
            {deviceCount}/{systemHealth.totalDevices} véhicules actifs
          </p>
        </div>
        
        <Icon 
          name="ChevronDown" 
          size={14} 
          className={`text-text-secondary transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-base shadow-elevation-3 z-1100 animate-slide-down">
          <div className="p-4 border-b border-border">
            <h3 className="font-heading font-semibold text-text-primary flex items-center space-x-2">
              <Icon name="Activity" size={16} />
              <span>État du Système</span>
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* GPS Signal Quality */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Satellite" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Signal GPS</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium font-data ${getHealthColor(systemHealth.gpsSignal, 'gpsSignal')}`}>
                  {systemHealth.gpsSignal.toFixed(1)}%
                </span>
                <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${systemHealth.gpsSignal >= 95 ? 'bg-success' : systemHealth.gpsSignal >= 90 ? 'bg-warning' : 'bg-error'}`}
                    style={{ width: `${systemHealth.gpsSignal}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Server Load */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Server" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Charge Serveur</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium font-data ${getHealthColor(systemHealth.serverLoad, 'serverLoad')}`}>
                  {systemHealth.serverLoad.toFixed(0)}%
                </span>
                <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${systemHealth.serverLoad <= 50 ? 'bg-success' : systemHealth.serverLoad <= 70 ? 'bg-warning' : 'bg-error'}`}
                    style={{ width: `${systemHealth.serverLoad}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Data Latency */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Latence Données</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium font-data ${getHealthColor(systemHealth.dataLatency, 'dataLatency')}`}>
                  {systemHealth.dataLatency.toFixed(0)}ms
                </span>
              </div>
            </div>

            {/* Active Devices */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Truck" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Véhicules Actifs</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium font-data text-text-primary">
                  {systemHealth.activeDevices}/{systemHealth.totalDevices}
                </span>
                <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary transition-all duration-300"
                    style={{ width: `${(systemHealth.activeDevices / systemHealth.totalDevices) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-border bg-surface-secondary">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </span>
              <button className="text-xs text-secondary hover:text-secondary-700 font-medium transition-colors duration-150">
                Actualiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatusIndicator;