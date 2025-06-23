import React, { useMemo } from 'react';
import Icon from 'components/AppIcon';

const FleetSummaryCards = ({ 
  vehicles = [], 
  drivers = [], 
  incidents = [], 
  violations = [], 
  telemetry = [], 
  loading,
  dashboardData = [] 
}) => {
  // Calculs dynamiques optimisés avec useMemo pour éviter les recalculs inutiles lors des mises à jour fréquentes
  const calculatedStats = useMemo(() => {
    // Date d'aujourd'hui pour le filtrage
    const today = new Date().toISOString().slice(0, 10);
    
    // Obtenir les données du dashboard si disponibles
    const dashboardSummary = dashboardData && dashboardData.length > 0 ? dashboardData[0] : null;
    
    // Enhanced logging for dashboard data debugging
    if (dashboardSummary) {
      console.log('📊 Using dashboard data for stats:', dashboardSummary);
      
      // Check if dashboard summary has all required fields
      const requiredFields = ['fleet_name', 'total_vehicles', 'active_vehicles', 'maintenance_vehicles', 
                             'inactive_vehicles', 'total_drivers', 'active_drivers', 'open_incidents', 
                             'total_incidents', 'total_violations', 'last_updated'];
      
      const missingFields = requiredFields.filter(field => !dashboardSummary.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Dashboard data is missing some fields:', missingFields.join(', '));
      }
      
      // Log with safe access to properties (using optional chaining)
      console.log(`📊 Dashboard stats:
        - Fleet: ${dashboardSummary.fleet_name || 'Unknown'}
        - Vehicles: ${dashboardSummary.total_vehicles || 0} (${dashboardSummary.active_vehicles || 0} active, ${dashboardSummary.maintenance_vehicles || 0} maintenance, ${dashboardSummary.inactive_vehicles || 0} inactive)
        - Drivers: ${dashboardSummary.total_drivers || 0} (${dashboardSummary.active_drivers || 0} active)
        - Incidents: ${dashboardSummary.open_incidents || 0} open / ${dashboardSummary.total_incidents || 0} total
        - Violations: ${dashboardSummary.total_violations || 0}
        - Last updated: ${dashboardSummary.last_updated || 'Unknown'}
      `);
    } else {
      console.warn('⚠️ No dashboard data available, using fallback calculation');
      console.warn('⚠️ Will calculate from: ', vehicles.length, 'vehicles,', drivers.length, 'drivers');
      console.log('💡 Check if the API request succeeded but returned no data, or if there was an authentication error');
    }
    
    // Calculs des statistiques - utiliser les données du dashboard si disponibles
    const totalVehicles = dashboardSummary ? dashboardSummary.total_vehicles : vehicles.length;
    const onlineVehicles = dashboardSummary ? dashboardSummary.active_vehicles : vehicles.filter(v => v.status === 'active').length;
    const activeDrivers = dashboardSummary ? dashboardSummary.active_drivers : drivers.filter(d => d.status === 'active').length;
    const alertsCount = dashboardSummary 
      ? (dashboardSummary.open_incidents + dashboardSummary.total_violations)
      : (incidents.filter(i => i.status === 'open').length + violations.filter(v => v.status === 'pending').length);
    
    // Consommation carburant aujourd'hui
    const todayFuel = telemetry
      .filter(t => t.timestamp && t.timestamp.startsWith(today))
      .reduce((sum, t) => sum + (t.fuel_level || 0), 0);
    
    // Distance totale
    const totalDistance = telemetry.reduce((sum, t) => sum + (t.distance || 0), 0);
    
    // Vitesse moyenne
    const averageSpeed = telemetry.length > 0 ?
      (telemetry.reduce((sum, t) => sum + (t.speed || 0), 0) / telemetry.length).toFixed(1) : 0;
    
    // Maintenance due
    const maintenanceDue = dashboardSummary ? dashboardSummary.maintenance_vehicles : vehicles.filter(v => v.status === 'maintenance').length;
    
    return {
      totalVehicles,
      onlineVehicles,
      activeDrivers,
      alertsCount,
      todayFuel,
      totalDistance,
      averageSpeed,
      maintenanceDue,
      hasDashboardData: !!dashboardSummary
    };
  }, [vehicles, drivers, incidents, violations, telemetry, dashboardData]);

  // Mémoisation des cartes de résumé pour éviter les re-rendus inutiles
  const summaryCards = useMemo(() => [
    {
      id: 'total-vehicles',
      title: 'Total Véhicules',
      value: calculatedStats.totalVehicles,
      icon: 'Truck',
      color: 'primary',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary',
      subtitle: calculatedStats.hasDashboardData 
        ? `${calculatedStats.onlineVehicles} en ligne`
        : vehicles.length > 0 
          ? `${calculatedStats.onlineVehicles} en ligne`
          : 'Aucun véhicule disponible',
      trend: null,
      showWarning: !calculatedStats.hasDashboardData && vehicles.length === 0
    },
    {
      id: 'active-drivers',
      title: 'Conducteurs Actifs',
      value: calculatedStats.activeDrivers,
      icon: 'UserCheck',
      color: 'success',
      bgColor: 'bg-success-50',
      iconColor: 'text-success',
      subtitle: calculatedStats.hasDashboardData 
        ? 'Actuellement en service'
        : drivers.length > 0 
          ? 'Actuellement en service'
          : 'Aucun conducteur disponible',
      trend: null,
      showWarning: !calculatedStats.hasDashboardData && drivers.length === 0
    },
    {
      id: 'alerts',
      title: 'Alertes Actives',
      value: calculatedStats.alertsCount,
      icon: 'AlertTriangle',
      color: 'warning',
      bgColor: 'bg-warning-50',
      iconColor: 'text-warning',
      subtitle: 'Nécessitent attention',
      trend: null,
      showWarning: false
    },
    {
      id: 'fuel-consumption',
      title: 'Consommation Carburant',
      value: `${calculatedStats.todayFuel.toLocaleString('fr-FR')} L`,
      icon: 'Fuel',
      color: 'secondary',
      bgColor: 'bg-secondary-50',
      iconColor: 'text-secondary',
      subtitle: 'Aujourd\'hui',
      trend: null,
      showWarning: false
    },
    {
      id: 'total-distance',
      title: 'Distance Totale',
      value: `${calculatedStats.totalDistance.toLocaleString('fr-FR')} km`,
      icon: 'Route',
      color: 'accent',
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent',
      subtitle: 'Aujourd\'hui',
      trend: null,
      showWarning: false
    },
    {
      id: 'average-speed',
      title: 'Vitesse Moyenne',
      value: `${calculatedStats.averageSpeed} km/h`,
      icon: 'Gauge',
      color: 'primary',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary',
      subtitle: 'Flotte globale',
      trend: null,
      showWarning: false
    },
    {
      id: 'maintenance-due',
      title: 'Maintenance Due',
      value: calculatedStats.maintenanceDue,
      icon: 'Wrench',
      color: 'error',
      bgColor: 'bg-error-50',
      iconColor: 'text-error',
      subtitle: 'Véhicules concernés',
      trend: null,
      showWarning: false
    }
  ], [calculatedStats, vehicles.length, drivers.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          Résumé de la Flotte
        </h2>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          )}
          <div className="text-xs text-text-secondary px-2 py-1 rounded-full bg-surface-secondary">
            {calculatedStats.hasDashboardData ? 'Mise à jour en temps réel' : 'Données de secours'}
          </div>
        </div>
      </div>

      {/* Warning message when using fallback data */}
      {!calculatedStats.hasDashboardData && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <span className="text-sm text-warning">
              Données du tableau de bord non disponibles. Affichage des données de secours.
            </span>
          </div>
        </div>
      )}

      {summaryCards.map((card) => (
        <div key={card.id} className="card p-4 hover:shadow-elevation-2 transition-all duration-150">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 ${card.bgColor} rounded-base flex items-center justify-center`}>
                  <Icon name={card.icon} size={20} className={card.iconColor} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-secondary">
                    {card.title}
                  </h3>
                </div>
                {card.showWarning && (
                  <div className="ml-auto">
                    <Icon name="AlertCircle" size={16} className="text-warning" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-text-primary font-data">
                  {typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}
                </p>
                <p className="text-xs text-text-secondary">
                  {card.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Quick Actions */}
      <div className="card p-4 mt-6">
        <h3 className="text-sm font-medium text-text-primary mb-3">Actions Rapides</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-base transition-all duration-150">
            <Icon name="Plus" size={16} />
            <span>Ajouter Véhicule</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-base transition-all duration-150">
            <Icon name="FileText" size={16} />
            <span>Générer Rapport</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-base transition-all duration-150">
            <Icon name="Settings" size={16} />
            <span>Paramètres</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FleetSummaryCards;