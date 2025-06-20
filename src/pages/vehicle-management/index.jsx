import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import useApiResource from 'hooks/useApiResource';
import * as vehicleApi from 'services/api/vehicles';

import Breadcrumb from 'components/ui/Breadcrumb';
import VehicleList from './components/VehicleList';
import VehicleDetails from './components/VehicleDetails';
import AddVehicleModal from './components/AddVehicleModal';
import BulkOperationsModal from './components/BulkOperationsModal';

const API_URL = 'http://localhost:5001/api';

const VehicleManagement = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const locations = ['Dakar Centre', 'Parcelles Assainies', 'Pikine', 'Guédiawaye', 'Rufisque'];
  const deviceTypes = ['GPS', 'ADAS', 'DMS', 'Caméra'];

  const {
    data: vehicles,
    loading: isLoading,
    error,
    fetchAll,
    create: createVehicle,
    update: updateVehicle,
    remove: removeVehicle
  } = useApiResource({
    getAll: vehicleApi.getVehicles,
    create: vehicleApi.createVehicle,
    update: vehicleApi.updateVehicle,
    remove: vehicleApi.removeVehicle
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.driver?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || vehicle.location.includes(locationFilter);
    
    let matchesDevice = true;
    if (deviceFilter !== 'all') {
      const deviceKey = deviceFilter.toLowerCase().replace('é', 'e');
      matchesDevice = vehicle.devices[deviceKey]?.status === 'connected';
    }

    return matchesSearch && matchesStatus && matchesLocation && matchesDevice;
  });

  const getStatusCounts = () => {
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === 'active').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
      offline: vehicles.filter(v => v.status === 'offline').length
    };
  };

  const statusCounts = getStatusCounts();

  const handleVehicleSelect = (vehicleId) => {
    const vehicleObj = vehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicleObj);
  };

  const handleBulkSelect = (vehicleIds) => {
    setSelectedVehicles(vehicleIds);
  };

  const handleAddVehicle = (vehicleData) => {
    console.log('Adding vehicle:', vehicleData);
    setIsAddModalOpen(false);
  };

  const handleBulkOperation = (operation, data) => {
    console.log('Bulk operation:', operation, data);
    setIsBulkModalOpen(false);
    setSelectedVehicles([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-text-secondary">Chargement des véhicules...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
              Gestion des Véhicules
            </h1>
            <p className="text-text-secondary">
              Administration complète de la flotte et gestion des équipements
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-6 px-4 py-2 bg-surface border border-border rounded-base">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{statusCounts.total}</p>
                <p className="text-xs text-text-secondary">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{statusCounts.active}</p>
                <p className="text-xs text-text-secondary">Actifs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{statusCounts.maintenance}</p>
                <p className="text-xs text-text-secondary">Maintenance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-error">{statusCounts.offline}</p>
                <p className="text-xs text-text-secondary">Hors ligne</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Icon name="Plus" size={20} />
              <span>Ajouter Véhicule</span>
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Rechercher véhicules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full sm:w-64"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">Tous statuts</option>
                <option value="active">Actif</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Hors ligne</option>
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">Toutes zones</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">Tous équipements</option>
                {deviceTypes.map(device => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedVehicles.length > 0 && (
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Icon name="Settings" size={20} />
              <span>Actions groupées ({selectedVehicles.length})</span>
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Vehicle List */}
          <div className="lg:col-span-4">
            <VehicleList
              vehicles={filteredVehicles}
              selectedVehicle={selectedVehicle}
              selectedVehicles={selectedVehicles}
              onVehicleSelect={handleVehicleSelect}
              onBulkSelect={handleBulkSelect}
            />
          </div>

          {/* Vehicle Details */}
          <div className="lg:col-span-8">
            {selectedVehicle ? (
              <VehicleDetails vehicle={selectedVehicle} />
            ) : (
              <div className="card p-8 text-center">
                <Icon name="Truck" size={48} className="text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Sélectionnez un véhicule
                </h3>
                <p className="text-text-secondary">
                  Choisissez un véhicule dans la liste pour voir ses détails
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {isAddModalOpen && (
          <AddVehicleModal
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddVehicle}
          />
        )}

        {isBulkModalOpen && (
          <BulkOperationsModal
            selectedVehicles={selectedVehicles}
            vehicles={vehicles}
            onClose={() => setIsBulkModalOpen(false)}
            onSubmit={handleBulkOperation}
          />
        )}
      </div>
    </div>
  );
};

export default VehicleManagement;