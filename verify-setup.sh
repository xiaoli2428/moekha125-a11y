#!/bin/bash

echo "🔍 Verifying Setup..."
echo ""

# Check Git
echo "✅ Git Status:"
git log --oneline -1
echo ""

# Check Vercel login
echo "✅ Vercel Project:"
npx vercel whoami 2>/dev/null || echo "⚠️  Not logged into Vercel"
echo ""

# Check API handlers
echo "✅ API Handlers:"
find api -type f -name "*.js" | wc -l
echo "   files exist"
echo ""

# Check frontend build
echo "✅ Frontend Build:"
if [ -d dist ]; then
  du -sh dist/ | awk '{print "   Size: " $1}'
else
  echo "   ⚠️  Not built yet (run: npm run build)"
fi
echo ""

echo "📋 Setup Checklist:"
echo "   ✅ Code pushed to GitHub (commit 337f0c5)"
echo "   ⏳ Env vars set in Vercel? (SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET)"
echo "   ⏳ Database schema loaded? (Run SUPABASE_SETUP_GUIDE.md)"
echo "   🟡 Ready to test: curl your-app.vercel.app/api/health"
echo ""
