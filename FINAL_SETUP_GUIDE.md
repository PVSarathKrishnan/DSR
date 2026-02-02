# ✅ FINAL SETUP GUIDE - Daily & Weekly Reports

## 📋 **FINAL SHEET STRUCTURE:**

### **Sheet1 (Daily Commits):**
```
| A: Date | B: Task | C: Description | D: Hours | E: Status | F: Git Branch |
```

**Example:**
| Date | Task | Description | Hours | Status | Git Branch |
|------|------|-------------|-------|--------|------------|
| 02/02/2026 | Task 1 | Fixed login bug | 2.5 | Completed | main |
| 02/02/2026 | Task 1 | Added tests | 1.5 | Completed | main |
| 02/02/2026 | Task 2 | API integration | 3.0 | In Progress | feature/api |

---

### **Sheet2 (Weekly Accumulation):**
```
| A: Date | B: Task | C: Description | D: Hours | E: Status | F: Git Branch |
```

**Example:**
| Date | Task | Description | Hours | Status | Git Branch |
|------|------|-------------|-------|--------|------------|
| 01/02/2026 | Task 1 | Fixed bug | 2.5 | Completed | main |
| 02/02/2026 | Task 2 | New feature | 3.0 | In Progress | feature/x |

---

### **Sheet3 (Logs - Archive):**
Same structure as Sheet2

---

## 🔧 **STEP 1: Update Your Sheets**

1. **Open your Google Sheet**
2. **Sheet1:** Ensure headers are EXACTLY:
   ```
   Date | Task | Description | Hours | Status | Git Branch
   ```

3. **Sheet2:** Ensure headers are EXACTLY:
   ```
   Date | Task | Description | Hours | Status | Git Branch
   ```

4. **Sheet3:** Same as Sheet2

---

## 💻 **STEP 2: Update Apps Script**

1. Go to **Extensions → Apps Script**
2. Click **Code.gs**
3. **DELETE ALL** existing code
4. **COPY ALL** from: `/Users/uiuxateam/DSR/apps_script_final.js`
5. **PASTE** into Code.gs
6. **SAVE** 💾

---

## ⏰ **STEP 3: Set Up Triggers**

1. Click **⏰ Triggers** (left sidebar)
2. **Delete all old triggers**
3. Click **+ Add Trigger**

### **Trigger 1 - Daily Report (11:55 PM):**
- Function: `sendDailyReport`
- Event: Time-driven → Day timer
- Time: **11pm to midnight**
- Save

### **Trigger 2 - Weekly Report (Sunday 8 PM):**
- Function: `sendWeeklyReport`
- Event: Time-driven → Week timer
- Day: **Sunday**
- Time: **8pm to 9pm**
- Save

---

## 🧪 **STEP 4: Test with Sample Data**

1. **Add test data** to Sheet1:
   ```
   02/02/2026 | Task 1 | Fixed auth bug | 2.5 | Completed | main
   02/02/2026 | Task 1 | Added tests | 1.5 | Completed | main
   02/02/2026 | Task 2 | New API | 3.0 | In Progress | feature/api
   ```

2. In Apps Script, select: **`testDailyReport`**
3. Click **▶️ Run**
4. **Grant permissions** (first time only)
5. **Check your email!** 📧

---

## 🚀 **STEP 5: Deploy Webhook**

1. Click **Deploy → Manage deployments**
2. Click **✏️ Edit** (or **New deployment**)
3. **Version:** New version
4. **Execute as:** Me
5. **Who has access:** Anyone
6. **Deploy**
7. **COPY THE WEBHOOK URL** 📋

---

## 📝 **STEP 6: Update Your Git Hook**

Update `/Users/uiuxateam/DSR/webhook_config.py`:
```python
WEBHOOK_URL = "YOUR_NEW_WEBHOOK_URL_HERE"
SHEET_NAME = "Tasks"  # Optional, for future task management
```

---

## ✅ **HOW IT WORKS:**

