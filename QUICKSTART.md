# ⚡ Quick Start - DSR Commit Logger

**Get started in 5 minutes!**

---

## 1️⃣ **Deploy Google Apps Script** (One Time)

1. Open your Google Sheet
2. Extensions → Apps Script
3. Paste the code from `apps_script_webhook.js`
4. Deploy → New deployment → Web app
5. Execute as: **Me** | Access: **Anyone**
6. **Copy the Web App URL**

---

## 2️⃣ **Install in Your Project** (Each Project)

### **macOS/Linux:**
```bash
cd /path/to/your/project
cp /path/to/DSR/pre-commit-webhook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
cp /path/to/DSR/webhook_config.example.py webhook_config.py
```

### **Windows:**
```cmd
cd C:\path\to\your\project
copy C:\path\to\DSR\pre-commit-webhook .git\hooks\pre-commit
copy C:\path\to\DSR\webhook_config.example.py webhook_config.py
```

---

## 3️⃣ **Configure**

Edit `webhook_config.py`:

```python
WEBHOOK_URL = "YOUR_APPS_SCRIPT_URL_HERE"
SHEET_NAME = "Daily"
DEFAULT_TIME = 1.0
```

---

## 4️⃣ **Test**

```bash
git commit -m "Test commit logger" --allow-empty
```

Fill in the prompts and check your Google Sheet!

---

## ✅ **Done!**

Every commit now logs automatically to your Google Sheet.

**Need more details?** See [SETUP.md](SETUP.md) for complete instructions.

---

## 🎯 **What You Get**

| Date | Task Title | Description | Time (hrs) | Commit SHA |
|------|-----------|-------------|------------|------------|
| 30/01/2026 | Fixed bug | Auth issue | 2.0 | pending |

---

## 🔧 **Common Issues**

**Hook not running?**
- macOS/Linux: `chmod +x .git/hooks/pre-commit`
- Windows: Check Python in PATH

**"Webhook URL not configured"?**
- Edit `webhook_config.py` and set `WEBHOOK_URL`

**"Sheet not found"?**
- Match `SHEET_NAME` in config with your sheet tab name

---

**Questions?** See [SETUP.md](SETUP.md) or [README.md](README.md)
