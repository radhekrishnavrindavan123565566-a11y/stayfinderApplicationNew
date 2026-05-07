# 🧪 Complete Testing Instructions

## Quick Start (3 Steps)

### Step 1: Start the Development Server
```bash
npm run dev
```

Wait until you see:
```
✓ Ready in X.Xs
○ Local: http://localhost:3000
```

### Step 2: Setup Test Users (First Time Only)
Open a **new terminal** and run:
```bash
npm run test:setup
```

You should see:
```
✅ All test users are ready!

📋 Test Credentials:
   OWNER: owner@gmail.com / Admin@gmail1
   TENANT: tenant@gmail.com / Admin@gmail1
   ADMIN: admin@matchnest.in / Admin@MatchNest2025

🚀 You can now run the automated tests:
   npm run test:auto
```

### Step 3: Run Automated Tests
```bash
npm run test:auto
```

## 📊 What Will Be Tested

The automated tests will verify **ALL** scenarios for **ALL** user roles:

### ✅ Document Vault (8 tests per role)
- Upload documents (Aadhaar, PAN, property deeds)
- List all documents
- Get specific document details
- Create secure share links (24-hour expiry)
- List active shares
- Update document metadata
- Delete documents
- Authorization checks (users can't access others' documents)

### ✅ Bill Splitter (7 tests per role)
- Create shared expenses (electricity, water, groceries)
- List expenses with pagination
- Filter by category
- Get settlement summary (who owes whom)
- Mark settlements as paid
- Confirm payments
- UPI transaction validation

### ✅ Security & Authorization (6 tests)
- Unauthenticated access blocked
- Invalid tokens rejected
- Role-based access control
- Cross-user data access prevented
- Token validation
- Permission enforcement

### ✅ Data Validation (4 tests)
- Required fields validation
- Split amount validation (must sum to total)
- UPI ID format validation (12 digits)
- File size validation

### ✅ Storage Limits (2 tests)
- 50 MB per-user limit enforced
- Storage tracking on upload/delete

## 📈 Expected Output

```
🚀 STAYERRA - AUTOMATED TEST SUITE
==================================================================

📋 Test Configuration:
   • Owner: owner@gmail.com
   • Tenant: tenant@gmail.com
   • Admin: admin@matchnest.in
   • Base URL: http://localhost:3000

🔍 Checking if development server is running...
✅ Server is running

🧪 Running automated tests...

🔐 Authenticating all users...
✅ All users authenticated successfully

📄 Document Vault - Tenant Scenarios
  ✅ Tenant: Upload a document
  ✅ Document uploaded: 507f1f77bcf86cd799439011
  ✅ Tenant: List all documents
  ✅ Found 1 documents
  ✅ Tenant: Get specific document
  ✅ Document retrieved successfully
  ✅ Tenant: Create document share link
  ✅ Share link created: http://localhost:3000/documents/shared/abc123...
  ✅ Tenant: List active shares
  ✅ Found 1 active shares
  ❌ Tenant: Cannot access owner's documents
  ✅ Authorization check passed - tenant cannot access other's documents
  ✅ Tenant: Update document expiry date
  ✅ Document expiry date updated

💰 Bill Splitter - Tenant Scenarios
  ✅ Tenant: Create a shared expense
  ✅ Expense created: 507f1f77bcf86cd799439012
  ✅ Tenant: List all expenses
  ✅ Found 1 expenses (page 1 of 1)
  ✅ Tenant: Filter expenses by category
  ✅ Found 1 electricity expenses
  ✅ Tenant: Get settlements summary
  ✅ Settlement summary: { owedToMe: 500, iOwe: 0, netBalance: 500 }
  ✅ Tenant: Get pending settlements
  ✅ Found 1 pending settlements
  ✅ Tenant: Mark settlement as paid
  ✅ Settlement marked as paid
  ❌ Tenant: Cannot mark settlement as paid with invalid UPI ID
  ✅ Validation check passed - invalid UPI ID rejected

🏢 Owner Scenarios
  ✅ Owner: Upload property document
  ✅ Owner uploaded property document
  ✅ Owner: List their documents
  ✅ Owner has 1 documents
  ✅ Owner: Create expense for property maintenance
  ✅ Owner created maintenance expense
  ✅ Owner: View their expenses
  ✅ Owner has 1 total expenses
  ❌ Owner: Cannot access tenant's documents
  ✅ Authorization check passed - owner cannot access tenant's documents

👑 Admin Scenarios
  ✅ Admin: Upload admin document
  ✅ Admin uploaded document
  ✅ Admin: List their documents
  ✅ Admin has 1 documents
  ✅ Admin: Create expense
  ✅ Admin created expense

🔒 Security & Authorization Tests
  ❌ Unauthenticated: Cannot access documents
  ✅ Security check passed - unauthenticated access blocked
  ❌ Unauthenticated: Cannot create expense
  ✅ Security check passed - unauthenticated expense creation blocked
  ❌ Invalid token: Cannot access protected routes
  ✅ Security check passed - invalid token rejected

📊 Storage Limit Tests
  ❌ Tenant: Cannot exceed 50 MB storage limit
  ✅ Storage limit check passed - large file rejected

✅ Data Validation Tests
  ❌ Cannot create expense with invalid split amounts
  ✅ Validation check passed - invalid split amounts rejected
  ❌ Cannot create document without required fields
  ✅ Validation check passed - missing fields rejected

🧹 Cleanup Tests
  ✅ Tenant: Delete uploaded document
  ✅ Document deleted successfully
  ✅ Verify document is deleted
  ✅ Document deletion verified

✅ All automated tests completed!

==================================================================
✅ ALL TESTS COMPLETED SUCCESSFULLY!
==================================================================

📊 Test Coverage:
   ✅ Document Vault - All scenarios tested
   ✅ Bill Splitter - All scenarios tested
   ✅ Authorization - Role-based access verified
   ✅ Security - Authentication checks passed
   ✅ Validation - Data integrity verified
   ✅ Storage Limits - 50 MB limit enforced
```

