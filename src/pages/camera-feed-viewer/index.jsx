import React, { useState, useRef, useEffect } from 'react';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import VehicleSelector from './components/VehicleSelector';
import CameraControls from './components/CameraControls';
import TimelinePanel from './components/TimelinePanel';
import IncidentPanel from './components/IncidentPanel';
import useApiResource from 'hooks/useApiResource';
import * as incidentApi from 'services/api/incidents';
import * as vehicleApi from 'services/api/vehicles';
import * as telemetryApi from 'services/api/telemetry';

const API_URL = 'http://localhost:5001/api';

const CameraFeedViewer = () => {
  const [selectedVehicle, setSelectedVehicle] = useState('SN-001');
  const [selectedCamera, setSelectedCamera] = useState('driver');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(3600);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const {
    data: incidents,
    loading: isLoadingIncidents,
    error: incidentsError,
    fetchAll: fetchIncidents,
    create: createIncident,
    update: updateIncident,
    remove: removeIncident
  } = useApiResource({
    getAll: incidentApi.getIncidents,
    create: incidentApi.createIncident,
    update: incidentApi.updateIncident,
    remove: incidentApi.removeIncident
  });

  const {
    data: vehicles = [],
    loading: isLoadingVehicles,
    error: vehiclesError,
    fetchAll: fetchVehicles
  } = useApiResource({
    getAll: vehicleApi.getVehicles
  });

  const {
    data: telemetry = [],
    loading: isLoadingTelemetry,
    error: telemetryError,
    fetchAll: fetchTelemetry
  } = useApiResource({
    getAll: telemetryApi.getTelemetry
  });

  useEffect(() => {
    fetchIncidents();
    fetchVehicles();
    fetchTelemetry();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && isLiveMode) {
        setCurrentTime(prev => Math.min(prev + playbackSpeed, duration));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, duration, isLiveMode]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimelineSeek = (time) => {
    setCurrentTime(time);
    setIsPlaying(false);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePictureInPicture = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPictureInPicture(false);
        } else {
          await videoRef.current.requestPictureInPicture();
          setIsPictureInPicture(true);
        }
      } catch (error) {
        console.error('Picture-in-Picture error:', error);
      }
    }
  };

  const handleExportVideo = () => {
    const exportData = {
      vehicleId: selectedVehicle,
      camera: selectedCamera,
      startTime: currentTime - 300,
      endTime: currentTime + 300,
      incidents: incidents.filter(inc => inc.vehicleId === selectedVehicle),
      gpsData: timelineEvents
    };
    
    console.log('Exporting video segment:', exportData);
    // Mock export functionality
    alert('Segment vidéo exporté avec métadonnées GPS');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
  let videoUrl = '';
  if (selectedVehicleData) {
    if (selectedCamera === 'driver') {
      videoUrl = selectedVehicleData.cameras?.driver?.videoUrl || '';
    } else if (selectedCamera === 'road') {
      videoUrl = selectedVehicleData.cameras?.road?.videoUrl || '';
    } else if (selectedCamera === 'dual') {
      // Pour la vue duale, on peut afficher deux vidéos côte à côte
      // (voir plus bas pour l'intégration)
    }
  }
  const vehicleIncidents = incidents.filter(inc => inc.vehicleId === selectedVehicle);

  // Timeline events dynamiques à partir de la télémétrie filtrée sur le véhicule sélectionné
  const timelineEvents = telemetry
    .filter(t => t.vehicle_id === selectedVehicle)
    .map(t => ({
      time: Math.floor((new Date(t.timestamp).getTime() - new Date(telemetry[0]?.timestamp).getTime()) / 1000),
      speed: t.speed,
      type: 'info',
      description: `Vitesse: ${t.speed} km/h`,
      lat: t.latitude,
      lng: t.longitude
    }));

  // Trouver le point de télémétrie le plus proche du temps courant
  const currentTelemetry = timelineEvents.reduce((prev, curr) => {
    return Math.abs(curr.time - currentTime) < Math.abs((prev?.time ?? 0) - currentTime) ? curr : prev;
  }, timelineEvents[0]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto px-4 lg:px-6 py-6">
        <Breadcrumb />
        
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-heading font-semibold text-text-primary mb-2">
                Visualiseur de Flux Caméras
              </h1>
              <p className="text-text-secondary">
                Surveillance et analyse des flux vidéo des véhicules avec corrélation GPS
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-success-50 rounded-base">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-success-700">
                  {isLiveMode ? 'Flux Direct' : 'Lecture Différée'}
                </span>
              </div>
              
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Icon name={isLiveMode ? 'Play' : 'Radio'} size={16} />
                <span>{isLiveMode ? 'Mode Lecture' : 'Mode Direct'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Vehicle Selector */}
          <div className="lg:col-span-2">
            <VehicleSelector
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
            />
          </div>

          {/* Main Content - Video Players */}
          <div className="lg:col-span-7">
            <div className="card p-6" ref={containerRef}>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-heading font-semibold text-text-primary">
                    Véhicule {selectedVehicleData?.plateNumber}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Icon name="User" size={14} className="text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                      {selectedVehicleData?.driver}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="driver">Caméra Conducteur</option>
                    <option value="road">Caméra Route</option>
                    <option value="dual">Vue Duale</option>
                  </select>
                </div>
              </div>

              {/* Video Display */}
              <div className="relative bg-gray-900 rounded-base overflow-hidden mb-4">
                {selectedCamera === 'dual' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 h-64 md:h-80">
                    <div className="relative border-r border-gray-700">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        src={selectedVehicleData?.cameras?.driver?.videoUrl || ''}
                        poster="https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800"
                        controls
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-75 rounded text-white text-xs">
                        Caméra Conducteur
                      </div>
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">REC</span>
                      </div>
                    </div>
                    <div className="relative">
                      <video
                        className="w-full h-full object-cover"
                        src={selectedVehicleData?.cameras?.road?.videoUrl || ''}
                        poster="https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800"
                        controls
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-75 rounded text-white text-xs">
                        Caméra Route
                      </div>
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">REC</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-64 md:h-80">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src={videoUrl}
                      poster="https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800"
                      controls
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-75 rounded text-white text-xs">
                      {selectedCamera === 'driver' ? 'Caméra Conducteur' : 'Caméra Route'}
                    </div>
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-xs">REC</span>
                    </div>
                  </div>
                )}

                {/* Video Overlay Info */}
                <div className="absolute bottom-2 left-2 px-3 py-1.5 bg-black bg-opacity-75 rounded text-white text-sm">
                  <div className="flex items-center space-x-4">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-gray-300">•</span>
                    <span>{selectedVehicleData?.location}</span>
                    <span className="text-gray-300">•</span>
                    <span>Latence: 120ms</span>
                  </div>
                </div>
              </div>

              {/* Video Controls */}
              <CameraControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                playbackSpeed={playbackSpeed}
                isFullscreen={isFullscreen}
                isPictureInPicture={isPictureInPicture}
                onPlayPause={handlePlayPause}
                onTimelineSeek={handleTimelineSeek}
                onSpeedChange={handleSpeedChange}
                onFullscreen={toggleFullscreen}
                onPictureInPicture={togglePictureInPicture}
                onExport={handleExportVideo}
              />

              <div className="bg-surface-secondary rounded-base p-3 mt-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="MapPin" size={14} className="text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">Position GPS</span>
                </div>
                <div className="text-sm font-data text-text-primary">
                  {currentTelemetry && currentTelemetry.lat && currentTelemetry.lng
                    ? `${currentTelemetry.lat.toFixed(4)}°N, ${currentTelemetry.lng.toFixed(4)}°W`
                    : '--'}
                </div>
              </div>
            </div>

            {/* Timeline Panel */}
            <div className="mt-6">
              <TimelinePanel
                currentTime={currentTime}
                duration={duration}
                events={timelineEvents}
                incidents={vehicleIncidents}
                onTimelineSeek={handleTimelineSeek}
                onIncidentSelect={setSelectedIncident}
              />
            </div>
          </div>

          {/* Right Panel - Incidents */}
          <div className="lg:col-span-3">
            <IncidentPanel
              incidents={vehicleIncidents}
              selectedIncident={selectedIncident}
              onIncidentSelect={setSelectedIncident}
              onIncidentJump={handleTimelineSeek}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeedViewer;