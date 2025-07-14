// src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    console.log('📧 Envoi email vers:', to)
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'info@vital-sync.ch',
      to: [to],
      subject,
      html,
      text: text || extractTextFromHtml(html),
    })

    if (error) {
      console.error('❌ Erreur Resend:', error)
      throw new Error(`Erreur envoi email: ${error.message}`)
    }

    console.log('✅ Email envoyé avec succès:', data?.id)
    return { success: true, id: data?.id }
    
  } catch (error) {
    console.error('❌ Erreur service email:', error)
    throw error
  }
}

// Fonction pour extraire le texte du HTML (fallback)
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Supprime les balises HTML
    .replace(/\s+/g, ' ')    // Normalise les espaces
    .trim()
}

// Template pour le reset de mot de passe
export function createResetPasswordTemplate(resetUrl: string, userEmail: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe - Vital Sync</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #334155;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                padding: 2rem;
                text-align: center;
            }
            .header h1 {
                color: white;
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .content {
                padding: 2rem;
            }
            .alert {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                color: #92400e;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                margin: 1rem 0;
                text-align: center;
            }
            .footer {
                background: #f1f5f9;
                padding: 1.5rem;
                text-align: center;
                font-size: 14px;
                color: #64748b;
            }
            .security-info {
                background: #ecfdf5;
                border: 1px solid #10b981;
                color: #047857;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Vital Sync</h1>
                <p style="color: #e2e8f0; margin: 0.5rem 0 0 0;">Réinitialisation de mot de passe</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1e293b; margin-bottom: 1rem;">Bonjour,</h2>
                
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Vital Sync associé à l'adresse <strong>${userEmail}</strong>.</p>
                
                <div class="alert">
                    <strong>⚠️ Important :</strong> Ce lien expire dans 15 minutes pour votre sécurité.
                </div>
                
                <div style="text-align: center; margin: 2rem 0;">
                    <a href="${resetUrl}" class="button">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
                
                <div class="security-info">
                    <strong>🛡️ Informations de sécurité :</strong><br>
                    • Ce lien ne peut être utilisé qu'une seule fois<br>
                    • Il expire automatiquement après 15 minutes<br>
                    • Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
                </div>
                
                <p style="margin-top: 2rem;"><strong>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</strong></p>
                <p style="background: #f1f5f9; padding: 1rem; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 14px;">
                    ${resetUrl}
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;">
                
                <p style="font-size: 14px; color: #64748b;">
                    Si vous avez des questions, contactez le support à 
                    <a href="mailto:support@vital-sync.ch" style="color: #3b82f6;">support@vital-sync.ch</a>
                </p>
            </div>
            
            <div class="footer">
                <p><strong>Vital Sync</strong> - Plateforme médicale sécurisée</p>
                <p style="margin: 0.5rem 0 0 0;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </div>
    </body>
    </html>
  `

  const text = `
Réinitialisation de mot de passe - Vital Sync

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Vital Sync (${userEmail}).

⚠️ IMPORTANT: Ce lien expire dans 15 minutes pour votre sécurité.

Lien de réinitialisation: ${resetUrl}

🛡️ Informations de sécurité:
• Ce lien ne peut être utilisé qu'une seule fois
• Il expire automatiquement après 15 minutes
• Si vous n'avez pas demandé cette réinitialisation, ignorez cet email

Si vous avez des questions, contactez support@vital-sync.ch

---
Vital Sync - Plateforme médicale sécurisée
Cet email a été envoyé automatiquement, merci de ne pas y répondre.
  `

  return { html, text }
}

// Fonction helper pour envoyer un email de reset
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/${resetToken}`
  const { html, text } = createResetPasswordTemplate(resetUrl, email)
  
  return await sendEmail({
    to: email,
    subject: '🔐 Réinitialisation de votre mot de passe - Vital Sync',
    html,
    text
  })
}