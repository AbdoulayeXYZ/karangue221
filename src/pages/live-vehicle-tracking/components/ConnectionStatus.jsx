import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const ConnectionStatus = ({ status }) => {
  const [dataRate, setDataRate] = useState(0);
  const [packetsReceived, setPacketsReceived] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Simulate real-time data metrics
    const interval = setInterval(() => {
      if (status === 'connected') {
        setDataRate(Math.floor(Math.random() * 50) + 150); // 150-200 packets/sec
        setPacketsReceived(prev => prev + Math.floor(Math.random() * 10) + 5);
      } else {
        setDataRate(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'connecting': return 'text-warning';
      case 'disconnected': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-success-50 border-success-200';
      case 'connecting': return 'bg-warning-50 border-warning-200';
      case 'disconnected': return 'bg-error-50 border-error-200';
      default: return 'bg-surface-secondary border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return 'Wifi';
      case 'connecting': return 'Loader';
      case 'disconnected': return 'WifiOff';
      default: return 'Wifi';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Connecté';
      case 'connecting': return 'Connexion...';
      case 'disconnected': return 'Déconnecté';
      default: return 'Inconnu';
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
        className={`flex items-center space-x-3 px-4 py-2 rounded-base border transition-all duration-150 ${getStatusBgColor(status)} hover:shadow-elevation-1`}
        aria-label="État de la connexion"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-2">
          <Icon 
            name={getStatusIcon(status)} 
            size={16} 
            className={`${getStatusColor(status)} transition-colors duration-150 ${status === 'connecting' ? 'animate-spin' : ''}`}
          />
          <div className={`w-2 h-2 rounded-full ${
            status === 'connected' ? 'bg-success animate-pulse-slow' : 
            status === 'connecting'? 'bg-warning animate-pulse' : 'bg-error'
          }`}></div>
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-text-primary">
            {getStatusText(status)}
          </p>
          <p className="text-xs text-text-secondary font-data">
            {status === 'connected' ? formatDataRate(dataRate) : 'Aucune donnée'}
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
              <span>Connexion WebSocket</span>
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Zap" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">État</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  status === 'connected' ? 'bg-success animate-pulse-slow' : 
                  status === 'connecting'? 'bg-warning animate-pulse' : 'bg-error'
                }`}></div>
              </div>
            </div>

            {/* Data Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="TrendingUp" size={14} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Débit Données</span>
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
                <span className="text-sm text-text-primary">Qualité</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  status === 'connected' ? 'text-success' : 
                  status === 'connecting'? 'text-warning' : 'text-error'
                }`}>
                  {status === 'connected' ? 'Excellente' : 
                   status === 'connecting'? 'En cours...' : 'Aucune'}
                </span>
                <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      status === 'connected' ? 'bg-success w-full' : 
                      status === 'connecting'? 'bg-warning w-1/2' : 'bg-error w-0'
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Server Info */}
            <div className="pt-3 border-t border-border">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Serveur</span>
                  <span className="text-text-primary font-data">ws://gps.karangue.sn:8080</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Protocole</span>
                  <span className="text-text-primary">WebSocket v13</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Latence</span>
                  <span className="text-text-primary font-data">
                    {status === 'connected' ? '45ms' : 'N/A'}
                  </span>
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
                Reconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;