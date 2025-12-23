curl -X POST https://your-railway-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","username":"testuser"}'

✓ Detected Node
✓ Using npm package manager  
✓ Found web command in Procfile
✓ npm ci - 6s SUCCESS
✓ npm install - 2s SUCCESS
Deploy command: cd server && node index.js
✓ image push 145.7 MB - UPLOADED

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.log('⚠️  Background jobs disabled - Supabase not configured')
  return  // Exit early, don't start background jobs
}

PORT=8000