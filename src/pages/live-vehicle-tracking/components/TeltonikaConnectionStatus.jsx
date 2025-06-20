// src/pages/live-vehicle-tracking/components/TeltonikaConnectionStatus.jsx

import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import useTeltonika from '../../../hooks/useTeltonika';

const TeltonikaConnectionStatus = () => {
  const {
    connectionStatus,
    stats,
    error,
    isConnected,
    isConnecting,
    isReconnecting,
    deviceCount
  } = useTeltonika();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [dataRate, setDataRate] = useState(0);
  const [packetsReceived, setPacketsReceived] = useState(0);

  // Simulate data rate metrics
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setDataRate(Math.floor(Math.random() * 50) + 150);
        setPacketsReceived(prev => prev + Math.floor(Math.random() * 10) + 5);
      } else {
        setDataRate(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'connecting': case'reconnecting': return 'text-warning';
      case 'disconnected': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-success-50 border-success-200';
      case 'connecting': case'reconnecting': return 'bg-warning-50 border-warning-200';
      case 'disconnected': return 'bg-error-50 border-error-200';
      default: return 'bg-surface-secondary border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return 'Wifi';
      case 'connecting': case'reconnecting': return 'Loader';
      case 'disconnected': return 'WifiOff';
      default: return 'Wifi';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Teltonika Connecté';
      case 'connecting': return 'Connexion Teltonika...';
      case 'reconnecting': return 'Reconnexion...';
      case 'disconnected': return 'Teltonika Déconnecté';
      default: return 'État Inconnu';
    }
  };

  const formatDataRate = (rate) => {
    if (rate < 1000) return `${rate} pkt/s`;
    return `${(rate / 1000).toFixed(1)}k pkt/s`;
  };

  const formatPackets = (packets) => {
    if (packets < 1000) return packets.toString();
    if (packets < 1000000) return `${(packets / 1000).toFixed(1)}k`;
    return `${(packets / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-3 px-4 py-2 rounded-base border transition-all duration-150 ${getStatusBgColor(connectionStatus)} hover:shadow-elevation-1`}
        aria-label="État de la connexion Teltonika"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-2">
          <Icon 
            name={getStatusIcon(connectionStatus)} 
            size={16} 
            className={`${getStatusColor(connectionStatus)} transition-colors duration-150 ${(isConnecting || isReconnecting) ? 'animate-spin' : ''}`}
          />
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-success animate-pulse-slow' : (isConnecting || isReconnecting) ?'bg-warning animate-pulse' : 'bg-error'
          }`}></div>
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-text-primary">
            {getStatusText(connectionStatus)}
          </p>
          <p className="text-xs text-text-secondary font-data">
            {isConnected ? `${deviceCount} dispositifs • ${formatDataRate(dataRate)}` : 'Aucune donnée'}
          </p>
        </div>
        
        <Icon 
          name="ChevronDown" 
          size={14} 
          className={`text-text-secondary transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="absolute right-0 mt-2 w-96 bg-surface border border-border rounded-base shadow-elevation-3 z-1100 animate-slide-down">
          <div className="p-4 border-b border-border">
            <h3 className="font-heading font-semibold text-text-primary flex items-center space-x-2">
              <Icon name="Activity" size={16} />
              <span>Connexion Teltonika GPS</span>
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Zap" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">État de Connexion</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getStatusColor(connectionStatus)}`}>
                  {getStatusText(connectionStatus)}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-success animate-pulse-slow' : (isConnecting || isReconnecting) ?'bg-warning animate-pulse' : 'bg-error'
                }`}></div>
              </div>
            </div>

            {/* Device Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Truck" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Dispositifs Connectés</span>
              </div>
              <span className="text-sm font-medium font-data text-text-primary">
                {deviceCount}
              </span>
            </div>

            {/* Data Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="TrendingUp" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Débit de Données</span>
              </div>
              <span className="text-sm font-medium font-data text-text-primary">
                {formatDataRate(dataRate)}
              </span>
            </div>

            {/* Packets Received */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Package" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Paquets Reçus</span>
              </div>
              <span className="text-sm font-medium font-data text-text-primary">
                {formatPackets(packetsReceived)}
              </span>
            </div>

            {/* Connection Quality */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Signal" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Qualité de Signal</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-success' : (isConnecting || isReconnecting) ?'text-warning' : 'text-error'
                }`}>
                  {isConnected ? 'Excellente' : (isConnecting || isReconnecting) ?'En cours...' : 'Aucune'}
                </span>
                <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isConnected ? 'bg-success w-full' : (isConnecting || isReconnecting) ?'bg-warning w-1/2' : 'bg-error w-0'
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-start space-x-2 p-2 bg-error-50 border border-error-200 rounded">
                <Icon name="AlertCircle" size={14} className="text-error mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-error">Erreur de Connexion</p>
                  <p className="text-xs text-error opacity-80">{error}</p>
                </div>
              </div>
            )}

            {/* Reconnection Info */}
            {stats.reconnectAttempts > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="RotateCcw" size={14} className="text-text-secondary" />
                  <span className="text-sm text-text-primary">Tentatives de Reconnexion</span>
                </div>
                <span className="text-sm font-medium font-data text-text-primary">
                  {stats.reconnectAttempts}
                </span>
              </div>
            )}

            {/* Protocol Info */}
            <div className="pt-3 border-t border-border">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text-primary">Informations Protocole</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Protocole</span>
                    <span className="text-text-primary font-data">Teltonika Codec 8 Extended</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Transport</span>
                    <span className="text-text-primary font-data">WebSocket</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Version</span>
                    <span className="text-text-primary font-data">v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Latence</span>
                    <span className="text-text-primary font-data">
                      {isConnected ? '23ms' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-border bg-surface-secondary">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </span>
              <button 
                className="text-xs text-secondary hover:text-secondary-700 font-medium transition-colors duration-150"
                onClick={() => window.location.reload()}
              >
                Reconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeltonikaConnectionStatus;