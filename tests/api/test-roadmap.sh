#!/bin/bash
# Test Roadmap API

set -e

# Load helpers
source "$(dirname "$0")/test-helpers.sh"

# Configuration
API_BASE_URL="${API_BASE_URL:-https://venn-demo.avan.academy/api}"
COOKIE_JAR="/tmp/venn-test-cookies.txt"

init_test "Roadmap API"

# Test 1: List roadmap items
echo "Test 1: GET /roadmap - List all roadmap items"
response=$(api_request GET /roadmap)
assert_contains "$response" "data" "List roadmap returns data array"

# Test 2: Create roadmap item
echo "Test 2: POST /roadmap - Create new roadmap item"
response=$(api_request POST /roadmap '{
    "title": "API Test Feature - New Dashboard",
    "description": "Build analytics dashboard for admin users",
    "type": "feature",
    "priority": "high",
    "status": "planned",
    "target_date": "2026-03-01"
}')
assert_contains "$response" "id" "Create roadmap item returns ID"
assert_contains "$response" "New Dashboard" "Create roadmap item returns title"

ITEM_ID=$(echo "$response" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
echo "Created roadmap item ID: $ITEM_ID"

# Test 3: Get specific roadmap item
echo "Test 3: GET /roadmap/:id - Get roadmap item details"
response=$(api_request GET "/roadmap/$ITEM_ID")
assert_contains "$response" "New Dashboard" "Get roadmap item returns title"
assert_contains "$response" "analytics dashboard" "Get roadmap item returns description"

# Test 4: Update roadmap item
echo "Test 4: PATCH /roadmap/:id - Update roadmap item"
response=$(api_request PATCH "/roadmap/$ITEM_ID" '{
    "status": "in_progress",
    "priority": "urgent"
}')
assert_contains "$response" "in_progress" "Update roadmap item changes status"
assert_contains "$response" "urgent" "Update roadmap item changes priority"

# Test 5: Add vote to roadmap item
echo "Test 5: POST /roadmap/:id/vote - Vote for roadmap item"
response=$(api_request POST "/roadmap/$ITEM_ID/vote" '{}')
# Note: This might require a contact_id, adjust based on API response

# Test 6: Get votes for roadmap item
echo "Test 6: GET /roadmap/:id/votes - Get roadmap item votes"
response=$(api_request GET "/roadmap/$ITEM_ID/votes")
# Check if votes endpoint exists and returns data

# Test 7: Filter by status
echo "Test 7: GET /roadmap?status=in_progress - Filter by status"
response=$(api_request GET "/roadmap?status=in_progress")
assert_contains "$response" "in_progress" "Filter returns in-progress items"

# Test 8: Filter by type
echo "Test 8: GET /roadmap?type=feature - Filter by type"
response=$(api_request GET "/roadmap?type=feature")
assert_contains "$response" "feature" "Filter returns feature items"

# Test 9: Complete roadmap item
echo "Test 9: PATCH /roadmap/:id - Mark as completed"
response=$(api_request PATCH "/roadmap/$ITEM_ID" '{
    "status": "completed"
}')
assert_contains "$response" "completed" "Roadmap item can be completed"

# Test 10: Delete roadmap item
echo "Test 10: DELETE /roadmap/:id - Delete roadmap item"
response=$(api_request DELETE "/roadmap/$ITEM_ID")
assert_contains "$response" "success" "Delete roadmap item succeeds"

print_summary
