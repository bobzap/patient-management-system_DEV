// src/components/consent/ConsentSelector.tsx
// Version simplifiée pour la création de patient
import React, { useState } from 'react';
import { ShieldCheck, Check, X, Clock, AlertCircle, Calendar } from 'lucide-react';

export type ConsentStatus = 'ACCEPTED' | 'REFUSED' | 'PENDING';

interface ConsentSelectorProps {
  onConsentChange?: (status: ConsentStatus, commentaire?: string) => void;
  className?: string;
}

export const ConsentSelector: React.FC<ConsentSelectorProps> = ({
  onConsentChange,
  className = ''
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ConsentStatus>('PENDING');
  const [commentaire, setCommentaire] = useState('');

  const handleStatusChange = (status: ConsentStatus) => {
    setSelectedStatus(status);
    onConsentChange?.(status, commentaire);
  };

  const handleCommentChange = (comment: string) => {
    setCommentaire(comment);
    onConsentChange?.(selectedStatus, comment);
  };

  const getStatusConfig = (status: ConsentStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          icon: <Check className="w-4 h-4" />,
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          label: 'Accepté'
        };
      case 'REFUSED':
        return {
          icon: <X className="w-4 h-4" />,
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          label: 'Refusé'
        };
      case 'PENDING':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-300',
          label: 'En attente'
        };
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Information légale LPD */}
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-1 bg-rose-100 rounded-full">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-900 mb-1">Consentement LPD requis</h3>
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
            <p className="text-gray-800"><strong className="text-gray-900">Droits :</strong> Informer les droits des patients dans la LPD</p>
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
            Plus d'informations sur la LPD
          </a>
        </div>
      </div>

      {/* Sélection du statut */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Statut du consentement <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {(['ACCEPTED', 'REFUSED', 'PENDING'] as ConsentStatus[]).map((status) => {
            const config = getStatusConfig(status);
            return (
              <label 
                key={status} 
                className={`
                  flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedStatus === status 
                    ? `${config.bgColor} ${config.borderColor} border-2` 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="consent-status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={(e) => handleStatusChange(e.target.value as ConsentStatus)}
                  className="text-rose-600"
                />
                <div className={`flex items-center gap-2 ${config.color}`}>
                  {config.icon}
                  <span className="font-medium">{config.label}</span>
                </div>
                <span className="text-sm text-gray-600 flex-1">
                  {status === 'ACCEPTED' && 'Le patient accepte le traitement de ses données'}
                  {status === 'REFUSED' && 'Le patient refuse le traitement de ses données'}
                  {status === 'PENDING' && 'En attente de clarification avec le patient'}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Commentaire optionnel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire (optionnel)
        </label>
        <textarea
          value={commentaire}
          onChange={(e) => handleCommentChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={2}
          placeholder="Commentaire sur le consentement..."
        />
      </div>

      {/* Alerte selon le statut */}
      {selectedStatus === 'REFUSED' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-900 text-sm">Attention</h4>
              <p className="text-sm text-red-800 mt-1">
                En cas de refus, seules les données essentielles aux soins seront traitées.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};