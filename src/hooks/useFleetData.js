import { useState, useEffect, useCallback, useRef } from 'react';
import * as vehicleApi from 'services/api/vehicles';
import * as driverApi from 'services/api/drivers';
import * as incidentApi from 'services/api/incidents';
import * as violationApi from 'services/api/violations';
import * as telemetryApi from 'services/api/telemetry';

/**
 * Custom hook pour gérer les données en temps réel de la flotte
 * 
 * @param {Object} options Options de configuration
 * @param {string} options.token Token d'authentification (défaut: localStorage)
 * @param {string} options.url URL du WebSocket (défaut: ws://localhost:5001/ws)
 * @param {boolean} options.autoConnect Connexion automatique (défaut: true)
 * @param {number} options.reconnectInterval Intervalle de reconnexion en ms (défaut: 3000)
 * @param {number} options.maxReconnectAttempts Nombre max de tentatives (défaut: 10)
 * @returns {Object} Données de la flotte et état de connexion
 */
const useFleetData = (options = {}) => {
  // Options avec valeurs par défaut
  const {
    token = localStorage.getItem('authToken'),
    url = `ws://${window.location.hostname}:5001/ws`,
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10
  } = options;

  // Référence au WebSocket
  const socketRef = useRef(null);
  
  // État de connexion
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempt: 0,
    lastPing: null,
  });

  // État des données de la flotte
  const [fleetData, setFleetData] = useState({
    vehicles: [],
    drivers: [],
    incidents: [],
    violations: [],
    telemetry: [],
    lastUpdate: null,
    isLoading: true,
  });

  // Référence pour le composant monté (éviter les mises à jour après démontage)
  const isMounted = useRef(true);
  
  // Référence pour l'intervalle de ping
  const pingIntervalRef = useRef(null);
  
  // Référence pour le timeout de reconnexion
  const reconnectTimeoutRef = useRef(null);

  /**
   * Établir la connexion WebSocket
   */
  const connect = useCallback(() => {
    if (!token) {
      if (isMounted.current) {
        setConnectionState(prev => ({
          ...prev,
          error: new Error('Token d\'authentification requis'),
          isConnecting: false
        }));
      }
      return;
    }

    // Ne pas se connecter si déjà en cours de connexion ou déjà connecté
    if (connectionState.isConnecting || 
        (socketRef.current && socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    // Nettoyer toute connexion existante
    if (socketRef.current) {
      try {
        socketRef.current.close(1000, 'Reconnecting');
      } catch (error) {
        console.warn('Error closing existing WebSocket:', error);
      }
      socketRef.current = null;
    }

    // Mise à jour de l'état
    if (isMounted.current) {
      setConnectionState(prev => ({
        ...prev,
        isConnecting: true,
        error: null
      }));
    }

    try {
      // Créer une nouvelle connexion WebSocket
      const wsUrl = `${url}?token=${token}`;
      socketRef.current = new WebSocket(wsUrl);

      // Configuration des gestionnaires d'événements
      socketRef.current.onopen = handleOpen;
      socketRef.current.onmessage = handleMessage;
      socketRef.current.onclose = handleClose;
      socketRef.current.onerror = handleError;
    } catch (error) {
      console.error('Erreur lors de la création de la connexion WebSocket:', error);
      
      if (isMounted.current) {
        setConnectionState(prev => ({
          ...prev,
          isConnecting: false,
          error: error
        }));
      }
      
      // Planifier une reconnexion
      scheduleReconnect();
    }
  }, [token, url, connectionState.isConnecting]);

  /**
   * Fermer la connexion WebSocket
   */
  const disconnect = useCallback(() => {
    // Nettoyer le timeout de reconnexion
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Nettoyer l'intervalle de ping
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    // Fermer le WebSocket proprement
    if (socketRef.current) {
      try {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close(1000, 'Client disconnect');
        }
      } catch (error) {
        console.warn('Error closing WebSocket:', error);
      }
      socketRef.current = null;
    }
    
    if (isMounted.current) {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        reconnectAttempt: 0
      }));
    }
  }, []);

  /**
   * Gestionnaire d'événement WebSocket ouvert
   */
  const handleOpen = useCallback(() => {
    console.log('Connexion WebSocket établie');
    
    if (isMounted.current) {
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        reconnectAttempt: 0,
        error: null
      }));
    }
    
    // Démarrer l'intervalle de ping
    startPingInterval();
    
    // Demander les données initiales
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action: 'get_initial_data'
      }));
    }
  }, []);

  /**
   * Gestionnaire d'événement WebSocket message
   */
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Traiter les différents types de messages
      switch (data.type) {
        case 'fleet_data':
          // Mise à jour complète des données
          if (isMounted.current) {
            setFleetData({
              vehicles: data.data.vehicles || [],
              drivers: data.data.drivers || [],
              incidents: data.data.incidents || [],
              violations: data.data.violations || [],
              telemetry: data.data.telemetry || [],
              lastUpdate: new Date(),
              isLoading: false
            });
          }
          break;
          
        case 'vehicles_update':
          // Mise à jour partielle - véhicules uniquement
          if (isMounted.current) {
            setFleetData(prev => ({
              ...prev,
              vehicles: data.vehicles || prev.vehicles,
              lastUpdate: new Date()
            }));
          }
          break;
          
        case 'drivers_update':
          // Mise à jour partielle - conducteurs uniquement
          if (isMounted.current) {
            setFleetData(prev => ({
              ...prev,
              drivers: data.drivers || prev.drivers,
              lastUpdate: new Date()
            }));
          }
          break;
          
        case 'incidents_update':
          // Mise à jour partielle - incidents uniquement
          if (isMounted.current) {
            setFleetData(prev => ({
              ...prev,
              incidents: data.incidents || prev.incidents,
              lastUpdate: new Date()
            }));
          }
          break;
          
        case 'violations_update':
          // Mise à jour partielle - violations uniquement
          if (isMounted.current) {
            setFleetData(prev => ({
              ...prev,
              violations: data.violations || prev.violations,
              lastUpdate: new Date()
            }));
          }
          break;
          
        case 'telemetry_update':
          // Mise à jour partielle - télémétrie uniquement
          if (isMounted.current) {
            setFleetData(prev => ({
              ...prev,
              telemetry: data.telemetry || prev.telemetry,
              lastUpdate: new Date()
            }));
          }
          break;
          
        case 'pong':
          // Gestion de la réponse ping
          if (isMounted.current) {
            setConnectionState(prev => ({
              ...prev,
              lastPing: new Date()
            }));
          }
          break;
          
        case 'error':
          // Gestion des erreurs serveur
          console.error('Erreur serveur WebSocket:', data.message);
          break;
          
        default:
          console.log('Type de message inconnu:', data.type);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du message WebSocket:', error);
    }
  }, []);

  /**
   * Gestionnaire d'événement WebSocket fermé
   */
  const handleClose = useCallback((event) => {
    console.log(`Connexion WebSocket fermée: ${event.code} ${event.reason}`);
    
    if (isMounted.current) {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false
      }));
    }
    
    // Nettoyer l'intervalle de ping
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    // Si la fermeture n'est pas propre, tenter de se reconnecter
    if (event.code !== 1000) {
      scheduleReconnect();
    }
  }, []);

  /**
   * Gestionnaire d'événement WebSocket erreur
   */
  const handleError = useCallback((error) => {
    console.error('Erreur WebSocket:', error);
    
    // Vérifier si l'erreur est liée à runtime.lastError
    if (error && error.message && error.message.includes('runtime.lastError')) {
      console.warn('Runtime.lastError detected - this may be a browser extension issue');
    }
    
    if (isMounted.current) {
      setConnectionState(prev => ({
        ...prev,
        error: new Error('Erreur de connexion WebSocket'),
        isConnecting: false
      }));
    }
  }, []);

  /**
   * Démarrer l'intervalle de ping pour maintenir la connexion active
   */
  const startPingInterval = useCallback(() => {
    // Nettoyer l'intervalle existant
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    // Configurer un nouvel intervalle
    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ action: 'ping' }));
      }
    }, 30000); // Envoyer un ping toutes les 30 secondes
  }, []);

  /**
   * Planifier une tentative de reconnexion
   */
  const scheduleReconnect = useCallback(() => {
    // Nettoyer le timeout existant
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (connectionState.reconnectAttempt < maxReconnectAttempts) {
      const nextAttempt = connectionState.reconnectAttempt + 1;
      
      if (isMounted.current) {
        setConnectionState(prev => ({
          ...prev,
          reconnectAttempt: nextAttempt
        }));
      }
      
      // Backoff exponentiel
      const delay = Math.min(30000, reconnectInterval * Math.pow(1.5, nextAttempt - 1));
      
      console.log(`Planification de la tentative de reconnexion ${nextAttempt} dans ${delay}ms`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          connect();
        }
      }, delay);
    } else {
      console.error(`Nombre maximum de tentatives de reconnexion atteint (${maxReconnectAttempts})`);
      
      if (isMounted.current) {
        setConnectionState(prev => ({
          ...prev,
          error: new Error(`Échec de la reconnexion après ${maxReconnectAttempts} tentatives`)
        }));
      }
    }
  }, [connect, connectionState.reconnectAttempt, maxReconnectAttempts, reconnectInterval]);

  /**
   * Rafraîchir manuellement les données
   */
  const refreshData = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action: 'get_initial_data'
      }));
    } else {
      // Si non connecté, essayer de se connecter d'abord
      connect();
    }
  }, [connect]);

  /**
   * Envoyer un message via WebSocket
   */
  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Se connecter au montage si autoConnect est vrai
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Nettoyage au démontage
    return () => {
      isMounted.current = false;
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Utilisation de l'API REST en secours si WebSocket non connecté
  useEffect(() => {
    const fetchDataFromApi = async () => {
      // Récupérer uniquement si non connecté et en cours de chargement
      if (!connectionState.isConnected && fleetData.isLoading) {
        try {
          // Marquer comme en cours de chargement
          if (isMounted.current) {
            setFleetData(prev => ({ ...prev, isLoading: true }));
          }
          
          // Récupérer les données depuis l'API REST
          const [vehicles, drivers, incidents, violations, telemetry] = await Promise.all([
            vehicleApi.getVehicles(),
            driverApi.getDrivers(),
            incidentApi.getIncidents(),
            violationApi.getViolations(),
            telemetryApi.getTelemetry()
          ]);
          
          // Mettre à jour l'état avec les données récupérées
          if (isMounted.current) {
            setFleetData({
              vehicles,
              drivers,
              incidents,
              violations,
              telemetry,
              lastUpdate: new Date(),
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données depuis l\'API:', error);
          
          // Définir l'état d'erreur
          if (isMounted.current) {
            setFleetData(prev => ({ 
              ...prev, 
              isLoading: false
            }));
            
            setConnectionState(prev => ({
              ...prev,
              error: new Error('Erreur lors de la récupération des données')
            }));
          }
        }
      }
    };
    
    // Essayer de récupérer les données si WebSocket non connecté
    if (!connectionState.isConnected && fleetData.isLoading) {
      fetchDataFromApi();
    }
  }, [connectionState.isConnected, fleetData.isLoading]);

  // Valeur retournée par le hook
  return {
    // État de la connexion
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    error: connectionState.error,
    reconnectAttempt: connectionState.reconnectAttempt,
    lastPing: connectionState.lastPing,
    
    // Données de la flotte
    vehicles: fleetData.vehicles || [],
    drivers: fleetData.drivers || [],
    incidents: fleetData.incidents || [],
    violations: fleetData.violations || [],
    telemetry: fleetData.telemetry || [],
    lastUpdate: fleetData.lastUpdate,
    isLoading: fleetData.isLoading,
    
    // Méthodes
    connect,
    disconnect,
    refreshData,
    sendMessage
  };
};

export default useFleetData;
