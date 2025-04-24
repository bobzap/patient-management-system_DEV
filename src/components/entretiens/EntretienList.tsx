'use client';

import { useState, useEffect } from 'react';

interface EntretienListProps {
  patientId: number;
  refreshTrigger?: number; // Nouveau prop
  onEntretienSelect: (entretienId: number) => void;
  onNewEntretien: () => void;
}

export const EntretienList = ({ 
  patientId, 
  refreshTrigger = 0,  // Valeur par défaut 
  onEntretienSelect, 
  onNewEntretien 
}: EntretienListProps) => {

  const [entretiens, setEntretiens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger les entretiens du patient
    const fetchEntretiens = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}/entretiens`);
        const data = await response.json();
        setEntretiens(data.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des entretiens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntretiens();
  }, [patientId,refreshTrigger ]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold text-gray-900">Historique des entretiens</h2>
        
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Chargement...</div>
      ) : entretiens.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Aucun entretien enregistré
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  N°
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dernière modification
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entretiens.map((entretien) => (
                <tr 
                  key={entretien.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onEntretienSelect(entretien.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entretien.dateCreation).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entretien.numeroEntretien}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
  <span className={`px-2 py-1 text-xs font-medium rounded-full
    ${entretien.statusInfo ? entretien.statusInfo.className : (
      entretien.status === 'brouillon' 
        ? 'bg-yellow-100 text-yellow-800'
        : entretien.status === 'finalise'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
    )}`}
  >
    {entretien.statusInfo ? entretien.statusInfo.label : (
      entretien.status === 'brouillon' 
        ? 'Brouillon'
        : entretien.status === 'finalise'
          ? 'Finalisé'
          : 'Archivé'
    )}
  </span>
</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entretien.dateModification).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};