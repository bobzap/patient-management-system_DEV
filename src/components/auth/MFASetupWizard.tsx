// src/components/auth/MFASetupWizard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRCodeDisplay } from './QRCodeDisplay';
import { BackupCodesDisplay } from './BackupCodesDisplay';
import { Shield, Smartphone, Key, CheckCircle } from 'lucide-react';

type SetupStep = 'intro' | 'qr-code' | 'verify' | 'backup-codes' | 'complete';

interface MFASetupData {
  qrCodeUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}

interface MFASetupWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function MFASetupWizard({ onComplete, onCancel }: MFASetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('intro');
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la configuration');
      }

      const data = await response.json();
      setSetupData(data);
      setCurrentStep('qr-code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Veuillez saisir un code à 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Code incorrect');
      }

      setCurrentStep('backup-codes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de vérification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSetup = () => {
    setCurrentStep('complete');
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Shield className="mx-auto h-16 w-16 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Sécurisez votre compte</h3>
                <p className="text-gray-600">
                  La double authentification ajoute une couche de sécurité supplémentaire à votre compte.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Application d'authentification requise</p>
                  <p className="text-gray-600">
                    Google Authenticator, Authy, 1Password ou similaire
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Codes de récupération</p>
                  <p className="text-gray-600">
                    10 codes de secours en cas de perte d'accès
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleStartSetup} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Configuration...' : 'Commencer la configuration'}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
          </div>
        );

      case 'qr-code':
        return setupData ? (
          <QRCodeDisplay
            qrCodeUrl={setupData.qrCodeUrl}
            manualEntryKey={setupData.manualEntryKey}
            onNext={() => setCurrentStep('verify')}
            onCancel={onCancel}
          />
        ) : null;

      case 'verify':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Vérifiez la configuration</h3>
              <p className="text-gray-700">
                Saisissez le code à 6 chiffres de votre application d'authentification
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="verification-code" className="text-gray-900 font-medium">Code de vérification</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setVerificationCode(value);
                    }
                  }}
                  placeholder="000000"
                  className="text-center text-lg tracking-widest border-2 border-gray-300 focus:border-blue-500 bg-white"
                  maxLength={6}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-3">
                <Button 
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? 'Vérification...' : 'Vérifier et activer'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('qr-code')}
                >
                  Retour
                </Button>
              </div>
            </div>
          </div>
        );

      case 'backup-codes':
        return setupData ? (
          <BackupCodesDisplay
            codes={setupData.backupCodes}
            onComplete={handleCompleteSetup}
          />
        ) : null;

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Double authentification activée !
              </h3>
              <p className="text-gray-600">
                Votre compte est maintenant sécurisé par la 2FA
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Double Authentification</span>
        </CardTitle>
        <CardDescription>
          {currentStep === 'intro' && 'Configuration de la sécurité renforcée'}
          {currentStep === 'qr-code' && 'Étape 1 : Scanner le QR code'}
          {currentStep === 'verify' && 'Étape 2 : Vérification'}
          {currentStep === 'backup-codes' && 'Étape 3 : Codes de récupération'}
          {currentStep === 'complete' && 'Configuration terminée'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && currentStep === 'intro' && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {renderStep()}
      </CardContent>
    </Card>
  );
}