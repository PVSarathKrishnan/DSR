#!/bin/bash

# Git Pre-Commit Hook Installer
# Usage: ./install.sh [repo_path] or ./install.sh --uninstall [repo_path]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Python 3 is installed
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8 or higher."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_info "Python version: $PYTHON_VERSION"
}

# Check if credentials.json exists
check_credentials() {
    if [ ! -f "$SCRIPT_DIR/credentials.json" ]; then
        print_warning "credentials.json not found in $SCRIPT_DIR"
        print_warning "Please download your service account key and save it as credentials.json"
        print_info "The hook will still be installed, but won't work until credentials are added"
    else
        print_success "credentials.json found"
    fi
}

# Check if dependencies are installed
check_dependencies() {
    print_info "Checking Python dependencies..."
    
    if python3 -c "import google.oauth2.service_account" 2>/dev/null; then
        print_success "Google API dependencies are installed"
    else
        print_warning "Google API dependencies not found"
        print_info "Install them with: pip3 install -r requirements.txt"
    fi
}

# Uninstall hook
uninstall_hook() {
    local REPO_PATH=$1
    local HOOK_FILE="$REPO_PATH/.git/hooks/pre-commit"
    local BACKUP_FILE="$REPO_PATH/.git/hooks/pre-commit.backup"
    
    if [ -f "$HOOK_FILE" ]; then
        rm "$HOOK_FILE"
        print_success "Removed pre-commit hook from $REPO_PATH"
        
        # Restore backup if it exists
        if [ -f "$BACKUP_FILE" ]; then
            mv "$BACKUP_FILE" "$HOOK_FILE"
            print_success "Restored previous pre-commit hook from backup"
        fi
    else
        print_warning "No pre-commit hook found in $REPO_PATH"
    fi
}

# Install hook
install_hook() {
    local REPO_PATH=$1
    
    # Check if it's a git repository
    if [ ! -d "$REPO_PATH/.git" ]; then
        print_error "Not a git repository: $REPO_PATH"
        exit 1
    fi
    
    local HOOKS_DIR="$REPO_PATH/.git/hooks"
    local HOOK_FILE="$HOOKS_DIR/pre-commit"
    local SOURCE_HOOK="$SCRIPT_DIR/pre-commit"
    
    # Create hooks directory if it doesn't exist
    mkdir -p "$HOOKS_DIR"
    
    # Backup existing hook if present
    if [ -f "$HOOK_FILE" ]; then
        print_warning "Existing pre-commit hook found"
        cp "$HOOK_FILE" "$HOOK_FILE.backup"
        print_info "Backed up to: $HOOK_FILE.backup"
    fi
    
    # Copy the hook
    cp "$SOURCE_HOOK" "$HOOK_FILE"
    chmod +x "$HOOK_FILE"
    
    # Create symlinks or copy dependencies
    print_info "Setting up dependencies..."
    
    # We need to ensure config.py and sheets_api.py are accessible
    # Copy them to the parent directory of the repo
    local PARENT_DIR="$(dirname "$REPO_PATH")"
    
    if [ ! -f "$PARENT_DIR/config.py" ]; then
        cp "$SCRIPT_DIR/config.py" "$PARENT_DIR/config.py"
        print_info "Copied config.py to $PARENT_DIR"
    fi
    
    if [ ! -f "$PARENT_DIR/sheets_api.py" ]; then
        cp "$SCRIPT_DIR/sheets_api.py" "$PARENT_DIR/sheets_api.py"
        print_info "Copied sheets_api.py to $PARENT_DIR"
    fi
    
    if [ ! -f "$PARENT_DIR/credentials.json" ] && [ -f "$SCRIPT_DIR/credentials.json" ]; then
        cp "$SCRIPT_DIR/credentials.json" "$PARENT_DIR/credentials.json"
        print_info "Copied credentials.json to $PARENT_DIR"
    fi
    
    print_success "Pre-commit hook installed successfully in $REPO_PATH"
    print_info "Hook location: $HOOK_FILE"
}

# Main script
main() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Git Commit Logger - Installation${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Parse arguments
    local UNINSTALL=false
    local REPO_PATH="."
    
    if [ "$1" == "--uninstall" ]; then
        UNINSTALL=true
        if [ -n "$2" ]; then
            REPO_PATH="$2"
        fi
    elif [ -n "$1" ]; then
        REPO_PATH="$1"
    fi
    
    # Convert to absolute path
    REPO_PATH=$(cd "$REPO_PATH" && pwd)
    
    if [ "$UNINSTALL" = true ]; then
        uninstall_hook "$REPO_PATH"
    else
        # Run pre-installation checks
        check_python
        check_credentials
        check_dependencies
        
        echo ""
        
        # Install the hook
        install_hook "$REPO_PATH"
        
        echo ""
        print_success "Installation complete!"
        print_info "Test it by making a commit in $REPO_PATH"
    fi
    
    echo ""
}

main "$@"
