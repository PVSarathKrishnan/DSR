# 🚀 Quick Start Guide

## Step 1: Get Your Service Account Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**
3. **Enable Google Sheets API**: APIs & Services → Library → Search "Google Sheets API" → Enable
4. **Create Service Account**: APIs & Services → Credentials → Create Credentials → Service Account
5. **Download JSON Key**: Click on service account → Keys → Add Key → Create new key → JSON
6. **Save as `credentials.json`** in `/Users/uiuxateam/DSR/`

## Step 2: Share Your Google Sheet

1. Open `credentials.json`
2. Copy the `client_email` value (looks like: `xxx@xxx.iam.gserviceaccount.com`)
3. Open this sheet: https://docs.google.com/spreadsheets/d/14XEeW-EyuIEn4f1XVleAx9VAduxehHqUv7-rXszZqS0
4. Click **Share**
5. Paste the service account email
6. Give **Editor** permissions
7. Click Send

## Step 3: Dependencies (Already Done! ✅)

```bash
pip3 install -r requirements.txt
```

## Step 4: Install in Your Git Repo

```bash
# Navigate to your project
cd /path/to/your/git/repo

# Run installer
/Users/uiuxateam/DSR/install.sh

# Or if DSR is your current directory:
./install.sh /path/to/your/git/repo
```

## Step 5: Test It!

```bash
cd /path/to/your/git/repo
echo "test" >> test.txt
git add test.txt
git commit -m "Testing commit logger"
```

You should see:
```
📝 Logging commit to Google Sheets...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commit Message: "Testing commit logger"

Task Title [Testing commit logger]: 
Task Description: Just testing
Time Taken in hours [1.0]: 0.5

✅ Logged to Google Sheets successfully!
```

## 🎯 What Gets Logged

Each commit creates a row with:
- **Date**: DD/MM/YYYY (e.g., 29/01/2026)
- **Task Title**: From commit message or custom
- **Task Description**: Your input
- **Time Taken**: In hours (0.5, 1.0, etc.)
- **Commit SHA**: "pending" (since we're in pre-commit)

---

## 🔧 Common Commands

**Install in current directory:**
```bash
./install.sh
```

**Install in specific repo:**
```bash
./install.sh /path/to/repo
```

**Uninstall:**
```bash
./install.sh --uninstall /path/to/repo
```

**Check if hook is installed:**
```bash
ls -la /path/to/repo/.git/hooks/pre-commit
```

---

## ⚠️ Troubleshooting

### "Permission denied" error
→ Make sure you shared the sheet with your service account email

### "Sheet not found" error
→ Check that `SHEET_NAME = "Daily"` in `config.py` matches your sheet tab name

### "credentials.json not found"
→ Make sure `credentials.json` is in `/Users/uiuxateam/DSR/`

### Hook not running
→ Check if it's executable: `chmod +x /path/to/repo/.git/hooks/pre-commit`

---

## 📝 Tips

**Quick commits (just press Enter):**
```bash
git commit -m "Quick fix"
# [Enter] [Enter] [Enter]
```

**Detailed tracking:**
```bash
git commit -m "New feature"
# Task Title: [Enter]
# Task Description: Implemented X, Y, Z
# Time: 2.5
```

**Cancel commit:**
- Press `Ctrl+C` during prompts to abort

---

## 🎨 Customization

Edit `config.py` to change:
- Sheet name (`SHEET_NAME`)
- Default time (`DEFAULT_TIME`)
- Time options (`TIME_OPTIONS`)
- Colors and emojis

---

**Ready to go!** 🚀

Next: Download your `credentials.json` and share the sheet!
