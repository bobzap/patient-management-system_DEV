'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Star, Pencil, Trash2, Save, X, Plus } from 'lucide-react';

interface RisqueProfessionnel {
  id: number;
  nom: string;
  lien: string;
  estFavori: boolean;
}

export const RisquesProfessionnels = () => {
  const [risques, setRisques] = useState<RisqueProfessionnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRisque, setNewRisque] = useState({ nom: '', lien: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ nom: '', lien: '' });

  // Charger les risques
  const fetchRisques = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/risques-professionnels');
      const result = await response.json();
      
      if (result.success) {
        setRisques(result.data);
      } else {
        toast.error('Erreur lors du chargement des risques');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRisques();
  }, []);

  // Ajouter un nouveau risque
  const handleAddRisque = async () => {
    try {
      if (!newRisque.nom || !newRisque.lien) {
        toast.error('Le nom et le lien sont requis');
        return;
      }

      const response = await fetch('/api/risques-professionnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRisque)
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Risque ajouté avec succès');
        setNewRisque({ nom: '', lien: '' });
        fetchRisques();
      } else {
        toast.error(result.error || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Supprimer un risque
  const handleDeleteRisque = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce risque ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/risques-professionnels/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Risque supprimé avec succès');
        setRisques(risques.filter(r => r.id !== id));
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Basculer le statut de favori
  const handleToggleFavorite = async (id: number) => {
    try {
      const response = await fetch(`/api/risques-professionnels/${id}`, {
        method: 'PATCH'
      });

      const result = await response.json();
      
      if (result.success) {
        setRisques(risques.map(r => 
          r.id === id ? { ...r, estFavori: !r.estFavori } : r
        ));
        toast.success('Statut de favori mis à jour');
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Démarrer l'édition
  const startEditing = (risque: RisqueProfessionnel) => {
    setEditingId(risque.id);
    setEditData({ nom: risque.nom, lien: risque.lien });
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingId(null);
    setEditData({ nom: '', lien: '' });
  };

  // Enregistrer les modifications
  const saveEditing = async () => {
    if (!editingId) return;
    
    try {
      if (!editData.nom || !editData.lien) {
        toast.error('Le nom et le lien sont requis');
        return;
      }

      const response = await fetch(`/api/risques-professionnels/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      const result = await response.json();
      
      if (result.success) {
        setRisques(risques.map(r => 
          r.id === editingId ? { ...r, ...editData } : r
        ));
        toast.success('Risque mis à jour avec succès');
        cancelEditing();
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Gestion des Risques Professionnels</h2>
      
      {/* Formulaire d'ajout */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-md font-semibold mb-4">Ajouter un nouveau risque</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du risque</label>
            <input
              type="text"
              value={newRisque.nom}
              onChange={(e) => setNewRisque({ ...newRisque, nom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nom du risque professionnel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lien</label>
            <input
              type="text"
              value={newRisque.lien}
              onChange={(e) => setNewRisque({ ...newRisque, lien: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://exemple.com/page-risque"
            />
          </div>
        </div>
        <button
          onClick={handleAddRisque}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>
      
      {/* Liste des risques */}
      <div>
        <h3 className="text-md font-semibold mb-4">Liste des risques professionnels</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : risques.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Aucun risque professionnel enregistré
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favori</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lien</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {risques.map(risque => (
                  <tr key={risque.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFavorite(risque.id)}
                        className={`p-1 rounded-full ${risque.estFavori ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
                      >
                        <Star size={20} fill={risque.estFavori ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {editingId === risque.id ? (
                        <input
                          type="text"
                          value={editData.nom}
                          onChange={(e) => setEditData({ ...editData, nom: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span>{risque.nom}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {editingId === risque.id ? (
                        <input
                          type="text"
                          value={editData.lien}
                          onChange={(e) => setEditData({ ...editData, lien: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <a
                          href={risque.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {risque.lien}
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {editingId === risque.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={saveEditing}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Enregistrer"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            title="Annuler"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEditing(risque)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="Modifier"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteRisque(risque.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};