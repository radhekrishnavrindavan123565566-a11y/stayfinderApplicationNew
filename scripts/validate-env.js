#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates Property Experience 360° environment configuration
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}`),
};

// Read environment variables
const envLocal = path.join(process.cwd(), '.env.local');
const envExample = path.join(process.cwd(), '.env.example');

let envContent = '';
let errors = [];
let warnings = [];

log.section('🔍 Property Experience 360° - Environment Validation');

// Check if .env.local exists
log.info('Checking .env.local file...');
if (fs.existsSync(envLocal)) {
  log.success('.env.local file found');
  envContent = fs.readFileSync(envLocal, 'utf-8');
} else {
  log.error('.env.local file not found');
  errors.push('.env.local file is missing. Copy from .env.example and add your configuration.');
}

// Parse environment file
const parseEnv = (content) => {
  const env = {};
  content.split('\n').forEach((line) => {
    if (line && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key) {
        env[key.trim()] = values.join('=').trim();
      }
    }
  });
  return env;
};

const env = parseEnv(envContent);

// Validation checks
log.section('📋 Validation Checks');

// 1. Check Google Maps API Key
log.info('Checking Google Maps API Key...');
const mapsKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (mapsKey && mapsKey !== 'your-google-maps-api-key-here') {
  log.success('Google Maps API Key configured');
  
  // Validate format
  if (mapsKey.startsWith('AIza')) {
    log.success('Google Maps API Key format appears valid');
  } else {
    log.warning('Google Maps API Key format may be incorrect (should start with "AIza")');
  }
} else {
  errors.push('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured. Get one from Google Cloud Console.');
}

// 2. Check Feature Flags
log.info('Checking Feature Flags...');
const features = [
  'ENABLE_FLOOR_PLANS',
  'ENABLE_PROPERTY_COMPARISON',
  'ENABLE_COMMUTE_ESTIMATOR',
  'ENABLE_NEIGHBORHOOD_MAP',
  'ENABLE_SMART_INSIGHTS',
];

features.forEach((feature) => {
  const value = env[feature];
  if (value === 'true' || value === 'false') {
    log.success(`${feature} = ${value}`);
  } else if (!value) {
    log.warning(`${feature} not set (defaults to true)`);
  }
});

// 3. Check Upload Limits
log.info('Checking Upload Limits...');
const floorPlanSize = parseInt(env.MAX_FLOOR_PLAN_SIZE || '5', 10);
const videoSize = parseInt(env.MAX_VIDEO_SIZE || '100', 10);

if (floorPlanSize > 0 && floorPlanSize <= 10) {
  log.success(`MAX_FLOOR_PLAN_SIZE = ${floorPlanSize}MB`);
} else {
  warnings.push(`MAX_FLOOR_PLAN_SIZE should be between 1-10MB (currently ${floorPlanSize}MB)`);
}

if (videoSize > 0 && videoSize <= 500) {
  log.success(`MAX_VIDEO_SIZE = ${videoSize}MB`);
} else {
  warnings.push(`MAX_VIDEO_SIZE should be between 1-500MB (currently ${videoSize}MB)`);
}

// 4. Check Performance Limits
log.info('Checking Performance Limits...');
const comparisonLimit = parseInt(env.MAX_COMPARISON_PROPERTIES || '5', 10);
const commuteLimit = parseInt(env.MAX_COMMUTE_DESTINATIONS || '5', 10);

if (comparisonLimit >= 2 && comparisonLimit <= 10) {
  log.success(`MAX_COMPARISON_PROPERTIES = ${comparisonLimit}`);
} else {
  warnings.push(`MAX_COMPARISON_PROPERTIES should be 2-10 (currently ${comparisonLimit})`);
}

if (commuteLimit >= 1 && commuteLimit <= 10) {
  log.success(`MAX_COMMUTE_DESTINATIONS = ${commuteLimit}`);
} else {
  warnings.push(`MAX_COMMUTE_DESTINATIONS should be 1-10 (currently ${commuteLimit})`);
}

// 5. Check Caching
log.info('Checking Cache Settings...');
const cacheDays = parseInt(env.COMMUTE_CACHE_DURATION || '7', 10);
if (cacheDays > 0 && cacheDays <= 30) {
  log.success(`COMMUTE_CACHE_DURATION = ${cacheDays} days`);
} else {
  warnings.push(`COMMUTE_CACHE_DURATION should be 1-30 days (currently ${cacheDays})`);
}

// 6. Check Other APIs
log.info('Checking Optional APIs...');
if (env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN !== '') {
  log.success('Mapbox Access Token configured (alternative to Google Maps)');
} else {
  log.info('Mapbox not configured (optional)');
}

// 7. Check Maps Configuration
log.info('Checking Maps Configuration...');
const allowedOrigins = env.NEXT_PUBLIC_MAPS_ALLOWED_ORIGINS;
if (allowedOrigins) {
  const origins = allowedOrigins.split(',').map((o) => o.trim());
  log.success(`Maps allowed origins: ${origins.length} configured`);
  origins.forEach((o) => console.log(`  - ${o}`));
} else {
  log.warning('NEXT_PUBLIC_MAPS_ALLOWED_ORIGINS not configured (recommended for production)');
}

// Summary
log.section('📊 Validation Summary');

if (errors.length === 0 && warnings.length === 0) {
  log.success('✓ All checks passed! Environment is properly configured.');
  process.exit(0);
} else {
  if (errors.length > 0) {
    log.error(`${errors.length} error(s) found:`);
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }

  if (warnings.length > 0) {
    log.warning(`${warnings.length} warning(s) found:`);
    warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
  }

  process.exit(errors.length > 0 ? 1 : 0);
}
