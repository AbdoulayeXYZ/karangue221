import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Breadcrumb from 'components/ui/Breadcrumb';
import VehicleSelector from './components/VehicleSelector';
import MapView from './components/MapView';
import TelemetryPanel from './components/TelemetryPanel';
import TeltonikaConnectionStatus from './components/TeltonikaConnectionStatus';
import useApiResource from 'hooks/useApiResource';
import * as vehicleApi from 'services/api/vehicles';
import * as telemetryApi from 'services/api/telemetry';
import * as driverApi from 'services/api/drivers';

const LiveVehicleTracking = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapMode, setMapMode] = useState('satellite');
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);

  // Données dynamiques
  const { data: vehicles = [], loading: loadingVehicles } = useApiResource({ getAll: vehicleApi.getVehicles });
  const { data: telemetry = [], loading: loadingTelemetry } = useApiResource({ getAll: telemetryApi.getTelemetry });
  const { data: drivers = [], loading: loadingDrivers } = useApiResource({ getAll: driverApi.getDrivers });

  // Sélection par défaut
  React.useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles]);

  // Recherche
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistiques d'état
  const getStatusStats = () => {
    const stats = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});
    return {
      active: stats.active || 0,
      idle: stats.idle || 0,
      warning: stats.warning || 0,
      offline: stats.offline || 0,
      total: vehicles.length
    };
  };
  const statusStats = getStatusStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 lg:px-6 py-6">
        <Breadcrumb />
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-text-primary mb-2">
              Suivi en Temps Réel
            </h1>
            <p className="text-text-secondary">
              Surveillance GPS et télémétrie des véhicules en direct
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <TeltonikaConnectionStatus />
            <button
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className="lg:hidden btn-secondary flex items-center space-x-2"
            >
              <Icon name="SidebarClose" size={16} />
              <span>Panneau</span>
            </button>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success-100 rounded-base flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">{statusStats.active}</p>
                <p className="text-sm text-text-secondary">Actifs</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary-100 rounded-base flex items-center justify-center">
                <Icon name="Pause" size={20} className="text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">{statusStats.idle}</p>
                <p className="text-sm text-text-secondary">Au Ralenti</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning-100 rounded-base flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">{statusStats.warning}</p>
                <p className="text-sm text-text-secondary">Alertes</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-error-100 rounded-base flex items-center justify-center">
                <Icon name="WifiOff" size={20} className="text-error" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">{statusStats.offline}</p>
                <p className="text-sm text-text-secondary">Hors Ligne</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-base flex items-center justify-center">
                <Icon name="Satellite" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">{vehicles.length}</p>
                <p className="text-sm text-text-secondary">En Direct</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-base flex items-center justify-center">
                <Icon name="Truck" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">{statusStats.total}</p>
                <p className="text-sm text-text-secondary">Total</p>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
          {/* Left Sidebar - Vehicle Selector */}
          <div className="col-span-12 lg:col-span-2">
            <VehicleSelector
              vehicles={filteredVehicles}
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              loading={loadingVehicles}
            />
          </div>
          {/* Center Panel - Map View */}
          <div className={`col-span-12 ${isRightPanelOpen ? 'lg:col-span-7' : 'lg:col-span-10'} transition-all duration-300`}>
            <MapView
              selectedVehicle={selectedVehicle}
              vehicles={vehicles}
              mapMode={mapMode}
              onMapModeChange={setMapMode}
              isPlaybackMode={isPlaybackMode}
              onPlaybackModeChange={setIsPlaybackMode}
              loading={loadingVehicles || loadingTelemetry}
            />
          </div>
          {/* Right Panel - Telemetry & Data */}
          {isRightPanelOpen && (
            <div className="col-span-12 lg:col-span-3">
              <TelemetryPanel
                selectedVehicle={selectedVehicle}
                telemetry={telemetry}
                onClose={() => setIsRightPanelOpen(false)}
                loading={loadingTelemetry}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveVehicleTracking;