/**
 * Responsive Design Checker
 * Verifies all pages and components are mobile-friendly
 */

import fs from 'fs';
import path from 'path';

interface ResponsiveIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning';
}

const issues: ResponsiveIssue[] = [];
let totalFiles = 0;
let responsiveFiles = 0;

// Patterns that indicate responsive design
const RESPONSIVE_PATTERNS = [
  /sm:/,
  /md:/,
  /lg:/,
  /xl:/,
  /2xl:/,
  /flex-col/,
  /flex-row/,
  /grid-cols-/,
  /hidden\s+(sm|md|lg|xl):/,
];

// Anti-patterns that might cause issues
const ANTI_PATTERNS = [
  { pattern: /w-\[\d{4,}px\]/, message: 'Fixed width too large (use max-w or responsive units)' },
  { pattern: /h-\[\d{4,}px\]/, message: 'Fixed height too large (use max-h or responsive units)' },
  { pattern: /text-\d{2,}xl(?!\s)/, message: 'Very large text without responsive sizing' },
  { pattern: /overflow-x-auto(?!.*overflow-y)/, message: 'Horizontal scroll might indicate layout issue' },
];

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
  
  totalFiles++;
  
  // Check if file has responsive patterns
  const hasResponsive = RESPONSIVE_PATTERNS.some(pattern => pattern.test(content));
  
  if (hasResponsive) {
    responsiveFiles++;
  }
  
  // Check for anti-patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (const { pattern, message } of ANTI_PATTERNS) {
      if (pattern.test(line)) {
        issues.push({
          file: relativePath,
          line: i + 1,
          issue: message,
          severity: 'warning'
        });
      }
    }
    
    // Check for missing mobile menu
    if (line.includes('md:hidden') && line.includes('menu') && !content.includes('mobile')) {
      issues.push({
        file: relativePath,
        line: i + 1,
        issue: 'Desktop-only menu without mobile alternative',
        severity: 'error'
      });
    }
    
    // Check for fixed positioning without responsive adjustments
    if (line.includes('fixed') && !line.includes('sm:') && !line.includes('md:') && !line.includes('lg:')) {
      const nextLines = lines.slice(i, i + 3).join(' ');
      if (!nextLines.includes('sm:') && !nextLines.includes('md:')) {
        issues.push({
          file: relativePath,
          line: i + 1,
          issue: 'Fixed positioning without responsive adjustments',
          severity: 'warning'
        });
      }
    }
  }
}

function scanDirectory(dir: string, extensions: string[] = ['.tsx', '.jsx']) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath, extensions);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      checkFile(filePath);
    }
  }
}

// Main execution
console.log('\n📱 Checking Responsive Design...\n');

const appDir = path.join(process.cwd(), 'app');
const componentsDir = path.join(process.cwd(), 'components');

if (fs.existsSync(appDir)) {
  scanDirectory(appDir);
}

if (fs.existsSync(componentsDir)) {
  scanDirectory(componentsDir);
}

// Report
console.log('📊 Responsive Design Check Results:');
console.log('─'.repeat(60));
console.log(`Total Files Checked: ${totalFiles}`);
console.log(`Files with Responsive Design: ${responsiveFiles}`);
console.log(`Responsive Coverage: ${((responsiveFiles / totalFiles) * 100).toFixed(1)}%`);
console.log('─'.repeat(60));

if (issues.length === 0) {
  console.log('\n✅ No responsive design issues found!\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  Found ${issues.length} potential responsive issues:\n`);
  
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
    warnings.slice(0, 10).forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.issue}\n`);
    });
    
    if (warnings.length > 10) {
      console.log(`  ... and ${warnings.length - 10} more warnings\n`);
    }
  }
  
  process.exit(warnings.length > 0 ? 0 : 1);
}
