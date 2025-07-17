// src/components/auth/MFAVerificationForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Smartphone, Key, AlertCircle, Clock } from 'lucide-react';

interface MFAVerificationFormProps {
  onVerificationSuccess?: () => void;
  onCancel?: () => void;
  isRequired?: boolean;
  title?: string;
  description?: string;
}

export function MFAVerificationForm({ 
  onVerificationSuccess, 
  onCancel, 
  isRequired = false,
  title = "Vérification 2FA",
  description = "Saisissez votre code d'authentification"
}: MFAVerificationFormProps) {
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockTime, setUnlockTime] = useState<Date | null>(null);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState<number | null>(null);

  const handleTOTPVerification = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError('Veuillez saisir un code à 6 chiffres');
      return;
    }

    await verifyMFA(totpCode, false);
  };

  const handleTOTPKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && totpCode.length === 6) {
      e.preventDefault();
      handleTOTPVerification();
    }
  };

  const handleBackupVerification = async () => {
    if (!backupCode || backupCode.length !== 8) {
      setError('Veuillez saisir un code de récupération valide');
      return;
    }

    await verifyMFA(backupCode.toUpperCase(), true);
  };

  const handleBackupKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && backupCode.length === 8) {
      e.preventDefault();
      handleBackupVerification();
    }
  };

  const verifyMFA = async (code: string, isBackupCode: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          isBackupCode 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (isBackupCode && data.remainingBackupCodes !== undefined) {
          setRemainingBackupCodes(data.remainingBackupCodes);
        }
        
        // Appeler le callback de succès au lieu de rediriger directement
        if (onVerificationSuccess) {
          onVerificationSuccess();
        } else {
          // Fallback si pas de callback (ne devrait pas arriver)
          window.location.href = '/';
        }
      } else {
        setError(data.error || 'Code incorrect');
        
        if (data.isLocked) {
          setIsLocked(true);
          setUnlockTime(data.unlockAt ? new Date(data.unlockAt) : null);
        }
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const formatUnlockTime = (time: Date | null) => {
    if (!time) return '';
    const diff = time.getTime() - Date.now();
    const minutes = Math.ceil(diff / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  if (isLocked) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Compte temporairement verrouillé</CardTitle>
          <CardDescription>
            Trop de tentatives échouées ont été détectées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Votre compte sera déverrouillé dans {formatUnlockTime(unlockTime)}.
              Contactez l'administrateur si vous avez besoin d'aide.
            </AlertDescription>
          </Alert>
          
          {!isRequired && (
            <Button variant="outline" onClick={onCancel} className="w-full">
              Retour
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="totp" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>App 2FA</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Code secours</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totp-code" className="text-gray-900 font-medium">Code d'authentification</Label>
              <Input
                id="totp-code"
                value={totpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setTotpCode(value);
                  }
                }}
                onKeyPress={handleTOTPKeyPress}
                placeholder="000000"
                className="text-center text-lg tracking-widest border-2 border-gray-300 focus:border-blue-500 bg-white text-gray-900"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-gray-700 font-medium">
                Ouvrez votre application d'authentification et saisissez le code à 6 chiffres
              </p>
            </div>

            <Button
              onClick={handleTOTPVerification}
              disabled={isLoading || totpCode.length !== 6}
              className="w-full"
            >
              {isLoading ? 'Vérification...' : 'Vérifier'}
            </Button>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backup-code" className="text-gray-900 font-medium">Code de récupération</Label>
              <Input
                id="backup-code"
                value={backupCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-F0-9]/gi, '').toUpperCase();
                  if (value.length <= 8) {
                    setBackupCode(value);
                  }
                }}
                onKeyPress={handleBackupKeyPress}
                placeholder="XXXXXXXX"
                className="text-center text-lg tracking-widest font-mono border-2 border-gray-300 focus:border-blue-500 bg-white text-gray-900"
                maxLength={8}
              />
              <p className="text-xs text-gray-700 font-medium">
                Utilisez l'un de vos codes de récupération de 8 caractères
              </p>
            </div>

            <Button
              onClick={handleBackupVerification}
              disabled={isLoading || backupCode.length !== 8}
              className="w-full"
            >
              {isLoading ? 'Vérification...' : 'Utiliser le code de secours'}
            </Button>

            {remainingBackupCodes !== null && (
              <Alert>
                <AlertDescription>
                  Il vous reste {remainingBackupCodes} code{remainingBackupCodes > 1 ? 's' : ''} de récupération.
                  {remainingBackupCodes <= 2 && ' Pensez à en régénérer de nouveaux.'}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isRequired && (
          <div className="mt-4">
            <Button variant="outline" onClick={onCancel} className="w-full">
              Annuler
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}