# scripts/create-admin-local.ps1 - Script PowerShell pour Windows
# Création d'admin en développement local

param(
    [string]$Email,
    [string]$Name,
    [string]$Password
)

Write-Host "🏥 VITAL SYNC - Création admin DEVELOPPEMENT LOCAL" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configuration locale
$DB_HOST = "localhost"
$DB_PORT = "54322"
$DB_USER = "postgres"
$DB_PASSWORD = "postgres"
$DB_NAME = "postgres"

function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

# Vérifier que Node.js est disponible
function Test-NodeJS {
    Write-Info "Vérification de Node.js..."
    
    try {
        $nodeVersion = node --version
        Write-Success "Node.js disponible: $nodeVersion"
        return $true
    }
    catch {
        Write-Error "Node.js n'est pas installé ou accessible"
        return $false
    }
}

# Vérifier que psql est disponible (optionnel, on peut utiliser Node.js)
function Test-Database {
    Write-Info "Test de connexion à la base locale..."
    
    # Utiliser Node.js pour tester la connexion
    $testScript = @"
const { Client } = require('pg');
const client = new Client({
    host: '$DB_HOST',
    port: $DB_PORT,
    user: '$DB_USER',
    password: '$DB_PASSWORD',
    database: '$DB_NAME'
});

client.connect()
    .then(() => {
        console.log('CONNECTION_SUCCESS');
        return client.end();
    })
    .catch(err => {
        console.log('CONNECTION_ERROR:', err.message);
        process.exit(1);
    });
"@
    
    $testScript | Out-File -FilePath "temp_test_db.js" -Encoding UTF8
    
    try {
        $result = node temp_test_db.js
        Remove-Item "temp_test_db.js" -Force
        
        if ($result -contains "CONNECTION_SUCCESS") {
            Write-Success "Base de données accessible"
            return $true
        } else {
            Write-Error "Impossible de se connecter à la base locale"
            Write-Info "Vérifiez que Supabase local tourne sur localhost:54322"
            return $false
        }
    }
    catch {
        Remove-Item "temp_test_db.js" -Force -ErrorAction SilentlyContinue
        Write-Error "Erreur lors du test de connexion"
        return $false
    }
}

# Saisie sécurisée des informations
function Get-AdminInfo {
    Write-Host ""
    Write-Info "Saisie des informations admin:"
    
    # Email
    do {
        $script:ADMIN_EMAIL = Read-Host "📧 Email admin"
        if ($script:ADMIN_EMAIL -match "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$") {
            break
        } else {
            Write-Error "Format email invalide"
        }
    } while ($true)
    
    # Nom
    do {
        $script:ADMIN_NAME = Read-Host "👤 Nom complet"
        if ($script:ADMIN_NAME.Length -ge 2) {
            break
        } else {
            Write-Error "Le nom doit contenir au moins 2 caractères"
        }
    } while ($true)
    
    # Mot de passe
    do {
        $securePassword = Read-Host "🔒 Mot de passe" -AsSecureString
        $script:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
        
        $secureConfirm = Read-Host "🔒 Confirmer le mot de passe" -AsSecureString
        $confirmPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureConfirm))
        
        if ($script:ADMIN_PASSWORD -eq $confirmPassword) {
            if ($script:ADMIN_PASSWORD.Length -ge 8) {
                break
            } else {
                Write-Error "Le mot de passe doit contenir au moins 8 caractères"
            }
        } else {
            Write-Error "Les mots de passe ne correspondent pas"
        }
    } while ($true)
}

# Créer l'admin avec Node.js
function New-AdminUser {
    Write-Info "Création de l'admin en base..."
    
    $createScript = @"
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const client = new Client({
    host: '$DB_HOST',
    port: $DB_PORT,
    user: '$DB_USER',
    password: '$DB_PASSWORD',
    database: '$DB_NAME'
});

async function createAdmin() {
    try {
        await client.connect();
        
        // Vérifier si l'email existe déjà
        const existingUser = await client.query(
            'SELECT COUNT(*) FROM auth_users WHERE email = `$1',
            ['$($script:ADMIN_EMAIL)']
        );
        
        if (parseInt(existingUser.rows[0].count) > 0) {
            console.log('ERROR: Email already exists');
            process.exit(1);
        }
        
        // Générer hash et UUID
        const userId = crypto.randomUUID();
        const passwordHash = bcrypt.hashSync('$($script:ADMIN_PASSWORD)', 12);
        
        // Créer auth_user
        await client.query(`
            INSERT INTO auth_users (id, email, password, created_at, updated_at) 
            VALUES (`$1, `$2, `$3, NOW(), NOW())
        `, [userId, '$($script:ADMIN_EMAIL)', passwordHash]);
        
        // Créer user_profile
        await client.query(`
            INSERT INTO user_profiles (id, user_id, email, name, role, is_active, is_whitelisted, created_at, updated_at)
            VALUES (gen_random_uuid(), `$1, `$2, `$3, 'ADMIN', true, true, NOW(), NOW())
        `, [userId, '$($script:ADMIN_EMAIL)', '$($script:ADMIN_NAME)']);
        
        console.log('SUCCESS: Admin created');
        console.log('Email: $($script:ADMIN_EMAIL)');
        console.log('Name: $($script:ADMIN_NAME)');
        
    } catch (error) {
        console.log('ERROR:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createAdmin();
"@
    
    $createScript | Out-File -FilePath "temp_create_admin.js" -Encoding UTF8
    
    try {
        $result = node temp_create_admin.js
        Remove-Item "temp_create_admin.js" -Force
        
        if ($result -contains "SUCCESS: Admin created") {
            Write-Success "Admin créé avec succès!"
            Write-Host ""
            Write-Host "🎉 ===============================================" -ForegroundColor Green
            Write-Success "ADMIN LOCAL CRÉÉ AVEC SUCCÈS!"
            Write-Host "===============================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 Informations de connexion:"
            Write-Host "   Email: $($script:ADMIN_EMAIL)"
            Write-Host "   Nom: $($script:ADMIN_NAME)"
            Write-Host "   Rôle: Administrateur"
            Write-Host ""
            Write-Host "🌐 Connexion locale:"
            Write-Host "   URL: http://localhost:3000/auth/login"
            Write-Host ""
            Write-Info "Utilisez 'npm run dev' pour démarrer l'app locale"
            Write-Host ""
        } else {
            Write-Error "Erreur lors de la création de l'admin"
            Write-Host $result
        }
    }
    catch {
        Remove-Item "temp_create_admin.js" -Force -ErrorAction SilentlyContinue
        Write-Error "Erreur lors de l'exécution du script de création"
    }
}

# Script principal
function Main {
    if (-not (Test-NodeJS)) {
        exit 1
    }
    
    if (-not (Test-Database)) {
        exit 1
    }
    
    if (-not $Email -or -not $Name -or -not $Password) {
        Get-AdminInfo
    } else {
        $script:ADMIN_EMAIL = $Email
        $script:ADMIN_NAME = $Name  
        $script:ADMIN_PASSWORD = $Password
    }
    
    New-AdminUser
}

# Exécution
Main