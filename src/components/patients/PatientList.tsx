// src/components/patients/PatientList.tsx
export const PatientList = ({
  patients,
  searchTerm,
  onSearchChange,
  onSelectPatient,
  onNewDossier
}: PatientListProps) => {
  return (
    <div className="p-6">
      {/* En-tête avec recherche */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Liste des Dossiers Patients</h2>
        
        <div className="flex gap-4 items-center">
          <div className="relative">
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

      {/* Tableau */}
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
              {patients
                .filter(patient => 
                  patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  patient.prenom.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((patient, index) => (
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
                            {patient.civilite} {patient.nom} {patient.prenom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.dateEntree}
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
                      <div className="text-sm text-gray-900">{patient.dateEntretien}</div>
                      <div className="text-sm text-gray-500">{patient.typeEntretien}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="text-blue-600 hover:text-blue-900 font-semibold 
                                 flex items-center gap-2 ml-auto"
                      >
                        Voir détails
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
        {patients.filter(patient => 
          patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.prenom.toLowerCase().includes(searchTerm.toLowerCase())
        ).length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Aucun patient trouvé</h3>
            <p className="text-gray-600 mt-2">Essayez avec d'autres critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};