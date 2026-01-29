# Recent Changes - v2.0

## 🎉 Major Update: Single-Dialog GUI with Skip Logging

### What's New

#### 1. **Single Comprehensive Dialog** (GUI Mode)
- **Before**: Three separate dialogs (Task Title → Description → Time)
- **After**: One dialog with all fields visible at once
- Better user experience with all information in one place
- Faster workflow for committing

#### 2. **Skip Logging Option** ⏭️
Added a new "Skip Logging" button that allows you to:
- Proceed with your Git commit **without** logging to Google Sheets
- Useful when you want to commit quickly without tracking time
- No API call is made when skipping

#### 3. **Updated Button Layout**

**GUI Mode Buttons:**
- **Skip Logging** - Commit without logging (NEW!)
- **Cancel** - Abort the commit entirely
- **Log to Sheets** - Submit data and proceed with commit

### User Experience

#### macOS AppleScript Dialog
```
┌─────────────────────────────────────┐
│ 📝 DSR Commit Logger                │
├─────────────────────────────────────┤
│ Enter commit details below:         │
│                                     │
│ Task Title:                         │
│ [Fixed authentication bug]          │
│                                     │
│ Description (optional):             │
│ []                                  │
│                                     │
│ Time (hours):                       │
│ [1.0]                               │
│                                     │
│ [Skip Logging] [Cancel] [Log to Sheets] │
└─────────────────────────────────────┘
```

#### Windows/Linux (tkinter)
```
┌─────────────────────────────────────┐
│     📝 Log Commit to Google Sheets   │
├─────────────────────────────────────┤
│ Task Title:                         │
│ [Fixed authentication bug]          │
│                                     │
│ Description (optional):             │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Time Taken (hours):                 │
│ [1.0▼]  (e.g., 0.5, 1, 2.5)        │
│                                     │
│ [Skip Logging] [Cancel] [Log to Sheets] │
└─────────────────────────────────────┘
```

### Behavior Changes

**Skip Logging:**
- ✅ Commit proceeds normally
- ✅ No API call to Google Sheets
- ✅ No row added to your sheet
- 📝 Logs: `[DSR Logger] ⏭️  Skipped logging - proceeding with commit`

**Cancel:**
- ❌ Commit is aborted
- ❌ No changes are committed
- 📝 Logs: `[DSR Logger] ❌ Cancelled by user`

**Log to Sheets:**
- ✅ Sends data to Google Sheets
- ✅ Commit proceeds
- 📝 Logs: `[DSR Logger] ✓ Logged successfully`

### Technical Implementation

#### Return Values from GUI Dialog Functions

```python
# Skip Logging clicked
return (None, None, None)  # Proceed without API call

# Cancel clicked
return (None, None, -1.0)  # Abort commit (exit code 1)

# Log to Sheets clicked
return (title, description, hours)  # Normal flow
```

#### Updated `main()` Logic

```python
# Check for cancel
if time_taken == -1.0:
    sys.exit(1)  # Abort

# Check for skip
if task_title is None and task_description is None and time_taken is None:
    sys.exit(0)  # Proceed without logging

# Otherwise, proceed with normal logging
```

### Migration Notes

**For Existing Users:**
1. No configuration changes needed
2. Old behavior is preserved when you click "Log to Sheets"
3. New "Skip Logging" option is purely additive
4. Terminal mode is unchanged

**Compatibility:**
- ✅ macOS (AppleScript dialogs)
- ✅ Windows (tkinter dialogs)
- ✅ Linux (tkinter dialogs)
- ✅ Terminal mode (no changes)

### Files Modified

1. **pre-commit-webhook** - Main hook script
   - Updated `show_macos_dialog()` - Single-page AppleScript
   - Updated `show_tkinter_dialog()` - Added Skip button
   - Updated `main()` - Handle skip and cancel cases

2. **README.md** - Documentation
   - Updated GUI mode description
   - Added Skip Logging to features list

3. **CHANGES.md** - This file (NEW)
   - Documents all changes in this version

### Upgrade Instructions

If you're upgrading from the previous version:

```bash
# 1. Backup your current hook
cp .git/hooks/pre-commit .git/hooks/pre-commit.backup

# 2. Copy the new version
cp /path/to/DSR/pre-commit-webhook .git/hooks/pre-commit

# 3. Ensure it's executable
chmod +x .git/hooks/pre-commit

# 4. Test it
git commit -m "Test new dialog" --allow-empty
```

### Feedback

If you encounter any issues or have suggestions:
- The old 3-dialog flow should no longer appear
- All buttons should be functional
- Skip Logging should proceed without API calls

---

**Version**: 2.0  
**Release Date**: January 29, 2026  
**Breaking Changes**: None (backward compatible)
