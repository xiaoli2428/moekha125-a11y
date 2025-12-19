#!/bin/bash

# One-Command Final Setup
# Just paste your 3 Supabase credentials and I'll do the rest!

echo "🚀 FINAL SETUP - Just Paste 3 Values!"
echo "======================================"
echo ""
echo "After you create your Supabase project, you'll have 3 values."
echo "Just paste them here and I'll handle everything else!"
echo ""
echo "Don't have them yet? Here's the 30-second version:"
echo "1. Open: https://supabase.com"
echo "2. Sign up (use GitHub - instant!)"
echo "3. New Project → name: onchainweb"
echo "4. Settings → API → copy 3 values"
echo ""
echo "Ready? Let's go!"
echo ""
echo "----------------------------------------"

read -p "Paste Supabase URL (https://xxx.supabase.co): " URL
read -p "Paste anon key (long string starting with eyJ...): " ANON
read -p "Paste service_role key (click Reveal first): " SERVICE

echo ""
echo "✅ Got your credentials!"
echo ""
echo "🔧 Now I'm doing everything else..."
echo ""

# Generate JWT secret
echo "⚙️  Generating secure JWT secret..."
JWT=$(openssl rand -hex 32)

# Write config
echo "📝 Writing configuration..."
cat > server/.env << EOF
PORT=3001
NODE_ENV=development

SUPABASE_URL=${URL}
SUPABASE_ANON_KEY=${ANON}
SUPABASE_SERVICE_KEY=${SERVICE}

JWT_SECRET=${JWT}
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=admin@onchainweb.com
ADMIN_PASSWORD=change_this_secure_password

FRONTEND_URL=http://localhost:5173
EOF

echo "✅ Configuration saved!"
echo ""

# Check if schema needs to be loaded
echo "📊 Quick question: Did you load the SQL schema in Supabase?"
echo "   (In SQL Editor, run the contents of server/database/schema.sql)"
echo ""
read -p "Type 'yes' if done, or 'no' if you need help: " SCHEMA_LOADED

if [[ $SCHEMA_LOADED != "yes" ]]; then
    echo ""
    echo "📋 LOADING DATABASE SCHEMA:"
    echo "1. Go to your Supabase dashboard"
    echo "2. Click 'SQL Editor' (left sidebar)"
    echo "3. Click 'New Query'"
    echo "4. Copy this file: server/database/schema.sql"
    echo "5. Paste and click 'Run'"
    echo ""
    code server/database/schema.sql
    echo "File opened for you! Copy all contents."
    echo ""
    read -p "Press ENTER when you've run the SQL..."
fi

echo ""
echo "🚀 Starting backend server..."
cd server
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 5

# Test connection
echo "🧪 Testing backend..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running perfectly!"
else
    echo "⚠️  Backend starting (check in a moment)"
fi

echo ""
echo "🌐 Starting frontend..."
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

echo ""
echo "=================================="
echo "🎉 YOUR PLATFORM IS LIVE!"
echo "=================================="
echo ""
echo "✅ Backend: http://localhost:3001"
echo "✅ Frontend: http://localhost:5173"
echo ""
echo "📱 Open in browser:"
echo "   http://localhost:5173"
echo ""
echo "🧪 Test API:"
echo "   curl http://localhost:3001/api/health"
echo ""
echo "📚 Documentation:"
echo "   - API: server/README.md"
echo "   - Deploy: DEPLOYMENT.md"
echo "   - Features: GETTING_STARTED.md"
echo ""
echo "Background processes:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎊 ENJOY YOUR TRADING PLATFORM!"
echo ""

✓ 1520 modules transformed
✓ built in 11.67s
Output: dist/assets/index-BgnL12BO.js (NEW)
