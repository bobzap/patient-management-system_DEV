// src/components/auth/BackupCodesDisplay.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check, Download, AlertTriangle, Shield } from 'lucide-react';

interface BackupCodesDisplayProps {
  codes: string[];
  onComplete?: () => void;
}

export function BackupCodesDisplay({ codes, onComplete }: BackupCodesDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleCopyCodes = async () => {
    const codesText = codes.join('\n');
    try {
      await navigator.clipboard.writeText(codesText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie codes:', err);
    }
  };

  const handleDownloadCodes = () => {
    const codesText = [
      'CODES DE RÉCUPÉRATION - VITAL SYNC',
      '=====================================',
      '',
      'IMPORTANT : Gardez ces codes en sécurité !',
      'Chaque code ne peut être utilisé qu\'une seule fois.',
      '',
      'Codes :',
      ...codes.map((code, index) => `${index + 1}. ${code}`),
      '',
      `Générés le : ${new Date().toLocaleString('fr-FR')}`,
      '',
      'ATTENTION :',
      '- Ne partagez jamais ces codes',
      '- Stockez-les dans un endroit sûr',
      '- Utilisez-les uniquement en cas de perte d\'accès à votre app 2FA'
    ].join('\n');

    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vital-sync-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    if (!isConfirmed) {
      setIsConfirmed(true);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Shield className="mx-auto h-12 w-12 text-green-600" />
        <h3 className="text-lg font-semibold">Codes de récupération</h3>
        <p className="text-gray-600">
          Sauvegardez ces codes de secours en lieu sûr
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important :</strong> Ces codes vous permettront d'accéder à votre compte 
          si vous perdez votre téléphone. Chaque code ne peut être utilisé qu'une seule fois.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {codes.map((code, index) => (
              <div 
                key={index}
                className="p-2 bg-gray-50 rounded text-center border"
              >
                {code}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={handleCopyCodes}
          className="flex-1 flex items-center justify-center space-x-2"
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copié</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copier</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadCodes}
          className="flex-1 flex items-center justify-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Télécharger</span>
        </Button>
      </div>

      {!isConfirmed ? (
        <Alert>
          <AlertDescription>
            Assurez-vous d'avoir sauvegardé ces codes avant de continuer. 
            Vous ne pourrez plus les voir après cette étape.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Parfait ! Votre double authentification est maintenant configurée.
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleComplete}
        className="w-full"
        variant={isConfirmed ? "default" : "outline"}
      >
        {isConfirmed ? 'Terminer la configuration' : 'J\'ai sauvegardé les codes'}
      </Button>

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Conseils de sécurité :</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Stockez ces codes dans un gestionnaire de mots de passe</li>
          <li>Imprimez-les et rangez-les dans un coffre-fort</li>
          <li>Ne les partagez avec personne</li>
          <li>Vous pouvez régénérer de nouveaux codes à tout moment</li>
        </ul>
      </div>
    </div>
  );
}