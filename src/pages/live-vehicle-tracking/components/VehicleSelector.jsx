import React from 'react';
import Icon from 'components/AppIcon';

const VehicleSelector = ({ 
  vehicles, 
  selectedVehicle, 
  onVehicleSelect, 
  searchQuery, 
  onSearchChange 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'idle': return 'text-secondary';
      case 'warning': return 'text-warning';
      case 'offline': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success-100';
      case 'idle': return 'bg-secondary-100';
      case 'warning': return 'bg-warning-100';
      case 'offline': return 'bg-error-100';
      default: return 'bg-surface-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'Play';
      case 'idle': return 'Pause';
      case 'warning': return 'AlertTriangle';
      case 'offline': return 'WifiOff';
      default: return 'Circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'En Route';
      case 'idle': return 'Au Ralenti';
      case 'warning': return 'Alerte';
      case 'offline': return 'Hors Ligne';
      default: return 'Inconnu';
    }
  };

  const formatLastUpdate = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}j`;
  };

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-heading font-semibold text-text-primary mb-3">
          Véhicules ({vehicles.length})
        </h3>
        
        {/* Search */}
        <div className="relative">
          <Icon 
            name="Search" 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
          />
          <input
            type="text"
            placeholder="Rechercher véhicule..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>
      </div>

      {/* Vehicle List */}
      <div className="flex-1 overflow-y-auto">
        {vehicles.length === 0 ? (
          <div className="p-4 text-center">
            <Icon name="Search" size={32} className="text-text-tertiary mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Aucun véhicule trouvé</p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => onVehicleSelect(vehicle)}
                className={`w-full p-3 rounded-base border transition-all duration-150 text-left ${
                  selectedVehicle?.id === vehicle.id
                    ? 'border-secondary bg-secondary-50 shadow-elevation-1'
                    : 'border-border hover:border-secondary-200 hover:bg-surface-secondary'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {vehicle.plateNumber}
                    </p>
                    <p className="text-sm text-text-secondary truncate">
                      {vehicle.driverName}
                    </p>
                  </div>
                  
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(vehicle.status)}`}>
                    <Icon 
                      name={getStatusIcon(vehicle.status)} 
                      size={10} 
                      className={getStatusColor(vehicle.status)} 
                    />
                    <span className={getStatusColor(vehicle.status)}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Icon name="Gauge" size={12} />
                      <span>{vehicle.speed} km/h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Fuel" size={12} />
                      <span>{vehicle.fuel}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>{formatLastUpdate(vehicle.lastUpdate)}</span>
                  </div>
                </div>

                {/* Alerts Indicator */}
                {vehicle.alerts.length > 0 && (
                  <div className="mt-2 flex items-center space-x-1">
                    <Icon name="AlertCircle" size={12} className="text-warning" />
                    <span className="text-xs text-warning font-medium">
                      {vehicle.alerts.length} alerte{vehicle.alerts.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-surface-secondary hover:bg-border rounded-base transition-colors duration-150">
            <Icon name="RefreshCw" size={12} />
            <span>Actualiser</span>
          </button>
          <button className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-surface-secondary hover:bg-border rounded-base transition-colors duration-150">
            <Icon name="Filter" size={12} />
            <span>Filtrer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleSelector;