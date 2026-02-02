#!/usr/bin/env python3
"""
DSR Task Manager - PyQt5 Dialog (Updated Design)
Matches the mockup design with task dropdown, CRUD buttons, and time dropdown
"""

import sys
import json
import urllib.request
import urllib.error
from typing import Optional, Tuple

try:
    from PyQt5.QtWidgets import (
        QApplication, QDialog, QVBoxLayout, QHBoxLayout, QLabel,
        QLineEdit, QComboBox, QPushButton, QRadioButton,
        QButtonGroup, QTextEdit, QMessageBox, QInputDialog
    )
    from PyQt5.QtCore import Qt, QSize
    from PyQt5.QtGui import QFont, QIcon
    PYQT5_AVAILABLE = True
except ImportError:
    PYQT5_AVAILABLE = False


class TaskDialog(QDialog):
    """Modern task management dialog matching mockup"""
    
    def __init__(self, webhook_url: str, commit_msg: str, branch: str, default_time: float = 1.0):
        super().__init__()
        
        self.webhook_url = webhook_url
        self.commit_msg = commit_msg
        self.branch = branch
        self.default_time = default_time
        
        self.result = {
            'cancelled': True,
            'taskName': '',
            'commitMessage': '',
            'time': default_time,
            'branch': branch,
            'status': 'In Progress'
        }
        
        self.tasks = []
        self.init_ui()
        self.load_tasks()
    
    def init_ui(self):
        """Initialize clean, minimal, professional UI"""
        # Resolve paths relative to this script file
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        icons_dir = os.path.join(script_dir, 'icons')
        
        self.setWindowTitle('DSR Commit Logger')
        self.setMinimumWidth(700)
        self.setMinimumHeight(580)
        
        # Clean, minimal, professional styling
        # Replaces direct references to url(icons/...) with properly formatted paths
        # We need to inject the icons_dir into the stylesheet
        # For CSS, we usually need forward slashes
        css_icons_dir = icons_dir.replace('\\', '/')
        
        self.setStyleSheet(f"""
            QDialog {{
                background-color: #ffffff;
            }}
            
            QLabel {{
                color: #1f2937;
                font-size: 13px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }}
            QLabel[heading="true"] {{
                font-size: 13px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 8px;
            }}
            QLabel[title="true"] {{
                font-size: 20px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 24px;
            }}
            
            /* CLEAN COMBOBOX - BOTH TASK AND TIME */
            QComboBox {{
                padding: 11px 14px;
                padding-right: 36px;
                border: 1.5px solid #d1d5db;
                border-radius: 7px;
                background-color: #ffffff;
                color: #111827;
                font-size: 14px;
                font-weight: 500;
                min-height: 20px;
            }}
            QComboBox:hover {{
                border: 1.5px solid #9ca3af;
                background-color: #f9fafb;
            }}
            QComboBox:focus {{
                border: 1.5px solid #3b82f6;
                background-color: #ffffff;
                outline: none;
            }}
            QComboBox:disabled {{
                background-color: #f3f4f6;
                color: #9ca3af;
                border: 1.5px solid #e5e7eb;
            }}
            
            /* DROPDOWN BUTTON - WITH ICON */
            QComboBox::drop-down {{
                subcontrol-origin: padding;
                subcontrol-position: center right;
                width: 32px;
                border: none;
                border-left: 1.5px solid #d1d5db;
                border-top-right-radius: 7px;
                border-bottom-right-radius: 7px;
                background-color: #f9fafb;
                image: url({css_icons_dir}/arrow_down.svg);
                padding: 10px;
            }}
            QComboBox:hover::drop-down {{
                background-color: #f3f4f6;
            }}
            QComboBox:focus::drop-down {{
                background-color: #eff6ff;
                border-left: 1.5px solid #3b82f6;
            }}
            
            /* HIDE STANDARD DOWN ARROW to prevent duplicates */
            QComboBox::down-arrow {{
                image: none;
                border: none;
                width: 0;
                height: 0;
            }}
            
            /* FIX: DROPDOWN MENU - WHITE BACKGROUND */
            QComboBox QAbstractItemView {{
                background-color: #ffffff;
                color: #111827;
                selection-background-color: #3b82f6;
                selection-color: #ffffff;
                border: 1.5px solid #d1d5db;
                border-radius: 7px;
                padding: 5px;
                font-size: 14px;
                outline: none;
            }}
            QComboBox QAbstractItemView::item {{
                padding: 9px 12px;
                border-radius: 5px;
                color: #111827;
                background-color: transparent;
                min-height: 20px;
            }}
            QComboBox QAbstractItemView::item:hover {{
                background-color: #f3f4f6;
                color: #111827;
            }}
            QComboBox QAbstractItemView::item:selected {{
                background-color: #3b82f6;
                color: #ffffff;
            }}
            
            /* TEXT INPUTS */
            QLineEdit, QTextEdit {{
                padding: 11px 14px;
                border: 1.5px solid #d1d5db;
                border-radius: 7px;
                background-color: #ffffff;
                color: #111827;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }}
            QLineEdit:hover, QTextEdit:hover {{
                border: 1.5px solid #9ca3af;
            }}
            QLineEdit:focus, QTextEdit:focus {{
                border: 1.5px solid #3b82f6;
                outline: none;
            }}
            QTextEdit {{
                font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace;
            }}
            
            /* CLEAN BUTTON STYLING */
            QPushButton {{
                padding: 10px 18px;
                border-radius: 7px;
                font-size: 13px;
                font-weight: 600;
                min-height: 18px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }}
            
            /* MINIMAL CRUD BUTTONS - SUBTLE GRAY */
            QPushButton#new_btn, QPushButton#edit_btn, QPushButton#del_btn {{
                background-color: #f3f4f6;
                border: 1.5px solid #d1d5db;
                color: #374151;
            }}
            QPushButton#new_btn:hover, QPushButton#edit_btn:hover, QPushButton#del_btn:hover {{
                background-color: #e5e7eb;
                border: 1.5px solid #9ca3af;
                color: #1f2937;
            }}
            QPushButton#new_btn:pressed, QPushButton#edit_btn:pressed, QPushButton#del_btn:pressed {{
                background-color: #d1d5db;
            }}
            QPushButton#edit_btn:disabled, QPushButton#del_btn:disabled {{
                background-color: #f9fafb;
                color: #d1d5db;
                border: 1.5px solid #e5e7eb;
            }}
            
            /* ACTION BUTTONS */
            QPushButton#skip_btn, QPushButton#cancel_btn {{
                background-color: #ffffff;
                border: 1.5px solid #d1d5db;
                color: #374151;
            }}
            QPushButton#skip_btn:hover, QPushButton#cancel_btn:hover {{
                background-color: #f9fafb;
                border: 1.5px solid #9ca3af;
                color: #1f2937;
            }}
            QPushButton#skip_btn:pressed, QPushButton#cancel_btn:pressed {{
                background-color: #f3f4f6;
            }}
            
            /* SUBMIT BUTTON - ONLY BLUE ACCENT */
            QPushButton#submit_btn {{
                background-color: #3b82f6;
                border: none;
                color: #ffffff;
                font-weight: 700;
            }}
            QPushButton#submit_btn:hover {{
                background-color: #2563eb;
            }}
            QPushButton#submit_btn:pressed {{
                background-color: #1d4ed8;
            }}
            
            /* MESSAGE BOX BUTTONS - Fix for invisible buttons */
            QMessageBox QPushButton {{
                background-color: #ffffff;
                border: 1.5px solid #d1d5db;
                color: #374151;
                min-width: 80px;
                padding: 6px 16px;
            }}
            QMessageBox QPushButton:hover {{
                background-color: #f9fafb;
                border: 1.5px solid #9ca3af;
                color: #1f2937;
            }}
            QMessageBox QPushButton:pressed {{
                background-color: #f3f4f6;
            }}
            
            /* BASE RADIO BUTTON STYLE */
            QRadioButton {{
                font-size: 13px;
                font-weight: 500;
                spacing: 9px;
                color: #374151;
                padding: 5px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }}
            QRadioButton::indicator {{
                width: 18px;
                height: 18px;
                border-radius: 9px;
                border: 2px solid #d1d5db;
                background-color: #ffffff;
            }}
            QRadioButton::indicator:hover {{
                border: 2px solid #9ca3af;
            }}
            
            /* GREEN for In Progress */
            QRadioButton#in_progress::indicator:checked {{
                background-color: #10b981;
                border: 2px solid #10b981;
            }}
            
            /* ORANGE for Completed */
            QRadioButton#completed::indicator:checked {{
                background-color: #f59e0b;
                border: 2px solid #f59e0b;
            }}
            
            /* RED for Roadblock */
            QRadioButton#roadblock::indicator:checked {{
                background-color: #ef4444;
                border: 2px solid #ef4444;
            }}
        """)
        
        # Main layout
        layout = QVBoxLayout()
        layout.setContentsMargins(35, 30, 35, 30)
        layout.setSpacing(20)
        
        # Title - clean and simple
        title = QLabel('DSR Commit Logger')
        title.setProperty("title", True)
        layout.addWidget(title)
        
        # ===== TASK SECTION =====
        task_label = QLabel('Task *')
        task_label.setProperty("heading", True)
        layout.addWidget(task_label)
        
        # Task row with dropdown and buttons
        task_row = QHBoxLayout()
        task_row.setSpacing(10)
        
        self.task_combo = QComboBox()
        self.task_combo.setEditable(False)
        self.task_combo.setMinimumWidth(340)
        task_row.addWidget(self.task_combo, 1)
        
        # Clean minimal buttons
        self.new_btn = QPushButton('+ New')
        self.new_btn.setObjectName('new_btn')
        self.new_btn.setFixedWidth(85)
        self.new_btn.clicked.connect(self.create_task)
        task_row.addWidget(self.new_btn)
        
        self.edit_btn = QPushButton('Edit')
        self.edit_btn.setObjectName('edit_btn')
        self.edit_btn.setFixedWidth(75)
        self.edit_btn.setIconSize(QSize(14, 14))
        self.edit_btn.clicked.connect(self.edit_task)
        task_row.addWidget(self.edit_btn)
        
        self.del_btn = QPushButton('Delete')
        self.del_btn.setObjectName('del_btn')
        self.del_btn.setFixedWidth(85)
        self.del_btn.setIconSize(QSize(14, 14))
        self.del_btn.clicked.connect(self.delete_task)
        task_row.addWidget(self.del_btn)
        
        layout.addLayout(task_row)
        
        # ===== COMMIT MESSAGE =====
        commit_label = QLabel('Commit Message * (editable)')
        commit_label.setProperty("heading", True)
        layout.addWidget(commit_label)
        
        self.commit_text = QTextEdit()
        self.commit_text.setPlainText(self.commit_msg)
        self.commit_text.setMinimumHeight(115)
        self.commit_text.setMaximumHeight(115)
        layout.addWidget(self.commit_text)
        
        # ===== TIME & STATUS ROW =====
        time_status_row = QHBoxLayout()
        time_status_row.setSpacing(32)
        
        # Time Column
        time_col = QVBoxLayout()
        time_col.setSpacing(9)
        
        time_label = QLabel('Time (hours) *')
        time_label.setProperty("heading", True)
        time_col.addWidget(time_label)
        
        self.time_combo = QComboBox()
        self.time_combo.setEditable(True)
        self.time_combo.setMinimumWidth(135)
        # Add time options
        time_options = [str(x * 0.5) for x in range(1, 17)]  # 0.5 to 8.0
        self.time_combo.addItems(time_options)
        self.time_combo.setCurrentText(str(self.default_time))
        time_col.addWidget(self.time_combo)
        
        time_status_row.addLayout(time_col)
        
        # Status Column
        status_col = QVBoxLayout()
        status_col.setSpacing(9)
        
        status_label = QLabel('Status *')
        status_label.setProperty("heading", True)
        status_col.addWidget(status_label)
        
        status_buttons = QHBoxLayout()
        status_buttons.setSpacing(16)
        
        self.status_group = QButtonGroup()
        
        self.in_progress_radio = QRadioButton('In Progress')
        self.in_progress_radio.setObjectName('in_progress')
        self.in_progress_radio.setChecked(True)
        self.status_group.addButton(self.in_progress_radio)
        status_buttons.addWidget(self.in_progress_radio)
        
        self.completed_radio = QRadioButton('Completed')
        self.completed_radio.setObjectName('completed')
        self.status_group.addButton(self.completed_radio)
        status_buttons.addWidget(self.completed_radio)
        
        self.blocked_radio = QRadioButton('Roadblock')
        self.blocked_radio.setObjectName('roadblock')
        self.status_group.addButton(self.blocked_radio)
        status_buttons.addWidget(self.blocked_radio)
        
        status_buttons.addStretch()
        status_col.addLayout(status_buttons)
        
        time_status_row.addLayout(status_col, 1)
        
        layout.addLayout(time_status_row)
        
        # ===== BRANCH INFO =====
        branch_label = QLabel(f'Branch: {self.branch} (auto-detected)')
        branch_label.setStyleSheet('color: #6b7280; font-size: 12px; font-weight: 500;')
        layout.addWidget(branch_label)
        
        # ===== BUTTONS =====
        layout.addSpacing(10)
        
        buttons_row = QHBoxLayout()
        buttons_row.setSpacing(11)
        
        skip_btn = QPushButton('Skip Logging')
        skip_btn.setObjectName('skip_btn')
        skip_btn.setMinimumWidth(115)
        skip_btn.clicked.connect(self.skip_logging)
        buttons_row.addWidget(skip_btn)
        
        cancel_btn = QPushButton('Cancel')
        cancel_btn.setObjectName('cancel_btn')
        cancel_btn.setMinimumWidth(100)
        cancel_btn.clicked.connect(self.cancel_dialog)
        buttons_row.addWidget(cancel_btn)
        
        buttons_row.addStretch()
        
        submit_btn = QPushButton('Log to Sheets')
        submit_btn.setObjectName('submit_btn')
        submit_btn.setMinimumWidth(140)
        submit_btn.clicked.connect(self.submit_dialog)
        buttons_row.addWidget(submit_btn)
        
        layout.addLayout(buttons_row)
        
        self.setLayout(layout)
    
    def load_tasks(self):
        """Fetch tasks from Google Sheets"""
        try:
            url = f"{self.webhook_url}?action=getTasks"
            with urllib.request.urlopen(url, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))
                if data.get('success'):
                    self.tasks = [task['name'] for task in data.get('tasks', [])]
                    if self.tasks:
                        self.task_combo.addItems(self.tasks)
                        self.task_combo.setCurrentIndex(0)
                        self.edit_btn.setEnabled(True)
                        self.del_btn.setEnabled(True)
                    else:
                        self.task_combo.addItem('Create a task here')
                        self.edit_btn.setEnabled(False)
                        self.del_btn.setEnabled(False)
                else:
                    self.task_combo.addItem('Create a task here')
                    self.edit_btn.setEnabled(False)
                    self.del_btn.setEnabled(False)
        except Exception as e:
            print(f"Error loading tasks: {e}")
            self.task_combo.addItem('Create a task here')
            self.edit_btn.setEnabled(False)
            self.del_btn.setEnabled(False)
    
    def create_task(self):
        """Create new task"""
        task_name, ok = QInputDialog.getText(self, 'Create Task', 'Enter task name:')
        if ok and task_name.strip():
            task_name = task_name.strip()
            try:
                data = json.dumps({"action": "createTask", "taskName": task_name}).encode('utf-8')
                req = urllib.request.Request(
                    self.webhook_url,
                    data=data,
                    headers={'Content-Type': 'application/json'},
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    if result.get('success'):
                        # Reload tasks
                        self.task_combo.clear()
                        self.load_tasks()
                        # Select new task
                        idx = self.task_combo.findText(task_name)
                        if idx >= 0:
                            self.task_combo.setCurrentIndex(idx)
                        QMessageBox.information(self, 'Success', result.get('message', 'Task created'))
                    else:
                        QMessageBox.warning(self, 'Error', result.get('error', 'Failed to create task'))
            except Exception as e:
                QMessageBox.warning(self, 'Error', str(e))
    
    def edit_task(self):
        """Edit selected task"""
        current_task = self.task_combo.currentText()
        if not current_task or current_task == 'Create a task here':
            QMessageBox.warning(self, 'No Task', 'Please select a task to edit')
            return
        
        new_name, ok = QInputDialog.getText(self, 'Edit Task', f'Rename "{current_task}" to:', text=current_task)
        if ok and new_name.strip() and new_name != current_task:
            new_name = new_name.strip()
            try:
                data = json.dumps({"action": "updateTask", "oldName": current_task, "newName": new_name}).encode('utf-8')
                req = urllib.request.Request(
                    self.webhook_url,
                    data=data,
                    headers={'Content-Type': 'application/json'},
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    if result.get('success'):
                        # Reload tasks
                        self.task_combo.clear()
                        self.load_tasks()
                        # Select renamed task
                        idx = self.task_combo.findText(new_name)
                        if idx >= 0:
                            self.task_combo.setCurrentIndex(idx)
                        QMessageBox.information(self, 'Success', result.get('message', 'Task updated'))
                    else:
                        QMessageBox.warning(self, 'Error', result.get('error', 'Failed to update task'))
            except Exception as e:
                QMessageBox.warning(self, 'Error', str(e))
    
    def delete_task(self):
        """Delete selected task"""
        current_task = self.task_combo.currentText()
        if not current_task or current_task == 'Create a task here':
            QMessageBox.warning(self, 'No Task', 'Please select a task to delete')
            return
        
        reply = QMessageBox.question(self, 'Confirm Delete', 
                                     f'Are you sure you want to delete "{current_task}"?',
                                     QMessageBox.Yes | QMessageBox.No)
        if reply == QMessageBox.Yes:
            try:
                data = json.dumps({"action": "deleteTask", "taskName": current_task}).encode('utf-8')
                req = urllib.request.Request(
                    self.webhook_url,
                    data=data,
                    headers={'Content-Type': 'application/json'},
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    if result.get('success'):
                        # Reload tasks
                        self.task_combo.clear()
                        self.load_tasks()
                        QMessageBox.information(self, 'Success', result.get('message', 'Task deleted'))
                    else:
                        QMessageBox.warning(self, 'Error', result.get('error', 'Failed to delete task'))
            except Exception as e:
                QMessageBox.warning(self, 'Error', str(e))
    
    def get_selected_status(self):
        """Get selected status"""
        if self.in_progress_radio.isChecked():
            return 'In Progress'
        elif self.completed_radio.isChecked():
            return 'Completed'
        elif self.blocked_radio.isChecked():
            return 'Roadblock'
        return 'In Progress'
    
    def submit_dialog(self):
        """Submit dialog"""
        task = self.task_combo.currentText()
        if not task or task == 'Create a task here':
            QMessageBox.warning(self, 'No Task', 'Please select or create a task')
            return
        
        commit = self.commit_text.toPlainText().strip()
        if not commit:
            QMessageBox.warning(self, 'No Message', 'Please enter a commit message')
            return
        
        try:
            time_value = float(self.time_combo.currentText())
        except ValueError:
            QMessageBox.warning(self, 'Invalid Time', 'Please enter a valid time value')
            return
        
        self.result['cancelled'] = False
        self.result['taskName'] = task
        self.result['commitMessage'] = commit
        self.result['time'] = time_value
        self.result['status'] = self.get_selected_status()
        self.accept()
    
    def skip_logging(self):
        """Skip logging"""
        self.result['cancelled'] = False
        self.result['taskName'] = ''  # Empty means skip
        self.accept()
    
    def cancel_dialog(self):
        """Cancel dialog"""
        self.result['cancelled'] = True
        self.reject()


def show_pyqt5_task_dialog(webhook_url: str, commit_msg: str, branch: str, default_time: float = 1.0) -> Tuple[str, str, float, str, str]:
    """
    Show PyQt5 task dialog
    Returns: (taskName, commitMessage, time, branch, status)
    """
    if not PYQT5_AVAILABLE:
        print("PyQt5 not available")
        return None, None, -1.0, None, None
    
    app = QApplication.instance()
    if app is None:
        app = QApplication(sys.argv)
    
    dialog = TaskDialog(webhook_url, commit_msg, branch, default_time)
    result_code = dialog.exec_()
    
    if dialog.result['cancelled'] or result_code != QDialog.Accepted:
        return None, None, -1.0, None, None
    elif dialog.result['taskName'] == '':
        return "", "", 0.0, "", ""  # Skipped - return empty strings not None
    else:
        return (
            dialog.result['taskName'],
            dialog.result['commitMessage'],
            dialog.result['time'],
            dialog.result['branch'],
            dialog.result['status']
        )


# For testing
if __name__ == '__main__':
    import sys
    import os
    import json
    import subprocess
    
    # Try to load configuration
    try:
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from webhook_config import WEBHOOK_URL, DEFAULT_TIME
        webhook_url = WEBHOOK_URL
        default_time = DEFAULT_TIME
    except ImportError:
        webhook_url = "https://script.google.com/macros/s/YOUR_ID/exec"
        default_time = 1.0

    # Check if running from Git hook (arguments provided)
    if len(sys.argv) > 1:
        commit_msg_file = sys.argv[1]
        
        # Read existing commit message
        try:
            with open(commit_msg_file, 'r') as f:
                commit_msg = f.read().strip()
        except:
            commit_msg = ""
            
        # Get current branch
        try:
            branch = subprocess.check_output(
                ['git', 'symbolic-ref', '--short', 'HEAD'], 
                stderr=subprocess.DEVNULL
            ).decode('utf-8').strip()
        except:
            branch = "unknown"
            
        # Show Dialog
        task, commit, time, branch, status = show_pyqt5_task_dialog(webhook_url, commit_msg, branch, default_time)
        
        # LOGIC FIX: Distinguish between CANCEL (None) and SKIP (Empty String)
        
        if task is None:
            # User clicked Cancel or closed window -> ABORT COMMIT
            print("Dialog cancelled - Aborting commit.")
            sys.exit(1)
            
        elif task == "":
            # User clicked Skip Logging -> PROCEED but don't modify message
            print("⏭️  Skipped logging - proceeding with commit")
            sys.exit(0)
            
        else:
            # User submitted task -> PROCEED and UPDATE message
            # Format: title + description
            full_message = f"{commit}\n\nTask: {task}\nTime: {time}h\nStatus: {status}"
            with open(commit_msg_file, 'w') as f:
                f.write(full_message)
            sys.exit(0)

    else:
        # TEST MODE (No arguments)
        print("Running in TEST MODE...")
        commit_msg = "Fixed authentication bug"
        branch = "feature/auth"
        
        task, commit, time, branch, status = show_pyqt5_task_dialog(webhook_url, commit_msg, branch, 1.0)
        if task:
            print(f"Task: {task}")
            print(f"Commit: {commit}")
            print(f"Time: {time}")
            print(f"Branch: {branch}")
            print(f"Status: {status}")
        else:
            print("Cancelled")
