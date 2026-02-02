# 📧 Daily & Weekly Report Setup Guide

## 🎯 What This Does:

### **Daily Report (11:55 PM):**
✅ Groups commits by Task  
✅ Shows bullet-pointed descriptions  
✅ Displays Status (Completed/In Progress/Road Block)  
✅ Shows Git branch  
✅ **Only sends if total hours >= 6**  
✅ After sending: Clears Sheet1 → Moves to Sheet2 (Weekly) + Sheet3 (Logs)

### **Weekly Report (Sunday 8 PM):**
✅ Same format + date range  
✅ Shows total hours per task  
✅ After sending: Clears Sheet2  
✅ Data remains in Sheet3 (Logs)

---

## 📋 **Step-by-Step Setup:**

### **STEP 1: Update Apps Script**

1. Go to your Google Sheet
2. **Extensions → Apps Script**
3. **Delete all existing code** OR create new file
4. **Copy entire code from:** `/Users/uiuxateam/DSR/apps_script_complete.js`
5. **Paste it** into Apps Script
6. Click **💾 Save**

---

### **STEP 2: Set Up Time Triggers**

1. In Apps Script, click **⏰ Triggers** (left sidebar, clock icon)
2. Click **+ Add Trigger** (bottom right)

#### **For Daily Report (11:55 PM):**
- Choose function: **`sendDailyReport`**
- Event source: **Time-driven**
- Type: **Day timer**
- Time: **11pm to midnight**
- Click **Save**

#### **For Weekly Report (Sunday 8 PM):**
- Click **+ Add Trigger** again
- Choose function: **`sendWeeklyReport`**
- Event source: **Time-driven**
- Type: **Week timer**
- Day: **Sunday**
- Time: **8pm to 9pm**
- Click **Save**

---

### **STEP 3: Deploy Webhook**

1. Click **Deploy → Manage deployments**
2. If you have existing deployment:
   - Click **✏️ Edit**
   - Change **Version** to "New version"
   - Click **Deploy**
3. If new deployment:
   - Click **Deploy → New deployment**
   - Click **⚙️ → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
4. **COPY THE WEBHOOK URL**

---

### **STEP 4: Update webhook_config.py**

```python
WEBHOOK_URL = "YOUR_NEW_WEBHOOK_URL_HERE"
SHEET_NAME = "Tasks"  # For task management
```

---

### **STEP 5: Test Everything**

In Apps Script, click **Run** for these functions:

1. **`testDailyReport`** - Test daily email format
2. **`testWeeklyReport`** - Test weekly email format
3. **`testTaskCommit`** - Test task creation

---

## 📊 **Sheet Structure:**

### **Sheet1 (Daily):**
| Date | Title | Description | Hours | SHA |
|------|-------|-------------|-------|-----|

### **Sheet2 (Weekly):**
Same structure - receives data from Sheet1

### **Sheet3 (Logs):**
Same structure - permanent archive

### **Tasks (New):**
| Task Name | Description | Date | Time (hrs) | Branch | Status | Commit SHA |
|-----------|-------------|------|------------|--------|--------|------------|

---

## ⚙️ **Configuration Options:**

Edit these at the top of the script:

```javascript
const PROJECT_NAME = 'My Property Journey';  // Your project name
const MIN_HOURS_FOR_DAILY_REPORT = 6;        // Minimum hours to send
const RECIPIENT_EMAIL = 'sarin@ateamsoftsolutions.com';
const CC_DAILY = 'rakesh@..., sanoj@..., director@...';
const CC_WEEKLY = 'rakesh@..., sanoj@...';
```

---

## 🎨 **Email Format:**

Matches your screenshot exactly:

```
Project Name: My Property Journey          Date: 27-01-2026

Task        | Description              | Status      | Git Branch
------------------------------------------------------------------
Task 1      | • Git commit message 1   | Completed   | client-feedbacks-2
            | • Git commit message 3   |             |
------------------------------------------------------------------
Task 2      | • Git commit message 2   | In Progress | client-feedbacks-1
            | • Git commit message 5   |             |
```

---

## ✅ **What Happens:**

### **Every Day at 11:55 PM:**
1. Checks Sheet1 for commits
2. Calculates total hours
3. If hours >= 6: Sends email
4. Moves all data to Sheet2 + Sheet3
5. Clears Sheet1

### **Every Sunday at 8 PM:**
1. Checks Sheet2 for weekly data
2. Groups by task
3. Sends email with date range
4. Clears Sheet2
5. Data stays in Sheet3 (archive)

---

## 🐛 **Troubleshooting:**

**"No email sent"**
- Check if total hours >= 6
- Check execution log in Apps Script

**"Trigger not working"**
- Verify triggers are set up correctly
- Check your timezone in Apps Script settings

**"Wrong email format"**
- Make sure you updated to the new code
- Run `testDailyReport()` to preview

---

## 🚀 **Next Steps:**

1. ✅ Update Apps Script code
2. ✅ Set up both triggers
3. ✅ Test with `testDailyReport()`
4. ✅ Wait for 11:55 PM for first auto-send!

---

**Questions? Issues? Let me know!** 🎯
