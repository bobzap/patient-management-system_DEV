// src/components/dashboard/Dashboard.tsx - Version modernisée avec bulles d'info
'use client';

import { useState, useEffect, useMemo } from 'react';
import { safeParseResponse, safeJsonParse } from '@/utils/json';
import { 
  BarChart3, Users, Clock, FileText, CheckCircle,
  AlertCircle, Filter, Download, RefreshCw, X, 
  AlertTriangle, Activity, TrendingUp, Calendar,
  Stethoscope, Shield, Target, ArrowRight, Plus,
  Settings, ExternalLink, Info, PlayCircle
} from 'lucide-react';

// Import des composants
import { StatCard } from './StatCard';
import { PieChart } from './PieChart';
import { BarChart } from './BarChart';
import { analyzeEntretiensData } from '@/services/dashboard-analysis';

// Types - Ajout du type NavigationTab
type NavigationTab = 'dashboard' | 'patients' | 'newDossier' | 'admin' | 'userManagement' | 'calendar';

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  civilites: string;
  departement: string;
}

interface DashboardProps {
  patients: {
    data: Patient[];
  };
  onNavigate?: (tab: NavigationTab) => void; // Fonction de navigation typée
}

interface TooltipInfo {
  type: string;
  data: any[];
  position: { top: number; left: number };
}

