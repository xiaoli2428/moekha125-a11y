#!/bin/bash

# Ultra-Simple Supabase Setup Wizard
clear
echo "🧙 SUPABASE SETUP WIZARD"
echo "========================="
echo ""
echo "I'll guide you through each step!"
echo ""

# Step 1
echo "📍 STEP 1: Create Supabase Account"
echo "-----------------------------------"
echo ""
echo "Opening Supabase website in your browser..."
echo ""
"$BROWSER" https://supabase.com 2>/dev/null || echo "Please open: https://supabase.com"
echo ""
echo "Actions:"
echo "1. Click 'Start your project'"
echo "2. Sign up with GitHub (fastest!)"
echo "3. Confirm your email if needed"
echo ""
read -p "Press ENTER when you've created your account..."
clear

# Step 2
echo "📍 STEP 2: Create New Project"
echo "-----------------------------------"
echo ""
echo "In Supabase dashboard:"
echo "1. Click 'New Project' (big green button)"
echo "2. Fill in:"
echo "   Name: onchainweb"
echo "   Database Password: [CREATE STRONG PASSWORD]"
echo "   Region: [Choose closest to you]"
echo "3. Click 'Create new project'"
echo ""
echo "⏳ Wait ~2 minutes for it to finish setting up"
echo "   (You'll see a progress indicator)"
echo ""
read -p "Press ENTER when your project is ready (green checkmark)..."
clear

# Step 3
echo "📍 STEP 3: Load Database Schema"
echo "-----------------------------------"
echo ""
echo "Opening the SQL file for you..."
code server/database/schema.sql
echo ""
echo "In Supabase dashboard:"
echo "1. Click 'SQL Editor' (left sidebar, looks like </>)"
echo "2. Click 'New Query' button (top right)"
echo "3. Copy ALL contents from server/database/schema.sql"
echo "4. Paste into the Supabase SQL Editor"
echo "5. Click 'Run' (or press Ctrl+Enter)"
echo ""
echo "Expected result:"
echo "✅ 'Success. No rows returned'"
echo ""
read -p "Press ENTER when you've run the SQL successfully..."
clear

# Step 4
echo "📍 STEP 4: Get Your Credentials"
echo "-----------------------------------"
echo ""
echo "In Supabase dashboard:"
echo "1. Click 'Settings' (gear icon, bottom left)"
echo "2. Click 'API' in settings menu"
echo ""
echo "You'll see 3 important values. Let's get them one by one!"
echo ""

read -p "Press ENTER to continue..."
echo ""
echo "First, find 'Project URL'"
echo "(Looks like: https://xxxxxxxxxxxxx.supabase.co)"
echo ""
read -p "Paste your Project URL here: " SUPABASE_URL
echo ""
echo "✅ Got it: $SUPABASE_URL"
echo ""

read -p "Press ENTER for next credential..."
echo ""
echo "Now find 'anon public' key"
echo "(Long string starting with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
echo ""
read -p "Paste your anon key here: " SUPABASE_ANON_KEY
echo ""
echo "✅ Got it!"
echo ""

read -p "Press ENTER for last credential..."
echo ""
echo "Finally, find 'service_role' key"
echo "(Click 'Reveal' button first, then copy the long string)"
echo ""
read -p "Paste your service_role key here: " SUPABASE_SERVICE_KEY
echo ""
echo "✅ Got all credentials!"
clear

# Step 5 - Configure
echo "📍 STEP 5: Configuring Backend"
echo "-----------------------------------"
echo ""
echo "Generating secure JWT secret..."
JWT_SECRET=$(openssl rand -hex 32)

echo "Writing configuration to server/.env..."
cat > server/.env << EOF
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}

# JWT Configuration (auto-generated)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Admin Configuration
ADMIN_EMAIL=admin@onchainweb.com
ADMIN_PASSWORD=change_this_secure_password

# CORS Configuration
FRONTEND_URL=http://localhost:5173
EOF

echo "✅ Configuration complete!"
echo ""
echo "========================="
echo "🎉 SETUP COMPLETE!"
echo "========================="
echo ""
echo "Starting your platform now..."
echo ""

# Test backend
echo "Testing backend connection..."
cd server
npm run dev &
BACKEND_PID=$!
sleep 3

if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "⏳ Backend starting..."
fi

echo ""
echo "🚀 Your platform is ready!"
echo ""
echo "Next steps:"
echo "1. Keep this terminal open (backend running)"
echo "2. Open new terminal and run: npm run dev"
echo "3. Open browser: http://localhost:5173"
echo ""
echo "📚 Documentation:"
echo "   - API: server/README.md"
echo "   - Deploy: DEPLOYMENT.md"
echo ""
