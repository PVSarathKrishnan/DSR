# ✅ COMPLETE SETUP INSTRUCTIONS

## 📋 **YOUR SHEET STRUCTURE:**

### **Sheet1 (Daily Commits):**
```
| A: Task | B: Description | C: Status | D: Git Branch | E: Hours |
```

**Example:**
| Task | Description | Status | Git Branch | Hours |
|------|-------------|--------|------------|-------|
| Task 1 | Fixed login bug | Completed | main | 2.5 |
| Task 1 | Added validation | Completed | main | 1.5 |
| Task 2 | API integration | In Progress | feature/api | 3.0 |

---

### **Sheet2 (Weekly Accumulation):**
```
| A: Date | B: Task | C: Description | D: Status | E: Git Branch | F: Hours |
```

**Example:**
| Date | Task | Description | Status | Git Branch | Hours |
|------|------|-------------|--------|------------|-------|
| 01/02/2026 | Task 1 | Fixed bug | Completed | main | 2.5 |
| 02/02/2026 | Task 2 | New feature | In Progress | feature/x | 3.0 |

---

### **Sheet3 (Logs - Archive):**
Same structure as Sheet2

---

## 🔧 **STEP 1: Update Your Sheets**

1. **Open your Google Sheet**
2. **Sheet1:** Change headers to exactly:
   ```
   Task | Description | Status | Git Branch | Hours
   ```

3. **Sheet2:** Change headers to exactly:
   ```
   Date | Task | Description | Status | Git Branch | Hours
   ```

4. **Sheet3:** Same as Sheet2

---

## 💻 **STEP 2: Update Apps Script**

1. Go to **Extensions → Apps Script**
2. Click **Code.gs**
3. **DELETE ALL** existing code
4. **COPY from:** `/Users/uiuxateam/DSR/apps_script_final.js`
5. **PASTE** into Code.gs
6. **SAVE** 💾

---

## ⏰ **STEP 3: Set Triggers**

1. Click **⏰ Triggers** (left sidebar)
2. **Delete all old triggers**
3. Click **+ Add Trigger**

### **Trigger 1 - Daily Report:**
- Function: `sendDailyReport`
- Event: Time-driven → Day timer
- Time: **11pm to midnight**
- Save

### **Trigger 2 - Weekly Report:**
- Function: `sendWeeklyReport`
- Event: Time-driven → Week timer
- Day: **Sunday**
- Time: **8pm to 9pm**
- Save

---

## 🧪 **STEP 4: Test**

1. **Add test data** to Sheet1:
   ```
   Task 1 | Fixed auth bug | Completed | main | 2.5
   Task 1 | Added tests | Completed | main | 1.5
   Task 2 | New API | In Progress | feature/api | 3.0
   ```

2. In Apps Script, select: **`testDailyReport`**
3. Click **▶️ Run**
4. **Grant permissions** (first time)
5. **Check your email!** 📧

---

## 🚀 **STEP 5: Deploy Webhook**

1. Click **Deploy → Manage deployments**
2. Click **✏️ Edit** or **New deployment**
3. **Version:** New version
4. **Deploy**
5. **COPY THE WEBHOOK URL** 📋

---

## 📝 **STEP 6: Update Python Config**

Update `/Users/uiuxateam/DSR/webhook_config.py`:
```python
WEBHOOK_URL = "YOUR_NEW_WEBHOOK_URL_HERE"
SHEET_NAME = "Tasks"  # Optional, for task management
```

---

## ✅ **HOW IT WORKS:**

### **Daily (11:55 PM):**
1. ✅ Reads Sheet1
2. ✅ Calculates total hours
3. ✅ **Only sends if hours >= 6**
4. ✅ Groups commits by Task
5. ✅ Sends email
6. ✅ Moves data to Sheet2 + Sheet3
7. ✅ Clears Sheet1

### **Weekly (Sunday 8 PM):**
1. ✅ Reads Sheet2
2. ✅ Groups by task + shows dates
3. ✅ Shows total hours
4. ✅ Sends email
5. ✅ Clears Sheet2
6. ✅ Data stays in Sheet3 (archive)

---

## 📧 **EMAIL FORMAT:**

### **Daily Report:**
```
Project Name: My Property Journey          Date: 02/02/2026

Task        | Description         | Status      | Git Branch
---------------------------------------------------------------
Task 1      | Fixed auth bug      | Completed   | main
            | Added tests         |             |
---------------------------------------------------------------
Task 2      | New API             | In Progress | feature/api
---------------------------------------------------------------
                          Total Hours Worked: 7.0 hrs
```

### **Weekly Report:**
Same format + **Dates** column + **Hours** column

---

## 🎨 **STATUS COLORS:**

- **Completed** → 🟢 Light Green
- **In Progress** → 🟡 Light Yellow
- **Road Block** → 🔴 Light Pink

---

## ⚙️ **CONFIGURATION:**

Edit at top of `apps_script_final.js`:

```javascript
const PROJECT_NAME = 'My Property Journey';
const MIN_HOURS_FOR_DAILY_REPORT = 6;  // Minimum hours to send

const RECIPIENT_EMAIL = 'sarin@ateamsoftsolutions.com';
const CC_DAILY = 'rakesh@..., sanoj@..., director@...';
const CC_WEEKLY = 'rakesh@..., sanoj@...';
```

---

## 🐛 **TROUBLESHOOTING:**

**No email sent?**
- Check total hours >= 6
- Check Apps Script execution log

**Wrong format?**
- Verify sheet headers EXACTLY match above
- Ensure 5 columns in Sheet1
- Ensure 6 columns in Sheet2/Sheet3

**Trigger not working?**
- Check trigger setup
- Check timezone in Apps Script settings

---

## 📊 **DATA FLOW:**

```
Git Commit → Webhook → Sheet1 (Daily)
                          ↓
                    Daily Report (11:55 PM)
                          ↓
                 Sheet2 (Weekly) + Sheet3 (Logs)
                          ↓
                   Weekly Report (Sunday 8 PM)
                          ↓
                     Clear Sheet2
```

---

## ✨ **YOU'RE ALL SET!**

**Next Steps:**
1. ✅ Update sheet headers
2. ✅ Paste new code
3. ✅ Set up triggers
4. ✅ Test with sample data
5. ✅ Deploy webhook
6. ✅ Wait for 11:55 PM! 🕐

---

**Questions? Issues? Let me know!** 🚀