export const Dashboard = ({ patients, onNavigate }: DashboardProps) => {
  // États pour les données
  const [entretiens, setEntretiens] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // État pour les filtres
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // États pour les tooltips
  const [activeTooltip, setActiveTooltip] = useState<TooltipInfo | null>(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  
  // Chargement des données
  useEffect(() => {
    const fetchAllEntretiens = async () => {
      setIsLoading(true);
      try {
        console.log("Début du chargement des entretiens");
        const allEntretiens: any[] = [];
        
        for (const patient of patients.data) {
          try {
            console.log(`Chargement des entretiens pour le patient ${patient.id}`);
            const response = await fetch(`/api/patients/${patient.id}/entretiens`);
            
            // Vérifier si c'est une redirection d'authentification
            if (response.status === 404 || response.url.includes('/auth/')) {
              console.warn(`Session expirée lors du chargement des entretiens pour patient ${patient.id}`);
              continue; // Passer au patient suivant
            }
            
            const parseResult = await safeParseResponse(response);
            
            if (!parseResult.success) {
              console.error(`Erreur parsing entretiens patient ${patient.id}:`, parseResult.error);
              continue; // Passer au patient suivant
            }
            
            const result = parseResult.data;
            
            if (result.success && result.data && result.data.length > 0) {
              const entretiensWithPatient = result.data.map((entretien: any) => ({
                ...entretien,
                patient
              }));
              
              for (const entretien of entretiensWithPatient) {
                try {
                  const detailResponse = await fetch(`/api/entretiens/${entretien.id}`);
                  
                  // Vérifier si c'est une redirection d'authentification
                  if (detailResponse.status === 404 || detailResponse.url.includes('/auth/')) {
                    console.warn(`Session expirée lors du chargement de l'entretien ${entretien.id}`);
                    continue; // Passer à l'entretien suivant
                  }
                  
                  const detailParseResult = await safeParseResponse(detailResponse);
                  
                  if (!detailParseResult.success) {
                    console.error(`Erreur parsing entretien ${entretien.id}:`, detailParseResult.error);
                    continue; // Passer à l'entretien suivant
                  }
                  
                  const detailResult = detailParseResult.data;
                  
                  if (detailResult.success && detailResult.data) {
                    if (typeof detailResult.data.donneesEntretien === 'string') {
                      const jsonParseResult = safeJsonParse(detailResult.data.donneesEntretien);
                      if (jsonParseResult.success) {
                        entretien.donneesObject = jsonParseResult.data;
                      } else {
                        console.warn(`Erreur de parsing des données pour l'entretien ${entretien.id}:`, jsonParseResult.error);
                      }
                    } else if (detailResult.data.donneesEntretien) {
                      entretien.donneesObject = detailResult.data.donneesEntretien;
                    }
                    
                    entretien.tempsDebut = detailResult.data.tempsDebut;
                    entretien.tempsFin = detailResult.data.tempsFin;
                    entretien.tempsPause = detailResult.data.tempsPause;
                    entretien.enPause = detailResult.data.enPause;
                    entretien.dernierePause = detailResult.data.dernierePause;
                  }
                } catch (error) {
                  console.error(`Erreur lors du chargement des détails de l'entretien ${entretien.id}:`, error);
                }
              }
              
              allEntretiens.push(...entretiensWithPatient);
            }
          } catch (error) {
            console.error(`Erreur pour patient ${patient.id}:`, error);
          }
        }
        
        setEntretiens(allEntretiens);
        
        try {
          const metricsData = await analyzeEntretiensData(allEntretiens, patients.data);
          setDashboardData(metricsData);
        } catch (analyzeError) {
          console.error("Erreur lors de l'analyse des données:", analyzeError);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllEntretiens();
  }, [patients.data, refreshTrigger]);

  // Calcul des entretiens en cours
  const entretiensEnCours = useMemo(() => {
    if (!entretiens) return [];
    
    return entretiens.filter(entretien => 
      entretien.status === 'brouillon' && 
      entretien.tempsDebut && 
      !entretien.tempsFin
    );
  }, [entretiens]);
  
  // Données filtrées
  const filteredData = useMemo(() => {
    if (!dashboardData) return null;
    
    if (selectedTimeRange === 'all' && !departmentFilter && !statusFilter) {
      return dashboardData;
    }
    
    const filtered = { ...dashboardData };
    let filteredEntretiens = [...entretiens];
    
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      if (selectedTimeRange === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (selectedTimeRange === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      }
      
      filteredEntretiens = filteredEntretiens.filter(entretien => {
        const entretienDate = new Date(entretien.dateCreation);
        return entretienDate >= cutoffDate;
      });
    }
    
    if (departmentFilter) {
      filteredEntretiens = filteredEntretiens.filter(entretien => 
        entretien.patient && entretien.patient.departement === departmentFilter
      );
    }
    
    if (statusFilter) {
      filteredEntretiens = filteredEntretiens.filter(entretien => 
        entretien.status === statusFilter
      );
    }
    
    if (filteredEntretiens.length !== entretiens.length) {
      filtered.totalEntretiens = filteredEntretiens.length;
      
      filtered.entretiensByStatus = {
        brouillon: 0,
        finalise: 0,
        archive: 0
      };
      
      for (const entretien of filteredEntretiens) {
        filtered.entretiensByStatus[entretien.status]++;
      }
      
      filtered.recentsEntretiens = filteredEntretiens
        .slice()
        .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
        .slice(0, 5);
    }
    
    return filtered;
  }, [dashboardData, entretiens, selectedTimeRange, departmentFilter, statusFilter]);
  
  // Liste des départements
  const uniqueDepartments = useMemo(() => {
    if (!patients.data) return [];
    
    const departments = Array.from(new Set(patients.data.map(p => p.departement)))
      .filter(Boolean)
      .sort();
      
    return departments;
  }, [patients.data]);
  
  // Réinitialiser filtres
  const resetFilters = () => {
    setSelectedTimeRange('all');
    setDepartmentFilter('');
    setStatusFilter('');
  };
  
  // Données pour visualisations
  const typesVisitesData = useMemo(() => {
    if (!filteredData || !filteredData.typesVisites) return [];
    
    return Object.entries(filteredData.typesVisites).map(([name, value]) => ({
      name,
      value: value as number
    }));
  }, [filteredData]);
  
  const activiteParMoisData = useMemo(() => {
    if (!filteredData || !filteredData.activiteParMois) return [];
    
    return filteredData.activiteParMois;
  }, [filteredData]);
  
  // Actualiser les données
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Navigation functions - Compatible avec la sidebar existante
  const navigateToPatients = () => {
    if (onNavigate) {
      onNavigate('patients');
    } else {
      console.warn('Navigation function not provided to Dashboard component');
    }
  };

  const navigateToNewDossier = () => {
    if (onNavigate) {
      onNavigate('newDossier');
    } else {
      console.warn('Navigation function not provided to Dashboard component');
    }
  };

  const navigateToCalendar = () => {
    if (onNavigate) {
      onNavigate('calendar');
    } else {
      console.warn('Navigation function not provided to Dashboard component');
    }
  };

  const navigateToAdmin = () => {
    if (onNavigate) {
      onNavigate('admin');
    } else {
      console.warn('Navigation function not provided to Dashboard component');
    }
  };

  // Gestion des tooltips
  const handleTooltipShow = (event: React.MouseEvent, type: string, data: any[]) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveTooltip({
      type,
      data,
      position: {
        top: rect.top + window.scrollY - 10,
        left: rect.right + 15
      }
    });
    setIsButtonHovered(true);
  };

  const handleTooltipHide = () => {
    setIsButtonHovered(false);
  };

  // Fermeture automatique du tooltip
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isTooltipHovered && !isButtonHovered && activeTooltip) {
      timeoutId = setTimeout(() => {
        setActiveTooltip(null);
      }, 300);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isTooltipHovered, isButtonHovered, activeTooltip]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* En-tête ultra-moderne */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-1">
              <h1 className="text-4xl font-light text-slate-900 tracking-tight">Tableau de bord</h1>
              <p className="text-lg text-slate-500 font-light">Vue d'ensemble • Santé au travail</p>
            </div>
            
            {/* Contrôles flottants */}
            <div className="flex items-end space-x-4">
              {/* Sélecteur de période ultra-moderne */}
              <div className="relative">
                <div className="flex items-center bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-1 shadow-lg">
                  {[
                    { key: 'week' as const, label: '7j' },
                    { key: 'month' as const, label: '30j' },
                    { key: 'all' as const, label: 'Tout' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTimeRange(key)}
                      className={`relative px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedTimeRange === key
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Actions flottantes */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg ${
                      showFilters || departmentFilter || statusFilter
                        ? 'bg-blue-500/20 border-blue-400/40 text-blue-600' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Filter className="h-5 w-5" />
                  </button>
                  
                  {showFilters && (
                    <div className="absolute z-50 right-0 mt-4 w-80 bg-white/90 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Filtres avancés</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">Département</label>
                          <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                          >
                            <option value="">Tous les départements</option>
                            {uniqueDepartments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">Statut</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                          >
                            <option value="">Tous les statuts</option>
                            <option value="brouillon">Brouillon</option>
                            <option value="finalise">Finalisé</option>
                            <option value="archive">Archivé</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-6">
                        <button 
                          onClick={resetFilters}
                          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          Réinitialiser
                        </button>
                        <button 
                          onClick={() => setShowFilters(false)}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                        >
                          Appliquer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={refreshData}
                  className="p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 text-slate-600 hover:text-slate-900 shadow-lg"
                  title="Actualiser"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                
                <button className="p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 text-slate-600 hover:text-slate-900 shadow-lg">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Indicateurs de filtres actifs */}
        {(departmentFilter || statusFilter || selectedTimeRange !== 'all') && (
          <div className="flex flex-wrap gap-3">
            {selectedTimeRange !== 'all' && (
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 backdrop-blur-sm text-blue-700 rounded-xl text-sm border border-blue-200/50">
                Période: {selectedTimeRange === 'week' ? '7 jours' : '30 jours'}
                <button 
                  onClick={() => setSelectedTimeRange('all')}
                  className="ml-3 p-1 hover:bg-blue-500/20 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {departmentFilter && (
              <div className="inline-flex items-center px-4 py-2 bg-indigo-500/10 backdrop-blur-sm text-indigo-700 rounded-xl text-sm border border-indigo-200/50">
                {departmentFilter}
                <button 
                  onClick={() => setDepartmentFilter('')}
                  className="ml-3 p-1 hover:bg-indigo-500/20 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {statusFilter && (
              <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 backdrop-blur-sm text-purple-700 rounded-xl text-sm border border-purple-200/50">
                {statusFilter === 'finalise' ? 'Finalisé' : 
                 statusFilter === 'archive' ? 'Archivé' : 'Brouillon'}
                <button 
                  onClick={() => setStatusFilter('')}
                  className="ml-3 p-1 hover:bg-purple-500/20 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            <button 
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 bg-slate-500/10 backdrop-blur-sm text-slate-700 rounded-xl text-sm border border-slate-200/50 hover:bg-slate-500/20 transition-colors"
            >
              Tout réinitialiser
            </button>
          </div>
        )}

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total entretiens */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">Total entretiens</p>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-slate-200/50 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-light text-slate-900">{filteredData?.totalEntretiens || 0}</p>
                  )}
                  <p className="text-xs text-slate-500">{patients.data.length} employés actifs</p>
                </div>
                <div className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Heures d'entretien */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">Heures d'entretien</p>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-slate-200/50 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-light text-slate-900">{filteredData?.totalHeures || 0}h</p>
                  )}
                  <p className="text-xs text-slate-500">{filteredData?.tendances?.tempsMoyenEntretien || 0} min/entretien</p>
                </div>
                <div className="p-3 bg-emerald-500/20 backdrop-blur-sm rounded-xl">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Entretiens en cours - MODIFIÉ */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-slate-900">Entretiens en cours</p>
                    {entretiensEnCours.length > 0 && (
                      <button
                        onMouseEnter={(e) => handleTooltipShow(e, 'entretiensEnCours', entretiensEnCours)}
                        onMouseLeave={handleTooltipHide}
                        className="p-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
                      >
                        <Info className="h-3 w-3 text-amber-600" />
                      </button>
                    )}
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-slate-200/50 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-light text-slate-900">{entretiensEnCours.length}</p>
                  )}
                  <p className="text-xs text-slate-500">En cours de réalisation</p>
                </div>
                <div className="p-3 bg-amber-500/20 backdrop-blur-sm rounded-xl">
                  <PlayCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Alertes actives */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">Alertes actives</p>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-slate-200/50 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-light text-slate-900">{filteredData?.detectionPrecoce?.risqueEleve || 0}</p>
                  )}
                  <p className="text-xs text-slate-500">Nécessitent un suivi</p>
                </div>
                <div className="p-3 bg-rose-500/20 backdrop-blur-sm rounded-xl">
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-xl">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-light text-slate-900">Actions rapides</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={navigateToPatients}
                className="group relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-xl group-hover:bg-blue-500/30 transition-colors">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Dossiers employés</h3>
                  <p className="text-sm text-slate-600">Consulter et gérer les dossiers</p>
                </div>
              </button>
              
              <button
                onClick={navigateToNewDossier}
                className="group relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-500/20 backdrop-blur-sm rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                      <Plus className="h-6 w-6 text-emerald-600" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Nouveau dossier</h3>
                  <p className="text-sm text-slate-600">Créer un nouvel employé</p>
                </div>
              </button>
              
              <button
                onClick={navigateToCalendar}
                className="group relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-500/20 backdrop-blur-sm rounded-xl group-hover:bg-purple-500/30 transition-colors">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Calendrier</h3>
                  <p className="text-sm text-slate-600">Planifier les visites</p>
                </div>
              </button>
              
              <button
                onClick={navigateToAdmin}
                className="group relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-gray-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-500/20 backdrop-blur-sm rounded-xl group-hover:bg-slate-500/30 transition-colors">
                      <Settings className="h-6 w-6 text-slate-600" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Administration</h3>
                  <p className="text-sm text-slate-600">Configuration système</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Types de visites */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-xl">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-light text-slate-900">Répartition des visites</h3>
              </div>
              
              {typesVisitesData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  <div className="text-center">
                    <div className="p-4 bg-slate-100/50 backdrop-blur-sm rounded-2xl mb-4">
                      <BarChart3 className="h-12 w-12 text-slate-400 mx-auto" />
                    </div>
                    <p className="font-medium">Aucune visite enregistrée</p>
                  </div>
                </div>
              ) : (
                <PieChart
                  data={typesVisitesData}
                  title=""
                  colors={['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']}
                  height={280}
                  emptyText="Aucune visite enregistrée"
                />
              )}
            </div>
          </div>
          
          {/* Risques professionnels */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-600/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-rose-500/20 backdrop-blur-sm rounded-xl">
                  <Shield className="h-5 w-5 text-rose-600" />
                </div>
                <h3 className="text-xl font-light text-slate-900">Risques identifiés</h3>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-32 bg-slate-200/50 rounded animate-pulse"></div>
                        <div className="h-4 w-12 bg-slate-200/50 rounded animate-pulse"></div>
                      </div>
                      <div className="h-2 w-full bg-slate-200/50 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : filteredData?.risquesProfessionnels?.length > 0 ? (
                <div className="space-y-4">
                  {filteredData.risquesProfessionnels.slice(0, 6).map((risque: any, index: number) => {
                    const percentage = filteredData.totalEntretiens > 0 
                      ? Math.round((risque.count / filteredData.totalEntretiens) * 100) 
                      : 0;
                    
                    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
                    const colorClass = colors[index % colors.length];
                    
                    return (
                      <div key={index} className="space-y-3 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-800 text-sm">{risque.nom}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-slate-700">{risque.count}</span>
                            <span className="text-xs text-slate-500 bg-slate-100/60 px-2 py-1 rounded-full">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full h-3 bg-slate-200/60 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${colorClass} rounded-full transition-all duration-700 ease-out shadow-sm`}
                              style={{ 
                                width: `${percentage}%`,
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  <div className="text-center">
                    <div className="p-4 bg-slate-100/50 backdrop-blur-sm rounded-2xl mb-4">
                      <Shield className="h-12 w-12 text-slate-400 mx-auto" />
                    </div>
                    <p className="font-medium">Aucun risque identifié</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Santé au travail avec bulles d'info */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-emerald-500/20 backdrop-blur-sm rounded-xl">
                <Stethoscope className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-light text-slate-900">Indicateurs santé</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Visites planifiées */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 hover:bg-white/60 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-xl">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      {filteredData?.visiteMedicalePlanifiee > 0 && (
                        <button
                          onMouseEnter={(e) => handleTooltipShow(e, 'visitesPlanifiees', filteredData?.visitesPlanifiees || [])}
                          onMouseLeave={handleTooltipHide}
                          className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                        >
                          <Info className="h-3 w-3 text-blue-600" />
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-light text-slate-900">{filteredData?.visiteMedicalePlanifiee || 0}</p>
                      <p className="text-xs text-slate-500">à planifier</p>
                    </div>
                  </div>
                  <h4 className="font-medium text-slate-800">Visites médicales</h4>
                  <p className="text-sm text-slate-600 mt-1">Planification requise</p>
                </div>
              </div>

              {/* Limitations actives */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 hover:bg-white/60 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-3 bg-amber-500/20 backdrop-blur-sm rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                      </div>
                      {filteredData?.limitationsActives > 0 && (
                        <button
                          onMouseEnter={(e) => handleTooltipShow(e, 'limitations', filteredData?.limitationsDetails || [])}
                          onMouseLeave={handleTooltipHide}
                          className="p-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
                        >
                          <Info className="h-3 w-3 text-amber-600" />
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-light text-slate-900">{filteredData?.limitationsActives || 0}</p>
                      <p className="text-xs text-slate-500">en cours</p>
                    </div>
                  </div>
                  <h4 className="font-medium text-slate-800">Limitations</h4>
                  <p className="text-sm text-slate-600 mt-1">Suivi nécessaire</p>
                </div>
              </div>

              {/* Détections précoces */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-600/20 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 hover:bg-white/60 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-3 bg-rose-500/20 backdrop-blur-sm rounded-xl">
                        <Shield className="h-6 w-6 text-rose-600" />
                      </div>
                      {filteredData?.detectionPrecoce?.risqueEleve > 0 && (
                        <button
                          onMouseEnter={(e) => handleTooltipShow(e, 'detectionsPrecoces', filteredData?.detectionPrecoce?.details || [])}
                          onMouseLeave={handleTooltipHide}
                          className="p-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 transition-colors"
                        >
                          <Info className="h-3 w-3 text-rose-600" />
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-light text-slate-900">{filteredData?.detectionPrecoce?.risqueEleve || 0}</p>
                      <p className="text-xs text-slate-500">alertes</p>
                    </div>
                  </div>
                  <h4 className="font-medium text-slate-800">Détection précoce</h4>
                  <p className="text-sm text-slate-600 mt-1">Intervention requise</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activité mensuelle */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-500/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-light text-slate-900">Évolution de l'activité</h3>
            </div>
            
            {activiteParMoisData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-500">
                <div className="text-center">
                  <div className="p-4 bg-slate-100/50 backdrop-blur-sm rounded-2xl mb-4">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto" />
                  </div>
                  <p className="font-medium">Aucune donnée d'activité</p>
                </div>
              </div>
            ) : (
              <BarChart
                data={activiteParMoisData}
                title=""
                xAxisKey="mois"
                series={[
                  {
                    key: 'count',
                    name: 'Entretiens réalisés',
                    color: '#6366f1'
                  }
                ]}
                height={320}
              />
            )}
          </div>
        </div>
        
        {/* Footer ultra-moderne */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-purple-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            
            <div className="relative bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-8">
                
                {/* Section synchronisation */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-sm font-medium text-slate-700">Dernière synchronisation</p>
                    <p className="text-xs text-slate-600">
                      {new Date().toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Séparateur */}
                <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

                {/* Section sécurité */}
                <div className="flex items-center space-x-4">
                  <a 
                    href="https://www.ssllabs.com/ssltest/analyze.html?d=app.vital-sync.ch" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/30 hover:border-green-500/40 transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative">
                      <Shield className="h-4 w-4 text-green-600 group-hover:text-green-500 transition-colors" />
                      <div className="absolute inset-0 bg-green-400/20 rounded-full blur-sm group-hover:bg-green-400/40 transition-all duration-300"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-800 transition-colors">
                      Audit SSL/TLS
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-600 transition-colors" />
                  </a>
                </div>

                {/* Séparateur */}
                <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

                {/* Section développeur */}
                <div className="text-center lg:text-right space-y-1">
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Développé par{' '}
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                        Amarres®
                      </span>
                    </p>
                    <div className="flex items-center">
                      <img 
                        src="/logo-amarre.png" 
                        alt="Logo Amarre" 
                        className="w-9 h-9 object-contain transition-transform duration-300 hover:scale-150"
                      />
                    </div>
                  </div>
                  <p className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-lite">
                    Software Development
                  </p>
                </div>
              </div>

              {/* Ligne décorative */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip universel pour toutes les bulles d'info */}
      {activeTooltip && (
        <div
          className="fixed pointer-events-auto animate-in fade-in slide-in-from-left-2 duration-300"
          style={{
            zIndex: 2147483647,
            top: `${activeTooltip.position.top}px`,
            left: `${activeTooltip.position.left}px`,
          }}
          onMouseEnter={() => setIsTooltipHovered(true)}
          onMouseLeave={() => setIsTooltipHovered(false)}
        >
          <div className="relative">
            {/* Ombre */}
            <div className="absolute inset-0 bg-slate-800/30 rounded-xl blur-lg"></div>
            
            {/* Contenu principal */}
            <div className="relative bg-white backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl overflow-hidden w-[400px] max-h-[60vh]">
              
              {/* En-tête */}
              <div className="bg-slate-50 p-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Info className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-medium text-sm">
                        {activeTooltip.type === 'entretiensEnCours' && 'Entretiens en cours'}
                        {activeTooltip.type === 'visitesPlanifiees' && 'Visites médicales à planifier'}
                        {activeTooltip.type === 'limitations' && 'Limitations actives'}
                        {activeTooltip.type === 'detectionsPrecoces' && 'Détections précoces'}
                      </h4>
                      <p className="text-slate-500 text-xs">
                        {activeTooltip.data.length} élément{activeTooltip.data.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bouton fermer */}
                  <button
                    onClick={() => {
                      setActiveTooltip(null);
                      setIsTooltipHovered(false);
                      setIsButtonHovered(false);
                    }}
                    className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                  >
                    <X className="h-3 w-3 text-slate-600" />
                  </button>
                </div>
              </div>
              
              {/* Corps */}
              <div className="p-3 bg-white max-h-[50vh] overflow-y-auto">
                {activeTooltip.data.length > 0 ? (
                  <div className="space-y-3">
                    {activeTooltip.data.map((item, index) => (
                      <div 
                        key={index} 
                        className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        {activeTooltip.type === 'entretiensEnCours' && (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-slate-800 text-sm">
                                {item.patient?.civilites} {item.patient?.nom} {item.patient?.prenom}
                              </span>
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                Entretien #{item.id}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <p><strong>Département:</strong> {item.patient?.departement}</p>
                              <p><strong>Démarré:</strong> {new Date(item.tempsDebut).toLocaleString('fr-FR')}</p>
                              {item.enPause && <p className="text-amber-600"><strong>⏸️ En pause</strong></p>}
                            </div>
                          </>
                        )}
                        
                        {activeTooltip.type === 'visitesPlanifiees' && (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-slate-800 text-sm">
                                {item.nom} {item.prenom}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {item.typeVisite}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <p><strong>Département:</strong> {item.departement}</p>
                              <p><strong>Échéance:</strong> {new Date(item.dateEcheance).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </>
                        )}
                        
                        {activeTooltip.type === 'limitations' && (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-slate-800 text-sm">
                                {item.patient?.nom} {item.patient?.prenom}
                              </span>
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                {item.type}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <p><strong>Limitation:</strong> {item.description}</p>
                              <p><strong>Depuis:</strong> {new Date(item.dateDebut).toLocaleDateString('fr-FR')}</p>
                              {item.dateFin && (
                                <p><strong>Jusqu'au:</strong> {new Date(item.dateFin).toLocaleDateString('fr-FR')}</p>
                              )}
                            </div>
                          </>
                        )}
                        
                        {activeTooltip.type === 'detectionsPrecoces' && (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-slate-800 text-sm">
                                {item.patient?.nom} {item.patient?.prenom}
                              </span>
                              <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                                Risque {item.niveau}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <p><strong>Motif:</strong> {item.motif}</p>
                              <p><strong>Détecté le:</strong> {new Date(item.dateDetection).toLocaleDateString('fr-FR')}</p>
                              <p><strong>Recommandation:</strong> {item.recommandation}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    
                    {/* Footer */}
                    <div className="pt-2 mt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-emerald-600 font-medium">Synchronisé</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* État vide */
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Info className="h-6 w-6 text-slate-400" />
                    </div>
                    <h4 className="text-slate-700 font-medium text-sm mb-1">Aucune donnée</h4>
                    <p className="text-slate-500 text-xs">
                      Aucun élément à afficher pour cette catégorie.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Flèche pointant vers le bouton */}
              <div className="absolute top-4 -left-2 w-4 h-4 bg-white border-l border-t border-slate-200 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};