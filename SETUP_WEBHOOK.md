# 🎯 Webhook Setup Guide (No Payment Details Needed!)

Since you already have Apps Script, we'll use a webhook approach instead!

## ✅ **Benefits**
- ❌ No payment details required
- ❌ No Service Account needed
- ❌ No Google Cloud billing
- ✅ Uses your existing Apps Script
- ✅ 100% Free forever
- ✅ Simple setup (5 minutes)

---

## 📝 **Step 1: Add Webhook Function to Apps Script**

1. **Open your Google Sheet**: https://docs.google.com/spreadsheets/d/14XEeW-EyuIEn4f1XVleAx9VAduxehHqUv7-rXszZqS0

2. **Click**: Extensions → Apps Script

3. **Add a new file**: Click the **+** button next to "Files" → Select "Script"

4. **Name it**: `GitCommitWebhook`

5. **Copy and paste** this code from `apps_script_webhook.js`:

```javascript
const DAILY_SHEET_NAME = "Daily"; // Your sheet name

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (!data.date || !data.title) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing required fields"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(DAILY_SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: `Sheet '${DAILY_SHEET_NAME}' not found`
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const row = [
      data.date || "",
      data.title || "",
      data.description || "",
      data.hours || 1.0,
      data.sha || "pending"
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Commit logged successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

6. **Click Save** (💾 icon)

---

## 🚀 **Step 2: Deploy as Web App**

1. **Click**: Deploy → New deployment

2. **Click the gear icon** ⚙️ next to "Select type" → Choose **"Web app"**

3. **Configure**:
   - **Description**: `Git Commit Logger Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` ⚠️ Important!

4. **Click "Deploy"**

5. **Authorize access**:
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" → "Go to GitCommitWebhook (unsafe)"
   - Click "Allow"

6. **Copy the Web App URL**:
   - You'll see a URL like: `https://script.google.com/macros/s/XXXXX/exec`
   - **COPY THIS URL** - you'll need it!

---

## 🔧 **Step 3: Configure the Python Hook**

1. **Open**: `/Users/uiuxateam/DSR/webhook_config.py`

2. **Paste your Web App URL**:
```python
WEBHOOK_URL = "https://script.google.com/macros/s/YOUR_URL_HERE/exec"
```

3. **Save the file**

---

## 🧪 **Step 4: Test the Webhook**

### Test from Apps Script first:

1. In Apps Script editor, find the `testWebhook()` function
2. Click **Run** (▶️ button)
3. Check your "Daily" sheet - you should see a test row!

### Test from Python:

```bash
cd /Users/uiuxateam/DSR
python3 pre-commit-webhook
```

This will prompt you for commit details and send them to the sheet!

---

## 📥 **Step 5: Install the Webhook Hook**

Use the modified installer:

```bash
cd /path/to/your/git/repo
/Users/uiuxateam/DSR/install.sh --webhook
```

Or manually:
```bash
cp /Users/uiuxateam/DSR/pre-commit-webhook /path/to/your/repo/.git/hooks/pre-commit
chmod +x /path/to/your/repo/.git/hooks/pre-commit

# Copy config
cp /Users/uiuxateam/DSR/webhook_config.py /path/to/your/repo/../webhook_config.py
```

---

## ✅ **Step 6: Make a Test Commit**

```bash
cd /path/to/your/repo
echo "test" >> test.txt
git add test.txt
git commit -m "Testing webhook logger"
```

**Expected output:**
```
📝 Logging commit to Google Sheets...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commit Message: "Testing webhook logger"

Task Title [Testing webhook logger]: 
Task Description: Testing the webhook
Time Taken in hours [1.0]: 0.5

Submitting to Google Sheets...
✅ Logged to Google Sheets successfully!
```

Check your sheet - new row should appear! 🎉

---

## 🔍 **Troubleshooting**

### "Webhook URL not configured"
→ Make sure you set `WEBHOOK_URL` in `webhook_config.py`

### "HTTP Error 403"
→ Make sure you set "Who has access" to "Anyone" when deploying

### "Network error"
→ Check your internet connection

### "Sheet 'Daily' not found"
→ Make sure `DAILY_SHEET_NAME` in Apps Script matches your sheet tab name

---

## 📊 **What Gets Logged**

Same as before:
- **Column A**: Date (DD/MM/YYYY)
- **Column B**: Task Title
- **Column C**: Task Description
- **Column D**: Time Taken (hours)
- **Column E**: Commit SHA

---

## 🎉 **Done!**

No payment details, no Service Account, pure Apps Script webhook! 🚀

This integrates perfectly with your existing `sendDailyReport()` and `sendWeeklyReport()` functions!
