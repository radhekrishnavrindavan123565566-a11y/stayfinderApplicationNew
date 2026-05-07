# 🚀 Running on Port 8080

## ✅ Configuration Complete

Your application is now configured to run on port 8080!

## 📋 Quick Start

### Step 1: Start Server on Port 8080
```bash
npm run dev -- -p 8080
```

Or set the PORT environment variable:
```bash
PORT=8080 npm run dev
```

Wait until you see:
```
✓ Ready in X.Xs
○ Local: http://localhost:8080
```

### Step 2: Setup Test Users (First Time Only)
Open a **NEW terminal** and run:
```bash
npm run test:setup
```

You should see:
```
✅ User verified: owner@gmail.com (owner)
✅ User verified: tenant@gmail.com (tenant)
✅ User verified: admin@matchnest.in (admin)

✅ All test users are ready!
```

### Step 3: Run Automated Tests
```bash
npm run test:auto
```

## 🔍 Verify Server is Running

```bash
curl http://localhost:8080/api/health
```

Should return: `{"status":"ok"}`

## 📊 What Changed

1. ✅ `.env` file already has `NEXT_PUBLIC_APP_URL=http://localhost:8080`
2. ✅ Test files updated to use port 8080
3. ✅ All tests will automatically run on port 8080

## 🎯 Test Output

The tests will now show:
```
🚀 STAYERRA - AUTOMATED TEST SUITE
==================================================================

📋 Test Configuration:
   • Owner: owner@gmail.com
   • Tenant: tenant@gmail.com
   • Admin: admin@matchnest.in
   • Base URL: http://localhost:8080  ← Port 8080!

🔍 Checking if development server is running...
✅ Server is running

🧪 Running automated tests...
```

## 🌐 Access the Application

- **Frontend**: http://localhost:8080
- **API Health**: http://localhost:8080/api/health
- **Dashboard**: http://localhost:8080/dashboard/daily

## 🔧 Troubleshooting

### Port Already in Use
If you see "Port 8080 is already in use":

**Windows:**
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find and kill process
lsof -ti:8080 | xargs kill -9
```

### Server Not Starting
Make sure no other application is using port 8080:
```bash
# Check if port is available
curl http://localhost:8080
```

If you get "Connection refused", the port is free.

## 📝 Environment Variables

Your `.env` file has:
```env
NEXTAUTH_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:8080
```

These are already configured correctly! ✅

## 🎉 Ready to Test!

Run these commands:
```bash
# Terminal 1: Start server on port 8080
npm run dev -- -p 8080

# Terminal 2: Setup users (first time only)
npm run test:setup

# Terminal 2: Run all tests
npm run test:auto
```

All tests will automatically run on port 8080! 🚀
