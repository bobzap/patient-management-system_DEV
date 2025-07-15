// src/components/auth/MFASettings.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  ShieldCheck, 
  ShieldOff, 
  Key, 
  RefreshCw,
  AlertTriangle,
  Check,
  Clock
} from 'lucide-react';
import { MFASetupWizard } from './MFASetupWizard';

interface MFAStatus {
  isEnabled: boolean;
  hasBackupCodes: boolean;
  remainingBackupCodes: number;
  lastUsedAt?: string;
  isLocked: boolean;
  unlockAt?: string;
}

export function MFASettings() {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      const response = await fetch('/api/auth/mfa/status');
      if (response.ok) {
        const data = await response.json();
        setMfaStatus(data);
      }
    } catch (err) {
      console.error('Erreur récupération statut MFA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!password || !mfaCode) {
      setError('Mot de passe et code 2FA requis');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, mfaCode })
      });

      if (response.ok) {
        await fetchMFAStatus();
        setShowDisableForm(false);
        setPassword('');
        setMfaCode('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la désactivation');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!mfaCode) {
      setError('Code 2FA requis');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaCode })
      });

      if (response.ok) {
        const data = await response.json();
        setNewBackupCodes(data.backupCodes);
        await fetchMFAStatus();
        setMfaCode('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la régénération');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetupWizard(false);
    fetchMFAStatus();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showSetupWizard) {
    return (
      <MFASetupWizard
        onComplete={handleSetupComplete}
        onCancel={() => setShowSetupWizard(false)}
      />
    );
  }

  if (!mfaStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Impossible de récupérer le statut de la double authentification
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statut principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {mfaStatus.isEnabled ? (
                <ShieldCheck className="h-6 w-6 text-green-600" />
              ) : (
                <ShieldOff className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <CardTitle>Double Authentification</CardTitle>
                <CardDescription>
                  Sécurisez votre compte avec un code supplémentaire
                </CardDescription>
              </div>
            </div>
            <Badge variant={mfaStatus.isEnabled ? "default" : "secondary"}>
              {mfaStatus.isEnabled ? "Activée" : "Désactivée"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaStatus.isEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <span className="text-sm font-medium text-green-600">
                  ✓ Protection active
                </span>
              </div>
              
              {mfaStatus.lastUsedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dernière utilisation</span>
                  <span className="text-sm">
                    {new Date(mfaStatus.lastUsedAt).toLocaleString('fr-FR')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Codes de récupération</span>
                <span className="text-sm">
                  {mfaStatus.remainingBackupCodes}/10 disponibles
                </span>
              </div>

              {mfaStatus.isLocked && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Compte verrouillé jusqu'à {mfaStatus.unlockAt ? 
                      new Date(mfaStatus.unlockAt).toLocaleString('fr-FR') : 
                      'date inconnue'
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                La double authentification n'est pas activée. 
                Activez-la pour renforcer la sécurité de votre compte.
              </p>
              <Button onClick={() => setShowSetupWizard(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Activer la 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions pour MFA activée */}
      {mfaStatus.isEnabled && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Codes de récupération */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Codes de récupération</span>
              </CardTitle>
              <CardDescription>
                Régénérez vos codes de secours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showRegenerateForm ? (
                <div className="space-y-4">
                  <div className="text-sm">
                    <p>Codes restants : <strong>{mfaStatus.remainingBackupCodes}/10</strong></p>
                    {mfaStatus.remainingBackupCodes <= 2 && (
                      <p className="text-amber-600 font-medium">
                        ⚠️ Il vous reste peu de codes, pensez à en régénérer
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRegenerateForm(true)}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Régénérer les codes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="regen-mfa-code">Code 2FA</Label>
                    <Input
                      id="regen-mfa-code"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      maxLength={6}
                      className="text-center"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleRegenerateBackupCodes}
                      disabled={isSubmitting || mfaCode.length !== 6}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Génération...' : 'Confirmer'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRegenerateForm(false);
                        setMfaCode('');
                        setError(null);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Désactivation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <ShieldOff className="h-5 w-5" />
                <span>Désactiver la 2FA</span>
              </CardTitle>
              <CardDescription>
                Supprime la protection 2FA de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showDisableForm ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      La désactivation réduira la sécurité de votre compte
                    </AlertDescription>
                  </Alert>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDisableForm(true)}
                    className="w-full"
                  >
                    Désactiver la 2FA
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="disable-password">Mot de passe</Label>
                    <Input
                      id="disable-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="disable-mfa-code">Code 2FA</Label>
                    <Input
                      id="disable-mfa-code"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      maxLength={6}
                      className="text-center"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="destructive"
                      onClick={handleDisableMFA}
                      disabled={isSubmitting || !password || mfaCode.length !== 6}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Désactivation...' : 'Confirmer'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDisableForm(false);
                        setPassword('');
                        setMfaCode('');
                        setError(null);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Affichage des nouveaux codes */}
      {newBackupCodes && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Check className="h-5 w-5" />
              <span>Nouveaux codes générés</span>
            </CardTitle>
            <CardDescription>
              Sauvegardez ces nouveaux codes en lieu sûr
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-4">
              {newBackupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-green-50 rounded text-center border border-green-200">
                  {code}
                </div>
              ))}
            </div>
            <Button 
              onClick={() => setNewBackupCodes(null)}
              className="w-full"
            >
              J'ai sauvegardé les codes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}