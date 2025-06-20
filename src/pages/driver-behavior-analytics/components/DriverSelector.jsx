import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const DriverSelector = ({ drivers, selectedDriver, onDriverSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDriverSelect = (driver) => {
    onDriverSelect(driver);
    setIsOpen(false);
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-success' : 'text-error';
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
        Sélection Conducteur
      </h3>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 border border-border rounded-base hover:border-secondary transition-colors duration-150 bg-surface"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 flex-shrink-0">
              <Image
                src={selectedDriver.photo}
                alt={selectedDriver.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-text-primary">{selectedDriver.name}</p>
              <p className="text-sm text-text-secondary">{selectedDriver.vehicle}</p>
            </div>
            <Icon 
              name="ChevronDown" 
              size={20} 
              className={`text-text-secondary transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-base shadow-elevation-3 z-50 max-h-64 overflow-y-auto">
            {drivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => handleDriverSelect(driver)}
                className={`w-full p-4 text-left hover:bg-surface-secondary transition-colors duration-150 border-b border-border-light last:border-b-0 ${
                  selectedDriver.id === driver.id ? 'bg-secondary-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex-shrink-0">
                    <Image
                      src={driver.photo}
                      alt={driver.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{driver.name}</p>
                    <p className="text-sm text-text-secondary">{driver.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-text-primary">{driver.overallScore}</span>
                      <Icon 
                        name={getTrendIcon(driver.trend)} 
                        size={14} 
                        className={getTrendColor(driver.trend)}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Driver Details */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-border-light">
          <span className="text-sm text-text-secondary">Permis de Conduire</span>
          <span className="text-sm font-medium text-text-primary font-data">{selectedDriver.license}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border-light">
          <span className="text-sm text-text-secondary">Expérience</span>
          <span className="text-sm font-medium text-text-primary">{selectedDriver.experience}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border-light">
          <span className="text-sm text-text-secondary">Téléphone</span>
          <span className="text-sm font-medium text-text-primary font-data">{selectedDriver.phone}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-text-secondary">Véhicule Assigné</span>
          <span className="text-sm font-medium text-text-primary">{selectedDriver.vehicle}</span>
        </div>
      </div>
    </div>
  );
};

export default DriverSelector;