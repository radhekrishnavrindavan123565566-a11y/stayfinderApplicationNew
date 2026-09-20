#!/usr/bin/env tsx

/**
 * Setup Test Users Script
 * 
 * This script creates the required test users if they don't exist:
 * - owner@gmail.com (Owner role)
 * - tenant@gmail.com (Tenant role)
 * - admin@matchnest.in (Admin role)
 */

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080";

const TEST_USERS = [
  {
    email: "owner@gmail.com",
    password: "Admin@gmail1",
    username: "Test Owner",
    role: "owner",
  },
  {
    email: "tenant@gmail.com",
    password: "Admin@gmail1",
    username: "Test Tenant",
    role: "tenant",
  },
  {
    email: "admin@matchnest.in",
    password: "Admin@MatchNest2025",
    username: "Test Admin",
    role: "admin",
  },
];

async function checkUserExists(email: string, password: string): Promise<boolean> {
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
    return true;
  } catch {
    return false;
  }
}

async function createUser(user: typeof TEST_USERS[0]): Promise<boolean> {
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, user);
    return true;
  } catch (error: any) {
    if (error.response?.data?.error?.includes("already exists")) {
      return true;
    }
    console.error(`❌ Failed to create ${user.email}:`, error.response?.data?.error || error.message);
    return false;
  }
}

async function main() {
  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/api/health`);
  } catch {
    console.error("❌ Server is not running at", BASE_URL);
    process.exit(1);
  }

  let allSuccess = true;

  for (const user of TEST_USERS) {
    // Check if user exists
    const exists = await checkUserExists(user.email, user.password);
    
    if (!exists) {
      // Try to create user
      const created = await createUser(user);
      if (!created) {
        allSuccess = false;
      }
    }
  }

  if (!allSuccess) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("\n❌ Setup error:", error.message, "\n");
  process.exit(1);
});
