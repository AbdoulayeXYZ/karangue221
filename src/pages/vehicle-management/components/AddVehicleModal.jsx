import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const AddVehicleModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    registration: '',                       // licensePlate remapped to registration
    brand: '',                              // make remapped to brand
    model: '',
    year: new Date().getFullYear(),
    type: 'Minibus',
    vin_number: '',                        // vin remapped to vin_number
    engine_details: '',                    // engine remapped to engine_details
    fuel_type: 'diesel',                   // fuelType remapped to fuel_type
    passenger_capacity: '',                // capacity remapped to passenger_capacity
    insurance_provider: '',                // insuranceProvider remapped to insurance_provider
    policy_number: '',                     // policyNumber remapped to policy_number
    insurance_expiry: '',                  // insuranceExpiry remapped to insurance_expiry
    insurance_coverage_type: 'Tous risques', // coverage remapped to insurance_coverage_type
    color: '',                             // Added from DB schema
    status: 'active',                      // Added from DB schema
    fleet_id: 1,                           // Added from DB schema
    imei_device: '',                       // Added from DB schema
    tank_capacity: '',                     // Added from DB schema
    mileage: 0,                            // Added from DB schema
    technical_inspection_date: '',         // Added from DB schema
    technical_inspection_expiry: ''        // Added from DB schema
  });

  const [errors, setErrors] = useState({});

  const vehicleTypes = ['Minibus', 'Bus', 'Camion', 'Utilitaire', 'Berline'];
  const fuelTypes = ['diesel', 'gasoline', 'electric', 'hybrid', 'other'];
  const fuelTypeLabels = {
    diesel: 'Diesel',
    gasoline: 'Essence',
    electric: 'Électrique',
    hybrid: 'Hybride',
    other: 'Autre'
  };
  const coverageTypes = ['Tous risques', 'Responsabilité civile', 'Vol et incendie'];
  const statusTypes = ['active', 'inactive', 'maintenance'];
  const statusLabels = {
    active: 'Actif',
    inactive: 'Inactif',
    maintenance: 'En maintenance'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.registration.trim()) {
      newErrors.registration = 'La plaque d\'immatriculation est requise';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'La marque est requise';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Le modèle est requis';
    }
    if (!formData.vin_number.trim()) {
      newErrors.vin_number = 'Le numéro VIN est requis';
    }
    if (!formData.passenger_capacity.trim()) {
      newErrors.passenger_capacity = 'La capacité est requise';
    }
    if (!formData.insurance_provider.trim()) {
      newErrors.insurance_provider = 'L\'assureur est requis';
    }
    if (!formData.policy_number.trim()) {
      newErrors.policy_number = 'Le numéro de police est requis';
    }
    if (!formData.insurance_expiry) {
      newErrors.insurance_expiry = 'La date d\'expiration est requise';
    }
    if (!formData.fleet_id) {
      newErrors.fleet_id = 'L\'ID de la flotte est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1200 p-4">
      <div className="bg-surface rounded-base shadow-elevation-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Ajouter un Nouveau Véhicule
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-base hover:bg-surface-secondary"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Informations du Véhicule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Plaque d'immatriculation *
                </label>
                <input
                  type="text"
                  name="registration"
                  value={formData.registration}
                  onChange={handleInputChange}
                  placeholder="DK-2024-XX"
                  className={`input-field ${errors.registration ? 'border-error' : ''}`}
                />
                {errors.registration && (
                  <p className="text-error text-sm mt-1">{errors.registration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Marque *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Mercedes-Benz"
                  className={`input-field ${errors.brand ? 'border-error' : ''}`}
                />
                {errors.brand && (
                  <p className="text-error text-sm mt-1">{errors.brand}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Modèle *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Sprinter 516"
                  className={`input-field ${errors.model ? 'border-error' : ''}`}
                />
                {errors.model && (
                  <p className="text-error text-sm mt-1">{errors.model}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Année
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Type de véhicule
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Capacité *
                </label>
                <input
                  type="text"
                  name="passenger_capacity"
                  value={formData.passenger_capacity}
                  onChange={handleInputChange}
                  placeholder="16 passagers"
                  className={`input-field ${errors.passenger_capacity ? 'border-error' : ''}`}
                />
                {errors.passenger_capacity && (
                  <p className="text-error text-sm mt-1">{errors.passenger_capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Couleur
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Blanc"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  ID Flotte *
                </label>
                <input
                  type="number"
                  name="fleet_id"
                  value={formData.fleet_id}
                  onChange={handleInputChange}
                  min="1"
                  className={`input-field ${errors.fleet_id ? 'border-error' : ''}`}
                />
                {errors.fleet_id && (
                  <p className="text-error text-sm mt-1">{errors.fleet_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Spécifications Techniques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Numéro VIN *
                </label>
                <input
                  type="text"
                  name="vin_number"
                  value={formData.vin_number}
                  onChange={handleInputChange}
                  placeholder="WDB9066331R123456"
                  className={`input-field ${errors.vin_number ? 'border-error' : ''}`}
                  maxLength="17"
                />
                {errors.vin_number && (
                  <p className="text-error text-sm mt-1">{errors.vin_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Moteur
                </label>
                <input
                  type="text"
                  name="engine_details"
                  value={formData.engine_details}
                  onChange={handleInputChange}
                  placeholder="2.1L CDI Diesel"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Type de carburant
                </label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {fuelTypes.map(fuel => (
                    <option key={fuel} value={fuel}>{fuelTypeLabels[fuel]}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Capacité du réservoir (L)
                </label>
                <input
                  type="number"
                  name="tank_capacity"
                  value={formData.tank_capacity}
                  onChange={handleInputChange}
                  placeholder="80"
                  step="0.1"
                  min="0"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Kilométrage
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  IMEI dispositif
                </label>
                <input
                  type="text"
                  name="imei_device"
                  value={formData.imei_device}
                  onChange={handleInputChange}
                  placeholder="123456789012345"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Informations d'Assurance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Assureur *
                </label>
                <input
                  type="text"
                  name="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={handleInputChange}
                  placeholder="NSIA Assurances"
                  className={`input-field ${errors.insurance_provider ? 'border-error' : ''}`}
                />
                {errors.insurance_provider && (
                  <p className="text-error text-sm mt-1">{errors.insurance_provider}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Numéro de police *
                </label>
                <input
                  type="text"
                  name="policy_number"
                  value={formData.policy_number}
                  onChange={handleInputChange}
                  placeholder="POL-2024-001"
                  className={`input-field ${errors.policy_number ? 'border-error' : ''}`}
                />
                {errors.policy_number && (
                  <p className="text-error text-sm mt-1">{errors.policy_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Date d'expiration d'assurance *
                </label>
                <input
                  type="date"
                  name="insurance_expiry"
                  value={formData.insurance_expiry}
                  onChange={handleInputChange}
                  className={`input-field ${errors.insurance_expiry ? 'border-error' : ''}`}
                />
                {errors.insurance_expiry && (
                  <p className="text-error text-sm mt-1">{errors.insurance_expiry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Type de couverture
                </label>
                <select
                  name="insurance_coverage_type"
                  value={formData.insurance_coverage_type}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {coverageTypes.map(coverage => (
                    <option key={coverage} value={coverage}>{coverage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Date d'inspection technique
                </label>
                <input
                  type="date"
                  name="technical_inspection_date"
                  value={formData.technical_inspection_date}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Date d'expiration d'inspection
                </label>
                <input
                  type="date"
                  name="technical_inspection_expiry"
                  value={formData.technical_inspection_expiry}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Dernière maintenance
                </label>
                <input
                  type="date"
                  name="last_maintenance_date"
                  value={formData.last_maintenance_date}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Prochaine maintenance
                </label>
                <input
                  type="date"
                  name="next_maintenance_date"
                  value={formData.next_maintenance_date}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
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
              <Icon name="Plus" size={16} />
              <span>Ajouter le véhicule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;