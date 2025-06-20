import React from 'react';
import Icon from 'components/AppIcon';

const VehicleSelector = ({ vehicles, selectedVehicle, onVehicleSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'inactive': return 'text-warning';
      case 'offline': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return 'bg-success-50';
      case 'inactive': return 'bg-warning-50';
      case 'offline': return 'bg-error-50';
      default: return 'bg-surface-secondary';
    }
  };

  const getCameraStatusIcon = (cameraType) => {
    // Check if cameras array exists and has the specified camera type
    if (!cameraType) return 'VideoOff';
    
    // For now, return a default icon since we don't have detailed camera status
    return 'Video';
  };

  const getCameraStatusColor = (cameraType) => {
    // Check if cameras array exists and has the specified camera type
    if (!cameraType) return 'text-error';
    
    // For now, return a default color since we don't have detailed camera status
    return 'text-success';
  };

  const hasCamera = (vehicle, cameraType) => {
    return vehicle.cameras && Array.isArray(vehicle.cameras) && vehicle.cameras.includes(cameraType);
  };

  const formatLastUpdate = (lastUpdate) => {
    if (!lastUpdate) return 'N/A';
    try {
      const date = new Date(lastUpdate);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Truck" size={18} className="text-primary" />
        <h3 className="font-heading font-semibold text-text-primary">
          Sélection Véhicule
        </h3>
      </div>

      <div className="space-y-3">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => onVehicleSelect(vehicle.id)}
            className={`w-full p-3 rounded-base border transition-all duration-150 text-left ${
              selectedVehicle === vehicle.id
                ? 'border-secondary bg-secondary-50' :'border-border hover:border-secondary-200 hover:bg-surface-secondary'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-text-primary text-sm">
                    {vehicle.registration || 'N/A'}
                  </span>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBg(vehicle.status)} ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status === 'active' ? 'Actif' : vehicle.status === 'inactive' ? 'Inactif' : 'Hors ligne'}
                  </div>
                </div>
                <p className="text-xs text-text-secondary mb-1">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </p>
                <p className="text-xs text-text-secondary">
                  {vehicle.type || 'Type non spécifié'}
                </p>
              </div>
            </div>

            {/* Camera Status Indicators */}
            <div className="flex items-center justify-between pt-2 border-t border-border-light">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Icon 
                    name={getCameraStatusIcon(hasCamera(vehicle, 'driver'))} 
                    size={12} 
                    className={getCameraStatusColor(hasCamera(vehicle, 'driver'))}
                  />
                  <span className="text-xs text-text-secondary">Conducteur</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon 
                    name={getCameraStatusIcon(hasCamera(vehicle, 'front'))} 
                    size={12} 
                    className={getCameraStatusColor(hasCamera(vehicle, 'front'))}
                  />
                  <span className="text-xs text-text-secondary">Route</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon 
                    name={getCameraStatusIcon(hasCamera(vehicle, 'rear'))} 
                    size={12} 
                    className={getCameraStatusColor(hasCamera(vehicle, 'rear'))}
                  />
                  <span className="text-xs text-text-secondary">Arrière</span>
                </div>
              </div>
              
              <div className="text-xs text-text-secondary">
                {vehicle.cameras ? `${vehicle.cameras.length} caméra(s)` : 'Aucune caméra'}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
              <span>Dernière MAJ:</span>
              <span>{formatLastUpdate(vehicle.lastUpdate)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-success-50 rounded-base">
            <div className="text-lg font-semibold text-success-700">
              {vehicles.filter(v => v.status === 'active').length}
            </div>
            <div className="text-xs text-success-600">Actifs</div>
          </div>
          <div className="p-2 bg-warning-50 rounded-base">
            <div className="text-lg font-semibold text-warning-700">
              {vehicles.filter(v => v.cameras && v.cameras.length > 0).length}
            </div>
            <div className="text-xs text-warning-600">Avec caméras</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSelector;