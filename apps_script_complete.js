/**
 * COMPLETE DSR SYSTEM - Task Manager + Daily/Weekly Reports
 * Combines task management with automated status reporting
 */

// ============= CONFIGURATION =============
const DAILY_SHEET_NAME = 'Sheet1';   // Daily commits
const WEEKLY_SHEET_NAME = 'Sheet2';  // Weekly accumulation
const LOG_SHEET_NAME = 'Sheet3';     // Archive/Logs
const TASKS_SHEET_NAME = 'Tasks';    // Task management

const PROJECT_NAME = 'My Property Journey';
const MIN_HOURS_FOR_DAILY_REPORT = 6; // Don't send if less than 6 hours

// Email configuration
const debug = false;
const RECIPIENT_EMAIL = debug ? 'sarath.krishnan@ateamsoftsolutions.com' : 'sarin@ateamsoftsolutions.com';
const CC_DAILY = debug ? undefined : 'rakesh@ateamsoftsolutions.com, sanoj@ateamsoftsolutions.com, director@ateamsoftsolutions.com';
const CC_WEEKLY = debug ? undefined : 'rakesh@ateamsoftsolutions.com, sanoj@ateamsoftsolutions.com';

// ============= WEBHOOK ENDPOINTS =============

/**
 * Main webhook - handles both task commits and daily commits
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // Route to appropriate handler based on data structure
        if (data.taskName) {
            // New task-based commit
            return handleTaskCommit(data);
        } else if (data.title && data.date) {
            // Legacy daily commit
            return handleDailyCommit(data);
        } else {
            return createErrorResponse('Invalid data format');
        }
    } catch (error) {
        return createErrorResponse(error.toString());
    }
}

/**
 * GET endpoint - fetch tasks
 */
function doGet(e) {
    try {
        const action = e.parameter.action;

        if (action === 'getTasks') {
            return getTasks();
        }

        return ContentService.createTextOutput(
            JSON.stringify({ success: true, message: 'DSR Task Manager API' })
        ).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return createErrorResponse(error.toString());
    }
}

// ============= TASK MANAGEMENT (New System) =============

/**
 * Handle task-based commit (new system)
 */
function handleTaskCommit(data) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(TASKS_SHEET_NAME);

    // Create Tasks sheet if it doesn't exist
    if (!sheet) {
        sheet = spreadsheet.insertSheet(TASKS_SHEET_NAME);
        sheet.appendRow(['Task Name', 'Description', 'Date', 'Time (hrs)', 'Branch', 'Status', 'Commit SHA']);
    }

    const taskName = data.taskName;
    const commitMessage = data.commitMessage;
    const time = parseFloat(data.time) || 1.0;
    const branch = data.branch || '';
    const status = data.status || 'In Progress';
    const sha = data.sha || 'pending';
    const date = new Date();

    // Find existing task (case-insensitive)
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let taskRow = -1;

    for (let i = 1; i < values.length; i++) {
        if (values[i][0].toLowerCase() === taskName.toLowerCase()) {
            taskRow = i + 1;
            break;
        }
    }

    if (taskRow > 0) {
        // Update existing task
        const existingDescription = sheet.getRange(taskRow, 2).getValue();
        const existingTime = parseFloat(sheet.getRange(taskRow, 4).getValue()) || 0;

        // Append commit as bullet point
        const newDescription = existingDescription + '\n• ' + commitMessage;
        const newTime = existingTime + time;

        sheet.getRange(taskRow, 2).setValue(newDescription);
        sheet.getRange(taskRow, 3).setValue(date);
        sheet.getRange(taskRow, 4).setValue(newTime);
        sheet.getRange(taskRow, 5).setValue(branch);
        sheet.getRange(taskRow, 6).setValue(status);
        sheet.getRange(taskRow, 7).setValue(sha);

        return createSuccessResponse('Task updated: ' + taskName);
    } else {
        // Create new task
        sheet.appendRow([
            taskName,
            '• ' + commitMessage,
            date,
            time,
            branch,
            status,
            sha
        ]);

        return createSuccessResponse('Task created: ' + taskName);
    }
}

/**
 * Get all tasks
 */
function getTasks() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(TASKS_SHEET_NAME);

    if (!sheet) {
        return ContentService.createTextOutput(
            JSON.stringify({ success: true, tasks: [] })
        ).setMimeType(ContentService.MimeType.JSON);
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const tasks = [];

    for (let i = 1; i < values.length; i++) {
        tasks.push({
            taskName: values[i][0],
            description: values[i][1],
            date: values[i][2],
            time: values[i][3],
            branch: values[i][4],
            status: values[i][5],
            sha: values[i][6]
        });
    }

    return ContentService.createTextOutput(
        JSON.stringify({ success: true, tasks: tasks })
    ).setMimeType(ContentService.MimeType.JSON);
}

// ============= DAILY COMMIT LOGGING (Legacy System) =============

/**
 * Handle daily commit (legacy system - for backwards compatibility)
 */
function handleDailyCommit(data) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(DAILY_SHEET_NAME);

    if (!sheet) {
        return createErrorResponse(`Sheet '${DAILY_SHEET_NAME}' not found`);
    }

    // Parse date
    let dateValue = data.date;
    if (typeof data.date === 'string' && data.date.includes('/')) {
        const parts = data.date.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            dateValue = new Date(year, month, day);
        }
    }

    // Append row: [Date, Title, Description, Hours, SHA]
    const row = [
        dateValue,
        data.title || "",
        data.description || "",
        data.hours || 1.0,
        data.sha || "pending"
    ];

    sheet.appendRow(row);

    return createSuccessResponse('Commit logged successfully');
}

// ============= DAILY REPORT (11:55 PM) =============

/**
 * Send daily status report
 * Triggers: Daily at 11:55 PM
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

    // Get all data
    const dataRange = sheet.getRange(1, 1, lastRow, 5);
    const values = dataRange.getValues();

    // Calculate total hours
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

    // Group data by task (title)
    const taskGroups = groupByTask(values);

    // Generate email
    const reportDate = formatDate(new Date());
    const subject = `${PROJECT_NAME} | Daily Status Update | ${reportDate}`;
    const htmlBody = generateDailyReportHTML(taskGroups, reportDate, totalHours);

    // Send email
    MailApp.sendEmail({
        to: RECIPIENT_EMAIL,
        cc: CC_DAILY,
        subject: subject,
        htmlBody: htmlBody
    });

    console.log(`Daily report sent to ${RECIPIENT_EMAIL}`);

    // Move data and clear sheet
    moveDataToWeeklyAndLogs(sheet, values, lastRow);
}

/**
 * Group commits by task name
 */
function groupByTask(values) {
    const taskMap = {};

    for (let i = 1; i < values.length; i++) {
        const taskName = values[i][1] || 'Untitled Task';
        const description = values[i][2] || '';
        const hours = values[i][3] || 0;
        const status = determineStatus(values[i]);
        const branch = values[i][4] || 'N/A';

        if (!taskMap[taskName]) {
            taskMap[taskName] = {
                descriptions: [],
                hours: 0,
                status: status,
                branch: branch
            };
        }

        if (description) {
            taskMap[taskName].descriptions.push(description);
        }
        taskMap[taskName].hours += parseFloat(hours);
    }

    return taskMap;
}

/**
 * Determine task status (you can customize this logic)
 */
function determineStatus(row) {
    // Default to "In Progress" - customize as needed
    return 'In Progress';
}

/**
 * Generate daily report HTML in new style
 */
function generateDailyReportHTML(taskGroups, date, totalHours) {
    let html = `
    <p>Hi Team,</p>
    <p>Please find the daily status update for <strong>${date}</strong>:</p>
    
    <table style="width:100%; border-collapse: collapse; background-color: #d4edda; margin-top: 20px;">
      <tr>
        <td colspan="2" style="padding: 12px; border: 1px solid #999;">
          <strong>Project Name: ${PROJECT_NAME}</strong>
        </td>
        <td colspan="2" style="padding: 12px; border: 1px solid #999; text-align: right;">
          <strong>Date: ${date}</strong>
        </td>
      </tr>
      <tr style="background-color: #a8d5ba;">
        <th style="padding: 10px; border: 1px solid #999; text-align: left; width: 20%;">Task</th>
        <th style="padding: 10px; border: 1px solid #999; text-align: left; width: 45%;">Description</th>
        <th style="padding: 10px; border: 1px solid #999; text-align: center; width: 15%;">Status</th>
        <th style="padding: 10px; border: 1px solid #999; text-align: left; width: 20%;">Git Branch / PR Link</th>
      </tr>
  `;

    // Add task rows
    for (const [taskName, taskData] of Object.entries(taskGroups)) {
        const descriptionsHTML = taskData.descriptions.map(d => `• ${d}`).join('<br>');
        const statusColor = getStatusColor(taskData.status);

        html += `
      <tr>
        <td style="padding: 10px; border: 1px solid #999; vertical-align: top;">
          <strong>${taskName}</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #999;">
          ${descriptionsHTML}
        </td>
        <td style="padding: 10px; border: 1px solid #999; text-align: center; background-color: ${statusColor};">
          ${taskData.status}
        </td>
        <td style="padding: 10px; border: 1px solid #999; font-family: monospace;">
          ${taskData.branch}
        </td>
      </tr>
    `;
    }

    html += `
      <tr>
        <td colspan="3" style="padding: 10px; border: 1px solid #999; text-align: right;">
          <strong>Total Hours Worked:</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #999; text-align: center;">
          <strong>${totalHours.toFixed(1)} hrs</strong>
        </td>
      </tr>
    </table>
    
    <br><br>--<br>
    ${signature()}
  `;

    return html;
}

/**
 * Get status color
 */
function getStatusColor(status) {
    if (status.toLowerCase().includes('completed')) return '#90EE90';
    if (status.toLowerCase().includes('progress')) return '#FFE5B4';
    if (status.toLowerCase().includes('block')) return '#FFB6C1';
    return '#E0E0E0';
}

/**
 * Move data to weekly and logs, then clear daily sheet
 */
function moveDataToWeeklyAndLogs(dailySheet, values, lastRow) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const weeklySheet = spreadsheet.getSheetByName(WEEKLY_SHEET_NAME);
    const logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME);

    // Copy to weekly and logs (skip header)
    const dataToCopy = values.slice(1);

    if (weeklySheet) {
        dataToCopy.forEach(row => weeklySheet.appendRow(row));
    }

    if (logSheet) {
        dataToCopy.forEach(row => logSheet.appendRow(row));
    }

    // Clear daily sheet (keep header)
    if (lastRow > 1) {
        dailySheet.getRange(2, 1, lastRow - 1, 5).clearContent();
    }

    console.log("Data moved to Weekly and Logs. Daily sheet cleared.");
}

// ============= WEEKLY REPORT (Sunday 8 PM) =============

/**
 * Send weekly status report
 * Triggers: Every Sunday at 8 PM
 */
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

    // Get all data
    const dataRange = sheet.getRange(1, 1, lastRow, 5);
    const values = dataRange.getValues();

    // Calculate total hours
    let totalHours = 0;
    for (let i = 1; i < values.length; i++) {
        totalHours += parseFloat(values[i][3]) || 0;
    }

    // Get date range
    const startDate = formatDate(values[1][0]);
    const endDate = formatDate(values[values.length - 1][0]);
    const dateRange = `${startDate} - ${endDate}`;

    // Group data by task
    const taskGroups = groupByTask(values);

    // Generate email
    const subject = `${PROJECT_NAME} | Weekly Status Update | ${dateRange}`;
    const htmlBody = generateWeeklyReportHTML(taskGroups, dateRange, totalHours);

    // Send email
    MailApp.sendEmail({
        to: RECIPIENT_EMAIL,
        cc: CC_WEEKLY,
        subject: subject,
        htmlBody: htmlBody
    });

    console.log(`Weekly report sent to ${RECIPIENT_EMAIL}`);

    // Clear weekly sheet after sending
    if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 5).clearContent();
    }

    console.log("Weekly sheet cleared.");
}

