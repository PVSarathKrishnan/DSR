#!/usr/bin/env python3
"""
DSR Commit Logger - Installation Script
Cross-platform installer for Windows, macOS, and Linux
"""

import os
import sys
import shutil
from pathlib import Path

def main():
    print("🚀 DSR Commit Logger - Installation Script")
    print("=" * 50)
    
    # Get the DSR directory (where this script is)
    dsr_dir = Path(__file__).parent.absolute()
    hook_source = dsr_dir / "pre-commit-webhook"
    config_source = dsr_dir / "webhook_config.example.py"
    
    # Check if source files exist
    if not hook_source.exists():
        print(f"❌ Error: {hook_source} not found!")
        sys.exit(1)
    
    if not config_source.exists():
        print(f"❌ Error: {config_source} not found!")
        sys.exit(1)
    
    # Get target directory
    if len(sys.argv) > 1:
        target_dir = Path(sys.argv[1]).absolute()
    else:
        target_dir = Path.cwd()
    
    print(f"\n📁 Target directory: {target_dir}")
    
    # Check if it's a Git repository
    git_dir = target_dir / ".git"
    if not git_dir.exists() or not git_dir.is_dir():
        print(f"❌ Error: {target_dir} is not a Git repository")
        print("   Make sure you're in a Git project or specify the path")
        sys.exit(1)
    
    # Create hooks directory if it doesn't exist
    hooks_dir = git_dir / "hooks"
    hooks_dir.mkdir(exist_ok=True)
    
    # Copy the hook
    hook_dest = hooks_dir / "pre-commit"
    print(f"\n📋 Copying hook to: {hook_dest}")
    
    # Backup existing hook if present
    if hook_dest.exists():
        backup = hooks_dir / "pre-commit.backup"
        print(f"⚠️  Existing hook found, backing up to: {backup}")
        shutil.copy2(hook_dest, backup)
    
    shutil.copy2(hook_source, hook_dest)
    
    # Make executable (Unix-like systems)
    if os.name != 'nt':  # Not Windows
        os.chmod(hook_dest, 0o755)
        print("✅ Hook made executable")
    
    # Copy config
    config_dest = target_dir / "webhook_config.py"
    if config_dest.exists():
        print(f"⚠️  webhook_config.py already exists at: {config_dest}")
        response = input("   Overwrite? (y/N): ").strip().lower()
        if response != 'y':
            print("   Skipping webhook_config.py")
        else:
            shutil.copy2(config_source, config_dest)
            print(f"✅ Config copied to: {config_dest}")
    else:
        shutil.copy2(config_source, config_dest)
        print(f"✅ Config copied to: {config_dest}")
    
    # Success message
    print("\n" + "=" * 50)
    print("✅ Installation Complete!")
    print("=" * 50)
    print("\n📝 Next steps:")
    print(f"   1. Edit {config_dest}")
    print("   2. Set your WEBHOOK_URL")
    print("   3. Test with: git commit -m 'Test' --allow-empty")
    print("\n📚 For help, see: SETUP.md or QUICKSTART.md")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Installation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
