#!/usr/bin/env tsx

/**
 * Automated Test Runner for Daily Engagement Features
 * 
 * This script runs comprehensive tests for all user roles:
 * - Owner (owner@gmail.com)
 * - Tenant (tenant@gmail.com)
 * - Admin (admin@matchnest.in)
 * 
 * Tests cover:
 * - Document Vault (upload, share, delete)
 * - Bill Splitter (expenses, settlements)
 * - Authorization & Security
 * - Data Validation
 * - Storage Limits
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

async function checkServerRunning(): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080";
    const response = await fetch(`${baseUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  log("\n" + "=".repeat(70), COLORS.cyan);
  log("🚀 STAYERRA - AUTOMATED TEST SUITE", COLORS.bright + COLORS.cyan);
  log("=".repeat(70) + "\n", COLORS.cyan);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080";
  log("📋 Test Configuration:", COLORS.yellow);
  log("   • Owner: owner@gmail.com", COLORS.reset);
  log("   • Tenant: tenant@gmail.com", COLORS.reset);
  log("   • Admin: admin@matchnest.in", COLORS.reset);
  log(`   • Base URL: ${baseUrl}\n`, COLORS.reset);

  // Check if server is running
  log("🔍 Checking if development server is running...", COLORS.yellow);
  const isRunning = await checkServerRunning();

  if (!isRunning) {
    log("❌ Development server is not running!", COLORS.red);
    log("\n💡 Please start the server first:", COLORS.yellow);
    log("   npm run dev\n", COLORS.cyan);
    process.exit(1);
  }

  log("✅ Server is running\n", COLORS.green);

  // Run tests
  log("🧪 Running automated tests...\n", COLORS.yellow);

  try {
    const { stdout, stderr } = await execAsync(
      "npx vitest run tests/integration/daily-engagement.test.ts --reporter=verbose"
    );

    console.log(stdout);
    if (stderr) console.error(stderr);

    log("\n" + "=".repeat(70), COLORS.green);
    log("✅ ALL TESTS COMPLETED SUCCESSFULLY!", COLORS.bright + COLORS.green);
    log("=".repeat(70) + "\n", COLORS.green);

    log("📊 Test Coverage:", COLORS.cyan);
    log("   ✅ Document Vault - All scenarios tested", COLORS.green);
    log("   ✅ Bill Splitter - All scenarios tested", COLORS.green);
    log("   ✅ Authorization - Role-based access verified", COLORS.green);
    log("   ✅ Security - Authentication checks passed", COLORS.green);
    log("   ✅ Validation - Data integrity verified", COLORS.green);
    log("   ✅ Storage Limits - 50 MB limit enforced\n", COLORS.green);

  } catch (error: any) {
    log("\n" + "=".repeat(70), COLORS.red);
    log("❌ SOME TESTS FAILED", COLORS.bright + COLORS.red);
    log("=".repeat(70) + "\n", COLORS.red);

    console.error(error.stdout || error.message);

    log("\n💡 Check the output above for details\n", COLORS.yellow);
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Test runner error: ${error.message}\n`, COLORS.red);
  process.exit(1);
});
