/**
 * DSR SYSTEM - Daily/Weekly Task Reports
 * Matches your exact sheet format
 */

// ============= CONFIGURATION =============
const DAILY_SHEET_NAME = 'Sheet1';   // Daily commits
const WEEKLY_SHEET_NAME = 'Sheet2';  // Weekly accumulation
const LOG_SHEET_NAME = 'Sheet3';     // Archive/Logs
const TASKS_SHEET_NAME = 'Tasks';    // Task management (optional)

const PROJECT_NAME = 'My Property Journey';
const MIN_HOURS_FOR_DAILY_REPORT = 6; // Don't send if less than 6 hours

// Email configuration
const debug = false;
const RECIPIENT_EMAIL = debug ? 'sarath.krishnan@ateamsoftsolutions.com' : 'sarin@ateamsoftsolutions.com';
const CC_DAILY = debug ? undefined : 'rakesh@ateamsoftsolutions.com, sanoj@ateamsoftsolutions.com, director@ateamsoftsolutions.com';
const CC_WEEKLY = debug ? undefined : 'rakesh@ateamsoftsolutions.com, sanoj@ateamsoftsolutions.com';

// ============= WEBHOOK ENDPOINTS =============

/**
 * Main webhook - receives Git commit data
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // Handle task-based commit
        if (data.taskName) {
            return handleTaskCommit(data);
        }

        return createErrorResponse('Invalid data format');
    } catch (error) {
        return createErrorResponse(error.toString());
    }
}

/**
 * GET endpoint - for task fetching
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

// ============= TASK COMMIT HANDLER =============

/**
 * Handle incoming task commit
 * Appends to Sheet1: [Date, Task, Description, Hours, Status, Git Branch]
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

    // Append to Sheet1: [Date, Task, Description, Hours, Status, Git Branch]
    sheet.appendRow([currentDate, taskName, commitMessage, hours, status, branch]);

    return createSuccessResponse('Task logged successfully');
}

/**
 * Get all tasks from Tasks sheet (optional - for task management)
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
            status: values[i][2],
            branch: values[i][3]
        });
    }

    return ContentService.createTextOutput(
        JSON.stringify({ success: true, tasks: tasks })
    ).setMimeType(ContentService.MimeType.JSON);
}

// ============= DAILY REPORT (11:55 PM) =============

/**
 * Send daily status report
 * Sheet1 format: [Date, Task, Description, Hours, Status, Git Branch]
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
        cc: CC_DAILY,
        subject: subject,
        htmlBody: htmlBody
    });

    console.log(`Daily report sent to ${RECIPIENT_EMAIL}`);

    // Move data and clear sheet
    moveDataToWeeklyAndLogs(sheet, values, lastRow);
}

/**
 * Group commits by task name (Daily sheet)
 * Input: [Date, Task, Description, Hours, Status, Git Branch]
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

        if (description) {
            taskMap[taskName].descriptions.push(description);
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
        const descriptionsHTML = taskData.descriptions.map(d => d).join('<br>');
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

/**
 * Get status color based on status text
 */
function getStatusColor(status) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed')) return '#90EE90'; // Light green
    if (statusLower.includes('progress')) return '#FFE4B5'; // Light yellow/moccasin
    if (statusLower.includes('block') || statusLower.includes('road')) return '#FFB6C1'; // Light red/pink
    return '#E0E0E0'; // Gray
}

/**
 * Move data to weekly and logs, then clear daily sheet
 * Daily format: [Date, Task, Description, Hours, Status, Git Branch]
 * Weekly format: [Date, Task, Description, Hours, Status, Git Branch]
 */
