import React, { useMemo } from 'react';
import Icon from 'components/AppIcon';

const QuickFilters = ({ 
  vehicles = [],
  drivers = [],
  incidents = [],
  violations = [],
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

  // Options de statut des véhicules calculées dynamiquement à partir des données réelles
  const vehicleStatusOptions = useMemo(() => [
    { value: 'all', label: 'Tous les véhicules', icon: 'Truck', count: vehicles.length },
    { value: 'moving', label: 'En mouvement', icon: 'Navigation', count: vehicles.filter(v => v.status === 'moving').length },
    { value: 'idle', label: 'À l\'arrêt', icon: 'Clock', count: vehicles.filter(v => v.status === 'idle').length },
    { value: 'warning', label: 'Alertes', icon: 'AlertTriangle', count: vehicles.filter(v => v.status === 'warning').length },
    { value: 'offline', label: 'Hors ligne', icon: 'WifiOff', count: vehicles.filter(v => v.status === 'offline').length }
  ], [vehicles]);

  // Options de conducteurs générées dynamiquement à partir des données réelles
  const driverOptions = useMemo(() => {
    const allDriversOption = [{ value: 'all', label: 'Tous les conducteurs' }];
    const uniqueDrivers = drivers.length > 0
      ? [...new Set(drivers.map(driver => driver.name || driver.id))].map(name => ({
          value: name,
          label: name
        }))
      : [
          { value: 'Amadou Diallo', label: 'Amadou Diallo' },
          { value: 'Fatou Sow', label: 'Fatou Sow' },
          { value: 'Ousmane Ba', label: 'Ousmane Ba' },
          { value: 'Aïssatou Diop', label: 'Aïssatou Diop' },
          { value: 'Mamadou Ndiaye', label: 'Mamadou Ndiaye' },
          { value: 'Moussa Diagne', label: 'Moussa Diagne' },
          { value: 'Khadija Fall', label: 'Khadija Fall' },
          { value: 'Ibrahima Sarr', label: 'Ibrahima Sarr' }
        ];
    
    return [...allDriversOption, ...uniqueDrivers];
  }, [drivers]);

  // Résumé des alertes calculé dynamiquement à partir des données d'incidents et de violations
  const alertTypes = useMemo(() => {
    // Compter les différents types d'alertes dans les incidents et violations
    const speedViolations = violations.filter(v => v.type === 'speed').length;
    const harshBrakingCount = incidents.filter(i => i.type === 'harsh_braking').length;
    const adasAlertCount = incidents.filter(i => i.type?.includes('adas')).length;
    const dmsAlertCount = incidents.filter(i => i.type?.includes('dms')).length;
    const geofenceCount = incidents.filter(i => i.type?.includes('geofence')).length;
    const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;
    
    return [
      { type: 'speed_violation', label: 'Excès de vitesse', count: speedViolations, color: 'text-error' },
      { type: 'harsh_braking', label: 'Freinage brusque', count: harshBrakingCount, color: 'text-warning' },
      { type: 'adas_alert', label: 'Alertes ADAS', count: adasAlertCount, color: 'text-warning' },
      { type: 'dms_alert', label: 'Alertes DMS', count: dmsAlertCount, color: 'text-error' },
      { type: 'geofence', label: 'Géofences', count: geofenceCount, color: 'text-secondary' },
      { type: 'maintenance', label: 'Maintenance', count: maintenanceCount, color: 'text-accent' }
    ];
  }, [incidents, violations, vehicles]);

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
            <span className="font-data flex items-center">
              {new Date().toLocaleTimeString('fr-FR')}
              <span className="ml-1 h-2 w-2 rounded-full bg-success animate-pulse"></span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>Dispositifs connectés:</span>
            <span className="font-data">
              {vehicles.filter(v => v.status !== 'offline').length}/{vehicles.length}
            </span>
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