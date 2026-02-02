# 🚀 Complete Update Guide - DSR Task Manager v3.0

## 📋 **What You Need to Update:**

### **1. Google Sheets Setup**
### **2. Update Your Property Project**

---

## 📊 **PART 1: Google Sheets Setup**

### **Step 1: Open Your Google Sheet**

1. Open the Google Sheet you want to use for task tracking
2. Go to **Extensions → Apps Script**

### **Step 2: Deploy New Apps Script**

1. **Delete old code** (if any) or create new file
2. **Paste this code:**

```javascript
// Copy the entire content from: /Users/uiuxateam/DSR/apps_script_task_manager.js
```

3. **Change sheet name if needed** (line 5):
```javascript
const TASKS_SHEET_NAME = "Tasks"; // Change this to your sheet name
```

4. Click **Save** (💾)

### **Step 3: Deploy as Web App**

1. Click **Deploy → New deployment**
2. Click **⚙️ → Web app**
3. Settings:
   - **Description**: Task Manager v3
   - **Execute as**: Me
   - **Who has access**: **Anyone**
   
4. Click **Deploy**
5. **COPY THE WEB APP URL** (you'll need this!)
6. Click **Done**

### **Step 4: Create/Verify Sheet Structure**

Your sheet should have these columns (A-G):

| A: Task Name | B: Description | C: Date | D: Time (hrs) | E: Branch | F: Status | G: Commit SHA |
|--------------|----------------|---------|---------------|-----------|-----------|---------------|

The script will auto-create this if it doesn't exist!

---

## 🏠 **PART 2: Update Your Property Project**

### **Step 1: Copy New Files**

```bash
# Navigate to your property project
cd /path/to/your/property/project

# Copy the new task dialog
cp /Users/uiuxateam/DSR/task_dialog_pyqt5.py ./

# Copy Apps Script (for reference)
cp /Users/uiuxateam/DSR/apps_script_task_manager.js ./
```

### **Step 2: Update webhook_config.py**

Edit `webhook_config.py` in your property project:

```python
# YOUR NEW WEBHOOK URL (from Step 3 above)
WEBHOOK_URL = "https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec"

# Sheet name (must match Apps Script)
SHEET_NAME = "Tasks"

# Default time
DEFAULT_TIME = 1.0

# Date format
DATE_FORMAT = "%d/%m/%Y"
```

### **Step 3: Install PyQt5** (if not already installed)

```bash
pip3 install PyQt5
```

Or if you get permission errors:

```bash
pip3 install --user PyQt5
```

### **Step 4: Test the Dialog**

```bash
cd /path/to/your/property/project
python3 task_dialog_pyqt5.py
```

You should see a **dark-themed dialog** pop up!

---

## 🔧 **PART 3: Integrate with Git Hook** (Coming Next)

I need to update the `pre-commit-webhook` file to:
1. Auto-detect current branch
2. Use the new PyQt5 dialog
3. Send data in new format (task-based)
4. Handle task creation/updates

**Would you like me to:**
1. ✅ Update the pre-commit hook now?
2. ✅ Create an install script for your property project?
3. ✅ Test everything end-to-end?

---

## 🎨 **Dark Theme Features:**

✅ Dark background (#1e1e1e)  
✅ All text in white/light colors  
✅ Visible placeholders (#888888)  
✅ Dropdown menus styled dark  
✅ Message boxes styled dark  
✅ Selection highlighting  
✅ Batman-approved! 🦇  

---

## ✅ **Quick Checklist:**

- [ ] Deployed new Apps Script
- [ ] Copied webhook URL
- [ ] Created "Tasks" sheet (or auto-created)
- [ ] Copied `task_dialog_pyqt5.py` to property project
- [ ] Updated `webhook_config.py` with new URL
- [ ] Installed PyQt5
- [ ] Tested dialog (dark theme working!)

---

## 🆘 **Troubleshooting:**

**"PyQt5 not found"**
```bash
pip3 install --user PyQt5
# or
python3 -m pip install PyQt5
```

**"Webhook URL not configured"**
- Check `webhook_config.py` has the correct URL
- Make sure it starts with `https://script.google.com/macros/s/`

**"Sheet not found"**
- Verify `TASKS_SHEET_NAME` in Apps Script matches your sheet name
- Or let the script auto-create it

**"Dialog is still light colored"**
- Make sure you're using the NEW `task_dialog_pyqt5.py`
- Test with: `python3 task_dialog_pyqt5.py`

---

## 🎯 **Next Steps:**

1. **Test the dialog** - Verify dark theme works
2. **Tell me when ready** - I'll integrate the Git hook
3. **Make first commit** - Experience the new task manager!

---

**Ready to integrate? Just say GO! 🚀**
