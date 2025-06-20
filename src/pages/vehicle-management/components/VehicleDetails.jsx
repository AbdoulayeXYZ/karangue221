import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const VehicleDetails = ({ vehicle }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: 'Eye' },
    { id: 'devices', label: 'Équipements', icon: 'Smartphone' },
    { id: 'configuration', label: 'Configuration', icon: 'Settings' },
    { id: 'history', label: 'Historique', icon: 'Clock' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success-50';
      case 'maintenance': return 'text-warning bg-warning-50';
      case 'offline': return 'text-error bg-error-50';
      default: return 'text-text-secondary bg-surface-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  };

  const getDeviceStatusColor = (device) => {
    switch (device.status) {
      case 'connected': return 'text-success';
      case 'warning': return 'text-warning';
      case 'offline': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Vehicle Image and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="w-full h-48 bg-surface-secondary rounded-base overflow-hidden mb-4">
            <Image
              src={vehicle.image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className={`status-indicator ${getStatusColor(vehicle.status)}`}>
              {getStatusText(vehicle.status)}
            </span>
            <button className="text-sm text-secondary hover:text-secondary-700 font-medium">
              Modifier l'image
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Informations Générales
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Plaque d'immatriculation:</span>
                <span className="font-medium text-text-primary">{vehicle.licensePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Marque:</span>
                <span className="font-medium text-text-primary">{vehicle.make}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Modèle:</span>
                <span className="font-medium text-text-primary">{vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Année:</span>
                <span className="font-medium text-text-primary">{vehicle.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Type:</span>
                <span className="font-medium text-text-primary">{vehicle.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Kilométrage:</span>
                <span className="font-medium text-text-primary">
                  {vehicle.specifications.mileage.toLocaleString('fr-FR')} km
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Assignment */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Icon name="UserCheck" size={20} />
          <span>Affectation Conducteur</span>
        </h3>
        {vehicle.driver ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">{vehicle.driver.name}</p>
                <p className="text-sm text-text-secondary">iButton: {vehicle.driver.iButtonId}</p>
                <p className="text-sm text-text-secondary">{vehicle.driver.phone}</p>
              </div>
            </div>
            <button className="text-sm text-secondary hover:text-secondary-700 font-medium">
              Modifier
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Icon name="UserX" size={32} className="text-text-tertiary mx-auto mb-2" />
            <p className="text-text-secondary mb-3">Aucun conducteur assigné</p>
            <button className="btn-secondary text-sm">
              Assigner un conducteur
            </button>
          </div>
        )}
      </div>

      {/* Insurance and Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <Icon name="Shield" size={20} />
            <span>Assurance</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Assureur:</span>
              <span className="font-medium text-text-primary">{vehicle.insurance.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Police:</span>
              <span className="font-medium text-text-primary">{vehicle.insurance.policyNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Couverture:</span>
              <span className="font-medium text-text-primary">{vehicle.insurance.coverage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Expiration:</span>
              <span className="font-medium text-text-primary">
                {formatDate(vehicle.insurance.expiryDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <Icon name="Wrench" size={20} />
            <span>Maintenance</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Dernier service:</span>
              <span className="font-medium text-text-primary">
                {formatDate(vehicle.maintenance.lastService)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Prochain service:</span>
              <span className="font-medium text-text-primary">
                {formatDate(vehicle.maintenance.nextService)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Intervalle:</span>
              <span className="font-medium text-text-primary">
                {vehicle.maintenance.serviceInterval.toLocaleString('fr-FR')} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Statut:</span>
              <span className={`font-medium ${
                vehicle.maintenance.status === 'À jour' ? 'text-success' :
                vehicle.maintenance.status === 'En cours' ? 'text-warning' : 'text-error'
              }`}>
                {vehicle.maintenance.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDevicesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(vehicle.devices).map(([deviceType, device]) => (
          <div key={deviceType} className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
                <Icon 
                  name={deviceType === 'gps' ? 'MapPin' : 
                        deviceType === 'adas' ? 'Shield' :
                        deviceType === 'dms' ? 'Eye' : 'Video'} 
                  size={20} 
                />
                <span>{deviceType.toUpperCase()}</span>
              </h3>
              <span className={`status-indicator ${
                device.status === 'connected' ? 'status-success' :
                device.status === 'warning' ? 'status-warning' : 'status-error'
              }`}>
                {device.status === 'connected' ? 'Connecté' :
                 device.status === 'warning' ? 'Attention' : 'Hors ligne'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Force du signal:</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${getDeviceStatusColor(device)}`}>
                    {device.signalStrength}%
                  </span>
                  <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        device.signalStrength >= 80 ? 'bg-success' :
                        device.signalStrength >= 60 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${device.signalStrength}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Dernière communication:</span>
                <span className="font-medium text-text-primary font-data">
                  {formatDateTime(device.lastUpdate)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-text-secondary">Version firmware:</span>
                <span className="font-medium text-text-primary font-data">
                  v2.4.{Math.floor(Math.random() * 10)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <button className="text-sm text-secondary hover:text-secondary-700 font-medium">
                Configurer l'équipement
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfigurationTab = () => (
    <div className="space-y-6">
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Géofencing
        </h3>
        <p className="text-text-secondary mb-4">
          Définir les zones autorisées et les alertes de sortie de zone
        </p>
        <button className="btn-secondary">
          Configurer les géofences
        </button>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Seuils d'Alerte
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Vitesse maximale:</span>
            <div className="flex items-center space-x-2">
              <input type="number" defaultValue="90" className="input-field w-20 text-center" />
              <span className="text-text-secondary">km/h</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Accélération brutale:</span>
            <div className="flex items-center space-x-2">
              <input type="number" defaultValue="4" className="input-field w-20 text-center" />
              <span className="text-text-secondary">m/s²</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Freinage brusque:</span>
            <div className="flex items-center space-x-2">
              <input type="number" defaultValue="-4" className="input-field w-20 text-center" />
              <span className="text-text-secondary">m/s²</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <button className="btn-primary">
            Sauvegarder les paramètres
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Paramètres Comportementaux
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Détection de fatigue:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Surveillance téléphone:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Détection ceinture:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => {
    const historyEvents = [
      {
        id: 1,
        type: 'maintenance',
        title: 'Maintenance préventive',
        description: 'Vidange moteur et changement des filtres',
        date: new Date('2024-01-15'),
        status: 'completed'
      },
      {
        id: 2,
        type: 'driver',
        title: 'Changement de conducteur',
        description: 'Affectation à Amadou Diallo (iButton: IB-001-2024)',
        date: new Date('2024-01-10'),
        status: 'completed'
      },
      {
        id: 3,
        type: 'incident',
        title: 'Excès de vitesse détecté',
        description: '95 km/h en zone 70 km/h - Route de Rufisque',
        date: new Date('2024-01-08'),
        status: 'resolved'
      },
      {
        id: 4,
        type: 'device',
        title: 'Mise à jour firmware ADAS',
        description: 'Mise à jour vers la version 2.4.3',
        date: new Date('2024-01-05'),
        status: 'completed'
      }
    ];

    const getEventIcon = (type) => {
      switch (type) {
        case 'maintenance': return 'Wrench';
        case 'driver': return 'UserCheck';
        case 'incident': return 'AlertTriangle';
        case 'device': return 'Smartphone';
        default: return 'Clock';
      }
    };

    const getEventColor = (type) => {
      switch (type) {
        case 'maintenance': return 'text-primary';
        case 'driver': return 'text-secondary';
        case 'incident': return 'text-warning';
        case 'device': return 'text-success';
        default: return 'text-text-secondary';
      }
    };

    return (
      <div className="space-y-4">
        {historyEvents.map((event) => (
          <div key={event.id} className="card p-4">
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                event.type === 'maintenance' ? 'bg-primary-100' :
                event.type === 'driver' ? 'bg-secondary-100' :
                event.type === 'incident' ? 'bg-warning-100' : 'bg-success-100'
              }`}>
                <Icon 
                  name={getEventIcon(event.type)} 
                  size={16} 
                  className={getEventColor(event.type)}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-text-primary">{event.title}</h4>
                  <span className="text-sm text-text-secondary font-data">
                    {formatDateTime(event.date)}
                  </span>
                </div>
                <p className="text-text-secondary text-sm">{event.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {vehicle.licensePlate}
            </h2>
            <p className="text-text-secondary">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary flex items-center space-x-2">
              <Icon name="Edit" size={16} />
              <span>Modifier</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Icon name="MapPin" size={16} />
              <span>Localiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'devices' && renderDevicesTab()}
        {activeTab === 'configuration' && renderConfigurationTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>
    </div>
  );
};

export default VehicleDetails;