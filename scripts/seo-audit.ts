/**
 * SEO Audit Script
 * Run with: npm run seo:audit
 * Checks common SEO issues across the site
 */

import fs from 'fs';
import path from 'path';

interface AuditResult {
  passed: number;
  failed: number;
  warnings: number;
  issues: {
    error: string[];
    warning: string[];
    success: string[];
  };
}

const auditResults: AuditResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: {
    error: [],
    warning: [],
    success: [],
  },
};

function logError(message: string) {
  auditResults.failed++;
  auditResults.issues.error.push(message);
  console.error(`❌ ${message}`);
}

function logWarning(message: string) {
  auditResults.warnings++;
  auditResults.issues.warning.push(message);
  console.warn(`⚠️  ${message}`);
}

function logSuccess(message: string) {
  auditResults.passed++;
  auditResults.issues.success.push(message);
  console.log(`✅ ${message}`);
}

/**
 * Check if layout.tsx has proper SEO meta tags
 */
async function checkLayoutMetaTags() {
  console.log('\n📋 Checking Layout Meta Tags...');

  const layoutPath = path.join(process.cwd(), 'app/layout.tsx');

  if (!fs.existsSync(layoutPath)) {
    logError('layout.tsx not found');
    return;
  }

  const content = fs.readFileSync(layoutPath, 'utf-8');

  const checks = [
    { name: 'Google Site Verification', pattern: /google-site-verification/i },
    { name: 'Robots Meta Tag', pattern: /robots:/i },
    { name: 'Viewport Meta Tag', pattern: /viewport/i },
    { name: 'OpenGraph Tags', pattern: /openGraph:/i },
    { name: 'Twitter Card Tags', pattern: /twitter:/i },
    { name: 'Canonical URL', pattern: /canonical/i },
    { name: 'Description Meta Tag', pattern: /description/i },
    { name: 'Keywords', pattern: /keywords/i },
  ];

  checks.forEach(({ name, pattern }) => {
    if (pattern.test(content)) {
      logSuccess(`${name} found`);
    } else {
      logWarning(`${name} missing`);
    }
  });
}

/**
 * Check if robots.txt exists
 */
function checkRobotsTxt() {
  console.log('\n🤖 Checking robots.txt...');

  const robotsPath = path.join(process.cwd(), 'public/robots.txt');

  if (fs.existsSync(robotsPath)) {
    logSuccess('robots.txt exists');

    const content = fs.readFileSync(robotsPath, 'utf-8');

    if (content.includes('Sitemap:')) {
      logSuccess('Sitemap reference found in robots.txt');
    } else {
      logWarning('Sitemap reference missing in robots.txt');
    }

    if (content.includes('User-agent:')) {
      logSuccess('User-agent rules found');
    } else {
      logError('No User-agent rules found');
    }
  } else {
    logError('robots.txt not found');
  }
}

/**
 * Check if sitemap files exist
 */
function checkSitemaps() {
  console.log('\n🗺️  Checking Sitemaps...');

  const sitemapFiles = [
    'app/sitemap.ts',
    'public/sitemap.xml',
  ];

  sitemapFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      logSuccess(`${file} exists`);
    } else {
      logWarning(`${file} not found`);
    }
  });
}

/**
 * Check SEO configuration
 */
function checkSeoConfig() {
  console.log('\n⚙️  Checking SEO Configuration...');

  const seoConfigPath = path.join(process.cwd(), 'lib/seoConfig.ts');

  if (fs.existsSync(seoConfigPath)) {
    logSuccess('SEO Config file exists');

    const content = fs.readFileSync(seoConfigPath, 'utf-8');

    const checks = [
      { name: 'Analytics ID', pattern: /googleAnalyticsId/i },
      { name: 'Keywords Configuration', pattern: /keywords:/i },
      { name: 'Performance Targets', pattern: /performance:/i },
      { name: 'Social Media Links', pattern: /social:/i },
    ];

    checks.forEach(({ name, pattern }) => {
      if (pattern.test(content)) {
        logSuccess(`${name} configured`);
      } else {
        logWarning(`${name} not configured`);
      }
    });
  } else {
    logError('SEO Config file not found');
  }
}