/**
 * Generate weekly report HTML
 */
function generateWeeklyReportHTML(taskGroups, dateRange, totalHours) {
    let html = `
    <p>Hi Team,</p>
    <p>This is the weekly status update for <strong>${dateRange}</strong>:</p>
    
    <table style="width:100%; border-collapse: collapse; background-color: #d4edda; margin-top: 20px;">
      <tr>
        <td colspan="3" style="padding: 12px; border: 1px solid #999;">
          <strong>Project Name: ${PROJECT_NAME}</strong>
        </td>
        <td colspan="2" style="padding: 12px; border: 1px solid #999; text-align: right;">
          <strong>Date: ${dateRange}</strong>
        </td>
      </tr>
      <tr style="background-color: #a8d5ba;">
        <th style="padding: 10px; border: 1px solid #999; text-align: left; width: 20%;">Task</th>
        <th style="padding: 10px; border: 1px solid #999; text-align: left; width: 40%;">Description</th>
        <th style="padding: 10px; border: 1px solid #999; text-align: center; width: 15%;">Status</th>
        <th style="padding: 10px; border: 1px solid #999; text-align: left; width: 15%;">Git Branch</th>
        <th style="padding: 10px; border: 1px solid #999; text-align: center; width: 10%;">Hours</th>
      </tr>
  `;

    // Add task rows
    for (const [taskName, taskData] of Object.entries(taskGroups)) {
        const descriptionsHTML = taskData.descriptions.map(d => `• ${d}`).join('<br>');
        const statusColor = getStatusColor(taskData.status);

        html += `
      <tr>
        <td style="padding: 10px; border: 1px solid #999; vertical-align: top;">
          <strong>${taskName}</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #999;">
          ${descriptionsHTML}
        </td>
        <td style="padding: 10px; border: 1px solid #999; text-align: center; background-color: ${statusColor};">
          ${taskData.status}
        </td>
        <td style="padding: 10px; border: 1px solid #999; font-family: monospace;">
          ${taskData.branch}
        </td>
        <td style="padding: 10px; border: 1px solid #999; text-align: center;">
          ${taskData.hours.toFixed(1)} hrs
        </td>
      </tr>
    `;
    }

    html += `
      <tr>
        <td colspan="4" style="padding: 10px; border: 1px solid #999; text-align: right;">
          <strong>Total Hours Worked:</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #999; text-align: center;">
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

/**
 * Format date as DD/MM/YYYY
 */
function formatDate(date) {
    if (typeof date === 'string' && date.includes('/')) {
        return date;
    }

    if (date && typeof date.getDate === 'function') {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return '';
}

/**
 * Email signature
 */
function signature() {
    return `
    <div style="font-family: Arial, sans-serif; color: #555;">
      <p>Thanks & Regards,<br>
      <strong>Sarath Krishnan P V</strong><br>
      Software Engineer<br>
      A-Team Software Solutions</p>
    </div>
  `;
}

/**
 * Create success response
 */
function createSuccessResponse(message) {
    return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: message })
    ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create error response
 */
function createErrorResponse(error) {
    return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: error })
    ).setMimeType(ContentService.MimeType.JSON);
}

// ============= TEST FUNCTIONS =============

function testDailyReport() {
    sendDailyReport();
}

function testWeeklyReport() {
    sendWeeklyReport();
}

function testTaskCommit() {
    const testData = {
        taskName: "Test Task 1",
        commitMessage: "Fixed authentication bug",
        time: 2.5,
        branch: "feature/auth",
        status: "In Progress",
        sha: "abc123"
    };

    console.log(handleTaskCommit(testData).getContent());
}
