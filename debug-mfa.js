// debug-mfa.js - Script pour diagnostiquer le problème MFA
// Exécuter dans la console du navigateur

console.log('🔍 === DIAGNOSTIC MFA DÉMARRÉ ===');

// 1. Vérifier l'état actuel de la session
async function checkSessionState() {
  console.log('📋 1. Vérification état session...');
  
  try {
    const response = await fetch('/api/debug/mfa-store');
    const data = await response.json();
    
    console.log('✅ État session:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur session:', error);
    return null;
  }
}

// 2. Tester les APIs protégées
async function testProtectedAPIs() {
  console.log('🔗 2. Test APIs protégées...');
  
  const apis = [
    '/api/patients',
    '/api/lists',
    '/api/patients/1/entretiens'
  ];
  
  const results = {};
  
  for (const api of apis) {
    try {
      const response = await fetch(api);
      const contentType = response.headers.get('content-type');
      
      results[api] = {
        status: response.status,
        contentType,
        isJSON: contentType && contentType.includes('application/json'),
        isHTML: contentType && contentType.includes('text/html'),
        url: response.url
      };
      
      console.log(`${api}: ${response.status} (${contentType})`);
    } catch (error) {
      results[api] = { error: error.message };
      console.error(`${api}: ERROR - ${error.message}`);
    }
  }
  
  return results;
}

// 3. Vérifier le token JWT
function checkJWTToken() {
  console.log('🎫 3. Vérification token JWT...');
  
  const cookies = document.cookie.split('; ');
  const sessionToken = cookies.find(row => row.startsWith('next-auth.session-token='));
  
  if (sessionToken) {
    const token = sessionToken.split('=')[1];
    console.log('✅ Token trouvé:', token.substring(0, 50) + '...');
    
    // Décoder le payload JWT (base64)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        // JWT chiffré, on ne peut pas le décoder
        console.log('🔐 Token chiffré (impossible à décoder côté client)');
      } else {
        console.log('ℹ️ Token format inattendu');
      }
    } catch (error) {
      console.error('❌ Erreur décodage token:', error);
    }
  } else {
    console.log('❌ Aucun token de session trouvé');
  }
}

// 4. Simuler une requête avec log détaillé
async function simulateRequestWithLogs(url = '/api/patients') {
  console.log(`📡 4. Simulation requête ${url}...`);
  
  try {
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    console.log('Response URL:', response.url);
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ JSON response:', data);
    } else if (contentType && contentType.includes('text/html')) {
      const html = await response.text();
      console.log('🔄 HTML response (redirect):', html.substring(0, 200) + '...');
    } else {
      const text = await response.text();
      console.log('📝 Text response:', text.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('❌ Erreur requête:', error);
  }
}

// 5. Exécuter tous les tests
async function runDiagnostic() {
  console.log('🚀 === EXÉCUTION DIAGNOSTIC COMPLET ===');
  
  const sessionState = await checkSessionState();
  const apiResults = await testProtectedAPIs();
  checkJWTToken();
  await simulateRequestWithLogs();
  
  console.log('📊 === RÉSUMÉ DIAGNOSTIC ===');
  console.log('Session state:', sessionState);
  console.log('API results:', apiResults);
  
  // Analyse des résultats
  if (sessionState && sessionState.data) {
    const { isCurrentUserVerified, sessionInfo } = sessionState.data;
    
    console.log('🔍 ANALYSE:');
    console.log('- MFA Store vérifié:', isCurrentUserVerified);
    console.log('- Session mfaVerified:', sessionInfo.mfaVerified);
    
    if (isCurrentUserVerified && sessionInfo.mfaVerified) {
      console.log('✅ MFA semble OK - problème ailleurs');
    } else if (isCurrentUserVerified && !sessionInfo.mfaVerified) {
      console.log('⚠️ Store OK mais session KO - problème JWT callback');
    } else if (!isCurrentUserVerified && sessionInfo.mfaVerified) {
      console.log('⚠️ Session OK mais store KO - problème store');
    } else {
      console.log('❌ Ni store ni session - MFA pas vérifié');
    }
  }
  
  console.log('🔍 === DIAGNOSTIC TERMINÉ ===');
}

// Exécuter le diagnostic
runDiagnostic();