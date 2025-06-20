import React from 'react';
import Icon from 'components/AppIcon';

const IncidentPanel = ({ 
  incidents, 
  selectedIncident, 
  onIncidentSelect, 
  onIncidentJump 
}) => {
  const getIncidentIcon = (type) => {
    switch (type) {
      case 'harsh_braking': return 'AlertTriangle';
      case 'fatigue': return 'Eye';
      case 'speed_violation': return 'Gauge';
      case 'phone_usage': return 'Phone';
      case 'lane_departure': return 'Navigation';
      case 'collision_warning': return 'AlertOctagon';
      default: return 'AlertCircle';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'high': return 'bg-error-50';
      case 'medium': return 'bg-warning-50';
      case 'low': return 'bg-secondary-50';
      default: return 'bg-surface-secondary';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'high': return 'Critique';
      case 'medium': return 'Modéré';
      case 'low': return 'Mineur';
      default: return 'Inconnu';
    }
  };

  const getIncidentTypeLabel = (type) => {
    switch (type) {
      case 'harsh_braking': return 'Freinage Brusque';
      case 'fatigue': return 'Fatigue Détectée';
      case 'speed_violation': return 'Excès de Vitesse';
      case 'phone_usage': return 'Usage Téléphone';
      case 'lane_departure': return 'Sortie de Voie';
      case 'collision_warning': return 'Risque Collision';
      default: return 'Incident';
    }
  };

  const handleIncidentClick = (incident) => {
    onIncidentSelect(incident);
    // Jump to incident time in video
    const incidentTime = Math.floor((incident.timestamp.getTime() - Date.now()) / 1000) + 1800;
    onIncidentJump(Math.max(0, incidentTime));
  };

  const handleSnapshotCapture = (incident) => {
    console.log('Capturing snapshot for incident:', incident.id);
    alert(`Capture d'écran sauvegardée pour l'incident ${incident.id}`);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else {
      return timestamp.toLocaleDateString('fr-FR');
    }
  };

  return (
    <div className="space-y-4">
      {/* Incidents Overview */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="AlertTriangle" size={18} className="text-error" />
          <h3 className="font-heading font-semibold text-text-primary">
            Incidents & Alertes
          </h3>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-error-50 rounded-base">
            <div className="text-lg font-semibold text-error-700">
              {incidents.filter(i => i.severity === 'high').length}
            </div>
            <div className="text-xs text-error-600">Critiques</div>
          </div>
          <div className="text-center p-2 bg-warning-50 rounded-base">
            <div className="text-lg font-semibold text-warning-700">
              {incidents.filter(i => i.severity === 'medium').length}
            </div>
            <div className="text-xs text-warning-600">Modérés</div>
          </div>
          <div className="text-center p-2 bg-secondary-50 rounded-base">
            <div className="text-lg font-semibold text-secondary-700">
              {incidents.filter(i => i.severity === 'low').length}
            </div>
            <div className="text-xs text-secondary-600">Mineurs</div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className={`p-3 rounded-base border transition-all duration-150 cursor-pointer ${
                selectedIncident?.id === incident.id
                  ? 'border-secondary bg-secondary-50' :'border-border hover:border-secondary-200 hover:bg-surface-secondary'
              }`}
              onClick={() => handleIncidentClick(incident)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-full ${getSeverityBg(incident.severity)}`}>
                  <Icon 
                    name={getIncidentIcon(incident.type)} 
                    size={14} 
                    className={getSeverityColor(incident.severity)}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">
                      {getIncidentTypeLabel(incident.type)}
                    </span>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityBg(incident.severity)} ${getSeverityColor(incident.severity)}`}>
                      {getSeverityLabel(incident.severity)}
                    </div>
                  </div>
                  
                  <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                    {incident.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={10} />
                      <span className="truncate max-w-32">{incident.location}</span>
                    </div>
                    <span>{formatTimeAgo(incident.timestamp)}</span>
                  </div>
                  
                  {incident.gpsData && (
                    <div className="flex items-center space-x-3 mt-2 text-xs text-text-secondary">
                      <div className="flex items-center space-x-1">
                        <Icon name="Gauge" size={10} />
                        <span>{incident.gpsData.speed} km/h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Navigation" size={10} />
                        <span>{incident.gpsData.lat.toFixed(4)}, {incident.gpsData.lng.toFixed(4)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {incident.hasVideo && (
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-light">
                  <div className="flex items-center space-x-1 text-xs text-success">
                    <Icon name="Video" size={12} />
                    <span>Vidéo disponible</span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSnapshotCapture(incident);
                    }}
                    className="flex items-center space-x-1 px-2 py-1 bg-accent text-white rounded text-xs hover:bg-accent-600 transition-colors duration-150"
                  >
                    <Icon name="Camera" size={10} />
                    <span>Capture</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Incident Details */}
      {selectedIncident && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-text-primary">
              Détails de l'Incident
            </h4>
            <button
              onClick={() => onIncidentSelect(null)}
              className="text-text-secondary hover:text-text-primary transition-colors duration-150"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getSeverityBg(selectedIncident.severity)}`}>
                <Icon 
                  name={getIncidentIcon(selectedIncident.type)} 
                  size={16} 
                  className={getSeverityColor(selectedIncident.severity)}
                />
              </div>
              <div>
                <div className="font-medium text-text-primary">
                  {getIncidentTypeLabel(selectedIncident.type)}
                </div>
                <div className="text-sm text-text-secondary">
                  {selectedIncident.timestamp.toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
            
            <div className="bg-surface-secondary rounded-base p-3">
              <p className="text-sm text-text-primary mb-2">
                {selectedIncident.description}
              </p>
              <div className="text-xs text-text-secondary">
                <div className="flex items-center space-x-1 mb-1">
                  <Icon name="MapPin" size={10} />
                  <span>{selectedIncident.location}</span>
                </div>
                {selectedIncident.gpsData && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Icon name="Gauge" size={10} />
                      <span>Vitesse: {selectedIncident.gpsData.speed} km/h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Navigation" size={10} />
                      <span>GPS: {selectedIncident.gpsData.lat.toFixed(4)}, {selectedIncident.gpsData.lng.toFixed(4)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 btn-secondary text-sm py-2">
                <Icon name="FileText" size={14} className="mr-1" />
                Rapport
              </button>
              <button className="flex-1 btn-primary text-sm py-2">
                <Icon name="Play" size={14} className="mr-1" />
                Voir Vidéo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Tools */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Download" size={16} className="text-accent" />
          <h4 className="font-heading font-semibold text-text-primary">
            Outils d'Export
          </h4>
        </div>
        
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-2 p-2 text-left text-sm text-text-primary hover:bg-surface-secondary rounded-base transition-colors duration-150">
            <Icon name="FileVideo" size={14} />
            <span>Exporter Segment Vidéo</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 p-2 text-left text-sm text-text-primary hover:bg-surface-secondary rounded-base transition-colors duration-150">
            <Icon name="FileText" size={14} />
            <span>Rapport d'Incidents</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 p-2 text-left text-sm text-text-primary hover:bg-surface-secondary rounded-base transition-colors duration-150">
            <Icon name="Image" size={14} />
            <span>Captures d'Écran</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentPanel;