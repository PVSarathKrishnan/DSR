#!/usr/bin/env python3
"""
DSR Task Manager - PyQt5 Dialog
Dark theme, professional dialog for task management with Git commits
"""

import sys
import requests
from typing import Optional, Tuple

try:
    from PyQt5.QtWidgets import (
        QApplication, QDialog, QVBoxLayout, QHBoxLayout, QLabel,
        QLineEdit, QComboBox, QDoubleSpinBox, QRadioButton,
        QPushButton, QButtonGroup, QGroupBox, QMessageBox
    )
    from PyQt5.QtCore import Qt
    from PyQt5.QtGui import QFont
    PYQT5_AVAILABLE = True
except ImportError:
    PYQT5_AVAILABLE = False


class TaskManagerDialog(QDialog):
    """Dark theme task management dialog"""
    
    def __init__(self, webhook_url: str, commit_msg: str, branch: str, default_time: float = 1.0):
        super().__init__()
        
        self.webhook_url = webhook_url
        self.commit_msg = commit_msg
        self.branch = branch
        self.default_time = default_time
        
        self.result = {
            'cancelled': True,
            'skip': False,
            'taskName': '',
            'commitMessage': '',
            'time': default_time,
            'branch': branch,
            'status': 'In Progress'
        }
        
        self.existing_tasks = []
        
        self.init_ui()
        self.load_tasks()
    
    def init_ui(self):
        """Initialize dark theme UI"""
        self.setWindowTitle('Task Manager')
        self.setMinimumWidth(600)
        self.setMinimumHeight(520)
        
        # Dark theme styling
        self.setStyleSheet("""
            QDialog {
                background-color: #1e1e1e;
            }
            QLabel {
                color: #e0e0e0;
                font-size: 13px;
            }
            QLineEdit, QComboBox {
                padding: 10px 12px;
                border: 1px solid #3e3e3e;
                border-radius: 4px;
                background-color: #2d2d2d;
                color: #e0e0e0;
                font-size: 13px;
                min-height: 20px;
                selection-background-color: #0066cc;
                selection-color: #ffffff;
            }
            QLineEdit:focus, QComboBox:focus {
                border: 1px solid #0066cc;
                background-color: #333333;
            }
            QLineEdit::placeholder, QComboBox::placeholder {
                color: #888888;
            }
            QComboBox::drop-down {
                border: none;
                width: 30px;
            }
            QComboBox QAbstractItemView {
                background-color: #2d2d2d;
                color: #e0e0e0;
                selection-background-color: #0066cc;
                selection-color: #ffffff;
                border: 1px solid #3e3e3e;
            }
            QDoubleSpinBox {
                padding: 10px 12px;
                border: 1px solid #3e3e3e;
                border-radius: 4px;
                background-color: #2d2d2d;
                color: #e0e0e0;
                font-size: 13px;
                min-height: 20px;
            }
            QDoubleSpinBox:focus {
                border: 1px solid #0066cc;
                background-color: #333333;
            }
            QRadioButton {
                font-size: 13px;
                spacing: 8px;
                padding: 8px;
                color: #e0e0e0;
            }
            QRadioButton::indicator {
                width: 16px;
                height: 16px;
                border-radius: 8px;
                border: 2px solid #666666;
                background-color: #2d2d2d;
            }
            QRadioButton::indicator:checked {
                border: 2px solid #0066cc;
                background-color: #0066cc;
            }
            QRadioButton::indicator:hover {
                border: 2px solid #0088ff;
            }
            QPushButton {
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                min-height: 20px;
                color: #e0e0e0;
            }
            QPushButton:hover {
                background-color: #3e3e3e;
            }
            QGroupBox {
                border: 1px solid #3e3e3e;
                border-radius: 6px;
                margin-top: 10px;
                padding-top: 10px;
                font-size: 13px;
                font-weight: 500;
                color: #e0e0e0;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px;
                color: #e0e0e0;
            }
            QMessageBox {
                background-color: #1e1e1e;
            }
            QMessageBox QLabel {
                color: #e0e0e0;
            }
            QMessageBox QPushButton {
                background-color: #2d2d2d;
                border: 1px solid #3e3e3e;
                color: #e0e0e0;
                padding: 6px 16px;
            }
        """)
        
        # Main layout
        layout = QVBoxLayout()
        layout.setContentsMargins(25, 20, 25, 20)
        layout.setSpacing(16)
        
        # Title
        title = QLabel('Task Manager')
        title.setStyleSheet('font-size: 18px; font-weight: 600; color: #ffffff;')
        layout.addWidget(title)
        
        # Task Name
        task_label = QLabel('Task Name')
        task_label.setStyleSheet('font-weight: 500; margin-top: 8px; color: #ffffff;')
        layout.addWidget(task_label)
        
        self.task_combo = QComboBox()
        self.task_combo.setEditable(True)
        self.task_combo.setPlaceholderText('Select existing task or type new name')
        self.task_combo.addItem('+ Create New Task')
        self.task_combo.setCurrentIndex(0)
        self.task_combo.currentTextChanged.connect(self.on_task_changed)
        layout.addWidget(self.task_combo)
        
        # Task info
        self.task_info_label = QLabel('')
        self.task_info_label.setStyleSheet('''
            color: #b0b0b0;
            font-size: 12px;
            padding: 8px 12px;
            background-color: #2d2d2d;
            border-radius: 4px;
            border-left: 3px solid #0066cc;
        ''')
        self.task_info_label.hide()
        layout.addWidget(self.task_info_label)
        
        # Commit Message
        commit_label = QLabel('Commit Message')
        commit_label.setStyleSheet('font-weight: 500; margin-top: 8px; color: #ffffff;')
        layout.addWidget(commit_label)
        
        commit_hint = QLabel('Will be added as a bullet point to task description')
        commit_hint.setStyleSheet('color: #888888; font-size: 11px; margin-bottom: 4px;')
        layout.addWidget(commit_hint)
        
        self.commit_input = QLineEdit()
        self.commit_input.setText(self.commit_msg)
        self.commit_input.setPlaceholderText('Describe what you did...')
        layout.addWidget(self.commit_input)
        
        # Time and Branch row
        row = QHBoxLayout()
        row.setSpacing(16)
        
        # Time
        time_col = QVBoxLayout()
        time_col.setSpacing(6)
        
        time_label = QLabel('Time Spent')
        time_label.setStyleSheet('font-weight: 500; color: #ffffff;')
        time_col.addWidget(time_label)
        
        self.time_spin = QDoubleSpinBox()
        self.time_spin.setMinimum(0.1)
        self.time_spin.setMaximum(24.0)
        self.time_spin.setSingleStep(0.5)
        self.time_spin.setValue(self.default_time)
        self.time_spin.setDecimals(1)
        self.time_spin.setSuffix(' hours')
        time_col.addWidget(self.time_spin)
        
        row.addLayout(time_col)
        
        # Branch
        branch_col = QVBoxLayout()
        branch_col.setSpacing(6)
        
        branch_label = QLabel('Branch')
        branch_label.setStyleSheet('font-weight: 500; color: #ffffff;')
        branch_col.addWidget(branch_label)
        
        branch_display = QLabel(self.branch)
        branch_display.setStyleSheet('''
            padding: 10px 12px;
            background-color: #2d2d2d;
            border: 1px solid #3e3e3e;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            color: #4ec9b0;
        ''')
        branch_col.addWidget(branch_display)
        
        row.addLayout(branch_col, 1)
        
        layout.addLayout(row)
        
        # Status
        status_group = QGroupBox('Status')
        status_layout = QHBoxLayout()
        
        self.status_group = QButtonGroup()
        self.status_in_progress = QRadioButton('In Progress')
        self.status_completed = QRadioButton('Completed')
        self.status_in_progress.setChecked(True)
        
        self.status_group.addButton(self.status_in_progress, 0)
        self.status_group.addButton(self.status_completed, 1)
        
        status_layout.addWidget(self.status_in_progress)
        status_layout.addWidget(self.status_completed)
        status_layout.addStretch()
        
        status_group.setLayout(status_layout)
        layout.addWidget(status_group)
        
        layout.addStretch()
        
        # Buttons
        button_layout = QHBoxLayout()
        button_layout.setSpacing(10)
        
        skip_btn = QPushButton('Skip Logging')
        skip_btn.setStyleSheet('''
            background-color: #2d2d2d;
            color: #e0e0e0;
            border: 1px solid #3e3e3e;
        ''')
        skip_btn.clicked.connect(self.on_skip)
        
        cancel_btn = QPushButton('Cancel')
        cancel_btn.setStyleSheet('''
            background-color: #2d2d2d;
            color: #e0e0e0;
            border: 1px solid #3e3e3e;
        ''')
        cancel_btn.clicked.connect(self.on_cancel)
        
        submit_btn = QPushButton('Save & Commit')
        submit_btn.setStyleSheet('''
            background-color: #0066cc;
            color: #ffffff;
            border: none;
            font-weight: 600;
        ''')
        submit_btn.setDefault(True)
        submit_btn.clicked.connect(self.on_submit)
        
        button_layout.addWidget(skip_btn)
        button_layout.addWidget(cancel_btn)
        button_layout.addStretch()
        button_layout.addWidget(submit_btn)
        
        layout.addLayout(button_layout)
        
        self.setLayout(layout)
        self.center_window()
    
    def center_window(self):
        """Center the window on screen"""
        screen = QApplication.primaryScreen().geometry()
        x = (screen.width() - self.width()) // 2
        y = (screen.height() - self.height()) // 2
        self.move(x, y)
    
    def load_tasks(self):
        """Fetch existing tasks from Google Sheets"""
        try:
            response = requests.get(f'{self.webhook_url}?action=getTasks', timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.existing_tasks = data.get('tasks', [])
                    for task in self.existing_tasks:
                        task_name = task.get('taskName', '')
                        time = task.get('time', 0)
                        status = task.get('status', '')
                        display_text = f"{task_name} ({time} hrs, {status})"
                        self.task_combo.addItem(display_text, task)
        except Exception as e:
            print(f"[Warning] Could not load existing tasks: {e}")
    
    def on_task_changed(self, text):
        """Handle task selection change"""
        current_index = self.task_combo.currentIndex()
        if current_index > 0:  # Not "Create New Task"
            task_data = self.task_combo.itemData(current_index)
            if task_data:
                time = task_data.get('time', 0)
                status = task_data.get('status', '')
                commits = task_data.get('description', '').count('•')
                self.task_info_label.setText(f'{time} hrs  •  {commits} commits  •  {status}')
                self.task_info_label.show()
                
                # Set status radio button based on existing task
                if status == 'Completed':
                    self.status_completed.setChecked(True)
                else:
                    self.status_in_progress.setChecked(True)
            else:
                self.task_info_label.hide()
        else:
            self.task_info_label.hide()
    
    def get_task_name(self) -> str:
        """Get the selected or entered task name"""
        current_text = self.task_combo.currentText()
        if current_text == '+ Create New Task' or current_text.startswith('+'):
            return self.task_combo.currentText() if self.task_combo.currentIndex() == -1 else ''
        else:
            # Extract task name from display text (before the parentheses)
            return current_text.split(' (')[0].strip()
    
    def on_submit(self):
        """Handle submit button"""
        task_name = self.get_task_name()
        
        if not task_name or task_name == '+ Create New Task':
            QMessageBox.warning(self, 'Invalid Task', 'Please select an existing task or enter a new task name.')
            return
        
        commit_message = self.commit_input.text().strip()
        if not commit_message:
            QMessageBox.warning(self, 'Invalid Commit', 'Please enter a commit message.')
            return
        
        self.result['cancelled'] = False
        self.result['skip'] = False
        self.result['taskName'] = task_name
        self.result['commitMessage'] = commit_message
        self.result['time'] = self.time_spin.value()
        self.result['status'] = 'Completed' if self.status_completed.isChecked() else 'In Progress'
        
        self.accept()
    
    def on_skip(self):
        """Handle skip button"""
        self.result['skip'] = True
        self.result['cancelled'] = False
        self.accept()
    
    def on_cancel(self):
        """Handle cancel button - ask for confirmation"""
        reply = QMessageBox.question(
            self,
            'Cancel Confirmation',
            'Do you want to commit without logging to the task manager?',
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.Yes
        )
        
        if reply == QMessageBox.Yes:
            self.result['skip'] = True
            self.result['cancelled'] = False
            self.accept()
        else:
            self.result['cancelled'] = True
            self.reject()


def show_pyqt5_task_dialog(webhook_url: str, commit_msg: str, branch: str, default_time: float = 1.0) -> Tuple[Optional[str], Optional[str], Optional[float], Optional[str], Optional[str]]:
    """
    Show PyQt5 task manager dialog
    
    Returns:
        Tuple of (taskName, commitMessage, time, branch, status) or special cases:
        - (None, None, None, None, None) if skip logging
        - (None, None, -1.0, None, None) if cancelled
    """
    if not PYQT5_AVAILABLE:
        raise ImportError("PyQt5 is not installed")
    
    app = QApplication.instance()
    if app is None:
        app = QApplication(sys.argv)
    
    dialog = TaskManagerDialog(webhook_url, commit_msg, branch, default_time)
    result_code = dialog.exec_()
    
    if dialog.result['skip']:
        return None, None, None, None, None  # Skip logging
    elif dialog.result['cancelled'] or result_code == QDialog.Rejected:
        return None, None, -1.0, None, None  # User cancelled
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
    webhook_url = "https://script.google.com/macros/s/YOUR_ID/exec"
    commit_msg = "Fixed authentication bug"
    branch = "feature/auth"
    
    task, commit, time, branch, status = show_pyqt5_task_dialog(webhook_url, commit_msg, branch, 1.0)
    print(f"Task: {task}")
    print(f"Commit: {commit}")
    print(f"Time: {time}")
    print(f"Branch: {branch}")
    print(f"Status: {status}")
