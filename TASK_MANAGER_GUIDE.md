# 🚀 DSR Task Manager - v3.0 Implementation

## 🎯 **What Changed**

**Version 2.0** → Simple commit logging to Google Sheets  
**Version 3.0** → **Full Task Management System**

---

## 📊 **New System Overview**

### **Google Sheet Structure (Tasks Sheet):**

| Task Name | Description | Date | Time (hrs) | Branch | Status | Commit SHA |
|-----------|-------------|------|------------|--------|--------|------------|
| Fix auth bug | • Added JWT validation<br>• Fixed token expiry<br>• Added unit tests | 30/01/2026 | 3.5 | feature/auth | Completed | def456 |
| User profile | • Created UI<br>• Added API integration | 30/01/2026 | 5.0 | feature/profile | In Progress | abc123 |

### **How It Works:**

1. **User makes a commit**
2. **Dialog appears** showing:
   - Dropdown of existing tasks (fetched from Google Sheets)
   - Commit message field
   - Time spent input
   - Auto-detected git branch
   - Status radio buttons (In Progress / Completed)

3. **If existing task selected:**
   - Appends commit message to description (new bullet point)
   - Adds time to total
   - Updates status
   - Updates last modified date

4. **If new task entered:**
   - Creates new row in Google Sheets
   - First description line

---

## 🔧 **Components**

### **1. Apps Script (`apps_script_task_manager.js`)**

**Endpoints:**
- `GET ?action=getTasks` - Fetch all existing tasks
- `POST` - Create new task or update existing

**Functions:**
- `getTasks()` - Returns array of all tasks
- `updateOrCreateTask()` - Smart create/update logic
  - Searches for task by name (case-insensitive)
  - If found: appends description, adds time
  - If not found: creates new row

### **2. PyQt5 Dialog (`task_dialog_pyqt5.py`)**

**Features:**
- ✨ Beautiful native UI
- 📋 Task dropdown with existing tasks
- 📝 Commit message input
- ⏱️ Time spent spinner
- 🌿 Branch display (auto-detected)
- ✅ Status radio buttons
- 🔘 Buttons: Skip Logging, Cancel, Save & Commit

**Smart Features:**
- Shows task info when selecting existing task
- Pre-sets status based on current task status
- Validates inputs before submission

### 3. Updated Hook (`pre-commit-webhook`)

**New Logic:**
1. Auto-detect git branch
2. Try PyQt5 dialog first (if installed)
3. Fallback to AppleScript/Terminal
4. Send data to Apps Script webhook
5. Handle response (created vs updated)

---

## 📦 **Installation**

### **Step 1: Deploy New Apps Script**

1. Open your Google Sheet
2. Extensions → Apps Script
3. **Create/Replace** with code from `apps_script_task_manager.js`
4. Change `TASKS_SHEET_NAME` if needed (default: "Tasks")
5. Deploy → New deployment → Web app
   - Execute as: **Me**
   - Access: **Anyone**
6. **Copy the webhook URL**

### **Step 2: Install PyQt5** (Optional but Recommended)

```bash
# macOS/Linux
pip3 install PyQt5

# Windows
pip install PyQt5

# Or use requirements.txt
pip3 install -r requirements.txt
```

### **Step 3: Install in Project**

```bash
# Copy new files
cp task_dialog_pyqt5.py /path/to/your/project/
cp pre-commit-webhook /path/to/your/project/.git/hooks/pre-commit
cp webhook_config.example.py /path/to/your/project/webhook_config.py

# Make executable (Unix)
chmod +x /path/to/your/project/.git/hooks/pre-commit
```

### **Step 4: Configure**

Edit `webhook_config.py`:

```python
# Your new Apps Script URL
WEBHOOK_URL = "https://script.google.com/macros/s/YOUR_NEW_ID/exec"

# Sheet name (must match Apps Script)
SHEET_NAME = "Tasks"
```

---

## 🎨 **Dialog Preview**

```
┌─────────────────────────────────────────────────┐
│        📝 DSR Task Manager                      │
├─────────────────────────────────────────────────┤
│ Task Name:                                      │
│ ┌────────────────────────────────────────────┐ │
│ │ Fix auth bug (3.5 hrs, In Progress)    ▼  │ │ ← Dropdown
│ └────────────────────────────────────────────┘ │
│ 📊 Current: 3.5 hrs total, 3 commits, In Progress│
│                                                 │
│ Commit Message (will be added to description): │
│ ┌────────────────────────────────────────────┐ │
│ │ Added password reset functionality         │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│ Time Spent (hours):                            │
│ ┌───────┐                                      │
│ │2.0 hrs│ (e.g., 0.5, 1, 2.5)                 │
│ └───────┘                                      │
│                                                 │
│ 🌿 Branch: feature/auth (auto-detected)        │
│                                                 │
│ Status:                                        │
│ ○ 🔄 In Progress    ○ ✅ Completed             │
│                                                 │
│ [Skip Logging]  [Cancel]       [💾 Save & Commit]│
└─────────────────────────────────────────────────┘
```

---

## 🔄 **Workflow Examples**

### **Example 1: New Task**

**Commit 1** (creating task)
- Select: "➕ Create New Task"
- Type task name: "User Authentication System"
- Commit message: "Initial auth scaffold"
- Time: 2.0 hrs
- Status: In Progress

**Sheet after:**
| Task Name | Description | Date | Time | Branch | Status |
|-----------|-------------|------|------|--------|--------|
| User Authentication System | • Initial auth scaffold | 30/01 | 2.0 | feature/auth | In Progress |

---

### **Example 2: Update Existing Task**

**Commit 2** (updating task)
- Select from dropdown: "User Authentication System (2.0 hrs, In Progress)"
- Commit message: "Added JWT token generation"
- Time: 1.5 hrs
- Status: In Progress

**Sheet after:**
| Task Name | Description | Date | Time | Branch | Status |
|-----------|-------------|------|------|--------|--------|
| User Authentication System | • Initial auth scaffold<br>• Added JWT token generation | 30/01 | **3.5** | feature/auth | In Progress |

---

### **Example 3: Complete Task**

**Commit 3** (finishing task)
- Select: "User Authentication System (3.5 hrs, In Progress)"
- Commit message: "Added unit tests, ready for review"
- Time: 1.0 hrs
- Status: **✅ Completed**

**Sheet after:**
| Task Name | Description | Date | Time | Branch | Status |
|-----------|-------------|------|------|--------|--------|
| User Authentication System | • Initial auth scaffold<br>• Added JWT token generation<br>• Added unit tests, ready for review | 30/01 | **4.5** | feature/auth | **Completed** |

---

## 🎯 **Key Features**

✅ **Task-based tracking** (not just commit-based)  
✅ **Accumulating descriptions** (one task, multiple commits)  
✅ **Time accumulation** (track total time per task)  
✅ **Status management** (In Progress / Completed)  
✅ **Branch tracking** (auto-detected from git)  
✅ **Beautiful PyQt5 UI** (single dialog with all fields)  
✅ **Smart task matching** (case-insensitive, finds existing tasks)  
✅ **Fallback support** (works without PyQt5)  

---

##  **Fallback Behavior**

If PyQt5 is not installed:
1. Falls back to AppleScript (macOS) - 3 dialogs
2. Falls back to terminal mode (all platforms)
3. Still fully functional!

---

## 📚 **Migration from v2.0**

**Option 1: Fresh Start**
- Deploy new Apps Script
- Use new "Tasks" sheet
- Old commits stay in "Daily" sheet

**Option 2: Keep Both**
- Deploy new Apps Script alongside old one
- Use for new projects
- Keep old system for existing projects

---

## 🎨 **Customization**

### **Change Task Statuses:**

Edit `task_dialog_pyqt5.py`:

```python
# Add more status options
self.status_blocked = QRadioButton('🚫 Blocked')
self.status_review = QRadioButton('👀 In Review')
```

### **Change Sheet Name:**

Edit `apps_script_task_manager.js`:

```javascript
const TASKS_SHEET_NAME = "MyTasks"; // Change this
```

---

## 🐛 **Troubleshooting**

**"Tasks not loading in dropdown"**
- Check webhook URL is correct
- Test: `curl "YOUR_WEBHOOK_URL?action=getTasks"`
- Verify Apps Script is deployed

**"PyQt5 not found"**
- Install: `pip3 install PyQt5`
- Or use fallback (AppleScript/terminal)

**"Task not updating"**
- Check task name spelling (case-insensitive matching)
- Check Apps Script logs (View → Executions)

---

## ✨ **Next Steps**

1. ✅ Deploy new Apps Script
2. ✅ Install PyQt5
3. ✅ Update hook in your project
4. ✅ Test with empty commit
5. ✅ Start tracking tasks!

---

**Welcome to DSR Task Manager v3.0!** 🚀👑
