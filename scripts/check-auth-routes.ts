/**
 * Authentication Route Checker
 * Specifically validates all API routes have proper authentication
 */

import fs from 'fs';
import path from 'path';

interface AuthIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning';
}

const issues: AuthIssue[] = [];
let totalRoutes = 0;
let protectedRoutes = 0;
let properlyProtected = 0;

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
  
  totalRoutes++;
  
  // Check if file uses authentication
  const hasRequireAuth = content.includes('requireAuth(req)');
  const hasRequireRole = content.includes('requireRole(req');
  
  if (!hasRequireAuth && !hasRequireRole) {
    // Public route - that's okay
    return;
  }
  
  protectedRoutes++;
  
  // Find all authentication calls and verify null checks
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for requireAuth or requireRole
    if (line.includes('requireAuth(req)') || line.includes('requireRole(req')) {
      // Extract variable name
      const varMatch = line.match(/const\s+(\w+)\s*=/);
      if (!varMatch) continue;
      
      const varName = varMatch[1];
      
      // Check next few lines for null check
      let foundNullCheck = false;
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine.includes(`if (!${varName})`) || 
            nextLine.includes(`if(!${varName})`) ||
            nextLine.includes(`if (${varName} === null)`) ||
            nextLine.includes(`if (${varName}==null)`)) {
          foundNullCheck = true;
          
          // Check if return is on same line or next line
          if (nextLine.includes('return errorResponse')) {
            // Return is on same line as if statement
            if (line.includes('requireAuth') && nextLine.includes('401')) {
              properlyProtected++;
            } else if (line.includes('requireRole') && nextLine.includes('403')) {
              properlyProtected++;
            } else {
              issues.push({
                file: relativePath,
                line: j + 1,
                issue: `Wrong status code: requireAuth should use 401, requireRole should use 403`,
                severity: 'error'
              });
            }
          } else {
            // Check next line for return
            const returnLine = lines[j + 1] || '';
            if (returnLine.includes('return errorResponse')) {
              if (line.includes('requireAuth') && returnLine.includes('401')) {
                properlyProtected++;
              } else if (line.includes('requireRole') && returnLine.includes('403')) {
                properlyProtected++;
              } else {
                issues.push({
                  file: relativePath,
                  line: j + 2,
                  issue: `Wrong status code: requireAuth should use 401, requireRole should use 403`,
                  severity: 'error'
                });
              }
            } else {
              issues.push({
                file: relativePath,
                line: j + 2,
                issue: `Null check found but doesn't return errorResponse`,
                severity: 'error'
              });
            }
          }
          break;
        }
      }
      
      if (!foundNullCheck) {
        issues.push({
          file: relativePath,
          line: i + 1,
          issue: `Missing null check after ${line.includes('requireAuth') ? 'requireAuth' : 'requireRole'}`,
          severity: 'error'
        });
      }
    }
  }
}

function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file === 'route.ts') {
      checkFile(filePath);
    }
  }
}

// Main execution
console.log('\n🔐 Checking Authentication in API Routes...\n');

const apiDir = path.join(process.cwd(), 'app', 'api');
if (!fs.existsSync(apiDir)) {
  console.error('❌ API directory not found');
  process.exit(1);
}

scanDirectory(apiDir);

// Report
console.log('📊 Authentication Check Results:');
console.log('─'.repeat(60));
console.log(`Total API Routes: ${totalRoutes}`);
console.log(`Protected Routes: ${protectedRoutes}`);
console.log(`Properly Protected: ${properlyProtected}`);
console.log(`Public Routes: ${totalRoutes - protectedRoutes}`);
console.log('─'.repeat(60));

if (issues.length === 0) {
  console.log('\n✅ All protected routes have proper authentication checks!\n');
  process.exit(0);
} else {
  console.log(`\n❌ Found ${issues.length} authentication issues:\n`);
  
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  
  if (errors.length > 0) {
    console.log('🔴 ERRORS:');
    errors.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.issue}\n`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('🟡 WARNINGS:');
    warnings.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.issue}\n`);
    });
  }
  
  process.exit(1);
}
