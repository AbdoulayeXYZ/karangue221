import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOwnerData } from '../../hooks/useOwnerData';
import Icon from '../../components/AppIcon';

// Composants spécifiques owner
import OwnerHeader from './components/OwnerHeader';
import OwnerStatsCards from './components/OwnerStatsCards';
import OwnerFleetOverview from './components/OwnerFleetOverview';
import OwnerVehicleManagement from './components/OwnerVehicleManagement';
import OwnerDriverManagement from './components/OwnerDriverManagement';
import OwnerActivity from './components/OwnerActivity';
import OwnerPerformanceMetrics from './components/OwnerPerformanceMetrics';
import OwnerSettings from './components/OwnerSettings';
import SystemStatusIndicator from '../../components/ui/SystemStatusIndicator';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Récupération des données owner avec rafraîchissement auto
  const {
    data,
    loading,
    errors,
    lastUpdated,
    refreshAll,
    refreshEssential,
    loadVehicles,
    loadDrivers,
    loadViolations,
    loadIncidents,
    loadActivity,
    loadPerformance,
    isLoading,
    hasErrors
  } = useOwnerData({
    autoRefresh: true,
    refreshInterval: 30000, // 30 secondes
    initialLoad: true
  });

  // Vérifier les privilèges owner
  if (user?.role !== 'owner') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Icon name="ShieldAlert" size={64} className="text-warning mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Accès Refusé
          </h1>
          <p className="text-text-secondary">
            Vous devez être propriétaire de flotte pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  const handleRefreshData = useCallback(() => {
    console.log('🔄 Rafraîchissement manuel des données owner');
    refreshAll();
  }, [refreshAll]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Charger les données spécifiques à l'onglet si nécessaire
    switch (tab) {
      case 'vehicles':
        loadVehicles();
        break;
      case 'drivers':
        loadDrivers();
        break;
      case 'violations':
        loadViolations();
        break;
      case 'incidents':
        loadIncidents();
        break;
      case 'performance':
        loadPerformance();
        break;
      case 'activity':
        loadActivity();
        break;
      default:
        break;
    }
  };

  const tabs = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: 'Home' },
    { key: 'vehicles', label: 'Véhicules', icon: 'Truck' },
    { key: 'drivers', label: 'Conducteurs', icon: 'Users' },
    { key: 'violations', label: 'Violations', icon: 'AlertTriangle' },
    { key: 'incidents', label: 'Incidents', icon: 'AlertOctagon' },
    { key: 'performance', label: 'Performance', icon: 'BarChart3' },
    { key: 'activity', label: 'Activité', icon: 'Activity' },
    { key: 'settings', label: 'Paramètres', icon: 'Settings' }
  ];

  const getConnectionStatus = () => {
    if (hasErrors) return 'error';
    if (isLoading) return 'connecting';
    return data.dashboard ? 'connected' : 'disconnected';
  };

  return (
    <div className="min-h-screen bg-background">
      <OwnerHeader 
        user={user}
        fleetInfo={data.fleet}
        onRefresh={handleRefreshData}
        isLoading={isLoading}
      />
      
      <div className="pt-16"> {/* Compensation pour le header fixe */}
        <div className="px-4 lg:px-6 py-6">
        
        {/* Header du tableau de bord owner */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
              {data.fleet?.name || 'Ma Flotte'}
            </h1>
            <p className="text-text-secondary">
              Tableau de bord et gestion de votre flotte de véhicules
            </p>
            <div className="mt-2 text-sm text-text-secondary">
              Connecté en tant que: <span className="font-medium text-primary">{user.name}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <SystemStatusIndicator 
              status={getConnectionStatus()}
              statusText={
                getConnectionStatus() === 'connected' ? 'Données synchronisées' :
                getConnectionStatus() === 'connecting' ? 'Synchronisation...' :
                getConnectionStatus() === 'disconnected' ? 'Hors ligne' :
                'Erreur de connexion'
              }
            />
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="Clock" size={16} />
              <span>
                Dernière màj: {lastUpdated ? lastUpdated.toLocaleTimeString('fr-FR') : 'Jamais'}
              </span>
            </div>
            
            <button
              onClick={handleRefreshData}
              className="p-2 rounded-full hover:bg-surface-secondary text-text-secondary hover:text-primary transition-colors"
              title="Rafraîchir les données"
              disabled={isLoading}
            >
              <Icon name="RefreshCw" size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Alertes d'erreur globales */}
        {hasErrors && (
          <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-error/20 p-2 text-error">
                <Icon name="AlertTriangle" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Erreurs détectées</h3>
                <p className="text-sm text-text-secondary">
                  Certaines données n'ont pas pu être chargées. Vérifiez la connectivité.
                </p>
              </div>
            </div>
            <button 
              onClick={handleRefreshData} 
              className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : 'Réessayer'}
            </button>
          </div>
        )}

        {/* Navigation des onglets */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }`}
                >
                  <Icon name={tab.icon} size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu principal basé sur l'onglet actif */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Cartes de statistiques */}
              <OwnerStatsCards
                dashboard={data.dashboard}
                loading={loading.dashboard}
                error={errors.dashboard}
              />
              
              {/* Vue d'ensemble de la flotte */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OwnerFleetOverview
                  fleet={data.fleet}
                  dashboard={data.dashboard}
                  loading={loading.dashboard || loading.fleet}
                />
                
                <OwnerActivity
                  activities={data.activity}
                  loading={loading.activity}
                  error={errors.activity}
                />
              </div>
            </>
          )}

          {activeTab === 'vehicles' && (
            <OwnerVehicleManagement
              vehicles={data.vehicles}
              loading={loading.vehicles}
              error={errors.vehicles}
              onRefresh={() => loadVehicles()}
            />
          )}

          {activeTab === 'drivers' && (
            <OwnerDriverManagement
              drivers={data.drivers}
              loading={loading.drivers}
              error={errors.drivers}
              onRefresh={() => loadDrivers()}
            />
          )}

          {activeTab === 'violations' && (
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-heading font-semibold text-text-primary mb-4 flex items-center space-x-2">
                  <Icon name="AlertTriangle" size={24} />
                  <span>Violations de Conduite</span>
                </h2>
                
                {loading.violations ? (
                  <div className="flex items-center justify-center py-8">
                    <Icon name="Loader2" size={24} className="animate-spin text-primary" />
                    <span className="ml-2 text-text-secondary">Chargement des violations...</span>
                  </div>
                ) : errors.violations ? (
                  <div className="text-center py-8">
                    <Icon name="AlertTriangle" size={24} className="text-warning mx-auto mb-2" />
                    <p className="text-text-secondary">Erreur lors du chargement des violations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.violations && data.violations.length > 0 ? (
                      data.violations.map((violation, index) => (
                        <div
                          key={violation.id || index}
                          className="p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                violation.severity === 'high' ? 'bg-error text-white' :
                                violation.severity === 'medium' ? 'bg-warning text-white' :
                                'bg-primary text-white'
                              }`}>
                                {violation.severity}
                              </span>
                              <span className="font-medium text-text-primary">{violation.type}</span>
                            </div>
                            <span className="text-sm text-text-secondary">
                              {violation.timestamp ? new Date(violation.timestamp).toLocaleString('fr-FR') : ''}
                            </span>
                          </div>
                          <p className="mt-2 text-text-secondary">{violation.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Icon name="CheckCircle" size={24} className="text-success mx-auto mb-2" />
                        <p className="text-text-secondary">Aucune violation récente</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-heading font-semibold text-text-primary mb-4 flex items-center space-x-2">
                  <Icon name="AlertOctagon" size={24} />
                  <span>Incidents de la Flotte</span>
                </h2>
                
                {loading.incidents ? (
                  <div className="flex items-center justify-center py-8">
                    <Icon name="Loader2" size={24} className="animate-spin text-primary" />
                    <span className="ml-2 text-text-secondary">Chargement des incidents...</span>
                  </div>
                ) : errors.incidents ? (
                  <div className="text-center py-8">
                    <Icon name="AlertTriangle" size={24} className="text-warning mx-auto mb-2" />
                    <p className="text-text-secondary">Erreur lors du chargement des incidents</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.incidents && data.incidents.length > 0 ? (
                      data.incidents.map((incident, index) => (
                        <div
                          key={incident.id || index}
                          className="p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                incident.severity === 'high' ? 'bg-error text-white' :
                                incident.severity === 'medium' ? 'bg-warning text-white' :
                                'bg-primary text-white'
                              }`}>
                                {incident.severity}
                              </span>
                              <span className="font-medium text-text-primary">{incident.type}</span>
                            </div>
                            <span className="text-sm text-text-secondary">
                              {incident.timestamp ? new Date(incident.timestamp).toLocaleString('fr-FR') : ''}
                            </span>
                          </div>
                          <p className="mt-2 text-text-secondary">{incident.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Icon name="CheckCircle" size={24} className="text-success mx-auto mb-2" />
                        <p className="text-text-secondary">Aucun incident récent</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <OwnerPerformanceMetrics
              performance={data.performance}
              loading={loading.performance}
              error={errors.performance}
              onRefresh={() => loadPerformance()}
            />
          )}

          {activeTab === 'activity' && (
            <OwnerActivity
              activities={data.activity}
              loading={loading.activity}
              error={errors.activity}
              onRefresh={() => loadActivity()}
              showHeader={true}
            />
          )}

          {activeTab === 'settings' && (
            <OwnerSettings
              profile={data.profile}
              fleet={data.fleet}
              loading={loading.profile || loading.fleet}
              error={errors.profile || errors.fleet}
            />
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
