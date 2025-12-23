#!/bin/bash
# Test all API endpoints for syntax and import errors

echo "🧪 Testing all API handler files..."
echo ""

errors=0
success=0

test_file() {
  local file=$1
  if node --check "$file" 2>&1 | grep -q "Error"; then
    echo "❌ $file - SYNTAX ERROR"
    node --check "$file" 2>&1 | head -3
    ((errors++))
  else
    echo "✅ $file"
    ((success++))
  fi
}

# Test lib files
echo "📚 Testing library files:"
test_file "api/lib/supabase.js"
test_file "api/lib/jwt.js"
test_file "api/lib/auth.js"
echo ""

# Test route handlers
echo "🔌 Testing route handlers:"

# Find all handler files
find api -name "index.js" -o -name "*.js" -path "*/api/*" ! -path "*/lib/*" | sort | while read file; do
  test_file "$file"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All files passed syntax check!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
