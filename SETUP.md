# 🚀 DSR Commit Logger - Complete Setup Guide

**Track your Git commits automatically in Google Sheets**  
✅ Works on **Windows, macOS, and Linux**  
✅ Works with **any Git repository** (GitHub, GitLab, Bitbucket, local)

---

## 📋 **Prerequisites**

- **Python 3.8+** installed on your system
- **Git** repository
- **Google Account** (for Google Sheets)

---

## 🎯 **One-Time Setup (Do This Once)**

### **Step 1: Set Up Google Apps Script Webhook**

1. **Open your Google Sheet** where you want to track commits
2. Go to **Extensions → Apps Script**
3. Click **"+"** to create a new file, name it `webhook`
4. **Paste this code:**

```javascript
// Configuration - match this with your sheet name
const DAILY_SHEET_NAME = "Daily"; // Change this if your sheet name is different

/**
 * Web App Entry Point - handles POST requests from Git hook
 * Deploy this as a Web App with "Anyone" access
 */
function doPost(e) {
    try {
        // Parse the incoming JSON data
        const data = JSON.parse(e.postData.contents);

        // Validate required fields
        if (!data.date || !data.title) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: "Missing required fields: date and title"
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // Get the active spreadsheet
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = spreadsheet.getSheetByName(DAILY_SHEET_NAME);

        if (!sheet) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: `Sheet '${DAILY_SHEET_NAME}' not found`
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // Parse the date string (DD/MM/YYYY) to a Date object for Google Sheets
        let dateValue = data.date;
        if (typeof data.date === 'string' && data.date.includes('/')) {
            // Parse DD/MM/YYYY format
            const parts = data.date.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                const year = parseInt(parts[2], 10);
                dateValue = new Date(year, month, day);
            }
        }

        // Prepare row data  [Date, Title, Description, Hours, SHA]
        const row = [
            dateValue,  // Now a Date object
            data.title || "",
            data.description || "",
            data.hours || 1.0,
            data.sha || "pending"
        ];

        // Append the row
        sheet.appendRow(row);

        // Return success response
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: "Commit logged successfully",
            row: row
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Return error response
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}
```

5. Click **Save** (💾 icon)
6. Click **Deploy → New deployment**
7. Click **⚙️ Select type → Web app**
8. Configure:
   - **Description**: DSR Commit Logger
   - **Execute as**: Me
   - **Who has access**: Anyone
