import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Breadcrumb from 'components/ui/Breadcrumb';
import VehicleSelector from './components/VehicleSelector';
import MapView from './components/MapView';
import TelemetryPanel from './components/TelemetryPanel';
import ConnectionStatus from './components/ConnectionStatus';
import useTeltonika from 'hooks/useTeltonika';
import { useAuth } from 'contexts/AuthContext';
import Spinner from 'components/ui/Spinner';

const LiveVehicleTracking = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapMode, setMapMode] = useState('satellite');
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Utilisation du hook WebSocket pour les données en temps réel
  const teltonika = useTeltonika({
    token: user?.token,
    autoConnect: true,
    autoSubscribe: true
  });

  // Gérer l'état de chargement global
  useEffect(() => {
    const isLoading = teltonika.isConnecting || 
                      (!teltonika.isConnected && !teltonika.error) || 
                      teltonika.isReconnecting;
    setLoading(isLoading);
  }, [teltonika.isConnecting, teltonika.isConnected, teltonika.isReconnecting, teltonika.error]);

  // Gérer les événements du véhicule
  useEffect(() => {
    if (teltonika.events && teltonika.events.length > 0) {
      // Transformer les événements pour inclure plus d'informations utiles
      const formattedEvents = teltonika.events.map(event => ({
        ...event,
        formattedTime: new Date(event.timestamp).toLocaleTimeString('fr-FR'),
        formattedDate: new Date(event.timestamp).toLocaleDateString('fr-FR'),
        severity: event.severity || 'info'
      }));
      setLiveEvents(formattedEvents);
    }
  }, [teltonika.events]);

  // Sélection par défaut du premier véhicule et mise à jour si le véhicule sélectionné change
  useEffect(() => {
    if (teltonika.vehicles.length > 0) {
      if (!selectedVehicle) {
        // Premier chargement - sélectionner le premier véhicule
        setSelectedVehicle(teltonika.vehicles[0]);
      } else {
        // Mettre à jour le véhicule sélectionné avec les données les plus récentes
        const updatedVehicle = teltonika.vehicles.find(v => v.id === selectedVehicle.id);
        if (updatedVehicle && JSON.stringify(updatedVehicle) !== JSON.stringify(selectedVehicle)) {
          setSelectedVehicle(updatedVehicle);
        }
      }
    }
  }, [teltonika.vehicles, selectedVehicle]);
  // Recherche de véhicules
  const filteredVehicles = teltonika.vehicles.filter(vehicle =>
    vehicle.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistiques d'état des véhicules
  const getStatusStats = () => {
    const stats = teltonika.vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});
    return {
      active: stats.active || 0,
      idle: stats.idle || 0,
      warning: stats.warning || 0,
      offline: stats.offline || 0,
      total: teltonika.vehicles.length
    };
  };
  const statusStats = getStatusStats();

  // Fonction pour reconnecter le WebSocket si déconnecté
  const handleReconnect = () => {
    if (!teltonika.isConnected) {
      teltonika.connect();
    }
  };

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
            {teltonika.error && (
              <div className="mt-2 px-3 py-2 bg-error-50 border border-error-200 rounded-base text-sm text-error">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} />
                  <span>Erreur de connexion: {teltonika.error.message || "Impossible de se connecter au service de télémétrie"}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ConnectionStatus 
              status={teltonika.isConnected ? 'connected' : teltonika.isConnecting || teltonika.isReconnecting ? 'connecting' : 'disconnected'} 
              onReconnect={handleReconnect}
            />
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
                <p className="text-2xl font-semibold text-text-primary">
                  {teltonika.vehicles.filter(v => v.status === 'active').length}
                </p>
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

        {/* Indicateur de chargement pendant la connexion */}
        {loading && (
          <div className="mb-6 flex items-center justify-center p-4 bg-surface-secondary rounded-base border border-border">
            <Spinner size="md" className="mr-3" />
            <span className="text-text-secondary">
              {teltonika.isReconnecting 
                ? `Tentative de reconnexion (${teltonika.reconnectAttempt || 1}/10)...` 
                : "Connexion au service de télémétrie en cours..."}
            </span>
          </div>
        )}

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
              loading={loading}
              connectionStatus={teltonika.isConnected ? 'connected' : 'disconnected'}
            />
          </div>
          {/* Center Panel - Map View */}
          <div className={`col-span-12 ${isRightPanelOpen ? 'lg:col-span-7' : 'lg:col-span-10'} transition-all duration-300`}>
            <MapView
              selectedVehicle={selectedVehicle}
              vehicles={teltonika.vehicles}
              mapMode={mapMode}
              onMapModeChange={setMapMode}
              isPlaybackMode={isPlaybackMode}
              onPlaybackModeChange={setIsPlaybackMode}
              loading={loading}
              lastUpdate={teltonika.lastUpdate}
              updateFrequency="real-time"
              onVehicleSelect={setSelectedVehicle}
            />
          </div>
          {/* Right Panel - Telemetry & Data */}
          {isRightPanelOpen && (
            <div className="col-span-12 lg:col-span-3">
              <TelemetryPanel
                selectedVehicle={selectedVehicle}
                liveEvents={liveEvents}
                telemetryData={selectedVehicle ? teltonika.telemetryData[selectedVehicle.id] : null}
                onClose={() => setIsRightPanelOpen(false)}
                loading={loading}
                isConnected={teltonika.isConnected}
                lastUpdate={teltonika.lastUpdate}
              />
            </div>
          )}
        </div>

        {/* Dernière mise à jour et état de connexion */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-text-secondary">
            {teltonika.isConnected ? (
              <span className="text-success flex items-center">
                <Icon name="CheckCircle" size={12} className="mr-1" />
                Connecté et recevant des données en temps réel
              </span>
            ) : (
              <span className="text-error flex items-center">
                <Icon name="XCircle" size={12} className="mr-1" />
                Déconnecté du service de télémétrie
              </span>
            )}
          </div>
          {teltonika.lastUpdate && (
            <div className="text-xs text-text-secondary text-right">
              Dernière mise à jour : {teltonika.lastUpdate.toLocaleTimeString('fr-FR')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveVehicleTracking;