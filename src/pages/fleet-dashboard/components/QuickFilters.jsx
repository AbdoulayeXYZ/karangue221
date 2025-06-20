import React from 'react';
import Icon from 'components/AppIcon';

const QuickFilters = ({ 
  selectedTimeRange, 
  selectedVehicleStatus, 
  selectedDriver, 
  onFilterChange 
}) => {
  const timeRangeOptions = [
    { value: 'today', label: 'Aujourd\'hui', icon: 'Calendar' },
    { value: 'yesterday', label: 'Hier', icon: 'Calendar' },
    { value: 'week', label: 'Cette semaine', icon: 'Calendar' },
    { value: 'month', label: 'Ce mois', icon: 'Calendar' },
    { value: 'custom', label: 'Personnalisé', icon: 'CalendarRange' }
  ];

  const vehicleStatusOptions = [
    { value: 'all', label: 'Tous les véhicules', icon: 'Truck', count: 135 },
    { value: 'moving', label: 'En mouvement', icon: 'Navigation', count: 89 },
    { value: 'idle', label: 'À l\'arrêt', icon: 'Clock', count: 38 },
    { value: 'warning', label: 'Alertes', icon: 'AlertTriangle', count: 8 },
    { value: 'offline', label: 'Hors ligne', icon: 'WifiOff', count: 0 }
  ];

  const driverOptions = [
    { value: 'all', label: 'Tous les conducteurs' },
    { value: 'Amadou Diallo', label: 'Amadou Diallo' },
    { value: 'Fatou Sow', label: 'Fatou Sow' },
    { value: 'Ousmane Ba', label: 'Ousmane Ba' },
    { value: 'Aïssatou Diop', label: 'Aïssatou Diop' },
    { value: 'Mamadou Ndiaye', label: 'Mamadou Ndiaye' },
    { value: 'Moussa Diagne', label: 'Moussa Diagne' },
    { value: 'Khadija Fall', label: 'Khadija Fall' },
    { value: 'Ibrahima Sarr', label: 'Ibrahima Sarr' }
  ];

  const alertTypes = [
    { type: 'speed_violation', label: 'Excès de vitesse', count: 12, color: 'text-error' },
    { type: 'harsh_braking', label: 'Freinage brusque', count: 8, color: 'text-warning' },
    { type: 'adas_alert', label: 'Alertes ADAS', count: 5, color: 'text-warning' },
    { type: 'dms_alert', label: 'Alertes DMS', count: 3, color: 'text-error' },
    { type: 'geofence', label: 'Géofences', count: 2, color: 'text-secondary' },
    { type: 'maintenance', label: 'Maintenance', count: 7, color: 'text-accent' }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
          <Icon name="Clock" size={16} />
          <span>Période</span>
        </h3>
        <div className="space-y-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange('timeRange', option.value)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-base transition-all duration-150 ${
                selectedTimeRange === option.value
                  ? 'bg-secondary text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name={option.icon} size={14} />
                <span>{option.label}</span>
              </div>
              {selectedTimeRange === option.value && (
                <Icon name="Check" size={14} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Status Filter */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
          <Icon name="Truck" size={16} />
          <span>État des Véhicules</span>
        </h3>
        <div className="space-y-2">
          {vehicleStatusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange('vehicleStatus', option.value)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-base transition-all duration-150 ${
                selectedVehicleStatus === option.value
                  ? 'bg-secondary text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name={option.icon} size={14} />
                <span>{option.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-data">{option.count}</span>
                {selectedVehicleStatus === option.value && (
                  <Icon name="Check" size={14} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Driver Filter */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
          <Icon name="User" size={16} />
          <span>Conducteurs</span>
        </h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {driverOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange('driver', option.value)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-base transition-all duration-150 ${
                selectedDriver === option.value
                  ? 'bg-secondary text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
              }`}
            >
              <span>{option.label}</span>
              {selectedDriver === option.value && (
                <Icon name="Check" size={14} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Summary */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
          <Icon name="AlertTriangle" size={16} />
          <span>Résumé des Alertes</span>
        </h3>
        <div className="space-y-3">
          {alertTypes.map((alert) => (
            <div key={alert.type} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{alert.label}</span>
              <span className={`text-sm font-medium font-data ${alert.color}`}>
                {alert.count}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">Total</span>
            <span className="text-lg font-bold text-text-primary font-data">
              {alertTypes.reduce((sum, alert) => sum + alert.count, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
          <Icon name="Zap" size={16} />
          <span>Actions Rapides</span>
        </h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-base transition-all duration-150">
            <Icon name="Download" size={14} />
            <span>Exporter Données</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-base transition-all duration-150">
            <Icon name="FileText" size={14} />
            <span>Rapport Détaillé</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-base transition-all duration-150">
            <Icon name="Bell" size={14} />
            <span>Configurer Alertes</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-base transition-all duration-150">
            <Icon name="RefreshCw" size={14} />
            <span>Actualiser Données</span>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
          <Icon name="Info" size={16} />
          <span>Informations Système</span>
        </h3>
        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>Dernière synchronisation:</span>
            <span className="font-data">{new Date().toLocaleTimeString('fr-FR')}</span>
          </div>
          <div className="flex justify-between">
            <span>Dispositifs connectés:</span>
            <span className="font-data">127/135</span>
          </div>
          <div className="flex justify-between">
            <span>Latence moyenne:</span>
            <span className="font-data">120ms</span>
          </div>
          <div className="flex justify-between">
            <span>Qualité signal GPS:</span>
            <span className="font-data text-success">98%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;