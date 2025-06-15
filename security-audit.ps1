# Script d'audit de sécurité pour Vital Sync (Windows)
# security-audit.ps1

Write-Host "🔒 AUDIT DE SÉCURITÉ - VITAL SYNC" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

$issues = 0

# 1. Recherche de console.log dangereux
Write-Host "`n1. 🔍 Recherche de console.log dangereux..." -ForegroundColor Yellow

$consoleLogs = @()
Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "console\.log" -and $content -notmatch "NODE_ENV") {
        $lines = ($content -split "`n" | Where-Object { $_ -match "console\.log" -and $_ -notmatch "NODE_ENV" })
        foreach ($line in $lines) {
            $consoleLogs += "$($_.Name): $($line.Trim())"
        }
    }
}

if ($consoleLogs.Count -gt 0) {
    Write-Host "❌ $($consoleLogs.Count) console.log dangereux trouvés" -ForegroundColor Red
    $consoleLogs | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    if ($consoleLogs.Count -gt 5) {
        Write-Host "  ... et $($consoleLogs.Count - 5) autres" -ForegroundColor Red
    }
    $issues++
} else {
    Write-Host "✅ Aucun console.log dangereux trouvé" -ForegroundColor Green
}

# 2. Vérification variables d'environnement
Write-Host "`n2. 🔐 Vérification des variables d'environnement..." -ForegroundColor Yellow

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    $dangerousVars = @()
    
    if ($envContent -match "NEXT_PUBLIC_.*SECRET|NEXT_PUBLIC_.*PASSWORD|NEXT_PUBLIC_.*KEY") {
        $envContent -split "`n" | Where-Object { $_ -match "NEXT_PUBLIC_.*SECRET|NEXT_PUBLIC_.*PASSWORD|NEXT_PUBLIC_.*KEY" } | ForEach-Object {
            $dangerousVars += $_.Trim()
        }
    }
    
    if ($dangerousVars.Count -gt 0) {
        Write-Host "❌ Variables secrètes exposées côté client détectées" -ForegroundColor Red
        $dangerousVars | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        $issues++
    } else {
        Write-Host "✅ Pas de secrets exposés côté client" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ Fichier .env non trouvé" -ForegroundColor Yellow
}

# 3. Vérification des dépendances
Write-Host "`n3. 🛡️ Vérification des dépendances..." -ForegroundColor Yellow

try {
    $auditResult = npm audit --audit-level=moderate --json | ConvertFrom-Json
    if ($auditResult.metadata.vulnerabilities.total -gt 0) {
        Write-Host "❌ $($auditResult.metadata.vulnerabilities.total) vulnérabilités détectées" -ForegroundColor Red
        Write-Host "Exécutez: npm audit pour plus de détails" -ForegroundColor Red
        $issues++
    } else {
        Write-Host "✅ Dépendances sécurisées" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Impossible de vérifier les dépendances" -ForegroundColor Yellow
}

# 4. Vérification des routes API
Write-Host "`n4. 🔒 Vérification des routes API..." -ForegroundColor Yellow

$unprotectedRoutes = @()
Get-ChildItem -Path "src\app\api" -Recurse -Include "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "export async function" -and $content -notmatch "getServerSession") {
        $unprotectedRoutes += $_.Name
    }
}

if ($unprotectedRoutes.Count -gt 0) {
    Write-Host "⚠️ $($unprotectedRoutes.Count) routes API potentiellement non protégées" -ForegroundColor Yellow
    Write-Host "Fichiers à vérifier manuellement :"
    $unprotectedRoutes | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
} else {
    Write-Host "✅ Toutes les routes semblent protégées" -ForegroundColor Green
}

# 5. Vérification des logs sensibles
Write-Host "`n5. 📝 Vérification des logs sensibles..." -ForegroundColor Yellow

$sensitiveLogs = @()
Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "(password|token|secret).*console|console.*(password|token|secret)") {
        $lines = ($content -split "`n" | Where-Object { $_ -match "(password|token|secret).*console|console.*(password|token|secret)" })
        foreach ($line in $lines) {
            $sensitiveLogs += "$($_.Name): $($line.Trim())"
        }
    }
}

if ($sensitiveLogs.Count -gt 0) {
    Write-Host "❌ Logs de données sensibles détectés" -ForegroundColor Red
    $sensitiveLogs | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $issues++
} else {
    Write-Host "✅ Pas de logs de données sensibles" -ForegroundColor Green
}

# 6. Vérification des headers de sécurité
Write-Host "`n6. 🌐 Vérification des headers de sécurité..." -ForegroundColor Yellow

if (Test-Path "src\app\layout.tsx") {
    $layoutContent = Get-Content "src\app\layout.tsx" -Raw
    if ($layoutContent -match "X-Frame-Options|X-Content-Type-Options|X-XSS-Protection") {
        Write-Host "✅ Headers de sécurité configurés" -ForegroundColor Green
    } else {
        Write-Host "❌ Headers de sécurité manquants" -ForegroundColor Red
        $issues++
    }
} else {
    Write-Host "⚠️ Fichier layout.tsx non trouvé" -ForegroundColor Yellow
}

# 7. Vérification des secrets hardcodés
Write-Host "`n7. 🚫 Vérification des secrets hardcodés..." -ForegroundColor Yellow

$hardcodedSecrets = @()
Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "(password|secret|key)\s*=\s*[`"'][^`"']+[`"']") {
        $matches = [regex]::Matches($content, "(password|secret|key)\s*=\s*[`"'][^`"']+[`"']")
        foreach ($match in $matches) {
            if ($match.Value -notmatch "process\.env|config\.|import") {
                $hardcodedSecrets += "$($_.Name): $($match.Value)"
            }
        }
    }
}

if ($hardcodedSecrets.Count -gt 0) {
    Write-Host "❌ Secrets potentiellement hardcodés détectés" -ForegroundColor Red
    $hardcodedSecrets | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $issues++
} else {
    Write-Host "✅ Pas de secrets hardcodés détectés" -ForegroundColor Green
}

# 8. Vérification du package.json
Write-Host "`n8. 📦 Vérification du package.json..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    $packageContent = Get-Content "package.json" -Raw
    if ($packageContent -match '"start".*"next start"') {
        Write-Host "✅ Script de production configuré" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Vérifiez la configuration de production" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Fichier package.json non trouvé" -ForegroundColor Red
}

# Résumé
Write-Host "`n🎯 RÉSUMÉ DE L'AUDIT" -ForegroundColor Blue
Write-Host "===================" -ForegroundColor Blue

if ($issues -eq 0) {
    Write-Host "✅ EXCELLENT ! Aucun problème critique détecté" -ForegroundColor Green
    Write-Host "Score de sécurité: 🟢 ÉLEVÉ" -ForegroundColor Green
} elseif ($issues -le 2) {
    Write-Host "⚠️ $issues problème(s) détecté(s) - Corrections recommandées" -ForegroundColor Yellow
    Write-Host "Score de sécurité: 🟡 MOYEN" -ForegroundColor Yellow
} else {
    Write-Host "❌ $issues problèmes critiques détectés - CORRECTIONS URGENTES" -ForegroundColor Red
    Write-Host "Score de sécurité: 🔴 FAIBLE" -ForegroundColor Red
}

Write-Host "`n📋 ACTIONS RECOMMANDÉES:" -ForegroundColor Blue
if ($consoleLogs.Count -gt 0) {
    Write-Host "1. Supprimer ou conditionner tous les console.log" -ForegroundColor Yellow
}
if ($dangerousVars.Count -gt 0) {
    Write-Host "2. Déplacer les secrets vers des variables serveur" -ForegroundColor Yellow
}
if ($unprotectedRoutes.Count -gt 0) {
    Write-Host "3. Vérifier l'authentification sur toutes les routes API" -ForegroundColor Yellow
}
if ($sensitiveLogs.Count -gt 0) {
    Write-Host "4. Supprimer les logs de données sensibles" -ForegroundColor Yellow
}
if ($issues -eq 0) {
    Write-Host "✅ Continuer la surveillance et effectuer des audits réguliers" -ForegroundColor Green
}

Write-Host "`n🔗 RESSOURCES UTILES:" -ForegroundColor Blue
Write-Host "- Documentation sécurité Next.js: https://nextjs.org/docs/advanced-features/security-headers"
Write-Host "- OWASP Top 10: https://owasp.org/www-project-top-ten/"
Write-Host "- Guide sécurité React: https://snyk.io/blog/10-react-security-best-practices/"

Write-Host "`nAppuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")