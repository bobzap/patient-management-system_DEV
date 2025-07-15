// src/components/auth/QRCodeDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check, QrCode, Type } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  manualEntryKey: string;
  onNext?: () => void;
  onCancel?: () => void;
}

export function QRCodeDisplay({ qrCodeUrl, manualEntryKey, onNext, onCancel }: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Essayer d'abord l'API sécurisée
        const response = await fetch('/api/auth/qr-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpauthUrl: qrCodeUrl })
        });

        if (response.ok) {
          const data = await response.json();
          setQrCodeDataUrl(data.qrCode);
        } else {
          // Fallback sécurisé : utiliser la librairie côté client
          // Mais seulement si l'URL TOTP est valide
          if (qrCodeUrl.startsWith('otpauth://totp/') && 
              (qrCodeUrl.includes('Vital%20Sync') || qrCodeUrl.includes('VitalSync'))) {
            const QRCode = await import('qrcode');
            const dataUrl = await QRCode.toDataURL(qrCodeUrl, {
              errorCorrectionLevel: 'M',
              margin: 1,
              width: 256
            });
            setQrCodeDataUrl(dataUrl);
          } else {
            throw new Error('URL TOTP invalide');
          }
        }
      } catch (err) {
        setError('Impossible de générer le QR code');
        console.error('Erreur génération QR code:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (qrCodeUrl) {
      generateQRCode();
    }
  }, [qrCodeUrl]);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(manualEntryKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const formatKey = (key: string) => {
    return key.match(/.{1,4}/g)?.join(' ') || key;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Configurez votre application</h3>
        <p className="text-gray-600">
          Scannez le QR code ou saisissez la clé manuellement
        </p>
      </div>

      <Tabs defaultValue="qr-code" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr-code" className="flex items-center space-x-2">
            <QrCode className="h-4 w-4" />
            <span>QR Code</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Type className="h-4 w-4" />
            <span>Manuel</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr-code" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="text-center space-y-4">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code 2FA" 
                    className="mx-auto border rounded-lg"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                  <p className="text-sm text-gray-600">
                    Scannez ce code avec votre application d'authentification
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Applications recommandées :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Google Authenticator</li>
              <li>Authy</li>
              <li>1Password</li>
              <li>Microsoft Authenticator</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2 text-gray-900">
              Clé secrète à saisir manuellement :
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-3 bg-gray-800 text-white rounded font-mono text-sm break-all">
                {formatKey(manualEntryKey)}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKey}
                className="flex items-center space-x-2"
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
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Instructions :</strong><br />
              1. Ouvrez votre application d'authentification<br />
              2. Ajoutez un nouveau compte<br />
              3. Choisissez &quot;Saisie manuelle&quot; ou &quot;Clé secrète&quot;<br />
              4. Collez ou tapez la clé ci-dessus<br />
              5. Configurez le nom : &quot;Vital Sync&quot;
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <div className="flex space-x-3">
        <Button onClick={onNext} className="flex-1">
          Continuer
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}