// ============= CONFIGURATION =============

const DAILY_SHEET_NAME = 'Sheet1';       // Daily commits
const WEEKLY_SHEET_NAME = 'Sheet2';      // Weekly accumulation
const LOG_SHEET_NAME = 'Sheet3';         // Permanent logs
const TASKS_SHEET_NAME = 'Tasks';        // Task database

const PROJECT_NAME = 'My Property Journey';
const MIN_HOURS_FOR_DAILY_REPORT = 6;

// Email recipients
const RECIPIENT_EMAIL = 'sarin@ateamsoftsolutions.com';
const CC_DAILY = 'rakesh@ateamsoftsolutions.com, sanoj@ateamsoftsolutions.com, director@ateamsoftsolutions.com';
const CC_WEEKLY = 'rakesh@ateamsoftsolutions.com, sanoj@ateamsoftsolutions.com';

// Set to true for testing (sends only to developer)
const DEBUG_MODE = false;

// ============= TASK MANAGEMENT APIs =============

/**
 * Handle GET requests
 * Used for fetching tasks
 */
function doGet(e) {
    try {
        const action = e.parameter.action;

        if (action === 'getTasks') {
            return getTasks();
        }

        return createErrorResponse('Unknown action');
    } catch (error) {
        return createErrorResponse(error.toString());
    }
}

/**
 * Get all tasks from Tasks sheet
 */
function getTasks() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(TASKS_SHEET_NAME);

    // Create Tasks sheet if it doesn't exist
    if (!sheet) {
        sheet = spreadsheet.insertSheet(TASKS_SHEET_NAME);
        sheet.appendRow(['Task Name', 'Last Used Time Stamp']);
        sheet.getRange('A1:B1').setBackground('#ff9900').setFontWeight('bold');
    }

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        // No tasks yet
        return ContentService.createTextOutput(
            JSON.stringify({ success: true, tasks: [] })
        ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    const tasks = data
        .filter(row => row[0]) // Filter empty rows
        .map(row => ({
            name: row[0],
            lastUsed: row[1] ? new Date(row[1]).getTime() : 0
        }))
        .sort((a, b) => b.lastUsed - a.lastUsed); // Sort by most recent first

    return ContentService.createTextOutput(
        JSON.stringify({ success: true, tasks: tasks })
    ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create a new task
 */
function createTask(taskName) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(TASKS_SHEET_NAME);

    // Create Tasks sheet if doesn't exist
    if (!sheet) {
        sheet = spreadsheet.insertSheet(TASKS_SHEET_NAME);
        sheet.appendRow(['Task Name', 'Last Used Time Stamp']);
        sheet.getRange('A1:B1').setBackground('#ff9900').setFontWeight('bold');
    }

    // Check if task already exists
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        const existingTasks = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (let i = 0; i < existingTasks.length; i++) {
            if (existingTasks[i][0] === taskName) {
                return createErrorResponse('Task already exists');
            }
        }
    }

    // Add new task
    sheet.appendRow([taskName, new Date()]);

    return createSuccessResponse('Task created successfully');
}

/**
 * Update task name
 */
function updateTask(oldName, newName) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(TASKS_SHEET_NAME);

    if (!sheet) {
        return createErrorResponse('Tasks sheet not found');
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
        return createErrorResponse('Task not found');
    }

    const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

    for (let i = 0; i < data.length; i++) {
        if (data[i][0] === oldName) {
            sheet.getRange(i + 2, 1).setValue(newName);
            return createSuccessResponse('Task updated successfully');
        }
    }

    return createErrorResponse('Task not found');
}

/**
 * Delete a task
 */
function deleteTask(taskName) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(TASKS_SHEET_NAME);

    if (!sheet) {
        return createErrorResponse('Tasks sheet not found');
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
        return createErrorResponse('Task not found');
    }

    const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

    for (let i = 0; i < data.length; i++) {
        if (data[i][0] === taskName) {
            sheet.deleteRow(i + 2);
            return createSuccessResponse('Task deleted successfully');
        }
    }

    return createErrorResponse('Task not found');
}

