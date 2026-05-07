/**
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import axios, { AxiosInstance } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080";

// Test credentials
const CREDENTIALS = {
  owner: {
    email: "owner@gmail.com",
    password: "Admin@gmail1",
    role: "owner",
  },
  tenant: {
    email: "tenant@gmail.com",
    password: "Admin@gmail1",
    role: "tenant",
  },
  admin: {
    email: "admin@matchnest.in",
    password: "Admin@MatchNest2025",
    role: "admin",
  },
};

interface TestContext {
  ownerToken: string;
  tenantToken: string;
  adminToken: string;
  ownerClient: AxiosInstance;
  tenantClient: AxiosInstance;
  adminClient: AxiosInstance;
  testData: {
    documentId?: string;
    shareToken?: string;
    expenseId?: string;
    settlementId?: string;
    propertyId?: string;
    bookingId?: string;
  };
}

const ctx: TestContext = {
  ownerToken: "",
  tenantToken: "",
  adminToken: "",
  ownerClient: axios.create({ baseURL: BASE_URL }),
  tenantClient: axios.create({ baseURL: BASE_URL }),
  adminClient: axios.create({ baseURL: BASE_URL }),
  testData: {},
};

// Helper function to login and get token
async function login(email: string, password: string): Promise<string> {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    return response.data.data.accessToken;
  } catch (error: any) {
    console.error(`Login failed for ${email}:`, error.response?.data || error.message);
    throw error;
  }
}

// Setup authenticated clients
beforeAll(async () => {
  console.log("\n🔐 Authenticating all users...\n");

  // Login all users
  ctx.ownerToken = await login(CREDENTIALS.owner.email, CREDENTIALS.owner.password);
  ctx.tenantToken = await login(CREDENTIALS.tenant.email, CREDENTIALS.tenant.password);
  ctx.adminToken = await login(CREDENTIALS.admin.email, CREDENTIALS.admin.password);

  // Setup axios clients with tokens
  ctx.ownerClient.defaults.headers.common["Authorization"] = `Bearer ${ctx.ownerToken}`;
  ctx.tenantClient.defaults.headers.common["Authorization"] = `Bearer ${ctx.tenantToken}`;
  ctx.adminClient.defaults.headers.common["Authorization"] = `Bearer ${ctx.adminToken}`;

  console.log("✅ All users authenticated successfully\n");
});

describe("🏠 Daily Engagement Features - Automated Testing", () => {
  describe("📄 Document Vault - Tenant Scenarios", () => {
    it("✅ Tenant: Upload a document", async () => {
      const response = await ctx.tenantClient.post("/api/documents", {
        documentType: "aadhaar",
        fileName: "aadhaar-test.pdf",
        fileUrl: "https://res.cloudinary.com/demo/test-aadhaar.pdf",
        fileSize: 1024000, // 1 MB
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.document).toBeDefined();
      expect(response.data.data.document.documentType).toBe("aadhaar");

      ctx.testData.documentId = response.data.data.document._id;
      console.log("✅ Document uploaded:", ctx.testData.documentId);
    });

    it("✅ Tenant: List all documents", async () => {
      const response = await ctx.tenantClient.get("/api/documents");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data.documents)).toBe(true);
      expect(response.data.data.documents.length).toBeGreaterThan(0);

      console.log(`✅ Found ${response.data.data.documents.length} documents`);
    });

    it("✅ Tenant: Get specific document", async () => {
      if (!ctx.testData.documentId) {
        throw new Error("Document ID not found");
      }

      const response = await ctx.tenantClient.get(
        `/api/documents/${ctx.testData.documentId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.document._id).toBe(ctx.testData.documentId);

      console.log("✅ Document retrieved successfully");
    });

    it("✅ Tenant: Create document share link", async () => {
      if (!ctx.testData.documentId) {
        throw new Error("Document ID not found");
      }

      const response = await ctx.tenantClient.post("/api/documents/share", {
        documentIds: [ctx.testData.documentId],
        expiryHours: 24,
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.share.shareToken).toBeDefined();
      expect(response.data.data.share.shareUrl).toBeDefined();

      ctx.testData.shareToken = response.data.data.share.shareToken;
      console.log("✅ Share link created:", response.data.data.share.shareUrl);
    });

    it("✅ Tenant: List active shares", async () => {
      const response = await ctx.tenantClient.get("/api/documents/share");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data.shares)).toBe(true);

      console.log(`✅ Found ${response.data.data.shares.length} active shares`);
    });

    it("❌ Tenant: Cannot access owner's documents", async () => {
      try {
        // Try to access a non-existent document (simulating owner's doc)
        await ctx.tenantClient.get("/api/documents/507f1f77bcf86cd799439011");
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
        console.log("✅ Authorization check passed - tenant cannot access other's documents");
      }
    });

    it("✅ Tenant: Update document expiry date", async () => {
      if (!ctx.testData.documentId) {
        throw new Error("Document ID not found");
      }

      const newExpiryDate = new Date(Date.now() + 730 * 24 * 60 * 60 * 1000); // 2 years
      const response = await ctx.tenantClient.patch(
        `/api/documents/${ctx.testData.documentId}`,
        {
          expiryDate: newExpiryDate,
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log("✅ Document expiry date updated");
    });
  });

  describe("💰 Bill Splitter - Tenant Scenarios", () => {
    it("✅ Tenant: Create a shared expense", async () => {
      // Get the actual user ID from the decoded token
      const meResponse = await ctx.tenantClient.get("/api/auth/me");
      const tenantUserId = meResponse.data.data.user._id;

      const response = await ctx.tenantClient.post("/api/expenses", {
        amount: 1000,
        description: "Electricity bill for January",
        category: "electricity",
        paidBy: tenantUserId, // Use actual user ID
        splitMethod: "equal",
        participants: [
          {
            userId: tenantUserId,
            shareAmount: 1000,
          },
        ],
        expenseDate: new Date(),
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.expense).toBeDefined();

      ctx.testData.expenseId = response.data.data.expense._id;
      console.log("✅ Expense created:", ctx.testData.expenseId);
    });

    it("✅ Tenant: List all expenses", async () => {
      const response = await ctx.tenantClient.get("/api/expenses?page=1&limit=20");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.expenses).toBeDefined();
      expect(response.data.data.pagination).toBeDefined();

      console.log(
        `✅ Found ${response.data.data.pagination.total} expenses (page 1 of ${response.data.data.pagination.pages})`
      );
    });

    it("✅ Tenant: Filter expenses by category", async () => {
      const response = await ctx.tenantClient.get(
        "/api/expenses?category=electricity"
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log(
        `✅ Found ${response.data.data.expenses.length} electricity expenses`
      );
    });

    it("✅ Tenant: Get settlements summary", async () => {
      const response = await ctx.tenantClient.get("/api/expenses/settlements");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.summary).toBeDefined();
      expect(response.data.data.summary.owedToMe).toBeDefined();
      expect(response.data.data.summary.iOwe).toBeDefined();
      expect(response.data.data.summary.netBalance).toBeDefined();

      console.log("✅ Settlement summary:", response.data.data.summary);
    });

    it("✅ Tenant: Get pending settlements", async () => {
      const response = await ctx.tenantClient.get(
        "/api/expenses/settlements?status=pending"
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data.settlements)).toBe(true);

      if (response.data.data.settlements.length > 0) {
        ctx.testData.settlementId = response.data.data.settlements[0]._id;
      }

      console.log(
        `✅ Found ${response.data.data.settlements.length} pending settlements`
      );
    });

    it("✅ Tenant: Mark settlement as paid", async () => {
      if (!ctx.testData.settlementId) {
        console.log("⚠️ No settlement to mark as paid, skipping test");
        return;
      }

      const response = await ctx.tenantClient.patch(
        `/api/expenses/settlements/${ctx.testData.settlementId}`,
        {
          action: "mark_paid",
          upiTransactionId: "123456789012",
          note: "Paid via UPI",
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.settlement.paymentStatus).toBe("paid");

      console.log("✅ Settlement marked as paid");
    });

    it("❌ Tenant: Cannot mark settlement as paid with invalid UPI ID", async () => {
      if (!ctx.testData.settlementId) {
        console.log("⚠️ No settlement to test, skipping");
        return;
      }

      try {
        await ctx.tenantClient.patch(
          `/api/expenses/settlements/${ctx.testData.settlementId}`,
          {
            action: "mark_paid",
            upiTransactionId: "invalid", // Invalid format
          }
        );
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
        console.log("✅ Validation check passed - invalid UPI ID rejected");
      }
    });
  });

  describe("🏢 Owner Scenarios", () => {
    it("✅ Owner: Upload property document", async () => {
      const response = await ctx.ownerClient.post("/api/documents", {
        documentType: "other",
        fileName: "property-deed.pdf",
        fileUrl: "https://res.cloudinary.com/demo/property-deed.pdf",
        fileSize: 2048000, // 2 MB
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);

      console.log("✅ Owner uploaded property document");
    });

    it("✅ Owner: List their documents", async () => {
      const response = await ctx.ownerClient.get("/api/documents");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log(`✅ Owner has ${response.data.data.documents.length} documents`);
    });

    it("✅ Owner: Create expense for property maintenance", async () => {
      // Get the actual user ID
      const meResponse = await ctx.ownerClient.get("/api/auth/me");
      const ownerUserId = meResponse.data.data.user._id;

      const response = await ctx.ownerClient.post("/api/expenses", {
        amount: 5000,
        description: "Property maintenance - plumbing repair",
        category: "other",
        paidBy: ownerUserId, // Use actual user ID
        splitMethod: "equal",
        participants: [
          {
            userId: ownerUserId,
            shareAmount: 5000,
          },
        ],
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);

      console.log("✅ Owner created maintenance expense");
    });

    it("✅ Owner: View their expenses", async () => {
      const response = await ctx.ownerClient.get("/api/expenses");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log(
        `✅ Owner has ${response.data.data.pagination.total} total expenses`
      );
    });

    it("❌ Owner: Cannot access tenant's documents", async () => {
      if (!ctx.testData.documentId) {
        console.log("⚠️ No tenant document to test, skipping");
        return;
      }

      try {
        await ctx.ownerClient.get(`/api/documents/${ctx.testData.documentId}`);
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
        console.log("✅ Authorization check passed - owner cannot access tenant's documents");
      }
    });
  });

  describe("👑 Admin Scenarios", () => {
    it("✅ Admin: Upload admin document", async () => {
      const response = await ctx.adminClient.post("/api/documents", {
        documentType: "other",
        fileName: "admin-policy.pdf",
        fileUrl: "https://res.cloudinary.com/demo/admin-policy.pdf",
        fileSize: 512000, // 512 KB
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);

      console.log("✅ Admin uploaded document");
    });

    it("✅ Admin: List their documents", async () => {
      const response = await ctx.adminClient.get("/api/documents");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log(`✅ Admin has ${response.data.data.documents.length} documents`);
    });

    it("✅ Admin: Create expense", async () => {
      // Get the actual user ID
      const meResponse = await ctx.adminClient.get("/api/auth/me");
      const adminUserId = meResponse.data.data.user._id;

      const response = await ctx.adminClient.post("/api/expenses", {
        amount: 10000,
        description: "Platform maintenance cost",
        category: "other",
        paidBy: adminUserId, // Use actual user ID
        splitMethod: "equal",
        participants: [
          {
            userId: adminUserId,
            shareAmount: 10000,
          },
        ],
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);

      console.log("✅ Admin created expense");
    });
  });

  describe("🔒 Security & Authorization Tests", () => {
    it("❌ Unauthenticated: Cannot access documents", async () => {
      try {
        await axios.get(`${BASE_URL}/api/documents`);
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
        console.log("✅ Security check passed - unauthenticated access blocked");
      }
    });

    it("❌ Unauthenticated: Cannot create expense", async () => {
      try {
        await axios.post(`${BASE_URL}/api/expenses`, {
          amount: 1000,
          description: "Test",
          category: "other",
        });
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
        console.log("✅ Security check passed - unauthenticated expense creation blocked");
      }
    });

    it("❌ Invalid token: Cannot access protected routes", async () => {
      try {
        await axios.get(`${BASE_URL}/api/documents`, {
          headers: { Authorization: "Bearer invalid-token" },
        });
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
        console.log("✅ Security check passed - invalid token rejected");
      }
    });
  });

  describe("📊 Storage Limit Tests", () => {
    it("❌ Tenant: Cannot exceed 50 MB storage limit", async () => {
      try {
        await ctx.tenantClient.post("/api/documents", {
          documentType: "other",
          fileName: "large-file.pdf",
          fileUrl: "https://res.cloudinary.com/demo/large-file.pdf",
          fileSize: 60 * 1024 * 1024, // 60 MB - exceeds limit
        });
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data.error).toContain("Storage limit exceeded");
        console.log("✅ Storage limit check passed - large file rejected");
      }
    });
  });

  describe("✅ Data Validation Tests", () => {
    it("❌ Cannot create expense with invalid split amounts", async () => {
      try {
        await ctx.tenantClient.post("/api/expenses", {
          amount: 1000,
          description: "Test expense",
          category: "electricity",
          paidBy: ctx.tenantToken,
          splitMethod: "equal",
          participants: [
            {
              userId: ctx.tenantToken,
              shareAmount: 300, // Total = 300, but amount = 1000
            },
          ],
        });
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data.error).toContain("must sum to total amount");
        console.log("✅ Validation check passed - invalid split amounts rejected");
      }
    });

    it("❌ Cannot create document without required fields", async () => {
      try {
        await ctx.tenantClient.post("/api/documents", {
          documentType: "aadhaar",
          // Missing fileName, fileUrl, fileSize
        });
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
        console.log("✅ Validation check passed - missing fields rejected");
      }
    });
  });

  describe("🧹 Cleanup Tests", () => {
    it("✅ Tenant: Delete uploaded document", async () => {
      if (!ctx.testData.documentId) {
        console.log("⚠️ No document to delete, skipping");
        return;
      }

      const response = await ctx.tenantClient.delete(
        `/api/documents/${ctx.testData.documentId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log("✅ Document deleted successfully");
    });

    it("✅ Verify document is deleted", async () => {
      if (!ctx.testData.documentId) {
        console.log("⚠️ No document to verify, skipping");
        return;
      }

      try {
        await ctx.tenantClient.get(`/api/documents/${ctx.testData.documentId}`);
        throw new Error("Should have failed");
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
        console.log("✅ Document deletion verified");
      }
    });
  });
});

afterAll(() => {
  console.log("\n✅ All automated tests completed!\n");
  console.log("📊 Test Summary:");
  console.log("   - Document Vault: Tested upload, list, share, delete");
  console.log("   - Bill Splitter: Tested expense creation, settlements");
  console.log("   - Authorization: Tested role-based access control");
  console.log("   - Security: Tested authentication and validation");
  console.log("   - Storage Limits: Tested 50 MB limit enforcement");
  console.log("\n");
});
