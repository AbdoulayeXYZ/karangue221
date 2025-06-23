import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemActivity = ({ activities, loading, error }) => {
  const getActivityIcon = (type) => {
    const icons = {
      user: 'User',
      fleet: 'Building2',
      vehicle: 'Car',
      driver: 'UserCheck',
      violation: 'AlertTriangle',
      incident: 'Shield'
    };
    return icons[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      user: 'text-primary bg-primary/10',
      fleet: 'text-secondary bg-secondary/10',
      vehicle: 'text-success bg-success/10',
      driver: 'text-info bg-info/10',
      violation: 'text-warning bg-warning/10',
      incident: 'text-error bg-error/10'
    };
    return colors[type] || 'text-text-secondary bg-surface-secondary';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Moins d'une minute
    if (diff < 60000) {
      return 'À l\'instant';
    }
    
    // Moins d'une heure
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `il y a ${minutes} min`;
    }
    
    // Moins d'un jour
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `il y a ${hours}h`;
    }
    
    // Plus d'un jour
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
          <Icon name="Activity" size={20} />
          <span>Activité Récente</span>
        </h3>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-surface-secondary rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
                  <div className="h-3 bg-surface-secondary rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Icon name="AlertTriangle" size={24} className="text-warning mx-auto mb-2" />
            <p className="text-text-secondary">Erreur lors du chargement de l'activité</p>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Activity" size={24} className="text-text-secondary mx-auto mb-2" />
            <p className="text-text-secondary">Aucune activité récente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 group hover:bg-surface-secondary p-2 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  <Icon name={getActivityIcon(activity.type)} size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary group-hover:text-text-primary">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-text-secondary">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                    {activity.entity_id && (
                      <>
                        <span className="text-xs text-text-secondary">•</span>
                        <span className="text-xs text-text-secondary">
                          ID: {activity.entity_id}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activities && activities.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              Voir toute l'activité
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemActivity;
