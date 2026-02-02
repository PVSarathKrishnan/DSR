# 🚀 QUICK DEPLOYMENT CHECKLIST

## ✅ **DATA VERIFICATION**

**All data collected accurately:**
- ✅ Date (auto-added)
- ✅ Task (from webhook)
- ✅ Description (from webhook)
- ✅ Hours (from webhook)
- ✅ Status (from webhook)
- ✅ Git Branch (from webhook)

---

## 📋 **DEPLOYMENT STEPS**

### **1. Update Sheets (5 min)**
```
Sheet1: Date | Task | Description | Hours | Status | Git Branch
Sheet2: Date | Task | Description | Hours | Status | Git Branch
Sheet3: Date | Task | Description | Hours | Status | Git Branch
```

### **2. Update Apps Script (3 min)**
1. Extensions → Apps Script
2. Delete ALL old code
3. Copy from: `/Users/uiuxateam/DSR/apps_script_final.js`
4. Paste and Save

### **3. Test SAFELY (2 min)**
1. Add test data to Sheet1
2. Run: `testDailyReport()`
3. Check email (only to you!)
4. Verify format

### **4. Set Triggers (2 min)**
**Daily:** `sendDailyReport` at 11pm-midnight
**Weekly:** `sendWeeklyReport` on Sunday 8pm-9pm

### **5. Deploy Webhook (3 min)**
1. Deploy → Manage deployments
2. New deployment / Edit
3. Copy webhook URL
4. Update `webhook_config.py`

---

## ⚠️ **CRITICAL REMINDERS**

**✅ FOR TESTING:**
```javascript
testDailyReport()    // ONLY sends to you
testWeeklyReport()   // ONLY sends to you
```

**🚨 FOR PRODUCTION:**
```javascript
sendDailyReport()    // Sends to everyone (via trigger)
sendWeeklyReport()   // Sends to everyone (via trigger)
```

**🎯 MINIMUM HOURS:**
- Daily report only sends if >= 6 hours
- Data still moves and clears regardless

---

## 📧 **EMAIL RECIPIENTS**

**Daily Report:**
- To: sarin@ateamsoftsolutions.com
- CC: rakesh, sanoj, director

**Weekly Report:**
- To: sarin@ateamsoftsolutions.com
- CC: rakesh, sanoj

**Test Reports:**
- To: sarath.krishnan@ateamsoftsolutions.com
- CC: None

---

## 🔄 **DATA FLOW**

```
Webhook → Sheet1 (Daily)
              ↓
        Daily Report (11:55 PM)
              ↓
      Sheet2 + Sheet3 (with data)
      Sheet1 (cleared)
              ↓
        Weekly Report (Sunday 8 PM)
              ↓
      Sheet2 (cleared)
      Sheet3 (kept forever)
```

---

## ✨ **YOU'RE READY!**

Total time: **~15 minutes**

**Full guide:** `/Users/uiuxateam/DSR/DEPLOYMENT_GUIDE.md`