/**
 * Update task's last used timestamp
 */
function updateTaskTimestamp(taskName) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(TASKS_SHEET_NAME);

    if (!sheet) {
        // Create Tasks sheet if doesn't exist
        sheet = spreadsheet.insertSheet(TASKS_SHEET_NAME);
        sheet.appendRow(['Task Name', 'Last Used Time Stamp']);
        sheet.getRange('A1:B1').setBackground('#ff9900').setFontWeight('bold');
        sheet.appendRow([taskName, new Date()]);
        return;
    }

    const lastRow = sheet.getLastRow();

    // If no tasks, add this one
    if (lastRow < 2) {
        sheet.appendRow([taskName, new Date()]);
        return;
    }

    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();

    // Find and update
    for (let i = 0; i < data.length; i++) {
        if (data[i][0] === taskName) {
            sheet.getRange(i + 2, 2).setValue(new Date());
            return;
        }
    }

    // Task doesn't exist, create it
    sheet.appendRow([taskName, new Date()]);
}

// ============= WEBHOOK ENDPOINTS =============

/**
 * Main POST handler - routes to appropriate function
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;

        // Task management actions
        if (action === 'createTask') {
            return createTask(data.taskName);
        } else if (action === 'updateTask') {
            return updateTask(data.oldName, data.newName);
        } else if (action === 'deleteTask') {
            return deleteTask(data.taskName);
        } else if (action === 'logCommit' || !action) {
            // Default action: log commit
            return handleTaskCommit(data);
        }

        return createErrorResponse('Unknown action');
    } catch (error) {
        return createErrorResponse(`Error: ${error.toString()}`);
    }
}

/**
 * Handle task commit - SMART MERGING LOGIC
 * If same task exists for today, append description and add hours
 * Otherwise, create new row
 */
function handleTaskCommit(data) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(DAILY_SHEET_NAME);

    if (!sheet) {
        return createErrorResponse(`Sheet '${DAILY_SHEET_NAME}' not found`);
    }

    const currentDate = new Date();
    const taskName = data.taskName || 'Untitled Task';
    const commitMessage = data.commitMessage || '';
    const hours = parseFloat(data.time) || 1.0;
    const status = data.status || 'In Progress';
    const branch = data.branch || '';

    // Update task timestamp in Tasks sheet
    updateTaskTimestamp(taskName);

    // Check if task already logged TODAY
    const lastRow = sheet.getLastRow();
    const todayString = formatDate(currentDate);

    if (lastRow > 1) {
        const existingData = sheet.getRange(2, 1, lastRow - 1, 6).getValues();

        for (let i = 0; i < existingData.length; i++) {
            const rowDate = formatDate(existingData[i][0]);
            const rowTask = existingData[i][1];

            // Same task, same day?
            if (rowDate === todayString && rowTask === taskName) {
                const rowNum = i + 2;

                // Append description with line break
                const currentDescription = existingData[i][2] || '';
                const newDescription = currentDescription
                    ? `${currentDescription}\n${commitMessage}`
                    : commitMessage;

                // Add hours
                const currentHours = parseFloat(existingData[i][3]) || 0;
                const newHours = currentHours + hours;

                // Update the row
                sheet.getRange(rowNum, 3).setValue(newDescription); // Description
                sheet.getRange(rowNum, 4).setValue(newHours);       // Hours
                sheet.getRange(rowNum, 5).setValue(status);         // Latest status
                // Branch stays the same (first commit's branch)

                return createSuccessResponse('Task updated (appended to existing entry)');
            }
        }
    }

    // No existing entry for this task today - create new row
    sheet.appendRow([currentDate, taskName, commitMessage, hours, status, branch]);

    return createSuccessResponse('Task logged successfully');
}

// ============= DAILY REPORT =============

/**
 * Send daily status report email
 */
function sendDailyReport() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(DAILY_SHEET_NAME);

    if (!sheet) {
        console.error(`Sheet '${DAILY_SHEET_NAME}' not found.`);
        return;
    }

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        console.log("No data to send in daily report.");
        return;
    }

    // Get all data: [Date, Task, Description, Hours, Status, Git Branch]
    const dataRange = sheet.getRange(1, 1, lastRow, 6);
    const values = dataRange.getValues();

    // Group by task
    const taskGroups = groupByTaskDaily(values);

    // Calculate total hours from column D (index 3)
    let totalHours = 0;
    for (let i = 1; i < values.length; i++) {
        totalHours += parseFloat(values[i][3]) || 0;
    }

    // Don't send if less than minimum hours
    if (totalHours < MIN_HOURS_FOR_DAILY_REPORT) {
        console.log(`Total hours (${totalHours}) less than minimum (${MIN_HOURS_FOR_DAILY_REPORT}). Report not sent.`);
        // Still move data and clear sheet
        moveDataToWeeklyAndLogs(sheet, values, lastRow);
        return;
    }

    // Generate email
    const reportDate = formatDate(new Date());
    const subject = `${PROJECT_NAME} | Daily Status Update | ${reportDate}`;
    const htmlBody = generateDailyReportHTML(taskGroups, reportDate, totalHours);

    // Send email
    MailApp.sendEmail({
        to: RECIPIENT_EMAIL,
        cc: DEBUG_MODE ? '' : CC_DAILY,
        subject: subject,
        htmlBody: htmlBody
    });

    console.log(`Daily report sent to ${RECIPIENT_EMAIL}`);

    // Move data and clear sheet
    moveDataToWeeklyAndLogs(sheet, values, lastRow);
}

/**
 * Group commits by task for daily report
 */
function groupByTaskDaily(values) {
    const taskMap = {};

    for (let i = 1; i < values.length; i++) {
        const date = values[i][0];
        const taskName = values[i][1] || 'Untitled Task';
        const description = values[i][2] || '';
        const hours = parseFloat(values[i][3]) || 0;
        const status = values[i][4] || 'In Progress';
        const branch = values[i][5] || 'N/A';

        if (!taskMap[taskName]) {
            taskMap[taskName] = {
                descriptions: [],
                status: status,
                branch: branch,
                hours: 0
            };
        }

        // Split by line breaks and add each line
        if (description) {
            const lines = description.split('\n').filter(line => line.trim());
            taskMap[taskName].descriptions.push(...lines);
        }

        // Accumulate hours
        taskMap[taskName].hours += hours;

        // Update status and branch (last one wins)
        taskMap[taskName].status = status;
        taskMap[taskName].branch = branch;
    }

    return taskMap;
}

/**
 * Generate daily report HTML - EXACT format from your image
 */
function generateDailyReportHTML(taskGroups, date, totalHours) {
    let html = `
    <p>Hi Team,</p>
    <p>Please find the daily status update for <strong>${date}</strong>:</p>
    
    <table style="width:100%; border-collapse: collapse; background-color: #d4edda; margin-top: 20px;">
      <tr>
        <td colspan="3" style="padding: 12px; border: 1px solid #666; background-color: #a8d5ba;">
          <strong>Project Name: ${PROJECT_NAME}</strong>
        </td>
        <td colspan="2" style="padding: 12px; border: 1px solid #666; text-align: right; background-color: #a8d5ba;">
          <strong>Date: ${date}</strong>
        </td>
      </tr>
      <tr style="background-color: #a8d5ba;">
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 15%;">Task</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 42%;">Description</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: center; width: 10%;">Hours</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: center; width: 13%;">Status</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 20%;">Git Branch / PR Link</th>
      </tr>
  `;

    // Add task rows
    for (const [taskName, taskData] of Object.entries(taskGroups)) {
        const descriptionsHTML = taskData.descriptions.map(d => `- ${d}`).join('<br>');
        const statusColor = getStatusColor(taskData.status);

        html += `
      <tr>
        <td style="padding: 10px; border: 1px solid #666; vertical-align: top; background-color: #ffffff;">
          <strong>${taskName}</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #666; background-color: #ffffff;">
          ${descriptionsHTML}
        </td>
        <td style="padding: 10px; border: 1px solid #666; text-align: center; background-color: #ffffff;">
          ${taskData.hours.toFixed(1)} hrs
        </td>
        <td style="padding: 10px; border: 1px solid #666; text-align: center; background-color: ${statusColor};">
          ${taskData.status}
        </td>
        <td style="padding: 10px; border: 1px solid #666; font-family: monospace; background-color: #ffffff;">
          ${taskData.branch}
        </td>
      </tr>
    `;
    }

    html += `
      <tr>
        <td colspan="4" style="padding: 10px; border: 1px solid #666; text-align: right; background-color: #f0f0f0;">
          <strong>Total Hours Worked:</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #666; text-align: center; background-color: #f0f0f0;">
          <strong>${totalHours.toFixed(1)} hrs</strong>
        </td>
      </tr>
    </table>
    
    <br><br>--<br>
    ${signature()}
  `;

    return html;
}

// ============= WEEKLY REPORT ============= 
// (Keep all existing weekly report functions unchanged)

function sendWeeklyReport() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(WEEKLY_SHEET_NAME);

    if (!sheet) {
        console.error(`Sheet '${WEEKLY_SHEET_NAME}' not found.`);
        return;
    }

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        console.log("No data to send in weekly report.");
        return;
    }

    const dataRange = sheet.getRange(1, 1, lastRow, 6);
    const values = dataRange.getValues();

    const startDate = formatDate(values[1][0]);
    const endDate = formatDate(values[values.length - 1][0]);
    const dateRange = `${startDate} - ${endDate}`;

    const taskGroups = groupByTaskWeekly(values);

    const subject = `${PROJECT_NAME} | Weekly Status Update | ${dateRange}`;
    const htmlBody = generateWeeklyReportHTML(taskGroups, dateRange);

    MailApp.sendEmail({
        to: RECIPIENT_EMAIL,
        cc: DEBUG_MODE ? '' : CC_WEEKLY,
        subject: subject,
        htmlBody: htmlBody
    });

    console.log(`Weekly report sent to ${RECIPIENT_EMAIL}`);

    sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
}

function groupByTaskWeekly(values) {
    const taskMap = {};

    for (let i = 1; i < values.length; i++) {
        const date = formatDate(values[i][0]);
        const taskName = values[i][1] || 'Untitled Task';
        const description = values[i][2] || '';
        const hours = parseFloat(values[i][3]) || 0;
        const status = values[i][4] || 'In Progress';
        const branch = values[i][5] || 'N/A';

        if (!taskMap[taskName]) {
            taskMap[taskName] = {
                dates: new Set(),
                descriptions: [],
                status: status,
                branch: branch,
                hours: 0
            };
        }

        taskMap[taskName].dates.add(date);

        if (description) {
            const lines = description.split('\n').filter(line => line.trim());
            taskMap[taskName].descriptions.push(...lines);
        }

        taskMap[taskName].hours += hours;
        taskMap[taskName].status = status;
        taskMap[taskName].branch = branch;
    }

    for (const task in taskMap) {
        taskMap[task].dateRange = Array.from(taskMap[task].dates).join(', ');
        delete taskMap[task].dates;
    }

    return taskMap;
}

function generateWeeklyReportHTML(taskGroups, dateRange) {
    let html = `
    <p>Hi Team,</p>
    <p>Please find the weekly status update for <strong>${dateRange}</strong>:</p>
    
    <table style="width:100%; border-collapse: collapse; background-color: #d4edda; margin-top: 20px;">
      <tr>
        <td colspan="3" style="padding: 12px; border: 1px solid #666; background-color: #a8d5ba;">
          <strong>Project Name: ${PROJECT_NAME}</strong>
        </td>
        <td colspan="3" style="padding: 12px; border: 1px solid #666; text-align: right; background-color: #a8d5ba;">
          <strong>Week: ${dateRange}</strong>
        </td>
      </tr>
      <tr style="background-color: #a8d5ba;">
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 12%;">Task</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 15%;">Dates</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 38%;">Description</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: center; width: 8%;">Hours</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: center; width: 12%;">Status</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 15%;">Git Branch</th>
      </tr>
  `;

    let totalHours = 0;

    for (const [taskName, taskData] of Object.entries(taskGroups)) {
        const descriptionsHTML = taskData.descriptions.map(d => `- ${d}`).join('<br>');
        const statusColor = getStatusColor(taskData.status);
        totalHours += taskData.hours;

        html += `
      <tr>
        <td style="padding: 10px; border: 1px solid #666; vertical-align: top; background-color: #ffffff;">
          <strong>${taskName}</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #666; background-color: #ffffff; font-size: 11px;">
          ${taskData.dateRange}
        </td>
        <td style="padding: 10px; border: 1px solid #666; background-color: #ffffff;">
          ${descriptionsHTML}
        </td>
        <td style="padding: 10px; border: 1px solid #666; text-align: center; background-color: #ffffff;">
          ${taskData.hours.toFixed(1)} hrs
        </td>
        <td style="padding: 10px; border: 1px solid #666; text-align: center; background-color: ${statusColor};">
          ${taskData.status}
        </td>
        <td style="padding: 10px; border: 1px solid #666; font-family: monospace; background-color: #ffffff; font-size: 11px;">
          ${taskData.branch}
        </td>
      </tr>
    `;
    }

    html += `
      <tr>
        <td colspan="5" style="padding: 10px; border: 1px solid #666; text-align: right; background-color: #f0f0f0;">
          <strong>Total Hours Worked:</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #666; text-align: center; background-color: #f0f0f0;">
          <strong>${totalHours.toFixed(1)} hrs</strong>
        </td>
      </tr>
    </table>
    
    <br><br>--<br>
    ${signature()}
  `;

    return html;
}

// ============= UTILITY FUNCTIONS =============

function moveDataToWeeklyAndLogs(dailySheet, values, lastRow) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let weeklySheet = spreadsheet.getSheetByName(WEEKLY_SHEET_NAME);
    let logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME);

    if (!weeklySheet) {
        weeklySheet = spreadsheet.insertSheet(WEEKLY_SHEET_NAME);
        weeklySheet.appendRow(values[0]);
    }

    if (!logSheet) {
        logSheet = spreadsheet.insertSheet(LOG_SHEET_NAME);
        logSheet.appendRow(values[0]);
    }

    for (let i = 1; i < values.length; i++) {
        weeklySheet.appendRow(values[i]);
        logSheet.appendRow(values[i]);
    }

    dailySheet.getRange(2, 1, lastRow - 1, 6).clearContent();
}

function getStatusColor(status) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complet')) return '#90EE90';
    if (statusLower.includes('progress')) return '#FFE4B5';
    if (statusLower.includes('block') || statusLower.includes('road')) return '#FFB6C1';
    return '#FFFFFF';
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function signature() {
    return `
    Thanks & Regards<br>
    <span style="color: #1a73e8; font-weight: bold;">Sarath Krishnan P V</span><br>
    <span style="color: #0066cc; font-weight: bold;">Jr. Software Engineer</span><br><br>
    
    <div style="font-family: Arial, sans-serif;">
        <img src="https://ateamsoftsolutions.com/wp-content/uploads/2023/08/Ateam-logo-2.png" alt="ATEAM INFOSOFT SOLUTIONS" style="height: 40px; margin-bottom: 10px;"><br>
        <strong style="font-size: 14px;">M: (+91) 9074539022</strong><br>
        <strong style="font-size: 14px; color: #333;">ATEAM INFOSOFT SOLUTIONS</strong><br>
        <span style="font-size: 12px; color: #666;">Technopark Trivandrum, India</span><br><br>
        
        <a href="https://www.facebook.com/ateamsoftsolutions" style="text-decoration: none; margin-right: 10px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" style="width: 20px; height: 20px;">
        </a>
        <a href="https://www.linkedin.com/company/ateam-soft-solutions" style="text-decoration: none; margin-right: 10px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" style="width: 20px; height: 20px;">
        </a>
        <a href="https://twitter.com/ateamsoftsolutions" style="text-decoration: none; margin-right: 10px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg" alt="Twitter" style="width: 20px; height: 20px;">
        </a>
        <a href="https://www.instagram.com/ateamsoftsolutions" style="text-decoration: none;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="width: 20px; height: 20px;">
        </a>
    </div>
  `;
}

