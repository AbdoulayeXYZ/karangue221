import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const AddVehicleModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'Minibus',
    vin: '',
    engine: '',
    fuelType: 'Diesel',
    capacity: '',
    insuranceProvider: '',
    policyNumber: '',
    insuranceExpiry: '',
    coverage: 'Tous risques'
  });

  const [errors, setErrors] = useState({});

  const vehicleTypes = ['Minibus', 'Bus', 'Camion', 'Utilitaire', 'Berline'];
  const fuelTypes = ['Diesel', 'Essence', 'Hybride', 'Électrique'];
  const coverageTypes = ['Tous risques', 'Responsabilité civile', 'Vol et incendie'];

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

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'La plaque d\'immatriculation est requise';
    }
    if (!formData.make.trim()) {
      newErrors.make = 'La marque est requise';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Le modèle est requis';
    }
    if (!formData.vin.trim()) {
      newErrors.vin = 'Le numéro VIN est requis';
    }
    if (!formData.capacity.trim()) {
      newErrors.capacity = 'La capacité est requise';
    }
    if (!formData.insuranceProvider.trim()) {
      newErrors.insuranceProvider = 'L\'assureur est requis';
    }
    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = 'Le numéro de police est requis';
    }
    if (!formData.insuranceExpiry) {
      newErrors.insuranceExpiry = 'La date d\'expiration est requise';
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
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="DK-2024-XX"
                  className={`input-field ${errors.licensePlate ? 'border-error' : ''}`}
                />
                {errors.licensePlate && (
                  <p className="text-error text-sm mt-1">{errors.licensePlate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Marque *
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  placeholder="Mercedes-Benz"
                  className={`input-field ${errors.make ? 'border-error' : ''}`}
                />
                {errors.make && (
                  <p className="text-error text-sm mt-1">{errors.make}</p>
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
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="16 passagers"
                  className={`input-field ${errors.capacity ? 'border-error' : ''}`}
                />
                {errors.capacity && (
                  <p className="text-error text-sm mt-1">{errors.capacity}</p>
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
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  placeholder="WDB9066331R123456"
                  className={`input-field ${errors.vin ? 'border-error' : ''}`}
                />
                {errors.vin && (
                  <p className="text-error text-sm mt-1">{errors.vin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Moteur
                </label>
                <input
                  type="text"
                  name="engine"
                  value={formData.engine}
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
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {fuelTypes.map(fuel => (
                    <option key={fuel} value={fuel}>{fuel}</option>
                  ))}
                </select>
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
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleInputChange}
                  placeholder="NSIA Assurances"
                  className={`input-field ${errors.insuranceProvider ? 'border-error' : ''}`}
                />
                {errors.insuranceProvider && (
                  <p className="text-error text-sm mt-1">{errors.insuranceProvider}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Numéro de police *
                </label>
                <input
                  type="text"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleInputChange}
                  placeholder="POL-2024-001"
                  className={`input-field ${errors.policyNumber ? 'border-error' : ''}`}
                />
                {errors.policyNumber && (
                  <p className="text-error text-sm mt-1">{errors.policyNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Date d'expiration *
                </label>
                <input
                  type="date"
                  name="insuranceExpiry"
                  value={formData.insuranceExpiry}
                  onChange={handleInputChange}
                  className={`input-field ${errors.insuranceExpiry ? 'border-error' : ''}`}
                />
                {errors.insuranceExpiry && (
                  <p className="text-error text-sm mt-1">{errors.insuranceExpiry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Type de couverture
                </label>
                <select
                  name="coverage"
                  value={formData.coverage}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {coverageTypes.map(coverage => (
                    <option key={coverage} value={coverage}>{coverage}</option>
                  ))}
                </select>
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