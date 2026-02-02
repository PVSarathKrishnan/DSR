# 🎯 TASK MANAGEMENT SYSTEM - IMPLEMENTATION PLAN

## ✅ PHASE 1: APPS SCRIPT (COMPLETED)

### **New File Created:**
`/Users/uiuxateam/DSR/apps_script_with_tasks.js`

### **Key Features Implemented:**

#### **1. Tasks Sheet Auto-Creation**
- Creates "Tasks" sheet automatically if doesn't exist
- Format: `Task Name | Last Used Time Stamp`
- Orange header for visibility

#### **2. Task CRUD APIs**

**Get Tasks:**
```
GET ?action=getTasks
Returns: { success: true, tasks: [{name, lastUsed}, ...] }
Sorted by most recent first
```

**Create Task:**
```
POST { action: "createTask", taskName: "..." }
Returns: { success: true/false, message/error }
Prevents duplicates
```

**Update Task:**
```
POST { action: "updateTask", oldName: "...", newName: "..." }
```

**Delete Task:**
```
POST { action: "deleteTask", taskName: "..." }
```

#### **3. Smart Commit Merging**

**Logic:**
1. Check if task already logged TODAY in Sheet1
2. **IF YES:**
   - Append description with `\n` (line break)
   - Add hours to existing total
   - Update status to LATEST
   - Keep original branch
3. **IF NO:**
   - Create new row

**Example:**
```
Commit 1: Task A, "Fixed bug", 2 hrs
→ New row created

Commit 2: Task A, "Added tests", 1.5 hrs  
→ Updates existing row:
   Description: "Fixed bug\nAdded tests"
   Hours: 3.5
   Status: Latest
```

#### **4. Auto Task Timestamp Update**
- Every commit updates task's "Last Used Time Stamp"
- Auto-creates task if doesn't exist
- Keeps Tasks sheet as task database

#### **5. Email Report Updates**
- Descriptions now format with line breaks
- Shows multi-line commit messages properly
- Each line prefixed with `-` for clarity

---

## 🎨 PHASE 2: PYTHON DIALOG (TODO)

### **Required Changes:**

#### **1. Replace Task Input with Dropdown**
```python
# OLD
task_entry = ttk.Entry(main_frame, textvariable=task_var, width=50)

# NEW
task_combo = ttk.Combobox(main_frame, textvariable=task_var, width=40, values=task_list)
```

#### **2. Add CRUD Buttons**
```python
task_frame = ttk.Frame(main_frame)
task_combo.pack(side=tk.LEFT)
add_btn = ttk.Button(task_frame, text="+ New", command=create_task, width=8)
edit_btn = ttk.Button(task_frame, text="✏️ Edit", command=edit_task, width=8)
delete_btn = ttk.Button(task_frame, text="🗑️ Del", command=delete_task, width=8)
```

#### **3. Fetch Tasks on Dialog Open**
```python
def fetch_tasks():
    try:
        url = f"{WEBHOOK_URL}?action=getTasks"
        response = urllib.request.urlopen(url, timeout=10)
        data = json.loads(response.read())
        if data['success']:
            return [task['name'] for task in data['tasks']]
        return []
    except:
        return []
```

#### **4. Empty State Handling**
```python
task_list = fetch_tasks()
if not task_list:
    # Show placeholder
    task_var.set("Create a task here")
    # Disable edit/delete buttons
    edit_btn.config(state='disabled')
    delete_btn.config(state='disabled')
```

#### **5. Add Status Radio Buttons**
```python
status_var = tk.StringVar(value="In Progress")
status_frame = ttk.Frame(main_frame)
ttk.Radiobutton(status_frame, text="In Progress", variable=status_var, value="In Progress").pack(side=tk.LEFT)
ttk.Radiobutton(status_frame, text="Completed", variable=status_var, value="Completed").pack(side=tk.LEFT)
ttk.Radiobutton(status_frame, text="Blocked", variable=status_var, value="Blocked").pack(side=tk.LEFT)
```

