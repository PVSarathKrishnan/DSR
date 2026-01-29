/**
 * Add this function to your existing Google Apps Script
 * This creates a webhook endpoint for the Git commit logger
 */

// Configuration - match this with your sheet name
const DAILY_SHEET_NAME = "Daily"; // Change this if your sheet name is different

/**
 * Web App Entry Point - handles POST requests from Git hook
 * Deploy this as a Web App with "Anyone" access
 */
function doPost(e) {
    try {
        // Parse the incoming JSON data
        const data = JSON.parse(e.postData.contents);

        // Validate required fields
        if (!data.date || !data.title) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: "Missing required fields: date and title"
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // Get the active spreadsheet
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = spreadsheet.getSheetByName(DAILY_SHEET_NAME);

        if (!sheet) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: `Sheet '${DAILY_SHEET_NAME}' not found`
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // Prepare row data  [Date, Title, Description, Hours, SHA]
        const row = [
            data.date || "",
            data.title || "",
            data.description || "",
            data.hours || 1.0,
            data.sha || "pending"
        ];

        // Append the row
        sheet.appendRow(row);

        // Return success response
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: "Commit logged successfully",
            row: row
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Return error response
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Test function to verify webhook works
 * Run this from Apps Script editor to test
 */
function testWebhook() {
    const testData = {
        date: "29/01/2026",
        title: "[TEST] Webhook Test",
        description: "Testing the webhook integration",
        hours: 0.5,
        sha: "test-sha-123"
    };

    const mockEvent = {
        postData: {
            contents: JSON.stringify(testData)
        }
    };

    const result = doPost(mockEvent);
    Logger.log(result.getContent());
}
