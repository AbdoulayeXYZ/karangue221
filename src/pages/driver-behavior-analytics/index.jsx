import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from 'components/AppIcon';
import useApiResource from 'hooks/useApiResource';
import * as driverApi from 'services/api/drivers';
import * as violationApi from 'services/api/violations';
import * as telemetryApi from 'services/api/telemetry';
import * as driverAnalyticsApi from 'services/api/driverAnalytics';

import Breadcrumb from 'components/ui/Breadcrumb';
import DriverSelector from './components/DriverSelector';
import MetricCard from './components/MetricCard';
import ViolationsTable from './components/ViolationsTable';
import FilterPanel from './components/FilterPanel';

const API_URL = 'http://localhost:5001/api';

const DriverBehaviorAnalytics = () => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [selectedViolationTypes, setSelectedViolationTypes] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  
  // Analytics data states
  const [driverAnalytics, setDriverAnalytics] = useState(null);
  const [driverMetrics, setDriverMetrics] = useState(null);
  const [driverViolations, setDriverViolations] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const {
    data: driversRaw,
    loading: isLoadingDrivers,
    error: driversError,
    fetchAll: fetchDrivers,
    create: createDriver,
    update: updateDriver,
    remove: removeDriver
  } = useApiResource({
    getAll: driverApi.getDrivers,
    create: driverApi.createDriver,
    update: driverApi.updateDriver,
    remove: driverApi.removeDriver
  });

  const {
    data: violations = [],
    loading: isLoadingViolations,
    error: violationsError,
    fetchAll: fetchViolations
  } = useApiResource({
    getAll: violationApi.getViolations
  });

  const {
    data: telemetry = [],
    loading: isLoadingTelemetry,
    error: telemetryError,
    fetchAll: fetchTelemetry
  } = useApiResource({
    getAll: telemetryApi.getTelemetry
  });

  // Map API driver data to expected fields
  const drivers = (driversRaw || []).map(driver => ({
    id: driver.id,
    name: `${driver.first_name || ''} ${driver.last_name || ''}`.trim(),
    photo: '/assets/images/no_image.png',
    vehicle: driver.vehicle || 'Aucun véhicule',
    overallScore: driver.overallScore || 0,
    trend: driver.trend || 'stable',
    license: driver.license_number,
    experience: driver.experience || 'Non renseignée',
    phone: driver.phone,
    email: driver.email,
    status: driver.status,
    fleet_id: driver.fleet_id,
    created_at: driver.created_at,
    violations: 3, // à remplacer plus tard
    safeDays: 5    // à remplacer plus tard
  }));

  useEffect(() => {
    fetchDrivers();
    // No need to fetch all violations and telemetry anymore
    // We'll fetch them specifically for the selected driver
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (drivers && drivers.length > 0 && !selectedDriver) {
      // Set the first driver as selected by default
      setSelectedDriver(drivers[0]);
    }
    // eslint-disable-next-line
  }, [drivers]);
  
  // Fetch driver analytics data when a driver is selected or filters change
  useEffect(() => {
    const fetchAllDriverData = async () => {
      if (!selectedDriver?.id) return;
      
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      
      try {
        // Fetch all data in parallel
        const [analytics, metrics, violations] = await Promise.all([
          driverAnalyticsApi.getDriverAnalytics(selectedDriver.id),
          driverAnalyticsApi.getDriverMetrics(selectedDriver.id),
          driverAnalyticsApi.getDriverViolations(selectedDriver.id, dateRange) // Simplified API call
        ]);
        
        setDriverAnalytics(analytics);
        setDriverMetrics(metrics);
        
        // Filter violations based on UI selections
        let filteredViolations = violations;
        if (selectedViolationTypes.length > 0) {
          filteredViolations = filteredViolations.filter(v => 
            selectedViolationTypes.includes(v.type)
          );
        }
        if (selectedSeverity !== 'all') {
          filteredViolations = filteredViolations.filter(v => 
            v.severity.toLowerCase() === selectedSeverity.toLowerCase()
          );
        }
        setDriverViolations(filteredViolations);
        
      } catch (error) {
        console.error('Error fetching driver data:', error);
        setAnalyticsError(error.message || 'Failed to load driver analytics');
      } finally {
        setLoadingAnalytics(false);
      }
    };
    
    fetchAllDriverData();
    // eslint-disable-next-line
  }, [selectedDriver?.id, dateRange, selectedViolationTypes, selectedSeverity]);

  // Get data from the API responses rather than calculating it
  const now = new Date();
  
  // Use analytics data from the API
  const overallScore = driverAnalytics?.analytics?.overallScore || 0;
  const timelineData = driverAnalytics?.analytics?.timelineData || [];
  const scoringData = driverAnalytics?.analytics?.scoringData || [];
  
  // Get metrics from the API
  const criticalViolations = driverMetrics?.criticalViolations || 0;
  const totalCost = driverMetrics?.totalCost || 0;
  const improvement = driverMetrics?.improvement || 0;
  const reduction = driverMetrics?.reduction || 0;
  const comparisonData = driverMetrics?.comparisonData || [
    { category: 'Score Global', driver: overallScore, fleet: 0, peer: 0 }
  ];
  const rank = driverMetrics?.rank || 1;
  const totalDrivers = driverMetrics?.totalDrivers || drivers.length;
  
  // Calculate monthlyViolations count for this month - needed for some UI elements
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const driverViolationsThisMonth = driverViolations.filter(v => new Date(v.date) >= startOfMonth);

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    // The useEffect will fetch the analytics data for the new driver
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleExportReport = () => {
    // Mock export functionality
    const reportData = {
      driver: selectedDriver,
      period: dateRange,
      violations: driverViolations,
      totalCost: driverViolations.reduce((sum, v) => sum + (v.cost || 0), 0)
    };
    
    console.log('Exporting report:', reportData);
    // In real implementation, this would generate and download a PDF
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critique': return 'text-error bg-error-50';
      case 'Élevée': return 'text-error bg-error-50';
      case 'Moyenne': return 'text-warning bg-warning-50';
      case 'Faible': return 'text-success bg-success-50';
      default: return 'text-text-secondary bg-surface-secondary';
    }
  };

  const getViolationIcon = (type) => {
    switch (type) {
      case 'Excès de Vitesse': return 'Gauge';
      case 'Freinage Brusque': return 'AlertTriangle';
      case 'Accélération Brusque': return 'TrendingUp';
      case 'Virage Serré': return 'RotateCcw';
      case 'Fatigue Détectée': return 'Eye';
      default: return 'AlertCircle';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'violations', label: 'Violations', icon: 'AlertTriangle' },
    { id: 'trends', label: 'Tendances', icon: 'TrendingUp' }
  ];

  if (isLoadingDrivers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-secondary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Chargement des conducteurs...</p>
        </div>
      </div>
    );
  }
  
  if (driversError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <p className="text-text-primary font-medium mb-2">Erreur de chargement</p>
          <p className="text-text-secondary">{driversError.message}</p>
          <button className="mt-4 btn-primary" onClick={fetchDrivers}>Réessayer</button>
        </div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb />
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
              Analyse Comportementale des Conducteurs
            </h1>
            <p className="text-text-secondary">
              Évaluation des performances et suivi des violations de conduite
            </p>
          </div>
          <div className="text-center py-20 bg-surface rounded-lg border border-border">
            <Icon name="Users" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary">Aucun conducteur à analyser</h3>
            <p className="text-text-secondary mt-2">Ajoutez des conducteurs pour voir leurs statistiques ici.</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!selectedDriver || loadingAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-secondary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Chargement des données conducteur...</p>
        </div>
      </div>
    );
  }
  
  if (analyticsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <p className="text-text-primary font-medium mb-2">Erreur lors du chargement des données</p>
          <p className="text-text-secondary">{analyticsError}</p>
          <button 
            className="mt-4 btn-primary"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb />
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
                Analyse Comportementale des Conducteurs
              </h1>
              <p className="text-text-secondary">
                Évaluation des performances et suivi des violations de conduite
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportReport}
                className="btn-secondary flex items-center space-x-2"
              >
                <Icon name="Download" size={18} />
                <span>Exporter Rapport</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Driver Selection and KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Driver Selector */}
              <div className="lg:col-span-1">
                <DriverSelector
                  drivers={drivers}
                  selectedDriver={selectedDriver}
                  onDriverSelect={handleDriverSelect}
                />
              </div>

              {/* KPI Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  title="Score Global"
                  value={selectedDriver.overallScore}
                  unit="/100"
                  icon="Award"
                  trend={selectedDriver.trend}
                  color="text-secondary"
                />
                <MetricCard
                  title="Violations"
                  value={selectedDriver.violations}
                  unit="ce mois"
                  icon="AlertTriangle"
                  trend="down"
                  color="text-error"
                />
                <MetricCard
                  title="Jours Sécurisés"
                  value={selectedDriver.safeDays}
                  unit="consécutifs"
                  icon="Shield"
                  trend="up"
                  color="text-success"
                />
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="card">
              {/* Tab Navigation */}
              <div className="border-b border-border">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon name={tab.icon} size={18} />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Scoring Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
                          Répartition des Comportements
                        </h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={scoringData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {scoringData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => [`${value}%`, 'Pourcentage']}
                                labelStyle={{ color: 'var(--color-text-primary)' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {scoringData.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span className="text-sm text-text-secondary">{item.name}</span>
                              <span className="text-sm font-medium text-text-primary">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
                          Évolution du Score (30 derniers jours)
                        </h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timelineData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                              <XAxis 
                                dataKey="date" 
                                stroke="var(--color-text-secondary)"
                                fontSize={12}
                              />
                              <YAxis 
                                stroke="var(--color-text-secondary)"
                                fontSize={12}
                                domain={[0, 100]}
                              />
                              <Tooltip
                                labelStyle={{ color: 'var(--color-text-primary)' }}
                                contentStyle={{
                                  backgroundColor: 'var(--color-surface)',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '6px'
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="var(--color-secondary)" 
                                strokeWidth={3}
                                dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: 'var(--color-secondary)', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'violations' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h3 className="text-lg font-heading font-semibold text-text-primary">
                        Historique des Violations
                      </h3>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-text-secondary">
                          Total des coûts: <span className="font-medium text-error">
                            {driverViolations.reduce((sum, v) => sum + (v.cost || 0), 0).toLocaleString('fr-FR')} XOF
                          </span>
                        </div>
                      </div>
                    </div>
                    <ViolationsTable
                      violations={driverViolations}
                      getSeverityColor={getSeverityColor}
                      getViolationIcon={getViolationIcon}
                    />
                    {driverViolations.length === 0 && (
                      <div className="text-center py-8">
                        <Icon name="Check" size={48} className="text-success mx-auto mb-4" />
                        <p className="text-text-secondary">
                          Aucune violation pour les filtres sélectionnés
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'trends' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
                        Comparaison avec la Flotte
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis 
                              dataKey="category" 
                              stroke="var(--color-text-secondary)"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="var(--color-text-secondary)"
                              fontSize={12}
                            />
                            <Tooltip
                              labelStyle={{ color: 'var(--color-text-primary)' }}
                              contentStyle={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px'
                              }}
                            />
                            <Bar dataKey="driver" fill="var(--color-secondary)" name="Conducteur" />
                            <Bar dataKey="fleet" fill="var(--color-accent)" name="Moyenne Flotte" />
                            <Bar dataKey="peer" fill="var(--color-success)" name="Groupe Pairs" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="card p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                            <Icon name="TrendingUp" size={20} className="text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-text-primary">Amélioration</h4>
                            <p className="text-sm text-text-secondary">Ce mois</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-success">+{improvement}%</p>
                        <p className="text-sm text-text-secondary mt-1">Score global</p>
                      </div>

                      <div className="card p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                            <Icon name="AlertTriangle" size={20} className="text-warning" />
                          </div>
                          <div>
                            <h4 className="font-medium text-text-primary">Violations</h4>
                            <p className="text-sm text-text-secondary">Réduction</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-success">{reduction > 0 ? '-' : '+'}{Math.abs(reduction)}%</p>
                        <p className="text-sm text-text-secondary mt-1">vs mois dernier</p>
                      </div>

                      <div className="card p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                            <Icon name="Award" size={20} className="text-success" />
                          </div>
                          <div>
                            <h4 className="font-medium text-text-primary">Classement</h4>
                            <p className="text-sm text-text-secondary">Dans la flotte</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-secondary">{rank}ème </p>
                        <p className="text-sm text-text-secondary mt-1">sur {totalDrivers} conducteurs</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Filters */}
          <div className="xl:col-span-1">
            <FilterPanel
              dateRange={dateRange}
              setDateRange={setDateRange}
              selectedViolationTypes={selectedViolationTypes}
              setSelectedViolationTypes={setSelectedViolationTypes}
              selectedSeverity={selectedSeverity}
              setSelectedSeverity={setSelectedSeverity}
              criticalViolations={criticalViolations}
              improvement={improvement}
              totalCost={totalCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverBehaviorAnalytics;