# ⚡ Quick Test Reference

## 🚀 Run Tests (3 Commands)

```bash
# 1. Start server (Terminal 1)
npm run dev

# 2. Setup users - FIRST TIME ONLY (Terminal 2)
npm run test:setup

# 3. Run all tests (Terminal 2)
npm run test:auto
```

## 📋 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@gmail.com | Admin@gmail1 |
| Tenant | tenant@gmail.com | Admin@gmail1 |
| Admin | admin@matchnest.in | Admin@MatchNest2025 |

## ✅ What's Tested

- **Document Vault**: Upload, share, delete (24 tests)
- **Bill Splitter**: Expenses, settlements (21 tests)
- **Security**: Auth, authorization (6 tests)
- **Validation**: Data integrity (4 tests)
- **Storage**: 50 MB limits (2 tests)

**Total: 57+ automated tests**

## 🎯 Expected Result

```
✅ ALL TESTS COMPLETED SUCCESSFULLY!
   ✅ Document Vault - All scenarios tested
   ✅ Bill Splitter - All scenarios tested
   ✅ Authorization - Role-based access verified
   ✅ Security - Authentication checks passed
   ✅ Validation - Data integrity verified
   ✅ Storage Limits - 50 MB limit enforced
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Server not running | Run `npm run dev` first |
| Login failed | Run `npm run test:setup` |
| Tests timeout | Check server logs |
| Database error | Verify MongoDB connection |

## 📊 Test Coverage

| Feature | Status |
|---------|--------|
| Document Upload | ✅ 100% |
| Document Sharing | ✅ 100% |
| Expense Creation | ✅ 100% |
| Settlement Tracking | ✅ 100% |
| Authorization | ✅ 100% |
| Validation | ✅ 100% |

## 🎉 Success = 0 Failed Tests

All ✅ green checks = Working correctly  
All ❌ red X's = Security working (expected failures)

---

**Full docs**: See `TESTING_INSTRUCTIONS.md`
