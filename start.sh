#!/bin/bash

# Master Start Script for Onchainweb Platform
clear
echo "🚀 ONCHAINWEB PLATFORM LAUNCHER"
echo "================================"
echo ""

# Check if .env is configured
if [ ! -f "server/.env" ]; then
    echo "❌ server/.env not found!"
    echo ""
    echo "Run setup first:"
    echo "  ./SETUP_INSTRUCTIONS.sh"
    exit 1
fi

# Check if Supabase is configured
if grep -q "your_supabase_project_url" server/.env; then
    echo "⚠️  Supabase not configured yet!"
    echo ""
    echo "Please complete Supabase setup:"
    echo "  1. Read: SUPABASE_SETUP.md"
    echo "  2. Run: ./configure-env.sh"
    echo ""
    exit 1
fi

echo "✅ Configuration found"
echo ""
echo "Starting platform..."
echo ""
echo "📝 This will open 2 terminal tabs:"
echo "   - Backend server (port 3001)"
echo "   - Frontend dev server (port 5173)"
echo ""

# Check if we're in a supported terminal
if [ -n "$VSCODE_PID" ]; then
    echo "🔧 Starting in VS Code integrated terminal..."
    echo ""
    echo "Please manually run these commands in 2 separate terminals:"
    echo ""
    echo "Terminal 1:"
    echo "  cd server && npm run dev"
    echo ""
    echo "Terminal 2:"
    echo "  npm run dev"
    echo ""
    echo "Then open: http://localhost:5173"
    echo ""
    echo "Or use the quick commands:"
    echo "  make start-backend"
    echo "  make start-frontend"
else
    # Try to open multiple terminals
    echo "Starting backend server..."
    gnome-terminal -- bash -c "cd server && npm run dev; exec bash" 2>/dev/null || \
    xterm -e "cd server && npm run dev" 2>/dev/null || \
    echo "Please manually run: cd server && npm run dev"
    
    sleep 2
    
    echo "Starting frontend..."
    gnome-terminal -- bash -c "npm run dev; exec bash" 2>/dev/null || \
    xterm -e "npm run dev" 2>/dev/null || \
    echo "Please manually run: npm run dev"
fi

echo ""
echo "================================"
echo "⏳ Waiting for servers to start..."
sleep 5

# Test if backend is up
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "⏳ Backend starting... (may take a few seconds)"
fi

echo ""
echo "🌐 Open in browser: http://localhost:5173"
echo ""
echo "📚 Quick Reference:"
echo "   - Test backend: ./test-backend.sh"
echo "   - API docs: server/README.md"
echo "   - Setup help: SUPABASE_SETUP.md"
echo ""
