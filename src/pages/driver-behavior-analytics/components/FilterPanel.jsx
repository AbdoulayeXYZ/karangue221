import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import * as driverAnalyticsApi from 'services/api/driverAnalytics';

const FilterPanel = ({ 
  dateRange, 
  setDateRange, 
  selectedViolationTypes, 
  setSelectedViolationTypes, 
  selectedSeverity, 
  setSelectedSeverity,
  criticalViolations = 0,
  improvement = 0,
  totalCost = 0
}) => {
  const dateRangeOptions = [
    { value: '7days', label: '7 derniers jours' },
    { value: '30days', label: '30 derniers jours' },
    { value: '90days', label: '3 derniers mois' },
    { value: '1year', label: 'Dernière année' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  // État pour stocker les types de violations chargés depuis l'API
  const [violationTypes, setViolationTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState(null);
  
  // Charger les types de violations depuis l'API
  useEffect(() => {
    const fetchViolationTypes = async () => {
      try {
        setLoadingTypes(true);
        setErrorTypes(null);
        const types = await driverAnalyticsApi.getViolationTypes();
        setViolationTypes(types);
      } catch (error) {
        console.error('Erreur lors du chargement des types de violations:', error);
        setErrorTypes(error.message || 'Impossible de charger les types de violations');
        // Fallback to default types if API fails
        setViolationTypes([
          { value: 'speeding', label: 'Excès de vitesse', icon: 'Gauge' },
          { value: 'harsh_braking', label: 'Freinage brusque', icon: 'AlertTriangle' },
          { value: 'harsh_acceleration', label: 'Accélération brusque', icon: 'TrendingUp' },
          { value: 'sharp_cornering', label: 'Virages serrés', icon: 'RotateCcw' },
          { value: 'fatigue', label: 'Fatigue détectée', icon: 'Eye' },
          { value: 'distraction', label: 'Distraction', icon: 'Smartphone' }
        ]);
      } finally {
        setLoadingTypes(false);
      }
    };
    
    fetchViolationTypes();
  }, []);

  const severityLevels = [
    { value: 'all', label: 'Toutes les gravités' },
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Élevée' },
    { value: 'critical', label: 'Critique' }
  ];

  const handleViolationTypeToggle = (type) => {
    setSelectedViolationTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setDateRange('30days');
    setSelectedViolationTypes([]);
    setSelectedSeverity('all');
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-text-primary">
            Filtres
          </h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-secondary hover:text-secondary-700 transition-colors duration-150"
          >
            Réinitialiser
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Période
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  className="input-field"
                  defaultValue="2024-11-01"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  className="input-field"
                  defaultValue="2024-12-12"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Violation Types Filter */}
      <div className="card p-6">
        <h4 className="font-medium text-text-primary mb-4">Types de Violations</h4>
        <div className="space-y-3">
          {loadingTypes ? (
            <div className="flex items-center justify-center py-4">
              <Icon name="Loader2" size={24} className="text-secondary animate-spin" />
              <span className="ml-2 text-sm text-text-secondary">Chargement des types...</span>
            </div>
          ) : errorTypes ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <Icon name="AlertCircle" size={24} className="text-error mb-2" />
              <p className="text-sm text-text-secondary mb-2">{errorTypes}</p>
              <button 
                onClick={() => {
                  setLoadingTypes(true);
                  driverAnalyticsApi.getViolationTypes()
                    .then(types => {
                      setViolationTypes(types);
                      setErrorTypes(null);
                    })
                    .catch(err => setErrorTypes(err.message))
                    .finally(() => setLoadingTypes(false));
                }}
                className="text-sm text-secondary hover:underline"
              >
                Réessayer
              </button>
            </div>
          ) : violationTypes.length === 0 ? (
            <p className="text-sm text-text-secondary py-2">Aucun type de violation disponible</p>
          ) : (
            violationTypes.map((type) => (
              <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedViolationTypes.includes(type.value)}
                  onChange={() => handleViolationTypeToggle(type.value)}
                  className="w-4 h-4 text-secondary border-border rounded focus:ring-2 focus:ring-secondary-500"
                />
                <Icon name={type.icon} size={16} className="text-text-secondary" />
                <span className="text-sm text-text-primary">{type.label}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Severity Filter */}
      <div className="card p-6">
        <h4 className="font-medium text-text-primary mb-4">Niveau de Gravité</h4>
        <div className="space-y-2">
          {severityLevels.map((level) => (
            <label key={level.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="severity"
                value={level.value}
                checked={selectedSeverity === level.value}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-4 h-4 text-secondary border-border focus:ring-2 focus:ring-secondary-500"
              />
              <span className="text-sm text-text-primary">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card p-6">
        <h4 className="font-medium text-text-primary mb-4">Statistiques Rapides</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} className="text-error" />
              <span className="text-sm text-text-secondary">Violations Critiques</span>
            </div>
            <span className="text-sm font-medium text-error">{criticalViolations}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={16} className="text-success" />
              <span className="text-sm text-text-secondary">Amélioration</span>
            </div>
            <span className="text-sm font-medium text-success">{improvement > 0 ? '+' : ''}{improvement}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="DollarSign" size={16} className="text-warning" />
              <span className="text-sm text-text-secondary">Coût Total</span>
            </div>
            <span className="text-sm font-medium text-warning font-data">{totalCost.toLocaleString('fr-FR')} XOF</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card p-6">
        <h4 className="font-medium text-text-primary mb-4">Export</h4>
        <div className="space-y-3">
          <button 
            onClick={() => {
              const driverId = document.location.pathname.split('/').pop();
              if (!driverId) return;
              
              driverAnalyticsApi.exportPDFReport(driverId)
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.style.display = 'none';
                  a.href = url;
                  a.download = `rapport_conducteur_${driverId}_${new Date().toISOString().split('T')[0]}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                  console.error('Erreur lors de l\'export PDF:', error);
                  alert('Erreur lors de la génération du rapport PDF');
                });
            }}
            className="w-full flex items-center space-x-2 p-3 text-left text-sm text-text-primary hover:bg-surface-secondary rounded-base transition-colors duration-150"
          >
            <Icon name="FileText" size={16} className="text-text-secondary" />
            <span>Rapport PDF</span>
          </button>
          <button 
            onClick={() => {
              const driverId = document.location.pathname.split('/').pop();
              if (!driverId) return;
              
              driverAnalyticsApi.exportCSVData(driverId)
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.style.display = 'none';
                  a.href = url;
                  a.download = `violations_conducteur_${driverId}_${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                  console.error('Erreur lors de l\'export CSV:', error);
                  alert('Erreur lors de l\'export des données CSV');
                });
            }}
            className="w-full flex items-center space-x-2 p-3 text-left text-sm text-text-primary hover:bg-surface-secondary rounded-base transition-colors duration-150"
          >
            <Icon name="Download" size={16} className="text-text-secondary" />
            <span>Données CSV</span>
          </button>
          <button 
            onClick={() => {
              const driverId = document.location.pathname.split('/').pop();
              if (!driverId) return;
              
              const email = prompt('Entrez l\'adresse email pour recevoir le rapport:');
              if (!email) return;
              
              // Validation simple de l'email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(email)) {
                alert('Adresse email invalide');
                return;
              }
              
              driverAnalyticsApi.emailReport(driverId, email)
                .then(response => {
                  alert(`Rapport envoyé avec succès à ${email}`);
                })
                .catch(error => {
                  console.error('Erreur lors de l\'envoi du rapport par email:', error);
                  alert('Erreur lors de l\'envoi du rapport par email');
                });
            }}
            className="w-full flex items-center space-x-2 p-3 text-left text-sm text-text-primary hover:bg-surface-secondary rounded-base transition-colors duration-150"
          >
            <Icon name="Mail" size={16} className="text-text-secondary" />
            <span>Envoyer par Email</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;