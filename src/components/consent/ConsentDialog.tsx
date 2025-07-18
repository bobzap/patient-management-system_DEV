// src/components/consent/ConsentDialog.tsx
import React, { useState } from 'react';
import { Info, Check, X, Clock, AlertCircle, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { ConsentStatus } from './ConsentManagement';

interface ConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: ConsentStatus, commentaire?: string, raisonModification?: string) => void;
  currentStatus?: ConsentStatus;
  patientName?: string;
  isCreationMode?: boolean;
  isLoading?: boolean;
}

export const ConsentDialog: React.FC<ConsentDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentStatus,
  patientName,
  isCreationMode = false,
  isLoading = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ConsentStatus>(currentStatus || 'PENDING');
  const [commentaire, setCommentaire] = useState('');
  const [raisonModification, setRaisonModification] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedStatus, commentaire || undefined, raisonModification || undefined);
  };

  const getStatusConfig = (status: ConsentStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          icon: <Check className="w-4 h-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Accepté',
          description: 'Le patient accepte le traitement de ses données personnelles de santé'
        };
      case 'REFUSED':
        return {
          icon: <X className="w-4 h-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Refusé',
          description: 'Le patient refuse le traitement de ses données personnelles de santé'
        };
      case 'PENDING':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'En attente',
          description: 'Le consentement du patient est en attente de clarification'
        };
      case 'REVOKED':
        return {
          icon: <X className="w-4 h-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Révoqué',
          description: 'Le patient a révoqué son consentement précédemment donné'
        };
      case 'EXPIRED':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Expiré',
          description: 'Le consentement a expiré et doit être renouvelé'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Non défini',
          description: 'Statut de consentement non défini'
        };
    }
  };

  const statusOptions: ConsentStatus[] = ['ACCEPTED', 'REFUSED', 'PENDING', 'REVOKED', 'EXPIRED'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isCreationMode ? 'Consentement initial' : 'Mise à jour du consentement'}
                </h2>
                {patientName && (
                  <p className="text-sm text-gray-600">Patient: {patientName}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Information légale */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Traitement des données personnelles de santé
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Conformément à la Loi fédérale sur la protection des données (LPD) suisse, :
              La Loi fédérale sur la protection des données (LPD) est la législation suisse qui protège les données personnelles des individus, entrée en vigueur le 1er septembre 2023. 
              Elle impose aux organisations de traiter les données de manière transparente, sécurisée et avec le consentement approprié, tout en accordant aux personnes des droits sur leurs données (accès, rectification, effacement). 

                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>• <strong>Finalité:</strong> Soins infirmiers suivi de l'état de santé du collaborateur au travail</p>
                    <p>• <strong>Sécurité:</strong> Données chiffrées et anonymisées</p>
                    <p>• <strong>Commercialisation:</strong> Aucune vente de données</p>
                    <p>• <strong>Droit:</strong> Informer les droits des patients dans la LPD</p>
                  </div>
                  <a 
                    href="https://www.kmu.admin.ch/kmu/fr/home/faits-et-tendances/digitalisation/protection-des-donnees.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-blue-700 hover:text-blue-800 underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Plus d'informations sur la LPD
                  </a>
                </div>
              </div>
            </div>

            {/* Sélection du statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Statut du consentement <span className="text-red-500">*</span>
              </label>
              
              <div className="space-y-2">
                {statusOptions.map((status) => {
                  const config = getStatusConfig(status);
                  return (
                    <label 
                      key={status} 
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedStatus === status 
                          ? `${config.bgColor} ${config.borderColor} border-2` 
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={selectedStatus === status}
                        onChange={(e) => setSelectedStatus(e.target.value as ConsentStatus)}
                        className="mt-1 text-blue-600"
                        required
                      />
                      <div className="flex-1">
                        <div className={`flex items-center gap-2 ${config.color}`}>
                          {config.icon}
                          <span className="font-medium">{config.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {config.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Ajoutez un commentaire si nécessaire..."
              />
            </div>

            {/* Raison de modification (seulement en mode modification) */}
            {!isCreationMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison de la modification
                </label>
                <input
                  type="text"
                  value={raisonModification}
                  onChange={(e) => setRaisonModification(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Demande du patient, mise à jour légale..."
                />
              </div>
            )}

            {/* Avertissement selon le statut */}
            {selectedStatus === 'REFUSED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-900">Implications du refus</h4>
                    <p className="text-sm text-red-800 mt-1">
                      En cas de refus, seules les données strictement nécessaires aux soins 
                      peuvent être traitées. Les analyses statistiques et optimisations 
                      basées sur les données du patient ne pourront pas être réalisées,
                      elles seront à minima anonymisées.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedStatus === 'REVOKED' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Révocation du consentement</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      La révocation implique l'arrêt du traitement des données pour les 
                      analyses internes. Vérifiez les procédures de suppression des 
                      données existantes selon les exigences légales.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};