9. Click **Deploy**
10. **Copy the Web App URL** (you'll need this!)
11. Click **Done**

---

### **Step 2: Prepare Your Google Sheet**

Create a sheet with these columns (or use existing):

| Date | Task Title | Description | Time (hrs) | Commit SHA |
|------|-----------|-------------|------------|------------|
|      |           |             |            |            |

**Note:** The sheet name should match `DAILY_SHEET_NAME` in the script (default: "Daily")

---

## 📦 **Per-Project Setup (Do This for Each Git Project)**

### **Option 1: Automated Installation (Easiest)**

**All Platforms (Windows, macOS, Linux):**

```bash
# Install in current directory
python3 /path/to/DSR/install.py

# Install in specific project
python3 /path/to/DSR/install.py /path/to/your/project
```

The script will:
- ✅ Copy the hook to `.git/hooks/pre-commit`
- ✅ Make it executable (macOS/Linux)
- ✅ Copy `webhook_config.example.py` to your project
- ✅ Backup any existing hook
- ✅ Show you next steps

---

### **Option 2: Manual Installation**

### **Windows Instructions:**

```cmd
:: Navigate to your Git project
cd C:\path\to\your\project

:: Download the hook and config (one of these methods):

:: Method 1: If you have the DSR folder
copy C:\path\to\DSR\pre-commit-webhook .git\hooks\pre-commit
copy C:\path\to\DSR\webhook_config.example.py webhook_config.py

:: Method 2: Download directly (if sharing with team)
:: Save pre-commit-webhook to .git/hooks/pre-commit
:: Save webhook_config.example.py as webhook_config.py
```

### **macOS/Linux Instructions:**

```bash
# Navigate to your Git project
cd /path/to/your/project

# Copy the hook and config
cp /path/to/DSR/pre-commit-webhook .git/hooks/pre-commit
cp /path/to/DSR/webhook_config.example.py webhook_config.py

# Make hook executable
chmod +x .git/hooks/pre-commit
```

---

### **Step 3: Configure webhook_config.py**

Edit `webhook_config.py` in your project root:

```python
# REQUIRED: Your Apps Script webhook URL
WEBHOOK_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"

# Sheet name (must match Apps Script)
SHEET_NAME = "Daily"

# Default time tracking
DEFAULT_TIME = 1.0

# Date format (DD/MM/YYYY)
DATE_FORMAT = "%d/%m/%Y"
```

**⚠️ Important:** Replace `YOUR_DEPLOYMENT_ID` with the actual URL from Step 1!

---

### **Step 4: Test It!**

**Terminal (macOS/Linux):**
```bash
git commit -m "Test commit logger" --allow-empty
```

**Command Prompt (Windows):**
```cmd
git commit -m "Test commit logger" --allow-empty
```

**VS Code (All Platforms):**
1. Make a change
2. Stage it
3. Click "Commit"
4. Dialogs will appear!

---

## 🎨 **How It Works**

### **Terminal Mode (macOS/Linux/Windows):**
```
📝 Logging commit to Google Sheets...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commit Message: "Fixed login bug"

Task Title [Fixed login bug]: 
Task Description: Fixed authentication issue
Time Taken in hours [1.0]: 2

✅ Logged to Google Sheets successfully!
```

### **GUI Mode (VS Code, etc.):**

**macOS:** 3 Native AppleScript dialogs with:
- Dialog 1: Task Title + "Commit Without Logging" button
- Dialog 2: Description + "Commit Without Logging" button  
- Dialog 3: Time + "Commit Without Logging" button
- All Cancel buttons ask: "Commit without logging?"

**Windows/Linux:** Tkinter GUI window (if available)

---

## ⚙️ **Button Behaviors**

### **Commit Without Logging**
- Appears on all 3 dialogs
- Skips logging, proceeds with commit
- No API call made

### **Cancel**
- Shows confirmation: "Do you want to commit without logging?"
- **Yes** → Commit without logging
- **No** → Abort commit

### **Next / Log to Sheets**
- Continues to next dialog
- Submits data and commits

---

## 🔧 **Customization**

Edit `webhook_config.py`:

```python
# Change default time
DEFAULT_TIME = 0.5  # 30 minutes

# Change date format
DATE_FORMAT = "%Y-%m-%d"  # YYYY-MM-DD

# Change sheet name
SHEET_NAME = "My Commits"
```

---

## 🐛 **Troubleshooting**

### **"Hook not running"**
- **Windows:** Check if Python is in PATH: `python --version`
- **macOS/Linux:** Make hook executable: `chmod +x .git/hooks/pre-commit`

### **"Webhook URL not configured"**
- Edit `webhook_config.py`
- Set `WEBHOOK_URL` to your Apps Script URL

### **"Module not found"**
- Ensure `webhook_config.py` is in your project root
- Check capitalization (case-sensitive on Linux/macOS)

### **"Sheet not found"**
- Verify `SHEET_NAME` in `webhook_config.py` matches your Google Sheet tab name
- Check `DAILY_SHEET_NAME` in Apps Script matches too

### **"Date validation error" in Google Sheets**
- Make sure you updated the Apps Script with the date parsing code
- Redeploy the script (Deploy → Manage deployments → Edit → New version)

### **GUI dialog blank on macOS**
- This is expected from terminal
- Commit from VS Code instead for working GUI

---

## 📚 **What Gets Logged**

Each commit creates a row:

| Date | Task Title | Description | Time (hrs) | Commit SHA |
|------|-----------|-------------|------------|------------|
| 30/01/2026 | Fixed login bug | Auth issue resolved | 2.0 | pending |

---

## 🌍 **Multi-Project Setup**

**Using the same Google Sheet for multiple projects:**

1. ✅ Use the **same** `WEBHOOK_URL` in all projects
2. ✅ Copy the hook to each project's `.git/hooks/` folder
3. ✅ All commits go to the same Google Sheet
4. ✅ Track across all your projects in one place!

---

## 🔐 **Security Notes**

- ✅ `webhook_config.py` is gitignored (won't be committed)
- ✅ Webhook URL is public-safe (anyone can POST to it)
- ⚠️ Don't share your Google Sheet with public
- ⚠️ Each developer needs their own `webhook_config.py`

---

## 🚀 **Team Setup**

**To share with your team:**

1. Share this `SETUP.md` file
2. Each team member:
   - Gets the Apps Script webhook URL from admin
   - Copies `pre-commit-webhook` to their `.git/hooks/`
   - Creates their own `webhook_config.py` with the shared URL
   - Tests with an empty commit

---

## 📱 **Platform-Specific Notes**

### **Windows:**
- Python must be in PATH
- Use `python` or `python3` command
- Hook runs in Git Bash or CMD
- Tkinter GUI if Python has tkinter

### **macOS:**
- Native AppleScript dialogs (3 separate)
- Works from Terminal and VS Code
- Python 3 usually pre-installed

### **Linux:**
- Tkinter GUI (install: `sudo apt install python3-tk`)
- Works from terminal and IDEs
- Python 3 usually pre-installed

---

## ✅ **Quick Reference**

**Install in new project:**
```bash
# macOS/Linux
cp /path/to/DSR/pre-commit-webhook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
cp /path/to/DSR/webhook_config.example.py webhook_config.py
```

```cmd
:: Windows
copy C:\path\to\DSR\pre-commit-webhook .git\hooks\pre-commit
copy C:\path\to\DSR\webhook_config.example.py webhook_config.py
```

**Test:**
```bash
git commit -m "Test" --allow-empty
```

**Uninstall:**
```bash
rm .git/hooks/pre-commit
rm webhook_config.py
```

---

## 🎉 **You're Done!**

Start committing and watch your Google Sheet fill up automatically! 🚀

**Questions?** Check the main [README.md](README.md) for more details.
