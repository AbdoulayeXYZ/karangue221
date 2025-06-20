import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const VehicleList = ({ 
  vehicles, 
  selectedVehicle, 
  selectedVehicles, 
  onVehicleSelect, 
  onBulkSelect 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success-50';
      case 'maintenance': return 'text-warning bg-warning-50';
      case 'offline': return 'text-error bg-error-50';
      default: return 'text-text-secondary bg-surface-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  };

  const getDeviceStatusIcon = (device) => {
    switch (device.status) {
      case 'connected': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'offline': return 'XCircle';
      default: return 'HelpCircle';
    }
  };

  const getDeviceStatusColor = (device) => {
    switch (device.status) {
      case 'connected': return 'text-success';
      case 'warning': return 'text-warning';
      case 'offline': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onBulkSelect(vehicles.map(v => v.id));
    } else {
      onBulkSelect([]);
    }
  };

  const handleSelectVehicle = (vehicleId, e) => {
    e.stopPropagation();
    const newSelection = selectedVehicles.includes(vehicleId)
      ? selectedVehicles.filter(id => id !== vehicleId)
      : [...selectedVehicles, vehicleId];
    onBulkSelect(newSelection);
  };

  const isAllSelected = vehicles.length > 0 && selectedVehicles.length === vehicles.length;
  const isPartiallySelected = selectedVehicles.length > 0 && selectedVehicles.length < vehicles.length;

  return (
    <div className="card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Liste des Véhicules ({vehicles.length})
          </h2>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) input.indeterminate = isPartiallySelected;
              }}
              onChange={handleSelectAll}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">Tout sélectionner</span>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {vehicles.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Search" size={48} className="text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Aucun véhicule trouvé
            </h3>
            <p className="text-text-secondary">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => onVehicleSelect(vehicle)}
                className={`p-4 cursor-pointer transition-all duration-150 hover:bg-surface-secondary ${
                  selectedVehicle?.id === vehicle.id ? 'bg-primary-50 border-r-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedVehicles.includes(vehicle.id)}
                    onChange={(e) => handleSelectVehicle(vehicle.id, e)}
                    className="mt-1 rounded border-border text-primary focus:ring-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <div className="w-16 h-12 bg-surface-secondary rounded-base overflow-hidden flex-shrink-0">
                    <Image
                      src={vehicle.image}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-text-primary truncate">
                        {vehicle.registration}
                      </h3>
                      <span className={`status-indicator ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                    </div>

                    <p className="text-sm text-text-secondary mb-2 truncate">
                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </p>

                    <div className="flex items-center space-x-1 mb-2">
                      <Icon name="MapPin" size={12} className="text-text-tertiary" />
                      <span className="text-xs text-text-secondary truncate">
                        {vehicle.location || 'Localisation non disponible'}
                      </span>
                    </div>

                    {vehicle.driver && (
                      <div className="flex items-center space-x-1 mb-3">
                        <Icon name="User" size={12} className="text-text-tertiary" />
                        <span className="text-xs text-text-secondary truncate">
                          {vehicle.driver.name}
                        </span>
                      </div>
                    )}

                    {/* Device Status Indicators */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1" title="GPS">
                        <Icon 
                          name={getDeviceStatusIcon(vehicle.devices?.gps || { status: 'offline' })} 
                          size={12} 
                          className={getDeviceStatusColor(vehicle.devices?.gps || { status: 'offline' })}
                        />
                        <span className="text-xs text-text-tertiary">GPS</span>
                      </div>
                      
                      <div className="flex items-center space-x-1" title="ADAS">
                        <Icon 
                          name={getDeviceStatusIcon(vehicle.devices?.adas || { status: 'offline' })} 
                          size={12} 
                          className={getDeviceStatusColor(vehicle.devices?.adas || { status: 'offline' })}
                        />
                        <span className="text-xs text-text-tertiary">ADAS</span>
                      </div>
                      
                      <div className="flex items-center space-x-1" title="DMS">
                        <Icon 
                          name={getDeviceStatusIcon(vehicle.devices?.dms || { status: 'offline' })} 
                          size={12} 
                          className={getDeviceStatusColor(vehicle.devices?.dms || { status: 'offline' })}
                        />
                        <span className="text-xs text-text-tertiary">DMS</span>
                      </div>
                      
                      <div className="flex items-center space-x-1" title="Caméra">
                        <Icon 
                          name={getDeviceStatusIcon(vehicle.devices?.camera || { status: 'offline' })} 
                          size={12} 
                          className={getDeviceStatusColor(vehicle.devices?.camera || { status: 'offline' })}
                        />
                        <span className="text-xs text-text-tertiary">CAM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleList;