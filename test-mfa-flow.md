# Test MFA Flow - Diagnostic Complet

## 🔍 Test 1: Vérifier le Store MFA

**Ouvrir la console du navigateur et taper :**
```javascript
// Test si le store MFA est accessible
fetch('/api/debug/mfa-store', {method: 'GET'})
  .then(r => r.json())
  .then(data => console.log('MFA Store:', data));
```

## 🔍 Test 2: Analyser le JWT Token

**Dans la console du navigateur :**
```javascript
// Vérifier le contenu du JWT
document.cookie.split('; ').find(row => row.startsWith('next-auth.session-token='))
```

## 🔍 Test 3: Logs à Surveiller

**Pendant la connexion avec 2FA, surveillez ces logs dans la console serveur :**

1. **Première saisie du code 2FA :**
   - `🔐 MFA Session XXX-session marked as verified for user YYY`
   - `🔐 Total sessions vérifiées: 1`

2. **Vérification JWT (après première saisie) :**
   - `🔐 Vérification MFA pour session XXX-session, user YYY`
   - `🔐 Verification trouvée: OUI/NON`
   - `🔐 MFA vérifié trouvé dans store pour: YYY` OU `🔐 MFA non vérifié dans store pour: YYY`

3. **Redirection vers dashboard :**
   - `📋 Session Callback - Token sub: YYY, Role: XXX`
   - `📋 Session finale: { mfaVerified: true/false }`

## 🔍 Test 4: Séquence de Test Complète

**Étapes à suivre :**

1. **Déconnexion complète** (`/api/auth/signout`)
2. **Vider le cache navigateur** (F12 > Application > Storage > Clear site data)
3. **Redémarrer le serveur** (npm run dev)
4. **Connexion étape par étape** :
   - Email/mot de passe
   - Premier code 2FA → **Noter tous les logs**
   - Si demande un 2ème code → **Noter tous les logs**
   - Arrivée sur dashboard → **Noter tous les logs**

## 🔍 Test 5: API Endpoints

**Tester ces endpoints dans l'ordre :**

1. `/api/patients` (GET) - Doit fonctionner sans redirection
2. `/api/lists` (GET) - Doit fonctionner sans redirection  
3. `/api/patients/1/entretiens` (GET) - Doit fonctionner sans redirection
4. `/api/entretiens/1` (GET) - Doit fonctionner sans redirection

**Commandes curl pour tester :**
```bash
# Copier le cookie de session du navigateur
curl -H "Cookie: next-auth.session-token=VOTRE_TOKEN_ICI" http://localhost:3009/api/patients
```

## 🔍 Test 6: Créer un Patient

**Tester la création d'un patient complet :**

1. Aller sur "Nouveau Dossier"
2. Remplir le formulaire patient
3. Valider → **Vérifier pas d'erreurs JSON.parse**
4. Vérifier redirection vers liste patients

## 🔍 Test 7: Créer un Entretien

**Tester la création d'un entretien :**

1. Sélectionner un patient
2. Créer un nouvel entretien
3. Remplir les sections → **Vérifier pas d'erreurs motifs**
4. Sauvegarder → **Vérifier pas d'erreurs numéro entretien**

## 🔍 Test 8: Navigation Complète

**Tester toutes les sections :**

1. Dashboard → **Vérifier chargement sans erreurs**
2. Patients → **Vérifier liste se charge**
3. Calendrier → **Vérifier événements se chargent**
4. Admin (si accès) → **Vérifier fonctionnalités**

## 📊 Rapport de Test

**Compléter après chaque test :**

- [ ] Test 1 - Store MFA accessible
- [ ] Test 2 - JWT contient mfaVerified
- [ ] Test 3 - Logs MFA corrects
- [ ] Test 4 - Un seul code 2FA suffit
- [ ] Test 5 - Toutes APIs fonctionnent
- [ ] Test 6 - Création patient OK
- [ ] Test 7 - Création entretien OK
- [ ] Test 8 - Navigation complète OK

**Erreurs rencontrées :**
- 
- 
- 

**Logs suspects :**
- 
- 
- 