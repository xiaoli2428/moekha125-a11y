#!/bin/bash

# Test Backend Connectivity
echo "🧪 Testing Onchainweb Backend"
echo "=============================="
echo ""

# Check if backend is running
echo "1. Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health 2>/dev/null)

if [ $? -eq 0 ] && [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo "   ✅ Backend is running!"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "   ❌ Backend not responding"
    echo "   Make sure backend is running: cd server && npm run dev"
    exit 1
fi

echo ""
echo "2. Testing user registration..."

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test'$(date +%s)'@example.com","password":"password123","username":"user'$(date +%s)'"}' 2>/dev/null)

if [[ $REGISTER_RESPONSE == *"token"* ]]; then
    echo "   ✅ User registration works!"
    echo "   User created successfully"
    
    # Extract token (basic parsing)
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    
    echo ""
    echo "3. Testing authenticated endpoint..."
    
    PROFILE_RESPONSE=$(curl -s http://localhost:3001/api/auth/profile \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    
    if [[ $PROFILE_RESPONSE == *"email"* ]]; then
        echo "   ✅ Authentication works!"
        echo "   Profile retrieved successfully"
    else
        echo "   ⚠️  Authentication may have issues"
        echo "   Response: $PROFILE_RESPONSE"
    fi
else
    echo "   ❌ Registration failed"
    echo "   Response: $REGISTER_RESPONSE"
    echo ""
    echo "   Possible issues:"
    echo "   - Database not configured (check server/.env)"
    echo "   - Supabase schema not loaded"
    echo "   - Invalid Supabase credentials"
fi

echo ""
echo "=============================="
echo "🎯 Test Summary"
echo "=============================="
echo ""

if [[ $REGISTER_RESPONSE == *"token"* ]] && [[ $PROFILE_RESPONSE == *"email"* ]]; then
    echo "✅ ALL TESTS PASSED!"
    echo ""
    echo "Your platform is working correctly! 🎉"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:5173 in browser"
    echo "2. Register a new account"
    echo "3. Make user admin in Supabase (see SUPABASE_SETUP.md)"
    echo "4. Start using the platform!"
else
    echo "⚠️  Some tests failed"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check server/.env has valid Supabase credentials"
    echo "2. Verify SQL schema was loaded in Supabase"
    echo "3. Check backend terminal for error messages"
    echo "4. See SUPABASE_SETUP.md for detailed setup"
fi

echo ""