#### **6. Make Commit Message Editable**
- Already text area, just pre-fill with commit message
- User can edit before submitting

#### **7. Auto-Detect Branch** (Already implemented in pre-commit hook)
```python
result = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], ...)
branch = result.stdout.strip()
```

---

## 📋 UPDATED DIALOG DESIGN

```
┌──────────────────────────────────────────────────┐
│  📝 DSR Commit Logger                            │
├──────────────────────────────────────────────────┤
│                                                  │
│  Task: *                                         │
│  [Task A              ▼] [+ New] [✏️] [🗑️]      │
│                                                  │
│  Commit Message: * (editable)                    │
│  ┌──────────────────────────────────────────┐   │
│  │ Fixed authentication bug                  │   │
│  │                                           │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Time Taken (hours): *                           │
│  [2.5    ▼]                                      │
│                                                  │
│  Status:                                         │
│  ● In Progress  ○ Completed  ○ Blocked          │
│                                                  │
│  Branch: main (auto-detected)                    │
│                                                  │
│  [Skip Logging] [Cancel] [Log to Sheets]        │
└──────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW

```
1. Dialog Opens
   └─> Fetch tasks from Tasks sheet
   └─> Pre-select last used task
   └─> Pre-fill commit message
   └─> Auto-detect branch

2. User Interaction
   ├─> Select task from dropdown
   ├─> OR create new task [+ New]
   ├─> OR edit task [✏️]
   ├─> OR delete task [🗑️]
   ├─> Edit commit message
   ├─> Set hours
   └─> Select status

3. Log to Sheets
   └─> POST webhook with:
       {
         taskName: "...",
         commitMessage: "...",
         time: 2.5,
         status: "In Progress",
         branch: "main"
       }

4. Apps Script Processing
   ├─> Update task timestamp
   ├─> Check if task exists for TODAY
   │   ├─> YES: Append description, add hours, update status
   │   └─> NO: Create new row
   └─> Return success
```

---

## 📊 SHEET STRUCTURE (Final)

### **Tasks Sheet:**
```
Task Name           | Last Used Time Stamp
----------------------|---------------------
Task A              | 02/02/2026 10:15 AM
Task B              | 01/02/2026 03:30 PM
```

### **Sheet1 (Daily):**
```
Date       | Task   | Description             | Hours | Status      | Branch
02/02/2026 | Task A | Fixed bug\nAdded tests  | 3.5   | Completed   | main
02/02/2026 | Task B | API work                | 2.0   | In Progress | feature/api
```

---

## ✅ DECISIONS IMPLEMENTED

1. ✅ **Line breaks** (`\n`) for multiple commits
2. ✅ **Keep latest status** on updates
3. ✅ **Auto-detect branch** (no manual change)
4. ✅ **Auto-create task** if list empty, placeholder shown
5. ✅ **No commit count** column

---

## 🚀 NEXT STEPS

1. **Test Apps Script:**
   - Deploy new version
   - Test getTasks API
   - Test createTask API
   - Test smart merging (2 commits same task)

2. **Update Python Dialog:**
   - Add task dropdown
   - Add CRUD buttons
   - Add status radio buttons
   - Add API calls for task management
   - Test empty state

3. **Integration Testing:**
   - Make 2 commits on same task
   - Verify description appending
   - Verify hours accumulation
   - Verify latest status kept
   - Check email report format

---

## 📝 TESTING CHECKLIST

- [ ] Apps Script deployed
- [ ] Tasks sheet auto-created
- [ ] getTasks returns empty array
- [ ] Create first task works
- [ ] getTasks returns task list
- [ ] Task dropdown populated
- [ ] Edit task works
- [ ] Delete task works
- [ ] First commit creates row
- [ ] Second commit (same task/day) appends
- [ ] Description shows with line breaks
- [ ] Hours accumulated correctly
- [ ] Latest status used
- [ ] Email report looks good
- [ ] Weekly report handles multi-line

---

**Ready for deployment and Python dialog update!** 🎉
