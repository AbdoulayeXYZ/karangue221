import React, { useState } from 'react';
import Breadcrumb from 'components/ui/Breadcrumb';
import SystemStatusIndicator from 'components/ui/SystemStatusIndicator';
import Icon from 'components/AppIcon';
import FleetSummaryCards from './components/FleetSummaryCards';
import InteractiveMap from './components/InteractiveMap';
import RecentActivity from './components/RecentActivity';
import QuickFilters from './components/QuickFilters';
import useApiResource from 'hooks/useApiResource';
import * as vehicleApi from 'services/api/vehicles';
import * as driverApi from 'services/api/drivers';
import * as incidentApi from 'services/api/incidents';
import * as violationApi from 'services/api/violations';
import * as telemetryApi from 'services/api/telemetry';
import * as activityApi from 'services/api/activities';

const FleetDashboard = () => {
  // Filtres
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [selectedVehicleStatus, setSelectedVehicleStatus] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [mapView, setMapView] = useState('normal');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    lastUpdate: new Date(),
    connectionStatus: 'connected'
  });

  // Données dynamiques
  const { data: vehicles = [], loading: loadingVehicles } = useApiResource({ getAll: vehicleApi.getVehicles });
  const { data: drivers = [], loading: loadingDrivers } = useApiResource({ getAll: driverApi.getDrivers });
  const { data: incidents = [], loading: loadingIncidents } = useApiResource({ getAll: incidentApi.getIncidents });
  const { data: violations = [], loading: loadingViolations } = useApiResource({ getAll: violationApi.getViolations });
  const { data: telemetry = [], loading: loadingTelemetry } = useApiResource({ getAll: telemetryApi.getTelemetry });
  const { data: activities = [], loading: loadingActivities } = useApiResource({ getAll: activityApi.getActivities });

  // Filtres dynamiques
  const filteredVehicles = selectedVehicleStatus === 'all' ? vehicles : vehicles.filter(v => v.status === selectedVehicleStatus);
  const filteredDrivers = selectedDriver === 'all' ? drivers : drivers.filter(d => d.id === selectedDriver);

  // Gestion des filtres
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'timeRange':
        setSelectedTimeRange(value);
        break;
      case 'vehicleStatus':
        setSelectedVehicleStatus(value);
        break;
      case 'driver':
        setSelectedDriver(value);
        break;
      default:
        break;
    }
  };

  const handleMapViewChange = (view) => {
    setMapView(view);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 lg:px-6 py-6">
        <Breadcrumb />
        
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
              Tableau de Bord Flotte
            </h1>
            <p className="text-text-secondary">
              Surveillance en temps réel de votre flotte de véhicules
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <SystemStatusIndicator />
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="Clock" size={16} />
              <span>Dernière mise à jour: {realTimeData.lastUpdate.toLocaleTimeString('fr-FR')}</span>
            </div>
            
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="lg:hidden btn-secondary flex items-center space-x-2"
            >
              <Icon name="Filter" size={16} />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Fleet Summary */}
          <div className="lg:col-span-3">
            <FleetSummaryCards
              vehicles={vehicles}
              drivers={drivers}
              incidents={incidents}
              violations={violations}
              telemetry={telemetry}
              timeRange={selectedTimeRange}
              vehicleStatus={selectedVehicleStatus}
              loading={loadingVehicles || loadingDrivers || loadingIncidents || loadingTelemetry}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6 space-y-6">
            {/* Interactive Map */}
            <div className="card">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
                    <Icon name="Map" size={20} />
                    <span>Localisation en Temps Réel</span>
                  </h2>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMapViewChange('normal')}
                      className={`px-3 py-1.5 text-sm rounded-base transition-all duration-150 ${
                        mapView === 'normal' ?'bg-secondary text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => handleMapViewChange('satellite')}
                      className={`px-3 py-1.5 text-sm rounded-base transition-all duration-150 ${
                        mapView === 'satellite' ?'bg-secondary text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      Satellite
                    </button>
                    <button
                      onClick={() => handleMapViewChange('traffic')}
                      className={`px-3 py-1.5 text-sm rounded-base transition-all duration-150 ${
                        mapView === 'traffic' ?'bg-secondary text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      Trafic
                    </button>
                  </div>
                </div>
              </div>
              
              <InteractiveMap
                vehicles={filteredVehicles}
                drivers={drivers}
                telemetry={telemetry}
                mapView={mapView}
                vehicleStatus={selectedVehicleStatus}
                selectedDriver={selectedDriver}
                timeRange={selectedTimeRange}
                loading={loadingVehicles || loadingTelemetry}
              />
            </div>

            {/* Recent Activity Feed */}
            <div className="card">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
                  <Icon name="Activity" size={20} />
                  <span>Activité Récente</span>
                </h2>
              </div>
              
              <RecentActivity
                activities={activities}
                timeRange={selectedTimeRange}
                vehicleStatus={selectedVehicleStatus}
                selectedDriver={selectedDriver}
                loading={loadingActivities}
              />
            </div>
          </div>

          {/* Right Panel - Quick Filters */}
          <div className={`lg:col-span-3 ${isFilterPanelOpen ? 'block' : 'hidden lg:block'}`}>
            <QuickFilters
              vehicles={vehicles}
              drivers={drivers}
              incidents={incidents}
              violations={violations}
              selectedTimeRange={selectedTimeRange}
              selectedVehicleStatus={selectedVehicleStatus}
              selectedDriver={selectedDriver}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {isFilterPanelOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="w-full bg-surface rounded-t-lg max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-heading font-semibold text-text-primary">Filtres</h3>
                <button
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="p-2 text-text-secondary hover:text-text-primary rounded-base hover:bg-surface-secondary"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <QuickFilters
                  vehicles={vehicles}
                  drivers={drivers}
                  incidents={incidents}
                  violations={violations}
                  selectedTimeRange={selectedTimeRange}
                  selectedVehicleStatus={selectedVehicleStatus}
                  selectedDriver={selectedDriver}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FleetDashboard;