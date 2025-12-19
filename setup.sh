#!/bin/bash

# Onchainweb Quick Setup Script
echo "🚀 Onchainweb Platform Setup"
echo "=============================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
cd ..
echo "✅ Backend dependencies installed"
echo ""

# Check for .env file
if [ ! -f "server/.env" ]; then
    echo "⚠️  Backend .env file not found"
    echo "📝 Creating .env from example..."
    cp server/.env.example server/.env
    echo ""
    echo "⚠️  IMPORTANT: Edit server/.env with your Supabase credentials:"
    echo "   1. Go to https://supabase.com"
    echo "   2. Create a new project"
    echo "   3. Go to Settings → API"
    echo "   4. Copy your credentials to server/.env"
    echo ""
    echo "   Required variables:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_KEY"
    echo "   - JWT_SECRET (generate random string)"
    echo ""
else
    echo "✅ Backend .env file exists"
    echo ""
fi

echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Configure server/.env with your Supabase credentials"
echo "2. Run database schema in Supabase SQL Editor (server/database/schema.sql)"
echo "3. Start backend: cd server && npm run dev"
echo "4. Start frontend (new terminal): npm run dev"
echo "5. Open http://localhost:5173"
echo ""
echo "📚 Documentation:"
echo "   - API docs: server/README.md"
echo "   - Deployment: DEPLOYMENT.md"
echo ""
echo "✨ Happy coding!"
