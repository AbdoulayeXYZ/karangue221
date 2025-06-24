import React from 'react';
import Icon from '../../../components/AppIcon';

const AdminStatsCards = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-surface-secondary rounded"></div>
                <div className="w-16 h-4 bg-surface-secondary rounded"></div>
              </div>
              <div className="w-24 h-8 bg-surface-secondary rounded mb-2"></div>
              <div className="w-20 h-4 bg-surface-secondary rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 p-6 bg-warning/10 border border-warning rounded-lg text-center">
        <Icon name="AlertTriangle" size={24} className="text-warning mx-auto mb-2" />
        <p className="text-text-secondary">Erreur lors du chargement des statistiques</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Utilisateurs Total',
      value: stats.users?.total_users || 0,
      subtitle: `${stats.users?.active_users || 0} actifs`,
      icon: 'Users',
      color: 'primary',
      trend: stats.users?.trends?.total_users || '0%'
    },
    {
      title: 'Propriétaires',
      value: stats.users?.owners || 0,
      subtitle: `${stats.fleets?.total_fleets || 0} flottes`,
      icon: 'Crown',
      color: 'secondary',
      trend: stats.users?.trends?.owners || '0%'
    },
    {
      title: 'Véhicules',
      value: stats.vehicles?.total_vehicles || 0,
      subtitle: `${stats.vehicles?.active_vehicles || 0} actifs`,
      icon: 'Car',
      color: 'success',
      trend: stats.vehicles?.trends?.total_vehicles || '0%'
    },
    {
      title: 'Conducteurs',
      value: stats.drivers?.total_drivers || 0,
      subtitle: `${Math.round(stats.drivers?.average_score || 0)}/100 score moy.`,
      icon: 'UserCheck',
      color: 'info',
      trend: stats.drivers?.trends?.total_drivers || '0%'
    },
    {
      title: 'Violations (30j)',
      value: stats.violations?.total_violations || 0,
      subtitle: `${stats.violations?.pending_violations || 0} en attente`,
      icon: 'AlertTriangle',
      color: 'warning',
      trend: stats.violations?.trends?.total_violations || '0%'
    },
    {
      title: 'Incidents (30j)',
      value: stats.incidents?.total_incidents || 0,
      subtitle: `${stats.incidents?.open_incidents || 0} ouverts`,
      icon: 'Shield',
      color: 'error',
      trend: stats.incidents?.trends?.total_incidents || '0%'
    },
    {
      title: 'Flottes Actives',
      value: stats.fleets?.total_fleets || 0,
      subtitle: `${stats.fleets?.unique_owners || 0} propriétaires`,
      icon: 'Building2',
      color: 'primary',
      trend: stats.fleets?.trends?.total_fleets || '0%'
    },
    {
      title: 'Maintenance',
      value: stats.vehicles?.maintenance_vehicles || 0,
      subtitle: 'véhicules',
      icon: 'Wrench',
      color: 'secondary',
      trend: stats.vehicles?.trends?.maintenance_vehicles || '0%'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'text-primary bg-primary/10',
      secondary: 'text-secondary bg-secondary/10',
      success: 'text-success bg-success/10',
      warning: 'text-warning bg-warning/10',
      error: 'text-error bg-error/10',
      info: 'text-info bg-info/10'
    };
    return colors[color] || colors.primary;
  };

  const getTrendColor = (trend) => {
    if (trend.startsWith('+')) return 'text-success';
    if (trend.startsWith('-')) return 'text-error';
    return 'text-text-secondary';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <Icon name={stat.icon} size={24} />
              </div>
              {stat.trend && (
                <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                  {stat.trend}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-text-primary">
                {stat.value.toLocaleString('fr-FR')}
              </h3>
              <p className="text-sm font-medium text-text-secondary">
                {stat.title}
              </p>
              <p className="text-xs text-text-secondary">
                {stat.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsCards;
