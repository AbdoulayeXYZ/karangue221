import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemOverview = ({ dashboard, health, loading }) => {
  const getHealthStatus = () => {
    // Utiliser les nouvelles données de santé système d'abord
    if (health?.status) {
      return health.status; // 'healthy', 'warning', 'critical'
    }
    // Fallback vers les anciennes données
    if (!health?.data) return 'unknown';
    return health.data.status;
  };

  const getHealthColor = (status) => {
    const colors = {
      healthy: 'text-success bg-success/10',
      warning: 'text-warning bg-warning/10',
      critical: 'text-error bg-error/10',
      error: 'text-error bg-error/10',
      unknown: 'text-text-secondary bg-surface-secondary'
    };
    return colors[status] || colors.unknown;
  };
  
  const getHealthText = (status) => {
    switch (status) {
      case 'healthy': return 'Opérationnel';
      case 'warning': return 'Attention';
      case 'critical': return 'Critique';
      case 'error': return 'Erreur';
      default: return 'Inconnu';
    }
  };

  const formatUptime = (uptime) => {
    if (!uptime) return 'Inconnu';
    
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}j ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes) => {
    if (!bytes) return 'Inconnu';
    
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="card">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
          <Icon name="Monitor" size={20} />
          <span>État du Système</span>
        </h3>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
            <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
            <div className="h-4 bg-surface-secondary rounded w-2/3"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* État de santé général */}
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">État général</span>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(healthStatus)}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${healthStatus === 'healthy' ? 'bg-success animate-pulse' : healthStatus === 'warning' ? 'bg-warning' : 'bg-error'}`}></span>
                  {healthStatus === 'healthy' ? 'Opérationnel' : 
                   healthStatus === 'warning' ? 'Attention' : 
                   healthStatus === 'error' ? 'Erreur' : 'Inconnu'}
                </span>
              </div>
            </div>

            {/* Temps de fonctionnement */}
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Temps de fonctionnement</span>
              <span className="text-text-primary font-medium">
                {formatUptime(health?.uptime || health?.data?.uptime)}
              </span>
            </div>

            {/* Version */}
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Version Node.js</span>
              <span className="text-text-primary font-medium">
                {health?.version || health?.data?.version || 'Inconnue'}
              </span>
            </div>

            {/* Mémoire utilisée */}
            {(health?.memory || health?.data?.memory) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Mémoire utilisée</span>
                  <span className="text-text-primary font-medium">
                    {formatMemory((health?.memory || health?.data?.memory).heapUsed)}
                  </span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(((health?.memory || health?.data?.memory).heapUsed / (health?.memory || health?.data?.memory).heapTotal) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>{formatMemory((health?.memory || health?.data?.memory).heapUsed)}</span>
                  <span>{formatMemory((health?.memory || health?.data?.memory).heapTotal)}</span>
                </div>
              </div>
            )}
            
            {/* Dernière vérification */}
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Dernière vérification</span>
              <span className="text-text-primary font-medium">
                {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString('fr-FR') : 
                 health?.data?.timestamp ? new Date(health.data.timestamp).toLocaleTimeString('fr-FR') : 'Inconnue'}
              </span>
            </div>
            
            {/* Alertes actives si présentes */}
            {health?.alerts && health.alerts.length > 0 && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Alertes actives</span>
                  <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                    {health.alerts.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {health.alerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="text-xs text-text-secondary">
                      • {alert.message}
                    </div>
                  ))}
                  {health.alerts.length > 3 && (
                    <div className="text-xs text-text-secondary">
                      ... et {health.alerts.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informations de l'admin */}
            {dashboard?.admin_info && (
              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-medium text-text-primary mb-3">
                  Informations Administrateur
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="User" size={14} className="text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                      {dashboard.admin_info.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Mail" size={14} className="text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                      {dashboard.admin_info.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={14} className="text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                      Dernière connexion: {new Date(dashboard.admin_info.last_login).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-medium text-text-primary mb-3">
                Actions Système
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center space-x-2 py-2 px-3 bg-surface-secondary hover:bg-surface-secondary/80 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
                  <Icon name="Download" size={16} />
                  <span>Sauvegarde</span>
                </button>
                <button className="flex items-center justify-center space-x-2 py-2 px-3 bg-surface-secondary hover:bg-surface-secondary/80 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
                  <Icon name="Settings" size={16} />
                  <span>Maintenance</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemOverview;
