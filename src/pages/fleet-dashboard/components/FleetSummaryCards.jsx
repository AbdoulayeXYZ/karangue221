import React from 'react';
import Icon from 'components/AppIcon';

const FleetSummaryCards = ({ vehicles = [], drivers = [], incidents = [], violations = [], telemetry = [], loading }) => {
  // Calculs dynamiques
  const totalVehicles = vehicles.length;
  const onlineVehicles = vehicles.filter(v => v.status === 'active').length;
  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const alertsCount =
    incidents.filter(i => i.status === 'open').length +
    violations.filter(v => v.status === 'pending').length;
  // Consommation carburant aujourd'hui
  const today = new Date().toISOString().slice(0, 10);
  const todayFuel = telemetry
    .filter(t => t.timestamp && t.timestamp.startsWith(today))
    .reduce((sum, t) => sum + (t.fuel_level || 0), 0);
  // Distance totale (optionnel, si telemetry.distance existe)
  const totalDistance = telemetry.reduce((sum, t) => sum + (t.distance || 0), 0);
  // Vitesse moyenne
  const averageSpeed = telemetry.length > 0 ?
    (telemetry.reduce((sum, t) => sum + (t.speed || 0), 0) / telemetry.length).toFixed(1) : 0;
  // Maintenance due
  const maintenanceDue = vehicles.filter(v => v.status === 'maintenance').length;

  const summaryCards = [
    {
      id: 'total-vehicles',
      title: 'Total Véhicules',
      value: totalVehicles,
      icon: 'Truck',
      color: 'primary',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary',
      subtitle: `${onlineVehicles} en ligne`,
      trend: null
    },
    {
      id: 'active-drivers',
      title: 'Conducteurs Actifs',
      value: activeDrivers,
      icon: 'UserCheck',
      color: 'success',
      bgColor: 'bg-success-50',
      iconColor: 'text-success',
      subtitle: 'Actuellement en service',
      trend: null
    },
    {
      id: 'alerts',
      title: 'Alertes Actives',
      value: alertsCount,
      icon: 'AlertTriangle',
      color: 'warning',
      bgColor: 'bg-warning-50',
      iconColor: 'text-warning',
      subtitle: 'Nécessitent attention',
      trend: null
    },
    {
      id: 'fuel-consumption',
      title: 'Consommation Carburant',
      value: `${todayFuel.toLocaleString('fr-FR')} L`,
      icon: 'Fuel',
      color: 'secondary',
      bgColor: 'bg-secondary-50',
      iconColor: 'text-secondary',
      subtitle: 'Aujourd\'hui',
      trend: null
    },
    {
      id: 'total-distance',
      title: 'Distance Totale',
      value: `${totalDistance.toLocaleString('fr-FR')} km`,
      icon: 'Route',
      color: 'accent',
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent',
      subtitle: 'Aujourd\'hui',
      trend: null
    },
    {
      id: 'average-speed',
      title: 'Vitesse Moyenne',
      value: `${averageSpeed} km/h`,
      icon: 'Gauge',
      color: 'primary',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary',
      subtitle: 'Flotte globale',
      trend: null
    },
    {
      id: 'maintenance-due',
      title: 'Maintenance Due',
      value: maintenanceDue,
      icon: 'Wrench',
      color: 'error',
      bgColor: 'bg-error-50',
      iconColor: 'text-error',
      subtitle: 'Véhicules concernés',
      trend: null
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          Résumé de la Flotte
        </h2>
        {loading && (
          <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

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