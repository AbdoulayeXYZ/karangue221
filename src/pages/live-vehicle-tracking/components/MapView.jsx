import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Icon from 'components/AppIcon';
import { debounce } from 'lodash';

const MapView = ({ 
  selectedVehicle, 
  vehicles, 
  mapMode, 
  onMapModeChange, 
  isPlaybackMode, 
  onPlaybackModeChange,
  loading,
  lastUpdate,
  updateFrequency,
  onVehicleSelect = () => {}
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState({});
  const mapRef = useRef(null);
  const lastRenderRef = useRef(Date.now());
  const pendingUpdatesRef = useRef({});

  const mapModes = [
    { id: 'roadmap', label: 'Route', icon: 'Map' },
    { id: 'satellite', label: 'Satellite', icon: 'Satellite' },
    { id: 'hybrid', label: 'Hybride', icon: 'Layers' },
    { id: 'terrain', label: 'Terrain', icon: 'Mountain' }
  ];

  const playbackSpeeds = [0.5, 1, 2, 4, 8];

  // Mock geofences
  const geofences = [
    {
      id: 'zone-1',
      name: 'Zone Centre Ville',
      type: 'circle',
      center: { lat: 14.6928, lng: -17.4467 },
      radius: 2000,
      color: '#2563EB'
    },
    {
      id: 'zone-2',
      name: 'Zone Industrielle',
      type: 'polygon',
      points: [
        { lat: 14.7167, lng: -17.4677 },
        { lat: 14.7200, lng: -17.4600 },
        { lat: 14.7100, lng: -17.4500 },
        { lat: 14.7067, lng: -17.4577 }
      ],
      color: '#F59E0B'
    }
  ];

  // Initialize Google Map 
  useEffect(() => {
    // Only initialize the map if it doesn't exist yet and we're not in loading state
    if (!mapInstance && !loading && mapRef.current) {
      // Load Google Maps API dynamically if needed
      if (!window.google || !window.google.maps) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    }
    
    function initializeMap() {
      const map = new window.google.maps.Map(mapRef.current, {
        center: selectedVehicle?.location?.lat 
          ? { lat: selectedVehicle.location.lat, lng: selectedVehicle.location.lng }
          : { lat: 14.6928, lng: -17.4467 },
        zoom: 14,
        mapTypeId: mapMode || 'roadmap',
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      });
      
      // Save map instance to state
      setMapInstance(map);
    }
    
    // Cleanup function
    return () => {
      // Clean up markers if the component unmounts
      if (markers) {
        Object.values(markers).forEach(marker => marker.setMap(null));
      }
    };
  }, [loading, mapInstance, mapMode, selectedVehicle]);
  
  // Update map type when mapMode changes
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setMapTypeId(mapMode);
    }
  }, [mapInstance, mapMode]);
  
  // Debounced update function for marker positions
  const debouncedUpdateMarkers = useCallback(debounce((vehiclesToUpdate) => {
    if (!mapInstance) return;
    
    const updatedMarkers = { ...markers };
    const currentTime = Date.now();
    
    // Process all pending updates
    const allUpdates = { ...pendingUpdatesRef.current, ...vehiclesToUpdate };
    pendingUpdatesRef.current = {};
    
    Object.values(allUpdates).forEach(vehicle => {
      if (!vehicle || !vehicle.location || !vehicle.id) return;
      
      const position = { 
        lat: parseFloat(vehicle.location.lat), 
        lng: parseFloat(vehicle.location.lng) 
      };
      
      // Create or update marker
      if (!updatedMarkers[vehicle.id]) {
        // Create new marker
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: vehicle.plateNumber,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: getVehicleStatusColor(vehicle.status),
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: 'white'
          },
          optimized: true,
          zIndex: vehicle.status === 'active' ? 10 : 5
        });
        
        // Add click listener
        marker.addListener('click', () => {
          if (vehicle !== selectedVehicle) {
            onVehicleSelect(vehicle);
          }
        });
        
        updatedMarkers[vehicle.id] = marker;
      } else {
        // Just update position for existing marker
        updatedMarkers[vehicle.id].setPosition(position);
        
        // Update icon based on status
        updatedMarkers[vehicle.id].setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getVehicleStatusColor(vehicle.status),
          fillOpacity: 0.8,
          strokeWeight: 2,
          strokeColor: 'white'
        });
        
        // Animate if active
        if (vehicle.status === 'active' && vehicle.speed > 0) {
          updatedMarkers[vehicle.id].setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => {
            if (updatedMarkers[vehicle.id]) {
              updatedMarkers[vehicle.id].setAnimation(null);
            }
          }, 1500);
        } else {
          updatedMarkers[vehicle.id].setAnimation(null);
        }
      }
    });
    
    // Update markers state
    setMarkers(updatedMarkers);
    lastRenderRef.current = currentTime;
  }, 300), [mapInstance, markers, selectedVehicle, onVehicleSelect]);
  
  // Update vehicle markers when vehicles data changes
  useEffect(() => {
    if (!mapInstance || !vehicles || vehicles.length === 0) return;
    
    // Queue updates instead of applying them immediately
    // This helps with high-frequency updates
    const updates = {};
    vehicles.forEach(vehicle => {
      if (vehicle && vehicle.id) {
        updates[vehicle.id] = vehicle;
      }
    });
    
    // Store in the pending updates ref
    pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates };
    
    // Apply updates
    debouncedUpdateMarkers(updates);
  }, [vehicles, mapInstance, debouncedUpdateMarkers]);
  
  // Handle zooming to selected vehicle
  useEffect(() => {
    if (mapInstance && selectedVehicle && selectedVehicle.location) {
      const position = { 
        lat: parseFloat(selectedVehicle.location.lat), 
        lng: parseFloat(selectedVehicle.location.lng) 
      };
      mapInstance.panTo(position);
      mapInstance.setZoom(15);
      
      // Highlight the selected vehicle marker
      if (markers[selectedVehicle.id]) {
        markers[selectedVehicle.id].setZIndex(100);
        markers[selectedVehicle.id].setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: getVehicleStatusColor(selectedVehicle.status),
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: '#FFFFFF'
        });
      }
    }
  }, [selectedVehicle, mapInstance, markers]);
  
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const handleZoomToVehicle = useCallback((vehicle) => {
    if (mapInstance && vehicle && vehicle.location) {
      const position = { 
        lat: parseFloat(vehicle.location.lat), 
        lng: parseFloat(vehicle.location.lng) 
      };
      mapInstance.panTo(position);
      mapInstance.setZoom(16);
      
      if (vehicle !== selectedVehicle) {
        onVehicleSelect(vehicle);
      }
    }
  }, [mapInstance, selectedVehicle, onVehicleSelect]);

  const handlePlaybackControl = (action) => {
    switch (action) {
      case 'play':
        onPlaybackModeChange(true);
        break;
      case 'pause':
        onPlaybackModeChange(false);
        break;
      case 'stop':
        onPlaybackModeChange(false);
        setPlaybackPosition(0);
        break;
      default:
        break;
    }
  };

  const getVehicleStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'idle': return '#3B82F6';
      case 'warning': return '#F59E0B';
      case 'offline': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
  };

  return (
    <div className={`card h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Map Toolbar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Map Mode Selector */}
            <div className="flex items-center space-x-1 bg-surface-secondary rounded-base p-1">
              {mapModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onMapModeChange(mode.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 ${
                    mapMode === mode.id
                      ? 'bg-surface text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title={mode.label}
                >
                  <Icon name={mode.icon} size={14} />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Layer Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowGeofences(!showGeofences)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-base text-xs font-medium transition-all duration-150 ${
                  showGeofences
                    ? 'bg-secondary-100 text-secondary' :'bg-surface-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon name="MapPin" size={14} />
                <span className="hidden md:inline">Géofences</span>
              </button>
              
              <button
                onClick={() => setShowTraffic(!showTraffic)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-base text-xs font-medium transition-all duration-150 ${
                  showTraffic
                    ? 'bg-warning-100 text-warning' :'bg-surface-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon name="Navigation" size={14} />
                <span className="hidden md:inline">Trafic</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom to Vehicle */}
            {selectedVehicle && (
              <button
                onClick={handleZoomToVehicle}
                className="flex items-center space-x-1 px-3 py-1.5 bg-primary text-white rounded-base text-xs font-medium hover:bg-primary-700 transition-colors duration-150"
                title="Centrer sur le véhicule"
              >
                <Icon name="Target" size={14} />
                <span className="hidden sm:inline">Centrer</span>
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={handleFullscreenToggle}
              className="p-2 text-text-secondary hover:text-text-primary rounded-base hover:bg-surface-secondary transition-colors duration-150"
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={16} />
            </button>
          </div>
        </div>

        {/* Playback Controls */}
        {isPlaybackMode && (
          <div className="mt-4 p-3 bg-surface-secondary rounded-base">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePlaybackControl('play')}
                  className="p-2 bg-primary text-white rounded-base hover:bg-primary-700 transition-colors duration-150"
                >
                  <Icon name="Play" size={14} />
                </button>
                <button
                  onClick={() => handlePlaybackControl('pause')}
                  className="p-2 bg-surface border border-border rounded-base hover:bg-border transition-colors duration-150"
                >
                  <Icon name="Pause" size={14} />
                </button>
                <button
                  onClick={() => handlePlaybackControl('stop')}
                  className="p-2 bg-surface border border-border rounded-base hover:bg-border transition-colors duration-150"
                >
                  <Icon name="Square" size={14} />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-text-secondary">Vitesse:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="text-xs border border-border rounded px-2 py-1 bg-surface"
                >
                  {playbackSpeeds.map(speed => (
                    <option key={speed} value={speed}>{speed}x</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-text-secondary font-data">00:00</span>
              <div className="flex-1 bg-border rounded-full h-2 relative">
                <div 
                  className="bg-secondary h-full rounded-full transition-all duration-150"
                  style={{ width: `${playbackPosition}%` }}
                ></div>
                <button
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-secondary rounded-full border-2 border-white shadow-sm"
                  style={{ left: `${playbackPosition}%` }}
                ></button>
              </div>
              <span className="text-xs text-text-secondary font-data">24:00</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-surface-secondary">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-surface-secondary">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-t-secondary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Chargement de la carte...</p>
            </div>
          </div>
        ) : (
          // Google Maps container div
          <div 
            ref={mapRef}
            className="w-full h-full rounded-none"
            aria-label="Carte de suivi des véhicules"
          />
        )}

        {/* Map Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {loading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white px-4 py-2 rounded-base">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin"></div>
                <span>Mise à jour de la position...</span>
              </div>
            </div>
          )}
          
          {/* Vehicle Markers Overlay */}
          <div className="absolute top-4 left-4 bg-surface border border-border rounded-base shadow-elevation-2 p-3 pointer-events-auto">
            <h4 className="font-medium text-text-primary mb-2 text-sm">Véhicules Visibles</h4>
            <div className="space-y-2">
              {vehicles && vehicles.length > 0 ? (
                vehicles.slice(0, 3).map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-surface-secondary p-1 rounded"
                    onClick={() => handleZoomToVehicle(vehicle)}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full ${vehicle.status === 'active' ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: getVehicleStatusColor(vehicle.status) }}
                    ></div>
                    <span className="text-text-primary font-medium">{vehicle.plateNumber}</span>
                    <span className="text-text-secondary">{vehicle.speed} km/h</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-text-secondary">
                  Aucun véhicule disponible
                </div>
              )}
              {vehicles && vehicles.length > 3 && (
                <p className="text-xs text-text-secondary">
                  +{vehicles.length - 3} autres véhicules
                </p>
              )}
            </div>
          </div>

          {/* Selected Vehicle Info */}
          {selectedVehicle && (
            <div className="absolute bottom-4 left-4 bg-surface border border-border rounded-base shadow-elevation-2 p-4 pointer-events-auto min-w-64">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-text-primary">{selectedVehicle.plateNumber}</h4>
                  <p className="text-sm text-text-secondary">{selectedVehicle.driverName}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedVehicle.status === 'active' ? 'bg-success-100 text-success' :
                  selectedVehicle.status === 'idle' ? 'bg-secondary-100 text-secondary' :
                  selectedVehicle.status === 'warning'? 'bg-warning-100 text-warning' : 'bg-error-100 text-error'
                }`}>
                  {selectedVehicle.status === 'active' ? 'En Route' :
                   selectedVehicle.status === 'idle' ? 'Au Ralenti' :
                   selectedVehicle.status === 'warning' ? 'Alerte' : 'Hors Ligne'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-text-secondary">Vitesse</p>
                  <p className="font-medium text-text-primary font-data">{selectedVehicle.speed} km/h</p>
                </div>
                <div>
                  <p className="text-text-secondary">Direction</p>
                  <p className="font-medium text-text-primary font-data">{selectedVehicle.heading}°</p>
                </div>
                <div>
                  <p className="text-text-secondary">Carburant</p>
                  <p className="font-medium text-text-primary font-data">{selectedVehicle.fuel}%</p>
                </div>
                <div>
                  <p className="text-text-secondary">Moteur</p>
                  <p className="font-medium text-text-primary capitalize">{selectedVehicle.engineStatus}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-text-secondary mb-1">Position</p>
                <p className="text-xs font-data text-text-primary">
                  {formatCoordinates(selectedVehicle.location.lat, selectedVehicle.location.lng)}
                </p>
                <p className="text-xs text-text-secondary mt-1">{selectedVehicle.location.address}</p>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2 pointer-events-auto">
            <button className="w-10 h-10 bg-surface border border-border rounded-base shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150">
              <Icon name="Plus" size={16} className="text-text-primary" />
            </button>
            <button className="w-10 h-10 bg-surface border border-border rounded-base shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150">
              <Icon name="Minus" size={16} className="text-text-primary" />
            </button>
            <button 
              className="w-10 h-10 bg-surface border border-border rounded-base shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150"
              onClick={() => {
                if (mapInstance && selectedVehicle && selectedVehicle.location) {
                  handleZoomToVehicle(selectedVehicle);
                }
              }}
            >
              <Icon name="RotateCcw" size={16} className="text-text-primary" />
            </button>
          </div>
          
          {/* Real-time Update Indicator */}
          {updateFrequency === 'real-time' && !loading && lastUpdate && (
            <div className="absolute bottom-16 right-4 bg-success-100 text-success px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-elevation-1">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
              <span>Suivi en temps réel</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Footer */}
      <div className="p-3 border-t border-border bg-surface-secondary">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center space-x-4">
            <span>
              Dernière mise à jour: {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'Aucune mise à jour'}
              {updateFrequency === 'real-time' && (
                <span className="ml-2 px-2 py-0.5 bg-success-100 text-success rounded-full text-xs">
                  Temps réel
                </span>
              )}
            </span>
            <span>•</span>
            <span>{vehicles ? vehicles.length : 0} véhicules affichés</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPlaybackModeChange(!isPlaybackMode)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors duration-150 ${
                isPlaybackMode
                  ? 'bg-secondary text-white' :'hover:bg-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name="History" size={12} />
              <span>Historique</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;