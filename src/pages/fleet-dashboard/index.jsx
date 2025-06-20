import React, { useState, useCallback } from 'react';
import Breadcrumb from 'components/ui/Breadcrumb';
import SystemStatusIndicator from 'components/ui/SystemStatusIndicator';
import Icon from 'components/AppIcon';
import FleetSummaryCards from './components/FleetSummaryCards';
import InteractiveMap from './components/InteractiveMap';
import RecentActivity from './components/RecentActivity';
import QuickFilters from './components/QuickFilters';
import useFleetData from 'hooks/useFleetData';
import useDashboardData from 'hooks/useDashboardData';
import * as activityApi from 'services/api/activities';
import useApiResource from 'hooks/useApiResource';

const FleetDashboard = () => {
  // Filtres
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [selectedVehicleStatus, setSelectedVehicleStatus] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [mapView, setMapView] = useState('normal');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Récupération des données du tableau de bord (avec rafraîchissement auto toutes les 10 secondes)
  const {
    dashboardData = [],
    loading: loadingDashboard,
    error: dashboardError,
    lastUpdated: dashboardLastUpdated,
    refreshDashboard
  } = useDashboardData({ 
    autoRefresh: true, 
    refreshInterval: 5000  // Reduce to 5 seconds for faster updates
  });

  // Récupération des données en temps réel avec WebSocket
  const { 
    // Données de la flotte
    vehicles = [],
    drivers = [],
    incidents = [],
    violations = [],
    telemetry = [],
    lastUpdate,
    isLoading,
    
    // État de connexion
    isConnected,
    isConnecting,
    error,
    reconnectAttempt,
    
    // Méthodes
    refreshData,
    connect,
    disconnect
  } = useFleetData();

  // Récupération des activités avec l'API REST standard
  const { data: activities = [], loading: loadingActivities } = useApiResource({ getAll: activityApi.getActivities });

  // Détermine si les données sont en cours de chargement
  const isDataLoading = isLoading || loadingActivities || loadingDashboard;

  // Détermine l'état de la connexion
  const connectionStatus = error 
    ? 'error' 
    : isConnecting 
      ? 'connecting' 
      : isConnected 
        ? 'connected' 
        : 'disconnected';

  // Fonction pour forcer le rafraîchissement des données
  const handleRefreshData = useCallback(() => {
    console.log('📊 Manual refresh triggered by user');
    
    // First refresh dashboard summary data
    refreshDashboard().then(success => {
      console.log(`Dashboard refresh ${success ? 'succeeded' : 'failed'}`);
      
      // Then refresh WebSocket data
      console.log('Refreshing WebSocket data...');
      refreshData();
      
      // Show a message to user that data is refreshing
      alert('Rafraîchissement des données en cours...');
    });
  }, [refreshData, refreshDashboard]);

  // Fonction pour reconnecter si déconnecté
  const handleReconnect = useCallback(() => {
    if (!isConnected && !isConnecting) {
      connect();
    }
  }, [connect, isConnected, isConnecting]);

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
            <SystemStatusIndicator 
              status={connectionStatus}
              statusText={
                connectionStatus === 'connected' ? 'Connecté en temps réel' :
                connectionStatus === 'connecting' ? 'Connexion en cours...' :
                connectionStatus === 'disconnected' ? 'Déconnecté' :
                'Erreur de connexion'
              }
            />
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="Clock" size={16} />
              <span>
                Dernière mise à jour: {
                  lastUpdate || dashboardLastUpdated 
                    ? new Date(Math.max(
                        lastUpdate ? lastUpdate.getTime() : 0,
                        dashboardLastUpdated ? dashboardLastUpdated.getTime() : 0
                      )).toLocaleTimeString('fr-FR')
                    : 'Jamais'
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshData}
                className="p-2 rounded-full hover:bg-surface-secondary text-text-secondary hover:text-primary transition-colors"
                title="Rafraîchir les données"
                disabled={isConnecting}
              >
                <Icon name="RefreshCw" size={18} className={isConnecting ? 'animate-spin' : ''} />
              </button>
              
              {connectionStatus === 'error' && (
                <button
                  onClick={handleReconnect}
                  className="p-2 rounded-full bg-surface-warning hover:bg-warning/20 text-warning transition-colors"
                  title="Tenter de se reconnecter"
                >
                  <Icon name="ZapOff" size={18} />
                </button>
              )}
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-warning/10 border border-warning rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-warning/20 p-2 text-warning">
                <Icon name="AlertTriangle" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Problème de connexion</h3>
                <p className="text-sm text-text-secondary">{error.message || 'Impossible de se connecter au serveur en temps réel.'}</p>
              </div>
            </div>
            <button 
              onClick={handleReconnect} 
              className="px-4 py-2 bg-warning/10 hover:bg-warning/20 text-warning rounded-lg transition-colors"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connexion...' : 'Reconnecter'}
            </button>
          </div>
        )}

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
              loading={isDataLoading}
              dashboardData={dashboardData}
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
                    {connectionStatus === 'connected' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success flex items-center">
                        <span className="h-2 w-2 rounded-full bg-success mr-1 animate-pulse"></span>
                        Temps réel
                      </span>
                    )}
                    {connectionStatus === 'connecting' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center">
                        <span className="h-2 w-2 rounded-full bg-primary mr-1 animate-pulse"></span>
                        Connexion...
                      </span>
                    )}
                    {connectionStatus === 'disconnected' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-text-secondary/10 text-text-secondary flex items-center">
                        Mode hors ligne
                      </span>
                    )}
                  </div>
                  
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
                loading={isDataLoading}
                connectionStatus={connectionStatus}
              />
            </div>

            {/* Recent Activity Feed */}
            <div className="card">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
                    <Icon name="Activity" size={20} />
                    <span>Activité Récente</span>
                  </h2>
                  
                  {connectionStatus === 'connected' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                      Temps réel
                    </span>
                  )}
                </div>
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