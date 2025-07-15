// src/lib/mfa-tests.ts - Tests et validation du système MFA
import { 
  generateMFASecret, 
  verifyTOTPCode, 
  generateBackupCodes, 
  verifyBackupCode,
  generateCurrentTOTP 
} from './mfa';
import { encryptString, decryptString } from './encryption';

// Types pour les résultats de tests
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

/**
 * Classe de test du système MFA
 */
export class MFATestSuite {
  
  /**
   * Exécute tous les tests MFA
   */
  static async runAllTests(): Promise<TestSuite[]> {
    const suites: TestSuite[] = [];
    
    suites.push(await this.testSecretGeneration());
    suites.push(await this.testTOTPGeneration());
    suites.push(await this.testBackupCodes());
    suites.push(await this.testEncryption());
    suites.push(await this.testEdgeCases());
    
    return suites;
  }
  
  /**
   * Test de génération de secrets
   */
  private static async testSecretGeneration(): Promise<TestSuite> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    
    // Test 1: Génération de secret basique
    try {
      const secret = generateMFASecret('test@example.com');
      results.push({
        name: 'Secret generation basic',
        passed: !!(secret.secret && secret.qrCodeUrl && secret.manualEntryKey),
        details: { hasSecret: !!secret.secret, hasQR: !!secret.qrCodeUrl }
      });
    } catch (error) {
      results.push({
        name: 'Secret generation basic',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 2: Format QR code
    try {
      const secret = generateMFASecret('test@example.com');
      const isValidQR = secret.qrCodeUrl.startsWith('otpauth://totp/');
      results.push({
        name: 'QR code format validation',
        passed: isValidQR,
        details: { qrUrl: secret.qrCodeUrl.substring(0, 50) + '...' }
      });
    } catch (error) {
      results.push({
        name: 'QR code format validation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 3: Unicité des secrets
    try {
      const secret1 = generateMFASecret('test1@example.com');
      const secret2 = generateMFASecret('test2@example.com');
      const areUnique = secret1.manualEntryKey !== secret2.manualEntryKey;
      results.push({
        name: 'Secret uniqueness',
        passed: areUnique,
        details: { 
          key1: secret1.manualEntryKey.substring(0, 8) + '...',
          key2: secret2.manualEntryKey.substring(0, 8) + '...'
        }
      });
    } catch (error) {
      results.push({
        name: 'Secret uniqueness',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    return {
      name: 'Secret Generation Tests',
      results,
      passed,
      failed,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Test de génération et vérification TOTP
   */
  private static async testTOTPGeneration(): Promise<TestSuite> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    
    // Test 1: Génération et vérification TOTP
    try {
      const secret = generateMFASecret('test@example.com');
      const currentCode = generateCurrentTOTP(secret.secret);
      const isValid = await verifyTOTPCode(secret.secret, currentCode);
      
      results.push({
        name: 'TOTP generation and verification',
        passed: isValid && currentCode.length === 6,
        details: { 
          codeLength: currentCode.length,
          isNumeric: /^\d+$/.test(currentCode)
        }
      });
    } catch (error) {
      results.push({
        name: 'TOTP generation and verification',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 2: Codes invalides
    try {
      const secret = generateMFASecret('test@example.com');
      const isInvalidRejected = !(await verifyTOTPCode(secret.secret, '000000'));
      
      results.push({
        name: 'Invalid TOTP rejection',
        passed: isInvalidRejected,
        details: { rejectedInvalidCode: isInvalidRejected }
      });
    } catch (error) {
      results.push({
        name: 'Invalid TOTP rejection',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 3: Format de code
    try {
      const secret = generateMFASecret('test@example.com');
      const invalidFormats = ['12345', '1234567', 'abcdef', ''];
      let allRejected = true;
      
      for (const format of invalidFormats) {
        if (await verifyTOTPCode(secret.secret, format)) {
          allRejected = false;
          break;
        }
      }
      
      results.push({
        name: 'TOTP format validation',
        passed: allRejected,
        details: { testedFormats: invalidFormats }
      });
    } catch (error) {
      results.push({
        name: 'TOTP format validation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    return {
      name: 'TOTP Tests',
      results,
      passed,
      failed,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Test des codes de récupération
   */
  private static async testBackupCodes(): Promise<TestSuite> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    
    // Test 1: Génération codes backup
    try {
      const { codes, encryptedCodes } = generateBackupCodes(10);
      const isValidGeneration = codes.length === 10 && 
                               encryptedCodes.length === 10 &&
                               codes.every(code => code.length === 8);
      
      results.push({
        name: 'Backup codes generation',
        passed: isValidGeneration,
        details: { 
          codesCount: codes.length,
          sampleCode: codes[0],
          allCorrectLength: codes.every(code => code.length === 8)
        }
      });
    } catch (error) {
      results.push({
        name: 'Backup codes generation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 2: Vérification codes backup
    try {
      const { codes, encryptedCodes } = generateBackupCodes(5);
      const testCode = codes[0];
      const verification = await verifyBackupCode(encryptedCodes, testCode);
      
      results.push({
        name: 'Backup code verification',
        passed: verification.isValid && verification.codeIndex === 0,
        details: { 
          testedCode: testCode,
          foundIndex: verification.codeIndex,
          isValid: verification.isValid
        }
      });
    } catch (error) {
      results.push({
        name: 'Backup code verification',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 3: Codes invalides rejetés
    try {
      const { encryptedCodes } = generateBackupCodes(5);
      const invalidCodes = ['12345678', 'ZZZZZZZZ', '', 'SHORT'];
      let allRejected = true;
      
      for (const invalid of invalidCodes) {
        const verification = await verifyBackupCode(encryptedCodes, invalid);
        if (verification.isValid) {
          allRejected = false;
          break;
        }
      }
      
      results.push({
        name: 'Invalid backup codes rejection',
        passed: allRejected,
        details: { testedInvalidCodes: invalidCodes }
      });
    } catch (error) {
      results.push({
        name: 'Invalid backup codes rejection',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    return {
      name: 'Backup Codes Tests',
      results,
      passed,
      failed,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Test du chiffrement MFA
   */
  private static async testEncryption(): Promise<TestSuite> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    
    // Test 1: Chiffrement/déchiffrement des secrets
    try {
      const originalSecret = 'JBSWY3DPEHPK3PXP';
      const encrypted = encryptString(originalSecret);
      const decrypted = decryptString(encrypted);
      
      results.push({
        name: 'Secret encryption/decryption',
        passed: decrypted === originalSecret,
        details: { 
          original: originalSecret,
          hasEncrypted: !!encrypted.encrypted,
          hasIV: !!encrypted.iv,
          decryptedMatch: decrypted === originalSecret
        }
      });
    } catch (error) {
      results.push({
        name: 'Secret encryption/decryption',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 2: Chiffrement codes backup
    try {
      const { codes, encryptedCodes } = generateBackupCodes(3);
      let allEncrypted = true;
      
      for (let i = 0; i < codes.length; i++) {
        const encrypted = JSON.parse(encryptedCodes[i]);
        const decrypted = decryptString(encrypted);
        if (decrypted !== codes[i]) {
          allEncrypted = false;
          break;
        }
      }
      
      results.push({
        name: 'Backup codes encryption',
        passed: allEncrypted,
        details: { 
          totalCodes: codes.length,
          allEncryptedCorrectly: allEncrypted
        }
      });
    } catch (error) {
      results.push({
        name: 'Backup codes encryption',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    return {
      name: 'Encryption Tests',
      results,
      passed,
      failed,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Test des cas limites
   */
  private static async testEdgeCases(): Promise<TestSuite> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    
    // Test 1: Emails avec caractères spéciaux
    try {
      const specialEmails = [
        'test+tag@example.com',
        'user.name@example-domain.co.uk',
        'test@sub.example.org'
      ];
      
      let allWork = true;
      for (const email of specialEmails) {
        try {
          const secret = generateMFASecret(email);
          if (!secret.qrCodeUrl.includes(encodeURIComponent(email))) {
            allWork = false;
            break;
          }
        } catch {
          allWork = false;
          break;
        }
      }
      
      results.push({
        name: 'Special character emails',
        passed: allWork,
        details: { testedEmails: specialEmails }
      });
    } catch (error) {
      results.push({
        name: 'Special character emails',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 2: Gestion erreurs données corrompues
    try {
      let errorHandled = false;
      try {
        verifyTOTPCode({ corrupted: 'data' }, '123456');
      } catch {
        errorHandled = true;
      }
      
      results.push({
        name: 'Corrupted data handling',
        passed: errorHandled,
        details: { errorProperlyCaught: errorHandled }
      });
    } catch (error) {
      results.push({
        name: 'Corrupted data handling',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    return {
      name: 'Edge Cases Tests',
      results,
      passed,
      failed,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Génère un rapport de test lisible
   */
  static generateReport(suites: TestSuite[]): string {
    const totalTests = suites.reduce((sum, suite) => sum + suite.results.length, 0);
    const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = suites.reduce((sum, suite) => sum + suite.duration, 0);
    
    let report = '# MFA Test Suite Report\n\n';
    report += `**Summary:** ${totalPassed}/${totalTests} tests passed (${totalFailed} failed)\n`;
    report += `**Duration:** ${totalDuration}ms\n\n`;
    
    for (const suite of suites) {
      report += `## ${suite.name}\n`;
      report += `${suite.passed}/${suite.results.length} passed - ${suite.duration}ms\n\n`;
      
      for (const result of suite.results) {
        const status = result.passed ? '✅' : '❌';
        report += `${status} **${result.name}**\n`;
        
        if (result.error) {
          report += `   Error: ${result.error}\n`;
        }
        
        if (result.details) {
          report += `   Details: ${JSON.stringify(result.details, null, 2)}\n`;
        }
        
        report += '\n';
      }
    }
    
    return report;
  }
}