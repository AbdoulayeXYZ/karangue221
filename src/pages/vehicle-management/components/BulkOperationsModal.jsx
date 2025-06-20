import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const BulkOperationsModal = ({ selectedVehicles, vehicles, onClose, onSubmit }) => {
  const [operation, setOperation] = useState('');
  const [operationData, setOperationData] = useState({});

  const operations = [
    {
      id: 'assign_driver',
      label: 'Assigner un conducteur',
      icon: 'UserCheck',
      description: 'Assigner le même conducteur à tous les véhicules sélectionnés'
    },
    {
      id: 'update_status',
      label: 'Modifier le statut',
      icon: 'Settings',
      description: 'Changer le statut de tous les véhicules sélectionnés'
    },
    {
      id: 'schedule_maintenance',
      label: 'Programmer maintenance',
      icon: 'Wrench',
      description: 'Programmer une maintenance pour tous les véhicules sélectionnés'
    },
    {
      id: 'update_geofence',
      label: 'Modifier géofences',
      icon: 'MapPin',
      description: 'Appliquer les mêmes géofences à tous les véhicules'
    },
    {
      id: 'export_data',
      label: 'Exporter les données',
      icon: 'Download',
      description: 'Exporter les informations des véhicules sélectionnés'
    }
  ];

  const drivers = [
    { id: 'DR001', name: 'Amadou Diallo', iButtonId: 'IB-001-2024' },
    { id: 'DR002', name: 'Fatou Sall', iButtonId: 'IB-002-2024' },
    { id: 'DR003', name: 'Moussa Ba', iButtonId: 'IB-003-2024' },
    { id: 'DR004', name: 'Aïssatou Ndiaye', iButtonId: 'IB-004-2024' },
    { id: 'DR005', name: 'Ousmane Cissé', iButtonId: 'IB-005-2024' }
  ];

  const statuses = [
    { value: 'active', label: 'Actif' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'offline', label: 'Hors ligne' }
  ];

  const selectedVehicleData = vehicles.filter(v => selectedVehicles.includes(v.id));

  const handleOperationChange = (operationId) => {
    setOperation(operationId);
    setOperationData({});
  };

  const handleDataChange = (key, value) => {
    setOperationData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(operation, operationData);
  };

  const renderOperationForm = () => {
    switch (operation) {
      case 'assign_driver':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Sélectionner un conducteur
              </label>
              <select
                value={operationData.driverId || ''}
                onChange={(e) => handleDataChange('driverId', e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">Choisir un conducteur...</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.iButtonId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'update_status':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nouveau statut
              </label>
              <select
                value={operationData.status || ''}
                onChange={(e) => handleDataChange('status', e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">Choisir un statut...</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={operationData.comment || ''}
                onChange={(e) => handleDataChange('comment', e.target.value)}
                placeholder="Raison du changement de statut..."
                className="input-field w-full h-20 resize-none"
              />
            </div>
          </div>
        );

      case 'schedule_maintenance':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Date de maintenance
              </label>
              <input
                type="date"
                value={operationData.maintenanceDate || ''}
                onChange={(e) => handleDataChange('maintenanceDate', e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Type de maintenance
              </label>
              <select
                value={operationData.maintenanceType || ''}
                onChange={(e) => handleDataChange('maintenanceType', e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">Choisir le type...</option>
                <option value="preventive">Maintenance préventive</option>
                <option value="corrective">Maintenance corrective</option>
                <option value="inspection">Inspection technique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                value={operationData.maintenanceDescription || ''}
                onChange={(e) => handleDataChange('maintenanceDescription', e.target.value)}
                placeholder="Description des travaux à effectuer..."
                className="input-field w-full h-20 resize-none"
              />
            </div>
          </div>
        );

      case 'update_geofence':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Zones géographiques
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={operationData.zones?.includes('dakar_centre') || false}
                    onChange={(e) => {
                      const zones = operationData.zones || [];
                      if (e.target.checked) {
                        handleDataChange('zones', [...zones, 'dakar_centre']);
                      } else {
                        handleDataChange('zones', zones.filter(z => z !== 'dakar_centre'));
                      }
                    }}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-text-primary">Dakar Centre</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={operationData.zones?.includes('parcelles') || false}
                    onChange={(e) => {
                      const zones = operationData.zones || [];
                      if (e.target.checked) {
                        handleDataChange('zones', [...zones, 'parcelles']);
                      } else {
                        handleDataChange('zones', zones.filter(z => z !== 'parcelles'));
                      }
                    }}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-text-primary">Parcelles Assainies</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={operationData.zones?.includes('pikine') || false}
                    onChange={(e) => {
                      const zones = operationData.zones || [];
                      if (e.target.checked) {
                        handleDataChange('zones', [...zones, 'pikine']);
                      } else {
                        handleDataChange('zones', zones.filter(z => z !== 'pikine'));
                      }
                    }}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-text-primary">Pikine</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'export_data':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Format d'export
              </label>
              <select
                value={operationData.format || 'excel'}
                onChange={(e) => handleDataChange('format', e.target.value)}
                className="input-field w-full"
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Données à inclure
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={operationData.includeBasicInfo !== false}
                    onChange={(e) => handleDataChange('includeBasicInfo', e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-text-primary">Informations de base</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={operationData.includeDevices || false}
                    onChange={(e) => handleDataChange('includeDevices', e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-text-primary">État des équipements</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={operationData.includeMaintenance || false}
                    onChange={(e) => handleDataChange('includeMaintenance', e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-text-primary">Historique maintenance</span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1200 p-4">
      <div className="bg-surface rounded-base shadow-elevation-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Actions Groupées
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-base hover:bg-surface-secondary"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          <p className="text-text-secondary mt-2">
            {selectedVehicles.length} véhicule{selectedVehicles.length > 1 ? 's' : ''} sélectionné{selectedVehicles.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-6">
          {/* Selected Vehicles Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Véhicules sélectionnés
            </h3>
            <div className="bg-surface-secondary rounded-base p-3 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {selectedVehicleData.map(vehicle => (
                  <span
                    key={vehicle.id}
                    className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary text-sm rounded-base"
                  >
                    {vehicle.licensePlate}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Operation Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Choisir une action
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {operations.map(op => (
                <button
                  key={op.id}
                  onClick={() => handleOperationChange(op.id)}
                  className={`p-4 border rounded-base text-left transition-all duration-150 ${
                    operation === op.id
                      ? 'border-primary bg-primary-50' :'border-border hover:border-primary-200 hover:bg-surface-secondary'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon 
                      name={op.icon} 
                      size={20} 
                      className={operation === op.id ? 'text-primary' : 'text-text-secondary'}
                    />
                    <div>
                      <h4 className="font-medium text-text-primary">{op.label}</h4>
                      <p className="text-sm text-text-secondary mt-1">{op.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Operation Form */}
          {operation && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  Configuration de l'action
                </h3>
                {renderOperationForm()}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary border border-border rounded-base hover:bg-surface-secondary transition-all duration-150"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Icon name="Check" size={16} />
                  <span>Appliquer l'action</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsModal;