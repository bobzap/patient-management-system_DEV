// src/components/entretiens/EntretienList.tsx

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [entretienToDelete, setEntretienToDelete] = useState<number | null>(null);

  useEffect(() => {
    // Charger les entretiens du patient
    const fetchEntretiens = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/patients/${patientId}/entretiens`);
        const data = await response.json();
        setEntretiens(data.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des entretiens:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    // Toujours recharger les données quand refreshTrigger change
    fetchEntretiens();
    
  }, [patientId, refreshTrigger]);

  const handleDelete = (entretienId: number) => {
    setEntretienToDelete(entretienId);
    setShowConfirmDialog(true);
  };

  // Dans src/components/entretiens/EntretienList.tsx

const confirmDelete = async () => {
  if (entretienToDelete === null) return;
  
  try {
    const response = await fetch(`/api/entretiens/${entretienToDelete}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      // Fermer la boîte de dialogue AVANT de manipuler les données
      setShowConfirmDialog(false);
      setEntretienToDelete(null);
      
      // Mise à jour locale de la liste des entretiens
      setEntretiens(prev => prev.filter(e => e.id !== entretienToDelete));
      
      // Notification de succès
      toast.success('Entretien supprimé avec succès');
      
      // Notification au parent si callback fourni
      if (onDelete) onDelete(entretienToDelete);
    } else {
      // Gérer l'erreur
      const errorData = await response.text();
      console.error('Erreur de suppression:', errorData);
      toast.error('Erreur lors de la suppression');
      
      // Fermer quand même la boîte de dialogue en cas d'erreur
      setShowConfirmDialog(false);
      setEntretienToDelete(null);
    }
  } catch (error) {
    console.error('Erreur:', error);
    toast.error('Une erreur est survenue');
    
    // Fermer quand même la boîte de dialogue en cas d'erreur
    setShowConfirmDialog(false);
    setEntretienToDelete(null);
  }
};

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const calculateDuration = (entretien: any): number => {
    // Si pas de temps de début, retourner 0
    if (!entretien.tempsDebut) return 0;
    
    const debut = new Date(entretien.tempsDebut);
    let fin;
    
    // Si l'entretien est finalisé ou archivé et a un tempsFin, utiliser tempsFin
    if ((entretien.status === 'finalise' || entretien.status === 'archive') && entretien.tempsFin) {
      fin = new Date(entretien.tempsFin);
    } 
    // Sinon, utiliser la date actuelle
    else {
      fin = new Date();
    }
    
    // Calculer la différence en secondes
    let durationSeconds = Math.floor((fin.getTime() - debut.getTime()) / 1000);
    
    // Soustraire le temps de pause si disponible
    if (entretien.tempsPause) {
      durationSeconds -= entretien.tempsPause;
    }
    
    // Si en pause et qu'il y a une dernière pause, soustraire ce temps aussi
    if (entretien.enPause && entretien.dernierePause) {
      const dernierePause = new Date(entretien.dernierePause);
      const pauseDuration = Math.floor((fin.getTime() - dernierePause.getTime()) / 1000);
      durationSeconds -= pauseDuration;
    }
    
    return Math.max(0, durationSeconds);
  };
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'finalise': return 'bg-green-100 text-green-800';
      case 'archive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'finalise': return 'Finalisé';
      case 'archive': return 'Archivé';
      default: return 'Brouillon';
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
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dernière modification
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {entretiens.map((entretien) => (
                <tr 
                  key={entretien.id}
                  className="hover:bg-gray-50"
                  // Supprimez le onClick ici pour désactiver le clic sur la ligne
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entretien.dateCreation).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entretien.numeroEntretien}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm text-gray-900">
                      {formatDuration(calculateDuration(entretien))}
                    </div>
                    
                    {/* Indiquer clairement si l'entretien est en pause */}
                    {entretien.enPause && entretien.status === 'brouillon' && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full ml-2">
                        En pause
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(entretien.status)}`}>
                      {getStatusText(entretien.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entretien.dateModification).toLocaleString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <button 
    onClick={() => onEntretienSelect(entretien.id, true)} // Mode consultation
    className="text-blue-600 hover:text-blue-900 px-2 py-1"
  >
    Voir
  </button>
  <button 
    onClick={() => onEntretienSelect(entretien.id, false)} // Mode édition
    className="text-green-600 hover:text-green-900 px-2 py-1"
  >
    {entretien.status !== 'brouillon' ? 'Rouvrir' : 'Modifier'}
  </button>
  <button 
    onClick={() => handleDelete(entretien.id)}
    className="text-red-600 hover:text-red-900 px-2 py-1"
  >
    Supprimer
  </button>
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