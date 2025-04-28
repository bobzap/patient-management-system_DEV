// src/components/dashboard/Dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, Users, Calendar, Activity, Clock, Award,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, FileText,
  Filter, Download, Clipboard, ArrowRight
} from 'lucide-react';

interface DashboardProps {
  patients: {
    data: Array<{
      id: number;
      dateCreation: string;
      dateEntretien?: string;
      departement: string;
      manager: string;
      zone: string;
      nom: string;
      prenom: string;
      civilites: string;
      poste: string;
    }>;
  };
}

export const Dashboard = ({ patients }: DashboardProps) => {
  const router = useRouter();
  const [entretienStats, setEntretienStats] = useState({
    total: 0,
    brouillon: 0,
    finalise: 0,
    archive: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('total');
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  const [departmentDistribution, setDepartmentDistribution] = useState<Record<string, number>>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  };

  // Charger les statistiques des entretiens
  useEffect(() => {
    const fetchEntretienStats = async () => {
      setIsLoading(true);
      try {
        // En production, vous feriez un appel API ici
        // Simulation des données pour le moment
        const stats = {
          total: 0,
          brouillon: 0,
          finalise: 0,
          archive: 0
        };
        
        const deptDistribution: Record<string, number> = {};
        const recentEntretiens: any[] = [];
        
        // Parcourir tous les patients
        for (const patient of patients.data) {
          try {
            const response = await fetch(`/api/patients/${patient.id}/entretiens`);
            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
              const patientEntretiens = result.data;
              stats.total += patientEntretiens.length;
              
              // Compter par statut
              patientEntretiens.forEach((entretien: any) => {
                if (entretien.status === 'brouillon') stats.brouillon++;
                else if (entretien.status === 'finalise') stats.finalise++;
                else if (entretien.status === 'archive') stats.archive++;
                
                // Ajouter aux entretiens récents (limité aux 5 plus récents)
                if (recentEntretiens.length < 5) {
                  recentEntretiens.push({
                    ...entretien,
                    patientNom: `${patient.civilites} ${patient.nom} ${patient.prenom}`,
                    poste: patient.poste,
                    departement: patient.departement
                  });
                }
              });
              
              // Distribution par département
              if (patient.departement) {
                deptDistribution[patient.departement] = (deptDistribution[patient.departement] || 0) + 1;
              }
            }
          } catch (error) {
            console.error(`Erreur pour patient ${patient.id}:`, error);
          }
        }
        
        // Trier les entretiens récents par date
        recentEntretiens.sort((a, b) => 
          new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
        );
        
        setEntretienStats(stats);
        setDepartmentDistribution(deptDistribution);
        setRecentActivity(recentEntretiens);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntretienStats();
  }, [patients.data]);

  // Filtrer les données en fonction de la période
  const filterDataByTime = (data: number) => {
    // Dans une implémentation réelle, vous filtreriez en fonction de timeRangeFilter
    return data;
  };

  // Fonction pour obtenir la classe de couleur selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalise': return 'bg-green-100 text-green-800';
      case 'archive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'finalise': return 'Finalisé';
      case 'archive': return 'Archivé';
      default: return 'Brouillon';
    }
  };

  // Obtenir le top des départements
  const topDepartments = Object.entries(departmentDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête du tableau de bord */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-1">Aperçu de l'activité et des statistiques</p>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-2">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setTimeRangeFilter('week')}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg border ${
                  timeRangeFilter === 'week' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setTimeRangeFilter('month')}
                className={`px-3 py-2 text-sm font-medium border-t border-b ${
                  timeRangeFilter === 'month' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => setTimeRangeFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg border ${
                  timeRangeFilter === 'all' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Total
              </button>
            </div>
            
            <button 
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            >
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>
        
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total des entretiens */}
          <div 
            className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === 'total' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
            onClick={() => setSelectedFilter('total')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total des entretiens</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : filterDataByTime(entretienStats.total)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="text-blue-600" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <TrendingUp size={16} className="mr-1" />
              <span>{patients.data.length} patients actifs</span>
            </div>
          </div>
          
          {/* Entretiens en cours */}
          <div 
            className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === 'brouillon' ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''
            }`}
            onClick={() => setSelectedFilter('brouillon')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Entretiens en cours</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : filterDataByTime(entretienStats.brouillon)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-yellow-600">
              <AlertCircle size={16} className="mr-1" />
              <span>À compléter</span>
            </div>
          </div>
          
          {/* Entretiens finalisés */}
          <div 
            className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === 'finalise' ? 'ring-2 ring-green-500 ring-opacity-50' : ''
            }`}
            onClick={() => setSelectedFilter('finalise')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Entretiens finalisés</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : filterDataByTime(entretienStats.finalise)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <TrendingUp size={16} className="mr-1" />
              <span>Prêts pour analyse</span>
            </div>
          </div>
          
          {/* Entretiens archivés */}
          <div 
            className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-500 cursor-pointer transition-all hover:shadow-md ${
              selectedFilter === 'archive' ? 'ring-2 ring-gray-500 ring-opacity-50' : ''
            }`}
            onClick={() => setSelectedFilter('archive')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Entretiens archivés</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : filterDataByTime(entretienStats.archive)}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Clipboard className="text-gray-600" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-gray-600">
              <Activity size={16} className="mr-1" />
              <span>Historique complet</span>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique et statistiques */}
          <div className="lg:col-span-2 space-y-6">
            {/* Graphique d'activité */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Activité par département</h2>
                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                  <Filter size={14} className="mr-1" />
                  Filtrer
                </button>
              </div>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : topDepartments.length > 0 ? (
                  topDepartments.map(([dept, count], index) => (
                    <div key={dept} className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{dept}</span>
                        <span className="text-sm text-gray-600">{count} patients</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(count / Math.max(...topDepartments.map(d => d[1]))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                )}
              </div>
            </div>
            
            {/* Statistiques supplémentaires */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Performances</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Calendar className="text-purple-600" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Taux d'entretiens finalisés</p>
                        <p className="text-xs text-gray-500">Sur le total des entretiens</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {isLoading ? '...' : `${entretienStats.total === 0 ? 0 : Math.round((entretienStats.finalise / entretienStats.total) * 100)}%`}
                    </p>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                    <div 
                      className="bg-purple-600 h-1.5 rounded-full" 
                      style={{ width: `${entretienStats.total === 0 ? 0 : (entretienStats.finalise / entretienStats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <Users className="text-indigo-600" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Couverture patients</p>
                        <p className="text-xs text-gray-500">Patients avec entretien</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {isLoading ? '...' : `${patients.data.length} / ${patients.data.length}`}
                    </p>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Activité récente et à faire */}
          <div className="space-y-6">
            {/* Activité récente */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Entretiens récents</h2>
              
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.status === 'finalise' ? 'bg-green-100' :
                        activity.status === 'archive' ? 'bg-gray-100' : 'bg-yellow-100'
                      }`}>
                        <span className="text-sm font-medium">
                          {activity.patientNom.split(' ').map((part: string) => part[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.patientNom}</p>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                            {getStatusText(activity.status)}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDate(activity.dateCreation)}
                          </span>
                        </div>
                      </div>
                      <button 
  className="text-blue-600 hover:text-blue-800 mt-1"
  onClick={() => {
    // Au lieu de router.push
    // Vous devrez trouver le patient correspondant dans la liste des patients
    const patientToView = patients.data.find(p => p.id === activity.patientId);
    if (patientToView) {
      window.dispatchEvent(new CustomEvent('viewPatient', { 
        detail: { patient: patientToView } 
      }));
    }
  }}
>
  <ArrowRight size={16} />
</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun entretien récent</p>
              )}
            </div>
            
            {/* À faire */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">À faire</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="text-yellow-600 mr-3" size={18} />
                    <span className="text-sm font-medium text-gray-800">
                      {entretienStats.brouillon} entretiens en cours
                    </span>
                  </div>
                  <button 
  className="text-sm text-blue-600 hover:text-blue-800"
  onClick={() => {
    // Au lieu de router.push('/patients')
    window.dispatchEvent(new CustomEvent('navigateTo', { 
      detail: { tab: 'patients' } 
    }));
  }}
>
  Voir
</button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="text-blue-600 mr-3" size={18} />
                    <span className="text-sm font-medium text-gray-800">
                      {patients.data.length} dossiers employés actifs
                    </span>
                  </div>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      // Action
                    }}
                  >
                    Voir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};