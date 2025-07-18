// src/components/consent/ConsentHistory.tsx
import React from 'react';
import { X, History, User, Calendar } from 'lucide-react';
import { ConsentHistoryItem } from './ConsentManagement';
import { ConsentStatusBadge } from './ConsentStatusBadge';

interface ConsentHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: ConsentHistoryItem[];
  patientName?: string;
}

export const ConsentHistory: React.FC<ConsentHistoryProps> = ({
  isOpen,
  onClose,
  history,
  patientName
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Historique du consentement
              </h2>
              {patientName && (
                <p className="text-sm text-gray-600">Patient: {patientName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun historique disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  className="relative bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  {/* Ligne de connexion */}
                  {index < history.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    {/* Icône et indicateur */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <ConsentStatusBadge 
                            status={item.ancienStatus} 
                            size="sm" 
                          />
                          <span className="text-gray-400">→</span>
                          <ConsentStatusBadge 
                            status={item.nouveauStatus} 
                            size="sm" 
                          />
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(item.dateModification)}
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="space-y-1 text-sm">
                        {item.raisonModification && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-0">
                              Raison:
                            </span>
                            <span className="text-gray-600 break-words">
                              {item.raisonModification}
                            </span>
                          </div>
                        )}
                        
                        {item.modifiePar && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              Modifié par: {item.modifiePar}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};