function moveDataToWeeklyAndLogs(dailySheet, values, lastRow) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const weeklySheet = spreadsheet.getSheetByName(WEEKLY_SHEET_NAME);
    const logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME);

    // Copy to weekly and logs (skip header) - already has date
    for (let i = 1; i < values.length; i++) {
        const date = values[i][0];
        const task = values[i][1];
        const description = values[i][2];
        const hours = values[i][3];
        const status = values[i][4];
        const branch = values[i][5];

        // Weekly/Log format: [Date, Task, Description, Hours, Status, Git Branch]
        const row = [date, task, description, hours, status, branch];

        if (weeklySheet) {
            weeklySheet.appendRow(row);
        }

        if (logSheet) {
            logSheet.appendRow(row);
        }
    }

    // Clear daily sheet (keep header)
    if (lastRow > 1) {
        dailySheet.getRange(2, 1, lastRow - 1, 6).clearContent();
    }

    console.log("Data moved to Weekly and Logs. Daily sheet cleared.");
}

// ============= WEEKLY REPORT (Sunday 8 PM) =============

/**
 * Send weekly status report
 * Sheet2 format: [Date, Task, Description, Hours, Status, Git Branch]
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

    // Get all data: [Date, Task, Description, Hours, Status, Git Branch]
    const dataRange = sheet.getRange(1, 1, lastRow, 6);
    const values = dataRange.getValues();

    // Get date range
    const startDate = formatDate(values[1][0]);
    const endDate = formatDate(values[values.length - 1][0]);
    const dateRange = `${startDate} - ${endDate}`;

    // Group by task
    const taskGroups = groupByTaskWeekly(values);

    // Generate email
    const subject = `${PROJECT_NAME} | Weekly Status Update | ${dateRange}`;
    const htmlBody = generateWeeklyReportHTML(taskGroups, dateRange);

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
        sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
    }

    console.log("Weekly sheet cleared.");
}

/**
 * Group commits by task name (Weekly sheet)
 * Input: [Date, Task, Description, Hours, Status, Git Branch]
 */
function groupByTaskWeekly(values) {
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
                dates: [],
                descriptions: [],
                status: status,
                branch: branch,
                hours: 0
            };
        }

        if (description) {
            taskMap[taskName].descriptions.push(description);
        }

        if (date) {
            const dateStr = formatDate(date);
            if (!taskMap[taskName].dates.includes(dateStr)) {
                taskMap[taskName].dates.push(dateStr);
            }
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
 * Generate weekly report HTML
 */
function generateWeeklyReportHTML(taskGroups, dateRange) {
    // Calculate total hours
    let totalHours = 0;
    for (const [_, taskData] of Object.entries(taskGroups)) {
        totalHours += taskData.hours;
    }

    let html = `
    <p>Hi Team,</p>
    <p>This is the weekly status update for <strong>${dateRange}</strong>:</p>
    
    <table style="width:100%; border-collapse: collapse; background-color: #d4edda; margin-top: 20px;">
      <tr>
        <td colspan="4" style="padding: 12px; border: 1px solid #666; background-color: #a8d5ba;">
          <strong>Project Name: ${PROJECT_NAME}</strong>
        </td>
        <td colspan="2" style="padding: 12px; border: 1px solid #666; text-align: right; background-color: #a8d5ba;">
          <strong>Date: ${dateRange}</strong>
        </td>
      </tr>
      <tr style="background-color: #a8d5ba;">
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 15%;">Task</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 40%;">Description</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: center; width: 12%;">Status</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: left; width: 13%;">Git Branch</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: center; width: 10%;">Dates</th>
        <th style="padding: 10px; border: 1px solid #666; text-align: center; width: 10%;">Hours</th>
      </tr>
  `;

    // Add task rows
    for (const [taskName, taskData] of Object.entries(taskGroups)) {
        const descriptionsHTML = taskData.descriptions.map(d => d).join('<br>');
        const statusColor = getStatusColor(taskData.status);
        const datesHTML = taskData.dates.join('<br>');

        html += `
      <tr>
        <td style="padding: 10px; border: 1px solid #666; vertical-align: top; background-color: #ffffff;">
          <strong>${taskName}</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #666; background-color: #ffffff;">
          ${descriptionsHTML}
        </td>
        <td style="padding: 10px; border: 1px solid #666; text-align: center; background-color: ${statusColor};">
          ${taskData.status}
        </td>
        <td style="padding: 10px; border: 1px solid #666; font-family: monospace; background-color: #ffffff;">
          ${taskData.branch}
        </td>
        <td style="padding: 10px; border: 1px solid #666; text-align: center; font-size: 11px; background-color: #ffffff;">
          ${datesHTML}
        </td>
        <td style="padding: 10px; border: 1px solid #666; text-align: center; background-color: #ffffff;">
          ${taskData.hours.toFixed(1)} hrs
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
    const sign = `<font color="#888888"><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature"><div dir="ltr"><font color="#888888">Thanks &amp;&nbsp; Regards</font><br style="color:rgb(136,136,136)"><div dir="ltr" style="color:rgb(136,136,136)"><div dir="ltr"><div style="color:rgb(34,34,34)"><table cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:collapse;color:rgb(68,68,68);width:480px;font-size:9pt;font-family:Arial,sans-serif;line-height:14px"><tbody><tr><td colspan="2" style="padding:0px 0px 5px;width:480px;color:rgb(60,60,59)"><span style="font-size:11pt;font-family:Tahoma,sans-serif"><b>Sarath Krishnan P V</b></span></td></tr><tr><td colspan="2" style="padding:0px 0px 5px;width:480px;color:rgb(23,147,210)"><span style="font-family:Tahoma,sans-serif;font-size:11pt"><b>Jr. Software Engineer</b></span></td></tr></tbody></table><br></div><div style="color:rgb(34,34,34)"><table cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:collapse;color:rgb(68,68,68);width:480px;font-size:9pt;font-family:Arial,sans-serif;line-height:14px"><tbody><tr><td valign="middle" style="padding:0px;width:120px;vertical-align:middle"><img width="96" height="84" src="https://ci3.googleusercontent.com/mail-sig/AIorK4xkcWH4r108JaejYrogdeQVGgI_IwdRbJ8WIeeLooIo540MPjnBQPU7vYfQHqqNi0iPzmMK9AaUPOcO" class="CToWUd" data-bit="iit"><br></td><td valign="middle" style="padding:0px;width:360px;color:rgb(19,19,19);vertical-align:middle"><table cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:collapse;background-color:transparent"><tbody><tr></tr><tr><td style="padding:1px"><span style="font-family:Tahoma,sans-serif;font-size:9pt">M: (+91) 9074539022</span></td></tr><tr><td style="font-family:Tahoma,sans-serif;padding:1px;font-size:9pt"><a href="https://www.ateamsoftsolutions.com/" style="color:rgb(51,122,183);background-color:transparent;font-family:Arial,sans-serif;font-size:9pt" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.ateamsoftsolutions.com/&amp;source=gmail&amp;ust=1755068665885000&amp;usg=AOvVaw15ef4T6i_BAJBDoZhxE6fJ"><span style="font-family:Tahoma,sans-serif;font-size:9pt;color:rgb(19,19,19)"><b>ATEAM INFOSOFT SOLUTIONS</b></span></a></td></tr><tr><td style="padding:1px"><span style="font-family:Tahoma,sans-serif;font-size:9pt">Technopark Trivandrum, India</span></td></tr><tr><td style="padding:2px 0px 0px 1px"><span style="display:inline-block;height:23px"><a href="https://www.facebook.com/ateamindian" style="color:rgb(51,122,183);background-color:transparent" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.facebook.com/ateamindian&amp;source=gmail&amp;ust=1755068665885000&amp;usg=AOvVaw3qcbbgA80h12Oxj95cbh5X"><img alt="Facebook icon" border="0" width="23" height="23" src="https://ci3.googleusercontent.com/meips/ADKq_NZ4BXWOx-X49BUzjtz3pXW7BICmiFklHl2piMSD4avchXw3-EQ1FkjbPFB2qYwq0nF6P9LlMNmDQLTlmM_tUF--XMYdPNVyHeZdEuORUFfP_151ae6EWaWceiTQNYpDpUTD_OfL7dNLaYq_zoFe=s0-d-e1-ft#https://codetwocdn.azureedge.net/images/mail-signatures/generator-dm/compact-logo/fb.png" style="border:0px;vertical-align:middle;height:23px;width:23px" class="CToWUd" data-bit="iit"></a>&nbsp;&nbsp;<a href="https://www.linkedin.com/company/ateamindia/" style="color:rgb(51,122,183);background-color:transparent" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.linkedin.com/company/ateamindia/&amp;source=gmail&amp;ust=1755068665885000&amp;usg=AOvVaw3lrQDUD54Xm9Dcx1At6Xvo"><img alt="LinkedIn icon" border="0" width="23" height="23" src="https://ci3.googleusercontent.com/meips/ADKq_Na8jpvH5iF2wEzKszIEiihftFWlQ6X-oXO1qu7StRyGpNlUby3nJvEPI2IR_X6G06t8TcT-IqgTtU_zyFxJzNebjD6P4NPcMa2iXiRWP4wBSSvD6qeQGFzrYWsMEqFW9PyjWAhZjawDOiafHycY=s0-d-e1-ft#https://codetwocdn.azureedge.net/images/mail-signatures/generator-dm/compact-logo/ln.png" style="border:0px;vertical-align:middle;height:23px;width:23px" class="CToWUd" data-bit="iit"></a>&nbsp;&nbsp;<a href="https://twitter.com/IndiaAteam" style="color:rgb(51,122,183);background-color:transparent" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://twitter.com/IndiaAteam&amp;source=gmail&amp;ust=1755068665885000&amp;usg=AOvVaw3g-UKFArPMSRyqLTczygI1"><img alt="Twitter icon" border="0" width="23" height="23" src="https://ci3.googleusercontent.com/meips/ADKq_NbAdMo9BRSV9_Ryoqv0WYshbbMtZTKEokGihGVFV5KK5T_va0LOgiK9FYfSry2xxPP-ZqH7uD73_LzBCrEhIi93RJ_BNo34sUQGIQkPJs6gX3m5vtB0HGA2vmoDR5g8Cf412PslMeI3l7r2c7A8=s0-d-e1-ft#https://codetwocdn.azureedge.net/images/mail-signatures/generator-dm/compact-logo/tt.png" style="border:0px;vertical-align:middle;height:23px;width:23px" class="CToWUd" data-bit="iit"></a>&nbsp;&nbsp;<a href="https://www.instagram.com/ateamindia/" style="color:rgb(51,122,183);background-color:transparent" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.instagram.com/ateamindia/&amp;source=gmail&amp;ust=1755068665885000&amp;usg=AOvVaw30XCxKYqH7py28cW0cpT6I"><img alt="Instagram icon" border="0" width="23" height="23" src="https://ci3.googleusercontent.com/meips/ADKq_NYep46D2c2Z4Ojgm-Yaa6SBEQY17KBTmGcfdltv3U2qvBleT4p-MbPS1vt0xEnZ-usA_5l0DemnfKxRnzrNB70H_KI7tnzdkdpdbVJccl0U4jj-wfwuTGoC3PoYf2RonSBUCrXowR0Ln-mOpf9G=s0-d-e1-ft#https://codetwocdn.azureedge.net/images/mail-signatures/generator-dm/compact-logo/it.png" style="border:0px;vertical-align:middle;height:23px;width:23px" class="CToWUd" data-bit="iit"></a>&nbsp;&nbsp;</span></td></tr></tbody></table></td></tr></tbody></table></div></div></div></div></div></font>`;

    return sign;
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

function testTaskCommit() {
    const testData = {
        taskName: "Test Task 1",
        commitMessage: "Fixed authentication bug",
        status: "In Progress",
        branch: "feature/auth"
    };

    console.log(handleTaskCommit(testData).getContent());
}
