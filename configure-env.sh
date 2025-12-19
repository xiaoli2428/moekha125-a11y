#!/bin/bash

# Interactive Environment Configuration Script
echo "🔧 Configuring Backend Environment"
echo "=================================="
echo ""
echo "I'll help you configure server/.env with your Supabase credentials"
echo ""

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "❌ server/.env not found. Creating from example..."
    cp server/.env.example server/.env
fi

echo "📝 Please provide your Supabase credentials:"
echo ""

read -p "1. Supabase Project URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "2. Supabase Anon Key (starts with eyJhbG...): " SUPABASE_ANON_KEY
read -p "3. Supabase Service Role Key (starts with eyJhbG...): " SUPABASE_SERVICE_KEY

# Generate random JWT secret
JWT_SECRET=$(openssl rand -hex 32)

echo ""
echo "✅ Updating server/.env..."

# Update .env file
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

echo ""
echo "✅ Configuration complete!"
echo ""
echo "Generated JWT_SECRET: ${JWT_SECRET:0:20}..."
echo ""
echo "🚀 Next: Starting servers..."
echo ""
echo "Run: npm run dev (in root directory)"
echo "And: cd server && npm run dev (in another terminal)"
echo ""
