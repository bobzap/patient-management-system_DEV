// src/components/consent/ConsentAlert.tsx
import React from 'react';
import { AlertCircle, Clock, X, Calendar, Shield, Info } from 'lucide-react';
import { ConsentStatus } from './ConsentManagement';

interface ConsentAlertProps {
  status: ConsentStatus;
  patientName?: string;
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const ConsentAlert: React.FC<ConsentAlertProps> = ({
  status,
  patientName,
  className = '',
  onDismiss,
  showDismiss = false
}) => {
  const getAlertConfig = (status: ConsentStatus) => {
    switch (status) {
      case 'REFUSED':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-red-800',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Consentement refusé',
          message: 'Le patient a refusé le traitement de ses données. Seules les données essentielles aux soins peuvent être traitées.',
          actions: [
            'Documenter le refus dans le dossier patient',
            'Limiter le traitement aux données strictement nécessaires',
            'Informer l\'équipe soignante des restrictions'
          ]
        };
      
      case 'PENDING':
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-orange-800',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Consentement en attente',
          message: 'Le consentement du patient doit être clarifiée avant de procéder aux analyses.',
          actions: [
            'Contacter le patient pour clarifier sa position',
            'Programmer un entretien dédié au consentement',
            'Documenter les tentatives de contact'
          ]
        };
      
      case 'REVOKED':
        return {
          icon: <X className="w-5 h-5" />,
          color: 'text-red-800',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Consentement révoqué',
          message: 'Le patient a révoqué son consentement. Vérifiez les implications légales.',
          actions: [
            'Arrêter immédiatement le traitement des données',
            'Vérifier les obligations de suppression',
            'Informer les services concernés'
          ]
        };
      
      case 'EXPIRED':
        return {
          icon: <Calendar className="w-5 h-5" />,
          color: 'text-yellow-800',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Consentement expiré',
          message: 'Le consentement a expiré selon les exigences légales. Un renouvellement est nécessaire.',
          actions: [
            'Obtenir un nouveau consentement du patient',
            'Suspendre les analyses en cours',
            'Réviser les politiques de renouvellement'
          ]
        };
      
      case 'ACCEPTED':
        return {
          icon: <Shield className="w-5 h-5" />,
          color: 'text-green-800',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Consentement valide',
          message: 'Le patient a donné son consentement. Le traitement des données est autorisé.',
          actions: [
            'Respecter les limites du consentement donné',
            'Maintenir la sécurité des données',
            'Documenter les traitements effectués'
          ]
        };
      
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          color: 'text-blue-800',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Consentement non défini',
          message: 'Le statut du consentement n\'est pas défini. Une action est requise.',
          actions: [
            'Définir le statut du consentement',
            'Contacter le patient si nécessaire',
            'Documenter la décision'
          ]
        };
    }
  };

  const config = getAlertConfig(status);

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor} border rounded-xl p-4 
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`${config.color} mt-0.5 flex-shrink-0`}>
            {config.icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className={`font-semibold ${config.color}`}>
                {config.title}
              </h4>
              {patientName && (
                <span className="text-sm text-gray-600">
                  - {patientName}
                </span>
              )}
            </div>
            
            <p className={`text-sm ${config.color} mb-3`}>
              {config.message}
            </p>
            
            {/* Actions recommandées */}
            <div className="space-y-1">
              <p className={`text-xs font-medium ${config.color} mb-2`}>
                Actions recommandées :
              </p>
              <ul className="space-y-1">
                {config.actions.map((action, index) => (
                  <li key={index} className={`text-xs ${config.color} flex items-start space-x-2`}>
                    <span className="text-current mt-1">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${config.color} hover:opacity-70 ml-4 flex-shrink-0`}
            title="Fermer l'alerte"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};