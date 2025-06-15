'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Patient } from '@/types';
import { Filter, X } from 'lucide-react';

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
  
  // États pour les filtres
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Liste des départements uniques
  const [departments, setDepartments] = useState<string[]>([]);
  
  // 🔧 CORRECTION 1: Ref pour éviter les rechargements multiples
  const loadedPatientsRef = useRef<number[]>([]);
  const isLoadingRef = useRef(false);
  
  // Extraire les départements uniques des patients
  useEffect(() => {
    const uniqueDepartments = Array.from(new Set(patients.map(p => p.departement))).filter(Boolean);
    setDepartments(uniqueDepartments);
  }, [patients]);

  // 🔧 CORRECTION 2: Fonction mémorisée pour charger les entretiens
  const loadPatientsWithEntretiens = useCallback(async () => {
    // Éviter les chargements multiples simultanés
    if (isLoadingRef.current) {
      console.log('⏭️ Chargement déjà en cours, ignorer');
      return;
    }
    
    // Vérifier si on a déjà chargé ces patients
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
        if (result.success && result.data && result.data.length > 0) {
          // Prendre le premier entretien (le plus récent)
          lastEntretien = result.data[0];
        }
        
        enrichedPatients.push({
          ...patient,
          lastEntretien
        });
      } catch (error) {
        console.error(`Erreur pour patient ${patient.id}:`, error);
        enrichedPatients.push({
          ...patient,
          lastEntretien: null
        });
      }
    }
    
    setPatientsWithEntretiens(enrichedPatients);
    loadedPatientsRef.current = patients.map(p => p.id);
    setIsLoading(false);
    isLoadingRef.current = false;
    console.log('✅ Entretiens chargés pour', enrichedPatients.length, 'patients');
  }, [patients]);

  // 🔧 CORRECTION 3: useEffect optimisé
  useEffect(() => {
    if (patients.length > 0) {
      loadPatientsWithEntretiens();
    } else {
      setPatientsWithEntretiens([]);
      loadedPatientsRef.current = [];
    }
  }, [patients.length, loadPatientsWithEntretiens]); // ⚠️ Dépendance sur patients.length, pas patients

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
        return 'bg-green-100 text-green-800';
      case 'archive':
        return 'bg-gray-100 text-gray-800';
      case 'brouillon':
      default:
        return 'bg-yellow-100 text-yellow-800';
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
    // Filtre texte sur nom/prénom
    const textMatch = searchTerm === '' || 
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par département
    const departmentMatch = departmentFilter === '' || 
      patient.departement === departmentFilter;
    
    // Filtre par statut d'entretien
    const statusMatch = statusFilter === '' || 
      (patient.lastEntretien && patient.lastEntretien.status === statusFilter);
    
    // Filtre par date d'entretien
    const dateMatch = dateFilter === '' || 
      (patient.lastEntretien && 
       new Date(patient.lastEntretien.dateCreation).toISOString().split('T')[0] === dateFilter);
    
    return textMatch && departmentMatch && statusMatch && dateMatch;
  });

  return (
    <div className="p-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Liste des Dossiers Employés</h2>
        
        <div className="flex gap-4 items-center">
          {/* Barre de recherche avec bouton de filtres */}
          <div className="relative">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                         transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`ml-2 p-2 rounded-lg transition-colors ${
                  showFilters || departmentFilter || statusFilter || dateFilter
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Filtres avancés"
              >
                <Filter size={20} />
              </button>
              
              {/* Indicateur de filtres actifs */}
              {(departmentFilter || statusFilter || dateFilter) && (
                <button 
                  onClick={resetFilters}
                  className="ml-2 p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  title="Réinitialiser les filtres"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            {/* Panneau de filtres avancés */}
            {showFilters && (
              <div className="absolute z-10 right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
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
                    {departments.map(dept => (
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
                
                {/* Filtre par date */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Date d'entretien</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  />
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
          
          <button
            onClick={onNewDossier}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 
                     transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 4v16m8-8H4" />
            </svg>
            Nouveau Dossier
          </button>
        </div>
      </div>

      {/* Indicateurs de filtres actifs */}
      {(departmentFilter || statusFilter || dateFilter) && (
        <div className="mb-4 flex flex-wrap gap-2">
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
              État: {getStatusText(statusFilter)}
              <button 
                onClick={() => setStatusFilter('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {dateFilter && (
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Date: {new Date(dateFilter).toLocaleDateString('fr-FR')}
              <button 
                onClick={() => setDateFilter('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🔧 CORRECTION 4: Indicateur de chargement amélioré */}
      {isLoading && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
            <span className="text-blue-700 text-sm">Chargement des informations d'entretiens...</span>
          </div>
        </div>
      )}

      {/* Tableau - garde le code existant */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nom & Prénom
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Poste
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dernier Entretien
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredPatients.map((patient, index) => (
                <tr 
                  key={patient.id}
                  className={`hover:bg-blue-50 transition-colors duration-150
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 
                                  flex items-center justify-center">
                        <span className="text-blue-900 font-semibold">
                          {`${patient.prenom[0]}${patient.nom[0]}`}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {`${patient.civilites} ${patient.nom} ${patient.prenom}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Entrée en fonction : {patient.dateEntree?.replace(/\//g, '.')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold 
                                 rounded-full bg-blue-100 text-blue-800">
                      {patient.departement}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.poste}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.manager}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.lastEntretien ? (
                      <>
                        <div className="text-sm text-gray-900">
                          {new Date(patient.lastEntretien.dateCreation).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColorClass(patient.lastEntretien.status)}`}>
                            {getStatusText(patient.lastEntretien.status)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Aucun entretien</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="text-blue-600 hover:text-blue-900 font-semibold 
                               flex items-center gap-2 ml-auto"
                    >
                      Consulter le dossier
                      <svg width="16" height="16" fill="none" stroke="currentColor" 
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" 
                              strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Message si aucun résultat */}
        {filteredPatients.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Aucun patient trouvé</h3>
            <p className="text-gray-600 mt-2">Essayez avec d'autres critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};