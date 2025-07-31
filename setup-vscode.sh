#!/bin/bash

# VS Code Cross-Workspace Optimization Script for AI4Devs Retro Games
# © GG, MIT License

echo "🚀 VS Code Cross-Workspace Optimization for AI4Devs"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo -e "${YELLOW}⚠️  VS Code CLI not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Please install VS Code CLI by opening VS Code and running:"
        echo "View → Command Palette → Shell Command: Install 'code' command in PATH"
    fi
else
    echo -e "${GREEN}✅ VS Code CLI found${NC}"
fi

# Function to install extension if not present
install_extension() {
    local ext_id="$1"
    local ext_name="$2"

    if code --list-extensions | grep -q "^$ext_id$"; then
        echo -e "${GREEN}✅ $ext_name already installed${NC}"
    else
        echo -e "${YELLOW}📦 Installing $ext_name...${NC}"
        code --install-extension "$ext_id" --force
    fi
}

# Core extensions for game development
echo -e "\n${BLUE}📦 Installing Core Extensions...${NC}"
install_extension "PKief.material-icon-theme" "Material Icon Theme"
install_extension "esbenp.prettier-vscode" "Prettier Code Formatter"
install_extension "ms-vscode.live-server" "Live Server"
install_extension "formulahendry.auto-rename-tag" "Auto Rename Tag"
install_extension "ecmel.vscode-html-css" "HTML CSS Support"
install_extension "bradlc.vscode-tailwindcss" "Tailwind CSS IntelliSense"

# Performance and quality extensions
echo -e "\n${BLUE}🔍 Installing Quality & Performance Extensions...${NC}"
install_extension "usernamehw.errorlens" "Error Lens"
install_extension "SonarSource.sonarlint-vscode" "SonarLint"
install_extension "deque-systems.vscode-axe-linter" "axe Accessibility Linter"

# Git and collaboration
echo -e "\n${BLUE}🔄 Installing Git Extensions...${NC}"
install_extension "mhutchie.git-graph" "Git Graph"

# Python support (for any Python tooling)
echo -e "\n${BLUE}🐍 Installing Python Support...${NC}"
install_extension "ms-python.python" "Python"
install_extension "ms-python.vscode-pylance" "Pylance"

# Verify VS Code settings
echo -e "\n${BLUE}⚙️  Verifying VS Code Configuration...${NC}"

SETTINGS_FILE="$HOME/Library/Application Support/Code/User/settings.json"
if [[ -f "$SETTINGS_FILE" ]]; then
    echo -e "${GREEN}✅ Global settings.json found${NC}"

    # Check for key settings
    if grep -q "material-icon-theme" "$SETTINGS_FILE"; then
        echo -e "${GREEN}✅ Material Icon Theme configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Material Icon Theme not configured${NC}"
    fi

    if grep -q "github.copilot.enable" "$SETTINGS_FILE"; then
        echo -e "${GREEN}✅ GitHub Copilot configured${NC}"
    else
        echo -e "${YELLOW}⚠️  GitHub Copilot not configured${NC}"
    fi
else
    echo -e "${RED}❌ Global settings.json not found${NC}"
fi

# Check workspace settings
WORKSPACE_SETTINGS=".vscode/settings.json"
if [[ -f "$WORKSPACE_SETTINGS" ]]; then
    echo -e "${GREEN}✅ Workspace settings found${NC}"
else
    echo -e "${YELLOW}⚠️  Workspace settings not found${NC}"
fi

# Check for game development snippets
SNIPPETS_DIR="$HOME/Library/Application Support/Code/User/snippets"
if [[ -f "$SNIPPETS_DIR/javascript.json" ]]; then
    echo -e "${GREEN}✅ JavaScript snippets configured${NC}"
else
    echo -e "${YELLOW}⚠️  JavaScript snippets not found${NC}"
fi

# Performance recommendations
echo -e "\n${BLUE}⚡ Performance Recommendations...${NC}"
echo "1. Disable unused extensions for better performance"
echo "2. Use 'Developer: Reload Window' after installing extensions"
echo "3. Run 'runAudit()' in browser console for game compliance testing"
echo "4. Use Cmd+Shift+P → 'Tasks: Run Task' for development tasks"

# Game development workflow tips
echo -e "\n${BLUE}🎮 Game Development Workflow Tips...${NC}"
echo "📋 Quick Snippets:"
echo "  • Type 'canvas-context' for canvas setup"
echo "  • Type 'game-loop' for 60fps game loop"
echo "  • Type 'audit-tasks' for TDD compliance testing"
echo "  • Type 'neon-style' for retro aesthetics"
echo "  • Type 'touch-controls' for mobile support"
echo ""
echo "🔧 Quick Commands:"
echo "  • Cmd+R: Start Development Server"
echo "  • Cmd+Shift+R: Mobile Testing Server"
echo "  • Cmd+Shift+D: Debug Current Game"
echo "  • Cmd+Shift+V: Validate HTML5"
echo "  • Cmd+Shift+L: Lint JavaScript"
echo "  • Cmd+Alt+C: New Copilot Chat"

echo -e "\n${GREEN}🎉 VS Code optimization complete!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo "1. Restart VS Code to apply all changes"
echo "2. Open a game folder and test the new workflows"
echo "3. Use the snippets to quickly create game components"
echo "4. Run the development server and test on mobile devices"

echo -e "\n${YELLOW}🔍 To run TDD audits on your games:${NC}"
echo "1. Open a game in the browser (localhost:8000)"
echo "2. Open browser console (F12)"
echo "3. Type: runAudit()"
echo "4. Review compliance results"
