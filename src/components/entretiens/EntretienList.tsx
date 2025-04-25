// src/components/entretiens/EntretienList.tsx (modifications seulement)
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog'; // Importer le nouveau composant

interface EntretienListProps {
  patientId: number;
  refreshTrigger?: number;
  onEntretienSelect: (entretienId: number, isReadOnly: boolean) => void;
  onNewEntretien: () => void;
  onDelete?: (entretienId: number) => void;
}

export const EntretienList = ({ 
  patientId, 
  refreshTrigger = 0,
  onEntretienSelect, 
  onNewEntretien,
  onDelete 
}: EntretienListProps) => {

  const [entretiens, setEntretiens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // États pour la boîte de dialogue de confirmation
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [entretienToDelete, setEntretienToDelete] = useState<number | null>(null);

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
  }, [patientId, refreshTrigger]);

  // Remplaçons la fonction handleDelete existante
  const handleDelete = (entretienId: number) => {
    setEntretienToDelete(entretienId);
    setShowConfirmDialog(true);
  };

  // Ajoutons une fonction pour confirmer la suppression
  const confirmDelete = async () => {
    if (entretienToDelete === null) return;
    
    try {
      const response = await fetch(`/api/entretiens/${entretienToDelete}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Entretien supprimé avec succès');
        
        // Mettre à jour la liste des entretiens localement
        setEntretiens(prev => prev.filter(e => e.id !== entretienToDelete));
        
        // Si un callback onDelete est fourni, l'appeler pour notifier le parent
        if (onDelete) onDelete(entretienToDelete);
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    }
  };


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
  <div className="flex items-center justify-end gap-2">
    <button 
      onClick={(e) => {
        e.stopPropagation(); // Empêcher la propagation pour ne pas déclencher le onClick de la ligne
        onEntretienSelect(entretien.id, true); // true pour le mode consultation
      }}
      className="text-blue-600 hover:text-blue-900 px-2 py-1"
    >
      Voir
    </button>
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onEntretienSelect(entretien.id, false); // false pour le mode édition
      }}
      className="text-green-600 hover:text-green-900 px-2 py-1"
    >
      Modifier
    </button>
    <button 
      onClick={(e) => {
        e.stopPropagation();
        handleDelete(entretien.id);
      }}
      className="text-red-600 hover:text-red-900 px-2 py-1"
    >
      Supprimer
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

<ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDelete}
        title="Supprimer cet entretien"
        message="Êtes-vous sûr de vouloir supprimer cet entretien ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    
    </div>
  );
};