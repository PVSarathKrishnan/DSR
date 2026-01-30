# 📦 DSR Commit Logger - Distribution Package

## ✅ **What's Included**

This package contains everything needed to set up automatic Git commit logging to Google Sheets on **any platform** (Windows, macOS, Linux).

---

## 📁 **Files**

### **Core Files:**
- `pre-commit-webhook` - The Git hook script (Python)
- `apps_script_webhook.js` - Google Apps Script webhook code
- `webhook_config.example.py` - Configuration template

### **Installation:**
- `install.py` - Automated cross-platform installer

### **Documentation:**
- `README.md` - Overview and features
- `SETUP.md` - Complete cross-platform setup guide
- `QUICKSTART.md` - 5-minute quick start
- `CHANGES.md` - Version history and updates

### **Optional:**
- `install.sh` - Bash installer (macOS/Linux alternative)
- `.gitignore` - Recommended gitignore entries

---

## 🚀 **Quick Setup for Anyone**

### **Step 1: Get Your Webhook URL**

1. Open your Google Sheet
2. Extensions → Apps Script
3. Copy code from `apps_script_webhook.js`
4. Deploy as Web App → Copy URL

### **Step 2: Install in Your Project**

**Easiest way (all platforms):**
```bash
python3 install.py /path/to/your/project
```

**Or manually:**
- Copy `pre-commit-webhook` to `.git/hooks/pre-commit`
- Copy `webhook_config.example.py` to `webhook_config.py`
- Make executable (Unix): `chmod +x .git/hooks/pre-commit`

### **Step 3: Configure**

Edit `webhook_config.py`:
```python
WEBHOOK_URL = "YOUR_APPS_SCRIPT_URL"
```

### **Step 4: Test**

```bash
git commit -m "Test" --allow-empty
```

---

## 📚 **For Complete Instructions**

See **[SETUP.md](SETUP.md)** for detailed platform-specific instructions.

See **[QUICKSTART.md](QUICKSTART.md)** for a condensed guide.

---

## 🌍 **Cross-Platform Support**

| Platform | Terminal | GUI |
|----------|----------|-----|
| **macOS** | ✅ Works | ✅ AppleScript dialogs |
| **Windows** | ✅ Works | ✅ Tkinter (if available) |
| **Linux** | ✅ Works | ✅ Tkinter (if installed) |

---

## 🎯 **Features**

- ✅ Automatic commit logging to Google Sheets
- ✅ Interactive dialogs (GUI or terminal)
- ✅ "Commit Without Logging" option
- ✅ Cancel confirmation
- ✅ Time tracking
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Works with any Git host (GitHub, GitLab, Bitbucket, local)

---

## 🔐 **Security**

- Webhook URL is public-safe (anyone can POST)
- Each user creates their own `webhook_config.py` (not committed)
- No credentials stored in Git
- All commits go to Google Sheet (you control access)

---

## 🤝 **Team Distribution**

**To share with your team:**

1. **Admin:** Deploy the Apps Script webhook once
2. **Share:** Give team the webhook URL
3. **Each Developer:**
   - Copies the DSR files
   - Runs `install.py` in their project
   - Sets the webhook URL in their `webhook_config.py`
   - Tests with empty commit

---

## ❓ **Support**

- **Setup Issues:** See [SETUP.md](SETUP.md) Troubleshooting section
- **Platform-specific:** See platform notes in [SETUP.md](SETUP.md)
- **Quick answers:** Check [QUICKSTART.md](QUICKSTART.md)

---

## 📊 **What Gets Logged**

| Date | Task Title | Description | Time (hrs) | Commit SHA |
|------|-----------|-------------|------------|------------|
| 30/01/2026 | Fixed bug | Auth issue | 2.0 | pending |
| 30/01/2026 | New feature | User profile | 3.5 | pending |

---

## ✨ **Version**

Current: **v2.0**
- Single dialog with all fields (or 3 native dialogs)
- "Commit Without Logging" button
- Cancel confirmation
- Cross-platform support

See [CHANGES.md](CHANGES.md) for full changelog.

---

**Made with ❤️ for developers who value transparency and time tracking**
