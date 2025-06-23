import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceMetrics = ({ performance, loading, error }) => {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="p-6 border-b border-border">
          <div className="h-6 bg-surface-secondary rounded w-1/3"></div>
        </div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
          <div className="h-32 bg-surface-secondary rounded"></div>
          <div className="h-4 bg-surface-secondary rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="p-6 text-center">
          <Icon name="AlertTriangle" size={24} className="text-warning mx-auto mb-2" />
          <p className="text-text-secondary">Erreur lors du chargement des métriques</p>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="card">
        <div className="p-6 text-center">
          <Icon name="BarChart3" size={24} className="text-text-secondary mx-auto mb-2" />
          <p className="text-text-secondary">Aucune donnée de performance disponible</p>
        </div>
      </div>
    );
  }

  const { database, system, violations_per_hour, performance: perfMetrics } = performance;

  return (
    <div className="space-y-6">
      {/* Métriques de base de données */}
      <div className="card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
            <Icon name="Database" size={20} />
            <span>Performance Base de Données</span>
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">
                {database?.size_mb ? `${database.size_mb} MB` : 'N/A'}
              </div>
              <div className="text-sm text-text-secondary">Taille DB</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">
                {database?.avg_driver_score ? Math.round(database.avg_driver_score) : 'N/A'}
              </div>
              <div className="text-sm text-text-secondary">Score Moyen Conducteurs</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">
                {database?.total_telemetry_records_today || 0}
              </div>
              <div className="text-sm text-text-secondary">Enregistrements Télémétrie Aujourd'hui</div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des violations par heure */}
      <div className="card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
            <Icon name="TrendingUp" size={20} />
            <span>Violations par Heure (24h)</span>
          </h3>
        </div>
        
        <div className="p-6">
          {violations_per_hour && violations_per_hour.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end space-x-2 h-32">
                {Array.from({ length: 24 }, (_, i) => {
                  const hourData = violations_per_hour.find(v => v.hour === i);
                  const count = hourData ? hourData.violation_count : 0;
                  const maxCount = Math.max(...violations_per_hour.map(v => v.violation_count), 1);
                  const height = (count / maxCount) * 100;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                        style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '2px' }}
                        title={`${i}h: ${count} violations`}
                      ></div>
                      <div className="text-xs text-text-secondary mt-1">{i}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-center text-sm text-text-secondary">
                Total: {violations_per_hour.reduce((sum, v) => sum + v.violation_count, 0)} violations
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="BarChart3" size={24} className="text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">Aucune donnée de violation disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Indicateurs de performance système */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="p-6 text-center">
            <div className="p-3 rounded-lg bg-success/10 text-success mx-auto w-fit mb-4">
              <Icon name="Zap" size={24} />
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {system?.availability_percentage ? `${system.availability_percentage}%` : '99.9%'}
            </div>
            <div className="text-sm text-text-secondary">Disponibilité</div>
          </div>
        </div>
        
        <div className="card">
          <div className="p-6 text-center">
            <div className="p-3 rounded-lg bg-primary/10 text-primary mx-auto w-fit mb-4">
              <Icon name="Clock" size={24} />
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {database?.response_time_ms ? `${database.response_time_ms}ms` : 'N/A'}
            </div>
            <div className="text-sm text-text-secondary">Temps de Réponse DB</div>
          </div>
        </div>
        
        <div className="card">
          <div className="p-6 text-center">
            <div className="p-3 rounded-lg bg-info/10 text-info mx-auto w-fit mb-4">
              <Icon name="Car" size={24} />
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {database?.active_vehicles_with_telemetry || 0}
            </div>
            <div className="text-sm text-text-secondary">Véhicules Connectés</div>
          </div>
        </div>
        
        <div className="card">
          <div className="p-6 text-center">
            <div className="p-3 rounded-lg bg-warning/10 text-warning mx-auto w-fit mb-4">
              <Icon name="AlertTriangle" size={24} />
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {system?.total_errors_24h || 0}
            </div>
            <div className="text-sm text-text-secondary">Erreurs (24h)</div>
          </div>
        </div>
      </div>
      
      {/* Métriques système avancées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Métriques mémoire et système */}
        <div className="card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
              <Icon name="HardDrive" size={20} />
              <span>Ressources Système</span>
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Mémoire */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">Mémoire utilisée</span>
                <span className="text-sm font-medium text-text-primary">
                  {system?.memory_usage_mb || 0} MB / {system?.memory_total_mb || 0} MB
                </span>
              </div>
              <div className="w-full bg-surface-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${system?.memory_percentage || 0}%`
                  }}
                ></div>
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {system?.memory_percentage || 0}% utilisé
              </div>
            </div>
            
            {/* Temps de fonctionnement */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Temps de fonctionnement</span>
              <span className="text-sm font-medium text-text-primary">
                {system?.uptime_hours ? `${system.uptime_hours}h` : 'N/A'}
              </span>
            </div>
            
            {/* Version Node.js */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Version Node.js</span>
              <span className="text-sm font-medium text-text-primary">
                {system?.node_version || 'N/A'}
              </span>
            </div>
            
            {/* Connexions actives */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Connexions DB actives</span>
              <span className="text-sm font-medium text-text-primary">
                {database?.active_connections || 0}
              </span>
            </div>
          </div>
        </div>
        
        {/* Métriques de performance */}
        <div className="card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
              <Icon name="Activity" size={20} />
              <span>Performance Temps Réel</span>
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {perfMetrics?.avg_response_time_ms || database?.response_time_ms || 0}ms
                </div>
                <div className="text-xs text-text-secondary">Temps Réponse Moyen</div>
              </div>
              
              <div className="text-center p-4 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {perfMetrics?.requests_per_hour || 0}
                </div>
                <div className="text-xs text-text-secondary">Requêtes/Heure</div>
              </div>
              
              <div className="text-center p-4 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {database?.records_last_hour || 0}
                </div>
                <div className="text-xs text-text-secondary">Télémétrie/Heure</div>
              </div>
              
              <div className="text-center p-4 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {perfMetrics?.error_rate || 0}
                </div>
                <div className="text-xs text-text-secondary">Taux d'Erreur</div>
              </div>
            </div>
            
            {/* Indicateur de santé globale */}
            <div className="mt-4 p-3 bg-success/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-success">Système Opérationnel</span>
                </div>
                <span className="text-xs text-text-secondary">
                  Dernière màj: {performance?.last_updated ? new Date(performance.last_updated).toLocaleTimeString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
