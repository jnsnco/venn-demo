#!/bin/bash
# Authenticate and get session cookies for API testing

API_BASE_URL="${API_BASE_URL:-https://venn-demo.avan.academy/api}"
COOKIE_JAR="${COOKIE_JAR:-/tmp/venn-test-cookies.txt}"

echo "=== venn API Authentication ==="
echo ""
echo "API Base URL: $API_BASE_URL"
echo "Cookie Jar: $COOKIE_JAR"
echo ""

# Check if we already have a session
if [ -f "$COOKIE_JAR" ]; then
    echo "Found existing cookie jar, testing session..."
    response=$(curl -s -b "$COOKIE_JAR" "${API_BASE_URL}/auth/me")
    
    if echo "$response" | grep -q '"id"'; then
        user_email=$(echo "$response" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
        user_name=$(echo "$response" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        echo "✓ Already authenticated as: $user_name ($user_email)"
        exit 0
    else
        echo "✗ Existing session expired or invalid"
        rm "$COOKIE_JAR"
    fi
fi

echo ""
echo "No valid session found. To authenticate:"
echo ""
echo "Option 1: Manual Authentication"
echo "  1. Open https://venn-demo.avan.academy in your browser"
echo "  2. Sign in with GitHub/Google"
echo "  3. Open browser DevTools (F12) → Application → Cookies"
echo "  4. Copy the session cookie and create the cookie jar manually"
echo ""
echo "Option 2: Use curl OAuth flow (manual steps)"
echo "  This is complex for OAuth - Option 1 is recommended"
echo ""
echo "For now, tests will run but may fail without authentication."
echo ""
echo "To set cookie jar manually:"
echo "  export COOKIE_JAR=$COOKIE_JAR"
echo "  echo 'venn-demo.avan.academy\tFALSE\t/\tTRUE\t0\tconnect.sid\t<your-session-id>' > \$COOKIE_JAR"
echo ""

exit 1
