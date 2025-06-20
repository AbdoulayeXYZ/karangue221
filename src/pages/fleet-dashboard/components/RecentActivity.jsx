import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const RecentActivity = ({ activities = [], loading, timeRange, vehicleStatus, selectedDriver }) => {
  const [filter, setFilter] = useState('all');

  // Filtrage dynamique selon les props
  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.severity !== filter) return false;
    if (selectedDriver !== 'all' && activity.driver !== selectedDriver) return false;
    // Optionnel : filtrer par période/timeRange si les timestamps sont exploitables
    return true;
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'speed_violation': return 'Gauge';
      case 'harsh_braking': return 'AlertTriangle';
      case 'driver_change': return 'UserCheck';
      case 'adas_alert': return 'Shield';
      case 'dms_alert': return 'Eye';
      case 'geofence_exit': return 'MapPin';
      case 'maintenance_alert': return 'Wrench';
      case 'fuel_low': return 'Fuel';
      default: return 'Activity';
    }
  };

  const getActivityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      case 'info': return 'text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const getActivityBgColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-error-50';
      case 'medium': return 'bg-warning-50';
      case 'low': return 'bg-success-50';
      case 'info': return 'bg-secondary-50';
      default: return 'bg-surface-secondary';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'high': return 'Critique';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      case 'info': return 'Info';
      default: return 'Inconnu';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'speed_violation': return 'Excès de vitesse';
      case 'harsh_braking': return 'Freinage brusque';
      case 'driver_change': return 'Changement conducteur';
      case 'adas_alert': return 'Alerte ADAS';
      case 'dms_alert': return 'Alerte DMS';
      case 'geofence_exit': return 'Sortie de zone';
      case 'maintenance_alert': return 'Maintenance';
      case 'fuel_low': return 'Carburant faible';
      default: return 'Activité';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-4">
      {/* Activity Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-base transition-all duration-150 ${
              filter === 'all' ?'bg-secondary text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1.5 text-sm rounded-base transition-all duration-150 ${
              filter === 'high' ?'bg-error text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            }`}
          >
            Critiques
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-3 py-1.5 text-sm rounded-base transition-all duration-150 ${
              filter === 'medium' ?'bg-warning text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            }`}
          >
            Moyennes
          </button>
        </div>
        {loading && (
          <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      {/* Activity Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Activity" size={48} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">Aucune activité récente</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 rounded-base border-l-4 transition-all duration-150 hover:shadow-elevation-1 ${getActivityBgColor(activity.severity)}`}
              style={{ borderLeftColor: getActivityColor(activity.severity).replace('text-', 'var(--color-') + ')' }}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full bg-surface flex items-center justify-center ${getActivityColor(activity.severity)}`}>
                  <Icon name={getActivityIcon(activity.type)} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-text-primary">
                        {activity.vehicle}
                      </span>
                      <span className={`status-indicator ${
                        activity.severity === 'high' ? 'status-error' : 
                        activity.severity === 'medium'? 'status-warning' : 'status-success'
                      }`}>
                        {getSeverityLabel(activity.severity)}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary font-data">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary mb-2">
                    {activity.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Icon name="User" size={12} />
                        <span>{activity.driver}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Icon name="MapPin" size={12} />
                        <span>{activity.location}</span>
                      </span>
                    </div>
                    <span className="text-text-tertiary">
                      {getTypeLabel(activity.type)}
                    </span>
                  </div>
                  {/* Activity Details */}
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border-light">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-text-secondary capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </span>
                            <span className="text-text-primary font-data">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Activity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        {[
          { label: 'Total', count: filteredActivities.length, color: 'text-text-primary' },
          { label: 'Critiques', count: filteredActivities.filter(a => a.severity === 'high').length, color: 'text-error' },
          { label: 'Moyennes', count: filteredActivities.filter(a => a.severity === 'medium').length, color: 'text-warning' },
          { label: 'Faibles', count: filteredActivities.filter(a => a.severity === 'low').length, color: 'text-success' }
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className={`text-2xl font-bold font-data ${stat.color}`}>
              {stat.count}
            </p>
            <p className="text-xs text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;