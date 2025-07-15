// src/app/api/auth/qr-code/route.ts - API sécurisée pour génération QR codes
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import QRCode from 'qrcode';
import { checkRateLimitDB } from '@/lib/rate-limiter-db';

// Validation des URLs TOTP autorisées
const ALLOWED_TOTP_PATTERNS = [
  /^otpauth:\/\/totp\/Vital%20Sync:/,
  /^otpauth:\/\/totp\/VitalSync:/,
  /^otpauth:\/\/totp\/Vital\+Sync:/
];

// CSP headers sécurisés
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'none'; img-src data:;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'no-referrer'
};

/**
 * Valide qu'une URL TOTP est sécurisée
 */
function validateTOTPUrl(url: string): boolean {
  try {
    // Vérifier le format général
    if (!url.startsWith('otpauth://totp/')) {
      return false;
    }
    
    // Vérifier contre les patterns autorisés
    const isAllowed = ALLOWED_TOTP_PATTERNS.some(pattern => pattern.test(url));
    if (!isAllowed) {
      console.log('URL TOTP rejetée, patterns testés:', ALLOWED_TOTP_PATTERNS.map(p => p.source));
      console.log('URL reçue:', url);
      return false;
    }
    
    // Parser l'URL pour validation supplémentaire
    const urlObj = new URL(url);
    
    // Vérifier les paramètres obligatoires
    const secret = urlObj.searchParams.get('secret');
    const issuer = urlObj.searchParams.get('issuer');
    
    if (!secret || !issuer) {
      return false;
    }
    
    // Vérifier que l'issuer est correct
    if (!['Vital Sync', 'VitalSync'].includes(issuer)) {
      return false;
    }
    
    // Vérifier la longueur du secret (base32)
    if (secret.length < 16 || secret.length > 128) {
      return false;
    }
    
    // Vérifier que le secret ne contient que des caractères base32 valides
    if (!/^[A-Z2-7]+$/.test(secret)) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Génère un QR code sécurisé
 */
async function generateSecureQRCode(otpauthUrl: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    return dataUrl;
  } catch (error) {
    throw new Error('Impossible de générer le QR code');
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Vérification de l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { 
          status: 401,
          headers: SECURITY_HEADERS
        }
      );
    }
    
    // 2. Rate limiting spécifique à cette API
    const rateLimitResult = await checkRateLimitDB(request, 'setup', session.user.id);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Trop de demandes de QR code',
          retryAfter: rateLimitResult.retryAfter
        },
        { 
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            'Retry-After': rateLimitResult.retryAfter?.toString() || '300'
          }
        }
      );
    }
    
    // 3. Validation de la requête
    const body = await request.json();
    const { otpauthUrl } = body;
    
    if (!otpauthUrl || typeof otpauthUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL TOTP requise' },
        { 
          status: 400,
          headers: SECURITY_HEADERS
        }
      );
    }
    
    // 4. Validation sécurisée de l'URL TOTP
    if (!validateTOTPUrl(otpauthUrl)) {
      // Log de sécurité pour tentative d'URL malveillante
      console.warn(`QR Code: URL TOTP invalide tentée par ${session.user.id}:`, {
        userId: session.user.id,
        urlPrefix: otpauthUrl.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { error: 'URL TOTP invalide' },
        { 
          status: 400,
          headers: SECURITY_HEADERS
        }
      );
    }
    
    // 5. Génération du QR code
    const qrCodeDataUrl = await generateSecureQRCode(otpauthUrl);
    
    // 6. Log de sécurité pour audit
    console.log(`QR Code généré pour utilisateur ${session.user.id}`);
    
    // 7. Réponse sécurisée
    return NextResponse.json(
      { 
        qrCode: qrCodeDataUrl,
        success: true
      },
      {
        headers: {
          ...SECURITY_HEADERS,
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
  } catch (error) {
    console.error('Erreur génération QR code:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { 
        status: 500,
        headers: SECURITY_HEADERS
      }
    );
  }
}

// Méthodes non autorisées
export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { 
      status: 405,
      headers: {
        ...SECURITY_HEADERS,
        'Allow': 'POST'
      }
    }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { 
      status: 405,
      headers: {
        ...SECURITY_HEADERS,
        'Allow': 'POST'
      }
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { 
      status: 405,
      headers: {
        ...SECURITY_HEADERS,
        'Allow': 'POST'
      }
    }
  );
}