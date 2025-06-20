import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from 'components/AppIcon';
import useApiResource from 'hooks/useApiResource';
import * as driverApi from 'services/api/drivers';
import * as violationApi from 'services/api/violations';
import * as telemetryApi from 'services/api/telemetry';

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
    fetchViolations();
    fetchTelemetry();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (drivers && drivers.length > 0 && !selectedDriver) {
      setSelectedDriver(drivers[0]);
    }
  }, [drivers]);

  // Violations du conducteur sélectionné pour la période (ex: ce mois)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const driverViolations = violations.filter(v => v.driver_id === selectedDriver?.id);
  const driverViolationsThisMonth = driverViolations.filter(v => new Date(v.date) >= startOfMonth);

  // Jours sécurisés consécutifs (aucune violation sur la journée)
  const violationDates = driverViolations.map(v => new Date(v.date).toDateString());
  let safeDays = 0;
  for (let d = new Date(now); d >= startOfMonth; d.setDate(d.getDate() - 1)) {
    if (!violationDates.includes(d.toDateString())) {
      safeDays++;
    } else {
      break;
    }
  }

  // Répartition des comportements (pie chart)
  const behaviorTypes = [
    { key: 'safe', label: 'Conduite Sécurisée', color: '#10B981' },
    { key: 'speeding', label: 'Excès de Vitesse', color: '#EF4444' },
    { key: 'harsh_braking', label: 'Freinage Brusque', color: '#F59E0B' },
    { key: 'harsh_acceleration', label: 'Accélération Brusque', color: '#F97316' },
    { key: 'sharp_turn', label: 'Virages Serrés', color: '#8B5CF6' },
    { key: 'fatigue', label: 'Fatigue Détectée', color: '#EC4899' }
  ];
  const totalEvents = driverViolations.length + 1; // +1 pour éviter division par zéro
  const scoringData = behaviorTypes.map(type => {
    const count = driverViolations.filter(v => v.type === type.label).length;
    return {
      name: type.label,
      value: Math.round((count / totalEvents) * 100),
      color: type.color
    };
  });
  // Ajoute la part de conduite sécurisée
  scoringData[0].value = 100 - scoringData.slice(1).reduce((sum, v) => sum + v.value, 0);

  // Timeline du score (exemple: score = 100 - 5*nb violations ce jour)
  const timelineData = [];
  for (let i = 0; i < 30; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const dayViolations = driverViolations.filter(v => new Date(v.date).toDateString() === day.toDateString());
    const score = Math.max(0, 100 - 5 * dayViolations.length);
    timelineData.unshift({ date: day.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), score, violations: dayViolations.length });
  }

  // Score global (moyenne sur 30 jours)
  const overallScore = Math.round(timelineData.reduce((sum, d) => sum + d.score, 0) / timelineData.length);

  // Met à jour les métriques du conducteur sélectionné
  useEffect(() => {
    if (selectedDriver) {
      setSelectedDriver({
        ...selectedDriver,
        overallScore,
        violations: driverViolationsThisMonth.length,
        safeDays
      });
    }
    // eslint-disable-next-line
  }, [overallScore, driverViolationsThisMonth.length, safeDays]);

  // Statistiques rapides dynamiques
  const criticalViolations = driverViolations.filter(v => (v.severity || v.gravite || '').toLowerCase() === 'critique').length;
  const totalCost = driverViolations.reduce((sum, v) => sum + (v.cost || 0), 0);

  // Amélioration : différence de score global entre ce mois et le mois précédent
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const thisMonthScores = timelineData.slice(-daysInMonth).map(d => d.score);
  const lastMonthScores = timelineData.slice(-2 * daysInMonth, -daysInMonth).map(d => d.score);
  const thisMonthAvg = thisMonthScores.length ? thisMonthScores.reduce((a, b) => a + b, 0) / thisMonthScores.length : 0;
  const lastMonthAvg = lastMonthScores.length ? lastMonthScores.reduce((a, b) => a + b, 0) / lastMonthScores.length : 0;
  const improvement = lastMonthAvg ? Math.round(((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100) : 0;

  // Génère dynamiquement les données de comparaison pour la section tendances
  const fleetScores = drivers.map(d => d.overallScore || 0);
  const fleetAvg = fleetScores.length ? Math.round(fleetScores.reduce((a, b) => a + b, 0) / fleetScores.length) : 0;
  const peerDrivers = drivers.filter(d => d.fleet_id === selectedDriver?.fleet_id && d.id !== selectedDriver?.id);
  const peerScores = peerDrivers.map(d => d.overallScore || 0);
  const peerAvg = peerScores.length ? Math.round(peerScores.reduce((a, b) => a + b, 0) / peerScores.length) : 0;
  const comparisonData = [
    { category: 'Score Global', driver: overallScore, fleet: fleetAvg, peer: peerAvg }
    // Tu peux ajouter d'autres catégories dynamiquement ici si tu veux
  ];

  // Réduction des violations : différence en % du nombre de violations entre ce mois et le mois précédent
  const lastMonthViolations = driverViolations.filter(v => {
    const date = new Date(v.date);
    return date.getMonth() === now.getMonth() - 1 && date.getFullYear() === now.getFullYear();
  });
  const reduction = lastMonthViolations.length
    ? Math.round(((driverViolationsThisMonth.length - lastMonthViolations.length) / lastMonthViolations.length) * 100)
    : 0;

  // Classement du conducteur dans la flotte (par score global)
  const sortedDrivers = [...drivers].sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
  const rank = sortedDrivers.findIndex(d => d.id === selectedDriver?.id) + 1;
  const totalDrivers = sortedDrivers.length;

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
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

  if (!selectedDriver) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-secondary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Chargement des données conducteur...</p>
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