function createSuccessResponse(message) {
    return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: message })
    ).setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(error) {
    return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: error })
    ).setMimeType(ContentService.MimeType.JSON);
}

// ============= TEST FUNCTIONS (SAFE - ONLY SENDS TO YOU) =============

/**
 * SAFE TEST - Daily Report (ONLY sends to you, NO management!)
 */
function testDailyReport() {
    const TEST_EMAIL = 'sarath.krishnan@ateamsoftsolutions.com';

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(DAILY_SHEET_NAME);

    if (!sheet) {
        console.error(`Sheet '${DAILY_SHEET_NAME}' not found.`);
        return;
    }

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        console.log("No data to test. Please add some data to Sheet1 first.");
        return;
    }

    const dataRange = sheet.getRange(1, 1, lastRow, 6);
    const values = dataRange.getValues();
    const taskGroups = groupByTaskDaily(values);

    let totalHours = 0;
    for (let i = 1; i < values.length; i++) {
        totalHours += parseFloat(values[i][3]) || 0;
    }

    const reportDate = formatDate(new Date());
    const subject = `[TEST] ${PROJECT_NAME} | Daily Status Update | ${reportDate}`;
    const htmlBody = generateDailyReportHTML(taskGroups, reportDate, totalHours);

    // ONLY TO YOU - NO CC!
    MailApp.sendEmail({
        to: TEST_EMAIL,
        subject: subject,
        htmlBody: htmlBody
    });

    console.log(`✅ TEST email sent to ${TEST_EMAIL} ONLY (no management CC)`);
    console.log(`⚠️ Sheet NOT cleared (this is just a test)`);
}

/**
 * SAFE TEST - Weekly Report (ONLY sends to you, NO management!)
 */
function testWeeklyReport() {
    const TEST_EMAIL = 'sarath.krishnan@ateamsoftsolutions.com';

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(WEEKLY_SHEET_NAME);

    if (!sheet) {
        console.error(`Sheet '${WEEKLY_SHEET_NAME}' not found.`);
        return;
    }

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        console.log("No data to test. Please add some data to Sheet2 first.");
        return;
    }

    const dataRange = sheet.getRange(1, 1, lastRow, 6);
    const values = dataRange.getValues();

    const startDate = formatDate(values[1][0]);
    const endDate = formatDate(values[values.length - 1][0]);
    const dateRange = `${startDate} - ${endDate}`;

    const taskGroups = groupByTaskWeekly(values);

    const subject = `[TEST] ${PROJECT_NAME} | Weekly Status Update | ${dateRange}`;
    const htmlBody = generateWeeklyReportHTML(taskGroups, dateRange);

    // ONLY TO YOU - NO CC!
    MailApp.sendEmail({
        to: TEST_EMAIL,
        subject: subject,
        htmlBody: htmlBody
    });

    console.log(`✅ TEST email sent to ${TEST_EMAIL} ONLY (no management CC)`);
    console.log(`⚠️ Sheet NOT cleared (this is just a test)`);
}

/**
 * Test task commit (doesn't send any email)
 */
function testTaskCommit() {
    const testData = {
        taskName: "Test Task 1",
        commitMessage: "Fixed authentication bug",
        time: 2.5,
        status: "In Progress",
        branch: "feature/auth"
    };

    console.log(handleTaskCommit(testData).getContent());
}