/**
 * Check if required SEO utility files exist
 */
function checkSeoUtilities() {
  console.log('\n🛠️  Checking SEO Utilities...');

  const utilities = [
    { path: 'lib/seo.ts', name: 'SEO Utility Library' },
    { path: 'components/seo/SchemaRenderer.tsx', name: 'Schema Renderer' },
    { path: 'components/seo/Breadcrumb.tsx', name: 'Breadcrumb Component' },
    { path: 'components/seo/OptimizedImage.tsx', name: 'Optimized Image' },
    { path: 'hooks/useWebVitals.ts', name: 'Web Vitals Hook' },
  ];

  utilities.forEach(({ path: filePath, name }) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      logSuccess(`${name} exists`);
    } else {
      logError(`${name} missing`);
    }
  });
}

/**
 * Check next.config.js for SEO optimizations
 */
async function checkNextConfig() {
  console.log('\n⚡ Checking Next.js Configuration...');

  const configPath = path.join(process.cwd(), 'next.config.js');

  if (!fs.existsSync(configPath)) {
    logError('next.config.js not found');
    return;
  }

  const content = fs.readFileSync(configPath, 'utf-8');

  const checks = [
    { name: 'Image Optimization', pattern: /images:/i },
    { name: 'Headers Configuration', pattern: /async headers/i },
    { name: 'Cache Control', pattern: /Cache-Control/i },
    { name: 'Security Headers', pattern: /X-Content-Type-Options/i },
    { name: 'Compression', pattern: /compress/i },
  ];

  checks.forEach(({ name, pattern }) => {
    if (pattern.test(content)) {
      logSuccess(`${name} configured`);
    } else {
      logWarning(`${name} not configured`);
    }
  });
}

/**
 * Check package.json for SEO dependencies
 */
function checkDependencies() {
  console.log('\n📦 Checking Dependencies...');

  const packagePath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packagePath)) {
    logError('package.json not found');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = [
    'next',
    'react',
    'web-vitals',
  ];

  requiredDeps.forEach((dep) => {
    if (deps[dep]) {
      logSuccess(`${dep} installed`);
    } else {
      logError(`${dep} not found`);
    }
  });
}

/**
 * Check environment variables
 */
function checkEnvironment() {
  console.log('\n🔐 Checking Environment Variables...');

  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (fs.existsSync(envPath)) {
    logSuccess('.env file exists');
  } else {
    logWarning('.env file not found');
  }

  if (fs.existsSync(envExamplePath)) {
    logSuccess('.env.example file exists');
  } else {
    logWarning('.env.example file not found');
  }
}

/**
 * Print audit summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 SEO AUDIT SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${auditResults.passed}`);
  console.log(`❌ Failed: ${auditResults.failed}`);
  console.log(`⚠️  Warnings: ${auditResults.warnings}`);
  console.log('='.repeat(50));

  const score = Math.round(
    (auditResults.passed / (auditResults.passed + auditResults.failed + auditResults.warnings)) * 100
  );

  console.log(`\n📈 SEO Score: ${score}%`);

  if (score >= 90) {
    console.log('🎉 Excellent SEO setup!');
  } else if (score >= 70) {
    console.log('👍 Good SEO setup. Fix warnings for better results.');
  } else if (score >= 50) {
    console.log('⚠️  SEO setup needs improvement.');
  } else {
    console.log('❌ Critical SEO issues detected.');
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

/**
 * Main audit function
 */
export async function runAudit() {
  console.log('\n🚀 Starting SEO Audit...\n');

  try {
    checkRobotsTxt();
    checkSitemaps();
    await checkLayoutMetaTags();
    checkSeoConfig();
    checkSeoUtilities();
    await checkNextConfig();
    checkDependencies();
    checkEnvironment();
    printSummary();
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  runAudit();
}