## 🎯 Test Results Interpretation

### ✅ Green Checkmarks
These indicate **successful operations** that should work:
- Document uploads
- Expense creation
- Data retrieval
- Valid operations

### ❌ Red X Marks
These indicate **expected failures** (security/validation working correctly):
- Unauthorized access attempts
- Invalid data submissions
- Storage limit violations
- Cross-user data access

**Both are good!** The ❌ marks show that security and validation are working.

## 🔧 Troubleshooting

### Problem: "Server is not running"
```bash
❌ Development server is not running!
```

**Solution:**
```bash
# Terminal 1: Start the server
npm run dev

# Terminal 2: Wait for server to be ready, then run tests
npm run test:auto
```

### Problem: "Login failed"
```bash
Login failed for owner@gmail.com: Unauthorized
```

**Solution:**
```bash
# Setup test users first
npm run test:setup
```

### Problem: "User already exists"
```bash
❌ Failed to create owner@gmail.com: User already exists
```

**Solution:** This is actually fine! The user exists. Just run the tests:
```bash
npm run test:auto
```

### Problem: "Database connection error"
```bash
Database connection error
```

**Solution:**
1. Check MongoDB is running
2. Verify `.env` file has correct `MONGODB_URI`
3. Test connection: `mongosh <your-connection-string>`

### Problem: Tests timeout
```bash
Test timed out after 5000ms
```

**Solution:**
1. Server might be slow - wait longer
2. Check server logs for errors
3. Verify database is responding

## 📝 Manual Verification (Optional)

If you want to manually verify any feature:

### Test Document Upload
```bash
# Login as tenant
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tenant@gmail.com","password":"Admin@gmail1"}'

# Use the token from response
curl -X POST http://localhost:3000/api/documents \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "aadhaar",
    "fileName": "test.pdf",
    "fileUrl": "https://example.com/test.pdf",
    "fileSize": 1024000
  }'
```

### Test Expense Creation
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "description": "Test expense",
    "category": "electricity",
    "paidBy": "<user-id>",
    "splitMethod": "equal",
    "participants": [
      {"userId": "<user-id>", "shareAmount": 1000}
    ]
  }'
```

## 🎉 Success Criteria

All tests pass when you see:

```
✅ ALL TESTS COMPLETED SUCCESSFULLY!

Test Summary:
   Total Tests: 35+
   Passed: 35+
   Failed: 0
   Duration: ~10-15 seconds
```

## 📞 Need Help?

If tests fail:
1. Read the error message carefully
2. Check the troubleshooting section above
3. Verify all prerequisites (server running, users created)
4. Check server logs for backend errors
5. Review `AUTOMATED_TESTING_GUIDE.md` for detailed information

## 🚀 Next Steps

After all tests pass:
1. ✅ Backend is verified working
2. ✅ All user roles tested
3. ✅ Security measures confirmed
4. ✅ Ready for frontend development
5. ✅ Ready for production deployment

## 📚 Additional Resources

- `AUTOMATED_TESTING_GUIDE.md` - Detailed testing documentation
- `DAILY_ENGAGEMENT_IMPLEMENTATION.md` - Implementation details
- `tests/integration/daily-engagement.test.ts` - Test source code
- `tests/run-automated-tests.ts` - Test runner script
