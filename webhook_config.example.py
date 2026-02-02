"""
Webhook configuration for Git Commit Logger
IMPORTANT: Copy this file to your project root as webhook_config.py and update with your values
"""

# Apps Script Web App URL - Get this after deploying your Apps Script
# Format: https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
# Current deployed URL (Version 7 - Feb 2, 2026):
WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwy710fP4h3Kzb5J0KJFIpQ6Kh7xqhUlhlejLuouXas3-UWVBBmm8fhEU8l6pZcMu8CEQ/exec"

# Request timeout (seconds)
REQUEST_TIMEOUT = 10

# Sheet name (should match your Apps Script DAILY_SHEET_NAME)
SHEET_NAME = "Sheet1"  # Change to match your Google Sheet tab name

# Time Options (in hours)
TIME_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8]
DEFAULT_TIME = 1.0

# Date Format
DATE_FORMAT = "%d/%m/%Y"  # DD/MM/YYYY

# Colors for terminal output (ANSI codes)
COLOR_GREEN = '\033[92m'
COLOR_RED = '\033[91m'
COLOR_YELLOW = '\033[93m'
COLOR_BLUE = '\033[94m'
COLOR_CYAN = '\033[96m'
COLOR_BOLD = '\033[1m'
COLOR_RESET = '\033[0m'

# Emojis for visual feedback
EMOJI_PENCIL = '📝'
EMOJI_CHECK = '✅'
EMOJI_WARNING = '⚠️'
EMOJI_ERROR = '❌'
EMOJI_DIVIDER = '━'
