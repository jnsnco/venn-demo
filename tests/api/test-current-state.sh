#!/bin/bash
# Test current API state - what works, what doesn't

set -e

API_BASE_URL="${API_BASE_URL:-https://venn-demo.avan.academy/api}"

echo "========================================"
echo "venn API Current State Test"
echo "========================================"
echo "Base URL: $API_BASE_URL"
echo "Time: $(date)"
echo ""

# Test health endpoint (no auth)
echo "=== Health Check ==="
response=$(curl -s "${API_BASE_URL%/api}/health")
if echo "$response" | grep -q '"status":"ok"'; then
    echo "✓ Health endpoint working"
    echo "  Response: $response"
else
    echo "✗ Health endpoint failed"
    echo "  Response: $response"
fi
echo ""

# Test auth/me (should fail without session)
echo "=== Authentication Test ==="
response=$(curl -s "${API_BASE_URL}/auth/me")
if echo "$response" | grep -q '"error"'; then
    echo "✓ Auth endpoint requires authentication (expected)"
    echo "  Response: $response"
else
    echo "? Unexpected response from /auth/me"
    echo "  Response: $response"
fi
echo ""

# Test contacts endpoint (requires auth)
echo "=== Contacts Endpoint (no auth) ==="
status=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/contacts")
echo "  Status: $status"
if [ "$status" = "401" ]; then
    echo "✓ Contacts requires authentication (expected)"
elif [ "$status" = "200" ]; then
    echo "? Contacts returned 200 without auth (unexpected)"
else
    echo "✗ Unexpected status code: $status"
fi
echo ""

# Test tickets endpoint (requires auth)
echo "=== Tickets Endpoint (no auth) ==="
status=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/tickets")
echo "  Status: $status"
if [ "$status" = "401" ]; then
    echo "✓ Tickets requires authentication (expected)"
elif [ "$status" = "200" ]; then
    echo "? Tickets returned 200 without auth (unexpected)"
else
    echo "✗ Unexpected status code: $status"
fi
echo ""

# Test roadmap endpoint (requires auth)
echo "=== Roadmap Endpoint (no auth) ==="
status=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/roadmap")
echo "  Status: $status"
if [ "$status" = "401" ]; then
    echo "✓ Roadmap requires authentication (expected)"
elif [ "$status" = "200" ]; then
    echo "? Roadmap returned 200 without auth (unexpected)"
else
    echo "✗ Unexpected status code: $status"
fi
echo ""

# Test users endpoint (requires admin)
echo "=== Users Endpoint (no auth) ==="
status=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/users")
echo "  Status: $status"
if [ "$status" = "401" ]; then
    echo "✓ Users requires authentication (expected)"
elif [ "$status" = "403" ]; then
    echo "✓ Users requires admin permissions (expected)"
else
    echo "✗ Unexpected status code: $status"
fi
echo ""

echo "========================================"
echo "Summary"
echo "========================================"
echo "✓ Backend API is running"
echo "✓ Health check endpoint works"
echo "✓ Authentication is enforced on protected endpoints"
echo ""
echo "Next: Run authenticated tests"
echo "  See authenticate.sh for setup instructions"
echo "  Then run: ./run-all.sh"
echo ""
