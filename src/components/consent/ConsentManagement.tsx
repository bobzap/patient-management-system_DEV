// src/components/consent/ConsentManagement.tsx
import React, { useState, useEffect } from 'react';
import { Info, Edit3, Check, X, Clock, AlertCircle, Shield, FileText, History, Calendar } from 'lucide-react';
import { ConsentDialog } from './ConsentDialog';
import { ConsentStatusBadge } from './ConsentStatusBadge';
import { ConsentHistory } from './ConsentHistory';
import { toast } from 'sonner';

export type ConsentStatus = 'ACCEPTED' | 'REFUSED' | 'PENDING' | 'REVOKED' | 'EXPIRED';

export interface ConsentData {
  id: string;
  patientId: number;
  status: ConsentStatus;
  dateConsent: string;
  dateModification: string;
  versionLpd: string;
  commentaire?: string;
  createdBy?: string;
  modifiedBy?: string;
  patient?: {
    id: number;
    nom: string;
    prenom: string;
    civilites: string;
  };
  historique?: ConsentHistoryItem[];
}

export interface ConsentHistoryItem {
  id: string;
  ancienStatus: ConsentStatus;
  nouveauStatus: ConsentStatus;
  dateModification: string;
  raisonModification?: string;
  modifiePar?: string;
}

interface ConsentManagementProps {
  patientId: number;
  patientName?: string;
  isCreationMode?: boolean;
  onConsentChange?: (consent: ConsentData | null) => void;
  className?: string;
}

export const ConsentManagement: React.FC<ConsentManagementProps> = ({
  patientId,
  patientName,
  isCreationMode = false,
  onConsentChange,
  className = ''
}) => {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le consentement existant
  useEffect(() => {
    if (!isCreationMode && patientId) {
      loadConsent();
    }
  }, [patientId, isCreationMode]);

  const loadConsent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/patients/${patientId}/consent`);
      const result = await response.json();
      
      if (response.ok) {
        setConsent(result.data);
        onConsentChange?.(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement du consentement');
      }
    } catch (err) {
      setError('Erreur réseau lors du chargement du consentement');
      console.error('Erreur lors du chargement du consentement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsentSave = async (status: ConsentStatus, commentaire?: string, raisonModification?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/patients/${patientId}/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          commentaire,
          raisonModification
        })
      });

      const result = await response.json();

      if (response.ok) {
        setConsent(result.data);
        onConsentChange?.(result.data);
        
        toast.success(result.message || 'Consentement mis à jour avec succès', {
          duration: 3000
        });
      } else {
        setError(result.error || 'Erreur lors de la sauvegarde');
        toast.error(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('Erreur réseau lors de la sauvegarde');
      toast.error('Erreur réseau lors de la sauvegarde');
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertContent = () => {
    if (!consent) return null;

    switch (consent.status) {
      case 'REFUSED':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-red-800',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Attention',
          message: 'Le patient a refusé le traitement de ses données. Seules les données essentielles aux soins peuvent être traitées.'
        };
      case 'PENDING':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-orange-800',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Action requise',
          message: 'Le consentement du patient est en attente. Veuillez clarifier avec le patient.'
        };
      case 'REVOKED':
        return {
          icon: <X className="w-4 h-4" />,
          color: 'text-red-800',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Consentement révoqué',
          message: 'Le patient a révoqué son consentement. Vérifiez les implications légales.'
        };
      case 'EXPIRED':
        return {
          icon: <Calendar className="w-4 h-4" />,
          color: 'text-yellow-800',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Consentement expiré',
          message: 'Le consentement a expiré. Un nouveau consentement est requis.'
        };
      default:
        return null;
    }
  };

  const alertContent = getAlertContent();

  if (isLoading && !consent) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section principale du consentement */}
      <div className="border rounded-lg p-4 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Consentement LPD</h3>
            </div>
            
            {consent && (
              <ConsentStatusBadge status={consent.status} />
            )}
          </div>

          <div className="flex items-center gap-2">
            {consent?.historique && consent.historique.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Voir l'historique"
              >
                <History className="w-3 h-3" />
                Historique
              </button>
            )}
            
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm">
                {consent ? 'Modifier' : 'Définir'}
              </span>
            </button>
          </div>
        </div>

        {/* Informations du consentement */}
        {consent && (
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                <strong>Dernière mise à jour:</strong> {new Date(consent.dateModification).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span>
                <strong>Version LPD:</strong> {consent.versionLpd}
              </span>
            </div>
            
            {consent.commentaire && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <strong>Commentaire:</strong> {consent.commentaire}
              </div>
            )}
          </div>
        )}

        {/* Alerte contextuelle */}
        {alertContent && (
          <div className={`mt-3 p-3 ${alertContent.bgColor} border ${alertContent.borderColor} rounded-lg`}>
            <div className={`flex items-center gap-2 ${alertContent.color}`}>
              {alertContent.icon}
              <span className="text-sm font-medium">{alertContent.title}</span>
            </div>
            <p className={`text-xs ${alertContent.color} mt-1`}>
              {alertContent.message}
            </p>
          </div>
        )}

        {/* Section pour mode création */}
        {isCreationMode && !consent && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Consentement requis</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Le consentement pour le traitement des données personnelles doit être défini lors de la création du dossier patient.
            </p>
          </div>
        )}

        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Erreur</span>
            </div>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConsentDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleConsentSave}
        currentStatus={consent?.status}
        patientName={patientName}
        isCreationMode={isCreationMode}
        isLoading={isLoading}
      />

      {consent?.historique && (
        <ConsentHistory
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          history={consent.historique}
          patientName={patientName}
        />
      )}
    </div>
  );
};