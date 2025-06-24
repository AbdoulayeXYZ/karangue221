// Composant de sélection de tenant pour Karangué221
import React, { useState, useEffect } from 'react';
import { Building2, Globe, Users, Settings, Check, AlertCircle } from 'lucide-react';
import tenantService from '../services/tenant';
import { apiRequest } from '../services/auth';

const TenantSelector = ({ onTenantChange, showDetails = false }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeTenant();
  }, []);

  const initializeTenant = async () => {
    try {
      setIsLoading(true);
      
      // Obtenir le tenant actuel
      const tenant = tenantService.getCurrentTenant();
      if (tenant) {
        setCurrentTenant(tenant);
        
        // Valider le tenant avec le backend
        try {
          const validatedTenant = await tenantService.validateTenant();
          setCurrentTenant(prev => ({ ...prev, ...validatedTenant }));
        } catch (validationError) {
          console.warn('Erreur de validation tenant:', validationError);
          setError('Tenant non valide');
        }
      }

      // Charger les tenants disponibles pour les administrateurs
      try {
        const tenants = await tenantService.getAvailableTenants();
        setAvailableTenants(tenants);
      } catch (tenantsError) {
        console.warn('Impossible de charger les tenants disponibles:', tenantsError);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du tenant:', error);
      setError('Erreur d\'initialisation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantChange = async (tenantId, tenantSubdomain) => {
    try {
      setIsLoading(true);
      setError(null);

      // Mettre à jour le tenant local
      if (tenantId) {
        tenantService.setTenant('id', tenantId);
      } else if (tenantSubdomain) {
        tenantService.setTenant('subdomain', tenantSubdomain);
      }

      // Valider le nouveau tenant
      const validatedTenant = await tenantService.validateTenant();
      setCurrentTenant(tenantService.getCurrentTenant());
      
      // Notifier le parent du changement
      if (onTenantChange) {
        onTenantChange(validatedTenant);
      }
      
      setShowSelector(false);
      
      // Optionnel: Recharger la page pour appliquer le nouveau contexte tenant
      window.location.reload();
      
    } catch (error) {
      console.error('Erreur lors du changement de tenant:', error);
      setError('Impossible de changer de tenant');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToTenant = (subdomain) => {
    const url = tenantService.generateTenantUrl(subdomain);
    window.location.href = url;
  };

  if (isLoading && !currentTenant) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm">Chargement tenant...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Aucun tenant configuré</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Affichage du tenant actuel */}
      <div 
        className={`flex items-center space-x-2 p-2 rounded-lg bg-white border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors ${showDetails ? 'min-w-64' : ''}`}
        onClick={() => availableTenants.length > 1 && setShowSelector(!showSelector)}
      >
        <Building2 className="h-5 w-5 text-blue-600" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {currentTenant.name || currentTenant.identifier}
          </div>
          {showDetails && (
            <div className="text-xs text-gray-500 truncate">
              {currentTenant.identifier}
              {currentTenant.type === 'subdomain' && (
                <>
                  <Globe className="inline h-3 w-3 ml-1" />
                  {currentTenant.identifier}.karangue221.com
                </>
              )}
            </div>
          )}
        </div>
        
        {availableTenants.length > 1 && (
          <Settings className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Sélecteur de tenant */}
      {showSelector && availableTenants.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Changer de tenant</h3>
            <p className="text-xs text-gray-500 mt-1">
              Sélectionnez un tenant pour accéder à ses données
            </p>
          </div>
          
          <div className="py-2">
            {availableTenants.map((tenant) => (
              <button
                key={tenant.id}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                onClick={() => handleTenantChange(tenant.id)}
                disabled={isLoading}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900 truncate">
                        {tenant.name}
                      </span>
                      {currentTenant.identifier === tenant.subdomain && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-6">
                      <Globe className="inline h-3 w-3 mr-1" />
                      {tenant.subdomain}.karangue221.com
                    </div>
                    {tenant.total_users && (
                      <div className="text-xs text-gray-400 mt-1 ml-6 flex items-center space-x-3">
                        <span>
                          <Users className="inline h-3 w-3 mr-1" />
                          {tenant.total_users} utilisateurs
                        </span>
                        <span>Plan: {tenant.plan}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => setShowSelector(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant d'information tenant simplifié pour les headers
export const TenantInfo = () => {
  const [currentTenant, setCurrentTenant] = useState(null);

  useEffect(() => {
    const tenant = tenantService.getCurrentTenant();
    setCurrentTenant(tenant);
  }, []);

  if (!currentTenant) return null;

  return (
    <div className="flex items-center space-x-1 text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
      <Building2 className="h-3 w-3" />
      <span className="font-medium">
        {currentTenant.name || currentTenant.identifier}
      </span>
    </div>
  );
};

// Hook pour utiliser le tenant actuel
export const useTenant = () => {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTenant = async () => {
      try {
        const currentTenant = tenantService.getCurrentTenant();
        setTenant(currentTenant);
        
        if (currentTenant) {
          // Optionnel: valider avec le backend
          try {
            await tenantService.validateTenant();
          } catch (error) {
            console.warn('Tenant validation failed:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing tenant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initTenant();
  }, []);

  const changeTenant = (type, identifier) => {
    tenantService.setTenant(type, identifier);
    setTenant(tenantService.getCurrentTenant());
  };

  const clearTenant = () => {
    tenantService.clearTenant();
    setTenant(null);
  };

  return {
    tenant,
    isLoading,
    changeTenant,
    clearTenant,
    hasTenant: tenantService.hasTenant()
  };
};

export default TenantSelector;
