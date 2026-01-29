# 🚀 Git Commit Logger for Google Sheets

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Cross-Platform](https://img.shields.io/badge/Platform-macOS%20|%20Windows%20|%20Linux-blue.svg)](https://www.python.org/)
[![Python: 3.8+](https://img.shields.io/badge/Python-3.8+-green.svg)](https://www.python.org/)

**Automatically log your Git commits to Google Sheets** with an interactive terminal or GUI dialog. Perfect for time tracking, daily status reports, and project management.

---

## ✨ Features

- 📝 **Automatic Commit Logging** - Intercepts Git commits via pre-commit hook
- 🎨 **Professional GUI** - Single-form dialog with all fields (Terminal or GUI)
- 🌍 **Cross-Platform** - Works on macOS, Windows, and Linux
- 📊 **Google Sheets Integration** - Logs directly via Apps Script webhook
- 🔒 **No API Credentials Needed** - Uses simple webhook approach
- ⚡ **Never Blocks Commits** - Warns on failure but always allows commits
- 🎯 **Smart Defaults** - Pre-filled with commit message, 1 hour default
- 💡 **Cancel Support** - Abort commit anytime during input
- 🖥️ **GUI Frameworks** - Native dialogs on macOS, tkinter on Windows/Linux

---

## 📋 Prerequisites

- **Operating System**: macOS, Windows, or Linux
- **Python 3.8+** (with tkinter for GUI on Windows/Linux)
- **Git repository**
- **Google account** with Google Sheets access

---

## 🚀 Quick Start

### 1. Deploy Apps Script Webhook

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Copy code from `apps_script_webhook.js` into a new script file
4. **Customize** `DAILY_SHEET_NAME` to match your sheet tab name
5. Click **Deploy → New deployment**
6. Choose **Web app**
7. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy** and **copy the Web App URL**

### 2. Configure the Hook

1. Copy the example config:
   ```bash
   cp webhook_config.example.py webhook_config.py
   ```

2. Edit `webhook_config.py`:
   ```python
   WEBHOOK_URL = "https://script.google.com/macros/s/YOUR_URL/exec"
   SHEET_NAME = "Sheet1"  # Match your Google Sheet tab name
   ```

### 3. Install in Your Repository

```bash
# Navigate to your Git project
cd /path/to/your/project

# Copy the hook
cp /path/to/DSR/pre-commit-webhook .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit

# Copy config to project root
cp /path/to/DSR/webhook_config.py ./webhook_config.py
```

### 4. Test It!

**From Terminal:**
```bash
git add .
git commit -m "Testing commit logger"
```

**From VS Code:**
- Make a change
- Stage it
- Click "Commit" - GUI dialogs will appear!

---

## 🎨 User Experience

### Terminal Mode
```
📝 Logging commit to Google Sheets...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commit Message: "Fixed authentication bug"

Task Title [Fixed authentication bug]: 
Task Description: Resolved JWT token expiration issue
Time Taken in hours [1.0]: 2

✅ Logged to Google Sheets successfully!
```

### GUI Mode (VS Code, etc.)
Three native macOS dialogs appear:
1. **Task Title** - Pre-filled with commit message
2. **Description** - Optional details
3. **Time Taken** - Default 1.0 hours

---

## 📊 What Gets Logged

Each commit creates a row in your Google Sheet:

| Date | Task Title | Description | Time (hrs) | Commit SHA |
|------|-----------|-------------|------------|------------|
| 29/01/2026 | Fixed auth bug | Resolved JWT issue | 2.0 | pending |

---

## 🔧 Configuration

Edit `webhook_config.py`:

```python
# Required: Your Apps Script webhook URL
WEBHOOK_URL = "https://script.google.com/macros/s/.../exec"

# Sheet name (must match Apps Script)
SHEET_NAME = "Daily"

# Default time tracking
DEFAULT_TIME = 1.0

# Date format
DATE_FORMAT = "%d/%m/%Y"  # DD/MM/YYYY
```

---

## 📁 Project Structure

```
DSR/
├── pre-commit-webhook              # Main Git hook script
├── apps_script_webhook.js          # Google Apps Script code
├── webhook_config.example.py       # Configuration template
├── install.sh                      # Installation helper (optional)
├── test_connection.py              # Test webhook setup
├── requirements.txt                # Python dependencies (legacy)
├── README.md                       # This file
├── QUICKSTART.md                   # Quick reference
├── SETUP_WEBHOOK.md               # Detailed setup guide
├── GUI_DIALOG_GUIDE.md            # GUI usage guide
└── .gitignore
```

---

## 🛠️ Installation Methods

### Manual Installation (Recommended)
```bash
# 1. Deploy Apps Script (see Quick Start)
# 2. Configure webhook_config.py
# 3. Copy files to your project
cp pre-commit-webhook /your/project/.git/hooks/pre-commit
cp webhook_config.py /your/project/webhook_config.py
chmod +x /your/project/.git/hooks/pre-commit
```

### Using install.sh
```bash
./install.sh /path/to/your/project
```

---

## 🧪 Testing

Test the webhook connection:
```bash
python3 test_connection.py
```

Test in your repo:
```bash
cd /your/project
git commit -m "Test" --allow-empty
```

---

## ❌ Uninstalling

```bash
# Remove hook
rm /your/project/.git/hooks/pre-commit

# Remove config
rm /your/project/webhook_config.py
```

---

## 🔒 Security Notes

- ✅ **webhook_config.py is gitignored** - Won't be committed
- ✅ **Webhook URL is public-safe** - Anyone can post to it
- ⚠️ **Don't commit your configured webhook_config.py**
- ⚠️ **Share the sheet with your Apps Script only**

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 💡 Use Cases

- **Time Tracking** - Log hours per commit
- **Daily Status Reports** - Auto-generate from commit data
- **Project Management** - Track feature development
- **Team Transparency** - Share commit logs with stakeholders
- **Personal Analytics** - Analyze your coding patterns

---

## 🆘 Troubleshooting

**Hook not running?**
- Check: `ls -la .git/hooks/pre-commit` (should be executable)
- Fix: `chmod +x .git/hooks/pre-commit`

**"Module not found" error?**
- Check: `webhook_config.py` is in project root
- Copy from template: `cp webhook_config.example.py webhook_config.py`

**"Webhook URL not configured"?**
- Edit `webhook_config.py` and set `WEBHOOK_URL`

**GUI dialogs not showing?**
- Ensure macOS accessibility permissions for Terminal/IDE
- Terminal users: prompts work without dialogs

---

## 📚 Documentation

- [Quick Start](QUICKSTART.md) - Fast setup guide
- [Webhook Setup](SETUP_WEBHOOK.md) - Detailed Apps Script deployment
- [GUI Dialogs](GUI_DIALOG_GUIDE.md) - Using with VS Code

---

## 🎉 Credits

Created for efficient commit tracking and daily status reporting.

**Made with ❤️ for developers who value transparency and time tracking**

---

## 🔗 Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [AppleScript Guide](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/)

---

**Star ⭐ this repo if it helps your workflow!**
