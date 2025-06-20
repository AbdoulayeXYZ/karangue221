import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const API_URL = 'http://localhost:5001/api';

const InteractiveMap = ({ mapView, vehicleStatus, selectedDriver, timeRange }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 14.6928, lng: -17.4467 }); // Dakar, Senegal
  const [zoomLevel, setZoomLevel] = useState(12);
  const [showGeofences, setShowGeofences] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/vehicles`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des véhicules');
        return res.json();
      })
      .then(data => {
        setVehicles(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const getVehicleStatusColor = (status) => {
    switch (status) {
      case 'moving': return '#10B981'; // success
      case 'idle': return '#F59E0B'; // warning
      case 'warning': return '#EF4444'; // error
      case 'offline': return '#6B7280'; // gray
      default: return '#6B7280';
    }
  };

  const getVehicleStatusIcon = (status) => {
    switch (status) {
      case 'moving': return 'Navigation';
      case 'idle': return 'Clock';
      case 'warning': return 'AlertTriangle';
      case 'offline': return 'WifiOff';
      default: return 'Truck';
    }
  };

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setMapCenter(vehicle.location);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 8));
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (vehicleStatus !== 'all' && vehicle.status !== vehicleStatus) return false;
    if (selectedDriver !== 'all' && vehicle.driver !== selectedDriver) return false;
    return true;
  });

  return (
    <div className="relative">
      {/* Map Container */}
      <div className="h-96 lg:h-[500px] bg-surface-secondary rounded-base overflow-hidden relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-text-secondary">Chargement de la carte...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Google Maps Iframe */}
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              title="Fleet Tracking Map"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=${zoomLevel}&output=embed&maptype=${mapView === 'satellite' ? 'satellite' : 'roadmap'}`}
              className="w-full h-full border-0"
            />

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 bg-surface border border-border rounded-base shadow-elevation-1 flex items-center justify-center text-text-primary hover:bg-surface-secondary transition-all duration-150"
                aria-label="Zoom avant"
              >
                <Icon name="Plus" size={16} />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 bg-surface border border-border rounded-base shadow-elevation-1 flex items-center justify-center text-text-primary hover:bg-surface-secondary transition-all duration-150"
                aria-label="Zoom arrière"
              >
                <Icon name="Minus" size={16} />
              </button>
              <button
                onClick={() => setShowGeofences(!showGeofences)}
                className={`w-10 h-10 border border-border rounded-base shadow-elevation-1 flex items-center justify-center transition-all duration-150 ${
                  showGeofences ? 'bg-secondary text-white' : 'bg-surface text-text-primary hover:bg-surface-secondary'
                }`}
                aria-label="Afficher/masquer les géofences"
              >
                <Icon name="MapPin" size={16} />
              </button>
            </div>

            {/* Vehicle Status Legend */}
            <div className="absolute bottom-4 left-4 bg-surface border border-border rounded-base shadow-elevation-1 p-3">
              <h4 className="text-xs font-medium text-text-primary mb-2">Légende</h4>
              <div className="space-y-1">
                {[
                  { status: 'moving', label: 'En mouvement', count: filteredVehicles.filter(v => v.status === 'moving').length },
                  { status: 'idle', label: 'À l\'arrêt', count: filteredVehicles.filter(v => v.status === 'idle').length },
                  { status: 'warning', label: 'Alerte', count: filteredVehicles.filter(v => v.status === 'warning').length },
                  { status: 'offline', label: 'Hors ligne', count: filteredVehicles.filter(v => v.status === 'offline').length }
                ].map(item => (
                  <div key={item.status} className="flex items-center space-x-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getVehicleStatusColor(item.status) }}
                    ></div>
                    <span className="text-text-secondary">{item.label} ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Vehicle List */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
        {filteredVehicles.map(vehicle => (
          <button
            key={vehicle.id}
            onClick={() => handleVehicleClick(vehicle)}
            className={`p-3 border rounded-base text-left transition-all duration-150 hover:shadow-elevation-1 ${
              selectedVehicle?.id === vehicle.id 
                ? 'border-secondary bg-secondary-50' :'border-border bg-surface hover:bg-surface-secondary'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getVehicleStatusColor(vehicle.status) }}
                ></div>
                <span className="font-medium text-sm text-text-primary">{vehicle.id}</span>
              </div>
              <Icon name={getVehicleStatusIcon(vehicle.status)} size={14} className="text-text-secondary" />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">{vehicle.name}</p>
              <p className="text-xs text-text-secondary">Conducteur: {vehicle.driver}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">{vehicle.speed} km/h</span>
                <span className="text-text-secondary">Carburant: {vehicle.fuel}%</span>
              </div>
              {vehicle.alerts.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Icon name="AlertTriangle" size={12} className="text-warning" />
                  <span className="text-xs text-warning">{vehicle.alerts.length} alerte(s)</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Vehicle Details */}
      {selectedVehicle && (
        <div className="mt-4 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-text-primary">
              Détails du Véhicule - {selectedVehicle.id}
            </h3>
            <button
              onClick={() => setSelectedVehicle(null)}
              className="p-1 text-text-secondary hover:text-text-primary rounded-base hover:bg-surface-secondary"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-text-secondary">Conducteur</p>
              <p className="font-medium text-text-primary">{selectedVehicle.driver}</p>
            </div>
            <div>
              <p className="text-text-secondary">Vitesse</p>
              <p className="font-medium text-text-primary font-data">{selectedVehicle.speed} km/h</p>
            </div>
            <div>
              <p className="text-text-secondary">Carburant</p>
              <p className="font-medium text-text-primary font-data">{selectedVehicle.fuel}%</p>
            </div>
            <div>
              <p className="text-text-secondary">Dernière MAJ</p>
              <p className="font-medium text-text-primary font-data">
                {selectedVehicle.lastUpdate.toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
          
          {selectedVehicle.alerts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-text-secondary mb-2">Alertes actives:</p>
              <div className="flex flex-wrap gap-2">
                {selectedVehicle.alerts.map((alert, index) => (
                  <span key={index} className="status-indicator status-warning">
                    {alert.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;