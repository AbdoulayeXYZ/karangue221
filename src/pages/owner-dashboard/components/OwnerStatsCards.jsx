import React from 'react';
import Icon from '../../../components/AppIcon';

const OwnerStatsCards = ({ dashboard, loading, error }) => {
  // Valeurs par défaut si les données ne sont pas disponibles
  const defaultStats = {
    fleet: {
      total_vehicles: 0,
      active_vehicles: 0,
      maintenance_vehicles: 0,
      inactive_vehicles: 0,
      total_drivers: 0,
      active_drivers: 0
    },
    violations: {
      total_violations: 0,
      pending_violations: 0,
      confirmed_violations: 0,
      high_severity_violations: 0
    },
    incidents: {
      total_incidents: 0,
      open_incidents: 0,
      resolved_incidents: 0,
      high_severity_incidents: 0
    },
    telemetry: {
      total_records: 0,
      avg_speed: 0,
      active_vehicles_today: 0
    }
  };

  const stats = dashboard || defaultStats;

  // Calcul des métriques dérivées
  const vehicleUtilizationRate = stats.fleet.total_vehicles > 0 
    ? Math.round((stats.fleet.active_vehicles / stats.fleet.total_vehicles) * 100)
    : 0;

  const driverUtilizationRate = stats.fleet.total_drivers > 0
    ? Math.round((stats.fleet.active_drivers / stats.fleet.total_drivers) * 100)
    : 0;

  const violationResolutionRate = stats.violations.total_violations > 0
    ? Math.round((stats.violations.confirmed_violations / stats.violations.total_violations) * 100)
    : 0;

  const incidentResolutionRate = stats.incidents.total_incidents > 0
    ? Math.round((stats.incidents.resolved_incidents / stats.incidents.total_incidents) * 100)
    : 0;

  const cards = [
    {
      title: 'Véhicules',
      icon: 'Truck',
      primaryValue: stats.fleet.total_vehicles,
      primaryLabel: 'Total',
      secondaryValue: stats.fleet.active_vehicles,
      secondaryLabel: 'Actifs',
      percentage: vehicleUtilizationRate,
      percentageLabel: 'Taux d\'utilisation',
      color: 'primary',
      details: [
        { label: 'En maintenance', value: stats.fleet.maintenance_vehicles, color: 'warning' },
        { label: 'Hors service', value: stats.fleet.inactive_vehicles, color: 'error' }
      ]
    },
    {
      title: 'Conducteurs',
      icon: 'Users',
      primaryValue: stats.fleet.total_drivers,
      primaryLabel: 'Total',
      secondaryValue: stats.fleet.active_drivers,
      secondaryLabel: 'Actifs',
      percentage: driverUtilizationRate,
      percentageLabel: 'Taux d\'activité',
      color: 'success',
      details: [
        { label: 'Inactifs', value: stats.fleet.total_drivers - stats.fleet.active_drivers, color: 'text-secondary' }
      ]
    },
    {
      title: 'Violations',
      icon: 'AlertTriangle',
      primaryValue: stats.violations.total_violations,
      primaryLabel: 'Total (30j)',
      secondaryValue: stats.violations.high_severity_violations,
      secondaryLabel: 'Sévères',
      percentage: violationResolutionRate,
      percentageLabel: 'Taux de résolution',
      color: 'warning',
      details: [
        { label: 'En attente', value: stats.violations.pending_violations, color: 'warning' },
        { label: 'Confirmées', value: stats.violations.confirmed_violations, color: 'error' }
      ]
    },
    {
      title: 'Incidents',
      icon: 'AlertOctagon',
      primaryValue: stats.incidents.total_incidents,
      primaryLabel: 'Total (30j)',
      secondaryValue: stats.incidents.open_incidents,
      secondaryLabel: 'Ouverts',
      percentage: incidentResolutionRate,
      percentageLabel: 'Taux de résolution',
      color: 'error',
      details: [
        { label: 'Résolus', value: stats.incidents.resolved_incidents, color: 'success' },
        { label: 'Sévères', value: stats.incidents.high_severity_incidents, color: 'error' }
      ]
    },
    {
      title: 'Performance',
      icon: 'Activity',
      primaryValue: Math.round(stats.telemetry.avg_speed || 0),
      primaryLabel: 'Vitesse moy. (km/h)',
      secondaryValue: stats.telemetry.active_vehicles_today,
      secondaryLabel: 'Véhicules actifs aujourd\'hui',
      percentage: stats.telemetry.total_records > 0 ? 100 : 0,
      percentageLabel: 'Télémétrie active',
      color: 'info',
      details: [
        { label: 'Données télémétrie', value: stats.telemetry.total_records, color: 'info' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-surface-secondary rounded w-20"></div>
                <div className="h-8 w-8 bg-surface-secondary rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-surface-secondary rounded w-16"></div>
                <div className="h-4 bg-surface-secondary rounded w-12"></div>
                <div className="h-4 bg-surface-secondary rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="p-6 text-center">
          <Icon name="AlertTriangle" size={24} className="text-warning mx-auto mb-2" />
          <p className="text-text-secondary">Erreur lors du chargement des statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="card hover:shadow-lg transition-shadow">
          <div className="p-6">
            {/* Header avec titre et icône */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-secondary">{card.title}</h3>
              <div className={`p-2 rounded-lg bg-${card.color}/10`}>
                <Icon name={card.icon} size={20} className={`text-${card.color}`} />
              </div>
            </div>

            {/* Valeur principale */}
            <div className="mb-2">
              <p className="text-2xl font-bold text-text-primary">{card.primaryValue.toLocaleString()}</p>
              <p className="text-xs text-text-secondary">{card.primaryLabel}</p>
            </div>

            {/* Valeur secondaire et pourcentage */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-semibold text-text-primary">{card.secondaryValue}</p>
                <p className="text-xs text-text-secondary">{card.secondaryLabel}</p>
              </div>
              
              {card.percentage !== undefined && (
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    card.percentage >= 75 ? 'text-success' :
                    card.percentage >= 50 ? 'text-warning' :
                    'text-error'
                  }`}>
                    {card.percentage}%
                  </p>
                  <p className="text-xs text-text-secondary">{card.percentageLabel}</p>
                </div>
              )}
            </div>

            {/* Détails supplémentaires */}
            {card.details && card.details.length > 0 && (
              <div className="pt-3 border-t border-border space-y-1">
                {card.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">{detail.label}</span>
                    <span className={`text-xs font-medium ${
                      detail.color === 'success' ? 'text-success' :
                      detail.color === 'warning' ? 'text-warning' :
                      detail.color === 'error' ? 'text-error' :
                      detail.color === 'info' ? 'text-info' :
                      'text-text-secondary'
                    }`}>
                      {detail.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Barre de progression pour certaines métriques */}
            {card.percentage !== undefined && (
              <div className="mt-3">
                <div className="w-full bg-surface-secondary rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full bg-${card.color} transition-all duration-300`}
                    style={{ width: `${Math.min(card.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OwnerStatsCards;
