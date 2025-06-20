import React from 'react';
import Icon from 'components/AppIcon';

const TimelinePanel = ({ 
  currentTime, 
  duration, 
  events, 
  incidents, 
  onTimelineSeek, 
  onIncidentSelect 
}) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'alert': return 'AlertCircle';
      case 'warning': return 'AlertTriangle';
      case 'incident': return 'AlertOctagon';
      case 'info': return 'Info';
      default: return 'Circle';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'alert': return 'text-secondary';
      case 'warning': return 'text-warning';
      case 'incident': return 'text-error';
      case 'info': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'harsh_braking': return 'AlertTriangle';
      case 'fatigue': return 'Eye';
      case 'speed_violation': return 'Gauge';
      case 'phone_usage': return 'Phone';
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

  const handleEventClick = (time) => {
    onTimelineSeek(time);
  };

  const handleIncidentClick = (incident) => {
    onIncidentSelect(incident);
    // Convert timestamp to timeline position
    const incidentTime = Math.floor((incident.timestamp.getTime() - Date.now() + currentTime * 1000) / 1000);
    onTimelineSeek(Math.max(0, incidentTime));
  };

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Timeline" size={18} className="text-primary" />
        <h3 className="font-heading font-semibold text-text-primary">
          Chronologie GPS & Événements
        </h3>
      </div>

      {/* Timeline Visualization */}
      <div className="mb-6">
        <div className="relative h-16 bg-surface-secondary rounded-base p-2">
          {/* Progress Bar */}
          <div className="absolute top-2 left-2 right-2 h-2 bg-border rounded-full">
            <div 
              className="h-full bg-secondary rounded-full transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>

          {/* Current Time Indicator */}
          <div 
            className="absolute top-1 w-4 h-4 bg-secondary rounded-full border-2 border-white shadow-md transform -translate-x-2"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          ></div>

          {/* Event Markers */}
          {events.map((event, index) => (
            <button
              key={index}
              onClick={() => handleEventClick(event.time)}
              className="absolute top-6 transform -translate-x-1 hover:scale-110 transition-transform duration-150"
              style={{ left: `${(event.time / duration) * 100}%` }}
              title={`${formatTime(event.time)} - ${event.description}`}
            >
              <Icon 
                name={getEventIcon(event.type)} 
                size={12} 
                className={`${getEventColor(event.type)} drop-shadow-sm`}
              />
            </button>
          ))}

          {/* Incident Markers */}
          {incidents.map((incident, index) => {
            const incidentTime = Math.floor((incident.timestamp.getTime() - Date.now() + currentTime * 1000) / 1000);
            if (incidentTime >= 0 && incidentTime <= duration) {
              return (
                <button
                  key={incident.id}
                  onClick={() => handleIncidentClick(incident)}
                  className="absolute top-6 transform -translate-x-1 hover:scale-110 transition-transform duration-150"
                  style={{ left: `${(incidentTime / duration) * 100}%` }}
                  title={`${formatTime(incidentTime)} - ${incident.description}`}
                >
                  <div className="relative">
                    <Icon 
                      name={getIncidentIcon(incident.type)} 
                      size={14} 
                      className={`${getSeverityColor(incident.severity)} drop-shadow-sm`}
                    />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full animate-pulse"></div>
                  </div>
                </button>
              );
            }
            return null;
          })}
        </div>

        {/* Time Labels */}
        <div className="flex justify-between mt-2 text-xs text-text-secondary font-data">
          <span>00:00:00</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Current Position Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-secondary rounded-base p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Clock" size={14} className="text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Temps Actuel</span>
          </div>
          <div className="text-lg font-data font-semibold text-secondary">
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="bg-surface-secondary rounded-base p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="MapPin" size={14} className="text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Position GPS</span>
          </div>
          <div className="text-sm font-data text-text-primary">
            14.6937°N, 17.4441°W
          </div>
        </div>

        <div className="bg-surface-secondary rounded-base p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Gauge" size={14} className="text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Vitesse</span>
          </div>
          <div className="text-lg font-data font-semibold text-text-primary">
            {events.find(e => e.time <= currentTime)?.speed || 0} km/h
          </div>
        </div>
      </div>

      {/* Recent Events List */}
      <div>
        <h4 className="font-medium text-text-primary mb-3">Événements Récents</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {events
            .filter(event => Math.abs(event.time - currentTime) <= 300)
            .sort((a, b) => Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime))
            .slice(0, 5)
            .map((event, index) => (
              <button
                key={index}
                onClick={() => handleEventClick(event.time)}
                className="w-full flex items-center space-x-3 p-2 rounded-base hover:bg-surface-secondary transition-colors duration-150 text-left"
              >
                <Icon 
                  name={getEventIcon(event.type)} 
                  size={14} 
                  className={getEventColor(event.type)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-primary truncate">
                      {event.description}
                    </span>
                    <span className="text-xs text-text-secondary font-data ml-2">
                      {formatTime(event.time)}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Vitesse: {event.speed} km/h
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TimelinePanel;