// src/components/dashboard/Dashboard.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Activity, 
  FileText,
  CheckCircle,
  Archive,
  Calendar,
  ClipboardList,
  AlertTriangle,
  Stethoscope,
  AlertCircle,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  X
} from 'lucide-react';
import { analyzeEntretiensData } from '../../services/dashboard-analysis';
import { Patient } from '@/types';

// Import des composants améliorés du tableau de bord
import { StatCard } from './StatCard';
import { PieChart } from './PieChart';
import { BarChart } from './BarChart';
import { RisquesList } from './RisquesList';
import { HealthMetrics, createHealthMetrics } from './HealthMetrics';
import { RecentActivities } from './RecentActivities';
import { GaugeMetrics } from './GaugeMetrics';

interface DashboardProps {
  patients: {
    data: Patient[];
  };
}

export const Dashboard = ({ patients }: DashboardProps) => {
  const router = useRouter();
  
  // États pour les données
  const [entretiens, setEntretiens] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // État pour les filtres avancés
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Charger tous les entretiens pour analyse
  useEffect(() => {
    const fetchAllEntretiens = async () => {
      setIsLoading(true);
      try {
        const allEntretiens: any[] = [];
        
        // Parcourir tous les patients pour récupérer leurs entretiens
        for (const patient of patients.data) {
          try {
            const response = await fetch(`/api/patients/${patient.id}/entretiens`);
            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
              // Ajouter les informations du patient à chaque entretien
              const entretiensWithPatient = result.data.map((entretien: any) => ({
                ...entretien,
                patient
              }));
              
              // Pour chaque entretien, charger ses données détaillées
              for (const entretien of entretiensWithPatient) {
                try {
                  const detailResponse = await fetch(`/api/entretiens/${entretien.id}`);
                  const detailResult = await detailResponse.json();
                  
                  if (detailResult.success && detailResult.data) {
                    // Si les données sont une chaîne JSON, les parser
                    if (typeof detailResult.data.donneesEntretien === 'string') {
                      try {
                        const donneesObject = JSON.parse(detailResult.data.donneesEntretien);
                        entretien.donneesObject = donneesObject;
                      } catch (e) {
                        console.warn(`Erreur de parsing des données pour l'entretien ${entretien.id}:`, e);
                      }
                    }
                    
                    // Ajouter d'autres informations importantes
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
        
        // Analyser les données collectées
        const metricsData = await analyzeEntretiensData(allEntretiens, patients.data);
        setDashboardData(metricsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données du dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllEntretiens();
  }, [patients.data, refreshTrigger]);
  
  // Filtrer les données selon la période sélectionnée
  const filteredData = useMemo(() => {
    if (!dashboardData) return null;
    
    // Si aucun filtre n'est appliqué, retourner toutes les données
    if (selectedTimeRange === 'all' && !departmentFilter && !statusFilter) {
      return dashboardData;
    }
    
    // Copier l'objet pour ne pas modifier l'original
    const filtered = { ...dashboardData };
    
    // Filtrer les entretiens en fonction de la période
    let filteredEntretiens = [...entretiens];
    
    // Filtre par période
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
    
    // Filtre par département
    if (departmentFilter) {
      filteredEntretiens = filteredEntretiens.filter(entretien => 
        entretien.patient && entretien.patient.departement === departmentFilter
      );
    }
    
    // Filtre par statut
    if (statusFilter) {
      filteredEntretiens = filteredEntretiens.filter(entretien => 
        entretien.status === statusFilter
      );
    }
    
    // Mettre à jour les métriques avec les entretiens filtrés
    if (filteredEntretiens.length !== entretiens.length) {
      // Recalculer les métriques principales
      filtered.totalEntretiens = filteredEntretiens.length;
      
      // Recalculer la répartition par statut
      filtered.entretiensByStatus = {
        brouillon: 0,
        finalise: 0,
        archive: 0
      };
      
      for (const entretien of filteredEntretiens) {
        filtered.entretiensByStatus[entretien.status]++;
      }
      
      // Mettre à jour les entretiens récents
      filtered.recentsEntretiens = filteredEntretiens
        .slice()
        .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
        .slice(0, 5);
    }
    
    return filtered;
  }, [dashboardData, entretiens, selectedTimeRange, departmentFilter, statusFilter]);
  
  // Liste des départements uniques pour les filtres
  const uniqueDepartments = useMemo(() => {
    if (!patients.data) return [];
    
    const departments = Array.from(new Set(patients.data.map(p => p.departement)))
      .filter(Boolean)
      .sort();
      
    return departments;
  }, [patients.data]);
  
  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSelectedTimeRange('all');
    setDepartmentFilter('');
    setStatusFilter('');
  };
  
  // Extraire les données pour les visualisations
  const typesVisitesData = useMemo(() => {
    if (!filteredData || !filteredData.typesVisites) return [];
    
    return Object.entries(filteredData.typesVisites).map(([name, value]) => ({
      name,
      value: value as number
    }));
  }, [filteredData]);
  
  // Données pour le graphique d'activité par mois
  const activiteParMoisData = useMemo(() => {
    if (!filteredData || !filteredData.activiteParMois) return [];
    
    return filteredData.activiteParMois;
  }, [filteredData]);
  
  // Données pour les métriques de santé
  const healthMetricsData = useMemo(() => {
    if (!filteredData) return [];
    
    return createHealthMetrics({
      visiteMedicalePlanifiee: filteredData.visiteMedicalePlanifiee || 0,
      limitationsActives: filteredData.limitationsActives || 0,
      etudePostePrevue: filteredData.etudePostePrevue || 0,
      entretienManagerPrevu: filteredData.entretienManagerPrevu || 0,
      detectionsRisque: filteredData.detectionPrecoce?.risqueEleve || 0
    });
  }, [filteredData]);
  
  // Données pour les jauges de performance
  const gaugeMetricsData = useMemo(() => {
    if (!filteredData) return [];
    
    return [
      {
        id: 'taux-finalisation',
        value: filteredData.tendances?.tauxFinalisation || 0,
        title: 'Taux de finalisation',
        color: '#3b82f6', // blue-600
        description: 'Entretiens finalisés'
      },
      {
        id: 'detection-precoce',
        value: filteredData.totalEntretiens
          ? Math.round((filteredData.detectionPrecoce?.risqueEleve || 0) / filteredData.totalEntretiens * 100)
          : 0,
        title: 'Détection précoce',
        color: '#ef4444', // red-600
        description: 'Risques identifiés'
      },
      {
        id: 'croissance',
        value: Math.max(0, filteredData.tendances?.croissanceEntretiens || 0),
        title: 'Évolution',
        color: '#10b981', // emerald-600
        description: 'vs période précédente'
      }
    ];
  }, [filteredData]);
  
  // Fonctions de navigation
  const handleViewEntretien = (entretienId: number) => {
    // Trouver le patient associé à cet entretien
    const entretien = entretiens.find(e => e.id === entretienId);
    if (entretien && entretien.patient) {
      // Déclencher l'événement pour afficher ce patient
      window.dispatchEvent(new CustomEvent('viewPatient', { 
        detail: { patient: entretien.patient } 
      }));
    }
  };
  
  const handleViewPatient = (patientId: number) => {
    const patient = patients.data.find(p => p.id === patientId);
    if (patient) {
      window.dispatchEvent(new CustomEvent('viewPatient', { 
        detail: { patient } 
      }));
    }
  };
  
  const navigateToPatients = () => {
    window.dispatchEvent(new CustomEvent('navigateTo', { 
      detail: { tab: 'patients' } 
    }));
  };
  
  const navigateToNewDossier = () => {
    window.dispatchEvent(new CustomEvent('navigateTo', { 
      detail: { tab: 'newDossier' } 
    }));
  };
  
  const navigateToAdmin = () => {
    window.dispatchEvent(new CustomEvent('navigateTo', { 
      detail: { tab: 'admin' } 
    }));
  };
  
  // Rafraîchir les données
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête du tableau de bord */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-1">Statistiques et activité infirmière</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            {/* Contrôles de période */}
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setSelectedTimeRange('week')}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg border ${
                  selectedTimeRange === 'week' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setSelectedTimeRange('month')}
                className={`px-3 py-2 text-sm font-medium border-t border-b ${
                  selectedTimeRange === 'month' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => setSelectedTimeRange('all')}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg border ${
                  selectedTimeRange === 'all' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Total
              </button>
            </div>
            
            {/* Bouton de filtres */}
            <div className="relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border rounded-lg ${
                  showFilters || departmentFilter || statusFilter
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } shadow-sm`}
              >
                <Filter size={16} />
                Filtrer
              </button>
              
              {showFilters && (
                <div className="absolute z-10 right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtres avancés</h3>
                  
                  {/* Filtre par département */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Département</label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    >
                      <option value="">Tous les départements</option>
                      {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Filtre par statut d'entretien */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">État de l'entretien</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    >
                      <option value="">Tous les états</option>
                      <option value="brouillon">Brouillon</option>
                      <option value="finalise">Finalisé</option>
                      <option value="archive">Archivé</option>
                    </select>
                  </div>
                  
                  {/* Boutons d'actions */}
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={resetFilters}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      Réinitialiser
                    </button>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bouton de rafraîchissement */}
            <button 
              onClick={refreshData}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
              title="Rafraîchir les données"
            >
              <RefreshCw size={16} />
              Actualiser
            </button>
            
            {/* Bouton d'export */}
            <button 
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            >
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>
        
        {/* Indicateurs de filtres actifs */}
        {(departmentFilter || statusFilter || selectedTimeRange !== 'all') && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedTimeRange !== 'all' && (
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Période: {selectedTimeRange === 'week' ? 'Semaine' : 'Mois'}
                <button 
                  onClick={() => setSelectedTimeRange('all')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {departmentFilter && (
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Département: {departmentFilter}
                <button 
                  onClick={() => setDepartmentFilter('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {statusFilter && (
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                État: {
                  statusFilter === 'finalise' ? 'Finalisé' : 
                  statusFilter === 'archive' ? 'Archivé' : 'Brouillon'
                }
                <button 
                  onClick={() => setStatusFilter('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            <button 
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
        
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total des entretiens */}
          <StatCard
            title="Total des entretiens"
            value={filteredData?.totalEntretiens || 0}
            icon={<FileText size={20} />}
            description={`${patients.data.length} patients actifs`}
            trend={filteredData?.tendances?.croissanceEntretiens}
            colorScheme="blue"
            isLoading={isLoading}
            onClick={navigateToPatients}
          />
          
          {/* Nombre d'heures */}
          <StatCard
            title="Heures d'entretien"
            value={filteredData?.totalHeures || 0}
            icon={<Clock size={20} />}
            description={`${filteredData?.tendances?.tempsMoyenEntretien || 0} min en moyenne`}
            colorScheme="green"
            isLoading={isLoading}
          />
          
          {/* Entretiens finalisés */}
          <StatCard
            title="Entretiens finalisés"
            value={filteredData?.entretiensByStatus?.finalise || 0}
            icon={<CheckCircle size={20} />}
            description={`${filteredData?.tendances?.tauxFinalisation || 0}% du total`}
            colorScheme="amber"
            isLoading={isLoading}
          />
          
          {/* Détection précoce */}
          <StatCard
            title="Risques détectés"
            value={filteredData?.detectionPrecoce?.risqueEleve || 0}
            icon={<AlertCircle size={20} />}
            description="Nécessitant une attention immédiate"
            colorScheme="pink"
            isLoading={isLoading}
          />
        </div>
        
        {/* Contenu principal - Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Section graphiques - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Graphiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Types de visites */}
              <PieChart
                data={typesVisitesData}
                title="Types de visites"
                colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']}
                height={300}
              />
              
              {/* Risques professionnels identifiés */}
              <RisquesList
                risques={filteredData?.risquesProfessionnels || []}
                title="Risques professionnels identifiés"
                maxItems={5}
                totalEntretiens={filteredData?.totalEntretiens || 0}
                isLoading={isLoading}
              />
            </div>
            
            {/* Graphique d'activité */}
            <BarChart
              data={activiteParMoisData}
              title="Activité par mois"
              xAxisKey="mois"
              series={[
                {
                  key: 'count',
                  name: 'Entretiens',
                  color: '#3b82f6' // blue-600
                }
              ]}
              height={250}
            />
            
            {/* Métriques de santé au travail */}
            <HealthMetrics
              metrics={healthMetricsData}
              title="Actions à suivre"
              isLoading={isLoading}
            />
          </div>
          
          {/* Colonne latérale - 1/3 */}
          <div className="space-y-6">
            {/* Jauges de performance */}
            <GaugeMetrics
              metrics={gaugeMetricsData}
              title="Indicateurs de performance"
              isLoading={isLoading}
            />
            
            {/* Activités récentes */}
            <RecentActivities
              entretiens={filteredData?.recentsEntretiens || []}
              onViewEntretien={handleViewEntretien}
              onViewPatient={handleViewPatient}
              isLoading={isLoading}
              maxItems={5}
            />
            
            {/* Liens rapides */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              
              <div className="space-y-3">
                <button
                  onClick={navigateToPatients}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="text-blue-600 mr-3" size={18} />
                    <span className="text-sm font-medium text-gray-800">
                      Voir tous les dossiers
                    </span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button
                  onClick={navigateToNewDossier}
                  className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="text-green-600 mr-3" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-800">
                      Créer un nouveau dossier
                    </span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button
                  onClick={navigateToAdmin}
                  className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="text-purple-600 mr-3" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-800">
                      Gestion administrative
                    </span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Répartition par statut */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des entretiens</h3>
              
              {isLoading ? (
                <div className="animate-pulse space-y-4 py-8">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {/* Entretiens en brouillon */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white/60 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-amber-600">
                        <Clock size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">En cours</p>
                      <p className="text-xl font-bold text-gray-900">{filteredData?.entretiensByStatus?.brouillon || 0}</p>
                      <div className="mt-2 w-full bg-amber-200/50 rounded-full h-1.5">
                        <div 
                          className="bg-amber-500 h-1.5 rounded-full" 
                          style={{ 
                            width: `${filteredData?.totalEntretiens 
                              ? (filteredData.entretiensByStatus.brouillon / filteredData.totalEntretiens) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Entretiens finalisés */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white/60 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-green-600">
                        <CheckCircle size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Finalisés</p>
                      <p className="text-xl font-bold text-gray-900">{filteredData?.entretiensByStatus?.finalise || 0}</p>
                      <div className="mt-2 w-full bg-green-200/50 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full" 
                          style={{ 
                            width: `${filteredData?.totalEntretiens 
                              ? (filteredData.entretiensByStatus.finalise / filteredData.totalEntretiens) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Entretiens archivés */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white/60 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-gray-600">
                        <Archive size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Archivés</p>
                      <p className="text-xl font-bold text-gray-900">{filteredData?.entretiensByStatus?.archive || 0}</p>
                      <div className="mt-2 w-full bg-gray-200/50 rounded-full h-1.5">
                        <div 
                          className="bg-gray-500 h-1.5 rounded-full" 
                          style={{ 
                            width: `${filteredData?.totalEntretiens 
                              ? (filteredData.entretiensByStatus.archive / filteredData.totalEntretiens) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Détection précoce */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Détection précoce AI</h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Prochainement
                </span>
              </div>
              
              {isLoading ? (
                <div className="animate-pulse space-y-4 py-8">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {/* Risque élevé */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white/60 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-red-600">
                        <AlertCircle size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Risque élevé</p>
                      <p className="text-xl font-bold text-gray-900">{filteredData?.detectionPrecoce?.risqueEleve || 0}</p>
                    </div>
                  </div>
                  
                  {/* Risque moyen */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white/60 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-amber-600">
                        <AlertTriangle size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Risque moyen</p>
                      <p className="text-xl font-bold text-gray-900">{filteredData?.detectionPrecoce?.risqueMoyen || 0}</p>
                    </div>
                  </div>
                  
                  {/* Risque faible */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white/60 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-green-600">
                        <Activity size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Risque faible</p>
                      <p className="text-xl font-bold text-gray-900">{filteredData?.detectionPrecoce?.risqueFaible || 0}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  La fonctionnalité de détection précoce par Intelligence Artificielle sera disponible dans une prochaine mise à jour. 
                  Elle permettra d'identifier automatiquement les employés présentant des risques potentiels pour leur santé au travail.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Note de bas de page */}
        <div className="text-center text-gray-500 text-sm">
          <p>Données mises à jour le {new Date().toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>
    </div>
  );
};