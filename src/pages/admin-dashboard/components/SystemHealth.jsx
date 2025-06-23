import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemHealth = ({ health, logs, loading, errors }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return { bg: 'bg-success/5', border: 'border-success/20', text: 'text-success', dot: 'bg-success' };
      case 'warning':
      case 'degraded':
        return { bg: 'bg-warning/5', border: 'border-warning/20', text: 'text-warning', dot: 'bg-warning' };
      case 'critical':
      case 'down':
        return { bg: 'bg-error/5', border: 'border-error/20', text: 'text-error', dot: 'bg-error' };
      default:
        return { bg: 'bg-surface-secondary', border: 'border-border', text: 'text-text-secondary', dot: 'bg-text-secondary' };
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'healthy': return 'Système Opérationnel';
      case 'warning': return 'Attention Requise';
      case 'critical': return 'Problème Critique';
      default: return 'État Inconnu';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* État de santé du système */}
      <div className="card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
            <Icon name="Heart" size={20} />
            <span>Santé du Système</span>
          </h3>
        </div>
        
        <div className="p-6">
          {loading.health ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
              <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
              <div className="h-4 bg-surface-secondary rounded w-1/3"></div>
            </div>
          ) : errors.health ? (
            <div className="text-center py-8">
              <Icon name="AlertTriangle" size={24} className="text-warning mx-auto mb-2" />
              <p className="text-text-secondary">Erreur lors de la vérification de l'état</p>
            </div>
          ) : health ? (
            <div className="space-y-4">
              {/* Statut principal */}
              {(() => {
                const statusColors = getStatusColor(health.status);
                return (
                  <div className={`flex items-center justify-between p-4 ${statusColors.bg} border ${statusColors.border} rounded-lg`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${statusColors.dot} rounded-full animate-pulse`}></div>
                      <span className="font-medium text-text-primary">{getStatusText(health.status)}</span>
                    </div>
                    <span className={`text-sm ${statusColors.text} font-medium`}>
                      {health.status}
                    </span>
                  </div>
                );
              })()} 

              {/* Métriques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-text-primary">Système</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Temps de fonctionnement</span>
                      <span className="text-text-primary">
                        {health.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Version Node.js</span>
                      <span className="text-text-primary">{health.version || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Dernière vérification</span>
                      <span className="text-text-primary">
                        {health.timestamp ? new Date(health.timestamp).toLocaleTimeString('fr-FR') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-text-primary">Mémoire</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Utilisée</span>
                      <span className="text-text-primary">
                        {health.memory ? `${(health.memory.heapUsed / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total</span>
                      <span className="text-text-primary">
                        {health.memory ? `${(health.memory.heapTotal / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                      </span>
                    </div>
                    {health.memory && (
                      <div className="w-full bg-surface-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((health.memory.heapUsed / health.memory.heapTotal) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Info" size={24} className="text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">Aucune donnée de santé disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Services et composants */}
      <div className="card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
            <Icon name="Layers" size={20} />
            <span>État des Services</span>
          </h3>
        </div>
        
        <div className="p-6">
          {health?.services ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(health.services).map((service, index) => {
                const statusColors = getStatusColor(service.status);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:shadow-md transition-shadow">
                    <div className={`p-2 rounded-lg ${statusColors.bg} ${statusColors.text}`}>
                      <Icon name={service.icon} size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{service.name}</div>
                      <div className={`text-sm ${statusColors.text} capitalize`}>
                        {service.status === 'operational' ? 'Opérationnel' : 
                         service.status === 'degraded' ? 'Dégradé' :
                         service.status === 'down' ? 'Hors ligne' :
                         service.status === 'warning' ? 'Attention' : service.status}
                      </div>
                      {service.response_time_ms && (
                        <div className="text-xs text-text-secondary">
                          {service.response_time_ms}ms
                        </div>
                      )}
                      {service.recent_records !== undefined && (
                        <div className="text-xs text-text-secondary">
                          {service.recent_records} enregistrements/h
                        </div>
                      )}
                      {service.active_users !== undefined && (
                        <div className="text-xs text-text-secondary">
                          {service.active_users} utilisateurs actifs
                        </div>
                      )}
                    </div>
                    <div className={`w-2 h-2 ${statusColors.dot} rounded-full`}></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Layers" size={24} className="text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">Données des services non disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Alertes et problèmes */}
      <div className="card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
            <Icon name="AlertTriangle" size={20} />
            <span>Alertes et Problèmes</span>
            {health?.alerts && health.alerts.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                {health.alerts.length}
              </span>
            )}
          </h3>
        </div>
        
        <div className="p-6">
          {health?.alerts && health.alerts.length > 0 ? (
            <div className="space-y-3">
              {health.alerts.map((alert, index) => {
                const alertColors = getStatusColor(alert.level);
                return (
                  <div key={index} className={`p-4 rounded-lg border ${alertColors.border} ${alertColors.bg}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${alertColors.dot} flex-shrink-0 mt-1`}>
                        <div className="w-2 h-2"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium ${alertColors.text} text-sm uppercase tracking-wide`}>
                            {alert.level === 'critical' ? 'Critique' :
                             alert.level === 'warning' ? 'Attention' :
                             alert.level === 'info' ? 'Information' : alert.level}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {alert.service}
                          </span>
                        </div>
                        <p className="text-text-primary text-sm mb-2">{alert.message}</p>
                        <div className="text-xs text-text-secondary">
                          {new Date(alert.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="CheckCircle" size={24} className="text-success mx-auto mb-2" />
              <p className="text-text-primary font-medium">Aucun problème détecté</p>
              <p className="text-text-secondary text-sm">Tous les systèmes fonctionnent normalement</p>
            </div>
          )}
        </div>
      </div>

      {/* Métriques supplémentaires */}
      {health?.metrics && (
        <div className="card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
              <Icon name="BarChart3" size={20} />
              <span>Métriques Système</span>
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {health.metrics.database_response_time}ms
                </div>
                <div className="text-xs text-text-secondary">Réponse DB</div>
              </div>
              
              <div className="text-center p-4 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {health.metrics.recent_telemetry_count}
                </div>
                <div className="text-xs text-text-secondary">Télémétrie/h</div>
              </div>
              
              <div className="text-center p-4 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {health.metrics.recent_violations_count}
                </div>
                <div className="text-xs text-text-secondary">Violations/24h</div>
              </div>
              
              <div className="text-center p-4 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {health.metrics.error_count_last_hour}
                </div>
                <div className="text-xs text-text-secondary">Erreurs/h</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
