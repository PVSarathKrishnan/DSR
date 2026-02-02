/**
 * DSR Task Manager - Google Apps Script Webhook
 * Handles task creation and updates with commit tracking
 */

// Configuration
const TASKS_SHEET_NAME = "Tasks"; // Your tasks sheet name

/**
 * Web App Entry Point - handles GET and POST requests
 */
function doGet(e) {
    try {
        const action = e.parameter.action;

        if (action === 'getTasks') {
            return getTasks();
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: "Invalid action. Use ?action=getTasks"
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Handle POST requests - Create or Update task
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // Validate required fields
        if (!data.taskName || !data.commitMessage) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: "Missing required fields: taskName and commitMessage"
            })).setMimeType(ContentService.MimeType.JSON);
        }

        const result = updateOrCreateTask(
            data.taskName,
            data.commitMessage,
            data.time || 1.0,
            data.branch || "unknown",
            data.status || "In Progress",
            data.sha || "pending"
        );

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Get all existing tasks
 */
function getTasks() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(TASKS_SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
        sheet = spreadsheet.insertSheet(TASKS_SHEET_NAME);
        // Add headers
        sheet.appendRow(['Task Name', 'Description', 'Date', 'Time (hrs)', 'Branch', 'Status', 'Commit SHA']);
        sheet.getRange('A1:G1').setFontWeight('bold');
    }

    const data = sheet.getDataRange().getValues();
    const tasks = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) { // If task name exists
            tasks.push({
                taskName: data[i][0],
                description: data[i][1],
                date: data[i][2],
                time: data[i][3],
                branch: data[i][4],
                status: data[i][5],
                sha: data[i][6]
            });
        }
    }

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        tasks: tasks
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Update existing task or create new one
 */
function updateOrCreateTask(taskName, commitMessage, time, branch, status, sha) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(TASKS_SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
        sheet = spreadsheet.insertSheet(TASKS_SHEET_NAME);
        sheet.appendRow(['Task Name', 'Description', 'Date', 'Time (hrs)', 'Branch', 'Status', 'Commit SHA']);
        sheet.getRange('A1:G1').setFontWeight('bold');
    }

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // Find existing task by Task Name (case-insensitive)
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] && data[i][0].toString().toLowerCase() === taskName.toLowerCase()) {
            rowIndex = i + 1; // Sheet rows are 1-indexed
            break;
        }
    }

    const now = new Date();

    if (rowIndex > 0) {
        // EXISTING TASK - Update it
        const currentDesc = sheet.getRange(rowIndex, 2).getValue() || "";
        const currentTime = parseFloat(sheet.getRange(rowIndex, 4).getValue()) || 0;

        // Append description with bullet point and timestamp
        const newDesc = currentDesc + (currentDesc ? '\n' : '') + '• ' + commitMessage;

        // Add time
        const newTime = currentTime + parseFloat(time);

        // Update row
        sheet.getRange(rowIndex, 2).setValue(newDesc);      // Description
        sheet.getRange(rowIndex, 3).setValue(now);          // Date (last updated)
        sheet.getRange(rowIndex, 4).setValue(newTime);      // Time (accumulated)
        sheet.getRange(rowIndex, 5).setValue(branch);       // Branch (latest)
        sheet.getRange(rowIndex, 6).setValue(status);       // Status (latest)
        sheet.getRange(rowIndex, 7).setValue(sha);          // SHA (latest)

        return {
            success: true,
            action: 'updated',
            message: `Task "${taskName}" updated successfully`,
            taskName: taskName,
            totalTime: newTime,
            totalCommits: (currentDesc.match(/•/g) || []).length + 1
        };

    } else {
        // NEW TASK - Create new row
        sheet.appendRow([
            taskName,
            '• ' + commitMessage,
            now,
            parseFloat(time),
            branch,
            status,
            sha
        ]);

        return {
            success: true,
            action: 'created',
            message: `New task "${taskName}" created successfully`,
            taskName: taskName,
            totalTime: parseFloat(time),
            totalCommits: 1
        };
    }
}

/**
 * Test function to verify webhook works
 */
function testCreateTask() {
    const result = updateOrCreateTask(
        "Test Task",
        "Initial commit message",
        1.5,
        "feature/test",
        "In Progress",
        "abc123"
    );
    Logger.log(result);
}

function testUpdateTask() {
    const result = updateOrCreateTask(
        "Test Task",
        "Second commit message",
        2.0,
        "feature/test",
        "Completed",
        "def456"
    );
    Logger.log(result);
}

function testGetTasks() {
    const result = getTasks();
    Logger.log(result.getContent());
}
