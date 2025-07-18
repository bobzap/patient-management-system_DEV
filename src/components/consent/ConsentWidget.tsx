// src/components/consent/ConsentWidget.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Check, X, Clock, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export type ConsentStatus = 'ACCEPTED' | 'REFUSED' | 'PENDING';

interface ConsentData {
  id: string;
  status: ConsentStatus;
  dateModification: string;
  commentaire?: string;
}

interface ConsentWidgetProps {
  patientId: number;
  patientName?: string;
  isCreationMode?: boolean;
  onConsentChange?: (consent: ConsentData | null) => void;
  className?: string;
}

export const ConsentWidget: React.FC<ConsentWidgetProps> = ({
  patientId,
  patientName,
  isCreationMode = false,
  onConsentChange,
  className = ''
}) => {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ConsentStatus>('PENDING');
  const [commentaire, setCommentaire] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Charger le consentement existant
  useEffect(() => {
    if (!isCreationMode && patientId) {
      loadConsent();
    }
  }, [patientId, isCreationMode]);

  // Gérer la fermeture avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll de la page derrière la modale
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const loadConsent = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/consent`);
      if (response.ok) {
        const result = await response.json();
        setConsent(result.data);
        onConsentChange?.(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du consentement:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${patientId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          commentaire: commentaire || undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        setConsent(result.data);
        onConsentChange?.(result.data);
        setShowModal(false);
        setCommentaire('');
        toast.success('Consentement mis à jour');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setSelectedStatus(consent?.status || 'PENDING');
    setCommentaire(consent?.commentaire || '');
    setShowModal(true);
  };

  const getStatusConfig = (status: ConsentStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          icon: <Check className="w-4 h-4" />,
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          label: 'Accepté'
        };
      case 'REFUSED':
        return {
          icon: <X className="w-4 h-4" />,
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          label: 'Refusé'
        };
      case 'PENDING':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          label: 'En attente'
        };
    }
  };

  const currentStatus = consent?.status || 'PENDING';
  const statusConfig = getStatusConfig(currentStatus);

  return (
    <div className={className}>
      {/* Widget principal */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Consentement LPD</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={openModal}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium 
              border transition-all hover:scale-105 hover:shadow-md
              ${statusConfig.bgColor} ${statusConfig.color}
            `}
          >
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </button>
          
          {consent && (
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Mis à jour le</span>
              </div>
              <div className="font-medium text-gray-700">
                {new Date(consent.dateModification).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(consent.dateModification).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>
        
        {consent?.commentaire && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic">
            "{consent.commentaire}"
          </div>
        )}
      </div>

      {/* Modale rendue via Portal pour sortir du conteneur parent */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Arrière-plan flou */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>
          
          {/* Contenu centré */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
              
              {/* En-tête */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Consentement LPD</h2>
                      <p className="text-rose-100 text-sm">Loi suisse sur la protection des données</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {patientName && (
                  <div className="mt-4 p-3 bg-white/10 rounded-lg">
                    <p className="text-sm font-medium">Patient: {patientName}</p>
                  </div>
                )}
              </div>

              {/* Contenu principal */}
              <div className="p-6 space-y-6">
                
                {/* Information légale */}
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-1 bg-rose-100 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-rose-900 mb-1">Information sur le traitement des données</h3>
                      <p className="text-xs text-rose-700">
                        Conformément à la Loi fédérale sur la protection des données (LPD) suisse, :
              La Loi fédérale sur la protection des données (LPD) est la législation suisse qui protège les données personnelles des individus, entrée en vigueur le 1er septembre 2023. 
              Elle impose aux organisations de traiter les données de manière transparente, sécurisée et avec le consentement approprié, tout en accordant aux personnes des droits sur leurs données (accès, rectification, effacement). 

                      </p>
                    </div>
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <p className="text-gray-800"><strong className="text-gray-900">Finalité :</strong> Soins infirmiers et suivi de l'état de santé du collaborateur au travail</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <p className="text-gray-800"><strong className="text-gray-900">Sécurité :</strong> Données chiffrées et anonymisées</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <p className="text-gray-800"><strong className="text-gray-900">Commercialisation :</strong> Aucune vente de données</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <p className="text-gray-800"><strong className="text-gray-900">Révocation :</strong> Informer les droits des patients dans la LPD</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-rose-200">
                    <a 
                      href="https://www.kmu.admin.ch/kmu/fr/home/faits-et-tendances/digitalisation/protection-des-donnees.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-800 underline"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Plus d'informations sur la LPD suisse
                    </a>
                  </div>
                </div>

                {/* Sélection du statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Statut du consentement <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {(['ACCEPTED', 'REFUSED', 'PENDING'] as ConsentStatus[]).map((status) => {
                      const config = getStatusConfig(status);
                      return (
                        <label 
                          key={status} 
                          className={`
                            flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${selectedStatus === status 
                              ? 'border-rose-500 bg-rose-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={selectedStatus === status}
                            onChange={(e) => setSelectedStatus(e.target.value as ConsentStatus)}
                            className="mt-1 text-rose-600"
                          />
                          <div className="flex-1">
                            <div className={`flex items-center gap-2 ${config.color} mb-1`}>
                              {config.icon}
                              <span className="font-medium">{config.label}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {status === 'ACCEPTED' && 'Le patient accepte le traitement de ses données personnelles'}
                              {status === 'REFUSED' && 'Le patient refuse le traitement de ses données personnelles'}
                              {status === 'PENDING' && 'Le consentement est en attente de clarification'}
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                    rows={3}
                    placeholder="Ajoutez un commentaire si nécessaire..."
                  />
                </div>

                {/* Alertes selon le statut */}
                {selectedStatus === 'REFUSED' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900">Implications du refus</h4>
                        <p className="text-sm text-red-800 mt-1">
                          En cas de refus, seules les données strictement nécessaires aux soins peuvent être traitées.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
        </div>,
        document.body
      )}
    </div>
  );
};