### **Daily Report (11:55 PM):**
1. ✅ Reads Sheet1 data
2. ✅ Calculates total hours
3. ✅ **Only sends if total hours >= 6**
4. ✅ Groups commits by Task
5. ✅ Sends formatted email
6. ✅ Moves all data to Sheet2 + Sheet3
7. ✅ Clears Sheet1 for next day

### **Weekly Report (Sunday 8 PM):**
1. ✅ Reads Sheet2 (accumulated week data)
2. ✅ Groups by task + shows date range
3. ✅ Shows total hours per task
4. ✅ Sends formatted email
5. ✅ Clears Sheet2
6. ✅ Data stays in Sheet3 (permanent archive)

---

## 📧 **EMAIL FORMAT:**

### **Daily Report Example:**
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

[Your Company Signature with Logo and Social Links]
```

### **Weekly Report Example:**
Same format + **Dates** column + **Hours per Task** column

---

## 🎨 **STATUS COLORS IN EMAIL:**

- **Completed** → 🟢 Light Green (#90EE90)
- **In Progress** → 🟡 Light Yellow (#FFE4B5)
- **Road Block** → 🔴 Light Pink (#FFB6C1)

---

## ⚙️ **CONFIGURATION OPTIONS:**

Edit these at the top of `apps_script_final.js`:

```javascript
const PROJECT_NAME = 'My Property Journey';
const MIN_HOURS_FOR_DAILY_REPORT = 6;  // Minimum hours to send report

// Email recipients
const RECIPIENT_EMAIL = 'sarin@ateamsoftsolutions.com';
const CC_DAILY = 'rakesh@..., sanoj@..., director@...';
const CC_WEEKLY = 'rakesh@..., sanoj@...';
```

---

## 🐛 **TROUBLESHOOTING:**

**No email sent?**
- Check if total hours >= 6
- Check Apps Script execution log (View → Executions)
- Verify sheet has data

**Wrong data format?**
- Ensure Sheet1 has 6 columns in correct order
- Check that Date column is formatted as Date
- Verify Hours column contains numbers

**Trigger not firing?**
- Check trigger setup in Apps Script
- Verify timezone in Apps Script settings
- Check execution history

**Email looks wrong?**
- Verify all sheet headers match exactly
- Test with `testDailyReport()` function
- Check console.log output

---

## 📊 **DATA FLOW:**

```
Git Commit → Webhook → Sheet1 (Daily)
                          ↓ (adds current date)
                    Daily Report (11:55 PM)
                          ↓
                 Sheet2 (Weekly) + Sheet3 (Logs)
                          ↓
                   Weekly Report (Sunday 8 PM)
                          ↓
                     Clear Sheet2
                     (Logs preserved in Sheet3)
```

---

## 🎯 **QUICK CHECKLIST:**

- [ ] Sheet1 headers: `Date | Task | Description | Hours | Status | Git Branch`
- [ ] Sheet2 headers: `Date | Task | Description | Hours | Status | Git Branch`
- [ ] Sheet3 headers: `Date | Task | Description | Hours | Status | Git Branch`
- [ ] Apps Script code pasted and saved
- [ ] Daily trigger set (11pm-midnight)
- [ ] Weekly trigger set (Sunday 8pm-9pm)
- [ ] Tested with `testDailyReport()`
- [ ] Webhook deployed and URL copied
- [ ] `webhook_config.py` updated

---

## ✨ **YOU'RE ALL SET!**

**What happens next:**
1. ✅ Every time you commit via Git hook → Data goes to Sheet1
2. ✅ Daily at 11:55 PM → Email sent if hours >= 6
3. ✅ Data moves to Sheet2 + Sheet3
4. ✅ Sheet1 clears for tomorrow
5. ✅ Sunday 8 PM → Weekly summary sent
6. ✅ Sheet2 clears, Sheet3 keeps history

---

## 📧 **Your Professional Signature:**

Every email includes:
- ✅ Your name and title
- ✅ Company logo
- ✅ Contact information
- ✅ Social media links (Facebook, LinkedIn, Twitter, Instagram)
- ✅ Location: Technopark Trivandrum, India

---

**Questions? Issues? Let me know!** 🚀

**Ready to go live!** Just paste the code and set those triggers! 🎯
