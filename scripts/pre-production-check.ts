/**
 * Pre-Production Automated Verification Script
 * Runs comprehensive checks before deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string[];
}

const results: CheckResult[] = [];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addResult(name: string, passed: boolean, message: string, details?: string[]) {
  results.push({ name, passed, message, details });
  const icon = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}: ${message}`, color);
  if (details && details.length > 0) {
    details.forEach(d => log(`  - ${d}`, 'yellow'));
  }
}

// Check 1: TypeScript Compilation
function checkTypeScript() {
  log('\n📝 Checking TypeScript compilation...', 'cyan');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    addResult('TypeScript', true, 'No type errors found');
  } catch (error: any) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errors = output.split('\n').filter((line: string) => line.includes('error TS'));
    addResult('TypeScript', false, `Found ${errors.length} type errors`, errors.slice(0, 10));
  }
}

// Check 2: ESLint
function checkESLint() {
  log('\n🔍 Running ESLint...', 'cyan');
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    addResult('ESLint', true, 'No linting errors');
  } catch (error: any) {
    const output = error.stdout?.toString() || '';
    const lines = output.split('\n').filter((line: string) => line.trim());
    addResult('ESLint', false, 'Linting errors found', lines.slice(0, 10));
  }
}

// Check 3: Authentication in API Routes
function checkAuthInAPIRoutes() {
  log('\n🔐 Checking authentication in API routes...', 'cyan');
  const apiDir = path.join(process.cwd(), 'app', 'api');
  const issues: string[] = [];
  
  function scanDirectory(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file === 'route.ts') {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check if file uses requireAuth or requireRole
        const hasRequireAuth = content.includes('requireAuth(req)');
        const hasRequireRole = content.includes('requireRole(req');
        
        if (hasRequireAuth || hasRequireRole) {
          // Check if there's a null check after
          const lines = content.split('\n');
          let foundAuth = false;
          let foundNullCheck = false;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('requireAuth(req)') || line.includes('requireRole(req')) {
              foundAuth = true;
              // Check next 3 lines for null check
              for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                if (lines[j].includes('if (!user)') || lines[j].includes('if(!user)')) {
                  foundNullCheck = true;
                  break;
                }
              }
              
              if (!foundNullCheck) {
                const relativePath = filePath.replace(process.cwd(), '');
                issues.push(`${relativePath}:${i + 1} - Missing null check after requireAuth/requireRole`);
              }
              
              foundAuth = false;
              foundNullCheck = false;
            }
          }
        }
      }
    }
  }
  
  scanDirectory(apiDir);
  
  if (issues.length === 0) {
    addResult('API Authentication', true, 'All API routes have proper auth checks');
  } else {
    addResult('API Authentication', false, `Found ${issues.length} missing null checks`, issues.slice(0, 10));
  }
}

// Check 4: Environment Variables
function checkEnvironmentVariables() {
  log('\n🌍 Checking environment variables...', 'cyan');
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'NEXT_PUBLIC_API_URL',
  ];
  
  const missing: string[] = [];
  const examplePath = path.join(process.cwd(), '.env.example');
  
  if (fs.existsSync(examplePath)) {
    const exampleContent = fs.readFileSync(examplePath, 'utf-8');
    
    for (const varName of requiredVars) {
      if (!exampleContent.includes(varName)) {
        missing.push(varName);
      }
    }
  }
  
  if (missing.length === 0) {
    addResult('Environment Variables', true, 'All required variables documented in .env.example');
  } else {
    addResult('Environment Variables', false, `Missing from .env.example: ${missing.join(', ')}`);
  }
}

// Check 5: Database Models
function checkDatabaseModels() {
  log('\n💾 Checking database models...', 'cyan');
  const modelsDir = path.join(process.cwd(), 'models');
  const issues: string[] = [];
  
  if (fs.existsSync(modelsDir)) {
    const files = fs.readdirSync(modelsDir);
    
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const filePath = path.join(modelsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for duplicate indexes
        const indexMatches = content.match(/\.index\(/g);
        const uniqueMatches = content.match(/unique:\s*true/g);
        
        if (indexMatches && uniqueMatches) {
          const fieldWithUnique = content.match(/(\w+):\s*\{[^}]*unique:\s*true/g);
          const fieldWithIndex = content.match(/\.index\(\{\s*(\w+):/g);
          
          if (fieldWithUnique && fieldWithIndex) {
            fieldWithUnique.forEach(match => {
              const field = match.match(/(\w+):/)?.[1];
              if (field && fieldWithIndex.some(idx => idx.includes(field))) {
                issues.push(`${file}: Possible duplicate index on field '${field}'`);
              }
            });
          }
        }
        
        // Check for mongoose.models pattern
        if (!content.includes('mongoose.models.') && content.includes('mongoose.model')) {
          issues.push(`${file}: Missing mongoose.models check (may cause hot reload issues)`);
        }
      }
    }
  }
  
  if (issues.length === 0) {
    addResult('Database Models', true, 'No issues found in models');
  } else {
    addResult('Database Models', false, `Found ${issues.length} potential issues`, issues);
  }
}

// Check 6: Next.js 16 Compatibility
function checkNextJSCompatibility() {
  log('\n⚡ Checking Next.js 16 compatibility...', 'cyan');
  const issues: string[] = [];
  
  function scanForParams(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanForParams(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for params usage without await
        if (content.includes('{ params }') && !content.includes('params: Promise<')) {
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('{ params }') && lines[i].includes('params:') && !lines[i].includes('Promise<')) {
              const relativePath = filePath.replace(process.cwd(), '');
              issues.push(`${relativePath}:${i + 1} - params should be Promise<> in Next.js 16`);
            }
          }
        }
        
        // Check for params destructuring without await
        const paramsUsage = content.match(/const\s*{\s*\w+\s*}\s*=\s*params[^;]/g);
        if (paramsUsage && !content.includes('await params')) {
          const relativePath = filePath.replace(process.cwd(), '');
          issues.push(`${relativePath} - params destructuring without await`);
        }
      }
    }
  }
  
  const appDir = path.join(process.cwd(), 'app');
  if (fs.existsSync(appDir)) {
    scanForParams(appDir);
  }
  
  if (issues.length === 0) {
    addResult('Next.js 16 Compatibility', true, 'All dynamic routes use async params correctly');
  } else {
    addResult('Next.js 16 Compatibility', false, `Found ${issues.length} compatibility issues`, issues.slice(0, 10));
  }
}

// Check 7: Import Consistency
function checkImportConsistency() {
  log('\n📦 Checking import consistency...', 'cyan');
  const issues: string[] = [];
  
  function scanImports(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanImports(filePath);
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for dbConnect vs connectDB
        if (content.includes('dbConnect') && !content.includes('import') && content.includes('from')) {
          const relativePath = filePath.replace(process.cwd(), '');
          issues.push(`${relativePath} - Uses 'dbConnect' (should be 'connectDB')`);
        }
        
        // Check for unused imports
        const importMatches = content.match(/import\s+{([^}]+)}\s+from/g);
        if (importMatches) {
          importMatches.forEach(match => {
            const imports = match.match(/{\s*([^}]+)\s*}/)?.[1].split(',').map(i => i.trim());
            imports?.forEach(imp => {
              const importName = imp.split(' as ')[0].trim();
              const regex = new RegExp(`\\b${importName}\\b`, 'g');
              const matches = content.match(regex);
              if (matches && matches.length === 1) {
                // Only appears once (in the import statement)
                const relativePath = filePath.replace(process.cwd(), '');
                issues.push(`${relativePath} - Unused import: ${importName}`);
              }
            });
          });
        }
      }
    }
  }
  
  const appDir = path.join(process.cwd(), 'app');
  if (fs.existsSync(appDir)) {
    scanImports(appDir);
  }
  
  if (issues.length === 0) {
    addResult('Import Consistency', true, 'No import issues found');
  } else {
    addResult('Import Consistency', false, `Found ${issues.length} import issues`, issues.slice(0, 10));
  }
}

// Check 8: Security Best Practices
function checkSecurityPractices() {
  log('\n🔒 Checking security best practices...', 'cyan');
  const issues: string[] = [];
  
  function scanSecurity(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanSecurity(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = filePath.replace(process.cwd(), '');
        
        // Check for hardcoded secrets
        if (content.match(/password\s*=\s*["'][^"']+["']/i) && !content.includes('placeholder')) {
          issues.push(`${relativePath} - Possible hardcoded password`);
        }
        
        // Check for console.log in production code
        if (content.includes('console.log') && !relativePath.includes('scripts/')) {
          const lines = content.split('\n');
          const logLines = lines.filter(l => l.includes('console.log')).length;
          if (logLines > 2) {
            issues.push(`${relativePath} - Contains ${logLines} console.log statements`);
          }
        }
        
        // Check for eval usage
        if (content.includes('eval(')) {
          issues.push(`${relativePath} - Uses eval() (security risk)`);
        }
        
        // Check for dangerouslySetInnerHTML
        if (content.includes('dangerouslySetInnerHTML')) {
          issues.push(`${relativePath} - Uses dangerouslySetInnerHTML (XSS risk)`);
        }
      }
    }
  }
  
  const appDir = path.join(process.cwd(), 'app');
  if (fs.existsSync(appDir)) {
    scanSecurity(appDir);
  }
  
  if (issues.length === 0) {
    addResult('Security Practices', true, 'No security issues detected');
  } else {
    addResult('Security Practices', false, `Found ${issues.length} potential security issues`, issues.slice(0, 10));
  }
}

// Check 9: Build Test
function checkBuild() {
  log('\n🏗️  Testing production build...', 'cyan');
  try {
    execSync('npm run build', { stdio: 'pipe', timeout: 180000 });
    addResult('Production Build', true, 'Build completed successfully');
  } catch (error: any) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errors = output.split('\n').filter((line: string) => 
      line.includes('error') || line.includes('Error') || line.includes('failed')
    );
    addResult('Production Build', false, 'Build failed', errors.slice(0, 10));
  }
}

// Generate Report
function generateReport() {
  log('\n' + '='.repeat(80), 'blue');
  log('📊 PRE-PRODUCTION CHECK REPORT', 'blue');
  log('='.repeat(80), 'blue');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  log(`\nTotal Checks: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');
  log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`, 'yellow');
  
  if (failed > 0) {
    log('❌ FAILED CHECKS:', 'red');
    results.filter(r => !r.passed).forEach(r => {
      log(`\n  ${r.name}:`, 'red');
      log(`    ${r.message}`, 'yellow');
      if (r.details && r.details.length > 0) {
        r.details.forEach(d => log(`      - ${d}`, 'yellow'));
      }
    });
  }
  
  log('\n' + '='.repeat(80), 'blue');
  
  if (failed === 0) {
    log('✅ ALL CHECKS PASSED - READY FOR PRODUCTION!', 'green');
    process.exit(0);
  } else {
    log('❌ SOME CHECKS FAILED - FIX ISSUES BEFORE DEPLOYING', 'red');
    process.exit(1);
  }
}

// Main execution
async function main() {
  log('\n🚀 Starting Pre-Production Verification...', 'blue');
  log('This may take a few minutes...\n', 'yellow');
  
  checkTypeScript();
  checkESLint();
  checkAuthInAPIRoutes();
  checkEnvironmentVariables();
  checkDatabaseModels();
  checkNextJSCompatibility();
  checkImportConsistency();
  checkSecurityPractices();
  checkBuild();
  
  generateReport();
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
