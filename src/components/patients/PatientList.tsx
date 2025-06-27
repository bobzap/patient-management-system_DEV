'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Patient } from '@/types';
import { 
  Filter, X, Search, Plus, Users, Calendar, 
  Briefcase, User, ArrowRight, AlertCircle,
  Shield, ExternalLink, Loader2, Info, Eye
} from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectPatient: (patient: Patient) => void;
  onNewDossier: () => void;
}

export const PatientList = ({
  patients,
  searchTerm,
  onSearchChange,
  onSelectPatient,
  onNewDossier
}: PatientListProps) => {
  const [patientsWithEntretiens, setPatientsWithEntretiens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMotif, setHoveredMotif] = useState<{ patientId: number; motifs: string[] } | null>(null);
  
  // États pour les filtres
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Liste des départements uniques
  const [departments, setDepartments] = useState<string[]>([]);
  
  // Ref pour éviter les rechargements multiples
  const loadedPatientsRef = useRef<number[]>([]);
  const isLoadingRef = useRef(false);
  
  // Extraire les départements uniques des patients
  useEffect(() => {
    const uniqueDepartments = Array.from(new Set(patients.map(p => p.departement))).filter(Boolean);
    setDepartments(uniqueDepartments);
  }, [patients]);

  // Fonction mémorisée pour charger les entretiens
  const loadPatientsWithEntretiens = useCallback(async () => {
    if (isLoadingRef.current) {
      console.log('⏭️ Chargement déjà en cours, ignorer');
      return;
    }
    
    const currentPatientIds = patients.map(p => p.id).sort();
    const loadedIds = loadedPatientsRef.current.sort();
    
    if (JSON.stringify(currentPatientIds) === JSON.stringify(loadedIds)) {
      console.log('✅ Patients déjà chargés, ignorer');
      return;
    }
    
    console.log('🔄 Chargement des entretiens pour', patients.length, 'patients');
    setIsLoading(true);
    isLoadingRef.current = true;
    
    const enrichedPatients = [];
    
    for (const patient of patients) {
      try {
        const response = await fetch(`/api/patients/${patient.id}/entretiens`);
        const result = await response.json();
        
        let lastEntretien = null;
        let motifs: string[] = [];
        
        if (result.success && result.data && result.data.length > 0) {
          lastEntretien = result.data[0];
          
          // Extraire les motifs du dernier entretien
          try {
            const entretienDetailResponse = await fetch(`/api/entretiens/${lastEntretien.id}`);
            const entretienDetail = await entretienDetailResponse.json();
            
            if (entretienDetail.success && entretienDetail.data?.donneesEntretien) {
              let donneesEntretien;
              if (typeof entretienDetail.data.donneesEntretien === 'string') {
                donneesEntretien = JSON.parse(entretienDetail.data.donneesEntretien);
              } else {
                donneesEntretien = entretienDetail.data.donneesEntretien;
              }
              
              // Extraire les motifs de visite
              // ✅ SOLUTION
if (donneesEntretien?.santeTravail?.vecuTravail?.motifVisite?.motifs) {
  motifs = donneesEntretien.santeTravail.vecuTravail.motifVisite.motifs || [];
}
            }
          } catch (detailError) {
            console.error(`Erreur détails entretien ${lastEntretien.id}:`, detailError);
          }
        }
        
        enrichedPatients.push({
          ...patient,
          lastEntretien,
          motifs
        });
      } catch (error) {
        console.error(`Erreur pour patient ${patient.id}:`, error);
        enrichedPatients.push({
          ...patient,
          lastEntretien: null,
          motifs: []
        });
      }
    }
    
    setPatientsWithEntretiens(enrichedPatients);
    loadedPatientsRef.current = patients.map(p => p.id);
    setIsLoading(false);
    isLoadingRef.current = false;
    console.log('✅ Entretiens chargés pour', enrichedPatients.length, 'patients');
  }, [patients]);

  useEffect(() => {
    if (patients.length > 0) {
      loadPatientsWithEntretiens();
    } else {
      setPatientsWithEntretiens([]);
      loadedPatientsRef.current = [];
    }
  }, [patients.length, loadPatientsWithEntretiens]);

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setDepartmentFilter('');
    setStatusFilter('');
    setDateFilter('');
    onSearchChange('');
  };

  // Fonction d'assistance pour obtenir la classe de couleur selon le statut
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'finalise':
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-200/50';
      case 'archive':
        return 'bg-slate-500/20 text-slate-700 border-slate-200/50';
      case 'brouillon':
      default:
        return 'bg-amber-500/20 text-amber-700 border-amber-200/50';
    }
  };

  // Fonction d'assistance pour formater le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'finalise':
        return 'Finalisé';
      case 'archive':
        return 'Archivé';
      case 'brouillon':
      default:
        return 'Brouillon';
    }
  };

  // Filtrage avancé combinant recherche texte et filtres
  const filteredPatients = patientsWithEntretiens.filter(patient => {
    const textMatch = searchTerm === '' || 
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const departmentMatch = departmentFilter === '' || 
      patient.departement === departmentFilter;
    
    const statusMatch = statusFilter === '' || 
      (patient.lastEntretien && patient.lastEntretien.status === statusFilter);
    
    const dateMatch = dateFilter === '' || 
      (patient.lastEntretien && 
       new Date(patient.lastEntretien.dateCreation).toISOString().split('T')[0] === dateFilter);
    
    return textMatch && departmentMatch && statusMatch && dateMatch;
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête ultra-moderne */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              {/* Titre et description */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-light text-slate-900 tracking-tight">
                    Dossiers Employés
                  </h1>
                </div>
                <p className="text-slate-500 ml-11">
                  Gérez et consultez les dossiers de vos employés
                </p>
              </div>

              {/* Actions principales */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={onNewDossier}
                  className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Nouveau Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres modernes */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-4 shadow-xl">
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Barre de recherche */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-900"
                />
              </div>

              {/* Contrôles de filtres */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-xl transition-all duration-300 shadow-lg ${
                    showFilters || departmentFilter || statusFilter || dateFilter
                      ? 'bg-blue-500/20 border border-blue-200/50 text-blue-600' 
                      : 'bg-white/40 border border-white/50 text-slate-600 hover:bg-white/50'
                  }`}
                  title="Filtres avancés"
                >
                  <Filter className="h-5 w-5" />
                </button>
                
                {/* Bouton reset filtres */}
                {(departmentFilter || statusFilter || dateFilter || searchTerm) && (
                  <button 
                    onClick={resetFilters}
                    className="p-3 bg-red-500/20 border border-red-200/50 text-red-600 rounded-xl hover:bg-red-500/30 transition-all duration-300 shadow-lg"
                    title="Réinitialiser les filtres"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Panneau de filtres avancés */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtre par département */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Département</label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-900"
                    >
                      <option value="">Tous les départements</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Filtre par statut d'entretien */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">État de l'entretien</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-900"
                    >
                      <option value="">Tous les états</option>
                      <option value="brouillon">Brouillon</option>
                      <option value="finalise">Finalisé</option>
                      <option value="archive">Archivé</option>
                    </select>
                  </div>
                  
                  {/* Filtre par date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Date d'entretien</label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-900"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicateurs de filtres actifs */}
        {(departmentFilter || statusFilter || dateFilter) && (
          <div className="flex flex-wrap gap-3">
            {departmentFilter && (
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm text-blue-700 rounded-xl text-sm border border-blue-200/50">
                Département: {departmentFilter}
                <button 
                  onClick={() => setDepartmentFilter('')}
                  className="ml-3 p-1 hover:bg-blue-500/30 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {statusFilter && (
              <div className="inline-flex items-center px-4 py-2 bg-indigo-500/20 backdrop-blur-sm text-indigo-700 rounded-xl text-sm border border-indigo-200/50">
                État: {getStatusText(statusFilter)}
                <button 
                  onClick={() => setStatusFilter('')}
                  className="ml-3 p-1 hover:bg-indigo-500/30 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {dateFilter && (
              <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 backdrop-blur-sm text-purple-700 rounded-xl text-sm border border-purple-200/50">
                Date: {new Date(dateFilter).toLocaleDateString('fr-FR')}
                <button 
                  onClick={() => setDateFilter('')}
                  className="ml-3 p-1 hover:bg-purple-500/30 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur"></div>
            <div className="relative bg-white/40 backdrop-blur-xl border border-amber-200/50 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                <span className="text-amber-800 font-medium">Chargement des informations d'entretiens...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tableau moderne */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-gray-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* En-tête du tableau */}
            <div className="bg-gradient-to-r from-slate-500/20 to-gray-600/20 backdrop-blur-sm p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-500/20 backdrop-blur-sm rounded-xl">
                    <Users className="h-5 w-5 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-light text-slate-900">
                    {filteredPatients.length} employé{filteredPatients.length > 1 ? 's' : ''}
                  </h3>
                </div>
                
                {/* Statistiques rapides */}
                <div className="flex items-center space-x-6 text-sm text-slate-600">
                  <span>Total: {patients.length}</span>
                  <span>Affichés: {filteredPatients.length}</span>
                </div>
              </div>
            </div>

            {/* Contenu du tableau */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Employé
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Département
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Poste
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Manager
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Dernier Entretien
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, index) => (
                    <tr 
                      key={patient.id}
                      className="border-b border-white/10 hover:bg-white/20 transition-all duration-300"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          {/* Avatar moderne */}
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-2xl blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative w-12 h-12 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl flex items-center justify-center">
                              <span className="text-sm font-medium text-slate-800">
                                {`${patient.prenom[0]}${patient.nom[0]}`}
                              </span>
                            </div>
                          </div>
                          
                          {/* Informations employé */}
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {`${patient.civilites} ${patient.nom} ${patient.prenom}`}
                            </div>
                            <div className="text-sm text-slate-500">
                              Entrée : {patient.dateEntree?.replace(/\//g, '.')}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm text-blue-700 rounded-xl text-sm font-medium border border-blue-200/50">
                          {patient.departement}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {patient.poste}
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {patient.manager}
                      </td>
                      
                      <td className="px-6 py-4">
                        {patient.lastEntretien ? (
                          <div className="space-y-2">
                            <div className="text-sm text-slate-900">
                              {new Date(patient.lastEntretien.dateCreation).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-xl backdrop-blur-sm border ${getStatusColorClass(patient.lastEntretien.status)}`}>
                                {getStatusText(patient.lastEntretien.status)}
                              </span>
                              
                              {/* Icône info avec tooltip pour les motifs */}
                              <div className="relative">
  <button
    onMouseEnter={() => setHoveredMotif({ 
      patientId: patient.id, 
      motifs: patient.motifs || [] 
    })}
    onMouseLeave={() => setHoveredMotif(null)}
    className="group relative p-2 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
  >
    <Info className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors duration-300" />
    
    {/* Indicateur de pulse si des motifs existent */}
    {patient.motifs && patient.motifs.length > 0 && (
      <div className="absolute -top-1 -right-1">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50">
          <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
    )}
  </button>
  
  {/* Tooltip moderne avec glassmorphisme */}
  {hoveredMotif?.patientId === patient.id && (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Container principal avec glassmorphisme */}
      <div className="relative">
        {/* Effet de blur d'arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-indigo-600/70 to-purple-600/60 rounded-2xl blur-xl"></div>
        
        {/* Contenu principal */}
        <div className="relative bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden min-w-[280px] max-w-[400px]">
          
          {/* En-tête avec dégradé */}
          <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/80 backdrop-blur-sm p-4 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Motifs de l'entretien</h4>
                <p className="text-blue-100 text-xs opacity-90">
                  {hoveredMotif.motifs.length} motif{hoveredMotif.motifs.length > 1 ? 's' : ''} renseigné{hoveredMotif.motifs.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          
          {/* Corps du contenu */}
          <div className="p-4">
            {hoveredMotif.motifs.length > 0 ? (
              <div className="space-y-3">
                {hoveredMotif.motifs.map((motif, index) => (
                  <div 
                    key={index} 
                    className="group flex items-start space-x-3 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    {/* Numéro avec design moderne */}
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500/30 backdrop-blur-sm border border-blue-400/40 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    
                    {/* Texte du motif */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-relaxed break-words">
                        {motif}
                      </p>
                    </div>
                    
                    {/* Indicateur visuel */}
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-300 transition-colors"></div>
                  </div>
                ))}
                
                {/* Footer avec métadonnées */}
                <div className="pt-3 mt-3 border-t border-white/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-100 opacity-75">
                      Entretien du {new Date(patient.lastEntretien.dateCreation).toLocaleDateString('fr-FR')}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-200 font-medium">À jour</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* État vide avec design élégant */
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Info className="h-8 w-8 text-white/60" />
                </div>
                <h4 className="text-white font-medium text-sm mb-2">Aucun motif renseigné</h4>
                <p className="text-blue-100 text-xs opacity-75 leading-relaxed">
                  Les motifs d'entretien n'ont pas encore été saisis pour ce collaborateur.
                </p>
              </div>
            )}
          </div>
          
          {/* Flèche du tooltip avec glassmorphisme */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="relative">
              {/* Ombre de la flèche */}
              <div className="absolute inset-0 translate-y-1">
                <div className="w-4 h-4 bg-blue-600/40 transform rotate-45 blur-sm"></div>
              </div>
              
              {/* Flèche principale */}
              <div className="relative w-4 h-4 bg-white/20 backdrop-blur-2xl border-r border-b border-white/30 transform rotate-45 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 to-purple-600/40 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-slate-500">Aucun entretien</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onSelectPatient(patient)}
                          className="group flex items-center space-x-2 px-4 py-2 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/50 transition-all duration-300 text-slate-700 hover:text-slate-900 ml-auto"
                        >
                          <span className="text-sm font-medium">Consulter</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Message si aucun résultat */}
            {filteredPatients.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="p-4 bg-slate-100/50 backdrop-blur-sm rounded-2xl mb-4 inline-block">
                  <Users className="h-12 w-12 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun employé trouvé</h3>
                <p className="text-slate-600">Essayez avec d'autres critères de recherche</p>
                {(departmentFilter || statusFilter || dateFilter || searchTerm) && (
                  <button 
                    onClick={resetFilters}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
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
    </div>
  );
};